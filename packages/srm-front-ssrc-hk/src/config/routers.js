const { intl } = window;

module.exports = [
  /*
   * 采购申请
   * */
  {
    path: '/ssrc-hk/purchaseApplication',
    components: [
      {
        path: '/ssrc-hk/purchaseApplication',
        component: () => import('../routes/PurchaseApplication'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseApplication/edit',
        component: () => import('../routes/PurchaseApplication/Edit'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
    ],
  },

  {
    path: '/pub/ssrc-hk/purchaseApplication',
    components: [
      {
        path: '/pub/ssrc-hk/purchaseApplication',
        component: () => import('../routes/PurchaseApplication'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseApplication/edit',
        component: () => import('../routes/PurchaseApplication/Edit'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
    ],
  },
  // 简易采购结果
  {
    components: [
      {
        path: '/ssrc-hk/purchaseResult/commission',
        component: () => import('../routes/PurchaseResult/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResult',
        component: () => import('../routes/PurchaseResult'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResult/edit',
        component: () => import('../routes/PurchaseResult/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/purchaseApplicationCusModel')
        ],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultDraft',
        component: () => import('../routes/PurchaseResult/Draft'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
    ],
  },

  {
    components: [
      {
        path: '/pub/ssrc-hk/purchaseResult/commission',
        component: () => import('../routes/PurchaseResult/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResult',
        component: () => import('../routes/PurchaseResult'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResult/edit',
        component: () => import('../routes/PurchaseResult/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/purchaseApplicationCusModel')
        ],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultDraft',
        component: () => import('../routes/PurchaseResult/Draft'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
    ],
  },

  // 一般采购结果
  {
    components: [
      {
        path: '/ssrc-hk/purchaseResultNormal/commission',
        component: () => import('../routes/PurchaseResultNormal/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultNormal',
        component: () => import('../routes/PurchaseResultNormal'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultNormal/edit',
        component: () => import('../routes/PurchaseResultNormal/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/singlePurchaseApplicationCusModel'),
        ],
        authorized: true,
      },
    ],
  },

  {
    components: [
      {
        path: '/pub/ssrc-hk/purchaseResultNormal/commission',
        component: () => import('../routes/PurchaseResultNormal/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultNormal',
        component: () => import('../routes/PurchaseResultNormal'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultNormal/edit',
        component: () => import('../routes/PurchaseResultNormal/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/singlePurchaseApplicationCusModel'),
        ],
        authorized: true,
      },
      // 招投标用的采购结果
      {
        path: '/pub/ssrc-hk/purchaseResultNormal/edit/bid',
        component: () => import('../routes/PurchaseResultNormal/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/singlePurchaseApplicationCusModel'),
        ],
        authorized: true,
      },
    ],
  },

  /*
   * 框架子订单
   * */
  {
    path: '/ssrc-hk/frame-sub-order',
    components: [
      {
        path: '/ssrc-hk/frame-sub-order',
        component: () => import('../routes/FrameSubOrder'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/frame-sub-order/edit',
        component: () => import('../routes/FrameSubOrder/Edit'),
        models: [() => import('../models/frameSubOrderModel')],
        // models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
    ],
  },

  {
    path: '/pub/ssrc-hk/frame-sub-order',
    components: [
      {
        path: '/pub/ssrc-hk/frame-sub-order',
        component: () => import('../routes/FrameSubOrder'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/frame-sub-order/edit',
        component: () => import('../routes/FrameSubOrder/Edit'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
      },
    ],
  },

  /*
   * 采购报表
   * */
  {
    path: '/ssrc-hk/procurementReport',
    components: [
      {
        path: '/ssrc-hk/procurementReport/table',
        component: () => import('../routes/ProcurementReport'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/procurementReport/view',
        component: () => import('../routes/ProcurementReport/EChartsComponents'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      // {
      //   path: '/ssrc-hk/procurementReport/edit',
      //   component: () => import('../routes/ProcurementReport/Edit'),
      //   models: [() => import('../models/purchaseApplicationModel')],
      //   authorized: true,
      // },
    ],
  },

  {
    path: '/pub/ssrc-hk/procurementReport',
    components: [
      {
        path: '/pub/ssrc-hk/procurementReport',
        component: () => import('../routes/ProcurementReport'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/procurementReport/view',
        component: () => import('../routes/ProcurementReport/EChartsComponents'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      // {
      //   path: '/pub/ssrc-hk/procurementReport/edit',
      //   component: () => import('../routes/ProcurementReport/Edit'),
      //   models: [() => import('../models/purchaseApplicationModel')],
      //   authorized: true,
      // },
    ],
  },

  /*
   * 采购申请ERP
   * */
  {
    path: '/ssrc-hk/purchaseApplicationErp',
    components: [
      {
        path: '/ssrc-hk/purchaseApplicationErp',
        component: () => import('../routes/PurchaseApplicationErp'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseApplicationErp/edit',
        component: () => import('../routes/PurchaseApplicationErp/Edit'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
    ],
  },

  {
    path: '/pub/ssrc-hk/purchaseApplicationErp',
    components: [
      {
        path: '/pub/ssrc-hk/purchaseApplicationErp',
        component: () => import('../routes/PurchaseApplicationErp'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseApplicationErp/edit',
        component: () => import('../routes/PurchaseApplicationErp/Edit'),
        models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
        title: intl.get('hzero.common.title.purchase.requirements').d('采购申请'),
      },
    ],
  },
  // 简易采购结果ERP
  {
    components: [
      {
        path: '/ssrc-hk/purchaseResultErp/commission',
        component: () => import('../routes/PurchaseResultErp/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultErp',
        component: () => import('../routes/PurchaseResultErp'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultErp/edit',
        component: () => import('../routes/PurchaseResultErp/Edit'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
    ],
  },

  {
    components: [
      {
        path: '/pub/ssrc-hk/purchaseResultErp/commission',
        component: () => import('../routes/PurchaseResultErp/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultErp',
        component: () => import('../routes/PurchaseResultErp'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/purchaseApplicationCusModel')
        ],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultErp/edit',
        component: () => import('../routes/PurchaseResultErp/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/purchaseApplicationCusModel')
        ],
        authorized: true,
        title: intl.get('hzero.common.title.procurement.result').d('采购结果'),
      },
    ],
  },

  // 一般采购结果ERP
  {
    components: [
      {
        path: '/ssrc-hk/purchaseResultNormalErp/commission',
        component: () => import('../routes/PurchaseResultNormalErp/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultNormalErp',
        component: () => import('../routes/PurchaseResultNormalErp'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/purchaseResultNormalErp/edit',
        component: () => import('../routes/PurchaseResultNormalErp/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/singlePurchaseApplicationCusModel'),
        ],
        authorized: true,
      },
    ],
  },

  {
    components: [
      {
        path: '/pub/ssrc-hk/purchaseResultNormalErp/commission',
        component: () => import('../routes/PurchaseResultNormalErp/commission'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultNormalErp',
        component: () => import('../routes/PurchaseResultNormalErp'),
        models: [() => import('../models/purchaseResultModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/purchaseResultNormalErp/edit',
        component: () => import('../routes/PurchaseResultNormalErp/Edit'),
        models: [
          () => import('../models/purchaseResultModel'),
          () => import('../../../srm-front-po-hk/src/models/singlePurchaseApplicationCusModel'),
        ],
        authorized: true,
        title: intl.get('hzero.common.title.procurement.result').d('采购结果'),
      },
    ],
  },

  /*
   * 框架子订单ERP
   * */
  {
    path: '/ssrc-hk/frame-sub-order-erp',
    components: [
      {
        path: '/ssrc-hk/frame-sub-order-erp',
        component: () => import('../routes/FrameSubOrderErp'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
      },
      {
        path: '/ssrc-hk/frame-sub-order-erp/edit',
        component: () => import('../routes/FrameSubOrderErp/Edit'),
        models: [() => import('../models/frameSubOrderModel')],
        // models: [() => import('../models/purchaseApplicationModel')],
        authorized: true,
      },
    ],
  },

  {
    path: '/pub/ssrc-hk/frame-sub-order-erp',
    components: [
      {
        path: '/pub/ssrc-hk/frame-sub-order-erp',
        component: () => import('../routes/FrameSubOrderErp'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
      },
      {
        path: '/pub/ssrc-hk/frame-sub-order-erp/edit',
        component: () => import('../routes/FrameSubOrderErp/Edit'),
        models: [() => import('../models/frameSubOrderModel')],
        authorized: true,
        title: intl.get('hzero.common.title.purchase.requirements').d('采购申请'),
      },
    ],
  },

  // --------------- 手机业务 ----------------
  {
    authorized: true,
    path: '/ssrc-hk/phoneBusiness',
    components: [
      {
        authorized: true,
        path: '/ssrc-hk/phoneBusiness/Detail',
        component: () => import('../routes/PhoneBusiness'),
        models: [() => import('../models/phoneBusinessListModel')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/ssrc-hk/phoneBusiness',
    components: [
      {
        authorized: true,
        path: '/pub/ssrc-hk/phoneBusiness/Detail',
        component: () => import('../routes/PhoneBusiness'),
        models: [() => import('../models/phoneBusinessListModel')],
        title: '手机业务',
      },
    ],
  },

  // --------------- 物业租赁 ----------------
  {
    path: '/ssrc-hk/propertyLease',
    components: [
      {
        authorized: true,
        path: '/ssrc-hk/propertyLease/leaseList',
        component: () => import('../routes/PropertyLease/LeaseList'),
        models: [() => import('../models/propertyLeaseModel')],
        title: '物业租赁列表',
      },
      {
        authorized: true,
        path: '/ssrc-hk/propertyLease/applicationForm/:laNumber?',
        component: () => import('../routes/PropertyLease/applicationForm'),
        models: [() => import('../models/propertyLeaseModel')],
        title: '物业租赁申请单',
      },
      {
        authorized: true,
        path: '/ssrc-hk/propertyLease/storeList',
        component: () => import('../routes/PropertyLease/StoreList'),
        models: [() => import('../models/propertyLeaseModel')],
        title:'门店展示列表'
      },
      {
        authorized: true,
        path: '/ssrc-hk/propertyLease/maintenance/:storeNumber?',
        component: () => import('../routes/PropertyLease/maintenance'),
        models: [() => import('../models/propertyLeaseModel')],
        title:'门店信息维护'
      },
    ],
  },
  {
    path: '/pub/ssrc-hk/propertyLease',
    components: [
      {
        authorized: true,
        path: '/pub/ssrc-hk/propertyLease/leaseList',
        component: () => import('../routes/PropertyLease/LeaseList'),
        models: [() => import('../models/propertyLeaseModel')],
        title: '物业租赁列表',
      },
      {
        authorized: true,
        path: '/pub/ssrc-hk/propertyLease/applicationForm/:laNumber?',
        component: () => import('../routes/PropertyLease/applicationForm'),
        models: [() => import('../models/propertyLeaseModel')],
        title: '物业租赁申请单',
      },
      {
        authorized: true,
        path: '/pub/ssrc-hk/propertyLease/storeList',
        component: () => import('../routes/PropertyLease/StoreList'),
        models: [() => import('../models/propertyLeaseModel')],
        title:'门店展示列表'
      },
      {
        authorized: true,
        path: '/pub/ssrc-hk/propertyLease/maintenance/:storeNumber?',
        component: () => import('../routes/PropertyLease/maintenance'),
        models: [() => import('../models/propertyLeaseModel')],
        title:'门店信息维护'
      },
    ],
  },
];
