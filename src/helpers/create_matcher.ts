export namespace Matcher {
  export type AssertPredicate<Context = unknown> = (
    value: string,
    context: Context,
  ) => boolean;

  export type Condition<Context = unknown> =
    | false
    | null
    | undefined
    | string
    | RegExp
    | AssertPredicate<Context>;

  export type Rule<Context = unknown> = {
    test?: Condition<Context>;
    include?: Condition<Context> | Condition<Context>[];
    exclude?: Condition<Context> | Condition<Context>[];
  };
}

export function create_matcher<Context = unknown>(
  rule: Matcher.Rule<Context>,
): Matcher.AssertPredicate<Context> {
  const test = normalize_match_condition(rule.test);

  const include = create_assert_predicate(
    normalize_match_rules(rule.include),
    true,
  );
  const exclude = create_assert_predicate(
    normalize_match_rules(rule.exclude),
    false,
  );

  const is_match = (value: string, context: Context) => {
    if (include(value, context)) {
      return exclude(value, context);
    }

    return false;
  };

  if (!test) return is_match;

  return (value: string, context: Context) => {
    return test(value, context) && is_match(value, context);
  };
}

function create_assert_predicate<Context>(
  matches: Matcher.AssertPredicate<Context>[],
  pattern: boolean,
) {
  if (matches.length === 0) return () => true;

  if (pattern) {
    return (value: string, context: Context) => {
      return matches.some(predicate => predicate(value, context));
    };
  }

  return (value: string, context: Context) => {
    return matches.every(predicate => predicate(value, context)) === false;
  };
}

function normalize_match_rules<Context>(
  conditions?: Matcher.Condition<Context> | Matcher.Condition<Context>[],
): Matcher.AssertPredicate<Context>[] {
  if (conditions == null) return [];

  if (Array.isArray(conditions)) {
    return conditions.reduce((matches, condition) => {
      const predicate = normalize_match_condition(condition);

      if (predicate) matches.push(predicate);

      return matches;
    }, [] as Matcher.AssertPredicate<Context>[]);
  }

  const predicate = normalize_match_condition(conditions);

  return predicate ? [predicate] : [];
}

function normalize_match_condition<Context>(
  condition: Matcher.Condition<Context>,
): Matcher.AssertPredicate<Context> | undefined {
  // Skip false, null, undefined
  if (!condition) return;

  if (typeof condition === 'string') {
    condition = new RegExp(condition);
  }

  if (condition instanceof RegExp) {
    return (value: string) => condition.test(value);
  }

  if (typeof condition === 'function') {
    return condition;
  }

  throw new Error(`Invalid rule: ${condition}`);
}
