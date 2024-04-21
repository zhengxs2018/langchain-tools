import { create_matcher, type Matcher } from '../helpers/create_matcher';
import type { LLMType } from '../types';

export abstract class ModelRegistryFactory<
  RegistrationInformation extends ModelFactoryInformation,
> {
  protected readonly mediator: Map<string, RegistrationInformation>;

  constructor(entries?: ModelFactoryInit[] | null) {
    this.mediator = new Map(
      entries?.map(item => [
        item.name,
        this.resolve_registration_information(item),
      ]),
    );
  }

  create_llm<Model = ReturnType<RegistrationInformation['create_llm']>>(
    options: { provider?: string; model?: string },
    context: NonNullable<unknown> = {},
  ): Model | undefined {
    let item: RegistrationInformation | undefined;

    if (options.provider) {
      item = this.mediator.get(options.provider);
    }

    if (!item && options.model) {
      item = this.search(options.model, context);
    }

    if (!item) return;

    return item.create_llm({ ...item.options, ...options }, context) as Model;
  }

  /**
   * @param query - name or model name
   * @returns registration information
   */
  search(query: string, context: NonNullable<unknown>) {
    const mediator = this.mediator;

    if (mediator.has(query)) {
      return mediator.get(query);
    }

    for (const info of mediator.values()) {
      if (
        typeof info.is_match === 'function' &&
        info.is_match(query, context)
      ) {
        return info;
      }
    }
  }

  register<T extends LLMType = LLMType>(init: ModelFactoryInit<T>) {
    if (this.mediator.has(init.name)) {
      console.warn(`LLMModel ${init.name} duplicate registration`);
    }

    this.append(this.resolve_registration_information(init));
  }

  append(info: RegistrationInformation) {
    this.mediator.set(info.name, info);
  }

  remove(name: string) {
    this.mediator.delete(name);
  }

  reset() {
    this.mediator.clear();
  }

  protected resolve_registration_information<T extends LLMType = LLMType>(
    init: ModelFactoryInit<T>,
  ) {
    // Omit the llm attribute
    const { llm, ...rest } = init;

    return <RegistrationInformation>{
      ...rest,
      name: init.name,
      options: init.options || {},
      is_match: this.resolve_model_matcher(init),
      create_llm: this.resolve_llm_engine(init),
    };
  }

  protected resolve_llm_engine<T extends LLMType = LLMType>(
    init: ModelFactoryInit<T>,
  ): RegistrationInformation['create_llm'] {
    const llm = init.llm;
    if (llm) return () => llm;

    const create_llm = init.create_llm;

    if (typeof create_llm === 'function') {
      return create_llm;
    }

    return this.create_llm_engine(init);
  }

  protected abstract create_llm_engine<T extends LLMType = LLMType>(
    init: ModelFactoryInit<T>,
  ): RegistrationInformation['create_llm'];

  protected resolve_model_matcher(
    init: ModelFactoryInit,
  ): RegistrationInformation['is_match'] {
    return create_matcher({
      test: init.test || init.provider || init.name,
      include: init.include,
      exclude: init.exclude,
    });
  }
}

export interface ModelFactoryInit<T extends LLMType = LLMType>
  extends Matcher.Rule {
  name: T;
  provider?: T;
  options?: object;
  create_llm?: (...args: any[]) => NonNullable<unknown>;
  [key: string]: unknown;
}

export interface ModelFactoryInformation<
  T extends LLMType = LLMType,
  Model = NonNullable<unknown>,
> {
  name: T;
  options: object;
  provider?: T;
  is_match?: Matcher.AssertPredicate<NonNullable<unknown>>;
  create_llm: (...args: any[]) => Model;
  [key: string]: unknown;
}
