// 底部音频响应频谱条：读取全局播放器的 AnalyserNode 数据，canvas 绘制。
// 播放时 64 条对数频谱律动；暂停/未建图时用同样的条形摆出静态波浪（品牌线语言）。

import { useEffect, useRef } from 'react';
import { getFrequencyBars, useMusicCore } from '../../audio/music';
import styles from './WaveBars.module.css';

/** 屏上频谱条数（分析器内部也是 64 条对数映射，一一对应） */
const BAR_COUNT = 64;

export default function WaveBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playing = useMusicCore().status === 'playing';
  // rAF 闭包读最新播放态（effect 只挂一次，不因播放态切换重建）
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let alive = true;
    let last = 0;
    let sampleAcc = 0;
    // 当前生效条数：随屏宽收缩（小屏 64 条挤成 1px 碎条，每条至少给 ~7px 视觉宽）
    let barCount = BAR_COUNT;
    // 每条 bar 的平滑高度（0–1）
    const smooth = new Float32Array(BAR_COUNT);
    // 上一帧高度（做帧间插值：数据 30fps 采样、渲染 60fps，动效连贯）
    const prev = new Float32Array(BAR_COUNT);
    // 本帧渲染目标（播放=频谱，暂停=静态波浪轮廓）
    const targets = new Float32Array(BAR_COUNT);
    let hasFresh = false;

    // 按屏宽计算条数：>=768px 满 64 条，之下按 7px/条 收缩，最低 24 条
    const fitBarCount = () => {
      const w = canvas.clientWidth;
      const want = Math.floor(w / 7);
      barCount = Math.max(24, Math.min(BAR_COUNT, want));
    };

    const computeIdleWave = (t: number, count: number) => {
      // 双叠加正弦摆出波浪轮廓：中段略隆起、两端压低，条形呈现「波形」而非一条直线
      const wave = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const p = i / (count - 1);
        const envelope = 0.28 + 0.62 * Math.sin(Math.PI * p); // 中段隆起包络
        const s =
          Math.sin(p * Math.PI * 4 + t * 0.9) * 0.5 +
          Math.sin(p * Math.PI * 9 - t * 0.6) * 0.22;
        wave[i] = Math.max(0.06, envelope * (0.55 + 0.45 * s));
      }
      return wave;
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)) {
        canvas.width = Math.max(1, Math.round(w * ratio));
        canvas.height = Math.max(1, Math.round(h * ratio));
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      fitBarCount();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = (now: number) => {
      if (!alive) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const isPlaying = playingRef.current;

      // 频谱数据 30fps 采样（人耳感知无关的绘制细节，减一半 Analyser 调用）；
      // 渲染仍 60fps，用 prev→smooth 帧间插值让 60fps 下动效连贯不跳变。
      // 小屏条数少于 64：从 64 条源数据里等距抽 barCount 条（保留频谱整体形状）
      sampleAcc += dt;
      let fresh = false;
      if (isPlaying && sampleAcc >= 1 / 30) {
        const data = getFrequencyBars();
        sampleAcc = 0;
        prev.set(smooth);
        for (let i = 0; i < barCount; i++) {
          const src = Math.round((i / (barCount - 1)) * (BAR_COUNT - 1));
          targets[i] = data[src];
        }
        hasFresh = true;
        fresh = true;
      }

      // 条色：播放态品牌青，暂停态浅线色（getComputedStyle 节流：仅状态切换帧调用）
      if (fresh) {
        const cs = getComputedStyle(canvas);
        ctx.fillStyle = cs.getPropertyValue('--pg-accent').trim() || '#2e9ccb';
      } else if (!isPlaying) {
        // 暂停态：浅线色 + 静态波浪目标（用音频条摆出波浪轮廓）
        const cs = getComputedStyle(canvas);
        ctx.fillStyle = cs.getPropertyValue('--pg-line').trim() || '#cfe2ee';
        const wave = computeIdleWave(now / 1000, barCount);
        for (let i = 0; i < barCount; i++) targets[i] = wave[i];
      }

      ctx.clearRect(0, 0, w, h);
      const step = w / barCount;
      const barW = Math.max(1.5, step * 0.55);
      for (let i = 0; i < barCount; i++) {
        // 双向缓动：目标变化时快跟，回落后余韵释放；暂停波浪用更慢的漂移
        const target = targets[i];
        const cur = smooth[i];
        const rate = isPlaying ? (target > cur ? 14 : 5) : 2.4;
        const eased = cur + (target - cur) * Math.min(1, dt * rate);
        smooth[i] = eased;
        // 采样帧间的渲染插值：消掉 30fps 采样的阶梯感
        const drawH = hasFresh ? prev[i] + (eased - prev[i]) * 0.6 : eased;
        const bh = Math.max(1.5, drawH * (h - 6));
        ctx.fillRect(i * step + (step - barW) / 2, h - bh, barW, bh);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`${styles.wave} ${playing ? styles.live : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
