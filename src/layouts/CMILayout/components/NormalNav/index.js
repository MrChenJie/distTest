/**
 * NormalNav
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DefaultMenu from 'layouts/components/DefaultMenu';
import { Icon } from 'hzero-ui';
import NormalHeaderSearch from '../NormalHeaderSearch';

import { getClassName } from '../../utils';

function getDefaultNavClassName(...paths) {
  return getClassName('nav', ...paths);
}

export default class NormalNav extends Component {
  static propTypes = {
    collapsed: PropTypes.bool.isRequired,
    getClassName: PropTypes.func,
  };

  static defaultProps = {
    getClassName: getDefaultNavClassName,
  };

  render() {
    const {
      collapsed,
      getClassName: getNavClassName,
      components = {},
      onSearchMouseEnter,
      onCollapse,
      handleToggleCollapse,
    } = this.props;

    const Menu = components.Menu || DefaultMenu;
    const HeaderSearch = components.HeaderSearch || NormalHeaderSearch;

    return (
      <div className={getNavClassName('container')}>
        <div style={{ textAlign: 'left' }}>
          <Icon
            style={{
              display: 'inline-block',
              fontSize: '20px',
              marginTop: '20px',
              marginLeft: '24px',
              cursor: 'pointer',
            }}
            type={collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={handleToggleCollapse}
          />
        </div>
        <div className={getNavClassName('normal', 'search')} onMouseEnter={onSearchMouseEnter}>
          <HeaderSearch collapsed={collapsed} />
        </div>
        <div className={getNavClassName('menu')}>
          <Menu collapsed={collapsed} offsetTop={80} onCollapse={onCollapse} />
        </div>
      </div>
    );
  }
}
