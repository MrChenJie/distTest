import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class FilterSearchPr extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
      supplierName: '',
    };
  }

  prForm = React.createRef();


  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.prForm.current?.resetFields();
    onSearch();
  }

  /**
   * 展开高级查询
   * @function handleShowMore
   */
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const { isShowMore } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      form,
      ictPrDetailHeadsList,
      dispatch,
      contact,
      contactTel,
      purchaseInquirySheetModel
    } = this.props;
    const { prApplyStatus } = purchaseInquirySheetModel
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
    return (
      <div className="customize-form">
        <Form ref={this.prForm}>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('采购类别')}
              {...formLayout}
            >
              {getFieldDecorator('prType', {
                initialValue: ictPrDetailHeadsList?.prType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.label`).d('采购类别'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  allowClear
                  options={[
                    {
                      value: 'INVS_ICTS',
                      meaning: 'INVS_ICTS',
                    },
                  ]}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.purchaseagent`).d('采购员')}
              {...formLayout}
            >
              {getFieldDecorator('prer', {
                initialValue: ictPrDetailHeadsList?.prerName,
              })(
                <CusLov
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  textValue={ictPrDetailHeadsList?.prerName}
                  code="HKPC.PROCUREMENTAGENT"
                  lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
                  onChange={(_, lovData) => {
                    dispatch({
                      type: 'purchaseInquirySheetModel/commentUpdateState',
                      payload: {
                        prer: lovData.loginName,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.suppliernumber`).d('供应商编号')}
              {...formLayout}
            >
              {getFieldDecorator('supNo', {
                initialValue: ictPrDetailHeadsList?.supNo,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.suppliernumber`).d('供应商编号'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  textValue={ictPrDetailHeadsList?.supNo}
                  code="HKSP.SUPPLIER"
                  form={this.prForm.current}
                  lovOptions={{ displayField: 'supplierNumber', valueField: 'supplierNumber' }}
                  onChange={(val, record) => {
                    form.setFieldsValue({ supplierName: record.companyNameCh });
                    form.setFieldsValue({ supContact: record.name });
                    form.setFieldsValue({ supPhone: record.phone });
                    form.setFieldsValue({ supFax: record.fax });
                    form.setFieldsValue({ supEmail: record.email });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.suppliername`).d('供应商名称')}
              {...formLayout}
            >
              {getFieldDecorator('supplierName', {
                initialValue: ictPrDetailHeadsList?.supplierName,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.contact`).d('联系人')}
              {...formLayout}
            >
              {getFieldDecorator('supContact', {
                initialValue: ictPrDetailHeadsList?.supContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.contact`).d('联系人'),
                    }),
                  },
                ],
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.contactinfo`).d('联系方式')}
              {...formLayout}
            >
              {getFieldDecorator('supPhone', {
                initialValue: ictPrDetailHeadsList?.supPhone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.contactinfo`).d('联系方式'),
                    }),
                  },
                ],
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.title.fax`).d('传真号')} {...formLayout}>
              {getFieldDecorator('supFax', {
                initialValue: ictPrDetailHeadsList?.supFax,
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.email`).d('联系邮箱')}
              {...formLayout}
            >
              {getFieldDecorator('supEmail', {
                initialValue: ictPrDetailHeadsList?.supEmail,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.email`).d('联系邮箱'),
                    }),
                  },
                ],
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.deliverycontact`).d('送货联系人')}
              {...formLayout}
            >
              {getFieldDecorator('supDeliveryContact', {
                initialValue: ictPrDetailHeadsList?.supDeliveryContact
                  ? ictPrDetailHeadsList?.supDeliveryContact
                  : contact,
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址')}
              {...formLayout}
            >
              {getFieldDecorator('supDeliveryAddress', {
                initialValue: ictPrDetailHeadsList?.supDeliveryAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  textValue={ictPrDetailHeadsList?.supDeliveryAddress}
                  code="CMHK.ERP.ADDRESS"
                  lovOptions={{ valueField: 'addressName', displayField: 'addressName' }}
                  onChange={(_, lovData) => {
                    form.setFieldsValue({ supDeliveryContact: lovData.name });
                    form.setFieldsValue({ supDeliveryPhone: lovData.contactTel });
                    dispatch({
                      type: 'purchaseInquirySheetModel/commentUpdateState',
                      patload: {
                        contact: lovData.name,
                        contactTel: lovData.contactTel,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.deliverycontactnumber`).d('送货联系电话')}
              {...formLayout}
            >
              {getFieldDecorator('supDeliveryPhone', {
                initialValue: ictPrDetailHeadsList?.supDeliveryPhone
                  ? ictPrDetailHeadsList?.supDeliveryPhone
                  : contactTel,
              })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.deliveryremarks`).d('送货备注')}
              {...formLayout}
            >
              {getFieldDecorator('supDeliveryRemark', {
                initialValue: ictPrDetailHeadsList?.supDeliveryRemark,
              })(
                <CusInput.TextArea
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  style={{ height: 'auto' }}
                  rows={3}
                  autosize={{ minRows: 3, maxRows: 3 }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.applicationremarks`).d('申请备注')}
              {...formLayout}
            >
              {getFieldDecorator('prApplyRemark', {
                initialValue: ictPrDetailHeadsList?.prApplyRemark,
              })(
                <CusInput.TextArea
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  style={{ height: 'auto' }}
                  rows={3}
                  autosize={{ minRows: 3, maxRows: 3 }}
                />
              )}
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
