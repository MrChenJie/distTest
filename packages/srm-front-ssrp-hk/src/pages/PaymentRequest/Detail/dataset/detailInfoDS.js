import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getResponse } from 'hzero-front/lib/utils/utils';

// const prompt = 'spcm.paymentRequest';
const organizationId = getCurrentOrganizationId();
const fieldLabels = {
  requestNum: intl.get(`spcm.paymentRequest.view.detail.requestNum`).d('申请编号'),
  companyOrgName: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('订单签约主体'),
  requestStatus: intl.get(`spcm.paymentRequest.view.detail.requestStatus`).d('申请状态'),
  requestEmployeeName: intl.get(`spcm.paymentRequest.view.detail.requestEmployeeName`).d('申请人'),
  draftEmployeeName: intl.get(`spcm.paymentRequest.view.detail.draftEmployeeName`).d('起草人'),
  requestDate: intl.get(`spcm.paymentRequest.view.detail.requestDate`).d('申请日期'),
  conversionRate: intl.get(`spcm.paymentRequest.view.detail.conversionRate`).d('汇率(港币汇率)'),
  vendorCompanyNum: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyNum`).d('供应商编号'),
  vendorCompanyName: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyName`).d('供应商名称'),
  currencyCode: intl.get(`spcm.paymentRequest.view.detail.currencyCode`).d('发票币种'),
  totalAmount: intl.get(`spcm.paymentRequest.view.detail.totalAmount`).d('原币含税总金额'),
  totalAmountHKD: intl.get(`spcm.paymentRequest.view.detail.totalAmountHKD`).d('港币总金额'),
  pressLevel: intl.get(`spcm.paymentRequest.view.detail.pressLevel`).d('紧急程度'),
  requestTitle: intl.get(`spcm.paymentRequest.view.detail.requestTitle`).d('申请标题'),
  requestRemarks: intl.get(`spcm.paymentRequest.view.detail.requestRemarks`).d('申请描述'),
  bankAccountName: intl.get(`spcm.paymentRequest.view.detail.bankAccountName`).d('账户名称'),
  bankAccountNum: intl.get(`spcm.paymentRequest.view.detail.bankAccountNum`).d('银行账号'),
  bankName: intl.get(`spcm.paymentRequest.view.detail.bankName`).d('开户银行'),
  swiftCode: intl.get(`spcm.paymentRequest.view.detail.swiftCode`).d('Swift Code'),
};

