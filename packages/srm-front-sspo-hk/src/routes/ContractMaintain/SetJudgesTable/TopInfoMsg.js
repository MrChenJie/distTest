/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-09-20 16:19:12
 * Copyright (c) 2023, All Rights Reserved. 
 */

import intl from 'utils/intl';
import React from 'react';
import { getCurrentLanguage } from 'utils/utils';

const bidCommon = 'bid.bidcommon';

export default function TopInfoMsg() {
  return (
    <>
      <div style={{ fontWeight: 'bold' }}>
        {intl.get(`${bidCommon}.view.message.tip`).d('提示：')}
      </div>
      <div>
        {intl.get(`${bidCommon}.view.message.comparison`).d('1')}
      </div>
      <div>
        {intl.get(`${bidCommon}.view.message.request`).d('2')}
      </div>
      <div style={{ display: 'flex' }}>
        <div>
          {intl.get(`${bidCommon}.view.message.negotiation1`).d('3')}
        </div>
        <div style={{ flex: 1 }}>
          {intl.get(`${bidCommon}.view.message.check`).d('3-1')}
          <br/>
          {intl.get(`${bidCommon}.view.message.negotiation2`).d('3-2')}
        </div>
      </div>
    </>
  );
}
