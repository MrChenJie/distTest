import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import cusRequest from '_cus_utils/request';
import { Form, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusNotification from '_cus_components/CusNotification';
import { cusDateFormat } from '_cus_utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import dayjs from 'dayjs';

const FormItem = Form.Item;
const prompt = 'spcm.costPayment';
const organizationId = getCurrentOrganizationId();

@Form.create({})
export default class ServiceDate extends React.Component {
  state = {};

  // 批量修改服务日期
  @Bind
  handleServiceDateModalOk(values = {}) {
    const { onSuccess = (e) => e, costInvoiceId, currentSelected } = this.props;
    if (isEmpty(filterNullValueObject(values))) {
      this.setState({
        visible: false,
      });
      return false;
    }
    let selectAllFlag;
    if (currentSelected.length < 1) {
      selectAllFlag = 'Y';
    } else {
      selectAllFlag = 'N';
    }
    this.setState({
      confirmLoading: true,
    });
    cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines/batchUpdateServiceDate`, {
      method: 'POST',
      body: {
        ...values,
        data:
          selectAllFlag === 'Y'
            ? []
            : currentSelected.map((item) => {
                const { serviceEndDate, serviceStartDate } = item || {};
                return {
                  ...item.data,
                  serviceStartDate: cusDateFormat(serviceStartDate, DATETIME_MIN, serviceStartDate),
                  serviceEndDate: cusDateFormat(serviceEndDate, DATETIME_MAX, serviceEndDate),
                };
              }),
        costInvoiceId,
        selectAllFlag,
      },
    }).then((res) => {
      if (cusGetResponse(res)) {
        CusNotification.success();
        this.setState({
          confirmLoading: false,
          visible: false,
        });
        onSuccess();
      }
    });
  }

  @Bind()
  handleOk() {
    const { form } = this.props;
    const values = form.getFieldsValue();
    const { serviceStartDate, serviceEndDate } = values;
    this.handleServiceDateModalOk({
      ...values,
      serviceStartDate: cusDateFormat(serviceStartDate, DATETIME_MIN),
      serviceEndDate: cusDateFormat(serviceEndDate, DATETIME_MAX),
    });
  }

  @Bind
  batchServiceDate() {
    this.setState({
      visible: true,
    });
  }

  render() {
    const { form } = this.props;
    const { visible = false, confirmLoading = false } = this.state;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => (e) } = form;

    return (
      <>
        <CusButton mini onClick={this.batchServiceDate}>
          {intl.get(`${prompt}.view.button.batchServiceDate`).d('批量修改服务日期')}
        </CusButton>
        {visible && (
          <CusModal
            title={intl.get('spcm.costPayment.view.serviceDate').d('服务日期')}
            visible={visible}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            onOk={this.handleOk}
            width={400}
            confirmLoading={confirmLoading}
            destroyOnClose
          >
            <Form className="customize-form">
              <Row>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get(`${prompt}.view.serviceDate.serviceStartDate`)
                      .d('服务开始日期')}
                  >
                    {getFieldDecorator('serviceStartDate')(
                      <CusDatePicker
                        disabledDate={(currentDate) => {
                          const endDate = getFieldValue(`serviceEndDate`);
                          if (endDate && dayjs(endDate).isValid()) {
                            return currentDate.isAfter(endDate);
                          }
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    label={intl.get(`${prompt}.view.serviceDate.serviceEndDate`).d('服务结束日期')}
                  >
                    {getFieldDecorator('serviceEndDate')(
                      <CusDatePicker
                        disabledDate={(currentDate) => {
                          const startDate = getFieldValue(`serviceStartDate`);
                          if (startDate && dayjs(startDate).isValid()) {
                            return currentDate.isBefore(startDate);
                          }
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </CusModal>
        )}
      </>
    );
  }
}
