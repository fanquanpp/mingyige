import { useSyncExternalStore } from 'react';
import { DEFAULT_TRACK_ID, findTrack, flatTracks } from '../data/site-content';

/**
 * 全站唯一音乐播放器：单音频实例 + 单列表（默认曲钢琴版在最前）。
 * 首次用户手势才出声（不开自动播放，机制上杜绝多标签/多表面叠加出声）；
 * 单曲播完自动接下一首循环列表；跨标签唯一播放权（localStorage 锁+心跳）；
 * 默认曲进度记忆（刷新续播）；iOS 解锁绑定元素：切曲目换 src 即可。
 */

export type MusicStatus = 'playing' | 'paused';

export interface MusicState {
  /** 用户意图状态：playing 播放中 / paused 已暂停（保留进度） */
  status: MusicStatus;
  /** 当前曲目 id（默认曲见 data/site-content.ts 的 DEFAULT_TRACK_ID） */
  currentId: string;
  /** 自动播放被浏览器拦截，等待首次用户手势后自动响起 */
  pendingGesture: boolean;
  /** 当前播放位置（秒），随 timeupdate 更新（约 4 次/秒） */
  time: number;
  /** 当前曲目总时长（秒），元数据加载后更新 */
  duration: number;
}

/** 低频状态切片：不含 time——顶栏/列表等只关心播放态，避免每秒 4 次无谓重渲染 */
export interface MusicCore {
  status: MusicStatus;
  currentId: string;
  pendingGesture: boolean;
}

const LOCK_KEY = 'mingyige-music-lock';
const PROGRESS_KEY = 'mingyige-music-progress';
const LOCK_TTL = 2500;

const DEFAULT_TRACK = findTrack(DEFAULT_TRACK_ID) ?? flatTracks()[0];

const audio = new Audio(DEFAULT_TRACK.src);
audio.volume = 0.35;
audio.preload = 'auto';

// 开发环境暴露调试句柄（构建产物中剔除）
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__music = audio;
}

let state: MusicState = {
  status: 'paused',
  currentId: DEFAULT_TRACK.id,
  pendingGesture: false,
  time: 0,
  duration: 0
};
const listeners = new Set<() => void>();
/** 低频订阅者：只在 status/currentId/pendingGesture 变化时通知 */
const coreListeners = new Set<() => void>();
/** 低频切片快照：getMusicCore 的稳定返回值（useSyncExternalStore 缓存比较用），update 内同步刷新 */
let lastCore: MusicCore = { status: 'paused', currentId: DEFAULT_TRACK.id, pendingGesture: false };

/* ---------- localStorage 帮手：隐私模式等场景下静默降级 ---------- */

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 忽略：无存储时退化为各标签独立播放 */
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* 忽略 */
  }
}

const tabId = crypto.randomUUID();

function claimLeadership() {
  safeSet(LOCK_KEY, JSON.stringify({ tabId, at: Date.now() }));
}

function releaseLeadershipIfOwner() {
  try {
    const lock = JSON.parse(safeGet(LOCK_KEY) || 'null');
    if (lock && lock.tabId === tabId) safeRemove(LOCK_KEY);
  } catch {
    /* 忽略 */
  }
}

/** 其他标签正持有新鲜的播放权锁 */
function otherLeaderAlive(): boolean {
  const raw = safeGet(LOCK_KEY);
  if (!raw) return false;
  try {
    const lock = JSON.parse(raw);
    return !!lock && lock.tabId !== tabId && Date.now() - lock.at < LOCK_TTL;
  } catch {
    return false;
  }
}

function update(patch: Partial<MusicState>) {
  const prev = state;
  state = { ...state, ...patch };
  listeners.forEach(fn => fn());
  // 低频切片变化才通知 core 订阅者（time/duration 高频更新不走这条）；
  // lastCore 必须同步刷新——getMusicCore 返回过期快照会让 React 认为状态没变，UI 卡死
  if (
    prev.status !== state.status ||
    prev.currentId !== state.currentId ||
    prev.pendingGesture !== state.pendingGesture
  ) {
    lastCore = {
      status: state.status,
      currentId: state.currentId,
      pendingGesture: state.pendingGesture
    };
    coreListeners.forEach(fn => fn());
  }
}

/** 把用户意图落实到 <audio>（唯一改播放状态的出口） */
function apply() {
  if (state.status === 'paused') {
    if (!audio.paused) audio.pause();
    return;
  }
  if (audio.paused) {
    audio.play().catch(() => {
      // 无手势的播放被拦截：交给首次点击兜底
      update({ status: 'paused', pendingGesture: true });
      armGestureFallback();
    });
  }
}

let gestureArmed = false;
/** 浏览器拦截自动播放时：首次有效点击（「轻触共鸣」浮现后）响起。
    排除两类点击：① S p i k 跳过按钮——跳过是「我不想看动画」，不是「我要听音乐」；
    ② 开场动画未完成阶段（data-intro-ready 未置位）——此时点击不该起播。
    音乐只在真正进站（轻触共鸣/主页交互）后出现。 */
function armGestureFallback() {
  if (gestureArmed) return;
  gestureArmed = true;
  const kick = (event: PointerEvent) => {
    const target = event.target as Element | null;
    if (target && target.closest('[data-skip-btn]')) return;
    if (!document.body.hasAttribute('data-intro-ready')) return; // 动画未播完，忽略
    window.removeEventListener('pointerdown', kick);
    gestureArmed = false;
    if (state.pendingGesture) {
      update({ pendingGesture: false });
      startMusic();
    }
  };  window.addEventListener('pointerdown', kick);
}

