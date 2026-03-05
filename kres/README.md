# Kres - 一个类似 axios 的 HTTP 请求库

Kres 是一个轻量级的 HTTP 客户端库，参考 axios 的 API 设计，提供了简洁易用的接口。

## 特性

- ✅ 支持 Promise API
- ✅ 支持请求和响应拦截器
- ✅ 支持请求/响应数据转换
- ✅ 支持取消请求
- ✅ 支持超时设置
- ✅ 支持默认配置
- ✅ 支持多种请求方法（GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS）
- ✅ 支持并发请求
- ✅ 支持创建自定义实例

## 安装

```bash
npm install @ruoguo/kres
```

## 使用方法

### 基础用法

```javascript
const kres = require('./index.js');

// GET 请求
kres.get('https://api.example.com/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// POST 请求
kres.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com'
})
  .then(response => {
    console.log(response.data);
  });

// 使用 async/await
async function fetchData() {
  try {
    const response = await kres.get('https://api.example.com/users');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### 请求配置

```javascript
kres({
  method: 'post',
  url: '/user',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  },
  headers: {
    'X-Custom-Header': 'value'
  },
  params: {
    ID: 12345
  },
  timeout: 5000
});
```

### 创建实例

```javascript
const api = kres.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer token'
  }
});

// 使用实例
api.get('/users');
api.post('/users', { name: 'John' });
```

### 拦截器

```javascript
// 请求拦截器
kres.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    config.headers['Authorization'] = 'Bearer token';
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
kres.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

// 移除拦截器
const myInterceptor = kres.interceptors.request.use(function () {/*...*/});
kres.interceptors.request.eject(myInterceptor);
```

### 取消请求

```javascript
const CancelToken = kres.CancelToken;
const source = CancelToken.source();

kres.get('/user/12345', {
  cancelToken: source.token
}).catch(function (thrown) {
  if (kres.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // 处理错误
  }
});

// 取消请求
source.cancel('操作被用户取消');
```

### 并发请求

```javascript
function getUserAccount() {
  return kres.get('/user/12345');
}

function getUserPermissions() {
  return kres.get('/user/12345/permissions');
}

kres.all([getUserAccount(), getUserPermissions()])
  .then(kres.spread(function (acct, perms) {
    // 两个请求现在都完成
  }));
```

## API

### 请求方法别名

- `kres.get(url[, config])`
- `kres.post(url[, data[, config]])`
- `kres.put(url[, data[, config]])`
- `kres.patch(url[, data[, config]])`
- `kres.delete(url[, config])`
- `kres.head(url[, config])`
- `kres.options(url[, config])`

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | String | - | 请求的 URL |
| `method` | String | 'get' | 请求方法 |
| `baseURL` | String | '' | 基础 URL |
| `headers` | Object | {} | 请求头 |
| `params` | Object | {} | URL 参数 |
| `data` | Any | - | 请求体数据 |
| `timeout` | Number | 0 | 超时时间（毫秒） |
| `transformRequest` | Array | - | 请求数据转换函数数组 |
| `transformResponse` | Array | - | 响应数据转换函数数组 |
| `validateStatus` | Function | - | 定义对于给定的 HTTP 响应状态码是 resolve 还是 reject |
| `cancelToken` | CancelToken | - | 指定用于取消请求的 cancel token |

### 响应结构

```javascript
{
  data: {},        // 服务器响应的数据
  status: 200,     // HTTP 状态码
  statusText: 'OK', // HTTP 状态信息
  headers: {},     // 响应头
  config: {},      // 请求配置
  request: {}      // XMLHttpRequest 实例
}
```

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 注意事项

- 本库使用 XMLHttpRequest，在 Node.js 环境中需要额外的适配
- 建议在浏览器环境中使用
- 如需在 Node.js 中使用，建议使用 `node-fetch` 或 `http` 模块进行适配

## 许可证

ISC

