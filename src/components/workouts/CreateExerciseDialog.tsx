import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateExercise: (exerciseData: {
    workout_day_id: string;
    name: string;
    sets: number;
    reps: string;
    weight_kg: number | null;
    rest_seconds: number | null;
    video_url: string | null;
    execution_notes: string | null;
    exercise_order: number | null;
    warmup_sets: string | null;
    prep_sets: string | null;
    working_sets: string | null;
    working_reps: string | null;
  }) => void;
  onBulkCreateExercises?: (exercises: Array<{
    workout_day_id: string;
    name: string;
    sets: number;
    reps: string;
    weight_kg: number | null;
    rest_seconds: number | null;
    video_url: string | null;
    execution_notes: string | null;
    exercise_order: number | null;
    warmup_sets: string | null;
    prep_sets: string | null;
    working_sets: string | null;
    working_reps: string | null;
  }>) => void;
  workoutDayId: string | null;
}

interface ParsedExercise {
  name: string;
  warmup_sets: string;
  prep_sets: string;
  working_sets: string;
  working_reps: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export function CreateExerciseDialog({ 
  open, 
  onOpenChange, 
  onCreateExercise,
  onBulkCreateExercises,
  workoutDayId 
}: CreateExerciseDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    sets: 3,
    reps: '10',
    weight_kg: '',
    rest_seconds: 60,
    video_url: '',
    execution_notes: '',
    exercise_order: 1,
    warmup_sets: '',
    prep_sets: '',
    working_sets: '',
    working_reps: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedExercises, setParsedExercises] = useState<ParsedExercise[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExerciseText = (text: string): ParsedExercise[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const exercises: ParsedExercise[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Formato 1: "Nome | Aquecimento | Preparatórias | Séries Valendo | Repetições Valendo"
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
          exercises.push({
            name: parts[0],
            warmup_sets: parts[1] === '-' ? '' : parts[1],
            prep_sets: parts[2] === '-' ? '' : parts[2],
            working_sets: parts[3],
            working_reps: parts[4]
          });
        }
      }
      // Formato 2: Linhas separadas com padrões específicos
      else if (line.toLowerCase().includes('exercício:') || line.toLowerCase().includes('exercise:')) {
        const exercise: ParsedExercise = {
          name: line.replace(/exercício:|exercise:/gi, '').trim(),
          warmup_sets: '',
          prep_sets: '',
          working_sets: '',
          working_reps: ''
        };
        
        // Procurar pelas próximas linhas com informações
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const nextLine = lines[j].toLowerCase();
          
          if (nextLine.includes('aquecimento:') || nextLine.includes('warmup:')) {
            exercise.warmup_sets = lines[j].split(':')[1]?.trim() || '';
          }
          if (nextLine.includes('preparatórias:') || nextLine.includes('prep:')) {
            exercise.prep_sets = lines[j].split(':')[1]?.trim() || '';
          }
          if (nextLine.includes('valendo:') || nextLine.includes('working:')) {
            exercise.working_sets = lines[j].split(':')[1]?.trim() || '';
          }
          if (nextLine.includes('repetições:') || nextLine.includes('reps:')) {
            exercise.working_reps = lines[j].split(':')[1]?.trim() || '';
          }
          if (nextLine.includes('peso:') || nextLine.includes('weight:')) {
            const weightStr = lines[j].split(':')[1]?.trim();
            if (weightStr) {
              exercise.weight_kg = parseFloat(weightStr.replace(/[^\d.,]/g, '').replace(',', '.'));
            }
          }
        }
        
        if (exercise.working_sets && exercise.working_reps) {
          exercises.push(exercise);
        }
      }
      // Formato 3: Nome simples seguido de informações na próxima linha
      else if (!line.includes(':') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.includes('x') || nextLine.includes('séries') || nextLine.includes('sets')) {
          exercises.push({
            name: line,
            warmup_sets: '',
            prep_sets: '',
            working_sets: nextLine.includes('x') ? nextLine.split(' ')[0] : '3x8-10',
            working_reps: nextLine.includes('x') ? nextLine.split('x')[1]?.split(' ')[0] || '8-10' : '8-10'
          });
          i++; // Pular a próxima linha pois já foi processada
        }
      }
    }
    
    return exercises;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setImportError('Por favor, selecione um arquivo .txt');
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseExerciseText(text);
      
      if (parsed.length === 0) {
        setImportError('Nenhum exercício válido encontrado no arquivo. Verifique o formato.');
        return;
      }

      setParsedExercises(parsed);
      setImportError(null);
    } catch (error) {
      setImportError('Erro ao ler o arquivo. Verifique se é um arquivo de texto válido.');
    }
  };

  const handleBulkImport = async () => {
    if (!workoutDayId || parsedExercises.length === 0 || !onBulkCreateExercises) return;

    setIsSubmitting(true);
    
    try {
      const exercisesToCreate = parsedExercises.map((exercise, index) => ({
        workout_day_id: workoutDayId,
        name: exercise.name,
        sets: calculateTotalSets(exercise),
        reps: exercise.working_reps || '8-10',
        weight_kg: exercise.weight_kg || null,
        rest_seconds: exercise.rest_seconds || 60,
        video_url: null,
        execution_notes: exercise.notes || null,
        exercise_order: index + 1,
        warmup_sets: exercise.warmup_sets || null,
        prep_sets: exercise.prep_sets || null,
        working_sets: exercise.working_sets,
        working_reps: exercise.working_reps
      }));

      await onBulkCreateExercises(exercisesToCreate);
      
      // Reset
      setParsedExercises([]);
      setImportMode(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing exercises:', error);
      setImportError('Erro ao importar exercícios. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalSets = (exercise: ParsedExercise): number => {
    let total = 0;
    
    // Contar séries de aquecimento
    if (exercise.warmup_sets && exercise.warmup_sets !== '-') {
      const warmupMatch = exercise.warmup_sets.match(/(\d+)x/);
      if (warmupMatch) total += parseInt(warmupMatch[1]);
    }
    
    // Contar séries preparatórias
    if (exercise.prep_sets && exercise.prep_sets !== '-') {
      const prepMatch = exercise.prep_sets.match(/(\d+)x/);
      if (prepMatch) total += parseInt(prepMatch[1]);
    }
    
    // Contar séries valendo
    if (exercise.working_sets) {
      const workingMatch = exercise.working_sets.match(/(\d+)x/);
      if (workingMatch) total += parseInt(workingMatch[1]);
    }
    
    return total || 3; // Default para 3 se não conseguir calcular
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutDayId || !formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCreateExercise({
        workout_day_id: workoutDayId,
        name: formData.name.trim(),
        sets: formData.sets,
        reps: formData.reps,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        rest_seconds: formData.rest_seconds,
        video_url: formData.video_url.trim() || null,
        execution_notes: formData.execution_notes.trim() || null,
        exercise_order: formData.exercise_order,
        warmup_sets: formData.warmup_sets.trim() || null,
        prep_sets: formData.prep_sets.trim() || null,
        working_sets: formData.working_sets.trim() || null,
        working_reps: formData.working_reps.trim() || null
      });

      // Reset form
      setFormData({
        name: '',
        sets: 3,
        reps: '10',
        weight_kg: '',
        rest_seconds: 60,
        video_url: '',
        execution_notes: '',
        exercise_order: 1,
        warmup_sets: '',
        prep_sets: '',
        working_sets: '',
        working_reps: ''
      });
    } catch (error) {
      console.error('Error creating exercise:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">
              {importMode ? 'Importar Exercícios' : 'Adicionar Exercício'}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImportMode(!importMode);
                  setImportError(null);
                  setParsedExercises([]);
                }}
                className="border-gray-700 text-gray-300"
              >
                {importMode ? <FileText className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {importMode ? 'Formulário' : 'Importar TXT'}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {importMode ? (
          <div className="space-y-6">
            {/* Área de Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">Selecione um arquivo .txt com seus exercícios</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700 text-gray-300"
                >
                  Escolher Arquivo
                </Button>
              </div>

              {/* Formatos Suportados */}
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Formatos Suportados:</h4>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <strong>Formato 1 - Tabela (separado por |):</strong>
                    <div className="bg-gray-900/50 p-2 rounded mt-1 font-mono">
                      Tríceps Barra V | 2x10 | 2x 2-7 | 2x 8-10 | 8-10<br/>
                      Posterior 45 Graus | 1x10 | 1x 2-7 | 2x 8-10 | 8-10
                    </div>
                  </div>
                  <div>
                    <strong>Formato 2 - Estruturado:</strong>
                    <div className="bg-gray-900/50 p-2 rounded mt-1 font-mono">
                      Exercício: Tríceps Barra V<br/>
                      Aquecimento: 2x10<br/>
                      Preparatórias: 2x 2-7<br/>
                      Valendo: 2x 8-10<br/>
                      Repetições: 8-10
                    </div>
                  </div>
                  <div>
                    <strong>Formato 3 - Simples:</strong>
                    <div className="bg-gray-900/50 p-2 rounded mt-1 font-mono">
                      Tríceps Barra V<br/>
                      3x 8-10
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Erro */}
            {importError && (
              <Alert className="border-red-800 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {importError}
                </AlertDescription>
              </Alert>
            )}

            {/* Preview dos Exercícios Parsed */}
            {parsedExercises.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Exercícios Encontrados ({parsedExercises.length})
                </h4>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {parsedExercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="font-medium text-white">{exercise.name}</div>
                      <div className="text-xs text-gray-400 mt-1 space-y-1">
                        {exercise.warmup_sets && (
                          <div>• Aquecimento: {exercise.warmup_sets}</div>
                        )}
                        {exercise.prep_sets && (
                          <div>• Preparatórias: {exercise.prep_sets}</div>
                        )}
                        <div>• Séries Valendo: {exercise.working_sets}</div>
                        <div>• Repetições: {exercise.working_reps}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setParsedExercises([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="border-gray-700 text-gray-300"
                    disabled={isSubmitting}
                  >
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkImport}
                    className="bg-fitness-primary hover:bg-fitness-primary/90"
                    disabled={isSubmitting || !onBulkCreateExercises}
                  >
                    {isSubmitting ? 'Importando...' : `Importar ${parsedExercises.length} Exercícios`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Formulário original
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nome do Exercício</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Tríceps Barra V de Costas"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Estrutura de Séries
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warmup_sets" className="text-gray-300">Séries Aquecimento</Label>
                  <Input
                    id="warmup_sets"
                    value={formData.warmup_sets}
                    onChange={(e) => handleInputChange('warmup_sets', e.target.value)}
                    placeholder="Ex: 2x10 ou - (opcional)"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">Use "-" se não houver aquecimento</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prep_sets" className="text-gray-300">Séries Preparatórias</Label>
                  <Input
                    id="prep_sets"
                    value={formData.prep_sets}
                    onChange={(e) => handleInputChange('prep_sets', e.target.value)}
                    placeholder="Ex: 2x 2-7 ou - (opcional)"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">Use "-" se não houver preparatórias</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="working_sets" className="text-gray-300">Séries Valendo</Label>
                  <Input
                    id="working_sets"
                    value={formData.working_sets}
                    onChange={(e) => handleInputChange('working_sets', e.target.value)}
                    placeholder="Ex: 2x 8-10"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-500">Séries principais do exercício</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="working_reps" className="text-gray-300">Repetições Valendo</Label>
                  <Input
                    id="working_reps"
                    value={formData.working_reps}
                    onChange={(e) => handleInputChange('working_reps', e.target.value)}
                    placeholder="Ex: 8-10"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-500">Faixa de repetições das séries valendo</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Configurações Básicas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets" className="text-gray-300">Total de Séries</Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={(e) => handleInputChange('sets', parseInt(e.target.value) || 1)}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  <p className="text-xs text-gray-500">Soma de todas as séries</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reps" className="text-gray-300">Repetições (Geral)</Label>
                  <Input
                    id="reps"
                    value={formData.reps}
                    onChange={(e) => handleInputChange('reps', e.target.value)}
                    placeholder="Ex: 8-10"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-500">Faixa geral de repetições</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-300">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.weight_kg}
                    onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                    placeholder="Opcional"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rest" className="text-gray-300">Descanso (seg)</Label>
                  <Select 
                    value={formData.rest_seconds.toString()} 
                    onValueChange={(value) => handleInputChange('rest_seconds', parseInt(value))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="45">45s</SelectItem>
                      <SelectItem value="60">60s</SelectItem>
                      <SelectItem value="90">90s</SelectItem>
                      <SelectItem value="120">120s</SelectItem>
                      <SelectItem value="180">180s</SelectItem>
                      <SelectItem value="240">240s</SelectItem>
                      <SelectItem value="300">300s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Informações Adicionais
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="video_url" className="text-gray-300">URL do Vídeo (opcional)</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Notas de Execução (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.execution_notes}
                  onChange={(e) => handleInputChange('execution_notes', e.target.value)}
                  placeholder="Dicas de execução, variações, observações técnicas..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Exemplo de Preenchimento:</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div><strong>Aquecimento:</strong> 2x10 (ou - se não houver)</div>
                <div><strong>Preparatórias:</strong> 2x 2-7 (ou - se não houver)</div>
                <div><strong>Séries Valendo:</strong> 2x 8-10</div>
                <div><strong>Repetições Valendo:</strong> 8-10</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-700 text-gray-300"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-fitness-primary hover:bg-fitness-primary/90"
                disabled={isSubmitting || !formData.name.trim() || !formData.working_sets.trim() || !formData.working_reps.trim()}
              >
                {isSubmitting ? 'Adicionando...' : 'Adicionar Exercício'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 