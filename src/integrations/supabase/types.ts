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
      apartments: {
        Row: {
          apartment_link: string | null
          arnona: number | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          entry_date: string | null
          fb_url: string | null
          floor: number | null
          gabi_rating: number | null
          has_shelter: boolean | null
          id: string
          image_url: string | null
          location: string | null
          mor_rating: number | null
          note: string | null
          pets_allowed: string | null
          price: number | null
          rating: number | null
          scheduled_visit_text: string | null
          spoke_with_gabi: boolean | null
          spoke_with_mor: boolean | null
          square_meters: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apartment_link?: string | null
          arnona?: number | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string | null
          fb_url?: string | null
          floor?: number | null
          gabi_rating?: number | null
          has_shelter?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          mor_rating?: number | null
          note?: string | null
          pets_allowed?: string | null
          price?: number | null
          rating?: number | null
          scheduled_visit_text?: string | null
          spoke_with_gabi?: boolean | null
          spoke_with_mor?: boolean | null
          square_meters?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apartment_link?: string | null
          arnona?: number | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string | null
          fb_url?: string | null
          floor?: number | null
          gabi_rating?: number | null
          has_shelter?: boolean | null
          id?: string
          image_url?: string | null
          location?: string | null
          mor_rating?: number | null
          note?: string | null
          pets_allowed?: string | null
          price?: number | null
          rating?: number | null
          scheduled_visit_text?: string | null
          spoke_with_gabi?: boolean | null
          spoke_with_mor?: boolean | null
          square_meters?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cat_game_scores: {
        Row: {
          created_at: string
          id: string
          player_name: string | null
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_name?: string | null
          score: number
        }
        Update: {
          created_at?: string
          id?: string
          player_name?: string | null
          score?: number
        }
        Relationships: []
      }
      couples: {
        Row: {
          created_at: string
          id: string
          partner1_id: string
          partner2_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner1_id: string
          partner2_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          partner1_id?: string
          partner2_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      drawings: {
        Row: {
          created_at: string
          current_turn: string
          device_id: string | null
          drawing_data: string
          drawing_name: string | null
          id: string
          is_completed: boolean
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_turn?: string
          device_id?: string | null
          drawing_data: string
          drawing_name?: string | null
          id?: string
          is_completed?: boolean
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_turn?: string
          device_id?: string | null
          drawing_data?: string
          drawing_name?: string | null
          id?: string
          is_completed?: boolean
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          current_turn: string
          draft_canvas_data: string | null
          drawing_id: string | null
          id: string
          last_player_device_id: string | null
          player1_device_id: string | null
          player1_ready: boolean | null
          player2_device_id: string | null
          player2_ready: boolean | null
          session_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_turn?: string
          draft_canvas_data?: string | null
          drawing_id?: string | null
          id?: string
          last_player_device_id?: string | null
          player1_device_id?: string | null
          player1_ready?: boolean | null
          player2_device_id?: string | null
          player2_ready?: boolean | null
          session_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_turn?: string
          draft_canvas_data?: string | null
          drawing_id?: string | null
          id?: string
          last_player_device_id?: string | null
          player1_device_id?: string | null
          player1_ready?: boolean | null
          player2_device_id?: string | null
          player2_ready?: boolean | null
          session_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_drawing_id_fkey"
            columns: ["drawing_id"]
            isOneToOne: false
            referencedRelation: "drawings"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          couple_id: string
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_id: string
          status: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          inviter_id: string
          status?: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          couple_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scanned_apartments: {
        Row: {
          apartment_link: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          floor: number | null
          id: string
          image_url: string | null
          location: string | null
          pets_allowed: string | null
          price: number | null
          square_meters: number | null
          title: string
          user_id: string
        }
        Insert: {
          apartment_link?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          pets_allowed?: string | null
          price?: number | null
          square_meters?: number | null
          title: string
          user_id: string
        }
        Update: {
          apartment_link?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          pets_allowed?: string | null
          price?: number | null
          square_meters?: number | null
          title?: string
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
