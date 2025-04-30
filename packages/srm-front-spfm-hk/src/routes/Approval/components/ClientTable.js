import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@formatterCollections({ code: [prompt] })
export default class ClientTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource, disabled, form, rowKey } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.company.name`).d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${prompt}.field.contact.person`).d('联系人'),
        dataIndex: 'contactName',
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'contactPhone',
      },
      {
        title: intl.get(`${prompt}.field.email`).d('电邮'),
        dataIndex: 'contactEmail',
      },
    ];
    return (
      <Fragment>
        <CusTable
          rowKey={rowKey}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    )
  }
}
