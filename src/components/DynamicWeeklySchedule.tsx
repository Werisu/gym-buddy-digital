import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Circle, Clock, Dumbbell, Play } from "lucide-react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number | null;
  is_active: boolean | null;
  user_id: string;
  created_at: string;
}

interface WorkoutDay {
  id: string;
  routine_id: string;
  week_number: number;
  day_number: number;
  day_name: string;
  is_rest_day: boolean | null;
}

interface Exercise {
  id: string;
  workout_day_id: string;
  name: string;
  sets: number;
  reps: string;
  weight_kg: number | null;
  rest_seconds: number | null;
  video_url: string | null;
  execution_notes: string | null;
  exercise_order: number | null;
}

interface DynamicWeeklyScheduleProps {
  currentWeek?: number;
}

interface WeekDay {
  day: string;
  date: string;
  workout: string;
  duration: string;
  completed: boolean;
  isToday: boolean;
  isRest: boolean;
  exerciseCount: number;
  workoutDayId?: string;
  dayNumber: number;
}

export const DynamicWeeklySchedule = ({ currentWeek = 1 }: DynamicWeeklyScheduleProps) => {
  const { user } = useAuth();
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);

  useEffect(() => {
    console.log('DynamicWeeklySchedule useEffect triggered');
    console.log('User:', user);
    console.log('Current week:', currentWeek);
    
    if (user) {
      console.log('User found, fetching workout data...');
      fetchWorkoutData();
    } else {
      console.log('No user found, skipping data fetch');
    }
  }, [user, currentWeek]);

  const fetchWorkoutData = async () => {
    try {
      console.log('Starting fetchWorkoutData...');
      setLoading(true);

      // Buscar rotina ativa
      console.log('Fetching active routines for user:', user?.id);
      const { data: routines, error: routinesError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (routinesError) {
        console.error('Error fetching routines:', routinesError);
        return;
      }

      console.log('Routines query result:', routines);

      if (!routines || routines.length === 0) {
        console.log('No active routine found');
        setWorkoutDays([]);
        setExercises([]);
        setActiveRoutine(null);
        return;
      }

      const routine = routines[0];
      setActiveRoutine(routine);
      console.log('Active routine found:', routine.name, 'ID:', routine.id);

      // Buscar dias de treino da semana atual
      console.log(`Fetching workout days for routine ${routine.id}, week ${currentWeek}`);
      const { data: days, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .eq('routine_id', routine.id)
        .eq('week_number', currentWeek)
        .order('day_number', { ascending: true });

      if (daysError) {
        console.error('Error fetching workout days:', daysError);
        return;
      }

      console.log(`Workout days for week ${currentWeek}:`, days);
      setWorkoutDays(days || []);

      // Buscar exercícios
      if (days && days.length > 0) {
        console.log('Fetching exercises for workout days:', days.map(d => d.id));
        const { data: exerciseData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .in('workout_day_id', days.map(d => d.id))
          .order('exercise_order', { ascending: true });

        if (exercisesError) {
          console.error('Error fetching exercises:', exercisesError);
          return;
        }

        console.log('Exercises found:', exerciseData?.length || 0, exerciseData);
        setExercises(exerciseData || []);
      } else {
        console.log('No workout days found, setting exercises to empty array');
        setExercises([]);
      }

    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      console.log('fetchWorkoutData completed, setting loading to false');
      setLoading(false);
    }
  };

  const debugDatabase = async () => {
    if (!user) {
      console.log('No user for debug');
      return;
    }

    console.log('=== DEBUG DATABASE ===');
    
    // Verificar todas as rotinas do usuário
    const { data: allRoutines } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('All user routines:', allRoutines);

    // Verificar todos os dias de treino
    if (allRoutines && allRoutines.length > 0) {
      const { data: allDays } = await supabase
        .from('workout_days')
        .select('*')
        .in('routine_id', allRoutines.map(r => r.id));
      
      console.log('All workout days:', allDays);
      
      // Mostrar detalhes dos dias por semana
      if (allDays) {
        const daysByWeek = allDays.reduce((acc, day) => {
          if (!acc[day.week_number]) acc[day.week_number] = [];
          acc[day.week_number].push(day);
          return acc;
        }, {} as Record<number, typeof allDays>);
        
        console.log('Days grouped by week:', daysByWeek);
        
        // Verificar especificamente a semana 1
        const week1Days = allDays.filter(d => d.week_number === 1);
        console.log('Week 1 days specifically:', week1Days);
      }

      // Verificar todos os exercícios
      if (allDays && allDays.length > 0) {
        const { data: allExercises } = await supabase
          .from('exercises')
          .select('*')
          .in('workout_day_id', allDays.map(d => d.id));
        
        console.log('All exercises:', allExercises);
      }
    }

    console.log('=== END DEBUG ===');
  };

  const generateWeekDays = (): WeekDay[] => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    // Ajustar para começar na segunda-feira (1 = segunda)
    const startOfWeek = new Date(today);
    const daysToSubtract = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    const weekDays: WeekDay[] = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const isToday = currentDate.toDateString() === today.toDateString();
      const dayNumber = i + 1; // 1 = segunda, 2 = terça, etc.
      const workoutDay = workoutDays.find(wd => wd.day_number === dayNumber);
      const dayExercises = exercises.filter(ex => ex.workout_day_id === workoutDay?.id);
      
      // Remover lógica aleatória - progresso baseado em dados reais
      const completed = false; // Por enquanto, sem histórico de treinos concluídos
      
      weekDays.push({
        day: dayNames[i],
        date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        workout: workoutDay ? (workoutDay.is_rest_day ? 'Descanso' : workoutDay.day_name) : 'Livre',
        duration: workoutDay && !workoutDay.is_rest_day ? `${Math.max(dayExercises.length * 4, 25)}min` : '',
        completed,
        isToday,
        isRest: workoutDay?.is_rest_day || !workoutDay,
        exerciseCount: dayExercises.length,
        workoutDayId: workoutDay?.id,
        dayNumber
      });
    }

    return weekDays;
  };

  const weekDays = generateWeekDays();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="glass-card border-gray-800">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!activeRoutine) {
    return (
      <Card className="glass-card border-gray-800">
        <CardContent className="p-8 text-center">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhuma rotina ativa
          </h3>
          <p className="text-gray-400 mb-4">
            Crie uma rotina e ative-a para ver seu cronograma semanal
          </p>
          <Link to="/workouts">
            <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
              Criar Rotina
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (workoutDays.length === 0) {
    return (
      <Card className="glass-card border-gray-800">
        <CardContent className="p-8 text-center">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhum dia configurado
          </h3>
          <p className="text-gray-400 mb-4">
            A rotina "{activeRoutine.name}" não tem dias configurados para a semana {currentWeek}
          </p>
          <Link to={`/workouts/${activeRoutine.id}`}>
            <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
              Configurar Dias
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Rotina ativa: <span className="text-white font-medium">{activeRoutine.name}</span> • Semana {currentWeek}
        </div>
        
        {/* Botão de debug temporário */}
        <Button
          onClick={debugDatabase}
          variant="outline"
          size="sm"
          className="border-red-500 text-red-400 hover:bg-red-500/10"
        >
          Debug DB
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <Card 
            key={index} 
            className={`workout-card relative glass-card transition-all ${
              day.isToday 
                ? 'border-fitness-primary bg-gradient-to-br from-fitness-primary/10 to-fitness-secondary/10' 
                : day.completed 
                  ? 'border-fitness-success/30 bg-fitness-success/5'
                  : day.isRest
                    ? 'border-gray-600 bg-gray-800/30'
                    : 'border-gray-700'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{day.day}</h3>
                  <p className="text-sm text-gray-400">{day.date}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {day.isToday && (
                    <Badge className="bg-fitness-primary text-white text-xs">
                      Hoje
                    </Badge>
                  )}
                  {day.completed ? (
                    <CheckCircle className="w-5 h-5 text-fitness-success" />
                  ) : day.isRest ? (
                    <div className="w-5 h-5 text-gray-500 flex items-center justify-center">💤</div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`font-medium ${
                  day.isRest ? 'text-gray-400' : 'text-white'
                }`}>
                  {day.workout}
                </h4>
                
                {day.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    {day.duration}
                  </div>
                )}

                {day.exerciseCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Dumbbell className="w-3 h-3" />
                    {day.exerciseCount} exercícios
                  </div>
                )}

                {day.isToday && !day.completed && !day.isRest && day.workoutDayId && (
                  <Link to="/quick-workout">
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-fitness-primary hover:bg-fitness-primary/90"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Treinar
                    </Button>
                  </Link>
                )}
              </div>

              {day.isToday && !day.completed && !day.isRest && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-fitness-primary rounded-full animate-pulse"></div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 