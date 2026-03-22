// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      diagnosticos: {
        Row: {
          classificacao_a: string | null
          classificacao_au: string | null
          classificacao_s: string | null
          data_preenchimento: string
          empresa_id: string
          first_impact_json: Json | null
          id: string
          metricas_json: Json | null
          nota_a: number | null
          nota_au: number | null
          nota_geral: number | null
          nota_s: number | null
          nota_t: number | null
          quem_preencheu: string | null
          respostas_json: Json | null
          top_3_oportunidades_json: Json | null
        }
        Insert: {
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          data_preenchimento?: string
          empresa_id: string
          first_impact_json?: Json | null
          id?: string
          metricas_json?: Json | null
          nota_a?: number | null
          nota_au?: number | null
          nota_geral?: number | null
          nota_s?: number | null
          nota_t?: number | null
          quem_preencheu?: string | null
          respostas_json?: Json | null
          top_3_oportunidades_json?: Json | null
        }
        Update: {
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          data_preenchimento?: string
          empresa_id?: string
          first_impact_json?: Json | null
          id?: string
          metricas_json?: Json | null
          nota_a?: number | null
          nota_au?: number | null
          nota_geral?: number | null
          nota_s?: number | null
          nota_t?: number | null
          quem_preencheu?: string | null
          respostas_json?: Json | null
          top_3_oportunidades_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'diagnosticos_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          data_criacao: string
          email_admin: string | null
          id: string
          responsavel_email: string | null
          responsavel_nome: string | null
        }
        Insert: {
          cnpj: string
          data_criacao?: string
          email_admin?: string | null
          id?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
        }
        Update: {
          cnpj?: string
          data_criacao?: string
          email_admin?: string | null
          id?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
        }
        Relationships: []
      }
      respostas_abertas: {
        Row: {
          diagnostico_id: string
          id: string
          numero_pergunta: number
          resposta: string
          tipo_bloco: string
        }
        Insert: {
          diagnostico_id: string
          id?: string
          numero_pergunta: number
          resposta: string
          tipo_bloco: string
        }
        Update: {
          diagnostico_id?: string
          id?: string
          numero_pergunta?: number
          resposta?: string
          tipo_bloco?: string
        }
        Relationships: [
          {
            foreignKeyName: 'respostas_abertas_diagnostico_id_fkey'
            columns: ['diagnostico_id']
            isOneToOne: false
            referencedRelation: 'diagnosticos'
            referencedColumns: ['id']
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: diagnosticos
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (not null)
//   quem_preencheu: text (nullable)
//   respostas_json: jsonb (nullable)
//   nota_a: numeric (nullable)
//   nota_s: numeric (nullable)
//   nota_au: numeric (nullable)
//   nota_t: numeric (nullable)
//   nota_geral: numeric (nullable)
//   classificacao_a: text (nullable)
//   classificacao_s: text (nullable)
//   classificacao_au: text (nullable)
//   top_3_oportunidades_json: jsonb (nullable)
//   metricas_json: jsonb (nullable)
//   first_impact_json: jsonb (nullable)
//   data_preenchimento: timestamp with time zone (not null, default: now())
// Table: empresas
//   id: uuid (not null, default: gen_random_uuid())
//   cnpj: text (not null)
//   email_admin: text (nullable)
//   responsavel_nome: text (nullable)
//   responsavel_email: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: respostas_abertas
//   id: uuid (not null, default: gen_random_uuid())
//   diagnostico_id: uuid (not null)
//   tipo_bloco: text (not null)
//   numero_pergunta: integer (not null)
//   resposta: text (not null)

// --- CONSTRAINTS ---
// Table: diagnosticos
//   FOREIGN KEY diagnosticos_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   PRIMARY KEY diagnosticos_pkey: PRIMARY KEY (id)
// Table: empresas
//   PRIMARY KEY empresas_pkey: PRIMARY KEY (id)
// Table: respostas_abertas
//   FOREIGN KEY respostas_abertas_diagnostico_id_fkey: FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id) ON DELETE CASCADE
//   PRIMARY KEY respostas_abertas_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: diagnosticos
//   Policy "Allow public inserts on diagnosticos" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on diagnosticos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: empresas
//   Policy "Allow public inserts on empresas" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on empresas" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: respostas_abertas
//   Policy "Allow public inserts on respostas_abertas" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on respostas_abertas" (SELECT, PERMISSIVE) roles={public}
//     USING: true

// --- INDEXES ---
// Table: diagnosticos
//   CREATE INDEX idx_diagnosticos_empresa_id ON public.diagnosticos USING btree (empresa_id)
// Table: respostas_abertas
//   CREATE INDEX idx_respostas_abertas_diagnostico_id ON public.respostas_abertas USING btree (diagnostico_id)
