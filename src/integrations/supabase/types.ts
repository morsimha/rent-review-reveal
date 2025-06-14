export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apartments: {
        Row: {
          apartment_link: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          fb_url: string | null
          gabi_rating: number | null
          id: string
          image_url: string | null
          location: string | null
          mor_rating: number | null
          note: string | null
          pets_allowed: string | null
          price: number | null
          rating: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          apartment_link?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          fb_url?: string | null
          gabi_rating?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          mor_rating?: number | null
          note?: string | null
          pets_allowed?: string | null
          price?: number | null
          rating?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          apartment_link?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          fb_url?: string | null
          gabi_rating?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          mor_rating?: number | null
          note?: string | null
          pets_allowed?: string | null
          price?: number | null
          rating?: number | null
          status?: string | null
          title?: string
          updated_at?: string
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
          drawing_id: string | null
          id: string
          last_player_device_id: string | null
          session_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_turn?: string
          drawing_id?: string | null
          id?: string
          last_player_device_id?: string | null
          session_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_turn?: string
          drawing_id?: string | null
          id?: string
          last_player_device_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
