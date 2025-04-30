import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import { largeScreenWidth } from '_cus_utils/constants';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
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
      ictPrDetailHeadsList,
    } = this.props;
    const { basicInfo, prApplyStatus } = purchaseInquirySheetModel;
    return (
      <div className="customize-form">
        <Form>
          <GenerateFormGrid isPackUp={isShow}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.ictprnumber`).d('采购结果单号')}>
                {form.getFieldDecorator('prApplyNo', {
                  initialValue: ictPrDetailHeadsList?.prApplyNo
                    ? ictPrDetailHeadsList?.prApplyNo
                    : basicInfo?.prApplyNo,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item required label={intl.get(`${promptCode}.view.title.icttitle`).d('标题')}>
                {form.getFieldDecorator('prApplyTitle', {
                  initialValue: ictPrDetailHeadsList?.prApplyTitle
                    ? ictPrDetailHeadsList?.prApplyTitle
                    : basicInfo?.prApplyTitle,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.icttitle`).d('标题'),
                      }),
                    },
                  ],
                })(<Input disabled={prApplyStatus == 'PENDING_REFER' ? false : true} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ictapplyingdepartment`).d('部门')}
              >
                {form.getFieldDecorator('prApplyDep', {
                  initialValue: ictPrDetailHeadsList?.prApplyDep
                    ? ictPrDetailHeadsList?.prApplyDep
                    : basicInfo?.prApplyDep,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.ictapplicant`).d('申请人')}>
                {form.getFieldDecorator('prApplierMeaning', {
                  initialValue: ictPrDetailHeadsList?.prApplierMeaning
                    ? ictPrDetailHeadsList?.prApplierMeaning
                    : basicInfo?.prApplierMeaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan} style={{ display: 'none' }}>
              <Form.Item label={intl.get(`${promptCode}.model.label`).d('申请人code')}>
                {form.getFieldDecorator('prApplier', {
                  initialValue: ictPrDetailHeadsList?.prApplier
                    ? ictPrDetailHeadsList?.prApplier
                    : basicInfo?.prApplier,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.ictstatus`).d('状态')}>
                {form.getFieldDecorator('prApplyStatusMeaning', {
                  initialValue: ictPrDetailHeadsList?.prApplyStatusMeaning
                    ? ictPrDetailHeadsList?.prApplyStatusMeaning
                    : basicInfo?.prApplyStatusMeaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan} style={{ display: 'none' }}>
              <Form.Item label={intl.get(`${promptCode}.model.label`).d('状态Code')}>
                {form.getFieldDecorator('prApplyStatus', {
                  initialValue: ictPrDetailHeadsList?.prApplyStatus
                    ? ictPrDetailHeadsList?.prApplyStatus
                    : basicInfo?.prApplyStatus,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
