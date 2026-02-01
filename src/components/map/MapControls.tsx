import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, Minus, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  isFetching?: boolean;
}

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onRefresh,
  onFullscreen,
  isFullscreen,
  isFetching,
}: MapControlsProps) => {
  return (
    <div className="map-overlay-top-right flex flex-col gap-2">
      {/* Zoom Controls */}
      <GlassCard variant="elevated" padding="none" className="overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none border-b border-border/50"
          onClick={onZoomIn}
        >
          <Plus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none"
          onClick={onZoomOut}
        >
          <Minus size={16} />
        </Button>
      </GlassCard>

      {/* Refresh */}
      <GlassCard variant="elevated" padding="none">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw size={16} className={cn(isFetching && "animate-spin")} />
        </Button>
      </GlassCard>

      {/* Fullscreen */}
      {onFullscreen && (
        <GlassCard variant="elevated" padding="none">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onFullscreen}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </GlassCard>
      )}
    </div>
  );
};

export default MapControls;
