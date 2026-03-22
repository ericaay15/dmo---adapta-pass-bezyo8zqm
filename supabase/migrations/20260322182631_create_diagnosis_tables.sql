CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj TEXT NOT NULL,
    email_admin TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    quem_preencheu TEXT,
    respostas_json JSONB,
    nota_a NUMERIC,
    nota_s NUMERIC,
    nota_au NUMERIC,
    nota_t NUMERIC,
    nota_geral NUMERIC,
    classificacao_a TEXT,
    classificacao_s TEXT,
    classificacao_au TEXT,
    top_3_oportunidades_json JSONB,
    metricas_json JSONB,
    first_impact_json JSONB,
    data_preenchimento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.respostas_abertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostico_id UUID NOT NULL REFERENCES public.diagnosticos(id) ON DELETE CASCADE,
    tipo_bloco TEXT NOT NULL,
    numero_pergunta INT NOT NULL,
    resposta TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_empresa_id ON public.diagnosticos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_respostas_abertas_diagnostico_id ON public.respostas_abertas(diagnostico_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_abertas ENABLE ROW LEVEL SECURITY;

-- Allow inserts for anyone (since the form is public)
DROP POLICY IF EXISTS "Allow public inserts on empresas" ON public.empresas;
CREATE POLICY "Allow public inserts on empresas" ON public.empresas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public inserts on diagnosticos" ON public.diagnosticos;
CREATE POLICY "Allow public inserts on diagnosticos" ON public.diagnosticos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public inserts on respostas_abertas" ON public.respostas_abertas;
CREATE POLICY "Allow public inserts on respostas_abertas" ON public.respostas_abertas FOR INSERT WITH CHECK (true);

-- Allow selects for anyone (for summary/results page)
DROP POLICY IF EXISTS "Allow public selects on empresas" ON public.empresas;
CREATE POLICY "Allow public selects on empresas" ON public.empresas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public selects on diagnosticos" ON public.diagnosticos;
CREATE POLICY "Allow public selects on diagnosticos" ON public.diagnosticos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public selects on respostas_abertas" ON public.respostas_abertas;
CREATE POLICY "Allow public selects on respostas_abertas" ON public.respostas_abertas FOR SELECT USING (true);
