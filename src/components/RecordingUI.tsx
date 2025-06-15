
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Pause, Play, Square } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { useToast } from "@/hooks/use-toast";

interface RecordingUIProps {
  onAudioReady: (audioBlob: Blob, fileName: string, recordingDuration: number) => void;
  isProcessing: boolean;
}

const RecordingUI: React.FC<RecordingUIProps> = ({ onAudioReady, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    mediaRecorderRef.current = null;
    audioStreamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    setVolume(0);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const visualize = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sumSquares = 0.0;
    for (const amplitude of dataArray) {
      const normalizedAmplitude = (amplitude / 128.0) - 1.0;
      sumSquares += normalizedAmplitude * normalizedAmplitude;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    setVolume(rms);

    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      visualize();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `recording-${new Date().toISOString()}.webm`;
        onAudioReady(audioBlob, fileName, recordingDuration);
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to start recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const togglePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white rounded-lg shadow-2xl">
      <div className="mb-8">
        <VoiceVisualizer volume={volume} />
      </div>

      <div className="mb-8 text-4xl font-mono">
        {formatTime(recordingDuration)}
      </div>

      <div className="flex space-x-4">
        {!isRecording ? (
          <Button onClick={startRecording} disabled={isProcessing} className="bg-red-500 hover:bg-red-600 rounded-full p-4 h-auto">
            <Mic className="h-8 w-8" />
          </Button>
        ) : (
          <>
            <Button onClick={togglePauseResume} disabled={isProcessing} className="bg-blue-500 hover:bg-blue-600 rounded-full p-4 h-auto">
              {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
            </Button>
            <Button onClick={stopRecording} disabled={isProcessing} className="bg-red-500 hover:bg-red-600 rounded-full p-4 h-auto">
              <Square className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>
      {isRecording && <p className="mt-4 text-gray-400">Click the square to stop and process the recording.</p>}
      {!isRecording && <p className="mt-4 text-gray-400">Click the microphone to start recording.</p>}
    </div>
  );
};

export default RecordingUI;
