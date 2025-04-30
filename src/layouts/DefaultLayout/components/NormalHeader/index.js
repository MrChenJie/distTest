/**
 * NormalHeader
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Avatar, Icon } from 'hzero-ui';
import classNames from 'classnames';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { VERSION_IS_OP, WEBSOCKET_URL } from 'utils/config';
// ../../utils
import { getClassName } from '../../utils';
// layouts/components
import DefaultNoticeIcon from 'layouts/components/DefaultNoticeIcon';
import DefaultTraceLog from 'layouts/components/DefaultTraceLog';
import DefaultRoleSelect from 'layouts/components/DefaultRoleSelect';
import DefaultLanguageSelect from 'layouts/components/DefaultLanguageSelect';
// ../
import NormalWrapDropdown from '../NormalWrapDropdown';
import NormalTenantSelect from '../NormalTenantSelect';
import NormalDataHierarchies from '../NormalDataHierarchies';

import defaultUserAvatar from '@/assets/logo-usercenter-default.png';

function getDefaultHeaderClassName(...paths) {
  return getClassName('header', ...paths);
}

class NormalHeader extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    getClassName: PropTypes.func,
    logo: PropTypes.string,
    title: PropTypes.string,
    realName: PropTypes.string,
    roleName: PropTypes.string,
    userAvatar: PropTypes.string,
    dataHierarchyFlag: PropTypes.number,
    roleList: PropTypes.array,
    extraRight: PropTypes.array,
    fetchRoleList: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    dispatch: e => e,
    getClassName: getDefaultHeaderClassName,
    logo: undefined,
    title: undefined,
    realName: undefined,
    roleName: undefined,
    userAvatar: undefined,
    roleList: undefined,
    extraRight: undefined,
    dataHierarchyFlag: undefined,
  };

  state = {
    userAvatar: defaultUserAvatar,
    dropdownVisible1: false,
  };

  componentDidMount() {
    // 由于是再个人中心数据加载完成后再加载的数据, 所以需要先设置 头像
    const { userAvatar, fetchRoleList } = this.props;
    if (userAvatar) {
      const img = new Image();
      img.onload = this.updateUserAvatar;
      img.onerror = this.setDefaultUserAvatar;
      img.src = userAvatar;
    }
    fetchRoleList();
  }

  componentDidUpdate(prevProps) {
    const prevUserAvatar = prevProps.userAvatar;
    const nextUserAvatar = this.props.userAvatar;
    if (prevUserAvatar !== nextUserAvatar) {
      // 只有当 用户头像存在 才会设置 用户头像
      if (nextUserAvatar) {
        const img = new Image();
        img.onload = this.updateUserAvatar;
        img.onerror = this.setDefaultUserAvatar;
        img.src = nextUserAvatar;
      }
    }
  }

  @Bind()
  updateUserAvatar() {
    const nextUserAvatar = this.props.userAvatar;
    this.setState({
      userAvatar: nextUserAvatar,
    });
  }

  @Bind()
  setDefaultUserAvatar() {
    this.setState({
      userAvatar: defaultUserAvatar,
    });
  }

  renderIcon(icon) {
    const { getClassName: getHeaderClassName } = this.props;
    if (typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'))) {
      return <img src={icon} alt='' className={getHeaderClassName('logo', 'icon-img')} />;
    }
    if (typeof icon === 'string') {
      return <Icon type={icon} className={getHeaderClassName('logo', 'icon-icon')} />;
    }
    return icon;
  }

  // WrapDropdown1
  // 由于 可能有很多 Dropdown, 所以 以 1, 2, 3... 结尾, 每个方法注明 要处理的东西
  /**
   * Dropdown MenuItem 点击
   * 处理 个人中心 跳转
   * 处理 退出登陆
   * @param {string} key
   */
  @Bind()
  handleItemClick1({ key }) {
    if (key === 'logout') {
      const { logout } = this.props;
      logout();
    }
    if (key !== 'role') {
      // TODO: 查看为什么要在非角色点击关闭 dropdown
      this.setState({ dropdownVisible1: false });
    }
  }

  @Bind()
  handleDropdownVisibleChange1(visible) {
    this.setState({
      dropdownVisible1: visible,
    });
  }

  render() {
    const {
      getClassName: getHeaderClassName,
      logo,
      title,
      realName,
      roleName,
      dataHierarchyFlag,
      collapsed,
      dispatch,
      roleList = [],
      extraRight = [],
    } = this.props;
    const { userAvatar, dropdownVisible1 = false } = this.state;

    let hasWebsocketUrl = false;
    if (
      WEBSOCKET_URL !== ['BUILD_', 'WEBSOCKET_', 'HOST'].join('') &&
      WEBSOCKET_URL !== 'undefined'
    ) {
      hasWebsocketUrl = WEBSOCKET_URL;
    } else {
      hasWebsocketUrl = false;
    }

    return (
      <div className={getHeaderClassName('container')}>
        <div className={getHeaderClassName('left')}>
          <div className={getHeaderClassName('logo')}>
            <Link to='/'>
              {this.renderIcon(logo)}
              {!collapsed && <h1 className={getHeaderClassName('title')}>{title}</h1>}
            </Link>
          </div>
        </div>
        <div className={getHeaderClassName('right')}>
          {React.Children.map(extraRight, ele => {
            return <div className={classNames(getHeaderClassName('right', 'item'))}>{ele}</div>;
          })}
          {extraRight.length !== 0 && (
            <span
              className={classNames(
                getHeaderClassName('right', 'item'),
                getHeaderClassName('right', 'item', 'divider'),
              )}
            />
          )}
          <DefaultLanguageSelect
            className={classNames(
              getHeaderClassName('right', 'item'),
              getHeaderClassName('right', 'item', 'select'),
              getHeaderClassName('right', 'item', 'language'),
            )}
          />
          {!VERSION_IS_OP && (
            <NormalTenantSelect
              className={classNames(
                getHeaderClassName('right', 'item'),
                getHeaderClassName('right', 'item', 'select'),
              )}
            />
          )}
          {!!dataHierarchyFlag && (
            <NormalDataHierarchies
              className={classNames(
                getHeaderClassName('right', 'item'),
                getHeaderClassName('right', 'item', 'data'),
              )}
            />
          )}
          <DefaultTraceLog dispatch={dispatch} />
          {hasWebsocketUrl && (
            <DefaultNoticeIcon
              className={classNames(
                getHeaderClassName('right', 'item'),
                getHeaderClassName('right', 'item', 'notice'),
              )}
            />
          )}
          <NormalWrapDropdown
            onItemClick={this.handleItemClick1}
            menuClassName={getHeaderClassName('right', 'item', 'avatar', 'dropdown')}
            host={
              <span
                className={classNames(
                  getHeaderClassName('right', 'item'),
                  getHeaderClassName('right', 'item', 'avatar'),
                  getHeaderClassName('right', 'item', 'last'),
                )}
              >
                <Avatar
                  className={getHeaderClassName('right', 'item', 'avatar', 'img')}
                  size='small'
                  src={userAvatar}
                  title={realName || roleName || ''}
                />
                <span className={getHeaderClassName('right', 'item', 'avatar', 'name')}>
                  {realName}
                  <Icon
                    type='down'
                    className={getHeaderClassName('right', 'item', 'avatar', 'name', 'realName')}
                  />
                </span>
              </span>
            }
            items={[
              roleList.length !== 0 && [
                {
                  key: 'role',
                  type: 'subItem',
                  ele: <DefaultRoleSelect />,
                },
              ],
              [
                {
                  key: 'user-info',
                  ele: (
                    <a
                      style={{
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-all',
                        whiteSpace: 'nowrap',
                      }}
                      href='#/hiam/user/info'
                      onClick={e => {
                        e.preventDefault();
                        openTab({
                          title: 'hzero.common.title.userInfo',
                          key: '/hiam/user',
                          path: '/hiam/user/info',
                          icon: 'user',
                          closable: true,
                        });
                      }}
                    >
                      {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
                    </a>
                  ),
                },
              ],
              {
                key: 'logout',
                ele: (
                  <div className={getHeaderClassName('right', 'item', 'user', 'logout')}>
                    <span>{intl.get('hzero.common.message.loginOut').d('退出登录')}</span>
                    <Icon className='logout-icon' />
                  </div>
                ),
              },
            ].filter(Boolean)}
            visible={dropdownVisible1}
            onVisibleChange={this.handleDropdownVisibleChange1}
          />
        </div>
      </div>
    );
  }
}

export default NormalHeader;
