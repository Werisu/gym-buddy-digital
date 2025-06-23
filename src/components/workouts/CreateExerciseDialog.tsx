import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

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
  }) => void;
  workoutDayId: string | null;
}

export function CreateExerciseDialog({ 
  open, 
  onOpenChange, 
  onCreateExercise, 
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
    exercise_order: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        exercise_order: formData.exercise_order
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
        exercise_order: 1
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
      <DialogContent className="glass-card border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Exercício</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Nome do Exercício</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Supino Reto"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets" className="text-gray-300">Séries</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                value={formData.sets}
                onChange={(e) => handleInputChange('sets', parseInt(e.target.value) || 1)}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reps" className="text-gray-300">Repetições</Label>
              <Input
                id="reps"
                value={formData.reps}
                onChange={(e) => handleInputChange('reps', e.target.value)}
                placeholder="Ex: 10 ou 8-12"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
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
                </SelectContent>
              </Select>
            </div>
          </div>

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
              placeholder="Dicas de execução, variações, etc."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              rows={3}
            />
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
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Exercício'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 