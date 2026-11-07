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

  /* S p i k 退场：直接 setView 会在同一帧卸载带 fixed 合成层的 Intro + 挂载页面，
     合成层销毁与 Home 首帧布局竞态 → 旧舞台快照叠印在新页面上（崩坏画面）。
     先淡出舞台 220ms，让合成层先释放，再切视图。 */
  const [fading, setFading] = useState(false);
  const skip = (next: PageView) => {
    if (fading) return;
    setFading(true);
    window.setTimeout(() => {
      setFading(false);
      setView(next);
    }, 220);
  };

  return (
    <div className={`${styles.app} ${fading ? styles.stageFading : ''}`}>
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
        onClick={() => skip(entry ?? 'home')}
        initial={{ opacity: 0 }}
        animate={{ opacity: onStage ? 1 : 0 }}
        transition={onStage ? { delay: 0.6, duration: 0.8 } : { duration: 0.4 }}
        style={{ pointerEvents: onStage ? 'auto' : 'none' }}
        aria-hidden={!onStage}
      >
        S p i k
      </motion.button>
      {/* 共鸣页黑幕缓缓合拢期间，开场画面保持挂载在其下方（渐暗过渡）。
          fading 期间冻结 onEnter：S p i k 点击会同时命中 Intro 的 window pointerdown
          （→resonance）与 skip（→home），两个视图目标同帧竞争导致舞台/WebGL 拆建闪烁 */}
      {(view === 'intro' || view === 'resonance') && (
        <Intro key={runId} onEnter={fading ? () => {} : () => setView('resonance')} />
      )}
      {/* S p i k 在共鸣阶段点击：淡出后落页并卸载 Resonance（WebGL/定时器一并清理） */}
      {view === 'resonance' && <Resonance key={runId} onDone={() => skip(entry ?? 'home')} />}
      {view === 'home' && (
        <Home
          onReplay={() => {
            setRunId(id => id + 1);
            setView('intro');
          }}
        />
      )}
      {view === 'songs' && <SongsPage />}
      {view === 'gallery' && <GalleryPage />}
      {view === 'disclaimer' && <DisclaimerPage />}
    </div>
  );
}
