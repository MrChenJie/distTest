import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const SSLM = '/sslm';
export const templateDS = (evalTplId) => ({
  autoQuery: true,
  primaryKey: 'evalTplId',
  selection: 'single',
  pageSize: 10,
  transport: {
    read: {
      url: `${SSLM}/v1/0/eval-templates/getAllPublishList`,
      method: 'GET',
      params: {
        evalTplId,
      },
    },
  },
  fields: [
    {
      name: 'evalTplCode',
      type: FieldType.string,
      label: intl.get(`evalTplCode`).d('模板代码'),
    },
    {
      name: 'evalTplName',
      type: FieldType.string,
      label: intl.get(`evalTplName`).d('模板名称'),
    },
    {
      name: 'versionNum',
      type: FieldType.number,
      label: intl.get(`versionNum`).d('版本'),
    },
    {
      name: 'evalTplType',
      type: FieldType.string,
      label: intl.get(`evalTplType`).d('模板类型'),
    },
  ],
  queryFields: [
    {
      name: 'evalTplCode',
      label: intl.get(`evalTplCode`).d('模板代码'),
      type: 'string',
    },
    {
      name: 'evalTplName',
      label: intl.get(`evalTplName`).d('模板名称'),
      type: 'string',
    },
  ],
});
