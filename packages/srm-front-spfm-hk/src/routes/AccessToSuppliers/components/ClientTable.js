import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';

export default class ClientTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    }
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('联系人'),
        dataIndex: 'contactName',
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'contactPhone',
      },
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('电邮'),
        dataIndex: 'contactEmail',
      },
    ];
    return (
      <CusTable
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    )
  }
}
