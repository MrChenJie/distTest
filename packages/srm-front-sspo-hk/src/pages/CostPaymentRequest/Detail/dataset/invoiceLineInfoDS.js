import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { notification } from 'choerodon-ui';

notification.config({
  placement: 'bottomRight',
  duration: 6.0,
});

const invoiceLineInfo = (detailInfoDS, prompt) => ({
  name: 'costDetailLineInfo',
  autoCreate: false,
  autoQuery: false,
  paging: false,
  autoLocateAfterCreate: false,
  primaryKey: 'costDetailLineId',
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
      name: 'costDetailLineId',
      type: FieldType.number,
    },
    {
      name: 'lineNum',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.lineNum`).d('行号'),
    },
    {
      name: 'costBigCategory',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.costBigCategory`).d('成本大类'),
    },
    {
      name: 'costSmallCategory',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.costSmallCategory`).d('成本小类'),
    },
    {
      name: 'vendorSiteCode',
      type: FieldType.string,
    },
    {
      name: 'costProductCategoryName',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.line.costProductCategoryCode`).d('成本项目类型'),
      lovCode: 'SPCM.COST_COA_MAPPING',
      required: true,
    },
    {
      name: 'costProductCategoryCode',
      type: FieldType.string,
    },
    {
      name: 'remarks',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.remarks`).d('描述'),
      required: true,
    },
    {
      name: 'costInvoiceType',
      type: FieldType.string,
    },
    {
      name: 'serviceStartDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.line.serviceStartDate`).d('发票服务开始日期'),
      required: true,
      help: intl
        .get(`${prompt}.view.detail.line.serviceStartDate.help`)
        .d('请选择实际发票服务开始日期'),
      max: 'serviceEndDate',
    },
    {
      name: 'serviceEndDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.line.serviceEndDate`).d('发票服务结束日期'),
      required: true,
      help: intl
        .get(`${prompt}.view.detail.line.serviceEndDate.help`)
        .d('请选择实际发票服务结束日期'),
      min: 'serviceStartDate',
    },
    {
      name: 'contractId',
      type: FieldType.string,
    },
    {
      name: 'contractNo',
      type: FieldType.object,
      label: intl.get(`${prompt}.view.detail.line.contractNo`).d('合同编号'),
      lovCode: 'SPCM.COST_CONTRACT_INFO',
    },
    {
      name: 'contractName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.contractName`).d('合同名称'),
    },
    {
      name: 'lineCompanyOrgName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.lineCompanyOrgName`).d('成本主体'),
      lookupCode: 'VP.COST_PAYMENT_COST_CENTER',
    },
    {
      name: 'lineCompanyOrgCode',
      type: FieldType.string,
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
    },
    {
      name: 'lineAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.lineAmount`).d('发票行金额(原币含税)'),
      required: true,
      step: 0.01,
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'invoiceTaxAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.invoiceTaxAmount`).d('发票税额(原币)'),
      step: 0.01,
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'excludingTaxAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.excludingTaxAmount`).d('发票行金额(原币不含税)'),
      step: 0.01,
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'pendingApportionFlag',
      type: FieldType.boolean,
      label: intl.get(`${prompt}.view.detail.line.pendingApportionFlag`).d('是否待摊'),
      defaultValue: '0',
      falseValue: '0',
      trueValue: '1',
    },
    {
      name: 'apportionStartDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.line.apportionStartDate`).d('待摊开始时间'),
      min: 'serviceStartDate',
      max: 'serviceEndDate',
    },
    {
      name: 'apportionEndDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.detail.line.apportionEndDate`).d('待摊结束时间'),
      min: 'apportionStartDate',
      max: 'serviceEndDate',
    },
    {
      name: 'pendingApportionAmount',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.pendingApportionAmount`).d('待摊金额'),
      step: 0.01,
      transformRequest: (value, record) => {
        const { dataSet } = record;
        const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        const fractionDigits = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        if (typeof value === 'number') {
          return Number(value.toFixed(fractionDigits));
        }
      },
    },
    {
      name: 'coaAccountId',
      type: FieldType.number,
      label: intl.get(`${prompt}.view.detail.line.swiftCode`).d('COA'),
    },
    {
      name: 'circuitId',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.circuitId`).d('Circuit ID'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      const ouOrgCode = detailInfoDS.current.get('ouOrgCode');
      if (ouOrgCode === 'CMI') {
        // 当请求行明细数据时 申请头的主体为总部CMI时 需把行上的税额清空
        if (!dataSet.records.length) return;
        dataSet.records.forEach((record) => {
          const lineAmount = record.get('lineAmount');
          record.set('lineAmount', lineAmount);
          record.set('invoiceTaxAmount', null);
          record.set('excludingTaxAmount', lineAmount);
        });
      }
    },
    create: ({ dataSet }) => {
      const { parent } = dataSet;
      const { current } = parent;
      current.set('vendorSiteCode', null);
    },
    remove: ({ dataSet }) => {
      const currencyCode = detailInfoDS.current.get('currencyCode');
      const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
      const { parent } = dataSet;
      const { current } = parent;
      current.set('vendorSiteCode', null);
      // 行删除 需把发票行金额、税额、不含税金额重新统计

      // 统计发票明细行上的 发票行金额 到发票头
      const invoiceAmount = dataSet.records.reduce((total, currentValue) => {
        return total + currentValue.get('lineAmount');
      }, 0);
      dataSet.parent.current.set(
        'invoiceAmount',
        Number(numberRender(invoiceAmount, precision, false))
      );

      // 统计发票明细行上的 发票税额 到发票头
      const taxAmount = dataSet.records.reduce((total, currentValue) => {
        return total + currentValue.get('invoiceTaxAmount');
      }, 0);
      dataSet.parent.current.set(
        'invoiceTaxAmount',
        Number(numberRender(taxAmount, precision, false))
      );

      // 统计发票明细行上的 发票不含税金额 到发票头
      const excludingTaxAmount = dataSet.records.reduce((total, currentValue) => {
        return total + currentValue.get('excludingTaxAmount');
      }, 0);
      dataSet.parent.current.set(
        'excludingTaxAmount',
        Number(numberRender(excludingTaxAmount, precision, false))
      );
    },
    update: ({ dataSet, record, name, value, oldValue }) => {
      if (name === 'lineAmount') {
        const currencyCode = detailInfoDS.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        // 发票行金额(原币含税) - 发票税额(原币) = 发票行金额(原币不含税)
        let lineAmount = value;
        const invoiceTaxAmount = record.get('invoiceTaxAmount') || 0;
        if (lineAmount > 0 && invoiceTaxAmount > value) {
          notification.error({
            message: intl
              .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.large`)
              .d('当发票行含税金额大于0时，发票税额(原币)不应大于发票行金额(原币含税)'),
          });
          record.set('lineAmount', oldValue);
          lineAmount = oldValue;
        } else if (lineAmount < 0 && invoiceTaxAmount < value) {
          notification.error({
            message: intl
              .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.small`)
              .d('当发票行含税金额小于0时，发票税额(原币)不应小于发票行金额(原币含税)'),
          });
          record.set('lineAmount', oldValue);
          lineAmount = oldValue;
        }
        const excludingTaxAmount = Number(
          numberRender(lineAmount - invoiceTaxAmount, precision, false)
        );
        record.set('excludingTaxAmount', excludingTaxAmount);

        // 统计发票明细行上的 发票行金额 到发票头
        const invoiceAmount = dataSet.records.reduce((total, currentValue) => {
          return total + currentValue.get('lineAmount');
        }, 0);
        dataSet.parent.current.set(
          'invoiceAmount',
          Number(numberRender(invoiceAmount, precision, false))
        );
      } else if (name === 'invoiceTaxAmount') {
        // 发票行金额(原币含税) - 发票税额(原币) = 发票行金额(原币不含税)
        const currencyCode = detailInfoDS.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
        const lineAmount = record.get('lineAmount') || 0;
        let invoiceTaxAmount = record.get('invoiceTaxAmount') || 0;
        if (lineAmount > 0 && invoiceTaxAmount > lineAmount) {
          notification.error({
            message: intl
              .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.large`)
              .d('当发票行含税金额大于0时，发票税额(原币)不应大于发票行金额(原币含税)'),
          });
          record.set('invoiceTaxAmount', oldValue);
          invoiceTaxAmount = oldValue;
        } else if (lineAmount < 0 && invoiceTaxAmount < lineAmount) {
          notification.error({
            message: intl
              .get(`${prompt}.view.line-invoice.error.invoiceTaxAmount.too.small`)
              .d('当发票行含税金额小于0时，发票税额(原币)不应小于发票行金额(原币含税)'),
          });
          record.set('invoiceTaxAmount', oldValue);
          invoiceTaxAmount = oldValue;
        }
        const excludingTaxAmount = Number(
          numberRender(lineAmount - invoiceTaxAmount, precision, false)
        );
        record.set('excludingTaxAmount', excludingTaxAmount);

        // 统计发票明细行上的 发票税额 到发票头
        const taxAmount = dataSet.records.reduce((total, currentValue) => {
          return total + currentValue.get('invoiceTaxAmount');
        }, 0);
        dataSet.parent.current.set(
          'invoiceTaxAmount',
          Number(numberRender(taxAmount, precision, false))
        );
      } else if (name === 'excludingTaxAmount') {
        const currencyCode = detailInfoDS.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;

        // 统计发票明细行上的 发票不含税金额 到发票头
        const excludingTaxAmount = dataSet.records.reduce((total, currentValue) => {
          return total + currentValue.get('excludingTaxAmount');
        }, 0);
        dataSet.parent.current.set(
          'excludingTaxAmount',
          Number(numberRender(excludingTaxAmount, precision, false))
        );
      }
    },
  },
});

export default invoiceLineInfo;
