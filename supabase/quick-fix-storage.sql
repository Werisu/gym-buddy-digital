-- SQL baseado na documentação oficial do Supabase
-- Execute este comando no SQL Editor do Dashboard

-- 1. Criar bucket (se não existir)
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('profiles', 'profiles', true)
ON CONFLICT
(id) DO NOTHING;

-- 2. Política para permitir uploads públicos (baseada na documentação)
CREATE POLICY "allow uploads" ON storage.objects 
FOR
INSERT TO public 
WITH CHECK
    (bucket_id =
'profiles')
;

-- 3. Política para permitir visualização pública
CREATE POLICY "allow public access" ON storage.objects 
FOR
SELECT TO public 
USING
(bucket_id = 'profiles');

-- 4. Verificar se as políticas foram criadas
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname IN ('allow uploads', 'allow public access'); 