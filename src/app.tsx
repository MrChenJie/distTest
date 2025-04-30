// 全局配置
// import React from 'react';
// @ts-ignore
import { IHzeroConfig } from 'hzero-front/lib/typings/IHzeroConfig';

import c7nConfig from './c7nConfig.js';

c7nConfig();

// antd table组件线上需要忽略这个报错
window.addEventListener('error', function onError(e) {
  // Ignore ResizeObserver error
  if (e.message === 'ResizeObserver loop limit exceeded') {
    console.warn('Ignored: ResizeObserver loop limit exceeded');
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    console.warn('Ignored: ResizeObserver loop completed with undelivered notifications.');
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
});

// 设置 dvaApp.router 的根路由
export default {
  dvaRootRouter: () => require('./router').default,
} as IHzeroConfig;
