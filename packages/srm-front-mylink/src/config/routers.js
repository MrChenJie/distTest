const { intl } = window;

module.exports = [
  // --------------- 合作方式 ----------------
  {
    authorized: true,
    path: '/mylink/collaboration-mode',
    components: [
      {
        authorized: true,
        path: '/mylink/collaboration-mode/list/:type',
        component: () => import('../routes/CollaborationMode'),
        models: [() => import('../models/CollaborationModeModal')],
      },
      // {
      //   authorized: true,
      //   path: '/mylink/collaboration-mode/list/change',
      //   component: () => import('../routes/CollaborationMode'),
      //   models: [() => import('../models/CollaborationModeModal')],
      // },
      {
        authorized: true,
        path: '/mylink/collaboration-mode/Detail/:type',
        component: () => import('../routes/CollaborationMode/Detail'),
        models: [() => import('../models/CollaborationModeModal')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/collaboration-mode',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/collaboration-mode/list/:type',
        component: () => import('../routes/CollaborationMode'),
        models: [() => import('../models/CollaborationModeModal')],
        title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      },
      // {
      //   authorized: true,
      //   path: '/pub/mylink/collaboration-mode/list/change',
      //   component: () => import('../routes/CollaborationMode'),
      //   models: [() => import('../models/CollaborationModeModal')],
      //   title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      // },
      {
        authorized: true,
        path: '/pub/mylink/collaboration-mode/Detail/:type',
        component: () => import('../routes/CollaborationMode/Detail'),
        models: [() => import('../models/CollaborationModeModal')],
      },
    ],
  },

  // --------------- 合作方案 ----------------
  {
    authorized: true,
    path: '/mylink/collaboration-case',
    components: [
      {
        authorized: true,
        path: '/mylink/collaboration-case/list/:type',
        component: () => import('../routes/CollaborationCase'),
        models: [() => import('../models/CollaborationCaseModal'), () => import('../models/CollaborationModeModal')],
      },
      {
        authorized: true,
        path: '/mylink/collaboration-case/Detail/:type',
        component: () => import('../routes/CollaborationCase/Detail'),
        models: [() => import('../models/CollaborationCaseModal'), () => import('../models/CollaborationModeModal')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/collaboration-case',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/collaboration-case/list/:type',
        component: () => import('../routes/CollaborationCase'),
        models: [() => import('../models/CollaborationCaseModal'), () => import('../models/CollaborationModeModal')],
        title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      },
      {
        authorized: true,
        path: '/pub/mylink/collaboration-case/Detail/:type',
        component: () => import('../routes/CollaborationCase/Detail'),
        models: [() => import('../models/CollaborationCaseModal'), () => import('../models/CollaborationModeModal')],
      },
    ],
  },

  // --------------- 报名信息 ----------------
  {
    authorized: true,
    path: '/mylink/registration-information',
    components: [
      {
        authorized: true,
        path: '/mylink/registration-information/list',
        component: () => import('../routes/RegistrationInformation'),
        models: [() => import('../models/RegistrationInformationModal')],
        title: intl.get(`hzero.common.title.register.detail`).d('报名详情'),
      },
      {
        authorized: true,
        path: '/mylink/registration-information/Detail',
        component: () => import('../routes/RegistrationInformation/Detail'),
        models: [() => import('../models/RegistrationInformationModal')],
        title: intl.get(`hzero.common.title.register.detail`).d('报名详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/registration-information',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/registration-information/list',
        component: () => import('../routes/RegistrationInformation'),
        models: [() => import('../models/RegistrationInformationModal')],
        title: intl.get(`hzero.common.title.register.detail`).d('报名详情'),
      },
      {
        authorized: true,
        path: '/pub/mylink/registration-information/Detail',
        component: () => import('../routes/RegistrationInformation/Detail'),
        models: [() => import('../models/RegistrationInformationModal')],
        title: intl.get(`hzero.common.title.register.detail`).d('报名详情'),
      },
    ],
  },

  // --------------- 合作伙伴信息 ----------------
  {
    authorized: true,
    path: '/mylink/partners-information',
    components: [
      {
        authorized: true,
        path: '/mylink/cooperation-change/list',
        component: () => import('../routes/PartnerInformation'),
        models: [() => import('../models/PartnerInformationModal'),() => import('../models/cooperationCategoryModal')],
        
      },
      {
        authorized: true,
        path: '/mylink/partners-information/Detail',
        component: () => import('../routes/PartnerInformation/Detail'),
        models: [() => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/partners-information',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/cooperation-change/list',
        component: () => import('../routes/PartnerInformation'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      },
      {
        authorized: true,
        path: '/pub/mylink/partners-information/Detail',
        component: () => import('../routes/PartnerInformation/Detail'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
    ],
  },

    // --------------- 合作伙伴信息更新 ----------------
    {
      authorized: true,
      path: '/mylink/cooperation-change',
      components: [
        // {
        //   authorized: true,
        //   path: '/mylink/cooperation-change/list',
        //   component: () => import('../routes/PartnerInformation'),
        //   models: [() => import('../models/PartnerInformationModal')],
        //   title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
        // },
        {
          authorized: true,
          path: '/mylink/cooperation-change/Detail',
          component: () => import('../routes/cooperationChange/Detail'),
          models: [() => import('../models/PartnerInformationModal')],
          title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
        },
      ],
    },
    {
      authorized: true,
      path: '/pub/mylink/cooperation-change',
      components: [
        // {
        //   authorized: true,
        //   path: '/pub/mylink/cooperation-change/list',
        //   component: () => import('../routes/PartnerInformation'),
        //   models: [() => import('../models/PartnerInformationModal')],
        //   title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
        // },
        {
          authorized: true,
          path: '/pub/mylink/cooperation-change/Detail',
          component: () => import('../routes/cooperationChange/Detail'),
          models: [() => import('../models/PartnerInformationModal')],
          title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
        },
      ],
    },

      // --------------- 门户澄清管理 ----------------
  {
    authorized: true,
    path: '/mylink/clarification',
    components: [
      {
        authorized: true,
        path: '/mylink/clarification/list',
        component: () => import('../routes/Clarification'),
        models: [() => import('../models/ClarificationModel')],
      },
      {
        authorized: true,
        path: '/mylink/clarification/detail',
        component: () => import('../routes/Clarification/Detail/index'),
        models: [() => import('../models/ClarificationModel')],
        title: intl.get(`hzero.common.title.mylink.qa`).d('门户答疑澄清'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/clarification',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/clarification/list',
        component: () => import('../routes/Clarification'),
        models: [() => import('../models/ClarificationModel')],
      },
      {
        authorized: true,
        path: '/pub/mylink/clarification/detail',
        component: () => import('../routes/Clarification/Detail/index'),
        models: [() => import('../models/ClarificationModel')],
        title: intl.get(`hzero.common.title.mylink.qa`).d('门户答疑澄清'),
      },
    ],
  },
  // 账号配置
  {
    components: [
      {
        path: '/mylink/supplier/portal-account-config',
        models: [() => import('../models/portalAccount')],
        component: () => import('../routes/PortalAccountConfig/index'),
        authorized: true
      }
    ],
  },
  {
    components: [
      {
        path: '/pub/mylink/supplier/portal-account-config',
        models: [() => import('../models/portalAccount')],
        component: () => import('../routes/PortalAccountConfig/index'),
        authorized: true
      }
    ],
  },

  // --------------- 合作伙伴信息 ----------------
  {
    authorized: true,
    path: '/mylink/select-judges',
    components: [
      {
        authorized: true,
        path: '/mylink/select-judges/list',
        component: () => import('../routes/selectJudges'),
        models: [() => import('../models/PartnerInformationModal')],
        title: intl.get(`hzero.common.title.dictpartner.management`).d('合作伙伴管理'),
      },
      {
        authorized: true,
        path: '/mylink/select-judges/Detail',
        component: () => import('../routes/selectJudges/Detail'),
        models: [() => import('../models/PartnerInformationModal')],
        title: intl.get(`hzero.common.title.mylink.jurydraw`).d('评委抽取页面'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/select-judges',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/select-judges/list',
        component: () => import('../routes/selectJudges'),
        models: [() => import('../models/PartnerInformationModal')],
        title: intl.get(`hzero.common.title.dictpartner.management`).d('合作伙伴管理'),
      },
      {
        authorized: true,
        path: '/pub/mylink/select-judges/Detail',
        component: () => import('../routes/selectJudges/Detail'),
        models: [() => import('../models/PartnerInformationModal')],
        title: intl.get(`hzero.common.title.mylink.jurydraw`).d('评委抽取页面'),
      },
    ],
  },

   // --------------- 专家库 ----------------
   {
    authorized: true,
    path: '/mylink/register-management',
    components: [
      {
        authorized: true,
        path: '/mylink/register-management/list',
        component: () => import('../routes/registerManagement'),
        models: [() => import('../models/registerManagementModel')],
      },
      {
        authorized: true,
        path: '/mylink/register-management/Detail',
        component: () => import('../routes/registerManagement/Detail'),
        models: [() => import('../models/registerManagementModel')],
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/register-management',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/register-management/list',
        component: () => import('../routes/registerManagement'),
        models: [() => import('../models/registerManagementModel')],
        title: intl.get(`hzero.common.title.ActRequestList`).d('活动申请'),
      },
      {
        authorized: true,
        path: '/pub/mylink/register-management/Detail',
        component: () => import('../routes/registerManagement/Detail'),
        models: [() => import('../models/registerManagementModel')],
      },
    ],
  },

   // --------------- 商盟合作更新 ----------------
   {
    authorized: true,
    path: '/mylink/cooperation-category',
    components: [
      {
        authorized: true,
        path: '/mylink/cooperation-category/change',
        component: () => import('../routes/cooperationCategory'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
      {
        authorized: true,
        path: '/mylink/cooperation-category/Detail',
        component: () => import('../routes/cooperationCategory/Detail'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/cooperation-category',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/cooperation-category/change',
        component: () => import('../routes/cooperationCategory'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
      {
        authorized: true,
        path: '/pub/mylink/cooperation-category/Detail',
        component: () => import('../routes/cooperationCategory/Detail'),
        models: [
          () => import('../models/PartnerInformationModal'),
          () => import('../models/cooperationCategoryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('商盟伙伴详情'),
      },
    ],
  },

  // --------------- 合作伙伴评估 ----------------
  {
    authorized: true,
    path: '/mylink/partner-assessment',
    components: [
      {
        authorized: true,
        path: '/mylink/partner-assessment/list',
        component: () => import('../routes/partnerAssessment'),
        models: [() => import('../models/partnerAssessmentModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail1`).d('合作伙伴评估列表'),
      },
      {
        authorized: true,
        path: '/mylink/partner-assessment/Detail',
        component: () => import('../routes/partnerAssessment/Detail'),
        models: [() => import('../models/partnerAssessmentModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('合作伙伴评估详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/partner-assessment',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/partner-assessment/list',
        component: () => import('../routes/partnerAssessment'),
        models: [() => import('../models/partnerAssessmentModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail1`).d('合作伙伴评估列表'),
      },
      {
        authorized: true,
        path: '/pub/mylink/partner-assessment/Detail',
        component: () => import('../routes/partnerAssessment/Detail'),
        models: [() => import('../models/partnerAssessmentModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('合作伙伴评估详情'),
      },
    ],
  },

  // --------------- 合作伙伴汇总评估 ----------------
  {
    authorized: true,
    path: '/mylink/partner-assessment/summary',
    components: [
      {
        authorized: true,
        path: '/mylink/partner-assessment/summary/list',
        component: () => import('../routes/partnerAssessmentSummary'),
        models: [() => import('../models/partnerAssessmentSummaryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail1`).d('合作伙伴评估汇总列表'),
      },
      {
        authorized: true,
        path: '/mylink/partner-assessment/summary/Detail',
        component: () => import('../routes/partnerAssessmentSummary/Detail'),
        models: [() => import('../models/partnerAssessmentSummaryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('合作伙伴评估汇总详情'),
      },
    ],
  },
  {
    authorized: true,
    path: '/pub/mylink/partner-assessment',
    components: [
      {
        authorized: true,
        path: '/pub/mylink/partner-assessment/summary/list',
        component: () => import('../routes/partnerAssessmentSummary'),
        models: [() => import('../models/partnerAssessmentSummaryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail1`).d('合作伙伴评估汇总列表'),
      },
      {
        authorized: true,
        path: '/pub/mylink/partner-assessment/summary/Detail',
        component: () => import('../routes/partnerAssessmentSummary/Detail'),
        models: [() => import('../models/partnerAssessmentSummaryModal')],
        title: intl.get(`hzero.common.title.mylink.partner.detail`).d('合作伙伴评估汇总详情'),
      },
    ],
  },
];
