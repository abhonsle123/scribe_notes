
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  Send, 
  Star,
  TrendingUp,
  Mail,
  MessageSquare,
  Globe,
  DraftingCompass,
  Upload,
  Mic,
  FileAudio,
  Stethoscope,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Summary {
  id: string;
  patient_name: string;
  sent_at: string | null;
  created_at: string;
  patient_email: string | null;
}

interface Transcription {
  id: string;
  patient_name: string;
  transcription_text: string | null;
  clinical_notes: string | null;
  patient_summary: string | null;
  created_at: string;
  audio_duration: number | null;
}

interface DashboardStats {
  summariesThisMonth: number;
  transcriptionsThisMonth: number;
  summariesLastMonth: number;
  patientSatisfaction: string;
  averageRating: number | null;
  chatboxInteraction: string;
  unsentDrafts: number;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<Summary | Transcription>>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    summariesThisMonth: 0,
    transcriptionsThisMonth: 0,
    summariesLastMonth: 0,
    patientSatisfaction: "N/A",
    averageRating: null,
    chatboxInteraction: "15%", // Mock data as requested
    unsentDrafts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user profile (non-critical):', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.warn('Error fetching user profile (non-critical):', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Doctor';
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch summaries with error handling
      const { data: summariesData, error: summariesError } = await supabase
        .from('summaries')
        .select('id, patient_name, sent_at, created_at, patient_email')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (summariesError) {
        console.error('Error fetching summaries:', summariesError);
        // Continue with empty data instead of throwing
      }

      // Fetch transcriptions with error handling
      const { data: transcriptionsData, error: transcriptionsError } = await supabase
        .from('transcriptions')
        .select('id, patient_name, transcription_text, clinical_notes, patient_summary, created_at, audio_duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transcriptionsError) {
        console.error('Error fetching transcriptions:', transcriptionsError);
        // Continue with empty data instead of throwing
      }

      const summariesDataSafe = summariesData || [];
      const transcriptionsDataSafe = transcriptionsData || [];

      setSummaries(summariesDataSafe);
      setTranscriptions(transcriptionsDataSafe);

