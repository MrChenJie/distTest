/*
 * @Author: 陆海涛 haitao.lu02@hand-china.com
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col, Input, Form, Checkbox } from 'antd';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusUpload from '_cus_components/CusUpload';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';

const gridSpan = getLFormGridSpan();
const { realName, loginName } = getCurrentUser();

export default class BasicForm extends React.PureComponent {
  form = React.createRef();

  constructor(props) {
    super(props);
    props?.onRef(this);
    if (this.props.formRecordId) {
      // this.queryDetail(this.props.formRecordId);
      // this.queryListDetail(_, this.state.formRecordId);
    }
  }

  queryDetail = (formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'RegistrationInformationModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      console.log(res);
      if (res) {
        this.setState({
          headerInfo: res,
        });
      }
    });
  };

  render() {
    const { headerInfo, idpValueMap } = this.props;
    console.log(
      'headerInfo',
      idpValueMap['REGISTRATION_ADDRESS']?.find((item) => item.value == headerInfo?.signAddress)
    );
    const productMeaning = idpValueMap['HKSM.PRODCUT_SERVICE']?.find(
      (item) => item.value == headerInfo.product
    )?.meaning;
    const signAddressMeaning = idpValueMap['REGISTRATION_ADDRESS']?.find(
      (item) => item.value == headerInfo?.signAddress
    )?.meaning;
    console.log('headerInfo', productMeaning, signAddressMeaning);
    return (
      <div className="customize-form">
        <Form>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.companyName`).d('公司名称')}
              name="companyName"
              initialValue={headerInfo.companyName}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务')}
              name="product"
              initialValue={productMeaning}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式')}
              name="partnerModeMeaning"
              initialValue={headerInfo.partnerModeMeaning}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.contactper`).d('联系人')}
              name="contact"
              initialValue={headerInfo.contact}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.email`).d('电邮')}
              name="email"
              initialValue={headerInfo.email}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.contacphone`).d('联系人电话')}
              name="phone"
              initialValue={headerInfo.phone}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.webapp`).d('网站/APP')}
              name="webSiteApp"
              initialValue={headerInfo.webSiteApp}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.registerdate`).d('报名日期')}
              name="registrationDate"
              initialValue={dateRender(headerInfo?.creationDate)}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.Registadd`).d('公司注册地')}
              name="signAddress"
              initialValue={signAddressMeaning}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          {headerInfo?.ecommerceServiceOrNot === 'Y' && (
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.detail.companyaddress`).d('公司地址')}
                name="companyAddress"
                initialValue={headerInfo?.companyAddress}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          )}
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.company.br`).d('商业登记证')}
              name="registrationNumber"
              initialValue={headerInfo?.registrationNumber}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          {headerInfo?.ecommerceServiceOrNot === 'Y' && (
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.detail.businesscategory`).d('经营品类')}
                name="businessCategoriesMeaning"
                initialValue={headerInfo?.businessCategoriesMeaning}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          )}
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码')}
              name="supplierNumber"
              initialValue={headerInfo?.supplierNumber}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.balcklist`).d('是否黑名单')}
              name="blackStatus"
              initialValue={
                headerInfo?.blackStatus == 'Y'
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.portalAccount`).d('存在门户账号')}
              name="portalAccount"
              initialValue={
                headerInfo?.portalAccount == 'Y'
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.view.title.attach.info`).d('附件信息')}
              name="fileUuid"
              initialValue={headerInfo?.fileUuid}
            >
              <CusUpload
                filePreview
                bucketName="mylink"
                tenantId={getCurrentOrganizationId()}
                fileType="PDF"
                viewOnly={true}
                attachmentUUID={headerInfo?.fileUuid}
                multiple={false}
                isEncrypt
              />
            </Form.Item>
          </Col>
        </Form>
      </div>
    );
  }
}
