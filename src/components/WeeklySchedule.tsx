
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface WeeklyScheduleProps {
  currentWeek: number;
}

export const WeeklySchedule = ({ currentWeek }: WeeklyScheduleProps) => {
  const weekdays = [
    {
      day: "Segunda",
      date: "22/06",
      workout: "Braços - Bíceps Focus",
      duration: "45min",
      completed: true,
      isToday: false
    },
    {
      day: "Terça",
      date: "23/06", 
      workout: "Ombros - Desenvolvimento",
      duration: "40min",
      completed: true,
      isToday: false
    },
    {
      day: "Quarta",
      date: "24/06",
      workout: "Braços - Tríceps Power",
      duration: "50min",
      completed: false,
      isToday: true
    },
    {
      day: "Quinta",
      date: "25/06",
      workout: "Ombros Posterior",
      duration: "35min",
      completed: false,
      isToday: false
    },
    {
      day: "Sexta",
      date: "26/06",
      workout: "Braços Completo",
      duration: "55min",
      completed: false,
      isToday: false
    },
    {
      day: "Sábado",
      date: "27/06",
      workout: "Descanso",
      duration: "",
      completed: false,
      isToday: false,
      isRest: true
    },
    {
      day: "Domingo",
      date: "28/06",
      workout: "Descanso",
      duration: "",
      completed: false,
      isToday: false,
      isRest: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {weekdays.map((day, index) => (
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
