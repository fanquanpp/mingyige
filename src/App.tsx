import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Intro from './components/intro/Intro';
import Home from './components/home/Home';
import SongsPage from './components/pages/SongsPage';
import GalleryPage from './components/pages/GalleryPage';
import DisclaimerPage from './components/pages/DisclaimerPage';
import Resonance from './components/fx/Resonance';
import TargetCursor from './components/fx/TargetCursor';
import { armMusicOnGesture } from './audio/music';
import { PAGE_VIEWS, viewFromHash, type PageView } from './navigation';
import styles from './App.module.css';

type View = 'intro' | 'resonance' | PageView;

/* 光标捕获所有可点击元素：链接、按钮等（.catList 已随旧版分类列表删除） */
const CURSOR_TARGET_SELECTOR = "a, button, [role='button'], .cursor-target";

export default function App() {
  // 开场动画每次进站/刷新都完整播放；带 #songs 等 hash 访问时，
  // 仪式结束后落到对应页面（深链保留，但不再跳过开场）
  const [entry] = useState<PageView | null>(() => viewFromHash());
  const entryHashRef = useRef(window.location.hash);
  const [view, setViewState] = useState<View>('intro');
  // runId 变化时重挂载 Intro，重看开场
  const [runId, setRunId] = useState(0);

  // 音乐不做自动播放：挂上首次手势监听，进站「轻触共鸣」那一下才响起——
  // 恢复的标签页/隐藏预渲染面/其他浏览器窗口没有手势，永远不会自己出声
  useEffect(() => {
    armMusicOnGesture();
  }, []);

  // 页面切换统一走 hash：主导航/侧边分类/首页预告卡都是 '#xxx' 锚点
  useEffect(() => {
    const onHash = () => {
      const page = viewFromHash();
      if (page) setViewState(page);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const setView = (next: View) => {
    setViewState(next);
    // 页面态同步进地址栏（replace 不产生历史记录）；开场/共鸣态不动 hash。
    // 深链带的专辑段（#songs/xxx）在落到歌曲页时保留，避免抹掉筛选状态
    if (PAGE_VIEWS.includes(next as PageView)) {
      const suffix =
        next === 'songs' && entryHashRef.current.startsWith('#songs/') ? entryHashRef.current.slice('#songs'.length) : '';
      history.replaceState(null, '', `#${next}${suffix}`);
    }
  };

  const onStage = view === 'intro' || view === 'resonance';

  /* 视图切换退场序：直接 setView 会在同一帧卸载带 fixed 合成层的 Intro/Resonance
     + 挂载新页，合成层销毁与新页首帧布局竞态 → 旧舞台快照叠印在新页面上（崩坏画面）。
     双保险方案：
     ① leaving 状态——旧舞台先转「正在退场」（CSS 降 opacity 但不卸载），一帧后切视图；
     ② setView 切页后旧舞台再保持挂载 unmountDelay 毫秒（新页已完整绘制），届时才真正卸载。
     这样合成层销毁发生在新页已稳定绘制的帧里，竞态窗口不存在。 */
  const [leaving, setLeaving] = useState(false);
  const [staleView, setStaleView] = useState<View | null>(null); // 已切走但仍挂载的旧舞台
  const unmountTimer = useRef<number>(0);

  const transitionTo = (next: View) => {
    if (leaving || view === next) return;
    // intro→resonance：同舞台换景，Intro 不卸载不重挂（stale 重挂会让 motion initial
    // 重新生效——文字重新 blur 起步，即「轻触共鸣还是那样」的根源）。
    // 安卓冻结问题由 frozen=true（动画全转终态）单独解决。
    if (view === 'intro' && next === 'resonance') {
      setView(next);
      return;
    }
    // 跨卸载切换（resonance→home / spik / 重看开场）：淡出 → 切页 → 旧舞台延迟卸载
    setLeaving(true);
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        setStaleView(view); // 旧舞台记入待卸载清单
        setView(next);
        window.clearTimeout(unmountTimer.current);
        unmountTimer.current = window.setTimeout(() => {
          setStaleView(null);
          setLeaving(false); // 旧舞台卸载完才恢复不透明（新页这 600ms 内保持可见度渐变）
        }, 600);
      });
    }, 220);
  };

  // 卸载期间若再次切换，清掉旧计时器
  useEffect(() => () => window.clearTimeout(unmountTimer.current), []);
  const leavingStage = leaving || staleView !== null;

  return (
    <div className={`${styles.app} ${leavingStage ? styles.stageFading : ''}`}>
      {/* 自定义光标：四角括号锁定所有可点击目标（触屏设备自动禁用）。
          颜色固定品牌点缀 #66ccff（含入场/共鸣深色舞台——夜幕底上对比度足够）；
          尺寸/描边加大保证深浅背景上都显眼；
          blendMode 必须为 normal——默认的 difference 差值混合会用 |光标色-背景色| 取色，
          浅色背景上天依蓝会被反成暗红 */}
      <TargetCursor
        targetSelector={CURSOR_TARGET_SELECTOR}
        cursorColor="#66ccff"
        blendMode="normal"
        size={52}
        cornerSize={18}
        thickness={4}
        padding={8}
        dotSize={6}
      />
      {/* S p i k 跳过：开场/海报/共鸣三阶段常驻，点击淡出舞台后落页（避免合成层撕裂）。
          data-skip-btn 供 Intro 的 window pointerdown 监听排除（防视图目标同帧竞争） */}
      <motion.button
        type="button"
        className={styles.skipBtn}
        data-skip-btn=""
        onClick={() => transitionTo(entry ?? 'home')}
        initial={{ opacity: 0 }}
        animate={{ opacity: onStage ? 1 : 0 }}
        transition={onStage ? { delay: 0.6, duration: 0.8 } : { duration: 0.4 }}
        style={{ pointerEvents: onStage ? 'auto' : 'none' }}
        aria-hidden={!onStage}
      >
        S p i k
      </motion.button>
      {/* 退场中的旧舞台：切页后继续挂载 600ms（新页已完整绘制），合成层届时才销毁。
          stageHidden：仅隐藏旧舞台自身（不影响新页可见性），pointer-events 关闭不挡交互 */}
      {staleView === 'intro' && (
        <div className={styles.stageHidden}>
          <Intro key={`stale-${runId}`} onEnter={() => {}} />
        </div>
      )}
      {staleView === 'resonance' && (
        <div className={styles.stageHidden}>
          <Resonance key={`stale-${runId}`} onDone={() => {}} frozen />
        </div>
      )}
      {/* 现役舞台：共鸣页黑幕合拢期间开场画面挂载其下（渐暗过渡）；leaving 期间冻结 onEnter。
          frozen=true：Intro 所有动画立即暂停定格——安卓 WebView 上被遮住的动画会被冻结在
          中间帧（blur 半途/重绘残影），这就是「正常进入崩坏」在手机上的形态 */}
      {(view === 'intro' || view === 'resonance') && (
        <Intro key={runId} onEnter={leaving ? () => {} : () => transitionTo('resonance')} frozen={view === 'resonance'} />
      )}
      {view === 'resonance' && <Resonance key={runId} onDone={() => transitionTo(entry ?? 'home')} />}
      {view === 'home' && (
        <Home
          onReplay={() => {
            // 重看开场：页面 → 舞台同样走退场序
            setRunId(id => id + 1);
            transitionTo('intro');
          }}
        />
      )}
      {view === 'songs' && <SongsPage />}
      {view === 'gallery' && <GalleryPage />}
      {view === 'disclaimer' && <DisclaimerPage />}
    </div>
  );
}
