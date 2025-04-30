/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input, Form, Checkbox } from 'antd';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import { getLFormGridSpan } from '_cus_utils/utils';
import {
  getCurrentUser,
} from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';

export default class ShopForm extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      PartnerInformationModal,
      rowSelection,
      partnerList
    } = this.props;
    
    const columns = [{
      title: intl.get(`spfmhk.mylink.field.partner.name`).d('合作伙伴名称'),
      dataIndex: 'companyName',
      width: 160,
      render: tooltipRender
    },
    {
      title: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式'),
      dataIndex: 'partnerMode',
      width: 120,
      render: tooltipRender
    },
    {
      title: intl.get(`spfmhk.mylink.field.mailbox`).d('邮箱'),
      dataIndex: 'email',
      width: 120,
    },
    {
      title: intl.get(`spfmhk.mylink.field.company.phone`).d('电话'),
      dataIndex: 'phoneNumber',
      width: 120,
    },
    {
      title: intl.get(`spfmhk.mylink.field.registerdate`).d('报名日期'),
      dataIndex: 'signDate',
      width: 120,
    },
  ]

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={partnerList}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
