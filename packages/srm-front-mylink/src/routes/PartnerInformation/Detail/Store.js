import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { getDFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId, tableScrollWidth, isTenantRoleLevel } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '_cus_components/CusUpload';
import dayjs from 'dayjs';
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';
import moment from 'moment';

const gridSpan = getDFormGridSpan();
const DATE_FORMAT = 'DD/MM/YYYY';
@Form.create({ fieldNameProp: null })
export default class Store extends React.PureComponent {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    this.state = {};
  }

  // 删除品牌授权资质文件
  removeBrandQualificationFile = (record) => {
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${
        record.brandQualificationUuid
      }/file`,
      {
        method: 'GET',
        query: {
          tenantId: getCurrentOrganizationId(),
          bucketName: 'mylink',
          attachmentUUID: record.brandQualificationUuid,
        },
      }
    ).then((res) => {
      if (res.length == 0) {
        record.lastUpdateTime = null;
        record.$form.setFieldsValue({
          lastUpdateTime: null,
        });
      }
    });
  };

  // 删除品牌LOGO图片文件
  removeBrandLogoImageFile = (record) => {
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${
        record.brandLogoImageUuid
      }/file`,
      {
        method: 'GET',
        query: {
          tenantId: getCurrentOrganizationId(),
          bucketName: 'mylink',
          attachmentUUID: record.brandLogoImageUuid,
        },
      }
    ).then((res) => {
      if (res.length == 0) {
        record.lastUpdateTime = null;
        record.$form.setFieldsValue({
          lastUpdateTime: null,
        });
      }
    });
  };

  render() {
    const {
      form,
      idpValueMap,
      PartnerInformationModal,
      readyOnly = false,
      rowSelection,
    } = this.props;

    const { partnerStore = {}, partnerStoreFile = [] } = PartnerInformationModal;

    const columns = [
      {
        title: intl.get(`spfmhk.mylink.field.portal.brandname`).d('品牌名称'),
        dataIndex: 'brandName',
        required: true,
        render: (_, record) => {
          return !readyOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator('brandName', {
                initialValue: record?.brandName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.portal.brandname`).d('品牌名称'),
                    }),
                  },
                ],
              })(<CusInput />)}
            </Form.Item>
          ) : (
            tooltipRender(`${record.brandName}`)
          );
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portal.authorizationdate`).d('授权日期'),
        dataIndex: 'authorizationPeriod',
        required: true,
        render: (_, record) => {
          return !readyOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator('authorizationPeriod', {
                initialValue:
                  record?.authorizationPeriodFrom && record?.authorizationPeriodTo
                    ? [
                        dayjs(record?.authorizationPeriodFrom, DATE_FORMAT),
                        dayjs(record?.authorizationPeriodTo, DATE_FORMAT),
                      ]
                    : [],
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.portal.authorizationdate`).d('授权日期'),
                    }),
                  },
                ],
              })(<CusDatePicker.RangePicker format={DATE_FORMAT} />)}
            </Form.Item>
          ) : (
            tooltipRender(`${record.authorizationPeriodFrom} - ${record.authorizationPeriodTo}`)
          );
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portal.qualification`).d('品牌授权资质'),
        dataIndex: 'upload',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('brandQualificationUuid', {
                initialValue: record?.brandQualificationUuid,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.portal.qualification`).d('品牌LOGO图片'),
                    }),
                  },
                ],
              })(
                <CusUpload
                  filePreview
                  bucketName="mylink"
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={readyOnly}
                  attachmentUUID={record.brandQualificationUuid}
                  uploadSuccess={() => {
                    record.lastUpdateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    record.$form.setFieldsValue({
                      lastUpdateTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    });
                  }}
                  removeCallback={() => this.removeBrandQualificationFile(record)}
                  isEncrypt
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portal.logo`).d('品牌LOGO图片'),
        dataIndex: 'upload2',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('brandLogoImageUuid', {
                initialValue: record?.brandLogoImageUuid,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.portal.logo`).d('品牌LOGO图片'),
                    }),
                  },
                ],
              })(
                <CusUpload
                  filePreview
                  bucketName="mylink"
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={readyOnly}
                  attachmentUUID={record.brandLogoImageUuid}
                  uploadSuccess={() => {
                    record.lastUpdateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    record.$form.setFieldsValue({
                      lastUpdateTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    });
                  }}
                  removeCallback={() => this.removeBrandLogoImageFile(record)}
                  isEncrypt
                />
              )}
            </Form.Item>
          );
        },
      },
    ];

    return (
      <>
        <Form className="customize-form">
          <Row>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.portal.shoptype`).d('店铺类型')}>
                {this.props.form.getFieldDecorator('storeType', {
                  initialValue: partnerStore?.storeType,
                  rules: [
                    {
                      required: !readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.portal.shoptype`).d('店铺类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER.STORE_TYPE']}
                    disabled={readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ marginTop: '16px' }}>
          <EditTable
            rowKey="rowKey"
            columns={columns}
            rowSelection={!readyOnly ? rowSelection : false}
            dataSource={partnerStoreFile}
            pagination={false}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </div>
      </>
    );
  }
}
