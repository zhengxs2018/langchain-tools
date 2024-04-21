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

export const modelRegistry = new ChatModelFactoryRegistry();

const model = modelRegistry.build({
  provider: 'openai', // or anthropic or tongyi
  apiKey: process.env.OPENAI_API_KEY,
});

const messages = [new HumanMessage('Hello')];

await model.invoke(messages);
//=> AIMessage { content: "Hello! ...you may have." }
```

当前内置的 provider：

- **anthropic**： 走 Anthropic 的接口，需要 apiKey 参数
- **openai**：走 OpenAI 的接口，需要 apiKey 参数
- **qianfan**: 走的百度云的接口，需要 apiKey 和 secretKey 参数
- **tongyi**：走通义千问的接口，需要 apiKey 参数

## 📖 使用文档

### 配置匹配规则

可以根据规则匹配不同的模型调用。

```ts
import {
  ChatModelFactoryRegistry,
  create_openai_chat_model,
  create_qianfan_chat_model,
} from '@zhengxs/langchain-tools';
import { ChatLlamaCpp } from 'langchain/chat_models/llama_cpp';

// 注意：配置的顺序会影响匹配规则
export const modelRegistry = new ChatModelFactoryRegistry([
  {
    name: 'free-gpt-3.5',
    provider: 'openai', // 使用 openai 的模型
    test: /^gpt-3/,
    options: {
      apiKey: process.env.OPENAI_FREE_API_KEY,
    },
  },
  {
    name: 'openai', // 不写 provider 默认与 name 相同
    test: /^gpt-/,
    options: {
      apiKey: process.env.OPENAI_FREE_API_KEY,
    },
  },
  {
    name: 'llama-cpp',
    include: ['llama2-7b-chat-v2'],
    // 未支持的模型可以使用 create_llm 创建
    create_llm(config) {
      return new ChatLlamaCpp({
        modelPath: '/path/to/llama2-7b-chat-v2.bin',
      });
    },
  },
]);

// 模型匹配
modelRegistry.build({ model: 'gpt-3.5-turbo' });
//=> ChatOpenAI

// 模型匹配
modelRegistry.build({ model: 'llama2-7b-chat-v2' });
//=> ChatLlamaCpp

// 快速调用
modelRegistry.build({ provider: 'llama-cpp' });
//=> ChatLlamaCpp
```

### 匹配规则说明

匹配规则主要在仅传递模型的场景，如：开发一个 Web 应用，支持多模型切换。

```ts
import {
  ChatModelFactoryRegistry,
  create_openai_chat_model,
} from '@zhengxs/langchain-tools';

export const modelRegistry = new ChatModelFactoryRegistry([
  {
    name: 'openai',
    test: /^gpt-3/, // 匹配所有 gpt-3 开头的模型
  },
  // 匹配所有 gpt-4 开头的模型，但排除 gpt-4-32k
  {
    name: 'openai',
    test: /^gpt-/,
    exclude: ['gpt-4-32k'],
    create_llm: create_openai_chat_model,
  },
  // 匹配所有 gpt-4 开头的模型，但排除 gpt-4-32k
  {
    name: 'ERNIE-Bot',
    provider: 'qianfang',
    test: /^ERNIE-Bot/,
    include: /^(ERNIE-Bot-turbo|ERNIE-Bot-4)$/, // 匹配但只支持 turbo 和 4 模型
  },
]);

modelRegistry.build({ model: 'gpt-3.5-turbo' });
//=> ChatOpenAI

modelRegistry.build({ model: 'llama2-7b-chat-v2' });
//=> ChatLlamaCpp
```

支持以下规则的配置

- **test** - 快速匹配模型
- **include** - 支持某些模型
- **exclude** - 过滤某些模型

### 分离调用模型

预设模型，以支持免费，付费的模型分离。

```ts
import {
  ChatModelFactoryRegistry,
  create_openai_chat_model,
  create_qianfan_chat_model,
} from '@zhengxs/langchain-tools';

// 免费模型
export const freeRegistry = new ChatModelFactoryRegistry([
  {
    name: 'openai',
    test: /^gpt-/,
    create_llm(config) {
      return create_openai_chat_model({
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_FREE_API_KEY,
      });
    },
  },
  {
    name: 'qianfan',
    test: /^ERNIE-Bot/,
    create_llm(config) {
      return create_qianfan_chat_model({
        model: 'ERNIE-Bot-turbo',
        apiKey: process.env.QIANFAN_FREE_API_KEY,
      });
    },
  },
]);

// 付费模型
export const paidRegistry = new ChatModelFactoryRegistry([
  {
    name: 'openai',
    test: /^gpt-/,
    create_llm(config) {
      return create_openai_chat_model({
        apiKey: process.env.OPENAI_PAID_API_KEY,
        ...config,
      });
    },
  },
  //...
]);

export function search_model(isFree, options) {
  if (isFree) {
    return freeRegistry.build(options);
  }

  return paidRegistry.build(options);
}
```

主要用于提供 Web API 时，如果用户没有付费，则调用免费模型。

```ts
const userApiKey = request.body.apiKey;

const isFree = !userApiKey && user.subscribe.plain === 'free';

const model = search_model(isFree, {
  model: request.body.model, // 允许动态调用模型
});
```

---

#### 📝 License

MIT

[profile-link]: https://github.com/zhengxs2018
[tongyi-api-key]: https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key
[wenxinworkshop]: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