const exchangeRateQuery = async function (params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-headerss/exchangeRateQuery`, {
    method: 'GET',
    query: params,
  });
};

const queryLovData = async function (lovCode) {
  return request(`/hpfm/v1/${organizationId}/lovs/data`, {
    method: 'GET',
    query: {
      lovCode,
    },
  });
};

// 发票行新增 预提税机构名称有且仅有一个 则带出赋值
const getWithholdingTaxVendor = (dataSet) => {
  if (!dataSet) {
    return false;
  }
  const org = dataSet.parent.getField('companyOrgCode').getLookupData();
  // 查询发票头预提税机构名称 如果公司主体下的预提税机构有且仅有一个 则自动带出机构名称
  request(`${SRM_SPUC}/v1/lovs/sql/data`, {
    method: 'GET',
    query: {
      lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
      page: 0,
      size: 10,
      orgCode: org.tag,
    },
  }).then((res) => {
    if (res) {
      const { content } = res;
      if (content.length === 1) {
        dataSet.records.forEach((line) => {
          line.set('withholdingTaxVendorNum', {
            vendorNum: content[0].bankAccountNum,
            vendorName: content[0].bankAccountName,
          });
        });
      } else {
        dataSet.records.forEach((line) => {
          line.set('withholdingTaxVendorName', null);
          line.set('withholdingTaxVendorNum', null);
        });
      }
    }
  });
};

const detailInfo = ({
  costRequestId,
  onSaveSuccess = (e) => e,
  onSaveOrSubmitFaild = (e) => e,
  onLoadSuccess = (e) => e,
  defaultValue,
  onUpdate = (e) => e,
}) => ({
  name: 'detailInfo',
  autoCreate: true,
  autoQuery: false,
  autoQueryAfterSubmit: false,
  fields: [
    {
      name: 'costPaymentRequest',
      type: 'object',
    },
    {
      name: 'costRequestId',
      type: FieldType.number,
      bind: 'costPaymentRequest.costRequestId',
    },
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.requestNum`).d('申请编号'),
      bind: 'costPaymentRequest.requestNum',
    },
    // {
    //   name: 'companyOrg',
    //   type: FieldType.object,
    //   // label: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('订单签约主体'),
    //   label: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('订单签约主体'),
    //   bind: 'costPaymentRequest.companyOrgName',
    //   lovCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
    //   required: true,
    //   transformRequest: (value, record) => {
    //     if (typeof value === 'object') {
    //       record.set('companyOrgCode', value.value);
    //       record.set('companyOrgName', value.meaning);
    //       record.set('ouOrgCode', value.tag);
    //     }
    //   },
    // },
    {
      name: 'companyOrgCode', // 订单签约主体
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('订单签约主体'),
      bind: 'costPaymentRequest.companyOrgCode',
      defaultValue: (defaultValue || {}).cmiEntity,
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
      required: true,
    },
    {
      name: 'companyOrgName',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.companyOrgName`).d('订单签约主体'),
      bind: 'costPaymentRequest.companyOrgName',
      defaultValue: (defaultValue || {}).cmiEntityMeaning,
    },
    {
      name: 'ouOrgCode',
      type: FieldType.string,
      bind: 'costPaymentRequest.ouOrgCode',
      defaultValue: (defaultValue || {}).cmiEntityTag,
    },
    {
      name: 'requestStatus',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.requestStatus`).d('申请状态'), // fieldLabels.requestStatus,
      bind: 'costPaymentRequest.requestStatus',
      lookupCode: 'SPCM.COST_REQUEST_STATUS',
      defaultValue: (defaultValue || {}).requestStatus,
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.object,
      label: intl.get(`spcm.paymentRequest.view.detail.requestEmployeeName`).d('申请人'),
      lovCode: 'SPUC.RESALE_REQUEST_EMPLOYEE',
      lovPara: { tenantId: organizationId },
      textField: 'name',
      required: true,
      bind: 'costPaymentRequest.requestEmployeeName',
      defaultValue: (defaultValue || {}).requestEmployeeName,
      dynamicProps: {
        disabled: ({ record }) => record.get('paymentOwnerName')
      },
      transformRequest: (value, record) => {
        if (typeof value === 'object') {
          record.set('requestEmployeeNum', value.employeeNum);
          record.set('requestEmployeeId', value.employeeId);
          return value.name;
        }
      },
    },
    {
      name: 'requestEmployeeNum',
      type: FieldType.string,
      bind: 'costPaymentRequest.requestEmployeeNum',
      defaultValue: (defaultValue || {}).requestEmployeeNum,
    },
    {
      name: 'requestEmployeeId',
      type: FieldType.string,
      bind: 'costPaymentRequest.requestEmployeeId',
    },
    {
      name: 'draftEmployeeId',
      type: FieldType.number,
      bind: 'costPaymentRequest.draftEmployeeId',
    },
    {
      name: 'draftEmployeeName',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.draftEmployeeName`).d('起草人'),
      bind: 'costPaymentRequest.draftEmployeeName',
    },
    {
      name: 'requestDate',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.requestDate`).d('申请日期'),
      bind: 'costPaymentRequest.requestDate',
      defaultValue: new Date(),
      // transformResponse: (value) => {
      //   return moment(value).format('YYYY-MM-DD');
      // },
    },
    {
      name: 'conversionRate',
      type: FieldType.number,
      label: intl.get(`spcm.paymentRequest.view.detail.conversionRate`).d('汇率(港币汇率)'),
      bind: 'costPaymentRequest.conversionRate',
      // required: true,
      validator: (value) => {
        if (isNil(value) || value === '') {
          return intl
            .get('spcm.paymentRequest.validator.info.maintain-exchange-rate-info')
            .d('汇率来源于财务系统，请联系财务系统组维护汇率信息');
        }
      },
    },

    {
      name: 'pressLevel',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.pressLevel`).d('紧急程度'),
      lookupCode: 'SPCM.COST_PRESS_LEVEL',
      required: true,
      bind: 'costPaymentRequest.pressLevel',
      defaultValue: 'GENERAL',
    },
    {
      name: 'expectPaymentDate',
      type: FieldType.date,
      label: intl.get(`spcm.paymentRequest.view.detail.expectPaymentDate`).d('期望付款日期'),
      bind: 'costPaymentRequest.expectPaymentDate',
      // transformResponse: (value) => {
      //   return moment(value).format('YYYY-MM-DD');
      // },
      dynamicProps: {
        disabled: ({ record }) => {
          const pressLevel = record.get('pressLevel');
          return ['GENERAL'].includes(pressLevel);
        },
      },
    },
    {
      name: 'vendorCompanyId',
      type: FieldType.number,
    },
    {
      name: 'vendorCompany',
      type: FieldType.object,
      label: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyName`).d('供应商名称'),
      lovCode: 'SSLM.COST_SUPPLIER_INFO_URL',
      required: true,
      bind: 'costPaymentRequest.vendorCompanyName',
      disabled: true,
      textField: 'vendorName',
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyNum`).d('供应商编号'),
      bind: 'costPaymentRequest.vendorCompanyNum',
      defaultValue: (defaultValue || {}).supplierCode,
    },
    {
      name: 'vendorCompanyName',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.vendorCompanyName`).d('供应商名称'),
      bind: 'costPaymentRequest.vendorCompanyName',
      defaultValue: (defaultValue || {}).supplierName,
    },
    {
      name: 'currency',
      type: FieldType.object,
      label: intl.get(`spcm.paymentRequest.view.detail.currencyCode`).d('发票币种'),
      lovCode: 'SMDM.CURRENCY',
      required: true,
      textField: 'currencyCode',
      bind: 'costPaymentRequest.currencyCode',
      transformRequest: (value, record) => {
        if (value && typeof value === 'object') {
          record.set('currencyCode', value.currencyCode);
          record.set('currencyCodeMeaning', value.currencyName);
        }
      },
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'currencyCode',
      type: FieldType.string,
      bind: 'costPaymentRequest.currencyCode',
      defaultValue: (defaultValue || {}).currencyCode,
    },
    {
      name: 'currencyCodeMeaning',
      type: FieldType.string,
      bind: 'costPaymentRequest.currencyCodeMeaning',
      defaultValue: (defaultValue || {}).currencyCodeMeaning,
    },
    {
      name: 'totalAmount',
      type: FieldType.number,
      label: intl.get(`spcm.paymentRequest.view.detail.totalAmount`).d('原币含税总金额'),
    },
    {
      name: 'totalAmountHKD',
      type: FieldType.number,
      label: intl.get(`spcm.paymentRequest.view.detail.totalAmountHKD`).d('港币总金额'),
    },
    {
      name: 'vendorPayFlag',
      type: FieldType.string,
      label: fieldLabels.vendorPayFlag,
    },
    {
      name: 'payCompanyId',
      type: FieldType.string,
    },
    {
      name: 'payCompanyName',
      type: FieldType.string,
      label: fieldLabels.payCompanyName,
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.requestTitle`).d('申请标题'),
      maxLength: 170,
      bind: 'costPaymentRequest.requestTitle',
      required: true,
      // transformRequest: (value) => value && `COS-${value}`,
      // transformResponse: (value) =>
      //   typeof value === 'string' && value.startsWith('COS-') ? value.substring(4) : value,
    },
    {
      name: 'requestRemarks',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.requestRemarks`).d('申请描述'),
      maxLength: 770,
      bind: 'costPaymentRequest.requestRemarks',
    },
    {
      name: 'companyBankAccountId',
      type: FieldType.number,
      bind: 'costPaymentRequest.companyBankAccountId',
    },
    // {
    //   name: 'bankAccountName',
    //   type: FieldType.string,
    //   label: intl.get(`spcm.paymentRequest.view.detail.bankAccountName`).d('账户名称'),
    //   required: true,
    //   bind: 'costPaymentRequest.bankAccountName',
    // },
    // {
    //   name: 'bankAccountNum',
    //   type: FieldType.string,
    //   label: intl.get(`spcm.paymentRequest.view.detail.bankAccountNum`).d('银行账号'),
    //   required: true,
    //   bind: 'costPaymentRequest.bankAccountNum',
    // },
    // {
    //   name: 'bankId',
    //   type: FieldType.number,
    //   bind: 'costPaymentRequest.bankId',
    // },
    // {
    //   name: 'bankName',
    //   type: FieldType.string,
    //   label: intl.get(`spcm.paymentRequest.view.detail.bankName`).d('开户银行'),
    //   required: true,
    //   bind: 'costPaymentRequest.bankName',
    // },
    // {
    //   name: 'swiftCode',
    //   type: FieldType.string,
    //   label: intl.get(`spcm.paymentRequest.view.detail.swiftCode`).d('Swift Code'),
    //   required: true,
    //   bind: 'costPaymentRequest.swiftCode',
    // },
    // 用于在未修改的状态下提交时触发校验
    {
      name: 'validateFlag',
      type: 'string',
    },
    {
      name: 'originalReceived',
      type: FieldType.string,
      label: intl.get(`spcm.costPayment.view.detail.originalReceived`).d('已接收原件'),
      required: true,
      lookupCode: 'SPUC.COST_ORIGINAL_RECEIVED',
      bind: 'costPaymentRequest.originalReceived',
    },
    {
      name: 'riskWarningMeaning',
      label: intl.get(`spcm.paymentRequest.view.detail.riskWarning`).d('风险提示'),
      type: 'string',
    },
    {
      name: 'otherRiskWarningMeaning',
      label: intl.get(`spcm.paymentRequest.view.detail.otherRiskWarning`).d('其他风险提示'),
      type: 'string',
      bind: 'costPaymentRequest.otherRiskWarningMeaning',
      disabled: true,
    },
    {
      name: 'productType',
      label: intl.get('spcm.paymentRequest.view.detail.productType').d('业务类型'),
      type: FieldType.string,
      required: true,
    },
    {
      name: 'paymentOwner',
      type: FieldType.object,
      label: intl.get(`spcm.paymentRequest.view.detail.paymentOwnerName`).d('下沉付款责任人'),
      lovCode: 'SPUC.RESALE_REQUEST_EMPLOYEE',
      lovPara: { tenantId: organizationId },
      // required: true,
      bind: 'costPaymentRequest.paymentOwnerName',
      textField: 'name',
      defaultValue: (defaultValue || {}).paymentOwnerName,
      transformRequest: (value, record) => {
        if (value && typeof value === 'object') {
          record.set('paymentOwnerName', value.name);
          record.set('paymentOwnerId', value.employeeId);
        }
      },
    },
    {
      name: 'sourceCode',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.sourceCode`).d('创建方式'),
      lookupCode: 'SRSP.PAYMENT_REQUEST_SOURCE',
      bind: 'costPaymentRequest.sourceCode',
    },
    {
      name: 'paymentOwnerId',
      type: FieldType.string,
      bind: 'costPaymentRequest.paymentOwnerId',
    },
    {
      name: 'paymentOwnerName',
      type: FieldType.string,
      bind: 'costPaymentRequest.paymentOwnerName',
      defaultValue: (defaultValue || {}).paymentOwnerName,
    },
    {
      name: 'paymentOwnerFlag',
      type: FieldType.string,
    },
    {
      name: 'bankReturnFlag',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.bankReturnFlag',
      label: intl.get(`spcm.paymentRequest.view.detail.bankReturnFlag`).d('退回修改'),
      trueValue: 'Y',
      falseValue: 'N',
      defaultValue: 'N',
    },
    {
      name: 'chequePayFlag',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.chequePayFlag',
      label: intl.get(`spcm.paymentRequest.view.detail.chequePayFlag`).d('是否以支票支付'),
      defaultValue: 'N',
      falseValue: 'N',
      trueValue: 'Y',
    },
    {
      name: 'multiCurrencyFlag',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.multiCurrencyFlag',
      label: intl.get(`spcm.paymentRequest.view.detail.multiCurrencyFlag`).d('多币种'),
      defaultValue: 'N',
      falseValue: 'N',
      trueValue: 'Y',
    },
    {
      name: 'actualCurrency',
      type: FieldType.object,
      label: intl.get(`spcm.paymentRequest.view.detail.actualPaidCurrency`).d('实际支付币种'),
      lovCode: 'SMDM.CURRENCY',
      textField: 'currencyCode',
      bind: 'costPaymentRequest.actualPaidCurrency',
      transformRequest: (value, record) => {
        if (value && typeof value === 'object') {
          record.set('actualPaidCurrency', value.currencyCode);
          record.set('actualPaidCurrencyMeaning', value.currencyName);
        }
      },
      dynamicProps: {
        disabled: ({record}) => {
          const multiCurrencyFlag = record.get('multiCurrencyFlag');
          return multiCurrencyFlag === 'N';
        },
        required: ({ record }) => {
          const multiCurrencyFlag = record.get('multiCurrencyFlag');
          return multiCurrencyFlag === 'Y';
        },
      },
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'actualPaidCurrency',
      type: FieldType.string,
      bind: 'costPaymentRequest.actualPaidCurrency',
    },
    {
      name: 'actualPaidCurrencyMeaning',
      type: FieldType.string,
      bind: 'costPaymentRequest.actualPaidCurrencyMeaning',
    },
    {
      name: 'notNeedPaidFlag',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.notNeedPaidFlag',
      label: intl.get(`spcm.paymentRequest.view.detail.notNeedPaidFlag`).d('不需要支付'),
      defaultValue: 'N',
      falseValue: 'N',
      trueValue: 'Y',
    },
    {
      name: 'expenseCategory',
      type: FieldType.string,
      label: intl.get(`spcm.paymentRequest.view.detail.expenseCategory`).d('银行费用类别'),
      lookupCode: 'SRSP.BANK_CHARGE_TYPE',
      bind: 'costPaymentRequest.expenseCategory',
      defaultValue: "Share",
      required: true,
    },
    {
      name: 'needAutoCopy',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.needAutoCopy',
      label: intl.get(`spcm.paymentRequest.view.detail.needAutoCopy`).d('是否需要自动复制'),
      defaultValue: 'N',
      falseValue: 'N',
      trueValue: 'Y',
    },
    {
      name: 'transferOrderFlag',
      type: FieldType.boolean,
      bind: 'costPaymentRequest.transferOrderFlag',
      label: intl.get(`spcm.paymentRequest.view.detail.transferOrderFlag`).d('是否转网订单'),
      defaultValue: 'N',
      falseValue: 'N',
      trueValue: 'Y',
    },
  ],
  events: {
    update: ({ dataSet, record, name, value }) => {
      if (name === 'currency') {
        if (value) {
          record.set('currencyCode', value.currencyCode);
          record.set('currencyCodeMeaning', value.currencyName);
          if (value.currencyCode === 'HKD') {
            record.set('conversionRate', 1);
          } else {
            exchangeRateQuery({
              currency: value.currencyCode,
              currencyTO: 'HKD',
              cvtDate: moment().format('YYYY-MM-DD 00:00:00'),
            }).then((res) => {
              const response = getResponse(res);
              if (response) {
                record.set('conversionRate', response.currencyRate);
              }
            });
          }
        } else {
          record.set('currencyCode', undefined);
          record.set('currencyCodeMeaning', undefined);
          record.set('conversionRate', undefined);
        }
        onUpdate();
      }
      if (name === 'vendorCompany') {
        if (value) {
          record.set('vendorCompanyName', value.vendorName);
          record.set('vendorCompanyNum', value.vendorNum);
          record.set('bankAccountName', value.bankAccountName);
          record.set('bankAccountNum', value.bankAccountNum);
          record.set('bankName', value.bankName);
          record.set('swiftCode', value.bankIdentificationCode);
        } else {
          record.set('vendorCompanyName', undefined);
          record.set('vendorCompanyNum', undefined);
          record.set('bankAccountName', undefined);
          record.set('bankAccountNum', undefined);
          record.set('bankName', undefined);
          record.set('swiftCode', undefined);
        }
        onUpdate();
      }
      if (name === 'companyOrgCode') {
        const vendorCompanyField = dataSet.getField('vendorCompany');
        if (value) {
          const entity = dataSet.getField('companyOrgCode').getLookupData(value);
          vendorCompanyField.set('lovPara', {
            orgCode: entity.tag,
          });
          vendorCompanyField.set('disabled', false);
          // record.set('companyOrgCode', value.value);
          record.set('description', entity.description);
          record.set('currencyCode', entity.description);
          record.set('ouOrgCode', entity.tag);
          record.set('companyOrgName', entity.meaning);
          if (entity.description === 'HKD') {
            record.set('conversionRate', 1);
          } else {
            exchangeRateQuery({
              currency: entity.description,
              currencyTO: 'HKD',
              cvtDate: moment().format('YYYY-MM-DD 00:00:00'),
            }).then((res) => {
              const response = getResponse(res);
              if (response) {
                record.set('conversionRate', response.currencyRate);
              }
            });
          }
          getWithholdingTaxVendor(dataSet.children.resaleDetailInvoiceList);
        } else {
          vendorCompanyField.set('lovPara', {
            orgCode: undefined,
          });
          vendorCompanyField.set('disabled', false);
          // record.set('companyOrgCode', undefined);
          record.set('description', undefined);
          record.set('currencyCode', undefined);
          record.set('ouOrgCode', undefined);
          record.set('companyOrgName', undefined);
        }
        onUpdate();
      }
      if (name === 'paymentOwner') {
        if (value) {
          record.set('paymentOwnerName', value.name);
          record.set('paymentOwnerId', value.employeeId);
        } else {
          record.set('paymentOwnerName', undefined);
          record.set('paymentOwnerId', undefined);
        }
      }
    },
    load: ({ dataSet }) => {
      const { current } = dataSet;
      if (current && current.get('ouOrgCode')) {
        const vendorCompanyField = dataSet.getField('vendorCompany');
        vendorCompanyField.set('disabled', false);
        vendorCompanyField.set('lovPara', {
          orgCode: current.get('ouOrgCode'),
        });
      }
    },
  },
  transport: {
    create: ({ data, params }) => {
      const costPaymentRequest = data[0];
      const { resaleDetailInvoiceList, AttachmentList, otherAttachmentList, supplyAttachmentList, paymentBankInfo } = data[0];
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/addRequest`,
        method: 'POST',
        data: {
          costPaymentRequest,
          resaleDetailInvoiceList: resaleDetailInvoiceList.map((item) => ({
            costDetailInvoice: item,
            resaleDetailLineList: item.resaleDetailLineList.map((rdl) => ({
              resaleDetailLine:
                rdl._status === 'create' ? { ...rdl, resaleLineId: undefined } : rdl,
              costCoaAccount: rdl.costCoaAccount,
              taxCoaAccount: rdl.taxCoaAccount,
              resaleLineFiles: rdl.resaleLineFiles,
            })),
            costInvoiceFilesList: [
              ...item.attachmentLineList,
              ...item.otherAttachmentLineList,
            ],
          })),
          costAttachFileList: [...AttachmentList, ...otherAttachmentList, ...supplyAttachmentList],
          paymentBankInfo: paymentBankInfo[0],
        },
        params,
      };
    },
    read: () => ({
      url: `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/${costRequestId}`,
      method: 'GET',
      transformResponse: async (data, headers) => {
        if (headers['content-type'] && headers['content-type'].startsWith('application/json')) {
          const res = JSON.parse(data);
          const { costAttachFileList = [], resaleDetailInvoiceList = [] } = res;
          const promise = new Promise((resolve) => {
            queryLovData('RS_IP_ATTACHMENT_TYPE').then((r) => {
              if (getResponse(r)) {
                resolve(r);
              } else {
                resolve([]);
              }
            });
          });
          const lovData = await promise;
          const AttachmentList = costAttachFileList.filter((item) => {
            const { fileType } = item;
            const type = lovData.find((d) => d.value === fileType);
            return type && type.tag === '3';
          });
          const otherAttachmentList = costAttachFileList.filter((item) => {
            const { fileType } = item;
            const type = lovData.find((d) => d.value === fileType);
            return type && type.tag === '2';
          });
          return {
            ...res,
            AttachmentList,
            otherAttachmentList,
            resaleDetailInvoiceList: resaleDetailInvoiceList.map(item => {
              const { costInvoiceFilesList = [] } = item;
              const attachmentLineList = costInvoiceFilesList.filter((item) => {
                const { fileType } = item;
                const type = lovData.find((d) => d.value === fileType);
                return type && type.tag === '3';
              });
              const otherAttachmentLineList = costInvoiceFilesList.filter((item) => {
                const { fileType } = item;
                const type = lovData.find((d) => d.value === fileType);
                return type && type.tag === '2';
              });
              return {
                ...item,
                attachmentLineList,
                otherAttachmentLineList,
              };
            }),
          };
        }
      },
    }),
    update: ({ data }) => {
      // const data = dataSet.toData();
      const costPaymentRequest = {
        ...data[0].costPaymentRequest,
        ...data[0],
      };
      const { resaleDetailInvoiceList, AttachmentList, otherAttachmentList, supplyAttachmentList, paymentBankInfo } = data[0];
      const resaleDetailInvoiceList1 = Array.isArray(resaleDetailInvoiceList)
        ? resaleDetailInvoiceList.map((item) => ({
          costDetailInvoice: item,
          resaleDetailLineList: Array.isArray(item.resaleDetailLineList)
            ? item.resaleDetailLineList.map((rdl) => ({
              resaleDetailLine:
                rdl._status === 'create' ? { ...rdl, resaleLineId: undefined } : rdl,
              costCoaAccount: rdl.costCoaAccount,
              taxCoaAccount: rdl.taxCoaAccount,
              resaleLineFiles: rdl.resaleLineFiles,
            }))
            : [],
          costInvoiceFilesList: [
            ...item.attachmentLineList,
            ...item.otherAttachmentLineList,
          ],
        }))
        : [];
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/addRequest`,
        method: 'POST',
        data: {
          costPaymentRequest,
          resaleDetailInvoiceList: resaleDetailInvoiceList1,
          costAttachFileList: [...AttachmentList, ...otherAttachmentList, ...supplyAttachmentList],
          paymentBankInfo: paymentBankInfo[0],
        },
      };
    },
  },
  feedback: {
    submitSuccess: (resp) => {
      onSaveSuccess(resp);
    },
    submitFailed: (error) => {
      onSaveOrSubmitFaild(error);
    },
    loadSuccess: (resp) => {
      onLoadSuccess(resp);
    },
  },
});

export default detailInfo;
