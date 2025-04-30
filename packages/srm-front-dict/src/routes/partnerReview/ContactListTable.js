import React from 'react';
import intl from 'utils/intl';
import { Input, Checkbox } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';

import queryString from 'querystring';
import { EMAIL } from 'utils/regExp';

const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class ContactTable extends React.Component {
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
      type: 'partnerReview/getContactInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
  }

  render() {
    const {
      rowSelection,
      contactList = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      idpValueMap,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.portalcontacttype`).d('联系人类型'),
        dataIndex: 'contactTypeMeaning',
        align: 'left',
        width: 280,
  
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcontactname`).d('联系人姓名'),
        dataIndex: 'contactName',
        align: 'left',
        width: 280,
      
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcontacttelno`).d('联系人电话号码'),
        dataIndex: 'contactPhone',
        align: 'left',
        width: 280,
       
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcontactemail`).d('联系人电邮'),
        dataIndex: 'contactEmail',
        align: 'left',
        width: 280,
       
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portaldefaultcontact`).d('默认联系人'),
        dataIndex: 'defaultContact',
        align: 'left',
        width: 120,
        render: (val, record) => (
          <Form.Item>
            {getFieldDecorator(`${record.rowKey}defaultContact`, {
              initialValue: record.defaultContact,
            })(
              <Checkbox
                disabled
                checkedValue="Y"
                unCheckedValue="N"
                checked={record.defaultContact === 'Y'}
              />
            )}
          </Form.Item>
        ),
      },
    ];
    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={contactList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
