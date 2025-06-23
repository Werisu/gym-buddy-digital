
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
}

export const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  progress 
}: StatsCardProps) => {
  return (
    <Card className="glass-card hover:bg-white/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-fitness-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
          
          {progress !== undefined && (
            <Progress 
              value={progress} 
              className="h-2 mt-3 bg-fitness-gray"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
