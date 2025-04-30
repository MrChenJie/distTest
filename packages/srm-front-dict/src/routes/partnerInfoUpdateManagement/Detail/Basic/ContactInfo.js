import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Form, Checkbox } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class ContactInfo extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      readOnly = false,
      idpValueMap,
      dataSource,
      setDefaultContact,
      isSupplier,
    } = this.props;
    const columns = [
      {
        title: intl.get('spfmhk.dict.view.field.portalcontacttype').d('联系人类型'),
        dataIndex: 'contactType',
        width: 160,
        render: (value, record, index) => {
          const contactTypeOptions = idpValueMap['HKSP.CONTACT_TYPE'] || [];
          return (
            (readOnly || isSupplier) ? tooltipRender(record.contactType) :
              <Form.Item>
                {record.$form.getFieldDecorator('contactType', {
                  initialValue: record?.contactType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfmhk.dict.view.field.portalcontacttype').d('联系人类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={contactTypeOptions}
                    allowClear
                    disabled={readOnly}
                    onChange={(value) => {
                      record.contactType = value;
                    }}
                  />,
                )}
              </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.contactdescription').d('姓名'),
        dataIndex: 'contactName',
        width: 160,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.contactName)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('contactName', {
                initialValue: record?.contactName,
              })(
                <CusInput
                  onChange={(value) => {
                    record.contactName = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.telno').d('电话'),
        dataIndex: 'contactPhone',
        width: 160,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.contactPhone)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('contactPhone', {
                initialValue: record?.contactPhone,
              })(
                <CusInput
                  onChange={(value) => {
                    record.contactPhone = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalemail').d('电邮'),
        dataIndex: 'contactEmail',
        width: 160,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.contactEmail)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('contactEmail', {
                initialValue: record?.contactEmail,
              })(
                <CusInput
                  onChange={(value) => {
                    record.contactEmail = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portaldefaultcontact').d('默认联系人'),
        dataIndex: 'defaultContact',
        width: 80,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.defaultContact)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('defaultContact', {
                initialValue: record?.defaultContact || 'N',
              })(
                <Checkbox
                  checkedValue="Y"
                  unCheckedValue="N"
                  checked={record.defaultContact === 'Y'}
                  onChange={(e) => {
                    setDefaultContact(e, record);
                  }}
                />,
              )}
            </Form.Item>
          );
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="rowKey"
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
