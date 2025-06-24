-- Adicionar coluna avatar_url na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;

-- Criar bucket para armazenar imagens de perfil
INSERT INTO storage.buckets
  (id, name, public)
VALUES
  ('profiles', 'profiles', true);

-- Política para permitir que usuários façam upload de suas próprias imagens
CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects FOR
INSERT 
  WITH CHECK
  (bucket_id =

  'profiles' AND auth.uid
()

::text =
(storage.foldername
(name))[1]);

-- Política para permitir que usuários vejam suas próprias imagens
CREATE POLICY "Users can view their own avatar" 
  ON storage.objects FOR
SELECT
  USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own avatar" 
  ON storage.objects FOR
UPDATE 
  USING (bucket_id = 'profiles'
AND auth.uid
()::text =
(storage.foldername
(name))[1]);

-- Política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete their own avatar" 
  ON storage.objects FOR
DELETE 
  USING (bucket_id
= 'profiles' AND auth.uid
()::text =
(storage.foldername
(name))[1]);

-- Permitir acesso público às imagens (para visualização)
CREATE POLICY "Public can view avatars" 
  ON storage.objects FOR
SELECT
  USING (bucket_id = 'profiles'); 