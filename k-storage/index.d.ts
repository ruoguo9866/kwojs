export interface StorageWrapper {
  /**
   * 按 key 存储任意可 JSON 序列化的数据
   */
  set(key: string, value: unknown): void;

  /**
   * 按 key 读取数据，自动 JSON 反序列化
   * 空字符串 / null / undefined 或解析失败时返回 null
   */
  get<T = unknown>(key: string): T | null;

  /**
   * 删除指定 key
   */
  remove(key: string): void;

  /**
   * 清空当前 storage 下的所有数据
   */
  clear(): void;

  /**
   * 批量删除多个 key
   */
  removeKeys(...keys: string[]): void;
}

export interface CookieOptions {
  /**
   * 过期时间（单位：天）
   */
  expires?: number;

  /**
   * Cookie 作用路径，默认 '/'
   */
  path?: string;

  /**
   * 域名，可选
   */
  domain?: string;

  /**
   * 仅 HTTPS 传输
   */
  secure?: boolean;
}

export interface CookieWrapper {
  /**
   * 设置 Cookie
   * value 将按原样写入（会进行 URL 编码）
   */
  set(key: string, value: string, options?: CookieOptions): void;

  /**
   * 获取 Cookie 原始字符串值（URL 解码后）
   */
  get(key: string): string | undefined;

  /**
   * 删除指定 key 的 Cookie
   */
  remove(key: string, options?: CookieOptions): void;

  /**
   * 清空当前域下所有 Cookie
   */
  clear(): void;
}

/**
 * localStorage 存储封装
 */
export const Storage: StorageWrapper;

/**
 * sessionStorage 存储封装
 */
export const Session: StorageWrapper;

/**
 * Cookie 操作封装
 */
export const Cookie: CookieWrapper;

/**
 * 判断数据是否为「有效值」
 * - null / undefined => false
 * - string: 去空格后为 '' / '[]' / '{}' => false
 * - Array: 长度为 0 => false
 * - 普通 Object: 无自有属性 => false
 * - 其他类型（number / boolean / function 等）默认认为是有效 => true
 */
export function check(data: unknown): boolean;

