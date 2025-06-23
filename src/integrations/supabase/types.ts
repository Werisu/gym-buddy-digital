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
      exercises: {
        Row: {
          created_at: string | null
          execution_notes: string | null
          exercise_order: number | null
          id: string
          name: string
          reps: string
          rest_seconds: number | null
          sets: number
          video_url: string | null
          weight_kg: number | null
          workout_day_id: string
        }
        Insert: {
          created_at?: string | null
          execution_notes?: string | null
          exercise_order?: number | null
          id?: string
          name: string
          reps: string
          rest_seconds?: number | null
          sets: number
          video_url?: string | null
          weight_kg?: number | null
          workout_day_id: string
        }
        Update: {
          created_at?: string | null
          execution_notes?: string | null
          exercise_order?: number | null
          id?: string
          name?: string
          reps?: string
          rest_seconds?: number | null
          sets?: number
          video_url?: string | null
          weight_kg?: number | null
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          email: string | null
          experience_level: string | null
          goal: string | null
          height: number | null
          id: string
          name: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          goal?: string | null
          height?: number | null
          id: string
          name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      workout_days: {
        Row: {
          created_at: string | null
          day_name: string
          day_number: number
          id: string
          is_rest_day: boolean | null
          routine_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_name: string
          day_number: number
          id?: string
          is_rest_day?: boolean | null
          routine_id: string
          week_number?: number
        }
        Update: {
          created_at?: string | null
          day_name?: string
          day_number?: number
          id?: string
          is_rest_day?: boolean | null
          routine_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_feedback: {
        Row: {
          created_at: string | null
          fatigue_level: number | null
          id: string
          notes: string | null
          pain_level: number | null
          performance_rating: number | null
          user_id: string
          workout_history_id: string | null
        }
        Insert: {
          created_at?: string | null
          fatigue_level?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          performance_rating?: number | null
          user_id: string
          workout_history_id?: string | null
        }
        Update: {
          created_at?: string | null
          fatigue_level?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          performance_rating?: number | null
          user_id?: string
          workout_history_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_feedback_workout_history_id_fkey"
            columns: ["workout_history_id"]
            isOneToOne: false
            referencedRelation: "workout_history"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_history: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          exercises_completed: number | null
          id: string
          total_exercises: number | null
          user_id: string
          workout_date: string
          workout_name: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: number | null
          id?: string
          total_exercises?: number | null
          user_id: string
          workout_date: string
          workout_name: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: number | null
          id?: string
          total_exercises?: number | null
          user_id?: string
          workout_date?: string
          workout_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_routines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          total_weeks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          total_weeks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_weeks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
