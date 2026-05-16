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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_note: string | null
          decided_via: string | null
          email: string
          id: string
          message: string | null
          metadata: Json
          name: string
          phone: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_note?: string | null
          decided_via?: string | null
          email: string
          id?: string
          message?: string | null
          metadata?: Json
          name: string
          phone?: string | null
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_note?: string | null
          decided_via?: string | null
          email?: string
          id?: string
          message?: string | null
          metadata?: Json
          name?: string
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          content_url: string | null
          created_at: string
          description: string
          id: string
          is_published: boolean
          module_index: number
          price_bdt: number
          title: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          description: string
          id?: string
          is_published?: boolean
          module_index: number
          price_bdt?: number
          title: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          module_index?: number
          price_bdt?: number
          title?: string
        }
        Relationships: []
      }
      enrollment_events: {
        Row: {
          actor: string | null
          created_at: string
          enrollment_id: string | null
          event_type: string
          id: string
          message: string | null
          module_index: number
          user_id: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          enrollment_id?: string | null
          event_type: string
          id?: string
          message?: string | null
          module_index: number
          user_id: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          enrollment_id?: string | null
          event_type?: string
          id?: string
          message?: string | null
          module_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_events_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "module_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_demo_requests: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          role: string
          source: string
          status: string
          team_size: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          role: string
          source?: string
          status?: string
          team_size: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          role?: string
          source?: string
          status?: string
          team_size?: string
          updated_at?: string
        }
        Relationships: []
      }
      luxe_veil_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          reference: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          reference?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          reference?: string | null
          status?: string
        }
        Relationships: []
      }
      marriage_inquiries: {
        Row: {
          country_code: string
          created_at: string
          dress_colors: string[]
          id: string
          name: string
          whatsapp: string
        }
        Insert: {
          country_code: string
          created_at?: string
          dress_colors?: string[]
          id?: string
          name: string
          whatsapp: string
        }
        Update: {
          country_code?: string
          created_at?: string
          dress_colors?: string[]
          id?: string
          name?: string
          whatsapp?: string
        }
        Relationships: []
      }
      module_enrollments: {
        Row: {
          amount_bdt: number
          bkash_payment_id: string | null
          bkash_trx_id: string | null
          created_at: string
          decided_at: string | null
          decided_via: string | null
          id: string
          module_index: number
          paid_at: string | null
          sender_phone: string | null
          status: string
          submission_note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_bdt?: number
          bkash_payment_id?: string | null
          bkash_trx_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_via?: string | null
          id?: string
          module_index: number
          paid_at?: string | null
          sender_phone?: string | null
          status?: string
          submission_note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_bdt?: number
          bkash_payment_id?: string | null
          bkash_trx_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_via?: string | null
          id?: string
          module_index?: number
          paid_at?: string | null
          sender_phone?: string | null
          status?: string
          submission_note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      press_items: {
        Row: {
          context: string
          created_at: string
          headline: string
          href: string
          id: string
          outlet: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          context?: string
          created_at?: string
          headline: string
          href: string
          id?: string
          outlet: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          context?: string
          created_at?: string
          headline?: string
          href?: string
          id?: string
          outlet?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
