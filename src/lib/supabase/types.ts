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
          complemento_sucesso: string | null
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
          pdf_url: string | null
          quem_preencheu: string | null
          respostas_json: Json | null
          top_3_oportunidades_json: Json | null
        }
        Insert: {
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          complemento_sucesso?: string | null
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
          pdf_url?: string | null
          quem_preencheu?: string | null
          respostas_json?: Json | null
          top_3_oportunidades_json?: Json | null
        }
        Update: {
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          complemento_sucesso?: string | null
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
          pdf_url?: string | null
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
          {
            foreignKeyName: 'diagnosticos_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'vw_diagnosticos_completos'
            referencedColumns: ['empresa_id']
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          data_criacao: string
          email_admin: string | null
          id: string
          nome: string | null
          responsavel_email: string | null
          responsavel_nome: string | null
        }
        Insert: {
          cnpj: string
          data_criacao?: string
          email_admin?: string | null
          id?: string
          nome?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
        }
        Update: {
          cnpj?: string
          data_criacao?: string
          email_admin?: string | null
          id?: string
          nome?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
        }
        Relationships: []
      }
      relatorio_diagnosticos_completos: {
        Row: {
          atualizado_em: string | null
          classificacao_a: string | null
          classificacao_au: string | null
          classificacao_s: string | null
          cnpj: string | null
          data_preenchimento: string | null
          diagnostico_id: string
          email_admin: string | null
          empresa_id: string | null
          nome_empresa: string | null
          nota_a: number | null
          nota_au: number | null
          nota_geral: number | null
          nota_s: number | null
          nota_t: number | null
          pdf_url: string | null
          quem_preencheu: string | null
          responsavel_email: string | null
          responsavel_nome: string | null
          resposta_a1: number | null
          resposta_a2: number | null
          resposta_a3: number | null
          resposta_a4: number | null
          resposta_a5: number | null
          resposta_aberta_a6: string | null
          resposta_aberta_au6: string | null
          resposta_aberta_s6: string | null
          resposta_aberta_t4: string | null
          resposta_au1: number | null
          resposta_au2: number | null
          resposta_au3: number | null
          resposta_au4: number | null
          resposta_au5: number | null
          resposta_plano_sucesso: string | null
          resposta_s1: number | null
          resposta_s2: number | null
          resposta_s3: number | null
          resposta_s4: number | null
          resposta_s5: number | null
          resposta_t1: number | null
          resposta_t2: number | null
          resposta_t3: number | null
        }
        Insert: {
          atualizado_em?: string | null
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          cnpj?: string | null
          data_preenchimento?: string | null
          diagnostico_id: string
          email_admin?: string | null
          empresa_id?: string | null
          nome_empresa?: string | null
          nota_a?: number | null
          nota_au?: number | null
          nota_geral?: number | null
          nota_s?: number | null
          nota_t?: number | null
          pdf_url?: string | null
          quem_preencheu?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
          resposta_a1?: number | null
          resposta_a2?: number | null
          resposta_a3?: number | null
          resposta_a4?: number | null
          resposta_a5?: number | null
          resposta_aberta_a6?: string | null
          resposta_aberta_au6?: string | null
          resposta_aberta_s6?: string | null
          resposta_aberta_t4?: string | null
          resposta_au1?: number | null
          resposta_au2?: number | null
          resposta_au3?: number | null
          resposta_au4?: number | null
          resposta_au5?: number | null
          resposta_plano_sucesso?: string | null
          resposta_s1?: number | null
          resposta_s2?: number | null
          resposta_s3?: number | null
          resposta_s4?: number | null
          resposta_s5?: number | null
          resposta_t1?: number | null
          resposta_t2?: number | null
          resposta_t3?: number | null
        }
        Update: {
          atualizado_em?: string | null
          classificacao_a?: string | null
          classificacao_au?: string | null
          classificacao_s?: string | null
          cnpj?: string | null
          data_preenchimento?: string | null
          diagnostico_id?: string
          email_admin?: string | null
          empresa_id?: string | null
          nome_empresa?: string | null
          nota_a?: number | null
          nota_au?: number | null
          nota_geral?: number | null
          nota_s?: number | null
          nota_t?: number | null
          pdf_url?: string | null
          quem_preencheu?: string | null
          responsavel_email?: string | null
          responsavel_nome?: string | null
          resposta_a1?: number | null
          resposta_a2?: number | null
          resposta_a3?: number | null
          resposta_a4?: number | null
          resposta_a5?: number | null
          resposta_aberta_a6?: string | null
          resposta_aberta_au6?: string | null
          resposta_aberta_s6?: string | null
          resposta_aberta_t4?: string | null
          resposta_au1?: number | null
          resposta_au2?: number | null
          resposta_au3?: number | null
          resposta_au4?: number | null
          resposta_au5?: number | null
          resposta_plano_sucesso?: string | null
          resposta_s1?: number | null
          resposta_s2?: number | null
          resposta_s3?: number | null
          resposta_s4?: number | null
          resposta_s5?: number | null
          resposta_t1?: number | null
          resposta_t2?: number | null
          resposta_t3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'relatorio_diagnosticos_completos_diagnostico_id_fkey'
            columns: ['diagnostico_id']
            isOneToOne: true
            referencedRelation: 'diagnosticos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'relatorio_diagnosticos_completos_diagnostico_id_fkey'
            columns: ['diagnostico_id']
            isOneToOne: true
            referencedRelation: 'vw_diagnosticos_completos'
            referencedColumns: ['diagnostico_id']
          },
        ]
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
          {
            foreignKeyName: 'respostas_abertas_diagnostico_id_fkey'
            columns: ['diagnostico_id']
            isOneToOne: false
            referencedRelation: 'vw_diagnosticos_completos'
            referencedColumns: ['diagnostico_id']
          },
        ]
      }
    }
    Views: {
      vw_diagnosticos_completos: {
        Row: {
          classificacao_a: string | null
          classificacao_au: string | null
          classificacao_s: string | null
          cnpj: string | null
          data_preenchimento: string | null
          diagnostico_id: string | null
          email_admin: string | null
          empresa_id: string | null
          nome_empresa: string | null
          nota_a: number | null
          nota_au: number | null
          nota_geral: number | null
          nota_s: number | null
          nota_t: number | null
          pdf_url: string | null
          quem_preencheu: string | null
          responsavel_email: string | null
          responsavel_nome: string | null
          resposta_a1: number | null
          resposta_a2: number | null
          resposta_a3: number | null
          resposta_a4: number | null
          resposta_a5: number | null
          resposta_aberta_a6: string | null
          resposta_aberta_au6: string | null
          resposta_aberta_s6: string | null
          resposta_aberta_t4: string | null
          resposta_au1: number | null
          resposta_au2: number | null
          resposta_au3: number | null
          resposta_au4: number | null
          resposta_au5: number | null
          resposta_plano_sucesso: string | null
          resposta_s1: number | null
          resposta_s2: number | null
          resposta_s3: number | null
          resposta_s4: number | null
          resposta_s5: number | null
          resposta_t1: number | null
          resposta_t2: number | null
          resposta_t3: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      sync_relatorio_diagnostico: {
        Args: { p_diagnostico_id: string }
        Returns: undefined
      }
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
//   pdf_url: text (nullable)
//   complemento_sucesso: text (nullable)
// Table: empresas
//   id: uuid (not null, default: gen_random_uuid())
//   cnpj: text (not null)
//   email_admin: text (nullable)
//   responsavel_nome: text (nullable)
//   responsavel_email: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   nome: text (nullable)
// Table: relatorio_diagnosticos_completos
//   diagnostico_id: uuid (not null)
//   data_preenchimento: timestamp with time zone (nullable)
//   empresa_id: uuid (nullable)
//   nome_empresa: text (nullable)
//   cnpj: text (nullable)
//   email_admin: text (nullable)
//   responsavel_nome: text (nullable)
//   responsavel_email: text (nullable)
//   quem_preencheu: text (nullable)
//   resposta_a1: integer (nullable)
//   resposta_a2: integer (nullable)
//   resposta_a3: integer (nullable)
//   resposta_a4: integer (nullable)
//   resposta_a5: integer (nullable)
//   resposta_aberta_a6: text (nullable)
//   nota_a: numeric (nullable)
//   classificacao_a: text (nullable)
//   resposta_s1: integer (nullable)
//   resposta_s2: integer (nullable)
//   resposta_s3: integer (nullable)
//   resposta_s4: integer (nullable)
//   resposta_s5: integer (nullable)
//   resposta_aberta_s6: text (nullable)
//   nota_s: numeric (nullable)
//   classificacao_s: text (nullable)
//   resposta_au1: integer (nullable)
//   resposta_au2: integer (nullable)
//   resposta_au3: integer (nullable)
//   resposta_au4: integer (nullable)
//   resposta_au5: integer (nullable)
//   resposta_aberta_au6: text (nullable)
//   nota_au: numeric (nullable)
//   classificacao_au: text (nullable)
//   resposta_t1: integer (nullable)
//   resposta_t2: integer (nullable)
//   resposta_t3: integer (nullable)
//   resposta_aberta_t4: text (nullable)
//   nota_t: numeric (nullable)
//   nota_geral: numeric (nullable)
//   resposta_plano_sucesso: text (nullable)
//   pdf_url: text (nullable)
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: respostas_abertas
//   id: uuid (not null, default: gen_random_uuid())
//   diagnostico_id: uuid (not null)
//   tipo_bloco: text (not null)
//   numero_pergunta: integer (not null)
//   resposta: text (not null)
// Table: vw_diagnosticos_completos
//   diagnostico_id: uuid (nullable)
//   data_preenchimento: timestamp with time zone (nullable)
//   empresa_id: uuid (nullable)
//   nome_empresa: text (nullable)
//   cnpj: text (nullable)
//   email_admin: text (nullable)
//   responsavel_nome: text (nullable)
//   responsavel_email: text (nullable)
//   quem_preencheu: text (nullable)
//   resposta_a1: integer (nullable)
//   resposta_a2: integer (nullable)
//   resposta_a3: integer (nullable)
//   resposta_a4: integer (nullable)
//   resposta_a5: integer (nullable)
//   resposta_aberta_a6: text (nullable)
//   nota_a: numeric (nullable)
//   classificacao_a: text (nullable)
//   resposta_s1: integer (nullable)
//   resposta_s2: integer (nullable)
//   resposta_s3: integer (nullable)
//   resposta_s4: integer (nullable)
//   resposta_s5: integer (nullable)
//   resposta_aberta_s6: text (nullable)
//   nota_s: numeric (nullable)
//   classificacao_s: text (nullable)
//   resposta_au1: integer (nullable)
//   resposta_au2: integer (nullable)
//   resposta_au3: integer (nullable)
//   resposta_au4: integer (nullable)
//   resposta_au5: integer (nullable)
//   resposta_aberta_au6: text (nullable)
//   nota_au: numeric (nullable)
//   classificacao_au: text (nullable)
//   resposta_t1: integer (nullable)
//   resposta_t2: integer (nullable)
//   resposta_t3: integer (nullable)
//   resposta_aberta_t4: text (nullable)
//   nota_t: numeric (nullable)
//   nota_geral: numeric (nullable)
//   resposta_plano_sucesso: text (nullable)
//   pdf_url: text (nullable)

// --- CONSTRAINTS ---
// Table: diagnosticos
//   FOREIGN KEY diagnosticos_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   PRIMARY KEY diagnosticos_pkey: PRIMARY KEY (id)
// Table: empresas
//   PRIMARY KEY empresas_pkey: PRIMARY KEY (id)
// Table: relatorio_diagnosticos_completos
//   FOREIGN KEY relatorio_diagnosticos_completos_diagnostico_id_fkey: FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id) ON DELETE CASCADE
//   PRIMARY KEY relatorio_diagnosticos_completos_pkey: PRIMARY KEY (diagnostico_id)
// Table: respostas_abertas
//   FOREIGN KEY respostas_abertas_diagnostico_id_fkey: FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id) ON DELETE CASCADE
//   PRIMARY KEY respostas_abertas_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: diagnosticos
//   Policy "Allow public inserts on diagnosticos" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on diagnosticos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Allow public updates on diagnosticos" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: empresas
//   Policy "Allow public inserts on empresas" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on empresas" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Allow public updates on empresas" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: relatorio_diagnosticos_completos
//   Policy "Allow public selects on relatorio_diagnosticos_completos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: respostas_abertas
//   Policy "Allow public inserts on respostas_abertas" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow public selects on respostas_abertas" (SELECT, PERMISSIVE) roles={public}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION sync_relatorio_diagnostico(uuid)
//   CREATE OR REPLACE FUNCTION public.sync_relatorio_diagnostico(p_diagnostico_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.relatorio_diagnosticos_completos (
//           diagnostico_id, data_preenchimento, empresa_id, nome_empresa, cnpj, email_admin, responsavel_nome, responsavel_email, quem_preencheu,
//           resposta_a1, resposta_a2, resposta_a3, resposta_a4, resposta_a5, resposta_aberta_a6, nota_a, classificacao_a,
//           resposta_s1, resposta_s2, resposta_s3, resposta_s4, resposta_s5, resposta_aberta_s6, nota_s, classificacao_s,
//           resposta_au1, resposta_au2, resposta_au3, resposta_au4, resposta_au5, resposta_aberta_au6, nota_au, classificacao_au,
//           resposta_t1, resposta_t2, resposta_t3, resposta_aberta_t4, nota_t,
//           nota_geral, resposta_plano_sucesso, pdf_url
//       )
//       SELECT
//           v.diagnostico_id, v.data_preenchimento, v.empresa_id, v.nome_empresa, v.cnpj, v.email_admin, v.responsavel_nome, v.responsavel_email, v.quem_preencheu,
//           v.resposta_a1, v.resposta_a2, v.resposta_a3, v.resposta_a4, v.resposta_a5, v.resposta_aberta_a6, v.nota_a, v.classificacao_a,
//           v.resposta_s1, v.resposta_s2, v.resposta_s3, v.resposta_s4, v.resposta_s5, v.resposta_aberta_s6, v.nota_s, v.classificacao_s,
//           v.resposta_au1, v.resposta_au2, v.resposta_au3, v.resposta_au4, v.resposta_au5, v.resposta_aberta_au6, v.nota_au, v.classificacao_au,
//           v.resposta_t1, v.resposta_t2, v.resposta_t3, v.resposta_aberta_t4, v.nota_t,
//           v.nota_geral,
//           -- Puxa diretamente da tabela de diagnósticos para garantir integridade do dado recém-salvo
//           COALESCE(d.complemento_sucesso, v.resposta_plano_sucesso),
//           COALESCE(d.pdf_url, v.pdf_url)
//       FROM public.vw_diagnosticos_completos v
//       JOIN public.diagnosticos d ON d.id = v.diagnostico_id
//       WHERE v.diagnostico_id = p_diagnostico_id
//       ON CONFLICT (diagnostico_id)
//       DO UPDATE SET
//           data_preenchimento = EXCLUDED.data_preenchimento,
//           empresa_id = EXCLUDED.empresa_id,
//           nome_empresa = EXCLUDED.nome_empresa,
//           cnpj = EXCLUDED.cnpj,
//           email_admin = EXCLUDED.email_admin,
//           responsavel_nome = EXCLUDED.responsavel_nome,
//           responsavel_email = EXCLUDED.responsavel_email,
//           quem_preencheu = EXCLUDED.quem_preencheu,
//           resposta_a1 = EXCLUDED.resposta_a1,
//           resposta_a2 = EXCLUDED.resposta_a2,
//           resposta_a3 = EXCLUDED.resposta_a3,
//           resposta_a4 = EXCLUDED.resposta_a4,
//           resposta_a5 = EXCLUDED.resposta_a5,
//           resposta_aberta_a6 = EXCLUDED.resposta_aberta_a6,
//           nota_a = EXCLUDED.nota_a,
//           classificacao_a = EXCLUDED.classificacao_a,
//           resposta_s1 = EXCLUDED.resposta_s1,
//           resposta_s2 = EXCLUDED.resposta_s2,
//           resposta_s3 = EXCLUDED.resposta_s3,
//           resposta_s4 = EXCLUDED.resposta_s4,
//           resposta_s5 = EXCLUDED.resposta_s5,
//           resposta_aberta_s6 = EXCLUDED.resposta_aberta_s6,
//           nota_s = EXCLUDED.nota_s,
//           classificacao_s = EXCLUDED.classificacao_s,
//           resposta_au1 = EXCLUDED.resposta_au1,
//           resposta_au2 = EXCLUDED.resposta_au2,
//           resposta_au3 = EXCLUDED.resposta_au3,
//           resposta_au4 = EXCLUDED.resposta_au4,
//           resposta_au5 = EXCLUDED.resposta_au5,
//           resposta_aberta_au6 = EXCLUDED.resposta_aberta_au6,
//           nota_au = EXCLUDED.nota_au,
//           classificacao_au = EXCLUDED.classificacao_au,
//           resposta_t1 = EXCLUDED.resposta_t1,
//           resposta_t2 = EXCLUDED.resposta_t2,
//           resposta_t3 = EXCLUDED.resposta_t3,
//           resposta_aberta_t4 = EXCLUDED.resposta_aberta_t4,
//           nota_t = EXCLUDED.nota_t,
//           nota_geral = EXCLUDED.nota_geral,
//           resposta_plano_sucesso = EXCLUDED.resposta_plano_sucesso,
//           pdf_url = EXCLUDED.pdf_url,
//           atualizado_em = NOW();
//   END;
//   $function$
//
// FUNCTION trg_sync_relatorio_diagnosticos()
//   CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_diagnosticos()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF TG_OP = 'DELETE' THEN
//           DELETE FROM public.relatorio_diagnosticos_completos WHERE diagnostico_id = OLD.id;
//           RETURN OLD;
//       END IF;
//
//       PERFORM public.sync_relatorio_diagnostico(NEW.id);
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trg_sync_relatorio_empresas()
//   CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_empresas()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       d_id UUID;
//   BEGIN
//       FOR d_id IN SELECT id FROM public.diagnosticos WHERE empresa_id = NEW.id
//       LOOP
//           PERFORM public.sync_relatorio_diagnostico(d_id);
//       END LOOP;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trg_sync_relatorio_respostas()
//   CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_respostas()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF TG_OP = 'DELETE' THEN
//           PERFORM public.sync_relatorio_diagnostico(OLD.diagnostico_id);
//           RETURN OLD;
//       END IF;
//
//       PERFORM public.sync_relatorio_diagnostico(NEW.diagnostico_id);
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_sync_diagnosticos()
//   CREATE OR REPLACE FUNCTION public.trigger_sync_diagnosticos()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     PERFORM
//       net.http_post(
//         url := 'https://gebqrwjlwkskntfqykub.supabase.co/functions/v1/sync-diagnosticos-to-sheets',
//         headers := jsonb_build_object(
//           'Content-Type', 'application/json',
//           'Authorization', 'Bearer ' || current_setting('app.jwt_token')
//         ),
//         body := jsonb_build_object(
//           'diagnostico_id', NEW.diagnostico_id,
//           'data_preenchimento', NEW.data_preenchimento,
//           'empresa_id', NEW.empresa_id,
//           'nome_empresa', NEW.nome_empresa,
//           'cnpj', NEW.cnpj,
//           'email_admin', NEW.email_admin,
//           'responsavel_nome', NEW.responsavel_nome,
//           'responsavel_email', NEW.responsavel_email,
//           'quem_preencheu', NEW.quem_preencheu,
//           'resposta_a1', NEW.resposta_a1,
//           'resposta_a2', NEW.resposta_a2,
//           'resposta_a3', NEW.resposta_a3,
//           'resposta_a4', NEW.resposta_a4,
//           'resposta_a5', NEW.resposta_a5,
//           'resposta_aberta_a6', NEW.resposta_aberta_a6,
//           'nota_a', NEW.nota_a,
//           'classificacao_a', NEW.classificacao_a,
//           'resposta_s1', NEW.resposta_s1,
//           'resposta_s2', NEW.resposta_s2,
//           'resposta_s3', NEW.resposta_s3,
//           'resposta_s4', NEW.resposta_s4,
//           'resposta_s5', NEW.resposta_s5,
//           'resposta_aberta_s6', NEW.resposta_aberta_s6,
//           'nota_s', NEW.nota_s,
//           'classificacao_s', NEW.classificacao_s,
//           'resposta_au1', NEW.resposta_au1,
//           'resposta_au2', NEW.resposta_au2,
//           'resposta_au3', NEW.resposta_au3,
//           'resposta_au4', NEW.resposta_au4,
//           'resposta_au5', NEW.resposta_au5,
//           'resposta_aberta_au6', NEW.resposta_aberta_au6,
//           'nota_au', NEW.nota_au,
//           'classificacao_au', NEW.classificacao_au,
//           'resposta_t1', NEW.resposta_t1,
//           'resposta_t2', NEW.resposta_t2,
//           'resposta_t3', NEW.resposta_t3,
//           'resposta_aberta_t4', NEW.resposta_aberta_t4,
//           'nota_t', NEW.nota_t,
//           'nota_geral', NEW.nota_geral,
//           'resposta_plano_sucesso', NEW.resposta_plano_sucesso,
//           'pdf_url', NEW.pdf_url,
//           'atualizado_em', NEW.atualizado_em
//         )
//       );
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: diagnosticos
//   on_diagnostico_change: CREATE TRIGGER on_diagnostico_change AFTER INSERT OR UPDATE ON public.diagnosticos FOR EACH ROW EXECUTE FUNCTION trg_sync_relatorio_diagnosticos()
// Table: empresas
//   on_empresas_change: CREATE TRIGGER on_empresas_change AFTER UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION trg_sync_relatorio_empresas()
// Table: relatorio_diagnosticos_completos
//   sync_diagnosticos_trigger: CREATE TRIGGER sync_diagnosticos_trigger AFTER INSERT ON public.relatorio_diagnosticos_completos FOR EACH ROW EXECUTE FUNCTION trigger_sync_diagnosticos()
// Table: respostas_abertas
//   on_respostas_change: CREATE TRIGGER on_respostas_change AFTER INSERT OR DELETE OR UPDATE ON public.respostas_abertas FOR EACH ROW EXECUTE FUNCTION trg_sync_relatorio_respostas()

// --- INDEXES ---
// Table: diagnosticos
//   CREATE INDEX idx_diagnosticos_empresa_id ON public.diagnosticos USING btree (empresa_id)
// Table: respostas_abertas
//   CREATE INDEX idx_respostas_abertas_diagnostico_id ON public.respostas_abertas USING btree (diagnostico_id)
