const { intl } = window;

module.exports = [
  /*
  * 采购申请
  * */
  // {
  //   path: '/ssrc-hk/purchaseApplication',
  //   components: [
  //     {
  //       path: '/ssrc-hk/purchaseApplication',
  //       component: () => import('../routes/PurchaseApplication'),
  //       models: [() => import('../models/purchaseApplicationModel')],
  //       authorized: true,
  //     },
  //     {
  //       path: '/ssrc-hk/purchaseApplication/edit',
  //       component: () => import('../routes/PurchaseApplication/Edit'),
  //       models: [() => import('../models/purchaseApplicationModel')],
  //       authorized: true,
  //     },
  //   ]
  // },

  // {
  //   path: '/pub/ssrc-hk/purchaseApplication',
  //   components: [
  //     {
  //       path: '/pub/ssrc-hk/purchaseApplication',
  //       component: () => import('../routes/PurchaseApplication'),
  //       models: [() => import('../models/purchaseApplicationModel')],
  //       authorized: true,
  //     },
  //     {
  //       path: '/pub/ssrc-hk/purchaseApplication/edit',
  //       component: () => import('../routes/PurchaseApplication/Edit'),
  //       models: [() => import('../models/purchaseApplicationModel')],
  //       authorized: true,
  //     },
  //   ]
  // },
  // 采购实施+简易询价页面
  {
    path: '/ssrc-hk/purchase-implement-page',
    components: [
      {
        path: '/ssrc-hk/purchase-implement-page',
        models: [() => import('../models/simpleInquireModel')],
        component: () => import('../routes/PurchaseImplementPage'),
        title: '采购实施',
        authorized: true,
      },
      //:enter 进入页面方式 采购申请进入—— create   列表进入—— list
      //:createBy 如果是采购申请进入 createBy 值为 采购申请id？ 如果是列表进入 id为询价单号；
      {
        path: '/ssrc-hk/purchase-implement-page-detail',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/SimpleInquireDetailPage/Edit'),
        title: '询价详细页',
        authorized: true,
      },
    ],
  },

  {
    path: '/pub/ssrc-hk/purchase-implement-page',
    components: [
      {
        path: '/pub/ssrc-hk/purchase-implement-page',
        models: [() => import('../models/simpleInquireModel')],
        component: () => import('../routes/PurchaseImplementPage'),
        title: '采购实施',
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchase-implement-page-detail',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/SimpleInquireDetailPage/Edit'),
        title: '询价详细页',
        authorized: true,
      },
    ],
  },

  // 采购实施待办（不是由这边画）
  {
    components: [
      {
        path: '/ssrc-hk/purchase-implement-todo',
        models: [() => import('../models/evaluationList')],
        component: () => import('../routes/PurchaseImplementToDo'),
        title: '采购实施待办',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/purchase-implement-todo',
        models: [() => import('../models/evaluationList')],
        component: () => import('../routes/PurchaseImplementToDo'),
        title: '采购实施待办',
        authorized: true,
      },
    ],
  },


  // 报价文件详情页面
  // 采购中心采购申请询价单主表 id 
  // 关联采购申请ID refPrFirstId
  // 项目编码 projectNumber
  // 报价货币 currency
  // 轮次 rounds
  // 采购申请编号 prNumber
  // 采购申请名称 prName
  {
    components: [
      {
        path: '/ssrc-hk/quotation-document-detail-page',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/QuotationDocumentDetail'),
        title: '报价文件详情页面',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/quotation-document-detail-page',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/QuotationDocumentDetail'),
        title: '报价文件详情页面',
        authorized: true,
      },
    ],
  },

  // 价格汇总详细页
  // 采购中心采购申请询价单主表 id 
  // 关联采购申请ID refPrFirstId
  // 项目编码 projectNumber
  // 报价货币 currency
  {
    components: [
      {
        path: '/ssrc-hk/price-summary-detail-page',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/PriceSummaryDetail'),
        title: '价格汇总详细页',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/price-summary-detail-page',
        models: [() => import('../models/purchaseApplicationModel')],
        component: () => import('../routes/PriceSummaryDetail'),
        title: '价格汇总详细页',
        authorized: true,
      },
    ],
  },

  // 新的审批人操作页面简易询价1（价格汇总 + 完善物料）
  {
    components: [
      {
        path: '/ssrc-hk/demander-confirmation-implement',
        models: [() => import('../models/purchaseApplicationCusModel')],
        component: () => import('../routes/CusPriceSummaryDetail'),
        title: '需求人确认执行',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/demander-confirmation-implement',
        models: [() => import('../models/purchaseApplicationCusModel')],
        component: () => import('../routes/CusPriceSummaryDetail'),
        title: '需求人确认执行',
        authorized: true,
      },
    ],
  },

  // {
  //   components: [
  //     {
  //       path: '/ssrc-hk/demander-confirmation-implementCus',
  //       models: [() => import('../models/purchaseApplicationCusModel')],
  //       component: () => import('../routes/CusPriceSummaryDetail'),
  //       title: '需求人确认执行',
  //       authorized: true,
  //     },
  //   ],
  // },
  // {
  //   components: [
  //     {
  //       path: '/pub/ssrc-hk/demander-confirmation-implementCus',
  //       models: [() => import('../models/purchaseApplicationCusModel')],
  //       component: () => import('../routes/CusPriceSummaryDetail'),
  //       title: '需求人确认执行',
  //       authorized: true,
  //     },
  //   ],
  // },

  // 财务审批
  {
    components: [
      {
        path: '/ssrc-hk/financial-approval',
        models: [
          () => import('../models/purchaseApplicationModel'),
          () => import('../models/purchaseApplicationCusModel')
        ],
        component: () => import('../routes/FinancialApproval'),
        title: '财务审批',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/financial-approval',
        models: [
          () => import('../models/purchaseApplicationModel'),
          () => import('../models/purchaseApplicationCusModel')
        ],
        component: () => import('../routes/FinancialApproval'),
        title: '财务审批',
        authorized: true,
      },
    ],
  },


  // 采购方案+详细页面
  {
    components: [
      {
        path: '/ssrc-hk/purchase-plan-list',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlan'),
        title: '采购方案',
        authorized: true,
      },
      {
        // path: '/ssrc-hk/purchase-plan-list/detail/:prPlanNum/:listIntoFlag',
        path: '/ssrc-hk/purchase-plan-list/detail',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlanDetail/Edit'),
        title: '采购方案详细',
        authorized: true,
      },
      {
        // prPlanNum是方案编号！！！！但是如果是待办进来的就是申请号，但是在掉接口的不是在url上取参 
        path: '/ssrc-hk/purchase-plan-list/detail/castrate',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlanDetailOther/Edit'),
        title: '采购方案详细',
        authorized: true,
      },
      // 分标包
      // {
      //   path: '/ssrc-hk/purchase-plan-list/sub-package/:pacNum',
      //   // path: '/ssrc-hk/purchase-plan-list/sub-package',
      //   models: [() => import('../models/purchasePlan/purchasePlan')],
      //   component: () => import('../routes/SubPackage'),
      //   title: '分标包页面',
      //   authorized: true,
      // },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/purchase-plan-list',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlan'),
        title: '采购方案',
        authorized: true,
      },
      {
        // prPlanNum是方案编号！！！！但是如果是待办进来的就是申请号，但是在掉接口的不是在url上取参 
        path: '/pub/ssrc-hk/purchase-plan-list/detail',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlanDetail/Edit'),
        title: intl.get('hzero.common.title.procurement.plan').d('采购方案'),
        authorized: true,
      },
      {
        // 阉割版
        path: '/pub/ssrc-hk/purchase-plan-list/detail/castrate',
        models: [() => import('../models/purchasePlan/purchasePlan')],
        component: () => import('../routes/PurchasePlanDetailOther/Edit'),
        title: intl.get('hzero.common.title.procurement.plan').d('采购方案'),
        authorized: true,
      },
      // {
      //   path: '/pub/ssrc-hk/purchase-plan-list/sub-package/:pacNum',
      //   models: [() => import('../models/purchasePlan/purchasePlan')],
      //   component: () => import('../routes/SubPackage'),
      //   title: '分标包页面',
      //   authorized: true,
      // },
    ],
  },

  // ----------------------------50w <hkd<= 100w
  // 询价页（列表进入详情页）
  {
    path: '/ssrc-hk/single-interior/purchase-implement-page-detail',
    models: [() => import('../models/singlePurchaseApplicationModel')],
    component: () => import('../routes/SingleSimpleInquireDetailPage/Edit'),
    title: '采购实施',
    authorized: true,
  },
  {
    path: '/pub/ssrc-hk/single-interior/purchase-implement-page-detail',
    models: [() => import('../models/singlePurchaseApplicationModel')],
    component: () => import('../routes/SingleSimpleInquireDetailPage/Edit'),
    title: '采购实施',
    authorized: true,
  },

  // 报价文件详情页面
  // 采购中心采购申请询价单主表 id 
  // 关联采购申请ID refPrFirstId
  // 项目编码 projectNumber
  // 报价货币 currency
  // 轮次 rounds
  // 采购申请编号 prNumber
  // 采购申请名称 prName
  {
    components: [
      {
        path: '/ssrc-hk/single-interior/quotation-document-detail-page',
        models: [() => import('../models/singlePurchaseApplicationModel')],
        component: () => import('../routes/SingleQuotationDocumentDetail'),
        title: '报价文件详情页面',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/single-interior/quotation-document-detail-page',
        models: [() => import('../models/singlePurchaseApplicationModel')],
        component: () => import('../routes/SingleQuotationDocumentDetail'),
        title: '报价文件详情页面',
        authorized: true,
      },
    ],
  },
  // 价格汇总详细页
  // 采购中心采购申请询价单主表 id 
  // 关联采购申请ID refPrFirstId
  // 项目编码 projectNumber
  // 报价货币 currency
  {
    components: [
      {
        path: '/ssrc-hk/single-interior/price-summary-detail-page',
        models: [() => import('../models/singlePurchaseApplicationModel')],
        component: () => import('../routes/SinglePriceSummaryDetail'),
        title: '价格汇总详细页',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/single-interior/price-summary-detail-page',
        models: [() => import('../models/singlePurchaseApplicationModel')],
        component: () => import('../routes/SinglePriceSummaryDetail'),
        title: '价格汇总详细页',
        authorized: true,
      },
    ],
  },
  // 新的审批人操作页面简易询价2（价格汇总 + 完善物料）
  {
    components: [
      {
        path: '/ssrc-hk/single-interior/demander-confirmation-implement',
        models: [() => import('../models/singlePurchaseApplicationCusModel')],
        component: () => import('../routes/CusSingleDemanderConfirmation'),
        title: '需求人确认执行',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/single-interior/demander-confirmation-implement',
        models: [() => import('../models/singlePurchaseApplicationCusModel')],
        component: () => import('../routes/CusSingleDemanderConfirmation'),
        title: '需求人确认执行',
        authorized: true,
      },
    ],
  },

  // {
  //   components: [
  //     {
  //       path: '/ssrc-hk/single-interior/demander-confirmation-implementCus',
  //       models: [() => import('../models/singlePurchaseApplicationCusModel')],
  //       component: () => import('../routes/CusSingleDemanderConfirmation'),
  //       title: '需求人确认执行',
  //       authorized: true,
  //     },
  //   ],
  // },
  // {
  //   components: [
  //     {
  //       path: '/pub/ssrc-hk/single-interior/demander-confirmation-implementCus',
  //       models: [() => import('../models/singlePurchaseApplicationCusModel')],
  //       component: () => import('../routes/CusSingleDemanderConfirmation'),
  //       title: '需求人确认执行',
  //       authorized: true,
  //     },
  //   ],
  // },
  // 财务审批
  {
    components: [
      {
        path: '/ssrc-hk/single-interior/financial-approval',
        models: [
          () => import('../models/singlePurchaseApplicationModel'),
          () => import('../models/singlePurchaseApplicationCusModel')
        ],
        component: () => import('../routes/SingleFinancialApproval'),
        title: '财务审批',
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/single-interior/financial-approval',
        models: [
          () => import('../models/singlePurchaseApplicationModel'),
          () => import('../models/singlePurchaseApplicationCusModel')
        ],
        component: () => import('../routes/SingleFinancialApproval'),
        title: '财务审批',
        authorized: true,
      },
    ],
  },

  // 采购帮供应商录入报价
  {
    components: [
      {
        path: '/ssrc-hk/enter-quotation-detail',
        models: [() => import('../models/enterQuotationModel')],
        component: () => import('../routes/EnterQuotation'),
        authorized: true,
      },
    ],
  },
  {
    components: [
      {
        path: '/pub/ssrc-hk/enter-quotation-detail',
        models: [() => import('../models/enterQuotationModel')],
        component: () => import('../routes/EnterQuotation'),
        authorized: true,
        title: '报价文件'
      },
    ],
  },
];
