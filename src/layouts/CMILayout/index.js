/**
 * NormalLayout
 * @author CQX <qingxin.chen@hand-china.com>
 * @date 2020/8/1
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import classNames from 'classnames';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';

import { getCurrentOrganizationId } from 'utils/utils';
import { DEBOUNCE_TIME } from 'utils/constants';
import { getTabFromKey } from 'utils/menuTab';
import intl from 'utils/intl';
// layouts/SideLayout/components
import SideHeaderSearch from 'layouts/SideLayout/components/SideHeaderSearch';
import SideHistory from 'layouts/SideLayout/components/SideHeaderSearch/History';
// layouts/components
import DefaultCheckUserSafe from 'layouts/components/DefaultCheckUserSafe';
import DefaultListenAccessToken from 'layouts/components/DefaultListenAccessToken';
import DefaultListenWebSocket from 'layouts/components/DefaultListenWebSocket';
import DefaultListenFavicon from 'layouts/components/DefaultListenFavicon';
import DefaultLayoutAction from 'layouts/components/DefaultLayoutAction';
// ./
// import NormalHeader from './components/NormalHeader';
import NormalNav from './components/NormalNav';
import NormalContent from './components/NormalContent';
import CMIMenu from './components/Menus';

import { getClassName } from './utils';

import './styles.less';

const getHeaderSearchClassName = (...paths) => getClassName('side-search', ...paths);
const getHeaderSearchHistoryClassName = (...paths) => getHeaderSearchClassName('history', ...paths);

const WrapHistory = (props) => (
  <SideHistory {...props} getClassName={getHeaderSearchHistoryClassName} />
);
const WrapHeaderSearch = (props) => (
  <SideHeaderSearch
    {...props}
    getClassName={getHeaderSearchClassName}
    components={{
      History: WrapHistory,
    }}
  />
);

class NormalLayout extends Component {
  static propTypes = {};

  static defaultProps = {};

  state = {
    collapsed: true,
  };

  componentWillUnmount() {
    this.handleToggleCollapse.cancel();
  }

  @Bind()
  fetchRoleList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchRoleList',
      payload: { organizationId: getCurrentOrganizationId() },
    });
  }

  @Bind()
  logout() {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/logout',
    });
  }

  @Throttle(DEBOUNCE_TIME)
  @Bind()
  handleToggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  // 用于打开侧边栏
  @Bind
  onCollapse() {
    if (this.state.collapsed) {
      this.handleToggleCollapse();
    }
  }

  renderLayout() {
    // const { currentUser = {}, roleList, extraHeaderRight, dispatch, global } = this.props;
    // const { logo, title } = currentUser;
    const { collapsed } = this.state;
    return (
      <div
        className={classNames(getClassName('container'), {
          [getClassName('container', 'collapsed')]: collapsed,
        })}
      >
        {/*        <div className={getClassName('header')}>
          <NormalHeader
            dispatch={dispatch}
            logo={logo}
            title={title}
            realName={currentUser.realName}
            roleName={currentUser.currentRoleName}
            userAvatar={currentUser.imageUrl}
            dataHierarchyFlag={currentUser.dataHierarchyFlag}
            fetchRoleList={this.fetchRoleList}
            logout={this.logout}
            roleList={roleList}
            extraRight={extraHeaderRight}
            collapsed={collapsed}
            handleToggleCollapse={this.handleToggleCollapse}
          />
        </div> */}
        <div className={getClassName('body')}>
          <div className={getClassName('nav')}>
            <NormalNav
              collapsed={collapsed}
              components={{
                HeaderSearch: WrapHeaderSearch,
                Menu: CMIMenu,
              }}
              onCollapse={this.onCollapse}
              handleToggleCollapse={this.handleToggleCollapse}
            />
          </div>
          <div className={getClassName('content')}>
            <NormalContent />
          </div>
        </div>
        <DefaultLayoutAction />
        <DefaultCheckUserSafe />
        <DefaultListenAccessToken />
        <DefaultListenWebSocket />
        <DefaultListenFavicon />
      </div>
    );
  }

  render() {
    const { activeTabKey } = this.props;
    const activeTab = getTabFromKey(activeTabKey) || {};
    const { title } = activeTab;
    return (
      <DocumentTitle title={title ? intl.get(title).d(title) : '\u200E'}>
        {this.renderLayout()}
      </DocumentTitle>
    );
  }
}

export default connect(
  ({ user = {}, global = {} }) => ({
    currentUser: user.currentUser, // 当前用户
    roleList: user.roleList, // 当前角色
    menu: global.menu, // 菜单
    routerData: global.routerData, // 路由配置
    activeTabKey: global.activeTabKey, // 当前路由
    tabs: global.tabs, // 所有 tab 页
    language: global.language, // 当前语言
    count: global.count, // 当前消息计数
  }),
  null,
  null,
  { pure: false },
)(NormalLayout);
