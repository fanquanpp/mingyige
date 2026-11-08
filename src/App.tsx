import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Intro from './components/intro/Intro';
import Home from './components/home/Home';
import SongsPage from './components/pages/SongsPage';
import GalleryPage from './components/pages/GalleryPage';
import DisclaimerPage from './components/pages/DisclaimerPage';
import TargetCursor from './components/fx/TargetCursor';
import { armMusicOnGesture } from './audio/music';
import { PAGE_VIEWS, viewFromHash, type PageView } from './navigation';
import styles from './App.module.css';

type View = 'intro' | PageView;

/* 光标捕获所有可点击元素：链接、按钮等 */
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
    // 页面态同步进地址栏（replace 不产生历史记录）；开场态不动 hash。
    // 深链带的专辑段（#songs/xxx）在落到歌曲页时保留，避免抹掉筛选状态
    if (PAGE_VIEWS.includes(next as PageView)) {
      const suffix =
        next === 'songs' && entryHashRef.current.startsWith('#songs/') ? entryHashRef.current.slice('#songs'.length) : '';
      history.replaceState(null, '', `#${next}${suffix}`);
    }
  };

  const onStage = view === 'intro';

  /* 「轻触共鸣」与 S k i p 完全同款退场逻辑（用户最终决定）：
     淡出 → 真实绘制帧 → 切页 → 旧舞台延迟卸载。
     Resonance 中间页已随本方案移除——一跳直达主页。 */
  const [leaving, setLeaving] = useState(false);
  const [staleStage, setStaleStage] = useState(false); // 已切走但仍挂载的旧舞台
  const unmountTimer = useRef<number>(0);

  const enter = () => {
    if (leaving || view !== 'intro') return;
    setLeaving(true);
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        setStaleStage(true); // 旧舞台保留挂载，隐藏壳内等新页绘制稳定
        setView('home');
        window.clearTimeout(unmountTimer.current);
        unmountTimer.current = window.setTimeout(() => {
          setStaleStage(false);
          setLeaving(false);
        }, 600);
      });
    }, 220);
  };

  // 卸载期间若再次切换，清掉旧计时器
  useEffect(() => () => window.clearTimeout(unmountTimer.current), []);
  const leavingStage = leaving || staleStage;

  return (
    <div className={`${styles.app} ${leavingStage ? styles.stageFading : ''}`}>
      {/* 自定义光标：四角括号锁定所有可点击目标（触屏设备自动禁用）。
          颜色固定品牌点缀 #66ccff（含开场深色舞台——夜幕底上对比度足够）；
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
      {/* S k i p 跳过：开场/海报阶段常驻，与「轻触共鸣」共用同一退场逻辑。
          data-skip-btn 供 Intro 的 window pointerdown 监听排除（防同帧双触发） */}
      <motion.button
        type="button"
        className={styles.skipBtn}
        data-skip-btn=""
        onClick={() => (view === 'intro' ? enter() : setView(entry ?? 'home'))}
        initial={{ opacity: 0 }}
        animate={{ opacity: onStage ? 1 : 0 }}
        transition={onStage ? { delay: 0.6, duration: 0.8 } : { duration: 0.4 }}
        style={{ pointerEvents: onStage ? 'auto' : 'none' }}
        aria-hidden={!onStage}
      >
        S k i p
      </motion.button>
      {/* 退场中的旧舞台：切页后继续挂载 600ms（新页已完整绘制），合成层届时才销毁。
          stageHidden：absolute 脱离网格流铺满容器（place-items 会把第二个 grid item
          压成内容高度——旧舞台被压成半屏卡片叠在新页上，是历次崩坏的布局根源） */}
      {staleStage && (
        <div className={styles.stageHidden}>
          <Intro key={`stale-${runId}`} onEnter={() => {}} frozen />
        </div>
      )}
      {/* 现役开场舞台。leaving 期间冻结 onEnter（防点击重入） */}
      {view === 'intro' && <Intro key={runId} onEnter={leaving ? () => {} : enter} />}
      {view === 'home' && (
        <Home
          onReplay={() => {
            // 重看开场：页面 → 舞台同样走退场序
            setRunId(id => id + 1);
            enter();
          }}
        />
      )}
      {view === 'songs' && <SongsPage />}
      {view === 'gallery' && <GalleryPage />}
      {view === 'disclaimer' && <DisclaimerPage />}
    </div>
  );
}
