/**
 * 创建一个针对指定 Web Storage 实例的通用包装器
 * @param {Storage} storage window.localStorage 或 window.sessionStorage
 */
const createStorage = (storage) => ({
    // 存储任意可 JSON 序列化的数据
    set(key, value) {
        storage.setItem(key, JSON.stringify(value));
    },
    // 取出并 JSON 反序列化；空字符串 / null / undefined 或解析失败时返回 null
    get(key) {
        try {
            const value = storage.getItem(key);
            if (value === null || value === undefined || value === "") {
                return null;
            }
            return JSON.parse(value);
        } catch (err) {
            return null;
        }
    },
    // 删除单个 key 对应的数据
    remove(key) {
        storage.removeItem(key);
    },
    // 清空当前 storage 下所有数据
    clear() {
        storage.clear();
    },
    // 批量删除多个 key
    removeKeys(...keys) {
        keys.forEach((key) => {
            storage.removeItem(key);
        });
    },
});

/**
 * localStorage 存储封装
 */
const Storage = createStorage(localStorage);

/**
 * sessionStorage 存储封装
 */
const Session = createStorage(sessionStorage);

/**
 * Cookie 操作封装
 */
const Cookie = {
    // 设置 Cookie，默认 path=/，可选 expires（按天）
    set(key, value, options = {}) {
        // 使用 encodeURIComponent 防止中文、空格等字符导致解析问题
        let cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        if (options.expires) {
            cookie += `; expires=${new Date(
                Date.now() + options.expires * 24 * 60 * 60 * 1000,
            ).toGMTString()}`;
        }
        document.cookie = cookie;
    },
    // 获取指定 key 的 Cookie，自动 decodeURIComponent
    get(key) {
        const row = document.cookie.split('; ').find((row) => row.startsWith(`${key}=`));
        if (!row) return undefined;
        const [, raw] = row.split('=');
        return decodeURIComponent(raw);
    },
    // 删除指定 key 的 Cookie
    remove(key, options = {}) {
        const path = options.path || '/';
        // 设置一个已经过期的时间即可删除
        document.cookie = `${key}=; path=${path}; expires=${new Date(0).toGMTString()}`;
    },
    // 清空当前域下的所有 Cookie
    clear() {
        document.cookie.split('; ').forEach((row) => {
            const [k] = row.split('=');
            document.cookie = `${k}=; path=/; expires=${new Date(0).toGMTString()}`;
        });
    },
};

/**
 * 判断数据是否为「有效值」
 * - null / undefined => false
 * - string: 去空格后为 '' / '[]' / '{}' => false
 * - Array: 长度为 0 => false
 * - 普通 Object: 无自有属性 => false
 * - 其他类型（number / boolean / function 等）默认认为是有效 => true
 */
const check = (data) => {
    if (data === null || data === undefined) {
        return false;
    }

    if (typeof data === 'string') {
        const str = data.trim();
        return str !== '' && str !== '[]' && str !== '{}';
    }

    if (Array.isArray(data)) {
        return data.length > 0;
    }

    if (Object.prototype.toString.call(data) === '[object Object]') {
        return Object.keys(data).length > 0;
    }

    return true;
};

export {
    Storage, Session, Cookie, check,
}

