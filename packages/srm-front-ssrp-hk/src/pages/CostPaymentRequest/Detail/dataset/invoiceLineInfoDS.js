import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import { numberRender } from 'utils/renderer';
import { notification } from 'choerodon-ui';

notification.config({
  placement: 'bottomRight',
  duration: 6.0,
});

const cacheMap = new Map();
const organizationId = getCurrentOrganizationId();

// /v1/{organizationId}/cost-detail-lines/sum/{costInvoiceId}
async function sumLines(costInvoiceId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines/sum/${costInvoiceId}`, {
    method: 'GET',
  });
}

function updateInvoiceHeaderAmount(dataSet = {}, precision, fieldName = '', headerName = '') {
  if (!dataSet.parent.current) {
    return false;
  }
  const { records, parent } = dataSet;
  const { current } = parent;
  const costInvoiceId = current.get('costInvoiceId');
  const originalData = cacheMap.get(`originalData-${costInvoiceId}`) || [];

  const oldAmount = sum(originalData.map((item) => item[fieldName] || 0));
  const newAmount = sum(records.map((item) => item.get(fieldName) || 0));
  const headerAmount = (current.getPristineValue(headerName) || 0) + newAmount - oldAmount;
  current.set(headerName, Number(numberRender(headerAmount, precision, false)));
}

const invoiceLineInfo = ({ detailInfoDS, prompt, onDeleteSuccess = (e) => e }) => ({
  name: 'costDetailLineInfo',
  autoCreate: false,
  autoQuery: false,
  paging: true,
  autoLocateAfterCreate: false,
  primaryKey: 'costDetailLineId',
  cacheSelection: true,
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
      dynamicProps: {
        lovPara: () => {
          const customerPayFlag = detailInfoDS.current.get('customerPayFlag');
          return { attribute2: customerPayFlag };
        },
      },
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
      name: 'poNumber',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.poNumber`).d('采购订单编号'),
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
    },
    {
      name: 'lineCompanyOrgCode',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.lineCompanyOrgName`).d('成本主体'),
      lookupCode: 'VP.COST_PAYMENT_COST_CENTER',
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
      dynamicProps: {
        required: ({ record }) => {
          const isCircuitIdRequired = record.get('isCircuitIdRequired');
          return isCircuitIdRequired === 'Y';
        },
      },
    },
    {
      name: 'isCircuitIdRequired',
      type: FieldType.string,
    },
    {
      name: 'referenceNumber',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.referenceNumber`).d('事务处理编号'),
    },
    {
      name: 'coaMapAttribute3',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.coaMapAttribute3`).d('coaMapAttribute3'),
    },
    {
      name: 'expectRecycleDate',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.detail.line.expectRecycleDate`).d('预期回收时间'),
      dynamicProps: {
        required: ({ record }) => {
          const coaMapAttribute3 = record.get('coaMapAttribute3');
          return +coaMapAttribute3 === 1;
        },
        disabled: ({ record }) => {
          const coaMapAttribute3 = record.get('coaMapAttribute3');
          return +coaMapAttribute3 === 0;
        },
      },
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
          if (record.get('invoiceTaxAmount')) {
            record.set('invoiceTaxAmount', null);
          }
          record.set('excludingTaxAmount', lineAmount);
        });
      }
    },
    create: ({ dataSet }) => {
      const { parent } = dataSet;
      const { current } = parent;
      current.set('vendorSiteCode', null);
    },
    remove: ({ dataSet, records }) => {
      const currencyCode = detailInfoDS.current.get('currencyCode');
      const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
      const { parent } = dataSet;
      const { current } = parent;
      current.set('vendorSiteCode', null);
      const costInvoiceId = current.get('costInvoiceId');
      // 行删除 需把发票行金额、税额、不含税金额重新统计

      // 调用后端接口，查询表里所有发票行的 发票行金额、发票税额、发票不含税金额汇总
      sumLines(costInvoiceId).then((res) => {
        if (getResponse(res)) {
          const { lineAmountSum, invoiceTaxAmountSum, excludingTaxAmountSum } = res;

          // 统计删除发票明细行上的 发票行金额
          const invoiceAmount = records.reduce((total, currentValue) => {
            return total + currentValue.getPristineValue('lineAmount');
          }, 0);
          // 统计删除发票明细行上的 发票税额
          const taxAmount = records.reduce((total, currentValue) => {
            return total + currentValue.getPristineValue('invoiceTaxAmount');
          }, 0);

          // 统计删除发票明细行上的 发票不含税金额
          const excludingTaxAmount = records.reduce((total, currentValue) => {
            return total + currentValue.getPristineValue('excludingTaxAmount');
          }, 0);

          // 发票行金额、税额、不含税金额重新统计 到发票头
          dataSet.parent.current.set(
            'invoiceAmount',
            Number(numberRender(lineAmountSum - invoiceAmount, precision, false))
          );
          dataSet.parent.current.set(
            'invoiceTaxAmount',
            Number(numberRender(invoiceTaxAmountSum - taxAmount, precision, false))
          );
          dataSet.parent.current.set(
            'excludingTaxAmount',
            Number(numberRender(excludingTaxAmountSum - excludingTaxAmount, precision, false))
          );
        }
      });
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
        updateInvoiceHeaderAmount(dataSet, precision, 'lineAmount', 'invoiceAmount');
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
        updateInvoiceHeaderAmount(dataSet, precision, 'invoiceTaxAmount', 'invoiceTaxAmount');
      } else if (name === 'excludingTaxAmount') {
        const currencyCode = detailInfoDS.current.get('currencyCode');
        const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;

        // 统计发票明细行上的 发票不含税金额 到发票头
        updateInvoiceHeaderAmount(dataSet, precision, 'excludingTaxAmount', 'excludingTaxAmount');
      } else if(name === 'coaMapAttribute3' && +value === 0) {
        record.set('expectRecycleDate', null);
      }
    },
  },
  feedback: {
    submitSuccess: (resp) => {
      if (resp.success) {
        onDeleteSuccess();
      }
    },
    loadSuccess: (resp) => {
      if (resp && resp.content) {
        const { content = [] } = resp;
        const { costInvoiceId } = content[0] || {};
        if (costInvoiceId) {
          cacheMap.set(
            `originalData-${costInvoiceId}`,
            content.map((item) => ({ ...item }))
          );
        }
      }
    },
  },
});

export default invoiceLineInfo;
