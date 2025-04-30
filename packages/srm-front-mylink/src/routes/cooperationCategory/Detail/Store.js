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

const gridSpan = getDFormGridSpan();
@Form.create({ fieldNameProp: null })
export default class Store extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      idpValueMap,
      rowSelection,
      cooperationCategoryModal,
      readyOnly = false,
      activityCode,
      state,
    } = this.props;

    const { partnerStore = {}, partnerStoreFile = [] } = cooperationCategoryModal;

    const columns = [
      {
        title: intl.get(`spfmhk.mylink.field.portal.brandname`).d('品牌名称'),
        dataIndex: 'brandName',
        required: true,
        render: (_, record) => {
          return tooltipRender(`${record.brandName}`);
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portal.authorizationdate`).d('授权日期'),
        dataIndex: 'authorizationPeriod',
        render: (_, record) => {
          return tooltipRender(
            `${record.authorizationPeriodFrom} - ${record.authorizationPeriodTo}`
          );
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.portal.qualification`).d('品牌授权资质'),
        dataIndex: 'upload',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('brandQualificationUuid', {
                initialValue: record?.brandQualificationUuid,
              })(
                <CusUpload
                  filePreview
                  bucketName="mylink"
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={true}
                  attachmentUUID={record.brandQualificationUuid}
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
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('brandLogoImageUuid', {
                initialValue: record?.brandLogoImageUuid,
              })(
                <CusUpload
                  filePreview
                  bucketName="mylink"
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={true}
                  attachmentUUID={record.brandLogoImageUuid}
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
                      required: readyOnly,
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
                    disabled
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
            rowSelection={readyOnly ? rowSelection : false}
            dataSource={partnerStoreFile}
            pagination={false}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </div>
      </>
    );
  }
}
