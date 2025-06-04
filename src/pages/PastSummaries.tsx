
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
  Send
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
      
      // Clean up old summaries first
      await supabase.rpc('delete_old_summaries');
      
      // Fetch summaries from the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .gte('created_at', threeDaysAgo.toISOString())
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
        .eq('id', id);

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
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Past Summaries</h1>
          <p className="text-gray-600 mt-1">Loading your recent summaries...</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (selectedSummary) {
    const isDraft = !selectedSummary.sent_at;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Summary Details</h1>
            <p className="text-gray-600 mt-1">View and manage your summary</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setSelectedSummary(null)}>
              Back to List
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteSummary(selectedSummary.id)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Summary Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-800">
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
            <Card>
              <CardHeader>
                <CardTitle>Summary Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-medium">{selectedSummary.patient_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Original File</p>
                      <p className="font-medium">{selectedSummary.original_filename}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {format(new Date(selectedSummary.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {selectedSummary.patient_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Patient Email</p>
                        <p className="font-medium">{selectedSummary.patient_email}</p>
                      </div>
                    </div>
                  )}

                  {selectedSummary.sent_at && (
                    <div className="flex items-center space-x-3">
                      <Send className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Sent At</p>
                        <p className="font-medium">
                          {format(new Date(selectedSummary.sent_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    {getStatusBadge(selectedSummary.sent_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Past Summaries</h1>
          <p className="text-gray-600 mt-1">
            Summaries from the last 3 days ({summaries.length} total)
          </p>
        </div>
        <Button onClick={fetchSummaries} variant="outline">
          Refresh
        </Button>
      </div>

      {summaries.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Summaries Found
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't generated any summaries in the last 3 days.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create New Summary
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Summaries</CardTitle>
            <CardDescription>
              Click on any summary to view details. Summaries are automatically deleted after 3 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Original File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary) => (
                  <TableRow key={summary.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{summary.patient_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-xs">{summary.original_filename}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(summary.sent_at)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(summary.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSummary(summary)}
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
                          className="text-red-600 hover:text-red-700"
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
  );
};

export default PastSummaries;
