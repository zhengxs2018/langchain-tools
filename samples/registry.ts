import { BaseMessage } from '@langchain/core/messages';

import { type ChatModelCallOptions, ChatModelFactoryRegistry } from '../src';

export const modeRegistry = new ChatModelFactoryRegistry([
   // 仅支持 ERNIE-Bot 模型
  {
    name: 'ERNIE-Bot',
    provider: 'qianfan',
    options: {
      apiKey: process.env.QIAN_FANG_API_KEY,
      secretKey: process.env.QIAN_FANG_SECRET_KEY,
    },
  },
  // 支持千问和百川系列模型
  {
    name: 'tongyi',
    test: /^(qwen|baichuan)/,
    options: {
      apiKey: process.env.QWEN_API_KEY,
    },
  },
  // 支持 llama 系列模型
  {
    name: 'llama',
    provider: 'tongyi',
    test: /^llama2-/,
    options: {
      model: 'llama2-7b-chat-v2',
      apiKey: process.env.QWEN_API_KEY,
    },
  },
]);

export async function call_ai(
  options: ChatModelCallOptions & { messages: BaseMessage[] },
) {
  const model = modeRegistry.build(options);

  console.log('Found: ', model.lc_namespace.join('/'));

  return model.invoke(options.messages);
}
