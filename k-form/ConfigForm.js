/**
 * 基于 antd-mobile Form 的配置化表单：根据 fields 配置自动渲染表单项
 * 表单项配置可从接口获取后传入，或使用 parseFieldsFromAPI 解析后传入
 */
import React, { useState, useEffect } from 'react';
import { Form, Input, TextArea, DatePicker, Selector, Switch, Stepper } from 'antd-mobile';
import { normalizeFieldConfig } from './schema.js';

const noop = () => {};

/**
 * 根据字段 type 渲染对应控件（由 Form.Item 注入 value/onChange）
 */
function renderControl(field, extraProps = {}) {
  const { type, placeholder, options = [], props: fieldProps = {} } = field;
  const baseProps = { placeholder, ...fieldProps, ...extraProps };

  switch (type) {
    case 'textarea':
      return React.createElement(TextArea, {
        ...baseProps,
        autoSize: baseProps.autoSize ?? { minRows: 2, maxRows: 6 }
      });
    case 'number':
      return React.createElement(Input, { ...baseProps, type: 'number' });
    case 'select':
    case 'picker': {
      const opts = options.map((o) => (typeof o === 'object' && o !== null && 'label' in o && 'value' in o ? o : { label: String(o), value: o }));
      return React.createElement(Selector, {
        ...baseProps,
        options: opts
      });
    }
    case 'date':
      return React.createElement(DatePicker, {
        ...baseProps,
        precision: 'day'
      });
    case 'datetime':
      return React.createElement(DatePicker, {
        ...baseProps,
        precision: 'minute'
      });
    case 'time':
      return React.createElement(DatePicker, {
        ...baseProps,
        precision: 'minute',
        // 仅时间可考虑只选时间，antd-mobile DatePicker 用 precision 控制
      });
    case 'switch':
      return React.createElement(Switch, baseProps);
    case 'stepper':
      return React.createElement(Stepper, {
        min: baseProps.min ?? 0,
        max: baseProps.max ?? 99,
        ...baseProps
      });
    case 'hidden':
      return React.createElement('input', { type: 'hidden' });
    case 'input':
    default:
      return React.createElement(Input, baseProps);
  }
}

/**
 * 配置化表单组件
 *
 * @param {object} props
 * @param {object[]} props.fields - 表单项配置数组（可与接口返回结构一致）
 * @param {() => Promise<object[]>} [props.fieldsFromAPI] - 若传则优先从该函数拉取配置，覆盖 fields
 * @param {string} [props.fieldsDataKey='list'] - 接口返回数据中表单项数组的 key
 * @param {object} [props.form] - antd-mobile Form 实例（Form.useForm()）
 * @param {object} [props.initialValues] - 表单初始值
 * @param {function} [props.onFinish] - 提交成功回调 (values) => void
 * @param {function} [props.onFinishFailed] - 提交校验失败回调
 * @param {object} [props.formProps] - 透传给 <Form> 的额外 props
 * @param {object} [props.itemProps] - 透传给每个 <Form.Item> 的额外 props
 * @param {React.ReactNode} [props.children] - 表单项列表之后的内容（如提交按钮）
 */
function ConfigForm({
  fields: fieldsProp = [],
  fieldsFromAPI,
  fieldsDataKey = 'list',
  form,
  initialValues,
  onFinish = noop,
  onFinishFailed,
  formProps = {},
  itemProps = {},
  children
}) {
  const [fields, setFields] = useState(() =>
    Array.isArray(fieldsProp) ? fieldsProp.map(normalizeFieldConfig).filter(Boolean) : []
  );
  const [loading, setLoading] = useState(Boolean(fieldsFromAPI));

  useEffect(() => {
    if (!fieldsFromAPI || typeof fieldsFromAPI !== 'function') {
      if (Array.isArray(fieldsProp)) setFields(fieldsProp.map(normalizeFieldConfig).filter(Boolean));
      return;
    }
    setLoading(true);
    Promise.resolve(fieldsFromAPI())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data && data[fieldsDataKey]);
        const next = Array.isArray(list) ? list.map(normalizeFieldConfig).filter(Boolean) : [];
        setFields(next);
      })
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [fieldsFromAPI, fieldsDataKey]);

  // 当外部直接传 fields 且未用 fieldsFromAPI 时同步
  useEffect(() => {
    if (fieldsFromAPI) return;
    if (Array.isArray(fieldsProp)) setFields(fieldsProp.map(normalizeFieldConfig).filter(Boolean));
  }, [fieldsProp, fieldsFromAPI]);

  const items = fields.map((field) => {
    if (field.hidden) {
      return React.createElement(Form.Item, {
        key: field.name,
        name: field.name,
        hidden: true,
        noStyle: true
      }, renderControl(field));
    }
    const rules = field.rules && field.rules.length ? field.rules : (field.required ? [{ required: true, message: `${field.label || field.name}必填` }] : undefined);
    return React.createElement(
      Form.Item,
      {
        key: field.name,
        name: field.name,
        label: field.label,
        rules,
        initialValue: field.initialValue,
        ...itemProps
      },
      renderControl(field)
    );
  });

  if (loading) {
    return React.createElement('div', { className: 'k-form-loading', style: { padding: 24, textAlign: 'center' } }, '加载中...');
  }

  const formConfig = {
    initialValues,
    onFinish,
    onFinishFailed,
    ...formProps
  };
  if (form) formConfig.form = form;

  return React.createElement(Form, formConfig, items, children);
}

export default ConfigForm;
export { renderControl };
