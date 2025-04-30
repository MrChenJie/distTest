/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import { numberRender } from 'utils/renderer';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  getCurrentUser,
} from 'utils/utils';
import { getEditTableData } from 'hzero-front/lib/utils/utils';

const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();

@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      payTradeModal,
    } = this.props;
    const { getFieldDecorator } = form;

    const { productDetailSource } = payTradeModal;
    return (
      <div className="customize-form">
        <Form>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID')}
              >
                {getFieldDecorator('actId', {
                  initialValue: headerInfo?.actId,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称')}
              >
                {getFieldDecorator('actName', {
                  initialValue: headerInfo?.actName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.PaymentCurre`).d('付款币种')}
              >
                {getFieldDecorator('currency', {
                  initialValue: headerInfo?.currency,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.PaymentAmou`).d('付款金额')}
              >
                {getFieldDecorator('paymentHkd', {
                  initialValue: numberRender(headerInfo?.paymentHkd, 2),
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称')}
              >
                {getFieldDecorator('refTradeName', {
                  initialValue: headerInfo?.refTradeName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.PayStatus`).d('付款状态')}
              >
                {getFieldDecorator('statusMeaning', {
                  initialValue: headerInfo?.statusMeaning,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.CreatDate`).d('创建日期')}
              >
                {getFieldDecorator('creationDate', {
                  initialValue: dayjs(headerInfo?.creationDate).format('YYYY-MM-DD'),
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityNote`).d('备注')}
              >
                {getFieldDecorator('remark', {
                  initialValue: headerInfo?.remark,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityCreator`).d('活动创建人')}
              >
                {getFieldDecorator('createrName', {
                  initialValue: headerInfo?.createrName || realName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            {/* <Col span={24}>
              <Form.Item
                label={intl.get(`demoTitle1`).d('给贸易商备注')}
              >
                {getFieldDecorator('reason', {
                  initialValue: headerInfo?.reason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`demoTitle1`).d('给贸易商备注'),
                      })
                    }
                  ]
                })(
                  <CusInput.TextArea
                    rows={3}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                    showCharacter
                    disabled={false}
                  />
                )}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan} style={{display: 'none'}}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityCreator`).d('活动创建人编码')}
              >
                {getFieldDecorator('createrCode', {
                  initialValue: headerInfo?.createrCode || loginName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
