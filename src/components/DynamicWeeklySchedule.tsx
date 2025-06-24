import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Circle, Clock, Dumbbell, Play } from "lucide-react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
  currentWeek: number;
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
}

export const DynamicWeeklySchedule = ({ currentWeek }: DynamicWeeklyScheduleProps) => {
  const { user } = useAuth();
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user, currentWeek]);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);

      // Buscar rotina ativa
      const { data: routines } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (!routines || routines.length === 0) {
        setWorkoutDays([]);
        setExercises([]);
        return;
      }

      const activeRoutine = routines[0];

      // Buscar dias de treino da semana atual
      const { data: days } = await supabase
        .from('workout_days')
        .select('*')
        .eq('routine_id', activeRoutine.id)
        .eq('week_number', currentWeek)
        .order('day_number', { ascending: true });

      setWorkoutDays(days || []);

      // Buscar exercícios
      if (days && days.length > 0) {
        const { data: exerciseData } = await supabase
          .from('exercises')
          .select('*')
          .in('workout_day_id', days.map(d => d.id))
          .order('exercise_order', { ascending: true });

        setExercises(exerciseData || []);
      }

    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDays = (): WeekDay[] => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek + 1); // Segunda-feira

    const weekDays: WeekDay[] = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const isToday = currentDate.toDateString() === today.toDateString();
      const workoutDay = workoutDays.find(wd => wd.day_number === i + 1);
      const dayExercises = exercises.filter(ex => ex.workout_day_id === workoutDay?.id);
      
      // Simular progresso (pode ser expandido com dados reais)
      const completed = Math.random() > 0.5 && !isToday;
      
      weekDays.push({
        day: dayNames[i],
        date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        workout: workoutDay ? (workoutDay.is_rest_day ? 'Descanso' : workoutDay.day_name) : 'Livre',
        duration: workoutDay && !workoutDay.is_rest_day ? `${Math.max(dayExercises.length * 3, 20)}min` : '',
        completed: completed && workoutDay !== undefined,
        isToday,
        isRest: workoutDay?.is_rest_day || !workoutDay,
        exerciseCount: dayExercises.length,
        workoutDayId: workoutDay?.id
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

  if (workoutDays.length === 0) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
      {weekDays.map((day, index) => (
        <Card 
          key={index} 
          className={`workout-card relative ${
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
                  <div className="w-5 h-5 text-gray-500">💤</div>
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
  );
}; 