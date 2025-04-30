/**
 * @Description: 付款明细
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';

import BillList from './BillList';
import BillDetail from './BillDetail';

class PayDetail extends Component {
  render() {
    const { billListProps = {}, billDetailProps = {}, ...other } = this.props;
    return (
      <div>
        <BillList {...billListProps} {...other} />
        <div style={{ marginTop: '24px' }}>
          <BillDetail {...billDetailProps} {...other} />
        </div>
      </div>
    );
  }
}

export default PayDetail;
