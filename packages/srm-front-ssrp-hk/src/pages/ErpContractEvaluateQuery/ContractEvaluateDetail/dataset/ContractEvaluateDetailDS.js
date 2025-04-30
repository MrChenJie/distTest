import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { isObject } from 'lodash';
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';

const ERP = '/hscm-erp';
export const evaluateDetailDS = ({ props, commonPrompt }) => ({
  // autoQuery: !!props.location.query,
  autoQuery: true,
  primaryKey: 'contractId',
  selection: false,
  pageSize: 10,
  transport: {
    read: (config) => {
      if (config.data.needDepartmentObj) {
        // console.log(config);
        let { data } = config;
        data = { ...data, needDepartment: config.data.needDepartmentObj.unitName };
        const newConfig = { ...config, data };
        // console.log(newConfig);
        return {
          ...newConfig,
          url: `${ERP}/v1/contract-infos/contract/evaluate/detail`,
          method: 'GET',
        };
      } else {
        return {
          ...config,
          url: `${ERP}/v1/contract-infos/contract/evaluate/detail`,
          method: 'GET',
        };
      }
    },
    /* read: {
      url: `${ERP}/v1/contract-infos/contract/evaluate/detail`,
      method: 'GET',
    }, */
  },
  fields: [
    {
      name: 'contractNo',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.contractNo`).d('合同编码'),
    },
    {
      name: 'contractName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.contractName`).d('合同名称'),
    },
    {
      name: 'vendorName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.vendorName`).d('供应商名称'),
    },
    {
      name: 'needDepart',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.needDepart`).d('需求部'),
    },
    {
      name: 'needDepartment',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部门'),
    },
    {
      name: 'evaluateUser',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.evaluateUser`).d('评分人'),
    },
    {
      name: 'approvalDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.approvalDate`).d('审批日期'),
    },
    {
      name: 'evaluateDate',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.evaluateDate`).d('评估日期'),
    },
    {
      name: 'score',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.score`).d('评估分数'),
    },
  ],
  queryFields: [
    {
      name: 'contractNo',
      label: intl.get(`${commonPrompt}.view.contractNo`).d('合同编号'),
      type: FieldType.string,
      labelWidth: 172,
    },
    {
      name: 'contractName',
      label: intl.get(`${commonPrompt}.view.contractName`).d('合同名称'),
      type: FieldType.string,
      labelWidth: 172,
    },
    {
      name: 'vendorName',
      label: intl.get(`${commonPrompt}.view.vendorName`).d('供应商名称'),
      type: FieldType.string,
      defaultValue: (props.location.query || {}).vendorName,
      labelWidth: 172,
    },
    {
      name: 'needDepart',
      label: intl.get(`${commonPrompt}.view.needDepart`).d('需求部'),
      type: FieldType.object,
      defaultValue: (props.location.query || {}).needDepart,
      lovCode: 'SPFM.USER_UNIT_DEPART',
      lovPara: { tenantId: getCurrentOrganizationId() },
      transformRequest(value) {
        if (isObject(value)) {
          return (value || {}).unitName;
        } else {
          return value;
        }
      },
    },
    // {
    //   name: 'needDepartment',
    //   label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部门'),
    //   type: FieldType.string,
    //   //defaultValue: (props.location.query || {}).needDepartment,
    // },
    // {
    //   name: 'needDepartmentObj',
    //   label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部'),
    //   type: FieldType.object,
    //   defaultValue: (props.location.query || {}).needDepartment,
    //   lovCode: 'SPFM.EIP_DEPARTMENT_LOV',
    //   lovPara: { tenantId: getCurrentOrganizationId() },
    // },
    {
      name: 'evaluateDateType',
      label: intl.get(`${commonPrompt}.view.evaluateDateType`).d('评估时间维度'),
      type: FieldType.string,
      lookupCode: 'VA.EVALUATION_TIME_DIMENSION',
      defaultValue: (props.location.query || {}).evaluateDateType,
      // required: true,
    },
    {
      name: 'evaluateUser',
      label: intl.get(`${commonPrompt}.view.evaluateUser`).d('评估人'),
      type: FieldType.string,
    },
    {
      name: 'dateFrom',
      label: intl.get(`${commonPrompt}.view.dateFrom`).d('日期从'),
      type: FieldType.date,
      defaultValue: (props.location.query || {}).dateFrom,
      // required: true,
    },
    {
      name: 'dateTo',
      label: intl.get(`${commonPrompt}.view.dateTo`).d('日期至'),
      type: FieldType.date,
      defaultValue: (props.location.query || {}).dateTo,
      // required: true,
    },
    // {
    //   name: 'needDepart',
    //   label: intl.get(`${commonPrompt}.view.needDepart`).d('需求部'),
    //   type: FieldType.string,
    // },
  ],
});
