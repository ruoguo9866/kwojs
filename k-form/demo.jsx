/**
 * k-form 可引入的 Demo 组件，供文档站或其它项目直接展示
 * 使用：import KFormDemo from 'k-form/demo' 或 import { StaticFormDemo, ApiFormDemo } from 'k-form/demo'
 */
import React from 'react';
import { ConfigForm } from './index.js';
import { Form, Button, Tabs, Toast } from 'antd-mobile';

const staticFields = [
  { name: 'username', label: '用户名', type: 'input', required: true, placeholder: '请输入用户名' },
  { name: 'age', label: '年龄', type: 'number', initialValue: 18, placeholder: '年龄' },
  { name: 'intro', label: '简介', type: 'textarea', placeholder: '多行输入' },
  {
    name: 'city',
    label: '城市',
    type: 'select',
    options: [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
      { label: '广州', value: 'gz' }
    ]
  },
  { name: 'open', label: '是否启用', type: 'switch', initialValue: true },
  { name: 'count', label: '数量', type: 'stepper', initialValue: 1, props: { min: 0, max: 10 } }
];

async function fetchFormConfig() {
  await new Promise((r) => setTimeout(r, 600));
  return {
    list: [
      { name: 'title', label: '标题', type: 'input', required: true, placeholder: '请输入标题' },
      { name: 'type', label: '类型', type: 'select', options: [{ label: '类型A', value: 'a' }, { label: '类型B', value: 'b' }] },
      { name: 'remark', label: '备注', type: 'textarea', placeholder: '选填' }
    ]
  };
}

const styles = {
  page: { padding: 16, paddingBottom: 40 },
  pageTitle: { margin: '0 0 12px', fontSize: 18 },
  block: { padding: '12px 0' },
  blockTitle: { margin: '0 0 8px', fontSize: 14, color: '#333' },
  blockDesc: { margin: '0 0 12px', fontSize: 12, color: '#666' }
};

/** 静态配置示例（可直接单独引用展示） */
export function StaticFormDemo() {
  const [form] = Form.useForm();
  const handleFinish = (values) => {
    Toast.show({ content: '提交: ' + JSON.stringify(values, null, 2), position: 'bottom' });
  };
  return (
    <div style={styles.block}>
      <h3 style={styles.blockTitle}>1. 静态配置（fields）</h3>
      <ConfigForm form={form} fields={staticFields} onFinish={handleFinish} formProps={{ layout: 'horizontal' }}>
        <Button type="submit" color="primary" block style={{ marginTop: 16 }}>提交</Button>
      </ConfigForm>
    </div>
  );
}

/** 接口配置示例（可直接单独引用展示） */
export function ApiFormDemo() {
  const handleFinish = (values) => {
    Toast.show({ content: '提交: ' + JSON.stringify(values), position: 'bottom' });
  };
  return (
    <div style={styles.block}>
      <h3 style={styles.blockTitle}>2. 接口配置（fieldsFromAPI）</h3>
      <p style={styles.blockDesc}>表单项从模拟接口获取，先显示「加载中...」再渲染表单。</p>
      <ConfigForm
        fieldsFromAPI={fetchFormConfig}
        fieldsDataKey="list"
        onFinish={handleFinish}
        formProps={{ layout: 'horizontal' }}
      >
        <Button type="submit" color="primary" block style={{ marginTop: 16 }}>提交</Button>
      </ConfigForm>
    </div>
  );
}

/** 完整 Demo 页（带 Tab 切换，默认导出） */
function KFormDemo() {
  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>k-form Demo</h2>
      <Tabs>
        <Tabs.Tab title="静态配置" key="static">
          <StaticFormDemo />
        </Tabs.Tab>
        <Tabs.Tab title="接口配置" key="api">
          <ApiFormDemo />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
}

export default KFormDemo;
