import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input } from 'hzero-ui';
import { Select } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
// import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import ExcelExport from '@/components/ExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

import exportIcon from '@/assets/buttonIcons/导出.png';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;
const commonPrompt = 'spcm.costPayment';

@Form.create({})
export default class PrepayWriteOff extends React.Component {

  @Bind()
  getExportQueryParams() {
    const { form } = this.props;
    const formValues = form.getFieldsValue();
    // console.log(formValues);
    return {
      ...formValues,
    };
  }

  render() {
    const { form, idpValueMap = {} } = this.props;
    const { getFieldDecorator } = form;

    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-search-form">
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.companyOrgCode`).d('公司主体')}
                {...formLayout}
              >
                {getFieldDecorator('companyOrgCode')(
                  <Select allowClear>
                    {idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] &&
                      idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'].map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.vendorCompanyName`).d('供应商名称')}
                {...formLayout}
              >
                {getFieldDecorator('vendorCompanyNum')(
                  <Lov
                    code='SSLM.COST_SUPPLIER_INFO'
                    lovOptions={{ displayField: 'vendorName', valueField: 'vendorNum' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.preInvoiceNum`).d('预付款发票编号')}
                {...formLayout}
              >
                {getFieldDecorator('preInvoiceNum')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.preCircuitId`).d('预付款发票客户电路编号')}
                {...formLayout}
              >
                {getFieldDecorator('preCircuitId')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.currencyCode`).d('发票币种')}
                {...formLayout}
              >
                {getFieldDecorator('currencyCode')(
                  <Lov
                    code='HPFM.CURRENCY'
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.preRequestNum`).d('预付款申请单号')}
                {...formLayout}
              >
                {getFieldDecorator('preRequestNum')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${commonPrompt}.view.requestNum`).d('标准发票申请单号')}
                {...formLayout}
              >
                {getFieldDecorator('requestNum')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={24} style={{ margin: '10px 0' }}>
            <Col span={24} className="customize-buttons" style={{ textAlign: 'right' }}>
              <ExcelExport
                requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/prepayment-write-offs/preWriteOffExport`}
                queryParams={this.getExportQueryParams()}
                downloadType="Blob"
                fileName={intl
                  .get(`${commonPrompt}.view.export.preWriteOffExport`)
                  .d('预付款核销明细和余额情况') + '-' + moment().format('YYYY-MM-DD')}
                otherButtonProps={{
                  icon: null,
                }}
                buttonText={
                  <>
                    <img src={exportIcon} alt="" />
                    {intl.get('hzero.common.button.export').d('导出')}
                  </>
                }
              />
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    )
  }
}