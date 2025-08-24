import React, { useEffect, useRef, useState, useCallback } from 'react';
import { randomPosition, distance } from '../lib/utils';
import HUD from './HUD';

const GAME_DURATION = 30; // seconds
const FISH_RADIUS = 35;

// Early game (0-10s): Many fish, longer lifetime
const EARLY_FISH_MIN_LIFETIME = 2000; // ms
const EARLY_FISH_MAX_LIFETIME = 3000; // ms
const EARLY_SPAWN_DELAY = 500; // ms between spawns
const EARLY_SPAWN_COUNT = 5; // spawn 5 fish when clicked

// Mid game (10-20s): Normal difficulty
const MID_FISH_MIN_LIFETIME = 1500; // ms
const MID_FISH_MAX_LIFETIME = 2000; // ms
const MID_SPAWN_DELAY = 700; // ms
const MID_SPAWN_COUNT = 3; // spawn 3 fish when clicked

// End game (20-30s): Few fish, very short lifetime
const END_FISH_MIN_LIFETIME = 500; // ms - very fast
const END_FISH_MAX_LIFETIME = 800; // ms
const END_SPAWN_DELAY = 1500; // ms - spawn less frequently
const END_SPAWN_COUNT = 1; // spawn only 1 fish when clicked

class Fish {
  constructor(x, y, id, lifetime) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.radius = FISH_RADIUS;
    this.lifetime = lifetime;
    this.createdAt = Date.now();
    this.hit = false;
    this.scale = 0;
    this.fadeOut = 1;
    this.swimOffset = Math.random() * Math.PI * 2;
    this.swimSpeed = 0.002 + Math.random() * 0.002;
  }

  update() {
    const age = Date.now() - this.createdAt;
    const lifeProgress = age / this.lifetime;
    
    // Scale animation - smoother entry and exit
    if (lifeProgress < 0.15) {
      this.scale = lifeProgress / 0.15;
    } else if (lifeProgress > 0.85) {
      this.scale = (1 - lifeProgress) / 0.15;
    } else {
      this.scale = 1;
    }

    // Add swimming motion
    this.x += Math.sin(Date.now() * this.swimSpeed + this.swimOffset) * 0.5;
    this.y += Math.cos(Date.now() * this.swimSpeed * 0.7 + this.swimOffset) * 0.3;

    // Fade out when hit
    if (this.hit) {
      this.fadeOut = Math.max(0, this.fadeOut - 0.15);
      this.scale *= 1.1; // Slight scale up when hit
    }

    return age < this.lifetime && (!this.hit || this.fadeOut > 0);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.fadeOut * 0.9;
    ctx.translate(this.x, this.y);
    
    // Add rotation based on swimming
    const rotation = Math.sin(Date.now() * this.swimSpeed + this.swimOffset) * 0.1;
    ctx.rotate(rotation);
    ctx.scale(this.scale, this.scale);

    // Shadow
    ctx.fillStyle = 'rgba(11, 79, 138, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.8, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fish body gradient
    const gradient = ctx.createLinearGradient(-this.radius, 0, this.radius, 0);
    gradient.addColorStop(0, '#64B5F6');
    gradient.addColorStop(0.5, '#42A5F5');
    gradient.addColorStop(1, '#1E88E5');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.4, this.radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Fish tail with animation
    const tailWave = Math.sin(Date.now() * 0.01 + this.swimOffset) * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.7, 0);
    ctx.quadraticCurveTo(
      this.radius * 1.2, -this.radius * (0.5 + tailWave),
      this.radius * 1.5, -this.radius * (0.3 + tailWave)
    );
    ctx.lineTo(this.radius * 1.5, this.radius * (0.3 - tailWave));
    ctx.quadraticCurveTo(
      this.radius * 1.2, this.radius * (0.5 - tailWave),
      this.radius * 0.7, 0
    );
    ctx.closePath();
    ctx.fill();

    // Fins
    ctx.fillStyle = 'rgba(30, 136, 229, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, -this.radius * 0.4, this.radius * 0.3, this.radius * 0.15, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.4, this.radius * 0.3, this.radius * 0.15, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Eye white
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.35, -this.radius * 0.1, this.radius * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Eye pupil
    ctx.fillStyle = '#0B4F8A';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.35, -this.radius * 0.1, this.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.38, -this.radius * 0.13, this.radius * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  checkHit(x, y) {
    if (this.hit) return false;
    const dist = distance({ x, y }, { x: this.x, y: this.y });
    if (dist <= this.radius * this.scale) {
      this.hit = true;
      return true;
    }
    return false;
  }
}

