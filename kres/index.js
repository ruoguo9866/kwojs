/**
 * Kres - 一个类似 axios 的 HTTP 请求库
 */

// 默认配置
const defaults = {
  baseURL: '',
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    function(data) {
      if (typeof data === 'object' && data !== null) {
        return JSON.stringify(data);
      }
      return data;
    }
  ],
  transformResponse: [
    function(data) {
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      return data;
    }
  ],
  validateStatus: function(status) {
    return status >= 200 && status < 300;
  }
};

// 请求拦截器
const requestInterceptors = [];
// 响应拦截器
const responseInterceptors = [];

/**
 * 合并配置
 */
function mergeConfig(config1, config2) {
  const config = { ...config1 };
  
  // 合并 headers
  config.headers = { ...config1.headers, ...config2.headers };
  
  // 合并其他配置
  Object.keys(config2).forEach(key => {
    if (key !== 'headers') {
      config[key] = config2[key];
    }
  });
  
  return config;
}

/**
 * 构建完整 URL
 */
function buildURL(url, baseURL, params) {
  if (baseURL && !url.startsWith('http')) {
    url = baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
  }
  
  if (params) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    url += (url.includes('?') ? '&' : '?') + queryString;
  }
  
  return url;
}

/**
 * 转换请求数据
 */
function transformRequestData(data, headers, transformRequest) {
  if (!data) return data;
  
  let transformedData = data;
  
  transformRequest.forEach(transform => {
    if (typeof transform === 'function') {
      transformedData = transform(transformedData, headers);
    }
  });
  
  return transformedData;
}

/**
 * 转换响应数据
 */
function transformResponseData(data, headers, transformResponse) {
  let transformedData = data;
  
  transformResponse.forEach(transform => {
    if (typeof transform === 'function') {
      transformedData = transform(transformedData, headers);
    }
  });
  
  return transformedData;
}

/**
 * 创建 XMLHttpRequest
 */
function createXHR() {
  if (typeof XMLHttpRequest !== 'undefined') {
    return new XMLHttpRequest();
  }
  throw new Error('XMLHttpRequest is not supported');
}

/**
 * 执行请求
 */
function request(config) {
  return new Promise((resolve, reject) => {
    // 合并默认配置
    const mergedConfig = mergeConfig(defaults, config);
    
    // 构建 URL
    const url = buildURL(mergedConfig.url, mergedConfig.baseURL, mergedConfig.params);
    
    // 创建 XHR
    const xhr = createXHR();
    
    // 设置超时
    if (mergedConfig.timeout > 0) {
      xhr.timeout = mergedConfig.timeout;
    }
    
    // 打开连接
    xhr.open(mergedConfig.method.toUpperCase(), url, true);
    
    // 设置请求头
    Object.keys(mergedConfig.headers).forEach(key => {
      xhr.setRequestHeader(key, mergedConfig.headers[key]);
    });
    
    // 超时处理
    xhr.ontimeout = function() {
      reject(new Error(`Request timeout after ${mergedConfig.timeout}ms`));
    };
    
    // 错误处理
    xhr.onerror = function() {
      reject(new Error('Network Error'));
    };
    
    // 响应处理
    xhr.onload = function() {
      const response = {
        data: transformResponseData(
          xhr.responseText,
          parseResponseHeaders(xhr.getAllResponseHeaders()),
          mergedConfig.transformResponse
        ),
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
        config: mergedConfig,
        request: xhr
      };
      
      // 验证状态码
      if (mergedConfig.validateStatus(response.status)) {
        resolve(response);
      } else {
        const error = new Error(`Request failed with status code ${response.status}`);
        error.response = response;
        reject(error);
      }
    };
    
    // 取消请求支持
    if (mergedConfig.cancelToken) {
      mergedConfig.cancelToken.promise.then(reason => {
        xhr.abort();
        reject(reason);
      });
    }
    
    // 转换请求数据
    const requestData = transformRequestData(
      mergedConfig.data,
      mergedConfig.headers,
      mergedConfig.transformRequest
    );
    
    // 发送请求
    xhr.send(requestData || null);
  });
}

/**
 * 解析响应头
 */
function parseResponseHeaders(headersString) {
  const headers = {};
  if (!headersString) return headers;
  
  const headerPairs = headersString.trim().split('\r\n');
  headerPairs.forEach(headerPair => {
    const index = headerPair.indexOf(': ');
    if (index > 0) {
      const key = headerPair.substring(0, index).trim().toLowerCase();
      const value = headerPair.substring(index + 1).trim();
      headers[key] = value;
    }
  });
  
  return headers;
}

