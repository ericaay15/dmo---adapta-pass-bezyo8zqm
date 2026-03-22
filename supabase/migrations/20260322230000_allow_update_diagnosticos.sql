-- Concede permissão de UPDATE para a tabela diagnosticos, permitindo o registro do complemento do plano de sucesso
DROP POLICY IF EXISTS "Allow public updates on diagnosticos" ON public.diagnosticos;
CREATE POLICY "Allow public updates on diagnosticos" ON public.diagnosticos 
  FOR UPDATE USING (true) WITH CHECK (true);
