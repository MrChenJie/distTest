import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Checkbox } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';

@formatterCollections({ code: [prompt] })
export default class ContactTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource, disabled, form, rowKey } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.supplier.num`).d('联系人类型'),
        dataIndex: 'typeMeaning',
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
      },
      {
        title: intl.get(`${prompt}.field.email`).d('电邮'),
        dataIndex: 'email',
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        align: 'left',
        render: (values, record) => {
          const { getFieldDecorator } = form;
          return (
            <Checkbox
              checked={record.isDefault === 'Y'}
              disabled={disabled}
              checkedValue="Y"
              unCheckedValue="N"
            />
          )
        }
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
