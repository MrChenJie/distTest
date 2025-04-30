import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input } from 'antd';
import { SRM_SPUC } from '_utils/config';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import dayjs from 'dayjs';

const FormItem = Form.Item;
const commonPrompt = 'spcm.costPayment';

export default class PrepayWriteOff extends React.Component {
  form = React.createRef();

  @Bind()
  getExportQueryParams() {
    const formValues = this.form?.current?.getFieldsValue(true);
    return {
      ...formValues,
    };
  }

  render() {
    const { idpValueMap = {} } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.companyOrgCode`).d('公司主体')}
                  wrapperCol={{ span: 24 }}
                  name="companyOrgCode"
                >
                  <CusSelect allowClear options={idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY']} />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.vendorCompanyName`).d('供应商名称')}
                  wrapperCol={{ span: 24 }}
                  name="vendorCompanyNum"
                >
                  <CusLov
                    code="SSLM.COST_SUPPLIER_INFO"
                    lovOptions={{ displayField: 'vendorName', valueField: 'vendorNum' }}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.preInvoiceNum`).d('预付款发票编号')}
                  wrapperCol={{ span: 24 }}
                  name="preInvoiceNum"
                >
                  <Input />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.preCircuitId`).d('预付款发票客户电路编号')}
                  wrapperCol={{ span: 24 }}
                  name="preCircuitId"
                >
                  <Input />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.currencyCode`).d('发票币种')}
                  wrapperCol={{ span: 24 }}
                  name="currencyCode"
                >
                  <CusLov code="HPFM.CURRENCY" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.preRequestNum`).d('预付款申请单号')}
                  wrapperCol={{ span: 24 }}
                  name="preRequestNum"
                >
                  <Input />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.view.requestNum`).d('标准发票申请单号')}
                  wrapperCol={{ span: 24 }}
                  name="requestNum"
                >
                  <Input />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="cus-modal-body-buttons">
          <CusExcelExport
            requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/prepayment-write-offs/preWriteOffExport`}
            queryParams={this.getExportQueryParams}
            downloadType="Blob"
            fileName={
              intl
                .get(`${commonPrompt}.view.export.preWriteOffExport`)
                .d('预付款核销明细和余额情况') +
              '-' +
              dayjs().format('YYYY-MM-DD')
            }
            otherButtonProps={{
              type: 'primary',
              icon: null,
            }}
            buttonText={intl.get('hzero.common.button.export').d('导出')}
          />
        </div>
      </>
    );
  }
}
