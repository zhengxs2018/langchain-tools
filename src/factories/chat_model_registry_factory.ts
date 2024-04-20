import { BaseChatModel } from '@langchain/core/language_models/chat_models';

import {
  create_chat_model,
  create_openai_chat_model,
} from '../helpers/create_chat_model';
import type {
  ChatModelCallOptions,
  InferToChatModel,
  InferToChatModelName,
  LLMType,
} from '../types';
import {
  type ModelFactoryInformation,
  type ModelFactoryInit,
  ModelRegistryFactory,
} from './model_registry_factory';

export class ChatModelFactoryRegistry extends ModelRegistryFactory<
  ChatModelFactoryInformation<any>
> {
  constructor(entries?: ChatModelFactoryInit<any>[] | null) {
    super(entries);
  }

  build<T extends LLMType = LLMType>(
    options: ChatModelCallOptions<T> & { provider?: T },
    context?: NonNullable<unknown>,
  ): InferToChatModel<T> {
    const llm = this.create_llm(options, context) as InferToChatModel<T>;

    if (llm) return llm;

    return create_openai_chat_model(
      options as ChatModelCallOptions<'openai'>,
    ) as InferToChatModel<T>;
  }

  register<T extends LLMType = LLMType>(init: ChatModelFactoryInit<T>) {
    return super.register(init);
  }

  /**
   * Search for a registration information that matches the given query.
   *
   * @param query - name or model name
   * @param context - is match context
   * @returns registration information
   *
   * @example
   *
   * ```ts
   * const registry = new ChatModelFactoryRegistry([
   *   {
   *      name: 'openai',
   *   }
   * ])
   *
   * registry.search('openai')
   * ```
   */
  search<T extends LLMType = LLMType>(
    query: InferToChatModelName<T>,
    context: NonNullable<unknown> = {},
  ) {
    return super.search(query, context);
  }

  protected resolve_llm_engine<T extends LLMType = LLMType>(
    init: ChatModelFactoryInit<T>,
  ): ChatModelCreateEngine<T> {
    const llm = init.llm;

    if (llm && llm instanceof BaseChatModel) return () => llm;

    const create_llm = init.create_llm;

    if (typeof create_llm === 'function') {
      return create_llm;
    }

    const provider = init.provider || init.name;

    return (options: ChatModelCallOptions<T>) => {
      return create_chat_model(provider, options);
    };
  }
}

export type ChatModelCreateEngine<T extends LLMType = LLMType> = (
  config: ChatModelCallOptions<T>,
  context: NonNullable<unknown>,
) => InferToChatModel<T>;

export interface ChatModelFactoryInit<T extends LLMType = LLMType>
  extends ModelFactoryInit<T> {
  llm?: InferToChatModel<T>;
  options?: ChatModelCallOptions<T>;
  create_llm?: ChatModelCreateEngine<T>;
}

export interface ChatModelFactoryInformation<T extends LLMType = LLMType>
  extends ModelFactoryInformation<T, InferToChatModel<T>> {
  options: ChatModelCallOptions<T>;
  create_llm: ChatModelCreateEngine<T>;
}
