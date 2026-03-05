# k-date 日期方法库

提供格式化、计算、范围、时间戳、相对时间等日期操作，无外部依赖。支持 CommonJS 与浏览器环境。

---

## 引入

```js
// Node / CommonJS
const { kDate, kClock } = require('k-date');
// 或仅日期库
const kDate = require('./k-date.js');

// 浏览器
// <script src="k-date.js"></script>
// 使用 window.kDate
```

**用法**：`kDate(d)` 返回链式对象；`kDate.format`、`kDate.getRange`、`kDate.MONTHS` 等为静态方法与常量，直接挂在 `kDate` 上。

---

## 链式 API：kDate(d)

推荐用法：先传入日期得到链式对象，再调用方法。链式方法（如 `add`、`subtract`、`startOf`、`endOf`）返回新链，可继续链式调用。

```js
kDate(new Date()).format('YYYY-MM-DD');                    // "2025-03-05"
kDate('2025-03-01').add(1, 'month').format('YYYY-MM-DD'); // "2025-04-01"
kDate(new Date()).startOf('month').format('YYYY-MM-DD');  // 当月 1 号
kDate(new Date()).subtract(2, 'day').fromNow();           // "2天前"
```

**链式对象方法一览**

| 方法 | 说明 | 返回 |
|------|------|------|
| **format(formatStr?)** | 格式化，默认 `'YYYY-MM-DD'` | `string` |
| **toMillis()** / **toSeconds()** | 时间戳 | `number` |
| **add(amount, unit)** / **subtract(amount, unit)** | 加减时间 | 新链 |
| **startOf(unit)** / **endOf(unit)** | 取单位起止 | 新链 |
| **diff(other, unit?)** | 与另一日期差值 | `number` |
| **isSame(other, unit?)** / **isBefore(other)** / **isAfter(other)** | 比较 | `boolean` |
| **relativeTime(baseDate?, labels?)** / **fromNow(labels?)** | 相对时间文案 | `string` |
| **getMonthDays()** / **getMonthCalendar(firstDayOfWeek?)** | 月内日期 / 月历矩阵 | `Date[]` / `Date[][]` |
| **toDate()** / **valueOf()** | 得到原生 Date / 时间戳 | `Date` / `number` |
| **isValid()** | 是否有效日期 | `boolean` |

---

## 静态常量

| 名称 | 说明 |
|------|------|
| **MONTHS** | 月份名称（完整）`["一月", "二月", …, "十二月"]` |
| **MONTHS_SHORT** | 月份名称（简短）`["1月", "2月", …, "12月"]` |
| **WEEKDAYS** | 星期名称（完整）`["周日", "周一", …, "周六"]`，0=周日 |
| **WEEKDAYS_SHORT** | 星期名称（简短）`["日", "一", …, "六"]` |
| **UNITS** | 时间单位 `{ year, month, week, day, hour, minute, second }` |
| **RELATIVE_LABELS** | 相对时间文案（几秒前/后等）可自定义 |

---

## 格式化与解析

### format(date, formatStr?)

格式化日期为字符串。

- **date**：`Date | string | number`
- **formatStr**：默认 `'YYYY-MM-DD'`
- **返回**：`string`，无效日期返回 `''`

**格式符**：`YYYY`/`YY` 年、`MM`/`M` 月、`DD`/`D` 日、`HH`/`H` 时、`mm`/`m` 分、`ss`/`s` 秒、`SSS` 毫秒、`A`/`a` 上午下午、`E`/`e` 星期、`MMMM`/`MMM` 月份中文。

```js
kDate(new Date()).format('YYYY-MM-DD HH:mm:ss');  // "2025-03-04 14:30:00"
kDate(new Date()).format('MMMM E');                // "三月 周二"
// 静态写法
kDate.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
```

### parse(str, format?)

将字符串解析为 `Date`。不传 `format` 时使用原生 `new Date(str)`。

- **str**：日期字符串
- **format**：可选，如 `'YYYY-MM-DD'`、`'YYYY-MM-DD HH:mm'`
- **返回**：`Date`

---

## 时间戳转化

