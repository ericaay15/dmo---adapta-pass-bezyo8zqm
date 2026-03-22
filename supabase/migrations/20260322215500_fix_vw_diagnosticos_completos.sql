-- Removemos a view existente para recriá-la com o nome da coluna correto e permissões de invoker
DROP VIEW IF EXISTS public.vw_diagnosticos_completos;

-- Criamos a view expandida com security_invoker ativado e correção da coluna A2
CREATE OR REPLACE VIEW public.vw_diagnosticos_completos WITH (security_invoker = on) AS
SELECT
    d.id AS diagnostico_id,
    d.data_preenchimento,
    
    -- Dados da Empresa
    e.id AS empresa_id,
    e.nome AS nome_empresa,
    e.cnpj,
    e.email_admin,
    e.responsavel_nome,
    e.responsavel_email,
    d.quem_preencheu,

    -- Bloco A: Amplificar
    CAST(d.respostas_json->>'A1' AS INTEGER) AS resposta_a1,
    CAST(d.respostas_json->>'A2' AS INTEGER) AS resposta_a2,
    CAST(d.respostas_json->>'A3' AS INTEGER) AS resposta_a3,
    CAST(d.respostas_json->>'A4' AS INTEGER) AS resposta_a4,
    CAST(d.respostas_json->>'A5' AS INTEGER) AS resposta_a5,
    (SELECT resposta FROM public.respostas_abertas WHERE diagnostico_id = d.id AND tipo_bloco = 'A' AND numero_pergunta = 6 LIMIT 1) AS resposta_aberta_a6,
    d.nota_a,
    d.classificacao_a,

    -- Bloco S: Sistematizar
    CAST(d.respostas_json->>'S1' AS INTEGER) AS resposta_s1,
    CAST(d.respostas_json->>'S2' AS INTEGER) AS resposta_s2,
    CAST(d.respostas_json->>'S3' AS INTEGER) AS resposta_s3,
    CAST(d.respostas_json->>'S4' AS INTEGER) AS resposta_s4,
    CAST(d.respostas_json->>'S5' AS INTEGER) AS resposta_s5,
    (SELECT resposta FROM public.respostas_abertas WHERE diagnostico_id = d.id AND tipo_bloco = 'S' AND numero_pergunta = 6 LIMIT 1) AS resposta_aberta_s6,
    d.nota_s,
    d.classificacao_s,

    -- Bloco Au: Automatizar
    CAST(d.respostas_json->>'Au1' AS INTEGER) AS resposta_au1,
    CAST(d.respostas_json->>'Au2' AS INTEGER) AS resposta_au2,
    CAST(d.respostas_json->>'Au3' AS INTEGER) AS resposta_au3,
    CAST(d.respostas_json->>'Au4' AS INTEGER) AS resposta_au4,
    CAST(d.respostas_json->>'Au5' AS INTEGER) AS resposta_au5,
    (SELECT resposta FROM public.respostas_abertas WHERE diagnostico_id = d.id AND tipo_bloco = 'Au' AND numero_pergunta = 6 LIMIT 1) AS resposta_aberta_au6,
    d.nota_au,
    d.classificacao_au,

    -- Bloco T: Transformar
    CAST(d.respostas_json->>'T1' AS INTEGER) AS resposta_t1,
    CAST(d.respostas_json->>'T2' AS INTEGER) AS resposta_t2,
    CAST(d.respostas_json->>'T3' AS INTEGER) AS resposta_t3,
    (SELECT resposta FROM public.respostas_abertas WHERE diagnostico_id = d.id AND tipo_bloco = 'T' AND numero_pergunta = 4 LIMIT 1) AS resposta_aberta_t4,
    d.nota_t,

    -- Resultados Gerais e Plano de Sucesso
    d.nota_geral,
    d.complemento_sucesso AS resposta_plano_sucesso,
    d.pdf_url
FROM
    public.diagnosticos d
JOIN
    public.empresas e ON d.empresa_id = e.id;
