import type { WebpackConfiguration } from "./types";

export const parseLoader = (webpackConfig: WebpackConfiguration, ignore: string[] = []): WebpackConfiguration => {
  const getLoader = (loader: string) => {
    if (ignore.includes(loader)) return loader;
    return require.resolve(loader);
  };

  const resConfig = webpackConfig;

  if (!resConfig.module?.rules) return resConfig;

  resConfig.module.rules.forEach(rule => {
    if (typeof rule === 'string') return;

    if (rule.loader) {
      rule.loader = getLoader(rule.loader);
    }
    if (typeof rule.use === 'string') {
      rule.use = getLoader(rule.use);
    } else if (typeof rule.use === 'object') {
      if (!Array.isArray(rule.use)) {
        rule.use = [rule.use];
      }
      rule.use.forEach((useItem, index) => {
        if (typeof useItem === 'string') {
          // @ts-ignore
          rule.use[index] = getLoader(useItem);
        } else if (typeof useItem === 'object' && useItem.loader) {
          useItem.loader = getLoader(useItem.loader);
        }
      });
    }
  });

  return resConfig;
};
