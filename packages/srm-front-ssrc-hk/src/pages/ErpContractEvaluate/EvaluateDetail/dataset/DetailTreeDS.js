import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const SSLM = '/sslm';
export const detailTreeDS = (props, evalTplId, deatailLoadSucess) => ({
  autoQuery: true,
  transport: {
    read: {
      url: `${SSLM}/v1/0/eval-templates/indicators/${props.match.params.contractId}/${evalTplId}/getErpEvaluateTreeData`,
      method: 'GET',
    },
  },
  feedback: {
    loadSuccess: deatailLoadSucess,
  },
  fields: [
    {
      name: 'evalTplIndId',
      type: FieldType.number,
    },
    {
      name: 'evalTplId',
      type: FieldType.number,
    },
    {
      name: 'tenantId',
      type: FieldType.number,
    },
    {
      name: 'indicatorId',
      type: FieldType.number,
    },
    {
      name: 'indicatorCode',
      type: FieldType.string,
    },
    {
      name: 'indicatorName',
      type: FieldType.string,
    },
    {
      name: 'evalWeight',
      type: FieldType.number,
    },
    {
      name: 'childrenList',
      type: FieldType.object,
    },
  ],
});
