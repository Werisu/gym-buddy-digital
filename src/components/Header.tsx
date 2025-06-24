import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Dumbbell, Home, LogOut, Trophy, User } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavItemClass = (path: string) => {
    return isActive(path)
      ? "flex items-center gap-2 text-fitness-primary font-medium"
      : "flex items-center gap-2 text-gray-300 hover:text-fitness-primary transition-colors";
  };

  return (
    <header className="glass-card border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fitness-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {title || 'Gym Buddy'}
              </h1>
              <p className="text-xs text-gray-400">
                {subtitle || 'Seu companheiro de treino'}
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={getNavItemClass('/')}>
              <Home className="w-4 h-4" />
              <span className="text-sm">Início</span>
            </Link>
            <Link to="/quick-workout" className={getNavItemClass('/quick-workout')}>
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Treino Rápido</span>
            </Link>
            <Link to="/workouts" className={getNavItemClass('/workouts')}>
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Rotinas</span>
            </Link>
            <Link to="/profile" className={getNavItemClass('/profile')}>
              <User className="w-4 h-4" />
              <span className="text-sm">Perfil</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
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
  );
} 