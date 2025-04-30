/*
 * @Description: 转售采购成品付款申请 - 面板 - 基本信息
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-24 10:52:05
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { Col, Form, Row, Checkbox } from 'antd';
import { connect } from 'dva';
import intl from 'utils/intl';
import moment from 'moment';
// import { Checkbox } from 'hzero-ui';
import { sum } from 'lodash';
import { numberRender } from 'utils/renderer';
import CusInputLov from '_cus_components/CusInputLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { queryEmployeeFlag, deleteBank } from '@/services/resaleRequestDetailService';
import styles from '../../index.less';

const FormItem = Form.Item;
@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = { pressLevel: '', showMore: false };

  /**
   * @name: 监听事件 - 申请人变更
   * @param {string} val 变更值
   * @param {object} record 值集数据
   */
  changeRequestEmployee = async (val, record) => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { infoForm, createFlag, costRequestId } = resaleRequestDetail;
    if (val && record.employeeId) {
      infoForm.current.setFieldsValue({
        requestEmployeeNum: record.employeeNum,
        requestEmployeeId: record.employeeId,
      });
      if (!createFlag) {
        const res = await queryEmployeeFlag(
          { requestEmployeeId: record.employeeId },
          costRequestId
        );
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { paymentOwnerEditFlag: res },
        });
      }
    }
  };

  /**
   * @name: 监听事件 - 供应商变更
   * @param {string} val 变更值
   * @param {object} record 值集数据
   */
  changeVendorCompany = (val, record) => {
    const { dispatch, resaleRequestDetail, handleBank } = this.props;
    const { bankDataSource, infoForm, createFlag } = resaleRequestDetail;
    const { bankInfoId } = bankDataSource[0] || {};
    infoForm.current.setFieldsValue({
      vendorCompanyNum: val ? record.vendorNum : null,
    });
    // 清除银行信息
    if (bankInfoId && !createFlag) {
      const res = deleteBank(bankInfoId);
      if (res) {
        handleBank();
      }
    } else {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { bankDataSource: [] },
      });
    }
  };

  /**
   * @name: 监听事件 - 紧急程度变更
   * @param {string} val 变更值
   */
  changePressLevel = (val) => {
    const { infoForm, headerData } = this.props.resaleRequestDetail;
    const { requestStatus } = headerData.costPaymentRequest || {};
    this.setState({ pressLevel: val });
    if ((['DRAFT'].includes(requestStatus) || !requestStatus) && ['GENERAL'].includes(val)) {
      infoForm.current.setFieldsValue({
        expectPaymentDate: null,
      });
    }
  };

  /**
   * @name: 监听事件 - 多币种变更
   * @param {string} val 变更值
   */
  changeMultiCurrencyFlag = (val) => {
    const { infoForm } = this.props.resaleRequestDetail;
    infoForm.current.setFieldsValue({
      multiCurrencyFlag: val.target.checked ? 'Y' : 'N',
    });
    if (!val.target.checked) {
      infoForm.current.setFieldsValue({
        actualPaidCurrency: null,
      });
    }
    this.setState({});
  };

  render() {
    const {
      createFlag,
      changeCompanyName,
      changeCurrencyCode,
      resaleRequestDetail,
      goAccruedRisk,
      dispatch,
    } = this.props;
    const {
      infoForm,
      editable,
      isOperator,
      viewOnly,
      lovData,
      hasSubmitButton,
      blDataSource,
      currentNodeName,
      headerData,
      paymentOwnerEditFlag,
      userEmployeeId,
      riskStatus,
      paymentRiskStatus,
      approvalRemind,
      approvalRemindModalContent,
    } = resaleRequestDetail;
    const { pressLevel, showMore } = this.state;
    const { getFieldValue } = infoForm.current || {};
    const disabledFlag = !editable || !isOperator || viewOnly || !hasSubmitButton;
    const {
      bankReturnFlag,
      requestStatus,
      paymentOwnerFlag,
      requestDepartment,
      transferOrderFlag,
      riskWarningMeaning,
      otherRiskWarningMeaning,
    } = headerData.costPaymentRequest || {};

    const otherRiskWarning = otherRiskWarningMeaning && otherRiskWarningMeaning !== ';';

    const transferOrderFlagCanEdit = (lovData['SRSP.PAYMENT_INFORM_EXCLUDE_DEPARTMENT'] || []).some(
      (i) => {
        return i.value === requestDepartment;
      }
    );

    const fieldArray = [
      {
        name: 'requestNum',
        label: intl.get(`spcm.paymentRequest.view.detail.requestNum`).d('申请编号'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'requestStatus',
        label: intl.get(`spcm.paymentRequest.view.detail.requestStatus`).d('申请状态'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'requestDate',
        label: intl.get(`spcm.paymentRequest.view.detail.requestDate`).d('申请日期'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'requestEmployeeName',
        label: intl.get(`spcm.paymentRequest.view.detail.requestEmployeeName`).d('申请人'),
        required: true,
        render: () => (
          <CusInputLov
            disabled={disabledFlag && !createFlag}
            code="SPUC.RESALE_REQUEST_EMPLOYEE"
            lovOptions={{ valueField: 'name', displayField: 'name' }}
            textValue={getFieldValue && getFieldValue('requestEmployeeName')}
            onChange={this.changeRequestEmployee}
            tip={intl
              .get('spcm.paymentRequest.view.requestEmployeeName.tooltip')
              .d('针对付款本地化线路，请区域起草人选择并会签总部申请人')}
          />
        ),
      },
      {
        name: 'draftEmployeeName',
        label: intl.get(`spcm.paymentRequest.view.detail.draftEmployeeName`).d('起草人'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'companyOrgCode',
        label: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('公司主体'),
        required: true,
        render: () => (
          <CusSelect
            allowClear
            options={lovData['VP.PRICE_CONTRACT_SIGN_ENTITY']}
            disabled={disabledFlag && !createFlag}
            onChange={(value) => {
              if (value) {
                changeCompanyName(value);
              }
            }}
          />
        ),
      },
      {
        name: 'vendorCompanyNum',
        label: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyNum`).d('供应商编号'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'vendorCompanyName',
        label: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyName`).d('供应商名称'),
        required: true,
        render: () => (
          <CusInputLov
            disabled={disabledFlag && !createFlag}
            code="SSLM.COST_SUPPLIER_INFO_URL"
            lovOptions={{ displayField: 'vendorName', valueField: 'vendorName' }}
            textValue={getFieldValue && getFieldValue('vendorCompanyName')}
            onChange={this.changeVendorCompany}
          />
        ),
      },
      {
        name: 'pressLevel',
        label: intl.get(`spcm.paymentRequest.view.detail.pressLevel`).d('紧急程度'),
        required: true,
        render: () => (
          <CusSelect
            allowClear
            options={lovData['SPCM.COST_PRESS_LEVEL']}
            disabled={disabledFlag && !createFlag}
            onChange={this.changePressLevel}
          />
        ),
      },
      {
        name: 'currencyCode',
        label: intl.get(`spcm.paymentRequest.view.detail.currencyCode`).d('发票币种'),
        required: true,
        render: () => (
          <CusInputLov
            disabled={disabledFlag && !createFlag}
            code="SMDM.CURRENCY"
            lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
            textValue={getFieldValue && getFieldValue('currencyCode')}
            onChange={(value) => {
              if (value) {
                changeCurrencyCode(value);
              }
            }}
          />
        ),
      },
      {
        name: 'totalAmount',
        label: intl.get(`spcm.paymentRequest.view.detail.totalAmount`).d('原币总金额(含税)'),
        render: () => (
          <CusInput
            disabled
            defaultValue={numberRender(sum(blDataSource.map((item) => item.invoiceAmount)), 2)}
          />
        ),
      },
      {
        name: 'expectPaymentDate',
        label: intl.get(`spcm.paymentRequest.view.detail.expectPaymentDate`).d('期望付款日期'),
        render: () => (
          <CusDatePicker
            disabled={
              (disabledFlag && !createFlag) ||
              (pressLevel !== ''
                ? pressLevel === 'GENERAL'
                : getFieldValue && getFieldValue('pressLevel') === 'GENERAL')
            }
            placeholder=""
            disabledDate={(date) => {
              const newDate = moment().format('YYYYMMDD');
              const currentDate = moment(new Date(date)).format('YYYYMMDD');
              return currentDate < newDate;
            }}
          />
        ),
      },
      {
        name: 'conversionRate',
        label: intl.get(`spcm.paymentRequest.view.detail.conversionRate`).d('汇率(港币汇率)'),
        render: () => <CusInput disabled />,
      },
      {
        name: 'totalAmountHKD',
        label: intl.get(`spcm.paymentRequest.view.detail.totalAmountHKD`).d('港币总金额(含税)'),
        render: () => (
          <CusInput
            disabled
            defaultValue={numberRender(
              sum(blDataSource.map((item) => item.invoiceAmount)) *
                (getFieldValue ? getFieldValue('conversionRate') || 1 : 1),
              2
            )}
          />
        ),
      },
      {
        name: 'originalReceived',
        label: intl.get(`spcm.costPayment.view.detail.originalReceived`).d('是否已接收原件'),
        required: true,
        render: () => (
          <CusSelect
            allowClear
            options={lovData['SPUC.COST_ORIGINAL_RECEIVED']}
            disabled={disabledFlag && !createFlag}
          />
        ),
      },
      {
        name: 'chequePayFlag',
        label: intl.get(`spcm.paymentRequest.view.detail.chequePayFlag`).d('是否以支票支付'),
        render: () => (
          <Checkbox
            disabled={
              !(
                (editable && !viewOnly && hasSubmitButton) ||
                (currentNodeName.includes('起草人补充') && isOperator && bankReturnFlag === 'Y') ||
                (currentNodeName.includes('起草人银行修改') && isOperator) ||
                createFlag
              )
            }
            checked={getFieldValue ? getFieldValue('chequePayFlag') === 'Y' : false}
            onChange={(res) => {
              infoForm.current.setFieldsValue({
                chequePayFlag: res.target.checked ? 'Y' : 'N',
              });
              this.setState({});
              if (res.target.checked) {
                CusModal.info({
                  content: intl
                    .get(`${prompt}.view.chequePayFlag.info`)
                    .d('请以信函形式提供付款指示，并在公司信笺下盖章签名。'),
                });
                return true;
              }
            }}
          />
        ),
      },
      {
        name: 'sourceCode',
        label: intl.get(`spcm.paymentRequest.view.detail.sourceCode`).d('创建方式'),
        render: () => <CusSelect options={lovData['SRSP.PAYMENT_REQUEST_SOURCE']} disabled />,
      },
      {
        name: 'expenseCategory',
        label: intl.get(`spcm.paymentRequest.view.detail.expenseCategory`).d('银行费用类别'),
        required: true,
        render: () => (
          <CusSelect
            allowClear
            options={lovData['SRSP.BANK_CHARGE_TYPE']}
            disabled={disabledFlag && !createFlag}
            tip={intl
              .get('spcm.paymentRequest.view.expenseCategory.tooltip')
              .d('如银行费用由CMI方全部承担，須上传相关审批文件（如MSA协议）支撑本次付款。')}
          />
        ),
      },
      {
        name: 'multiCurrencyFlag',
        label: intl.get(`spcm.paymentRequest.view.detail.multiCurrencyFlag`).d('多币种'),
        render: () => (
          <Checkbox
            disabled={disabledFlag && !createFlag}
            checked={getFieldValue ? getFieldValue('multiCurrencyFlag') === 'Y' : false}
            onChange={this.changeMultiCurrencyFlag}
          />
        ),
      },
      {
        name: 'actualPaidCurrency',
        label: intl.get(`spcm.paymentRequest.view.detail.actualPaidCurrency`).d('实际支付币种'),
        required: getFieldValue ? getFieldValue('multiCurrencyFlag') === 'Y' : false,
        render: () => (
          <CusInputLov
            disabled={
              (disabledFlag && !createFlag) ||
              !(getFieldValue ? getFieldValue('multiCurrencyFlag') === 'Y' : false)
            }
            code="SMDM.CURRENCY"
            lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
            textValue={getFieldValue && getFieldValue('actualPaidCurrency')}
          />
        ),
      },
      {
        name: 'notNeedPaidFlag',
        label: intl.get(`spcm.paymentRequest.view.detail.notNeedPaidFlag`).d('不需要支付'),
        render: () => (
          <Checkbox
            disabled={disabledFlag && !createFlag}
            checked={getFieldValue ? getFieldValue('notNeedPaidFlag') === 'Y' : false}
            onChange={(res) => {
              infoForm.current.setFieldsValue({
                notNeedPaidFlag: res.target.checked ? 'Y' : 'N',
              });
              this.setState({});
              if (res.target.checked) {
                CusModal.info({
                  content: intl
                    .get(`${prompt}.view.notNeedPaidFlag.info`)
                    .d(
                      '若勾选【不需要支付】，则表示财务用户无需对此付款申请下的发票进行付款，请谨慎勾选！'
                    ),
                });
              }
            }}
          />
        ),
      },
      {
        name: 'paymentOwnerName',
        label: intl.get(`spcm.paymentRequest.view.detail.paymentOwnerName`).d('下沉付款责任人'),
        render: () => (
          <CusInputLov
            disabled={
              paymentOwnerEditFlag === null
                ? !(editable && hasSubmitButton) ||
                  !(paymentOwnerFlag && ['DRAFT'].includes(requestStatus))
                : !paymentOwnerEditFlag
            }
            code="SPUC.RESALE_REQUEST_EMPLOYEE"
            lovOptions={{ valueField: 'name', displayField: 'name' }}
            textValue={getFieldValue && getFieldValue('paymentOwnerName')}
            onChange={(value) => {
              if (value) {
                changeCurrencyCode(value);
              }
            }}
          />
        ),
      },
      {
        name: 'needAutoCopy',
        label: intl.get(`spcm.paymentRequest.view.detail.needAutoCopy`).d('是否需要自动复制'),
        render: () => (
          <Checkbox
            disabled={
              (disabledFlag && !createFlag) || headerData.needAutoCopyPermissionFlag === 'N'
            }
            checked={getFieldValue ? getFieldValue('needAutoCopy') === 'Y' : false}
            onChange={(res) => {
              infoForm.current.setFieldsValue({
                needAutoCopy: res.target.checked ? 'Y' : 'N',
              });
              this.setState({});
            }}
          />
        ),
      },
      {
        name: 'productType',
        label: intl.get('spcm.paymentRequest.view.detail.productType').d('业务类型'),
        render: () => (
          <a
            onClick={() =>
              dispatch({
                type: 'resaleRequestDetail/handleSetState',
                payload: { productTypeModalVisible: true },
              })
            }
          >
            {intl.get('spcm.paymentRequest.view.productType').d('查看业务类型')}
          </a>
        ),
      },
      {
        name: 'transferOrderFlag',
        label: intl.get(`spcm.paymentRequest.view.detail.transferOrderFlag`).d('是否转网订单'),
        render: () => (
          <Checkbox
            disabled={
              (disabledFlag && !createFlag) ||
              !transferOrderFlagCanEdit ||
              userEmployeeId !== (getFieldValue && getFieldValue('draftEmployeeId'))
            }
            checked={getFieldValue ? getFieldValue('transferOrderFlag') === 'Y' : false}
            onChange={(res) => {
              infoForm.current.setFieldsValue({
                transferOrderFlag: res.target.checked ? 'Y' : 'N',
              });
              this.setState({});
            }}
          />
        ),
      },
      {
        name: 'requestTitle',
        label: intl.get(`spcm.paymentRequest.view.detail.requestTitle`).d('申请标题'),
        required: true,
        render: () => (
          <CusInput
            className={styles['requestTitle-prefix']}
            prefix="COS-"
            disabled={disabledFlag && !createFlag}
            showCharacter
            maxLength={170}
          />
        ),
      },
      {
        name: 'requestRemarks',
        label: intl.get(`spcm.paymentRequest.view.detail.requestRemarks`).d('申请描述'),
        render: () => (
          <CusInput.TextArea
            disabled={disabledFlag && !createFlag}
            rows={3}
            autoSize={{ minRows: 3, maxRows: 3 }}
            showCharacter
            maxLength={770}
          />
        ),
      },
      {
        name: 'riskWarningMeaning',
        label: (
          <span style={{ color: '#f54a45' }}>
            {intl.get(`spcm.paymentRequest.Risk.POmodified`).d('PO变更提醒')}
          </span>
        ),
        render: (val) => (
          <div
            style={{
              borderRadius: 4,
              border: '0.01rem solid rgba(0, 0, 0, 0.2)',
              overflowY: 'scroll',
              height: 90,
              paddingLeft: 8,
              color: '#f54a45',
              fontSize: 14,
              lineHeight: '28px',
            }}
          >
            {val?.split(';').map((list, num) => (
              <div style={{ lineHeight: '28px' }}>{`${num + 1}.${list}`}</div>
            ))}
          </div>
        ),
      },
      {
        name: 'otherRiskWarningMeaning',
        label: (
          <span style={{ color: '#f54a45' }}>
            {intl.get(`spcm.paymentRequest.view.detail.riskWarning`).d('风险提示')}
          </span>
        ),
        render: (val) => {
          let array = [];
          const data = val?.split(';').filter((item) => item.trim().length > 0) || [];
          if (transferOrderFlag !== 'Y') {
            array = data;
          }
          if (paymentRiskStatus === 1) {
            array.push(
              intl
                .get(`srsp.riskmanagement.Risk.PaymentArrangeRiskTips`)
                .d('此项目的付款安排为“客户先付CMI款,CMI后付供应商”，请及时收款后再发起付款！')
            );
          }
          if (riskStatus === 1) {
            array.push(
              <>
                <span>
                  {intl
                    .get(`srsp.riskmanagement.Risk.RiskPrompt`)
                    .d('此参与方或电路编号存在多项付款风险，谨慎付款。')}
                </span>
                <span
                  onClick={goAccruedRisk}
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {intl.get(`srsp.riskmanagement.Risk.Risklink`).d('点击查看明细')}
                </span>
              </>
            );
          }
          return (
            <div
              style={{
                borderRadius: 4,
                border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                overflowY: 'scroll',
                height: 90,
                paddingLeft: 8,
                color: '#f54a45',
                fontSize: 14,
                lineHeight: '28px',
              }}
            >
              {data.map((list, num) => (
                <div style={{ lineHeight: '28px' }}>
                  {`${num + 1}`} {list}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        name: 'approvalRemind',
        label: (
          <span style={{ color: '#f54a45' }}>
            {intl.get(`spcm.paymentRequest.view.detail.approvalRemind`).d('审批提示')}
          </span>
        ),
        render: () => <span>{approvalRemindModalContent}</span>,
      },
    ];

    const fieldData = {};
    for (let i = 0; i < fieldArray.length; i++) {
      const list = fieldArray[i];
      fieldData[list.name] = (
        <FormItem
          label={list.label}
          name={list.name}
          rules={
            list.required && [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', { name: list.label }),
              },
            ]
          }
        >
          {list.render(getFieldValue && getFieldValue(list.name))}
        </FormItem>
      );
    }

    return (
      <Form ref={infoForm} className="customize-form">
        <Row>
          <Col span={8}>{fieldData.requestNum}</Col>
          <Col span={8}>{fieldData.requestStatus}</Col>
          <Col span={8}>{fieldData.requestDate}</Col>
        </Row>
        <Row>
          <Col span={8}>{fieldData.requestEmployeeName}</Col>
          <Col span={8}>{fieldData.draftEmployeeName}</Col>
          <Col span={8}>{fieldData.companyOrgCode}</Col>
        </Row>
        {showMore && (
          <>
            <Row>
              <Col span={8}>{fieldData.vendorCompanyNum}</Col>
              <Col span={8}>{fieldData.vendorCompanyName}</Col>
              <Col span={8}>{fieldData.pressLevel}</Col>
            </Row>
            <Row>
              <Col span={8}>{fieldData.currencyCode}</Col>
              <Col span={8}>{fieldData.totalAmount}</Col>
              <Col span={8}>{fieldData.expectPaymentDate}</Col>
            </Row>
            <Row>
              <Col span={8}>{fieldData.conversionRate}</Col>
              <Col span={8}>{fieldData.totalAmountHKD}</Col>
              <Col span={8}>{fieldData.originalReceived}</Col>
            </Row>
            <Row>
              <Col span={8}>{fieldData.chequePayFlag}</Col>
              <Col span={8}>{fieldData.sourceCode}</Col>
              <Col span={8}>{fieldData.expenseCategory}</Col>
            </Row>
            <Row>
              <Col span={8}>{fieldData.multiCurrencyFlag}</Col>
              <Col span={8}>{fieldData.actualPaidCurrency}</Col>
              <Col span={8}>{fieldData.notNeedPaidFlag}</Col>
            </Row>
            <Row>
              <Col span={8}>{fieldData.paymentOwnerName}</Col>
              <Col span={8}>{fieldData.needAutoCopy}</Col>
              {!createFlag && <Col span={8}>{fieldData.productType}</Col>}
            </Row>
            {!createFlag && (
              <Row>
                <Col span={24}>{fieldData.transferOrderFlag}</Col>
              </Row>
            )}
            <Row>
              <Col span={24}>{fieldData.requestTitle}</Col>
            </Row>
            <Row>
              <Col span={24}>{fieldData.requestRemarks}</Col>
            </Row>
            {riskWarningMeaning && transferOrderFlag !== 'Y' && (
              <Row>
                <Col span={24}>{fieldData.riskWarningMeaning}</Col>
              </Row>
            )}
            {(otherRiskWarning || riskStatus === 1) && (
              <Row>
                <Col span={24}>{fieldData.otherRiskWarningMeaning}</Col>
              </Row>
            )}
            {approvalRemind?.haveApprovalRemind === 'Y' && (
              <Row>
                <Col span={24}>{fieldData.approvalRemind}</Col>
              </Row>
            )}
          </>
        )}

        <Row>
          <Col span={24}>
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
              <CusButton type="plain" onClick={() => this.setState({ showMore: !showMore })}>
                {showMore
                  ? intl.get('hzero.common.button.packUp').d('收起')
                  : intl.get('hzero.common.button.unfold').d('展开')}
              </CusButton>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }
}
