/**
 * BaseInfo-查询表单
 * @since 2022-02-14
 * @author jxinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import formatterCollections from 'utils/intl/formatterCollections';


/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan()
@formatterCollections({
  code: [promptCode],
})
@Form.create()
export default class BaseInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

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
    const {
      form,
      purchaseApplicationCusModel,
      allOpex,
    } = this.props;
    const { getFieldDecorator } = form;
    const { projectName, projectNumber } = purchaseApplicationCusModel;
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form >
          <Col span={24}>
            {!allOpex && <Form.Item
              label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              {...formLayout}
              name="projectName"
            >
              {getFieldDecorator('projectName', {
                initialValue: projectName,
              })(
                <Input disabled />
              )}
            </Form.Item>}
            {allOpex && <Form.Item
              label={intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')}
              {...formLayout}
              name="projectNumber"
            >
              {getFieldDecorator('projectId', {
                initialValue: projectNumber,
              })(
                <Input disabled />
              )}
            </Form.Item>}
          </Col>
        </Form>
      </div>
    );
  }
}
