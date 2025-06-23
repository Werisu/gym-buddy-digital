
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoutine: (routineData: {
    name: string;
    description: string | null;
    total_weeks: number | null;
    is_active: boolean | null;
  }) => void;
}

export function CreateRoutineDialog({ open, onOpenChange, onCreateRoutine }: CreateRoutineDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_weeks: '4',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    onCreateRoutine({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      total_weeks: parseInt(formData.total_weeks) || null,
      is_active: false,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      total_weeks: '4',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Nova Rotina de Treino</DialogTitle>
          <DialogDescription className="text-gray-400">
            Crie uma nova rotina para organizar seus treinos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Rotina *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Hipertrofia - Push/Pull/Legs"
              className="bg-gray-800/50 border-gray-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os objetivos e características desta rotina..."
              className="bg-gray-800/50 border-gray-700"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_weeks">Duração (semanas)</Label>
            <Select
              value={formData.total_weeks}
              onValueChange={(value) => setFormData(prev => ({ ...prev, total_weeks: value }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1" className="text-white">1 semana</SelectItem>
                <SelectItem value="2" className="text-white">2 semanas</SelectItem>
                <SelectItem value="4" className="text-white">4 semanas</SelectItem>
                <SelectItem value="6" className="text-white">6 semanas</SelectItem>
                <SelectItem value="8" className="text-white">8 semanas</SelectItem>
                <SelectItem value="12" className="text-white">12 semanas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-fitness-primary hover:bg-fitness-primary/90"
            >
              Criar Rotina
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
