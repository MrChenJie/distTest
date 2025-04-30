import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export const resaleQueryDS = ({ commonPrompt }) => ({
  autoQuery: false,
  name: 'resaleQueryDS',
  pageSize: 10,
  autoLocateFirst: false,
  transport: {
    read: (config) => {
      if (
        config.data.currencyCode ||
        config.data.requestDepartment ||
        config.data.vendorCompanyName
      ) {
        let { data } = config;
        if (config.data.currencyCode) {
          data = { ...data, currencyCode: config.data.currencyCode.currencyCode };
        }
        if (config.data.requestDepartment) {
          data = { ...data, requestDepartment: config.data.requestDepartment.unitCode };
        }
        if (config.data.vendorCompanyName) {
          data = { ...data, vendorCompanyName: config.data.vendorCompanyName.vendorName };
        }
        const newConfig = { ...config, data };
        return {
          ...newConfig,
          url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/selectRequest`,
          method: 'GET',
        };
      } else {
        return {
          ...config,
          url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/selectRequest`,
          method: 'GET',
        };
      }
    },
    //  删除
    destroy: (config) => {
      return {
        ...config,
        url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests`,
        method: 'DELETE',
      };
    },
  },
  events: {
    query: ({ dataSet }) => {
      const { queryDataSet } = dataSet;
      const { current } = queryDataSet;
      current.save();
      return true;
    },
  },
  fields: [
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestNum`).d('付款申请编号'),
    },
    {
      name: 'requestStatusMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态'),
    },
    {
      name: 'approvalStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节'),
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestTitle`).d('付款申请标题'),
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.invoiceNum`).d('发票号码'),
    },
    {
      name: 'companyOrgName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.companyOrgName`).d('采购签约主体'),
    },
    {
      name: 'invoiceAmount',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.query.invoiceAmount`).d('付款申请原币金额（含税）'),
    },
    {
      name: 'currencyCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.currencyCode`).d('币种'),
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号'),
    },
    {
      name: 'vendorCompanyName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyName`).d('供应商名称'),
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人'),
    },
    {
      name: 'draftEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.draftEmployeeName`).d('起草人'),
    },
    {
      name: 'requestDepartmentMeaning',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门'),
    },
    {
      name: 'requestDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.query.requestDate`).d('申请日期'),
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
      label: intl.get(`${commonPrompt}.view.query.requestNum`).d('付款申请编号'),
      labelWidth: 172,
    },
    {
      name: 'requestEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人'),
      labelWidth: 172,
    },
    {
      name: 'draftEmployeeName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.draftEmployeeName`).d('起草人'),
      labelWidth: 172,
    },
    {
      name: 'requestTitle',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestTitle`).d('付款申请标题'),
      labelWidth: 172,
    },
    {
      name: 'companyOrgCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.companyOrgName`).d('采购签约主体'),
      labelWidth: 172,
      lookupCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
      valueField: 'value',
    },
    {
      name: 'requestStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态'),
      labelWidth: 172,
      lookupCode: 'SPCM.COST_REQUEST_STATUS',
      valueField: 'value',
    },
    {
      name: 'requestDepartment',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门'),
      labelWidth: 172,
      lovCode: 'SPRM.USER_UNIT',
      lovPara: { tenantId: getCurrentOrganizationId() },
    },
    {
      name: 'currencyCode',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.query.currencyCode`).d('发票币种'),
      labelWidth: 172,
      lovCode: 'HPFM.CURRENCY',
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
    },
    {
      name: 'vendorCompanyNum',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号'),
      labelWidth: 172,
    },
    {
      name: 'circuitNumber',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.circuitNumber`).d('客户电路编号'),
      labelWidth: 172,
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
      name: 'contractNo',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.contractNo`).d('采购合同编号'),
      labelWidth: 172,
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
      name: 'poNumber',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.poNumber`).d('采购订单编号'),
      labelWidth: 172,
    },
    {
      name: 'approvalStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节'),
      lookupCode: 'RS_IP_APPROVAL_NODE',
      lovPara: {
        key: 'Z',
      },
      lookupAxiosConfig: () => ({
        transformResponse: (data) => {
          if (Array.isArray(data)) {
            return data.filter((item) => item.tag && item.tag.includes('Z'));
          } else {
            try {
              const a = JSON.parse(data);
              if (Array.isArray(a)) {
                return a.filter((item) => item.tag && item.tag.includes('Z'));
              }
            } catch (e) {
              console.log(e);
            }
          }
        },
      }),
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
      name: 'paymentOwnerName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.paymentOwnerName`).d('下沉付款责任人'),
      labelWidth: 172,
    },
    {
      name: 'circuitRoleType',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.circuitRoleType`).d('主理人/代理人'),
      lookupCode: 'SRSP.ESTIMATE_CIRCUIT_ROLE_TYPE',
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
      name: 'pendingApportionFlag',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.query.pendingApportionFlag`).d('是否待摊'),
      lookupCode: 'HPFM.FLAG',
      labelWidth: 172,
    },
  ],
});
