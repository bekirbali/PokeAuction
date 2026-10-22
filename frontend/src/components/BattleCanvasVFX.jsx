import React, { useEffect, useRef } from 'react';

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c.slice(0, 6), 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function BattleCanvasVFX({
  move,
  attackerSide, // 'p1' | 'p2'
  onImpact,
  speed = 1
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

    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
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

    // Specific Signature Move Classifications
    const isPsystrike = nameLower.includes('psystrike');
    const isPsychicMove = (nameLower === 'psychic' || nameLower.includes('confusion') || nameLower.includes('psywave')) && !isPsystrike;
    const isAuraSphere = nameLower.includes('aura sphere') || nameLower.includes('focus blast');
    const isShadowBall = nameLower.includes('shadow ball') || nameLower.includes('night shade');
    const isFireBlast = nameLower.includes('fire blast');
    const isFlamethrower = (nameLower.includes('flamethrower') || nameLower.includes('flame wheel') || nameLower.includes('fire spin')) && !isFireBlast;
    const isSurf = nameLower.includes('surf') || nameLower.includes('muddy water');
    const isHydroPump = nameLower.includes('hydro pump') || nameLower.includes('water cannon');
    const isLaserBeam = nameLower.includes('beam') || nameLower.includes('cannon') || nameLower.includes('solar');
    const isElectric = moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('zap') || nameLower.includes('spark');
    const isFire = (moveType === 'Fire' || nameLower.includes('fire') || nameLower.includes('flame') || nameLower.includes('ember') || nameLower.includes('blast')) && !isFireBlast && !isFlamethrower;
    const isWater = (moveType === 'Water' || nameLower.includes('hydro') || nameLower.includes('surf') || nameLower.includes('water') || nameLower.includes('bubble')) && !isSurf && !isHydroPump;
    const isIce = moveType === 'Ice' || nameLower.includes('ice') || nameLower.includes('blizzard') || nameLower.includes('frost');
    const isGrass = moveType === 'Grass' || nameLower.includes('leaf') || nameLower.includes('solar') || nameLower.includes('vine') || nameLower.includes('petal') || nameLower.includes('energy ball');
    const isSlash = ['slash', 'claw', 'scratch', 'cut', 'swipes', 'x-scissor', 'cross chop'].some(k => nameLower.includes(k));
    const isBite = ['bite', 'crunch', 'fang'].some(k => nameLower.includes(k));
    const isGhost = (moveType === 'Ghost' || nameLower.includes('shadow') || nameLower.includes('confuse')) && !isShadowBall;
    const isPoison = moveType === 'Poison' || nameLower.includes('sludge') || nameLower.includes('toxic') || nameLower.includes('acid') || nameLower.includes('poison');
    const isBug = moveType === 'Bug' || nameLower.includes('bug') || nameLower.includes('twineedle') || nameLower.includes('pin missile') || nameLower.includes('string');
    const isFlying = moveType === 'Flying' || nameLower.includes('bird') || nameLower.includes('wing') || nameLower.includes('drill peck') || nameLower.includes('peck') || nameLower.includes('fly') || nameLower.includes('aerial') || nameLower.includes('air') || nameLower.includes('gust');
    const isFighting = moveType === 'Fighting' || nameLower.includes('punch') || nameLower.includes('kick') || nameLower.includes('combat') || nameLower.includes('karate') || nameLower.includes('submission') || nameLower.includes('seismic');
    const isRockOrGround = moveType === 'Ground' || moveType === 'Rock' || nameLower.includes('earth') || nameLower.includes('rock') || nameLower.includes('fissure') || nameLower.includes('slide') || nameLower.includes('quake') || nameLower.includes('dig') || nameLower.includes('mud');
    const isTransform = nameLower.includes('transform');
    const isSplash = nameLower === 'splash';

    const isCustomMove = isLaserBeam || isElectric || isSlash || isRockOrGround || isTransform || isSplash || isFighting || isPsystrike || isPsychicMove || isAuraSphere || isShadowBall || isFireBlast || isFlamethrower || isSurf || isHydroPump;

    // Complete 15 Gen 1 Elemental Type Color Palettes
    const themeColors = {
      Normal: { primary: '#f8fafc', secondary: '#94a3b8', core: '#ffffff' },
      Fire: { primary: '#f97316', secondary: '#ef4444', core: '#fff7ed' },
      Water: { primary: '#38bdf8', secondary: '#0284c7', core: '#f0f9ff' },
      Electric: { primary: '#facc15', secondary: '#eab308', core: '#fefce8' },
      Grass: { primary: '#4ade80', secondary: '#16a34a', core: '#f0fdf4' },
      Ice: { primary: '#7dd3fc', secondary: '#38bdf8', core: '#ffffff' },
      Fighting: { primary: '#ef4444', secondary: '#991b1b', core: '#ffffff' },
      Poison: { primary: '#c084fc', secondary: '#7e22ce', core: '#faf5ff' },
      Ground: { primary: '#d97706', secondary: '#b45309', core: '#fef3c7' },
      Rock: { primary: '#a8a29e', secondary: '#78716c', core: '#f5f5f4' },
      Flying: { primary: '#67e8f9', secondary: '#0284c7', core: '#ffffff' },
      Psychic: { primary: '#f472b6', secondary: '#c026d3', core: '#ffffff' },
      Bug: { primary: '#a3e635', secondary: '#65a30d', core: '#f7fee7' },
      Ghost: { primary: '#818cf8', secondary: '#3730a3', core: '#eef2ff' },
      Dragon: { primary: '#6366f1', secondary: '#4338ca', core: '#ffffff' }
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
        size: Math.max(1, props.size || 5),
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
        ctx.lineWidth = Math.max(0.5, widthL);
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
    let startTime = null;
    const duration = (isLaserBeam ? 1100 : (isPsystrike || isFireBlast || isSurf || isHydroPump || isPsychicMove ? 1050 : 950)) / Math.max(speed, 0.5);
    let impactTriggered = false;

    const render = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ALWAYS schedule the next frame first so that no error can permanently crash the loop
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }

      try {
        // --- IMPACT EVENT AT 30% (approx 300ms) ---
        if (progress >= 0.30 && !impactTriggered) {
          impactTriggered = true;
          if (onImpact) onImpact();

          // 1. Shockwave rings at target
          const shockColor = isPsystrike ? '#e879f9' : isAuraSphere ? '#38bdf8' : isShadowBall ? '#a855f7' : colors.primary;
          spawnRing(targetX, targetY, shockColor, isMobile ? 60 : 85, isMobile ? 4 : 6, isMobile ? 3 : 5);
          spawnRing(targetX, targetY, '#ffffff', isMobile ? 40 : 55, isMobile ? 3 : 4.5, isMobile ? 2.5 : 3.5);

          // 2. High-volume kinetic particle burst
          const particleCount = isMobile ? (isLaserBeam || isPsystrike ? 22 : 16) : (isLaserBeam || isPsystrike ? 50 : isElectric ? 45 : isFire ? 50 : 35);
          for (let i = 0; i < particleCount; i++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 8 + 3;
            spawnParticle({
              x: targetX,
              y: targetY,
              vx: Math.cos(pAngle) * pSpeed,
              vy: Math.sin(pAngle) * pSpeed - (isFire || isWater || isSurf ? Math.random() * 3 : 0),
              size: Math.random() * 8 + 4,
              color: i % 3 === 0 ? colors.core : i % 2 === 0 ? colors.primary : colors.secondary,
              maxLife: isMobile ? 22 : 35,
              decay: isMobile ? 0.045 : 0.03,
              type: (isIce || isPsystrike) ? 'crystal' : isElectric ? 'spark' : isRockOrGround ? 'rock' : 'circle'
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

        // =========================================================================
        // 1. GENERIC PROJECTILE STAGE (0 to 0.36) - ONLY for standard moves
        // =========================================================================
        if (progress < 0.36 && !isCustomMove) {
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
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-45, 0);
            ctx.lineTo(0, 10);
            ctx.closePath();
            ctx.fill();
          } else if (isFlying) {
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-5, -7);
            ctx.lineTo(-50, -14);
            ctx.moveTo(-5, 7);
            ctx.lineTo(-50, 14);
            ctx.stroke();
          } else if (isWater) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(-20, 0, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-35, 0);
            ctx.stroke();
          }
          ctx.restore();
        }

        // =========================================================================
        // 2. SIGNATURE MOVE SEQUENCES
        // =========================================================================

        // --- A. MEWTWO SIGNATURE: PSYSTRIKE (Crystalline Gem Shards) ---
        if (isPsystrike && progress < 0.75) {
          const shardCount = 6;
          for (let s = 0; s < shardCount; s++) {
            const shardLag = s * 0.035;
            const shardProg = Math.max(0, Math.min(1, (progress - shardLag) / 0.32));
            if (shardProg <= 0) continue;

            const orbitSpread = (s - (shardCount - 1) / 2) * 22;
            const perpX = -Math.sin(angle) * orbitSpread * (1 - shardProg);
            const perpY = Math.cos(angle) * orbitSpread * (1 - shardProg);

            const sx = startX + dx * shardProg + perpX;
            const sy = startY + dy * shardProg + perpY;

            // Draw sharp crystalline dagger/shard
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle + Math.sin(progress * 15 + s) * 0.15);

            ctx.fillStyle = s % 2 === 0 ? '#f472b6' : '#c084fc';
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.lineTo(0, -6);
            ctx.lineTo(-14, 0);
            ctx.lineTo(0, 6);
            ctx.closePath();
            ctx.fill();

            // Diamond crystal core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(0, -2.5);
            ctx.lineTo(-8, 0);
            ctx.lineTo(0, 2.5);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // Crystalline glitter trail
            if (Math.random() < 0.4) {
              spawnParticle({
                x: sx,
                y: sy,
                vx: -Math.cos(angle) * 3 + (Math.random() - 0.5) * 2,
                vy: -Math.sin(angle) * 3 + (Math.random() - 0.5) * 2,
                size: Math.random() * 5 + 3,
                color: s % 2 === 0 ? '#f472b6' : '#e879f9',
                maxLife: 15,
                decay: 0.06,
                type: 'crystal'
              });
            }
          }
        }

        // --- B. PSYCHIC (Psycho-kinetic Distortion Mind Waves) ---
        if (isPsychicMove && progress < 0.70) {
          // Multiple expanding psychic distortion ellipses radiating outward from attacker
          const waveCount = 4;
          for (let w = 0; w < waveCount; w++) {
            const waveProg = (progress * 2.2 + w * 0.25) % 1;
            const wx = startX + dx * waveProg;
            const wy = startY + dy * waveProg;
            const waveRadius = waveProg * 55 + 15;
            const waveAlpha = Math.max(0, 1 - waveProg);

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(angle);
            ctx.strokeStyle = `rgba(236, 72, 153, ${waveAlpha * 0.8})`;
            ctx.lineWidth = Math.max(0.5, 4 * waveAlpha);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(1, waveRadius * 0.6), Math.max(1, waveRadius), 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner psychic frequency ring
            ctx.strokeStyle = `rgba(192, 132, 252, ${waveAlpha})`;
            ctx.lineWidth = Math.max(0.5, 2 * waveAlpha);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(1, waveRadius * 0.35), Math.max(1, waveRadius * 0.7), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Telekinetic dome pulsing over defender
          if (progress >= 0.25) {
            const domeProg = Math.min(1, (progress - 0.25) / 0.45);
            const domeAlpha = Math.max(0, 1 - domeProg);
            ctx.save();
            ctx.translate(targetX, targetY);
            ctx.strokeStyle = `rgba(244, 114, 182, ${domeAlpha * 0.9})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1, 45 + Math.sin(progress * 20) * 8), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }

        // --- C. AURA SPHERE (Spinning Blue/Cyan Orb with Celestial Halo) ---
        if (isAuraSphere && progress < 0.65) {
          const sphereProg = Math.min(progress / 0.34, 1);
          const ax = startX + dx * sphereProg;
          const ay = startY + dy * sphereProg;

          ctx.save();
          ctx.translate(ax, ay);

          // Orbiting celestial halo ring
          ctx.save();
          ctx.rotate(progress * 12);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 12, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 34, 13, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Luminous aura core
          const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
          auraGrad.addColorStop(0, '#ffffff');
          auraGrad.addColorStop(0.35, '#38bdf8');
          auraGrad.addColorStop(0.7, '#0284c7');
          auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Azure spirit particles trailing behind
          if (Math.random() < 0.45) {
            spawnParticle({
              x: ax,
              y: ay,
              vx: -Math.cos(angle) * 3 + (Math.random() - 0.5) * 3,
              vy: -Math.sin(angle) * 3 + (Math.random() - 0.5) * 3,
              size: Math.random() * 6 + 3,
              color: '#38bdf8',
              maxLife: 16,
              decay: 0.05
            });
          }
        }

        // --- D. SHADOW BALL (Dark Void Orb with Orbiting Shadow Wisps) ---
        if (isShadowBall && progress < 0.65) {
          const sbProg = Math.min(progress / 0.34, 1);
          const sbx = startX + dx * sbProg;
          const sby = startY + dy * sbProg;

          ctx.save();
          ctx.translate(sbx, sby);

          // 4 Orbiting dark miasma tendrils
          for (let m = 0; m < 4; m++) {
            const mAngle = progress * 14 + (m * Math.PI / 2);
            const mx = Math.cos(mAngle) * 20;
            const my = Math.sin(mAngle) * 20;
            ctx.fillStyle = '#6b21a8';
            ctx.beginPath();
            ctx.arc(mx, my, 7, 0, Math.PI * 2);
            ctx.fill();
          }

          // Dark Void Core
          const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 24);
          shadowGrad.addColorStop(0, '#e9d5ff');
          shadowGrad.addColorStop(0.25, '#7e22ce');
          shadowGrad.addColorStop(0.7, '#1e1b4b');
          shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Shadow smoke particles
          spawnParticle({
            x: sbx + (Math.random() - 0.5) * 12,
            y: sby + (Math.random() - 0.5) * 12,
            vx: -Math.cos(angle) * 2 + (Math.random() - 0.5) * 2,
            vy: -Math.sin(angle) * 2 + (Math.random() - 0.5) * 2,
            size: Math.random() * 8 + 4,
            color: Math.random() > 0.5 ? '#581c87' : '#9333ea',
            maxLife: 20,
            decay: 0.04
          });
        }

        // --- E. FIRE BLAST (Iconic 5-Point Fire Star Kanji) ---
        if (isFireBlast && progress < 0.70) {
          const fbProg = Math.min(progress / 0.34, 1);
          const fbx = startX + dx * fbProg;
          const fby = startY + dy * fbProg;
          const scale = 1 + fbProg * 0.8;

          ctx.save();
          ctx.translate(fbx, fby);
          ctx.rotate(progress * 4);
          ctx.scale(scale, scale);

          // 5-Point Fire Star Branches
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 9;
          ctx.lineCap = 'round';
          for (let b = 0; b < 5; b++) {
            const bAngle = (b * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bAngle) * 32, Math.sin(bAngle) * 32);
            ctx.stroke();
          }

          // Blazing yellow core lines
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 4;
          for (let b = 0; b < 5; b++) {
            const bAngle = (b * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bAngle) * 28, Math.sin(bAngle) * 28);
            ctx.stroke();
          }

          // Central flame core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Sparks trailing from the 5 tips
          for (let i = 0; i < 2; i++) {
            spawnParticle({
              x: fbx + (Math.random() - 0.5) * 25,
              y: fby + (Math.random() - 0.5) * 25,
              vx: -Math.cos(angle) * 4 + (Math.random() - 0.5) * 4,
              vy: -Math.sin(angle) * 4 + (Math.random() - 0.5) * 4,
              size: Math.random() * 8 + 4,
              color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
              maxLife: 20,
              decay: 0.05
            });
          }
        }

        // --- F. FLAMETHROWER (Continuous High-Pressure Fire Jet) ---
        if (isFlamethrower && progress >= 0.08 && progress < 0.70) {
          const streamProg = Math.min(1, (progress - 0.08) / 0.22);
          const streamEndDist = dist * streamProg;
          const flameCount = isMobile ? 8 : 16;

          for (let f = 0; f < flameCount; f++) {
            const fFrac = Math.random();
            const curDist = streamEndDist * fFrac;
            const spread = fFrac * 26;
            const fx = startX + Math.cos(angle) * curDist + (Math.random() - 0.5) * spread;
            const fy = startY + Math.sin(angle) * curDist + (Math.random() - 0.5) * spread;
            const fSize = (fFrac * 18 + 8);

            const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, Math.max(1, fSize));
            fGrad.addColorStop(0, '#fef08a');
            fGrad.addColorStop(0.4, '#f97316');
            fGrad.addColorStop(0.8, '#dc2626');
            fGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.arc(fx, fy, Math.max(1, fSize), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- G. SURF (Massive Sweeping Tidal Wave) ---
        if (isSurf && progress >= 0.10 && progress < 0.75) {
          const waveProg = Math.min(1, (progress - 0.10) / 0.35);
          const waveX = startX + dx * waveProg;
          const waveY = startY + dy * waveProg;
          const waveAlpha = progress < 0.55 ? 1 : Math.max(0, (0.75 - progress) / 0.20);

          ctx.save();
          ctx.translate(waveX, waveY);
          ctx.rotate(angle);

          // Giant rolling blue tidal arc
          ctx.fillStyle = `rgba(14, 165, 233, ${waveAlpha * 0.7})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, 45, 75, 0, 0, Math.PI * 2);
          ctx.fill();

          // White foaming crest
          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.9})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(10, 0, 65, -Math.PI / 2.5, Math.PI / 2.5);
          ctx.stroke();

          ctx.restore();

          // Spray water foam particles
          for (let i = 0; i < 3; i++) {
            spawnParticle({
              x: waveX + (Math.random() - 0.5) * 30,
              y: waveY + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 5 - 2,
              size: Math.random() * 6 + 3,
              color: '#e0f2fe',
              maxLife: 18,
              decay: 0.05
            });
          }
        }

        // --- H. HYDRO PUMP (Dual High-Pressure Water Cannon Torrents) ---
        if (isHydroPump && progress >= 0.10 && progress < 0.70) {
          const pumpProg = Math.min(1, (progress - 0.10) / 0.22);
          const endX = startX + dx * pumpProg;
          const endY = startY + dy * pumpProg;

          // Jet 1 & Jet 2 (dual parallel streams)
          [-12, 12].forEach(offset => {
            const perpX = -Math.sin(angle) * offset;
            const perpY = Math.cos(angle) * offset;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = isMobile ? 10 : 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX + perpX, startY + perpY);
            ctx.lineTo(endX + perpX, endY + perpY);
            ctx.stroke();

            // Core pressurized jet
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isMobile ? 4 : 6;
            ctx.beginPath();
            ctx.moveTo(startX + perpX, startY + perpY);
            ctx.lineTo(endX + perpX, endY + perpY);
            ctx.stroke();
          });
        }

        // --- I. PROCEDURAL ELECTRIC LIGHTNING ---
        if (isElectric && progress < 0.65) {
          for (let b = 0; b < 2; b++) {
            drawLightningBranch(startX, startY, targetX, targetY, 40, 8, 'rgba(250, 204, 21, 0.4)');
            drawLightningBranch(startX, startY, targetX, targetY, 30, 4, '#facc15');
            drawLightningBranch(startX, startY, targetX, targetY, 20, 2, '#ffffff');
          }

          if (progress >= 0.28 && progress <= 0.58) {
            drawLightningBranch(targetX + (Math.random() - 0.5) * 20, 0, targetX, targetY, 35, 9, 'rgba(250, 204, 21, 0.5)');
            drawLightningBranch(targetX + (Math.random() - 0.5) * 20, 0, targetX, targetY, 25, 4, '#ffffff');
          }
        }

        // --- J. FULL STADIUM CHARGED PLASMA LASER (Hyper Beam / Solar Beam) ---
        // Robust execution with 100% safe clamped values to prevent any freeze or crash
        if (isLaserBeam && progress < 0.90) {
          const isHyperBeam = nameLower.includes('hyper') || (moveType === 'Normal' && nameLower.includes('beam'));
          const primaryBeamColor = isGrass ? '#22c55e' : isHyperBeam ? '#c084fc' : colors.primary;
          const secondaryBeamColor = isGrass ? '#86efac' : isHyperBeam ? '#e9d5ff' : colors.secondary;
          const outerAuraColor = isHyperBeam ? '#c084fc' : isGrass ? '#22c55e' : primaryBeamColor;

          // 1. Charging Vortex / Orbs at Attacker (0 to 0.22)
          if (progress < 0.22) {
            const chargeProg = Math.max(0, Math.min(1, progress / 0.22));
            const ringRadius = Math.max(1, (1 - chargeProg) * 36 + 6);
            ctx.strokeStyle = outerAuraColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(startX, startY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            const coreRadius = Math.max(1, chargeProg * 18);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(startX, startY, coreRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Blazing Continuous Progressive Laser Blast (0.16 to 0.90)
          if (progress >= 0.16) {
            const reach = progress >= 0.26 ? 1 : Math.max(0, Math.min(1, (progress - 0.16) / 0.10));
            const beamEndX = startX + (targetX - startX) * reach;
            const beamEndY = startY + (targetY - startY) * reach;
            const beamAlpha = progress < 0.65 ? 1 : Math.max(0, (0.90 - progress) / 0.25);

            // Glowing energy nozzle anchor at attacker
            const nozzleRadius = Math.max(0.5, 18 * beamAlpha);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(startX, startY, nozzleRadius, 0, Math.PI * 2);
            ctx.fill();

            const nozzleOuterRadius = Math.max(0.5, 26 * beamAlpha);
            ctx.strokeStyle = outerAuraColor;
            ctx.lineWidth = Math.max(0.5, 8 * beamAlpha);
            ctx.beginPath();
            ctx.arc(startX, startY, nozzleOuterRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Outer radiant plasma aura
            ctx.strokeStyle = outerAuraColor;
            ctx.lineWidth = Math.max(1, (isMobile ? 30 : 44) * beamAlpha);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(beamEndX, beamEndY);
            ctx.stroke();

            // Middle high-energy plasma beam
            ctx.strokeStyle = secondaryBeamColor;
            ctx.lineWidth = Math.max(1, (isMobile ? 18 : 26) * beamAlpha);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(beamEndX, beamEndY);
            ctx.stroke();

            // Hot-white blinding laser core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, (isMobile ? 10 : 14) * beamAlpha);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(beamEndX, beamEndY);
            ctx.stroke();

            // Shockwave rings shooting down the beam
            if (reach >= 0.5 && Math.random() < (isMobile ? 0.2 : 0.4)) {
              const ringPos = Math.random() * reach;
              const rx = startX + (targetX - startX) * ringPos;
              const ry = startY + (targetY - startY) * ringPos;
              spawnRing(rx, ry, primaryBeamColor, isMobile ? 24 : 35, 3, 2.5);
            }
          }
        }

        // --- K. RAZOR-SHARP ANIME SPEED SLASHES ---
        if (isSlash && progress >= 0.22 && progress < 0.65) {
          const slashProg = (progress - 0.22) / 0.43;
          const alpha = slashProg < 0.5 ? 1 : (1 - slashProg) * 2;

          ctx.save();
          ctx.translate(targetX, targetY);

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-50, -50);
          ctx.quadraticCurveTo(8, 8, 50, 50);
          ctx.stroke();

          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(50, -45);
          ctx.quadraticCurveTo(0, 0, -50, 45);
          ctx.stroke();

          ctx.restore();
        }

        // --- L. DITTO TRANSFORM SPIRAL ---
        if (isTransform && progress < 0.8) {
          const spiralProg = progress / 0.8;
          ctx.save();
          ctx.translate(startX, startY);
          ctx.rotate(spiralProg * Math.PI * 5);
          ctx.strokeStyle = 'rgba(217, 70, 239, 0.9)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.1, spiralProg * 45), 0, Math.PI * 1.5);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(244, 114, 182, 0.9)';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.1, spiralProg * 30), Math.PI, Math.PI * 2.5);
          ctx.stroke();
          ctx.restore();
        }

        // --- M. IMPACT CORE DETONATION FLASH (0.36 to 0.65) ---
        if (progress >= 0.36 && progress <= 0.65) {
          const flashProg = Math.max(0, Math.min(1, (progress - 0.36) / 0.29));
          const flashAlpha = Math.max(0, Math.min(1, 1 - flashProg));
          const flashRadius = Math.max(1, flashProg * 40 + 20);

          const isHyperBeam = nameLower.includes('hyper') || (moveType === 'Normal' && nameLower.includes('beam'));
          const impactColor = isGrass ? '#22c55e' : isHyperBeam ? '#c084fc' : isPsystrike ? '#e879f9' : isAuraSphere ? '#38bdf8' : isShadowBall ? '#a855f7' : colors.primary;

          const flashGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, flashRadius);
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
          flashGrad.addColorStop(0.4, hexToRgba(impactColor, flashAlpha));
          flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(targetX, targetY, flashRadius, 0, Math.PI * 2);
          ctx.fill();

          // 4-point rotating anime impact star
          ctx.save();
          ctx.translate(targetX, targetY);
          ctx.rotate(progress * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
          const starSize = Math.max(1, 50 * flashAlpha);
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

        // =========================================================================
        // 3. DRAW & UPDATE EXPANDING SHOCKWAVE RINGS
        // =========================================================================
        for (let i = impactRings.length - 1; i >= 0; i--) {
          const ring = impactRings[i];
          ring.radius += ring.speed;
          ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);

          if (ring.radius >= ring.maxRadius || ring.alpha <= 0) {
            impactRings.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = Math.max(0.1, ring.lineWidth * ring.alpha);
          ctx.globalAlpha = Math.max(0, Math.min(1, ring.alpha));
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, Math.max(0.1, ring.radius), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // =========================================================================
        // 4. DRAW & UPDATE PARTICLES
        // =========================================================================
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
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(0.5, p.size * 0.6);
            ctx.beginPath();
            ctx.moveTo(-p.size * 2, 0);
            ctx.lineTo(p.size * 2, 0);
            ctx.stroke();
          } else if (p.type === 'crystal') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.4, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.4, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.type === 'rock') {
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
            if (isMobile) {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0.5, p.size * 0.8), 0, Math.PI * 2);
              ctx.fill();
            } else {
              const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, p.size));
              radGrad.addColorStop(0, '#ffffff');
              radGrad.addColorStop(0.4, p.color);
              radGrad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = radGrad;
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(1, p.size), 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }

      } catch (err) {
        console.error('VFX Render Frame Error:', err);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [moveName, attackerSide, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-40"
    />
  );
}
