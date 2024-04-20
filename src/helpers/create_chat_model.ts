import { ChatAnthropic } from '@langchain/anthropic';
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';
import { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin';
import { ChatOpenAI } from '@langchain/openai';

import type { ChatModelCallOptions, InferToChatModel, LLMType } from '../types';

export function create_chat_model<T extends LLMType = LLMType>(
  provider: T | undefined,
  config: Partial<ChatModelCallOptions<T>>,
): InferToChatModel<T> {
  if (provider === 'anthropic') {
    return create_anthropic_chat_model(
      config as ChatModelCallOptions<'anthropic'>,
    ) as InferToChatModel<T>;
  }

  if (provider === 'qianfan') {
    return create_qianfan_chat_model(
      config as ChatModelCallOptions<'qianfan'>,
    ) as InferToChatModel<T>;
  }

  if (provider === 'tongyi') {
    return create_tongyi_chat_model(
      config as ChatModelCallOptions<'tongyi'>,
    ) as InferToChatModel<T>;
  }

  return create_openai_chat_model(
    config as ChatModelCallOptions<'openai'>,
  ) as InferToChatModel<T>;
}

export function create_anthropic_chat_model(
  config: ChatModelCallOptions<'anthropic'>,
) {
  return new ChatAnthropic({
    streaming: true,
    anthropicApiKey: config.apiKey,
    anthropicApiUrl: config.baseURL,
    model: config.model,
    temperature: config.temperature,
    stopSequences: config.stop,
    maxTokens: config.maxTokens,
    maxRetries: config.maxRetries,
    clientOptions: {
      ...config.clientOptions,
      timeout: config.timeout,
    },
  });
}

export function create_openai_chat_model(
  config: ChatModelCallOptions<'openai'>,
) {
  return new ChatOpenAI({
    streaming: true,
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    stop: config.stop,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
    maxTokens: config.maxTokens,
    configuration: {
      baseURL: config.baseURL,
      ...config.clientOptions,
    },
  });
}

export function create_qianfan_chat_model(
  config: ChatModelCallOptions<'qianfan'>,
) {
  return new ChatBaiduWenxin({
    streaming: true,
    baiduApiKey: config.apiKey,
    baiduSecretKey: config.secretKey,
    model: config.model,
    temperature: config.temperature,
    maxRetries: config.maxRetries,
    ...config.clientOptions,
  });
}

export function create_tongyi_chat_model(
  config: ChatModelCallOptions<'tongyi'>,
) {
  return new ChatAlibabaTongyi({
    streaming: true,
    alibabaApiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxRetries: config.maxRetries,
    maxTokens: config.maxTokens,
    enableSearch: true,
    ...config.clientOptions,
  });
}
