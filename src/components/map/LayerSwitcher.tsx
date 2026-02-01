import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TileLayer {
  url: string;
  attribution: string;
  label: string;
}

interface LayerSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: any) => void;
  tileLayers: Record<string, TileLayer>;
}

const LayerSwitcher = ({ currentStyle, onStyleChange, tileLayers }: LayerSwitcherProps) => {
  return (
    <GlassCard 
      variant="elevated" 
      padding="sm" 
      className="mt-2 w-48 animate-slide-up"
    >
      <h4 className="text-xs font-bold mb-2 text-muted-foreground">خرائط الأساس</h4>
      <div className="space-y-1">
        {Object.entries(tileLayers).map(([key, layer]) => (
          <Button
            key={key}
            variant={currentStyle === key ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-between h-8 text-xs",
              currentStyle === key && "bg-primary/10 text-primary"
            )}
            onClick={() => onStyleChange(key)}
          >
            <span>{layer.label}</span>
            {currentStyle === key && <Check size={14} />}
          </Button>
        ))}
      </div>

      <div className="border-t border-border/50 mt-3 pt-3">
        <h4 className="text-xs font-bold mb-2 text-muted-foreground">طبقات الطقس</h4>
        <div className="space-y-1">
          {[
            { id: 'temp', label: '🌡️ درجة الحرارة', active: false },
            { id: 'wind', label: '💨 الرياح', active: false },
            { id: 'rain', label: '🌧️ الأمطار', active: false },
            { id: 'clouds', label: '☁️ السحب', active: false },
            { id: 'pressure', label: '📊 الضغط الجوي', active: false },
          ].map((layer) => (
            <Button
              key={layer.id}
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 text-xs"
            >
              <span>{layer.label}</span>
              <div className={cn(
                "w-4 h-4 rounded border-2",
                layer.active 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )} />
            </Button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default LayerSwitcher;
