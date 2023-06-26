import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
// @ts-ignore
import PreloadPlugin from '@vue/preload-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import merge from './merge';
import { parseLoader } from './utils';
import type { WebpackPluginInstance } from 'webpack';
import type { CreateWebpackConfigFn, PageDescription, SpecialOpts, SpecialOptsFn, WebpackCfgFn, WebpackConfiguration } from './types';

export * from './help';

const defaultSpecialOpts: SpecialOpts = {};

const checkOpts = ({ page }: SpecialOpts) => {
  if (page) {
    if (Object.values(page).some((page: PageDescription) => !page.entry || !page.htmlTemplate || !page.filename)) {
      throw new Error('page参数必须拥有这些属性: entry, htmlTemplate, filename');
    }
  }
};

const getWebpackConfig = (isDev: boolean, specialOptsFn?: SpecialOptsFn, webpackCfgFn?: WebpackCfgFn): WebpackConfiguration => {
  const specialOpts = Object.assign({}, defaultSpecialOpts, specialOptsFn?.({ isDev }));

  checkOpts(specialOpts);

  const { android7Reg = /node_modules\/(?!(@dnd-kit|@sentry\/|@tiptap|recoil))/ } = specialOpts;
  // page
  const entry = specialOpts.page
    ? (Object.entries(specialOpts.page) as [string, PageDescription][]).reduce((res: any, [name, opt]) => {
      res[name] = opt.entry;
      return res;
    }, {})
    : {
      index: 'src/index.tsx',
    };
  const htmlPlugins: HtmlWebpackPlugin[] = specialOpts.page
    ? (Object.entries(specialOpts.page) as [string, PageDescription][])
      .map(([name, opt]) => new HtmlWebpackPlugin({
        template: opt.htmlTemplate,
        filename: opt.filename,
        title: opt.title,
        inject: 'body',
        chunks: [name],
        minify: {
          minifyCSS: true,
          minifyJS: true,
        },
        templateParameters: opt.templateParameters || {},
      }))
    : [
      new HtmlWebpackPlugin({
        template: path.resolve('./src/index.html'),
        filename: 'index.html',
        inject: 'body',
        chunks: ['index'],
        minify: {
          minifyCSS: true,
          minifyJS: true,
        },
      })
    ];

  let config: WebpackConfiguration = {
    mode: isDev ? 'development' : 'production',
    entry,
    output: {
      path: path.resolve('./build'),
      filename: '[name].[contenthash].js',
    },
    devtool: isDev ? 'source-map' : false,
    module: {
      rules: [{
        test: /\.(m?js|jsx|ts|tsx)$/,
        exclude: android7Reg,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                decorators: true,
              },
              minify: {
                compress: false,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDev,
                  refresh: isDev,
                },
              },
            },
            env: {
              coreJs: 3,
              mode: 'usage',
            },
            minify: true,
          },
        },
      }, {
        test: /\.(css|less)$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              esModule: false,
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ([
                  'postcss-preset-env',
                  specialOpts.disablePx2viewport
                    ? null
                    : (specialOpts.px2viewportOpts ?? {
                      'postcss-px-to-viewport': {
                        viewportWidth: 375,
                      },
                    }),
                ]).filter(Boolean),
              },
            },
          },
          'less-loader',
          specialOpts.styleResLoaderOpts ? {
            loader: 'style-resources-loader',
            options: specialOpts.styleResLoaderOpts,
          } : (null as any),
        ].filter(Boolean),
      }, {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 800,
          },
        }],
      }, {
        test: /\.(eot|ttf|woff2|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5120,
            },
          },
        ],
      }],
    },
    plugins: ([
      new CleanWebpackPlugin(),
      isDev ? new ReactRefreshWebpackPlugin() : null,
      ...htmlPlugins as WebpackPluginInstance[],
      new PreloadPlugin(),
      isDev
        ? null
        : new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
    ]).filter(Boolean),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'], // 可以省略的后缀名
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve('./tsconfig.json'),
        }),
      ],
    },
    optimization: {
      minimizer: [
        new CssMinimizerPlugin({
          parallel: true,
        }),
        '...',
      ],
    },
    externals: isDev ? {} : {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    devServer: {
      hot: true,
      port: specialOpts.port ?? 'auto',
      proxy: specialOpts.proxy ?? {},
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
      host: '0.0.0.0',
      allowedHosts: 'all',
      open: {
        app: {
          name: 'Google Chrome',
        },
      },
    },
  };
  config = parseLoader(config);

  return webpackCfgFn ? webpackCfgFn(config, { isDev, merge }) : config;
};

const createWebpackConfig: CreateWebpackConfigFn = (specialOptsFn, webpackCfgFn) => ({
  devWebpackConfig: getWebpackConfig(true, specialOptsFn, webpackCfgFn),
  buildWebpackConfig: getWebpackConfig(false, specialOptsFn, webpackCfgFn),
});

export default createWebpackConfig;
