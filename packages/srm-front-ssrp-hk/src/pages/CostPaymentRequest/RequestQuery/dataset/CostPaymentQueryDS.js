/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: chenwu
 * @Email: wu.chen01@hand-china.com
 * @Date: 2020/10/9 15:17
 */
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

export const costPaymentQueryDS = ({ commonPrompt }) => ({
  autoQuery: true,
  name: 'costPaymentQueryDS',
  pageSize: 10,
  autoLocateFirst: false,
  transport: {
    read: (config) => {
      if (config.data.currencyCode || config.data.requestDepartment) {
        let { data } = config;
        if (config.data.currencyCode) {
          data = { ...data, currencyCode: config.data.currencyCode.currencyCode };
        }
        if (config.data.requestDepartment) {
          data = { ...data, requestDepartment: config.data.requestDepartment.unitCode };
        }
        const newConfig = { ...config, data };
        return {
          ...newConfig,
          url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests`,
          method: 'GET',
        };
      } else {
        return {
          ...config,
          url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests`,
          method: 'GET',
        };
      }
    },
    //  删除
    destroy: (config) => {
      return {
        ...config,
        url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests`,
        method: 'DELETE',
      };
    },
  },
  events: {
    // 删除记录前事件
    // beforeDelete: ({ records })=> {
    //   // 判断记录的单据申请状态（可删除付款申请单据状态为‘草稿’单据）
    //   return records.every(v => {
    //     return v.data.requestStatusMeaning !== 'DRAFT';
    //   });
    // },
  },
  fields: [
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestNum`).d('申请编号'),
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人'),
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestTitle`).d('申请标题'),
    },
    {
      name: 'companyOrgName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.companyOrgName`).d('公司主体'),
    },
    {
      name: 'requestStatusMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态'),
    },
    {
      name: 'approvalStatusMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节'),
    },
    {
      name: 'requestDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.requestDate`).d('申请日期'),
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.invoiceNum`).d('发票号码'),
    },
    {
      name: 'invoiceDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.invoiceDate`).d('发票日期'),
    },
    {
      name: 'vendorCompanyName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyName`).d('供应商名称'),
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号'),
    },
    {
      name: 'requestDepartment',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门'),
    },
    {
      name: 'importEbsDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.importEbsDate`).d('导入EBS日期'),
    },
    {
      name: 'currencyCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.currencyCode`).d('发票币种'),
    },
    {
      name: 'invoiceAmount',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceAmount`).d('发票金额'),
    },
    {
      name: 'invoiceHkAmountTotal',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceHkAmountTotal`).d('港币总金额 (含税)'),
    },
    {
      name: 'pendingApportionFlagMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.pendingApportionFlag`).d('是否待摊'),
    },
    {
      name: 'sourceCodeMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.sourceCode`).d('创建方式'),
    },
    {
      name: 'payAdviceFileCnt',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.payAdviceFileCnt`).d('付款凭证'),
    },
    {
      name: 'checkDateFlag',
      type: FieldType.string,
    },
  ],
  // 查询
  queryFields: [
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestNum`).d('申请编号'),
      labelWidth: 172,
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人'),
      labelWidth: 172,
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestTitle`).d('申请标题'),
      labelWidth: 172,
    },
    {
      name: 'companyOrgCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.companyOrgCode`).d('公司主体'),
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
      labelWidth: 172,
    },
    {
      name: 'requestStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态'),
      lookupCode: 'SPCM.COST_REQUEST_STATUS',
      labelWidth: 172,
    },
    {
      name: 'requestDepartment',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门'),
      lovCode: 'SPRM.USER_UNIT',
      lovPara: { tenantId: getCurrentOrganizationId() },
      labelWidth: 172,
    },
    {
      name: 'currencyCode',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.currencyCode`).d('发票币种'),
      lovCode: 'HPFM.CURRENCY',
      labelWidth: 172,
    },
    {
      name: 'requestDateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.requestDateFrom`).d('申请日期从'),
      labelWidth: 172,
    },
    {
      name: 'requestDateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.requestDateTo`).d('申请日期至'),
      labelWidth: 172,
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.invoiceNum`).d('发票号码'),
      labelWidth: 172,
    },
    {
      name: 'invoiceDateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.invoiceDateFrom`).d('发票日期从'),
      labelWidth: 172,
    },
    {
      name: 'invoiceDateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.invoiceDateTo`).d('发票日期至'),
      labelWidth: 172,
    },
    {
      name: 'vendorCompanyName',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyName`).d('供应商名称'),
      labelWidth: 172,
      lovCode: 'SSLM.COST_SUPPLIER_INFO_URL',
      transformRequest: (value) => {
        if (value && typeof value === 'object') {
          return value.vendorName;
        }
      },
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号'),
      labelWidth: 172,
    },
    {
      name: 'costBigCategory',
      type: FieldType.object,
      lovCode: 'SPCM.COST_COA_MAPPING',
      textField: 'costBigCategory',
      label: intl.get(`${commonPrompt}.view.detail.line.costBigCategory`).d('成本大类'),
      transformRequest: (value) => {
        if (value && typeof value === 'object') {
          return value.costBigCategory;
        }
      },
    },
    {
      name: 'invoiceAmountFrom',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceAmountFrom`).d('发票金额从'),
      labelWidth: 172,
    },
    {
      name: 'invoiceAmountTo',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceAmountTo`).d('发票金额至'),
      labelWidth: 172,
    },
    {
      name: 'approvalStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节'),
      lookupCode: 'RS_IP_APPROVAL_NODE',
      lovPara: {
        key: 'C',
      },
      labelWidth: 172,
      lookupAxiosConfig: () => ({
        transformResponse: (data) => {
          if (Array.isArray(data)) {
            return data.filter((item) => item.tag && item.tag.includes('C'));
          } else {
            try {
              const a = JSON.parse(data);
              if (Array.isArray(a)) {
                return a.filter((item) => item.tag && item.tag.includes('C'));
              }
            } catch (e) {
              console.log(e);
            }
          }
        },
      }),
    },
    {
      name: 'importEbsDateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.importEbsDateFrom`).d('导入EBS日期从'),
      labelWidth: 172,
    },
    {
      name: 'importEbsDateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.importEbsDateTo`).d('导入EBS日期至'),
      labelWidth: 172,
    },
    {
      name: 'currentNodeNameQuery',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.currentNodeNameQuery`).d('当前节点处理人'),
      labelWidth: 172,
      lovCode: 'SPFM.CURRENT_NODE_HANDLER',
      lovPara: { tenantId: getCurrentOrganizationId() },
      transformRequest: (value) => {
        if (value && typeof value === 'object') {
          return value.employeeNum;
        }
      },
    },
    {
      name: 'invoiceHkAmountTotalFrom',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceHkAmountTotalFrom`).d('港币总金额从'),
      labelWidth: 172,
    },
    {
      name: 'invoiceHkAmountTotalTo',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceHkAmountTotalTo`).d('港币总金额至'),
      labelWidth: 172,
    },
    {
      name: 'sourceCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.sourceCode`).d('创建方式'),
      lookupCode: 'SRSP.PAYMENT_REQUEST_SOURCE',
      labelWidth: 172,
    },
    {
      name: 'isPrepayFlag',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.isPrepayFlag`).d('是否预付款核销'),
      lookupCode: 'SPFM.YES_NO',
      labelWidth: 172,
    },
    {
      name: 'termsDateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.termsDateFrom`).d('发票到期日从'),
      labelWidth: 172,
    },
    {
      name: 'termsDateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.termsDateTo`).d('发票到期日至'),
      labelWidth: 172,
    },
    {
      name: 'pressLevel',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.pressLevel`).d('紧急程度'),
      lookupCode: 'SPCM.COST_PRESS_LEVEL',
      labelWidth: 172,
    },
    {
      name: 'expectPaymentDateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.expectPaymentDateFrom`).d('期望付款日期从'),
      labelWidth: 172,
    },
    {
      name: 'expectPaymentDateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.expectPaymentDateTo`).d('期望付款日期至'),
      labelWidth: 172,
    },
    {
      name: 'payAdviceFlag',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.payAdviceFlag`).d('付款凭证'),
      lookupCode: 'SPCM.PAYMENT_ADVICE_FLAG',
      labelWidth: 172,
    },
    {
      name: 'circuitIdQuery',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.circuitIdQuery`).d('客户电路编号'),
      labelWidth: 172,
    },
    {
      name: 'pendingApportionFlag',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.pendingApportionFlag`).d('是否待摊'),
      lookupCode: 'HPFM.FLAG',
      labelWidth: 172,
    },
  ],
});
