/**
 * createRfqModal-创建询价单选择Modal
 * @since 2022-02-15
 * @author xinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form, Col, Row, Input } from 'antd';
import { Divider } from 'hzero-ui';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { getAccessToken, getCurrentLanguage, getCurrentUser } from 'utils/utils';

import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import CustomizedLov from '_cus_components/CustomizedLov';
import SoRequireQuery from './components/SoRequireQuery';
import styles from './index.less';

/**
 * 国际化前缀
 */
const promptCode = 'ssrc.resaleRfq';
const FormItem = Form.Item;
const currentLanguage = getCurrentLanguage();

export default class HeaderForm extends React.Component {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);

    this.state = {
      isPermission: true,
    };
  }
  form = React.createRef();

  /**
  * 转义值集
  * @param {*} list - 值集列表
  * @param {*} value - 值
  */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.meaning;
    }
  }

  @Bind()
  soRequireNo() {
    const { idpValueMap = {} } = this.props;
    const subSoId = this.form?.current?.getFieldValue('subSoId');
    const url = Base64.stringify(
      Utf8.parse(
        `/mks/cmi-to-approval-details?handleId=${subSoId}&isDetail=1&showMenuHead=5&token=${getAccessToken()}`
      )
    );
    const soValue = 'IBOSS_SO_URL';
    const soUrl = (
      (idpValueMap['SPUC.IBOSS_SO_URL'] || []).find((item) => item.value === soValue) || {}
    ).tag;
    return soUrl + url;
  }

  @Bind()
  sprNumber() {
    const { idpValueMap = {} } = this.props;
    const sprNumber = this.form?.current?.getFieldValue('sprNumber');
    const requestid = this.form?.current?.getFieldValue('sprRequestId');
    const user = getCurrentUser();
    const { loginName } = user;
    const url = Base64.stringify(
      Utf8.parse(
        `/mks/cmi-to-approval-details?uuid=${sprNumber}&isDetail=1&showMenuHead=5&token=${getAccessToken()}&loginid=${loginName}&requestid=${requestid}&workflowtype=BOSS_TJSP`
      )
    );
    const soValue = 'IBOSS_SO_URL';
    const soUrl = (
      (idpValueMap['SPUC.IBOSS_SO_URL'] || []).find((item) => item.value === soValue) || {}
    ).tag;
    return soUrl + url;
  }

  render() {
    const formItemLayout = {
      wrapperCol: { span: 24 },
    };
    const {
      resaleRfq: { headerData },
      viewOnly,
      handleRequireCodeChange = (e) => e,
      canEdit,
      idpValueMap = {},
    } = this.props;
    const { isPermission } = this.state;
    const { setFieldsValue = (e) => e, resetFields = (e) => e } = this.form?.current || {};
    return (
      <React.Fragment>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.productType`).d('产品类型')}
                  name="productType"
                  required
                >
                  <CusSelect
                    options={idpValueMap["RS_IBOSS_PRODUCT_TYPE_ISP_RFP"]}
                    onChange={(value) => {
                      resetFields();
                      setFieldsValue({
                        productType: value,
                      });
                      this.setState({});
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Divider style={{ margin: '0 0 24px' }} />
            <Row>
              <Col md={8} sm={24}>
                <FormItem style={{ display: 'none' }} name="sprRequestId">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="productTypeMeaning">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="soRequireCode">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="soEnquiryCode">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="ibossBussinessType">
                  <div />
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  name="soRequireNo"
                >
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="empty">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="subSoId">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="custId">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="custName">
                  <div />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="endCustomer">
                  <div />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.label.soEnquiryCodeSoRequireCode`)
                    .d('销售意向单号/需求单号')}
                  name="subsId"
                >
                  <CustomizedLov
                    code="SPUC.ENTITY_SALESREGION"
                    ModalContent={SoRequireQuery}
                    disabled={(viewOnly ? true : !canEdit) || !isPermission}
                    modalTitle={intl
                      .get(`${promptCode}.model.label.soRequireEnquiryCode`)
                      .d('销售意向单/需求单信息')}
                    lovOptions={{ valueField: 'subsId', displayField: 'requireCode' }}
                    onChange={handleRequireCodeChange}
                    textValue=""
                  />
                  <a
                    key="soRequireNo"
                    className={styles['outer-link']}
                    style={{
                      width: 'calc(100% - 50px)',
                      top: currentLanguage === 'en_US' ? '7px' : '7px',
                      zIndex: 10,
                    }}
                    href={this.soRequireNo()}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!this.form?.current?.getFieldValue('soRequireNo')}
                  >
                    {tooltipRender(this.form?.current?.getFieldValue('soRequireNo'))}
                  </a>
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.contractEntityCode`).d('销售签约主体')}
                  name="contractEntityNoMeaning"
                >
                  <Input disabled />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="contractEntityNo">
                  <div />
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.salesUnit`).d('销售单元')}
                  name="orderOwnerMeaning"
                >
                  <Input disabled />
                </FormItem>
                <FormItem style={{ display: 'none' }} name="orderOwner">
                  <div />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.nonSlaNumber`).d('非标准SLA编号')}
                  name="nonSlaNumber"
                >
                  <Input type="text" disabled />
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hzero.common.button.enquiryPriceTitle').d('标题')}
                  name="enquiryPriceTitle"
                  required
                >
                  <Input type="text" disabled={viewOnly ? true : !canEdit} />
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.creator`).d('录入员')}
                  name="createdName"
                >
                  <Input type="text" disabled />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col md={8} sm={24}>
                <Form.Item style={{ display: 'none' }} name="sprNumber">
                  <Input type="text" disabled />
                </Form.Item>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.sprNumber`).d('SPR编号')}
                  name="sprNumberLink"
                >
                  <Input type="text" disabled />
                  <a
                    className={styles['outer-link']}
                    style={{
                      width: 'calc(100% - 18px)',
                      top: currentLanguage === 'en_US' ? '7px' : '5px',
                      zIndex: 10,
                    }}
                    href={this.sprNumber()}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!this.form?.current?.getFieldValue('sprNumber')}
                  >
                    {this.form?.current?.getFieldValue('sprNumber')}
                  </a>
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.enquiryPriceNum`).d('询价单号')}
                  name="enquiryPriceNum"
                >
                  <Input type="text" disabled />
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.label.enquiryPriceStatus`).d('询价状态')}
                  name="enquiryPriceStatus"
                  initialValue='NEW'
                >
                  <CusSelect
                    options={idpValueMap["RS_RFQ_HEAD_STATUS"]}
                    disabled
                    showArrow={false}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </React.Fragment>
    );
  }
}
