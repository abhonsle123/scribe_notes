export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          accuracy_rating: number | null
          clarity_rating: number | null
          created_at: string
          id: string
          open_feedback: string | null
          overall_rating: number | null
          recommendation_rating: number | null
          session_id: string
          summary_id: string | null
          updated_at: string
          usefulness_rating: number | null
          user_id: string | null
        }
        Insert: {
          accuracy_rating?: number | null
          clarity_rating?: number | null
          created_at?: string
          id?: string
          open_feedback?: string | null
          overall_rating?: number | null
          recommendation_rating?: number | null
          session_id: string
          summary_id?: string | null
          updated_at?: string
          usefulness_rating?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy_rating?: number | null
          clarity_rating?: number | null
          created_at?: string
          id?: string
          open_feedback?: string | null
          overall_rating?: number | null
          recommendation_rating?: number | null
          session_id?: string
          summary_id?: string | null
          updated_at?: string
          usefulness_rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_access_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          summary_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          summary_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          summary_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_access_tokens_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          organization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          organization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          organization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      summaries: {
        Row: {
          chat_history: Json | null
          created_at: string
          follow_up_sent: boolean | null
          follow_up_sent_at: string | null
          id: string
          original_filename: string
          patient_email: string | null
          patient_name: string
          sent_at: string | null
          summary_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_history?: Json | null
          created_at?: string
          follow_up_sent?: boolean | null
          follow_up_sent_at?: string | null
          id?: string
          original_filename: string
          patient_email?: string | null
          patient_name: string
          sent_at?: string | null
          summary_content: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_history?: Json | null
          created_at?: string
          follow_up_sent?: boolean | null
          follow_up_sent_at?: string | null
          id?: string
          original_filename?: string
          patient_email?: string | null
          patient_name?: string
          sent_at?: string | null
          summary_content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_presets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_content: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_content: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_content?: string
        }
        Relationships: []
      }
      transcriptions: {
        Row: {
          audio_duration: number | null
          audio_file_path: string | null
          clinical_notes: string | null
          clinical_notes_sent_at: string | null
          created_at: string
          id: string
          original_filename: string | null
          patient_email: string | null
          patient_name: string
          patient_summary: string | null
          patient_summary_sent_at: string | null
          transcription_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_file_path?: string | null
          clinical_notes?: string | null
          clinical_notes_sent_at?: string | null
          created_at?: string
          id?: string
          original_filename?: string | null
          patient_email?: string | null
          patient_name: string
          patient_summary?: string | null
          patient_summary_sent_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_file_path?: string | null
          clinical_notes?: string | null
          clinical_notes_sent_at?: string | null
          created_at?: string
          id?: string
          original_filename?: string | null
          patient_email?: string | null
          patient_name?: string
          patient_summary?: string | null
          patient_summary_sent_at?: string | null
          transcription_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          template_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          template_content: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          template_content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_delete_enabled: boolean | null
          clinical_notes_template: string | null
          created_at: string
          custom_clinical_template: string | null
          custom_template: string | null
          data_retention_days: number | null
          id: string
          summary_template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          clinical_notes_template?: string | null
          created_at?: string
          custom_clinical_template?: string | null
          custom_template?: string | null
          data_retention_days?: number | null
          id?: string
          summary_template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_delete_enabled?: boolean | null
          clinical_notes_template?: string | null
          created_at?: string
          custom_clinical_template?: string | null
          custom_template?: string | null
          data_retention_days?: number | null
          id?: string
          summary_template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_summaries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_old_transcriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
