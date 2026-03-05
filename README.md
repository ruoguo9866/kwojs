# kwojs

前端工具库合集，包含日期/时钟、浏览器存储、HTTP 请求等无依赖或轻量依赖的模块。

---

## 子包概览

| 包名 | 说明 | 安装 |
|------|------|------|
| **k-date** | 日期与时钟：格式化、计算、范围、时间戳、相对时间、倒计时 | `npm i @ruoguo/k-date` |
| **@ruoguo/k-storage** | 浏览器存储：localStorage / sessionStorage / Cookie 封装 + 数据校验 | `npm i @ruoguo/k-storage` |
| **@ruoguo/kres** | HTTP 客户端：类 axios API，拦截器、取消请求、并发等 | `npm i @ruoguo/kres` |

---

## 仓库结构

```
kwojs/
├── k-date/        # 日期与时钟库
├── k-storage/     # 浏览器存储库
├── kres/          # HTTP 请求库
└── README.md      # 本文件
```

各子包目录下有独立的 `README.md` 与 API 文档。

---

## 文档链接

- [k-date 使用说明与 API](k-date/README.md)
- [k-storage 使用说明与 API](k-storage/README.md)
- [kres 使用说明与 API](kres/README.md)

---

## License

ISC
