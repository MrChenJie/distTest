import React from 'react';
import DocumentTitle from 'react-document-title';
import { Icon } from 'hzero-ui';
import { connect } from 'dva';
import dynamic from 'dva/dynamic';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import LoadingBar from 'components/NProgress/LoadingBar';
import { tabListen } from 'utils/menuTab';
import { IM_ENABLE } from 'utils/config';

import DefaultHeaderLogo from 'layouts/components/DefaultHeaderLogo';
import DefaultMenuTabs from 'layouts/components/DefaultMenuTabs';
import DefaultHeaderRight from 'layouts/components/DefaultHeaderRight';
import IM from 'layouts/components/IM';

import Menu from './Menus';
import MenuProvider from './Menus/MenuProvider';
import MenuConsumer from './Menus/MenuConsumer';

import HeaderSearch from '../DefaultLayout/components/NormalHeaderSearch';

import './styles.less';
import { getStyle } from './utils';

const logoStyles = {
  logo: getStyle('header-logo'),
  title: getStyle('header-title'),
  // collapsed: getStyle('header-collapsed'), //  布局不需要组件内部 collapsed, 全部使用外部的 layout-collapsed 控制
  'icon-icon': getStyle('header-icon-icon'),
  'icon-img': getStyle('header-icon-img'),
};

class TopLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  componentDidMount() {
    // 清除首屏loading
    const loader = document.querySelector('#loader-wrapper');
    if (loader) {
      document.body.removeChild(loader);
      // 设置默认页面加载动画
      dynamic.setDefaultLoadingComponent(() => {
        return <LoadingBar />;
      });
    }
    this.init();
  }

  init() {
    const { dispatch, currentUser = {} } = this.props;
    const { language } = currentUser;
    dispatch({
      type: 'global/baseLazyInit',
      payload: {
        language,
      },
    }).then(() => {
      // 初始化菜单成功后 调用 tabListen 来触发手动输入的网址
      tabListen();
    });
  }

  @Bind()
  toggleCollapse() {
    const { collapsed = false } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  render() {
    const { currentUser = {} } = this.props;
    return <DocumentTitle title={currentUser.title || ''}>{this.renderLayout()}</DocumentTitle>;
  }

  renderLayout() {
    const { currentUser = {}, extraHeaderRight, dispatch } = this.props;
    const { collapsed = false } = this.state;
    let imEnable = false;
    try {
      imEnable = JSON.parse(IM_ENABLE);
    } catch (e) {
      imEnable = false;
    }
    return (
      <MenuProvider>
        <div
          className={classnames(getStyle('layout'), {
            [getStyle('layout-collapsed')]: collapsed,
          })}
        >
          <div className={getStyle('header')}>
            <div className={getStyle('header-left')}>
              <DefaultHeaderLogo
                collapsed={collapsed}
                logo={currentUser.logo}
                title={currentUser.title}
                styles={logoStyles}
              />
            </div>
            <div className={getStyle('header-content')}>
              <Icon
                className={getStyle('menu-trigger')}
                type={collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggleCollapse}
              />
              <div className={getStyle('header-right')}>
                <DefaultHeaderRight extraHeaderRight={extraHeaderRight} dispatch={dispatch} />
              </div>
            </div>
          </div>
          <div className={getStyle('content')}>
            <div className={getStyle('menu')}>{/* hzero-menu */}
              <div>
                <HeaderSearch />
              </div>
              <MenuConsumer>
                <Menu />
              </MenuConsumer>
            </div>
            <div className={getStyle('page')}>
              <DefaultMenuTabs />
              {imEnable && <IM />}
            </div>
          </div>
        </div>
      </MenuProvider>
    );
  }
}

export default connect(({ user = {}, global = {} }) => ({
  menu: global.menu, // 菜单
  routerData: global.routerData, // 路由配置
  currentUser: user.currentUser, // 当前用户
  activeTabKey: global.activeTabKey, // 当前路由
  tabs: global.tabs, // 所有 tab 页
  language: global.language, // 当前语言
  count: global.count, // 当前消息计数
}))(TopLayout);
