import { BaseMessage } from '@langchain/core/messages';
import { messageToOpenAIRole } from '@langchain/openai';
import { type OpenAI } from 'openai';

export type ChatMessage = BaseMessage | OpenAI.ChatCompletionMessageParam;

export function chat_message_to_openai_role(message: ChatMessage) {
  if (message instanceof BaseMessage) {
    return messageToOpenAIRole(message);
  }

  return message['role'];
}

export function chat_message_to_text(message: ChatMessage) {
  if (Array.isArray(message.content)) {
    const part = message.content.find(
      part => part.type === 'text',
    ) as OpenAI.ChatCompletionContentPartText;
    return part ? part.text : '';
  }

  return message.content || '';
}
