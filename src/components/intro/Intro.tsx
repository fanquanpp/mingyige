import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { INTRO_LINES, PARTICLE_COUNT, TOTAL_DURATION_MS } from './introLines';
import Nav from '../nav/Nav';
import styles from './Intro.module.css';

const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.45, 0, 0.25, 1];

/**
 * 动画总时长（毫秒）：时间线横竖屏共用。
 * 收尾句 7.8s + 1.2s 亮完，停留片刻后终幕海报 10.4s + 2.4s ≈ 12.8s 完成。
 * 此计时结束前，全屏点击一律不生效（进入共鸣页）。
 */

/**
 * 入场动画：自然播放完 → 「轻触共鸣」浮现 → 点击直达主页（S p i k 同款退场逻辑）。
 * frozen=true（stale 延迟卸载期）：动画立即转终态定格——被隐藏壳遮住后继续跑的
 * blur/transform 动画在安卓 WebView 上会冻结在中间帧并产生重绘残影。
 */
export default function Intro({ onEnter, frozen = false }: { onEnter: () => void; frozen?: boolean }) {
  // 动画完整播放完毕后才接受全屏点击
  const [ready, setReady] = useState(false);
  // 移动端（粗略判定：小屏 + 触屏）禁用 filter 动画——
  // motion 文档明确 filter 逐帧触发重绘，移动 GPU 上与 text-shadow 叠加会产生文字重影
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px) and (pointer: coarse)');
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // 供 music.ts 的起播兜底判定：动画播完后点击才算「进站手势」
      document.body.setAttribute('data-intro-ready', '');
      setReady(true);
    }, TOTAL_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
      document.body.removeAttribute('data-intro-ready');
    };
  }, []);

  // ready 后在 window 层监听：舞台内外的任意位置（含磨砂补边）点击都生效。
  // 例外：点在 S p i k 按钮上不触发 onEnter——两个入口共用同一退场逻辑，
  // pointerdown 先于 click，若不排除会双触发重入
  useEffect(() => {
    if (!ready) return;
    const onTap = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && target.closest('[data-skip-btn]')) return;
      onEnter();
    };
    window.addEventListener('pointerdown', onTap);
    return () => window.removeEventListener('pointerdown', onTap);
  }, [ready, onEnter]);

  // frozen（已进入共鸣页）：整段动画时间线在当前位置定格——
  // motion 组件全部转静态值（动画目标被覆盖为当前视觉终态，且不再执行），
  // 纯 CSS 动画层（星光/光点/彩带）由 .frozen 类关闭
  return (
    <>
      <Nav />

      <motion.section
        className={`${styles.intro} ${ready ? styles.ready : ''} ${frozen ? styles.frozen : ''}`}
      >
        {/* 画幅外磨砂伪装层：用图片自身放大铺满全屏并深度模糊压暗，
            让不同比例屏幕上的"黑边"变成与画面同色系的磨砂延展
            （position: fixed 铺满视口，不参与舞台裁切） */}
        <div className={styles.backdrop} aria-hidden="true" />
        <motion.div
          className={`${styles.backdrop} ${styles.backdropPoster}`}
          initial={{ opacity: 0 }}
          animate={frozen ? { opacity: 1 } : { opacity: 1 }}
          transition={frozen ? { duration: 0 } : { delay: 10.4, duration: 2.0, ease: EASE_IN_OUT }}
          aria-hidden="true"
        />

        {/* 背景：演唱会星海，12 秒极慢拉近 */}
        <motion.div
          className={styles.bg}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={frozen ? { duration: 0 } : { duration: 12, ease: 'easeOut' }}
        />

        {/* 遮罩：中心轻、四周重，压暗背景突出文字 */}
        <div className={styles.overlay} />

        {/* 星光闪烁层（纯 CSS） */}
        <div className={styles.stars} aria-hidden="true" />
        <div className={`${styles.stars} ${styles.starsFar}`} aria-hidden="true" />

        {/* 上升光点（纯 CSS） */}
        <div className={styles.particles} aria-hidden="true">
          {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
            <i key={i} />
          ))}
        </div>

        {/* 装饰层：彩带（纯 CSS，取材演唱会现场元素） */}
        <div className={styles.decor} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} className={styles.confetti} />
          ))}
        </div>

        {/* 洛天依手写签名：右下角常驻水印装饰，缓慢淡入 */}
        <motion.img
          src="images/brand/tianyi-signature.webp"
          alt=""
          className={styles.signature}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 2.5, duration: 2.4, ease: EASE_OUT }}
        />

        {/* 文字区：blur(7px) 的光晕汇聚成字；收尾句停留片刻后随海报缓慢溶出。
            frozen：文字层立即透明（共鸣黑幕已盖上，中间帧 blur 是安卓残影源头） */}
        <motion.div
          className={styles.textContainer}
          initial={{ opacity: 1 }}
          animate={frozen ? { opacity: 0 } : { opacity: 0 }}
          transition={frozen ? { duration: 0 } : { delay: 10.8, duration: 1.4, ease: EASE_IN_OUT }}
        >
          {INTRO_LINES.map((line) => (
            <motion.p
              key={line.className}
              className={`${styles.line} ${styles[line.className]}`}
              data-text={line.text}
              initial={
                lite
                  ? { opacity: 0, y: 12, x: line.slideFrom * 44 }
                  : { opacity: 0, filter: 'blur(7px)', y: 12, x: line.slideFrom * 44 }
              }
              animate={lite ? { opacity: 1, y: 0, x: 0 } : { opacity: 1, filter: 'blur(0px)', y: 0, x: 0 }}
              transition={{ delay: line.delay, duration: 1.2, ease: EASE_OUT }}
            >
              {line.text}
            </motion.p>
          ))}
        </motion.div>

        {/* 终幕：收尾句停留片刻后，整幅漫画开场图缓慢合拢收尾。
            frozen：海报立即定格终态（无 blur/缩放动画，杜绝中间帧残影） */}
        <motion.div
          className={styles.poster}
          initial={frozen ? { opacity: 1, filter: 'blur(0px)', scale: 1 } : { opacity: 0, filter: lite ? 'blur(14px)' : 'blur(26px)', scale: lite ? 1.03 : 1.06 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={frozen ? { duration: 0 } : { delay: 10.4, duration: 2.4, ease: EASE_IN_OUT }}
        />

        {/* 共鸣提示：动画完整播放后浮现，此时全屏点击进入共鸣过渡页。
            frozen：提示层立即隐藏（黑幕已盖住，不需要它） */}
        <motion.p
          className={styles.tapHint}
          initial={{ opacity: 0 }}
          animate={frozen ? { opacity: 0 } : { opacity: 1 }}
          transition={frozen ? { duration: 0 } : { delay: 13.2, duration: 1.2, ease: EASE_OUT }}
        >
          <span className={styles.tapHintBreath}>轻触共鸣</span>
        </motion.p>
      </motion.section>
    </>
  );
}