/** 访问网站时调用：不自动出声——等首次用户手势（进站必点的「轻触共鸣」）才响起。
 *  自动播放会让每一块加载了页面的"表面"都各自起声：恢复的标签页、隐藏的预渲染面、
 *  其他浏览器窗口——用户会听到两份音乐叠加，且"打开 ZCode 就响"违背直觉；
 *  手势启动从机制上杜绝，音乐只在用户真正打开并点击网站后出现。 */
export function armMusicOnGesture() {
  if (state.status === 'playing') return;
  if (otherLeaderAlive()) return;
  update({ pendingGesture: true });
  armGestureFallback();
}

/** 用户主动开始播放：接管播放权，原标签经 storage 事件自动让位 */
export function startMusic() {
  claimLeadership();
  update({ status: 'playing' });
  apply();
}

export function pauseMusic() {
  update({ status: 'paused' });
  apply();
}

export function toggleMusic() {
  if (state.status === 'playing') pauseMusic();
  else startMusic();
}

/** 切换曲目（歌曲页点播）：换 src 即可，无需重建元素 */
export function switchTrack(id: string) {
  const track = findTrack(id);
  if (!track) return;
  claimLeadership();
  if (id === state.currentId) {
    update({ status: 'playing' });
    apply();
    return;
  }
  audio.src = track.src;
  update({ currentId: id, status: 'playing', time: 0, duration: 0 });
  apply();
}

/** 点播：未在播时直接换曲并起播（不先响旧曲一瞬，等价于 startMusic+switchTrack 的原子版） */
export function playTrack(id: string) {
  if (state.status === 'playing') {
    switchTrack(id);
    return;
  }
  const track = findTrack(id);
  if (!track) return;
  claimLeadership();
  if (id !== state.currentId) {
    audio.src = track.src;
    update({ currentId: id, time: 0, duration: 0 });
  }
  update({ status: 'playing', pendingGesture: false });
  apply();
}

/** 拖动进度条：跳到指定位置（秒） */
export function seekTo(seconds: number) {
  try {
    audio.currentTime = seconds;
    update({ time: seconds });
  } catch {
    /* 元数据未就绪时忽略 */
  }
}

/** 上一首 / 下一首（循环列表）；dir=-1 上一首 */
export function stepTrack(dir: -1 | 1) {
  const list = flatTracks();
  const index = list.findIndex(track => track.id === state.currentId);
  const next = list[(index + dir + list.length) % list.length];
  switchTrack(next.id);
}

export function subscribeMusic(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getMusicState(): MusicState {
  return state;
}

/** React 侧订阅播放器状态（高频：time/duration 也更新，播放器面板用） */
export function useMusic(): MusicState {
  return useSyncExternalStore(subscribeMusic, getMusicState);
}

function subscribeMusicCore(fn: () => void) {
  coreListeners.add(fn);
  return () => {
    coreListeners.delete(fn);
  };
}

function getMusicCore(): MusicCore {
  return lastCore;
}

/** React 侧订阅低频状态切片（不含 time/duration：顶栏、歌曲列表等用） */
export function useMusicCore(): MusicCore {
  return useSyncExternalStore(subscribeMusicCore, getMusicCore);
}

/* ---------- 跨标签页协调、连播与进度记忆（模块级，随页面加载执行一次） ---------- */

// 播放位置与时长：给进度条/歌词同步用（timeupdate 约 4 次/秒）
audio.addEventListener('timeupdate', () => {
  update({ time: audio.currentTime });
});
audio.addEventListener('durationchange', () => {
  update({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
});

// 单曲播完自动接下一首，循环整个列表
audio.addEventListener('ended', () => {
  const list = flatTracks();
  const index = list.findIndex(track => track.id === state.currentId);
  const next = list[(index + 1) % list.length];
  audio.src = next.src;
  update({ currentId: next.id, time: 0, duration: 0 });
  apply();
});

// 加载失败：回到已暂停，避免界面卡在「播放中」
audio.addEventListener('error', () => {
  update({ status: 'paused' });
});

// 心跳：持有播放权时定期续锁，并保存默认曲的进度
setInterval(() => {
  if (state.status === 'playing' && !audio.paused) {
    claimLeadership();
    if (state.currentId === DEFAULT_TRACK.id) {
      safeSet(PROGRESS_KEY, JSON.stringify({ id: DEFAULT_TRACK.id, time: audio.currentTime }));
    }
  }
}, 2000);

// 其他标签接管播放权：本标签立刻让位（状态转已暂停，UI 同步）
window.addEventListener('storage', event => {
  if (event.key !== LOCK_KEY || !event.newValue || state.status === 'paused') return;
  try {
    const lock = JSON.parse(event.newValue);
    if (lock && lock.tabId !== tabId) {
      update({ status: 'paused' });
      apply();
    }
  } catch {
    /* 忽略 */
  }
});

// 离开页面：保存进度并归还播放权。
// 进度记忆只针对默认曲——播的是其他曲目时不覆盖，避免下次进站恢复到错误位置
window.addEventListener('pagehide', () => {
  if (!audio.paused && state.currentId === DEFAULT_TRACK.id) {
    safeSet(
      PROGRESS_KEY,
      JSON.stringify({ id: state.currentId, time: audio.currentTime })
    );
  }
  releaseLeadershipIfOwner();
});

// 进度恢复：仅默认曲（进站总是从默认曲开始），刷新后从上次位置继续
try {
  const saved = JSON.parse(safeGet(PROGRESS_KEY) || 'null');
  if (saved && saved.id === DEFAULT_TRACK.id && saved.time > 0) {
    audio.addEventListener(
      'loadedmetadata',
      () => {
        try {
          if (audio.duration && saved.time < audio.duration) {
            audio.currentTime = saved.time;
          }
        } catch {
          /* 忽略 */
        }
      },
      { once: true }
    );
  }
} catch {
  /* 忽略 */
}
