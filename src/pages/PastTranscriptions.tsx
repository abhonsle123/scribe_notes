
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
  FileAudio, 
  Calendar, 
  User, 
  Eye, 
  Trash2,
  RefreshCw,
  Users,
  Stethoscope,
  FileText,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface Transcription {
  id: string;
  patient_name: string;
  original_filename: string | null;
  transcription_text: string | null;
  clinical_notes: string | null;
  patient_summary: string | null;
  patient_email: string | null;
  clinical_notes_sent_at: string | null;
  patient_summary_sent_at: string | null;
  created_at: string;
  audio_duration: number | null;
}

const PastTranscriptions = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTranscriptions();
    }
  }, [user]);

  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      
      // Clean up old transcriptions first
      await supabase.rpc('delete_old_transcriptions');
      
      // Fetch transcriptions from the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transcriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load transcriptions",
          variant: "destructive"
        });
        return;
      }

      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load transcriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transcription:', error);
        toast({
          title: "Error",
          description: "Failed to delete transcription",
          variant: "destructive"
        });
        return;
      }

      setTranscriptions(prev => prev.filter(t => t.id !== id));
      setSelectedTranscription(null);
      
      toast({
        title: "Transcription Deleted",
        description: "The transcription has been removed successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete transcription",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (transcription: Transcription) => {
    if (transcription.clinical_notes && transcription.patient_summary) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full px-3 py-1">
          <FileText className="h-3 w-3 mr-1" />
          Processed
        </Badge>
      );
    } else if (transcription.transcription_text) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 rounded-full px-3 py-1">
          <FileAudio className="h-3 w-3 mr-1" />
          Transcribed
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 rounded-full px-3 py-1">
        <Clock className="h-3 w-3 mr-1" />
        Processing
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
            <FileAudio className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Transcriptions
          </h1>
          <p className="text-gray-600">Retrieving your recent audio transcriptions...</p>
        </div>
      </div>
    );
  }

  if (selectedTranscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
        <div className="container mx-auto px-6 py-8 space-y-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Transcription Details
              </h1>
              <p className="text-xl text-gray-600">Review audio transcription and generated notes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTranscription(null)}
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"
              >
                ← Back to List
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteTranscription(selectedTranscription.id)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Transcription Text */}
              {selectedTranscription.transcription_text && (
                <Card className="glass-card border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mr-3">
                        <FileAudio className="h-6 w-6 text-purple-600" />
                      </div>
                      Audio Transcription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 p-8 rounded-2xl border border-gray-100">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {selectedTranscription.transcription_text}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Clinical Notes */}
              {selectedTranscription.clinical_notes && (
                <Card className="glass-card border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mr-3">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      </div>
                      Clinical Notes (Provider)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 p-8 rounded-2xl border border-blue-100">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {selectedTranscription.clinical_notes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient Summary */}
              {selectedTranscription.patient_summary && (
                <Card className="glass-card border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mr-3">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      Patient Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 p-8 rounded-2xl border border-green-100">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {selectedTranscription.patient_summary}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-purple-500 mr-2" />
                    Transcription Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-semibold text-gray-800">{selectedTranscription.patient_name}</p>
                    </div>
                  </div>
                  
                  {selectedTranscription.original_filename && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                      <FileAudio className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Audio File</p>
                        <p className="font-medium text-gray-800">{selectedTranscription.original_filename}</p>
                      </div>
                    </div>
                  )}

                  {selectedTranscription.audio_duration && (
                    <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-800">{formatDuration(selectedTranscription.audio_duration)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-800">
                        {format(new Date(selectedTranscription.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    {getStatusBadge(selectedTranscription)}
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
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Past Transcriptions
            </h1>
            <p className="text-xl text-gray-600">
              Recent audio transcriptions from the last 3 days ({transcriptions.length} total)
            </p>
          </div>
          <Button 
            onClick={fetchTranscriptions} 
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {transcriptions.length === 0 ? (
          <Card className="glass-card border-0 shadow-xl text-center p-12 max-w-2xl mx-auto">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <FileAudio className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No Transcriptions Found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                You haven't created any transcriptions in the last 3 days.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-8 py-3 text-lg">
                <Stethoscope className="h-5 w-5 mr-2" />
                Start Your First Transcription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="flex items-center text-2xl">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mr-3">
                  <FileAudio className="h-6 w-6 text-purple-600" />
                </div>
                Recent Transcriptions
              </CardTitle>
              <CardDescription className="text-lg">
                Click on any transcription to view details. Transcriptions are automatically cleaned up after 3 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700 font-semibold">Patient</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Duration</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transcriptions.map((transcription) => (
                    <TableRow key={transcription.id} className="cursor-pointer hover:bg-purple-50/50 transition-colors border-gray-100">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-semibold text-gray-800">{transcription.patient_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700">{formatDuration(transcription.audio_duration)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transcription)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(transcription.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTranscription(transcription)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTranscription(transcription.id);
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

export default PastTranscriptions;
