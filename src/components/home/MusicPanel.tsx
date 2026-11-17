import { useEffect, useRef } from 'react';
import {
  cyclePlayMode,
  pauseMusic,
  seekTo,
  startMusic,
  stepTrack,
  useMusic
} from '../../audio/music';
import { useLyrics, useActiveLyric, scrollToActiveLine, useProgressSeek } from '../../audio/lyrics';
import { MODE_META, fmt } from '../shared/playerBits';
import { ALBUMS, findTrack, trackDisplayName } from '../../data/site-content';
import styles from './MusicPanel.module.css';

export default function MusicPanel() {
  const music = useMusic();
  const track = findTrack(music.currentId);
  const playing = music.status === 'playing';
  const albumOfTrack = track ? ALBUMS.find(album => album.tracks.some(item => item.id === track.id)) : null;
  const albumLabel = albumOfTrack ? `《${albumOfTrack.title}》` : '';

  const lyricBoxRef = useRef<HTMLDivElement>(null);

  /* 歌词懒加载 + 当前行 + 自动滚动（共享逻辑见 src/audio/lyrics.ts） */
  const lyrics = useLyrics(track?.id, track?.lyric);
  const activeIndex = useActiveLyric(lyrics, music.time);

  useEffect(() => {
    scrollToActiveLine(lyricBoxRef.current, activeIndex);
  }, [activeIndex]);

  /* 进度条 seek（共享逻辑） */
  const { progressRef, onPointerDown: onProgressPointerDown } = useProgressSeek(music.duration, seekTo);
  const pct = music.duration ? Math.min(100, (music.time / music.duration) * 100) : 0;

  return (
    <section className={styles.panel} aria-label="音乐播放器">
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
        {/* 信息区：曲名 + 专辑（移动端在唱片正下方） */}
        <div className={styles.info}>
          <p className={styles.trackTitle}>{track ? trackDisplayName(track.title) : ''}</p>
          <p className={styles.trackAlbum}>{albumLabel}</p>
        </div>
        {/* 控制区：按钮 + 进度 + 时间（移动端为通栏行） */}
        <div className={styles.ctrl}>
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

      {/* 歌词区：桌面 = 面板下方通栏；移动端 = 移入控制区右侧的框中区域 */}
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
            <p className={styles.lyricEmpty}>{track && !track.lyric ? '纯音乐' : '歌词整理中'}</p>
          )}
        </div>
      </div>
    </section>
  );
}
