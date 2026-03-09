/**
 * 表单项配置 schema（可与接口返回结构一致，便于直接使用接口数据）
 *
 * 单条字段配置示例：
 * {
 *   name: 'username',           // 字段名，必填
 *   label: '用户名',              // 标签
 *   type: 'input',               // 控件类型：input | textarea | number | select | picker | date | datetime | time | switch | stepper | hidden
 *   required: true,              // 是否必填
 *   placeholder: '请输入',        // 占位符
 *   initialValue: '',            // 初始值
 *   options: [                   // type 为 select / picker 时的选项 { label, value }
 *     { label: '选项A', value: 'a' }
 *   ],
 *   rules: [                     // 校验规则，同 antd-mobile Form rules
 *     { required: true, message: '必填' }
 *   ],
 *   props: {},                   // 透传到底层控件的额外 props
 *   hidden: false,               // 是否隐藏该表单项
 *   colSpan: 1                   // 占列数（若未来支持栅格）
 * }
 */

/** 支持的控件类型 */
export const FIELD_TYPES = [
  'input',
  'textarea',
  'number',
  'select',
  'picker',
  'date',
  'datetime',
  'time',
  'switch',
  'stepper',
  'hidden'
];

/**
 * 校验并补全单条字段配置（接口数据可能缺省，给默认值）
 * @param {object} field - 原始配置
 * @returns {object} 补全后的配置
 */
export function normalizeFieldConfig(field) {
  if (!field || field.name == null) return null;
  const name = String(field.name);
  if (name === '') return null;
  return {
    name,
    label: field.label != null ? String(field.label) : name,
    type: FIELD_TYPES.includes(field.type) ? field.type : 'input',
    required: Boolean(field.required),
    placeholder: field.placeholder != null ? String(field.placeholder) : undefined,
    initialValue: field.initialValue,
    options: Array.isArray(field.options) ? field.options : undefined,
    rules: Array.isArray(field.rules) ? field.rules : undefined,
    props: field.props && typeof field.props === 'object' ? field.props : {},
    hidden: Boolean(field.hidden),
    colSpan: field.colSpan != null ? field.colSpan : 1
  };
}

/**
 * 从接口数据解析表单项配置列表（可传入接口返回的 data 或 data.list 等）
 * @param {any} data - 接口返回的数据（数组或 { list: [] } 等）
 * @param {string} [listKey='list'] - 若 data 为对象，从该 key 取数组
 * @returns {object[]} 标准化后的字段配置数组
 */
export function parseFieldsFromAPI(data, listKey = 'list') {
  let list = Array.isArray(data) ? data : (data && data[listKey]);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeFieldConfig).filter(Boolean);
}
