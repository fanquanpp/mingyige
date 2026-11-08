import { useEffect, useState, type ReactNode } from 'react';
import { pauseMusic, startMusic, useMusicCore } from '../../audio/music';
import { MENU_ITEMS, PAGE_NAV, type PageView } from '../../navigation';
import BrandLogo from '../brand/BrandLogo';
import PillNav from '../nav/PillNav';
import StaggeredMenu from '../nav/StaggeredMenu';
import styles from './SiteChrome.module.css';

/* 各页浏览器标签标题 */
const PAGE_TITLES: Record<PageView, string> = {
  home: '鸣依阁',
  songs: '歌曲 · 鸣依阁',
  gallery: '图集 · 鸣依阁',
  disclaimer: '免责声明 · 鸣依阁'
};

/* ---------- 色彩模式：auto = 跟随系统（prefers-color-scheme），light / dark 手动固定。
   首帧由 index.html 引导脚本按同样规则写入 data-theme（避免暗色用户刷新闪白），
   这里接管切换、记忆与系统变化联动 ---------- */

const THEME_KEY = 'mingyige-theme';
type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_LABELS: Record<ThemeMode, string> = {
  auto: '自动',
  light: '浅色',
  dark: '深色'
};

function readThemeMode(): ThemeMode {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'light' || saved === 'dark' ? saved : 'auto';
}

/**
 * 站点外壳：顶栏 + 侧滑面板 + 波浪线 + 页面 token，页面本体走 children。
 * 亮/暗双主题（默认跟随系统）；页面跳转走 hash（src/navigation.ts）。
 */
export default function SiteChrome({
  view,
  fit = false,
  children
}: {
  view: PageView;
  /** 单屏构图：锁定视口高度、页面不滚动（首页用）；小屏自动回退文档流 */
  fit?: boolean;
  children: ReactNode;
}) {
  // 低频订阅：顶栏只关心播放态，不随进度更新重渲染整个外壳
  const music = useMusicCore();
  const paused = music.status === 'paused';
  // 右侧滑入面板开关：点击 logo 星芒切换
  const [panelOpen, setPanelOpen] = useState(false);
  // 色彩模式与系统偏好（auto 时联动）
  const [mode, setMode] = useState<ThemeMode>(readThemeMode);
  const [sysDark, setSysDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const dark = mode === 'auto' ? sysDark : mode === 'dark';

  // 应用主题到根元素（index.css / 各模块的 [data-theme='dark'] 全部吃这个属性），
  // 并同步移动端地址栏 theme-color
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#161c23' : '#ebf1f4');
  }, [dark]);

  // 跟随系统：系统切换深浅色时实时联动
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSysDark(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // 记忆手动选择；auto 即回到跟随系统，清除记忆
  useEffect(() => {
    if (mode === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  // 页面标题跟随当前页
  useEffect(() => {
    document.title = PAGE_TITLES[view];
  }, [view]);

  // 经由导航/分类目录跳页（hash 变化）后收起面板
  useEffect(() => {
    const close = () => setPanelOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  return (
    <main className={`${styles.page} ${fit ? styles.pageFit : ''}`}>
      {/* 左侧滑入面板：分类目录（二级菜单）+ 签名；面板随主题换肤（深夜蓝/白） */}
      <StaggeredMenu
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        position="left"
        colors={dark ? ['#14283c', '#0f2133'] : ['#cfe4f2', '#b9dcf0']}
        accentColor="#66CCFF"
        items={MENU_ITEMS}
        theme={dark ? 'dark' : 'light'}
        isFixed
      />

      {/* 顶栏：左 logo（圆标 = 面板开关，「鸣依阁」= 回主页），中 PillNav 主功能菜单，右色彩模式 + 音乐控制。
          navSlot 占据 logo 与控件之间的剩余宽度：PillNav 的 auto 收合以它为父级测量，
          窄视口收成汉堡按钮仍与 logo 同行，不再折到第二行 */}
      <header className={styles.topbar}>
        <BrandLogo
          tone={dark ? 'night' : 'day'}
          homeLink
          onSparkClick={() => setPanelOpen((open) => !open)}
          sparkExpanded={panelOpen}
        />
        <div className={styles.navSlot}>
          <PillNav
            items={PAGE_NAV}
            activeHref={`#${view}`}
            itemStyle="plain"
            hoverEffect="fill"
            indicator="dot"
            layout="split"
            surface="solid"
            size="lg"
            bounce={0.2}
            stretch={0.5}
            collapse="auto"
            intro
            theme={dark ? 'dark' : 'light'}
            highlightColor="#66CCFF"
            highlightTextColor="#0B2A45"
            textColor={dark ? '#E8F7FF' : '#16283B'}
            barColor={dark ? '#1e262e' : '#F8FBFD'}
            ariaLabel="鸣依阁主导航"
          />
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={`${styles.musicText} cursor-target`}
            data-cursor-label={`主题：${THEME_LABELS[mode]}`}
            onClick={() =>
              setMode((m) => (m === 'auto' ? 'dark' : m === 'dark' ? 'light' : 'auto'))
            }
            aria-label={`色彩模式：当前${THEME_LABELS[mode]}${mode === 'auto' ? '（跟随系统）' : ''}，点击切换`}
          >
            {THEME_LABELS[mode]}
          </button>
          <button
            type="button"
            className={`${styles.musicText} ${paused ? styles.musicPaused : ''} cursor-target`}
            data-cursor-label={paused ? '播放音乐' : '暂停音乐'}
            onClick={paused ? startMusic : pauseMusic}
            aria-label={paused ? '播放音乐' : '暂停音乐'}
          >
            音乐
          </button>
        </div>
      </header>

      {children}

      {/* 权利提示页脚：非官方粉丝站声明，链接到免责声明页 */}
      <footer className={styles.footer}>
        <span>非官方粉丝站 · 素材版权归原权利方所有</span>
        <a href="#disclaimer" aria-label="查看免责声明">免责声明</a>
      </footer>
    </main>
  );
}
