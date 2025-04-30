/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: liuliyuan
 * @Email: liyuan.liu@hand-china.com
 * @Date: 2020-10-16 15:32
 * @LastEditors: liuliyuan
 * @LastEditTime: 2020-11-04
 */

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const promptCode = 'spfm.participantsBatchImport';
const organizationId = getCurrentOrganizationId();

export const ParticipantsListDS = () => ({
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: {
      url: `/spfm/v1/${organizationId}/company-basic-ifs/queryImport`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.import.processStatusMeaning`).d('数据状态'),
    },
    {
      name: 'processMessage',
      type: 'string',
      label: intl.get(`${promptCode}.import.processMessage`).d('信息'),
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get(`${promptCode}.import.companyNum`).d('公司编码'),
    },
    {
      name: 'ebsCode',
      type: 'string',
      label: intl.get(`${promptCode}.import.ebsCode`).d('EBS Code'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${promptCode}.import.companyName`).d('公司全称'),
    },
    {
      name: 'companyEnglishName',
      type: 'string',
      label: intl.get(`${promptCode}.import.companyEnglishName`).d('公司名称（辅助）'),
    },
    {
      name: 'shortName',
      type: 'string',
      label: intl.get(`${promptCode}.import.shortName`).d('公司简称'),
    },
  ],
});
