# 对话模型注册工厂

主要用于集成多个平台，病区需要动态调用远程，本地的模型。

比如以下的 web 场景中，需要根据用户是否订阅，动态调用不同的模型。

```ts
const userApiKey = request.body.apiKey;

const is_free = !userApiKey && user.subscribe.plain === 'free';

const model = build_chat_model(is_free, {
  model: request.body.model, // 允许动态调用模型
});

await model.invoke(request.messages)
```

## 快速配置

现在很多服务基于各大平台的模型，实现了自己的接口，为此，提供了注册工厂，可以快速配置。

```ts
import { ChatModelFactoryRegistry } from '@zhengxs/langchain-tools';

export const modelRegistry = new ChatModelFactoryRegistry([
  {
    name: 'qianfan', // 不写 provider，默认与名称一致
  },
  {
    name: 'custom-api',
    provider: 'openai', // 使用 openai 的模型通到
    options: {
      baseURL: 'https://chat.example/v1/',
    },
  },
  {
    name: 'custom-instance',
    llm: new ChatCustomModel() // 必须是 langchain 的 BaseChatModel 的实例
  },
  {
    name: 'custom-factory',
    create_llm(options) {
      // 使用自定义函数，返回必须是 langchain 的 BaseChatModel 的实例
    }
  },
]);
```

当前内置的 provider：

- **anthropic**： 走 Anthropic 的接口，需要 apiKey 参数
- **openai**：走 OpenAI 的接口，需要 apiKey 参数
- **qianfan**: 走的百度云的接口，需要 apiKey 和 secretKey 参数
- **tongyi**：走通义千问的接口，需要 apiKey 参数

## 匹配规则说明

支持以下规则的配置

- **test** 快速匹配模型
  - **type**: `string | RegExp | string[] | RegExp[]`
- **include** - 支持某些模型
  - **type**: `string | RegExp | string[] | RegExp[]`
- **exclude** - 过滤某些模型
  - **type**: `string | RegExp | string[] | RegExp[]`

匹配规则主要在仅传递模型的场景，如：开发一个 Web 应用，支持多模型切换。

```ts
import {
  ChatModelFactoryRegistry,
  create_openai_chat_model,
} from '@zhengxs/langchain-tools';

export const modelRegistry = new ChatModelFactoryRegistry([
  {
    name: 'gpt-3',
    provider: 'openai',
    test: /^gpt-3/, // 匹配所有 gpt-3 开头的模型
  },
  // 匹配所有 gpt-4 开头的模型，但排除 gpt-4-32k
  {
    name: 'exclude-gpt-4',
    provider: 'openai',
    test: /^gpt-/,
    exclude: ['gpt-4-32k'],
  },
  // 匹配所有 gpt-4 开头的模型，但排除 gpt-4-32k
  {
    name: 'only-turbo-and-4',
    provider: 'qianfang',
    test: /^ERNIE-Bot/,
    include: /^(ERNIE-Bot-turbo|ERNIE-Bot-4)$/, // 匹配但只支持 turbo 和 4 模型
  },
]);
```

注意：配置顺序，越靠前优先级越高。

## 自定义模型创建

可以通过 `llm` 或 `create_llm` 创建模型。

```ts
import {
  ChatModelFactoryRegistry,
} from '@zhengxs/langchain-tools';
import { ChatLlamaCpp } from 'langchain/chat_models/llama_cpp';

export const modelRegistry = new ChatModelFactoryRegistry([
  // 使用 llm 创建模型
  {
    name: 'llama2-13b',
    include: ['llama2-13b-chat-v2'],
    llm: new ChatLlamaCpp({
        modelPath: '/path/to/llama2-7b-chat-v2.bin',
      })
  },
  // 使用 create_llm 创建模型
  {
    name: 'llama2-7b',
    include: ['llama2-7b-chat-v2'],
    create_llm(config) {
      return new ChatLlamaCpp({
        modelPath: '/path/to/llama2-7b-chat-v2.bin',
      });
    },
  },
]);
```

### 模型分组

预设模型，以支持免费，付费的模型分离。

```ts
import {  ChatModelFactoryRegistry } from '@zhengxs/langchain-tools';

// 免费模型
export const free_registry = new ChatModelFactoryRegistry([
  {
    name: 'openai',
    test: /^gpt-/,
    include: ['gpt-3.5-turbo'], // 只支持 gpt-3.5-turbo
    options: {
      apiKey: process.env.OPENAI_FREE_API_KEY,
    }
  },
  {
    name: 'qianfan',
    test: /^ERNIE-Bot/,
    include: ['ERNIE-Bot-turbo'], // ERNIE-Bot-turbo
    options: {
      apiKey: process.env.QIANFAN_FREE_API_KEY,
      secretKey: process.env.QIANFAN_FREE_SECRET_KEY,
    }
  },
]);

// 付费模型
export const premium_registry = new ChatModelFactoryRegistry([
   {
    name: 'openai',
    test: /^gpt-/,
    options: {
      apiKey: process.env.OPENAI_PREMIUM_API_KEY,
    }
  },
  {
    name: 'qianfan',
    test: /^ERNIE-Bot/,
    options: {
      apiKey: process.env.QIANFAN_PREMIUM_API_KEY,
      secretKey: process.env.QIANFAN_PREMIUM_SECRET_KEY,
    }
  },
]);

export function build_chat_model(is_free, options) {
  if (is_free) {
    return free_registry.build(options);
  }

  return premium_registry.build(options);

}

const model = build_chat_model(is_free, {
  model: 'gpt-3.5-turbo'
});

```
