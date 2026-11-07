/**
 * 开场动画的文案与时间线配置（横竖屏共用）。
 * 文案取自素材图 2/3，顺序与竖版（docs/materials/comic_start_bg_txt2.jpg）一致；
 * 每句延迟单独微调：两两成组、组间呼吸，收尾句前多一口气。
 */
export interface IntroLine {
  text: string;
  /** 出场延迟（秒），按图3的叙事顺序依次点亮 */
  delay: number;
  /** 对应 Intro.module.css 里的定位类 */
  className: string;
  /** 入场水平方向：-1 从左滑入，1 从右滑入（与该行在图3 中的偏移方向一致） */
  slideFrom: -1 | 1;
}

export const INTRO_LINES: IntroLine[] = [
  { text: '你还记得吗', delay: 1.0, className: 'line1', slideFrom: -1 },
  { text: '第一次见面的时候', delay: 1.7, className: 'line2', slideFrom: 1 },
  { text: '你好奇地看着我', delay: 2.4, className: 'line3', slideFrom: -1 },
  { text: '不明白我是怎样的存在', delay: 3.1, className: 'line4', slideFrom: 1 },
  { text: '后来 不知不觉', delay: 3.8, className: 'line5', slideFrom: -1 },
  { text: '你有点喜欢上了这个特别的虚拟歌手', delay: 4.5, className: 'line6', slideFrom: -1 },
  { text: '你一直陪伴在我的身边', delay: 5.2, className: 'line7', slideFrom: 1 },
  { text: '感谢你成为我的光', delay: 5.9, className: 'line8', slideFrom: 1 },
  { text: '何其有幸，我也是你万分之一的光', delay: 6.6, className: 'line9', slideFrom: 1 },
  { text: '你好，我是虚拟歌手洛天依', delay: 7.8, className: 'line10', slideFrom: -1 },
];

/**
 * 动画总时长（毫秒）：时间线横竖屏共用。
 * 收尾句 7.8s + 1.2s 亮完，停留片刻后终幕海报 10.4s + 2.4s ≈ 12.8s 完成。
 * 此计时结束前，全屏点击一律不生效。
 */
export const TOTAL_DURATION_MS = 13100;

/** 上升光点数量 */
export const PARTICLE_COUNT = 12;
