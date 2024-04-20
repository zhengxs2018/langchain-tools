import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import type { LangchainLLMType } from './langchain';
import type { ExtendableLLMType, LLMConfig, LLMType } from './llm';

export interface ChatModelCallOptions<T extends LLMType = LLMType> {
  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   */
  baseURL?: string;
  /**
   * API key to use when making requests to LLM Server.
   */
  apiKey?: string | undefined;
  /**
   * Secret key to use when making requests.
   *
   * For example: ChatBaiduWenxin
   */
  secretKey?: string | undefined;
  /**
   * The name of the model to use.
   */
  model?: (string & {}) | InferToChatModelName<T> | undefined;
  /** Amount of randomness injected into the response. Ranges
   * from 0 to 1. Use temp closer to 0 for analytical /
   * multiple choice, and temp closer to 1 for creative
   * and generative tasks.
   */
  temperature?: number;
  /** A maximum number of tokens to generate before stopping. */
  maxTokens?: number;
  /**
   * A list of strings to use as stop words.
   */
  stop?: string[] | undefined;
  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number | undefined;
  /**
   * The maximum number of retries to make when a request fails.
   */
  maxRetries?: number | undefined;
  /**
   * Client options to pass to the LLM client.
   */
  clientOptions?: InferToChatClientOptions<T> | undefined;
}

export type InferToChatModelName<T = LLMType> = T extends LangchainLLMType
  ? LLMConfig[T]['chat_model_name']
  : T extends ExtendableLLMType
    ? LLMConfig[T]['chat_model_name']
    : T;

export type InferToChatModel<T = LLMType> = T extends LangchainLLMType
  ? LLMConfig[T]['chat_model']
  : T extends ExtendableLLMType
    ? LLMConfig[T]['chat_model']
    : BaseChatModel;

export type InferToChatClientOptions<T = LLMType> = T extends LangchainLLMType
  ? LLMConfig[T]['chat_client_options']
  : T extends ExtendableLLMType
    ? LLMConfig[T]['chat_client_options']
    : object;
