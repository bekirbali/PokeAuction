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
    // Mid-air projectile trajectory coordinates (torso center of mass)
    const startX = isP1 ? width * 0.22 : width * 0.77;
    const startY = isP1 ? height * 0.68 : height * 0.32;
    const targetX = isP1 ? width * 0.77 : width * 0.22;
    const targetY = isP1 ? height * 0.32 : height * 0.68;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Ground-level stadium platform coordinates (physically beneath the combatants' feet)
    const p1GroundX = width * 0.21;
    const p1GroundY = height * 0.88;
    const p2GroundX = width * 0.77;
    const p2GroundY = height * 0.585;

    const groundStartX = isP1 ? p1GroundX : p2GroundX;
    const groundStartY = isP1 ? p1GroundY : p2GroundY;
    const groundTargetX = isP1 ? p2GroundX : p1GroundX;
    const groundTargetY = isP1 ? p2GroundY : p1GroundY;

    const groundDx = groundTargetX - groundStartX;
    const groundDy = groundTargetY - groundStartY;
    const groundDist = Math.hypot(groundDx, groundDy) || 1;
    const groundAngle = Math.atan2(groundDy, groundDx);

    // Specific Signature Move Classifications
    const isPsystrike = nameLower.includes('psystrike');
    const isPsychicMove = (nameLower === 'psychic' || nameLower.includes('confusion') || nameLower.includes('psywave')) && !isPsystrike;
    const isAuraSphere = nameLower.includes('aura sphere') || nameLower.includes('focus blast');
    const isShadowBall = nameLower.includes('shadow ball') || nameLower.includes('night shade');
    const isFireBlast = nameLower.includes('fire blast');
    const isFlamethrower = (nameLower.includes('flamethrower') || nameLower.includes('flame wheel') || nameLower.includes('fire spin')) && !isFireBlast;
    const isSurf = nameLower.includes('surf') || nameLower.includes('muddy water');
    const isHydroPump = nameLower.includes('hydro pump') || nameLower.includes('water cannon');
    const isLaserBeam = nameLower.includes('beam') || (nameLower.includes('cannon') && !nameLower.includes('zap')) || nameLower.includes('solar');

    // Electric Move Sub-types
    const isThunder = nameLower === 'thunder' || nameLower.includes('gök gürültüsü');
    const isZapCannon = nameLower.includes('zap') || nameLower.includes('wave') || nameLower.includes('discharge') || (nameLower.includes('cannon') && nameLower.includes('zap'));
    const isThunderbolt = (moveType === 'Electric' || nameLower.includes('thunder') || nameLower.includes('spark') || nameLower.includes('bolt')) && !isThunder && !isZapCannon;
    const isElectric = isThunder || isThunderbolt || isZapCannon;

    // Ground / Rock Move Sub-types
    const isEarthquake = nameLower.includes('earthquake') || nameLower.includes('quake') || nameLower.includes('fissure') || nameLower.includes('earth power') || nameLower.includes('mud');
    const isDig = nameLower.includes('dig');
    const isRockAttack = (moveType === 'Rock' || nameLower.includes('rock') || nameLower.includes('slide') || nameLower.includes('tomb') || nameLower.includes('stone') || nameLower.includes('boulder')) && !isEarthquake && !isDig;
    const isRockOrGround = isEarthquake || isDig || isRockAttack || moveType === 'Ground';

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
    const isFighting = (moveType === 'Fighting' || nameLower.includes('punch') || nameLower.includes('kick') || nameLower.includes('combat') || nameLower.includes('karate') || nameLower.includes('submission') || nameLower.includes('seismic')) && !isAuraSphere;
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
    const duration = (isLaserBeam ? 1100 : (isPsystrike || isFireBlast || isSurf || isHydroPump || isPsychicMove || isEarthquake ? 1050 : 950)) / Math.max(speed, 0.5);
    let impactTriggered = false;

    const render = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ALWAYS schedule next frame first
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      }

      try {
        // --- IMPACT EVENT AT 30% (approx 300ms) ---
        if (progress >= 0.30 && !impactTriggered) {
          impactTriggered = true;
          if (onImpact) onImpact();

          const impactRingX = isEarthquake ? groundTargetX : targetX;
          const impactRingY = isEarthquake ? groundTargetY : targetY;

          // 1. Shockwave rings at target
          const shockColor = isPsystrike ? '#e879f9' : isAuraSphere ? '#38bdf8' : isShadowBall ? '#a855f7' : isEarthquake ? '#d97706' : isElectric ? '#facc15' : colors.primary;
          spawnRing(impactRingX, impactRingY, shockColor, isMobile ? 60 : 85, isMobile ? 4 : 6, isMobile ? 3 : 5);
          spawnRing(impactRingX, impactRingY, '#ffffff', isMobile ? 40 : 55, isMobile ? 3 : 4.5, isMobile ? 2.5 : 3.5);

          // 2. High-volume kinetic particle burst
          const burstX = isEarthquake ? groundTargetX : targetX;
          const burstY = isEarthquake ? groundTargetY : targetY;
          const particleCount = isMobile ? (isLaserBeam || isPsystrike || isEarthquake ? 22 : 16) : (isLaserBeam || isPsystrike || isEarthquake ? 50 : isElectric ? 45 : isFire ? 50 : 35);
          for (let i = 0; i < particleCount; i++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 8 + 3;
            spawnParticle({
              x: burstX,
              y: burstY,
              vx: Math.cos(pAngle) * pSpeed,
              vy: Math.sin(pAngle) * pSpeed - (isFire || isWater || isSurf || isEarthquake ? Math.random() * 3 : 0),
              size: Math.random() * 8 + 4,
              color: i % 3 === 0 ? colors.core : i % 2 === 0 ? colors.primary : colors.secondary,
              maxLife: isMobile ? 22 : 35,
              decay: isMobile ? 0.045 : 0.03,
              type: (isIce || isPsystrike) ? 'crystal' : isElectric ? 'spark' : (isRockOrGround || isEarthquake) ? 'rock' : 'circle'
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

          const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 26);
          grad.addColorStop(0, colors.core || '#ffffff');
          grad.addColorStop(0.35, colors.primary);
          grad.addColorStop(0.7, colors.secondary);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, 26, 0, Math.PI * 2);
          ctx.fill();

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

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(0, -2.5);
            ctx.lineTo(-8, 0);
            ctx.lineTo(0, 2.5);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

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

            ctx.strokeStyle = `rgba(192, 132, 252, ${waveAlpha})`;
            ctx.lineWidth = Math.max(0.5, 2 * waveAlpha);
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(1, waveRadius * 0.35), Math.max(1, waveRadius * 0.7), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

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

        // --- C. AURA SPHERE (Spinning Blue/Cyan Orb with Celestial Halo - NO FISTS!) ---
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

          for (let m = 0; m < 4; m++) {
            const mAngle = progress * 14 + (m * Math.PI / 2);
            const mx = Math.cos(mAngle) * 20;
            const my = Math.sin(mAngle) * 20;
            ctx.fillStyle = '#6b21a8';
            ctx.beginPath();
            ctx.arc(mx, my, 7, 0, Math.PI * 2);
            ctx.fill();
          }

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

          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 4;
          for (let b = 0; b < 5; b++) {
            const bAngle = (b * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bAngle) * 28, Math.sin(bAngle) * 28);
            ctx.stroke();
          }

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

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

          ctx.fillStyle = `rgba(14, 165, 233, ${waveAlpha * 0.7})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, 45, 75, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.9})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(10, 0, 65, -Math.PI / 2.5, Math.PI / 2.5);
          ctx.stroke();

          ctx.restore();

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

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isMobile ? 4 : 6;
            ctx.beginPath();
            ctx.moveTo(startX + perpX, startY + perpY);
            ctx.lineTo(endX + perpX, endY + perpY);
            ctx.stroke();
          });
        }

        // --- I. DIVERSIFIED ELECTRIC ATTACKS ---

        // 1. THUNDER (Blinding Celestial Sky Pillar from the Heavens)
        if (isThunder && progress >= 0.12 && progress < 0.70) {
          const thunderAlpha = progress < 0.45 ? 1 : Math.max(0, (0.70 - progress) / 0.25);
          // Giant Vertical Bolt crashing from top of the sky (y = 0) down onto defender pedestal
          drawLightningBranch(targetX + (Math.random() - 0.5) * 20, 0, targetX, targetY, 35, 14 * thunderAlpha, 'rgba(250, 204, 21, 0.45)');
          drawLightningBranch(targetX + (Math.random() - 0.5) * 10, 0, targetX, targetY, 25, 8 * thunderAlpha, '#facc15');
          drawLightningBranch(targetX, 0, targetX, targetY, 15, 4 * thunderAlpha, '#ffffff');

          // Ground electric forks shattering across the target pedestal floor
          if (progress >= 0.22) {
            drawLightningBranch(targetX, targetY, targetX - 65, targetY + 8, 18, 5 * thunderAlpha, '#facc15');
            drawLightningBranch(targetX, targetY, targetX + 65, targetY + 8, 18, 5 * thunderAlpha, '#facc15');
            drawLightningBranch(targetX, targetY, targetX - 35, targetY - 20, 14, 3 * thunderAlpha, '#ffffff');
            drawLightningBranch(targetX, targetY, targetX + 35, targetY - 20, 14, 3 * thunderAlpha, '#ffffff');
          }
        }

        // 2. ZAP CANNON / THUNDER WAVE (Crackling Electromagnetic Plasma Orb)
        if (isZapCannon && progress < 0.65) {
          const zcProg = Math.min(progress / 0.34, 1);
          const zcx = startX + dx * zcProg;
          const zcy = startY + dy * zcProg;

          ctx.save();
          ctx.translate(zcx, zcy);

          // 3 Orbiting electromagnetic spark rings
          for (let r = 0; r < 3; r++) {
            ctx.save();
            ctx.rotate(progress * 16 + (r * Math.PI / 3));
            ctx.strokeStyle = r === 0 ? '#ffffff' : '#facc15';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Blazing electric plasma ball
          const zcGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
          zcGrad.addColorStop(0, '#ffffff');
          zcGrad.addColorStop(0.3, '#facc15');
          zcGrad.addColorStop(0.7, '#eab308');
          zcGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = zcGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          if (Math.random() < 0.5) {
            spawnParticle({
              x: zcx + (Math.random() - 0.5) * 16,
              y: zcy + (Math.random() - 0.5) * 16,
              vx: -Math.cos(angle) * 3 + (Math.random() - 0.5) * 3,
              vy: -Math.sin(angle) * 3 + (Math.random() - 0.5) * 3,
              size: Math.random() * 6 + 2,
              color: '#fef08a',
              maxLife: 14,
              decay: 0.06,
              type: 'spark'
            });
          }
        }

        // 3. THUNDERBOLT (High-Voltage Horizontal Leaping Stream)
        if (isThunderbolt && progress < 0.65) {
          for (let b = 0; b < 3; b++) {
            const arcOffset = (b - 1) * 14;
            drawLightningBranch(startX, startY + arcOffset, targetX, targetY + arcOffset, 42, 7, 'rgba(250, 204, 21, 0.4)');
            drawLightningBranch(startX, startY + arcOffset, targetX, targetY + arcOffset, 28, 4, '#facc15');
            drawLightningBranch(startX, startY + arcOffset, targetX, targetY + arcOffset, 16, 2, '#ffffff');
          }
        }

        // --- J. DIVERSIFIED GROUND & ROCK ATTACKS ---

        // 1. EARTHQUAKE / FISSURE / EARTH POWER (Tectonic Ground Fracture & Erupting 3D Spires)
        if (isEarthquake && progress >= 0.08 && progress < 0.75) {
          const eqAlpha = progress < 0.58 ? 1 : Math.max(0, (0.75 - progress) / 0.17);
          // Fissure travels rapidly across the turf from start to target between 0.08 and 0.28
          const fissureProg = Math.min(1, Math.max(0, (progress - 0.08) / 0.18));

          // Normal vector perpendicular to ground fissure direction
          const normX = -Math.sin(groundAngle);
          const normY = Math.cos(groundAngle);

          // Deterministic organic tectonic fracture lateral offsets
          const FISSURE_OFFSETS = [
            0, 5, -8, 12, -14, 16, -10, 18, -15, 20, -12, 17, -19, 13, -16, 14, -11, 15, -8, 10, -5, 6, 0
          ];
          const totalPts = FISSURE_OFFSETS.length;
          const currentMaxIdx = (totalPts - 1) * fissureProg;

          // Build the active fracture points up to current progression
          const activePoints = [];
          for (let i = 0; i < totalPts; i++) {
            if (i > currentMaxIdx + 1) break;
            const frac = i / (totalPts - 1);
            const lateral = FISSURE_OFFSETS[i] * (isMobile ? 0.65 : 1.1);

            let px = groundStartX + groundDx * frac + normX * lateral;
            let py = groundStartY + groundDy * frac + normY * lateral;

            // Smooth interpolation for the advancing tip
            if (i > currentMaxIdx) {
              const subFrac = currentMaxIdx - Math.floor(currentMaxIdx);
              const prev = activePoints[activePoints.length - 1];
              px = prev.x + (px - prev.x) * subFrac;
              py = prev.y + (py - prev.y) * subFrac;
              activePoints.push({ x: px, y: py, i });
              break;
            }
            activePoints.push({ x: px, y: py, i });
          }

          if (activePoints.length >= 2) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'bevel';

            const drawFissurePath = () => {
              ctx.beginPath();
              ctx.moveTo(activePoints[0].x, activePoints[0].y);
              for (let i = 1; i < activePoints.length; i++) {
                ctx.lineTo(activePoints[i].x, activePoints[i].y);
              }
            };

            // Switch to source-over so the dark chasm can physically carve out the stadium turf!
            ctx.globalCompositeOperation = 'source-over';

            // LAYER 1: Deep Trench Abyss (Wide dark trench physically tearing the turf open)
            ctx.strokeStyle = `rgba(14, 7, 3, ${eqAlpha * 0.96})`;
            ctx.lineWidth = isMobile ? 12 : 18;
            drawFissurePath();
            ctx.stroke();

            // LAYER 2: Fractured Clay & Earth Crust (Terracotta rim of broken turf)
            ctx.strokeStyle = `rgba(146, 64, 14, ${eqAlpha * 0.9})`;
            ctx.lineWidth = isMobile ? 7 : 10;
            drawFissurePath();
            ctx.stroke();

            // Switch to lighter for intense subterranean molten energy
            ctx.globalCompositeOperation = 'lighter';

            // LAYER 3: Subterranean Seismic Glow (Amber-orange molten tectonic energy)
            ctx.strokeStyle = `rgba(245, 158, 11, ${eqAlpha * 0.85})`;
            ctx.lineWidth = isMobile ? 3.5 : 5;
            drawFissurePath();
            ctx.stroke();

            // LAYER 4: Burning Molten Core
            ctx.strokeStyle = `rgba(254, 240, 138, ${eqAlpha * 0.95})`;
            ctx.lineWidth = isMobile ? 1.4 : 2.2;
            drawFissurePath();
            ctx.stroke();

            // LAYER 5: Lateral Branch Micro-Cracks shooting out into the pitch
            const branchIndices = [4, 8, 12, 16];
            branchIndices.forEach((bIdx, bCount) => {
              if (bIdx < activePoints.length) {
                const pt = activePoints[bIdx];
                const bDir = bCount % 2 === 0 ? 1 : -1;
                const bLen = isMobile ? 12 : 20;
                const bx = pt.x + (normX * bDir * 0.8 + Math.cos(groundAngle) * 0.2) * bLen;
                const by = pt.y + (normY * bDir * 0.8 + Math.sin(groundAngle) * 0.2) * bLen;

                // Branch trench
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = `rgba(120, 53, 15, ${eqAlpha * 0.85})`;
                ctx.lineWidth = isMobile ? 2.5 : 3.5;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(bx, by);
                ctx.stroke();

                // Branch inner glow
                ctx.globalCompositeOperation = 'lighter';
                ctx.strokeStyle = `rgba(251, 191, 36, ${eqAlpha * 0.75})`;
                ctx.lineWidth = isMobile ? 1 : 1.5;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(bx, by);
                ctx.stroke();
              }
            });

            ctx.restore();

            // Fissure tip tearing particles and glowing seismic head
            if (fissureProg > 0 && fissureProg < 1) {
              const tip = activePoints[activePoints.length - 1];
              // Glowing rupture point at the leading edge
              ctx.save();
              const headGrad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, isMobile ? 14 : 22);
              headGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
              headGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.8)');
              headGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = headGrad;
              ctx.beginPath();
              ctx.arc(tip.x, tip.y, isMobile ? 14 : 22, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // Spawn tearing soil particles as crack races forward
              if (Math.random() < 0.75) {
                spawnParticle({
                  x: tip.x + (Math.random() - 0.5) * 8,
                  y: tip.y + (Math.random() - 0.5) * 8,
                  vx: (Math.random() - 0.5) * 4 - Math.cos(groundAngle) * 1.5,
                  vy: -Math.random() * 4 - 1.5,
                  size: Math.random() * 6 + 3,
                  color: Math.random() > 0.4 ? '#92400e' : '#b45309',
                  maxLife: 18,
                  decay: 0.05,
                  type: 'rock'
                });
              }
            }
          }

          // 2. ERUPTING 3D EARTHEN SPIRES (Stalagmites bursting directly from underneath defender)
          if (progress >= 0.24) {
            const gx = groundTargetX;
            const gy = groundTargetY;

            ctx.save();

            // A. Fractured impact crater basin on the defender's pedestal
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.ellipse(gx, gy, 46, 15, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(15, 7, 2, ${eqAlpha * 0.95})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(217, 119, 6, ${eqAlpha * 0.85})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Molten magma core leaking from pedestal crater
            ctx.globalCompositeOperation = 'lighter';
            const craterGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 36);
            craterGlow.addColorStop(0, `rgba(254, 240, 138, ${eqAlpha * 0.9})`);
            craterGlow.addColorStop(0.45, `rgba(245, 158, 11, ${eqAlpha * 0.6})`);
            craterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = craterGlow;
            ctx.beginPath();
            ctx.ellipse(gx, gy, 36, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // B. 5 Organic 3D Faceted Rock Spires / Stalagmites
            const SPIRES = [
              { xOff: -38, yOff: 3,  w: 13, h: 42, delay: 0.03, lean: -4 },
              { xOff: -18, yOff: 7,  w: 18, h: 60, delay: 0.01, lean: -2 },
              { xOff: 0,   yOff: 10, w: 22, h: 74, delay: 0.00, lean: 0  }, // Dominant center spire
              { xOff: 20,  yOff: 7,  w: 17, h: 56, delay: 0.02, lean: 3  },
              { xOff: 38,  yOff: 3,  w: 13, h: 38, delay: 0.04, lean: 5  }
            ];

            SPIRES.forEach(s => {
              if (progress >= 0.24 + s.delay) {
                const sProg = Math.min(1, (progress - 0.24 - s.delay) / 0.11);
                // Elastic explosive upward eruption with slight overshoot bounce
                const bounceH = Math.sin(sProg * Math.PI * 0.5) * (1 + 0.10 * (1 - sProg));
                const currentH = s.h * bounceH * (isMobile ? 0.8 : 1.0);
                const baseX = gx + s.xOff;
                const baseY = gy + s.yOff;
                const tipX = baseX + s.lean;
                const tipY = baseY - currentH;
                const halfW = s.w * 0.5;

                // 1. Left Lit Facet (Golden terracotta rock caught by arena light)
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.moveTo(baseX - halfW, baseY);
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(baseX, baseY);
                ctx.closePath();
                ctx.fillStyle = `rgba(180, 83, 9, ${eqAlpha})`;
                ctx.fill();

                // Bright left facet edge highlight
                ctx.strokeStyle = `rgba(254, 240, 138, ${eqAlpha * 0.85})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // 2. Right Shadow Facet (Deep cavern brown/black basalt)
                ctx.beginPath();
                ctx.moveTo(baseX, baseY);
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(baseX + halfW, baseY);
                ctx.closePath();
                ctx.fillStyle = `rgba(69, 26, 3, ${eqAlpha})`;
                ctx.fill();

                // 3. Center Glowing Spine Ridge (Molten seismic seam down the rock)
                ctx.globalCompositeOperation = 'lighter';
                ctx.beginPath();
                ctx.moveTo(baseX, baseY);
                ctx.lineTo(tipX, tipY);
                ctx.strokeStyle = `rgba(251, 191, 36, ${eqAlpha * 0.9})`;
                ctx.lineWidth = 1.8;
                ctx.stroke();
              }
            });

            ctx.restore();

            // Violent rock shards & billowing dust bursts during eruption phase
            if (progress < 0.50 && Math.random() < 0.7) {
              spawnParticle({
                x: gx + (Math.random() - 0.5) * 55,
                y: gy + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 8 - 3,
                size: Math.random() * 8 + 4,
                color: Math.random() > 0.4 ? '#b45309' : '#78350f',
                maxLife: 26,
                decay: 0.04,
                type: 'rock'
              });
            }
          }
        }

        // 2. DIG (Underground Burrow Tunnel & Violent Dirt Eruption)
        if (isDig && progress < 0.70) {
          if (progress < 0.30) {
            const digProg = progress / 0.30;
            const burrowX = groundStartX + groundDx * digProg;
            const burrowY = groundStartY + groundDy * digProg;
            spawnParticle({
              x: burrowX,
              y: burrowY,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 4 - 1,
              size: Math.random() * 7 + 3,
              color: '#92400e',
              maxLife: 15,
              decay: 0.06,
              type: 'rock'
            });
          }
        }

        // --- K. FULL STADIUM CHARGED PLASMA LASER (Hyper Beam / Solar Beam) ---
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

        // --- L. RAZOR-SHARP ANIME SPEED SLASHES ---
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

        // --- M. DITTO TRANSFORM SPIRAL ---
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

        // --- N. IMPACT CORE DETONATION FLASH (0.36 to 0.65) ---
        if (progress >= 0.36 && progress <= 0.65) {
          const flashProg = Math.max(0, Math.min(1, (progress - 0.36) / 0.29));
          const flashAlpha = Math.max(0, Math.min(1, 1 - flashProg));
          const flashRadius = Math.max(1, flashProg * 40 + 20);

          const isHyperBeam = nameLower.includes('hyper') || (moveType === 'Normal' && nameLower.includes('beam'));
          const impactColor = isGrass ? '#22c55e' : isHyperBeam ? '#c084fc' : isPsystrike ? '#e879f9' : isAuraSphere ? '#38bdf8' : isShadowBall ? '#a855f7' : isEarthquake ? '#d97706' : colors.primary;

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
