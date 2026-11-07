/** 音乐专辑列表与图集素材。音源为已购四张官方专辑（客户端下载，无损优先）；歌词在 public/lyrics/<trackId>.json；MV 仅暂存未使用。图集说明只写画面可验证内容。 */

export interface MusicTrack {
  id: string;
  title: string;
  src: string;
  /** 同步歌词地址（无则纯音乐） */
  lyric?: string | null;
}

export interface AlbumSection {
  key: string;
  title: string;
  year: string;
  /** 专辑定位（来自官方发行信息） */
  subtitle: string;
  cover: string;
  tracks: MusicTrack[];
}

/** 进站自动播放的默认曲（钢琴版，见 src/audio/music.ts） */
export const DEFAULT_TRACK_ID = 'wan-fen-zhi-de-guang-piano';

export const PIANO_TRACK: MusicTrack = {
  id: DEFAULT_TRACK_ID,
  title: '万分之一的光（钢琴版）',
  src: 'audio/bgm-ten-thousandth-of-light.mp3'
};

/** 已购专辑（按发行时间排序） */
export const ALBUMS: AlbumSection[] = [
  {
    key: 'yiruchujian',
    title: '依如初见',
    year: '2022',
    subtitle: '十周年纪念专辑',
    cover: 'images/albums/yiruchujian.jpg',
    tracks: [
      { id: 'yiruchujian-01', title: '心印', src: 'audio/albums/yiruchujian/yiruchujian-01.flac', lyric: 'lyrics/yiruchujian-01.json' },
      { id: 'yiruchujian-02', title: '66CCFF', src: 'audio/albums/yiruchujian/yiruchujian-02.flac', lyric: 'lyrics/yiruchujian-02.json' },
      { id: 'yiruchujian-03', title: '万分之一的光', src: 'audio/albums/yiruchujian/yiruchujian-03.flac', lyric: 'lyrics/yiruchujian-03.json' },
      { id: 'yiruchujian-04', title: '纯蓝', src: 'audio/albums/yiruchujian/yiruchujian-04.mp3', lyric: 'lyrics/yiruchujian-04.json' },
      { id: 'yiruchujian-05', title: '一半一半', src: 'audio/albums/yiruchujian/yiruchujian-05.mp3', lyric: 'lyrics/yiruchujian-05.json' },
      { id: 'yiruchujian-06', title: 'I LOVE U', src: 'audio/albums/yiruchujian/yiruchujian-06.flac', lyric: 'lyrics/yiruchujian-06.json' },
      { id: 'yiruchujian-07', title: '夏虫', src: 'audio/albums/yiruchujian/yiruchujian-07.mp3', lyric: 'lyrics/yiruchujian-07.json' },
      { id: 'yiruchujian-08', title: '一花依世界', src: 'audio/albums/yiruchujian/yiruchujian-08.flac', lyric: 'lyrics/yiruchujian-08.json' },
      { id: 'yiruchujian-09', title: '光与影的对白', src: 'audio/albums/yiruchujian/yiruchujian-09.mp3', lyric: 'lyrics/yiruchujian-09.json' },
      { id: 'yiruchujian-10', title: '为了你唱下去', src: 'audio/albums/yiruchujian/yiruchujian-10.mp3', lyric: 'lyrics/yiruchujian-10.json' }
    ]
  },
  {
    key: 'wujinlan',
    title: '无尽蓝',
    year: '2022',
    subtitle: '十周年纪念专辑 · 首张 ACE AI 声库',
    cover: 'images/albums/wujinlan.jpg',
    tracks: [
      { id: 'wujinlan-01', title: '热带夜', src: 'audio/albums/wujinlan/wujinlan-01.flac', lyric: 'lyrics/wujinlan-01.json' },
      { id: 'wujinlan-02', title: '万能处方', src: 'audio/albums/wujinlan/wujinlan-02.flac', lyric: 'lyrics/wujinlan-02.json' },
      { id: 'wujinlan-03', title: '免费主义', src: 'audio/albums/wujinlan/wujinlan-03.flac', lyric: 'lyrics/wujinlan-03.json' },
      { id: 'wujinlan-04', title: '晚安糖果罐', src: 'audio/albums/wujinlan/wujinlan-04.flac', lyric: 'lyrics/wujinlan-04.json' },
      { id: 'wujinlan-05', title: '恋爱色魔法', src: 'audio/albums/wujinlan/wujinlan-05.flac', lyric: 'lyrics/wujinlan-05.json' },
      { id: 'wujinlan-06', title: '怪诞集会', src: 'audio/albums/wujinlan/wujinlan-06.flac', lyric: 'lyrics/wujinlan-06.json' },
      { id: 'wujinlan-07', title: '视线网', src: 'audio/albums/wujinlan/wujinlan-07.flac', lyric: 'lyrics/wujinlan-07.json' },
      { id: 'wujinlan-08', title: '喃木诺娜', src: 'audio/albums/wujinlan/wujinlan-08.mp3', lyric: 'lyrics/wujinlan-08.json' },
      { id: 'wujinlan-09', title: '回调电子万年历可以前往千禧年吗', src: 'audio/albums/wujinlan/wujinlan-09.flac', lyric: 'lyrics/wujinlan-09.json' },
      { id: 'wujinlan-10', title: '昨日之声', src: 'audio/albums/wujinlan/wujinlan-10.flac', lyric: 'lyrics/wujinlan-10.json' }
    ]
  },
  {
    key: 'zaisheng',
    title: '再生',
    year: '2024',
    subtitle: '十二周年纪念专辑',
    cover: 'images/albums/zaisheng.jpg',
    tracks: [
      { id: 'zaisheng-01', title: '再声 Recall', src: 'audio/albums/zaisheng/zaisheng-01.flac', lyric: 'lyrics/zaisheng-01.json' },
      { id: 'zaisheng-02', title: '蝴蝶', src: 'audio/albums/zaisheng/zaisheng-02.mp3', lyric: 'lyrics/zaisheng-02.json' },
      { id: 'zaisheng-03', title: '嘘八百', src: 'audio/albums/zaisheng/zaisheng-03.mp3', lyric: 'lyrics/zaisheng-03.json' },
      { id: 'zaisheng-04', title: '心空 feat. HYPER SLASH超级斩', src: 'audio/albums/zaisheng/zaisheng-04.mp3', lyric: 'lyrics/zaisheng-04.json' },
      { id: 'zaisheng-05', title: '歪歪？ feat. Chinese Football', src: 'audio/albums/zaisheng/zaisheng-05.mp3', lyric: 'lyrics/zaisheng-05.json' },
      { id: 'zaisheng-06', title: '心里有鬼 feat. 绿流海GreenBang', src: 'audio/albums/zaisheng/zaisheng-06.mp3', lyric: 'lyrics/zaisheng-06.json' },
      { id: 'zaisheng-07', title: '化作繁星', src: 'audio/albums/zaisheng/zaisheng-07.mp3', lyric: 'lyrics/zaisheng-07.json' },
      { id: 'zaisheng-08', title: '世末积雨云 feat. 鬼否', src: 'audio/albums/zaisheng/zaisheng-08.flac', lyric: 'lyrics/zaisheng-08.json' },
      { id: 'zaisheng-09', title: '三月雨', src: 'audio/albums/zaisheng/zaisheng-09.flac', lyric: 'lyrics/zaisheng-09.json' },
      { id: 'zaisheng-10', title: 'Aloud', src: 'audio/albums/zaisheng/zaisheng-10.mp3', lyric: 'lyrics/zaisheng-10.json' },
      { id: 'zaisheng-11', title: '春日平行线', src: 'audio/albums/zaisheng/zaisheng-11.mp3', lyric: 'lyrics/zaisheng-11.json' },
      { id: 'zaisheng-12', title: '最完美的夏天', src: 'audio/albums/zaisheng/zaisheng-12.flac', lyric: 'lyrics/zaisheng-12.json' }
    ]
  },
  {
    key: 'sichongzou',
    title: '四重奏',
    year: '2026',
    subtitle: '十四周年纪念专辑 · 一体四面',
    cover: 'images/albums/sichongzou.jpg',
    tracks: [
      { id: 'sichongzou-01', title: '心音', src: 'audio/albums/sichongzou/sichongzou-01.mp3', lyric: 'lyrics/sichongzou-01.json' },
      { id: 'sichongzou-02', title: '风之子', src: 'audio/albums/sichongzou/sichongzou-02.mp3', lyric: 'lyrics/sichongzou-02.json' },
      { id: 'sichongzou-03', title: '绝体绝命', src: 'audio/albums/sichongzou/sichongzou-03.mp3', lyric: 'lyrics/sichongzou-03.json' },
      { id: 'sichongzou-04', title: '猫耳クラッシャー', src: 'audio/albums/sichongzou/sichongzou-04.mp3', lyric: 'lyrics/sichongzou-04.json' },
      { id: 'sichongzou-05', title: '越冰船', src: 'audio/albums/sichongzou/sichongzou-05.mp3', lyric: 'lyrics/sichongzou-05.json' },
      { id: 'sichongzou-06', title: '棱镜', src: 'audio/albums/sichongzou/sichongzou-06.mp3', lyric: 'lyrics/sichongzou-06.json' },
      { id: 'sichongzou-07', title: '风吹过', src: 'audio/albums/sichongzou/sichongzou-07.mp3', lyric: 'lyrics/sichongzou-07.json' },
      { id: 'sichongzou-08', title: '唱给雅音宫羽', src: 'audio/albums/sichongzou/sichongzou-08.mp3', lyric: 'lyrics/sichongzou-08.json' },
      { id: 'sichongzou-09', title: '无参数', src: 'audio/albums/sichongzou/sichongzou-09.mp3', lyric: 'lyrics/sichongzou-09.json' },
      { id: 'sichongzou-10', title: '地府美食家', src: 'audio/albums/sichongzou/sichongzou-10.mp3', lyric: 'lyrics/sichongzou-10.json' },
      { id: 'sichongzou-11', title: 'Monologue', src: 'audio/albums/sichongzou/sichongzou-11.mp3', lyric: 'lyrics/sichongzou-11.json' },
      { id: 'sichongzou-12', title: '异样的风暴中心 feat.电气樱桃', src: 'audio/albums/sichongzou/sichongzou-12.mp3', lyric: 'lyrics/sichongzou-12.json' }
    ]
  },
  {
    key: 'lostintianyi',
    title: 'Lost In Tianyi',
    year: '2018',
    subtitle: '2018 官方专辑 · 九曲全员阵容',
    cover: 'images/albums/lostintianyi.jpg',
    tracks: [
      { id: 'lostintianyi-01', title: '8102', src: 'audio/albums/lostintianyi/lostintianyi-01.mp3', lyric: 'lyrics/lostintianyi-01.json' },
      { id: 'lostintianyi-02', title: '哒哒哒', src: 'audio/albums/lostintianyi/lostintianyi-02.mp3', lyric: 'lyrics/lostintianyi-02.json' },
      { id: 'lostintianyi-03', title: '最大化', src: 'audio/albums/lostintianyi/lostintianyi-03.mp3', lyric: 'lyrics/lostintianyi-03.json' },
      { id: 'lostintianyi-04', title: '风兮风兮', src: 'audio/albums/lostintianyi/lostintianyi-04.mp3', lyric: 'lyrics/lostintianyi-04.json' },
      { id: 'lostintianyi-05', title: '斯芬克斯的谜底', src: 'audio/albums/lostintianyi/lostintianyi-05.mp3', lyric: 'lyrics/lostintianyi-05.json' },
      { id: 'lostintianyi-06', title: '笔记本上的幻想世界', src: 'audio/albums/lostintianyi/lostintianyi-06.mp3', lyric: 'lyrics/lostintianyi-06.json' },
      { id: 'lostintianyi-07', title: '斯人', src: 'audio/albums/lostintianyi/lostintianyi-07.mp3', lyric: 'lyrics/lostintianyi-07.json' },
      { id: 'lostintianyi-08', title: '嘘つきは恋のはじまり', src: 'audio/albums/lostintianyi/lostintianyi-08.mp3', lyric: 'lyrics/lostintianyi-08.json' },
      { id: 'lostintianyi-09', title: 'Monologue', src: 'audio/albums/lostintianyi/lostintianyi-09.mp3', lyric: 'lyrics/lostintianyi-09.json' }
    ]
  }
];

