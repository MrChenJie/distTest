/* eslint-disable func-names */
import React, { PureComponent } from 'react';
import { queryMapIdpValue } from 'services/api';

/**
 * 批量加载独立值集
 *
 * @param {array} codes 独立值集编码
 * @returns
 */
export default function fastCodeLoader(codes = []) {
  return function(target) {
    return generateWrapper(codes, target);
  };
}

function generateWrapper(codes, Target) {
  return class Wrapper extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {};
    }

    componentDidMount() {
      const params = {};
      Object.assign(params, ...codes.map((item) => ({ [item]: item })));
      queryMapIdpValue(params).then((res) => {
        if (res) {
          this.setState({
            idpValueMap: res,
          });
        }
      });
    }

    render() {
      const { idpValueMap = {} } = this.state;
      return <Target idpValueMap={idpValueMap} {...this.props} />;
    }
  };
}
