import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusSelect from '_cus_components/CusSelect';
import { Form, Checkbox } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';
import { Bind } from 'lodash-decorators';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import '../index.less'; 

const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class ContactTable extends PureComponent {
  constructor(props) {
    super(props);
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
    const { handleContactChange, dataSource } = this.props;
    record.isDefault = val.target.checked;
    const arr = dataSource.map(i => {
      if(i.id !== record.id || i.uuid !== record.uuid) {
        return {
          ...i,
          isDefault: 'N'
        }
      } else {
        return i
      }
    });
    handleContactChange(arr);
  }

  render() {
    const { rowSelection, dataSource = [], rowKey, form, readOnly = false, otherDataSource = [] } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.type !== otherDataSource[index]?.type;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{record.typeMeaning}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${uuid()}`, {
                initialValue: record.type
              })(<CusSelect
                style={{ width: '100%' }}
                placeholder={intl.get(`${prompt}.field.placeholder.select.type`).d('请选择类型')}
                lovCode="HKSP.CONTACT_TYPE"
                onChange={e => {
                  record.type = e;
                }}
                disabled={readOnly}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator, setFieldsValue } = form;
          const isDifferent = dataSource[index]?.name !== otherDataSource[index]?.name;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`name${uuid()}`, {
                initialValue: record.name
              })(<CusInput placeholder={intl.get(`${prompt}.field.placeholder.contact.name`).d('请输入联系姓名')}
                           onChange={e => {
                             record.name = e;
                           }}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.phone !== otherDataSource[index]?.phone;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`phone${uuid()}`, {
                initialValue: record.phone
              })(<CusInput onChange={e => { record.phone = e; }}/>)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.email !== otherDataSource[index]?.email;
          if(readOnly) {
            return <span style={{color: isDifferent ? 'red' : '#1f2329'}}>{value}</span>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`email${uuid()}`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ]
              })(<CusInput onChange={e => { record.email = e; }}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        width: 200,
        align: 'left',
        render: (values, record, index) => {
          const { getFieldDecorator } = form;
          const isDifferent = dataSource[index]?.isDefault !== otherDataSource[index]?.isDefault;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${uuid()}`, {
                initialValue: record.isDefault || 'N'
              })(<Checkbox
                disabled={readOnly}
                checked={record.isDefault === 'Y'}
                checkedValue="Y"
                unCheckedValue="N"
                onChange={(e) => this.setDefaultContact(e, record)}
                className={isDifferent ? 'checkbox-group-item' : ''}
              />)}
            </Form.Item>
          )
        }
      },
    ].filter(Boolean);

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
