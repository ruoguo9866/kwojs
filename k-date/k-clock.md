# k-clock 时钟/倒计时方法库

支持倒计时、暂停、开始、停止、重置与获取倒计时模块（天/时/分/秒）。无外部依赖。

---

## 引入

```js
// Node / CommonJS
const kClock = require('./k-clock.js');

// 浏览器
// <script src="k-clock.js"></script>
// 使用 window.kClock
```

---

## 静态常量

| 名称 | 说明 |
|------|------|
| **ClockState** | 状态：`idle`（未开始/已停止）、`running`（运行中）、`paused`（已暂停） |
| **SEC** | 1 秒的毫秒数 `1000` |
| **MIN** | 1 分钟的毫秒数 |
| **HOUR** | 1 小时的毫秒数 |
| **DAY** | 1 天的毫秒数 |

---

## 创建倒计时

### createCountdown(options)

创建倒计时实例。

**参数 options**（也可直接传数字表示秒数）：

| 属性 | 类型 | 说明 |
|------|------|------|
| **seconds** | number | 倒计时总秒数（与 `endTime` 二选一） |
| **endTime** | Date \| number | 结束时间，倒计时到该时刻 |
| **onTick** | (modules) => void | 每秒回调，参数为当前倒计时模块 |
| **onEnd** | () => void | 倒计时结束时的回调 |

**返回**：倒计时实例（见下方实例方法）。

```js
// 按总秒数
const clock = kClock.createCountdown({
  seconds: 3661,
  onTick: (m) => console.log(m),
  onEnd: () => console.log('结束')
});

// 按结束时间
const clock2 = kClock.createCountdown({
  endTime: Date.now() + 10000,
  onEnd: () => console.log('到点')
});

// 简写：只传秒数
const clock3 = kClock.createCountdown(60);
```

---

## 实例方法

| 方法 | 说明 |
|------|------|
| **start()** | 开始或继续倒计时 |
| **pause()** | 暂停（保留剩余时间） |
| **stop()** | 停止并清空 |
| **reset(secondsOrOptions?)** | 重置。不传恢复初始值；传数字设为该秒数；传 `{ seconds }` 或 `{ endTime }` 也可 |
| **get()** | 获取当前倒计时模块（不启动/不推进计时器） |

**只读属性**：

| 属性 | 说明 |
|------|------|
| **state** | 当前状态 `'idle'` \| `'running'` \| `'paused'` |
| **running** | 是否在运行 |
| **paused** | 是否已暂停 |

---

## 获取倒计时模块

### 实例.get()

返回当前剩余时间拆分为天/时/分/秒等，结构同下。

### getCountdownModules(ms)

将**剩余毫秒数**拆分为显示用模块（可单独使用，不依赖实例）。

**参数**：`ms` — 剩余毫秒数（≥0）

**返回**：

```js
{
  days: 0,        // 天
  hours: 1,       // 时
  minutes: 1,     // 分
  seconds: 1,     // 秒
  totalSeconds: 3661,
  ms: 3661000     // 剩余总毫秒
}
```

用于直接渲染「天 / 时 / 分 / 秒」等模块。

```js
const m = clock.get();
// 显示: m.days + '天' + m.hours + '时' + m.minutes + '分' + m.seconds + '秒'

// 单独使用
kClock.getCountdownModules(125000);  // { days: 0, hours: 0, minutes: 2, seconds: 5, ... }
```

---

## 使用示例

```js
const kClock = require('./k-clock.js');

const clock = kClock.createCountdown({
  seconds: 65,
  onTick: (m) => {
    const pad = (n) => String(n).padStart(2, '0');
    console.log(`${pad(m.minutes)}:${pad(m.seconds)}`);
  },
  onEnd: () => console.log('时间到')
});

clock.start();   // 01:05 → 01:04 → … → 00:00 → 时间到
clock.pause();   // 暂停
clock.get();     // 当前剩余 { days, hours, minutes, seconds, ... }
clock.start();   // 继续
clock.stop();    // 停止
clock.reset(120); // 重置为 120 秒
clock.start();
```

根据 `clock.state` 或 `clock.running` / `clock.paused` 可切换按钮文案（开始/暂停/继续等）。

---

## API 一览

```
ClockState, SEC, MIN, HOUR, DAY
getCountdownModules(ms)
createCountdown(options) → { start, pause, stop, reset, get, state, running, paused }
```
