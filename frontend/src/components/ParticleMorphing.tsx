import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  originX: number;
  originY: number;
  originZ: number;
  color: string;
  size: number;
  speed: number;
}

interface ParticleMorphingProps {
  currentIndex: number;
  colors: string[];
  particleCount?: number;
  className?: string;
}

export default function ParticleMorphing({ 
  currentIndex, 
  colors,
  particleCount = 150,
  className = ''
}: ParticleMorphingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevIndexRef = useRef(currentIndex);

  // Shape patterns for different sections
  const shapes = [
    // Agriculture - Leaf/Plant shape
    (i: number, total: number) => {
      const angle = (i / total) * Math.PI * 2;
      const r = 80 + Math.sin(angle * 3) * 30;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r * 0.8,
        z: Math.sin(angle * 2) * 40
      };
    },
    // Elevage - Animal/Circle shape
    (i: number, total: number) => {
      const angle = (i / total) * Math.PI * 2;
      const layer = Math.floor(i / (total / 3));
      const r = 60 + layer * 25;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        z: (layer - 1) * 30
      };
    },
    // Fournisseur - Box/Package shape
    (i: number, total: number) => {
      const side = Math.floor(i / (total / 6));
      const pos = (i % (total / 6)) / (total / 6);
      const size = 70;
      const positions = [
        { x: -size + pos * size * 2, y: -size, z: -size },
        { x: size, y: -size + pos * size * 2, z: -size },
        { x: -size + pos * size * 2, y: size, z: -size },
        { x: -size, y: -size + pos * size * 2, z: -size },
        { x: -size + pos * size * 2, y: 0, z: size },
        { x: 0, y: -size + pos * size * 2, z: size }
      ];
      return positions[side % 6] || { x: 0, y: 0, z: 0 };
    },
    // Producteur - Star shape
    (i: number, total: number) => {
      const angle = (i / total) * Math.PI * 2;
      const isOuter = i % 2 === 0;
      const r = isOuter ? 90 : 45;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        z: Math.sin(angle * 3) * 25
      };
    },
    // Acheteur - Cart/Shopping shape
    (i: number, total: number) => {
      const segment = Math.floor(i / (total / 4));
      const pos = (i % (total / 4)) / (total / 4);
      const shapes = [
        { x: -60 + pos * 120, y: 40, z: 0 },
        { x: -50 + pos * 100, y: -20 + pos * 60, z: 20 },
        { x: -40, y: -40 + pos * 80, z: -20 },
        { x: 40, y: -40 + pos * 80, z: -20 }
      ];
      return shapes[segment % 4] || { x: 0, y: 0, z: 0 };
    }
  ];

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    const color = colors[currentIndex] || '#2E7D32';
    
    for (let i = 0; i < particleCount; i++) {
      const shapeFunc = shapes[currentIndex % shapes.length];
      const pos = shapeFunc(i, particleCount);
      
      particles.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 200,
        targetX: pos.x,
        targetY: pos.y,
        targetZ: pos.z,
        originX: pos.x,
        originY: pos.y,
        originZ: pos.z,
        color: color,
        size: 2 + Math.random() * 3,
        speed: 0.02 + Math.random() * 0.03
      });
    }
    
    particlesRef.current = particles;
  }, [particleCount]);

  // Handle index change - morph to new shape
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setIsTransitioning(true);
      const newColor = colors[currentIndex] || '#2E7D32';
      const shapeFunc = shapes[currentIndex % shapes.length];
      
      particlesRef.current.forEach((particle, i) => {
        const pos = shapeFunc(i, particleCount);
        particle.targetX = pos.x;
        particle.targetY = pos.y;
        particle.targetZ = pos.z;
        particle.color = newColor;
      });
      
      prevIndexRef.current = currentIndex;
      
      setTimeout(() => setIsTransitioning(false), 1500);
    }
  }, [currentIndex, colors, particleCount]);

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

    let rotation = 0;
    
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      rotation += 0.005;
      
      // Sort particles by z for depth
      const sortedParticles = [...particlesRef.current].sort((a, b) => a.z - b.z);
      
      sortedParticles.forEach(particle => {
        // Smooth interpolation to target
        const easing = isTransitioning ? 0.08 : 0.02;
        particle.x += (particle.targetX - particle.x) * easing;
        particle.y += (particle.targetY - particle.y) * easing;
        particle.z += (particle.targetZ - particle.z) * easing;
        
        // Add subtle floating motion when not transitioning
        if (!isTransitioning) {
          particle.x += Math.sin(Date.now() * 0.001 + particle.originX) * 0.3;
          particle.y += Math.cos(Date.now() * 0.001 + particle.originY) * 0.3;
        }
        
        // 3D rotation
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const rotatedX = particle.x * cosR - particle.z * sinR;
        const rotatedZ = particle.x * sinR + particle.z * cosR;
        
        // Perspective projection
        const perspective = 400;
        const scale = perspective / (perspective + rotatedZ);
        const screenX = centerX + rotatedX * scale;
        const screenY = centerY + particle.y * scale;
        
        // Size based on depth
        const size = particle.size * scale;
        
        // Alpha based on depth
        const alpha = Math.max(0.3, Math.min(1, (rotatedZ + 100) / 200));
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });
      
      // Draw connecting lines between nearby particles
      ctx.strokeStyle = colors[currentIndex] + '20';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < sortedParticles.length; i++) {
        for (let j = i + 1; j < sortedParticles.length; j++) {
          const p1 = sortedParticles[i];
          const p2 = sortedParticles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (dist < 50) {
            const cosR = Math.cos(rotation);
            const sinR = Math.sin(rotation);
            
            const rx1 = p1.x * cosR - p1.z * sinR;
            const rz1 = p1.x * sinR + p1.z * cosR;
            const rx2 = p2.x * cosR - p2.z * sinR;
            const rz2 = p2.x * sinR + p2.z * cosR;
            
            const perspective = 400;
            const scale1 = perspective / (perspective + rz1);
            const scale2 = perspective / (perspective + rz2);
            
            const sx1 = centerX + rx1 * scale1;
            const sy1 = centerY + p1.y * scale1;
            const sx2 = centerX + rx2 * scale2;
            const sy2 = centerY + p2.y * scale2;
            
            ctx.globalAlpha = (1 - dist / 50) * 0.3;
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.stroke();
          }
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
  }, [currentIndex, colors, isTransitioning]);

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
