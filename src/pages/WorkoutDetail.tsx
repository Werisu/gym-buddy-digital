
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateExerciseDialog } from '@/components/workouts/CreateExerciseDialog';
import { CreateWorkoutDayDialog } from '@/components/workouts/CreateWorkoutDayDialog';
import { WorkoutDayCard } from '@/components/workouts/WorkoutDayCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number | null;
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
  warmup_sets: string | null;
  prep_sets: string | null;
  working_sets: string | null;
  working_reps: string | null;
}

export default function WorkoutDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateDayDialog, setShowCreateDayDialog] = useState(false);
  const [showCreateExerciseDialog, setShowCreateExerciseDialog] = useState(false);
  const [selectedWorkoutDayId, setSelectedWorkoutDayId] = useState<string | null>(null);

  useEffect(() => {
    if (routineId && user) {
      fetchRoutineData();
    }
  }, [routineId, user]);

  const fetchRoutineData = async () => {
    try {
      // Buscar dados da rotina
      const { data: routineData, error: routineError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError) throw routineError;
      setRoutine(routineData);

      // Buscar dias de treino
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .eq('routine_id', routineId)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (daysError) throw daysError;
      setWorkoutDays(daysData || []);

      // Buscar exercícios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_day_id', (daysData || []).map(day => day.id))
        .order('exercise_order', { ascending: true });

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da rotina",
        variant: "destructive"
      });
      console.error('Error fetching routine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkoutDay = async (dayData: Omit<WorkoutDay, 'id' | 'routine_id'>) => {
    try {
      const { data, error } = await supabase
        .from('workout_days')
        .insert([{
          ...dayData,
          routine_id: routineId
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkoutDays(prev => [...prev, data].sort((a, b) => {
        if (a.week_number !== b.week_number) {
          return a.week_number - b.week_number;
        }
        return a.day_number - b.day_number;
      }));
      
      setShowCreateDayDialog(false);
      
      toast({
        title: "Sucesso!",
        description: "Dia de treino criado com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar dia de treino";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

      if (error) throw error;

      setExercises(prev => [...prev, data]);
      setShowCreateExerciseDialog(false);
      setSelectedWorkoutDayId(null);
      
      toast({
        title: "Sucesso!",
        description: "Exercício adicionado com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar exercício";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleBulkCreateExercises = async (exercisesData: Array<Omit<Exercise, 'id'>>) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(exercisesData)
        .select();

      if (error) throw error;

      setExercises(prev => [...prev, ...data]);
      setShowCreateExerciseDialog(false);
      setSelectedWorkoutDayId(null);
      
      toast({
        title: "Sucesso!",
        description: `${exercisesData.length} exercícios importados com sucesso`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao importar exercícios";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getWeekNumbers = () => {
    const weeks = [...new Set(workoutDays.map(day => day.week_number))].sort();
    return weeks.length > 0 ? weeks : [1];
  };

  const getCurrentWeekDays = () => {
    return workoutDays.filter(day => day.week_number === currentWeek);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <Card className="glass-card border-gray-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Rotina não encontrada
            </h3>
            <Link to="/workouts">
              <Button variant="outline" className="border-gray-700 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar às Rotinas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/workouts">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{routine.name}</h1>
            {routine.description && (
              <p className="text-gray-400 mt-1">{routine.description}</p>
            )}
          </div>
        </div>

        <Tabs value={currentWeek.toString()} onValueChange={(value) => setCurrentWeek(parseInt(value))}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-gray-800 border-gray-700">
              {getWeekNumbers().map(week => (
                <TabsTrigger 
                  key={week} 
                  value={week.toString()}
                  className="data-[state=active]:bg-fitness-primary"
                >
                  Semana {week}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Button
              onClick={() => setShowCreateDayDialog(true)}
              className="bg-fitness-primary hover:bg-fitness-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Dia
            </Button>
          </div>

          {getWeekNumbers().map(week => (
            <TabsContent key={week} value={week.toString()}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentWeekDays().map((day) => (
                  <WorkoutDayCard
                    key={day.id}
                    workoutDay={day}
                    exercises={exercises.filter(ex => ex.workout_day_id === day.id)}
                    onAddExercise={(dayId) => {
                      setSelectedWorkoutDayId(dayId);
                      setShowCreateExerciseDialog(true);
                    }}
                  />
                ))}
                
                {getCurrentWeekDays().length === 0 && (
                  <Card className="glass-card border-gray-800 col-span-full">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Nenhum dia criado para a Semana {currentWeek}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Comece criando os dias de treino para esta semana
                      </p>
                      <Button
                        onClick={() => setShowCreateDayDialog(true)}
                        className="bg-fitness-primary hover:bg-fitness-primary/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Dia
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <CreateWorkoutDayDialog
          open={showCreateDayDialog}
          onOpenChange={setShowCreateDayDialog}
          onCreateWorkoutDay={handleCreateWorkoutDay}
          currentWeek={currentWeek}
          totalWeeks={routine.total_weeks || 1}
        />

        <CreateExerciseDialog
          open={showCreateExerciseDialog}
          onOpenChange={(open) => {
            setShowCreateExerciseDialog(open);
            if (!open) setSelectedWorkoutDayId(null);
          }}
          onCreateExercise={handleCreateExercise}
          onBulkCreateExercises={handleBulkCreateExercises}
          workoutDayId={selectedWorkoutDayId}
        />
      </div>
    </div>
  );
}
