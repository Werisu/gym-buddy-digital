
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        if (!name.trim()) {
          toast({
            title: "Erro",
            description: "Nome é obrigatório",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        result = await signUp(email, password, name);
      }

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error.message,
          variant: "destructive"
        });
      } else if (!isLogin) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitness-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="w-12 h-12 text-fitness-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isLogin 
              ? 'Entre na sua conta para continuar' 
              : 'Crie sua conta no Massive Fit'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="bg-gray-800/50 border-gray-700 text-white"
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700 text-white"
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white pr-10"
                  placeholder="Sua senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-fitness-primary hover:bg-fitness-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-fitness-primary hover:text-fitness-primary/80"
            >
              {isLogin 
                ? 'Não tem conta? Criar conta' 
                : 'Já tem conta? Entrar'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
