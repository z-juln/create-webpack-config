import type { Configuration as SimpleWebpackConfiguration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import type { IOptions as GlobIOptions } from 'glob';
import type HtmlWebpackPlugin from 'html-webpack-plugin';

export interface WebpackConfiguration extends SimpleWebpackConfiguration {
  devServer?: DevServerConfiguration;
}

interface Px2ViewOpts {
  unitToConvert?: `${string}px`;
  viewportWidth?: number;
  unitPrecision?: number;
  propList?: string[];
  viewportUnit?: string;
  fontViewportUnit?: string;
  selectorBlackList?: (string|RegExp)[];
  minPixelValue?: number;
  mediaQuery?: boolean;
  replace?: boolean;
  exclude?: RegExp | RegExp[];
  landscape?: Boolean;
  landscapeUnit?: string;
  landscapeWidth?: number;
}

interface StyleResLoaderOpts {
  patterns: string | string[];
  injector?: 'prepend' | 'append' | {
    file: string;
    content: string;
  }[];
  globOptions?: GlobIOptions;
  resolveUrl?: boolean;
}

export interface PageDescription {
  entry: string;
  htmlTemplate: string;
  filename: string;
  title?: string;
  templateParameters?: HtmlWebpackPlugin.Options['templateParameters'];
}

export interface SpecialOpts {
  page?: string | Record<string, PageDescription>;
  port?: DevServerConfiguration['port'];
  proxy?: DevServerConfiguration['proxy'];
  styleResLoaderOpts?: StyleResLoaderOpts;
  px2viewportOpts?: Px2ViewOpts | null;
  disablePx2viewport?: boolean;
  android7Reg?: RegExp;
};

export type SpecialOptsFn = ({ isDev }: { isDev: boolean }) => SpecialOpts;
export type MergeFn = (firstConfiguration: WebpackConfiguration | WebpackConfiguration[], ...configurations: WebpackConfiguration[]) => WebpackConfiguration;
export type WebpackCfgFn = (webpackConfig: WebpackConfiguration, { isDev, merge }: { isDev: boolean, merge: MergeFn }) => WebpackConfiguration;

export type CreateWebpackConfigFn = (specialOptsFn?: SpecialOptsFn, webpackCfgFn?: WebpackCfgFn) =>
  { devWebpackConfig: WebpackConfiguration, buildWebpackConfig: WebpackConfiguration };
