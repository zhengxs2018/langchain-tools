import type { ClientOptions as AnthropicCallOptions } from '@anthropic-ai/sdk';
import type { ChatAnthropic } from '@langchain/anthropic';
import type { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';
import type { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin';
import type { ChatOpenAI } from '@langchain/openai';
import type { OpenAI, ClientOptions as OpenAICallOptions } from 'openai';

export interface LangchainLLMConfig {
  anthropic: {
    chat_model_name:
      | (string & NonNullable<unknown>)
      | 'claude-2.1'
      | 'claude-3-opus-20240229'
      | 'claude-3-sonnet-20240229'
      | 'claude-3-haiku-20240307'
      | 'claude-2.0'
      | 'claude-instant-1.2';
    chat_model: ChatAnthropic;
    chat_client_options: AnthropicCallOptions;
  };
  openai: {
    chat_model_name: OpenAI.ChatModel;
    chat_model: ChatOpenAI;
    chat_client_options: OpenAICallOptions;
  };
  qianfan: {
    chat_model_name:
      | (string & NonNullable<unknown>)
      | 'ERNIE-Bot'
      | 'ERNIE-Bot-turbo'
      | 'ERNIE-Bot-4'
      | 'ERNIE-Speed-8K'
      | 'ERNIE-Speed-128K'
      | 'ERNIE-4.0-8K'
      | 'ERNIE-4.0-8K-Preview'
      | 'ERNIE-3.5-8K'
      | 'ERNIE-3.5-8K-Preview'
      | 'ERNIE-Lite-8K'
      | 'ERNIE-Tiny-8K'
      | 'ERNIE-Character-8K'
      | 'ERNIE Speed-AppBuilder';
    chat_model: ChatBaiduWenxin;
    chat_client_options: object;
  };
  tongyi: {
    chat_model_name:
      | (string & NonNullable<unknown>)
      | 'qwen-turbo'
      | 'qwen-plus'
      | 'qwen-max'
      | 'qwen-max-1201'
      | 'qwen-max-longcontext'
      | 'qwen-7b-chat'
      | 'qwen-14b-chat'
      | 'qwen-72b-chat'
      | 'llama2-7b-chat-v2'
      | 'llama2-13b-chat-v2'
      | 'baichuan-7b-v1'
      | 'baichuan2-13b-chat-v1'
      | 'baichuan2-7b-chat-v1'
      | 'chatglm3-6b'
      | 'chatglm-6b-v2';
    chat_model: ChatAlibabaTongyi;
    chat_client_options: object;
  };
}

export type LangchainLLMType = keyof LangchainLLMConfig;
