# k-date

日期与时钟方法库，无依赖。包含日期格式化/计算/范围/时间戳/相对时间，以及倒计时（开始、暂停、停止、重置、获取模块）。

## 安装

```bash
npm i @ruoguo/k-date
```

## 使用

```js
const { kDate, kClock } = require('k-date');

// 链式 API：kDate(d) 返回链式对象，所有方法和常量在 kDate 上
kDate(new Date()).format('YYYY-MM-DD HH:mm');
kDate(new Date()).subtract(2, 'day').fromNow();  // "2天前"
kDate('2025-03-01').add(1, 'month').format('YYYY-MM-DD');

// 静态方法与常量
kDate.format(new Date(), 'YYYY-MM-DD');
kDate.getRange(start, end);
kDate.MONTHS;  // 月份名等常量

// 倒计时
const clock = kClock.createCountdown({ seconds: 60, onTick: m => console.log(m) });
clock.start();
clock.pause();
clock.get();  // { days, hours, minutes, seconds, ... }
```

## 按需引入

```js
const kDate = require('k-date/k-date');
const kClock = require('k-date/k-clock');
```

## 文档

- [k-date 日期库 API](k-date.md)
- [k-clock 时钟/倒计时 API](k-clock.md)

## License

ISC
