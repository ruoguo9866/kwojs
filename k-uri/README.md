# k-uri

URI/URL 工具：查询参数解析与拼接、URL 修改、跳转封装、高德地图/拨号等。ES Module，无依赖（浏览器环境使用 `URL` / `URLSearchParams`）。

---

## 安装

```bash
npm i k-uri
```

---

## 使用

```js
import { transFun, uri } from 'k-uri';

// 对象转查询字符串
transFun({ a: '1', b: '2' }); // 'a=1&b=2'

// 从 URL 取单个查询参数
uri.getValue('https://example.com?foo=bar', 'foo'); // 'bar'

// 修改当前 URL 的查询参数（设置或删除）
uri.setUrl('https://example.com?x=1', { type: 'set', params: 'y', value: '2' });
uri.setUrl('https://example.com?x=1', { type: 'delete', params: 'x' });

// 从路由 state 解析跳转路径（登录回调等）
uri.getPathFromState({ state: { path: '/order?id=1' }, defaultPath: '/home' });
```

---

## API

### `transFun(data?)`

将对象转为 URL 查询字符串 `key=value&key2=value2`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `Record<string, string>` | 键值对，默认 `{}` |

**返回** `string`

---

### `uri.getValue(url, val)`

从指定 URL 的查询参数中取出某个 key 的值。

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 完整 URL 或相对路径 |
| `val` | `string` | 参数名 |

**返回** `string | null`

---

### `uri.push({ res, nav, storage? })`

根据菜单/资源项拼接查询并跳转，支持站内路由与外链（外链可附带 token）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `res` | `{ url?: string, name?: string }` | 资源项 |
| `nav` | `(url: string) => void` | 跳转函数 |
| `storage` | 可选 | 兼容 `getItem` 的存储，默认 `localStorage`，用于读 token |

- `res.url` 带 `?redirect=jump` 时，若存在全局 `$axios`，会请求该 URL 取 `data.url` 并整页跳转。
- 外链（`http(s)://`）会在 URL 后追加 `&token=...`（从 storage 读）。

---

### `uri.setUrl(url, options)`

修改当前 URL 的单个查询参数（设置或删除）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 当前完整 URL |
| `options.type` | `'set' \| 'delete'` | 默认 `'set'` |
| `options.params` | `string` | 参数名 |
| `options.value` | `string` | 参数值（`type='set'` 时必填） |

**返回** `string` 新 URL

---

### `uri.location(address)`

打开高德地图 URI 搜索指定地址（`window.location.href` 跳转）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `address` | `string` | 关键词/地址 |

---

### `uri.tel(phone)`

拨打电话（移动端唤起拨号，`tel:` 协议）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `phone` | `string` | 电话号码 |

---

### `uri.getPathFromState({ state, pathParam?, defaultPath? })`

从路由 state 或 path 参数中解析出最终跳转路径（用于登录回调等）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `state` | 任意 | 路由 state，可为 JSON 字符串或对象（需含 `path`） |
| `pathParam` | `string` | 显式 path，优先使用 |
| `defaultPath` | `string` | 解析失败时的默认路径，默认 `'/home'` |

**返回** `string` 路径（可含查询串）。state 中除 `path` 外的字段会合并进查询参数。

---

## License

ISC
