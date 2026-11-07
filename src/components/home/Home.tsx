import MusicPanel from './MusicPanel';
import SongDirectory from './SongDirectory';
import SiteChrome from '../site/SiteChrome';
import styles from './Home.module.css';

/**
 * 主页：主视觉 + 音乐播放器面板（左）+ 歌曲目录（右）。
 * 外壳（顶栏/侧栏/波浪线）由 SiteChrome 提供，样式遵守设计禁令（docs/design-rules.md）。
 */
export default function Home({ onReplay }: { onReplay: () => void }) {
  return (
    <SiteChrome view="home" fit>
      {/* 主视觉：大字排版 + 气泡；签名水印常驻左下角（背景装饰，不被右侧面板遮挡） */}
      <section className={styles.hero}>
        <i className={styles.bub} style={{ left: '6%', top: '18%', width: 14, height: 14 }} />
        <i className={styles.bub} style={{ left: '30%', top: '64%', width: 9, height: 9 }} />
        <i className={styles.bub} style={{ left: '55%', top: '12%', width: 11, height: 11 }} />
        <i className={styles.bub} style={{ left: '88%', top: '72%', width: 16, height: 16 }} />
        <img
          className={styles.heroWatermark}
          src="/images/brand/tianyi-signature.png"
          alt=""
          aria-hidden="true"
        />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              {/* 八分音符：纯色几何 SVG（设计规范允许的图标形式） */}
              <svg
                className={styles.kickerNote}
                viewBox="0 0 18 18"
                fill="currentColor"
                aria-hidden="true"
              >
                <ellipse cx="5.6" cy="13.8" rx="3" ry="2.4" />
                <rect x="7.7" y="3" width="1.4" height="10.8" rx="0.7" />
                <path d="M9.1 3c2.8 0.7 4.3 2.3 4.5 5-0.8-1.5-2.3-2.4-4.5-2.6z" />
              </svg>
              Vsinger · 2012.07.12 · China
            </p>
            <h1 className={styles.heroTitle}>洛天依</h1>
            <p className={styles.heroSlogan}>「华风夏韵 · 洛水天依」</p>
          </div>
        </div>
      </section>

      {/* 内容网格：左 = 音乐播放器面板，右 = 歌曲目录 */}
      <div className={styles.grid} id="content">
        <MusicPanel />
        <SongDirectory onReplay={onReplay} />
      </div>
    </SiteChrome>
  );
}
