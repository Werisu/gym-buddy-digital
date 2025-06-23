
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreateWorkoutDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkoutDay: (dayData: {
    week_number: number;
    day_number: number;
    day_name: string;
    is_rest_day: boolean | null;
  }) => void;
  currentWeek: number;
  totalWeeks: number;
}

export function CreateWorkoutDayDialog({ 
  open, 
  onOpenChange, 
  onCreateWorkoutDay, 
  currentWeek,
  totalWeeks 
}: CreateWorkoutDayDialogProps) {
  const [formData, setFormData] = useState({
    week_number: currentWeek.toString(),
    day_number: '1',
    day_name: '',
    is_rest_day: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day_name.trim()) {
      return;
    }

    onCreateWorkoutDay({
      week_number: parseInt(formData.week_number),
      day_number: parseInt(formData.day_number),
      day_name: formData.day_name.trim(),
      is_rest_day: formData.is_rest_day,
    });

    // Reset form
    setFormData({
      week_number: currentWeek.toString(),
      day_number: '1',
      day_name: '',
      is_rest_day: false,
    });
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return days[dayNumber - 1] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Novo Dia de Treino</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione um novo dia à sua rotina de treinos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week_number">Semana</Label>
              <Select
                value={formData.week_number}
                onValueChange={(value) => setFormData(prev => ({ ...prev, week_number: value }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => (
                    <SelectItem key={week} value={week.toString()} className="text-white">
                      Semana {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day_number">Dia da Semana</Label>
              <Select
                value={formData.day_number}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  day_number: value,
                  day_name: prev.day_name || `${getDayName(parseInt(value))} - `
                }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()} className="text-white">
                      {getDayName(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_name">Nome do Treino *</Label>
            <Input
              id="day_name"
              value={formData.day_name}
              onChange={(e) => setFormData(prev => ({ ...prev, day_name: e.target.value }))}
              placeholder="Ex: Segunda - Peito e Tríceps"
              className="bg-gray-800/50 border-gray-700"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_rest_day"
              checked={formData.is_rest_day}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_rest_day: checked }))}
            />
            <Label htmlFor="is_rest_day">Dia de descanso</Label>
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
              Criar Dia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
