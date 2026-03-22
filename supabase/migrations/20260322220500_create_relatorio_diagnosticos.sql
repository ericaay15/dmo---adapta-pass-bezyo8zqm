-- 1. Create the physical table for the report
CREATE TABLE IF NOT EXISTS public.relatorio_diagnosticos_completos (
    diagnostico_id UUID PRIMARY KEY REFERENCES public.diagnosticos(id) ON DELETE CASCADE,
    data_preenchimento TIMESTAMPTZ,
    empresa_id UUID,
    nome_empresa TEXT,
    cnpj TEXT,
    email_admin TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    quem_preencheu TEXT,
    
    resposta_a1 INTEGER,
    resposta_a2 INTEGER,
    resposta_a3 INTEGER,
    resposta_a4 INTEGER,
    resposta_a5 INTEGER,
    resposta_aberta_a6 TEXT,
    nota_a NUMERIC,
    classificacao_a TEXT,

    resposta_s1 INTEGER,
    resposta_s2 INTEGER,
    resposta_s3 INTEGER,
    resposta_s4 INTEGER,
    resposta_s5 INTEGER,
    resposta_aberta_s6 TEXT,
    nota_s NUMERIC,
    classificacao_s TEXT,

    resposta_au1 INTEGER,
    resposta_au2 INTEGER,
    resposta_au3 INTEGER,
    resposta_au4 INTEGER,
    resposta_au5 INTEGER,
    resposta_aberta_au6 TEXT,
    nota_au NUMERIC,
    classificacao_au TEXT,

    resposta_t1 INTEGER,
    resposta_t2 INTEGER,
    resposta_t3 INTEGER,
    resposta_aberta_t4 TEXT,
    nota_t NUMERIC,

    nota_geral NUMERIC,
    resposta_plano_sucesso TEXT,
    pdf_url TEXT,
    
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS and add Policies
ALTER TABLE public.relatorio_diagnosticos_completos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public selects on relatorio_diagnosticos_completos" ON public.relatorio_diagnosticos_completos;
CREATE POLICY "Allow public selects on relatorio_diagnosticos_completos" ON public.relatorio_diagnosticos_completos FOR SELECT USING (true);

-- 3. Create Sync Function
CREATE OR REPLACE FUNCTION public.sync_relatorio_diagnostico(p_diagnostico_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.relatorio_diagnosticos_completos (
        diagnostico_id, data_preenchimento, empresa_id, nome_empresa, cnpj, email_admin, responsavel_nome, responsavel_email, quem_preencheu,
        resposta_a1, resposta_a2, resposta_a3, resposta_a4, resposta_a5, resposta_aberta_a6, nota_a, classificacao_a,
        resposta_s1, resposta_s2, resposta_s3, resposta_s4, resposta_s5, resposta_aberta_s6, nota_s, classificacao_s,
        resposta_au1, resposta_au2, resposta_au3, resposta_au4, resposta_au5, resposta_aberta_au6, nota_au, classificacao_au,
        resposta_t1, resposta_t2, resposta_t3, resposta_aberta_t4, nota_t,
        nota_geral, resposta_plano_sucesso, pdf_url
    )
    SELECT 
        diagnostico_id, data_preenchimento, empresa_id, nome_empresa, cnpj, email_admin, responsavel_nome, responsavel_email, quem_preencheu,
        resposta_a1, resposta_a2, resposta_a3, resposta_a4, resposta_a5, resposta_aberta_a6, nota_a, classificacao_a,
        resposta_s1, resposta_s2, resposta_s3, resposta_s4, resposta_s5, resposta_aberta_s6, nota_s, classificacao_s,
        resposta_au1, resposta_au2, resposta_au3, resposta_au4, resposta_au5, resposta_aberta_au6, nota_au, classificacao_au,
        resposta_t1, resposta_t2, resposta_t3, resposta_aberta_t4, nota_t,
        nota_geral, resposta_plano_sucesso, pdf_url
    FROM public.vw_diagnosticos_completos
    WHERE diagnostico_id = p_diagnostico_id
    ON CONFLICT (diagnostico_id) 
    DO UPDATE SET 
        data_preenchimento = EXCLUDED.data_preenchimento,
        empresa_id = EXCLUDED.empresa_id,
        nome_empresa = EXCLUDED.nome_empresa,
        cnpj = EXCLUDED.cnpj,
        email_admin = EXCLUDED.email_admin,
        responsavel_nome = EXCLUDED.responsavel_nome,
        responsavel_email = EXCLUDED.responsavel_email,
        quem_preencheu = EXCLUDED.quem_preencheu,
        resposta_a1 = EXCLUDED.resposta_a1,
        resposta_a2 = EXCLUDED.resposta_a2,
        resposta_a3 = EXCLUDED.resposta_a3,
        resposta_a4 = EXCLUDED.resposta_a4,
        resposta_a5 = EXCLUDED.resposta_a5,
        resposta_aberta_a6 = EXCLUDED.resposta_aberta_a6,
        nota_a = EXCLUDED.nota_a,
        classificacao_a = EXCLUDED.classificacao_a,
        resposta_s1 = EXCLUDED.resposta_s1,
        resposta_s2 = EXCLUDED.resposta_s2,
        resposta_s3 = EXCLUDED.resposta_s3,
        resposta_s4 = EXCLUDED.resposta_s4,
        resposta_s5 = EXCLUDED.resposta_s5,
        resposta_aberta_s6 = EXCLUDED.resposta_aberta_s6,
        nota_s = EXCLUDED.nota_s,
        classificacao_s = EXCLUDED.classificacao_s,
        resposta_au1 = EXCLUDED.resposta_au1,
        resposta_au2 = EXCLUDED.resposta_au2,
        resposta_au3 = EXCLUDED.resposta_au3,
        resposta_au4 = EXCLUDED.resposta_au4,
        resposta_au5 = EXCLUDED.resposta_au5,
        resposta_aberta_au6 = EXCLUDED.resposta_aberta_au6,
        nota_au = EXCLUDED.nota_au,
        classificacao_au = EXCLUDED.classificacao_au,
        resposta_t1 = EXCLUDED.resposta_t1,
        resposta_t2 = EXCLUDED.resposta_t2,
        resposta_t3 = EXCLUDED.resposta_t3,
        resposta_aberta_t4 = EXCLUDED.resposta_aberta_t4,
        nota_t = EXCLUDED.nota_t,
        nota_geral = EXCLUDED.nota_geral,
        resposta_plano_sucesso = EXCLUDED.resposta_plano_sucesso,
        pdf_url = EXCLUDED.pdf_url,
        atualizado_em = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Triggers
CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_diagnosticos()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.relatorio_diagnosticos_completos WHERE diagnostico_id = OLD.id;
        RETURN OLD;
    END IF;
    
    PERFORM public.sync_relatorio_diagnostico(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_diagnostico_change ON public.diagnosticos;
CREATE TRIGGER on_diagnostico_change
AFTER INSERT OR UPDATE ON public.diagnosticos
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_relatorio_diagnosticos();

CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_respostas()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_relatorio_diagnostico(OLD.diagnostico_id);
        RETURN OLD;
    END IF;
    
    PERFORM public.sync_relatorio_diagnostico(NEW.diagnostico_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_respostas_change ON public.respostas_abertas;
CREATE TRIGGER on_respostas_change
AFTER INSERT OR UPDATE OR DELETE ON public.respostas_abertas
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_relatorio_respostas();

CREATE OR REPLACE FUNCTION public.trg_sync_relatorio_empresas()
RETURNS TRIGGER AS $$
DECLARE
    d_id UUID;
BEGIN
    FOR d_id IN SELECT id FROM public.diagnosticos WHERE empresa_id = NEW.id
    LOOP
        PERFORM public.sync_relatorio_diagnostico(d_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_empresas_change ON public.empresas;
CREATE TRIGGER on_empresas_change
AFTER UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_relatorio_empresas();

-- 5. Migrate Existing Data
DO $$
DECLARE
    d_id UUID;
BEGIN
    FOR d_id IN SELECT id FROM public.diagnosticos
    LOOP
        PERFORM public.sync_relatorio_diagnostico(d_id);
    END LOOP;
END;
$$;
