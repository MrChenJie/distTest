import { setLayout } from 'hzero-front/lib/customize/layout';
// 注入 hzero-front 时 注入 自定义的 layouts
// 侧边平铺布局
// setLayout('inline', async () => import('../layouts/DefaultLayout'));
// 上方菜单布局
setLayout('inline', async () => import('../layouts/CMILayout'));
// 侧边级联布局
// setLayout('side', async () => import('hzero-front/lib/layouts/SideLayout'));
// 侧边展开布局
// setLayout('side-all', async () => import('hzero-front/lib/layouts/CommonLayout'));
// 注入 hzero-front 时 注入 自定义的 layouts
