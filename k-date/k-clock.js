/**
 * k-clock 时钟/倒计时方法库
 * 支持倒计时、暂停、开始、停止、重置与获取倒计时模块（天/时/分/秒）
 */

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** 状态 */
const ClockState = {
  idle: 'idle',     // 未开始/已停止
  running: 'running',
  paused: 'paused'
};

/**
 * 将剩余毫秒数拆分为 天/时/分/秒 模块（用于显示）
 * @param {number} ms - 剩余毫秒数（≥0）
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, totalSeconds: number, ms: number }}
 */
function getCountdownModules(ms) {
  const total = Math.max(0, Math.floor(ms));
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MIN);
  const seconds = Math.floor((total % MIN) / SEC);
  const totalSeconds = Math.floor(total / SEC);
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    ms: total
  };
}

/**
 * 创建倒计时实例
 * @param {object} options
 * @param {number} [options.seconds] - 倒计时总秒数（与 endTime 二选一）
 * @param {Date|number} [options.endTime] - 结束时间（Date 或时间戳），倒计时到该时刻
 * @param {function} [options.onTick] - 每秒回调 (modules) => {}
 * @param {function} [options.onEnd] - 结束时回调 () => {}
 * @returns {Countdown}
 */
function createCountdown(options = {}) {
  const {
    seconds: initialSeconds = 0,
    endTime,
    onTick,
    onEnd
  } = typeof options === 'number' ? { seconds: options } : options;

  let state = ClockState.idle;
  let remainingMs = 0;
  let endAt = null;        // 若用 endTime，记录目标时间戳
  let timerId = null;
  let lastTickAt = 0;

  function getRemainingMs() {
    if (endAt != null) return Math.max(0, endAt - Date.now());
    return remainingMs;
  }

  function tick() {
    const now = Date.now();
    const rem = getRemainingMs();
    if (rem <= 0) {
      stop();
      state = ClockState.idle;
      if (typeof onEnd === 'function') onEnd();
      return;
    }
    const modules = getCountdownModules(rem);
    if (typeof onTick === 'function') onTick(modules);
    lastTickAt = now;
    const delay = Math.min(SEC, rem % SEC || SEC);
    timerId = setTimeout(tick, delay);
  }

  function start() {
    if (state === ClockState.running) return;
    if (endTime != null) {
      const t = endTime instanceof Date ? endTime.getTime() : Number(endTime);
      if (!Number.isFinite(t) || t <= Date.now()) {
        if (typeof onEnd === 'function') onEnd();
        return;
      }
      endAt = t;
    } else if (state === ClockState.idle) {
      remainingMs = Math.max(0, Math.floor(Number(initialSeconds) * SEC));
      if (remainingMs <= 0) {
        if (typeof onEnd === 'function') onEnd();
        return;
      }
    }
    state = ClockState.running;
    tick();
  }

  function pause() {
    if (state !== ClockState.running) return;
    state = ClockState.paused;
    if (timerId != null) {
      clearTimeout(timerId);
      timerId = null;
    }
    remainingMs = getRemainingMs();
    if (endAt != null) endAt = null;
  }

  function stop() {
    state = ClockState.idle;
    if (timerId != null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (endAt != null) endAt = null;
    remainingMs = 0;
  }

  function reset(secondsOrOptions) {
    const wasRunning = state === ClockState.running;
    stop();
    if (secondsOrOptions === undefined) {
      remainingMs = Math.max(0, Math.floor(Number(initialSeconds) * SEC));
      endAt = endTime != null ? (endTime instanceof Date ? endTime.getTime() : Number(endTime)) : null;
    } else if (typeof secondsOrOptions === 'number') {
      remainingMs = Math.max(0, Math.floor(secondsOrOptions * SEC));
      endAt = null;
    } else {
      const opts = secondsOrOptions;
      if (opts.endTime != null) {
        endAt = opts.endTime instanceof Date ? opts.endTime.getTime() : Number(opts.endTime);
        remainingMs = 0;
      } else {
        remainingMs = Math.max(0, Math.floor(Number(opts.seconds ?? 0) * SEC));
        endAt = null;
      }
    }
    if (wasRunning) start();
  }

  /**
   * 获取当前倒计时模块（天/时/分/秒等），不启动计时器
   */
  function get() {
    return getCountdownModules(getRemainingMs());
  }

  return {
    get state() { return state; },
    start,
    pause,
    stop,
    reset,
    get,
    /** 是否在运行 */
    get running() { return state === ClockState.running; },
    /** 是否已暂停 */
    get paused() { return state === ClockState.paused; }
  };
}

// ============ 导出 ============

const kClock = {
  ClockState,
  SEC,
  MIN,
  HOUR,
  DAY,
  getCountdownModules,
  createCountdown
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = kClock;
}
if (typeof window !== 'undefined') {
  window.kClock = kClock;
}
