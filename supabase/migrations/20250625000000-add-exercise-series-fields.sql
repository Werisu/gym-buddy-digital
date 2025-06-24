-- Adicionar novos campos para estrutura de séries na tabela exercises
ALTER TABLE public.exercises 
ADD COLUMN warmup_sets TEXT, -- Séries de aquecimento (ex: "2x10" ou "-")
ADD COLUMN prep_sets TEXT, -- Séries preparatórias (ex: "2x 2-7" ou "-")
ADD COLUMN working_sets TEXT, -- Séries valendo (ex: "2x 8-10")
ADD COLUMN working_reps TEXT; -- Repetições valendo (ex: "8-10")

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.exercises.warmup_sets IS 'Séries de aquecimento no formato "2x10" ou "-" se não houver';
COMMENT ON COLUMN public.exercises.prep_sets IS 'Séries preparatórias no formato "2x 2-7" ou "-" se não houver';
COMMENT ON COLUMN public.exercises.working_sets IS 'Séries principais/valendo no formato "2x 8-10"';
COMMENT ON COLUMN public.exercises.working_reps IS 'Faixa de repetições das séries valendo no formato "8-10"'; 