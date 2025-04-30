import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input, Row } from 'antd';
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
          label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
          {...formLayout}
          name="proNo"
        >
          <Input
            placeholder={intl.get(`${promptCode}.view.title.inputpackageno`).d('请输入标包编号')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
          {...formLayout}
          name="projectName"
        >
          <Input
            placeholder={intl.get(`${promptCode}.view.title.inputprojectname`).d('请输入项目名称')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}
          {...formLayout}
          name="requester"
        >
          <CusLov
            placeholder={intl
              .get(`${promptCode}.view.title.selectrequester`)
              .d('请选择需求人')}
            code="CMHK_REPORT_REQUESTER"
            // queryParams={{ tenantId: getCurrentOrganizationId() }}
            lovOptions={{ displayField: 'requester', valueField: 'requester' }}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.budgettype`).d('预算类别')}
          {...formLayout}
          name="budgetType"
        >
          <CusSelect
            placeholder={intl
              .get(`${promptCode}.view.title.inputbudgettype`)
              .d('请选择预算类别')}
            allowClear
            style={{ width: '100%' }}
            options={idpValueMap['HKPC.BUDGETTYPE']}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号')}
          {...formLayout}
          name="proPlanNo"
        >
          <Input
            placeholder={intl.get(`${promptCode}.view.title.inputppnumber`).d('请输入采购方案编号')}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购负责人')}
          {...formLayout}
          name="picManager"
        >
          <CusLov
            placeholder={intl
              .get(`${promptCode}.view.title.inputprocurementhandler`)
              .d('请选择采购负责人')}
            code="CMHK_REPORT_BUG"
            // queryParams={{ tenantId: getCurrentOrganizationId() }}
            lovOptions={{ displayField: 'procurements', valueField: 'procurements' }}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.PPApprovedDate`).d('采购方案审批日期')}
          {...formLayout}
          name="ppApprovalDate"
        >
          <CusDatePicker
            format={dateFormat}
            placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
            disabledDate={(currentDate) =>
              dayjs.isDayjs(this.form?.current?.getFieldValue('ppApprovalDate')) &&
              currentDate &&
              dayjs(currentDate).isBefore(this.form?.current?.getFieldValue('ppApprovalDate'))
            }
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`${promptCode}.view.title.podate`).d('采购订单日期')}
          {...formLayout}
          name="poDate"
        >
          <CusDatePicker
            format={dateFormat}
            placeholder={intl.get('hzero.common.view.message.selectDate').d('请选择日期')}
            disabledDate={(currentDate) =>
              dayjs.isDayjs(this.form?.current?.getFieldValue('poDate')) &&
              currentDate &&
              dayjs(currentDate).isBefore(this.form?.current?.getFieldValue('poDate'))
            }
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
