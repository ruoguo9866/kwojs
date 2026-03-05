/**
 * 将对象转为 URL 查询字符串（key=value&key2=value2）
 * @param {Record<string, string>} [data] - 键值对对象，默认 {}
 * @returns {string}
 */
export const transFun = (data = {}) =>
    Object.entries(data ?? {}).map(([k, v]) => `${k}=${v}`).join('&');

/**
 * URI / URL 相关工具方法
 */
export const uri = {
    /**
     * 从指定 URL 的查询参数中取出某个 key 的值
     * @param {string} url - 完整 URL 或相对路径
     * @param {string} val - 参数名
     * @returns {string|null}
     */
    getValue(url, val) {
        const fullUrl = new URL(url, window.location.origin);
        const params = new URLSearchParams(fullUrl.search);
        return params.get(val);
    },

    /**
     * 根据菜单/资源项拼接查询并跳转（支持站内路由与外链）
     * @param {Object} options
     * @param {{ url?: string, name?: string }} options.res - 资源项，含 url、name
     * @param {(url: string) => void} options.nav - 跳转函数
     */
    push({ res, nav, storage }) {
        if (!res?.url) return;

        const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null });
        const query = { title: res.name ?? '' };

        // redirect=jump 时走接口拿真实跳转地址（依赖全局 $axios）
        const redirect = this.getValue(res.url, 'redirect');
        if (redirect === 'jump') {
            if (typeof $axios !== 'undefined') {
                $axios.get(res.url, {}).then((resp) => {
                    if (resp?.code === 0 && resp?.data?.url) {
                        window.location.href = resp.data.url;
                    }
                });
            }
            return;
        }

        // 解析已有查询参数并合并 title
        const hasQuery = res.url.indexOf('?') > -1;
        if (hasQuery) {
            const [baseUrl, search] = res.url.split('?');
            search.split('&').forEach((item) => {
                const eq = item.indexOf('=');
                if (eq > -1) {
                    query[item.slice(0, eq)] = item.slice(eq + 1);
                }
            });
        }

        const baseUrl = hasQuery ? res.url.split('?')[0] : res.url;
        const queryString = transFun(query);
        const toUrl = `${baseUrl}?${queryString}`;

        // 外链：整页跳转并附带 token（默认从 localStorage 读 token，可传入 storage 覆盖）
        if (/^(https?:)\/\//.test(res.url)) {
            const token = (store.getItem && store.getItem('token')) ?? '';
            return nav(`${toUrl}&token=${token}`);
        }

        return nav(toUrl); // 站内路由：返回完整 URL
    },

    /**
     * 修改当前 URL 的单个查询参数（设置或删除）
     * @param {string} url - 当前完整 URL
     * @param {Object} options
     * @param {'set'|'delete'} [options.type='set'] - 设置或删除
     * @param {string} options.params - 参数名
     * @param {string} [options.value] - 参数值（type=set 时必填）
     * @returns {string} 新 URL
     */
    setUrl(url, { type = 'set', params, value }) {
        const currentUrl = new URL(url);
        if (type === 'set') {
            currentUrl.searchParams.set(params, value);
        } else {
            currentUrl.searchParams.delete(params);
        }
        return currentUrl.href;
    },

    /**
     * 打开高德地图 URI 搜索指定地址
     * @param {string} address - 关键词/地址
     */
    location(address) {
        const keyword = encodeURIComponent(address ?? '');
        window.location.href = `https://uri.amap.com/search?keyword=${keyword}&view=map&src=mypage&coordinate=gaode&callnative=0`;
    },

    /**
     * 拨打电话（移动端唤起拨号）
     * @param {string} phone - 电话号码
     */
    tel(phone) {
        if (phone) window.location.href = `tel:${phone}`;
    },

    /**
     * 从路由 state 或 path 参数中解析出最终跳转路径（用于登录回调等场景）
     * @param {Object} options
     * @param {*} options.state - 路由 state（可为 JSON 字符串或对象）
     * @param {string} [options.pathParam] - 显式传入的 path，优先使用
     * @param {string} [options.defaultPath='/home'] - 解析失败时的默认路径
     * @returns {string}
     */
    getPathFromState({ state, pathParam, defaultPath = '/home' }) {
        if (pathParam) return pathParam;

        if (!state) return defaultPath;

        try {
            const stateObj = typeof state === 'string' ? JSON.parse(state) : state;
            if (!stateObj?.path) return defaultPath;

            // 将 state 中可能被转义的 \/ 还原为 /
            let path = stateObj.path.replace(/\\\//g, '/');
            const [pathname, existingQuery] = path.split('?');
            const queryParams = new URLSearchParams(existingQuery || '');

            // 把 state 里除 path 外的字段一并放进查询串
            Object.keys(stateObj).forEach((key) => {
                if (key !== 'path' && stateObj[key] != null) {
                    queryParams.set(key, String(stateObj[key]));
                }
            });

            const queryString = queryParams.toString();
            return queryString ? `${pathname}?${queryString}` : pathname;
        } catch (e) {
            console.error('k-uri getPathFromState: 解析 state 失败', e);
            return defaultPath;
        }
    },
};
