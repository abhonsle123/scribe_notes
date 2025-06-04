
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioFilePath: string;
  transcriptionId: string;
}

export const AudioPlayer = ({ audioFilePath, transcriptionId }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAudioUrl();
  }, [audioFilePath]);

  const loadAudioUrl = async () => {
    if (!audioFilePath) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .createSignedUrl(audioFilePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Audio Load Error",
          description: "Failed to load audio file",
          variant: "destructive"
        });
        return;
      }

      setAudioUrl(data.signedUrl);
    } catch (error) {
      console.error('Error loading audio:', error);
      toast({
        title: "Audio Load Error", 
        description: "Failed to load audio file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = async () => {
    if (!audioUrl) return;
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription-${transcriptionId}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Audio file download has begun",
      });
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast({
        title: "Download Error",
        description: "Failed to download audio file",
        variant: "destructive"
      });
    }
  };

  if (!audioFilePath) {
    return (
      <div className="text-sm text-gray-500 italic">
        Audio recording not available
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading audio...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlayPause}
          disabled={!audioUrl}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-10 h-10 p-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1 space-y-2">
          <div 
            className="h-2 bg-purple-200 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-purple-600" />
          <Button
            onClick={downloadAudio}
            disabled={!audioUrl}
            variant="outline"
            size="sm"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />
      )}
    </div>
  );
};
