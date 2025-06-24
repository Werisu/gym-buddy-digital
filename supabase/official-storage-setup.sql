-- SQL baseado no artigo oficial do Supabase
-- https://supabase.com/blog/react-native-storage

-- 1. Criar bucket 'profiles' (execute via Dashboard: Storage > New bucket > profiles > public: true)
-- OU via SQL:
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('profiles', 'profiles', true)
ON CONFLICT
(id) DO NOTHING;

-- 2. Política principal baseada no artigo oficial
-- Esta política permite que usuários acessem apenas sua própria pasta baseada no user_id
CREATE POLICY "Enable storage access for users based on user_id" ON "storage"."objects"
AS PERMISSIVE FOR ALL
TO public
USING
(bucket_id = 'profiles' AND
(SELECT auth.uid()
::text) =
(storage.foldername
(name))[1])
WITH CHECK
(bucket_id = 'profiles' AND
(SELECT auth.uid()
::text) =
(storage.foldername
(name))[1]);

-- 3. Verificar se a política foi criada
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Enable storage access for users based on user_id'; 