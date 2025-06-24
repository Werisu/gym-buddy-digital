import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  progress?: number;
  className?: string;
}

export const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  progress,
  className = ""
}: StatsCardProps) => {
  return (
    <Card className={`glass-card hover:bg-white/10 transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-fitness-primary animate-pulse-custom" />
          {progress !== undefined && (
            <div className="text-right">
              <span className="text-lg font-bold text-fitness-primary">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 animate-slide-in-left">{title}</h3>
          <p className="text-2xl font-bold text-white animate-scale-in">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 animate-slide-in-right">{subtitle}</p>
          )}
          
          {trend && (
            <p className="text-xs text-fitness-primary font-medium animate-fade-in">
              {trend}
            </p>
          )}
          
          {progress !== undefined && (
            <div className="mt-3">
              <Progress 
                value={progress} 
                className="h-2 bg-gray-800 progress-animate"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
