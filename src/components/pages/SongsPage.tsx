import { useEffect, useState } from 'react';
import { ALBUMS, PIANO_TRACK, trackDisplayName, type MusicTrack } from '../../data/site-content';
import { albumFromHash } from '../../navigation';
import { pauseMusic, playTrack, useMusicCore } from '../../audio/music';
import SiteChrome from '../site/SiteChrome';
import styles from './SongsPage.module.css';

/**
 * 歌曲页：默认曲 + 四张专辑分组点播，可按专辑筛选（hash 同步：#songs/<albumKey>）。
 * 播放器是全局单例（src/audio/music.ts）——点播切全局播放器，离开页面音乐继续放。
 */
export default function SongsPage() {
  // 低频订阅（status/currentId）：曲目列表不随 timeupdate 每秒重绘
  const music = useMusicCore();
  const [albumFilter, setAlbumFilter] = useState<string | null>(() => albumFromHash());

  // 侧边栏/地址栏切换专辑筛选
  useEffect(() => {
    const onHash = () => setAlbumFilter(albumFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const row = (track: MusicTrack, no: string) => {
    const isCurrent = music.currentId === track.id;
    const isPlaying = isCurrent && music.status === 'playing';
    return (
      <li key={track.id} className={styles.rowItem}>
        <button
          type="button"
          className={`${styles.textBtn} ${isPlaying ? styles.textBtnActive : ''} cursor-target`}
          data-cursor-label={isPlaying ? '暂停' : '播放'}
          onClick={() => {
            if (isPlaying) pauseMusic();
            else playTrack(track.id);
          }}
        >
          <span className={styles.no}>{no}</span>
          <span className={styles.trackTitle}>{trackDisplayName(track.title)}</span>
          <span className={styles.state}>{isPlaying ? '播放中' : isCurrent ? '已暂停' : ''}</span>
        </button>
      </li>
    );
  };

  const shownAlbums = albumFilter ? ALBUMS.filter(a => a.key === albumFilter) : ALBUMS;

  return (
    <SiteChrome view="songs">
      <section className={styles.header}>
        <h1 className={styles.title}>歌曲</h1>
        <div className={styles.filterTabs}>
          <a className={`${styles.tab} ${!albumFilter ? styles.tabOn : ''}`} href="#songs">
            全部
          </a>
          {ALBUMS.map(album => (
            <a
              key={album.key}
              className={`${styles.tab} ${albumFilter === album.key ? styles.tabOn : ''}`}
              href={`#songs/${album.key}`}
            >
              {album.title}
            </a>
          ))}
        </div>
      </section>

      <div className={styles.groups}>
        <section className={styles.group}>
          <p className={styles.groupHead}>进站默认曲</p>
          <ul className={styles.list}>{row(PIANO_TRACK, '00')}</ul>
        </section>
        {shownAlbums.map(album => (
          <section key={album.key} className={styles.group}>
            <p className={styles.groupHead}>
              《{album.title}》<span className={styles.groupSub}>{album.subtitle}</span>
              <span className={styles.groupYear}>
                {album.year} · {album.tracks.length} 曲
              </span>
            </p>
            <ul className={styles.list}>
              {album.tracks.map(track => row(track, track.id.split('-')[1]))}
            </ul>
          </section>
        ))}
      </div>
    </SiteChrome>
  );
}
