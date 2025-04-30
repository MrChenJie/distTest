import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';
import { Bind } from 'lodash-decorators';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import { Form } from 'hzero-ui';
const prompt = 'spfmhk.supplier';
import formatterCollections from 'utils/intl/formatterCollections';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class ClientTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  @Bind()
  getColumns() {
    const { form, readOnly = false, dataSource = [], otherDataSource = [] } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.companyName !== otherDataSource[index]?.companyName;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`companyName${record.id}`, {
                initialValue: record?.companyName
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.companyName = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.contact.person`).d('联系人'),
        dataIndex: 'contactName',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.contactName !== otherDataSource[index]?.contactName;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactName${record.id}`, {
                initialValue: record?.contactName
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.contactName = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'contactPhone',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.contactPhone !== otherDataSource[index]?.contactPhone;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactPhone${record.id}`, {
                initialValue: record?.contactPhone
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.contactPhone = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.email`).d('电邮'),
        dataIndex: 'contactEmail',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.contactEmail !== otherDataSource[index]?.contactEmail;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactEmail${record.id}`, {
                initialValue: record?.contactEmail,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.contactEmail = e}
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }

  render() {
    const { rowSelection, dataSource, rowKey } = this.props;
    const columns = this.getColumns();
    return (
      <EditTable
        rowKey={rowKey}
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    )
  }
}
