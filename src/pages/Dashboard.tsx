
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
  Heart,
  Sparkles,
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

interface DashboardStats {
  summariesThisMonth: number;
  summariesLastMonth: number;
  patientSatisfaction: string;
  averageRating: number | null;
  chatboxInteraction: string;
  unsentDrafts: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    summariesThisMonth: 0,
    summariesLastMonth: 0,
    patientSatisfaction: "N/A",
    averageRating: null,
    chatboxInteraction: "15%",
    unsentDrafts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSummariesAndStats();
    }
  }, [user?.id]);

  const fetchSummariesAndStats = async () => {
    if (!user?.id) return;

    try {
      const { data: allSummaries, error: summariesError } = await supabase
        .from('summaries')
        .select('id, patient_name, sent_at, created_at, patient_email')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (summariesError) throw summariesError;

      setSummaries(allSummaries || []);
      setRecentSummaries((allSummaries || []).slice(0, 3));

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      const summariesThisMonth = allSummaries?.filter(summary => 
        new Date(summary.created_at) >= startOfMonth
      ).length || 0;

      const summariesLastMonth = allSummaries?.filter(summary => {
        const createdDate = new Date(summary.created_at);
        return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
      }).length || 0;

      const unsentDrafts = allSummaries?.filter(summary => 
        !summary.sent_at && new Date(summary.created_at) >= threeDaysAgo
      ).length || 0;

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
        summariesLastMonth,
        patientSatisfaction,
        averageRating,
        chatboxInteraction: "15%",
        unsentDrafts
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "draft": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Email": return <Mail className="h-4 w-4" />;
      case "SMS": return <MessageSquare className="h-4 w-4" />;
      case "Patient Portal": return <Globe className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getDeliveryMethod = (summary: Summary) => {
    if (summary.patient_email) return "Email";
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
    if (stats.summariesLastMonth === 0) {
      return stats.summariesThisMonth > 0 ? "+100%" : "0%";
    }
    const change = ((stats.summariesThisMonth - stats.summariesLastMonth) / stats.summariesLastMonth) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  const getSatisfactionTrend = () => {
    if (!stats.averageRating) return "No data";
    if (stats.averageRating >= 4.5) return "+Excellent";
    if (stats.averageRating >= 4.0) return "+Good";
    if (stats.averageRating >= 3.0) return "Fair";
    return "Needs improvement";
  };

  const analytics = [
    {
      title: "Summaries This Month",
      value: loading ? "..." : stats.summariesThisMonth.toString(),
      icon: TrendingUp,
      trend: calculateMonthlyChange(),
      description: "vs. last month",
      color: "sky"
    },
    {
      title: "Patient Satisfaction",
      value: loading ? "..." : stats.patientSatisfaction,
      icon: Star,
      trend: getSatisfactionTrend(),
      description: "Based on feedback",
      color: "emerald"
    },
    {
      title: "Chatbox Interaction Rate",
      value: loading ? "..." : stats.chatboxInteraction,
      icon: MessageSquare,
      trend: "+2%",
      description: "Patients using chat",
      color: "purple"
    },
    {
      title: "Unsent Drafts (3 days)",
      value: loading ? "..." : stats.unsentDrafts.toString(),
      icon: DraftingCompass,
      trend: stats.unsentDrafts > 0 ? "Pending" : "Clear",
      description: "Last 3 days",
      color: "orange"
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case "sky": return "from-sky-50 to-sky-100 border-sky-200";
      case "emerald": return "from-emerald-50 to-emerald-100 border-emerald-200";
      case "purple": return "from-purple-50 to-purple-100 border-purple-200";
      case "orange": return "from-orange-50 to-orange-100 border-orange-200";
      default: return "from-slate-50 to-slate-100 border-slate-200";
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case "sky": return "text-sky-600";
      case "emerald": return "text-emerald-600";
      case "purple": return "text-purple-600";
      case "orange": return "text-orange-600";
      default: return "text-slate-600";
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-sky-50/30 via-white to-emerald-50/30 min-h-screen p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Doctor'}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Ready to transform more medical reports into meaningful conversations?
          </p>
        </div>
        <Link to="/dashboard/new-summary">
          <Button size="lg" className="bg-sky-600 hover:bg-sky-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-5 w-5 mr-2" />
            Create New Summary
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-dashed border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto bg-sky-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-sky-600" />
          </div>
          <CardTitle className="text-2xl text-slate-800">Ready to help another family?</CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Upload a discharge summary and watch complex medical language become clear, caring communication
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link to="/dashboard/new-summary">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 shadow-lg">
              <FileText className="h-5 w-5 mr-2" />
              Upload Medical Report
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map((metric, index) => (
          <Card key={index} className={`border-2 bg-gradient-to-br ${getCardColors(metric.color)} hover:shadow-lg transition-all duration-300 animate-fade-in`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-5 w-5 ${getIconColors(metric.color)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                {metric.value}
              </div>
              <div className="flex items-center text-sm">
                <span className={`font-medium ${
                  metric.title === "Unsent Drafts (3 days)" && stats.unsentDrafts > 0 
                    ? "text-orange-600" 
                    : metric.title === "Patient Satisfaction" && metric.trend === "No data"
                    ? "text-slate-500"
                    : "text-emerald-600"
                }`}>
                  {metric.trend}
                </span>
                <span className="text-slate-500 ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-slate-800">
            <Clock className="h-6 w-6 mr-3 text-sky-600" />
            Recent Family Connections
          </CardTitle>
          <CardDescription className="text-slate-600">
            Your latest work helping families understand their healthcare journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                Loading your recent activity...
              </div>
            ) : recentSummaries.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-sky-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <Heart className="h-10 w-10 text-sky-600" />
                </div>
                <p className="text-slate-600 text-lg mb-4">Ready to help your first family?</p>
                <Link to="/dashboard/new-summary" className="text-sky-600 hover:underline font-medium">
                  Create your first summary
                </Link>
              </div>
            ) : (
              recentSummaries.map((summary) => (
                <div key={summary.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-sky-50 rounded-xl border border-sky-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-sky-100 rounded-xl shadow-sm">
                      {getMethodIcon(getDeliveryMethod(summary))}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{summary.patient_name}</p>
                      <p className="text-sm text-slate-600">Summary created and ready for delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getStatusColor(summary.sent_at ? "delivered" : "draft")} font-medium`}>
                      {summary.sent_at ? "✓ delivered" : "📝 draft"}
                    </Badge>
                    <span className="text-sm text-slate-500 font-medium">{getTimeAgo(summary.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <Link to="/dashboard/summaries">
              <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50">
                <Users className="h-4 w-4 mr-2" />
                View All Family Connections
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
