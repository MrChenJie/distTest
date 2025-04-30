import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Form, Checkbox } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusButton from 'srm-front-common/lib/components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';
import { Bind } from 'lodash-decorators';
const prompt = 'spfmhk.supplier';
export default class ClientTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    }
  }

  componentDidMount() {
  }

  /**
  * 设置唯一默认联系人
  * @param val
  * @param record
  */
  @Bind()
  setDefaultClient(val, record) {
    const { dispatch, clientList } = this.props;
    record.isDefault = val.target.checked;
    const arr = clientList.map(i => {
      if (i.clientId !== record.clientId) {
        return {
          ...i,
          isDefault: '0'
        }
      } else {
        return i
      }
    });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        clientList: arr,
      },
    });
  }

  render() {
    const { rowSelection, onChange, form, clientList = [], registerState, loading = false, disabled = true, readOnly = false } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    // console.log('clientList', clientList);
    // const disabled = registerState === 'manager' ? true : false; 现在默认都不能编辑；
    // const disabled = true;
    const columns = [
      {
        title: intl.get(`${prompt}.field.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 280,
        render: (_, record) => {
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`companyName${record.clientId}`, {
                initialValue: record.companyName
              })(<CusInput
                onChange={e => record.companyName = e}
                disabled={disabled && !readOnly}
              />)}
            </Form.Item>
          ) : (_)
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'contactName',
        width: 280,
        render: (_, record) => {
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`contactName${record.clientId}`, {
                initialValue: record.contactName
              })(<CusInput
                onChange={e => record.contactName = e}
                disabled={disabled && !readOnly}
              />)}
            </Form.Item>
          ) : (_)
        }
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'contactPhone',
        width: 280,
        render: (_, record) => {
          const { getFieldDecorator } = this.props.form;
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`contactPhone${record.clientId}`, {
                initialValue: record.contactPhone
              })(<CusInput disabled={disabled && !readOnly} onChange={e => record.contactPhone = e} />)}
            </Form.Item>
          ) : (_)
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'contactEmail',
        render: (_, record) => {
          const { getFieldDecorator } = this.props.form;
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`contactEmail${record.clientId}`, {
                initialValue: record.contactEmail
              })(<CusInput disabled={disabled && !readOnly} onChange={e => record.contactEmail = e} />)}
            </Form.Item>
          ) : (_)
        }
      },
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="clientId"
          pagination={false}
          columns={columns}
          loading={loading}
          dataSource={clientList.filter(i => i.isDel !== '1')}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </Fragment>
    )
  }
}
