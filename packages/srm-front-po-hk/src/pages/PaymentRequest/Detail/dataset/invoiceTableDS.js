import { DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import request from 'utils/request';
import { isObject } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN } from 'utils/constants';
import { getResponse } from 'hzero-front/lib/utils/utils';
import attachmentTableDS from './attachmentTableDS';
import otherAttachmentTableDS from './otherAttachmentTableDS';

const organizationId = getCurrentOrganizationId();
const fieldLabels = () => ({
  invoiceNum: intl.get(`spcm.paymentRequest.view.detail.invoice.invoiceNum`).d('发票编码'),
  invoiceDate: intl.get(`spcm.paymentRequest.view.detail.invoice.invoiceDate`).d('发票日期'),
  payDate: intl.get(`spcm.paymentRequest.view.detail.invoice.payDate`).d('付款日期'),
  termsDate: intl.get(`spcm.paymentRequest.view.detail.invoice.termsDate`).d('发票到期日'),
  excludingTaxAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.excludingTaxAmount`)
    .d('发票金额(原币不含税)'),
  invoiceAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.invoiceAmount`)
    .d('发票金额(原币含税)'),
  invoiceTaxAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.invoiceTaxAmount`)
    .d('发票税额(原币)'),
  writeOffAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.writeOffAmount`)
    .d('核销原币金额'),
  paymentAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.paymentAmount`)
    .d('本次净支付原币金额'),
  invoiceHkAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.invoiceHkAmount`)
    .d('发票金额(HKD)'),
  bankFreesAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.bankFreesAmount`)
    .d('银行手续费(原币)'),
  description: intl.get(`spcm.paymentRequest.view.detail.invoice.description`).d('发票描述'),
  supplierInvoiceAmount: intl.get(`spcm.paymentRequest.view.detail.invoice.supplierInvoiceAmount`).d('供应商发票总额'),
  instalmentFlag: intl.get(`spcm.paymentRequest.view.detail.invoice.instalmentFlag`).d('是否分期'),
  paymentCount: intl.get(`spcm.paymentRequest.view.detail.invoice.paymentCount`).d('第几次付款'),
  billTotalAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.billTotalAmount`)
    .d('账单总额'),
  ebsInvoiceNum: intl.get(`spcm.paymentRequest.view.detail.invoice.ebsInvoiceNum`).d('EBS发票编号'),
  siteCode: intl.get(`spcm.paymentRequest.view.detail.invoice.siteCode`).d('供应商地点'),
  glDate: intl.get(`spcm.paymentRequest.view.detail.invoice.glDate`).d('GL Date'),
  withholdingTaxAmount: intl
    .get(`spcm.paymentRequest.view.detail.invoice.withholdingTaxAmount`)
    .d('预提税金额（原币）'),
  remarks: intl.get(`spcm.paymentRequest.view.detail.invoice.remarks`).d('预提税备注'),
  exchangeRate: intl
    .get(`spcm.paymentRequest.view.detail.invoice.exchangeRate`)
    .d('（税务）发票汇率'),
  sscSuggestion: intl
    .get(`spcm.paymentRequest.view.detail.invoice.sscSuggestion`)
    .d('（税务）SSC意见'),
});

