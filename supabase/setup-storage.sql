-- Instruções para configurar o Storage no Supabase Dashboard
-- Execute essas instruções no SQL Editor do Supabase Dashboard

-- 1. Primeiro, adicione a coluna avatar_url na tabela profiles (se ainda não existir)
ALTER TABLE public.profiles 
ADD COLUMN
IF NOT EXISTS avatar_url TEXT;

-- 2. Crie o bucket 'profiles' no Storage (pode ser feito via Dashboard ou SQL)
-- Via Dashboard: Storage > Create bucket > Nome: "profiles" > Public: true
-- Via SQL (execute apenas se o bucket não existir):
INSERT INTO storage.buckets
  (id, name, public)
VALUES
  ('profiles', 'profiles', true)
ON CONFLICT
(id) DO NOTHING;

-- 3. Remover políticas existentes (se houver) e criar novas
-- Política para upload (INSERT)
DROP POLICY
IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR
INSERT
WITH CHECK
  (
  bucket_id
'profiles'
  AND auth.uid
()

::text =
(storage.foldername
(name))[1]
);

-- Política para visualizar próprios arquivos (SELECT)
DROP POLICY
IF EXISTS "Users can view their own avatar" ON storage.objects;
CREATE POLICY "Users can view their own avatar"
ON storage.objects FOR
SELECT
  USING (
  bucket_id = 'profiles'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para atualizar próprios arquivos (UPDATE)
DROP POLICY
IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR
UPDATE
USING (
  bucket_id = 'profiles'
AND auth.uid
()::text =
(storage.foldername
(name))[1]
);

-- Política para deletar próprios arquivos (DELETE)
DROP POLICY
IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR
DELETE
USING (
  bucket_id
= 'profiles' 
  AND auth.uid
()::text =
(storage.foldername
(name))[1]
);

-- Política para acesso público (para visualização das imagens)
DROP POLICY
IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR
SELECT
  USING (bucket_id = 'profiles');

-- 4. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname; 