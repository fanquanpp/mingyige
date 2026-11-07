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

/**
 * 站点外壳：顶栏 + 侧滑面板 + 波浪线 + 页面 token，页面本体走 children。
 * 亮色单主题；页面跳转走 hash（src/navigation.ts）。
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
      {/* 左侧滑入面板：分类目录（二级菜单）+ 签名 */}
      <StaggeredMenu
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        position="left"
        colors={['#cfe4f2', '#b9dcf0']}
        accentColor="#66CCFF"
        items={MENU_ITEMS}
        theme="light"
        isFixed
      />

      {/* 顶栏：左 logo（圆标 = 面板开关，「鸣依阁」= 回主页），中 PillNav 主功能菜单，右音乐控制。
          navSlot 占据 logo 与控件之间的剩余宽度：PillNav 的 auto 收合以它为父级测量，
          窄视口收成汉堡按钮仍与 logo 同行，不再折到第二行 */}
      <header className={styles.topbar}>
        <BrandLogo tone="day" homeLink onSparkClick={() => setPanelOpen((open) => !open)} sparkExpanded={panelOpen} />
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
            theme="light"
            highlightColor="#66CCFF"
            highlightTextColor="#0B2A45"
            textColor="#16283B"
            barColor="#F8FBFD"
            ariaLabel="鸣依阁主导航"
          />
        </div>
        <div className={styles.topActions}>
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
