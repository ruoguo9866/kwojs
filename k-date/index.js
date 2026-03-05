/**
 * k-date 统一入口
 * 日期库 + 时钟/倒计时库。kDate(d) 链式调用，kDate.format / kDate.getRange 等静态方法
 */
const kDate = require('./k-date.js');
const kClock = require('./k-clock.js');

module.exports = {
  kDate,
  kClock
};
