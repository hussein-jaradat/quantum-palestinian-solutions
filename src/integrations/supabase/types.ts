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
      ai_analysis_cache: {
        Row: {
          analysis_result: Json
          analysis_type: string
          created_at: string
          expires_at: string
          governorate_id: string
          id: string
        }
        Insert: {
          analysis_result: Json
          analysis_type: string
          created_at?: string
          expires_at: string
          governorate_id: string
          id?: string
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          created_at?: string
          expires_at?: string
          governorate_id?: string
          id?: string
        }
        Relationships: []
      }
      climate_patterns: {
        Row: {
          avg_precipitation: number | null
          avg_temperature: number | null
          created_at: string
          drought_risk: string | null
          flood_risk: string | null
          frost_frequency: number | null
          governorate_id: string
          id: string
          month: number
          pattern_type: string
          updated_at: string
        }
        Insert: {
          avg_precipitation?: number | null
          avg_temperature?: number | null
          created_at?: string
          drought_risk?: string | null
          flood_risk?: string | null
          frost_frequency?: number | null
          governorate_id: string
          id?: string
          month: number
          pattern_type: string
          updated_at?: string
        }
        Update: {
          avg_precipitation?: number | null
          avg_temperature?: number | null
          created_at?: string
          drought_risk?: string | null
          flood_risk?: string | null
          frost_frequency?: number | null
          governorate_id?: string
          id?: string
          month?: number
          pattern_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_sync_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          end_date: string | null
          error_message: string | null
          governorate_id: string | null
          id: string
          metadata: Json | null
          records_synced: number | null
          start_date: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          end_date?: string | null
          error_message?: string | null
          governorate_id?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          start_date?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          end_date?: string | null
          error_message?: string | null
          governorate_id?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          start_date?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      historical_weather_data: {
        Row: {
          created_at: string
          date: string
          governorate_id: string
          humidity: number | null
          id: string
          precipitation: number | null
          temperature_avg: number | null
          temperature_max: number | null
          temperature_min: number | null
          weather_code: number | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string
          date: string
          governorate_id: string
          humidity?: number | null
          id?: string
          precipitation?: number | null
          temperature_avg?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          weather_code?: number | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          governorate_id?: string
          humidity?: number | null
          id?: string
          precipitation?: number | null
          temperature_avg?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          weather_code?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      model_performance: {
        Row: {
          bias: number | null
          calculated_weight: number | null
          correlation: number | null
          created_at: string | null
          governorate_id: string | null
          id: string
          mae_precip: number | null
          mae_temp: number | null
          model_name: string
          period_end: string
          period_start: string
          rmse_precip: number | null
          rmse_temp: number | null
          sample_count: number | null
          skill_score: number | null
        }
        Insert: {
          bias?: number | null
          calculated_weight?: number | null
          correlation?: number | null
          created_at?: string | null
          governorate_id?: string | null
          id?: string
          mae_precip?: number | null
          mae_temp?: number | null
          model_name: string
          period_end: string
          period_start: string
          rmse_precip?: number | null
          rmse_temp?: number | null
          sample_count?: number | null
          skill_score?: number | null
        }
        Update: {
          bias?: number | null
          calculated_weight?: number | null
          correlation?: number | null
          created_at?: string | null
          governorate_id?: string | null
          id?: string
          mae_precip?: number | null
          mae_temp?: number | null
          model_name?: string
          period_end?: string
          period_start?: string
          rmse_precip?: number | null
          rmse_temp?: number | null
          sample_count?: number | null
          skill_score?: number | null
        }
        Relationships: []
      }
      prediction_validations: {
        Row: {
          abs_error_temp: number | null
          actual_humidity: number | null
          actual_precipitation: number | null
          actual_temp_avg: number | null
          actual_temp_max: number | null
          actual_temp_min: number | null
          actual_wind_speed: number | null
          error_precipitation: number | null
          error_temp_avg: number | null
          error_temp_max: number | null
          error_temp_min: number | null
          id: string
          prediction_id: string | null
          squared_error_temp: number | null
          validated_at: string | null
        }
        Insert: {
          abs_error_temp?: number | null
          actual_humidity?: number | null
          actual_precipitation?: number | null
          actual_temp_avg?: number | null
          actual_temp_max?: number | null
          actual_temp_min?: number | null
          actual_wind_speed?: number | null
          error_precipitation?: number | null
          error_temp_avg?: number | null
          error_temp_max?: number | null
          error_temp_min?: number | null
          id?: string
          prediction_id?: string | null
          squared_error_temp?: number | null
          validated_at?: string | null
        }
        Update: {
          abs_error_temp?: number | null
          actual_humidity?: number | null
          actual_precipitation?: number | null
          actual_temp_avg?: number | null
          actual_temp_max?: number | null
          actual_temp_min?: number | null
          actual_wind_speed?: number | null
          error_precipitation?: number | null
          error_temp_avg?: number | null
          error_temp_max?: number | null
          error_temp_min?: number | null
          id?: string
          prediction_id?: string | null
          squared_error_temp?: number | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_validations_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "weather_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_jobs: {
        Row: {
          algorithm: string
          backend: string | null
          circuit_qasm: string | null
          circuit_type: string
          completed_at: string | null
          created_at: string | null
          execution_time_ms: number | null
          ibm_job_id: string | null
          id: string
          input_params: Json | null
          queue_position: number | null
          result: Json | null
          shots: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          algorithm: string
          backend?: string | null
          circuit_qasm?: string | null
          circuit_type: string
          completed_at?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          ibm_job_id?: string | null
          id?: string
          input_params?: Json | null
          queue_position?: number | null
          result?: Json | null
          shots?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          algorithm?: string
          backend?: string | null
          circuit_qasm?: string | null
          circuit_type?: string
          completed_at?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          ibm_job_id?: string | null
          id?: string
          input_params?: Json | null
          queue_position?: number | null
          result?: Json | null
          shots?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      weather_predictions: {
        Row: {
          confidence: number | null
          created_at: string | null
          governorate_id: string
          humidity: number | null
          id: string
          model_name: string
          model_weights: Json | null
          precipitation: number | null
          prediction_date: string
          raw_data: Json | null
          target_date: string
          target_hour: number | null
          temp_avg: number | null
          temp_max: number | null
          temp_min: number | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          governorate_id: string
          humidity?: number | null
          id?: string
          model_name: string
          model_weights?: Json | null
          precipitation?: number | null
          prediction_date: string
          raw_data?: Json | null
          target_date: string
          target_hour?: number | null
          temp_avg?: number | null
          temp_max?: number | null
          temp_min?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          governorate_id?: string
          humidity?: number | null
          id?: string
          model_name?: string
          model_weights?: Json | null
          precipitation?: number | null
          prediction_date?: string
          raw_data?: Json | null
          target_date?: string
          target_hour?: number | null
          temp_avg?: number | null
          temp_max?: number | null
          temp_min?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
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