/** 全站播放顺序：默认曲在最前，随后按专辑曲目（数据静态，缓存结果避免每次重建数组） */
let flatCache: MusicTrack[] | null = null;

export function flatTracks(): MusicTrack[] {
  if (!flatCache) flatCache = [PIANO_TRACK, ...ALBUMS.flatMap(album => album.tracks)];
  return flatCache;
}

export function findTrack(id: string): MusicTrack | null {
  return flatTracks().find(track => track.id === id) ?? null;
}

/** 展示用曲名：截掉「 feat. …」合作者标注（含全半角点变体），只留主名 */
export function trackDisplayName(title: string): string {
  return title.replace(/\s*[fF]eat[.．]?.*$/u, '').trim();
}

export interface GalleryItem {
  src: string;
  title: string;
  note: string;
  /** 分组：插画 / 官方物料 / 品牌标识 */
  category: string;
}

export const GALLERY: GalleryItem[] = [
  { src: 'images/gallery/luotianyi-illus-wide.jpg', title: '洛天依插画（横版）', note: '白裙 · 水晶琴键', category: '插画' },
  { src: 'images/gallery/luotianyi-illus-tall.jpg', title: '洛天依插画（竖版）', note: '上一幅的竖构图', category: '插画' },
  { src: 'images/gallery/luotianyi-group-water.jpg', title: '洛天依群像', note: '荷塘水波 · 夏日', category: '插画' },
  { src: 'images/gallery/vsinger-group-art.webp', title: 'VOCALOID CHINA PROJECT', note: '官方插画 · illust ideolo@NEKO WORKI', category: '官方物料' },
  { src: 'images/gallery/project-poster.webp', title: '洛天依立绘', note: '透明底素材', category: '官方物料' },
  { src: 'images/brand/site-seal.png', title: '洛天依圆标', note: '站章', category: '品牌标识' }
];
