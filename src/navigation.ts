import type { PillNavItem } from './components/nav/PillNav';
import type { StaggeredMenuItem } from './components/nav/StaggeredMenu';

/** 页面清单与导航锚点；页面切换统一走 hash，App 监听 hashchange 切页。
 *  专辑筛选视图：#songs/<albumKey>（见 albumFromHash）。 */

export type PageView = 'home' | 'songs' | 'gallery';

export const PAGE_VIEWS: PageView[] = ['home', 'songs', 'gallery'];

export const ALBUM_KEYS = ['yiruchujian', 'wujinlan', 'zaisheng', 'sichongzou', 'lostintianyi'];

export function viewFromHash(hash?: string): PageView | null {
  const key = (hash ?? window.location.hash).replace(/^#/, '').split('/')[0];
  return PAGE_VIEWS.includes(key as PageView) ? (key as PageView) : null;
}

/** '#songs/<albumKey>' 里的专辑筛选段（无则 null） */
export function albumFromHash(hash?: string): string | null {
  const seg = (hash ?? window.location.hash).replace(/^#/, '').split('/')[1];
  return seg && ALBUM_KEYS.includes(seg) ? seg : null;
}

/* 主功能菜单（顶栏 PillNav） */
export const PAGE_NAV: PillNavItem[] = [
  { label: '首页', href: '#home', ariaLabel: '回到首页' },
  { label: '歌曲', href: '#songs', ariaLabel: '去歌曲页' },
  { label: '图集', href: '#gallery', ariaLabel: '去图集页' }
];

/* 侧边栏目录：全部 / 五张专辑（直达对应筛选视图）/ 图集 */
export const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: '全部', ariaLabel: '回到首页', link: '#home' },
  { label: '依如初见', ariaLabel: '播放依如初见', link: '#songs/yiruchujian' },
  { label: '无尽蓝', ariaLabel: '播放无尽蓝', link: '#songs/wujinlan' },
  { label: '再生', ariaLabel: '播放再生', link: '#songs/zaisheng' },
  { label: '四重奏', ariaLabel: '播放四重奏', link: '#songs/sichongzou' },
  { label: 'Lost In Tianyi', ariaLabel: '播放 Lost In Tianyi', link: '#songs/lostintianyi' },
  { label: '图集', ariaLabel: '查看图集', link: '#gallery' }
];
