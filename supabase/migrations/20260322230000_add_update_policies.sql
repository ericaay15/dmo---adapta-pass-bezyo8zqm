-- Adiciona permissão de UPDATE na tabela diagnosticos para permitir salvar o plano de sucesso
DROP POLICY IF EXISTS "Allow public updates on diagnosticos" ON public.diagnosticos;
CREATE POLICY "Allow public updates on diagnosticos" ON public.diagnosticos
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Adiciona permissão de UPDATE na tabela empresas para garantir consistência em atualizações de cadastro
DROP POLICY IF EXISTS "Allow public updates on empresas" ON public.empresas;
CREATE POLICY "Allow public updates on empresas" ON public.empresas
  FOR UPDATE TO public USING (true) WITH CHECK (true);
