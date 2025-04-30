/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: songceng
 * @Email: cengceng.song@hand-china.com
 * @Date: 2020-08-26 16:58:42
 * @LastEditors: songceng
 * @LastEditTime: 2020-08-28 11:57:02
 */
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';

const ERP = '/hscm-erp';
export const evaluateQueryDS = ({ commonPrompt }) => ({
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: (config) => {
      if (config.data.needDepartmentObj) {
        console.log(config);
        let { data } = config;
        data = { ...data, needDepart: config.data.needDepartmentObj.unitName };
        const newConfig = { ...config, data };
        console.log(newConfig);
        return {
          ...newConfig,
          url: `${ERP}/v1/contract-infos/contract/evaluate/summary`,
          method: 'GET',
        };
      } else {
        return {
          ...config,
          url: `${ERP}/v1/contract-infos/contract/evaluate/summary`,
          method: 'GET',
        };
      }
    },
  },
  fields: [
    {
      name: 'evaluateDateType',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.evaluateDateType`).d('评估时间维度'),
      lookupCode: 'VA.EVALUATION_TIME_DIMENSION',
    },
    {
      name: 'dateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.dateFrom`).d('日期从'),
    },
    {
      name: 'dateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.dateTo`).d('日期至'),
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
    // {
    //   name: 'needDepartment',
    //   type: FieldType.string,
    //   label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部门'),
    // },
    {
      name: 'totalScore',
      type: FieldType.number,
      label: intl.get(`${commonPrompt}.view.totalScore`).d('汇总得分'),
    },
  ],
  queryFields: [
    {
      name: 'evaluateDateType',
      type: FieldType.string,
      labelWidth: 172,
      label: intl.get(`${commonPrompt}.view.evaluateDateType`).d('评估时间维度'),
      lookupCode: 'VA.EVALUATION_TIME_DIMENSION',
      required: true,
    },
    {
      name: 'dateFrom',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.dateFrom`).d('日期从'),
      required: true,
      labelWidth: 172,
    },
    {
      name: 'dateTo',
      type: FieldType.date,
      label: intl.get(`${commonPrompt}.view.dateTo`).d('日期至'),
      required: true,
      labelWidth: 172,
    },
    {
      name: 'vendorName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.vendorName`).d('供应商名称'),
    },
    // {
    //   name: 'needDepartment',
    //   label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部门'),
    //   type: FieldType.string,
    // },
    // {
    //   name: 'needDepartmentObj',
    //   type: FieldType.object,
    //   label: intl.get(`${commonPrompt}.view.needDepartment`).d('需求部门'),
    //   lovCode: 'SPFM.EIP_DEPARTMENT_LOV',
    //   lovPara: { tenantId: getCurrentOrganizationId() },
    // },
    {
      name: 'needDepart',
      type: FieldType.object,
      label: intl.get(`${commonPrompt}.view.needDepart`).d('需求部'),
      lovCode: 'SPFM.USER_UNIT_DEPART',
      lovPara: { tenantId: getCurrentOrganizationId() },
      transformRequest(value) {
        return (value || {}).unitName;
      },
    },
  ],
});
