import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Camera, Ruler, Target, TrendingUp, Upload, User, Weight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import * as z from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  weight: z.string().optional(),
  height: z.string().optional(),
  age: z.string().optional(),
  goal: z.string().optional(),
  experience_level: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  name: string;
  email: string;
  weight: number | null;
  height: number | null;
  age: number | null;
  goal: string | null;
  experience_level: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const watchGoal = watch('goal');
  const watchExperience = watch('experience_level');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Redirect if not authenticated
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar perfil",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile(data);
        setValue('name', data.name || '');
        setValue('weight', data.weight?.toString() || '');
        setValue('height', data.height?.toString() || '');
        setValue('age', data.age?.toString() || '');
        setValue('goal', data.goal || '');
        setValue('experience_level', data.experience_level || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      
      // Validar tipo e tamanho do arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou GIF.');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      // Estrutura baseada no artigo oficial: user_id/filename
      const filePath = `${user?.id}/${fileName}`;

      console.log('Iniciando upload:', { fileName, filePath, fileSize: file.size, fileType: file.type, userId: user?.id });

      // Upload direto - sem verificar buckets (conforme artigo)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', urlData.publicUrl);

      // Atualizar perfil com a nova URL do avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error(`Erro ao salvar no perfil: ${updateError.message}`);
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);

      toast({
        title: "Sucesso!",
        description: "Avatar atualizado com sucesso",
      });

    } catch (error: unknown) {
      console.error('Erro completo no upload:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer upload da imagem";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Limpar o input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updateData = {
        name: data.name,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseInt(data.height) : null,
        age: data.age ? parseInt(data.age) : null,
        goal: data.goal || null,
        experience_level: data.experience_level || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso",
      });

      fetchProfile(); // Refresh profile data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar perfil";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      <Header 
        title="Gym Buddy"
        subtitle="Perfil do Usuário"
      />

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8 mt-6">
          <h2 className="text-3xl font-bold text-white mb-2">Meu Perfil</h2>
          <p className="text-gray-400">Gerencie seus dados pessoais</p>
        </div>

        {/* Avatar Section */}
        <Card className="glass-card border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-fitness-primary" />
              Foto do Perfil
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adicione uma foto para personalizar seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fitness-primary"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadAvatar}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Alterar Foto'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG ou GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-fitness-primary" />
              Dados Pessoais
            </CardTitle>
            <CardDescription className="text-gray-400">
              Mantenha suas informações atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome
                  </Label>
                  <Input
                    {...register('name')}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-800/30 border-gray-700 text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-300 flex items-center gap-2">
                    <Weight className="w-4 h-4" />
                    Peso (kg)
                  </Label>
                  <Input
                    {...register('weight')}
                    type="number"
                    step="0.1"
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="70.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-300 flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Altura (cm)
                  </Label>
                  <Input
                    {...register('height')}
                    type="number"
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Idade
                  </Label>
                  <Input
                    {...register('age')}
                    type="number"
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivo
                  </Label>
                  <Select value={watchGoal} onValueChange={(value) => setValue('goal', value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="hipertrofia">Ganhar Massa Muscular</SelectItem>
                      <SelectItem value="perda_peso">Perder Peso</SelectItem>
                      <SelectItem value="força">Aumentar Força</SelectItem>
                      <SelectItem value="resistencia">Melhorar Resistência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Nível de Experiência
                  </Label>
                  <Select value={watchExperience} onValueChange={(value) => setValue('experience_level', value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="iniciante">Iniciante (0-1 ano)</SelectItem>
                      <SelectItem value="intermediario">Intermediário (1-3 anos)</SelectItem>
                      <SelectItem value="avancado">Avançado (3+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-fitness-primary hover:bg-fitness-primary/90"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
