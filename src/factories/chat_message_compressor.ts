import { BaseMessage } from '@langchain/core/messages';
import { type TiktokenEncoding } from 'js-tiktoken';
import { type OpenAI } from 'openai';

import {
  chat_message_to_openai_role,
  chat_message_to_text,
  type ChatMessage,
} from '../helpers/chat_message';
import {
  get_encoding,
  type MessageEncoder,
} from '../helpers/create_message_encoder';

export interface ChatMessageCompressOptions {
  encoding?: TiktokenEncoding;
  max_tokens?: number;
  user_label?: string;
  assistant_label?: string;
}

export class ChatMessageCompressor {
  encoder: MessageEncoder;
  max_tokens: number;

  user_label: string;
  assistant_label: string;

  constructor(options: ChatMessageCompressOptions = {}) {
    this.encoder = get_encoding(options.encoding);

    this.user_label = options.user_label || 'User';
    this.assistant_label = options.assistant_label || 'Assistant';
    this.max_tokens = options.max_tokens || 4000;
  }

  async compress<Message extends ChatMessage = ChatMessage>(
    messages: Message[],
  ): Promise<Message[]> {
    if (messages.length === 0) return [];

    const has_system_message =
      chat_message_to_openai_role(messages[0]) === 'system';
    const system_message_offset = has_system_message ? 1 : 0;

    const chat_messages = messages.slice(system_message_offset);

    // TODO Need to make sure the last one is a user prompt message?
    const user_prompt_message = chat_messages.pop()!;

    function* get_next_messages(): Generator<
      readonly [Message, Message],
      void,
      unknown
    > {
      let ai_message: Message | undefined;

      while (chat_messages.length) {
        const message = chat_messages.pop();
        if (!message) break;

        if (chat_message_to_openai_role(message) === 'user') {
          // invalid user message
          if (!ai_message) continue;

          yield [message, ai_message] as const;
        } else {
          ai_message = message;
        }
      }
    }

    const compressed_messages: Message[] = has_system_message ? [] : [];

    const max_tokens = this.max_tokens;

    for (const [ai, user] of get_next_messages()) {
      const next_messages = compressed_messages.concat(
        ai,
        user,
        user_prompt_message,
      );

      if (has_system_message) {
        next_messages.push(messages[0]);
      }

      const message_tokens = await this.calculate(next_messages);

      if (message_tokens <= max_tokens) {
        compressed_messages.unshift(ai, user);
      } else {
        break;
      }
    }

    if (has_system_message) {
      compressed_messages.unshift(messages[0]);
    }

    return compressed_messages.concat(user_prompt_message);
  }

  async calculate(
    messages: (BaseMessage | OpenAI.ChatCompletionMessageParam)[],
  ): Promise<number> {
    const user_label = this.user_label;
    const assistant_label = this.assistant_label;

    const prompt = messages
      .reduce((prompt, message) => {
        const content = chat_message_to_text(message);

        switch (chat_message_to_openai_role(message)) {
          case 'system':
            return prompt.concat([`Instructions:\n${content}`]);
          case 'user':
            return prompt.concat([`${user_label}:\n${content}`]);
          default:
            return prompt.concat([`${assistant_label}:\n${content}`]);
        }
      }, [] as string[])
      .join('\n\n');

    return this.encoder.calculate_tokens(prompt);
  }
}
