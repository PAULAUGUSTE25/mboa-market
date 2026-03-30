import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PortalDiveProps {
  currentIndex: number;
  colors: string[];
  className?: string;
}

interface Ring {
  z: number;
  rotation: number;
  scale: number;
  opacity: number;
  color: string;
}

export default function PortalDive({ 
  currentIndex, 
  colors,
  className = ''
}: PortalDiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const ringsRef = useRef<Ring[]>([]);
  const targetColorRef = useRef(colors[currentIndex] || '#2E7D32');
  const currentColorRef = useRef(colors[currentIndex] || '#2E7D32');
  const transitionProgressRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const prevIndexRef = useRef(currentIndex);

  // Initialize rings
  useEffect(() => {
    const rings: Ring[] = [];
    const ringCount = 25;
    
    for (let i = 0; i < ringCount; i++) {
      rings.push({
        z: i * 40,
        rotation: i * 15,
        scale: 1,
        opacity: 1,
        color: colors[currentIndex] || '#2E7D32'
      });
    }
    
    ringsRef.current = rings;
    currentColorRef.current = colors[currentIndex] || '#2E7D32';
    targetColorRef.current = colors[currentIndex] || '#2E7D32';
  }, []);

  // Handle color transition on index change
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      targetColorRef.current = colors[currentIndex] || '#2E7D32';
      isTransitioningRef.current = true;
      transitionProgressRef.current = 0;
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex, colors]);

  // Interpolate between two hex colors
  const lerpColor = (color1: string, color2: string, t: number): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const speed = 3;
    const maxZ = 1000;
    
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Handle color transition
      if (isTransitioningRef.current) {
        transitionProgressRef.current += 0.02;
        if (transitionProgressRef.current >= 1) {
          transitionProgressRef.current = 1;
          isTransitioningRef.current = false;
          currentColorRef.current = targetColorRef.current;
        }
      }

      const currentColor = isTransitioningRef.current 
        ? lerpColor(currentColorRef.current, targetColorRef.current, transitionProgressRef.current)
        : currentColorRef.current;

      // Update and draw rings
      ringsRef.current.forEach((ring) => {
        // Move ring towards viewer
        ring.z -= speed * (isTransitioningRef.current ? 3 : 1);
        ring.rotation += 0.5;
        
        // Reset ring when it passes the viewer
        if (ring.z < 0) {
          ring.z = maxZ;
          ring.color = currentColor;
        }

        // Perspective calculation
        const perspective = 400;
        const scale = perspective / (perspective + ring.z);
        
        // Ring properties based on depth
        const size = 300 * scale;
        const opacity = Math.max(0, Math.min(1, 1 - ring.z / maxZ)) * 0.8;
        const lineWidth = Math.max(1, 4 * scale);

        // Draw outer ring
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((ring.rotation * Math.PI) / 180);
        
        // Hexagonal portal shape
        ctx.beginPath();
        const sides = 6;
        for (let i = 0; i <= sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Gradient stroke
        const gradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size);
        gradient.addColorStop(0, ring.color + '00');
        gradient.addColorStop(0.5, ring.color + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, ring.color + '00');

        ctx.strokeStyle = ring.color;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const x = Math.cos(angle) * (size * 0.95);
          const y = Math.sin(angle) * (size * 0.95);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = lineWidth * 0.5;
        ctx.globalAlpha = opacity * 0.5;
        ctx.stroke();

        ctx.restore();

        // Draw particles along the ring
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i * 2 * Math.PI) / particleCount + (ring.rotation * Math.PI) / 180;
          const px = centerX + Math.cos(angle) * size;
          const py = centerY + Math.sin(angle) * size;
          
          ctx.beginPath();
          ctx.arc(px, py, lineWidth * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.globalAlpha = opacity * 0.8;
          ctx.fill();
        }
      });

      // Draw center glow
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      centerGradient.addColorStop(0, currentColor + '40');
      centerGradient.addColorStop(0.5, currentColor + '20');
      centerGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.globalAlpha = 1;
      ctx.fill();

      // Draw speed lines during transition
      if (isTransitioningRef.current) {
        const lineCount = 20;
        for (let i = 0; i < lineCount; i++) {
          const angle = (i * 2 * Math.PI) / lineCount + Date.now() * 0.001;
          const innerRadius = 50;
          const outerRadius = 250 + Math.random() * 100;
          
          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * outerRadius;
          const y2 = centerY + Math.sin(angle) * outerRadius;
          
          const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
          lineGradient.addColorStop(0, currentColor + '00');
          lineGradient.addColorStop(0.3, currentColor + '60');
          lineGradient.addColorStop(1, currentColor + '00');
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </motion.div>
  );
}
