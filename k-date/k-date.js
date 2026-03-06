/**
 * k-date 日期方法库
 * 提供格式化、计算、范围等日期操作，无外部依赖
 */

// ============ 静态常量 ============

/** 月份名称（完整） */
const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

/** 月份名称（简短） */
const MONTHS_SHORT = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

/** 星期名称（完整），0=周日 */
const WEEKDAYS = [
  '周日', '周一', '周二', '周三', '周四', '周五', '周六'
];

/** 星期名称（简短） */
const WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

/** 时间单位 */
const UNITS = {
  year: 'year',
  month: 'month',
  week: 'week',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second'
};

/** 相对时间文案：几秒前、几天后 等 */
const RELATIVE_LABELS = {
  past: '前',
  future: '后',
  second: '秒',
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '月',
  year: '年',
  justNow: '刚刚',
  later: '片刻后'
};

// ============ 内部工具 ============

function toDate(input) {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') return new Date(input);
  return new Date(NaN);
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

// ============ 格式化 ============

const FORMAT_TOKENS = {
  YYYY: d => d.getFullYear(),
  YY: d => String(d.getFullYear()).slice(-2),
  MM: d => pad(d.getMonth() + 1),
  M: d => d.getMonth() + 1,
  DD: d => pad(d.getDate()),
  D: d => d.getDate(),
  HH: d => pad(d.getHours()),
  H: d => d.getHours(),
  hh: d => pad(d.getHours() % 12 || 12),
  h: d => d.getHours() % 12 || 12,
  mm: d => pad(d.getMinutes()),
  m: d => d.getMinutes(),
  ss: d => pad(d.getSeconds()),
  s: d => d.getSeconds(),
  SSS: d => pad(d.getMilliseconds(), 3),
  A: d => d.getHours() < 12 ? '上午' : '下午',
  a: d => d.getHours() < 12 ? 'AM' : 'PM',
  E: d => WEEKDAYS[d.getDay()],
  e: d => WEEKDAYS_SHORT[d.getDay()],
  'MMMM': d => MONTHS[d.getMonth()],
  'MMM': d => MONTHS_SHORT[d.getMonth()]
};

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} [format='YYYY-MM-DD'] - 格式，支持 YYYY/YY MM/M DD/D HH/H hh/h mm/m ss/s SSS A/a E/e MMMM/MMM
 * @returns {string}
 */
function format(date, formatStr = 'YYYY-MM-DD') {
  const d = toDate(date);
  if (!isValidDate(d)) return '';
  let result = formatStr;
  const order = ['YYYY', 'YY', 'MMMM', 'MMM', 'MM', 'M', 'DD', 'D', 'HH', 'H', 'hh', 'h', 'mm', 'm', 'ss', 's', 'SSS', 'A', 'a', 'E', 'e'];
  for (const token of order) {
    if (result.includes(token)) {
      result = result.replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), FORMAT_TOKENS[token](d));
    }
  }
  return result;
}

/**
 * 解析字符串为日期（简单支持常见格式）
 * @param {string} str - 日期字符串
 * @param {string} [format] - 可选格式提示，不传则用 Date 原生解析
 * @returns {Date}
 */
function parse(str, format) {
  if (!str) return new Date(NaN);
  if (format) {
    const d = new Date(2000, 0, 1);
    const num = str.match(/\d+/g);
    if (!num) return new Date(str);
    let i = 0;
    const part = () => num[i++] ? parseInt(num[i - 1], 10) : 0;
    if (format.includes('YYYY')) d.setFullYear(part());
    if (format.includes('MM') || format.includes('M')) d.setMonth((part() || 1) - 1);
    if (format.includes('DD') || format.includes('D')) d.setDate(part() || 1);
    if (format.includes('HH') || format.includes('H')) d.setHours(part());
    if (format.includes('mm') || format.includes('m')) d.setMinutes(part());
    if (format.includes('ss') || format.includes('s')) d.setSeconds(part());
    return d;
  }
  return new Date(str);
}

// ============ 时间戳转化 ============

/**
 * 日期转毫秒时间戳
 * @param {Date|string|number} date - 日期
 * @returns {number} 毫秒时间戳，无效日期返回 NaN
 */
function toMillis(date) {
  const d = toDate(date);
  return isValidDate(d) ? d.getTime() : NaN;
}

/**
 * 日期转秒级时间戳（10 位整数）
 * @param {Date|string|number} date - 日期
 * @returns {number} 秒级时间戳，无效日期返回 NaN
 */
function toSeconds(date) {
  const ms = toMillis(date);
  return Number.isNaN(ms) ? NaN : Math.floor(ms / 1000);
}

/**
 * 毫秒时间戳转日期
 * @param {number} ms - 毫秒时间戳（13 位）
 * @returns {Date}
 */
