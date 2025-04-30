const { intl } = window;

module.exports = [
  /*
  * ICT转售-查询列表-新增入口
  * */
  {
    path: '/ssrp-hk/purchaseInquiryQuery',
    components: [
      {
        path: '/ssrp-hk/purchaseInquiryQuery',
        component: () => import('../routes/PurchaseInquiryQuery'),
        models: [() => import('../models/purchaseInquiryQueryModel')],
        authorized: true,
      },
    ]
  },

  {
    path: '/pub/ssrp-hk/purchaseInquiryQuery',
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquiryQuery',
        component: () => import('../routes/PurchaseInquiryQuery'),
        models: [() => import('../models/purchaseInquiryQueryModel')],
        authorized: true,
      },
    ]
  },
  {
    components: [
      {
        path: '/ssrp-hk/purchaseInquirySheet/add',
        component: () => import('../routes/PurchaseInquirySheet'),
        models: [() => import('../models/purchaseInquirySheetModel')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquirySheet/add',
        component: () => import('../routes/PurchaseInquirySheet'),
        models: [() => import('../models/purchaseInquirySheetModel')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/ssrp-hk/purchaseInquirySheet/edit',
        component: () => import('../routes/PurchaseInquirySheet'),
        models: [() => import('../models/purchaseInquirySheetModel')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquirySheet/edit',
        component: () => import('../routes/PurchaseInquirySheet'),
        models: [() => import('../models/purchaseInquirySheetModel')],
        authorized: true,
      },
    ],
  },
  //提供给ERP页面
  {
    path: '/ssrp-hk/purchaseInquiryQueryErp',
    components: [
      {
        path: '/ssrp-hk/purchaseInquiryQueryErp',
        component: () => import('../routes/PurchaseInquiryQueryErp'),
        models: [() => import('../models/purchaseInquiryQueryModelErp')],
        authorized: true,
      },
    ]
  },

  {
    path: '/pub/ssrp-hk/purchaseInquiryQueryErp',
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquiryQueryErp',
        component: () => import('../routes/PurchaseInquiryQueryErp'),
        models: [() => import('../models/purchaseInquiryQueryModelErp')],
        authorized: true,
      },
    ]
  },
  {
    components: [
      {
        path: '/ssrp-hk/purchaseInquirySheetErp/Require',
        component: () => import('../routes/PurchaseInquirySheetErp/Require'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquirySheetErp/Require',
        component: () => import('../routes/PurchaseInquirySheetErp/Require'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/ssrp-hk/purchaseInquirySheetErp/Purchase',
        component: () => import('../routes/PurchaseInquirySheetErp/Purchase'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquirySheetErp/Purchase',
        component: () => import('../routes/PurchaseInquirySheetErp/Purchase'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
  {
    path: '/ssrp-hk/purchaseInquirySheetErp/edit',
    components: [
      {
        path: '/ssrp-hk/purchaseInquirySheetErp/edit',
        component: () => import('../routes/PurchaseInquirySheetErp'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
  {
    path: '/pub/ssrp-hk/purchaseInquirySheetErp/edit',
    components: [
      {
        path: '/pub/ssrp-hk/purchaseInquirySheetErp/edit',
        component: () => import('../routes/PurchaseInquirySheetErp'),
        models: [() => import('../models/purchaseInquirySheetModelErp')],
        authorized: true,
      },
    ],
  },
];
