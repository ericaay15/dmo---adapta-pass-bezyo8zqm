-- Atualiza a função de sincronização para garantir que a resposta do plano de sucesso e o PDF sejam atualizados corretamente
-- extraindo os dados diretamente da tabela 'diagnosticos', prevenindo falhas caso a view não esteja atualizada.
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
        v.diagnostico_id, v.data_preenchimento, v.empresa_id, v.nome_empresa, v.cnpj, v.email_admin, v.responsavel_nome, v.responsavel_email, v.quem_preencheu,
        v.resposta_a1, v.resposta_a2, v.resposta_a3, v.resposta_a4, v.resposta_a5, v.resposta_aberta_a6, v.nota_a, v.classificacao_a,
        v.resposta_s1, v.resposta_s2, v.resposta_s3, v.resposta_s4, v.resposta_s5, v.resposta_aberta_s6, v.nota_s, v.classificacao_s,
        v.resposta_au1, v.resposta_au2, v.resposta_au3, v.resposta_au4, v.resposta_au5, v.resposta_aberta_au6, v.nota_au, v.classificacao_au,
        v.resposta_t1, v.resposta_t2, v.resposta_t3, v.resposta_aberta_t4, v.nota_t,
        v.nota_geral, 
        -- Puxa diretamente da tabela de diagnósticos para garantir integridade do dado recém-salvo
        COALESCE(d.complemento_sucesso, v.resposta_plano_sucesso), 
        COALESCE(d.pdf_url, v.pdf_url)
    FROM public.vw_diagnosticos_completos v
    JOIN public.diagnosticos d ON d.id = v.diagnostico_id
    WHERE v.diagnostico_id = p_diagnostico_id
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

-- Executa a sincronização forçada para todos os registros que já possuem o campo `complemento_sucesso`
DO $$
DECLARE
    d_id UUID;
BEGIN
    FOR d_id IN SELECT id FROM public.diagnosticos WHERE complemento_sucesso IS NOT NULL
    LOOP
        PERFORM public.sync_relatorio_diagnostico(d_id);
    END LOOP;
END;
$$;
