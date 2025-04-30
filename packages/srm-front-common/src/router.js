import React from 'react';
import { routerRedux, Switch, Route } from 'dva/router';
import { isEmpty } from 'lodash';
import { modifyVars } from 'less';
// import Icons from 'components/Icons';
// import dynamic from 'dva/dynamic';

import { Container } from '@hzero-front-ui/cfg/lib';
import UedTheme from 'components/UedTheme';

import ModalContainer, { registerContainer } from 'components/Modal/ModalContainer';
import Authorized from 'components/Authorized/WrapAuthorized';
import PermissionProvider from 'components/Permission/PermissionProvider';

import LocalProviderAsync from 'utils/intl/LocaleProviderAsync';
import intl from 'utils/intl';
import { dynamicWrapper } from 'utils/router';
import { getAccessToken, getCurrentTenant } from 'utils/utils';
import { LOGIN_URL } from 'utils/config';
import request from 'utils/request';
import { SRM_SCEC, SRM_PLATFORM, SRM_MALL_HOST } from '_utils/config';

// import LoadingBar from 'components/LoadingBar';
import styles from './index.less';

const { ConnectedRouter } = routerRedux;
const { DefaultAuthorizedRoute, PubAuthorizedRoute } = Authorized;
// TODO 将默认进度条放在BasicLayout中设置
// dynamic.setDefaultLoadingComponent(() => {
//   return <LoadingBar />;
// });

// 打开商城界面
// function openMall() {
//   // 获取access_token
//   // eslint-disable-next-line
//   const access_token = getAccessToken();
//   // eslint-disable-next-line
//   window.open(`${SRM_MALL_HOST}#access_token=${access_token}`, '_black');
// }

// 引导链接
class LeadLink extends React.Component {
  state = {
    mall_host: undefined,
    mallLink: false,
    financialLink: false,
  };

  /**
   * 查询二级地址商城域名配置
   */
  queryMallHost = () => {
    const srmUrl = window.location.origin;
    return request(`${SRM_SCEC}/v1/mall-page-configs/mall-config`, {
      method: 'GET',
      query: { srmUrl },
    });
  };

  queryLinkConfig = () => {
    const url = window.location.host;
    return request(`${SRM_PLATFORM}/v1/portal-assigns-cache`, {
      method: 'GET',
      query: { url },
    });
  };

  componentDidMount() {
    if (getCurrentTenant() && getCurrentTenant().tenantNum === 'SRM-PORSCHE') {
      modifyVars(
        // 更换主题颜色要这么写
        {
          '@Porsche-Font-Family': 'PorscheFont',
        }
      );
    }
    this.queryMallHost().then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          mall_host: res.webUrl,
        });
      }
    });
    this.queryLinkConfig().then((res) => {
      if (!isEmpty(res) && !res.failed && res.navbar) {
        const configs = JSON.parse(res.navbar);
        if (configs.length > 0) {
          const jsonConfig = configs.map((c) => JSON.parse(c));
          this.setState({
            mallLink: jsonConfig.find((r) => r.content === 'mallLink').description || true,
            financialLink:
              jsonConfig.find((r) => r.content === 'financialLink').description || true,
          });
        }
      } else {
        this.setState({
          mallLink: true,
          financialLink: true,
        });
      }
    });
  }

  render() {
    //  eslint-disable-next-line
    const { mall_host, mallLink, financialLink } = this.state;
    const accessToken = getAccessToken();
    return (
      <React.Fragment>
        {!!+mallLink && (
          <a
            className={styles['header-link']}
            target="_blank"
            rel="noopener noreferrer"
            //  eslint-disable-next-line
            href={`${mall_host || SRM_MALL_HOST}#access_token=${accessToken}`}
          >
            <span>{intl.get('srm.common.view.title.enterpriseMall').d('企业商城')}</span>
          </a>
        )}
        {!!+financialLink && (
          <a
            className={styles['header-link']}
            target="_blank"
            rel="noopener noreferrer"
            href="https://hjl.hscf.com/mkt/index"
          >
            <span>{intl.get('srm.common.view.title.financialMarket').d('金融超市')}</span>
          </a>
        )}
        <a
          className={styles['header-link']}
          target="_blank"
          rel="noopener noreferrer"
          href={LOGIN_URL}
        >
          <span>{intl.get('srm.common.view.title.SRMPortal').d('SRM门户')}</span>
        </a>
      </React.Fragment>
    );
  }
}

function RouterConfig({ history, app }) {
  const Layout = dynamicWrapper(
    app,
    ['user', 'login'],
    () => import('hzero-front/lib/layouts/Layout')
    // import('./layouts/DefaultLayout')
  );
  const PubLayout = dynamicWrapper(app, ['user', 'login'], () =>
    import('hzero-front/lib/layouts/PubLayout')
  );
  // 免登陆无权限路由
  const PublicLayout = dynamicWrapper(app, [], () =>
    import('hzero-front/lib/layouts/PublicLayout')
  );
  return (
    <Container defaultTheme="theme2">
      <UedTheme />
      <LocalProviderAsync>
        <PermissionProvider>
          <ConnectedRouter history={history}>
            <React.Fragment>
              <ModalContainer ref={registerContainer} />
              <Switch>
                <Route path="/public" render={(props) => <PublicLayout {...props} />} />
                <PubAuthorizedRoute path="/pub" render={(props) => <PubLayout {...props} />} />
                {/* <AuthorizedRoute path="/" render={props => <BasicLayout {...props} />} /> */}
                <DefaultAuthorizedRoute
                  path="/"
                  render={(props) => (
                    <Layout
                      extraHeaderRight={[<LeadLink />]}
                      headerProps={{ toolbarProps: { extraHeaderRight: <LeadLink /> } }}
                      {...props}
                    />
                    //  <LeadLink />
                    // </DefaultLayout>
                  )}
                />
              </Switch>
            </React.Fragment>
          </ConnectedRouter>
        </PermissionProvider>
      </LocalProviderAsync>
    </Container>
  );
}

export default RouterConfig;
