import { useEffect, useRef } from 'react';
import { ALBUMS, findTrack, trackDisplayName, type AlbumSection } from '../../data/site-content';
import { pauseMusic, playTrack, useMusic } from '../../audio/music';
import { useLyrics, useActiveLyric, scrollToActiveLine } from '../../audio/lyrics';
import SiteChrome from '../site/SiteChrome';
import styles from './SongsPage.module.css';

/**
 * 歌词本（隐藏页）：侧边栏专辑入口（#songs/<key>）直达。
 * 左 = 该专辑曲目本（点播/当前高亮），右 = 当前曲完整歌词（逐行高亮跟随播放）。
 * 本页主要作用是展示歌词——相当于翻开一本歌词本；播放控制仍走播放器页/顶栏。
 */
export default function LyricBook({ albumKey }: { albumKey: string }) {
  const music = useMusic();
  const lyricBoxRef = useRef<HTMLDivElement>(null);

  const album: AlbumSection | undefined = ALBUMS.find(a => a.key === albumKey);
  const track = findTrack(music.currentId);
  const playing = music.status === 'playing';

  const lyrics = useLyrics(track?.id, track?.lyric);
  const activeIndex = useActiveLyric(lyrics, music.time);

  useEffect(() => {
    scrollToActiveLine(lyricBoxRef.current, activeIndex);
  }, [activeIndex]);

  if (!album) {
    return (
      <SiteChrome view="songs">
        <div className={styles.bookEmpty}>专辑不存在</div>
      </SiteChrome>
    );
  }

  /* 曲目行：点播 + 当前高亮（歌词本内不放播放控制，职能归播放器） */
  const row = (item: { id: string; title: string }, no: string) => {
    const isCurrent = music.currentId === item.id;
    return (
      <li key={item.id} className={styles.rowItem}>
        <button
          type="button"
          className={`${styles.textBtn} ${isCurrent ? styles.textBtnCurrent : ''} cursor-target`}
          data-cursor-label={isCurrent && playing ? '暂停' : '播放'}
          onClick={() => {
            if (isCurrent && playing) pauseMusic();
            else playTrack(item.id);
          }}
        >
          <span className={styles.no}>{no}</span>
          <span className={styles.trackTitle}>{trackDisplayName(item.title)}</span>
        </button>
      </li>
    );
  };

  /* 全专辑共用的曲目本 */
  const trackList = (
    <>
      <p className={styles.bookGroup}>
        《{album.title}》<span className={styles.paneGroupSub}>{album.year} · {album.tracks.length} 曲</span>
      </p>
      <ul className={styles.list}>
        {album.tracks.map(item => row(item, item.id.split('-')[1]))}
      </ul>
    </>
  );

  return (
    <SiteChrome view="songs">
      <div className={styles.book}>
        <i className={styles.stageNo} aria-hidden="true">{String(ALBUMS.findIndex(a => a.key === albumKey) + 2).padStart(2, '0')}</i>

        {/* 左页：曲目本 */}
        <section className={styles.bookTracks} aria-label={`${album.title}曲目`}>
          <p className={styles.bookLabel}>歌词本</p>
          <h1 className={styles.bookTitle}>{album.title}</h1>
          <p className={styles.bookSub}>{album.subtitle} · {album.year}</p>
          <div className={styles.bookList}>{trackList}</div>
        </section>

        {/* 右页：当前曲完整歌词（逐行高亮跟随播放） */}
        <section className={styles.bookLyric} aria-label="歌词">
          <p className={styles.bookTrackName}>{track ? trackDisplayName(track.title) : ''}</p>
          <div className={`${styles.lyricBox} ${styles.bookLyricBox}`} ref={lyricBoxRef}>
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
          <img className={styles.paneDeco} src="images/deco/tianyi-yi.webp" alt="" aria-hidden="true" />
        </section>
      </div>
    </SiteChrome>
  );
}
