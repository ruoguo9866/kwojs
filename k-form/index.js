/**
 * k-form：基于 antd-mobile Form 的可配置表单
 * 表单项配置可从接口获取，自动生成表单
 */
export { default as ConfigForm, renderControl } from './ConfigForm.js';
export { FIELD_TYPES, normalizeFieldConfig, parseFieldsFromAPI } from './schema.js';
export { default as KFormDemo } from './demo.jsx';