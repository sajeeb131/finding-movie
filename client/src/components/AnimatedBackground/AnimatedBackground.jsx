import React, { useEffect, useRef, useState } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Particle configuration
  const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 60; // Responsive particle count
  const particles = useRef([]);
  const connectionDistance = typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 150; // Responsive connection distance
  const mouseRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 70 : 100; // Responsive mouse interaction radius
  
  // Color scheme that complements the existing blue theme
  const colors = {
    primary: '#3B82F6',    // Blue
    secondary: '#22D3EE',  // Cyan
    tertiary: '#8B5CF6',   // Purple
    glow: '#60A5FA',      // Light blue
    subtle: '#334155'     // Slate
  };

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize particles
  const initParticles = (canvas) => {
    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isReducedMotion ? 0.1 : 0.5), // Slower movement when reduced motion
        vy: (Math.random() - 0.5) * (isReducedMotion ? 0.1 : 0.5),
        radius: Math.random() * 2 + 1,
        color: Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)],
        opacity: Math.random() * 0.5 + 0.2,
        originalRadius: Math.random() * 2 + 1
      });
    }
  };

  // Draw particle with glow effect
  const drawParticle = (ctx, particle) => {
    ctx.save();
    
    // Create gradient for glow effect
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.radius * 3
    );
    gradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, particle.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw core particle
    ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Draw connections between nearby particles
  const drawConnections = (ctx) => {
    ctx.save();
    
    for (let i = 0; i < particles.current.length; i++) {
      for (let j = i + 1; j < particles.current.length; j++) {
        const dx = particles.current[i].x - particles.current[j].x;
        const dy = particles.current[i].y - particles.current[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.2;
          ctx.strokeStyle = colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles.current[i].x, particles.current[i].y);
          ctx.lineTo(particles.current[j].x, particles.current[j].y);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  };

  // Update particle positions with mouse interaction
  const updateParticles = (canvas) => {
    particles.current.forEach(particle => {
      // Basic movement
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Mouse interaction - particles are repelled by mouse
      const dx = mousePositionRef.current.x - particle.x;
      const dy = mousePositionRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouseRadius) {
        const force = (1 - distance / mouseRadius) * 0.1;
        particle.vx -= (dx / distance) * force;
        particle.vy -= (dy / distance) * force;
        
        // Slightly increase particle size when near mouse for interactive effect
        particle.radius = particle.originalRadius * (1 + (1 - distance / mouseRadius) * 0.5);
      } else {
        // Return to original size
        particle.radius += (particle.originalRadius - particle.radius) * 0.1;
      }
      
      // Apply some friction to prevent particles from moving too fast
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx = -particle.vx;
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy = -particle.vy;
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      }
    });
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with fade effect for trails
    ctx.fillStyle = 'rgba(15, 20, 25, 0.15)'; // Slightly higher opacity for better performance
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    if (!isReducedMotion) {
      updateParticles(canvas);
    }
    
    drawConnections(ctx);
    particles.current.forEach(particle => drawParticle(ctx, particle));
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse movement
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    mousePositionRef.current = { x: -1000, y: -1000 };
  };

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Update particle count and distances based on screen size
      const newParticleCount = window.innerWidth < 768 ? 30 : 60;
      const newConnectionDistance = window.innerWidth < 768 ? 100 : 150;
      const newMouseRadius = window.innerWidth < 768 ? 70 : 100;
      
      // Only reinitialize if particle count changed significantly
      if (Math.abs(newParticleCount - particles.current.length) > 10) {
        initParticles(canvas);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Initialize background
    ctx.fillStyle = '#0F1419'; // Very dark blue-gray base color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Start animation
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReducedMotion]);

  return (
    <canvas 
      ref={canvasRef}
      className="animated-background"
      style={{ 
        opacity: isReducedMotion ? 0.3 : 1,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
};

export default AnimatedBackground;