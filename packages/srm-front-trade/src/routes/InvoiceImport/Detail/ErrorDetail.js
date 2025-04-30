import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '@/utils/utils';

const commonPrompt = 'spub.invoiceImport';

export default class ErrorDetail extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { invoiceErrorList = [] } = this.props;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.errorDetail.invoiceErrorId`).d('明细标识'),
        dataIndex: 'invoiceErrorId',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.view.errorDetail.inDataSet`).d('数据集'),
        dataIndex: 'inDataSet',
        width: 140,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.errorDetail.priKey`).d('来源标识'),
        dataIndex: 'priKey',
        width: 160,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.errorDetail.errorMessage`).d('处理消息'),
        dataIndex: 'errorMessage',
        width: 180,
        render: (val) => tooltipRender(val),
      },
    ];

    return (
      <Fragment>
        <EditTable
          bordered
          rowKey="invoiceErrorId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={invoiceErrorList}
          pagination={false}
        />
      </Fragment>
    )
  }
}
