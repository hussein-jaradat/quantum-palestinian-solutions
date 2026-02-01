import { Atom, Cloud, Zap, Activity } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'full' | 'compact';
}

const Logo = ({ size = 'md', showText = true, variant = 'full' }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: 'text-sm', subtext: 'text-[10px]' },
    md: { icon: 28, text: 'text-lg', subtext: 'text-xs' },
    lg: { icon: 40, text: 'text-2xl', subtext: 'text-sm' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
        
        {/* Main logo container */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-xl p-2.5 shadow-lg border border-primary/20">
          <div className="relative flex items-center justify-center">
            {/* Quantum atom icon */}
            <Atom 
              size={sizes[size].icon} 
              className="text-primary-foreground animate-pulse-glow"
              strokeWidth={1.5}
            />
            {/* Activity indicator */}
            <Activity 
              size={sizes[size].icon * 0.4} 
              className="absolute -bottom-1 -right-1 text-weather-sunny"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${sizes[size].text} font-bold tracking-tight text-foreground`}>
              QANWP
            </span>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-md border border-primary/20">
              v2.0
            </span>
          </div>
          {variant === 'full' && (
            <span className={`${sizes[size].subtext} text-muted-foreground leading-tight max-w-[200px]`}>
              Quantum Weather Prediction
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
