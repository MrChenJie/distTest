import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
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
  componentDidUpdate(preState, preProps) {
    console.log(preProps, 'preProps')
    if (this.props.contact != preProps.contact)
      console.log(this.props.contact, 'this.props.contact')
  }

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
      contactTel
    } = this.props;
    const formLayout = this.computeFormLayout();
    return (
      <div className='customize-form'>
        <Form ref={this.prForm}>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('采购类别')}
              {...formLayout}
              name='prType'
              initialValue={ictPrDetailHeadsList?.prType}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('采购类别'),
                  }),
                },
              ]}
            >
              <CusSelect
                allowClear
                options={[{
                  value: 'INVS_ICTS',
                  meaning: 'INVS_ICTS',
                }]}
                textField={ictPrDetailHeadsList?.prType}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('采购员')}
              {...formLayout}
              name='prer'
              initialValue={ictPrDetailHeadsList?.prer}
            >
              <CusLov textValue={ictPrDetailHeadsList?.prer} code='HKICT.EMPLOYEE'
                lovOptions={{ valueField: 'name', displayField: 'name' }} />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('供应商编号')}
              {...formLayout}
              name='supNo'
              initialValue={ictPrDetailHeadsList?.supNo}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('供应商编号'),
                  }),
                },
              ]}
            >
              <CusLov
                textValue={ictPrDetailHeadsList?.supNo}
                code='HKSP.SUPPLIER'
                form={this.prForm.current}
                lovOptions={{ displayField: 'supplierNumber', valueField: 'id' }}
                onChange={(val, record) => {
                  this.prForm?.current?.setFieldsValue({ supplierName: record.companyNameCh });
                }
                } />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('供应商名称')}
              {...formLayout}
              name='supplierName'
              initialValue={ictPrDetailHeadsList?.supplierName}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('联系人')}
              {...formLayout}
              name='supContact'
              initialValue={ictPrDetailHeadsList?.supContact}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('联系人'),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('联系方式')}
              {...formLayout}
              name='supPhone'
              initialValue={ictPrDetailHeadsList?.supPhone}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('联系方式'),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('传真号')}
              {...formLayout}
              name='supFax'
              initialValue={ictPrDetailHeadsList?.supFax}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('联系邮箱')}
              {...formLayout}
              name='supEmail'
              initialValue={ictPrDetailHeadsList?.supEmail}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('联系邮箱'),
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('送货联系人')}
              {...formLayout}
              name='supDeliveryContact'
              initialValue={ictPrDetailHeadsList?.supDeliveryContact ? ictPrDetailHeadsList?.supDeliveryContact : contact}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('送货地址')}
              {...formLayout}
              name='supDeliveryAddress'
              initialValue={ictPrDetailHeadsList?.supDeliveryAddress}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('送货地址'),
                  }),
                },
              ]}
            >
              <CusLov textValue={ictPrDetailHeadsList?.supDeliveryAddress} code='CMHK.ERP.ADDRESS'
                lovOptions={{ valueField: 'addressName', displayField: 'addressName' }} onChange={(_, lovData) => {
                  // console.log(lovData, 'lovData')
                  // console.log('this.esForm?.current', this.prForm?.current)
                  this.prForm?.current?.setFieldsValue({ supDeliveryContact: lovData.name })
                  this.prForm?.current?.setFieldsValue({ supDeliveryPhone: lovData.contactTel })
                  dispatch({
                    type: 'purchaseInquirySheetModel/commentUpdateState',
                    patload: {
                      contact: lovData.name,
                      contactTel: lovData.contactTel
                    }
                  })
                }} />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('送货联系电话')}
              {...formLayout}
              name='supDeliveryPhone'
              initialValue={ictPrDetailHeadsList?.supDeliveryPhone ? ictPrDetailHeadsList?.supDeliveryPhone : contactTel}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('送货备注')}
              {...formLayout}
              name='supDeliveryRemark'
              initialValue={ictPrDetailHeadsList?.supDeliveryRemark}
            >
              <CusInput.TextArea style={{ height: 'auto' }} rows={3} autosize={{ minRows: 3, maxRows: 3 }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('申请备注')}
              {...formLayout}
              name='prApplyRemark'
              initialValue={ictPrDetailHeadsList?.prApplyRemark}
            >
              <CusInput.TextArea style={{ height: 'auto' }} rows={3} autosize={{ minRows: 3, maxRows: 3 }} />
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    )
      ;
  }
}