| 方法 | 说明 | 返回 |
|------|------|------|
| **toMillis(date)** | 日期 → 毫秒时间戳（13 位） | `number`，无效为 `NaN` |
| **toSeconds(date)** | 日期 → 秒级时间戳（10 位） | `number`，无效为 `NaN` |
| **fromMillis(ms)** | 毫秒时间戳 → Date | `Date` |
| **fromSeconds(seconds)** | 秒级时间戳 → Date | `Date` |
| **fromTimestamp(timestamp)** | 自动识别：&lt; 1e12 视为秒，否则毫秒 | `Date` |

```js
kDate(new Date()).toSeconds();          // 1741132800
kDate.fromSeconds(1741132800);          // Date
kDate.fromTimestamp(1741132800000);     // 按毫秒解析
```

---

## 日期计算

| 方法 | 说明 |
|------|------|
| **add(date, amount, unit)** | 增加时间，返回新 Date，不修改原对象 |
| **subtract(date, amount, unit)** | 减去时间 |
| **diff(date1, date2, unit?)** | 两日期差值，默认单位 `'day'` |
| **startOf(date, unit)** | 取单位起始（如当天 00:00:00.000） |
| **endOf(date, unit)** | 取单位结束（如当天 23:59:59.999） |

**unit**：`year`、`month`、`week`、`day`、`hour`、`minute`、`second`（或使用 `kDate.UNITS.xxx`）。

```js
kDate(new Date()).add(1, 'month').format('YYYY-MM-DD');
kDate(end).diff(start, 'day');
kDate(new Date()).startOf('month');  // 本月 1 号 0 点（返回链式，可再 .format()）
```

---

## 时间范围

| 方法 | 说明 | 返回 |
|------|------|------|
| **getRange(start, end, stepUnit?, stepAmount?)** | 范围内按步长的所有日期 | `Date[]` |
| **getMonthDays(date)** | 该月 1 号到月末的每一天 | `Date[]` |
| **getMonthCalendar(date, firstDayOfWeek?)** | 该月按周排列的日历矩阵 | `Date[][]` |

**getRange** 默认 `stepUnit='day'`、`stepAmount=1`。  
**getMonthCalendar** 的 `firstDayOfWeek`：`0`=周日、`1`=周一。

```js
kDate.getRange('2025-03-01', '2025-03-05');  // 5 个 Date
kDate.getMonthDays('2025-03');               // 当月所有天
kDate.getMonthCalendar(new Date(), 1);       // 周一开头的月历
```

---

## 比较与校验

| 方法 | 说明 |
|------|------|
| **isSame(date1, date2, unit?)** | 是否相同，可按单位（默认毫秒） |
| **isBefore(date1, date2)** | date1 是否在 date2 之前 |
| **isAfter(date1, date2)** | date1 是否在 date2 之后 |
| **isValid(date)** | 是否有效日期 |
| **getMonthName(monthIndex, short?)** | 月份中文名，0–11 |
| **getWeekdayName(weekdayIndex, short?)** | 星期中文名，0–6（0=周日） |

---

## 相对时间

### relativeTime(date, baseDate?, labels?)

得到相对描述：几秒前、几天后等。

- **date**：目标日期
- **baseDate**：基准日期，默认当前时间
- **labels**：覆盖 `RELATIVE_LABELS` 的文案
- **返回**：`string`，如 `"3秒前"`、`"2天后"`、`"刚刚"`

### fromNow(date, labels?)

相对“当前时间”的简写，等价于 `relativeTime(date, new Date(), labels)`。

```js
kDate(new Date()).subtract(5, 'second').fromNow();  // "5秒前"
kDate(new Date()).add(2, 'day').fromNow();           // "2天后"
kDate(future).relativeTime(new Date('2025-03-10'));  // 相对指定基准
```

---

## 工具

| 方法 | 说明 |
|------|------|
| **toDate(input)** | 将 `Date \| number \| string` 转为 `Date` |

---

## API 一览

**链式入口**：`kDate(d)` → 链式对象（见上表）；静态方法与常量挂在 `kDate` 上（如 `kDate.MONTHS`、`kDate.getRange`）

**静态方法**（兼容旧用法）：

```
MONTHS, MONTHS_SHORT, WEEKDAYS, WEEKDAYS_SHORT, UNITS, RELATIVE_LABELS
format, parse
toMillis, toSeconds, fromMillis, fromSeconds, fromTimestamp
add, subtract, diff, startOf, endOf
getRange, getMonthDays, getMonthCalendar
isSame, isBefore, isAfter, isValid, getMonthName, getWeekdayName
relativeTime, fromNow
toDate
```
