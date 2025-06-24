# Configuração do Storage para Upload de Avatares

## Erro Atual

Você está recebendo um erro 400 ao tentar fazer upload de imagens porque o bucket 'profiles' não está configurado corretamente no Supabase.

## Solução: Configurar Storage no Supabase Dashboard

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Entre no seu projeto `wilajhccewvbrsguyass`

### Passo 2: Criar o Bucket

1. No menu lateral, clique em **Storage**
2. Clique em **Create bucket**
3. Preencha:
   - **Name**: `profiles`
   - **Public bucket**: ✅ (marque esta opção)
4. Clique em **Create bucket**

### Passo 3: Configurar Políticas RLS

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `supabase/setup-storage-simple.sql` (versão corrigida)
4. Clique em **Run** para executar

> **Importante**: Use o arquivo `setup-storage-simple.sql` que tem a sintaxe corrigida sem `IF NOT EXISTS` para políticas.

### Passo 4: Verificar Configuração

Após executar o SQL, você deve ver:

- Bucket 'profiles' criado em Storage
- Coluna `avatar_url` adicionada na tabela `profiles`
- 5 políticas RLS criadas para controlar acesso

### Passo 5: Testar Upload

1. Volte para o aplicativo
2. Vá para a página de Perfil
3. Tente fazer upload de uma imagem
4. Verifique o console do navegador para logs detalhados

## Estrutura de Pastas no Storage

```
profiles/
  └── avatars/
      ├── user-id-1-timestamp.jpg
      ├── user-id-2-timestamp.png
      └── ...
```

## Políticas de Segurança

- **Upload**: Usuários só podem fazer upload para suas próprias pastas
- **Visualização**: Usuários podem ver seus próprios arquivos + acesso público para visualização
- **Atualização/Exclusão**: Usuários só podem modificar seus próprios arquivos

## Logs de Debug

O código agora inclui logs detalhados que aparecerão no console do navegador:

- Verificação de buckets
- Detalhes do upload
- URLs geradas
- Erros específicos

## Caso de Erro Persistente

Se ainda houver problemas:

1. Verifique se o bucket foi criado corretamente
2. Confirme que as políticas RLS foram aplicadas
3. Verifique os logs no console do navegador
4. Teste com uma imagem pequena (< 1MB) primeiro

## Arquivos Disponíveis

- `supabase/setup-storage-simple.sql` - **Use este arquivo** (sintaxe corrigida)
- `supabase/setup-storage.sql` - Versão original (pode ter problemas de sintaxe)
