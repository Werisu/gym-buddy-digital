import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
    Check,
    Dumbbell,
    Pause,
    Play,
    SkipForward,
    Timer,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

interface WorkoutDay {
  id: string;
  routine_id: string;
  week_number: number;
  day_number: number;
  day_name: string;
  is_rest_day: boolean | null;
}

interface WorkoutExecutionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutDay: WorkoutDay;
  exercises: Exercise[];
}

interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  isCompleted: boolean;
}

export function WorkoutExecution({ 
  open, 
  onOpenChange, 
  workoutDay, 
  exercises 
}: WorkoutExecutionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [workoutStartDate, setWorkoutStartDate] = useState<string | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sortedExercises = exercises.sort((a, b) => (a.exercise_order || 0) - (b.exercise_order || 0));
  const currentExercise = sortedExercises[currentExerciseIndex];
  const currentProgress = exerciseProgress.find(p => p.exerciseId === currentExercise?.id);

  useEffect(() => {
    if (open) {
      setWorkoutStartDate(new Date().toISOString().split('T')[0]);
      setWorkoutStartTime(new Date());
      setExerciseProgress(
        sortedExercises.map(ex => ({
          exerciseId: ex.id,
          completedSets: 0,
          isCompleted: false
        }))
      );
      setCurrentExerciseIndex(0);
      setIsResting(false);
      setRestTimeLeft(0);
      setIsPaused(false);
    }
  }, [open, sortedExercises]);

  useEffect(() => {
    if (workoutStartTime && !isPaused) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutDuration(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [workoutStartTime, isPaused]);

  useEffect(() => {
    if (isResting && restTimeLeft > 0 && !isPaused) {
      restTimerRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [isResting, restTimeLeft, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
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
    if (!currentExercise) return;

    setExerciseProgress(prev => 
      prev.map(p => 
        p.exerciseId === currentExercise.id 
          ? { ...p, isCompleted: true }
          : p
      )
    );

    // Iniciar descanso se houver próximo exercício
    if (currentExerciseIndex < sortedExercises.length - 1) {
      const nextExercise = sortedExercises[currentExerciseIndex + 1];
      if (nextExercise.rest_seconds) {
        setIsResting(true);
        setRestTimeLeft(nextExercise.rest_seconds);
      }
    }

    // Avançar para próximo exercício
    if (currentExerciseIndex < sortedExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const saveWorkoutToHistory = async () => {
    if (!user || !workoutDay || !workoutStartDate) return;

    try {
      const completedExercises = exerciseProgress.filter(p => p.isCompleted).length;
      const totalExercises = sortedExercises.length;

      console.log('=== DEBUG SALVAMENTO TREINO (WorkoutExecution) ===');
      console.log('workoutStartDate:', workoutStartDate);
      console.log('Data atual:', new Date().toISOString().split('T')[0]);
      console.log('workoutDay.day_name:', workoutDay.day_name);

      const workoutHistoryData = {
        user_id: user.id,
        workout_name: workoutDay.day_name,
        workout_date: workoutStartDate,
        duration_minutes: Math.round(workoutDuration / 60),
        exercises_completed: completedExercises,
        total_exercises: totalExercises
      };

      console.log('Dados que serão salvos (WorkoutExecution):', workoutHistoryData);

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
        console.log('Treino salvo com sucesso (WorkoutExecution)!');
        toast({
          title: "Treino Salvo!",
          description: "Seu treino foi registrado no histórico com sucesso",
        });
        
        // Disparar evento para notificar outras páginas
        window.dispatchEvent(new CustomEvent('workoutCompleted'));
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

  const handleNextExercise = () => {
    if (currentExerciseIndex < sortedExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsResting(false);
      setRestTimeLeft(0);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setIsResting(false);
      setRestTimeLeft(0);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Executando: {workoutDay.day_name}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progresso Geral */}
        <div className="space-y-4">
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

        {/* Cronômetro de Descanso */}
        {isResting && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-fitness-primary" />
                  <span className="text-white font-semibold">Descanso</span>
                </div>
                <div className="text-3xl font-bold text-fitness-primary mb-3">
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

        {/* Exercício Atual */}
        {currentExercise && !isResting && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">
                  {currentExercise.name}
                </CardTitle>
                <Badge variant="outline" className="border-fitness-primary text-fitness-primary">
                  {currentExerciseIndex + 1}/{totalExercises}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informações do Exercício */}
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

              {/* Notas de Execução */}
              {currentExercise.execution_notes && (
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Notas de Execução:</div>
                  <div className="text-white text-sm">{currentExercise.execution_notes}</div>
                </div>
              )}

              {/* Progresso das Séries */}
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

              {/* Botões de Controle */}
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

        {/* Navegação */}
        <div className="flex justify-between">
          <Button
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            Exercício Anterior
          </Button>
          <Button
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === totalExercises - 1}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            Próximo Exercício
          </Button>
        </div>

        {/* Treino Concluído */}
        {isWorkoutComplete && (
          <Card className="bg-green-900/20 border-green-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Treino Concluído!
              </h3>
              <p className="text-gray-300 mb-4">
                Parabéns! Você completou todos os exercícios do {workoutDay.day_name}
              </p>
              <p className="text-sm text-gray-400">
                Duração total: {formatTime(workoutDuration)}
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
} 