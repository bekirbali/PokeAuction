import React, { useEffect, useRef } from 'react';

export default function BattleCanvasVFX({
  move,
  attackerSide, // 'p1' | 'p2'
  onImpact
}) {
  const canvasRef = useRef(null);

  const moveName = move?.name || 'Tackle';
  const moveType = move?.type || 'Normal';
  const nameLower = moveName.toLowerCase();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = canvas.offsetWidth || rect.width || 800;
    const height = canvas.offsetHeight || rect.height || 500;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const isP1 = attackerSide === 'p1';
    // Exact stadium pedestal coordinates
    const startX = isP1 ? width * 0.22 : width * 0.77;
    const startY = isP1 ? height * 0.68 : height * 0.32;
    const targetX = isP1 ? width * 0.77 : width * 0.22;
    const targetY = isP1 ? height * 0.32 : height * 0.68;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Classification
    const isLaserBeam = nameLower.includes('beam') || nameLower.includes('cannon');
    const isElectric = moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('zap') || nameLower.includes('spark');
    const isFire = moveType === 'Fire' || nameLower.includes('fire') || nameLower.includes('flame') || nameLower.includes('ember') || nameLower.includes('blast');
    const isWater = moveType === 'Water' || nameLower.includes('hydro') || nameLower.includes('surf') || nameLower.includes('water') || nameLower.includes('bubble');
    const isIce = moveType === 'Ice' || nameLower.includes('ice') || nameLower.includes('blizzard') || nameLower.includes('frost');
    const isGrass = moveType === 'Grass' || nameLower.includes('leaf') || nameLower.includes('solar') || nameLower.includes('vine') || nameLower.includes('petal');
    const isSlash = ['slash', 'claw', 'scratch', 'cut', 'swipes', 'x-scissor', 'cross chop'].some(k => nameLower.includes(k));
    const isBite = ['bite', 'crunch', 'fang'].some(k => nameLower.includes(k));
    const isPsychic = moveType === 'Psychic' || nameLower.includes('psychic') || nameLower.includes('hypnosis') || nameLower.includes('psy') || nameLower.includes('mind');
    const isGhost = moveType === 'Ghost' || nameLower.includes('shadow') || nameLower.includes('night shade') || nameLower.includes('confuse');
    const isPoison = moveType === 'Poison' || nameLower.includes('sludge') || nameLower.includes('toxic') || nameLower.includes('acid') || nameLower.includes('poison');
    const isBug = moveType === 'Bug' || nameLower.includes('bug') || nameLower.includes('twineedle') || nameLower.includes('pin missile') || nameLower.includes('string');
    const isFlying = moveType === 'Flying' || nameLower.includes('bird') || nameLower.includes('wing') || nameLower.includes('drill peck') || nameLower.includes('peck') || nameLower.includes('fly') || nameLower.includes('aerial') || nameLower.includes('air') || nameLower.includes('gust');
    const isFighting = moveType === 'Fighting' || nameLower.includes('punch') || nameLower.includes('kick') || nameLower.includes('combat') || nameLower.includes('karate') || nameLower.includes('submission') || nameLower.includes('seismic');
    const isRockOrGround = moveType === 'Ground' || moveType === 'Rock' || nameLower.includes('earth') || nameLower.includes('rock') || nameLower.includes('fissure') || nameLower.includes('slide') || nameLower.includes('quake') || nameLower.includes('dig') || nameLower.includes('mud');
    const isTransform = nameLower.includes('transform');
    const isSplash = nameLower === 'splash';

    // Complete 15 Gen 1 Elemental Type Color Palettes
    const themeColors = {
      Normal: { primary: '#f8fafc', secondary: '#94a3b8', core: '#ffffff' }, // Pure silver/white kinetic energy (NOT orange!)
      Fire: { primary: '#f97316', secondary: '#ef4444', core: '#fff7ed' }, // Blazing fiery orange/red
      Water: { primary: '#38bdf8', secondary: '#0284c7', core: '#f0f9ff' }, // Ocean azure & deep blue
      Electric: { primary: '#facc15', secondary: '#eab308', core: '#fefce8' }, // Neon lightning yellow
      Grass: { primary: '#4ade80', secondary: '#16a34a', core: '#f0fdf4' }, // Emerald leaf green
      Ice: { primary: '#7dd3fc', secondary: '#38bdf8', core: '#ffffff' }, // Frost crystal cyan
      Fighting: { primary: '#ef4444', secondary: '#991b1b', core: '#ffffff' }, // Crimson/bordeaux martial arts
      Poison: { primary: '#c084fc', secondary: '#7e22ce', core: '#faf5ff' }, // Toxic purple/violet
      Ground: { primary: '#d97706', secondary: '#b45309', core: '#fef3c7' }, // Desert amber & earth
      Rock: { primary: '#a8a29e', secondary: '#78716c', core: '#f5f5f4' }, // Stone slate
      Flying: { primary: '#67e8f9', secondary: '#0284c7', core: '#ffffff' }, // Sky cyan & wind white
      Psychic: { primary: '#f472b6', secondary: '#c026d3', core: '#ffffff' }, // Cosmic pink & psychic magenta
      Bug: { primary: '#a3e635', secondary: '#65a30d', core: '#f7fee7' }, // Vibrant lime & olive
      Ghost: { primary: '#818cf8', secondary: '#3730a3', core: '#eef2ff' }, // Ethereal night shadow indigo
      Dragon: { primary: '#6366f1', secondary: '#4338ca', core: '#ffffff' } // Mythic royal dragon violet
    };
    const colors = themeColors[moveType] || themeColors.Normal;

    // Particle pool
    const particles = [];
    const impactRings = [];

    const spawnParticle = (props) => {
      particles.push({
        x: props.x,
        y: props.y,
        vx: props.vx || 0,
        vy: props.vy || 0,
        size: props.size || 5,
        color: props.color || '#fff',
        alpha: props.alpha ?? 1,
        life: 0,
        maxLife: props.maxLife || 30,
        decay: props.decay || 0.035,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type: props.type || 'circle'
      });
    };

    const spawnRing = (x, y, color, maxRadius = 60, speed = 4.5, lineWidth = 4) => {
      impactRings.push({ x, y, color, radius: 4, maxRadius, alpha: 1, speed, lineWidth });
    };

    // Procedural Lightning Branch Drawer
    const drawLightningBranch = (x1, y1, x2, y2, displace, widthL = 3, color = '#facc15') => {
      if (displace < 4) {
        ctx.strokeStyle = color;
        ctx.lineWidth = widthL;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
      }
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const ndx = -(y2 - y1) / len;
      const ndy = (x2 - x1) / len;
      const offset = (Math.random() - 0.5) * displace * 2;
      const cx = midX + ndx * offset;
      const cy = midY + ndy * offset;

      drawLightningBranch(x1, y1, cx, cy, displace / 2, widthL, color);
      drawLightningBranch(cx, cy, x2, y2, displace / 2, widthL, color);

      if (Math.random() < 0.3 && displace > 12) {
        const bx = cx + (Math.random() - 0.5) * displace * 2;
        const by = cy + (Math.random() - 0.5) * displace * 2;
        drawLightningBranch(cx, cy, bx, by, displace / 2, widthL * 0.6, color);
      }
    };

    let animationFrameId;
    const startTime = performance.now();
    const duration = 950;
    let impactTriggered = false;

    const render = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // --- IMPACT EVENT AT 36% (approx 340ms) ---
      if (progress >= 0.36 && !impactTriggered) {
        impactTriggered = true;
        if (onImpact) onImpact();

        // 1. Shockwave rings at target
        spawnRing(targetX, targetY, colors.primary, 85, 6, 5);
        spawnRing(targetX, targetY, '#ffffff', 55, 4.5, 3.5);

        // 2. High-volume kinetic particle burst
        const particleCount = isLaserBeam ? 55 : isElectric ? 45 : isFire ? 50 : 35;
        for (let i = 0; i < particleCount; i++) {
          const pAngle = Math.random() * Math.PI * 2;
          const pSpeed = Math.random() * 8 + 3;
          spawnParticle({
            x: targetX,
            y: targetY,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed - (isFire || isWater ? Math.random() * 3 : 0),
            size: Math.random() * 8 + 4,
            color: i % 3 === 0 ? colors.core : i % 2 === 0 ? colors.primary : colors.secondary,
            maxLife: 35,
            decay: 0.03,
            type: isIce ? 'crystal' : isElectric ? 'spark' : isRockOrGround ? 'rock' : 'circle'
          });
        }
      }

      // Reset transform & clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // Additive glowing blend mode
      ctx.globalCompositeOperation = 'lighter';

      // Current Projectile Position during launch (0 to 0.36)
      const travelProg = Math.min(progress / 0.36, 1);
      const curX = startX + dx * travelProg;
      const curY = startY + dy * travelProg;

      // --- 1. TRAVELING PROJECTILE STAGE (0 to 0.36) ---
      if (progress < 0.36) {
        // A. Draw Projectile Glow & Core (Skip for Laser beams, Lightning, Slashes, Earthquakes/Rock drops, Transform, Splash, and Melee Fighting)
        if (!isLaserBeam && !isElectric && !isSlash && !isRockOrGround && !isTransform && !isSplash && !isFighting) {
          // Trailing particles
          for (let i = 0; i < 3; i++) {
            spawnParticle({
              x: curX + (Math.random() - 0.5) * 14,
              y: curY + (Math.random() - 0.5) * 14,
              vx: -Math.cos(angle) * (Math.random() * 3 + 1) + (Math.random() - 0.5) * 2,
              vy: -Math.sin(angle) * (Math.random() * 3 + 1) + (Math.random() - 0.5) * 2,
              size: Math.random() * 10 + 4,
              color: Math.random() > 0.5 ? colors.primary : colors.secondary,
              maxLife: 18,
              decay: 0.05,
              type: isIce ? 'crystal' : isPoison ? 'bubble' : isGrass ? 'leaf' : isFlying ? 'wind' : 'circle'
            });
          }

          // Main Projectile Head with authentic element core
          const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 26);
          grad.addColorStop(0, colors.core || '#ffffff');
          grad.addColorStop(0.35, colors.primary);
          grad.addColorStop(0.7, colors.secondary);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, 26, 0, Math.PI * 2);
          ctx.fill();

          // Tail styling uniquely tailored by element
          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(angle);
          if (isFire) {
            // Blazing flame jet tail (ONLY for Fire!)
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-45, 0);
            ctx.lineTo(0, 10);
            ctx.closePath();
            ctx.fill();
          } else if (isFlying) {
            // Aerodynamic supersonic razor wind trails
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-5, -7);
            ctx.lineTo(-50, -14);
            ctx.moveTo(-5, 7);
            ctx.lineTo(-50, 14);
            ctx.stroke();
          } else if (isWater) {
            // Fluid water droplet stream
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(-20, 0, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Sleek kinetic velocity streak
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-35, 0);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // --- 2. SIGNATURE MOVE SEQUENCES ---

      // A. PROCEDURAL ELECTRIC LIGHTNING
      if (isElectric && progress < 0.65) {
        // Direct Lightning Arcs between Attacker and Target
        for (let b = 0; b < 2; b++) {
          drawLightningBranch(startX, startY, targetX, targetY, 40, 8, 'rgba(250, 204, 21, 0.4)');
          drawLightningBranch(startX, startY, targetX, targetY, 30, 4, '#facc15');
          drawLightningBranch(startX, startY, targetX, targetY, 20, 2, '#ffffff');
        }

        // Sky Bolt crashing from the heavens onto target
        if (progress >= 0.28 && progress <= 0.58) {
          drawLightningBranch(targetX + (Math.random() - 0.5) * 20, 0, targetX, targetY, 35, 9, 'rgba(250, 204, 21, 0.5)');
          drawLightningBranch(targetX + (Math.random() - 0.5) * 20, 0, targetX, targetY, 25, 4, '#ffffff');
        }
      }

      // B. FULL STADIUM CHARGED PLASMA LASER (Hyper Beam / Solar Beam)
      if (isLaserBeam && progress < 0.75) {
        // Charging Vortex at Attacker (0 to 0.25)
        if (progress < 0.26) {
          const chargeProg = progress / 0.26;
          ctx.strokeStyle = isGrass ? '#84cc16' : colors.primary;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(startX, startY, (1 - chargeProg) * 36 + 6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = colors.core || '#ffffff';
          ctx.beginPath();
          ctx.arc(startX, startY, chargeProg * 18, 0, Math.PI * 2);
          ctx.fill();
        }

        // Blazing Continuous Laser Cylinder (0.24 to 0.75)
        if (progress >= 0.24) {
          const beamAlpha = progress < 0.55 ? 1 : Math.max(0, (0.75 - progress) / 0.2);
          const beamColor = isGrass ? '#22c55e' : colors.primary;

          // Outer radiant plasma aura
          ctx.strokeStyle = beamColor;
          ctx.lineWidth = 38 * beamAlpha;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Middle neon plasma
          ctx.strokeStyle = isGrass ? '#86efac' : colors.secondary;
          ctx.lineWidth = 20 * beamAlpha;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Hot-white solid laser core
          ctx.strokeStyle = colors.core || '#ffffff';
          ctx.lineWidth = 10 * beamAlpha;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }
      }

      // C. RAZOR-SHARP ANIME SPEED SLASHES
      if (isSlash && progress >= 0.22 && progress < 0.65) {
        const slashProg = (progress - 0.22) / 0.43;
        const alpha = slashProg < 0.5 ? 1 : (1 - slashProg) * 2;

        ctx.save();
        ctx.translate(targetX, targetY);

        // Blade Slash 1
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-50, -50);
        ctx.quadraticCurveTo(8, 8, 50, 50);
        ctx.stroke();

        // Cross Blade Slash 2
        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, -45);
        ctx.quadraticCurveTo(0, 0, -50, 45);
        ctx.stroke();

        ctx.restore();
      }



      // E. DITTO TRANSFORM SPIRAL
      if (isTransform && progress < 0.8) {
        const spiralProg = progress / 0.8;
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(spiralProg * Math.PI * 5);
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, spiralProg * 45, 0, Math.PI * 1.5);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(244, 114, 182, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, spiralProg * 30, Math.PI, Math.PI * 2.5);
        ctx.stroke();
        ctx.restore();
      }

      // F. IMPACT CORE DETONATION FLASH (0.36 to 0.65)
      if (progress >= 0.36 && progress <= 0.65) {
        const flashProg = (progress - 0.36) / 0.29;
        const flashAlpha = 1 - flashProg;
        const flashRadius = (flashProg * 40 + 20);

        const flashGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, flashRadius);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        flashGrad.addColorStop(0.4, `${colors.primary}${Math.floor(flashAlpha * 255).toString(16).padStart(2, '0')}`);
        flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, flashRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4-point anime lens flare star
        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate(progress * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
        const starSize = 50 * flashAlpha;
        ctx.beginPath();
        ctx.moveTo(0, -starSize);
        ctx.lineTo(starSize * 0.15, 0);
        ctx.lineTo(0, starSize);
        ctx.lineTo(-starSize * 0.15, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-starSize, 0);
        ctx.lineTo(0, starSize * 0.15);
        ctx.lineTo(starSize, 0);
        ctx.lineTo(0, -starSize * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // --- 3. DRAW & UPDATE EXPANDING SHOCKWAVE RINGS ---
      for (let i = impactRings.length - 1; i >= 0; i--) {
        const ring = impactRings[i];
        ring.radius += ring.speed;
        ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);

        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.lineWidth * ring.alpha;
        ctx.globalAlpha = ring.alpha;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (ring.radius >= ring.maxRadius || ring.alpha <= 0) {
          impactRings.splice(i, 1);
        }
      }

      // --- 4. DRAW & UPDATE PARTICLES ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.life++;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.type === 'spark') {
          // Sharp kinetic spark streak
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(-p.size * 2, 0);
          ctx.lineTo(p.size * 2, 0);
          ctx.stroke();
        } else if (p.type === 'crystal') {
          // 4-point glittering diamond star
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.4, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.4, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'rock') {
          // Earthen boulder fragment
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size * 0.5);
          ctx.lineTo(0, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.5, p.size);
          ctx.lineTo(-p.size * 0.8, p.size * 0.5);
          ctx.closePath();
          ctx.fill();
        } else {
          // Radiant glowing sphere
          const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.4, p.color);
          radGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [moveName, attackerSide]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-40"
    />
  );
}
