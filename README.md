# create-webpack-config

react-ts项目通用配置

## 默认配置概述

- dev和prod两种模式, 即各模式下的通用配置
- 默认入口: `/src/index.tsx` 和 默认出口: `/build`
- 代码、静态资源的处理
- 默认使用 px-to-viewport, 屏宽375
- 省略文件后缀名: .ts, .tsx, .js, .jsx, .less, .css
- 直接使用tsconfig.json里的路径缩写配置

## Use

webpack.config.js

```js
const { default: createWebpackConfig } = require('@hupu/create-webpack-config');

const { devWebpackConfig, buildWebpackConfig } = createWebpackConfig(
  // 设置特殊配置
  ({ isDev }) => ({
    px2viewportOpts: {
      viewportWidth: 375,
    },
  }),
  // 配置加工(在设置特殊配置之后)
  (webpackConfig, { isDev, merge }) => {
    webpackConfig = merge(webpackConfig, {
      devServer: {
        open: 'http://xxx.com:3000/a/b/c',
      },
    });
    // or
    // webpackConfig.devServer.open = 'http://xxx.com:3000/a/b/c';
    return webpackConfig;
  },
);
module.exports = process.env.NODE_ENV === 'development'
  ? devWebpackConfig
  : buildWebpackConfig;
```

## 特殊配置

#### page

默认为单个页面(入口为src/index.tsx)

设置单个页面:

```js
createWebpackConfig(() => ({
  page: 'src/home.tsx',
}));
```

设置多个页面:

```js
createWebpackConfig(() => ({
  page: {
    page1: {
      entry: 'src/page1/index.tsx',
      htmlTemplate: 'src/page1/index.html',
      filename: 'page1.html', // 生成的文件名
      title: 'page1',
    },
    page2: {
      entry: 'src/page2/index.tsx',
      htmlTemplate: 'src/page2/index.html',
      filename: 'page2.html', // 生成的文件名
      title: 'page2',
    },
  },
}));
```

#### port

webpackConfig.devServer.port 默认为'auto'

#### proxy

webpackConfig.devServer.proxy

#### styleResLoaderOpts

<https://www.npmjs.com/package/style-resources-loader>

#### px2viewportOpts

<https://www.npmjs.com/package/postcss-px-to-viewport>

默认为 ```{viewportWidth: 375}```

#### disablePx2viewport

默认为 `false`, 即开启

禁用 `postcss-px-to-viewport`

## utils

#### log

方便查看最终配置以排查问题

```js
const { default: createWebpackConfig, log } = require('@juln/create-webpack-config');

const { devWebpackConfig } = createWebpackConfig();

log(devWebpackConfig);
```

## Example

```js
const { default: createWebpackConfig } = require('@hupu/create-webpack-config');

const { devWebpackConfig, buildWebpackConfig } = createWebpackConfig(
  // 设置特殊配置
  (webpackConfig, { isDev }) => ({
    px2viewportOpts: {
      viewportWidth: 375,
    },
    proxy: {
      '/api': {
        target: 'https://api.api.api',
        pathRewrite: {
          '^/api': '/',
        },
        secure: false,
        changeOrigin: true,
        logLevel: 'debug',
      },
    },
  }),
  // 配置加工
  (webpackConfig, { isDev }) => {
    webpackConfig.externals = isDev ? {} : {
      'react': 'React',
      'react-dom': 'ReactDOM',
    };
    webpackConfig.devServer.open = 'http://xxx.com:3000/a/b/c';
    return webpackConfig;
  },
);

module.exports = process.env.NODE_ENV === 'development'
  ? devWebpackConfig
  : buildWebpackConfig;
```
