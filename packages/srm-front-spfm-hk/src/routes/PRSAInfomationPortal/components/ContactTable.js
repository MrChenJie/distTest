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
export default class ContactTable extends PureComponent {
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
  setDefaultContact(val, record) {
    const { dispatch, contactList } = this.props;
    record.isDefault = val.target.checked;
    const newDataSource = contactList.filter((i) => i.isDel !== '1').map((item) => {
        if (item.contactId === record.contactId) {
          item.isDefault = 'Y'
        } else {
          item.isDefault = 'N'
        } 
        return item
      });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        contactList: newDataSource,
      },
    });
  }

  render() {
    const { rowSelection, onChange, form, contactList = [], registerState, loading = false, disabled = true, readOnly = false } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;

    // const disabled = registerState === 'manager' ? true : false; 现在默认都不能编辑；
    // const disabled = true;
    const columns = [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 280,
        render: (val, record) => {
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`type${record.contactId}`, {
                initialValue: record.type
              })(<CusSelect
                style={{ width: '100%' }}
                onChange={e => record.type = e}
                placeholder={intl.get(`${prompt}.field.placeholder.select.type`).d('请选择类型')}
                lovCode="HKSP.CONTACT_TYPE"
                disabled={(disabled && !readOnly)}
              />)}
            </Form.Item>
          ) : (record.typeMeaning)
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 280,
        render: (val, record) => {
          const { getFieldDecorator } = this.props.form;
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`name${record.contactId}`, {
                initialValue: record.name
              })(<CusInput
                onChange={e => record.name = e}
                disabled={disabled && !readOnly}
              />)}
            </Form.Item>
          ) : (val)
        }
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 280,
        render: (val, record) => {
          const { getFieldDecorator } = this.props.form;
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`phone${record.contactId}`, {
                initialValue: record.phone
              })(<CusInput disabled={disabled && !readOnly} onChange={e => record.phone = e} />)}
            </Form.Item>
          ) : (val)
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        render: (val, record) => {
          const { getFieldDecorator } = this.props.form;
          return (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`email${record.contactId}`, {
                initialValue: record.email
              })(<CusInput disabled={disabled && !readOnly} onChange={e => record.email = e} />)}
            </Form.Item>
          ) : (val)
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        render: (val, record) => {
          const { getFieldDecorator } = this.props.form;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${record.contactId}`, {
                initialValue: record.isDefault,
              })(<Checkbox
                checked={record.isDefault === 'Y'}
                checkedValue="Y"
                unCheckedValue="N"
                disabled={disabled && !readOnly}
                onChange={(e) => this.setDefaultContact(e, record)}
              />)}
            </Form.Item>
          )
        }
      },
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="contactId"
          pagination={false}
          columns={columns}
          loading={loading}
          dataSource={contactList.filter(i => i.isDel !== '1')}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </Fragment>
    )
  }
}
