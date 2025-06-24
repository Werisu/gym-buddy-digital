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
import { Calendar, Ruler, Target, TrendingUp, User, Weight } from 'lucide-react';
import { useEffect, useState } from 'react';
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
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
