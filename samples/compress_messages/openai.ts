import { chat_message_to_openai_role, ChatMessageCompressor } from '../../src';

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
    const label = chat_message_to_openai_role(message);

    if (label === 'user') {
      console.log(`${label}: ${message.content}`);
    } else {
      console.log(`${label}: ${message.content}\n\n`);
    }
  }
}

main();
