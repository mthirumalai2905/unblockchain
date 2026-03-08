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
      actions: {
        Row: {
          created_at: string
          done: boolean
          id: string
          owner: string | null
          priority: string
          session_id: string
          source_dump_ids: string[] | null
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          owner?: string | null
          priority?: string
          session_id: string
          source_dump_ids?: string[] | null
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          owner?: string | null
          priority?: string
          session_id?: string
          source_dump_ids?: string[] | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_themes: {
        Row: {
          dump_id: string
          theme_id: string
        }
        Insert: {
          dump_id: string
          theme_id: string
        }
        Update: {
          dump_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dump_themes_dump_id_fkey"
            columns: ["dump_id"]
            isOneToOne: false
            referencedRelation: "dumps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dump_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_threads: {
        Row: {
          content: string
          created_at: string
          id: string
          is_ai_generated: boolean
          parent_dump_id: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          parent_dump_id: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          parent_dump_id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dump_threads_parent_dump_id_fkey"
            columns: ["parent_dump_id"]
            isOneToOne: false
            referencedRelation: "dumps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dump_threads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dumps: {
        Row: {
          ai_label: string | null
          content: string
          created_at: string
          id: string
          mode: string
          session_id: string
          type: Database["public"]["Enums"]["dump_type"]
          user_id: string
        }
        Insert: {
          ai_label?: string | null
          content: string
          created_at?: string
          id?: string
          mode?: string
          session_id: string
          type?: Database["public"]["Enums"]["dump_type"]
          user_id: string
        }
        Update: {
          ai_label?: string | null
          content?: string
          created_at?: string
          id?: string
          mode?: string
          session_id?: string
          type?: Database["public"]["Enums"]["dump_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dumps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_comments: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_comments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_votes: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_votes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_group_dumps: {
        Row: {
          dump_id: string
          group_id: string
        }
        Insert: {
          dump_id: string
          group_id: string
        }
        Update: {
          dump_id?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_group_dumps_dump_id_fkey"
            columns: ["dump_id"]
            isOneToOne: false
            referencedRelation: "dumps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_group_dumps_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_ai_created: boolean
          session_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_ai_created?: boolean
          session_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_ai_created?: boolean
          session_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_groups_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          avatar_initials?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          avatar_initials?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answered: boolean
          created_at: string
          id: string
          session_id: string
          source_dump_ids: string[] | null
          text: string
          user_id: string
          votes: number
        }
        Insert: {
          answered?: boolean
          created_at?: string
          id?: string
          session_id: string
          source_dump_ids?: string[] | null
          text: string
          user_id: string
          votes?: number
        }
        Update: {
          answered?: boolean
          created_at?: string
          id?: string
          session_id?: string
          source_dump_ids?: string[] | null
          text?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sub_group_delete_votes: {
        Row: {
          created_at: string
          id: string
          sub_group_id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          sub_group_id: string
          user_id: string
          vote?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          sub_group_id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sub_group_delete_votes_sub_group_id_fkey"
            columns: ["sub_group_id"]
            isOneToOne: false
            referencedRelation: "sub_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_group_drafts: {
        Row: {
          content: string
          created_at: string
          id: string
          sub_group_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          sub_group_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sub_group_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_group_drafts_sub_group_id_fkey"
            columns: ["sub_group_id"]
            isOneToOne: false
            referencedRelation: "sub_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_group_members: {
        Row: {
          joined_at: string
          sub_group_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          sub_group_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          sub_group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_group_members_sub_group_id_fkey"
            columns: ["sub_group_id"]
            isOneToOne: false
            referencedRelation: "sub_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_group_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sub_group_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sub_group_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sub_group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_group_messages_sub_group_id_fkey"
            columns: ["sub_group_id"]
            isOneToOne: false
            referencedRelation: "sub_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_group_roadmaps: {
        Row: {
          created_at: string
          id: string
          phases_json: Json
          sub_group_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phases_json?: Json
          sub_group_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phases_json?: Json
          sub_group_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_group_roadmaps_sub_group_id_fkey"
            columns: ["sub_group_id"]
            isOneToOne: false
            referencedRelation: "sub_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_id: string
          id: string
          last_activity_at: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_id: string
          id?: string
          last_activity_at?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_id?: string
          id?: string
          last_activity_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          session_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          session_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          session_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_groups_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          session_id: string
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          session_id: string
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          session_id?: string
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "themes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_analyses: {
        Row: {
          ai_output_json: Json
          config_json: Json
          created_at: string
          id: string
          session_id: string | null
          tweets_json: Json
          user_id: string
        }
        Insert: {
          ai_output_json?: Json
          config_json?: Json
          created_at?: string
          id?: string
          session_id?: string | null
          tweets_json?: Json
          user_id: string
        }
        Update: {
          ai_output_json?: Json
          config_json?: Json
          created_at?: string
          id?: string
          session_id?: string | null
          tweets_json?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twitter_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_connections: {
        Row: {
          access_token: string | null
          connected_username: string | null
          created_at: string
          id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_username?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_username?: string | null
          created_at?: string
          id?: string
          refresh_token?: string | null
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
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_sub_group_member: {
        Args: { _sub_group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      dump_type:
        | "idea"
        | "decision"
        | "question"
        | "blocker"
        | "action"
        | "note"
        | "todo"
        | "insight"
        | "feedback"
        | "reference"
        | "rant"
        | "goal"
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
    Enums: {
      dump_type: [
        "idea",
        "decision",
        "question",
        "blocker",
        "action",
        "note",
        "todo",
        "insight",
        "feedback",
        "reference",
        "rant",
        "goal",
      ],
    },
  },
} as const
