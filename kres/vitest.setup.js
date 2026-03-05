/**
 * 为 Node 环境提供 XMLHttpRequest 模拟，使 kres 可在无浏览器环境下跑单元测试
 */
let nextResponse = {
  status: 200,
  statusText: 'OK',
  responseText: '{}',
  headers: ''
};

let lastRequestUrl = '';

function setNextResponse(options = {}) {
  nextResponse = {
    status: 200,
    statusText: 'OK',
    responseText: '{}',
    headers: '',
    ...options
  };
}

function getNextResponse() {
  return { ...nextResponse };
}

function getLastRequestUrl() {
  return lastRequestUrl;
}

class MockXHR {
  constructor() {
    this.readyState = 0;
    this._method = '';
    this._url = '';
    this._headers = {};
    this._timeout = 0;
    this._aborted = false;
  }

  open(method, url) {
    this._method = method;
    this._url = url;
    lastRequestUrl = url;
    this.readyState = 1;
  }

  setRequestHeader(key, value) {
    this._headers[key] = value;
  }

  getAllResponseHeaders() {
    const res = this._snapshot || getNextResponse();
    return res.headers || '';
  }

  get status() {
    const res = this._snapshot || getNextResponse();
    return res.status;
  }

  get statusText() {
    const res = this._snapshot || getNextResponse();
    return res.statusText;
  }

  get responseText() {
    const res = this._snapshot || getNextResponse();
    return res.responseText;
  }

  send(body) {
    this._body = body;
    if (this._aborted) return;
    this._snapshot = getNextResponse();
    this.readyState = 4;
    const tick = typeof setImmediate !== 'undefined' ? setImmediate : (fn) => setTimeout(fn, 0);
    tick(() => {
      if (this._aborted) return;
      if (this.onload) this.onload();
    });
  }

  abort() {
    this._aborted = true;
    // 不触发 onerror，让 CancelToken 的 reject 生效
  }
}

const g = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
g.XMLHttpRequest = MockXHR;
g.__kresMockSetNextResponse = setNextResponse;
g.__kresMockGetNextResponse = getNextResponse;

export { setNextResponse, getNextResponse, getLastRequestUrl };
