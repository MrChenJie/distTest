

module.exports = [
  // 供应商准入 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/access-to-supplier-list',
        component: () => import('../routes/AccessToSuppliers'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/access-to-supplier-list',
        component: () => import('../routes/AccessToSuppliers'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商准入 -- 新增
  {
    components: [
      {
        path: '/spfm-hk/supplier/add-admittance',
        component: () => import('../routes/AccessToSuppliers/addAdmittance'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/add-admittance',
        component: () => import('../routes/AccessToSuppliers/addAdmittance'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  // 供应商准入 -- 线条审批 -- 信息查看
  {
    components: [
      {
        path: '/spfm-hk/supplier/admittance-detail',
        component: () => import('../routes/AccessToSuppliers/detail'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/admittance-detail',
        component: () => import('../routes/AccessToSuppliers/detail'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  // 供应商准入 -- 线条审批 -- 采购a(移入components Purchase)
  {
    components: [
      {
        // path: '/spfm-hk/supplier/purchase',
        component: () => import('../routes/AccessToSuppliers/components/Purchase'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        // path: '/pub/spfm-hk/supplier/purchase',
        component: () => import('../routes/AccessToSuppliers/components/Purchase'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商准入 -- 线条审批 -- 财务（A2P & 非A2P)(移入components Finance) & 应付账项组组长审核补充银行信息(非A2P页签)
  {
    components: [
      {
        // path: '/spfm-hk/supplier/finance-A2P',
        component: () => import('../routes/AccessToSuppliers/components/Finance'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        // path: '/pub/spfm-hk/supplier/finance-A2P',
        component: () => import('../routes/AccessToSuppliers/components/Finance'),
        models: [() => import('../models/accessToSupplierHK')],
        authorized: true
      }
    ],
  },
  // 采购经理审核采购供应商准入信息
  {
    components: [
      {
        path: '/spfm-hk/supplier/approval-purchasing-manager',
        component: () => import('../routes/Approval/purchasingManager'),
        models: [() => import('../models/approvalHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/approval-purchasing-manager',
        component: () => import('../routes/Approval/purchasingManager'),
        models: [() => import('../models/approvalHK')],
        authorized: true
      }
    ],
  },
  // 应付账项组组长审核财务供应商准入信息
  {
    components: [
      {
        path: '/spfm-hk/supplier/approval-access-to-accounts-payable',
        component: () => import('../routes/Approval/accessToAccountsPayable'),
        models: [() => import('../models/approvalHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/approval-access-to-accounts-payable',
        component: () => import('../routes/Approval/accessToAccountsPayable'),
        models: [() => import('../models/approvalHK')],
        authorized: true
      }
    ],
  },
  // 供应商查询 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-list',
        component: () => import('../routes/Supplier'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-list',
        component: () => import('../routes/Supplier'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商预览 -- 草稿
  {
    components: [
      {
        path: '/spfm-hk/supplier/edit-admittance',
        component: () => import('../routes/Supplier/editAdmittance'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/edit-admittance',
        component: () => import('../routes/Supplier/editAdmittance'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  // 供应商预览 -- 采购供应商已审批
  {
    components: [
      {
        path: '/spfm-hk/supplier/purchase-approved',
        component: () => import('../routes/Supplier/previewPurchaseApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/purchase-approved',
        component: () => import('../routes/Supplier/previewPurchaseApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  // 供应商预览 -- 财务供应商已审批
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-approved',
        component: () => import('../routes/Supplier/previewFinanceApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-approved',
        component: () => import('../routes/Supplier/previewFinanceApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.details').d('供应商详情')
      }
    ],
  },
  // 供应商查询 - 财务转采购供应商准入
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-to-purchase',
        component: () => import('../routes/Supplier/financeToPurchase'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-to-purchase',
        component: () => import('../routes/Supplier/financeToPurchase'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商信息更新 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-apply-list',
        component: () => import('../routes/Supplier/updateInfoList'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-apply-list',
        component: () => import('../routes/Supplier/updateInfoList'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商信息更新单 -- 草稿 -- 采购部门
  {
    components: [
      {
        path: '/spfm-hk/supplier/purchase-supplier-info',
        component: () => import('../routes/Supplier/purchaseUpdateInfo'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/purchase-supplier-info',
        component: () => import('../routes/Supplier/purchaseUpdateInfo'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商信息更新单 -- 草稿 -- 财务部门
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-supplier-info',
        component: () => import('../routes/Supplier/financeUpdateInfo'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-supplier-info',
        component: () => import('../routes/Supplier/financeUpdateInfo'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.infochange').d('供应商信息变更')
      }
    ],
  },
  // 供应商信息更新对比 -- 采购
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-comparison',
        component: () => import('../routes/Supplier/purchaseInfoComparison'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.infochange').d('信息变更比对')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-comparison',
        component: () => import('../routes/Supplier/purchaseInfoComparison'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.infochange').d('信息变更比对')
      }
    ],
  },
  // 供应商信息更新对比 -- 财务
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-comparison',
        component: () => import('../routes/Supplier/financeInfoComparison'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.infochange').d('信息变更比对')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-comparison',
        component: () => import('../routes/Supplier/financeInfoComparison'),
        models: [() => import('../models/supplierHK')],
        authorized: true,
        title: intl.get('hzero.common.title.supplier.infochange').d('信息变更比对')
      }
    ],
  },
  // 采购经理审核供应商信息更新单
  {
    components: [
      {
        path: '/spfm-hk/supplier/purchase-supplier-info-review',
        component: () => import('../routes/Supplier/purchaseUpdateInfoReview'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/purchase-supplier-info-review',
        component: () => import('../routes/Supplier/purchaseUpdateInfoReview'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 财务经理审核供应商信息更新单
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-supplier-info-review',
        component: () => import('../routes/Supplier/financeUpdateInfoReview'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-supplier-info-review',
        component: () => import('../routes/Supplier/financeUpdateInfoReview'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商财务信息更新 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-list',
        component: () => import('../routes/Finance/index'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-list',
        component: () => import('../routes/Finance/index'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  //财务信息变更单（草稿）
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-draft',
        component: () => import('../routes/Finance/draft'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-draft',
        component: () => import('../routes/Finance/draft'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 财务信息变更单（审批中）
  {
    components: [
      {
        path: '/spfm-hk/supplier/finance-being-approved',
        component: () => import('../routes/Finance/beingApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/finance-being-approved',
        component: () => import('../routes/Finance/beingApproved'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商黑名单 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/blacklist',
        component: () => import('../routes/Blacklist'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/blacklist',
        component: () => import('../routes/Blacklist'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 供应商黑名单 -- 详情编辑
  {
    components: [
      {
        path: '/spfm-hk/supplier/edit-blacklist',
        component: () => import('../routes/Blacklist/editBlacklist'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/edit-blacklist',
        component: () => import('../routes/Blacklist/editBlacklist'),
        models: [() => import('../models/supplierHK')],
        authorized: true
      }
    ],
  },
  // 状态更新记录 -- 列表
  {
    components: [
      {
        path: '/spfm-hk/status-record/list',
        component: () => import('../routes/Status'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/status-record/list',
        component: () => import('../routes/Status'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  // 供应商黑名单申请单（自动发起）
  {
    components: [
      {
        path: '/spfm-hk/supplier/auto-launch',
        component: () => import('../routes/Status/autoLaunch'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/auto-launch',
        component: () => import('../routes/Status/autoLaunch'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  // 供应商黑名单申请单（除名）
  {
    components: [
      {
        path: '/spfm-hk/supplier/remove-blacklist',
        component: () => import('../routes/Status/remove'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/remove-blacklist',
        component: () => import('../routes/Status/remove'),
        models: [() => import('../models/status')],
        authorized: true
      }
    ],
  },
  // 供应商门户 -- 门户账号配置
  {
    components: [
      {
        path: '/spfm-hk/supplier/portal-account-config',
        models: [() => import('../models/portal/portalAccount')],
        component: () => import('../routes/PortalAccountConfig/index'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/portal-account-config',
        models: [() => import('../models/portal/portalAccount')],
        component: () => import('../routes/PortalAccountConfig/index'),
        authorized: true
      }
    ],
  },
  // 供应商门户 -- 门户账号权限
  {
    components: [
      {
        path: '/spfm-hk/supplier/portal-account-permission',
        models: [() => import('../models/portal/portalAccount')],
        component: () => import('../routes/PortalAccountPermission/index'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/portal-account-permission',
        models: [() => import('../models/portal/portalAccount')],
        component: () => import('../routes/PortalAccountPermission/index'),
        authorized: true
      }
    ],
  },

  // 采购复核供应商准入信息 (门户)
  // 采购复核供应商准入信息 (门户)被退回
  // 准入注册人 id     :createBy  为portal时，说明是从供应商门户进入，取别的值；
  {
    components: [
      {
        path: '/spfm-hk/supplier/PRSA-infomation-portal/recheck',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/recheckIndex'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/PRSA-infomation-portal/recheck',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/recheckIndex'),
        authorized: true
      }
    ],
  },
  // 采购经理审核采购供应商准入信息
  {
    components: [
      {
        path: '/spfm-hk/supplier/PRSA-infomation-portal/manager',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/managerIndex'),
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/PRSA-infomation-portal/manager',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/managerIndex'),
        authorized: true,
        title: intl.get('hzero.common.title.supplier.entry').d('供应商注册')
      }
    ],
  },
  // 采购审核供应商信息更新
  {
    components: [
      {
        path: '/spfm-hk/supplier/PRSA-infomation-portal/basicUpdate',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/basicUpdateIndex'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/PRSA-infomation-portal/basicUpdate',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/basicUpdateIndex'),
        authorized: true
      }
    ],
  },
  // 财务审核供应商信息更新
  {
    components: [
      {
        path: '/spfm-hk/supplier/PRSA-infomation-portal/bankUpdate',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/bankUpdateIndex'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/PRSA-infomation-portal/bankUpdate',
        models: [() => import('../models/portal/prsaInfomationPortal')],
        component: () => import('../routes/PRSAInfomationPortal/bankUpdateIndex'),
        authorized: true
      }
    ],
  },
  // ------------------------------------------
  // 应付账项组组长审核补充银行信息
  {
    components: [
      {
        path: '/spfm-hk/supplier/approval-accountsPayable',
        component: () => import('../routes/Approval/accountsPayable'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/approval-accountsPayable',
        component: () => import('../routes/Approval/accountsPayable'),
        authorized: true
      }
    ],
  },
  // --------------------------------------------
  // 供应商评审列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-evaluation-summary/list',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationList/index'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-evaluation-summary/list',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationList/index'),
        authorized: true
      }
    ],
  },
  // 供应商手工评审单
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-evaluation-list/detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationList/addEvaluation'),
        authorized: true
      }
    ],
  },
  {
    components: [
      { // supplier-evaluation-summary/send
        path: '/pub/spfm-hk/supplier/supplier-evaluation-list/detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationList/addEvaluation'),
        authorized: true
      }
    ],
  },
  // 供应商评审汇总列表
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-evaluation-summary/detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationSummary/index'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-evaluation-summary/detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationSummary/index'),
        authorized: true
      }
    ],
  },
  // 供应商评审汇总页（获取打分）
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-evaluation-summary/collect-detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationSummary/CollectDetail'),
        authorized: true
      }
    ]
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-evaluation-summary/collect-detail',
        models: [() => import('../models/evaluation')],
        component: () => import('../routes/SupplierEvaluationSummary/CollectDetail'),
        authorized: true
      }
    ]
  },
  // 供应商报表（期间新增）
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-report-form/period-add',
        models: [() => import('../models/supplierReport')],
        component: () => import('../routes/PeriodAdd/index'),
        authorized: true
      }
    ]
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-report-form/period-add',
        models: [() => import('../models/supplierReport')],
        component: () => import('../routes/PeriodAdd/index'),
        authorized: true
      }
    ]
  },
  // 期间修改
  {
    components: [
      {
        path: '/spfm-hk/supplier/supplier-report-form/period-modify',
        models: [() => import('../models/supplierReport')],
        component: () => import('../routes/PeriodModify/index'),
        authorized: true
      }
    ]
  },
  {
    components: [
      {
        path: '/pub/spfm-hk/supplier/supplier-report-form/period-modify',
        models: [() => import('../models/supplierReport')],
        component: () => import('../routes/PeriodModify/index'),
        authorized: true
      }
    ]
  },
];
