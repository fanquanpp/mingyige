import { useEffect, useMemo, useRef, useState } from 'react';

/** 同步歌词共享逻辑：MusicPanel（首页）与 SongsPage（歌曲页）共用。
 *  歌词按曲目懒加载（public/lyrics/<id>.json），模块级缓存跨切页不重请求。 */

export interface LyricLine {
  t: number;
  text: string;
}

const lyricCache = new Map<string, LyricLine[] | null>();

/** 歌词懒加载 hook：返回当前曲歌词数组（无歌词/加载中为 null） */
export function useLyrics(trackId: string | undefined, lyricSrc: string | null | undefined): LyricLine[] | null {
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);

  useEffect(() => {
    if (!trackId) return;
    const cached = lyricCache.get(trackId);
    if (cached !== undefined) {
      setLyrics(cached);
      return;
    }
    setLyrics(null);
    if (!lyricSrc) {
      lyricCache.set(trackId, null);
      return;
    }
    let alive = true;
    fetch(lyricSrc)
      .then(res => res.json())
      .then(json => {
        const lines = (json.lines || []) as LyricLine[];
        lyricCache.set(trackId, lines);
        if (alive) setLyrics(lines);
      })
      .catch(() => {
        lyricCache.set(trackId, null);
        if (alive) setLyrics(null);
      });
    return () => {
      alive = false;
    };
  }, [trackId, lyricSrc]);

  return lyrics;
}

/** 当前行索引：time 之前最近的歌词行（+0.35s 视觉提前量） */
export function activeLyricIndex(lyrics: LyricLine[] | null, time: number): number {
  if (!lyrics) return -1;
  let idx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].t <= time + 0.35) idx = i;
    else break;
  }
  return idx;
}

/** 歌词自动滚动：当前行固定对齐容器上 1/3 基准线（行中心贴线，CSS 顶部留白 33% 配合）。
 *  box 为滚动容器，行元素需带 data-line 索引。 */
export function scrollToActiveLine(box: HTMLElement | null, activeIndex: number) {
  if (!box || activeIndex < 0) return;
  const lineEl = box.querySelector<HTMLElement>(`[data-line="${activeIndex}"]`);
  if (!lineEl) return;
  const lineTopInContent = lineEl.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
  const anchorInContent = box.clientHeight / 3;
  const lineH = lineEl.offsetHeight;
  box.scrollTo({
    top: Math.max(0, lineTopInContent + lineH / 2 - anchorInContent),
    behavior: 'smooth'
  });
}

/** 进度条指针拖拽 hook：返回 ref（挂进度条容器）与 onPointerDown。
 *  拖动/点击都实时 seek（music.duration 为 0 时忽略）。 */
export function useProgressSeek(duration: number, onSeek: (seconds: number) => void) {
  const progressRef = useRef<HTMLDivElement>(null);

  const seekFromPointer = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !duration) return;
    event.preventDefault();
    seekFromPointer(event.clientX);
    const onMove = (move: PointerEvent) => seekFromPointer(move.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return { progressRef, onPointerDown };
}

/** 当前行索引 hook（useMemo 包装，供组件直接用） */
export function useActiveLyric(lyrics: LyricLine[] | null, time: number): number {
  return useMemo(() => activeLyricIndex(lyrics, time), [lyrics, time]);
}
