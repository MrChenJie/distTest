import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input, InputNumber, Row } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getLFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import dayjs from 'dayjs';
import { mediumScreenWidth } from '_cus_utils/constants';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getLFormGridSpan();

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: true,
      colSpan: 8,
    };
  }

  form = React.createRef();

  componentDidMount() {
    window.addEventListener('resize', this.setPageWidth);
  }

  @Bind()
  setPageWidth() {
    const widthSize = window.innerWidth;
    this.setState({
      colSpan: widthSize > mediumScreenWidth ? 8 : 12,
    });
  }

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
    const { isShowMore, colSpan } = this.state;
    const { idpValueMap = {}, onSearch = (e) => e, language } = this.props;
    const { getFieldValue = (e) => e } = this.form?.current || {};
    const formLayout = this.computeFormLayout();
    const formItemList = [
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
          {...formLayout}
          name="prNumber"
        >
          <Input
            placeholder={intl.get(`${promptCode}.view.title.inputPRnumber`).d('请输入采购申请编号')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
          {...formLayout}
          name="prName"
        >
          <Input
            placeholder={intl.get(`${promptCode}.view.title.inputPRname`).d('请输入采购申请名称')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门')}
          {...formLayout}
          name="applyingDepartmentId"
        >
          <CusLov
            placeholder={intl
              .get(`${promptCode}.view.title.inputApplyingDepartment`)
              .d('请选择申请部门')}
            code="HKPC.APPLICATIONDEPARTMENT"
            queryParams={{ tenantId: getCurrentOrganizationId() }}
            lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
            // textField="partnerNumber"
            // form={this.form.current}
            // onChange={(_, item) => {
            //   this.form?.current?.setFieldsValue({ partnerName: item.partnername });
            // }}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.datefrom`).d('申请日期从')}
          {...formLayout}
          name="applyingDateStart"
        >
          <CusDatePicker
            format={dateFormat}
            placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
            disabledDate={(currentDate) =>
              dayjs.isDayjs(this.form?.current?.getFieldValue('applyingDateEnd')) &&
              currentDate &&
              dayjs(currentDate).isBefore(this.form?.current?.getFieldValue('applyingDateEnd'))
            }
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.dateto`).d('申请日期至')}
          {...formLayout}
          name="applyingDateEnd"
        >
          <CusDatePicker
            format={dateFormat}
            placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
            disabledDate={(currentDate) =>
              dayjs.isDayjs(this.form?.current?.getFieldValue('applyingDateStart')) &&
              currentDate &&
              dayjs(currentDate).isBefore(this.form?.current?.getFieldValue('applyingDateStart'))
            }
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.pprstatus`).d('采购申请状态')}
          {...formLayout}
          name="prStatus"
        >
          <CusSelect
            placeholder={intl
              .get(`${promptCode}.view.title.inputPRstatus`)
              .d('请选择采购申单请状态')}
            allowClear
            style={{ width: '100%' }}
            options={idpValueMap['HKPC.PRRECORDSSTATUS']}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}
          {...formLayout}
          name="prType"
        >
          <CusSelect
            placeholder={intl.get(`${promptCode}.view.title.inputPRtype`).d('采购申请类型')}
            allowClear
            style={{ width: '100%' }}
            options={idpValueMap['HKPC.PRTYPE']}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.budgettype`).d('预算类型')}
          {...formLayout}
          name="budgetType"
        >
          <CusSelect
            placeholder={intl.get(`${promptCode}.view.title.inputbudgettype`).d('请选择预算类型')}
            allowClear
            style={{ width: '100%' }}
            options={idpValueMap['HKPC.BUDGETTYPE']}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)')}
          {...formLayout}
          name="estimatedBudgetAmountHkd"
        >
          <InputNumber
            placeholder={intl
              .get(`HKPC.commom.view.title.inputEstimatedBudgetAmountHKD`)
              .d('请输入预估总金额(HKD)')}
            step={0.01}
            precision={2}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
          {...formLayout}
          name="applicantUserId"
        >
          <CusLov
            placeholder={intl.get(`${promptCode}.view.title.inputapplicant`).d('请选择申请人')}
            code="CMHK_ALL_USER"
            queryParams={{
              tenantId: getCurrentOrganizationId(),
              organizationId: getCurrentOrganizationId(),
            }}
            lovOptions={{ displayField: 'realName', valueField: 'id' }}
            // textField="partnerNumber"
            // form={this.form.current}
            // onChange={(_, item) => {
            //   this.form?.current?.setFieldsValue({ partnerName: item.partnername });
            // }}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
          {...formLayout}
          name="purchasingCategory"
        >
          <CusSelect
            placeholder={intl
              .get(`${promptCode}.view.title.inputpurchasingcategory`)
              .d('请选择采购类别')}
            allowClear
            style={{ width: '100%' }}
            options={idpValueMap['HKPC.PURCHASINGCATEGORY']}
          />
        </Form.Item>
      </Col>,
    ];

    // 默认展示的item;
    let showItemList = [];
    // 放折叠框里的item;
    let expandFormItemList = [];
    if (colSpan === 8) {
      // width>=1000;
      if (formItemList.length > 6) {
        // 查询条件>6个时
        showItemList = formItemList.slice(0, 5);
        expandFormItemList = formItemList.slice(5);
      } else {
        showItemList = formItemList;
      }
    } else {
      // width<1000;
      if (formItemList.length > 3) {
        // 查询条件>6个时
        showItemList = formItemList.slice(0, 3);
        expandFormItemList = formItemList.slice(3);
      } else {
        showItemList = formItemList;
      }
    }

    return (
      <Form ref={this.form} className="customize-form">
        <Row>
          <Col span={24}>
            <Row>
              {showItemList.map((item) => {
                return item;
              })}
              {expandFormItemList.length > 0 && (
                <div style={{ display: isShowMore ? 'none' : 'block' }}>
                  {expandFormItemList.map((item) => {
                    return item;
                  })}
                </div>
              )}
              <Col span={colSpan} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={onSearch}
                  onReset={this.handleReset}
                  onShowMore={this.handleShowMore}
                  isShowMore={!isShowMore}
                  isShowMoreButton={expandFormItemList.length > 0}
                ></CusQueryButtons>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}
