import { ALBUMS, PIANO_TRACK, trackDisplayName, type MusicTrack } from '../../data/site-content';
import { pauseMusic, playTrack, useMusicCore } from '../../audio/music';
import styles from './SongDirectory.module.css';

/**
 * 歌曲目录（首页右栏）：默认曲 + 四张专辑按序分组，点播切全局播放器。
 * 播放中的曲目带跳动的小均衡条（纯 CSS 几何）。
 */
export default function SongDirectory({ onReplay }: { onReplay: () => void }) {
  // 低频订阅（status/currentId）：不随 timeupdate 高频重渲染整棵目录树
  const music = useMusicCore();

  const row = (track: MusicTrack, no: string) => {
    const isCurrent = music.currentId === track.id;
    const isPlaying = isCurrent && music.status === 'playing';
    return (
      <li key={track.id}>
        <button
          type="button"
          className={`${styles.track} ${isCurrent ? styles.trackOn : ''}`}
          onClick={() => {
            if (isPlaying) pauseMusic();
            else playTrack(track.id);
          }}
          aria-label={`${isPlaying ? '暂停' : '播放'}${track.title}`}
          data-cursor-label={isPlaying ? '暂停' : '播放'}
        >
          <span className={styles.no}>{no}</span>
          <span className={styles.trackTitle}>{trackDisplayName(track.title)}</span>
          {isPlaying ? (
            <span className={styles.eq} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : null}
        </button>
      </li>
    );
  };

  return (
    <aside className={styles.directory} aria-label="歌曲目录">
      <div className={styles.scroll}>
        <ul className={styles.list}>{row(PIANO_TRACK, '00')}</ul>
        {ALBUMS.map(album => (
          <section key={album.key}>
            <p className={styles.albumHead}>
              《{album.title}》<span className={styles.albumYear}>{album.year}</span>
            </p>
            <ul className={styles.list}>
              {album.tracks.map(track => row(track, track.id.split('-')[1]))}
            </ul>
          </section>
        ))}
      </div>

      <div className={styles.footer}>
        <a className={styles.more} href="#gallery">
          更多图集 →
        </a>
        <button type="button" className={styles.replay} onClick={onReplay}>
          重看开场
        </button>
      </div>
    </aside>
  );
}
