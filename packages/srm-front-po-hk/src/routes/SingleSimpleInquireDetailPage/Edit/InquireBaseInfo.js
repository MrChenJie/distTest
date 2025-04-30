import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row } from 'antd';
import { Form } from 'hzero-ui';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import UploadTable from './UploadTable';
import { numberRender } from 'utils/renderer';
import CusSelect from '_cus_components/CusSelect';
import CusSpin from '_cus_components/CusSpin';
import styles from './index.less'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
@Form.create()
export default class InquireBaseInfo extends React.Component {
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
    this.props;
    const { isShowMore } = this.state;
    const {
      form,
      singlePurchaseApplicationModel,
    } = this.props;
    const { getFieldDecorator } = form;
    const { inquireBaseInfo = {} } = singlePurchaseApplicationModel;
    return (
      <CusSpin spinning={false}>
        <div className={styles['out-ant-input']}>
          <Form className='customize-form'>
            <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
                >
                  {getFieldDecorator('packageName', {
                    initialValue: inquireBaseInfo.packageName,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.PackageName`).d('标包名称'),
                      }),
                    }],
                  })(
                    <Input disabled={inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'} />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                >
                  {getFieldDecorator('packageNo', {
                    initialValue: inquireBaseInfo.packageNo,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.eettimatedbudgetamountH`).d('预估总金额（HKD）')}
                >
                  {getFieldDecorator('estimatedBudgetAmountHkd', {
                    initialValue: numberRender(inquireBaseInfo.estimatedBudgetAmountHkd, 2),
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.RQCurrency`).d('币种')}
                >
                  {getFieldDecorator('currency', {
                    initialValue: inquireBaseInfo.currency,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.RQrate`).d('询价汇率')}
                >
                  {getFieldDecorator('prRate', {
                    initialValue: inquireBaseInfo.prRate,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                >
                  {getFieldDecorator('procurementHandler', {
                    initialValue: inquireBaseInfo.procurementHandler,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.PEStatus`).d('采购实施状态')}
                >
                  {getFieldDecorator('status', {
                    initialValue: inquireBaseInfo.status,
                  })(
                    // <Input disabled />
                    <CusSelect
                      lovCode="HKPC.PRRECORDSSTATUS"
                      disabled
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
                >
                  {getFieldDecorator('budgetLocalAmountCapex', {
                    initialValue: numberRender(inquireBaseInfo.budgetLocalAmountCapex, 2),
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
                >
                  {getFieldDecorator('purchaseType', {
                    initialValue: inquireBaseInfo.purchaseType,
                  })(
                    // <Input disabled />
                    <CusSelect
                      lovCode="BID.PROCUREMENT_METHOD"
                      disabled
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
                >
                  {getFieldDecorator('budgetLocalAmountOpex', {
                    initialValue: numberRender(inquireBaseInfo.budgetLocalAmountOpex, 2),
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.NumberofSuccessfulBidders`).d('中标人数')}
                >
                  {getFieldDecorator('bidNum', {
                    initialValue: inquireBaseInfo.bidNum,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
            </GenerateFormGrid>
          </Form>
        </div>
      </CusSpin>
    );
  }
}
