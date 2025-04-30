import { DataSet } from 'choerodon-ui/pro';
import { Modal } from 'hzero-ui';
import { sum, isNil, round } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import requireAttachmentDS from './requireAttachmentDS';
import coaCombination from './coaCombinationDS';

const organizationId = getCurrentOrganizationId();
const cacheMap = new Map();
let queryFlag = false; // 防止同时发起多次查询

function getAllResaleDetailLineList(dataSet = {}) {
  const allData = dataSet.toData();
  let resaleDetailLineList = [];
  allData.forEach((item) => {
    resaleDetailLineList = resaleDetailLineList.concat(item.resaleDetailLineList || []);
  });
  return resaleDetailLineList;
}

// function caculateVendorSiteCode(dataSet = {}) {
//   const { current } = dataSet.parent;
//   if (!current) {
//     return false;
//   }
//   const { records } = dataSet;
//   if (records && records.length > 0) {
//     const businessCodes = records
//       .map((item) => {
//         console.log(item.get('coaBusiness'));
//         return item.get('coaBusiness');
//       })
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
//     const vendorSiteCode = businessCodeCount[0] ? `A-${businessCodeCount[0].code}` : undefined;
//     current.set('vendorSiteCode', vendorSiteCode);
//   }
// }

function updateInvoiceHeaderAmount(dataSet = {}) {
  if (!dataSet.parent.current) {
    return false;
  }
  const { records } = dataSet;
  const originalData =
    cacheMap.get(`originalData-${dataSet.parent.current.get('costInvoiceId')}`) || [];
  // 汇率
  const conversionRate = dataSet.parent.parent.current.get('conversionRate') || 1;

  // 原始数据的发票金额(原币不含税)汇总
  const originalExcludingTaxAmount = sum(
    originalData.map((item) => {
      const { oneTimeAmount = 0, periodicAmount = 0, otherFeeAmount = 0 } = item;
      return oneTimeAmount + periodicAmount + otherFeeAmount;
    })
  );
  // 新数据发票金额(原币不含税)汇总
  const newExcludingTaxAmount = sum(
    records.map((item) => {
      const oneTimeAmount = item.get('oneTimeAmount') || 0;
      const periodicAmount = item.get('periodicAmount') || 0;
      const otherFeeAmount = item.get('otherFeeAmount') || 0;
      return oneTimeAmount + periodicAmount + otherFeeAmount;
    })
  );
  // 发票头发票金额(原币不含税)汇总
  const excludingTaxAmount =
    (dataSet.parent.current.getPristineValue('excludingTaxAmount') || 0) +
    newExcludingTaxAmount -
    originalExcludingTaxAmount;

  // 原始数据发票行税额汇总
  const originalInvoiceTaxAmount = sum(originalData.map((item) => item.lineTaxAmount || 0));
  // 新数据发票行税额汇总
  const newInvoiceTaxAmount = sum(records.map((item) => item.get('lineTaxAmount') || 0));
  // 发票头发票行税额汇总
  const invoiceTaxAmount =
    (dataSet.parent.current.getPristineValue('invoiceTaxAmount') || 0) +
    newInvoiceTaxAmount -
    originalInvoiceTaxAmount;

  const bankFreesAmount = dataSet.parent.current.get('bankFreesAmount') || 0;
  // 发票金额(原币含税)
  const invoiceAmount = excludingTaxAmount + invoiceTaxAmount + bankFreesAmount;
  // 发票金额(HKD)
  const invoiceHkAmount = invoiceAmount * conversionRate;
  dataSet.parent.current.set('excludingTaxAmount', excludingTaxAmount);
  dataSet.parent.current.set('invoiceTaxAmount', invoiceTaxAmount);
  dataSet.parent.current.set('invoiceAmount', invoiceAmount);
  dataSet.parent.current.set('invoiceHkAmount', invoiceHkAmount);
}

function getDiffValue(dataSet = {}, poNumber, poLineNum, key) {
  const { records } = dataSet;
  if (records) {
    const allOriginalSum = Array.from(cacheMap.keys())
      .filter((k) => k.includes('originalData'))
      .map((k) => {
        const originalData = cacheMap.get(k) || [];
        return sum(
          originalData
            .filter((item) => item.poNumber === poNumber && item.poLineNum === poLineNum)
            .map((item) => item[key] || 0)
        );
      });
    const originalSum = sum(allOriginalSum);
    const newSum = sum(
      getAllResaleDetailLineList(dataSet.parent)
        .filter((item) => item.poNumber === poNumber && item.poLineNum === poLineNum)
        .map((item) => item[key] || 0)
    );
    return newSum - originalSum;
  }
  return 0;
}

async function getTotalAmount(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/resale-detail-lines/getTotalAmount`, {
    method: 'GET',
    query: params,
  });
}

async function getScaleByCurrencyCode(currencyCode) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/getScaleByCurrencyCode`,
    {
      method: 'GET',
      query: {
        currencyCode,
      },
    }
  );
}

// 更新待摊金额
async function updatePendingApportionAmount(currencyCode, record, pendingApportionAmount) {
  try {
    const res = await getScaleByCurrencyCode(currencyCode);
    if (getResponse(res)) {
      const { scale } = res;
      record.set('pendingApportionAmount', Number(pendingApportionAmount.toFixed(scale)));
      return true;
    }
    return false;
  } catch (err) {
    console.log(`获取币种精度错误：${err}`);
    return false;
  }
}

