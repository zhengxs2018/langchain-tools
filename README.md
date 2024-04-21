# @zhengxs/langchain-tools

> [!WARNING]
> 请勿在生产环境中使用。

基于 langchain 的辅助工具，解决多模型动态调用的问题。

除了内置大模型之外，也可以基于 langchain 调用本地模型或反向代理的接口。

## 🚀 快速开始

要安装 `@zhengxs/langchain-tools`，请运行以下命令:

```bash
# Use PNPM
$ pnpm add @zhengxs/langchain-tools

# Use Yarn
$ yarn add @zhengxs/langchain-tools

# Use NPM
$ npm i -S @zhengxs/langchain-tools
```

默认支持 OpenAI, Anthropic, [通义千问][tongyi-api-key], [文心千帆][wenxinworkshop] 平台模型的调用。

```ts
import { HumanMessage } from '@langchain/core/messages';
import { ChatModelFactoryRegistry } from '@zhengxs/langchain-tools';

export const modelRegistry = new ChatModelFactoryRegistry([
  // 支持 OpenAI 大模型
  {
    name: 'openai',
    options: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
  // 支持百度文心云千帆系列模型
  {
    name: 'qianfan',
    test: /^ERNIE-Bot/,
    options: {
      apiKey: process.env.QIAN_FANG_API_KEY,
      secretKey: process.env.QIAN_FANG_SECRET_KEY,
    },
  },
  // 支持通义千问和百川系列模型
  {
    name: 'tongyi',
    test: /^(qwen|baichuan|llama2)/,
    options: {
      apiKey: process.env.QWEN_API_KEY,
    },
  },
]);

const model = modelRegistry.build({
  model: 'Ernie-Bot-turbo', // or qwen-turbo or gpt-3.5-turbo
});

const messages = [new HumanMessage('Hello')];

await model.invoke(messages);
//=> AIMessage { content: "Hello! ...you may have." }
```

除了内置的通道，也可以通过自定义工厂函数接入本地模型或反向代理的接口，详见 [对话模型注册工厂](./docs/chat_model_registry_factory.md)。

## 📖 使用文档

- [对话模型注册工厂](./docs/chat_model_registry_factory.md)

---

#### 📝 License

MIT

[profile-link]: https://github.com/zhengxs2018
[tongyi-api-key]: https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key
[wenxinworkshop]: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