async function queryBillAmount(invoiceNum, vendorNum, ouOrgCode, costInvoiceId) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/queryBillAmount/${invoiceNum}/${vendorNum}/${ouOrgCode}`,
    {
      method: 'GET',
      query: { costInvoiceId }
    }
  );
}

const invoiceInfo = ({ onDeleteSuccess = (e) => e, setLineAddAble = (e) => e }) => ({
  name: 'invoiceInfo',
  primaryKey: 'costInvoiceId',
  autoQuery: false,
  autoQueryAfterSubmit: false,
  paging: false,
  // autoLocateFirst: false,
  children: {
    attachmentLineList: new DataSet(attachmentTableDS({ onDeleteSuccess, isLine: true })),
    otherAttachmentLineList: new DataSet(otherAttachmentTableDS({ onDeleteSuccess, isLine: true })),
  },
  fields: [
    {
      name: 'costDetailInvoice',
      type: 'object',
    },
    {
      name: 'costInvoiceId',
      type: FieldType.number,
      bind: 'costDetailInvoice.costInvoiceId',
    },
    {
      name: "regExpList",
      type: 'string',
      lookupCode: 'SPUC.PAYMENT_INVOCIE_NUM_CHAR'
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: fieldLabels().invoiceNum,
      required: true,
      bind: 'costDetailInvoice.invoiceNum',
      help: intl
        .get(`spcm.paymentRequest.view.detail.line.invoiceNum.help`)
        .d('发票号码可以包含的字符：数字 字母(大小写) 汉字(简体 繁体) 空格 罗马数字 / , ‘” _ - # . ( ) & 〔 〕: \ % +()'),
      validator: (value, name, record) => {
        const regExpList = record.getField('regExpList').lookup
        let regex = '^['
        regExpList.map(item => {
          regex += item.meaning
        })
        regex +=']+$'
        const reg = new RegExp(regex);
        if(!reg.test(value)){
          return intl
            .get(`spcm.paymentRequest.message.validator.invoiceNum.info`)
            .d('包含不合法字符，请重新输入发票号！');
        }
      }
    },
    {
      name: 'invoiceDate',
      type: FieldType.date,
      label: fieldLabels().invoiceDate,
      required: true,
      bind: 'costDetailInvoice.invoiceDate',
      max: moment(),
      help: intl
        .get(`spcm.paymentRequest.view.detail.line.invoiceDate.help`)
        .d('请输入发票的开具日期'),
    },
    // {
    //   name: 'payDate',
    //   type: FieldType.date,
    //   label: fieldLabels().payDate,
    //   required: true,
    //   min: moment().format(DATETIME_MIN),
    //   bind: 'costDetailInvoice.payDate',
    // },
    {
      name: 'termsDate',
      type: FieldType.date,
      label: fieldLabels().termsDate,
      required: true,
      // min: moment().format(DATETIME_MIN),
      bind: 'costDetailInvoice.termsDate',
      dynamicProps: {
        min: ({ record }) => {
          const invoiceDate = record.get('invoiceDate');
          return moment.isMoment(invoiceDate) ? moment(invoiceDate) : undefined;
        },
      },
    },
    {
      name: 'excludingTaxAmount',
      type: FieldType.number,
      label: fieldLabels().excludingTaxAmount,
      bind: 'costDetailInvoice.excludingTaxAmount',
      defaultValue: 0,
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'invoiceAmount',
      type: FieldType.number,
      label: fieldLabels().invoiceAmount,
      bind: 'costDetailInvoice.invoiceAmount',
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'invoiceTaxAmount',
      type: FieldType.number,
      label: fieldLabels().invoiceTaxAmount,
      bind: 'costDetailInvoice.invoiceTaxAmount',
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'writeOffAmount',
      type: FieldType.number,
      label: fieldLabels().writeOffAmount,
      bind: 'costDetailInvoice.writeOffAmount',
    },
    {
      name: 'paymentAmount',
      type: FieldType.number,
      label: fieldLabels().paymentAmount,
      bind: 'costDetailInvoice.paymentAmount',
    },
    {
      name: 'invoiceHkAmount',
      type: FieldType.number,
      label: fieldLabels().invoiceHkAmount,
      bind: 'costDetailInvoice.invoiceHkAmount',
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'bankFreesAmount',
      // type: FieldType.currency,
      label: fieldLabels().bankFreesAmount,
      // step: 0.01,
      bind: 'costDetailInvoice.bankFreesAmount',
      type: 'number',
      // dynamicProps: {
      //   type: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode)
      //       ? FieldType.number
      //       : FieldType.currency;
      //   },
      //   step: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
      //   },
      // },
      // min: 0,
    },
    {
      name: 'supplierInvoiceAmount',
      type: FieldType.string,
      label: fieldLabels().supplierInvoiceAmount,
      bind: 'costDetailInvoice.supplierInvoiceAmount',
    },
    {
      name: 'description',
      type: FieldType.string,
      label: fieldLabels().description,
      bind: 'costDetailInvoice.description',
    },
    {
      name: 'instalmentFlag',
      type: 'boolean',
      label: fieldLabels().instalmentFlag,
      required: true,
      bind: 'costDetailInvoice.instalmentFlag',
      help: intl
        .get(`spcm.paymentRequest.view.detail.line.instalmentFlag.help`)
        .d('當賬單並非全額支付時﹐請勾選並填上賬單所顯示的總金額'),
      transformRequest: (value) => {
        return value ? '1' : '0';
      },
      transformResponse: (value) => {
        return value === '1';
      },
    },
    {
      name: 'paymentCount',
      type: FieldType.number,
      label: fieldLabels().paymentCount,
      // defaultValue: 1,
      bind: 'costDetailInvoice.paymentCount',
    },
    {
      name: 'billTotalAmount',
      type: FieldType.number,
      label: fieldLabels().billTotalAmount,
      validator: (value, name, record) => {
        // const invoiceAmount = getInvoiceAmount(record);
        const invoiceAmount = record.get('invoiceAmount');
        if (record.get('instalmentFlag')) {
          if (!value) {
            return intl.get('hzero.common.validation.notNull', {
              name: fieldLabels().billTotalAmount,
            });
          }
          if (typeof value === 'number' && Math.abs(value) <= Math.abs(invoiceAmount)) {
            return intl
              .get(`spcm.paymentRequest.message.validator.billTotalAmount.info1`)
              .d('账单总额需大于发票金额');
          }
          // if (record.get('paymentCount') > 1) {
          //   const { dataSet } = record;
          //   const records = dataSet.records.filter(
          //     (item) => item.get('invoiceNum') === record.get('invoiceNum')
          //   );
          //   if (
          //     value <=
          //     sum(records.map((item) => getInvoiceAmount(item))) + record.get('invoiceAmountSum')
          //   ) {
          //     return intl
          //       .get(`spcm.paymentRequest.message.validator.billTotalAmount.info2`)
          //       .d('账单总额需大于相同号码发票金额汇总');
          //   }
          // }
        }
      },
      bind: 'costDetailInvoice.billTotalAmount',
      // min: 0,
    },
    {
      name: 'ebsInvoiceNum',
      type: FieldType.string,
      label: fieldLabels().ebsInvoiceNum,
      bind: 'costDetailInvoice.ebsInvoiceNum',
      ignore: 'always',
    },
    {
      name: 'vendorSiteCode',
      type: FieldType.string,
      label: fieldLabels().siteCode,
      pattern: /^A-[0-9]{4}$/,
      bind: 'costDetailInvoice.vendorSiteCode',
      // transformRequest: (value, record) => {
      //   const { dataSet } = record;
      //   const status = dataSet.parent.current.get('requestStatus');
      //   if (!['DRAFT', 'REVOKE'].includes(status)) {
      //     return value;
      //   }
      //   const resaleDetailLineList = record.get('resaleDetailLineList') || [];
      //   debugger;
      //   if (resaleDetailLineList && resaleDetailLineList.length > 0) {
      //     const businessCodes = resaleDetailLineList
      //       .map((item) => item.coaBusiness || (item.costCoaAccount[0] || {}).coaSegment5)
      //       .filter((item) => !!item);
      //     const businessCodeSet = new Set(businessCodes);
      //     const businessCodeCount = [];
      //     businessCodeSet.forEach((item) => {
      //       businessCodeCount.push({
      //         code: item,
      //         count: businessCodes.filter((code) => code === item).length,
      //       });
      //     });
      //     businessCodeCount.sort((a, b) => {
      //       if (a.count < b.count) {
      //         return 1;
      //       } else if (a.count > b.count) {
      //         return -1;
      //       } else if (a.code < b.code) {
      //         return 1;
      //       } else if (a.code > b.code) {
      //         return -1;
      //       } else {
      //         return 0;
      //       }
      //     });
      //     debugger;
      //     return businessCodeCount[0] && `A-${businessCodeCount[0].code}`;
      //   }
      // },
    },
    {
      name: 'glDate',
      type: FieldType.date,
      label: fieldLabels().glDate,
      bind: 'costDetailInvoice.glDate',
    },
    {
      name: 'withholdingTaxVendorNum',
      label: intl.get(`spcm.paymentRequest.model.withholdingTaxVendorNum`).d('预提税税务机构编号'),
      bind: 'costDetailInvoice.withholdingTaxVendorNum',
      type: 'object',
      lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
      textField: 'venderNum',
      valueField: 'vendorNum',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          return {
            orgCode: dataSet.parent.current.get('ouOrgCode'),
          };
        },
        // required: ({ record }) => {
        //   return (
        //     typeof record.get('withholdingTaxAmount') === 'number' &&
        //     record.get('withholdingTaxAmount') > 0
        //   );
        // },
        // disabled: ({ record }) => {
        //   return (
        //     typeof record.get('withholdingTaxAmount') !== 'number' ||
        //     record.get('withholdingTaxAmount') <= 0
        //   );
        // },
      },
      transformRequest: (value) => {
        if (isObject(value)) {
          return value.vendorNum;
        } else {
          return value;
        }
      },
    },
    {
      name: 'withholdingTaxVendorName',
      label: intl.get(`spcm.paymentRequest.model.withholdingTaxVendorName`).d('预提税税务机构名称'),
      bind: 'costDetailInvoice.withholdingTaxVendorName',
      type: 'string',
    },
    {
      name: 'withholdingTaxAmount',
      type: FieldType.number,
      label: fieldLabels().withholdingTaxAmount,
      bind: 'costDetailInvoice.withholdingTaxAmount',
      // min: 0,
      step: 0.01,
      defaultValue: 0.0,
      dynamicProps: {
        max: ({ record, dataSet }) => {
          const currencyCode = dataSet.parent.current.get('currencyCode');
          const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
          return typeof record.get('invoiceAmount') === 'number'
            ? Number(record.get('invoiceAmount').toFixed(fractionDigits))
            : 0;
        },
      },
    },
    {
      name: 'withholdingTaxRemarks',
      type: FieldType.string,
      label: fieldLabels().remarks,
      bind: 'costDetailInvoice.withholdingTaxRemarks',
    },
    {
      name: 'exchangeRate',
      type: FieldType.number,
      label: fieldLabels().exchangeRate,
      bind: 'costDetailInvoice.exchangeRate',
      dynamicProps: {
        required: ({ dataSet }) => {
          const { current } = dataSet.parent;
          const currentUser = getCurrentUser();
          const { loginName } = currentUser;
          const requestEmployeeNum = current.get('requestEmployeeNum');
          const companyOrgCode = current.get('companyOrgCode');
          const rsEntity = dataSet.getField('rsEntity').getLookupData(companyOrgCode);
          const vpEntity = dataSet.getField('vpEntity').getLookupData(companyOrgCode);
          const finEntity = dataSet.getField('finEntity').getLookupData(companyOrgCode);

          if (vpEntity.description !== current.get('currencyCode')) {
            if (rsEntity.value) {
              return true;
            } else if (finEntity.value) {
              if (loginName === requestEmployeeNum) {
                return false;
              } else {
                return true;
              }
            }
          }
        },
      },
      min: 0,
      maxLength: 7,
    },
    {
      name: 'sscSuggestion',
      type: FieldType.string,
      label: fieldLabels().sscSuggestion,
      bind: 'costDetailInvoice.sscSuggestion',
      maxLength: 120,
    },
    {
      name: 'rsEntity',
      type: 'string',
      lookupCode: 'RS_IP_INVOICETAX_SIGN_ENTITY',
    },
    {
      name: 'vpEntity',
      type: 'string',
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
    },
    {
      name: 'finEntity',
      type: 'string',
      lookupCode: 'RS_FIN_INVOICETAX_SIGN_ENTITY',
    },
    {
      name: 'currencyCodeMeaning',
      label: intl.get(`spcm.paymentRequest.model.currency`).d('原币种'),
    },
    {
      name: 'invoiceAttachment',
      label: intl.get(`spcm.paymentRequest.model.invoiceAttachment`).d('发票附件'),
      bind: 'costDetailInvoice.invoiceAttachment',
    },
    // {
    //   name: 'otherAttachment',
    //   label: intl.get(`spcm.paymentRequest.model.otherAttachment`).d('其他附件'),
    //   bind: 'costDetailInvoice.otherAttachment',
    // },
  ],
  transport: {
    read: () => {},
    destroy: ({ data }) => ({
      url: `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/deleteInvoice`,
      method: 'DELETE',
      data: data.map((item) => ({
        ...item.costDetailInvoice,
        ...item,
      })),
    }),
  },
  feedback: {
    submitSuccess: (resp) => {
      if (resp.success) {
        onDeleteSuccess();
      }
    },
  },
  events: {
    update: ({ record, name, value, dataSet }) => {
      if (name === 'instalmentFlag' && value && record.get('invoiceNum')) {
        const vendorCompanyNum = dataSet.parent.current.get('vendorCompanyNum');
        const ouOrgCode = dataSet.parent.current.get('ouOrgCode');
        queryBillAmount(record.get('invoiceNum'), vendorCompanyNum, ouOrgCode, record.get('costInvoiceId'))
          .then((res) => {
            const response = getResponse(res);
            if (response) {
              const { billTotalAmount, invoiceAmountSum } = response;
              // record.set('paymentCount', paymentCount);
              record.set('billTotalAmount', billTotalAmount);
              record.set('invoiceAmountSum', invoiceAmountSum);
            }
        });
      }
      if (name === 'instalmentFlag' && value === false) {
        record.set('billTotalAmount', undefined);
      }
      // if (name === 'invoiceNum' && value && record.get('instalmentFlag')) {
      //   const vendorCompanyNum = dataSet.parent.current.get('vendorCompanyNum');
      //   queryBillAmount(record.get('invoiceNum'), vendorCompanyNum).then((res) => {
      //     const response = getResponse(res);
      //     if (response) {
      //       const { billTotalAmount, invoiceAmountSum } = response;
      //       // record.set('paymentCount', paymentCount);
      //       record.set('billTotalAmount', billTotalAmount);
      //       record.set('invoiceAmountSum', invoiceAmountSum);
      //     }
      //   });
      // }
      if (name === 'bankFreesAmount') {
        const bankFreesAmount = value || 0;
        const excludingTaxAmount = record.get('excludingTaxAmount');
        const invoiceTaxAmount = record.get('invoiceTaxAmount');
        const conversionRate = dataSet.parent.current.get('conversionRate') || 1;
        const invoiceAmount = excludingTaxAmount + invoiceTaxAmount + bankFreesAmount;
        const invoiceHkAmount = invoiceAmount * conversionRate;
        record.set('invoiceAmount', invoiceAmount);
        record.set('invoiceHkAmount', invoiceHkAmount);
      }
      if (name === 'withholdingTaxVendorNum') {
        if (value) {
          record.set('withholdingTaxVendorName', value.vendorName);
        } else {
          record.set('withholdingTaxVendorName', undefined);
        }
      }
      if (name === 'invoiceDate') {
        record.set('termsDate', undefined);
      }
      // if (name === 'withholdingTaxAmount') {
      //   if (typeof value !== 'number' || value <= 0) {
      //     record.set('withholdingTaxVendorNum', undefined);
      //     record.set('withholdingTaxVendorName', undefined);
      //   }
      // }
    },
    create: ({ dataSet }) => {
      if (dataSet.current) {
        setLineAddAble(true);
      }
    },
    remove: ({ dataSet, records }) => {
      const keys = records.map((record) => record.key);
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        dataSet.records = dataSet.filter((record) => !keys.includes(record.key));
      }, 0);
      if (!dataSet.current) {
        setLineAddAble(false);
      }
    },
    indexChange: ({ dataSet, record }) => {
      // 监听选中发票头变化，查询发票行
      const { resaleDetailLineList } = dataSet.children;
      if (record) {
        setLineAddAble(true);
      }
      if (resaleDetailLineList && record) {
        if (resaleDetailLineList.totalCount <= 0) {
          resaleDetailLineList.query(1, {
            size: resaleDetailLineList.pageSize,
            costInvoiceId: record.get('costInvoiceId'),
          });
        } else {
          resaleDetailLineList.records.forEach((r) => {
            // eslint-disable-next-line no-param-reassign
            r.isCached = false;
          });
        }
      }
    },
  },
});

export default invoiceInfo;