export default ({
  costRequestId,
  onDeleteSuccess = (e) => e,
  onQuery = (e) => e,
  onLoadSuccess = (e) => e,
}) => ({
  name: 'invoiceLine',
  // autoQuery: true,
  autoQueryAfterSubmit: true,
  autoCreate: false,
  primaryKey: 'resaleLineId',
  paging: true,
  pageSize: 10,
  cacheSelection: true,
  selection: 'multiple',
  children: {
    resaleLineFiles: new DataSet(requireAttachmentDS({ onDeleteSuccess })),
    costCoaAccount: new DataSet(coaCombination({ name: 'costCoaAccount' })),
    taxCoaAccount: new DataSet(coaCombination({ name: 'taxCoaAccount' })),
  },
  fields: [
    {
      name: 'poHeaders',
      bind: 'resaleDetailLine.poHeaders',
      type: 'object',
    },
    {
      name: 'resaleLineId',
      bind: 'resaleDetailLine.resaleLineId',
    },
    {
      name: 'poHeadersId',
      bind: 'resaleDetailLine.poHeadersId',
    },
    {
      name: 'poType',
      bind: 'resaleDetailLine.poHeaders.poType',
    },
    {
      name: 'poNumber',
      label: intl.get(`spcm.paymentRequest.model.poNumber`).d('采购订单编号'),
      bind: 'resaleDetailLine.poNumber',
    },
    {
      name: 'contractName',
      label: intl.get(`spcm.paymentRequest.model.contractName`).d('合同名称'),
      bind: 'resaleDetailLine.contractName',
    },
    {
      name: 'salesContractId',
      bind: 'resaleDetailLine.salesContractId',
    },
    {
      name: 'salesContractNum',
      label: intl.get(`spcm.paymentRequest.model.salesContractNum`).d('销售合同编号'),
      bind: 'resaleDetailLine.salesContractNum',
    },
    {
      name: 'circuitNumber',
      label: intl.get(`spcm.paymentRequest.model.circuitNumber`).d('客户电路编号'),
      bind: 'resaleDetailLine.poHeaders.circuitNumber',
    },
    {
      name: 'poLineId',
      bind: 'resaleDetailLine.poLineId',
    },
    {
      name: 'poLineNum',
      label: intl.get(`spcm.paymentRequest.model.poLineNum`).d('订单行'),
      bind: 'resaleDetailLine.poLineNum',
    },
    {
      name: 'lineStatus',
      label: intl.get(`spcm.paymentRequest.model.lineStatus`).d('订单行状态'),
      bind: 'resaleDetailLine.lineStatus',
    },
    {
      name: 'lineStatusMeaning',
      label: intl.get(`spcm.paymentRequest.model.lineStatus`).d('订单行状态'),
      bind: 'resaleDetailLine.lineStatusMeaning',
    },
    {
      name: 'serviceType',
      label: intl.get(`spcm.paymentRequest.model.serviceType`).d('Service Type'),
      bind: 'resaleDetailLine.serviceType',
    },
    {
      name: 'serviceTypeMeaning',
      label: intl.get(`spcm.paymentRequest.model.serviceType`).d('Service Type'),
      bind: 'resaleDetailLine.serviceTypeMeaning',
    },
    {
      name: 'itemAttributes',
      label: intl.get(`spcm.paymentRequest.model.itemAttributes`).d('属性描述'),
      bind: 'resaleDetailLine.itemAttributes',
    },
    {
      name: 'deductFlag',
      label: intl.get(`spcm.paymentRequest.model.deductFlag`).d('增值税是否可抵扣'),
      bind: 'resaleDetailLine.deductFlag',
      type: 'string',
    },
    {
      name: 'milestoneLineNum',
      label: intl.get(`spcm.paymentRequest.model.milestoneLineNum`).d('阶段行号'),
      bind: 'resaleDetailLine.milestoneLineNum',
    },
    {
      name: 'milestoneName',
      label: intl.get(`spcm.paymentRequest.model.milestoneName`).d('里程碑名称'),
      bind: 'resaleDetailLine.milestoneName',
    },
    {
      name: 'poLineAmount',
      label: intl.get(`spcm.paymentRequest.model.poLineAmount`).d('订单行金额'),
      bind: 'resaleDetailLine.poLineAmount',
      defaultValue: 1000,
    },
    {
      name: 'oneTimeExcludingAmount',
      label: intl
        .get(`spcm.paymentRequest.model.oneTimeExcludingAmount`)
        .d('NRC订单里程碑金额(原币不含税)'),
      bind: 'resaleDetailLine.oneTimeExcludingAmount',
      defaultValue: 0,
    },
    {
      name: 'oneTimeApplyAmount',
      label: intl
        .get(`spcm.paymentRequest.model.oneTimeApplyAmount`)
        .d('NRC已申请金额(原币不含税)'),
      bind: 'resaleDetailLine.oneTimeApplyAmount',
      defaultValue: 0,
    },
    {
      name: 'oneTimeAmount',
      label: intl.get(`spcm.paymentRequest.model.oneTimeAmount`).d('NRC发票金额(原币不含税)'),
      bind: 'resaleDetailLine.oneTimeAmount',
      type: 'number',
      // step: 0.01,
      // validator: (value, name, record) => {
      //   if (typeof value === 'number') {
      //     const sumAmount = value + record.get('oneTimeApplyAmount');
      //     if (typeof sumAmount === 'number' && sumAmount > record.get('oneTimeExcludingAmount')) {
      //       return intl
      //         .get(`spcm.paymentRequest.view.message.validator.oneTimeAmount`)
      //         .d(
      //           'NRC发票金额(原币不含税)与NRC已申请金额（原币不含税）之和不能大于NRC订单里程碑金额（原币不含税）'
      //         );
      //     }
      //   }
      // },
      dynamicProps: {
        disabled: ({ record }) =>
          !(isNil(record.get('periodicAmount')) || record.get('periodicAmount') === 0),
      },
      // min: 0,
    },
    {
      name: 'otherFeeAmount',
      label: intl.get(`spcm.paymentRequest.model.otherFeeAmount`).d('其他费用金额'),
      bind: 'resaleDetailLine.otherFeeAmount',
      type: 'number',
      dynamicProps: {
        disabled: ({ record }) =>
          !(isNil(record.get('periodicAmount')) || record.get('periodicAmount') === 0),
      },
      help: intl
        .get(`spcm.costPayment.view.detail.line.otherFeeAmount.help`)
        .d('记录因业务原因产生的NRC费用或者其他费用的金额'),
    },
    {
      name: 'otherFeeReason',
      label: intl.get(`spcm.paymentRequest.model.otherFeeReason`).d('其他费用产生原因'),
      bind: 'resaleDetailLine.otherFeeReason',
      type: 'string',
      maxLength: 1000,
      dynamicProps: {
        disabled: ({ record }) =>
          !(isNil(record.get('periodicAmount')) || record.get('periodicAmount') === 0),
        required: ({ record }) => {
          const otherFeeAmount = record.get('otherFeeAmount');
          return Number.isFinite(otherFeeAmount) && otherFeeAmount !== 0;
        },
      },
    },
    {
      name: 'alTaxAmount',
      type: 'number',
      bind: 'resaleDetailLine.alTaxAmount',
    },
    {
      name: 'taxAmount',
      type: 'number',
      bind: 'resaleDetailLine.taxAmount',
    },
    {
      name: 'taxApplyAmount',
      label: intl.get(`spcm.paymentRequest.model.taxApplyAmount`).d('已申请税额'),
      bind: 'resaleDetailLine.taxApplyAmount',
    },
    {
      name: 'lineTaxAmount',
      label: intl.get(`spcm.paymentRequest.model.lineTaxAmount`).d('发票行税额'),
      bind: 'resaleDetailLine.lineTaxAmount',
      type: 'number',
      // step: 0.01,
      validator: (value, name, record) => {
        if (record.get('deductFlag') === 'N') {
          if (record.get('lineTaxAmount') + record.get('alTaxAmount') > record.get('taxAmount')) {
            return intl
              .get(`spcm.paymentRequest.message.validator.lineTaxAmount`)
              .d('发票行税额之和要小于等于订单行税额');
          }
        }
      },
      // dynamicProps: {
      //   type: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 'number' : 'currency';
      //   },
      //   step: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
      //   },
      // },
      // min: 0,
    },
    {
      name: 'lineAmount',
      label: intl.get(`spcm.paymentRequest.model.lineAmount`).d('发票行金额(原币含税)'),
      bind: 'resaleDetailLine.lineAmount',
    },
    {
      name: 'lineHkAmount',
      label: intl.get(`spcm.paymentRequest.model.lineHkAmount`).d('发票行港币金额'),
      bind: 'resaleDetailLine.lineHkAmount',
    },
    // {
    //   name: 'withholdingTaxAmount',
    //   label: intl.get(`spcm.paymentRequest.model.withholdingTaxAmount`).d('预提稅金额(原币)'),
    //   step: 0.01,
    //   defaultValue: 0.0,
    //   type: 'number',
    //   bind: 'resaleDetailLine.withholdingTaxAmount',
    // },
    // {
    //   name: 'withholdingTaxVendorNum',
    //   label: intl.get(`spcm.paymentRequest.model.withholdingTaxVendorNum`).d('预提税税务机构编号'),
    //   bind: 'resaleDetailLine.withholdingTaxVendorNum',
    //   type: 'object',
    //   lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
    //   textField: 'venderNum',
    //   valueField: 'vendorNum',
    //   dynamicProps: {
    //     lovPara: ({ dataSet }) => {
    //       return {
    //         orgCode: dataSet.parent.parent.current.get('ouOrgCode'),
    //       };
    //     },
    //     required: ({ record }) => {
    //       return (
    //         typeof record.get('withholdingTaxAmount') === 'number' &&
    //         record.get('withholdingTaxAmount') > 0
    //       );
    //     },
    //     disabled: ({ record }) => {
    //       return (
    //         typeof record.get('withholdingTaxAmount') !== 'number' ||
    //         record.get('withholdingTaxAmount') <= 0
    //       );
    //     },
    //   },
    //   transformRequest: (value) => {
    //     if (isObject(value)) {
    //       return value.vendorNum;
    //     } else {
    //       return value;
    //     }
    //   },
    // },
    // {
    //   name: 'withholdingTaxVendorName',
    //   label: intl.get(`spcm.paymentRequest.model.withholdingTaxVendorName`).d('预提税税务机构名称'),
    //   bind: 'resaleDetailLine.withholdingTaxVendorName',
    //   type: 'string',
    // },
    {
      name: 'coaCombination',
      label: intl.get(`spcm.paymentRequest.model.coaCombination`).d('COA组合'),
      bind: 'resaleDetailLine.coaCombination',
    },
    {
      name: 'isFlowFlag',
      label: intl.get(`spcm.paymentRequest.model.isFlowFlag`).d('是否按使用量'),
      bind: 'resaleDetailLine.poLines.isFlowFlag',
    },
    {
      name: 'usageNote',
      label: intl.get(`spcm.paymentRequest.model.usageNote`).d('使用量备注'),
      bind: 'resaleDetailLine.poLines.usageNote',
    },
    {
      name: 'cycleMethod',
      label: intl.get(`spcm.paymentRequest.model.cycleMethod`).d('周期结算方式'),
      bind: 'resaleDetailLine.poLines.cycleMethod',
      disabled: true,
      lookupCode: 'RS_PO_BILLINGCYCLE',
      type: 'string',
      help: intl
        .get(`spcm.costPayment.view.detail.line.cycleMethod.help`)
        .d('增加说明描述，中英文提示语等财务提供。'),
    },
    {
      name: 'cycleMethodMeaning',
      label: intl.get(`spcm.paymentRequest.model.cycleMethod`).d('周期结算方式'),
      bind: 'resaleDetailLine.poLines.cycleMethodMeaning',
    },
    {
      name: 'terms',
      label: intl.get(`spcm.paymentRequest.model.terms`).d('期数'),
      bind: 'resaleDetailLine.poLines.terms',
      help: intl
        .get(`spcm.costPayment.view.detail.line.terms.help`)
        .d('增加说明描述，中英文提示语等财务提供。'),
    },
    {
      name: 'orderServiceStartDate',
      label: intl.get(`spcm.paymentRequest.model.orderServiceStartDate`).d('订单服务开始日期'),
      bind: 'resaleDetailLine.poLines.serviceStartDate',
    },
    {
      name: 'orderServiceEndDate',
      label: intl.get(`spcm.paymentRequest.model.orderServiceEndDate`).d('订单服务结束日期'),
      bind: 'resaleDetailLine.poLines.serviceEndDate',
    },
    {
      name: 'lastServiceEndDate',
      label: intl.get(`spcm.paymentRequest.model.lastServiceEndDate`).d('最近服务结束日期'),
      bind: 'resaleDetailLine.lastServiceEndDate',
    },
    {
      name: 'periodicExcludingAmount',
      label: intl
        .get(`spcm.paymentRequest.model.periodicExcludingAmount`)
        .d('周期性订单金额（原币不含税）'),
      defaultValue: 0,
      bind: 'resaleDetailLine.periodicExcludingAmount',
    },
    {
      name: 'periodicApplyAmount',
      label: intl
        .get(`spcm.paymentRequest.model.periodicApplyAmount`)
        .d('周期性已申请金额（原币不含税）'),
      bind: 'resaleDetailLine.periodicApplyAmount',
      defaultValue: 0,
    },
    {
      name: 'currentUsage',
      label: intl.get(`spcm.paymentRequest.model.currentUsage`).d('本次使用量'),
      bind: 'resaleDetailLine.currentUsage',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('periodicAmount') > 0 && record.get('isFlowFlag') === 'Y';
        },
      },
    },
    {
      name: 'periodicAmount',
      label: intl.get(`spcm.paymentRequest.model.periodicAmount`).d('周期性发票金额(原币不含税)'),
      bind: 'resaleDetailLine.periodicAmount',
      type: 'number',
      dynamicProps: {
        disabled: ({ record }) =>
          !(isNil(record.get('oneTimeAmount')) || record.get('oneTimeAmount') === 0) ||
          !(isNil(record.get('otherFeeAmount')) || record.get('otherFeeAmount') === 0),
      },
      // dynamicProps: {
      //   type: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 'number' : 'currency';
      //   },
      //   step: ({ dataSet }) => {
      //     const currencyCode = dataSet.parent.parent.current.get('currencyCode');
      //     return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
      //   },
      // },
      // min: 0,
    },
    {
      name: 'overweightAmount',
      label: intl.get(`spcm.paymentRequest.model.overweightAmount`).d('超量金额（原币不含税）'),
      bind: 'resaleDetailLine.overweightAmount',
      transformRequest: (value, record) => {
        if (record.get('periodicAmount') - record.get('periodicExcludingAmount') < 0) {
          return 0;
        } else {
          return record.get('periodicAmount') - record.get('periodicExcludingAmount');
        }
      },
      help: intl.get(`spcm.costPayment.view.detail.line.overweightAmount.help`).d('MRC difference'),
    },
    {
      name: 'overweightReason',
      label: intl.get(`spcm.paymentRequest.model.overweightReason`).d('超量原因'),
      type: 'string',
      validator: (value, name, record) => {
        if (record.get('periodicAmount') - record.get('periodicExcludingAmount') > 0) {
          if (!value || String(value).trim().length === 0) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get(`spcm.paymentRequest.model.excessAmount`).d('超量原因'),
            });
          }
        }
      },
      bind: 'resaleDetailLine.overweightReason',
    },
    {
      name: 'serviceStartDate',
      label: intl.get(`spcm.paymentRequest.model.invoiceServiceStartDate`).d('发票服务开始日期'),
      type: 'date',
      max: 'serviceEndDate',
      bind: 'resaleDetailLine.serviceStartDate',
      help: intl
        .get(`spcm.costPayment.view.detail.line.serviceStartDate.help`)
        .d('请选择实际发票服务开始日期'),
      dynamicProps: {
        required: ({ record }) => {
          const periodicAmount = record.get('periodicAmount');
          const oneTimeAmount = record.get('oneTimeAmount');
          const otherFeeAmount = record.get('otherFeeAmount');
          return (
            (typeof periodicAmount === 'number' && periodicAmount !== 0) ||
            (typeof oneTimeAmount === 'number' && oneTimeAmount !== 0) ||
            (typeof otherFeeAmount === 'number' && otherFeeAmount !== 0)
          );
        },
        disabled: ({ record }) => {
          return (
            (typeof record.get('periodicAmount') !== 'number' ||
              record.get('periodicAmount') === 0) &&
            (typeof record.get('oneTimeAmount') !== 'number' ||
              record.get('oneTimeAmount') === 0) &&
            (typeof record.get('otherFeeAmount') !== 'number' || record.get('otherFeeAmount') === 0)
          );
        },
      },
    },
    {
      name: 'serviceEndDate',
      label: intl.get(`spcm.paymentRequest.model.invoiceServiceEndDate`).d('发票服务结束日期'),
      type: 'date',
      min: 'serviceStartDate',
      bind: 'resaleDetailLine.serviceEndDate',
      help: intl
        .get(`spcm.costPayment.view.detail.line.serviceEndDate.help`)
        .d('请选择实际发票服务结束日期'),
      dynamicProps: {
        required: ({ record }) => {
          const periodicAmount = record.get('periodicAmount');
          const oneTimeAmount = record.get('oneTimeAmount');
          const otherFeeAmount = record.get('otherFeeAmount');
          return (
            (typeof periodicAmount === 'number' && periodicAmount !== 0) ||
            (typeof oneTimeAmount === 'number' && oneTimeAmount !== 0) ||
            (typeof otherFeeAmount === 'number' && otherFeeAmount !== 0)
          );
        },
        disabled: ({ record }) => {
          return (
            (typeof record.get('periodicAmount') !== 'number' ||
              record.get('periodicAmount') === 0) &&
            (typeof record.get('oneTimeAmount') !== 'number' ||
              record.get('oneTimeAmount') === 0) &&
            (typeof record.get('otherFeeAmount') !== 'number' || record.get('otherFeeAmount') === 0)
          );
        },
      },
    },
    {
      name: 'pendingApportionFlag',
      label: intl.get(`spcm.paymentRequest.model.pendingApportionFlag`).d('是否待摊'),
      type: 'boolean',
      defaultValue: false,
      bind: 'resaleDetailLine.pendingApportionFlag',
      transformRequest: (value) => {
        return value ? '1' : '0';
      },
      transformResponse: (value) => {
        return value === '1';
      },
    },
    {
      name: 'apportionStartDate',
      label: intl.get(`spcm.paymentRequest.model.apportionStartDate`).d('待摊开始日期'),
      type: 'date',
      bind: 'resaleDetailLine.apportionStartDate',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('pendingApportionFlag');
        },
        max: ({ record, dataSet }) => {
          const { current } = dataSet.parent.parent;
          if (current && !['DRAFT', 'REVOKE'].includes(current.get('requestStatus'))) {
            return record.get('apportionEndDate')
              ? record.get('apportionEndDate')
              : record.get('serviceEndDate');
          }
        },
        min: ({ record, dataSet }) => {
          const { current } = dataSet.parent.parent;
          if (current && !['DRAFT', 'REVOKE'].includes(current.get('requestStatus'))) {
            return record.get('serviceStartDate');
          }
        },
      },
      // min: 'serviceStartDate',
    },
    {
      name: 'apportionEndDate',
      label: intl.get(`spcm.paymentRequest.model.apportionEndDate`).d('待摊结束日期'),
      type: 'date',
      bind: 'resaleDetailLine.apportionEndDate',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('pendingApportionFlag');
        },
        min: ({ record, dataSet }) => {
          const { current } = dataSet.parent.parent;
          if (current && !['DRAFT', 'REVOKE'].includes(current.get('requestStatus'))) {
            return record.get('apportionStartDate')
              ? record.get('apportionStartDate')
              : record.get('serviceStartDate');
          }
        },
        max: ({ record, dataSet }) => {
          const { current } = dataSet.parent.parent;
          if (current && !['DRAFT', 'REVOKE'].includes(current.get('requestStatus'))) {
            return record.get('serviceEndDate');
          }
        },
      },
      // max: 'serviceEndDate',
    },
    {
      name: 'pendingApportionAmount',
      label: intl.get(`spcm.paymentRequest.model.pendingApportionAmount`).d('待摊金额'),
      // type: 'number',
      bind: 'resaleDetailLine.pendingApportionAmount',
      // step: 0.01,
      defaultValue: 0,
      type: 'number',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('pendingApportionFlag');
        },
        max: ({ record }) => {
          return record.get('periodicAmount') || record.get('oneTimeAmount');
        },
        // type: ({ dataSet }) => {
        //   const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        //   return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 'number' : 'currency';
        // },
        // step: ({ dataSet }) => {
        //   const currencyCode = dataSet.parent.parent.current.get('currencyCode');
        //   return ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
        // },
      },
      // max: 'periodicAmount',
      // min: 0,
    },
    {
      name: 'currencyCode',
      label: intl.get(`spcm.paymentRequest.model.currency`).d('原币种'),
      bind: 'resaleDetailLine.poHeaders.currencyCode',
    },
    {
      name: 'currencyCodeMeaning',
      label: intl.get(`spcm.paymentRequest.model.currency`).d('原币种'),
      bind: 'resaleDetailLine.poHeaders.currencyCodeMeaning',
    },
    {
      name: 'supplierCode',
      label: intl.get(`spcm.paymentRequest.model.supplierCode`).d('供应商编号'),
      bind: 'resaleDetailLine.poHeaders.supplierCode',
    },
    {
      name: 'supplierName',
      label: intl.get(`spcm.paymentRequest.model.supplierName`).d('供应商名称'),
      bind: 'resaleDetailLine.supplierName',
    },
    {
      name: 'cmiEntity',
      label: intl.get(`spcm.paymentRequest.model.cmiContractSigningEntity`).d('CMI签约主体'),
      bind: 'resaleDetailLine.poHeaders.cmiEntity',
    },
    {
      name: 'cmiEntityMeaning',
      label: intl.get(`spcm.paymentRequest.model.cmiContractSigningEntity`).d('CMI签约主体'),
      bind: 'resaleDetailLine.poHeaders.cmiEntityMeaning',
    },
    {
      name: 'contractEntity',
      label: intl.get(`spcm.paymentRequest.model.contractEntity`).d('销售签约主体'),
      bind: 'resaleDetailLine.contractEntity',
    },
    {
      name: 'supplierCircuitNumber',
      label: intl.get(`spcm.paymentRequest.model.supplierCircuitNumber`).d('供应商电路编号'),
      bind: 'resaleDetailLine.poHeaders.supplierCircuitNumber',
    },
    {
      name: 'requiredAttachment',
      label: intl.get(`spcm.paymentRequest.model.requiredAttachment`).d('必要附件'),
      bind: 'resaleDetailLine.requiredAttachment',
      help: intl.get(`spcm.paymentRequest.tip.milestone.mandatoryAttachments`).d('里程碑必要附件'),
    },
    {
      name: 'actualExpenseSegment',
      type: 'object',
      label: intl.get(`spcm.paymentRequest.model.actualExpenseSegment`).d('待摊科目'),
      lovCode: 'CMI_COA_ACCT',
      transformRequest: (value) => {
        if (typeof value === 'object') {
          return value.value;
        } else {
          return value;
        }
      },
      bind: 'resaleDetailLine.actualExpenseSegment',
      defaultValue: { value: '1151038001', meaning: '1151038001' },
    },
    {
      name: 'withholdingTaxSegment',
      type: 'object',
      label: intl.get(`spcm.paymentRequest.model.withholdingTaxSegment`).d('预提税科目'),
      lovCode: 'CMI_COA_ACCT',
      transformRequest: (value) => {
        if (typeof value === 'object') {
          return value.value;
        } else {
          return value;
        }
      },
      bind: 'resaleDetailLine.withholdingTaxSegment',
    },
    {
      name: 'coaBusiness',
      type: 'string',
      transformResponse: (value, object) => {
        if (!value) {
          const { costCoaAccount } = object;
          if (Array.isArray(costCoaAccount) && costCoaAccount[0]) {
            return costCoaAccount[0].coaSegment5;
          }
        } else {
          return value;
        }
      },
    },
    {
      name: 'poMilestonesId',
      bind: 'resaleDetailLine.poMilestonesId',
    },
    {
      name: 'poLineTaxAmount', // 订单行税额
      bind: 'resaleDetailLine.poLineTaxAmount',
      type: 'number',
      label: intl.get(`spcm.paymentRequest.model.poLineTaxAmount`).d('订单行税额'),
    },
    {
      name: 'contractNo',
      bind: 'resaleDetailLine.contractNo',
    },
    {
      name: 'poStatus',
      bind: 'resaleDetailLine.poHeaders.poStatus',
    },
    {
      name: 'poStatusMeaning',
      label: intl.get(`spcm.paymentRequest.model.poStatus`).d('采购订单状态'),
      bind: 'resaleDetailLine.poHeaders.poStatusMeaning',
    },
  ],
  events: {
    update: ({ record, name, value, dataSet, oldValue }) => {
      if (name === 'pendingApportionFlag') {
        if (value) {
          const date = new Date();
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          if (month === 12) {
            year++;
            month = 0;
          }
          const nextMonth = month + 1;
          const serviceStartDate = record.get('serviceStartDate');
          const serviceEndDate = record.get('serviceEndDate');
          const apportionStartDate = `${year}-${nextMonth.toString().padStart(2, 0)}-01`;
          if (
            moment.isMoment(serviceStartDate) &&
            moment.isMoment(serviceEndDate) &&
            serviceEndDate.isAfter(moment(apportionStartDate))
          ) {
            if (
              serviceStartDate.isBefore(moment(apportionStartDate)) &&
              serviceEndDate.diff(serviceStartDate, 'days') < 31
            ) {
              record.set('apportionStartDate', undefined);
              record.set('apportionEndDate', undefined);
              record.set('pendingApportionAmount', 0);
            } else {
              record.set(
                'apportionStartDate',
                serviceStartDate.isAfter(moment(apportionStartDate))
                  ? serviceStartDate
                  : apportionStartDate
              );
              record.set('apportionEndDate', serviceEndDate);
            }
          }
        } else {
          record.set('apportionStartDate', undefined);
          record.set('apportionEndDate', undefined);
          record.set('pendingApportionAmount', 0);
        }
      }
      if (name === 'withholdingTaxVendorNum') {
        if (value) {
          record.set('withholdingTaxVendorName', value.vendorName);
        } else {
          record.set('withholdingTaxVendorName', undefined);
        }
      }
      if (['oneTimeAmount', 'periodicAmount', 'lineTaxAmount', 'otherFeeAmount'].includes(name)) {
        updateInvoiceHeaderAmount(dataSet);
      }
      if (name === 'periodicAmount') {
        if (typeof value !== 'number' || value <= 0) {
          record.set('serviceStartDate', undefined);
          record.set('serviceEndDate', undefined);
        }
      }
      if (name === 'oneTimeAmount') {
        if (typeof value !== 'number' || value <= 0) {
          record.set('serviceStartDate', undefined);
          record.set('serviceEndDate', undefined);
        }

        const poNumber = record.get('poNumber');
        const poLineNum = record.get('poLineNum');
        const diffValue = getDiffValue(dataSet, poNumber, poLineNum, 'oneTimeAmount');
        if (costRequestId) {
          getTotalAmount({
            costRequestId,
            poNumber,
            poLineNum,
          }).then((res) => {
            const response = getResponse(res);
            if (response) {
              const { oneTimeAmount } = response;
              const oneTimeAmountSum = oneTimeAmount + diffValue;
              if (
                round(oneTimeAmountSum + (record.get('oneTimeApplyAmount') || 0), 8) >
                (record.get('poLineAmount') || 0)
              ) {
                Modal.warning({
                  title: intl
                    .get('spcm.paymentRequest.waring.message.tooLarge.oneTimeAmount')
                    .d('NRC发票金额之和大于订单行金额'),
                  onOk: () => {
                    record.set('oneTimeAmount', oldValue);
                  },
                });
              }
            } else {
              record.set('oneTimeAmount', oldValue);
            }
          });
        } else {
          const { parent } = dataSet;
          const allResaleDetailLineList = getAllResaleDetailLineList(parent);
          const filteredResaleDetailLineList = allResaleDetailLineList.filter(
            (item) => item.poNumber === poNumber && item.poLineNum === poLineNum
          );
          const oneTimeAmountSum = sum(
            filteredResaleDetailLineList.map((item) => item.oneTimeAmount)
          );
          if (
            round(oneTimeAmountSum + (record.get('oneTimeApplyAmount') || 0), 8) >
            (record.get('poLineAmount') || 0)
          ) {
            Modal.warning({
              title: intl
                .get('spcm.paymentRequest.waring.message.tooLarge.oneTimeAmount')
                .d('NRC发票金额之和大于订单行金额'),
              onOk: () => {
                record.set('oneTimeAmount', oldValue);
              },
            });
          }
        }
      }

      if (name === 'lineTaxAmount') {
        const poNumber = record.get('poNumber');
        const poLineNum = record.get('poLineNum');

        const diffValue = getDiffValue(dataSet, poNumber, poLineNum, 'lineTaxAmount');
        if (costRequestId) {
          getTotalAmount({
            costRequestId,
            poNumber,
            poLineNum,
          }).then((res) => {
            const response = getResponse(res);
            if (response) {
              const { lineTaxAmount } = response;
              const lineTaxAmountSum = lineTaxAmount + diffValue;
              const deductFlag = record.get('deductFlag');
              if (
                round(lineTaxAmountSum + (record.get('taxApplyAmount') || 0), 8) >
                  (record.get('poLineTaxAmount') || 0) &&
                deductFlag === 'N'
              ) {
                Modal.warning({
                  title: intl
                    .get('spcm.paymentRequest.waring.message.tooLarge.lineTaxAmount')
                    .d('发票行税额之和大于订单行税额'),
                  onOk: () => {
                    record.set('lineTaxAmount', oldValue);
                  },
                });
              }
            } else {
              record.set('lineTaxAmount', oldValue);
            }
          });
        } else {
          const { parent } = dataSet;
          const allResaleDetailLineList = getAllResaleDetailLineList(parent);
          const filteredResaleDetailLineList = allResaleDetailLineList.filter(
            (item) => item.poNumber === poNumber && item.poLineNum === poLineNum
          );
          const lineTaxAmountSum = sum(
            filteredResaleDetailLineList.map((item) => item.lineTaxAmount)
          );
          const deductFlag = record.get('deductFlag');
          if (
            round(lineTaxAmountSum + (record.get('taxApplyAmount') || 0), 8) >
              (record.get('poLineTaxAmount') || 0) &&
            deductFlag === 'N'
          ) {
            Modal.warning({
              title: intl
                .get('spcm.paymentRequest.waring.message.tooLarge.lineTaxAmount')
                .d('发票行税额之和大于订单行税额'),
              onOk: () => {
                record.set('lineTaxAmount', oldValue);
              },
            });
          }
        }
      }

      if (name === 'apportionStartDate') {
        if (value && record.get('apportionEndDate') && record.get('serviceStartDate')) {
          const allDays =
            moment(record.get('serviceEndDate')).diff(
              moment(record.get('serviceStartDate')),
              'days'
            ) + 1;
          // 待摊天数
          const apportionDays =
            moment(record.get('apportionEndDate')).diff(moment(value), 'days') + 1;
          const amount = record.get('periodicAmount') || record.get('oneTimeAmount');
          const pendingApportionAmount = (amount * apportionDays) / allDays;
          const currencyCode = dataSet.parent.parent.current.get('currencyCode');

          updatePendingApportionAmount(currencyCode, record, pendingApportionAmount);
        }
      }
      if (name === 'apportionEndDate') {
        if (value && record.get('apportionStartDate') && record.get('serviceStartDate')) {
          const allDays =
            moment(record.get('serviceEndDate')).diff(
              moment(record.get('serviceStartDate')),
              'days'
            ) + 1;
          // 待摊天数
          const apportionDays =
            moment(value).diff(moment(record.get('apportionStartDate')), 'days') + 1;
          const currencyCode = dataSet.parent.parent.current.get('currencyCode');
          const amount = record.get('periodicAmount') || record.get('oneTimeAmount');
          const pendingApportionAmount = (amount * apportionDays) / allDays;
          updatePendingApportionAmount(currencyCode, record, pendingApportionAmount);
        }
      }

      if (name === 'serviceStartDate') {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month === 12) {
          year++;
          month = 0;
        }
        const nextMonth = month + 1;
        const apportionStartDate = `${year}-${nextMonth.toString().padStart(2, 0)}-01`;
        const serviceEndDate = record.get('serviceEndDate');
        if (
          moment.isMoment(value) &&
          moment.isMoment(serviceEndDate) &&
          record.get('pendingApportionFlag')
        ) {
          if (
            value.isBefore(moment(apportionStartDate)) &&
            serviceEndDate.diff(value, 'days') < 31
          ) {
            record.set('apportionStartDate', undefined);
            record.set('apportionEndDate', undefined);
            record.set('pendingApportionAmount', 0);
            record.set('pendingApportionFlag', false);
          } else {
            // 待摊开始日期
            record.set('apportionStartDate', undefined);
            record.set(
              'apportionStartDate',
              value.isAfter(moment(apportionStartDate)) ? value : apportionStartDate
            );
          }
        } else {
          record.set('apportionStartDate', undefined);
          record.set('apportionEndDate', undefined);
          record.set('pendingApportionAmount', 0);
          record.set('pendingApportionFlag', false);
        }
      }

      if (name === 'serviceEndDate') {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month === 12) {
          year++;
          month = 0;
        }
        const nextMonth = month + 1;
        const serviceStartDate = record.get('serviceStartDate');
        const apportionStartDate = `${year}-${nextMonth.toString().padStart(2, 0)}-01`;
        if (
          moment.isMoment(value) &&
          moment.isMoment(serviceStartDate) &&
          value.isAfter(moment(apportionStartDate)) &&
          record.get('pendingApportionFlag')
        ) {
          if (
            serviceStartDate.isBefore(moment(apportionStartDate)) &&
            value.diff(serviceStartDate, 'days') < 31
          ) {
            record.set('apportionStartDate', undefined);
            record.set('apportionEndDate', undefined);
            record.set('pendingApportionAmount', 0);
            record.set('pendingApportionFlag', false);
          } else {
            record.set('apportionEndDate', value);
            record.set(
              'apportionStartDate',
              serviceStartDate.isAfter(moment(apportionStartDate))
                ? serviceStartDate
                : apportionStartDate
            );
          }
        } else {
          record.set('apportionStartDate', undefined);
          record.set('apportionEndDate', undefined);
          record.set('pendingApportionAmount', 0);
          record.set('pendingApportionFlag', false);
        }
      }

      if (name === 'otherFeeAmount') {
        if (isNil(value) || value === 0) {
          record.set('otherFeeReason', undefined);
        }
      }
    },
    remove: ({ dataSet }) => {
      updateInvoiceHeaderAmount(dataSet);
      // caculateVendorSiteCode(dataSet);
    },
    // create: ({ dataSet }) => {
    //   caculateVendorSiteCode(dataSet);
    // },
    query: () => {
      if (queryFlag) {
        return false;
      }
      queryFlag = true;
      onQuery();
    },
  },
  transport: {
    destroy: ({ data, dataSet }) => {
      const { cachedSelected } = dataSet;

      const sendData = [
        ...cachedSelected.map((item) => {
          const d = item.toData();
          return {
            ...d.resaleDetailLine,
            ...d,
          };
        }),
        ...data.map((item) => ({
          ...item.resaleDetailLine,
          ...item,
        })),
      ];
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/resale-detail-lines`,
        method: 'DELETE',
        data: sendData,
      };
    },
    read: ({ dataSet }) => {
      if (dataSet.parent.current) {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/resale-detail-lines`,
          method: 'GET',
        };
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
        const { resaleDetailLine = {} } = content[0] || {};
        const { costInvoiceId } = resaleDetailLine;
        if (costInvoiceId) {
          cacheMap.set(
            `originalData-${costInvoiceId}`,
            content.map((item) => item.resaleDetailLine)
          );
        }
        onLoadSuccess();
      }
      queryFlag = false;
    },
    loadFailed: () => {
      queryFlag = false;
    },
  },
});
