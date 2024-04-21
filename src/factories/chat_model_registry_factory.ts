import {
  create_openai_chat_model,
  create_chat_model_engine,
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

  /**
   * Generate a user-configured model or fallback to an openai model
   *
   * @param options - model options
   * @param context - is match context
   * @returns chat model
   *
   * @example
   *
   * ```ts
   * const registry = new ChatModelFactoryRegistry([
   *   {
   *     name: 'tongyi',
   *     test: /^(qwen|baichuan)/,
   *   },
   * ]);
   *
   * // Building with provider
   * registry.build({ provider: 'tongyi' })
   * //=> ChatAlibabaTongyi { }
   *
   * // Building with model
   * registry.build({ model: 'baichuan-7b-v1' })
   * //=> ChatAlibabaTongyi { }
   *
   * // fallback to openai model
   * registry.build({ model: 'llama2-13b-chat-v2' })
   * //=> ChatOpenAI { }
   * ```
   */
  build<T extends LLMType = LLMType>(
    options: ChatModelCallOptions<T> & { provider?: T },
    context?: NonNullable<unknown>,
  ): InferToChatModel<T> {
    const llm = this.create_llm(options, context) as InferToChatModel<T>;

    if (llm) return llm;

    // Note: fallback to openai model
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
   */
  search<T extends LLMType = LLMType>(
    query: InferToChatModelName<T>,
    context: NonNullable<unknown> = {},
  ) {
    return super.search(query, context);
  }

  protected create_llm_engine<T extends LLMType = LLMType>(
    init: ChatModelFactoryInit<T>,
  ): ChatModelCreateEngine<T> {
    return create_chat_model_engine(init.provider || init.name)
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
