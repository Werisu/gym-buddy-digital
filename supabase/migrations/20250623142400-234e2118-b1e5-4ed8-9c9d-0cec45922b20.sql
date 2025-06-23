
-- Criar tabela de rotinas de treino
CREATE TABLE public.workout_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_weeks INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de dias de treino dentro de uma rotina
CREATE TABLE public.workout_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL DEFAULT 1,
  day_number INTEGER NOT NULL, -- 1-7 (segunda a domingo)
  day_name TEXT NOT NULL, -- ex: "Segunda - Braços"
  is_rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de exercícios
CREATE TABLE public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- ex: "Barbell Curl"
  sets INTEGER NOT NULL, -- quantidade de séries
  reps TEXT NOT NULL, -- repetições (pode ser "10" ou "8-12" ou "até a falha")
  weight_kg DECIMAL(5,2), -- peso em kg (opcional)
  rest_seconds INTEGER, -- tempo de descanso em segundos
  video_url TEXT, -- link para vídeo demonstrativo
  execution_notes TEXT, -- notas sobre execução correta
  exercise_order INTEGER DEFAULT 1, -- ordem do exercício no treino
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para workout_routines
CREATE POLICY "Users can view their own workout routines" 
  ON public.workout_routines FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout routines" 
  ON public.workout_routines FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout routines" 
  ON public.workout_routines FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout routines" 
  ON public.workout_routines FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para workout_days
CREATE POLICY "Users can view their own workout days" 
  ON public.workout_days FOR SELECT 
  USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can insert their own workout days" 
  ON public.workout_days FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can update their own workout days" 
  ON public.workout_days FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

CREATE POLICY "Users can delete their own workout days" 
  ON public.workout_days FOR DELETE 
  USING (auth.uid() = (SELECT user_id FROM public.workout_routines WHERE id = routine_id));

-- Políticas RLS para exercises
CREATE POLICY "Users can view their own exercises" 
  ON public.exercises FOR SELECT 
  USING (auth.uid() = (SELECT wr.user_id FROM public.workout_routines wr 
                      JOIN public.workout_days wd ON wr.id = wd.routine_id 
                      WHERE wd.id = workout_day_id));

CREATE POLICY "Users can insert their own exercises" 
  ON public.exercises FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT wr.user_id FROM public.workout_routines wr 
                           JOIN public.workout_days wd ON wr.id = wd.routine_id 
                           WHERE wd.id = workout_day_id));

CREATE POLICY "Users can update their own exercises" 
  ON public.exercises FOR UPDATE 
  USING (auth.uid() = (SELECT wr.user_id FROM public.workout_routines wr 
                      JOIN public.workout_days wd ON wr.id = wd.routine_id 
                      WHERE wd.id = workout_day_id));

CREATE POLICY "Users can delete their own exercises" 
  ON public.exercises FOR DELETE 
  USING (auth.uid() = (SELECT wr.user_id FROM public.workout_routines wr 
                      JOIN public.workout_days wd ON wr.id = wd.routine_id 
                      WHERE wd.id = workout_day_id));

-- Trigger para atualizar updated_at nas rotinas
CREATE TRIGGER workout_routines_updated_at
  BEFORE UPDATE ON public.workout_routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices para melhor performance
CREATE INDEX idx_workout_days_routine_week ON public.workout_days(routine_id, week_number);
CREATE INDEX idx_exercises_workout_day ON public.exercises(workout_day_id);
CREATE INDEX idx_exercises_order ON public.exercises(workout_day_id, exercise_order);
