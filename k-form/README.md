# k-form

基于 **antd-mobile** Form 的可配置表单：表单项配置可从接口获取，根据配置自动生成表单。参考 antd-mobile Form 的用法与风格。

---

## 安装

需同时安装 React、antd-mobile 与 k-form（k-form 为 peer 依赖）：

```bash
npm i react react-dom antd-mobile k-form
```

---

## 使用方式

### 1. 直接传入配置（fields）

```jsx
import { ConfigForm } from 'k-form';
import { Button } from 'antd-mobile';

const fields = [
  { name: 'username', label: '用户名', type: 'input', required: true, placeholder: '请输入' },
  { name: 'age', label: '年龄', type: 'number', initialValue: 18 },
  { name: 'intro', label: '简介', type: 'textarea' },
  { name: 'city', label: '城市', type: 'select', options: [{ label: '北京', value: 'bj' }, { label: '上海', value: 'sh' }] }
];

function MyForm() {
  return (
    <ConfigForm
      fields={fields}
      onFinish={(values) => console.log(values)}
      formProps={{ layout: 'horizontal' }}
    >
      <Button type="submit" color="primary" block>提交</Button>
    </ConfigForm>
  );
}
```

### 2. 从接口获取配置（fieldsFromAPI）

表单项配置由接口返回，自动拉取并渲染表单：

```jsx
import { ConfigForm } from 'k-form';
import { Button } from 'antd-mobile';
import { kres } from '@ruoguo/kres'; // 或你的请求库

async function fetchFormConfig() {
  const res = await kres.get('/api/form/config');
  return res.data; // 如 { list: [ { name, label, type, ... } ] }
}

function MyForm() {
  return (
    <ConfigForm
      fieldsFromAPI={fetchFormConfig}
      fieldsDataKey="list"
      onFinish={(values) => console.log(values)}
    >
      <Button type="submit" color="primary" block>提交</Button>
    </ConfigForm>
  );
}
```

接口返回结构示例：

```json
{
  "list": [
    { "name": "title", "label": "标题", "type": "input", "required": true },
    { "name": "status", "label": "状态", "type": "select", "options": [{ "label": "启用", "value": "1" }, { "label": "禁用", "value": "0" }] }
  ]
}
```

### 3. 使用 Form 实例（form）

需要编程式设值、校验时，可配合 `Form.useForm()`：

```jsx
import { ConfigForm } from 'k-form';
import { Form, Button } from 'antd-mobile';

const [form] = Form.useForm();

<ConfigForm
  form={form}
  fields={fields}
  onFinish={(values) => console.log(values)}
>
  <Button type="submit" color="primary" block>提交</Button>
</ConfigForm>

// 外部设值
form.setFieldsValue({ username: 'admin' });
// 取值
const values = form.getFieldsValue();
```

---

## 表单项配置（schema）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 字段名，必填 |
| `label` | string | 标签文案 |
| `type` | string | 控件类型，见下表 |
| `required` | boolean | 是否必填（可自动生成默认校验） |
| `placeholder` | string | 占位符 |
| `initialValue` | any | 初始值 |
| `options` | { label, value }[] | 选项（select / picker） |
| `rules` | array | 校验规则，同 antd-mobile Form |
| `props` | object | 透传到底层控件的 props |
| `hidden` | boolean | 是否隐藏 |

**type 取值**：`input` | `textarea` | `number` | `select` | `picker` | `date` | `datetime` | `time` | `switch` | `stepper` | `hidden`

---

## API

### ConfigForm props

| 属性 | 类型 | 说明 |
|------|------|------|
| `fields` | object[] | 表单项配置数组 |
| `fieldsFromAPI` | () => Promise\<data\> | 从接口拉取配置，返回数据或带 list 的对象 |
| `fieldsDataKey` | string | 接口数据中表单项数组的 key，默认 `'list'` |
| `form` | FormInstance | Form.useForm() 返回的实例 |
| `initialValues` | object | 表单初始值 |
| `onFinish` | (values) => void | 提交成功回调 |
| `onFinishFailed` | (err) => void | 校验失败回调 |
| `formProps` | object | 透传给 `<Form>` 的 props |
| `itemProps` | object | 透传给每个 `<Form.Item>` 的 props |
| `children` | ReactNode | 表单项下方内容（如提交按钮） |

### 工具方法（schema）

```js
import { parseFieldsFromAPI, normalizeFieldConfig, FIELD_TYPES } from 'k-form';

// 接口返回 { list: [...] } 或直接数组，解析为标准化字段配置
const fields = parseFieldsFromAPI(apiData, 'list');

// 单条配置标准化（补默认值）
const one = normalizeFieldConfig({ name: 'x', type: 'input' });
```

---

## 开发与测试

```bash
# 安装依赖（含 dev：vitest、react、antd-mobile 等）
npm install

# 单元测试
npm run test

# 监听模式
npm run test:watch

# 启动 Demo（Vite + React，需先 npm install）
npm run demo
```

Demo 包含两个 Tab：**静态配置**（直接传 `fields`）与 **接口配置**（`fieldsFromAPI` 模拟接口拉取表单项）。

### 将 Demo 作为组件引入展示

Demo 已通过子路径 `k-form/demo` 暴露，可在文档站或任意项目中直接引入并渲染：

```jsx
// 引入完整 Demo 页（带 Tab：静态配置 / 接口配置）
import KFormDemo from 'k-form/demo';

function DocPage() {
  return <KFormDemo />;
}
```

```jsx
// 或按需引入单个示例
import { StaticFormDemo, ApiFormDemo } from 'k-form/demo';

function DocPage() {
  return (
    <>
      <StaticFormDemo />
      <ApiFormDemo />
    </>
  );
}
```

需确保项目已安装并使用了 `react`、`react-dom`、`antd-mobile`（k-form 的 peer 依赖）。

---

## License

ISC
