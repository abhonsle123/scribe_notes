import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Eye, 
  Trash2,
  CheckCircle,
  Clock,
  Send,
  History,
  RefreshCw,
  Users,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { EmailSummaryForm } from "@/components/EmailSummaryForm";

interface Summary {
  id: string;
  patient_name: string;
  original_filename: string;
  summary_content: string;
  patient_email: string | null;
  sent_at: string | null;
  created_at: string;
}

const PastSummaries = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSummaries();
    }
  }, [user]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      
      // Get user settings to determine data retention period
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('data_retention_days, auto_delete_enabled')
        .eq('user_id', user?.id)
        .single();

      let retentionDays = 3; // Default to 3 days
      let autoDeleteEnabled = true;

      if (userSettings) {
        retentionDays = userSettings.data_retention_days || 3;
        autoDeleteEnabled = userSettings.auto_delete_enabled !== false;
      }

      // Only clean up old summaries if auto-delete is enabled
      if (autoDeleteEnabled) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        const { error: deleteError } = await supabase
          .from('summaries')
          .delete()
          .eq('user_id', user?.id)
          .lt('created_at', cutoffDate.toISOString());

        if (deleteError) {
          console.error('Error cleaning up old summaries:', deleteError);
        }
      }
      
      // Fetch summaries based on retention settings
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching summaries:', error);
        toast({
          title: "Error",
          description: "Failed to load summaries",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched summaries:', data);
      setSummaries(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load summaries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('summaries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting summary:', error);
        toast({
          title: "Error",
          description: "Failed to delete summary",
          variant: "destructive"
        });
        return;
      }

      setSummaries(prev => prev.filter(s => s.id !== id));
      setSelectedSummary(null);
      
      toast({
        title: "Summary Deleted",
        description: "The summary has been removed successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete summary",
        variant: "destructive"
      });
    }
  };

  const handleEmailSent = () => {
    // Refresh the summaries to update the status
    fetchSummaries();
    
    // Update the selected summary if it's still selected
    if (selectedSummary) {
      setSelectedSummary(prev => prev ? {
        ...prev,
        sent_at: new Date().toISOString()
      } : null);
    }
  };

  const getStatusBadge = (sentAt: string | null) => {
    if (sentAt) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 rounded-full px-3 py-1">
        <Clock className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
            <History className="h-8 w-8 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Summaries
          </h1>
          <p className="text-gray-600">Retrieving your recent patient summaries...</p>
        </div>
      </div>
    );
  }

  if (selectedSummary) {
    const isDraft = !selectedSummary.sent_at;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        <div className="container mx-auto px-6 py-8 space-y-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Summary Details
              </h1>
              <p className="text-xl text-gray-600">Review and manage your patient summary</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSummary(null)}
                className="border-2 border-turquoise/20 text-turquoise hover:bg-turquoise/5 rounded-full px-6"
              >
                ← Back to List
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteSummary(selectedSummary.id)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                      <Eye className="h-6 w-6 text-turquoise" />
                    </div>
                    Summary Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 rounded-2xl border border-gray-100">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {selectedSummary.summary_content}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Show email form only for draft summaries */}
              {isDraft && (
                <EmailSummaryForm
                  summaryId={selectedSummary.id}
                  patientName={selectedSummary.patient_name}
                  summaryContent={selectedSummary.summary_content}
                  onEmailSent={handleEmailSent}
                />
              )}
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-purple-500 mr-2" />
                    Summary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-turquoise/5 rounded-xl">
                    <Users className="h-5 w-5 text-turquoise" />
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-semibold text-gray-800">{selectedSummary.patient_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-sky-blue/5 rounded-xl">
                    <FileText className="h-5 w-5 text-sky-blue" />
                    <div>
                      <p className="text-sm text-gray-600">Original File</p>
                      <p className="font-medium text-gray-800">{selectedSummary.original_filename}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-purple-100/50 rounded-xl">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-800">
                        {format(new Date(selectedSummary.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedSummary.patient_email && (
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Patient Email</p>
                        <p className="font-medium text-gray-800">{selectedSummary.patient_email}</p>
                      </div>
                    </div>
                  )}

                  {selectedSummary.sent_at && (
                    <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-xl">
                      <Send className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-gray-600">Delivered At</p>
                        <p className="font-medium text-gray-800">
                          {format(new Date(selectedSummary.sent_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    {getStatusBadge(selectedSummary.sent_at)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Past Summaries
            </h1>
            <p className="text-xl text-gray-600">
              Recent patient summaries ({summaries.length} total)
            </p>
          </div>
          <Button 
            onClick={fetchSummaries} 
            variant="outline"
            className="border-2 border-turquoise/20 text-turquoise hover:bg-turquoise/5 rounded-full px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {summaries.length === 0 ? (
          <Card className="glass-card border-0 shadow-xl text-center p-12 max-w-2xl mx-auto">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-12 w-12 text-turquoise" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No Summaries Found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                You haven't generated any summaries recently.
              </p>
              <Button className="bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white rounded-full px-8 py-3 text-lg">
                <Heart className="h-5 w-5 mr-2" />
                Create Your First Summary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                  <History className="h-6 w-6 text-turquoise" />
                </div>
                Recent Summaries
              </CardTitle>
              <CardDescription className="text-lg">
                Click on any summary to view details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700 font-semibold">Patient</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Original File</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((summary) => (
                    <TableRow key={summary.id} className="cursor-pointer hover:bg-turquoise/5 transition-colors border-gray-100">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-turquoise/10 rounded-lg">
                            <Users className="h-4 w-4 text-turquoise" />
                          </div>
                          <span className="font-semibold text-gray-800">{summary.patient_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-sky-blue" />
                          <span className="truncate max-w-xs text-gray-700">{summary.original_filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(summary.sent_at)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(summary.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSummary(summary)}
                            className="border-turquoise/20 text-turquoise hover:bg-turquoise/5 rounded-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSummary(summary.id);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PastSummaries;
