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
      purchaseApplicationModel,
    } = this.props;
    const { getFieldDecorator } = form;
    const { inquireBaseInfo = {} } = purchaseApplicationModel;
    return (
      <CusSpin spinning={false}>
        <div className={styles['out-ant-input']}>
          <Form className='customize-form'>
            <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.RQname`).d('询价单名称')}
                >
                  {getFieldDecorator('name', {
                    initialValue: inquireBaseInfo.name,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.RQname`).d('询价单名称'),
                      }),
                    }],
                  })(
                    <Input disabled={inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'} />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号')}
                >
                  {getFieldDecorator('rqNumber', {
                    initialValue: inquireBaseInfo.rqNumber,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.eettimatedbudgetamountH`).d('预估总金额（HKD）')}
                >
                  {getFieldDecorator('totalAmount', {
                    initialValue: numberRender(inquireBaseInfo.totalAmount, 2),
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.RQCurrency`).d('询价币种')}
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
                  {getFieldDecorator('exchangeRate', {
                    initialValue: inquireBaseInfo.exchangeRate,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                >
                  {getFieldDecorator('agent', {
                    initialValue: inquireBaseInfo.agent,
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.RQstatus`).d('询价单状态')}
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
                  label={intl.get(`${promptCode}.view.title.SuggestedProcurementMethod`).d('采购方式')}
                >
                  {getFieldDecorator('procurementType', {
                    initialValue: inquireBaseInfo.procurementType,
                  })(
                    <CusSelect
                      allowClear
                      style={{ width: '100%' }}
                      lovCode="BID.PROCUREMENT_METHOD"
                      disabled={inquireBaseInfo?.status && inquireBaseInfo?.status !== 'PENDING_REFER'}
                    />
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
