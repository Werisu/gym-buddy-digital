
-- Criar tabela de perfis dos usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  weight DECIMAL(5,2), -- peso em kg
  height INTEGER, -- altura em cm
  age INTEGER,
  goal TEXT CHECK (goal IN ('hipertrofia', 'força', 'resistencia', 'perda_peso')),
  experience_level TEXT CHECK (experience_level IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de treinos
CREATE TABLE public.workout_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  workout_date DATE NOT NULL,
  duration_minutes INTEGER,
  exercises_completed INTEGER,
  total_exercises INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de feedback dos treinos
CREATE TABLE public.workout_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_history_id UUID REFERENCES public.workout_history(id) ON DELETE CASCADE,
  fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 5), -- 1-5
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 5), -- 1-5
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5), -- 1-5
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para workout_history
CREATE POLICY "Users can view their own workout history" 
  ON public.workout_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history" 
  ON public.workout_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history" 
  ON public.workout_history FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para workout_feedback
CREATE POLICY "Users can view their own workout feedback" 
  ON public.workout_feedback FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout feedback" 
  ON public.workout_feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout feedback" 
  ON public.workout_feedback FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at no profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
