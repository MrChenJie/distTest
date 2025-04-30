/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: songceng
 * @Email: cengceng.song@hand-china.com
 * @Date: 2020-09-01 10:01:39
 * @LastEditors: songceng
 * @LastEditTime: 2020-09-01 18:05:51
 */
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export const CompanyAccessDS = ({ props, commonPrompt }) => ({
  autoQuery: true,
  pageSize: 10,
  transport: {
    read: {
      url: `/spfm/v1/company-access-records`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.companyName`).d('公司名称'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.tenantName`).d('租户'),
    },
    {
      name: 'nodeCode',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.nodeCode`).d('流程节点'),
    },
    {
      name: 'processDate',
      type: FieldType.data,
      label: intl.get(`${commonPrompt}.view.processDate`).d('处理日期'),
    },
    {
      name: 'processStatus',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.processStatus`).d('处理状态'),
    },
    {
      name: 'processMessage',
      type: FieldType.string,
      label: intl.get(`${commonPrompt}.view.processMessage`).d('错误消息'),
    },
    // {
    //   name: 'oprate',
    //   label: '操作',
    // },
  ],
  queryFields: [
    {
      name: 'companyId',
      type: FieldType.object,
      label: intl.get(`companyId`).d('公司'),
      lovCode: 'SPFM.COM_ACCESS_COMPANY_LOV',
    },
    {
      name: 'nodeCode',
      type: FieldType.string,
      label: intl.get(`nodeCode`).d('流程节点'),
      lookupCode: 'SPFM.COMPANY_ACCESS_NODE',
      defaultValue: props.nodeCode || '',
    },
    {
      name: 'processStatus',
      type: FieldType.string,
      label: intl.get(`processStatus`).d('处理状态'),
      lookupCode: 'SPFM.COMPANY_ACCESS_PROCESS_STATUS',
      defaultValue: props.processStatus || '',
    },
  ],
});
