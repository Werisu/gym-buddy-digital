
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Dumbbell, Plus, Calendar, Edit, Trash2, Play } from 'lucide-react';
import { CreateRoutineDialog } from '@/components/workouts/CreateRoutineDialog';
import { WorkoutRoutineCard } from '@/components/workouts/WorkoutRoutineCard';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export default function Workouts() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Redirect if not authenticated
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      fetchRoutines();
    }
  }, [user]);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRoutines(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar rotinas de treino",
        variant: "destructive"
      });
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async (routineData: Omit<WorkoutRoutine, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .insert([{
          ...routineData,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRoutines(prev => [data, ...prev]);
      setShowCreateDialog(false);
      
      toast({
        title: "Sucesso!",
        description: "Rotina de treino criada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar rotina",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', routineId);

      if (error) {
        throw error;
      }

      setRoutines(prev => prev.filter(routine => routine.id !== routineId));
      
      toast({
        title: "Sucesso!",
        description: "Rotina removida com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover rotina",
        variant: "destructive"
      });
    }
  };

  const handleSetActiveRoutine = async (routineId: string) => {
    try {
      // Primeiro, desativar todas as rotinas
      await supabase
        .from('workout_routines')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Depois, ativar a rotina selecionada
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: true })
        .eq('id', routineId);

      if (error) {
        throw error;
      }

      setRoutines(prev => prev.map(routine => ({
        ...routine,
        is_active: routine.id === routineId
      })));
      
      toast({
        title: "Sucesso!",
        description: "Rotina ativada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao ativar rotina",
        variant: "destructive"
      });
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
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-fitness-primary" />
              Rotinas de Treino
            </h1>
            <p className="text-gray-400">Gerencie suas rotinas e exercícios</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-fitness-primary hover:bg-fitness-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Rotina
          </Button>
        </div>

        {routines.length === 0 ? (
          <Card className="glass-card border-gray-800">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma rotina criada
              </h3>
              <p className="text-gray-400 mb-6">
                Comece criando sua primeira rotina de treinos
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-fitness-primary hover:bg-fitness-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Rotina
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <WorkoutRoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onSetActive={handleSetActiveRoutine}
              />
            ))}
          </div>
        )}

        <CreateRoutineDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateRoutine={handleCreateRoutine}
        />
      </div>
    </div>
  );
}
