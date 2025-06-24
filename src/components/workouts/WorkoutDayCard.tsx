import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Dumbbell, Play, Plus } from 'lucide-react';
import { useState } from 'react';

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

interface WorkoutDayCardProps {
  workoutDay: WorkoutDay;
  exercises: Exercise[];
  onAddExercise: (dayId: string) => void;
}

export function WorkoutDayCard({ workoutDay, exercises, onAddExercise }: WorkoutDayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedExercises = exercises.sort((a, b) => (a.exercise_order || 0) - (b.exercise_order || 0));

  const formatSeriesInfo = (exercise: Exercise) => {
    const parts = [];
    
    if (exercise.warmup_sets && exercise.warmup_sets !== '-') {
      parts.push(`Aquec: ${exercise.warmup_sets}`);
    }
    
    if (exercise.prep_sets && exercise.prep_sets !== '-') {
      parts.push(`Prep: ${exercise.prep_sets}`);
    }
    
    if (exercise.working_sets) {
      parts.push(`Valendo: ${exercise.working_sets}`);
    } else {
      // Fallback para exercícios antigos
      parts.push(`${exercise.sets} x ${exercise.reps}`);
    }
    
    return parts.join(' • ');
  };

  if (workoutDay.is_rest_day) {
    return (
      <Card className="glass-card border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">
              {workoutDay.day_name}
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              Dia de Descanso
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Aproveite para descansar e se recuperar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">
            {workoutDay.day_name}
          </CardTitle>
          <Badge variant="outline" className="border-fitness-primary text-fitness-primary">
            {sortedExercises.length} exercícios
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sortedExercises.length > 0 ? (
          <div className="space-y-3">
            {sortedExercises.slice(0, isExpanded ? undefined : 3).map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-3 bg-gray-800/50 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-fitness-primary/20 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-fitness-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{exercise.name}</p>
                      {exercise.weight_kg && (
                        <p className="text-gray-400 text-xs">Peso: {exercise.weight_kg}kg</p>
                      )}
                    </div>
                  </div>
                  {exercise.video_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => window.open(exercise.video_url!, '_blank')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Estrutura de Séries */}
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="font-medium">Estrutura:</div>
                  <div className="grid grid-cols-1 gap-1 pl-2">
                    {exercise.warmup_sets && exercise.warmup_sets !== '-' && (
                      <div>• <span className="text-blue-400">Aquecimento:</span> {exercise.warmup_sets}</div>
                    )}
                    {exercise.prep_sets && exercise.prep_sets !== '-' && (
                      <div>• <span className="text-yellow-400">Preparatórias:</span> {exercise.prep_sets}</div>
                    )}
                    {exercise.working_sets ? (
                      <div>• <span className="text-fitness-primary">Séries Valendo:</span> {exercise.working_sets}</div>
                    ) : (
                      <div>• <span className="text-fitness-primary">Séries:</span> {exercise.sets} x {exercise.reps}</div>
                    )}
                    {exercise.working_reps && (
                      <div>• <span className="text-fitness-primary">Reps Valendo:</span> {exercise.working_reps}</div>
                    )}
                  </div>
                  {exercise.rest_seconds && (
                    <div className="text-gray-500 text-xs mt-1">
                      Descanso: {exercise.rest_seconds}s
                    </div>
                  )}
                </div>
                
                {/* Notas de Execução */}
                {exercise.execution_notes && (
                  <div className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
                    <span className="font-medium">Notas:</span> {exercise.execution_notes}
                  </div>
                )}
              </div>
            ))}
            
            {sortedExercises.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Mostrar menos' : `Ver mais ${sortedExercises.length - 3} exercícios`}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Nenhum exercício adicionado ainda
            </p>
          </div>
        )}
        
        <Button
          onClick={() => onAddExercise(workoutDay.id)}
          variant="outline"
          size="sm"
          className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Exercício
        </Button>
      </CardContent>
    </Card>
  );
} 