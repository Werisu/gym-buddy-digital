
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle, 
  Settings,
  Dumbbell 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface WorkoutRoutineCardProps {
  routine: WorkoutRoutine;
  onDelete: (routineId: string) => void;
  onSetActive: (routineId: string) => void;
}

export function WorkoutRoutineCard({ routine, onDelete, onSetActive }: WorkoutRoutineCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="glass-card border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-fitness-primary" />
              {routine.name}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {routine.description || 'Sem descrição'}
            </CardDescription>
          </div>
          {routine.is_active && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ativa
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {routine.total_weeks} {routine.total_weeks === 1 ? 'semana' : 'semanas'}
            </div>
            <div>
              Criada em {formatDate(routine.created_at)}
            </div>
          </div>

          <div className="flex gap-2">
            <Link to={`/workouts/${routine.id}`} className="flex-1">
              <Button 
                size="sm" 
                className="w-full bg-fitness-primary hover:bg-fitness-primary/90"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </Link>
            
            {!routine.is_active && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetActive(routine.id)}
                className="border-green-600 text-green-400 hover:bg-green-600/20"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(routine.id)}
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
