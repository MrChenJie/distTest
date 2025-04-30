/**
 * @Description: 账单明细
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber, Checkbox } from 'hzero-ui';
import { Col, Row } from 'antd';
import { tableScrollWidth, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { connect } from 'dva';
import { dateRender, numberRender } from 'utils/renderer';
import { tooltipRender, labelTip, yesOrNoRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import ChannelCommission from '../components/ChannleCommissionData';
import CoaInfo from './components/CoaInfo';
import InvoiceSplit from './components/InvoiceSplit';
import OperateHistory from './components/OperateHistory';
import BatchModifyCoa from './components/BatchModifyCoa';
import BatchServiceDate from './components/BatchServiceDate';

const { ERP_HOST } = process.env;
const currentUser = getCurrentUser();
const ROW_KEY = 'costDetailLineId';
const prompt = 'spcm.costPayment';

@connect(({ receiptProgress, loading }) => ({
  receiptProgress,
  deleteBillLineLoading: loading.effects['receiptProgress/deleteBillLine'],
}))
class BillDetail extends Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      isChange: false, // 当前数据是否变更过
    };
  }

  /**
   * 成本项目类型 修改
   * 判断当前行的 发票类型【costInvoiceType】是否等于其他所有行，不相等弹出提示信息
   * 大类【costBigCategory】等于 Prepayment(預付款)时，需要提示信息
   **/
  @Bind()
  changeCategory(category, record) {
    const { form, dataSource } = this.props;
    form.setFieldsValue({
      vendorSiteCode: undefined,
    });
    // 筛选其他存在发票类型的 行数据
    const data = dataSource.filter((item) => {
      return (
        item['costInvoiceType'] !== undefined && item.costDetailLineId !== record.costDetailLineId
      );
    });
    // 所有行的发票类型是否都等于选择的发票类型
    const flag = data.every((item) => {
      return item['costInvoiceType'] === category?.invoiceType;
    });
    if (!flag) {
      CusModal.warning({
        content: intl
          .get(`${prompt}.warning.lineData.typeNeedAgreement`)
          .d('业务运营成本付款申请单上的发票类型需一致，请检查成本项目类型是否正确！'),
      });
      return false;
    }

    if (!category) {
      // 为空 置空其他值
      Object.assign(record, {
        vendorSiteCode: undefined,
        costBigCategory: undefined,
        costSmallCategory: undefined,
        costProductCategoryCode: undefined,
        costProductCategoryName: undefined,
        costInvoiceType: undefined,
        coaAccountId: undefined,
        isCircuitIdRequired: undefined,
        coaMappingId: undefined,
        coaMapAttribute3: undefined,
      });
      record.$form.setFieldsValue({
        costBigCategory: undefined,
        costSmallCategory: undefined,
        costProductCategoryName: undefined,
        isCircuitIdRequired: undefined,
        coaMapAttribute3: undefined,
      });
      return false;
    }
    Object.assign(record, {
      vendorSiteCode: category.siteCode,
      costBigCategory: category.costBigCategory,
      costSmallCategory: category.costSmallCategory,
      costProductCategoryCode: category.productTypeEn,
      costProductCategoryName: category.costProductCategory,
      costInvoiceType: category.invoiceType,
      coaAccountId: undefined,
      isCircuitIdRequired: category.isCircuitIdRequired,
      coaMappingId: category.coaMappingId,
      coaMapAttribute3: category.attribute3,
    });
    record.$form.setFieldsValue({
      costBigCategory: category.costBigCategory,
      costSmallCategory: category.costSmallCategory,
      costProductCategoryName: category.costProductCategory,
      isCircuitIdRequired: category.isCircuitIdRequired,
      coaMapAttribute3: category.attribute3,
    });
    if (+category.attribute3 === 0) {
      record.$form.setFieldsValue({
        expectRecycleDate: undefined,
      });
    }
    if (category.costBigCategory === 'Prepayment(預付款)') {
      CusModal.warning({
        content: intl
          .get(`${prompt}.warning.detail.line.costProductCategoryName`)
          .d(
            '只适用于尚未收到正式发票或增值税发票使用, 在收到正式发票或增值税发票后请用户在转售类付款申请中提交付款申请并附上此预付款申请作参考'
          ),
      });
    }
  }

  /**
   * 修改服务开始时间结束时间时要将 是否待摊重置为0 待摊开始时间待摊结束时间重置为空 待摊金额重置为0
   **/
  @Bind
  serviceDateChange(field, value, record) {
    record.$form.setFieldsValue({
      pendingApportionFlag: undefined,
      apportionStartDate: undefined,
      apportionEndDate: undefined,
      pendingApportionAmount: undefined,
    });
    Object.assign(record, {
      [field]: value,
      pendingApportionFlag: undefined,
      apportionStartDate: undefined,
      apportionEndDate: undefined,
      pendingApportionAmount: undefined,
    });
  }

  // 成本主体 选择修改
  @Bind
  changeOrg(value, record) {
    const { meaning } = value;
    record.$form.setFieldsValue({
      invoiceTaxAmount: undefined,
    });
    Object.assign(record, {
      lineCompanyOrgName: meaning ? meaning : undefined,
      coaAccountId: undefined,
    });
  }

  // 合同编号 选择
  @Bind
  changeContractNo(contrac, record) {
    if (contrac) {
      Object.assign(record, {
        contractId: contrac.contractId,
        contractNo: contrac.contractNo,
        contractName: contrac.contractName,
        contractAmount: contrac.contractAmount,
      });
    } else {
      Object.assign(record, {
        contractId: undefined,
        contractNo: undefined,
        contractName: undefined,
        contractAmount: undefined,
      });
    }
  }

  /**
   * 是否待摊为是时，待摊时间必填，待摊金额可输入，
   *        为否时，将待摊时间，待摊金额置空且不可输入
   * **/
  @Bind
  pendingApportionFlagChange(value, record) {
    if (value === '0') {
      record.$form.setFieldsValue({
        apportionStartDate: undefined,
        apportionEndDate: undefined,
        pendingApportionAmount: undefined,
      });
      Object.assign(record, {
        apportionStartDate: undefined,
        apportionEndDate: undefined,
        pendingApportionAmount: undefined,
      });
    }
  }

  /**
   * 待摊时间修改时，将待摊金额置空
   * @param record
   */
  @Bind
  apportionDateChange(record) {
    record.$form.setFieldsValue({
      pendingApportionAmount: undefined,
    });
  }

  /**
   * 待摊金额 不因大于 发票行金额（原币不含税）
   **/
  @Bind
  pendingApportionAmountChange(record) {
    const excludingTaxAmount = record['excludingTaxAmount'] || 0;
    const pendingApportionAmount = record.$form.getFieldValue('pendingApportionAmount') || 0;
    if (pendingApportionAmount > excludingTaxAmount) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.excluding-pending`)
          .d('待摊金额不能大于发票行金额（原币不含税）'),
      });
      record.$form.setFieldsValue({
        pendingApportionAmount: undefined,
      });
    }
  }

  @Bind
  changeLineAmount(value, record) {
    const { precision, onUpdateAmount = (e) => e } = this.props;
    // 发票行金额(原币含税) - 发票税额(原币) = 发票行金额(原币不含税)
    let lineAmount = value;
    const oldValue = record.lineAmount;
    const invoiceTaxAmount =
      record.$form?.getFieldValue('invoiceTaxAmount') || record['invoiceTaxAmount'] || 0;
    if (lineAmount > 0 && invoiceTaxAmount > value) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.large`)
          .d('当发票行含税金额大于0时，发票税额(原币)不应大于发票行金额(原币含税)'),
      });
      record.$form.setFieldsValue({
        lineAmount: oldValue,
      });
      lineAmount = oldValue;
    } else if (lineAmount < 0 && invoiceTaxAmount < value) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.small`)
          .d('当发票行含税金额小于0时，发票税额(原币)不应小于发票行金额(原币含税)'),
      });
      record.$form.setFieldsValue({
        lineAmount: oldValue,
      });
      lineAmount = oldValue;
    }
    const excludingTaxAmount = Number(
      numberRender(lineAmount - invoiceTaxAmount, precision, false)
    );
    Object.assign(record, {
      excludingTaxAmount: excludingTaxAmount,
      lineAmount: value,
    });
    this.setState({});
    // 统计发票明细行上的 发票行金额 到发票头
    onUpdateAmount(record, precision, 'lineAmount', 'invoiceAmount');
  }

  @Bind
  changeInvoiceTaxAmount(value, record) {
    const { precision, onUpdateAmount = (e) => e } = this.props;
    // 发票行金额(原币含税) - 发票税额(原币) = 发票行金额(原币不含税)
    const lineAmount = record.$form?.getFieldValue('lineAmount') || 0;
    let invoiceTaxAmount = value;
    const oldValue = record.invoiceTaxAmount;
    if (lineAmount > 0 && invoiceTaxAmount > lineAmount) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.large`)
          .d('当发票行含税金额大于0时，发票税额(原币)不应大于发票行金额(原币含税)'),
      });
      record.$form.setFieldsValue({
        invoiceTaxAmount: oldValue,
      });
      invoiceTaxAmount = oldValue;
    } else if (lineAmount < 0 && invoiceTaxAmount < lineAmount) {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.small`)
          .d('当发票行含税金额小于0时，发票税额(原币)不应小于发票行金额(原币含税)'),
      });
      record.$form.setFieldsValue({
        invoiceTaxAmount: oldValue,
      });
      invoiceTaxAmount = oldValue;
    }
    const excludingTaxAmount = Number(
      numberRender(lineAmount - invoiceTaxAmount, precision, false)
    );
    Object.assign(record, {
      excludingTaxAmount: excludingTaxAmount,
      invoiceTaxAmount: value,
    });
    this.setState({});
    // 统计发票明细行上的 发票税额 到发票头
    onUpdateAmount(record, precision, 'invoiceTaxAmount', 'invoiceTaxAmount');
  }

  @Bind
  handleEditTablePageChange(page) {
    const { onChange = (e) => e } = this.props;
    const { isChange } = this.state;
    if (isChange) {
      CusModal.confirm({
        content: intl.get(`${prompt}.message.pageChange.tip`).d('有未保存的数据，是否继续？'),
        onOk: () => {
          onChange(page);
        },
      });
    } else {
      onChange(page);
    }
  }

  @Bind
  setDataHasChange(boolean) {
    this.setState({
      isChange: boolean,
    });
  }

  render() {
    const {
      form,
      dataSource = [],
      pagination = {},
      idpValueMap = {},
      deleteBillLineLoading = false,
      onCreate = (e) => e,
      onCopy = (e) => e,
      onDelete = (e) => e,
      selectChannelCommission = (e) => e,
      handleChannelCommissionOk = (e) => e,
      onSaveCoa = (e) => e,
      onGetBillList = (e) => e,
      defaultFlag,
      isCommissionFlag,
      financeFlag,
      currentOperatorFlag,
      fileFlag,
      archiveFlag,
      requestStatus,
      currencyCode,
      precision,
    } = this.props;
    const { selectedRowKeys, selectedRows, isChange } = this.state;

    const ouOrgCode = form.getFieldValue('ouOrgCode');
    const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');

    const columns = [
      {
        title: 'COA',
        dataIndex: 'COA',
        fixed: 'left',
        hidden:
          !financeFlag &&
          !currentOperatorFlag &&
          !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(requestStatus),
        width: 70,
        render: (_, record) => {
          return (
            <CoaInfo
              onSaveCoa={onSaveCoa}
              billLineData={record}
              financeFlag={financeFlag}
            />
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.coaModifyRecord`).d('COA操作记录'),
        dataIndex: 'coaModifyRecord',
        fixed: 'left',
        hidden:
          !financeFlag &&
          !currentOperatorFlag &&
          !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(requestStatus),
        width: 120,
        render: (_, record) => {
          return <OperateHistory costDetailLineId={record.costDetailLineId} />;
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.pendingApportion.preview`).d('待摊预览'),
        fixed: 'left',
        dataIndex: 'preview',
        hidden:
          !financeFlag &&
          !currentOperatorFlag &&
          !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(requestStatus),
        width: 120,
        render: (_, record) => {
          return <InvoiceSplit currencyCode={currencyCode} billLineData={record} />;
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.line.costBigCategory`).d('成本大类'),
        dataIndex: 'costBigCategory',
        width: 170,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.costSmallCategory`).d('成本小类'),
        dataIndex: 'costSmallCategory',
        width: 170,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.costProductCategoryCode`).d('成本项目类型'),
        dataIndex: 'costProductCategoryName',
        width: 170,
        required: true,
        render: (text, record) =>
          defaultFlag || fileFlag ? (
            <>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator(`costProductCategoryName`, {
                  initialValue: record.costProductCategoryName,
                })(<div />)}
              </Form.Item>
              <Form.Item>
                {record.$form.getFieldDecorator(`coaMappingId`, {
                  initialValue: record.coaMappingId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${prompt}.view.detail.line.costProductCategoryCode`)
                          .d('成本项目类型'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    textField="costProductCategoryName"
                    code="SPCM.COST_COA_MAPPING"
                    queryParams={() => {
                      const customerPayFlag = form.getFieldValue('customerPayFlag');
                      return { attribute2: customerPayFlag };
                    }}
                    onChange={(_, lovRecord) => this.changeCategory(lovRecord, record)}
                  />
                )}
              </Form.Item>
            </>
          ) : (
            text
          ),
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.line.serviceStartDate`).d('发票服务开始日期'),
          tip: intl
            .get(`${prompt}.view.detail.line.serviceStartDate.help`)
            .d('请选择实际发票服务开始日期'),
        }),
        dataIndex: 'serviceStartDate',
        width: 170,
        required: true,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`serviceStartDate`, {
                initialValue: record.serviceStartDate ? dayjs(record.serviceStartDate) : undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.serviceStartDate`)
                        .d('发票服务开始日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  disabledDate={(currentDate) => {
                    const endDate = record.$form.getFieldValue(`serviceEndDate`);
                    if (endDate && dayjs(endDate).isValid()) {
                      return currentDate.isAfter(endDate);
                    }
                  }}
                  onChange={(value) => this.serviceDateChange('serviceStartDate', value, record)}
                />
              )}
            </Form.Item>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.detail.line.serviceEndDate`).d('发票服务结束日期'),
          tip: intl
            .get(`${prompt}.view.detail.line.serviceEndDate.help`)
            .d('请选择实际发票服务结束日期'),
        }),
        dataIndex: 'serviceEndDate',
        width: 170,
        required: true,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`serviceEndDate`, {
                initialValue: record.serviceEndDate ? dayjs(record.serviceEndDate) : undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.serviceEndDate`)
                        .d('发票服务结束日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  disabledDate={(currentDate) => {
                    const startDate = record.$form.getFieldValue(`serviceStartDate`);
                    if (startDate && dayjs(startDate).isValid()) {
                      return currentDate.isBefore(startDate);
                    }
                  }}
                  onChange={(value) => this.serviceDateChange('serviceEndDate', value, record)}
                />
              )}
            </Form.Item>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.lineAmount`).d('发票行金额(原币含税)'),
        dataIndex: 'lineAmount',
        width: 180,
        required: true,
        render: (text, record) =>
          defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`lineAmount`, {
                initialValue: record.lineAmount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.lineAmount`)
                        .d('发票行金额(原币含税)'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  step={0.01}
                  precision={precision}
                  className="cus-input-money"
                  onBlur={(e) => this.changeLineAmount(+e.target.value, record)}
                />
              )}
            </Form.Item>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(text, precision)}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.invoiceTaxAmount`).d('发票税额(原币)'),
        dataIndex: 'invoiceTaxAmount',
        width: 150,
        required: true,
        render: (text, record) =>
          form.getFieldValue('ouOrgCode') !== 'CMI' && defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`invoiceTaxAmount`, {
                initialValue: record.invoiceTaxAmount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.invoiceTaxAmount`)
                        .d('发票税额(原币)'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  step={0.01}
                  precision={precision}
                  className="cus-input-money"
                  onBlur={(e) => this.changeInvoiceTaxAmount(+e.target.value, record)}
                />
              )}
            </Form.Item>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(text, precision)}</span>
            </div>
          ),
      },
      {
        title: intl
          .get(`${prompt}.view.detail.line.excludingTaxAmount`)
          .d('发票行金额(原币不含税)'),
        dataIndex: 'excludingTaxAmount',
        width: 200,
        render: (val, record) =>
          form.getFieldValue('ouOrgCode') !== 'CMI' ? (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(val || 0, precision)}</span>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(record.lineAmount || 0, precision)}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.remarks`).d('描述'),
        dataIndex: 'remarks',
        width: 200,
        required: true,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remarks`, {
                initialValue: record.remarks,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.detail.line.remarks`).d('描述'),
                    }),
                  },
                ],
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.circuitId`).d('Circuit ID'),
        dataIndex: 'circuitId',
        width: 200,
        render: (text, record) =>
          defaultFlag || financeFlag ? (
            <>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator(`isCircuitIdRequired`, {
                  initialValue: record.isCircuitIdRequired,
                })(<div />)}
              </Form.Item>
              <Form.Item>
                {record.$form.getFieldDecorator(`circuitId`, {
                  initialValue: record.circuitId,
                  rules: [
                    {
                      required: record.$form.getFieldValue('isCircuitIdRequired') === 'Y',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.view.detail.line.circuitId`).d('Circuit ID'),
                      }),
                    },
                  ],
                })(<CusInput.TextArea autoChangeSize={true} />)}
              </Form.Item>
            </>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.poNumber`).d('采购订单编号'),
        dataIndex: 'poNumber',
        width: 150,
        render: (text, record) =>
          defaultFlag || financeFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`poNumber`, {
                initialValue: record.poNumber,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.lineCompanyOrgName`).d('成本主体'),
        dataIndex: 'lineCompanyOrgName',
        width: 200,
        render: (text, record) =>
          defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`lineCompanyOrgCode`, {
                initialValue: record.lineCompanyOrgCode,
              })(
                <CusSelect
                  allowClear
                  // searchable
                  options={idpValueMap['VP.COST_PAYMENT_COST_CENTER']}
                  onChange={(_, lovRecord) => this.changeOrg(lovRecord, record)}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.contractNo`).d('合同编号'),
        dataIndex: 'contractNo',
        width: 200,
        render: (text, record) =>
          defaultFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`contractId`, {
                initialValue: record.contractId,
                rules: [
                  {
                    required: record.associateContractFlag === 'Y',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.detail.line.contractNo`).d('合同编号'),
                    }),
                  },
                ],
              })(
                <CusLov
                  textValue={record.contractNo}
                  lovOptions={{ displayField: 'contractNo' }}
                  code="SPCM.COST_CONTRACT_INFO"
                  onChange={(_, lovRecord) => this.changeContractNo(lovRecord, record)}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.contractName`).d('合同名称'),
        dataIndex: 'contractName',
        width: 230,
        render: (_, record) => {
          return (
            <a
              key="contractNameUrl"
              href={ERP_HOST.concat('/publicAction.do?method=contractView&account=')
                .concat(currentUser.loginName)
                .concat('&contractId=')
                .concat(record.contractId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {record.contractName}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.detail.line.pendingApportionFlag`).d('是否待摊'),
        dataIndex: 'pendingApportionFlag',
        width: 100,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pendingApportionFlag`, {
                initialValue: record.pendingApportionFlag || '0',
              })(
                <Checkbox
                  checkedValue="1"
                  unCheckedValue="0"
                  onChange={(e) => this.pendingApportionFlagChange(e.target.checked, record)}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(Number(text))
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.apportionStartDate`).d('待摊开始时间'),
        dataIndex: 'apportionStartDate',
        width: 170,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`apportionStartDate`, {
                initialValue: record.apportionStartDate
                  ? dayjs(record.apportionStartDate)
                  : undefined,
                rules: [
                  {
                    required: record.$form.getFieldValue('pendingApportionFlag') === '1',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.apportionStartDate`)
                        .d('待摊开始时间'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  disabled={record.$form.getFieldValue('pendingApportionFlag') === '0'}
                  disabledDate={(currentDate) => {
                    const startDate = record.$form.getFieldValue(`serviceStartDate`);
                    const endDate = record.$form.getFieldValue(`serviceEndDate`);
                    if (startDate && dayjs(startDate).isValid()) {
                      return currentDate.isBefore(startDate) || currentDate.isAfter(endDate);
                    }
                  }}
                  onChange={() => this.apportionDateChange(record)}
                />
              )}
            </Form.Item>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.apportionEndDate`).d('待摊结束时间'),
        dataIndex: 'apportionEndDate',
        width: 170,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`apportionEndDate`, {
                initialValue: record.apportionEndDate ? dayjs(record.apportionEndDate) : undefined,
                rules: [
                  {
                    required: record.$form.getFieldValue('pendingApportionFlag') === '1',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.view.detail.line.apportionEndDate`)
                        .d('待摊结束时间'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  disabled={record.$form.getFieldValue('pendingApportionFlag') === '0'}
                  disabledDate={(currentDate) => {
                    const startDate = record.$form.getFieldValue(`apportionStartDate`);
                    const endDate = record.$form.getFieldValue(`serviceEndDate`);
                    if (startDate && dayjs(startDate).isValid()) {
                      return currentDate.isBefore(startDate) || currentDate.isAfter(endDate);
                    }
                  }}
                  onChange={() => this.apportionDateChange(record)}
                />
              )}
            </Form.Item>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.pendingApportionAmount`).d('待摊金额'),
        dataIndex: 'pendingApportionAmount',
        width: 100,
        hidden: !financeFlag && !archiveFlag && !currentOperatorFlag,
        onHeaderCell: () => ({ style: { color: financeFlag ? '#f54a45' : '' } }),
        render: (text, record) =>
          financeFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`pendingApportionAmount`, {
                initialValue: record.pendingApportionAmount,
              })(
                <InputNumber
                  step={0.01}
                  precision={precision}
                  className="cus-input-money"
                  onChange={() => this.pendingApportionAmountChange(record)}
                  disabled={record.$form.getFieldValue('pendingApportionFlag') === '0'}
                />
              )}
            </Form.Item>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span>{numberRender(text, precision)}</span>
            </div>
          ),
      },
      {
        title: intl.get(`${prompt}.view.detail.line.referenceNumber`).d('事务处理编号'),
        dataIndex: 'referenceNumber',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.expectRecycleDate`).d('预期回收时间'),
        dataIndex: 'expectRecycleDate',
        width: 150,
        render: (text, record) =>
          financeFlag || defaultFlag ? (
            <>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator(`coaMapAttribute3`, {
                  initialValue: record.coaMapAttribute3,
                })(<div />)}
              </Form.Item>
              <Form.Item>
                {record.$form.getFieldDecorator(`expectRecycleDate`, {
                  initialValue: record.expectRecycleDate
                    ? dayjs(record.expectRecycleDate)
                    : undefined,
                  rules: [
                    {
                      required: +record.$form.getFieldValue('coaMapAttribute3') === 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${prompt}.view.detail.line.expectRecycleDate`)
                          .d('预期回收时间'),
                      }),
                    },
                  ],
                })(
                  <CusDatePicker disabled={+record.$form.getFieldValue('coaMapAttribute3') === 0} />
                )}
              </Form.Item>
            </>
          ) : (
            dateRender(text)
          ),
      },
    ];

    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item[ROW_KEY]),
      onChange: (keys, rows) => {
        this.setState({
          selectedRows: rows,
          selectedRowKeys: keys,
        });
      },
    };
    return (
      <div>
        <Row style={{ marginBottom: '16px' }}>
          <Col span={12} style={{ lineHeight: '32px' }}>
            <span>{intl.get(`${prompt}.view.pay.detail`).d('账单明细')}</span>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {defaultFlag && (
              <>
                <CusButton
                  mini
                  loading={deleteBillLineLoading}
                  disabled={selectedRowKeys.length === 0}
                  onClick={() =>
                    CusModal.CusDeleteConfirm(() => {
                      onDelete(selectedRowKeys, selectedRows, () => {
                        this.setState({
                          selectedRows: [],
                          selectedRowKeys: [],
                        });
                      });
                    })
                  }
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                {!isCommissionFlag && (
                  <CusButton
                    mini
                    disabled={selectedRowKeys.length === 0}
                    onClick={() =>
                      onCopy(selectedRows, () => {
                        this.setState({
                          selectedRows: [],
                          selectedRowKeys: [],
                        });
                      })
                    }
                  >
                    {intl.get('hzero.common.button.copy').d('复制')}
                  </CusButton>
                )}
                {isCommissionFlag ? (
                  <ChannelCommission
                    onSelectChannelCommission={selectChannelCommission}
                    onChannleCommissionOk={handleChannelCommissionOk}
                    defaultParams={{
                      currencyCode,
                      ouOrgCode,
                      vendorCompanyNum,
                    }}
                  />
                ) : (
                  <CusButton mini type="primary" onClick={onCreate}>
                    {intl.get('hzero.common.button.add').d('新增')}
                  </CusButton>
                )}
              </>
            )}
            {financeFlag && (
              <>
                <BatchModifyCoa
                  financeFlag={financeFlag}
                  costInvoiceId={dataSource[0]?.costInvoiceId}
                  currentSelected={selectedRows}
                  onSuccess={onGetBillList}
                />
                <BatchServiceDate
                  costInvoiceId={dataSource[0]?.costInvoiceId}
                  currentSelected={selectedRows}
                  onSuccess={onGetBillList}
                />
              </>
            )}
          </Col>
        </Row>
        <EditTable
          onDataChange={() => this.setDataHasChange(true)}
          rowKey={ROW_KEY}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
          hideOnSinglePage={false}
          onChange={(page) => this.handleEditTablePageChange(page)}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>
    );
  }
}

export default BillDetail;
