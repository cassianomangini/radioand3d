// Generated from the CM Supabase schema (Postgres 17 / PostgREST 14).
// Server-side use only. Regenerate after migrations; do not hand-edit.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      quote_attachments: {
        Row: {
          accounted_bytes: number
          created_at: string
          detected_type: string | null
          expires_at: string
          extension: string
          grant_expires_at: string
          id: string
          original_name: string
          quota_released_at: string | null
          quote_request_id: string
          reported_mime: string | null
          size_bytes: number
          storage_bucket: string
          storage_path: string
          updated_at: string
          upload_key: string
          uploaded_at: string | null
          validated_at: string | null
          validated_size_bytes: number | null
          validation_code: string | null
          validation_status: string
        }
        Insert: {
          accounted_bytes?: number
          created_at?: string
          detected_type?: string | null
          expires_at?: string
          extension: string
          grant_expires_at?: string
          id?: string
          original_name: string
          quota_released_at?: string | null
          quote_request_id: string
          reported_mime?: string | null
          size_bytes: number
          storage_bucket?: string
          storage_path: string
          updated_at?: string
          upload_key: string
          uploaded_at?: string | null
          validated_at?: string | null
          validated_size_bytes?: number | null
          validation_code?: string | null
          validation_status?: string
        }
        Update: {
          accounted_bytes?: number
          created_at?: string
          detected_type?: string | null
          expires_at?: string
          extension?: string
          grant_expires_at?: string
          id?: string
          original_name?: string
          quota_released_at?: string | null
          quote_request_id?: string
          reported_mime?: string | null
          size_bytes?: number
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
          upload_key?: string
          uploaded_at?: string | null
          validated_at?: string | null
          validated_size_bytes?: number | null
          validation_code?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_attachments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_events: {
        Row: {
          created_at: string
          event_status: string
          event_type: string
          id: number
          metadata: Json
          quote_request_id: string | null
        }
        Insert: {
          created_at?: string
          event_status: string
          event_type: string
          id?: never
          metadata?: Json
          quote_request_id?: string | null
        }
        Update: {
          created_at?: string
          event_status?: string
          event_type?: string
          id?: never
          metadata?: Json
          quote_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_events_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_rate_limit_windows: {
        Row: {
          action: string
          expires_at: string
          key_hash: string
          request_count: number
          window_start: string
        }
        Insert: {
          action: string
          expires_at: string
          key_hash: string
          request_count?: number
          window_start: string
        }
        Update: {
          action?: string
          expires_at?: string
          key_hash?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          contact_method: string | null
          contact_name: string | null
          contact_value: string | null
          created_at: string
          expires_at: string
          id: string
          last_activity_at: string
          lifecycle_status: string
          no_file: boolean
          owner_session_hash: string
          production: Json
          project: Json
          project_type: string
          schema_version: number
          source_origin: string | null
          source_reference: string | null
          starting_points: string[]
          submission_key: string | null
          submitted_at: string | null
          triage_status: string | null
          updated_at: string
        }
        Insert: {
          contact_method?: string | null
          contact_name?: string | null
          contact_value?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_activity_at?: string
          lifecycle_status?: string
          no_file?: boolean
          owner_session_hash: string
          production?: Json
          project?: Json
          project_type: string
          schema_version?: number
          source_origin?: string | null
          source_reference?: string | null
          starting_points?: string[]
          submission_key?: string | null
          submitted_at?: string | null
          triage_status?: string | null
          updated_at?: string
        }
        Update: {
          contact_method?: string | null
          contact_name?: string | null
          contact_value?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_activity_at?: string
          lifecycle_status?: string
          no_file?: boolean
          owner_session_hash?: string
          production?: Json
          project?: Json
          project_type?: string
          schema_version?: number
          source_origin?: string | null
          source_reference?: string | null
          starting_points?: string[]
          submission_key?: string | null
          submitted_at?: string | null
          triage_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_upload_limits: {
        Row: {
          bucket_id: string
          created_at: string
          max_bytes: number
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          max_bytes: number
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          max_bytes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      quote_consume_rate_limit: {
        Args: { p_action: string; p_key_hash: string }
        Returns: boolean
      }
      quote_owned_attachment: {
        Args: {
          p_attachment_id: string
          p_owner_session_hash: string
          p_request_id: string
        }
        Returns: {
          attachment_id: string
          extension: string
          original_name: string
          reported_size_bytes: number
          storage_path: string
          validated_size_bytes: number
          validation_status: string
        }[]
      }
      quote_release_attachment: {
        Args: {
          p_attachment_id: string
          p_owner_session_hash: string
          p_request_id: string
        }
        Returns: boolean
      }
      quote_reserve_attachment: {
        Args: {
          p_extension: string
          p_original_name: string
          p_owner_session_hash: string
          p_reported_mime: string
          p_request_id: string
          p_size_bytes: number
          p_upload_key: string
        }
        Returns: {
          attachment_id: string
          object_path: string
          reservation_expires_at: string
        }[]
      }
      quote_submit: {
        Args: {
          p_attachment_ids: string[]
          p_contact_method: string
          p_contact_name: string
          p_contact_value: string
          p_no_file: boolean
          p_owner_session_hash: string
          p_production: Json
          p_project: Json
          p_project_type: string
          p_request_id: string
          p_source_origin: string
          p_source_reference: string
          p_starting_points: string[]
          p_submission_key: string
          p_triage_status: string
        }
        Returns: {
          request_id: string
          submission_time: string
        }[]
      }
      quote_validate_attachment: {
        Args: {
          p_actual_size_bytes: number
          p_attachment_id: string
          p_detected_type: string
          p_owner_session_hash: string
          p_request_id: string
        }
        Returns: boolean
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
