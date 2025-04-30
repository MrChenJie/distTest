import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const routerConfig: RoutersConfig = [
  {
    path: '/pub/gotoClose',
    component: () => import('../pages/gotoClose'),
    authorized: true,
    title: 'test-page',
  },
  {
    path: '/pub/iframe',
    component: () => import('../pages/IFrame'),
    authorized: true,
    title: 'iframe-page',
  },
  {
    path: '/workplace',
    component: () => import('../pages/workplace'),
  },
  // ============门户首页配置========================
  {
    path: '/home-config',
    component: () => import('../pages/HomeConfig'),
    models: [() => import('../models/home')],
    title: 'Home Config',
  },
  {
    path: '/pub/home-config',
    component: () => import('../pages/HomeConfig'),
    models: [() => import('../models/home')],
    title: 'Home Config',
    authorized: true,
  },
  {
    path: '/public/construction-page',
    component: () => import('../pages/Construction'),
    title: 'Construction In Progress',
    authorized: true,
  },
  {
    path: '/pub/questionnaire-survey/list',
    component: () => import('../pages/QuestionSurvey'),
    models: [() => import('../models/questionSurvey')],
    title: 'Questionnaire Survey',
    authorized: true,
  },
];

export default routerConfig;