      // Combine and sort recent activity
      const allActivity = [
        ...summariesDataSafe.map(s => ({ ...s, type: 'summary' as const })),
        ...transcriptionsDataSafe.map(t => ({ ...t, type: 'transcription' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 3);

      setRecentActivity(allActivity);

      // Calculate stats with safe defaults
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Summaries this month
      const summariesThisMonth = summariesDataSafe.filter(summary => 
        new Date(summary.created_at) >= startOfMonth
      ).length;

      // Transcriptions this month
      const transcriptionsThisMonth = transcriptionsDataSafe.filter(transcription => 
        new Date(transcription.created_at) >= startOfMonth
      ).length;

      // Summaries last month
      const summariesLastMonth = summariesDataSafe.filter(summary => {
        const createdDate = new Date(summary.created_at);
        return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
      }).length;

      // Unsent drafts in last 3 days
      const unsentDrafts = summariesDataSafe.filter(summary => 
        !summary.sent_at && new Date(summary.created_at) >= threeDaysAgo
      ).length;

      // Fetch average rating from feedback with error handling
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('overall_rating')
        .eq('user_id', user.id)
        .not('overall_rating', 'is', null);

      let patientSatisfaction = "N/A";
      let averageRating: number | null = null;
      if (!feedbackError && feedbackData && feedbackData.length > 0) {
        averageRating = feedbackData.reduce((sum, feedback) => sum + feedback.overall_rating, 0) / feedbackData.length;
        patientSatisfaction = `${averageRating.toFixed(1)}/5`;
      }

      setStats({
        summariesThisMonth,
        transcriptionsThisMonth,
        summariesLastMonth,
        patientSatisfaction,
        averageRating,
        chatboxInteraction: "15%", // Mock data as requested
        unsentDrafts
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "draft": return "bg-gray-100 text-gray-700 border-gray-200";
      case "processed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Email": return <Mail className="h-4 w-4" />;
      case "SMS": return <MessageSquare className="h-4 w-4" />;
      case "Patient Portal": return <Globe className="h-4 w-4" />;
      case "Audio": return <FileAudio className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getDeliveryMethod = (item: any) => {
    if (item.type === 'transcription') return "Audio";
    if (item.patient_email) return "Email";
    return "Manual";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const calculateMonthlyChange = () => {
    const totalThisMonth = stats.summariesThisMonth + stats.transcriptionsThisMonth;
    if (stats.summariesLastMonth === 0) {
      return totalThisMonth > 0 ? "+100%" : "0%";
    }
    const change = ((totalThisMonth - stats.summariesLastMonth) / stats.summariesLastMonth) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  const getSatisfactionTrend = () => {
    if (!stats.averageRating) return "No data";
    if (stats.averageRating >= 4.5) return "+Excellent";
    if (stats.averageRating >= 4.0) return "+Good";
    if (stats.averageRating >= 3.0) return "Fair";
    return "Needs improvement";
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analytics = [
    {
      title: "Total Activities This Month",
      value: loading ? "..." : (stats.summariesThisMonth + stats.transcriptionsThisMonth).toString(),
      icon: TrendingUp,
      trend: calculateMonthlyChange(),
      description: "Summaries + Transcriptions"
    },
    {
      title: "Patient Satisfaction",
      value: loading ? "..." : stats.patientSatisfaction,
      icon: Star,
      trend: getSatisfactionTrend(),
      description: "Based on feedback"
    },
    {
      title: "Chatbox Interaction Rate",
      value: loading ? "..." : stats.chatboxInteraction,
      icon: MessageSquare,
      trend: "+2%",
      description: "Patients using chat"
    },
    {
      title: "Unsent Drafts (3 days)",
      value: loading ? "..." : stats.unsentDrafts.toString(),
      icon: DraftingCompass,
      trend: stats.unsentDrafts > 0 ? "Pending" : "Clear",
      description: "Last 3 days"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl gradient-bg p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {getDisplayName()}
              </h1>
              <p className="text-xl text-gray-600">
                Ready to transform medical communications?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard/new-transcription">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-full transition-all duration-300 hover:scale-105">
                  <Mic className="h-5 w-5 mr-2" />
                  New Audio
                </Button>
              </Link>
              <Link to="/dashboard/new-summary">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-4 rounded-full transition-all duration-300 hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  New Summary
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15"></div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Summary Card */}
        <Card className="glass-card border-0 hover-lift">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900">Transform Medical Reports</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Upload discharge summaries and convert them to patient-friendly language
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/new-summary">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105">
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Audio Transcription Card */}
        <Card className="glass-card border-0 hover-lift">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900">AI Vocal Transcription</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Record consultations to generate clinical notes and patient summaries
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/new-transcription">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map((metric, index) => (
          <Card key={index} className="glass-card border-0 hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                {metric.title}
              </CardTitle>
              <div className="p-2 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl">
                <metric.icon className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metric.value}
              </div>
              <div className="flex items-center text-sm">
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  metric.title === "Unsent Drafts (3 days)" && stats.unsentDrafts > 0 
                    ? "bg-orange-100 text-orange-700" 
                    : metric.title === "Patient Satisfaction" && metric.trend === "No data"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-green-100 text-green-700"
                }`}>
                  {metric.trend}
                </span>
                <span className="text-gray-500 ml-2">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <div className="p-2 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl mr-3">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            Recent Activity
          </CardTitle>
          <CardDescription className="text-lg">
            Latest summaries and transcriptions with delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">Loading recent activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-12 w-12 text-teal-500" />
                </div>
                <p className="text-gray-500 mb-4">No activity yet</p>
                <div className="flex justify-center gap-4">
                  <Link to="/dashboard/new-summary">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full">
                      Create your first summary
                    </Button>
                  </Link>
                  <Link to="/dashboard/new-transcription">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full">
                      Start transcribing
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentActivity.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-100 hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      item.type === 'transcription' 
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                        : 'bg-gradient-to-br from-teal-100 to-blue-100'
                    }`}>
                      {getMethodIcon(getDeliveryMethod(item))}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{item.patient_name}</p>
                      <p className="text-gray-600">
                        {item.type === 'transcription' ? 'Audio Transcribed' : 'Summary Generated'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={`px-3 py-1 rounded-full font-medium ${
                      item.type === 'transcription' 
                        ? getStatusColor(item.clinical_notes ? "processed" : "draft")
                        : getStatusColor(item.sent_at ? "delivered" : "draft")
                    }`}>
                      {item.type === 'transcription' 
                        ? (item.clinical_notes ? "processed" : "draft")
                        : (item.sent_at ? "delivered" : "draft")
                      }
                    </Badge>
                    <span className="text-sm text-gray-500 font-medium">{getTimeAgo(item.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center flex justify-center gap-4">
            <Link to="/dashboard/summaries">
              <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50 rounded-full px-6 py-2">
                View All Summaries
              </Button>
            </Link>
            <Link to="/dashboard/transcriptions">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6 py-2">
                View All Transcriptions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
