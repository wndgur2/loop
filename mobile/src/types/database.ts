export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_content_reports: {
        Row: {
          created_at: string;
          id: string;
          message_content: string;
          reason: string | null;
          session_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message_content: string;
          reason?: string | null;
          session_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_content?: string;
          reason?: string | null;
          session_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_content_reports_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'chat_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_content_reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          role: Database['public']['Enums']['message_role'];
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          role: Database['public']['Enums']['message_role'];
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['message_role'];
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'chat_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          mode: Database['public']['Enums']['session_mode'];
          status: Database['public']['Enums']['session_status'];
          sub_goal_id: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          mode: Database['public']['Enums']['session_mode'];
          status?: Database['public']['Enums']['session_status'];
          sub_goal_id?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          mode?: Database['public']['Enums']['session_mode'];
          status?: Database['public']['Enums']['session_status'];
          sub_goal_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_sessions_sub_goal_id_fkey';
            columns: ['sub_goal_id'];
            isOneToOne: false;
            referencedRelation: 'sub_goals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedbacks: {
        Row: {
          created_at: string;
          id: string;
          importance: Database['public']['Enums']['importance'];
          internalized: boolean;
          internalized_at: string | null;
          root_cause: string;
          session_id: string | null;
          situation: string;
          sub_goal_id: string;
          tags: string[];
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          importance?: Database['public']['Enums']['importance'];
          internalized?: boolean;
          internalized_at?: string | null;
          root_cause: string;
          session_id?: string | null;
          situation: string;
          sub_goal_id: string;
          tags?: string[];
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          importance?: Database['public']['Enums']['importance'];
          internalized?: boolean;
          internalized_at?: string | null;
          root_cause?: string;
          session_id?: string | null;
          situation?: string;
          sub_goal_id?: string;
          tags?: string[];
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedbacks_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'chat_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedbacks_sub_goal_id_fkey';
            columns: ['sub_goal_id'];
            isOneToOne: false;
            referencedRelation: 'sub_goals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedbacks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'goals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          is_premium: boolean;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          is_premium?: boolean;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_premium?: boolean;
        };
        Relationships: [];
      };
      sub_goals: {
        Row: {
          created_at: string;
          goal_id: string;
          id: string;
          name: string;
          sort_order: number;
          source: Database['public']['Enums']['sub_goal_source'];
        };
        Insert: {
          created_at?: string;
          goal_id: string;
          id?: string;
          name: string;
          sort_order?: number;
          source?: Database['public']['Enums']['sub_goal_source'];
        };
        Update: {
          created_at?: string;
          goal_id?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          source?: Database['public']['Enums']['sub_goal_source'];
        };
        Relationships: [
          {
            foreignKeyName: 'sub_goals_goal_id_fkey';
            columns: ['goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          id: string;
          last_event_id: string | null;
          plan: Database['public']['Enums']['subscription_plan'];
          rc_app_user_id: string | null;
          rc_entitlement: string | null;
          rc_product_id: string | null;
          status: Database['public']['Enums']['subscription_status'];
          updated_at: string;
          user_id: string;
          will_renew: boolean;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          last_event_id?: string | null;
          plan?: Database['public']['Enums']['subscription_plan'];
          rc_app_user_id?: string | null;
          rc_entitlement?: string | null;
          rc_product_id?: string | null;
          status?: Database['public']['Enums']['subscription_status'];
          updated_at?: string;
          user_id: string;
          will_renew?: boolean;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          last_event_id?: string | null;
          plan?: Database['public']['Enums']['subscription_plan'];
          rc_app_user_id?: string | null;
          rc_entitlement?: string | null;
          rc_product_id?: string | null;
          status?: Database['public']['Enums']['subscription_status'];
          updated_at?: string;
          user_id?: string;
          will_renew?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      takeaways: {
        Row: {
          created_at: string;
          done: boolean;
          done_at: string | null;
          feedback_id: string;
          id: string;
          sort_order: number;
          text: string;
        };
        Insert: {
          created_at?: string;
          done?: boolean;
          done_at?: string | null;
          feedback_id: string;
          id?: string;
          sort_order?: number;
          text: string;
        };
        Update: {
          created_at?: string;
          done?: boolean;
          done_at?: string | null;
          feedback_id?: string;
          id?: string;
          sort_order?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'takeaways_feedback_id_fkey';
            columns: ['feedback_id'];
            isOneToOne: false;
            referencedRelation: 'feedbacks';
            referencedColumns: ['id'];
          },
        ];
      };
      usage_counters: {
        Row: {
          created_at: string;
          id: string;
          loopie_turns: number;
          period_start: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          loopie_turns?: number;
          period_start: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          loopie_turns?: number;
          period_start?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'usage_counters_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      importance: 'high' | 'mid' | 'low';
      message_role: 'user' | 'assistant';
      session_mode: 'write' | 'retrospective';
      session_status: 'active' | 'completed' | 'abandoned';
      sub_goal_source: 'ai_suggested' | 'user_added';
      subscription_plan: 'free' | 'pro';
      subscription_status: 'active' | 'in_grace' | 'expired' | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      importance: ['high', 'mid', 'low'],
      message_role: ['user', 'assistant'],
      session_mode: ['write', 'retrospective'],
      session_status: ['active', 'completed', 'abandoned'],
      sub_goal_source: ['ai_suggested', 'user_added'],
      subscription_plan: ['free', 'pro'],
      subscription_status: ['active', 'in_grace', 'expired', 'cancelled'],
    },
  },
} as const;