/**
 * 执行拦截器链
 */
async function runInterceptorChain(interceptors, config) {
  let promise = Promise.resolve(config);
  
  interceptors.forEach(interceptor => {
    promise = promise.then(
      config => interceptor.fulfilled ? interceptor.fulfilled(config) : config,
      error => interceptor.rejected ? interceptor.rejected(error) : Promise.reject(error)
    );
  });
  
  return promise;
}

/**
 * 主请求函数
 */
async function dispatchRequest(config) {
  // 执行请求拦截器
  let requestConfig = config;
  if (requestInterceptors.length > 0) {
    requestConfig = await runInterceptorChain(requestInterceptors, config);
  }
  
  // 执行请求
  let response = await request(requestConfig);
  
  // 执行响应拦截器
  if (responseInterceptors.length > 0) {
    response = await runInterceptorChain(responseInterceptors, response);
  }
  
  return response;
}

/**
 * 创建 CancelToken
 */
function CancelToken(executor) {
  let resolvePromise;
  this.promise = new Promise(resolve => {
    resolvePromise = resolve;
  });
  
  executor(function cancel(message) {
    if (this.reason) return;
    this.reason = new Error(message || 'Request cancelled');
    resolvePromise(this.reason);
  }.bind(this));
}

/**
 * 主函数
 */
function kres(config) {
  // 如果第一个参数是字符串，则作为 URL
  if (typeof config === 'string') {
    config = {
      url: config,
      ...arguments[1]
    };
  }
  
  // 设置默认方法
  if (!config.method) {
    config.method = 'get';
  }
  
  return dispatchRequest(config);
}

// 添加请求方法
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
methods.forEach(method => {
  kres[method] = function(url, data, config = {}) {
    return kres({
      ...config,
      method,
      url,
      data: method !== 'get' && method !== 'head' ? data : undefined,
      params: method === 'get' ? data : config.params
    });
  };
});

// 添加拦截器方法
kres.interceptors = {
  request: {
    use: function(fulfilled, rejected) {
      requestInterceptors.push({ fulfilled, rejected });
      return requestInterceptors.length - 1;
    },
    eject: function(id) {
      if (requestInterceptors[id]) {
        requestInterceptors.splice(id, 1);
      }
    }
  },
  response: {
    use: function(fulfilled, rejected) {
      responseInterceptors.push({ fulfilled, rejected });
      return responseInterceptors.length - 1;
    },
    eject: function(id) {
      if (responseInterceptors[id]) {
        responseInterceptors.splice(id, 1);
      }
    }
  }
};

// 添加默认配置方法
kres.defaults = defaults;

// 添加 create 方法
kres.create = function(config) {
  const instance = function(instanceConfig) {
    return kres(mergeConfig(config, instanceConfig));
  };
  
  // 复制方法
  methods.forEach(method => {
    instance[method] = function(url, data, instanceConfig = {}) {
      return instance({
        ...instanceConfig,
        method,
        url,
        data: method !== 'get' && method !== 'head' ? data : undefined,
        params: method === 'get' ? data : instanceConfig.params
      });
    };
  });
  
  // 复制拦截器
  instance.interceptors = {
    request: {
      use: function(fulfilled, rejected) {
        requestInterceptors.push({ fulfilled, rejected });
        return requestInterceptors.length - 1;
      },
      eject: function(id) {
        if (requestInterceptors[id]) {
          requestInterceptors.splice(id, 1);
        }
      }
    },
    response: {
      use: function(fulfilled, rejected) {
        responseInterceptors.push({ fulfilled, rejected });
        return responseInterceptors.length - 1;
      },
      eject: function(id) {
        if (responseInterceptors[id]) {
          responseInterceptors.splice(id, 1);
        }
      }
    }
  };
  
  instance.defaults = mergeConfig(defaults, config);
  instance.create = kres.create;
  
  return instance;
};

// 添加 CancelToken
kres.CancelToken = CancelToken;

// 添加取消方法
kres.isCancel = function(value) {
  return value && value.constructor === Error && value.message.includes('cancelled');
};

// 添加并发请求方法
kres.all = Promise.all;
kres.spread = function(callback) {
  return function(arr) {
    return callback.apply(null, arr);
  };
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = kres;
}

if (typeof window !== 'undefined') {
  window.kres = kres;
}

