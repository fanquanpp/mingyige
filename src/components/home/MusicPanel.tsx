import { useEffect, useMemo, useRef, useState } from 'react';
import {
  pauseMusic,
  seekTo,
  startMusic,
  stepTrack,
  switchTrack,
  useMusic
} from '../../audio/music';
import { ALBUMS, findTrack, trackDisplayName } from '../../data/site-content';
import styles from './MusicPanel.module.css';

interface LyricLine {
  t: number;
  text: string;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* 歌词按曲目懒加载（每首一个 JSON），缓存到组件生命周期内 */
const lyricCache = new Map<string, LyricLine[] | null>();
export default function MusicPanel() {
  const music = useMusic();
  const track = findTrack(music.currentId);
  const playing = music.status === 'playing';
  const albumOfTrack = track ? ALBUMS.find(album => album.tracks.some(item => item.id === track.id)) : null;
  const albumLabel = albumOfTrack ? `《${albumOfTrack.title}》` : '';

  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const lyricBoxRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 歌词懒加载 + 缓存；换曲时先清掉上一首的歌词与滚动位置，避免串台
  useEffect(() => {
    if (!track) return;
    const cached = lyricCache.get(track.id);
    if (cached !== undefined) {
      lyricBoxRef.current?.scrollTo({ top: 0 });
      setLyrics(cached);
      return;
    }
    lyricBoxRef.current?.scrollTo({ top: 0 });
    setLyrics(null);
    if (!track.lyric) {
      lyricCache.set(track.id, null);
      return;
    }
    let alive = true;
    fetch(track.lyric)
      .then(res => res.json())
      .then(json => {
        const lines = (json.lines || []) as LyricLine[];
        lyricCache.set(track.id, lines);
        if (alive) setLyrics(lines);
      })
      .catch(() => {
        lyricCache.set(track.id, null);
        if (alive) setLyrics(null);
      });
    return () => {
      alive = false;
    };
  }, [track]);

  // 当前行：time 之前最近的歌词行
  const activeIndex = useMemo(() => {
    if (!lyrics) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].t <= music.time + 0.35) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, music.time]);

  // 歌词自动滚动到当前行
  useEffect(() => {
    const box = lyricBoxRef.current;
    if (!box || activeIndex < 0) return;
    const lineEl = box.querySelector<HTMLElement>(`[data-line="${activeIndex}"]`);
    if (!lineEl) return;
    box.scrollTo({
      top: lineEl.offsetTop - box.clientHeight / 2 + lineEl.clientHeight / 2,
      behavior: 'smooth'
    });
  }, [activeIndex]);

  // 进度条 seek（点击/拖拽共用）
  const seekFromPointer = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar || !music.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seekTo(ratio * music.duration);
  };

  const onSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    seekFromPointer(event.clientX);
  };

  const onProgressPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !music.duration) return;
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

  const pct = music.duration ? Math.min(100, (music.time / music.duration) * 100) : 0;

  return (
    <section className={styles.panel} aria-label="音乐播放器">
      <div className={styles.top}>
        {/* 唱片区：偏移色块 + 旋转唱片 + 圆标盘心 */}
        <div className={styles.discStage}>
          <i className={styles.discBlock} aria-hidden="true" />
          <div className={`${styles.disc} ${playing ? '' : styles.discPaused}`}>
            <svg className={styles.discGrooves} viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="97" className={styles.grooveOuter} />
              <circle cx="100" cy="100" r="86" className={styles.groove} />
              <circle cx="100" cy="100" r="74" className={styles.groove} />
              <circle cx="100" cy="100" r="62" className={styles.groove} />
              <circle cx="100" cy="100" r="50" className={styles.grooveAccent} />
            </svg>
            <img className={styles.discLabel} src="images/brand/site-seal.webp" alt="" />
          </div>
        </div>

        <div className={styles.meta}>
          <p className={styles.trackTitle}>{track ? trackDisplayName(track.title) : ''}</p>
          <p className={styles.trackAlbum}>{albumLabel}</p>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => stepTrack(-1)}
              aria-label="上一首"
              data-cursor-label="上一首"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                <path d="M11.5 3.5v11L4 9l7.5-5.5zM14 3.5h2v11h-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.playBtn} cursor-target`}
              onClick={() => (playing ? pauseMusic() : startMusic())}
              aria-label={playing ? '暂停' : '播放'}
              data-cursor-label={playing ? '暂停' : '播放'}
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <rect x="3.5" y="3" width="4" height="12" rx="0.5" />
                  <rect x="10.5" y="3" width="4" height="12" rx="0.5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <path d="M5 3l10 6-10 6V3z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => stepTrack(1)}
              aria-label="下一首"
              data-cursor-label="下一首"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                <path d="M6.5 3.5v11L14 9 6.5 3.5zM2 3.5h2v11H2z" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.switchBtn}
              onClick={() => track && switchTrack(track.id)}
              aria-label="重新播放本曲"
              data-cursor-label="重播"
            >
              重播
            </button>
          </div>

          <div
            className={styles.progress}
            ref={progressRef}
            onClick={onSeek}
            onPointerDown={onProgressPointerDown}
            role="slider"
            aria-label="播放进度"
            aria-valuemin={0}
            aria-valuemax={Math.round(music.duration)}
            aria-valuenow={Math.round(music.time)}
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === 'ArrowRight') seekTo(Math.min(music.duration, music.time + 5));
              if (event.key === 'ArrowLeft') seekTo(Math.max(0, music.time - 5));
            }}
          >
            <i className={styles.progressFill} style={{ width: `${pct}%` }} />
            <i className={styles.progressKnob} style={{ left: `${pct}%` }} />
          </div>
          <div className={styles.timeRow}>
            <span>{fmt(music.time)}</span>
            <span>{fmt(music.duration)}</span>
          </div>
        </div>
      </div>

      {/* 歌词区 */}
      <div className={styles.lyricWrap}>
        <div className={styles.lyricBox} ref={lyricBoxRef}>
          {lyrics && lyrics.length ? (
            lyrics.map((line, index) => (
              <p
                key={`${line.t}-${index}`}
                data-line={index}
                className={`${styles.lyricLine} ${index === activeIndex ? styles.lyricOn : ''}`}
              >
                {line.text}
              </p>
            ))
          ) : (
            <p className={styles.lyricEmpty}>{track && track.id === 'wan-fen-zhi-de-guang-piano' ? '纯音乐' : '歌词整理中'}</p>
          )}
        </div>
      </div>
    </section>
  );
}