function fromMillis(ms) {
  const n = Number(ms);
  return new Date(Number.isNaN(n) ? NaN : n);
}

/**
 * 秒级时间戳转日期
 * @param {number} seconds - 秒级时间戳（10 位）
 * @returns {Date}
 */
function fromSeconds(seconds) {
  const n = Number(seconds);
  return new Date(Number.isNaN(n) ? NaN : n * 1000);
}

/**
 * 时间戳转日期（自动识别秒级/毫秒级：小于 1e12 视为秒，否则视为毫秒）
 * @param {number} timestamp - 时间戳
 * @returns {Date}
 */
function fromTimestamp(timestamp) {
  const n = Number(timestamp);
  if (Number.isNaN(n)) return new Date(NaN);
  return n < 1e12 ? fromSeconds(n) : fromMillis(n);
}

// ============ 日期计算 ============

/**
 * 在日期上增加时间
 * @param {Date|string|number} date - 原日期
 * @param {number} amount - 数量（可负数）
 * @param {string} unit - 单位 year/month/week/day/hour/minute/second
 * @returns {Date} 新日期，不修改原对象
 */
function add(date, amount, unit) {
  const d = new Date(toDate(date).getTime());
  if (!isValidDate(d)) return d;
  switch (unit) {
    case UNITS.year: d.setFullYear(d.getFullYear() + amount); break;
    case UNITS.month: d.setMonth(d.getMonth() + amount); break;
    case UNITS.week: d.setDate(d.getDate() + amount * 7); break;
    case UNITS.day: d.setDate(d.getDate() + amount); break;
    case UNITS.hour: d.setHours(d.getHours() + amount); break;
    case UNITS.minute: d.setMinutes(d.getMinutes() + amount); break;
    case UNITS.second: d.setSeconds(d.getSeconds() + amount); break;
    default: d.setDate(d.getDate() + amount);
  }
  return d;
}

/**
 * 在日期上减去时间
 */
function subtract(date, amount, unit) {
  return add(date, -amount, unit);
}

/**
 * 计算两个日期的差值
 * @param {Date|string|number} date1 - 日期1
 * @param {Date|string|number} date2 - 日期2
 * @param {string} [unit='day'] - 单位
 * @returns {number}
 */
function diff(date1, date2, unit = 'day') {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!isValidDate(d1) || !isValidDate(d2)) return NaN;
  const ms = d1.getTime() - d2.getTime();
  switch (unit) {
    case UNITS.year: return Math.floor(diff(date1, date2, 'day') / 365.25);
    case UNITS.month: return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
    case UNITS.week: return Math.floor(ms / (7 * 24 * 3600 * 1000));
    case UNITS.day: return Math.floor(ms / (24 * 3600 * 1000));
    case UNITS.hour: return Math.floor(ms / (3600 * 1000));
    case UNITS.minute: return Math.floor(ms / (60 * 1000));
    case UNITS.second: return Math.floor(ms / 1000);
    default: return ms;
  }
}

/**
 * 取日期的开始（如当天 00:00:00.000）
 * @param {Date|string|number} date
 * @param {string} unit - year/month/week/day/hour/minute/second
 * @returns {Date}
 */
function startOf(date, unit) {
  const d = new Date(toDate(date).getTime());
  if (!isValidDate(d)) return d;
  switch (unit) {
    case UNITS.year: d.setMonth(0); d.setDate(1); d.setHours(0, 0, 0, 0); break;
    case UNITS.month: d.setDate(1); d.setHours(0, 0, 0, 0); break;
    case UNITS.week: {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      break;
    }
    case UNITS.day: d.setHours(0, 0, 0, 0); break;
    case UNITS.hour: d.setMinutes(0, 0, 0); break;
    case UNITS.minute: d.setSeconds(0, 0); break;
    case UNITS.second: d.setMilliseconds(0); break;
    default: d.setHours(0, 0, 0, 0);
  }
  return d;
}

/**
 * 取日期的结束（如当天 23:59:59.999）
 */
function endOf(date, unit) {
  const d = new Date(toDate(date).getTime());
  if (!isValidDate(d)) return d;
  switch (unit) {
    case UNITS.year: d.setMonth(11); d.setDate(31); d.setHours(23, 59, 59, 999); break;
    case UNITS.month: d.setMonth(d.getMonth() + 1, 0); d.setHours(23, 59, 59, 999); break;
    case UNITS.week: {
      const day = d.getDay();
      d.setDate(d.getDate() + (6 - day));
      d.setHours(23, 59, 59, 999);
      break;
    }
    case UNITS.day: d.setHours(23, 59, 59, 999); break;
    case UNITS.hour: d.setMinutes(59, 59, 999); break;
    case UNITS.minute: d.setSeconds(59, 999); break;
    case UNITS.second: d.setMilliseconds(999); break;
    default: d.setHours(23, 59, 59, 999);
  }
  return d;
}

