/*
 * @Description: 
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2024-04-01 10:16:59
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input, Row } from 'antd';
import formatterCollections from 'utils/intl/formatterCollections';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
// import styles from './index.less'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
@formatterCollections({
  code: [promptCode],
})
export default class InquiryRound extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();

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

  render() {
    const oneLine = {
      lg: 24,
      md: 24,
      sm: 24,
      xl: 24,
      xs: 24,
      xxl: 24,
    }
    const gridSpan = {
      lg: 12,
      md: 12,
      sm: 12,
      xl: 12,
      xs: 12,
      xxl: 12,
    }
    const { inquiryRoundForm } = this.props;
    this.form.current?.setFieldsValue({
      ...inquiryRoundForm
    });
    return (
      <div>
        <Form className="customize-form" ref={this.form}>
          <GenerateFormGrid isPackUp={false}>
            <Col {...oneLine}>
              <Form.Item label={intl.get(`${promptCode}.view.title.Round`).d('轮次')} name="round">
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.StageStarttime`).d('本阶段开始时间')}
                name="stageStartTime"
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')}
                name="stageDeadline"
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
