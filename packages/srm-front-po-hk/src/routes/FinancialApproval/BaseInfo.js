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
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan()

@formatterCollections({ code: [promptCode] })
export default class BaseInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
    };
  }

  baseInfoForm = React.createRef();

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const { purchaseApplicationModel } = this.props;
    const { purchaseApproveForm } = purchaseApplicationModel;
    const formLayout = this.computeFormLayout();
    this.baseInfoForm?.current?.setFieldsValue({
      projectName: purchaseApproveForm?.projectName,
      projectNumber: purchaseApproveForm?.projectNumber,
    });


    return (
      <div className="customize-form">
        <Form ref={this.baseInfoForm}>
          <Col span={24}>
            {purchaseApproveForm?.projectName && <Form.Item
              label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              {...formLayout}
              name="projectName"
            >
              <Input disabled />
            </Form.Item>}
            {!purchaseApproveForm?.projectName && <Form.Item
              label={intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')}
              {...formLayout}
              name="projectNumber"
            >
              <Input disabled />
            </Form.Item>}
          </Col>
        </Form>
      </div>
    );
  }
}
