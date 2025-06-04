
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Transcription } from "@/types/transcription";

export const useTranscriptions = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTranscriptions = async () => {
    if (!user) {
      console.log('No authenticated user found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Clean up old transcriptions first
      const { error: cleanupError } = await supabase.rpc('delete_old_transcriptions');
      if (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }
      
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
          description: "Failed to load transcriptions. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading transcriptions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscription = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete transcriptions",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transcription:', error);
        toast({
          title: "Error",
          description: "Failed to delete transcription. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setTranscriptions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Transcription Deleted",
        description: "The transcription has been removed successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the transcription.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTranscriptions();
    }
  }, [user]);

  return {
    transcriptions,
    loading,
    fetchTranscriptions,
    deleteTranscription
  };
};
