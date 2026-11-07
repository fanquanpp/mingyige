import { useEffect } from 'react';
import LightRays from './LightRays';
import BrandLogo from '../brand/BrandLogo';
import styles from './Resonance.module.css';

/**
 * 共鸣过渡页：点击「轻触共鸣」后，黑幕在开场画面上缓缓合拢，
 * reactbits LightRays 聚光灯从正中上方垂直打下，
 * 三行文字沿光束方向阶梯排布，逐行被光扫过般揭幕：
 * 「共鸣者 / 欢迎来到 / 鸣依阁」（携星芒与音符点缀），背景彩带飘落，完成后关灯，交还 App 进入主页。
 *
 * 时间线：0.3s 黑幕+灯亮 → 0.65s 共鸣者 → 1.1s 欢迎来到 → 1.55s 鸣依阁 → 2.25s 灯光熄灭（保持纯黑） → 2.6s 交还。
 * 全程不响应点击（动画未完不进入主页，与开场动画规则一致）。
 * frozen=true（stale 延迟卸载期）：跳过开场时间线、直接纯黑终态——
 * stale 重挂会让 resFadeIn/lightOn 从头重放（黑幕闪烁+光斑残影），且 WebGL 不重复初始化。
 */
export default function Resonance({ onDone, frozen = false }: { onDone: () => void; frozen?: boolean }) {
  useEffect(() => {
    if (frozen) return undefined; // stale 实例不跑时间线、不触发 onDone
    const t = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(t);
  }, [onDone, frozen]);

  return (
    <div className={`${styles.resonance} ${frozen ? styles.frozen : ''}`} aria-hidden="true">
      {/* reactbits LightRays 聚光灯：正中上方垂直打下 */}
      <div className={styles.raysWrap}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#4FB3E8"
          raysSpeed={1}
          lightSpread={0.7}
          rayLength={3}
          glow={0.4}
          haze={0.5}
          rayDensity={1.8}
          tilt={0}
          raySharpness={0.75}
          atmosphere={1}
          intensity={0.9}
          fadeDistance={1}
          saturation={1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          followMouse={false}
          cursorShadow={false}
          clickPulse={false}
          opacity={0.7}
        />
      </div>

      {/* 背景彩带：与开场同款 */}
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      {/* 常驻 logo：随黑幕一同浮现 */}
      <div className={styles.resLogo}>
        <BrandLogo />
      </div>

      {/* 阶梯式三行：沿光束方向自左上向右下踏步 */}
      <div className={styles.lines}>
        <p className={styles.line1}>
          <svg className={styles.decorSvg} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12C7 11 11 7 12 0Z" />
          </svg>
          共鸣者
          <svg className={styles.decorSvg} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12C7 11 11 7 12 0Z" />
          </svg>
        </p>
        <p className={styles.line2}>
          欢迎来到
          <svg className={styles.decorSvg} width="17" height="17" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <ellipse cx="5.6" cy="13.8" rx="3" ry="2.4" />
            <rect x="7.7" y="3" width="1.4" height="10.8" rx="0.7" />
            <path d="M9.1 3c2.8 0.7 4.3 2.3 4.5 5-0.8-1.5-2.3-2.4-4.5-2.6z" />
          </svg>
        </p>
        <p className={styles.line3}>
          <svg className={styles.decorSvg} width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12C7 11 11 7 12 0Z" />
          </svg>
          鸣依阁
        </p>
      </div>
    </div>
  );
}
