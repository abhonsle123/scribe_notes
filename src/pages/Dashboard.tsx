
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
  DraftingCompass
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
    chatboxInteraction: "15%", // Mock data as requested
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
      // Fetch all summaries for the user
      const { data: allSummaries, error: summariesError } = await supabase
        .from('summaries')
        .select('id, patient_name, sent_at, created_at, patient_email')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (summariesError) throw summariesError;

      setSummaries(allSummaries || []);
      
      // Get the last 3 summaries for recent activity
      setRecentSummaries((allSummaries || []).slice(0, 3));

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Summaries this month
      const summariesThisMonth = allSummaries?.filter(summary => 
        new Date(summary.created_at) >= startOfMonth
      ).length || 0;

      // Summaries last month
      const summariesLastMonth = allSummaries?.filter(summary => {
        const createdDate = new Date(summary.created_at);
        return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
      }).length || 0;

      // Unsent drafts in last 3 days
      const unsentDrafts = allSummaries?.filter(summary => 
        !summary.sent_at && new Date(summary.created_at) >= threeDaysAgo
      ).length || 0;

      // Fetch average rating from feedback
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
        chatboxInteraction: "15%", // Mock data as requested
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
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "draft": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
    return "Manual"; // Default if no email specified
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
      description: "vs. last month"
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0] || 'Doctor'}
          </h1>
          <p className="text-gray-600 mt-1">
            Transform complex medical reports into patient-friendly summaries
          </p>
        </div>
        <Link to="/dashboard/new-summary">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Start New Summary
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-900">Ready to create a summary?</CardTitle>
          <CardDescription className="text-blue-700">
            Upload a discharge summary and we'll convert it to patient-friendly language in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link to="/dashboard/new-summary">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-5 w-5 mr-2" />
              Upload Discharge Summary
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="flex items-center text-sm">
                <span className={`font-medium ${
                  metric.title === "Unsent Drafts (3 days)" && stats.unsentDrafts > 0 
                    ? "text-orange-600" 
                    : metric.title === "Patient Satisfaction" && metric.trend === "No data"
                    ? "text-gray-500"
                    : "text-green-600"
                }`}>
                  {metric.trend}
                </span>
                <span className="text-gray-500 ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest summary generations and delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading recent activity...</div>
            ) : recentSummaries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No summaries created yet. <Link to="/dashboard/new-summary" className="text-blue-600 hover:underline">Create your first summary</Link>
              </div>
            ) : (
              recentSummaries.map((summary) => (
                <div key={summary.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getMethodIcon(getDeliveryMethod(summary))}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{summary.patient_name}</p>
                      <p className="text-sm text-gray-600">Summary Generated</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(summary.sent_at ? "delivered" : "draft")}>
                      {summary.sent_at ? "delivered" : "draft"}
                    </Badge>
                    <span className="text-sm text-gray-500">{getTimeAgo(summary.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/dashboard/summaries">
              <Button variant="outline">View All Summaries</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
