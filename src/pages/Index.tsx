import { DynamicWeeklySchedule } from "@/components/DynamicWeeklySchedule";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Dumbbell, Play, Plus, Target, Trophy, User } from "lucide-react";
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

interface DashboardStats {
  totalRoutines: number;
  activeRoutine: string | null;
  totalExercises: number;
  totalWorkoutDays: number;
  nextWorkout: {
    name: string;
    exerciseCount: number;
  } | null;
  weeklyProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  recentActivity: {
    streak: number;
    lastWorkout: Date | null;
  };
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRoutines: 0,
    activeRoutine: null,
    totalExercises: 0,
    totalWorkoutDays: 0,
    nextWorkout: null,
    weeklyProgress: { completed: 0, total: 0, percentage: 0 },
    recentActivity: { streak: 0, lastWorkout: null }
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Buscar rotinas
      const { data: routines, error: routinesError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', user?.id);

      if (routinesError) throw routinesError;

      // Buscar rotina ativa
      const activeRoutine = routines?.find(r => r.is_active);

      // Buscar dias de treino
      const { data: workoutDays, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .in('routine_id', routines?.map(r => r.id) || []);

      if (daysError) throw daysError;

      // Buscar exercícios
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_day_id', workoutDays?.map(d => d.id) || []);

      if (exercisesError) throw exercisesError;

      // Buscar histórico de treinos
      const { data: workoutHistory, error: historyError } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('workout_date', { ascending: false });

      if (historyError) throw historyError;

      // Calcular próximo treino baseado na rotina ativa e semana atual
      let nextWorkout = null;
      if (activeRoutine) {
        // Buscar dias da semana 1 da rotina ativa (pode ser expandido para detectar semana atual)
        const activeDays = workoutDays?.filter(d => 
          d.routine_id === activeRoutine.id && 
          d.week_number === 1 && 
          !d.is_rest_day
        ) || [];
        
        if (activeDays.length > 0) {
          const today = new Date();
          const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
          
          // Encontrar próximo dia de treino
          let nextDay = activeDays.find(d => d.day_number > currentDayOfWeek);
          if (!nextDay) {
            // Se não há mais dias esta semana, pegar o primeiro da próxima
            nextDay = activeDays[0];
          }
          
          const nextWorkoutExercises = exercises?.filter(e => e.workout_day_id === nextDay.id) || [];
          nextWorkout = {
            name: nextDay.day_name,
            exerciseCount: nextWorkoutExercises.length
          };
        }
      }

      // Calcular progresso semanal baseado no histórico
      const now = new Date();
      const startOfWeek = new Date(now);
      const daysToSubtract = now.getDay() === 0 ? 6 : now.getDay() - 1;
      startOfWeek.setDate(now.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const thisWeekWorkouts = workoutHistory?.filter(w => {
        const workoutDate = new Date(w.workout_date);
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
      }) || [];

      // Calcular total de treinos planejados para esta semana
      const plannedWorkoutsThisWeek = activeRoutine ? 
        workoutDays?.filter(d => 
          d.routine_id === activeRoutine.id && 
          d.week_number === 1 && 
          !d.is_rest_day
        ).length || 0 : 0;

      // Calcular sequência atual (dias consecutivos com treino)
      let currentStreak = 0;
      if (workoutHistory && workoutHistory.length > 0) {
        const sortedHistory = [...workoutHistory].sort((a, b) => 
          new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
        );

        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        
        // Se não treinou hoje, começar de ontem
        const todayWorkout = sortedHistory.find(w => 
          new Date(w.workout_date).toDateString() === checkDate.toDateString()
        );
        
        if (!todayWorkout) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Contar dias consecutivos
        for (const workout of sortedHistory) {
          const workoutDate = new Date(workout.workout_date);
          workoutDate.setHours(0, 0, 0, 0);
          
          if (workoutDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (workoutDate.getTime() < checkDate.getTime()) {
            // Encontrou uma lacuna
            break;
          }
        }
      }

      // Último treino
      const lastWorkout = workoutHistory && workoutHistory.length > 0 ? 
        new Date(workoutHistory[0].workout_date) : null;

      setDashboardStats({
        totalRoutines: routines?.length || 0,
        activeRoutine: activeRoutine?.name || null,
        totalExercises: exercises?.length || 0,
        totalWorkoutDays: workoutDays?.length || 0,
        nextWorkout,
        weeklyProgress: {
          completed: thisWeekWorkouts.length,
          total: plannedWorkoutsThisWeek,
          percentage: plannedWorkoutsThisWeek > 0 ? (thisWeekWorkouts.length / plannedWorkoutsThisWeek) * 100 : 0
        },
        recentActivity: {
          streak: currentStreak,
          lastWorkout
        }
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao carregar estatísticas: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const createTestWorkoutHistory = async () => {
    if (!user) return;

    const testWorkouts = [
      {
        user_id: user.id,
        workout_name: "Treino de Braços",
        workout_date: new Date().toISOString().split('T')[0], // Hoje
        duration_minutes: 45,
        exercises_completed: 8,
        total_exercises: 8
      },
      {
        user_id: user.id,
        workout_name: "Treino de Peito",
        workout_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem
        duration_minutes: 50,
        exercises_completed: 6,
        total_exercises: 6
      },
      {
        user_id: user.id,
        workout_name: "Treino de Costas",
        workout_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Anteontem
        duration_minutes: 55,
        exercises_completed: 7,
        total_exercises: 7
      },
      {
        user_id: user.id,
        workout_name: "Treino de Pernas",
        workout_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 dias atrás
        duration_minutes: 60,
        exercises_completed: 9,
        total_exercises: 9
      },
      {
        user_id: user.id,
        workout_name: "Treino de Ombros",
        workout_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias atrás
        duration_minutes: 40,
        exercises_completed: 5,
        total_exercises: 5
      }
    ];

    try {
      const { error } = await supabase
        .from('workout_history')
        .insert(testWorkouts);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Dados de teste criados com sucesso",
      });

      // Recarregar estatísticas
      fetchDashboardStats();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao criar dados de teste: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const clearWorkoutHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workout_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Histórico limpo com sucesso",
      });

      // Recarregar estatísticas
      fetchDashboardStats();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao limpar histórico: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Redirect to auth if not logged in
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  const formatLastWorkout = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return `${diff} dias atrás`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      <Header 
        title="Gym Buddy"
        subtitle={dashboardStats.activeRoutine || 'Nenhuma rotina ativa'}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Olá, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Atleta'}! 💪
          </h2>
          <p className="text-gray-400">
            {dashboardStats.nextWorkout 
              ? `Próximo treino: ${dashboardStats.nextWorkout.name} com ${dashboardStats.nextWorkout.exerciseCount} exercícios`
              : 'Pronto para criar sua primeira rotina de treinos?'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingStats ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-card border-gray-800">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatsCard
                icon={Calendar}
                title="Progresso Semanal"
                value={`${dashboardStats.weeklyProgress.completed}/${dashboardStats.weeklyProgress.total}`}
                subtitle={`${Math.round(dashboardStats.weeklyProgress.percentage)}% concluído`}
                progress={dashboardStats.weeklyProgress.percentage}
              />
              <StatsCard
                icon={Trophy}
                title="Sequência Atual"
                value={dashboardStats.recentActivity.streak.toString()}
                subtitle="dias consecutivos"
              />
              <StatsCard
                icon={Target}
                title="Total de Exercícios"
                value={dashboardStats.totalExercises.toString()}
                subtitle={`em ${dashboardStats.totalRoutines} rotinas`}
              />
              <StatsCard
                icon={Clock}
                title="Último Treino"
                value={formatLastWorkout(dashboardStats.recentActivity.lastWorkout)}
                subtitle={dashboardStats.nextWorkout ? dashboardStats.nextWorkout.name : 'Criar rotina'}
              />
            </>
          )}
        </div>

        {/* Weekly Schedule */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Cronograma Semanal</h3>
            <div className="flex gap-2">
              {/* Botões temporários para teste */}
              <Button
                onClick={createTestWorkoutHistory}
                variant="outline"
                size="sm"
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                Criar Dados Teste
              </Button>
              <Button
                onClick={clearWorkoutHistory}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Limpar Histórico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardStats}
                className="border-gray-700 text-gray-300"
                disabled={loadingStats}
              >
                {loadingStats ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
          <DynamicWeeklySchedule />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/quick-workout">
            <Button 
              size="lg" 
              className="w-full h-20 bg-fitness-primary hover:bg-fitness-primary/90 text-lg font-semibold"
              disabled={dashboardStats.totalRoutines === 0}
            >
              <Play className="w-6 h-6 mr-3" />
              {dashboardStats.totalRoutines === 0 ? 'Criar Rotina Primeiro' : 'Iniciar Treino'}
            </Button>
          </Link>
          
          <Link to="/workouts">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-20 border-gray-700 text-white hover:bg-gray-800 text-lg"
            >
              <Dumbbell className="w-6 h-6 mr-3" />
              Ver Treinos ({dashboardStats.totalRoutines})
            </Button>
          </Link>
          
          <Link to="/workouts">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full h-20 border-gray-700 text-white hover:bg-gray-800 text-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Nova Rotina
            </Button>
          </Link>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Estatísticas Detalhadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-gray-800">
              <CardContent className="p-6 text-center">
                <Dumbbell className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-1">{dashboardStats.totalRoutines}</h4>
                <p className="text-gray-400 text-sm">Rotinas Criadas</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-gray-800">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-1">{dashboardStats.totalWorkoutDays}</h4>
                <p className="text-gray-400 text-sm">Dias de Treino</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-gray-800">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-1">{dashboardStats.totalExercises}</h4>
                <p className="text-gray-400 text-sm">Exercícios Cadastrados</p>
              </CardContent>
            </Card>
            
            <Link to="/profile">
              <Card className="glass-card border-gray-800 hover:border-fitness-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <User className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-1">Meu Perfil</h4>
                  <p className="text-gray-400 text-sm">Configurações</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
