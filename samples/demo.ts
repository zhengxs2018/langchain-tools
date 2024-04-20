import { HumanMessage } from '@langchain/core/messages';
import 'dotenv/config';

import { call_ai } from './registry';

async function main() {
  try {
    const message = await call_ai({
      model: 'qwen-plus',
      // model: 'llama2-7b-chat-v2',
      messages: [new HumanMessage('hello')],
    });

    console.log('AI: %s', message.response_metadata, message.content);
  } catch (err) {
    console.error('[Error] %s', (err as Error).message);
  }
}

main();
