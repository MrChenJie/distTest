module.exports = [
  {
    path: "/hitf/application",
    component: () => import('../routes/Application'),
    models: [
      () => import('../models/application')
    ]
  },
  {
    path: "/hitf/interface-logs",
    models: [
      () => import('../models/interfaceLogs')
    ],
    components: [
      {
        path: "/hitf/interface-logs/list",
        component: () => import('../routes/InterfaceLogs'),
        models: [
          () => import('../models/interfaceLogs')
        ]
      },
      {
        path: "/hitf/interface-logs/detail/:interfaceLogId",
        component: () => import('../routes/InterfaceLogs/Detail'),
        models: [
          () => import('../models/interfaceLogs')
        ]
      },
    ]
  },
  {
    path: "/hitf/services",
    models: [
      () => import('../models/services')
    ],
    components: [
      {
        path: "/hitf/services/list",
        component: () => import('../routes/Services'),
        models: [
          () => import('../models/services')
        ],
      },
      {
        path: "/hitf/services/detail/:id",
        component: () => import('../routes/Services/Detail'),
        models: [
          () => import('../models/services')
        ],
      },
      {
        path: "/hitf/services/create",
        component: () => import('../routes/Services/Detail'),
        models: [
          () => import('../models/services')
        ],
      },
    ]
  },
  {
    path: "/hitf/interface-statistics",
    component: () => import('../routes/InterfaceStatistics'),
    models: [
      () => import('../models/interfaceStatistics')
    ],
  },
  {
    path: "/hitf/client-auth",
    component: () => import('../routes/ClientAuth'),
    models: [
      () => import('../models/clientAuth')
    ],
  },
  {
    path: "/hitf/interfaces",
    models: [
      () => import('../models/interfaces')
    ],
    components: [
      {
        path: "/hitf/interfaces/list",
        component: () => import('../routes/Interfaces'),
        models: [
          () => import('../models/interfaces')
        ],
      },
      {
        path: "/hitf/interfaces/auth-config/:interfaceId",
        component: () => import('../routes/Interfaces/AuthConfig'),
        models: [
          () => import('../models/interfaces')
        ],
      },
    ]
  },
  {
    path: "/hitf/client-role",
    component: () => import('../routes/ClientRole'),
    models: [
      () => import('../models/clientRole')
    ],
  },
  {
    path: "/pub/hitf/document-view/:interfaceId",
    component: () => import('../routes/Services/DocumentView'),
    authorized: true, // authorized 不需要菜单权限就可以打开的页面
    key: '/pub/hitf/document-view/:interfaceId',
    models: [
      () => import('../models/services')
    ],
  },
  {
    path: "/hitf/application-type-definition",
    components: [
      {
        path: "/hitf/application-type-definition/list",
        component: () => import('../routes/TypeDefinition/List'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: "/hitf/application-type-definition/detail/:id",
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
      {
        path: "/hitf/application-type-definition/create",
        component: () => import('../routes/TypeDefinition/Detail'),
        models: [() => import('../models/typeDefinition')],
      },
    ]
  },
];
