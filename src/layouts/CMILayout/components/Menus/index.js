/**
 * Menu
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-05-24
 * @copyright 2019-05-24 © HAND
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { uniq } from 'lodash';
import { Menu } from 'hzero-ui';
import { connect } from 'dva';

import Icons from 'components/Icons';

import intl from 'utils/intl';

import { openMenu } from 'layouts/components/DefaultMenu/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { cleanMenuTabs, getActiveTabKey } from 'utils/menuTab';
// import { cleanCache } from 'components/CacheComponent';
import { cleanCache } from '../../../../utils/cleanCache';
import { isLeafMenu } from './utils';

class Menus extends Component {
  constructor(props) {
    super(props);
    const { activeMenus = [] } = props;
    const selectedKeys = [];
    const openMenuKeys = [];
    for (let i = 0; i < activeMenus.length - 1; i++) {
      selectedKeys.push(`${activeMenus[i].id}`);
      openMenuKeys.push(`${activeMenus[i].id}`);
    }
    openMenuKeys.pop();
    this.state = {
      hideMenuList: [],
      selectedKeys,
      openMenuKeys,
      props: this.props,
    };
    queryIdpValue('HPFM.HIDE_MENU_CODE').then((res) => {
      if (res) {
        this.setState({
          hideMenuList:
            res.map((item) => {
              return item.value;
            }) || [],
        });
      }
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevActiveMenus, openMenuKeys = [] } = prevState;
    const { mainMenu, activeMenus = [], collapsed } = nextProps;
    const curActiveMainMenu = activeMenus[activeMenus.length - 1];
    const map = prevState.map || new Map();
    const pathMap = prevState.pathMap || new Map();
    if ((prevState.props.menus || []).length !== (nextProps.menus || []).length) {
      // 当第一次接收到menus数据的时候会进入这个分支
      // 生成的map结构id -> menuItem(Object)，根目录的parentId是0
      const generateMap = (list) => {
        list.forEach((item) => {
          if (item.children && item.children.length > 0) {
            generateMap(item.children);
          }
          map.set(item.id, item);
          pathMap.set(item.path, item);
        });
      };
      generateMap(nextProps.menus);
    }
    if (
      mainMenu === curActiveMainMenu || // 切换的Tab 属于当前菜单
      prevActiveMenus !== activeMenus // 需要保证 不会每次都变化
    ) {
      const selectedKeys = [];
      const openKeys = [];
      for (let i = 0; i < activeMenus.length - 1; i++) {
        selectedKeys.push(`${activeMenus[i].id}`);
        openKeys.push(`${activeMenus[i].id}`);
      }
      openKeys.pop();
      return {
        map,
        pathMap,
        props: nextProps,
        selectedKeys,
        openMenuKeys: collapsed ? [] : uniq([...openMenuKeys, ...openKeys]),
      };
    }
    return null;
  }

  @Bind()
  handleMenuItemClick({ item }) {
    const { 'data-hzero-menu': menu } = item.props;
    // 清除一个tab下的所有页面的缓存
    const closeTabKey = getActiveTabKey();
    cleanCache(closeTabKey);
    // 清空Tabs
    cleanMenuTabs();
    // 打开菜单
    openMenu(menu);
    const { onCollapse } = this.props;
    if (onCollapse) {
      onCollapse();
    }
  }

  @Bind()
  handleMenuOpenChange(openMenuKeys = []) {
    const { onCollapse } = this.props;
    if (onCollapse) {
      onCollapse();
    }
    this.setState({
      openMenuKeys,
    });
  }

  renderTOPMenu(activePath) {
    const { menus } = this.props;
    return menus.map((m) => this.renderMenu(m, true, activePath));
  }

  renderMenu(menu, renderIcon = false, activePath) {
    if (isLeafMenu(menu)) {
      return this.renderMenuItem(menu, renderIcon, activePath);
    } else {
      return this.renderSubMenu(menu, renderIcon, activePath);
    }
  }

  renderMenuItem(menu, renderIcon = false, activePath) {
    let isActiveTab = false;
    if (activePath && activePath.length > 0 && activePath.indexOf(menu.id) >= 0) {
      isActiveTab = true;
    }
    return (
      <Menu.Item
        key={menu.id}
        data-hzero-menu={menu}
        className={isActiveTab && 'hzero-normal-tab-active'}
      >
        <div style={{ display: 'contents' }} title={menu.name && intl.get(menu.name).d(menu.name)}>
          {renderIcon && <Icons type={menu.icon} style={{ paddingRight: 8 }} />}
          {menu.name && intl.get(menu.name).d(menu.name)}
        </div>
      </Menu.Item>
    );
  }

  renderSubMenu(menu, renderIcon = false, activePath) {
    const { hideMenuList } = this.state;
    const { children = [] } = menu;
    let isActiveTab = false;
    if (activePath && activePath.length > 0 && activePath.indexOf(menu.id) >= 0) {
      isActiveTab = true;
    }
    return (
      <Menu.SubMenu
        className={isActiveTab && 'hzero-normal-tab-active'}
        key={menu.id}
        title={
          <div style={{ display: 'contents' }} title={menu.name && intl.get(menu.name).d(menu.name)}>
            <React.Fragment>
              {renderIcon && <Icons type={menu.icon} style={{ paddingRight: 8 }} />}
              {menu.name && intl.get(menu.name).d(menu.name)}
            </React.Fragment>
          </div>
        }
      >
        {children
          .filter((item) => !hideMenuList.includes(item.name))
          .map((childMenu) => this.renderMenu(childMenu, false, activePath))}
      </Menu.SubMenu>
    );
  }

  render() {
    const { menus, activeTabKey } = this.props;
    const { selectedKeys = [], openMenuKeys = [], map, pathMap } = this.state;
    // theme 变为 dark
    // arrow 样式 要是 白色的
    const activePath = [];
    let current = pathMap.get(activeTabKey);
    if (current) {
      while (current.parentId !== 0) {
        activePath.push(current.id);
        current = map.get(current.parentId);
      }
      activePath.push(current.id);
    }

    if (menus) {
      return (
        <Menu
          mode='inline'
          theme='dark'
          openKeys={openMenuKeys}
          selectedKeys={selectedKeys}
          onOpenChange={this.handleMenuOpenChange}
          onClick={this.handleMenuItemClick}
        >
          {this.renderTOPMenu(activePath)}
        </Menu>
      );
    } else {
      return null;
    }
  }
}

export default connect(({ global = {} }) => ({
  language: global.language,
  menus: global.menu,
  activeTabKey: global.activeTabKey,
  tabs: global.tabs,
  // isChange: global.isChange,
}))(Menus);
