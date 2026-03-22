DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('diagnosticos', 'diagnosticos', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Permitir acesso público e inserção anônima no bucket de diagnósticos
DROP POLICY IF EXISTS "Allow anon insert diagnosticos bucket" ON storage.objects;
CREATE POLICY "Allow anon insert diagnosticos bucket" ON storage.objects 
FOR INSERT TO public WITH CHECK (bucket_id = 'diagnosticos');

DROP POLICY IF EXISTS "Allow anon select diagnosticos bucket" ON storage.objects;
CREATE POLICY "Allow anon select diagnosticos bucket" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'diagnosticos');

DROP POLICY IF EXISTS "Allow anon update diagnosticos bucket" ON storage.objects;
CREATE POLICY "Allow anon update diagnosticos bucket" ON storage.objects 
FOR UPDATE TO public USING (bucket_id = 'diagnosticos');

-- Adicionar coluna para armazenar a URL do PDF gerado
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS pdf_url TEXT;
