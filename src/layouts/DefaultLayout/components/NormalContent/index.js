/**
 * NormalContent
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { IM_ENABLE } from 'utils/config';

import DefaultMenuTabs from 'layouts/components/DefaultMenuTabs';
import IM from 'layouts/components/IM';

import { getClassName } from '../../utils';

function getDefaultContentClassName(...paths) {
  return getClassName('content', ...paths);
}

export default class NormalContent extends Component {
  static propTypes = {
    getClassName: PropTypes.func,
  };

  static defaultProps = {
    getClassName: getDefaultContentClassName,
  };

  render() {
    let imEnable = false;
    try {
      imEnable = JSON.parse(IM_ENABLE);
    } catch (e) {
      imEnable = false;
    }
    const { getClassName: getContentClassName } = this.props;
    return (
      <div className={getContentClassName('container')}>
        <DefaultMenuTabs />
        {imEnable && <IM />}
      </div>
    );
  }
}
