/**
 * FilterSearch-查询表单
 * @since 2022-02-14
 * @author jxinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui'
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan()

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = this.props;
    // onRef(this);

    this.state = {
      isShowMore: false,
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
    const { headFromDataSource, form } = this.props
    const { getFieldDecorator = (e) => e } = form
    // const {
    //   idpValueMap = {},
    //   onSearch = (e) => e,
    // } = this.props;
    const { getFieldValue = (e) => e } = this.form?.current || {};
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form ref={this.form}>
          <Col span={24}>
            {/* <Form.Item
              label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              {...formLayout}
              name="enquiryPriceTitle"
            >
              <Input
                placeholder='请选择项目名称'
                code="SRSP.PARTNER_INFO"
              />
            </Form.Item> */}
            {headFromDataSource?.projectName && <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              name='projectName'
            >
              {getFieldDecorator('projectName', {
                initialValue: headFromDataSource?.projectName,
              })(<Input disabled />)}
            </Form.Item>}
            {!headFromDataSource?.projectName && <Form.Item
              label={intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')}
              {...formLayout}
              name="projectNumber"
            >
              {getFieldDecorator('projectNumber', {
                initialValue: headFromDataSource?.projectNumber,
              })(<Input disabled />)}
            </Form.Item>}
          </Col>
        </Form>
      </div>
    );
  }
}
