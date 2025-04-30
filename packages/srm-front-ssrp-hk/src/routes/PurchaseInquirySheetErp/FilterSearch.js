import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import { largeScreenWidth } from '_cus_utils/constants';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const gridSpan = getDFormGridSpan();
export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
      screenWidth: window.innerWidth,
    };
  }

  // searchForm = React.createRef();

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

  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth,
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { isShowMore, screenWidth } = this.state;

    // 小屏为false，大屏为true
    const isShow = screenWidth < largeScreenWidth;

    const {
      purchaseInquirySheetModel,
      form,
      ictPrDetailHeadsList
    } = this.props;
    const { basicInfo } = purchaseInquirySheetModel;
    // console.log('ictPrDetailHeadsList', ictPrDetailHeadsList)
    return (
      <div className='customize-form'>
        <Form>
          <GenerateFormGrid isPackUp={isShow}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('采购结果单号')}
              >
                {form.getFieldDecorator('prApplyNo', { initialValue: basicInfo?.prApplyNo ? basicInfo?.prApplyNo : ictPrDetailHeadsList?.prApplyNo })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.model.label`).d('标题')}
              >
                {form.getFieldDecorator('prApplyTitle', { initialValue: basicInfo?.prApplyTitle ? basicInfo?.prApplyTitle : ictPrDetailHeadsList?.prApplyTitle,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.serverLine.actionType`).d('标题'),
                      }),
                    },
                  ], })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('部门')}
              >
                {form.getFieldDecorator('prApplyDep', { initialValue: basicInfo?.prApplyDep ? basicInfo?.prApplyDep : ictPrDetailHeadsList?.prApplyDep })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('申请人')}
              >
                {form.getFieldDecorator('prApplier', { initialValue: basicInfo?.prApplier ? basicInfo?.prApplier : ictPrDetailHeadsList?.prApplier })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('状态')}
              >
                {form.getFieldDecorator('prApplyStatus', { initialValue: basicInfo?.prApplyStatus ? basicInfo?.prApplyStatus : ictPrDetailHeadsList?.prApplyStatus })(<Input
                  disabled />)}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
