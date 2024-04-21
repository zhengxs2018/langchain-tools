# 对话消息压缩器

AI 的上下文是有限的，需要压缩聊天记录，以减少存储容量。

## 压缩消息

目前采取的是消息裁减。单纯的消息裁减是一种简单的方法，但可能会丢失一些重要的信息。

较为理想的方式是使用 AI 生成记忆胶囊，或者提供知识库。

```ts
import { chat_message_to_openai_role, ChatMessageCompressor } from '../src/factories/chat_message_compressor';

async function main() {
  const compressor = new ChatMessageCompressor({
    user_label: 'User',
    assistant_label: 'Assistant',
    max_tokens: 100,
  });

  const compressed = await compressor.compress([
    {
      role: 'system',
      content:
        'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: 2023-01-01',
    },
    {
      role: 'user',
      content: 'Hello, how are you?',
    },
    {
      role: 'assistant',
      content: 'I am doing well, thanks!',
    },
    {
      role: 'user',
      content: 'What is your name?',
    },
    {
      role: 'assistant',
      content: 'My name is ChatGPT.',
    },
    {
      role: 'user',
      content: 'What is your favorite color?',
    },
    {
      role: 'assistant',
      content: 'My favorite color is blue.',
    },
    {
      role: 'user',
      content: 'What is your favorite food?',
    },
  ]);

  for (const message of compressed) {
    const label = chat_message_to_openai_role(message)

    if (label === 'user') {
      console.log(`${label}: ${message.content}`);
    } else {
      console.log(`${label}: ${message.content}\n\n`);
    }
  }
}

main();
```

在确保 system 和 最后一个 message 之间的消息内容，不会出现超出 max_tokens 的情况下，压缩消息。

```text
system: You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.
Knowledge cutoff: 2021-09-01
Current date: 2023-01-01

user: What is your name?
assistant: My name is ChatGPT.

user: What is your favorite color?
assistant: My favorite color is blue.

user: What is your favorite food?
```
