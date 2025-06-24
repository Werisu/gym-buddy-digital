import { DynamicWeeklySchedule } from "@/components/DynamicWeeklySchedule";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Dumbbell, LogOut, Play, Plus, Target, Trophy, User } from "lucide-react";
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

      // Calcular próximo treino
      const nextWorkoutDay = workoutDays?.find(d => !d.is_rest_day);
      const nextWorkoutExercises = exercises?.filter(e => e.workout_day_id === nextWorkoutDay?.id) || [];

      // Simular progresso semanal (pode ser expandido com dados reais)
      const totalWeeklyWorkouts = workoutDays?.filter(d => !d.is_rest_day).length || 0;
      const completedWeeklyWorkouts = Math.floor(totalWeeklyWorkouts * 0.6); // Simulação

      // Simular streak (pode ser expandido com dados reais de histórico)
      const currentStreak = Math.floor(Math.random() * 15) + 1;

      setDashboardStats({
        totalRoutines: routines?.length || 0,
        activeRoutine: activeRoutine?.name || null,
        totalExercises: exercises?.length || 0,
        totalWorkoutDays: workoutDays?.length || 0,
        nextWorkout: nextWorkoutDay ? {
          name: nextWorkoutDay.day_name,
          exerciseCount: nextWorkoutExercises.length
        } : null,
        weeklyProgress: {
          completed: completedWeeklyWorkouts,
          total: totalWeeklyWorkouts,
          percentage: totalWeeklyWorkouts > 0 ? (completedWeeklyWorkouts / totalWeeklyWorkouts) * 100 : 0
        },
        recentActivity: {
          streak: currentStreak,
          lastWorkout: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Último treino simulado
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

  const handleSignOut = async () => {
    await signOut();
  };

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
      {/* Header */}
      <header className="border-b border-gray-800 bg-fitness-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-fitness-primary" />
              <div>
                <h1 className="text-2xl font-bold text-white">Gym Buddy</h1>
                <p className="text-sm text-gray-400">
                  {dashboardStats.activeRoutine || 'Nenhuma rotina ativa'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/workouts">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Meus Treinos
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          <DynamicWeeklySchedule currentWeek={1} />
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
