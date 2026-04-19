import React, { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

type RegionKey = "EC" | "DG" | "CA3" | "CA1";

interface RegionColor {
  base: string;
  r: number;
  g: number;
  b: number;
  bg: string;
}

interface NeuronState {
  x: number;
  y: number;
  region: RegionKey;
  charge: number;
  firing: boolean;
  refractoryUntil: number;
  id: string;
  idx: number;
  noise: number;
  noisePhase: number;
  memWeight: number;
}

interface SynapseState {
  src: NeuronState;
  dst: NeuronState;
  strength: number;
  useCount: number;
  cp: Pt;
  key: string;
  lastUsed: number;
}

interface SignalState {
  syn: SynapseState;
  t: number;
  speed: number;
  active: boolean;
  born: number;
}

interface RippleState {
  x: number;
  y: number;
  rr: number;
  maxR: number;
  alpha: number;
  col: string;
  rings: number;
}

interface RegionBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  r: RegionKey;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REGIONS: RegionKey[] = ["EC", "DG", "CA3", "CA1"];

const RC: Record<RegionKey, RegionColor> = {
  EC:  { base: "#1e88e5", r: 30,  g: 136, b: 229, bg: "rgba(30,136,229,0.055)"  },
  DG:  { base: "#43a047", r: 67,  g: 160, b: 71,  bg: "rgba(67,160,71,0.055)"   },
  CA3: { base: "#fb8c00", r: 251, g: 140, b: 0,   bg: "rgba(251,140,0,0.055)"   },
  CA1: { base: "#8e24aa", r: 142, g: 36,  b: 170, bg: "rgba(142,36,170,0.055)"  },
};

const N_NEURONS: Record<RegionKey, number> = { EC: 14, DG: 16, CA3: 12, CA1: 12 };
const THRESHOLD   = 0.6;
const REFRACTORY  = 1250;
const DECAY       = 0.9925;
const NEXT: Record<RegionKey, RegionKey> = { EC: "DG", DG: "CA3", CA3: "CA1", CA1: "EC" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function bezierPt(p0: Pt, cp: Pt, p2: Pt, t: number): Pt {
  return {
    x: lerp(lerp(p0.x, cp.x, t), lerp(cp.x, p2.x, t), t),
    y: lerp(lerp(p0.y, cp.y, t), lerp(cp.y, p2.y, t), t),
  };
}

function rRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TrisynapticCircuitSimulation() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const tipRef     = useRef<HTMLDivElement>(null);

  // HUD element refs
  const hudTimeRef    = useRef<HTMLSpanElement>(null);
  const actFillRef    = useRef<HTMLDivElement>(null);
  const actLblRef     = useRef<HTMLSpanElement>(null);
  const loopFillRef   = useRef<HTMLDivElement>(null);
  const loopLblRef    = useRef<HTMLSpanElement>(null);
  const statusLblRef  = useRef<HTMLSpanElement>(null);
  const fpsLblRef     = useRef<HTMLSpanElement>(null);
  const cornerTLRef   = useRef<HTMLDivElement>(null);
  const cornerTRRef   = useRef<HTMLDivElement>(null);
  const cornerBLRef   = useRef<HTMLDivElement>(null);
  const cornerBRRef   = useRef<HTMLDivElement>(null);
  const btnFocusRef   = useRef<HTMLButtonElement>(null);
  const btnLoopRef    = useRef<HTMLButtonElement>(null);
  const btnNoiseRef   = useRef<HTMLButtonElement>(null);
  const btnGhostRef   = useRef<HTMLButtonElement>(null);

  // Simulation state (mutable refs, not React state — no re-renders)
  const simRef = useRef({
    W: 0, H: 0,
    neurons: {} as Record<RegionKey, NeuronState[]>,
    synapses: [] as SynapseState[],
    signals:  [] as SignalState[],
    ripples:  [] as RippleState[],
    noiseOn:   true,
    memLoopOn: true,
    ghostOn:   false,
    focusMode: false,
    focusIdx:  0,
    focusRegion: null as RegionKey | null,
    zoom: 1, camX: 0, camY: 0,
    tZoom: 1, tCamX: 0, tCamY: 0,
    lastTime: 0,
    fCount: 0, lastFpsT: 0,
    ambTimer: 0,
    totalLoops: 0,
    hovN: null as NeuronState | null,
    rafId: 0,
  });

  // ── Build network ─────────────────────────────────────────────────────────

  const buildNetwork = useCallback(() => {
    const sim = simRef.current;
    const { W, H } = sim;

    // Region bounds
    const bounds = (): RegionBounds[] => {
      const pad = W * 0.04, rW = W * 0.17, rH = H * 0.56;
      const gap = (W - 2 * pad - 4 * rW) / 3;
      const cy = H * 0.46;
      return REGIONS.map((r, i) => ({
        x: pad + i * (rW + gap), y: cy - rH / 2,
        w: rW, h: rH,
        cx: pad + i * (rW + gap) + rW / 2, cy, r,
      }));
    };

    const B = bounds();
    sim.neurons = { EC: [], DG: [], CA3: [], CA1: [] };

    REGIONS.forEach((r, ri) => {
      const b = B[ri], n = N_NEURONS[r];
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const ox = Math.sin(t * 11.3 + ri * 2.7) * b.w * 0.22 + Math.cos(t * 7.1 + i) * b.w * 0.09;
        const oy = Math.cos(t * 9.1 + ri) * b.h * 0.05;
        sim.neurons[r].push({
          x: b.cx + ox + (Math.random() - 0.5) * b.w * 0.1,
          y: b.y + b.h * 0.1 + t * b.h * 0.8 + oy,
          region: r, charge: 0, firing: false, refractoryUntil: 0,
          id: `${r}_${i}`, idx: i,
          noise: Math.random() * 0.035,
          noisePhase: Math.random() * Math.PI * 2,
          memWeight: 0,
        });
      }
    });

    sim.synapses = [];
    const pairs: [RegionKey, RegionKey][] = [["EC","DG"],["DG","CA3"],["CA3","CA1"],["CA1","EC"]];
    pairs.forEach(([src, dst]) => {
      sim.neurons[src].forEach((s, si) => {
        const dn = sim.neurons[dst];
        const nC = dst === "DG" ? 3 : 2;
        for (let k = 0; k < nC; k++) {
          const di = (si * nC + k + Math.floor(k * 1.3)) % dn.length;
          const cpx = (s.x + dn[di].x) / 2 + (Math.random() - 0.5) * W * 0.055;
          const cpy = (s.y + dn[di].y) / 2 + (Math.random() - 0.5) * H * 0.075;
          sim.synapses.push({
            src: s, dst: dn[di],
            strength: 1, useCount: 0,
            cp: { x: cpx, y: cpy },
            key: `${s.id}->${dn[di].id}`,
            lastUsed: 0,
          });
        }
      });
    });

    sim.signals = [];
    sim.ripples = [];
    sim.totalLoops = 0;
  }, []);

  // ── Fire neuron ───────────────────────────────────────────────────────────

  const fireNeuron = useCallback((n: NeuronState, now: number) => {
    const sim = simRef.current;
    if (now < n.refractoryUntil || n.firing) return;
    n.firing = true;
    n.charge = 1;
    n.refractoryUntil = now + REFRACTORY;
    n.memWeight = Math.min(1, n.memWeight + 0.12);

    const nextR = NEXT[n.region];
    sim.synapses
      .filter(s => s.src === n && s.dst.region === nextR)
      .forEach(syn => {
        syn.useCount++;
        syn.strength = Math.min(4.5, 1 + syn.useCount * 0.1);
        syn.lastUsed = now;
        sim.signals.push({ syn, t: 0, speed: 0.00052 + Math.random() * 0.00035, active: true, born: now });
      });
  }, []);

  const spawnRipple = useCallback((x: number, y: number, col: string) => {
    const sim = simRef.current;
    sim.ripples.push({
      x, y, rr: 0, maxR: sim.W * 0.065, alpha: 0.65, col,
      rings: 1 + Math.floor(Math.random() * 2),
    });
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────

  const resize = useCallback(() => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    const canvasArea = canvasAreaRef.current;
    if (!canvas || !canvasArea) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasArea.getBoundingClientRect();
    sim.W = Math.max(320, rect.width);
    sim.H = Math.max(320, rect.height);
    canvas.width  = sim.W * dpr;
    canvas.height = sim.H * dpr;
    canvas.style.height = `${sim.H}px`;
    canvas.style.width = `${sim.W}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNetwork();
  }, [buildNetwork]);

  // ── Region bounds (live) ──────────────────────────────────────────────────

  const getRegionBounds = useCallback((): RegionBounds[] => {
    const { W, H } = simRef.current;
    const pad = W * 0.04, rW = W * 0.17, rH = H * 0.56;
    const gap = (W - 2 * pad - 4 * rW) / 3;
    const cy = H * 0.46;
    return REGIONS.map((r, i) => ({
      x: pad + i * (rW + gap), y: cy - rH / 2,
      w: rW, h: rH,
      cx: pad + i * (rW + gap) + rW / 2, cy, r,
    }));
  }, []);

  // ── Render loop ───────────────────────────────────────────────────────────

  const drawFrame = useCallback((now: number) => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const dt = Math.min(48, now - (sim.lastTime || now));
    sim.lastTime = now;
    sim.fCount++;
    if (now - sim.lastFpsT > 600) {
      if (fpsLblRef.current)
        fpsLblRef.current.textContent = String(Math.round(sim.fCount * 1000 / (now - sim.lastFpsT)));
      sim.fCount = 0;
      sim.lastFpsT = now;
    }

    // Smooth camera
    sim.zoom = lerp(sim.zoom, sim.tZoom, 0.075);
    sim.camX = lerp(sim.camX, sim.tCamX, 0.075);
    sim.camY = lerp(sim.camY, sim.tCamY, 0.075);

    const { W, H } = sim;
    const T = now * 0.001;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(sim.camX, sim.camY);
    ctx.scale(sim.zoom, sim.zoom);
    ctx.translate(-sim.camX, -sim.camY);

    const B = getRegionBounds();

    // Region backgrounds
    B.forEach(b => {
      const c = RC[b.r];
      const pulse = Math.sin(T * 1.4 + REGIONS.indexOf(b.r) * 1.1) * 0.4 + 0.6;
      ctx.save();
      rRect(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${(0.04 + pulse * 0.025).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = c.base + "33";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = c.base + "99";
      ctx.font = `bold ${Math.max(9, W * 0.012)}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(b.r, b.cx, b.y - 5);
    });

    // Ghost flow (circuit current)
    if (sim.ghostOn) {
      ctx.save();
      sim.synapses.forEach(s => {
        const pulse = Math.sin(T * 2.1 + s.src.idx * 0.7) * 0.5 + 0.5;
        const mem = Math.min(1, (s.strength - 1) / 3.5);
        ctx.beginPath();
        ctx.moveTo(s.src.x, s.src.y);
        ctx.quadraticCurveTo(s.cp.x, s.cp.y, s.dst.x, s.dst.y);
        ctx.strokeStyle = `rgba(0,0,0,${(0.015 + pulse * 0.03 + mem * 0.04).toFixed(3)})`;
        ctx.lineWidth = 0.4 + mem * 0.5;
        ctx.stroke();
      });
      ctx.restore();
    }

    // Synapses with LTP gradients
    let ltpCount = 0;
    sim.synapses.forEach(syn => {
      syn.strength = Math.max(1, syn.strength * 0.99992);
      const ltp = (syn.strength - 1) / 3.5;
      if (ltp > 0.18) ltpCount++;
      if (ltp < 0.04) return;
      const age = (now - syn.lastUsed) / 2000;
      const fadeAlpha = Math.max(0, 0.03 + ltp * 0.18 - age * 0.02);
      if (fadeAlpha < 0.01) return;
      const sc = RC[syn.src.region], dc = RC[syn.dst.region];
      const grad = ctx.createLinearGradient(syn.src.x, syn.src.y, syn.dst.x, syn.dst.y);
      grad.addColorStop(0, `rgba(${sc.r},${sc.g},${sc.b},${fadeAlpha.toFixed(2)})`);
      grad.addColorStop(1, `rgba(${dc.r},${dc.g},${dc.b},${(fadeAlpha * 0.7).toFixed(2)})`);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(syn.src.x, syn.src.y);
      ctx.quadraticCurveTo(syn.cp.x, syn.cp.y, syn.dst.x, syn.dst.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.5 + ltp * 2;
      ctx.stroke();
      ctx.restore();
    });

    // Signals
    let loopCount = 0;
    sim.signals = sim.signals.filter(s => s.active);
    sim.signals.forEach(sig => {
      const breathe = 1 + Math.sin(T * 2.1 + sig.born * 0.0001) * 0.28;
      sig.t = Math.min(1, sig.t + sig.speed * dt * breathe);

      const p  = bezierPt(sig.syn.src, sig.syn.cp, sig.syn.dst, sig.t);
      const ease = Math.sin(sig.t * Math.PI);
      const sc = RC[sig.syn.src.region];
      const sigR = Math.max(1.6, 3.2 * ease);
      loopCount++;

      // Glow halo
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sigR * 5);
      grd.addColorStop(0, `rgba(${sc.r},${sc.g},${sc.b},0.85)`);
      grd.addColorStop(0.4, `rgba(${sc.r},${sc.g},${sc.b},0.3)`);
      grd.addColorStop(1, `rgba(${sc.r},${sc.g},${sc.b},0)`);
      ctx.beginPath(); ctx.arc(p.x, p.y, sigR * 5, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Core dot
      ctx.beginPath(); ctx.arc(p.x, p.y, sigR, 0, Math.PI * 2);
      ctx.fillStyle = sc.base; ctx.fill();

      // Trail
      for (let i = 1; i <= 4; i++) {
        const tt = Math.max(0, sig.t - i * 0.045);
        const tp = bezierPt(sig.syn.src, sig.syn.cp, sig.syn.dst, tt);
        const ta = Math.max(0, (1 - i / 4) * 0.4 * ease);
        ctx.beginPath(); ctx.arc(tp.x, tp.y, sigR * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sc.r},${sc.g},${sc.b},${ta.toFixed(2)})`; ctx.fill();
      }

      // Active synapse highlight
      if (sig.t > 0.38 && sig.t < 0.62) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sig.syn.src.x, sig.syn.src.y);
        ctx.quadraticCurveTo(sig.syn.cp.x, sig.syn.cp.y, sig.syn.dst.x, sig.syn.dst.y);
        ctx.strokeStyle = `rgba(${sc.r},${sc.g},${sc.b},0.45)`;
        ctx.lineWidth = 0.8 + sig.syn.strength * 0.35;
        ctx.stroke();
        ctx.restore();
      }

      // Signal arrival
      if (sig.t >= 1) {
        sig.active = false;
        const d = sig.syn.dst;
        d.charge = Math.min(1, d.charge + 0.21 * sig.syn.strength * 0.44);
        if (d.charge >= THRESHOLD && now >= d.refractoryUntil) {
          fireNeuron(d, now);
          // ─── MEMORY LOOP ───────────────────────────────────────────────
          if (d.region === "CA1" && sim.memLoopOn) {
            sim.totalLoops++;
            const ecNs = sim.neurons.EC;
            const tgt  = ecNs[Math.floor(Math.random() * ecNs.length)];
            const delay = 110 + Math.random() * 180;
            setTimeout(() => {
              const pnow = performance.now();
              if (pnow >= tgt.refractoryUntil) {
                fireNeuron(tgt, pnow);
                spawnRipple(tgt.x, tgt.y, RC.EC.base);
              }
            }, delay);
          }
        }
      }
    });

    // Ripples
    sim.ripples = sim.ripples.filter(rp => rp.alpha > 0.01);
    sim.ripples.forEach(rp => {
      rp.rr = Math.min(rp.rr + dt * 0.11, rp.maxR);
      rp.alpha *= 0.955;
      const [rr, gg, bb] = hexToRgb(rp.col);
      for (let i = 0; i < rp.rings; i++) {
        const ro = rp.rr * (1 - i * 0.3);
        ctx.beginPath(); ctx.arc(rp.x, rp.y, ro, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},${(rp.alpha * (1 - i * 0.35)).toFixed(2)})`;
        ctx.lineWidth = 1.2 - i * 0.3;
        ctx.stroke();
      }
    });

    // Neurons
    Object.values(sim.neurons).flat().forEach(n => {
      if (!n.firing) n.charge *= DECAY;
      else { n.charge *= 0.965; if (n.charge < 0.04) n.firing = false; }
      if (sim.noiseOn)
        n.charge = Math.max(0, Math.min(1, n.charge + Math.sin(T * 3.1 + n.noisePhase) * n.noise));
      n.memWeight = Math.max(0, n.memWeight * 0.9997);

      const g = n.charge, c = RC[n.region];
      const soma = Math.max(2.4, W * 0.0072);

      // Dendrites
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI + 0.18 + Math.sin(T + n.noisePhase + i) * 0.06;
        const dl = soma * 2.5;
        const cpx = n.x + Math.cos(a) * dl * 0.48 + Math.sin(a + 1) * soma * 0.55;
        const cpy = n.y - Math.sin(a) * dl * 0.38;
        ctx.beginPath(); ctx.moveTo(n.x, n.y);
        ctx.quadraticCurveTo(cpx, cpy, n.x + Math.cos(a) * dl, n.y - Math.sin(a) * dl * 0.88);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${(0.1 + g * 0.32).toFixed(2)})`;
        ctx.lineWidth = 0.45 + g * 0.45;
        ctx.stroke();
      }

      // Glow
      if (g > 0.04) {
        const glowR = soma * (3.2 + g * 4.5 + n.memWeight * 2);
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        const memBoost = n.memWeight * 0.3;
        grd.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${(g * 0.6 + memBoost).toFixed(2)})`);
        grd.addColorStop(0.45, `rgba(${c.r},${c.g},${c.b},${(g * 0.18 + memBoost * 0.3).toFixed(2)})`);
        grd.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      }

      // Soma body
      ctx.beginPath();
      ctx.arc(n.x, n.y, soma * (1 + n.memWeight * 0.35), 0, Math.PI * 2);
      const blend = (base: number) => Math.round(220 + (base - 220) * g);
      ctx.fillStyle = `rgb(${blend(c.r)},${blend(c.g)},${blend(c.b)})`; ctx.fill();
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${(0.28 + g * 0.65).toFixed(2)})`;
      ctx.lineWidth = 0.7 + g * 0.5 + n.memWeight * 0.4;
      ctx.stroke();

      // Hover highlight
      if (n === sim.hovN) {
        ctx.beginPath(); ctx.arc(n.x, n.y, soma + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = c.base; ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Memory arc
      if (n.memWeight > 0.4 && !n.firing) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, soma * 2.2, 0, Math.PI * 2 * n.memWeight);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.2)`;
        ctx.lineWidth = 0.8; ctx.stroke();
      }
    });

    ctx.restore();

    // Subtle glitch
    if (Math.random() < 0.0015) {
      ctx.save();
      const gy = Math.random() * H, gh = 1.5 + Math.random() * 3;
      ctx.fillStyle = `rgba(${Math.round(Math.random() * 40)},${Math.round(Math.random() * 40)},${Math.round(150 + Math.random() * 100)},0.025)`;
      ctx.fillRect(0, gy, W, gh);
      ctx.restore();
    }

    // Scanline overlay (drawn on top, outside the transform)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.006)";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    ctx.restore();

    // Ambient stimulation
    sim.ambTimer += dt;
    if (sim.noiseOn && sim.ambTimer > 3200 + Math.random() * 2400) {
      sim.ambTimer = 0;
      const en = sim.neurons.EC;
      const n  = en[Math.floor(Math.random() * en.length)];
      if (n && now >= n.refractoryUntil) { fireNeuron(n, now); spawnRipple(n.x, n.y, RC.EC.base); }
    }

    // ── HUD update (batched DOM writes) ──────────────────────────────────────
    const allN  = Object.values(sim.neurons).flat();
    const act   = allN.filter(n => n.charge > 0.28).length / allN.length;
    const actPct = Math.round(act * 100);

    if (actFillRef.current) {
      actFillRef.current.style.width   = `${Math.max(3, actPct * 1.75)}%`;
      actFillRef.current.style.background = act < 0.15 ? "#4fc3f7" : act < 0.4 ? "#fb8c00" : "#e53935";
    }
    if (actLblRef.current) {
      actLblRef.current.textContent = act < 0.15 ? "LOW" : act < 0.4 ? "MED" : "HIGH";
      actLblRef.current.style.color = act < 0.15 ? "#0288d1" : act < 0.4 ? "#e65100" : "#c62828";
    }
    const loopPct = Math.min(100, sim.totalLoops * 2);
    if (loopFillRef.current) loopFillRef.current.style.width = `${Math.max(2, loopPct)}%`;
    if (loopLblRef.current) loopLblRef.current.textContent = String(sim.totalLoops);
    if (statusLblRef.current) {
      statusLblRef.current.textContent = act < 0.08 ? "STABLE" : act < 0.45 ? "ACTIVE" : "BURST";
      statusLblRef.current.style.color = act < 0.08 ? "#43a047" : act < 0.45 ? "#fb8c00" : "#e53935";
    }
    if (hudTimeRef.current) {
      const tt = new Date();
      hudTimeRef.current.textContent =
        [tt.getHours(), tt.getMinutes(), tt.getSeconds()]
          .map(v => v.toString().padStart(2, "0")).join(":");
    }

    const b0 = getRegionBounds()[0];
    if (cornerTLRef.current)
      cornerTLRef.current.innerHTML = `EC ${Math.round(b0.cx)},${Math.round(b0.cy)}<br/>SYN:${sim.synapses.length}`;
    if (cornerTRRef.current)
      cornerTRRef.current.innerHTML = `SIGNALS:${loopCount}<br/>LTP:${ltpCount}`;
    if (cornerBLRef.current)
      cornerBLRef.current.innerHTML = `ZOOM:${sim.zoom.toFixed(2)}x<br/>FOCUS:${sim.focusMode ? sim.focusRegion ?? "ON" : "ALL"}`;
    const memStr = sim.totalLoops < 5 ? "FORMING" : sim.totalLoops < 20 ? "ENCODING"
      : sim.totalLoops < 50 ? "CONSOLIDATING" : "STABLE";
    if (cornerBRRef.current)
      cornerBRRef.current.innerHTML = `LOOPS:${sim.totalLoops}<br/>MEM:${memStr}`;

    sim.rafId = requestAnimationFrame(drawFrame);
  }, [fireNeuron, spawnRipple, getRegionBounds]);

  // ── Mouse helpers ─────────────────────────────────────────────────────────

  const getCanvasPos = useCallback((e: MouseEvent) => {
    const sim = simRef.current;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (sim.W / rect.width);
    const sy = (e.clientY - rect.top)  * (sim.W / rect.width);
    return { x: (sx - sim.camX) / sim.zoom + sim.camX, y: (sy - sim.camY) / sim.zoom + sim.camY, sx, sy };
  }, []);

  // ── Public controls ───────────────────────────────────────────────────────

  const triggerBurst = useCallback(() => {
    const sim = simRef.current;
    sim.neurons.EC.forEach((n, i) =>
      setTimeout(() => { fireNeuron(n, performance.now()); spawnRipple(n.x, n.y, RC.EC.base); }, i * 45));
  }, [fireNeuron, spawnRipple]);

  const resetAll = useCallback(() => {
    const sim = simRef.current;
    Object.values(sim.neurons).flat().forEach(n => {
      n.charge = 0; n.firing = false; n.refractoryUntil = 0; n.memWeight = 0;
    });
    sim.signals.length = 0;
    sim.ripples.length = 0;
    sim.totalLoops = 0;
    sim.synapses.forEach(s => { s.strength = 1; s.useCount = 0; s.lastUsed = 0; });
  }, []);

  const toggleFocus = useCallback(() => {
    const sim = simRef.current;
    sim.focusMode = !sim.focusMode;
    const btn = btnFocusRef.current;
    if (sim.focusMode) {
      sim.focusRegion = REGIONS[sim.focusIdx % 4];
      sim.focusIdx++;
      const B  = getRegionBounds();
      const b  = B[REGIONS.indexOf(sim.focusRegion)];
      sim.tZoom = 1.85;
      sim.tCamX = sim.W / 2 - b.cx * 1.85;
      sim.tCamY = sim.H / 2 - b.cy * 1.85;
      if (btn) { btn.textContent = `FOCUS: ${sim.focusRegion}`; btn.dataset.active = "true"; }
    } else {
      sim.tZoom = 1; sim.tCamX = 0; sim.tCamY = 0; sim.focusRegion = null;
      if (btn) { btn.textContent = "FOCUS MODE"; delete btn.dataset.active; }
    }
  }, [getRegionBounds]);

  const toggleMemLoop = useCallback(() => {
    const sim = simRef.current;
    sim.memLoopOn = !sim.memLoopOn;
    const btn = btnLoopRef.current;
    if (btn) {
      btn.textContent = `LOOP: ${sim.memLoopOn ? "ON" : "OFF"}`;
      btn.dataset.active = sim.memLoopOn ? "true" : "";
    }
  }, []);

  const toggleNoise = useCallback(() => {
    const sim = simRef.current;
    sim.noiseOn = !sim.noiseOn;
    const btn = btnNoiseRef.current;
    if (btn) {
      btn.textContent = `NOISE: ${sim.noiseOn ? "ON" : "OFF"}`;
      btn.dataset.active = sim.noiseOn ? "true" : "";
    }
  }, []);

  const toggleGhost = useCallback(() => {
    const sim = simRef.current;
    sim.ghostOn = !sim.ghostOn;
    const btn = btnGhostRef.current;
    if (btn) {
      btn.textContent = `GHOST: ${sim.ghostOn ? "ON" : "OFF"}`;
      btn.dataset.active = sim.ghostOn ? "true" : "";
    }
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    resize();

    const canvas = canvasRef.current!;
    const sim    = simRef.current;

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const { x, y } = getCanvasPos(e);
      const now = performance.now();
      let hit = false;
      Object.values(sim.neurons).flat().forEach(n => {
        const dx = n.x - x, dy = n.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 13) {
          fireNeuron(n, now); spawnRipple(n.x, n.y, RC[n.region].base); hit = true;
        }
      });
      if (!hit) {
        const B = getRegionBounds();
        B.forEach((b, i) => {
          if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            const r  = REGIONS[i];
            const ns = sim.neurons[r];
            const n  = ns[Math.floor(Math.random() * ns.length)];
            if (n && now >= n.refractoryUntil) { fireNeuron(n, now); spawnRipple(n.x, n.y, RC[r].base); }
          }
        });
      }
    };

    // Mousemove handler
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y, sx, sy } = getCanvasPos(e);
      let found: NeuronState | null = null;
      Object.values(sim.neurons).flat().forEach(n => {
        const dx = n.x - x, dy = n.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 13) found = n;
      });
      sim.hovN = found;
      const tip = tipRef.current;
      if (found && tip) {
        const conn = sim.synapses.filter(s => s.src === found || s.dst === found).length;
        const c    = RC[(found as NeuronState).region];
        tip.style.display = "block";
        tip.style.left    = `${Math.min(sx + 14, sim.W - 165)}px`;
        tip.style.top     = `${Math.max(2, sy - 58)}px`;
        tip.innerHTML     =
          `<b style="color:${c.base}">${(found as NeuronState).id}</b><br/>` +
          `charge: ${((found as NeuronState).charge * 100).toFixed(1)}%<br/>` +
          `memory: ${((found as NeuronState).memWeight * 100).toFixed(0)}%<br/>` +
          `connections: ${conn}<br/>` +
          `firing: ${(found as NeuronState).firing
            ? '<span style="color:#e53935">YES</span>'
            : "NO"}`;
        canvas.style.cursor = "pointer";
      } else if (tip) {
        tip.style.display = "none";
        canvas.style.cursor = "crosshair";
      }
    };

    const handleMouseLeave = () => {
      sim.hovN = null;
      const tip = tipRef.current;
      if (tip) tip.style.display = "none";
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sim.tZoom = Math.max(0.75, Math.min(2.8, sim.tZoom - e.deltaY * 0.001));
    };

    const handleResize = () => {
      clearTimeout((window as any)._nrt);
      (window as any)._nrt = setTimeout(resize, 100);
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", handleResize);

    sim.rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(sim.rafId);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, [resize, drawFrame, fireNeuron, spawnRipple, getCanvasPos, getRegionBounds]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapperRef}
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'Courier New', monospace",
        position: "relative",
        userSelect: "none",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HUD bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "#fafafa",
        borderBottom: "1px solid #efefef",
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}>
        <HudItem>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e53935",
            animation: "nms-blink 1.1s ease-in-out infinite", flexShrink: 0, display: "inline-block" }} />
          <b>REC</b>
        </HudItem>
        <HudItem><b>MEMORY LOOP MONITOR</b></HudItem>
        <Sep />
        <HudItem><span>TIME</span><b><span ref={hudTimeRef}>--:--:--</span></b></HudItem>
        <Sep />
        <HudItem>
          <span>ACT</span>
          <div style={{ height: 7, width: 70, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", border: "1px solid #ddd" }}>
            <div ref={actFillRef} style={{ height: "100%", width: "10%", borderRadius: 4, background: "#4fc3f7", transition: "width .5s, background .5s" }} />
          </div>
          <b><span ref={actLblRef} style={{ color: "#0288d1" }}>LOW</span></b>
        </HudItem>
        <Sep />
        <HudItem>
          <span>LOOPS</span>
          <div style={{ height: 7, width: 70, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", border: "1px solid #ddd" }}>
            <div ref={loopFillRef} style={{ height: "100%", width: "2%", borderRadius: 4, background: "#7c4dff", transition: "width .6s" }} />
          </div>
          <b><span ref={loopLblRef}>0</span></b>
        </HudItem>
        <Sep />
        <HudItem><span>STATUS</span><b><span ref={statusLblRef} style={{ color: "#43a047" }}>STABLE</span></b></HudItem>
        <Sep />
        <HudItem><span>FPS</span><b><span ref={fpsLblRef}>--</span></b></HudItem>
      </div>

      {/* ── Canvas area ─────────────────────────────────────────────────── */}
      <div ref={canvasAreaRef} style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", cursor: "crosshair" }} />

        {/* Corner overlays */}
        <div ref={cornerTLRef} style={cornerStyle("tl")}>EC 0,0<br />SYN:0</div>
        <div ref={cornerTRRef} style={cornerStyle("tr")}>SIGNALS:0<br />LTP:0</div>
        <div ref={cornerBLRef} style={cornerStyle("bl")}>ZOOM:1.00x<br />FOCUS:ALL</div>
        <div ref={cornerBRRef} style={cornerStyle("br")}>LOOPS:0<br />MEM:FORMING</div>

        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.01) 3px,rgba(0,0,0,0.01) 4px)",
        }} />

        {/* Tooltip */}
        <div ref={tipRef} style={{
          position: "absolute", background: "rgba(255,255,255,.97)",
          border: "1px solid #ddd", borderRadius: 8, padding: "7px 10px",
          fontSize: 10, pointerEvents: "none", display: "none", zIndex: 10,
          lineHeight: 1.8, color: "#444", boxShadow: "0 2px 12px rgba(0,0,0,.07)",
          fontFamily: "'Courier New', monospace",
        }} />
      </div>

      {/* ── Footer / controls ───────────────────────────────────────────── */}
      <div style={{
        background: "#fafafa",
        borderTop: "1px solid #efefef",
        padding: "6px 12px",
        display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap",
      }}>
        <Btn onClick={triggerBurst}>STIM BURST</Btn>
        <Btn onClick={resetAll}>RESET</Btn>
        <Btn ref={btnFocusRef} onClick={toggleFocus}>FOCUS MODE</Btn>
        <Btn ref={btnLoopRef}  onClick={toggleMemLoop} active>LOOP: ON</Btn>
        <Btn ref={btnNoiseRef} onClick={toggleNoise}   active>NOISE: ON</Btn>
        <Btn ref={btnGhostRef} onClick={toggleGhost}>GHOST: OFF</Btn>

        <div style={{ marginLeft: "auto", display: "flex", gap: 9, alignItems: "center" }}>
          {(["EC","DG","CA3","CA1"] as RegionKey[]).map(r => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#888" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: RC[r].base }} />
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes nms-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function HudItem({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#999", letterSpacing: ".5px" }}>
      {children}
    </div>
  );
}

function Sep() {
  return <span style={{ color: "#ddd", fontSize: 12 }}>|</span>;
}

const Btn = React.forwardRef<HTMLButtonElement, { children: React.ReactNode; onClick: () => void; active?: boolean }>(
  ({ children, onClick, active = false }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        fontSize: 10, fontFamily: "'Courier New', monospace", letterSpacing: ".5px",
        padding: "4px 9px", border: `1px solid ${active ? "#ab47bc" : "#ddd"}`,
        borderRadius: 6, background: active ? "#f3e5f5" : "#fff",
        color: active ? "#6a1b9a" : "#555", cursor: "pointer",
        transition: "background .15s, border-color .15s",
      }}
    >
      {children}
    </button>
  )
);
Btn.displayName = "Btn";

function cornerStyle(pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties {
  return {
    position: "absolute",
    fontSize: 10, color: "#bbb", letterSpacing: ".5px", lineHeight: 1.65,
    pointerEvents: "none",
    ...(pos === "tl" ? { top: 7, left: 9 }
      : pos === "tr" ? { top: 7, right: 9, textAlign: "right" }
      : pos === "bl" ? { bottom: 7, left: 9 }
      : { bottom: 7, right: 9, textAlign: "right" }),
  };
}
