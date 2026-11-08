import type { ReactNode } from 'react';
import BrandLogo from '../brand/BrandLogo';
import styles from './Nav.module.css';

/**
 * 顶部导航栏：左上角「鸣依阁」logo + 主功能菜单（可选）+ 右侧功能位。
 * 开场动画：功能位放 skip 跳过；主页：功能位放 BGM 控制、菜单放主功能入口；
 * 传入 onLogoSparkClick 时，logo 星芒变为侧边栏开关。
 * 整条导航不拦截页面点击，仅菜单与功能位可交互。
 */
export default function Nav({
  children,
  menuItems,
  activeIndex = -1,
  onLogoSparkClick,
  sparkExpanded,
}: {
  children?: ReactNode;
  menuItems?: string[];
  activeIndex?: number;
  onLogoSparkClick?: () => void;
  sparkExpanded?: boolean;
}) {
  return (
    <nav className={styles.nav}>
      <BrandLogo onSparkClick={onLogoSparkClick} sparkExpanded={sparkExpanded} />
      {menuItems && menuItems.length > 0 ? (
        <div className={styles.menu}>
          {menuItems.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`${styles.menuLink} ${index === activeIndex ? styles.menuOn : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.slot}>{children}</div>
    </nav>
  );
}
