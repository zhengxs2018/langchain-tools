import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { messageToOpenAIRole } from '@langchain/openai';

import { ChatMessageCompressor } from '../../src';

async function main() {
  const compressor = new ChatMessageCompressor({
    user_label: 'User',
    assistant_label: 'Assistant',
    max_tokens: 100,
  });

  const messages = [
    new SystemMessage(
      'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: 2023-01-01',
    ),

    new HumanMessage('Hello, how are you?'),
    new AIMessage('I am doing well, thanks!'),

    new HumanMessage('What is your name?'),
    new AIMessage('My name is ChatGPT.'),

    new HumanMessage('What is your favorite color?'),
    new AIMessage('My favorite color is blue.'),

    new HumanMessage('What is your favorite food?'),
  ];

  const compressed = await compressor.compress(messages);

  for (const message of compressed) {
    const label = messageToOpenAIRole(message);

    if (label === 'user') {
      console.log(`${label}: ${message.content}`);
    } else {
      console.log(`${label}: ${message.content}\n\n`);
    }
  }
}

main();
