module.exports = [
  // --------------- 合作方式管理 ----------------
  {
    authorized: true,
    path: '/dict/cooperation-mode-management',
    components: [
      {
        authorized: true,
        path: '/dict/cooperation-mode-management/list',
        component: () => import('../routes/cooperationModeManagement'),
        models: [() => import('../models/cooperationModeManagementModel')],
      },
      // 公告审批流程
      {
        authorized: true,
        path: '/dict/cooperation-mode-management/detail',
        component: () => import('../routes/cooperationModeManagement/Detail'),
        models: [() => import('../models/cooperationModeManagementModel')],
        title: intl.get('hzero.common.title.dictcooperation.mode').d('合作模式管理'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/dict/cooperation-mode-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/cooperation-mode-management/list',
        component: () => import('../routes/cooperationModeManagement'),
        models: [() => import('../models/cooperationModeManagementModel')],
      },
      // 公告审批流程
      {
        authorized: true,
        path: '/pub/dict/cooperation-mode-management/detail',
        component: () => import('../routes/cooperationModeManagement/Detail'),
        models: [() => import('../models/cooperationModeManagementModel')],
        title: intl.get('hzero.common.title.dictcooperation.mode').d('合作模式管理'),
      },
    ],
  },
  // --------------- 报名信息管理 ----------------
  {
    authorized: true,
    path: '/dict/register-management',
    components: [
      {
        authorized: true,
        path: '/dict/register-management/list',
        component: () => import('../routes/registerManagement'),
        models: [() => import('../models/registerManagementModel')],
      },
      {
        authorized: true,
        path: '/dict/register-management/detail',
        component: () => import('../routes/registerManagement/Detail'),
        models: [() => import('../models/registerManagementModel')],
        title: intl.get('hzero.common.title.dictregister.management').d('报名信息管理'),
      },
    ],
  },
  {
    path: '/pub/dict/register-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/register-management/list',
        component: () => import('../routes/registerManagement'),
        models: [() => import('../models/registerManagementModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/register-management/detail',
        component: () => import('../routes/registerManagement/Detail'),
        models: [() => import('../models/registerManagementModel')],
        title: intl.get('hzero.common.title.dictregister.management').d('报名信息管理'),
      },
    ],
  },
  // --------------- 评委专家管理 ----------------
  {
    authorized: true,
    path: '/dict/judges-management',
    components: [
      {
        authorized: true,
        path: '/dict/judges-management/list',
        component: () => import('../routes/judgesManagement'),
        models: [() => import('../models/judgesManagementModel')],
      },
      {
        authorized: true,
        path: '/dict/judges-management/detail',
        component: () => import('../routes/judgesManagement/Detail'),
        models: [() => import('../models/judgesManagementModel')],
        title: intl.get('hzero.common.title.dictjudge.management').d('评委专家管理'),
      },
    ],
  },
  {
    path: '/pub/dict/judges-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/judges-management/list',
        component: () => import('../routes/judgesManagement'),
        models: [() => import('../models/judgesManagementModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/judges-management/detail',
        component: () => import('../routes/judgesManagement/Detail'),
        models: [() => import('../models/judgesManagementModel')],
        title: intl.get('hzero.common.title.dictjudge.management').d('评委专家管理'),
      },
    ],
  },
  // --------------- 门户答疑管理 ----------------
  {
    authorized: true,
    path: '/dict/QA-management',
    components: [
      {
        authorized: true,
        path: '/dict/QA-management/list',
        component: () => import('../routes/qaManagement'),
        models: [() => import('../models/qaManagementModel')],
      },
      {
        authorized: true,
        path: '/dict/QA-management/detail',
        component: () => import('../routes/qaManagement/Detail/index'),
        models: [() => import('../models/qaManagementModel')],
        title: intl.get('hzero.common.title.dictqa.management').d('门户答疑管理'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/dict/QA-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/QA-management/list',
        component: () => import('../routes/qaManagement'),
        models: [() => import('../models/qaManagementModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/QA-management/detail',
        component: () => import('../routes/qaManagement/Detail/index'),
        models: [() => import('../models/qaManagementModel')],
        title: intl.get('hzero.common.title.dictqa.management').d('门户答疑管理'),
      },
    ],
  },
  // --------------- 合作伙伴入库 ----------------
  {
    authorized: true,
    path: '/dict/partner-management',
    components: [
      {
        authorized: true,
        path: '/dict/partner-management/list',
        component: () => import('../routes/partnerManagement'),
        models: [() => import('../models/partnerManagementModel')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/dict/partner-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/partner-management/list',
        component: () => import('../routes/partnerManagement'),
        models: [() => import('../models/partnerManagementModel')],
      },
    ],
  },
  // --------------- 合作伙伴信息更新 ----------------
  {
    authorized: true,
    path: '/dict/partner-info-update',
    components: [
      {
        authorized: true,
        path: '/dict/partner-info-update/list',
        component: () => import('../routes/partnerInfoUpdateManagement'),
        models: [() => import('../models/partnerInfoUpdateManagementModel')],
      },
      {
        authorized: true,
        path: '/dict/partner-info-update/detail',
        component: () => import('../routes/partnerInfoUpdateManagement/Detail/Basic'),
        models: [
          () => import('../models/partnerInfoUpdateManagementModel'),
          () => import('../models/partnerReviewModel'),
        ],
        title: intl.get('hzero.common.title.dictpartnerinfo.update').d('合作伙伴信息更新'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/dict/partner-info-update',
    components: [
      {
        authorized: true,
        path: '/pub/dict/partner-info-update/list',
        component: () => import('../routes/partnerInfoUpdateManagement'),
        models: [() => import('../models/partnerInfoUpdateManagementModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/partner-info-update/detail',
        component: () => import('../routes/partnerInfoUpdateManagement/Detail/Basic'),
        models: [
          () => import('../models/partnerInfoUpdateManagementModel'),
          () => import('../models/partnerReviewModel'),
        ],
        title: intl.get('hzero.common.title.dictpartnerinfo.update').d('合作伙伴信息更新'),
      },
    ],
  },

  // --------------- 合作伙伴评审 ----------------
  {
    authorized: true,
    path: '/dict/partnerReview',
    component: () => import('../routes/partnerReview'),
    models: [() => import('../models/partnerReviewModel')],
    title: intl.get('hzero.common.title.dictregister.management').d('报名信息管理'),
  },
  {
    authorized: true,
    path: '/pub/dict/partnerReview',
    component: () => import('../routes/partnerReview'),
    models: [() => import('../models/partnerReviewModel')],
    title: intl.get('hzero.common.title.dictregister.management').d('报名信息管理'),
  },

  //  --------------- 退回邮件发送 ----------------
  {
    authorized: true,
    path: '/dict/reviewReturn',
    component: () => import('../routes/reviewReturn'),
    models: [() => import('../models/partnerReviewModel')],
    title: intl.get('hzero.common.title.selectjudge.sendemail').d('发送门户/邮件'),
  },
  {
    authorized: true,
    path: '/pub/dict/reviewReturn',
    component: () => import('../routes/reviewReturn'),
    models: [() => import('../models/partnerReviewModel')],
    title: intl.get('hzero.common.title.selectjudge.sendemail').d('发送门户/邮件'),
  },
  // --------------- 黑名单管理 ----------------
  {
    authorized: true,
    path: '/dict/blacklist-management',
    components: [
      {
        authorized: true,
        path: '/dict/blacklist-management/list',
        component: () => import('../routes/blacklistManagement'),
        models: [() => import('../models/blacklistManagementModel')],
      },
      {
        authorized: true,
        path: '/dict/blacklist-management/detail',
        component: () => import('../routes/blacklistManagement/Detail'),
        models: [() => import('../models/blacklistManagementModel')],
        title: intl.get('hzero.common.title.dictcooperation.mode').d('黑名单管理'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/dict/blacklist-management',
    components: [
      {
        authorized: true,
        path: '/pub/dict/blacklist-management/list',
        component: () => import('../routes/blacklistManagement'),
        models: [() => import('../models/blacklistManagementModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/blacklist-management/detail',
        component: () => import('../routes/blacklistManagement/Detail'),
        models: [() => import('../models/blacklistManagementModel')],
        title: intl.get('hzero.common.title.dictcooperation.mode').d('黑名单管理'),
      },
    ],
  },
  // --------------- 官网注册列表 ----------------
  {
    authorized: true,
    path: '/dict/register-officialWebsite',
    components: [
      {
        authorized: true,
        path: '/dict/register-officialWebsite/list',
        component: () => import('../routes/registerOfficialWebsite'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
      },
      {
        authorized: true,
        path: '/dict/register-officialWebsite/detail',
        component: () => import('../routes/registerOfficialWebsite/Detail'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
        title: intl.get('hzero.common.title.dictofficialregister.list').d('官网注册列表'),
      },
    ],
  },
  {
    path: '/pub/dict/register-officialWebsite',
    components: [
      {
        authorized: true,
        path: '/pub/dict/register-officialWebsite/list',
        component: () => import('../routes/registerOfficialWebsite'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
      },
      {
        authorized: true,
        path: '/pub/dict/register-officialWebsite/detail',
        component: () => import('../routes/registerOfficialWebsite/Detail'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
        title: intl.get('hzero.common.title.dictofficialregister.list').d('官网注册列表'),
      },
    ],
  },
  {
    path: '/dict/register-officialWebsite/SendEmail',
    components: [
      {
        authorized: true,
        path: '/dict/register-officialWebsite/SendEmail',
        component: () => import('../routes/registerOfficialWebsite/SendEmail'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
        title: intl.get('hzero.common.view.menu.sendemail').d('发送邮件'),
      },
    ],
  },
  {
    path: '/pub/dict/register-officialWebsite/SendEmail',
    components: [
      {
        authorized: true,
        path: '/pub/dict/register-officialWebsite/SendEmail',
        component: () => import('../routes/registerOfficialWebsite/SendEmail'),
        models: [() => import('../models/registerOfficialWebsiteModel')],
        title: intl.get('hzero.common.view.menu.sendemail').d('发送邮件'),
      },
    ],
  },
];
