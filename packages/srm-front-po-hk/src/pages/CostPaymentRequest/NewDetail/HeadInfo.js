/**
 * @Description: 基础信息
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Col, Row } from 'antd';
import { Checkbox, Form, InputNumber } from 'hzero-ui';
import { chunk } from 'lodash';
import { largeScreenWidth } from '_cus_utils/constants';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusModal from '_cus_components/CusModal';
import dayjs from 'dayjs';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getCurrentUser, getCodeMeaning } from 'utils/utils';
import styles from './index.less';
import { queryIdpValue } from 'services/api';
import { getResponse as cusGetResponse, cusDateFormat } from '_cus_utils/utils';
import ProductTypeModal from './components/ProductTypeModal';

const screenWidth = window.screen.width;
const prompt = 'spcm.costPayment';
const FormItem = Form.Item;
const currentUser = getCurrentUser();

class HeadInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: true,
      productTypeCodes: [], // 产品类型
    };
  }

  componentDidMount() {
    this.fetchProductTypeCodes();
  }

  /**
   * 获取产品类型编码
   **/
  @Bind
  fetchProductTypeCodes() {
    const lovCode = 'RS_IBOSS_PRODUCT_TYPE';
    queryIdpValue(lovCode).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          productTypeCodes: res.map((item) => ({ value: item.value, label: item.meaning })),
        });
      }
    });
  }

  /**
   * 在起草状态下，变更紧急程度为一般【GENERAL】时，置空期望付款日期
   **/
  @Bind
  changePressLevel(pressLevel) {
    const { form, requestStatus } = this.props;
    if (['DRAFT'].includes(requestStatus) && ['GENERAL'].includes(pressLevel)) {
      form.setFieldsValue({
        expectPaymentDate: undefined,
      });
    }
  }

  /**
   * 多币种变更，为N置空 实际支付币种【actualPaidCurrency】
   * @param multiCurrencyFlag
   */
  @Bind()
  changeMultiCurrencyFlag(multiCurrencyFlag) {
    const { form } = this.props;
    if (multiCurrencyFlag === 'N') {
      form.setFieldsValue({
        actualPaidCurrency: undefined,
      });
    }
  }

  /**
   * 不需要支付变更
   * @param notNeedPaidFlag
   */
  @Bind()
  changeNotNeedPaidFlag(notNeedPaidFlag) {
    if (['Y'].includes(notNeedPaidFlag)) {
      CusModal.info({
        content: intl
          .get(`${prompt}.view.notNeedPaidFlag.info`)
          .d('若勾选【不需要支付】，则表示财务用户无需对此付款申请下的发票进行付款，请谨慎勾选！'),
      });
    }
  }

  /**
   * 代付员工名称变更
   * @param pay
   *
   **/
  @Bind()
  changePayName(pay) {
    const { form } = this.props;
    if (pay) {
      form.setFieldsValue({
        payCompanyId: pay.vendorId,
        payCompanyNum: pay.vendorNum,
        payCompanyName: pay.vendorName,
        vendorSiteCode: pay.vendorSiteCode,
      });
    } else {
      form.setFieldsValue({
        payCompanyId: undefined,
        payCompanyNum: undefined,
        payCompanyName: undefined,
        vendorSiteCode: undefined,
      });
    }
  }

  getItems = () => {
    const {
      form,
      isCreate,
      headerData = {},
      headerData: { productType = 'OTHERS' } = {},
      idpValueMap = {},
      returnRequestId,
      defaultFlag,
      fileFlag,
      bankModifyFlag,
      requestStatus,
      changeOrgName = (e) => e,
      vendorPayFlagChange = (e) => e,
      chequePayFlagChange = (e) => e,
      commissionFlagChange = (e) => e,
      changeCurrencyCode = (e) => e,
      changeVendor = (e) => e,
      getTotalAmount = (e) => e,
      saveRequestHeader = (e) => e,
    } = this.props;

    const { getFieldDecorator, getFieldValue } = form;

    const colSpan = screenWidth > largeScreenWidth ? 8 : 12;
    const isCommissionFlagEdit = idpValueMap['SPUC.COMMISSION_INFO_AUTHORITY']?.some(
      (item) => item.meaning === currentUser.loginName
    );

    const { productTypeCodes } = this.state;
    const productTypeModalProps = {
      saveRequestHeader: saveRequestHeader,
      isCreate: isCreate,
      options: productTypeCodes,
    };

    const OtherRiskWarning = ({ value = '' }) => {
      let result;
      value = value.split(';');
      if (Array.isArray(value)) {
        result = value.map((item, index) => <p key={index}>{item}</p>);
      }
      return <div className={styles['otherRiskWarning']}>{result}</div>;
    };

    return [
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('processStatus', {
            initialValue: headerData.processStatus,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.requestNum`).d('申请编号')}>
          {getFieldDecorator('requestNum', {
            initialValue: headerData.requestNum,
          })(
            <CusInput
              disabled
              tip={returnRequestId ? `EBS Request ID：${returnRequestId}` : undefined}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.requestStatus`).d('申请状态')}>
          {getFieldDecorator('requestStatus', {
            initialValue: ['PAID', 'NETTING'].includes(requestStatus)
              ? `${getCodeMeaning(headerData.requestStatus, idpValueMap['SPCM.COST_REQUEST_STATUS'])} ${cusDateFormat(headerData.paymentDate, 'YYYY-MM-DD')}`
              : headerData.requestStatus || 'DRAFT',
          })(
            <CusSelect
              allowClear
              options={idpValueMap['SPCM.COST_REQUEST_STATUS']}
              disabled
              tip={
                requestStatus === 'PROCESSED'
                  ? intl
                      .get('spcm.costPayment.help.Processed.requestStatus')
                      .d(
                        '2022年7月或之前部分历史数据, 未实现付款状态的自动回写, 如有需要请联系财务同事查询'
                      )
                  : requestStatus === 'NETTING'
                  ? intl.get('spcm.costPayment.help.netting.requestStatus').d('付款申请已全额对冲')
                  : undefined
              }
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.requestDate`).d('申请日期')}>
          {getFieldDecorator('requestDate', {
            initialValue: dayjs(headerData.requestDate),
          })(<CusDatePicker disabled />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('companyOrgCode', {
            initialValue: headerData.companyOrgCode,
          })(<div />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('ouOrgCode', {
            initialValue: headerData.ouOrgCode,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.companyOrgName`).d('公司主体')}>
          {getFieldDecorator('companyOrgName', {
            initialValue: headerData.companyOrgName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.companyOrgName`).d('公司主体'),
                }),
              },
            ],
          })(
            <CusSelect
              allowClear
              options={idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY']}
              disabled={!defaultFlag}
              onChange={changeOrgName}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('requestEmployeeId', {
            initialValue: headerData.requestEmployeeId,
          })(<div />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('requestEmployeeNum', {
            initialValue: headerData.requestEmployeeNum,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.requestEmployeeName`).d('申请人')}>
          {getFieldDecorator('requestEmployeeName', {
            initialValue: headerData.requestEmployeeName,
          })(<CusInput disabled />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.expectPaymentDate`).d('期望付款日期')}>
          {getFieldDecorator('expectPaymentDate', {
            initialValue: headerData.expectPaymentDate
              ? dayjs(headerData.expectPaymentDate)
              : undefined,
          })(
            <CusDatePicker
              disabled={!defaultFlag || getFieldValue('pressLevel') === 'GENERAL'}
              tip={intl
                .get(`${prompt}.view.exprctPaymentDate.tooltip`)
                .d('若未填写期望付款日期，则按照紧急程度及历史付款时间计算默认期望付款日期。')}
              disabledDate={(current) => {
                return current && current < dayjs().startOf('day');
              }}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.pressLevel`).d('紧急程度')}>
          {getFieldDecorator('pressLevel', {
            initialValue: headerData.pressLevel || 'GENERAL',
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.pressLevel`).d('紧急程度'),
                }),
              },
            ],
          })(
            <CusSelect
              allowClear
              options={idpValueMap['SPCM.COST_PRESS_LEVEL']}
              disabled={!defaultFlag}
              onChange={this.changePressLevel}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.vendorCompanyNum`).d('供应商编码')}>
          {getFieldDecorator('vendorCompanyNum', {
            initialValue: headerData.vendorCompanyNum,
          })(<CusInput disabled />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('companyBankAccountId', {
            initialValue: headerData.companyBankAccountId,
          })(<div />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('vendorCompanyId', {
            initialValue: headerData.vendorCompanyId,
          })(<div />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('vendorCompanyName', {
            initialValue: headerData.vendorCompanyName,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.vendorCompanyName`).d('供应商名称')}>
          {getFieldDecorator('vendorCompany', {
            initialValue: headerData.vendorCompanyName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.vendorCompanyName`).d('供应商名称'),
                }),
              },
            ],
          })(
            <CusLov
              code="SSLM.COST_SUPPLIER_INFO_URL"
              disabled={!defaultFlag}
              onChange={(_, record) => changeVendor(record)}
              textField="vendorCompanyName"
              queryParams={() => {
                const customerPayFlag = getFieldValue('customerPayFlag');
                return { customerPayFlag: customerPayFlag };
              }}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.currencyCode`).d('发票币种')}>
          {getFieldDecorator('currencyCode', {
            initialValue: headerData.currencyCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.currencyCode`).d('发票币种'),
                }),
              },
            ],
          })(
            <CusLov
              textField="currencyCode"
              code="HPFM.CURRENCY"
              disabled={!defaultFlag}
              onChange={changeCurrencyCode}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.totalAmount`).d('原币总金额(含税)')}>
          {getFieldDecorator('totalAmount', {
            initialValue: getTotalAmount() || headerData.totalAmount || 0.0,
          })(<InputNumber allowThousandth disabled precision={2} />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.totalAmountHK`).d('港币总金额(含税)')}>
          {getFieldDecorator('totalAmountHK', {
            initialValue: headerData.totalAmountHK || 0.0,
          })(<InputNumber allowThousandth disabled precision={2} />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.originalReceived`).d('已接收原件')}>
          {getFieldDecorator('originalReceived', {
            initialValue: headerData.originalReceived,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.originalReceived`).d('已接收原件'),
                }),
              },
            ],
          })(
            <CusSelect
              allowClear
              disabled={!defaultFlag}
              options={idpValueMap['SPUC.COST_ORIGINAL_RECEIVED']}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`spcm.costPayment.view.detail.expenseCategory`).d('银行费用类别')}
        >
          {getFieldDecorator('expenseCategory', {
            initialValue: headerData.expenseCategory || 'Share',
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`spcm.costPayment.view.detail.expenseCategory`).d('银行费用类别'),
                }),
              },
            ],
          })(
            <CusSelect
              allowClear
              options={idpValueMap['SRSP.BANK_CHARGE_TYPE']}
              disabled={!defaultFlag}
              tip={intl
                .get('spcm.costPayment.view.expenseCategory.tooltip')
                .d('如银行费用由CMI方全部承担，須上传相关审批文件（如MSA协议）支撑本次付款。')}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`${prompt}.view.detail.sourceCode`).d('创建方式')}>
          {getFieldDecorator('sourceCode', {
            initialValue: headerData.sourceCode,
          })(
            <CusSelect allowClear options={idpValueMap['SRSP.PAYMENT_REQUEST_SOURCE']} disabled />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('payCompanyId', {
            initialValue: headerData.payCompanyId,
          })(<div />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('payCompanyName', {
            initialValue: headerData.payCompanyName,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.vendorPayFlag`).d('是否员工代付')}>
          {getFieldDecorator('vendorPayFlag', {
            initialValue: headerData.vendorPayFlag || '0',
          })(
            <Checkbox
              disabled={!defaultFlag}
              checkedValue="1"
              unCheckedValue="0"
              onChange={(e) => vendorPayFlagChange(e.target.checked)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('vendorSiteCode', {
            initialValue: headerData.vendorSiteCode,
          })(<div />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.payCompanyName`).d('代付员工名称')}>
          {getFieldDecorator('payCompanyNum', {
            initialValue: headerData.payCompanyNum,
            rules: [
              {
                required: getFieldValue('vendorPayFlag') === '1',
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.payCompanyName`).d('代付员工名称'),
                }),
              },
            ],
          })(
            <CusLov
              code="SSLM.COST_SUPPLIER_INFO_URL"
              queryParams={() => {
                const orgCode = getFieldValue('ouOrgCode');
                return { orgCode: orgCode };
              }}
              textField="payCompanyName"
              disabled={!defaultFlag || getFieldValue('vendorPayFlag') === '0'}
              onChange={(_, lovRecord) => this.changePayName(lovRecord)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('bankReturnFlag', {
            initialValue: headerData.bankReturnFlag,
          })(<Checkbox checkedValue="Y" unCheckedValue="N" disabled />)}
        </FormItem>
        <FormItem style={{ display: 'none' }}>
          {getFieldDecorator('importEbsFlag', {
            initialValue: headerData.importEbsFlag || '0',
          })(<Checkbox checkedValue="1" unCheckedValue="0" disabled />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.view.detail.chequePayFlag`).d('是否以支票支付')}>
          {getFieldDecorator('chequePayFlag', {
            initialValue: headerData.chequePayFlag || 'N',
          })(
            <Checkbox
              checkedValue="Y"
              unCheckedValue="N"
              disabled={
                !(
                  (defaultFlag ||
                    (getFieldValue('bankReturnFlag') === 'Y' && fileFlag) ||
                    bankModifyFlag)
                )
              }
              onChange={(e) => chequePayFlagChange(e.target.checked)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`spcm.costPayment.view.detail.multiCurrencyFlag`).d('多币种')}>
          {getFieldDecorator('multiCurrencyFlag', {
            initialValue: headerData.multiCurrencyFlag || 'N',
          })(
            <Checkbox
              disabled={!defaultFlag}
              checkedValue="Y"
              unCheckedValue="N"
              onChange={(e) => this.changeMultiCurrencyFlag(e.target.checked)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`spcm.costPayment.view.detail.actualPaidCurrency`).d('实际支付币种')}
        >
          {getFieldDecorator('actualPaidCurrency', {
            initialValue: headerData.actualPaidCurrency,
            rules: [
              {
                required: getFieldValue('multiCurrencyFlag') === 'Y',
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`spcm.costPayment.view.detail.actualPaidCurrency`)
                    .d('实际支付币种'),
                }),
              },
            ],
          })(
            <CusLov
              code="HPFM.CURRENCY"
              textValue={headerData.actualPaidCurrency}
              disabled={!defaultFlag || getFieldValue('multiCurrencyFlag') !== 'Y'}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get(`spcm.costPayment.view.detail.notNeedPaidFlag`).d('不需要支付')}>
          {getFieldDecorator('notNeedPaidFlag', {
            initialValue: headerData.notNeedPaidFlag || 'N',
          })(
            <Checkbox
              disabled={!defaultFlag}
              checkedValue="Y"
              unCheckedValue="N"
              onChange={(e) => this.changeNotNeedPaidFlag(e.target.checked)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get('spcm.costPayment.view.detail.commissionFlag').d('是否渠道商付款')}
        >
          {getFieldDecorator('commissionFlag', {
            initialValue: headerData.commissionFlag || 'N',
          })(
            <Checkbox
              disabled={
                !defaultFlag ||
                !isCommissionFlagEdit ||
                ['SPCM_COMMISSION_DATA'].includes(headerData.otherSource)
              }
              checkedValue="Y"
              unCheckedValue="N"
              onChange={(e) => commissionFlagChange(e.target.checked)}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`spcm.costPayment.view.detail.customerPayFlag`).d('是否对客户付款')}
        >
          {getFieldDecorator('customerPayFlag', {
            initialValue: headerData.customerPayFlag || 0,
          })(<Checkbox disabled checkedValue={1} unCheckedValue={0} />)}
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem label={intl.get('spcm.costPayment.view.detail.productType').d('业务类型')}>
          {getFieldDecorator('productType', {
            initialValue: typeof productType === 'string' ? productType.split(',') : [],
          })(<ProductTypeModal {...productTypeModalProps} />)}
        </FormItem>
      </Col>,
      <Col span={24}>
        <FormItem label={intl.get(`${prompt}.view.detail.requestTitle`).d('申请标题')}>
          {getFieldDecorator('requestTitle', {
            initialValue: headerData.requestTitle,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.view.detail.requestTitle`).d('申请标题'),
                }),
              },
            ],
          })(
            <CusInput
              className={styles['requestTitle-prefix']}
              prefix="COS-"
              disabled={!defaultFlag}
              showCharacter
              maxLength={170}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={24}>
        <FormItem label={intl.get(`${prompt}.view.detail.requestRemarks`).d('申请描述')}>
          {getFieldDecorator('requestRemarks', {
            initialValue: headerData.requestRemarks,
          })(
            <CusInput.TextArea
              disabled={!defaultFlag}
              rows={3}
              autoSize={{ minRows: 3, maxRows: 3 }}
              showCharacter
              maxLength={770}
            />
          )}
        </FormItem>
      </Col>,
      <Col span={24} style={{ display: headerData.otherRiskWarningMeaning ? 'block' : 'none'}}>
        <FormItem
          label={
            <span style={{ color: '#f54a45' }}>
              {intl.get('spcm.costPayment.view.detail.otherRiskWarning').d('其他风险提示')}
            </span>
          }
        >
          {getFieldDecorator('otherRiskWarningMeaning', {
            initialValue: headerData.otherRiskWarningMeaning,
          })(<OtherRiskWarning />)}
        </FormItem>
      </Col>,
    ];
  };

  render() {
    const { showMore } = this.state;

    const colSpan = screenWidth > largeScreenWidth ? 3 : 2;
    const Items = chunk(this.getItems(), colSpan);

    return (
      <>
        <div className="customize-form">
          <Form>
            {Items?.map((item, index) => {
              if (index < 2) {
                return <Row key={index}>{item}</Row>;
              }
              return <Row style={{ display: showMore ? 'block' : 'none' }} key={index}>{item}</Row>;
            })}
            <Col span={24}>
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
                <CusButton type="plain" onClick={() => this.setState({ showMore: !showMore })}>
                  {showMore
                    ? intl.get('hzero.common.button.packUp').d('收起')
                    : intl.get('hzero.common.button.unfold').d('展开')}
                </CusButton>
              </div>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}

export default HeadInfo;
