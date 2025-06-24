import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black">
      <Header 
        title="Gym Buddy"
        subtitle="Página não encontrada"
      />
      
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="glass-card border-gray-800 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl font-bold text-fitness-primary mb-4">404</div>
            <h2 className="text-2xl font-bold text-white mb-2">Página não encontrada</h2>
            <p className="text-gray-400 mb-6">
              A página que você está procurando não existe ou foi movida.
            </p>
            <Link to="/">
              <Button className="bg-fitness-primary hover:bg-fitness-primary/90">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
