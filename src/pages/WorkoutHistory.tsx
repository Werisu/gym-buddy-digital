import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Dumbbell, Filter, Search, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface WorkoutHistoryItem {
  id: string;
  workout_name: string;
  workout_date: string;
  duration_minutes: number;
  exercises_completed: number;
  total_exercises: number;
  created_at: string;
}

interface HistoryStats {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

const WorkoutHistory = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<WorkoutHistoryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<HistoryStats>({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const fetchWorkoutHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingHistory(true);

      const { data: history, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });

      if (error) throw error;

      setWorkoutHistory(history || []);
      calculateStats(history || []);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao carregar histórico: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoadingHistory(false);
    }
  }, [user, toast]);

  const calculateStats = (history: WorkoutHistoryItem[]) => {
    if (history.length === 0) {
      setHistoryStats({
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0
      });
      return;
    }

    const totalWorkouts = history.length;
    const totalDuration = history.reduce((sum, w) => sum + w.duration_minutes, 0);
    const averageDuration = Math.round(totalDuration / totalWorkouts);
    const completionRate = Math.round(
      (history.reduce((sum, w) => sum + w.exercises_completed, 0) / 
       history.reduce((sum, w) => sum + w.total_exercises, 0)) * 100
    );

    // Calcular sequências
    const uniqueDates = [...new Set(history.map(w => w.workout_date))].sort((a, b) => b.localeCompare(a));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sequência atual
    const today = new Date();
    const checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);
    
    // Se não treinou hoje, começar de ontem
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!uniqueDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const date of uniqueDates) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (date === checkDateStr) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (date < checkDateStr) {
        break;
      }
    }

    // Sequência mais longa
    let previousDate: Date | null = null;
    for (const dateStr of uniqueDates.reverse()) {
      const currentDate = new Date(dateStr);
      
      if (previousDate) {
        const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    setHistoryStats({
      totalWorkouts,
      totalDuration,
      averageDuration,
      completionRate,
      currentStreak,
      longestStreak
    });
  };

  const applyFilters = useCallback(() => {
    let filtered = [...workoutHistory];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.workout_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de data
    const now = new Date();
    switch (dateFilter) {
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(w => new Date(w.workout_date) >= weekAgo);
        break;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(w => new Date(w.workout_date) >= monthAgo);
        break;
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(w => new Date(w.workout_date) >= yearAgo);
        break;
      }
    }

    // Ordenação
    switch (sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => a.workout_date.localeCompare(b.workout_date));
        break;
      case 'date_desc':
        filtered.sort((a, b) => b.workout_date.localeCompare(a.workout_date));
        break;
      case 'duration_desc':
        filtered.sort((a, b) => b.duration_minutes - a.duration_minutes);
        break;
      case 'duration_asc':
        filtered.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
    }

    setFilteredHistory(filtered);
  }, [workoutHistory, searchTerm, dateFilter, sortBy]);

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
    }
  }, [user, fetchWorkoutHistory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      <Header 
        title="Histórico de Treinos"
        subtitle={`${historyStats.totalWorkouts} treinos realizados`}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-gray-800">
            <CardContent className="p-6 text-center">
              <Dumbbell className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-white mb-1">{historyStats.totalWorkouts}</h4>
              <p className="text-gray-400 text-sm">Total de Treinos</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-800">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-white mb-1">{formatDuration(historyStats.totalDuration)}</h4>
              <p className="text-gray-400 text-sm">Tempo Total</p>
              <p className="text-xs text-gray-500 mt-1">Média: {formatDuration(historyStats.averageDuration)}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-800">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-white mb-1">{historyStats.completionRate}%</h4>
              <p className="text-gray-400 text-sm">Taxa de Conclusão</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-800">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-fitness-primary mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-white mb-1">{historyStats.currentStreak}</h4>
              <p className="text-gray-400 text-sm">Sequência Atual</p>
              <p className="text-xs text-gray-500 mt-1">Recorde: {historyStats.longestStreak} dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="glass-card border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar treino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Data (mais recente)</SelectItem>
                  <SelectItem value="date_asc">Data (mais antigo)</SelectItem>
                  <SelectItem value="duration_desc">Duração (maior)</SelectItem>
                  <SelectItem value="duration_asc">Duração (menor)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={fetchWorkoutHistory}
                variant="outline"
                className="border-gray-700 text-gray-300"
                disabled={loadingHistory}
              >
                {loadingHistory ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Treinos */}
        <div className="space-y-4">
          {loadingHistory ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="glass-card border-gray-800">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredHistory.length === 0 ? (
            <Card className="glass-card border-gray-800">
              <CardContent className="p-12 text-center">
                <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum treino encontrado</h3>
                <p className="text-gray-400">
                  {searchTerm || dateFilter !== 'all' 
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Você ainda não completou nenhum treino. Que tal começar agora?'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((workout) => (
              <Card key={workout.id} className="glass-card border-gray-800 hover:border-fitness-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{workout.workout_name}</h3>
                    <div className="text-sm text-gray-400">
                      {formatDate(workout.workout_date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-fitness-primary" />
                      <span>{formatDuration(workout.duration_minutes)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-fitness-primary" />
                      <span>{workout.exercises_completed}/{workout.total_exercises} exercícios</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-fitness-primary" />
                      <span>{Math.round((workout.exercises_completed / workout.total_exercises) * 100)}% concluído</span>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-fitness-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(workout.exercises_completed / workout.total_exercises) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Informações adicionais */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Mostrando {filteredHistory.length} de {historyStats.totalWorkouts} treinos
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutHistory; 