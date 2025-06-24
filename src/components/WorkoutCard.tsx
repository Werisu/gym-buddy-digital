import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play, Target, Users } from "lucide-react";

interface WorkoutCardProps {
  title: string;
  duration: string;
  exercises: number;
  difficulty: string;
  muscleGroups: string[];
  isToday?: boolean;
  onStart?: () => void;
  className?: string;
}

const difficultyColors = {
  'Iniciante': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Intermediário': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Avançado': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const WorkoutCard = ({ 
  title, 
  duration, 
  exercises, 
  difficulty, 
  muscleGroups, 
  isToday = false,
  onStart,
  className = ""
}: WorkoutCardProps) => {
  return (
    <Card className={`glass-card border-gray-800 hover:border-fitness-primary/50 transition-all duration-300 hover-lift card-entrance ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 animate-fade-in">
            <CardTitle className="text-lg font-semibold text-white hover-scale">
              {title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1 stagger-item">
                <Clock className="w-4 h-4 text-fitness-primary" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1 stagger-item">
                <Target className="w-4 h-4 text-fitness-primary" />
                <span>{exercises} exercícios</span>
              </div>
            </div>
          </div>
          {isToday && (
            <Badge className="bg-fitness-primary text-white">
              Hoje
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={`${difficultyColors[difficulty]} animate-scale-in`}
          >
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>Grupos Musculares:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((group, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-fitness-gray text-gray-300 text-xs"
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {isToday && (
          <Button 
            className="w-full bg-fitness-primary hover:bg-fitness-secondary text-white font-medium hover-glow animate-bounce-custom"
            size="lg"
            onClick={onStart}
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar Treino
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
