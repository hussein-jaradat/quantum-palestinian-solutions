import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Atom, RotateCcw, Play, Pause, Zap } from 'lucide-react';

interface BlochState {
  theta: number; // 0 to π
  phi: number;   // 0 to 2π
}

const QuantumBlochSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<BlochState>({ theta: Math.PI / 4, phi: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 150;

  // Calculate Cartesian coordinates from Bloch angles
  const getCartesian = useCallback((theta: number, phi: number) => {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    return { x, y, z };
  }, []);

  // Project 3D to 2D with perspective
  const project = useCallback((x: number, y: number, z: number) => {
    const perspective = 0.4;
    const scale = 1 / (1 + perspective * y);
    return {
      x: centerX + x * radius * scale,
      y: centerY - z * radius * scale,
      scale
    };
  }, []);

  // Draw the Bloch sphere
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = 'rgb(15, 23, 42)';
    ctx.fillRect(0, 0, width, height);

    // Draw sphere outline (back half)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.4, 0, 0, Math.PI);
    ctx.stroke();

    // Draw equator (back)
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.4, 0, Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw vertical circle (back)
    ctx.beginPath();
    for (let i = 0; i <= 180; i += 5) {
      const angle = (i * Math.PI) / 180;
      const { x, y } = project(0, Math.sin(angle), Math.cos(angle));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw main circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw axes
    // Z-axis (|0⟩ to |1⟩)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'; // Purple
    ctx.lineWidth = 2;
    ctx.beginPath();
    const z0 = project(0, 0, 1);
    const z1 = project(0, 0, -1);
    ctx.moveTo(z0.x, z0.y);
    ctx.lineTo(z1.x, z1.y);
    ctx.stroke();

    // Labels for |0⟩ and |1⟩
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', z0.x, z0.y - 15);
    ctx.fillText('|1⟩', z1.x, z1.y + 25);

    // X-axis
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.beginPath();
    const x0 = project(1, 0, 0);
    const x1 = project(-1, 0, 0);
    ctx.moveTo(x0.x, x0.y);
    ctx.lineTo(x1.x, x1.y);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.font = '12px monospace';
    ctx.fillText('|+⟩', x0.x + 15, x0.y);
    ctx.fillText('|-⟩', x1.x - 15, x1.y);

    // Y-axis
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.beginPath();
    const y0 = project(0, 1, 0);
    const y1 = project(0, -1, 0);
    ctx.moveTo(y0.x, y0.y);
    ctx.lineTo(y1.x, y1.y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.fillText('|i⟩', y0.x, y0.y - 10);

    // Draw equator (front)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.4, 0, 0, Math.PI);
    ctx.stroke();

    // Draw state vector
    const blochPoint = getCartesian(state.theta, state.phi);
    const projected = project(blochPoint.x, blochPoint.y, blochPoint.z);

    // Draw projection lines (dashed)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    const projXY = project(blochPoint.x, blochPoint.y, 0);
    ctx.moveTo(projected.x, projected.y);
    ctx.lineTo(projXY.x, projXY.y);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw state vector line
    const gradient = ctx.createLinearGradient(centerX, centerY, projected.x, projected.y);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 1)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(projected.x, projected.y);
    ctx.stroke();

    // Draw state point with glow
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw arrowhead
    const arrowSize = 10;
    const angle = Math.atan2(projected.y - centerY, projected.x - centerX);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(projected.x, projected.y);
    ctx.lineTo(
      projected.x - arrowSize * Math.cos(angle - Math.PI / 6),
      projected.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      projected.x - arrowSize * Math.cos(angle + Math.PI / 6),
      projected.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

  }, [state, getCartesian, project]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setAnimationPhase(prev => (prev + 0.02) % (Math.PI * 2));
      setState(prev => ({
        theta: Math.PI / 4 + Math.sin(animationPhase) * 0.3,
        phi: (prev.phi + 0.03) % (Math.PI * 2)
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationPhase]);

  // Draw on state change
  useEffect(() => {
    draw();
  }, [draw]);

  // Calculate probabilities
  const prob0 = Math.cos(state.theta / 2) ** 2;
  const prob1 = Math.sin(state.theta / 2) ** 2;

  const handleReset = () => {
    setState({ theta: 0, phi: 0 });
    setIsAnimating(false);
  };

  const applyGate = (gate: 'H' | 'X' | 'Y' | 'Z') => {
    setState(prev => {
      switch (gate) {
        case 'H': // Hadamard - rotate to superposition
          return { theta: Math.PI / 2, phi: 0 };
        case 'X': // Pauli-X - flip
          return { theta: Math.PI - prev.theta, phi: prev.phi };
        case 'Y': // Pauli-Y
          return { theta: Math.PI - prev.theta, phi: prev.phi + Math.PI };
        case 'Z': // Pauli-Z - phase flip
          return { theta: prev.theta, phi: prev.phi + Math.PI };
        default:
          return prev;
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-red-500/10 to-blue-500/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-purple-500" />
            <span>كرة بلوخ - تمثيل الكيوبت</span>
          </div>
          <Badge variant="outline">Quantum State Visualization</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="rounded-xl border border-border"
            />
          </div>

          {/* Controls and Info */}
          <div className="space-y-4">
            {/* State Info */}
            <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                حالة الكيوبت الحالية
              </h4>
              <div className="font-mono text-sm bg-background/50 p-3 rounded-lg">
                |ψ⟩ = {Math.cos(state.theta / 2).toFixed(3)}|0⟩ + 
                e<sup>i{(state.phi).toFixed(2)}</sup>·{Math.sin(state.theta / 2).toFixed(3)}|1⟩
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(prob0 * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">احتمال |0⟩</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {(prob1 * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">احتمال |1⟩</div>
                </div>
              </div>
            </div>

            {/* Angle Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">
                  θ (Theta): {(state.theta * 180 / Math.PI).toFixed(0)}°
                </label>
                <Slider
                  value={[state.theta]}
                  onValueChange={(v) => setState(prev => ({ ...prev, theta: v[0] }))}
                  min={0}
                  max={Math.PI}
                  step={0.01}
                  disabled={isAnimating}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  φ (Phi): {(state.phi * 180 / Math.PI).toFixed(0)}°
                </label>
                <Slider
                  value={[state.phi]}
                  onValueChange={(v) => setState(prev => ({ ...prev, phi: v[0] }))}
                  min={0}
                  max={Math.PI * 2}
                  step={0.01}
                  disabled={isAnimating}
                />
              </div>
            </div>

            {/* Quantum Gates */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">تطبيق بوابات كمية:</label>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => applyGate('H')} disabled={isAnimating}>
                  H (Hadamard)
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyGate('X')} disabled={isAnimating}>
                  X (NOT)
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyGate('Y')} disabled={isAnimating}>
                  Y
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyGate('Z')} disabled={isAnimating}>
                  Z
                </Button>
              </div>
            </div>

            {/* Animation Controls */}
            <div className="flex gap-2">
              <Button
                variant={isAnimating ? "default" : "outline"}
                onClick={() => setIsAnimating(!isAnimating)}
                className="flex-1 gap-2"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAnimating ? 'إيقاف' : 'تشغيل التحريك'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">كرة بلوخ</strong> هي تمثيل هندسي لحالة كيوبت واحد. 
            القطب العلوي يمثل |0⟩ والسفلي |1⟩. 
            أي نقطة على سطح الكرة تمثل حالة كمية صالحة (superposition).
            في QANWP نستخدم الكيوبتات لترميز معاملات الطقس وتحسينها باستخدام VQE.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumBlochSphere;
