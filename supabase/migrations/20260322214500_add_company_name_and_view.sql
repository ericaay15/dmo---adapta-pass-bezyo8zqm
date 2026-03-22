-- Adiciona a coluna para armazenar o nome da empresa
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS nome TEXT;

-- Cria uma view consolidada para facilitar a visualização no Table Editor do Supabase
CREATE OR REPLACE VIEW public.vw_diagnosticos_completos AS
SELECT
    d.id AS diagnostico_id,
    d.data_preenchimento,
    e.id AS empresa_id,
    e.nome AS nome_empresa,
    e.cnpj,
    e.email_admin,
    e.responsavel_nome,
    e.responsavel_email,
    d.quem_preencheu,
    d.nota_geral,
    d.nota_a,
    d.nota_s,
    d.nota_au,
    d.nota_t,
    d.classificacao_a,
    d.classificacao_s,
    d.classificacao_au,
    d.complemento_sucesso,
    d.pdf_url
FROM
    public.diagnosticos d
JOIN
    public.empresas e ON d.empresa_id = e.id;
