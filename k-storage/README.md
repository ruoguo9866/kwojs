## @ruoguo/k-storage

一个简单易用的浏览器存储工具库，封装了 `localStorage`、`sessionStorage` 和 `document.cookie` 的常用操作，同时提供统一的数据校验方法 `check`。

适合在日常业务中快速读写浏览器存储，减少重复封装代码。

---

## 安装

```bash
npm install @ruoguo/k-storage
# 或
yarn add @ruoguo/k-storage
```

---

## 快速上手

```js
import { Storage, Session, Cookie, check } from '@ruoguo/k-storage';

// localStorage 示例
Storage.set('user', { name: '张三', age: 18 });
const user = Storage.get('user'); // { name: '张三', age: 18 } | null

// sessionStorage 示例
Session.set('step', 1);
const step = Session.get('step'); // 1 | null

// Cookie 示例
Cookie.set('token', 'abcd1234', { expires: 7 }); // 7 天后过期
const token = Cookie.get('token'); // 'abcd1234' | undefined

// 数据有效性校验
check(user); // true / false
```

---

## API 说明

### Storage：`localStorage` 封装

`Storage` 封装了常见的 `localStorage` 操作，内部自动做 `JSON.stringify`/`JSON.parse`。

- **set(key, value)**  
  存储任意可 JSON 序列化的数据。

  ```js
  Storage.set('user', { name: '张三' });
  ```

- **get(key)**  
  读取数据并自动 `JSON.parse`，在以下情况返回 `null`：
  - key 不存在
  - 值为 `null` / `undefined` / `""`
  - JSON 解析失败

  ```js
  const user = Storage.get('user'); // { name: '张三' } | null
  ```

- **remove(key)**  
  删除指定 key。

  ```js
  Storage.remove('user');
  ```

- **clear()**  
  清空当前域下的所有 `localStorage` 数据。

  ```js
  Storage.clear();
  ```

- **removeKeys(...keys)**  
  批量删除多个 key。

  ```js
  Storage.removeKeys('user', 'token', 'config');
  ```

---

### Session：`sessionStorage` 封装

`Session` 与 `Storage` 的 API 完全一致，只是底层使用 `sessionStorage`。

- **set(key, value)**
- **get(key)**
- **remove(key)**
- **clear()**
- **removeKeys(...keys)**

```js
Session.set('step', 1);
const step = Session.get('step'); // 1 | null
Session.remove('step');
Session.clear();
```

---

### Cookie：`document.cookie` 封装

`Cookie` 封装了常用 Cookie 操作，并自动处理编码问题。

- **set(key, value, options?)**

  - `value`: 字符串，将通过 `encodeURIComponent` 编码后写入。
  - `options.expires`: 过期时间（单位：天），例如 `7` 表示 7 天后过期。
  - `options.path`: 作用路径，默认 `'/'`。
  - `options.domain`: 作用域名，可选。
  - `options.secure`: 是否仅在 HTTPS 传输，可选。

  ```js
  Cookie.set('token', 'abcd1234', { expires: 7 });
  ```

- **get(key)**

  获取指定 key 的 Cookie 值（内部会 `decodeURIComponent`），不存在时返回 `undefined`。

  ```js
  const token = Cookie.get('token'); // string | undefined
  ```

- **remove(key, options?)**

  删除指定 key 的 Cookie，会设置一个已经过期的时间。

  ```js
  Cookie.remove('token');
  ```

- **clear()**

  清空当前域名下的所有 Cookie。

  ```js
  Cookie.clear();
  ```

---

## check：数据有效性校验

`check(data: unknown): boolean` 用于统一判断数据是否“有值”（非空、有意义），规则如下：

- `null` / `undefined` ⇒ `false`
- 字符串：去掉首尾空格后
  - `''` / `'[]'` / `'{}'` ⇒ `false`
  - 其他字符串 ⇒ `true`
- 数组：`length === 0` ⇒ `false`，否则 `true`
- 普通对象（`[object Object]`）：`Object.keys(obj).length === 0` ⇒ `false`，否则 `true`
- 其他类型（number / boolean / function 等）默认视为有效 ⇒ `true`

示例：

```js
check(null);          // false
check(undefined);     // false
check('');            // false
check('   ');         // false
check('[]');          // false
check('{}');          // false
check([]);            // false
check({});            // false

check('hello');       // true
check([1, 2, 3]);     // true
check({ a: 1 });      // true
check(0);             // true
check(false);         // true
```

---

## TypeScript 支持

本包内置 `index.d.ts`，开箱即用的类型提示：

```ts
import { Storage, Session, Cookie, check } from '@ruoguo/k-storage';

interface User {
  name: string;
  age: number;
}

Storage.set('user', { name: '张三', age: 18 });
const user = Storage.get<User>('user'); // user 推断为 User | null

const valid = check(user); // boolean
```

如果你有更复杂的业务场景，也可以在你自己的代码中再封一层函数，限制 key 和数据结构的类型。

---

## 许可证

ISC

