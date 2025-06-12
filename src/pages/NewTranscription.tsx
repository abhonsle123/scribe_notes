import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ArrowLeft, User, FileAudio } from "lucide-react";
import { Link } from "react-router-dom";

const NewTranscription = () => {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'recording' | 'processing'>('form');
  const [processingStatus, setProcessingStatus] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleNext = () => {
    if (!patientName.trim()) {
      toast({
        title: "Patient Name Required",
        description: "Please enter the patient's name to continue",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('recording');
  };

  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAudioReady = async (audioBlob: Blob, fileName: string, recordingDuration?: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep('processing');
      setProcessingStatus("Creating transcription record...");

      // Create transcription record first
      const { data: transcription, error: createError } = await supabase
        .from('transcriptions')
        .insert({
          user_id: user.id,
          patient_name: patientName,
          patient_email: patientEmail || null,
          original_filename: fileName,
          audio_duration: recordingDuration ? Math.round(recordingDuration) : 0,
          transcription_text: null,
          clinical_notes: null,
          patient_summary: null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating transcription record:', createError);
        throw createError;
      }

      console.log('Transcription record created:', transcription.id);
      setProcessingStatus("Converting audio to text...");

      // Convert audio to base64
      const base64Audio = await convertToBase64(audioBlob);

      // Call transcription function with recording duration
      const { data: transcribeResult, error: transcribeError } = await supabase.functions
        .invoke('transcribe-audio', {
          body: {
            audio: base64Audio,
            transcriptionId: transcription.id,
            recordingDuration: recordingDuration
          }
        });

      if (transcribeError) {
        console.error('Error in transcription:', transcribeError);
        throw transcribeError;
      }

      console.log('Transcription completed:', transcribeResult);
      setProcessingStatus("Generating clinical notes and patient summary...");

      // Generate clinical notes and patient summary
      const { data: notesResult, error: notesError } = await supabase.functions
        .invoke('generate-clinical-notes', {
          body: {
            transcriptionText: transcribeResult.text,
            transcriptionId: transcription.id
          }
        });

      if (notesError) {
        console.error('Error generating clinical notes:', notesError);
        throw notesError;
      }

      console.log('Clinical notes generated:', notesResult);

      toast({
        title: "Transcription Complete!",
        description: "Audio has been transcribed and clinical notes generated successfully"
      });

      navigate('/dashboard/transcriptions');

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process audio. Please try again.",
        variant: "destructive"
      });
      setCurrentStep('recording');
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <Card className="glass-card border-0 shadow-xl max-w-2xl mx-auto text-center p-8">
          <CardContent>
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
              <FileAudio className="h-12 w-12 text-purple-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Processing Audio</h2>
            <p className="text-xl text-gray-600 mb-6">{processingStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
            <p className="text-gray-500">This may take a few minutes...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              New Audio Transcription
            </h1>
            <p className="text-xl text-gray-600">
              Record or upload consultation audio to generate clinical notes
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {currentStep === 'form' && (
          <div className="max-w-2xl mx-auto">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Patient Information</CardTitle>
                <CardDescription className="text-lg">
                  Enter patient details before starting the transcription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-base font-medium">
                    Patient Name *
                  </Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient's full name"
                    className="text-base py-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientEmail" className="text-base font-medium">
                    Patient Email (Optional)
                  </Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="text-base py-3"
                  />
                  <p className="text-sm text-gray-500">
                    Email address for sending the patient-friendly summary
                  </p>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg rounded-full"
                  >
                    Continue to Recording
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'recording' && (
          <div className="max-w-4xl mx-auto">
            <AudioRecorder onAudioReady={handleAudioReady} isProcessing={isProcessing} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTranscription;
