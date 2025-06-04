
export interface Transcription {
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
