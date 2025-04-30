/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-13 11:05:55
 * @LastEditTime: 2024-01-30 10:20:41
 * @LastEditors: Please set LastEditors
 */
require('../../../../src/global.less');

const { intl } = window;

module.exports = [
  // 工作台
  {
    authorized: true,
    path: '/sspo/online-purchase',
    models: [],
    components: [
      // 采购工作台
      {
        authorized: true,
        path: '/sspo/online-purchase/list',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
        ],
        component: () => import('../routes/BiddingDashbord'),
      },
      // 项目进度统计表
      {
        path: '/sspo/online-purchase/statistics',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
        ],
        component: () => import('../routes/BiddingDashbord/Statistics'),
      },
      // 综合评分汇总
      {
        authorized: true,
        path: '/sspo/online-purchase/ScoreListAll/:proId/:milestoneId',
        models: [
          () => import('../models/contractTechnicalMerit'),
          () => import('../models/contractMaintain'),
          () => import('../models/projectQaModels'),
        ],
        component: () => import('../routes/ContractMaintain/CusScoreListAll'),
      },
      // 报名审批列表
      {
        authorized: true,
        path: '/sspo/online-purchase/registration/:proId',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/CusRegistrationApproval'),
        title: intl.get(`hzero.common.view.title.RegistrationApproval`).d('报名审批'),
      },
      // 报名审批列表稽查
      {
        authorized: true,
        path: '/sspo/online-purchase/registrationCheck/:proId',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/CusRegistrationApprovalCheck'),
      },
      // 评委工作台
      {
        authorized: true,
        path: '/sspo/online-purchase/JudgesDashbord',
        models: [
          () => import('../models/contractJudgesDashbord'),
        ],
        component: () => import('../routes/JudgesDashbord'),
        title: intl.get('hzero.common.title.pub.bid.onlinejudgement').d('评委评分'),
      },
      // 评委评分
      {
        authorized: true,
        path: '/sspo/online-purchase/JudgesSorce/:proId/:purchaseType',
        models: [() => import('../models/contractJudgesCusSorce')],
        // component: () => import('../routes/JudgesSorceCus'),
        component: () => import('../routes/JudgesSorceCusNew'),
        title: intl.get('hzero.common.view.title.JuRe').d('评委评审'),
      },
      // 技术文件查看
      {
        authorized: true,
        path: '/sspo/online-purchase/technicalDocuments/:proId/:milestoneId',
        models: [() => import('../models/contractJudgesSorce')],
        component: () => import('../routes/technicalDocumentsNew'),
      },
      // 技术评分表设置
      {
        authorized: true,
        path: '/sspo/online-purchase/quoteSource',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/QuoteSourceResult'),
      },
      // 评委组设置
      {
        authorized: true,
        path: '/sspo/online-purchase/quoteSource1',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/SetJudgesTable'),
      },
      // 报价表设置
      {
        authorized: true,
        path: '/sspo/online-purchase/quotation',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/SetQuotationTable'),
      },
      // 编辑公告(采购方)
      {
        authorized: true,
        path: '/sspo/online-purchase/notices1/:proId/:milestoneId/:editFlag',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
          () => import('../models/purchaseOrder'),
        ],
        component: () => import('../routes/ContractMaintain/EditReleaseNotices'),
        title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
      },
      // 查看公告(做为菜单的路由)
      {
        authorized: true,
        path: '/sspo/online-purchase/notices2',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/ContractMaintain/NoticeList'),
        title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
      },
      // 查看公告(作为里程碑跳转到路由)
      {
        authorized: true,
        path: '/sspo/online-purchase/notices2/:flag',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/ContractMaintain/NoticeList'),
        title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
      },
      // 线下公告
      {
        authorized: true,
        path: '/sspo/online-purchase/notices1/offlineNotice',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/ContractMaintain/EditOfflineNotice'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ContractMaintain/EditOfflineNotice') : import('../routes/ContractMaintain/EditOfflineNoticeCusNew'),
        title: intl.get(`hzero.common.view.title.OfflineNotice`).d('线下公告'),
      },
      // 线下公告：待办进入
      {
        authorized: true,
        path: '/sspo/online-purchase/notices1/offlineNotice/:noticeId',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/ContractMaintain/EditOfflineNotice'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ContractMaintain/EditOfflineNotice') : import('../routes/ContractMaintain/EditOfflineNoticeCusNew'),
        title: intl.get(`hzero.common.view.title.OfflineNotice`).d('线下公告'),
      },

      // 邀请供应商设置
      {
        authorized: true,
        path: '/sspo/online-purchase/suppliers',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/InviteSuppliers'),
      },
      {
        authorized: true,
        path: '/sspo/online-purchase/detail',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/BiddingDashbord/Detail'),
      },
      {
        authorized: true,
        path: '/sspo/online-purchase/detail1/:proId/:status',
        models: [
          () => import('../models/contractMaintain'),
          () => import('../models/contractCommon'),
          () => import('../models/editorOnline'),
          () => import('../models/purchaseContractType'),
        ],
        component: () => import('../routes/ContractMaintainSupplierInventory/NewDetail'),
        title: intl.get(`hzero.common.view.title.PurchaseOnline`).d('线上采购'),
      },
      {
        authorized: true,
        path: '/sspo/online-purchase/purchase-contract',
        models: [() => import('../models/purchaseApplicationContract')],
        component: () => import('../routes/PurchaseContract'),
      },
      {
        authorized: true,
        path: '/sspo/online-purchase/quote-purchase-order',
        models: [() => import('../models/contractMaintain')],
        component: () => import('../routes/ContractMaintain/QuotePurchaseOrder'),
      },
      /**
       * 评委评分页面
       * */
      // 招标/投标文件表格
      {
        authorized: true,
        path: '/sspo/online-purchase/tender-documents',
        models: [() => import('../models/contractJudgesSorce')],
        component: () => import('../routes/JudgesSorce/TenderDocuments'),
      },
      /**
       * 评分表确认技术澄清
      */
      {
        authorized: true,
        path: '/sspo/online-purchase/forwardQuestions/:proId/:milestoneId',
        models: [() => import('../models/contractJudgesSorce')],
        component: () => import('../routes/ForwardQuestionsNew'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ForwardQuestions') : import('../routes/ForwardQuestionsNew'),
      },

      /**
       * 技术评分汇总
       */
      {
        authorized: true,
        path: '/sspo/online-purchase/technicalMerit/:proId/:milestoneId/:state',
        models: [() => import('../models/contractTechnicalMerit')],
        component: () => import('../routes/CusTechnicalMerit'),
      },

      /**
       * 价格评分汇总
      */
      {
        authorized: true,
        path: '/sspo/online-purchase/PriceScore/:proId/:milestoneId',
        models: [
          () => import('../models/contractTechnicalMerit'),
          () => import('../models/projectQaModels')],
        component: () => import('../routes/CusPriceScore'),
      },

      /**
       * 中标结果提交审批-待办页面返回上一级添加参数用作判断
       */
      {
        authorized: true,
        path: '/sspo/online-purchase/bidWinningResult/:proId/:mipBack',
        models: [
          () => import('../models/contractBidWinningResult'),
          () => import('../models/purchaseOrder'),
        ],
        component: () => import('../routes/CusBidWinningResult'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/BidWinningResult') : import('../routes/CusBidWinningResult'),
      },

      /**
       * 中标结果提交审批
       */
      {
        authorized: true,
        path: '/sspo/online-purchase/bidWinningResult/:proId',
        models: [
          () => import('../models/contractBidWinningResult'),
          () => import('../models/purchaseOrder'),
        ],
        component: () => import('../routes/BidWinningResult'),
      },
    ],
  },
  // MIP
  {
    authorized: true,
    path: '/sspo/payment-request',
    components: [
      {
        authorized: true,
        path: '/sspo/payment-request/query',
        component: () => import('../pages/ResaleRequest/ResaleQuery'),
      },
      {
        authorized: true,
        path: '/sspo/payment-request/create',
        component: () => import('../pages/PaymentRequest/Detail/create'),
      },
      {
        path: '/sspo/payment-request/detail/:id',
        component: () => import('../pages/PaymentRequest/Detail'),
      },
      {
        authorized: true,
        path: '/sspo/payment-request/import',
        component: () => import('../pages/PaymentRequest/PaymentImport'),
      },
    ],
    models: [],
  },

  // 项目答疑
  {
    authorized: true,
    path: '/sspo/projectQa',
    components: [
      {
        authorized: true,
        path: '/sspo/projectQa/query/:proId/:milestoneId',
        models: [() => import('../models/projectQaModels')],
        component: () => import('../routes/CusProjectQa'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ProjectQa') : import('../routes/CusProjectQa'),
      },
    ],
  },

  // 需求人工作台
  {
    authorized: true,
    path: '/sspo/demandDashbord',
    components: [
      {
        authorized: true,
        path: '/sspo/demandDashbord/query',
        models: [
          () => import('../models/demandDashbordModels'),
          () => import('../models/contractCommon'),
        ],
        component: () => import('../routes/DemandDashbord'),
      },
    ],
  },

  // 上会纪要
  {
    authorized: true,
    path: '/sspo/meeting',
    components: [
      {
        authorized: true,
        path: '/sspo/meeting/query/:proId/:milestoneId',
        models: [
          () => import('../models/projectQaModels'),
          () => import('../models/contractMaintain'),
        ],
        component: () => import('../routes/CusMeeting'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/meeting') : import('../routes/CusMeeting'),
      },
    ],
  },
  // 价格澄清
  {
    authorized: true,
    path: '/sspo/priceQa',
    components: [
      {
        authorized: true,
        path: '/sspo/priceQa/query/:proId/:milestoneId',
        models: [() => import('../models/projectQaModels')],
        component: () => import('../routes/priceQaNew'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/priceQa') : import('../routes/priceQaNew'),
      },
    ],
  },
  // 需求人答疑
  {
    authorized: true,
    path: '/sspo/demandQa',
    components: [
      {
        authorized: true,
        path: '/sspo/demandQa/query/:proId/:milestoneId/:text',
        models: [() => import('../models/demandQaModels')],
        component: () => import('../routes/CusDemandQa'),
        title: intl.get(`hzero.common.view.title.ViewQA`).d('需求答疑'),
      },
    ],
  },

  // ERP基本信息
  {
    authorized: true,
    path: '/sspo/isErpInfo',
    components: [
      {
        authorized: true,
        path: '/sspo/isErpInfo/query/:proCode',
        models: [
          () => import('../models/erpBiddingInfo'),
          () => import('../models/contractMaintain'),
        ],
        component: () => import('../routes/CusErpBiddingInfo'),
        title: intl.get('hzero.common.view.title.information').d('ERP基本信息'),
      },
    ],
  },

  // 核价
  {
    authorized: true,
    path: '/sspo/pricing',
    components: [
      {
        authorized: true,
        path: '/sspo/pricing/query/:proId/:milestoneId',
        models: [
          () => import('../models/pricingModels'),
          () => import('../models/projectQaModels'),
        ],
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/Pricing') : import('../routes/PricingNew'),
        component: () => import('../routes/PricingNew'),
      },
      {
        authorized: true,
        path: '/sspo/pricing/priceComparison/:proId/:milestoneId/:priceType',
        models: [() => import('../models/priceComparisonModels')],
        component: () => import('../routes/PriceComparison'),
      },
    ],
  },
  /**
   * 付款申请查询界面
   */
  {
    authorized: true,
    path: '/sspo/cost/payment/request',
    components: [
      {
        authorized: true,
        path: '/sspo/cost/payment/request/query',
        component: () => import('../pages/CostPaymentRequest/RequestQuery'),
      },
      {
        authorized: true,
        path: '/sspo/cost/payment/request/detail/:costRequestId',
        component: () => import('../pages/CostPaymentRequest/Detail'),
      },
      {
        authorized: true,
        path: '/sspo/cost/payment/request/import/:costRequestId',
        component: () => import('../pages/CostPaymentRequest/BatchImport'),
      },
    ],
  },


  {
    authorized: true,
    path: '/pub/sspo/cost/payment/request/query',
    component: () => import('../pages/CostPaymentRequest/RequestQuery'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.request').d('业务运营成本付款'),
  },
  {
    authorized: true,
    path: '/pub/sspo/cost/payment/request/detail/:costRequestId',
    component: () => import('../pages/CostPaymentRequest/Detail'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.request').d('业务运营成本付款'),
  },
  {
    authorized: true,
    path: '/pub/sspo/cost/payment/request/import/:costRequestId',
    component: () => import('../pages/CostPaymentRequest/BatchImport'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.request').d('业务运营成本付款'),
  },
  /**
   * 转售付款申请查询界面
   */
  {
    path: '/sspo/resale/request',
    components: [
      {
        path: '/sspo/resale/request/query',
        component: () => import('../pages/ResaleRequest/ResaleQuery'),
        authorized: true,
      },
    ],
    authorized: true,
  },
  // 转售付款申请只读
  {
    path: '/sspo/payment-request-view',
    components: [
      {
        path: '/sspo/payment-request-view/query',
        component: () => import('../pages/ResaleRequest/ResaleQuery'),
      },
      {
        path: '/sspo/payment-request-view/detail/:id',
        component: () => import('../pages/PaymentRequest/Detail'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/sspo/payment-request-view/query',
    component: () => import('../pages/ResaleRequest/ResaleQuery'),
    title: intl.get('hzero.common.title.pub.spcm.payment-request').d('转售采购成本付款申请'),
  },
  {
    authorized: true,
    path: '/pub/sspo/payment-request-view/detail/:id',
    component: () => import('../pages/PaymentRequest/Detail'),
    title: intl.get('hzero.common.title.pub.spcm.payment-request').d('转售采购成本付款申请'),
  },
  /**
   * --------------------------------------------------------------------------------------
   */

  // 采购工作台pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/list',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      // () => import('../models/organization')
    ],
    component: () => import('../routes/BiddingDashbord'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.reque1st').d('工作台'),
  },

  // 评委工作台pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/JudgesDashbord',
    models: [
      () => import('../models/contractJudgesDashbord'),
      () => import('../models/contractCommon'),
    ],
    component: () => import('../routes/JudgesDashbord'),
    title: intl.get('hzero.common.title.pub.bid.onlinejudgement').d('评委评分'),
  },

  // 需求人工作台pub界面
  {
    authorized: true,
    path: '/pub/sspo/demandDashbord/query',
    models: [
      () => import('../models/demandDashbordModels'),
      () => import('../models/contractCommon'),
    ],
    component: () => import('../routes/DemandDashbord'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.reque1st').d('需求人工作台'),
  },

  // 项目答疑pub界面
  {
    authorized: true,
    path: '/pub/sspo/projectQa/query/:proId/:milestoneId',
    models: [() => import('../models/projectQaModels')],
    component: () => import('../routes/CusProjectQa'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ProjectQa') : import('../routes/CusProjectQa'),
    title: intl.get('hzero.common.view.title.projectqa').d('项目答疑'),
  },

  // 价格澄清pub界面
  {
    authorized: true,
    path: '/pub/sspo/priceQa/query/:proId/:milestoneId',
    models: [() => import('../models/projectQaModels')],
    component: () => import('../routes/priceQaNew'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/priceQa') : import('../routes/priceQaNew'),
    title: intl.get('hzero.common.view.title.priceclarification').d('价格澄清'),
  },
   // 上会纪要pub
   
      {
        authorized: true,
        path: '/pub/sspo/meeting/query/:proId/:milestoneId',
        models: [
          () => import('../models/projectQaModels'),
          () => import('../models/contractMaintain'),
        ],
        component: () => import('../routes/CusMeeting'),
        // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/meeting') : import('../routes/CusMeeting'),
        title: intl.get('hzero.common.view.title.dicisioninformation').d('查看决策信息'),
     
  },
  // 需求人答疑pub界面
  {
    authorized: true,
    path: '/pub/sspo/demandQa/query/:proId/:milestoneId/:text',
    models: [() => import('../models/demandQaModels')],
    component: () => import('../routes/CusDemandQa'),
    title: intl.get('hzero.common.view.title.ViewQA').d('需求答疑'),
  },
  // 项目进度统计表pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/statistics',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
    ],
    component: () => import('../routes/BiddingDashbord/Statistics'),
    title: intl.get('hzero.common.title.pub.spcm.cost.payment.reque1st').d('项目进度统计表'),
  },
  // 综合评分汇总pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/ScoreListAll/:proId/:milestoneId',
    models: [
      () => import('../models/contractTechnicalMerit'),
      () => import('../models/contractMaintain'),
      () => import('../models/projectQaModels'),
    ],
    component: () => import('../routes/ContractMaintain/CusScoreListAll'),
    title: intl.get('hzero.common.view.title.comprehensive').d('综合评分表'),
  },
  // 报名审批列表pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/registration/:proId',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/CusRegistrationApproval'),
    title: intl.get(`hzero.common.view.title.RegistrationApproval`).d('报名审批'),
  },
   // 报名审批列表 稽查pub界面
   {
    authorized: true,
    path: '/pub/sspo/online-purchase/registrationCheck/:proId',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/CusRegistrationApprovalCheck'),
  },
  // 评委评分pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/JudgesSorce/:proId/:purchaseType',
    models: [() => import('../models/contractJudgesCusSorce')],
    // component: () => import('../routes/JudgesSorceCus'),
    component: () => import('../routes/JudgesSorceCusNew'),
    title: intl.get('hzero.common.view.title.JuRe').d('评委评审'),
  },
  // 技术文件查看pub界面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/technicalDocuments/:proId/:milestoneId',
    models: [() => import('../models/contractJudgesSorce')],
    component: () => import('../routes/technicalDocumentsNew'),
    title: intl.get('hzero.common.view.title.Techupload').d('技术及商务文件递交（不含报价）'),
  },
  // 技术评分表设置pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/quoteSource',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/QuoteSourceResult'),
  },
  // 评委组设置pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/quoteSource1',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/SetJudgesTable'),
  },
  // 报价表设置pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/quotation',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/SetQuotationTable'),
  },
  // 编辑公告pub界面(采购方)
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/notices1/:proId/:milestoneId/:editFlag',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
      () => import('../models/purchaseOrder'),
    ],
    component: () => import('../routes/ContractMaintain/EditReleaseNotices'),
    title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
  },
  // 查看公告pub界面(做为菜单的路由)
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/notices2',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/ContractMaintain/NoticeList'),
    title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
  },
  // 查看公告pub界面(作为里程碑跳转到路由)
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/notices2/:flag',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/ContractMaintain/NoticeList'),
    title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
  },
  // 线下公告
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/notices1/offlineNotice',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/ContractMaintain/EditOfflineNotice'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ContractMaintain/EditOfflineNotice') : import('../routes/ContractMaintain/EditOfflineNoticeCusNew'),
    title: intl.get(`hzero.common.view.title.OfflineNotice`).d('线下公告'),
  },
  // 线下公告：待办进入
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/notices1/offlineNotice/:noticeId',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/ContractMaintain/EditOfflineNotice'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ContractMaintain/EditOfflineNotice') : import('../routes/ContractMaintain/EditOfflineNoticeCusNew'),
    title: intl.get(`hzero.common.view.title.OfflineNotice`).d('线下公告'),
  },
  // 邀请供应商设置pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/suppliers',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/InviteSuppliers'),
  },
  // 新建项目pub页面
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/detail1/:proId/:status',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/ContractMaintainSupplierInventory/NewDetail'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ContractMaintainSupplierInventory/Detail') : import('../routes/ContractMaintainSupplierInventory/NewDetail'),
    title: intl.get(`hzero.common.view.title.PurchaseOnline`).d('线上采购'),
  },
  // pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/purchase-contract',
    models: [() => import('../models/purchaseApplicationContract')],
    component: () => import('../routes/PurchaseContract'),
  },
  //pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/quote-purchase-order',
    models: [() => import('../models/contractMaintain')],
    component: () => import('../routes/ContractMaintain/QuotePurchaseOrder'),
  },
  /**
    * 评委评分页面
    * */
  // 招标/投标文件表格pub
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/tender-documents',
    models: [() => import('../models/contractJudgesSorce')],
    component: () => import('../routes/JudgesSorce/TenderDocuments'),
  },
  /**
   * 评分表确认技术澄清pub
  */
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/forwardQuestions/:proId/:milestoneId',
    models: [() => import('../models/contractJudgesSorce')],
    component: () => import('../routes/ForwardQuestionsNew'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ForwardQuestions') : import('../routes/ForwardQuestionsNew'),
    title: intl.get(`hzero.common.view.title.technicalbusinessclarification`).d('技术、商务澄清'),
  },

  /**
   * 技术评分汇总pub页面
   */
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/technicalMerit/:proId/:milestoneId/:state',
    models: [() => import('../models/contractTechnicalMerit')],
    component: () => import('../routes/CusTechnicalMerit'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/TechnicalMerit') : import('../routes/CusTechnicalMerit'),
    title: intl.get(`hzero.common.view.title.viewthesummaryoftechnicalreviews`).d('查看技术评审汇总表'),
  },

  /**
   * 价格评分汇总pub页面
  */
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/PriceScore/:proId/:milestoneId',
    models: [
      () => import('../models/contractTechnicalMerit'),
      () => import('../models/projectQaModels')
    ],
    component: () => import('../routes/CusPriceScore'),
    title: intl.get('hzero.common.view.title.pricereviews').d('价格评审'),
  },

  /**
   * 中标结果提交审批pub页面-待办页面返回上一级添加参数用作判断
   */
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/bidWinningResult/:proId/:mipBack',
    models: [
      () => import('../models/contractBidWinningResult'),
      () => import('../models/purchaseOrder'),],
    component: () => import('../routes/CusBidWinningResult'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/BidWinningResult') : import('../routes/CusBidWinningResult'),
    title: intl.get('hzero.common.view.title.choosepassornot').d('查看中选/落选'),
  },

  /**
   * 中标结果提交审批pub页面
   */
  {
    authorized: true,
    path: '/pub/sspo/online-purchase/bidWinningResult/:proId',
    models: [
      () => import('../models/contractBidWinningResult'),
      () => import('../models/purchaseOrder'),],
    component: () => import('../routes/BidWinningResult'),
  },

  // pub ERP基本信息
  {
    authorized: true,
    path: '/pub/sspo/isErpInfo/query/:proCode',
    models: [
      () => import('../models/erpBiddingInfo'),
      () => import('../models/contractMaintain'),
    ],
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/ErpBiddingInfo') : import('../routes/CusErpBiddingInfo'),
    component: () => import('../routes/CusErpBiddingInfo'),
    title: intl.get('hzero.common.view.title.information').d('ERP基本信息'),
  },

  // 核价pub界面
  {
    authorized: true,
    path: '/pub/sspo/pricing/query/:proId/:milestoneId',
    models: [
      () => import('../models/pricingModels'),
      () => import('../models/projectQaModels'),
    ],
    component: () => import('../routes/PricingNew'),
    // component: () => intl.get(`hzero.common.text.sspo`) === "N" ? import('../routes/Pricing') : import('../routes/PricingNew'),
    title: intl.get('hzero.common.view.title.priceupload').d('报价文件递交'),
  },

  {
    authorized: true,
    path: '/pub/sspo/pricing/priceComparison/:proId/:milestoneId/:priceType',
    models: [() => import('../models/priceComparisonModels')],
    component: () => import('../routes/PriceComparison'),
    title: intl.get('hzero.common.view.title.compareprice').d('比价'),
  },

  // 致远采购公告线上
  {
    authorized: true,
    path: '/sspo/OnlineNotices',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/workFlowNotices/OnlineNoticeCus'),
    title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
  },

  // 致远采购公告线上pub
  {
    authorized: true,
    path: '/pub/sspo/OnlineNotices',
    models: [
      () => import('../models/contractMaintain'),
      () => import('../models/contractCommon'),
      () => import('../models/editorOnline'),
      () => import('../models/purchaseContractType'),
    ],
    component: () => import('../routes/workFlowNotices/OnlineNoticeCus'),
    title: intl.get(`hzero.common.view.title.ProcurementAnnouncement`).d('采购公告'),
  },
  {
    authorized: true,
    path: '/sspo/WinningResult',
    models: [
      () => import('../models/contractBidWinningResult'),
      () => import('../models/purchaseOrder'),
    ],
    component: () => import('../routes/workFlowNotices/BidWinningResultCus'),
    title: intl.get('hzero.common.view.title.choosepassornot').d('查看中选/落选'),
  },
  {
    authorized: true,
    path: '/pub/sspo/WinningResult',
    models: [
      () => import('../models/contractBidWinningResult'),
      () => import('../models/purchaseOrder'),
    ],
    component: () => import('../routes/workFlowNotices/BidWinningResultCus'),
    title: intl.get('hzero.common.view.title.choosepassornot').d('查看中选/落选'),
  }
];
