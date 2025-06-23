
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Calendar, 
  Trophy, 
  Target, 
  Clock, 
  Flame,
  ArrowRight,
  Play
} from "lucide-react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { StatsCard } from "@/components/StatsCard";
import { WeeklySchedule } from "@/components/WeeklySchedule";

const Index = () => {
  const [currentWeek] = useState(1);
  const [completedWorkouts] = useState(12);
  const totalWorkouts = 24;
  const currentStreak = 5;

  const todayWorkout = {
    title: "Braços - Bíceps Focus",
    duration: "45min",
    exercises: 6,
    difficulty: "Intermediário",
    muscleGroups: ["Bíceps", "Tríceps", "Antebraço"]
  };

  const recentWorkouts = [
    { name: "Ombros Posterior", date: "Ontem", duration: "40min", completed: true },
    { name: "Braços Completo", date: "2 dias atrás", duration: "50min", completed: true },
    { name: "Ombros Anterior", date: "3 dias atrás", duration: "35min", completed: true },
  ];

  return (
    <div className="min-h-screen bg-fitness-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-fitness-dark via-fitness-gray to-fitness-dark p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Massive Fit
              </h1>
              <p className="text-gray-400">Semana {currentWeek} • Braços e Ombros</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-fitness-primary/20 text-fitness-primary border-fitness-primary/30">
                <Flame className="w-4 h-4 mr-2" />
                {currentStreak} dias seguidos
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={Trophy}
              title="Treinos Completos"
              value={`${completedWorkouts}/${totalWorkouts}`}
              subtitle="50% concluído"
              progress={50}
            />
            <StatsCard
              icon={Target}
              title="Meta Semanal"
              value="3/4"
              subtitle="Treinos desta semana"
              progress={75}
            />
            <StatsCard
              icon={Clock}
              title="Tempo Total"
              value="18h 30min"
              subtitle="De treino registrado"
            />
            <StatsCard
              icon={Dumbbell}
              title="Exercícios"
              value="156"
              subtitle="Executados com sucesso"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Workout */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Treino de Hoje</h2>
                <Badge variant="outline" className="border-fitness-success text-fitness-success">
                  <Calendar className="w-4 h-4 mr-2" />
                  Hoje
                </Badge>
              </div>
              
              <WorkoutCard 
                {...todayWorkout}
                isToday={true}
                onStart={() => console.log("Iniciar treino")}
              />
            </section>

            {/* Weekly Schedule */}
            <section className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Cronograma da Semana</h2>
              <WeeklySchedule currentWeek={currentWeek} />
            </section>

            {/* Progress Overview */}
            <section className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Progresso Geral</h2>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-fitness-primary" />
                    Programa: Braços e Ombros Massivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progresso do programa</span>
                      <span className="text-white">{completedWorkouts}/{totalWorkouts} treinos</span>
                    </div>
                    <Progress 
                      value={(completedWorkouts / totalWorkouts) * 100} 
                      className="h-2 bg-fitness-gray"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 rounded-lg bg-fitness-gray/50">
                      <p className="text-2xl font-bold text-fitness-success">{currentStreak}</p>
                      <p className="text-sm text-gray-400">Dias consecutivos</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-fitness-gray/50">
                      <p className="text-2xl font-bold text-fitness-secondary">89%</p>
                      <p className="text-sm text-gray-400">Taxa de conclusão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Treino de Hoje
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Cronograma
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Trophy className="w-4 h-4 mr-2" />
                  Histórico
                </Button>
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Treinos Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWorkouts.map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-fitness-gray/30 hover:bg-fitness-gray/50 transition-colors">
                    <div>
                      <p className="font-medium text-white">{workout.name}</p>
                      <p className="text-sm text-gray-400">{workout.date} • {workout.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {workout.completed && (
                        <div className="w-2 h-2 bg-fitness-success rounded-full"></div>
                      )}
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="glass-card bg-gradient-to-br from-fitness-primary/10 to-fitness-secondary/10 border-fitness-primary/20">
              <CardContent className="p-6 text-center">
                <Flame className="w-12 h-12 text-fitness-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Continue assim!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Você está no caminho certo para conquistar braços e ombros massivos. 
                  Cada treino te leva mais perto do seu objetivo!
                </p>
                <Button size="sm" className="btn-primary">
                  Ver Progresso Detalhado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
