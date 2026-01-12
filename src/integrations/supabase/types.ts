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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      automation_logs: {
        Row: {
          automation_id: string | null
          comment_id: string | null
          comment_text: string | null
          commenter_id: string | null
          created_at: string
          dm_sent: boolean | null
          error_message: string | null
          id: string
        }
        Insert: {
          automation_id?: string | null
          comment_id?: string | null
          comment_text?: string | null
          commenter_id?: string | null
          created_at?: string
          dm_sent?: boolean | null
          error_message?: string | null
          id?: string
        }
        Update: {
          automation_id?: string | null
          comment_id?: string | null
          comment_text?: string | null
          commenter_id?: string | null
          created_at?: string
          dm_sent?: boolean | null
          error_message?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "instagram_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_automations: {
        Row: {
          apply_to_all: boolean | null
          ask_email: boolean | null
          ask_follow: boolean | null
          auto_reply_enabled: boolean | null
          comment_responses: string[] | null
          created_at: string
          dm_button_text: string | null
          dm_button_url: string | null
          dm_message: string
          dm_type: string | null
          follow_button_text: string | null
          follow_check_message: string | null
          follow_opening_message: string | null
          follow_retry_action: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          media_caption: string | null
          media_id: string | null
          media_thumbnail: string | null
          media_type: string | null
          name: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apply_to_all?: boolean | null
          ask_email?: boolean | null
          ask_follow?: boolean | null
          auto_reply_enabled?: boolean | null
          comment_responses?: string[] | null
          created_at?: string
          dm_button_text?: string | null
          dm_button_url?: string | null
          dm_message: string
          dm_type?: string | null
          follow_button_text?: string | null
          follow_check_message?: string | null
          follow_opening_message?: string | null
          follow_retry_action?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          media_caption?: string | null
          media_id?: string | null
          media_thumbnail?: string | null
          media_type?: string | null
          name: string
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apply_to_all?: boolean | null
          ask_email?: boolean | null
          ask_follow?: boolean | null
          auto_reply_enabled?: boolean | null
          comment_responses?: string[] | null
          created_at?: string
          dm_button_text?: string | null
          dm_button_url?: string | null
          dm_message?: string
          dm_type?: string | null
          follow_button_text?: string | null
          follow_check_message?: string | null
          follow_opening_message?: string | null
          follow_retry_action?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          media_caption?: string | null
          media_id?: string | null
          media_thumbnail?: string | null
          media_type?: string | null
          name?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_connections: {
        Row: {
          access_token: string
          account_type: string | null
          created_at: string
          expires_at: string | null
          id: string
          instagram_account_id: string
          instagram_username: string | null
          media_count: number | null
          page_access_token: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_type?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instagram_account_id: string
          instagram_username?: string | null
          media_count?: number | null
          page_access_token?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_type?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instagram_account_id?: string
          instagram_username?: string | null
          media_count?: number | null
          page_access_token?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
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
      [_ in never]: never
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
