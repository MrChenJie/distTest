import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spfmhk.dict';
@formatterCollections({ code: [prompt] })
@Form.create()
export default class Experience extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      readOnly = false,
      tenantId,
      dataSource,
    } = this.props;
    const columns = [
      {
        title: intl.get('spfmhk.dict.view.field.portalcooperatecompany').d('合作公司'),
        dataIndex: 'cooperativeCompany',
        width: 300,
        render: (value, record, index) => {
          return (
            readOnly ? tooltipRender(record.cooperativeCompany) :
              <Form.Item>
                {record.$form.getFieldDecorator('cooperativeCompany', {
                  initialValue: record?.cooperativeCompany,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfmhk.dict.view.field.portalcooperatecompany').d('合作公司'),
                      }),
                    },
                  ],
                })(
                  <CusInput
                    disabled={readOnly}
                    onChange={(value) => {
                      record.cooperativeCompany = value;
                    }}
                  />,
                )}
              </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.portalprojectintro`).d('项目介绍'),
        dataIndex: 'projectDesc',
        width: 300,
        render: (value, record) => {
          return readOnly ? (
            tooltipRender(record.projectDesc)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('projectDesc', {
                initialValue: record?.projectDesc,
              })(
                <CusInput
                  onChange={(value) => {
                    record.projectDesc = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.portalprojectamo`).d('项目金额'),
        dataIndex: 'projectAmount',
        width: 300,
        render: (value, record) => {
          return readOnly ? (
            tooltipRender(record.projectAmount)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('projectAmount', {
                initialValue: record?.projectAmount,
              })(
                <CusInputNumber
                  allowThousandth
                  min={0}
                  precision={2}
                  onChange={(value) => {
                    record.projectAmount = value;
                  }}

                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.portalcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 300,
        render: (value, record) => {
          return readOnly ? (
            tooltipRender(record.currency)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('currency', {
                initialValue: record?.currency,
              })(
                <CusLov
                  onChange={(value) => {
                    record.currency = value;
                  }}
                  code="HPFM.CURRENCY"
                  disabled={readOnly}
                  lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                  textField="currency"
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.portalcertificationdoc`).d('证明文件'),
        width: 300,
        dataIndex: 'projectFileUuid',
        render: (value, record, index) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('projectFileUuid', {
                initialValue: record.projectFileUuid,
              })(<CusUpload
                filePreview
                bucketName="dict"
                tenantId={tenantId}
                attachmentUUID={value}
                viewOnly={readOnly}//当申请状态不可修改时,只能查看
                isEncrypt
              />)}
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
