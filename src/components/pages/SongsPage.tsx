import { useEffect, useRef, useState } from 'react';
import { ALBUMS, findTrack, flatTracks, trackDisplayName } from '../../data/site-content';
import { albumFromHash } from '../../navigation';
import { cyclePlayMode, pauseMusic, seekTo, startMusic, stepTrack, useMusic } from '../../audio/music';
import { useLyrics, useActiveLyric, scrollToActiveLine, useProgressSeek } from '../../audio/lyrics';
import { MODE_META, fmt } from '../shared/playerBits';
import LyricBook from './LyricBook';
import SiteChrome from '../site/SiteChrome';
import styles from './SongsPage.module.css';

/**
 * 歌曲页 = 网易云式全屏沉浸播放器（黑胶唱片 + 同步歌词 + 底部控制通栏）。
 * 侧边栏专辑入口（#songs/<key>）直达「歌词本」隐藏页（LyricBook）——
 * 播放器归顶栏 nav，歌词本归侧边栏，两套入口职能分开。
 * 播放器是全局单例（src/audio/music.ts）——点播切全局播放器，离开页面音乐继续放。
 */

export default function SongsPage() {
  // 高频订阅（time/duration）：进度条与歌词逐句同步需要
  const music = useMusic();
  const [albumFilter, setAlbumFilter] = useState<string | null>(() => albumFromHash());
  const lyricBoxRef = useRef<HTMLDivElement>(null);

  // 侧边栏/地址栏切换（#songs/<key> ↔ #songs）
  useEffect(() => {
    const onHash = () => setAlbumFilter(albumFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const track = findTrack(music.currentId);
  const playing = music.status === 'playing';

  // 当前曲所在专辑（信息行展示用）
  const currentAlbum = track
    ? ALBUMS.find(album => album.tracks.some(item => item.id === track.id)) ?? null
    : null;

  /* 水印编号：播放列表全局序号（每曲必变） */
  const trackNo = track
    ? String(flatTracks().findIndex(t => t.id === track.id) + 1).padStart(2, '0')
    : '01';

  /* 歌词（共享逻辑见 src/audio/lyrics.ts） */
  const lyrics = useLyrics(track?.id, track?.lyric);
  const activeIndex = useActiveLyric(lyrics, music.time);

  // 歌词自动滚动：当前行居中
  useEffect(() => {
    scrollToActiveLine(lyricBoxRef.current, activeIndex);
  }, [activeIndex]);

  /* 进度条 seek（共享逻辑） */
  const { progressRef, onPointerDown: onProgressPointerDown } = useProgressSeek(music.duration, seekTo);
  const pct = music.duration ? Math.min(100, (music.time / music.duration) * 100) : 0;

  /* 黑胶盘心：一律天依小像（不用专辑封面） */
  const coverArt = (
    <img className={`${styles.cover} ${styles.coverDeco}`} src="images/deco/tianyi-yi.webp" alt="天依小像" />
  );

  /* ---------- 歌词盒（大字号沉浸排版） ---------- */
  const lyricBox = (
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
        <p className={styles.lyricEmpty}>
          {track && !track.lyric ? '纯音乐，请静静聆听' : '歌词整理中'}
        </p>
      )}
    </div>
  );

  /* ---------- 歌词本（隐藏页）：侧边栏专辑入口直达，播放器不承载歌单 ---------- */
  if (albumFilter) {
    return <LyricBook albumKey={albumFilter} />;
  }

  return (
    <SiteChrome view="songs">
      <div className={styles.immersive}>
        {/* 背景水印大字：播放列表全局序号 */}
        <i className={styles.stageNo} aria-hidden="true">{trackNo}</i>

        <div className={styles.immStage}>
          {/* 左：黑胶唱片 */}
          <div className={styles.vinylStage}>
            <i className={styles.vinylBlock} aria-hidden="true" />
            <div className={`${styles.vinyl} ${playing ? '' : styles.vinylPaused}`}>
              {coverArt}
            </div>
          </div>

          {/* 右：纯歌词舞台（歌词 + 背景装饰，不放曲目信息） */}
          <section className={styles.lyricStage} aria-label="歌词">
            <p className={styles.lyricHead} aria-hidden="true">歌词</p>
            {lyricBox}
            <img className={styles.paneDeco} src="images/deco/tianyi-yi.webp" alt="" aria-hidden="true" />
          </section>
        </div>

        {/* 底部左：曲目信息（红框外，图一布局） */}
        <div className={styles.nowInfo}>
          <p className={styles.nowLabel}>
            正在播放
            <i className={styles.labelDot} aria-hidden="true" />
          </p>
          <h1 className={styles.nowTitle}>{track ? trackDisplayName(track.title) : ''}</h1>
          <p className={styles.nowAlbum}>
            {currentAlbum ? (
              <>
                《{currentAlbum.title}》<span className={styles.nowYear}>{currentAlbum.year}</span>
                <span className={styles.nowCount}>全 {currentAlbum.tracks.length} 曲</span>
              </>
              ) : (
                '进站默认曲'
              )}
          </p>
        </div>

        {/* 底部控制通栏 */}
        <div className={styles.immBar}>
          <div className={styles.immControls}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => stepTrack(-1)}
              aria-label="上一首"
              data-cursor-label="上一首"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
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
                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <rect x="3.5" y="3" width="4" height="12" rx="0.5" />
                  <rect x="10.5" y="3" width="4" height="12" rx="0.5" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
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
              <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                <path d="M6.5 3.5v11L14 9 6.5 3.5zM2 3.5h2v11H2z" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={cyclePlayMode}
              aria-label={`播放模式：${MODE_META[music.mode].label}`}
              data-cursor-label={MODE_META[music.mode].cursor}
              title={MODE_META[music.mode].label}
            >
              {MODE_META[music.mode].icon}
            </button>
          </div>

          <div
            className={styles.progress}
            ref={progressRef}
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
    </SiteChrome>
  );
}
