import { mergeWithCustomize, unique, mergeWithRules } from 'webpack-merge';
import type { MergeFn } from './types';

const merge: MergeFn = mergeWithCustomize({
  customizeArray: unique(
    'plugins',
    ['MiniCssExtractPlugin'],
    (plugin) => plugin.constructor && plugin.constructor.name,
  ),
  customizeObject(a, b, key) {
    if (key === 'module') {
      // rules 和 use 必须转为数组, 否则 mergeWithRules 不支持合并
      const parse = (item: any) => {
        if (!item.rules) return item;
        if (!Array.isArray(item.rules)) {
          item.rules = [item.rules];
        }
        item.rules = item.rules.map((rule: any) => {
          if (!rule.use) return rule;
          if (!Array.isArray(rule.use)) {
            rule.use = [rule.use];
          }
          return rule;
        });
        return item;
      };

      return (mergeWithRules({
        module: {
          rules: {
            test: "match",
            use: {
              loader: "match",
              options: "merge",
            },
          },
        }
      })({ module: parse(a) }, { module: parse(b) }) as any).module;
    }
  },
});

export default merge;
