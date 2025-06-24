-- PASSO 1: Adicionar coluna avatar_url (execute este comando primeiro)
ALTER TABLE public.profiles ADD COLUMN
IF NOT EXISTS avatar_url TEXT;

-- PASSO 2: Criar bucket (execute este comando)
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('profiles', 'profiles', true)
ON CONFLICT
(id) DO NOTHING;

-- PASSO 3: Remover políticas antigas (execute todos estes comandos)
DROP POLICY
IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Public can view avatars" ON storage.objects;

-- PASSO 4: Criar política de upload
CREATE POLICY "Users can upload their own avatar" ON storage.objects 
FOR
INSERT WITH CHECK
    (bucket_id =
'profiles' AND auth.uid()

::text =
(storage.foldername
(name))[1]);

-- PASSO 5: Criar política de visualização própria
CREATE POLICY "Users can view their own avatar" ON storage.objects 
FOR
SELECT USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- PASSO 6: Criar política de atualização
CREATE POLICY "Users can update their own avatar" ON storage.objects 
FOR
UPDATE USING (bucket_id = 'profiles'
AND auth.uid
()::text =
(storage.foldername
(name))[1]);

-- PASSO 7: Criar política de exclusão
CREATE POLICY "Users can delete their own avatar" ON storage.objects 
FOR
DELETE USING (bucket_id
= 'profiles' AND auth.uid
()::text =
(storage.foldername
(name))[1]);

-- PASSO 8: Criar política pública para visualização
CREATE POLICY "Public can view avatars" ON storage.objects 
FOR
SELECT USING (bucket_id = 'profiles');

-- PASSO 9: Verificar se tudo foi criado
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatar%'; 