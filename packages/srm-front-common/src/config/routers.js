/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-10 16:21:07
 * Copyright (c) 2024, All Rights Reserved. 
 */
const { intl } = window;

module.exports = [
  {
    authorized: true,
    path: '/spub/test',
    components: [
      {
        authorized: true,
        path: '/spub/test/list',
        component: () => import('../routes/Test'),
        models: [() => import('../models/interfaceErrors')],
      },
      {
        authorized: true,
        path: '/spub/test/detail/:interfaceLogId',
        component: () => import('../routes/Test/Detail'),
        models: [() => import('../models/interfaceErrors')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/spub/test',
    components: [
      {
        authorized: true,
        path: '/pub/spub/test/list',
        component: () => import('../routes/Test'),
        models: [() => import('../models/interfaceErrors')],
      },
      {
        authorized: true,
        path: '/pub/spub/test/detail/:interfaceLogId',
        component: () => import('../routes/Test/Detail'),
        models: [() => import('../models/interfaceErrors')],
      },
    ],
  },
  {
    authorized: true,
    path: '/upload/list',
    component: () => import('../routes/UploadAND'),
    // models: [() => import('../models/interfaceErrors')],
  },
];
