
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface TranscriptionListViewProps {
  transcriptions: Transcription[];
  onRefresh: () => void;
  onSelectTranscription: (transcription: Transcription) => void;
  onDeleteTranscription: (id: string) => void;
}

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

export const TranscriptionListView = ({ 
  transcriptions, 
  onRefresh, 
  onSelectTranscription, 
  onDeleteTranscription 
}: TranscriptionListViewProps) => {
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
            onClick={onRefresh} 
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
                            onClick={() => onSelectTranscription(transcription)}
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
                              onDeleteTranscription(transcription.id);
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
