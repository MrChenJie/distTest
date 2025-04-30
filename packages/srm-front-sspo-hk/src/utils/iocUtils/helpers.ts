import { inject } from 'what-di';
import { getConfig } from 'hzero-boot';

import * as defaultConfig from '../config';
import { ConfigProvider } from './init';

let configureParams = 'false' as any;
// 适配未引入新版hzero-boot的情况
export function getEnvConfig<T>(): T {
  if (configureParams === 'false') {
    configureParams = {};
    const result = getConfig('configureParams');
    if (result) {
      if (typeof result === 'function') {
        configureParams = result();
      } else {
        configureParams = result;
      }
      configureParams = { configureParams };
    } else {
      configureParams = 'false';
    }
  }
  try {
    const _config = inject<ConfigProvider>('config') || {};
    return Object.assign(
      _config.config || defaultConfig,
      configureParams === 'false' ? { configureParams: {} } : configureParams
    ) as T;
  } catch {
    return Object.assign(
      defaultConfig,
      configureParams === 'false' ? { configureParams: {} } : configureParams
    ) as T;
  }
}

/**
 * 获取dvaApp
 */
export function getDvaApp(): any {
  const dvaApp = inject('dvaApp');
  return dvaApp || (<any>window).dvaApp;
}

/**
 * 拓展配置
 * @param conf { Object }
 */
export function extendsEnvConfig(conf: any): void {
  const _conf = inject<ConfigProvider>('config');
  _conf.extends(conf);
}
