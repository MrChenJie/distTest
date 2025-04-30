import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import dayjs from 'dayjs';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
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
              label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
              {...formLayout}
              name="prNumber"
            >
              <Input
                placeholder={intl
                  .get(`${promptCode}.view.title.inputPRnumber`)
                  .d('请输入采购申请编号')}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              {...formLayout}
              name="prName"
            >
              <Input
                placeholder={intl
                  .get(`${promptCode}.view.title.inputPRname`)
                  .d('请输入采购申请名称')}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号')}
              {...formLayout}
              name="ppNumber"
            >
              <Input placeholder={intl.get(`${promptCode}.view.title.inputppnumber`).d('请输入采购方案编号')} />
            </Form.Item>
          </Col>
          <div style={{ display: isShowMore ? 'block' : 'none' }}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PPname`).d('采购方案名称')}
                {...formLayout}
                name="ppName"
              >
                <Input
                  placeholder={intl.get(`${promptCode}.view.title.inputppname`).d('请输入采购方案名称')}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAnumber`).d('采购结果编号')}
                {...formLayout}
                name="paNumber"
              >
                <Input placeholder={intl.get(`${promptCode}.view.title.inputpanumber`).d('请输入采购结果编号')} />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称')}
                {...formLayout}
                name="paName"
              >
                <Input placeholder={intl.get(`${promptCode}.view.title.inputpaname`).d('请输入采购结果名称')} />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                {...formLayout}
                name="packageNo"
              >
                <Input placeholder={intl.get(`${promptCode}.view.title.inputpackageno`).d('请输入标包编号')} />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
                {...formLayout}
                name="procurementMethod"
              >
                <CusSelect
                  options={idpValueMap['HKPC.PPPROCUREMENTMETHOD']}
                  placeholder={intl.get(`${promptCode}.view.title.procurementmethod`).d('请选择采购方式')}
                  allowClear
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.DecisionHierarchy`).d('决策类型')}
                {...formLayout}
                name="decisionType"
              >
                <CusSelect
                  placeholder={intl.get(`${promptCode}.view.title.decisiontype`).d('请选择决策类型')}
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.DECISIONHIERARCHY']}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门')}
                {...formLayout}
                name="applyingDepartment"
              >
                <CusLov
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputApplyingDepartment`)
                    .d('请选择申请部门')}
                  code="HKPC.APPLICATIONDEPARTMENT"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.datefrom`).d('申请日期从')}
                {...formLayout}
                name="dateFrom"
              >
                <CusDatePicker
                  format={dateFormat}
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputPRdatefrom`)
                    .d('请选择申请日期')}
                  disabledDate={(currentDate) => {
                    return (
                      dayjs.isDayjs(this.filterForm?.current?.getFieldValue('dateTo')) &&
                      currentDate &&
                      currentDate.isAfter(this.filterForm?.current?.getFieldValue('dateTo'))
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.dateto`).d('申请日期至')}
                {...formLayout}
                name="dateTo"
              >
                <CusDatePicker
                  format={dateFormat}
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputPRdateto`)
                    .d('请选择申请日期')}
                  disabledDate={(currentDate) => {
                    return (
                      dayjs.isDayjs(this.filterForm?.current?.getFieldValue('dateFrom')) &&
                      currentDate &&
                      currentDate.isBefore(this.filterForm?.current?.getFieldValue('dateFrom'))
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
                {...formLayout}
                name="applicant"
              >
                <CusLov
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputapplicant`)
                    .d('请选择申请人')}
                  code="CMHK_ALL_USER"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    organizationId: getCurrentOrganizationId(),
                  }}
                  lovOptions={{ displayField: 'realName', valueField: 'id' }}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountH`)
                  .d('预估总金额(HKD)')}
                {...formLayout}
                name="estimatedBudgetAmountHkd"
              >
                <Input
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputEstimatedBudgetAmountHKD`)
                    .d('请输入预估总金额(HKD)')}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAStatus`).d('采购结果状态')}
                {...formLayout}
                name="paStatus"
              >
                <CusSelect
                  placeholder={intl.get(`${promptCode}.view.title.pastatus`).d('请选择采购结果状态')}
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PRRECORDSSTATUS']}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}
                {...formLayout}
                name="prType"
              >
                <CusSelect
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputPRtype`)
                    .d('请选择采购申请类型')}
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PRTYPE']}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.budgettype`).d('预算类型')}
                {...formLayout}
                name="budgetType"
              >
                <CusSelect
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputbudgettype`)
                    .d('请选择预算类型')}
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.BUDGETTYPE']}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                {...formLayout}
                name="procurementHandler"
              >
                <CusLov
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputprocurementhandler`)
                    .d('请选择采购经办人')}
                  allowClear
                  code="HKPC.PROCUREMENTAGENT"
                  lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
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