function GameCanvas({ playerName, onGameEnd }) {
  const canvasRef = useRef(null);
  const fishRef = useRef([]);
  const animationIdRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const gameStartRef = useRef(null);
  const nextFishIdRef = useRef(0);
  const scoreRef = useRef(0); // Add ref to track score
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(true);
  const timeLeftRef = useRef(GAME_DURATION);

  const getDynamicDifficulty = useCallback(() => {
    if (!gameStartRef.current) {
      return { 
        spawnDelay: EARLY_SPAWN_DELAY, 
        minLifetime: EARLY_FISH_MIN_LIFETIME,
        maxLifetime: EARLY_FISH_MAX_LIFETIME,
        spawnCount: EARLY_SPAWN_COUNT,
        phase: 'early'
      };
    }
    
    const elapsed = (Date.now() - gameStartRef.current) / 1000;
    
    // Three phases of difficulty
    if (elapsed < 10) {
      // Early game: Many fish, easy
      return {
        spawnDelay: EARLY_SPAWN_DELAY,
        minLifetime: EARLY_FISH_MIN_LIFETIME,
        maxLifetime: EARLY_FISH_MAX_LIFETIME,
        spawnCount: EARLY_SPAWN_COUNT,
        phase: 'early'
      };
    } else if (elapsed < 20) {
      // Mid game: Normal difficulty
      return {
        spawnDelay: MID_SPAWN_DELAY,
        minLifetime: MID_FISH_MIN_LIFETIME,
        maxLifetime: MID_FISH_MAX_LIFETIME,
        spawnCount: MID_SPAWN_COUNT,
        phase: 'mid'
      };
    } else {
      // End game: Few fish, very hard
      const endProgress = (elapsed - 20) / 10; // 0 to 1 for last 10 seconds
      const scarcityFactor = Math.pow(endProgress, 2); // Exponential scarcity
      
      return {
        spawnDelay: END_SPAWN_DELAY + scarcityFactor * 1000, // Gets even slower
        minLifetime: END_FISH_MIN_LIFETIME * (1 - scarcityFactor * 0.5), // Gets even faster
        maxLifetime: END_FISH_MAX_LIFETIME * (1 - scarcityFactor * 0.3),
        spawnCount: END_SPAWN_COUNT,
        phase: 'end'
      };
    }
  }, []);

  const spawnFish = useCallback((count = 1, aroundPosition = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { minLifetime, maxLifetime } = getDynamicDifficulty();
    
    for (let i = 0; i < count; i++) {
      let pos;
      if (aroundPosition) {
        // Spawn around the clicked position
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 100;
        pos = {
          x: aroundPosition.x + Math.cos(angle) * distance,
          y: aroundPosition.y + Math.sin(angle) * distance
        };
        // Keep within canvas bounds
        pos.x = Math.max(FISH_RADIUS, Math.min(canvas.width - FISH_RADIUS, pos.x));
        pos.y = Math.max(FISH_RADIUS, Math.min(canvas.height - FISH_RADIUS, pos.y));
      } else {
        pos = randomPosition(canvas.width, canvas.height, FISH_RADIUS + 30);
      }
      
      const lifetime = minLifetime + Math.random() * (maxLifetime - minLifetime);
      const fish = new Fish(pos.x, pos.y, nextFishIdRef.current++, lifetime);
      fishRef.current.push(fish);
    }
  }, [getDynamicDifficulty]);
  
  const spawnFishPeriodically = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const now = Date.now();
    const { spawnDelay, phase } = getDynamicDifficulty();
    
    if (now - lastSpawnRef.current < spawnDelay) return;
    
    // In end phase, sometimes skip spawning to create scarcity
    if (phase === 'end' && Math.random() > 0.6) {
      lastSpawnRef.current = now;
      return;
    }
    
    // Spawn 1-2 fish randomly
    const count = phase === 'early' ? 2 : 1;
    spawnFish(count);
    lastSpawnRef.current = now;
  }, [getDynamicDifficulty, spawnFish]);

  const handleCanvasInteraction = useCallback((e) => {
    if (!gameActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches && e.touches.length > 0) {
      // Touch event
      x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // Touch end event
      x = (e.changedTouches[0].clientX - rect.left) * (canvas.width / rect.width);
      y = (e.changedTouches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
      // Mouse event
      x = (e.clientX - rect.left) * (canvas.width / rect.width);
      y = (e.clientY - rect.top) * (canvas.height / rect.height);
    }

    let hitAny = false;
    let hitPosition = null;
    for (const fish of fishRef.current) {
      if (fish.checkHit(x, y)) {
        hitAny = true;
        hitPosition = { x: fish.x, y: fish.y };
        setScore(prev => {
          const newScore = prev + 1;
          scoreRef.current = newScore; // Update ref
          return newScore;
        });
        break; // Only hit one fish per click
      }
    }
    
    // Spawn more fish when one is caught
    if (hitAny && hitPosition) {
      const { spawnCount } = getDynamicDifficulty();
      // Spawn new fish around the caught fish position
      setTimeout(() => {
        spawnFish(spawnCount, hitPosition);
      }, 100); // Small delay for visual effect
    }

    // Visual feedback with water splash effect
    const ctx = canvas.getContext('2d');
    if (!hitAny) {
      // Miss effect - red ripple
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 83, 80, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Hit effect - water splash
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.fillStyle = `rgba(144, 202, 249, ${0.3 - i * 0.05})`;
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() - 0.5) * 20, 
          y + (Math.random() - 0.5) * 20, 
          Math.random() * 10 + 5, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }
    }
  }, [gameActive, getDynamicDifficulty, spawnFish]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Draw gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#B3E5FC');
    bgGradient.addColorStop(0.5, '#81D4FA');
    bgGradient.addColorStop(1, '#4FC3F7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated water waves
    const time = Date.now() * 0.001;
    
    // Background waves
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(30, 136, 229, ${0.05 + i * 0.02})`;
      ctx.lineWidth = 2 + i;
      ctx.beginPath();
      const baseY = canvas.height * (0.3 + i * 0.15);
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= canvas.width; x += 5) {
        const waveHeight = Math.sin(x * 0.01 + time + i * 0.5) * 15 + 
                          Math.sin(x * 0.02 + time * 1.5 + i) * 10;
        ctx.lineTo(x, baseY + waveHeight);
      }
      ctx.stroke();
    }
    
    // Bubble particles
    const bubbleTime = time * 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 10; i++) {
      const bubbleX = (canvas.width * (i / 10)) + Math.sin(bubbleTime + i * 2) * 20;
      const bubbleY = canvas.height - ((bubbleTime * 50 + i * 100) % canvas.height);
      const bubbleSize = 3 + Math.sin(bubbleTime + i) * 2;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Light rays from surface
    ctx.save();
    ctx.globalAlpha = 0.1;
    const rayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      const rayX = canvas.width * (0.2 + i * 0.3) + Math.sin(time * 0.5 + i) * 50;
      ctx.moveTo(rayX - 20, 0);
      ctx.lineTo(rayX + 20, 0);
      ctx.lineTo(rayX + 60 + Math.sin(time + i) * 20, canvas.height * 0.6);
      ctx.lineTo(rayX - 60 + Math.sin(time + i) * 20, canvas.height * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Update and draw fish
    fishRef.current = fishRef.current.filter(fish => fish.update());
    fishRef.current.forEach(fish => fish.draw(ctx));

    // Spawn new fish periodically
    if (gameActive) {
      spawnFishPeriodically();
    }
    
    // Visual indicator for difficulty phase
    const { phase } = getDynamicDifficulty();
    if (phase === 'end' && gameActive) {
      // Red tint overlay for final phase
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // Warning text
      if (timeLeftRef.current <= 10 && timeLeftRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF0000';
        ctx.fillText('TIME RUNNING OUT!', canvas.width / 2, 100);
        ctx.restore();
      }
    }

    // Update timer - based only on elapsed time, not affected by score
    if (gameStartRef.current) {
      const elapsed = (Date.now() - gameStartRef.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      
      // Only update state if value actually changed (avoid decimal precision issues)
      if (Math.abs(timeLeftRef.current - remaining) > 0.05) {
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
      }

      if (remaining <= 0 && gameActive) {
        setGameActive(false);
        // Use score ref to get the final score
        onGameEnd(scoreRef.current);
        return;
      }
    }

    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, spawnFishPeriodically, getDynamicDifficulty, onGameEnd]); // Removed timeLeft from dependencies

  // Initialize game
  useEffect(() => {
    gameStartRef.current = Date.now();
    const canvas = canvasRef.current;
    
    if (canvas) {
      // Set canvas size
      const resizeCanvas = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Start game loop
      animationIdRef.current = requestAnimationFrame(gameLoop);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }
  }, [gameLoop]);

  return (
    <div className="game-container">
      <HUD timeLeft={timeLeft} score={score} playerName={playerName} />
      <div className="game-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          onClick={handleCanvasInteraction}
          onTouchStart={handleCanvasInteraction}
          onTouchEnd={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}

export default GameCanvas;
