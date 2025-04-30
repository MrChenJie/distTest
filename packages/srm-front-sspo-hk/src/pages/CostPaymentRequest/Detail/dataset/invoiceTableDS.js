import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { getCurrentUser } from 'utils/utils';

const invoiceInfo = (detailInfoDS, prompt) => ({
  name: 'invoiceInfo',
  autoCreate: false,
  primaryKey: 'costInvoiceId',
  autoQuery: false,
  autoLocateAfterCreate: true,
  paging: false,
  fields: [
    {
      name: 'costInvoiceId',
      type: FieldType.number,
    },
    {
      name: 'costRequestId',
      type: FieldType.number,
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.invoiceNum`).d('发票号码'),
      required: true,
    },
    {
      name: 'invoiceDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.invoice.invoiceDate`).d('发票日期'),
      required: true,
      max: new Date(),
    },
    {
      name: 'vendorSiteCode',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.vendorSiteCode`).d('供应商地点'),
    },
    {
      name: 'excludingTaxAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.invoice.excludingTaxAmount`).d('发票金额(原币不含税)'),
      disabled: true,
      step: 0.01,
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
      label: intl.get(`${prompt}.view.detail.invoice.invoiceAmount`).d('发票金额(原币含税)'),
      disabled: true,
      step: 0.01,
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
      label: intl.get(`${prompt}.view.detail.invoice.invoiceTaxAmount`).d('发票税额(原币)'),
      disabled: true,
      step: 0.01,
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
      name: 'description',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.description`).d('发票描述'),
      required: true,
    },
    {
      name: 'instalmentFlag',
      type: FieldType.boolean,
      label: intl.get(`${prompt}.view.detail.invoice.instalmentFlag`).d('是否分期'),
      defaultValue: '0',
      falseValue: '0',
      trueValue: '1',
      dynamicProps: {
        disabled: () => {
          // 草稿状态可修改
          const requestStatus = detailInfoDS.current.getField('requestStatus').getValue();
          if (requestStatus === 'DRAFT') {
            return false;
          } else {
            return true;
          }
        },
      },
      help: intl
        .get(`${prompt}.view.detail.line.instalmentFlag.help`)
        .d('當賬單並非全額支付時﹐請勾選並填上賬單所顯示的總金額'),
    },
    {
      name: 'paymentCount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.invoice.paymentCount`).d('第几次付款'),
      disabled: true,
    },
    {
      name: 'billTotalAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.invoice.billTotalAmount`).d('账单总额'),
      step: 0.01,
      dynamicProps: {
        disabled: ({ record }) => {
          // 草稿状态可修改
          const requestStatus = detailInfoDS.current.getField('requestStatus').getValue();
          if (record.get('instalmentFlag') === '1' && requestStatus === 'DRAFT') {
            // 分期
            return false;
          } else {
            // 不分期
            return true;
          }
        },
      },
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
      name: 'payCurrencyCode',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.line.payCurrencyCode`).d('支付币种'),
      lovCode: 'HPFM.CURRENCY',
      help: intl
        .get(`${prompt}.view.detail.line.payCurrencyCode.help`)
        .d('只限于特殊情况下使用, 请线下跟 Aptradepayment team 沟通'),
    },
    {
      name: 'payExchangeRate',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.payExchangeRate`).d('支付汇率'),
      help: intl
        .get(`${prompt}.view.detail.line.payCurrencyCode.help`)
        .d('只限于特殊情况下使用, 请线下跟 Aptradepayment team 沟通'),
    },
    {
      name: 'payAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.payAmount`).d('支付金额'),
      step: 0.01,
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
      name: 'ebsInvoiceNum',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.ebsInvoiceNum`).d('EBS发票编号'),
      disabled: true,
    },
    {
      name: 'glDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.invoice.glDate`).d('GL Date'),
    },
    {
      name: 'withholdingTaxAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.invoice.withholdingTaxAmount`).d('预提税金额（原币）'),
      step: 0.01,
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
      name: 'withholdingTaxVendorNum',
      label: intl.get(`${prompt}.view.detail.line.withholdingTaxVendorNum`).d('预提税税务机构编号'),
      type: FieldType.string,
      lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
    },
    {
      name: 'withholdingTaxVendorName',
      type: FieldType.object,
      label: intl
        .get(`${prompt}.view.detail.line.withholdingTaxVendorName`)
        .d('预提税税务机构名称'),
      lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
      dynamicProps: {
        lovPara: () => {
          const code = detailInfoDS.current.getField('companyOrgCode').getLookupData();
          return { orgCode: code.tag };
        },
      },
    },
    {
      name: 'withholdingTaxRemarks',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.withholdingTaxRemarks`).d('预提税备注'),
    },
    {
      name: 'exchangeRateCode',
      type: FieldType.string,
      lookupCode: 'RS_IP_INVOICETAX_SIGN_ENTITY',
    },
    {
      name: 'finEntity',
      type: 'string',
      lookupCode: 'RS_FIN_INVOICETAX_SIGN_ENTITY',
    },
    {
      name: 'exchangeRate',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.invoice.exchangeRate`).d('(税务)发票汇率'),
      step: 0.000001,
      max: 9999999,
      min: 0,
      dynamicProps: {
        required: ({ record }) => {
          const currentUser = getCurrentUser();
          const { loginName } = currentUser;
          const requestEmployeeNum = detailInfoDS.current.get('requestEmployeeNum');
          // 必填逻辑为在指定OU清单下的，如果发票货币不是公司主体本位币，则为必输字段。
          const companyOrgCode = detailInfoDS.current.getField('companyOrgCode').getValue();
          const org = record.getField('exchangeRateCode').getLookupData(companyOrgCode);
          const finEntity = record.getField('finEntity').getLookupData(companyOrgCode);
          // 发票币种
          const currencyCode = detailInfoDS.current.getField('currencyCode').getValue();
          // 公司本体币
          const { description } = detailInfoDS.current
            .getField('companyOrgCode')
            .getLookupData(companyOrgCode);
          if (description !== currencyCode) {
            // 当公司主体属于值集RS_IP_INVOICETAX_SIGN_ENTITY中的公司主体，但申请单上的币种并非主体的本位币时，申请人提交审批时必须填写（税务）发票汇率字段，允许财务复核时修改。
            if (org.value) {
              return true;
            } else if (finEntity.value) {
              // 当公司主体属于值集RS_FIN_INVOICETAX_SIGN_ENTITY中的公司主体，但申请单上的币种并非主体的本位币时，申请人提交审批时非必填（税务）发票汇率字段，财务复核时必填且可以修改。
              if (loginName === requestEmployeeNum) {
                return false;
              } else {
                return true;
              }
            }
          }
        },
      },
    },
    {
      name: 'sscSuggestion',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.invoice.sscSuggestion`).d('(税务)SSC意见'),
    },
  ],
  events: {
    create: ({ record }) => {
      record.set('excludingTaxAmount', 0);
      record.set('invoiceAmount', 0);
      record.set('invoiceTaxAmount', 0);
    },
    update: ({ dataSet, record, name }) => {
      if (
        name === 'invoiceAmount' ||
        name === 'invoiceTaxAmount' ||
        name === 'excludingTaxAmount'
      ) {
        const currencyCode = detailInfoDS.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        const invoiceAmount = dataSet.records.reduce((total, currentValue) => {
          return total + currentValue.get('invoiceAmount');
        }, 0);
        dataSet.parent.current.set(
          'totalAmount',
          Number(numberRender(invoiceAmount, precision, false))
        );
      }
      if (['invoiceAmount', 'payExchangeRate'].includes(name)) {
        if (
          Number.isFinite(record.get('invoiceAmount')) &&
          Number.isFinite(record.get('payExchangeRate'))
        ) {
          const payAmount = parseFloat(
            (record.get('invoiceAmount') * record.get('payExchangeRate')).toFixed(2)
          );
          record.set('payAmount', payAmount);
        } else {
          record.set('payAmount', undefined);
        }
      }
    },
    remove: ({ dataSet }) => {
      const currencyCode = detailInfoDS.current.get('currencyCode');
      const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
      const invoiceAmount = dataSet.records.reduce((total, currentValue) => {
        return total + currentValue.get('invoiceAmount');
      }, 0);
      dataSet.parent.current.set(
        'totalAmount',
        Number(numberRender(invoiceAmount, precision, false))
      );
    },
  },
});

export default invoiceInfo;
