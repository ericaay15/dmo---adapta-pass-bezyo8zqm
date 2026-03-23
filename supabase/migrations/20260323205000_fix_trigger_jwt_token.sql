CREATE OR REPLACE FUNCTION public.trigger_sync_diagnosticos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_token text;
BEGIN
  -- Tenta resgatar o token, se existir. Usamos true para missing_ok
  BEGIN
    v_token := current_setting('app.jwt_token', true);
  EXCEPTION WHEN OTHERS THEN
    v_token := '';
  END;

  IF v_token IS NULL THEN
    v_token := '';
  END;

  PERFORM
    net.http_post(
      url := 'https://gebqrwjlwkskntfqykub.supabase.co/functions/v1/sync-diagnosticos-to-sheets',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_token
      ),
      body := jsonb_build_object(
        'diagnostico_id', NEW.diagnostico_id,
        'data_preenchimento', NEW.data_preenchimento,
        'empresa_id', NEW.empresa_id,
        'nome_empresa', NEW.nome_empresa,
        'cnpj', NEW.cnpj,
        'email_admin', NEW.email_admin,
        'responsavel_nome', NEW.responsavel_nome,
        'responsavel_email', NEW.responsavel_email,
        'quem_preencheu', NEW.quem_preencheu,
        'resposta_a1', NEW.resposta_a1,
        'resposta_a2', NEW.resposta_a2,
        'resposta_a3', NEW.resposta_a3,
        'resposta_a4', NEW.resposta_a4,
        'resposta_a5', NEW.resposta_a5,
        'resposta_aberta_a6', NEW.resposta_aberta_a6,
        'nota_a', NEW.nota_a,
        'classificacao_a', NEW.classificacao_a,
        'resposta_s1', NEW.resposta_s1,
        'resposta_s2', NEW.resposta_s2,
        'resposta_s3', NEW.resposta_s3,
        'resposta_s4', NEW.resposta_s4,
        'resposta_s5', NEW.resposta_s5,
        'resposta_aberta_s6', NEW.resposta_aberta_s6,
        'nota_s', NEW.nota_s,
        'classificacao_s', NEW.classificacao_s,
        'resposta_au1', NEW.resposta_au1,
        'resposta_au2', NEW.resposta_au2,
        'resposta_au3', NEW.resposta_au3,
        'resposta_au4', NEW.resposta_au4,
        'resposta_au5', NEW.resposta_au5,
        'resposta_aberta_au6', NEW.resposta_aberta_au6,
        'nota_au', NEW.nota_au,
        'classificacao_au', NEW.classificacao_au,
        'resposta_t1', NEW.resposta_t1,
        'resposta_t2', NEW.resposta_t2,
        'resposta_t3', NEW.resposta_t3,
        'resposta_aberta_t4', NEW.resposta_aberta_t4,
        'nota_t', NEW.nota_t,
        'nota_geral', NEW.nota_geral,
        'resposta_plano_sucesso', NEW.resposta_plano_sucesso,
        'pdf_url', NEW.pdf_url,
        'atualizado_em', NEW.atualizado_em
      )
    );
  RETURN NEW;
END;
$$;
