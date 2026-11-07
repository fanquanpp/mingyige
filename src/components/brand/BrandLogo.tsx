import styles from './BrandLogo.module.css';

/**
 * 左上角 logo「鸣依阁」：天依圆标（icon-tianyi.svg）+ 手写体大字 + 波浪下划线。
 * tone: night = 深色舞台用（开场动画/共鸣页）；day = 亮色页面用。
 * 传入 onSparkClick 时，圆标变为侧边栏展开/收纳按钮（主页用）；
 * 未传时圆标为纯装饰（开场动画 / 共鸣页用）。
 * homeLink=true 时「鸣依阁」文字为回主页链接（站点页面用）。
 */
export default function BrandLogo({
  tone = 'night',
  onSparkClick,
  sparkExpanded,
  homeLink = false
}: {
  tone?: 'night' | 'day';
  onSparkClick?: () => void;
  sparkExpanded?: boolean;
  homeLink?: boolean;
}) {
  const mark = (
    <img
      className={styles.spark}
      src="images/icons/icon-tianyi.svg"
      alt=""
      aria-hidden="true"
    />
  );

  return (
    <div className={`${styles.logo} ${tone === 'day' ? styles.day : ''}`}>
      {onSparkClick ? (
        <button
          type="button"
          className={styles.sparkBtn}
          onClick={onSparkClick}
          data-staggered-menu-toggle=""
          aria-label={sparkExpanded ? '收纳侧边栏' : '展开侧边栏'}
          aria-expanded={sparkExpanded}
        >
          {mark}
        </button>
      ) : (
        mark
      )}
      {homeLink ? (
        <a className={styles.text} href="#home" aria-label="回到首页">
          鸣依阁
        </a>
      ) : (
        <span className={styles.text}>鸣依阁</span>
      )}
    </div>
  );
}