// ============ 时间范围 ============

/**
 * 获取时间范围内的所有日期（按天）
 * @param {Date|string|number} start - 开始日期
 * @param {Date|string|number} end - 结束日期
 * @param {string} [stepUnit='day'] - 步长单位
 * @param {number} [stepAmount=1] - 步长
 * @returns {Date[]}
 */
function getRange(start, end, stepUnit = 'day', stepAmount = 1) {
  const startDate = startOf(toDate(start), 'day');
  const endDate = startOf(toDate(end), 'day');
  if (!isValidDate(startDate) || !isValidDate(endDate)) return [];
  if (startDate.getTime() > endDate.getTime()) return [];
  const list = [];
  let current = new Date(startDate.getTime());
  while (current.getTime() <= endDate.getTime()) {
    list.push(new Date(current.getTime()));
    current = add(current, stepAmount, stepUnit);
  }
  return list;
}

/**
 * 获取某月的所有日期（1 号到当月最后一天）
 * @param {Date|string|number} date - 某月任意一天
 * @returns {Date[]}
 */
function getMonthDays(date) {
  const d = toDate(date);
  if (!isValidDate(d)) return [];
  const start = startOf(d, 'month');
  const end = endOf(d, 'month');
  return getRange(start, end, 'day', 1);
}

/**
 * 获取某月日历矩阵（按周排列，含上月/下月补齐）
 * @param {Date|string|number} date
 * @param {number} [firstDayOfWeek=0] - 0=周日，1=周一
 * @returns {Date[][]} 二维数组，每行一周
 */
function getMonthCalendar(date, firstDayOfWeek = 0) {
  const d = toDate(date);
  if (!isValidDate(d)) return [];
  const monthStart = startOf(d, 'month');
  const monthEnd = endOf(d, 'month');
  let weekStart = startOf(monthStart, 'week');
  if (firstDayOfWeek === 1) {
    const day = weekStart.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    weekStart = add(weekStart, offset, 'day');
  }
  const weeks = [];
  let current = new Date(weekStart.getTime());
  const endDate = add(monthEnd, 1, 'day');
  while (current.getTime() < endDate.getTime() || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current.getTime()));
      current = add(current, 1, 'day');
    }
    weeks.push(week);
    if (current.getTime() > monthEnd.getTime() && weeks.length >= 5) break;
  }
  return weeks;
}

// ============ 比较与校验 ============

/**
 * 判断两个日期是否相同（可按单位比较）
 */
function isSame(date1, date2, unit = 'millisecond') {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!isValidDate(d1) || !isValidDate(d2)) return false;
  const s1 = startOf(d1, unit);
  const s2 = startOf(d2, unit);
  return s1.getTime() === s2.getTime();
}

/** date1 是否在 date2 之前 */
function isBefore(date1, date2) {
  return toDate(date1).getTime() < toDate(date2).getTime();
}

/** date1 是否在 date2 之后 */
function isAfter(date1, date2) {
  return toDate(date1).getTime() > toDate(date2).getTime();
}

/** 是否有效日期 */
function isValid(date) {
  return isValidDate(toDate(date));
}

/** 获取月份中文名 */
function getMonthName(monthIndex, short = false) {
  const arr = short ? MONTHS_SHORT : MONTHS;
  return arr[monthIndex] ?? '';
}

/** 获取星期中文名 */
function getWeekdayName(weekdayIndex, short = false) {
  const arr = short ? WEEKDAYS_SHORT : WEEKDAYS;
  return arr[weekdayIndex] ?? '';
}

// ============ 相对时间（几秒前、几天后） ============

/**
 * 相对时间描述：几秒前、几天前、几天后 等
 * @param {Date|string|number} date - 目标日期
 * @param {Date|string|number} [baseDate] - 基准日期，默认当前时间
 * @param {object} [labels] - 自定义文案，覆盖 RELATIVE_LABELS 中的项
 * @returns {string} 如 "3秒前"、"2天后"、"刚刚"
 */
