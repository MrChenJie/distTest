import React from 'react';
import intl from 'utils/intl';
import { Input } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import queryString from 'querystring';

const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class CustomerTable extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getInfo();
  }

  // 获取列表
  getInfo() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));
    dispatch({
      type: 'partnerReview/getCustomersInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
  }

  render() {
    const {
      rowSelection,
      customerList = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.companyname`).d('公司名称'),
        dataIndex: 'customerContact',
        align: 'left',
   
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcustomercontact`).d('联络人'),
        dataIndex: 'customerName',
        align: 'left',
        
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcustomercontacttel`).d('联系电话'),
        dataIndex: 'customerPhone',
        align: 'left',
   
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={customerList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
