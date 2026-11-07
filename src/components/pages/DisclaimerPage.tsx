import SiteChrome from '../site/SiteChrome';
import styles from './DisclaimerPage.module.css';

/**
 * 免责声明页（#disclaimer）：站点性质、素材版权、免责范围。
 * 参考源 docs/DISCLAIMER.md，两者内容保持一致。
 */
export default function DisclaimerPage() {
  return (
    <SiteChrome view="disclaimer">
      <section className={styles.header}>
        <h1 className={styles.title}>免责声明</h1>
        <p className={styles.updated}>最后更新 · 2026-11-07</p>
      </section>

      <div className={styles.body}>
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>站点性质</h2>
          <p className={styles.text}>
            「鸣依阁」是个人性质的粉丝向展示页面，为表达对虚拟歌手洛天依的喜爱而建立。
            本站非官方，与上海禾念信息科技有限公司（Vsinger）及其官方团队无任何隶属或合作关系。
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>素材版权</h2>
          <p className={styles.text}>
            本站不存储、不分发任何用于盈利的盗版资源；页面所引用的音乐、图片素材版权归原权利方（Vsinger、各词曲作者／创作者）所有。
          </p>
          <p className={styles.text}>
            音乐音源来自站长已合法购买的官方专辑（依如初见、无尽蓝、再生、四重奏、Lost In Tianyi），仅作个人欣赏性质的播放展示，不提供下载功能。
          </p>
          <p className={styles.text}>
            页面使用的插画、形象、Logo 等素材版权归原作者所有；若权利方认为展示不当，可通过仓库
            <a
              className={styles.link}
              href="https://github.com/fanquanpp/mingyige/issues"
              target="_blank"
              rel="noreferrer"
            >
              Issue
            </a>
            联系，将在确认后立即移除。
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>内容声明</h2>
          <p className={styles.text}>
            本站内容仅代表站长个人立场，不代表洛天依官方、Vsinger 或任何社团组织的观点。站内歌词、说明文字仅作展示用途，如有错漏欢迎指出。
          </p>
          <p className={styles.text}>
            「洛天依」「Vsinger」及相关名称的权利归其合法持有者所有；本站对其的使用属于合理的粉丝致敬范畴。
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>免责范围</h2>
          <p className={styles.text}>
            本站为静态免费站点，不承诺服务可用性；因托管服务变更、素材下架等导致的内容缺失不做另行通知。访问本站即视为已知悉并同意上述条款。
          </p>
        </section>
      </div>
    </SiteChrome>
  );
}
