import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, History, Home, LogOut, Trophy, User } from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header = ({ title, subtitle, showBack, onBack }: HeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
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
    <header className="glass-card border-b border-gray-800 sticky top-0 z-50 animate-slide-in-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-400 hover:text-white hover-scale"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold text-white">{title || 'Gym Buddy'}</h1>
              {subtitle && (
                <p className="text-sm text-gray-400 animate-slide-in-right">{subtitle}</p>
              )}
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
            <Link to="/workout-history" className={getNavItemClass('/workout-history')}>
              <History className="w-4 h-4" />
              <span className="text-sm">Histórico</span>
            </Link>
            <Link to="/profile" className={getNavItemClass('/profile')}>
              <User className="w-4 h-4" />
              <span className="text-sm">Perfil</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-400 hover-scale btn-animate"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}; 