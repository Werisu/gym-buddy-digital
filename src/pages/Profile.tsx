
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { User, Weight, Ruler, Calendar, Target, TrendingUp, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  const { user, signOut, loading: authLoading } = useAuth();
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

  // Redirect if not authenticated
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">Gerencie seus dados pessoais</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
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
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-800/30 border-gray-700 text-gray-400"
                  />
                </div>

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
                    placeholder="Ex: 70.5"
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
                    placeholder="Ex: 175"
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
                    placeholder="Ex: 25"
                  />
                </div>

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
                      <SelectItem value="hipertrofia" className="text-white">Hipertrofia</SelectItem>
                      <SelectItem value="força" className="text-white">Força</SelectItem>
                      <SelectItem value="resistencia" className="text-white">Resistência</SelectItem>
                      <SelectItem value="perda_peso" className="text-white">Perda de Peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Nível de Experiência
                  </Label>
                  <Select value={watchExperience} onValueChange={(value) => setValue('experience_level', value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="iniciante" className="text-white">Iniciante</SelectItem>
                      <SelectItem value="intermediario" className="text-white">Intermediário</SelectItem>
                      <SelectItem value="avancado" className="text-white">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-fitness-primary hover:bg-fitness-primary/90"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
