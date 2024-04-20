import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import type { LangchainLLMConfig, LangchainLLMType } from './langchain';

export interface LLMConfigItem {
  chat_model_name: string;
  chat_model: BaseChatModel;
  chat_client_options: object;
}

/**
 * 提供给外部拓展的配置类型
 *
 * @example
 * ```ts
 * declare module '@zhengxs/llm-factory' {
 *   export interface ExtendableLLMConfig {
 *     'extend-llm': {
 *       chat_model_name: 'custom-turbo'
 *       chat_model: CustomChatModel;
 *     };
 *   }
 * }
 * ```
 */
export interface ExtendableLLMConfig {}

export interface LLMConfig extends LangchainLLMConfig, ExtendableLLMConfig {
  [key: string]: LLMConfigItem;
}

export type ExtendableLLMType = keyof ExtendableLLMConfig;

export type LLMType =
  | (NonNullable<unknown> & string)
  | LangchainLLMType
  | ExtendableLLMType;
