-- Adiciona a coluna para armazenar a resposta da pergunta de sucesso de 90 dias
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS complemento_sucesso TEXT;
