import { useEffect, useState } from 'react';
import { GALLERY, type GalleryItem } from '../../data/site-content';
import SiteChrome from '../site/SiteChrome';
import styles from './GalleryPage.module.css';

/**
 * 图集页：素材以响应式网格摆放（缩略图 contain 居中，不裁切原图），
 * 点击放大浏览（Esc/点遮罩关闭，灯箱期间锁定背景滚动）。
 */
export default function GalleryPage() {
  const [zoom, setZoom] = useState<GalleryItem | null>(null);

  // 放大浏览：锁住背景滚动 + Esc 关闭
  useEffect(() => {
    if (!zoom) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoom(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom]);

  const categories = [...new Set(GALLERY.map(item => item.category))];

  return (
    <SiteChrome view="gallery">
      <section className={styles.header}>
        <h1 className={styles.title}>图集</h1>
      </section>

      {categories.map(category => {
        const items = GALLERY.filter(item => item.category === category);
        return (
          <section key={category} className={styles.catSection}>
            <p className={styles.catHead}>{category}</p>
            <ul className={styles.masonry}>
              {items.map(item => (
                <li key={item.src}>
                  <figure
                    className={`${styles.item} cursor-target`}
                    data-cursor-label="放大"
                    role="button"
                    tabIndex={0}
                    onClick={() => setZoom(item)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setZoom(item);
                      }
                    }}
                  >
                    <img className={styles.thumb} src={item.src} alt={item.title} loading="lazy" />
                    <figcaption className={styles.caption}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemNote}>{item.note}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {zoom && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.title}
          onClick={() => setZoom(null)}
        >
          <figure className={styles.zoomCard} onClick={event => event.stopPropagation()}>
            <img className={styles.zoomImg} src={zoom.src} alt={zoom.title} />
            <figcaption className={styles.zoomCaption}>
              {zoom.title} · {zoom.note}
            </figcaption>
          </figure>
          <button
            type="button"
            className={`${styles.zoomClose} cursor-target`}
            data-cursor-label="关闭"
            onClick={() => setZoom(null)}
          >
            关闭
          </button>
        </div>
      )}
    </SiteChrome>
  );
}
