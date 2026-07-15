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
      access_audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip: string | null
          metadata: Json
          outcome: string
          reason: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          outcome: string
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          outcome?: string
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          method: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sender_number: string
          status: Database["public"]["Enums"]["booking_payment_status"]
          student_id: string
          trx_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number: string
          status?: Database["public"]["Enums"]["booking_payment_status"]
          student_id: string
          trx_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number?: string
          status?: Database["public"]["Enums"]["booking_payment_status"]
          student_id?: string
          trx_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "tutor_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          course_slug: string
          course_title: string
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          revoked: boolean
          student_name: string
          verification_id: string
        }
        Insert: {
          course_slug: string
          course_title: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          revoked?: boolean
          student_name: string
          verification_id: string
        }
        Update: {
          course_slug?: string
          course_title?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          revoked?: boolean
          student_name?: string
          verification_id?: string
        }
        Relationships: []
      }
      class_materials: {
        Row: {
          class_id: string
          created_at: string
          external_url: string | null
          id: string
          kind: string
          mime: string | null
          size_bytes: number | null
          sort_order: number
          storage_path: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          external_url?: string | null
          id?: string
          kind: string
          mime?: string | null
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          external_url?: string | null
          id?: string
          kind?: string
          mime?: string | null
          size_bytes?: number | null
          sort_order?: number
          storage_path?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      class_recordings: {
        Row: {
          attached_lesson_index: number | null
          attached_module_id: string | null
          class_id: string | null
          created_at: string
          description: string | null
          duration_sec: number | null
          id: string
          mime_type: string
          public_token: string | null
          recorded_at: string
          size_bytes: number | null
          storage_path: string
          teacher_id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          attached_lesson_index?: number | null
          attached_module_id?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          id?: string
          mime_type?: string
          public_token?: string | null
          recorded_at?: string
          size_bytes?: number | null
          storage_path: string
          teacher_id: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          attached_lesson_index?: number | null
          attached_module_id?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          id?: string
          mime_type?: string
          public_token?: string | null
          recorded_at?: string
          size_bytes?: number | null
          storage_path?: string
          teacher_id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_recordings_attached_module_id_fkey"
            columns: ["attached_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_recordings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_recordings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      client_errors: {
        Row: {
          created_at: string
          id: string
          message: string
          meta: Json | null
          release: string | null
          severity: string
          source: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          meta?: Json | null
          release?: string | null
          severity?: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          meta?: Json | null
          release?: string | null
          severity?: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      creator_content: {
        Row: {
          asset_url: string | null
          body: string | null
          channel: string
          content_type: string
          created_at: string
          id: string
          n8n_pushed: boolean
          n8n_response: Json | null
          owner_id: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          body?: string | null
          channel?: string
          content_type?: string
          created_at?: string
          id?: string
          n8n_pushed?: boolean
          n8n_response?: Json | null
          owner_id: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          body?: string | null
          channel?: string
          content_type?: string
          created_at?: string
          id?: string
          n8n_pushed?: boolean
          n8n_response?: Json | null
          owner_id?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
      growth_leads: {
        Row: {
          company: string | null
          created_at: string
          current_ad_spend: string | null
          email: string
          id: string
          ip: string | null
          last_contacted_at: string | null
          lifecycle_history: Json
          lifecycle_status: string
          message: string | null
          monthly_revenue: string | null
          n8n_forwarded: boolean
          n8n_response: Json | null
          n8n_run_id: string | null
          name: string
          next_followup_at: string | null
          outreach_channel: string | null
          owner_notes: string | null
          prospect_score: number
          sequence_name: string | null
          sequence_step: number
          services: string[]
          source: string
          stage: string
          updated_at: string
          user_agent: string | null
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          current_ad_spend?: string | null
          email: string
          id?: string
          ip?: string | null
          last_contacted_at?: string | null
          lifecycle_history?: Json
          lifecycle_status?: string
          message?: string | null
          monthly_revenue?: string | null
          n8n_forwarded?: boolean
          n8n_response?: Json | null
          n8n_run_id?: string | null
          name: string
          next_followup_at?: string | null
          outreach_channel?: string | null
          owner_notes?: string | null
          prospect_score?: number
          sequence_name?: string | null
          sequence_step?: number
          services?: string[]
          source?: string
          stage?: string
          updated_at?: string
          user_agent?: string | null
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          current_ad_spend?: string | null
          email?: string
          id?: string
          ip?: string | null
          last_contacted_at?: string | null
          lifecycle_history?: Json
          lifecycle_status?: string
          message?: string | null
          monthly_revenue?: string | null
          n8n_forwarded?: boolean
          n8n_response?: Json | null
          n8n_run_id?: string | null
          name?: string
          next_followup_at?: string | null
          outreach_channel?: string | null
          owner_notes?: string | null
          prospect_score?: number
          sequence_name?: string | null
          sequence_step?: number
          services?: string[]
          source?: string
          stage?: string
          updated_at?: string
          user_agent?: string | null
          website?: string | null
        }
        Relationships: []
      }
      live_class_rsvps: {
        Row: {
          class_id: string
          created_at: string
          id: string
          reminder_opt_in: boolean
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          reminder_opt_in?: boolean
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          reminder_opt_in?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_rsvps_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_class_rsvps_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          audience_mode: string
          calendar_event_id: string | null
          course_slug: string
          created_at: string
          created_by: string | null
          curriculum: Json | null
          curriculum_generated_at: string | null
          description: string | null
          duration_min: number
          first_started_at: string | null
          host_name: string
          id: string
          meeting_url: string | null
          share_token: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience_mode?: string
          calendar_event_id?: string | null
          course_slug: string
          created_at?: string
          created_by?: string | null
          curriculum?: Json | null
          curriculum_generated_at?: string | null
          description?: string | null
          duration_min?: number
          first_started_at?: string | null
          host_name?: string
          id?: string
          meeting_url?: string | null
          share_token?: string | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience_mode?: string
          calendar_event_id?: string | null
          course_slug?: string
          created_at?: string
          created_by?: string | null
          curriculum?: Json | null
          curriculum_generated_at?: string | null
          description?: string | null
          duration_min?: number
          first_started_at?: string | null
          host_name?: string
          id?: string
          meeting_url?: string | null
          share_token?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_state: {
        Row: {
          active_source_type: string
          class_id: string
          is_live_visible: boolean
          payload: Json
          updated_at: string
          updated_by: string | null
          whiteboard_snapshot: Json | null
        }
        Insert: {
          active_source_type?: string
          class_id: string
          is_live_visible?: boolean
          payload?: Json
          updated_at?: string
          updated_by?: string | null
          whiteboard_snapshot?: Json | null
        }
        Update: {
          active_source_type?: string
          class_id?: string
          is_live_visible?: boolean
          payload?: Json
          updated_at?: string
          updated_by?: string | null
          whiteboard_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "live_state_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_state_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "live_classes_public"
            referencedColumns: ["id"]
          },
        ]
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
      outreach_execution_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          failure_count: number
          function_name: string
          http_status: number | null
          id: string
          lead_id: string | null
          metadata: Json
          processed_count: number
          status: string
          success_count: number
          triggered_by: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          failure_count?: number
          function_name: string
          http_status?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          processed_count?: number
          status: string
          success_count?: number
          triggered_by?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          failure_count?: number
          function_name?: string
          http_status?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          processed_count?: number
          status?: string
          success_count?: number
          triggered_by?: string
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
      site_profile_data: {
        Row: {
          data: Json
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data: Json
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      strategy_bookings: {
        Row: {
          client_timezone: string | null
          company: string | null
          confirm_token: string
          confirmed_slot_iso: string | null
          created_at: string
          email: string
          gcal_event_id: string | null
          goal: string | null
          id: string
          ip: string | null
          meet_url: string | null
          name: string
          organizer_timezone: string
          phone: string | null
          reminder_15min_sent_at: string | null
          reminder_morning_sent_at: string | null
          requested_slot_iso: string
          session_type: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          client_timezone?: string | null
          company?: string | null
          confirm_token?: string
          confirmed_slot_iso?: string | null
          created_at?: string
          email: string
          gcal_event_id?: string | null
          goal?: string | null
          id?: string
          ip?: string | null
          meet_url?: string | null
          name: string
          organizer_timezone?: string
          phone?: string | null
          reminder_15min_sent_at?: string | null
          reminder_morning_sent_at?: string | null
          requested_slot_iso: string
          session_type: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          client_timezone?: string | null
          company?: string | null
          confirm_token?: string
          confirmed_slot_iso?: string | null
          created_at?: string
          email?: string
          gcal_event_id?: string | null
          goal?: string | null
          id?: string
          ip?: string | null
          meet_url?: string | null
          name?: string
          organizer_timezone?: string
          phone?: string | null
          reminder_15min_sent_at?: string | null
          reminder_morning_sent_at?: string | null
          requested_slot_iso?: string
          session_type?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      talent_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          experience_years: number | null
          id: string
          linkedin_url: string | null
          metadata: Json
          name: string
          phone: string | null
          portfolio_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          skills: string[]
          source: string
          status: Database["public"]["Enums"]["talent_application_status"]
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json
          name: string
          phone?: string | null
          portfolio_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: string
          skills?: string[]
          source?: string
          status?: Database["public"]["Enums"]["talent_application_status"]
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          skills?: string[]
          source?: string
          status?: Database["public"]["Enums"]["talent_application_status"]
          updated_at?: string
        }
        Relationships: []
      }
      teacher_notes: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          content?: string
          created_at?: string
          id?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          avg_rating: number | null
          bio: string | null
          calendar_connected_at: string | null
          created_at: string
          currency: string | null
          drive_folder_url: string | null
          expertise: string[] | null
          headline: string | null
          hourly_rate: number | null
          languages: string[] | null
          onboarded_at: string | null
          payout_method: string | null
          response_sla_minutes: number | null
          share_link_copied_at: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          bio?: string | null
          calendar_connected_at?: string | null
          created_at?: string
          currency?: string | null
          drive_folder_url?: string | null
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          languages?: string[] | null
          onboarded_at?: string | null
          payout_method?: string | null
          response_sla_minutes?: number | null
          share_link_copied_at?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          bio?: string | null
          calendar_connected_at?: string | null
          created_at?: string
          currency?: string | null
          drive_folder_url?: string | null
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          languages?: string[] | null
          onboarded_at?: string | null
          payout_method?: string | null
          response_sla_minutes?: number | null
          share_link_copied_at?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      telegram_error_logs: {
        Row: {
          api_method: string
          created_at: string
          error_code: string | null
          error_description: string | null
          function_name: string
          http_status: number | null
          id: string
          request_context: Json
          telegram_response: Json | null
        }
        Insert: {
          api_method: string
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          function_name: string
          http_status?: number | null
          id?: string
          request_context?: Json
          telegram_response?: Json | null
        }
        Update: {
          api_method?: string
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          function_name?: string
          http_status?: number | null
          id?: string
          request_context?: Json
          telegram_response?: Json | null
        }
        Relationships: []
      }
      telegram_support_sessions: {
        Row: {
          chat_id: number
          created_at: string
          issue: string | null
          name: string | null
          premium: boolean
          step: string
          updated_at: string
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          issue?: string | null
          name?: string | null
          premium?: boolean
          step?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          issue?: string | null
          name?: string | null
          premium?: boolean
          step?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      telegram_test_logs: {
        Row: {
          chat_id: string | null
          description: string | null
          id: string
          message_id: number | null
          mode: string
          ok: boolean
          sent_at: string
          status: number | null
          tester_user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          description?: string | null
          id?: string
          message_id?: number | null
          mode: string
          ok?: boolean
          sent_at?: string
          status?: number | null
          tester_user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          description?: string | null
          id?: string
          message_id?: number | null
          mode?: string
          ok?: boolean
          sent_at?: string
          status?: number | null
          tester_user_id?: string | null
        }
        Relationships: []
      }
      tutor_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          start_time: string
          timezone: string
          tutor_id: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          timezone?: string
          tutor_id: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          timezone?: string
          tutor_id?: string
          weekday?: number
        }
        Relationships: []
      }
      tutor_bookings: {
        Row: {
          created_at: string
          currency: string
          ends_at: string
          expires_at: string | null
          id: string
          livekit_room: string | null
          meeting_url: string | null
          notes: string | null
          price: number
          responded_at: string | null
          starts_at: string
          status: string
          student_id: string
          subject: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          ends_at: string
          expires_at?: string | null
          id?: string
          livekit_room?: string | null
          meeting_url?: string | null
          notes?: string | null
          price?: number
          responded_at?: string | null
          starts_at: string
          status?: string
          student_id: string
          subject: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          ends_at?: string
          expires_at?: string | null
          id?: string
          livekit_room?: string | null
          meeting_url?: string | null
          notes?: string | null
          price?: number
          responded_at?: string | null
          starts_at?: string
          status?: string
          student_id?: string
          subject?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_reviews: {
        Row: {
          body: string | null
          booking_id: string
          created_at: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Insert: {
          body?: string | null
          booking_id: string
          created_at?: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Update: {
          body?: string | null
          booking_id?: string
          created_at?: string
          rating?: number
          student_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "tutor_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      uptime_checks: {
        Row: {
          checked_at: string
          error: string | null
          id: string
          latency_ms: number | null
          ok: boolean
          status_code: number | null
          url: string
        }
        Insert: {
          checked_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          ok: boolean
          status_code?: number | null
          url: string
        }
        Update: {
          checked_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          ok?: boolean
          status_code?: number | null
          url?: string
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
      voice_assets: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          language_hint: string | null
          name: string
          sample_size_bytes: number | null
          updated_at: string
          user_id: string
          vps_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          language_hint?: string | null
          name: string
          sample_size_bytes?: number | null
          updated_at?: string
          user_id: string
          vps_path: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          language_hint?: string | null
          name?: string
          sample_size_bytes?: number | null
          updated_at?: string
          user_id?: string
          vps_path?: string
        }
        Relationships: []
      }
      voice_cache: {
        Row: {
          audio_path: string
          byte_size: number
          cache_key: string
          char_count: number
          created_at: string
          engine: string
          hit_count: number
          id: string
          last_used_at: string
          user_id: string
          voice_id: string
        }
        Insert: {
          audio_path: string
          byte_size?: number
          cache_key: string
          char_count?: number
          created_at?: string
          engine: string
          hit_count?: number
          id?: string
          last_used_at?: string
          user_id: string
          voice_id: string
        }
        Update: {
          audio_path?: string
          byte_size?: number
          cache_key?: string
          char_count?: number
          created_at?: string
          engine?: string
          hit_count?: number
          id?: string
          last_used_at?: string
          user_id?: string
          voice_id?: string
        }
        Relationships: []
      }
      voice_lecture_materials: {
        Row: {
          created_at: string
          flashcards: Json
          id: string
          key_concepts: Json
          lecture_id: string
          model: string | null
          quiz: Json
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcards?: Json
          id?: string
          key_concepts?: Json
          lecture_id: string
          model?: string | null
          quiz?: Json
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flashcards?: Json
          id?: string
          key_concepts?: Json
          lecture_id?: string
          model?: string | null
          quiz?: Json
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_lecture_materials_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: true
            referencedRelation: "voice_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_lectures: {
        Row: {
          audio_path: string | null
          created_at: string
          description: string | null
          duration_sec: number | null
          error_message: string | null
          id: string
          source: string
          status: string
          subject: string | null
          title: string
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          error_message?: string | null
          id?: string
          source?: string
          status?: string
          subject?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          error_message?: string | null
          id?: string
          source?: string
          status?: string
          subject?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          created_at: string
          elevenlabs_voice_id: string | null
          gender: string
          id: string
          language: string
          name: string
          pitch: number
          preview_text: string | null
          sample_filename: string | null
          sample_path: string | null
          similarity: number
          stability: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          gender?: string
          id?: string
          language?: string
          name: string
          pitch?: number
          preview_text?: string | null
          sample_filename?: string | null
          sample_path?: string | null
          similarity?: number
          stability?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          gender?: string
          id?: string
          language?: string
          name?: string
          pitch?: number
          preview_text?: string | null
          sample_filename?: string | null
          sample_path?: string | null
          similarity?: number
          stability?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      web_vitals: {
        Row: {
          created_at: string
          id: string
          metric: string
          navigation_type: string | null
          path: string | null
          rating: string | null
          release: string | null
          user_agent: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          navigation_type?: string | null
          path?: string | null
          rating?: string | null
          release?: string | null
          user_agent?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          navigation_type?: string | null
          path?: string | null
          rating?: string | null
          release?: string | null
          user_agent?: string | null
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      live_classes_public: {
        Row: {
          audience_mode: string | null
          course_slug: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_min: number | null
          host_name: string | null
          id: string | null
          starts_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          audience_mode?: string | null
          course_slug?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          host_name?: string | null
          id?: string | null
          starts_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          audience_mode?: string | null
          course_slug?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          host_name?: string | null
          id?: string | null
          starts_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_profiles_public: {
        Row: {
          avg_rating: number | null
          bio: string | null
          created_at: string | null
          currency: string | null
          expertise: string[] | null
          headline: string | null
          hourly_rate: number | null
          languages: string[] | null
          response_sla_minutes: number | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          languages?: string[] | null
          response_sla_minutes?: number | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          expertise?: string[] | null
          headline?: string | null
          hourly_rate?: number | null
          languages?: string[] | null
          response_sla_minutes?: number | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      tutor_reviews_public: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string | null
          rating: number | null
          tutor_id: string | null
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string | null
          rating?: number | null
          tutor_id?: string | null
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string | null
          rating?: number | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "tutor_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_list_live_classes: {
        Args: never
        Returns: {
          audience_mode: string
          calendar_event_id: string | null
          course_slug: string
          created_at: string
          created_by: string | null
          curriculum: Json | null
          curriculum_generated_at: string | null
          description: string | null
          duration_min: number
          first_started_at: string | null
          host_name: string
          id: string
          meeting_url: string | null
          share_token: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "live_classes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_audit_retention_days: { Args: never; Returns: number }
      get_class_by_share_token: {
        Args: { _token: string }
        Returns: {
          active_source_type: string
          description: string
          id: string
          is_live_visible: boolean
          payload: Json
          starts_at: string
          status: string
          title: string
          whiteboard_snapshot: Json
        }[]
      }
      get_live_class_meeting_url: {
        Args: { _class_id: string }
        Returns: string
      }
      get_recording_by_token: {
        Args: { _token: string }
        Returns: {
          description: string
          duration_sec: number
          id: string
          mime_type: string
          recorded_at: string
          storage_path: string
          title: string
        }[]
      }
      has_confirmed_enrollment: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      live_class_rsvp_count: { Args: { _class_id: string }; Returns: number }
      log_access_audit: {
        Args: {
          _action: string
          _metadata?: Json
          _outcome: string
          _reason?: string
          _resource_id: string
          _resource_type: string
        }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      preview_purge_access_audit_logs: {
        Args: { _days?: number }
        Returns: number
      }
      publish_recording_public: { Args: { _id: string }; Returns: string }
      purge_access_audit_logs: { Args: { _days?: number }; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      set_audit_retention_days: { Args: { _days: number }; Returns: number }
      student_cancel_booking: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      unpublish_recording_public: { Args: { _id: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "user"
        | "tutor"
        | "finance"
        | "teacher"
        | "student"
      booking_payment_status: "submitted" | "approved" | "rejected" | "refunded"
      talent_application_status:
        | "new"
        | "reviewing"
        | "shortlisted"
        | "rejected"
        | "hired"
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
      app_role: [
        "admin",
        "editor",
        "user",
        "tutor",
        "finance",
        "teacher",
        "student",
      ],
      booking_payment_status: ["submitted", "approved", "rejected", "refunded"],
      talent_application_status: [
        "new",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
      ],
    },
  },
} as const
