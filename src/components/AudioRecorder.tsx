
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, Square, Upload, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, fileName: string) => void;
  isProcessing: boolean;
}

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 
  'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'
];

export const AudioRecorder = ({ onAudioReady, isProcessing }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const validateAudioFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid audio file (MP3, WAV, WebM, OGG, M4A, AAC, or FLAC).",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Validate recording size
        if (audioBlob.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: "Recording Too Large",
            description: `Recording size must be less than ${MAX_FILE_SIZE_MB}MB. Please record a shorter audio.`,
            variant: "destructive"
          });
          chunksRef.current = [];
          return;
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Recording Stopped",
        description: "Audio recorded successfully",
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateAudioFile(file)) {
        const url = URL.createObjectURL(file);
        setAudioURL(url);
        onAudioReady(file, file.name);
        
        toast({
          title: "File Uploaded",
          description: "Audio file uploaded successfully",
        });
      }
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };

  const useRecording = () => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const fileName = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
      onAudioReady(audioBlob, fileName);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Mic className="h-8 w-8 text-purple-600" />
          </div>
          Audio Consultation
        </CardTitle>
        <CardDescription className="text-lg">
          Record a consultation or upload an audio file to generate clinical notes and patient summaries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          {isRecording && (
            <div className="text-center">
              <div className="text-3xl font-mono text-red-600 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                Recording in progress...
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="px-8 py-4 rounded-full text-lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="relative">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Or upload an audio file</p>
            <p className="text-xs text-gray-400 mb-4">
              Supported formats: MP3, WAV, WebM, OGG, M4A, AAC, FLAC (max {MAX_FILE_SIZE_MB}MB)
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept={ALLOWED_AUDIO_TYPES.join(',')}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing || isRecording}
              />
              <Button
                variant="outline"
                disabled={isProcessing || isRecording}
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full px-6"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Audio File
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Audio Preview */}
        {audioURL && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Audio Preview</h4>
              <Button
                onClick={playAudio}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
            
            {chunksRef.current.length > 0 && (
              <div className="mt-4 text-center">
                <Button
                  onClick={useRecording}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6"
                >
                  Process Recording
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
