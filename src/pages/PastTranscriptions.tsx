
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { LoadingView } from "@/components/transcriptions/LoadingView";
import { NotAuthenticatedView } from "@/components/transcriptions/NotAuthenticatedView";
import { TranscriptionListView } from "@/components/transcriptions/TranscriptionListView";
import { TranscriptionDetailView } from "@/components/transcriptions/TranscriptionDetailView";
import { Transcription } from "@/types/transcription";

const PastTranscriptions = () => {
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const { user } = useAuth();
  const { transcriptions, loading, fetchTranscriptions, deleteTranscription } = useTranscriptions();

  const handleDeleteTranscription = async (id: string) => {
    await deleteTranscription(id);
    setSelectedTranscription(null);
  };

  if (loading) {
    return <LoadingView />;
  }

  if (!user) {
    return <NotAuthenticatedView />;
  }

  if (selectedTranscription) {
    return (
      <TranscriptionDetailView
        transcription={selectedTranscription}
        onBack={() => setSelectedTranscription(null)}
        onDelete={handleDeleteTranscription}
      />
    );
  }

  return (
    <TranscriptionListView
      transcriptions={transcriptions}
      onRefresh={fetchTranscriptions}
      onSelectTranscription={setSelectedTranscription}
      onDeleteTranscription={deleteTranscription}
    />
  );
};

export default PastTranscriptions;
