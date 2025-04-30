import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form, InputNumber } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import styles from './index.less';
import { numberRender } from 'utils/renderer';
import querystring from 'querystring';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import UploadList from '../../../../../srm-front-po-hk/src/components/uploadList';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const gridSpan = getDFormGridSpan();

export default class SearchApplication extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;

    onRef(this);
    this.state = {};
  }

  form = React.createRef();

  render() {
    const { idpValueMap = {}, onSearch = (e) => e, purchaseResultModel, form, isEdit, projectInfo, poHeaderInfo } = this.props;
    const { fourthHead, paStatusYB, fourthPackageList } = purchaseResultModel;
    const [{ purchaseType } = {}] = fourthPackageList || [];
    const { getFieldDecorator } = form;
    const isBidding = location.pathname.includes('/bid');
    return (
      <div className={styles['out-ant-input']}>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称')}
              >
                {getFieldDecorator('paName', {
                  initialValue:
                    fourthHead.paName == null ? fourthHead?.prPlanName : fourthHead.paName,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称'),
                      }),
                    },
                  ],
                })(
                  <Input
                    disabled={isEdit}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PAnumber`).d('采购结果编号')}>
                {getFieldDecorator('paNumber', {
                  initialValue: fourthHead?.paNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PACurrency`).d('结果币种')}>
                {getFieldDecorator('paCurrency', {
                  initialValue: fourthHead?.paCurrency,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PAStatus`).d('采购结果状态')}>
                {getFieldDecorator('paStatus', {
                  initialValue: idpValueMap['HKPC.PRRECORDSSTATUS']?.find(
                    (item) => item.value == fourthHead?.paStatus
                  )?.meaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.PARate`).d('结果汇率')}>
                {getFieldDecorator('paRate', {
                  initialValue: fourthHead?.paRate,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.compareammount`).d('初始报价')}
              >
                {getFieldDecorator('projectComparisonAmount', {
                  initialValue: fourthHead.projectComparisonAmount,
                  rules: [
                    {
                      required: fourthHead?.paAmountHkd > 1000000,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.compareammount`).d('初始报价'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    precision={2}
                    className={styles['input-money']}
                    disabled={isEdit}
                    onChange={(val) => {
                      fourthHead.projectComparisonAmount = val
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.PAAmountH`).d('采购结果金额(HKD)')}
                name="paAmountHkd"
              >
                {getFieldDecorator('paAmountHkd', {
                  initialValue: numberRender(fourthHead?.paAmountHkd, 2),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.savingrate`).d('节省比例(%)')}
                name="ratio"
              >
                {getFieldDecorator('ratio', {
                  initialValue:
                  (fourthHead.projectComparisonAmount && fourthHead.paAmountHkd) ?
                  `${(((fourthHead.projectComparisonAmount - fourthHead.paAmountHkd) / fourthHead.projectComparisonAmount) * 100).toFixed(2)}%`
                  : '',
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.SuggestedProcurementMethod`).d('采购方式')}
              >
                {getFieldDecorator('purchaseType', {
                  initialValue: purchaseType,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['BID.PROCUREMENT_METHOD']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.subcontractingexists`).d('是否分标包')}
              >
                {getFieldDecorator('procurementHandler', {
                  initialValue: fourthHead?.whetherPackage == 'YES' ? intl.get(`${promptCode}.view.title.yes`).d('是') : intl.get(`${promptCode}.view.title.no`).d('否'),
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.WinningSupplier`).d('中选供应商')}
                name="winSupplier"
              >
                {getFieldDecorator('winSupplier', {
                  initialValue: fourthHead?.winSupplier,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col sapn={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.decisionresult`).d('决策结果')}
                name="decisionResult"
              >
                {getFieldDecorator('decisionResult', {
                  initialValue: fourthHead?.decisionResult,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.decisionresult`).d('决策结果'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={isEdit}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procuremrntremark`).d('采购意见')}
                name="comments"
              >
                {getFieldDecorator('comments', {
                  initialValue: fourthHead?.comments,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.procuremrntremark`).d('采购意见'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={isEdit}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                name='uuid'
              >
                <UploadList
                  viewOnly={isEdit}
                  multiple={true}
                  bucketName={isBidding ? 'bidding' : 'pr-apply'}
                  tenantId={getCurrentOrganizationId()}
                  showUploadList={{
                    removePopConfirmTitle: intl
                      .get('hzero.common.message.confirm.delete')
                      .d('是否删除此条记录？'),
                    showRemoveIcon: true,
                  }}
                  filePreview
                  attachmentUUID={isBidding ? poHeaderInfo?.uuid : projectInfo?.uuid}
                  setLoading={(uploading = false) => {
                    this.setState({
                      uploading,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
              >
                {getFieldDecorator('procurementHandler', {
                  initialValue: fourthHead?.procurementHandlerName,
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
