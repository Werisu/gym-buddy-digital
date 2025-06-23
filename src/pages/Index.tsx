
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { StatsCard } from "@/components/StatsCard";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Trophy, TrendingUp, User, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, signOut, loading } = useAuth();

  // Redirect to auth if not logged in
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-fitness-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-fitness-primary" />
              <div>
                <h1 className="text-2xl font-bold text-white">Massive Fit</h1>
                <p className="text-sm text-gray-400">Braços e Ombros</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/workouts">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Treinos
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Olá, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Atleta'}! 💪
          </h2>
          <p className="text-gray-400">
            Pronto para mais um treino intenso? Vamos alcançar seus objetivos!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Calendar}
            title="Treinos na Semana"
            value="3/4"
            subtitle="75% concluído"
            progress={75}
          />
          <StatsCard
            icon={Trophy}
            title="Sequência"
            value="12"
            subtitle="dias consecutivos"
          />
          <StatsCard
            icon={TrendingUp}
            title="Progresso"
            value="+5kg"
            subtitle="no último mês"
          />
          <StatsCard
            icon={Dumbbell}
            title="Próximo Treino"
            value="Ombros"
            subtitle="hoje às 18:00"
          />
        </div>

        {/* Weekly Schedule */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Cronograma Semanal</h3>
          <WeeklySchedule currentWeek={1} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button 
            size="lg" 
            className="h-20 bg-fitness-primary hover:bg-fitness-primary/90 text-lg font-semibold"
          >
            <Dumbbell className="w-6 h-6 mr-3" />
            Iniciar Treino
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-20 border-gray-700 text-white hover:bg-gray-800 text-lg"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Ver Histórico
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-20 border-gray-700 text-white hover:bg-gray-800 text-lg"
          >
            <Trophy className="w-6 h-6 mr-3" />
            Conquistas
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
