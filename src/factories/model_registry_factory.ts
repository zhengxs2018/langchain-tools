import { create_matcher, type Matcher } from '../helpers/create_matcher';
import type { LLMType } from '../types';

export abstract class ModelRegistryFactory<
  RegistrationInformation extends ModelFactoryInformation,
> {
  protected readonly mediator: Map<string, RegistrationInformation>;

  constructor(entries?: ModelFactoryInit[] | null) {
    this.mediator = new Map(
      entries?.map(item => [item.name, this.resolve_meta_information(item)]),
    );
  }

  create_llm(
    options: { provider?: string; model?: string },
    context: NonNullable<unknown> = {},
  ): unknown {
    let item: RegistrationInformation | undefined;

    if (options.provider) {
      item = this.mediator.get(options.provider);
    }

    if (!item && options.model) {
      item = this.search(options.model, context);
    }

    if (!item) return;

    return item.create_llm({ ...item.options, ...options }, context);
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

    this.append(this.resolve_meta_information(init));
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

  protected resolve_meta_information<T extends LLMType = LLMType>(
    init: ModelFactoryInit<T>,
  ) {
    return <RegistrationInformation>{
      name: init.name,
      options: init.options || {},
      is_match: this.resolve_model_matcher(init),
      create_llm: this.resolve_llm_engine(init),
    };
  }

  protected abstract resolve_llm_engine<T extends LLMType = LLMType>(
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
}

// export type ModelCreator = (...args: any[]) => any;

export interface ModelFactoryInformation<
  T extends LLMType = LLMType,
  Model = NonNullable<unknown>,
> {
  name: T;
  is_match?: Matcher.AssertPredicate<NonNullable<unknown>>;
  options: object;
  create_llm: (...args: any[]) => Model;
}
