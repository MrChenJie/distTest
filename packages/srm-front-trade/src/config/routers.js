const { intl } = window;

module.exports = [
  // --------------- 活动申请 ----------------
  {
    authorized: true,
    path: '/platform/activey-application',
    components: [
      {
        authorized: true,
        path: '/platform/activey-application/list',
        component: () => import('../routes/ActiveApplicationList'),
        models: [() => import('../models/activeApplicationListModal')],
      },
      {
        authorized: true,
        path: '/platform/activey-application/Detail',
        component: () => import('../routes/ActiveApplicationList/Detail'),
        models: [() => import('../models/activeApplicationListModal')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/platform/activey-application',
    components: [
      {
        authorized: true,
        path: '/pub/platform/activey-application/list',
        component: () => import('../routes/ActiveApplicationList'),
        models: [() => import('../models/activeApplicationListModal')],
        title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      },
      {
        authorized: true,
        path: '/pub/platform/activey-application/Detail',
        component: () => import('../routes/ActiveApplicationList/Detail'),
        models: [() => import('../models/activeApplicationListModal')],
      },
      {
        authorized: true,
        title: intl.get(`hzero.common.title.pub.spub.interfaceErrors1`).d('活动申请导入'),
        path: '/pub/platform/activey-application/Detail/import',
        component: () => import('../routes/ActiveApplicationList/Import'),
      },
    ],
  },

  // --------------- 竞价管理 ----------------
  {
    authorized: true,
    path: '/platform/bid-management',
    components: [
      {
        authorized: true,
        path: '/platform/bid-management/list',
        component: () => import('../routes/BidManagementList'),
        models: [() => import('../models/bidManagementListModal')],
      },
      {
        authorized: true,
        path: '/platform/bid-management/Detail/:formRecordId',
        component: () => import('../routes/BidManagementList/Detail'),
        models: [() => import('../models/bidManagementListModal')],
        title: intl.get(`hzero.common.title.BidManageDetail`).d('竞价管理详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/platform/bid-management',
    components: [
      {
        authorized: true,
        path: '/pub/platform/bid-management/list',
        component: () => import('../routes/BidManagementList'),
        models: [() => import('../models/bidManagementListModal')],
        title: intl.get(`hzero.common.title.BidManagement`).d('竞价管理'),
      },
      {
        authorized: true,
        path: '/pub/platform/bid-management/Detail/:formRecordId',
        component: () => import('../routes/BidManagementList/Detail'),
        models: [() => import('../models/bidManagementListModal')],
        title: intl.get(`hzero.common.title.BidManageDetail`).d('竞价管理详情'),
      },
    ],
  },

  // --------------报价详情-------------
  {
    authorized: true,
    path: '/platform/quotation/Detail',
    component: () => import('../routes/QuotationDetail'),
    models: [() => import('../models/quotationDetailModal')],
    title: intl.get(`hzero.common.title.pub.spub.PurchaseApiList1`).d('报价详情'),
  },
  {
    authorized: true,
    path: '/pub/platform/quotation/Detail',
    component: () => import('../routes/QuotationDetail'),
    models: [() => import('../models/quotationDetailModal')],
    title: intl.get(`hzero.common.title.pub.spub.PurchaseApiList1`).d('报价详情'),
  },

  // --------------- 贸易商付款凭证 ----------------
  {
    authorized: true,
    path: '/platform/payTrade',
    components: [
      {
        authorized: true,
        path: '/platform/payTrade/list',
        component: () => import('../routes/PayTrade'),
        models: [() => import('../models/payTradeModal')],
      },
      {
        authorized: true,
        path: '/platform/payTrade/Detail',
        component: () => import('../routes/PayTrade/Detail'),
        models: [() => import('../models/payTradeModal')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/platform/payTrade',
    components: [
      {
        authorized: true,
        path: '/pub/platform/payTrade/list',
        component: () => import('../routes/PayTrade'),
        models: [() => import('../models/payTradeModal')],
        title: intl.get(`hzero.common.title.TraderPayList`).d('贸易商付款凭证'),
      },
      {
        authorized: true,
        path: '/pub/platform/payTrade/Detail',
        component: () => import('../routes/PayTrade/Detail'),
        models: [() => import('../models/payTradeModal')],
        title: intl.get(`hzero.common.title.TraderPayList`).d('贸易商付款凭证'),
      },
    ],
  },
  
  //test
  // MyLink 简体sc
  {
    authorized: true,
    path: '/external/sc/public/platform/register/mylink',
    component: () => import('../routes/RegisterTest/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },
  // MyLink 英文en
  {
    authorized: true,
    path: '/external/en/public/platform/register/mylink',
    component: () => import('../routes/RegisterTest/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },
  // MyLink 繁体tc
  {
    authorized: true,
    path: '/external/tc/public/platform/register/mylink',
    component: () => import('../routes/RegisterTest/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },

  //DICT 简体sc
  {
    authorized: true,
    path: '/external/sc/public/platform/register/dict',
    component: () => import('../routes/RegisterTest/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },
  //DICT 英文en
  {
    authorized: true,
    path: '/external/en/public/platform/register/dict',
    component: () => import('../routes/RegisterTest/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },
  //DICT 繁体tc
  {
    authorized: true,
    path: '/external/tc/public/platform/register/dict',
    component: () => import('../routes/RegisterTest/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },
    //招标公告 简体sc
    {
      authorized: true,
      path: '/external/sc/public/platform/register/bid-notice/:noticeId',
      component: () => import('../routes/RegisterTest/BidNotice'),
      models: [() => import('../models/registerBidModel')],
      title: '招标公告官网报名',
    },
    //招标公告 英文en
    {
      authorized: true,
      path: '/external/en/public/platform/register/bid-notice/:noticeId',
      component: () => import('../routes/RegisterTest/BidNotice'),
      models: [() => import('../models/registerBidModel')],
      title: '招标公告官网报名',
    },
    //招标公告 繁体tc
    {
      authorized: true,
      path: '/external/tc/public/platform/register/bid-notice/:noticeId',
      component: () => import('../routes/RegisterTest/BidNotice'),
      models: [() => import('../models/registerBidModel')],
      title: '招标公告官网报名',
    },

  //sdk对接
  // MyLink 简体sc
  {
    authorized: true,
    path: '/hande/external/sc/public/platform/register/mylink',
    component: () => import('../routes/Register/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },
  // MyLink 英文en
  {
    authorized: true,
    path: '/hande/external/en/public/platform/register/mylink',
    component: () => import('../routes/Register/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },
  // MyLink 繁体tc
  {
    authorized: true,
    path: '/hande/external/tc/public/platform/register/mylink',
    component: () => import('../routes/Register/MyLink'),
    models: [() => import('../models/registerMyLinkModel')],
    title: 'MyLink官网报名',
  },

  //DICT 简体sc
  {
    authorized: true,
    path: '/hande/external/sc/public/platform/register/dict',
    component: () => import('../routes/Register/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },
  //DICT 英文en
  {
    authorized: true,
    path: '/hande/external/en/public/platform/register/dict',
    component: () => import('../routes/Register/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },
  //DICT 繁体tc
  {
    authorized: true,
    path: '/hande/external/tc/public/platform/register/dict',
    component: () => import('../routes/Register/DICT'),
    models: [() => import('../models/registerDICTModel')],
    title: 'DICT官网报名',
  },

  //招标公告 简体sc
  {
    authorized: true,
    path: '/hande/external/sc/public/platform/register/bid-notice/:noticeId',
    component: () => import('../routes/Register/BidNotice'),
    models: [() => import('../models/registerBidModel')],
    title: '招标公告官网报名',
  },
  //招标公告 英文en
  {
    authorized: true,
    path: '/hande/external/en/public/platform/register/bid-notice/:noticeId',
    component: () => import('../routes/Register/BidNotice'),
    models: [() => import('../models/registerBidModel')],
    title: '招标公告官网报名',
  },
  //招标公告 繁体tc
  {
    authorized: true,
    path: '/hande/external/tc/public/platform/register/bid-notice/:noticeId',
    component: () => import('../routes/Register/BidNotice'),
    models: [() => import('../models/registerBidModel')],
    title: '招标公告官网报名',
  },
];
