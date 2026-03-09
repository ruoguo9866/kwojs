/**
 * k-form ConfigForm 单元测试（mock antd-mobile，仅测渲染与 fieldsFromAPI 流程）
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';

vi.mock('antd-mobile', () => {
  const React = require('react');
  const FormItem = ({ children, name, label }) =>
    React.createElement('div', { 'data-testid': 'form-item', 'data-name': name, 'data-label': label }, children);
  const FormImpl = ({ children, ...rest }) =>
    React.createElement('div', { 'data-testid': 'form', ...rest }, children);
  FormImpl.Item = FormItem;
  FormImpl.useForm = () => [{ getFieldsValue: vi.fn(), setFieldsValue: vi.fn(), submit: vi.fn() }];
  return {
    Form: FormImpl,
    Input: (props) => React.createElement('input', { 'data-testid': 'input', ...props }),
    TextArea: (props) => React.createElement('textarea', { 'data-testid': 'textarea', ...props }),
    DatePicker: (props) => React.createElement('div', { 'data-testid': 'date-picker', ...props }),
    Selector: (props) => React.createElement('div', { 'data-testid': 'selector', ...props }),
    Switch: (props) => React.createElement('input', { type: 'checkbox', 'data-testid': 'switch', ...props }),
    Stepper: (props) => React.createElement('div', { 'data-testid': 'stepper', ...props })
  };
});

import ConfigForm from './ConfigForm.js';

describe('ConfigForm', () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('根据 fields 渲染表单项', () => {
    const fields = [
      { name: 'a', label: '字段A', type: 'input' },
      { name: 'b', label: '字段B', type: 'textarea' }
    ];
    const { container } = render(<ConfigForm fields={fields} />);
    const form = container.querySelector('[data-testid="form"]');
    expect(form).toBeTruthy();
    const items = container.querySelectorAll('[data-testid="form-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('data-name')).toBe('a');
    expect(items[0].getAttribute('data-label')).toBe('字段A');
    expect(items[1].getAttribute('data-name')).toBe('b');
  });

  it('fieldsFromAPI 先显示加载中再渲染表单', async () => {
    let resolveAPI;
    const apiPromise = new Promise((r) => { resolveAPI = r; });
    const fieldsFromAPI = vi.fn(() => apiPromise);
    const { container } = render(<ConfigForm fieldsFromAPI={fieldsFromAPI} />);
    expect(container.querySelector('.k-form-loading')).toBeTruthy();
    expect(container.querySelector('[data-testid="form"]')).toBeFalsy();
    resolveAPI([{ name: 'x', label: 'X' }]);
    await waitFor(() => {
      expect(container.querySelector('.k-form-loading')).toBeFalsy();
      expect(container.querySelector('[data-testid="form"]')).toBeTruthy();
      expect(container.querySelector('[data-name="x"]')).toBeTruthy();
    });
  });

  it('fieldsFromAPI 返回对象带 list 时解析 list', async () => {
    const fieldsFromAPI = vi.fn().mockResolvedValue({ list: [{ name: 'y', label: 'Y' }] });
    const { container } = render(<ConfigForm fieldsFromAPI={fieldsFromAPI} fieldsDataKey="list" />);
    await waitFor(() => {
      expect(container.querySelector('[data-testid="form"]')).toBeTruthy();
      expect(container.querySelector('[data-name="y"]')).toBeTruthy();
    });
  });

  it('渲染后表单存在且接收 onFinish', () => {
    const onFinish = vi.fn();
    const fields = [{ name: 'z', label: 'Z' }];
    const { container } = render(<ConfigForm fields={fields} onFinish={onFinish} />);
    const form = container.querySelector('[data-testid="form"]');
    expect(form).toBeTruthy();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
