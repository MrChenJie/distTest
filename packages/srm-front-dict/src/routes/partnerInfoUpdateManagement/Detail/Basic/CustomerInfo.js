import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Form } from 'hzero-ui';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusCascader from '_cus_components/CusCascader';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { tooltipRender } from '_cus_utils/render';
import dayjs from 'dayjs';
import uuid from 'uuid/v4';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class CustomerInfo extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, readOnly = false, idpValueMap, dataSource, isSupplier } = this.props;
    const columns = [
      {
        title: intl.get('spfmhk.dict.view.field.companyname').d('公司名称'),
        dataIndex: 'customerContact',
        width: 300,
        render: (value, record, index) => {
          return (
            (readOnly || isSupplier) ? tooltipRender(record.customerContact) :
              <Form.Item>
                {record.$form.getFieldDecorator('customerContact', {
                  initialValue: record?.customerContact,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfmhk.dict.view.field.companyname').d('公司名称'),
                      }),
                    },
                  ],
                })(
                  <CusInput
                    onChange={(value) => {
                      record.customerContact = value;
                    }}
                    disabled={readOnly}
                  />,
                )}
              </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalcustomercontact').d('联络人'),
        dataIndex: 'customerName',
        width: 300,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.customerName)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('customerName', {
                initialValue: record?.customerName,
              })(
                <CusInput
                  onChange={(value) => {
                    record.customerName = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalcustomercontacttel').d('联系电话'),
        dataIndex: 'customerPhone',
        width: 300,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.customerPhone)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('customerPhone', {
                initialValue: record?.customerPhone,
              })(
                <CusInput
                  onChange={(value) => {
                    record.customerPhone = value;
                  }}
                  disabled={readOnly}
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
