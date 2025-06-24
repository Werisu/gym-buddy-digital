import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
    Calendar,
    Check,
    Dumbbell,
    Pause,
    Play,
    Plus,
    SkipForward,
    Timer,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number | null;
  is_active: boolean | null;
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

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  isCompleted: boolean;
}

export default function QuickWorkout() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  
  // Workout execution states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRoutines();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoutine) {
      fetchWorkoutDays();
    }
  }, [selectedRoutine]);

  useEffect(() => {
    if (selectedDay) {
      fetchExercises();
    }
  }, [selectedDay]);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao carregar rotinas: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutDays = async () => {
    if (!selectedRoutine) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_days')
        .select('*')
        .eq('routine_id', selectedRoutine.id)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (error) throw error;
      setWorkoutDays(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao carregar dias de treino: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const fetchExercises = async () => {
    if (!selectedDay) return;
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_day_id', selectedDay.id)
        .order('exercise_order', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao carregar exercícios: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const startWorkout = () => {
    if (!selectedDay || exercises.length === 0) return;
    
    setIsWorkoutStarted(true);
    setWorkoutStartTime(new Date());
    setExerciseProgress(
      exercises.map(ex => ({
        exerciseId: ex.id,
        completedSets: 0,
        isCompleted: false
      }))
    );
    setCurrentExerciseIndex(0);
    setIsResting(false);
    setRestTimeLeft(0);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    setExerciseProgress(prev => 
      prev.map(p => 
        p.exerciseId === currentExercise.id 
          ? { ...p, completedSets: p.completedSets + 1 }
          : p
      )
    );
  };

  const handleCompleteExercise = () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    setExerciseProgress(prev => 
      prev.map(p => 
        p.exerciseId === currentExercise.id 
          ? { ...p, isCompleted: true }
          : p
      )
    );

    // Iniciar descanso se houver próximo exercício
    if (currentExerciseIndex < exercises.length - 1) {
      const nextExercise = exercises[currentExerciseIndex + 1];
      if (nextExercise.rest_seconds) {
        setIsResting(true);
        setRestTimeLeft(nextExercise.rest_seconds);
      }
    }

    // Avançar para próximo exercício
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const saveWorkoutToHistory = async () => {
    if (!user || !selectedDay || !selectedRoutine) return;

    try {
      const completedExercises = exerciseProgress.filter(p => p.isCompleted).length;
      const totalExercises = exercises.length;

      const workoutHistoryData = {
        user_id: user.id,
        workout_name: selectedDay.day_name,
        workout_date: new Date().toISOString().split('T')[0], // Data atual
        duration_minutes: Math.round(workoutDuration / 60), // Converter segundos para minutos
        exercises_completed: completedExercises,
        total_exercises: totalExercises
      };

      const { error } = await supabase
        .from('workout_history')
        .insert([workoutHistoryData]);

      if (error) {
        console.error('Error saving workout history:', error);
        toast({
          title: "Aviso",
          description: "Treino concluído, mas houve erro ao salvar no histórico",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Treino Salvo!",
          description: "Seu treino foi registrado no histórico com sucesso",
        });
      }
    } catch (error) {
      console.error('Error saving workout to history:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar treino no histórico",
        variant: "destructive"
      });
    }
  };

  const sortedExercises = exercises.sort((a, b) => (a.exercise_order || 0) - (b.exercise_order || 0));
  const currentExercise = sortedExercises[currentExerciseIndex];
  const currentProgress = exerciseProgress.find(p => p.exerciseId === currentExercise?.id);
  const totalExercises = sortedExercises.length;
  const completedExercises = exerciseProgress.filter(p => p.isCompleted).length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const isWorkoutComplete = completedExercises === totalExercises && totalExercises > 0;

  // Salvar automaticamente quando treino é concluído
  useEffect(() => {
    if (isWorkoutComplete && !isPaused) {
      saveWorkoutToHistory();
    }
  }, [isWorkoutComplete, isPaused]);

  // Redirect if not authenticated
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  // Workout execution view
  if (isWorkoutStarted && selectedDay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWorkoutStarted(false)}
                className="border-gray-700 text-gray-300"
              >
                <Play className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedDay.day_name}</h1>
                <p className="text-gray-400">{selectedRoutine?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Duração</div>
              <div className="text-lg font-semibold text-white">{formatTime(workoutDuration)}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Progresso: {completedExercises}/{totalExercises} exercícios</span>
              <span>Duração: {formatTime(workoutDuration)}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-gray-400 hover:text-white"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <span className="text-sm text-gray-400">
                {isPaused ? 'Pausado' : 'Executando'}
              </span>
            </div>
          </div>

          {/* Rest Timer */}
          {isResting && (
            <Card className="bg-gray-800/50 border-gray-700 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Timer className="w-6 h-6 text-fitness-primary" />
                    <span className="text-white font-semibold text-lg">Descanso</span>
                  </div>
                  <div className="text-4xl font-bold text-fitness-primary mb-4">
                    {formatTime(restTimeLeft)}
                  </div>
                  <Button
                    onClick={handleSkipRest}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Pular Descanso
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Exercise */}
          {currentExercise && !isResting && (
            <Card className="bg-gray-800/50 border-gray-700 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">
                    {currentExercise.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-fitness-primary text-fitness-primary">
                    {currentExerciseIndex + 1}/{totalExercises}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exercise Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400">Séries</div>
                    <div className="text-white font-semibold">{currentExercise.sets}</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400">Repetições</div>
                    <div className="text-white font-semibold">{currentExercise.reps}</div>
                  </div>
                  {currentExercise.weight_kg && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400">Peso</div>
                      <div className="text-white font-semibold">{currentExercise.weight_kg}kg</div>
                    </div>
                  )}
                  {currentExercise.rest_seconds && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400">Descanso</div>
                      <div className="text-white font-semibold">{currentExercise.rest_seconds}s</div>
                    </div>
                  )}
                </div>

                {/* Execution Notes */}
                {currentExercise.execution_notes && (
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Notas de Execução:</div>
                    <div className="text-white text-sm">{currentExercise.execution_notes}</div>
                  </div>
                )}

                {/* Sets Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Progresso das Séries:</span>
                    <span className="text-white font-semibold">
                      {currentProgress?.completedSets || 0}/{currentExercise.sets}
                    </span>
                  </div>
                  <Progress 
                    value={currentProgress ? (currentProgress.completedSets / currentExercise.sets) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleCompleteSet}
                    disabled={!currentProgress || currentProgress.completedSets >= currentExercise.sets}
                    className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Completar Série
                  </Button>
                  <Button
                    onClick={handleCompleteExercise}
                    disabled={!currentProgress || currentProgress.completedSets < currentExercise.sets}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar Exercício
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workout Complete */}
          {isWorkoutComplete && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Treino Concluído!
                </h3>
                <p className="text-gray-300 mb-4">
                  Parabéns! Você completou todos os exercícios do {selectedDay.day_name}
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Duração total: {formatTime(workoutDuration)}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setIsWorkoutStarted(false)}
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                  >
                    Voltar ao Início
                  </Button>
                  <Link to="/workouts">
                    <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
                      Ver Todos os Treinos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Routine and day selection view
  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      <Header 
        title="Gym Buddy"
        subtitle="Treino Rápido"
      />

      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8 mt-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-fitness-primary" />
            Treino Rápido
          </h2>
          <p className="text-gray-400">Escolha uma rotina e comece seu treino agora!</p>
        </div>

        {routines.length === 0 ? (
          <Card className="glass-card border-gray-800">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma rotina encontrada
              </h3>
              <p className="text-gray-400 mb-6">
                Crie uma rotina primeiro para começar a treinar
              </p>
              <Link to="/workouts">
                <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Rotina
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Routines Selection */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Escolha uma Rotina</h2>
              <div className="space-y-3">
                {routines.map((routine) => (
                  <Card
                    key={routine.id}
                    className={`glass-card border-gray-800 cursor-pointer transition-all ${
                      selectedRoutine?.id === routine.id
                        ? 'border-fitness-primary bg-fitness-primary/10'
                        : 'hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">{routine.name}</h3>
                          {routine.description && (
                            <p className="text-gray-400 text-sm mt-1">{routine.description}</p>
                          )}
                        </div>
                        {routine.is_active && (
                          <Badge className="bg-fitness-primary text-white">Ativa</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Days Selection */}
            {selectedRoutine && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Escolha um Dia</h2>
                {workoutDays.length === 0 ? (
                  <Card className="glass-card border-gray-800">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Nenhum dia criado
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Esta rotina ainda não tem dias de treino configurados
                      </p>
                      <Link to={`/workouts/${selectedRoutine.id}`}>
                        <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
                          Configurar Dias
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {workoutDays.map((day) => {
                      const dayExercises = exercises.filter(ex => ex.workout_day_id === day.id);
                      return (
                        <Card
                          key={day.id}
                          className={`glass-card border-gray-800 cursor-pointer transition-all ${
                            selectedDay?.id === day.id
                              ? 'border-fitness-primary bg-fitness-primary/10'
                              : 'hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedDay(day)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-white font-semibold">{day.day_name}</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                  {dayExercises.length} exercícios
                                </p>
                              </div>
                              {day.is_rest_day ? (
                                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                  Descanso
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-fitness-primary text-fitness-primary">
                                  Treino
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Start Workout Button */}
        {selectedDay && !selectedDay.is_rest_day && exercises.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={startWorkout}
              size="lg"
              className="bg-fitness-primary hover:bg-fitness-primary/90 text-lg font-semibold px-8 py-4"
            >
              <Play className="w-6 h-6 mr-3" />
              Iniciar Treino - {selectedDay.day_name}
            </Button>
            <p className="text-gray-400 text-sm mt-2">
              {exercises.length} exercícios • Aproximadamente 45-60 minutos
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 