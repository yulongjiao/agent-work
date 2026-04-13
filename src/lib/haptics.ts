/**
 * 触感反馈 + 音效工具
 * 使用 Web Vibration API 和 Web Audio API
 */

// ── 触感反馈 ──

const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

/** 轻触 — 按钮点击 */
export const tapHaptic = () => {
  if (canVibrate()) navigator.vibrate(8);
};

/** 中等触感 — 确认操作 */
export const confirmHaptic = () => {
  if (canVibrate()) navigator.vibrate(15);
};

/** 成功触感 — 完成操作 */
export const successHaptic = () => {
  if (canVibrate()) navigator.vibrate([10, 50, 15]);
};

/** 重触感 — 关键动作（如长按启动） */
export const heavyHaptic = () => {
  if (canVibrate()) navigator.vibrate([20, 30, 20]);
};

/** 渐进触感 — 长按进度中每 20% 触发一次 */
export const progressHaptic = (progress: number) => {
  if (!canVibrate()) return;
  if (progress % 20 < 2) navigator.vibrate(Math.min(5 + progress / 10, 15));
};

// ── 音效（Web Audio API 合成，无需加载文件） ──

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
};

const playTone = (freq: number, duration: number, type: OscillatorType = "sine", vol = 0.12) => {
  const ctx = getCtx();
  if (!ctx) return;
  // 恢复被暂停的上下文
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

/** 轻点音 — 微弱的高频 tick */
export const tapSound = () => playTone(1200, 0.06, "sine", 0.06);

/** 确认音 — 清脆的双音 */
export const confirmSound = () => {
  playTone(880, 0.1, "sine", 0.08);
  setTimeout(() => playTone(1100, 0.1, "sine", 0.08), 80);
};

/** 成功音 — 上行三连音 */
export const successSound = () => {
  playTone(660, 0.12, "sine", 0.1);
  setTimeout(() => playTone(880, 0.12, "sine", 0.1), 100);
  setTimeout(() => playTone(1100, 0.15, "sine", 0.1), 200);
};

/** 启动音 — 低沉的渐强嗡鸣 + 高频完成音 */
export const launchSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  // 低频渐强
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
  // 完成高音
  setTimeout(() => {
    playTone(880, 0.15, "sine", 0.12);
    setTimeout(() => playTone(1320, 0.2, "sine", 0.1), 120);
  }, 350);
};

// ── 组合：触感 + 音效 ──

/** 轻按反馈 */
export const tap = () => { tapHaptic(); tapSound(); };

/** 确认反馈 */
export const confirm = () => { confirmHaptic(); confirmSound(); };

/** 成功反馈 */
export const success = () => { successHaptic(); successSound(); };

/** 启动反馈 */
export const launch = () => { heavyHaptic(); launchSound(); };
