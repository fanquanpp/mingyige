import type { ReactElement } from 'react';
import type { PlayMode } from '../../audio/music';

/** 播放器共享碎片：模式图标/文案与时间格式化（首页 MusicPanel 与歌曲页共用）。 */

/* 播放模式图标与文案：顺序循环 / 随机 / 单曲循环（纯色几何 SVG） */
export const MODE_META: Record<PlayMode, { label: string; cursor: string; icon: ReactElement }> = {
  order: {
    label: '顺序循环',
    cursor: '顺序',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {/* 首尾相接的双向循环箭头 */}
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </svg>
    )
  },
  random: {
    label: '随机播放',
    cursor: '随机',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {/* 交叉换位的随机箭头 */}
        <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.83 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
      </svg>
    )
  },
  one: {
    label: '单曲循环',
    cursor: '单曲循环',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {/* 循环箭头 + 中间「1」 */}
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      </svg>
    )
  }
};

/** 秒 → mm:ss */
export function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
