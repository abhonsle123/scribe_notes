
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileAudio,
  Calendar,
  User,
  Trash2,
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

interface TranscriptionDetailViewProps {
  transcription: Transcription;
  onBack: () => void;
  onDelete: (id: string) => void;
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

export const TranscriptionDetailView = ({ transcription, onBack, onDelete }: TranscriptionDetailViewProps) => {
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
              onClick={onBack}
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"
            >
              ← Back to List
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(transcription.id)}
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
            {transcription.transcription_text && (
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
                      {transcription.transcription_text}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinical Notes */}
            {transcription.clinical_notes && (
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
                      {transcription.clinical_notes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patient Summary */}
            {transcription.patient_summary && (
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
                      {transcription.patient_summary}
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
                    <p className="font-semibold text-gray-800">{transcription.patient_name}</p>
                  </div>
                </div>
                
                {transcription.original_filename && (
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <FileAudio className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Audio File</p>
                      <p className="font-medium text-gray-800">{transcription.original_filename}</p>
                    </div>
                  </div>
                )}

                {transcription.audio_duration && (
                  <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">{formatDuration(transcription.audio_duration)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-800">
                      {format(new Date(transcription.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  {getStatusBadge(transcription)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