function relativeTime(date, baseDate, labels = {}) {
  const d = toDate(date);
  const base = baseDate != null ? toDate(baseDate) : new Date();
  if (!isValidDate(d)) return '';
  const L = { ...RELATIVE_LABELS, ...labels };
  const delta = d.getTime() - base.getTime();
  const absMs = Math.abs(delta);
  const isPast = delta < 0;

  if (absMs < 1000) return isPast ? L.justNow : L.later;

  const totalSeconds = absMs / 1000;
  const totalMinutes = absMs / 60000;
  const totalHours = absMs / 3600000;
  const totalDays = absMs / 86400000;
  const totalWeeks = absMs / 604800000;
  const totalMonths = absMs / (30 * 86400000);
  const totalYears = absMs / (365 * 86400000);

  const seconds = Math.floor(totalSeconds);
  const minutes = Math.floor(totalMinutes);
  const hours = Math.floor(totalHours);
  const days = Math.floor(totalDays);
  const weeks = Math.floor(totalWeeks);
  const months = Math.floor(totalMonths);
  const years = Math.floor(totalYears);

  const suffix = isPast ? L.past : L.future;

  // 单位用 floor 判断，显示数值用 round，避免边界附近在“两天/三天”等之间来回跳
  if (years > 0) return Math.round(totalYears) + L.year + suffix;
  if (months > 0) return Math.round(totalMonths) + L.month + suffix;
  if (weeks > 0) return Math.round(totalWeeks) + L.week + suffix;
  if (days > 0) return Math.round(totalDays) + L.day + suffix;
  if (hours > 0) return Math.round(totalHours) + L.hour + suffix;
  if (minutes > 0) return Math.round(totalMinutes) + L.minute + suffix;
  return Math.round(totalSeconds) + L.second + suffix;
}

/**
 * 相对“当前时间”的简写，等同于 relativeTime(date, new Date())
 */
function fromNow(date, labels) {
  return relativeTime(date, new Date(), labels);
}

// ============ 链式 API：kDate(d) ============

/**
 * 创建日期链式包装，支持 kDate(d).format('YYYY-MM-DD') 等写法
 * @param {Date|string|number} input - 日期
 * @returns {{ format, toMillis, toSeconds, add, subtract, startOf, endOf, diff, isSame, isBefore, isAfter, relativeTime, fromNow, getMonthDays, getMonthCalendar, toDate, valueOf, isValid }}
 */
function createChain(input) {
  const d = toDate(input);

  const chain = {
    format(formatStr = 'YYYY-MM-DD') {
      return format(d, formatStr);
    },
    toMillis() {
      return toMillis(d);
    },
    toSeconds() {
      return toSeconds(d);
    },
    add(amount, unit) {
      return createChain(add(d, amount, unit));
    },
    subtract(amount, unit) {
      return createChain(subtract(d, amount, unit));
    },
    startOf(unit) {
      return createChain(startOf(d, unit));
    },
    endOf(unit) {
      return createChain(endOf(d, unit));
    },
    diff(other, unit = 'day') {
      return diff(d, other, unit);
    },
    isSame(other, unit = 'millisecond') {
      return isSame(d, other, unit);
    },
    isBefore(other) {
      return isBefore(d, other);
    },
    isAfter(other) {
      return isAfter(d, other);
    },
    relativeTime(baseDate, labels) {
      return relativeTime(d, baseDate, labels);
    },
    fromNow(labels) {
      return fromNow(d, labels);
    },
    getMonthDays() {
      return getMonthDays(d);
    },
    getMonthCalendar(firstDayOfWeek = 0) {
      return getMonthCalendar(d, firstDayOfWeek);
    },
    toDate() {
      return new Date(d.getTime());
    },
    valueOf() {
      return d.getTime();
    },
    isValid() {
      return isValidDate(d);
    }
  };

  return chain;
}

// ============ 导出：kDate 为可调用函数，并挂载所有静态方法与常量 ============

/**
 * 主入口：kDate(d) 返回链式对象，kDate.format / kDate.getRange 等为静态方法
 * @param {Date|string|number} [input] - 传入日期时返回链式对象，不传则无链式能力（仅用静态方法）
 */
function kDate(input) {
  return createChain(input);
}

kDate.MONTHS = MONTHS;
kDate.MONTHS_SHORT = MONTHS_SHORT;
kDate.WEEKDAYS = WEEKDAYS;
kDate.WEEKDAYS_SHORT = WEEKDAYS_SHORT;
kDate.UNITS = UNITS;
kDate.RELATIVE_LABELS = RELATIVE_LABELS;
kDate.format = format;
kDate.parse = parse;
kDate.toMillis = toMillis;
kDate.toSeconds = toSeconds;
kDate.fromMillis = fromMillis;
kDate.fromSeconds = fromSeconds;
kDate.fromTimestamp = fromTimestamp;
kDate.add = add;
kDate.subtract = subtract;
kDate.diff = diff;
kDate.startOf = startOf;
kDate.endOf = endOf;
kDate.getRange = getRange;
kDate.getMonthDays = getMonthDays;
kDate.getMonthCalendar = getMonthCalendar;
kDate.isSame = isSame;
kDate.isBefore = isBefore;
kDate.isAfter = isAfter;
kDate.isValid = isValid;
kDate.getMonthName = getMonthName;
kDate.getWeekdayName = getWeekdayName;
kDate.relativeTime = relativeTime;
kDate.fromNow = fromNow;
kDate.toDate = toDate;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = kDate;
}
if (typeof window !== 'undefined') {
  window.kDate = kDate;
}
