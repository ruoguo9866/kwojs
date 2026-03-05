# kwojs

前端工具库合集，包含日期/时钟、浏览器存储、HTTP 请求、URI/URL 等无依赖或轻量依赖的模块。

---

## 子包概览

| 包名 | 说明 | 安装 |
|------|------|------|
| **@ruoguo/k-date** | 日期与时钟：格式化、计算、范围、时间戳、相对时间、倒计时（含 k-date / k-clock 子模块） | `npm i @ruoguo/k-date` |
| **@ruoguo/k-storage** | 浏览器存储：localStorage / sessionStorage / Cookie 封装 + 数据校验 `check` | `npm i @ruoguo/k-storage` |
| **@ruoguo/kres** | HTTP 客户端：类 axios API，拦截器、取消请求、超时、并发、自定义实例 | `npm i @ruoguo/kres` |
| **k-uri** | URI/URL 工具：查询参数解析/拼接、setUrl、跳转封装、getPathFromState、高德/拨号 | `npm i @ruoguo/k-uri` |

---

## 仓库结构

```
kwojs/
├── k-date/        # 日期与时钟库
├── k-storage/     # 浏览器存储库
├── kres/          # HTTP 请求库
├── k-uri/         # URI/URL 工具库
└── README.md      # 本文件
```

各子包目录下有独立的 `README.md` 与 API 文档。每个子包可单独安装、独立版本与发布。

### 本地开发

进入对应子包目录执行 `npm run test`（`k-date`、`k-uri`、`kres` 使用 Vitest，支持 `npm run test:watch`）。更多脚本见各子包 `package.json`。

---

## 文档链接

- [k-date 使用说明与 API](k-date/README.md)
- [k-storage 使用说明与 API](k-storage/README.md)
- [kres 使用说明与 API](kres/README.md)
- [k-uri 使用说明与 API](k-uri/README.md)

---

## License

ISC
