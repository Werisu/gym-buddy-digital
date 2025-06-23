
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Play, Users } from "lucide-react";

interface WorkoutCardProps {
  title: string;
  duration: string;
  exercises: number;
  difficulty: string;
  muscleGroups: string[];
  isToday?: boolean;
  onStart?: () => void;
}

export const WorkoutCard = ({ 
  title, 
  duration, 
  exercises, 
  difficulty, 
  muscleGroups, 
  isToday = false,
  onStart 
}: WorkoutCardProps) => {
  return (
    <Card className={`workout-card ${isToday ? 'border-fitness-primary/50 bg-gradient-to-br from-fitness-primary/5 to-fitness-secondary/5' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white mb-2">{title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration}
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {exercises} exercícios
              </div>
            </div>
          </div>
          {isToday && (
            <Badge className="bg-fitness-primary text-white">
              Hoje
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {difficulty}
            </Badge>
          </div>
        </div>

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
            className="w-full btn-primary mt-4" 
            size="lg"
            onClick={onStart}
          >
            <Play className="w-5 h-5 mr-2" />
            Começar Treino
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
