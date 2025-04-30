import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import dayjs from 'dayjs';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: true,
    };
  }

  form = React.createRef();

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
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
    const { idpValueMap = {}, onSearch = (e) => e } = this.props;
    const { getFieldValue = (e) => e } = this.form?.current || {};
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form ref={this.form}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('采购申请编号')}
              {...formLayout}
              name="prNumber"
            >
              <Input placeholder="请输入采购申请编号" />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('采购申请名称')}
              {...formLayout}
              name="prName"
            >
              <Input placeholder="请输入采购申请名称" />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('采购方案编号')}
              {...formLayout}
              name="ppNumber"
            >
              <Input placeholder="请输入采购方案编号" />
            </Form.Item>
          </Col>
          <div style={{ display: isShowMore ? 'block' : 'none' }}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购方案名称')}
                {...formLayout}
                name="ppName"
              >
                <Input placeholder="请输入采购方案名称" />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购结果编号')}
                {...formLayout}
                name="paNumber"
              >
                <Input placeholder="请输入采购结果编号" />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购结果名称')}
                {...formLayout}
                name="paName"
              >
                <Input placeholder="请输入采购结果名称" />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购经办人')}
                {...formLayout}
                name="packageNo"
              >
                <Input placeholder="请输入采购经办人" />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购方式')}
                {...formLayout}
                name="procurementMethod"
              >
                <CusSelect placeholder="请选择采购方式" allowClear style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('决策类型')}
                {...formLayout}
                name="decisionType"
              >
                <CusSelect placeholder="请选择决策类型" allowClear style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('申请部门')}
                {...formLayout}
                name="applyingDepartment"
              >
                <CusLov
                  placeholder="请选择申请部门"
                  code="SRSP.PARTNER_INFO"
                  // lovOptions={{ displayField: 'partnernumber', valueField: 'partnernumber' }}
                  // textField="partnerNumber"
                  // form={this.form.current}
                  // onChange={(_, item) => {
                  //   this.form?.current?.setFieldsValue({ partnerName: item.partnername });
                  // }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('申请日期从')}
                {...formLayout}
                name="dateFrom"
              >
                <CusDatePicker
                  format={dateFormat}
                  placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
                  disabledDate={(currentDate) => {
                    return (
                      dayjs.isDayjs(this.filterForm?.current?.getFieldValue('endInvoiceDate')) &&
                      currentDate &&
                      currentDate.isAfter(this.filterForm?.current?.getFieldValue('endInvoiceDate'))
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('申请日期至')}
                {...formLayout}
                name="dateTo"
              >
                <CusDatePicker
                  format={dateFormat}
                  placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
                  disabledDate={(currentDate) => {
                    return (
                      dayjs.isDayjs(this.filterForm?.current?.getFieldValue('startInvoiceDate')) &&
                      currentDate &&
                      currentDate.isBefore(
                        this.filterForm?.current?.getFieldValue('startInvoiceDate')
                      )
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('申请人')}
                {...formLayout}
                name="applicant"
              >
                <CusLov
                  placeholder="请选择申请人"
                  code="SRSP.PARTNER_INFO"
                  // lovOptions={{ displayField: 'partnernumber', valueField: 'partnernumber' }}
                  // textField="partnerNumber"
                  // form={this.form.current}
                  // onChange={(_, item) => {
                  //   this.form?.current?.setFieldsValue({ partnerName: item.partnername });
                  // }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('预估总金额(HKD)')}
                {...formLayout}
                name="estimatedBudgetAmount(HKD)"
              >
                <Input placeholder="请输入预估总金额(HKD)" />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购结果状态')}
                {...formLayout}
                name="paStatus"
              >
                <CusSelect
                  placeholder="请选择采购结果状态"
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PRRECORDSSTATUS']}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购申请类型')}
                {...formLayout}
                name="prType"
              >
                <CusSelect
                  placeholder="请选择采购申请类型"
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PRTYPE']}
                />
              </Form.Item>
            </Col>
          </div>
          <Col {...gridSpan} style={{ float: 'right' }}>
            <CusQueryButtons
              onQuery={onSearch}
              onReset={this.handleReset}
              onShowMore={this.handleShowMore}
              isShowMore={isShowMore}
            ></CusQueryButtons>
          </Col>
        </Form>
      </div>
    );
  }
}
