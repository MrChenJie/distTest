import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const SPUC = '/spuc';
export const evaluateResultDS = (props, evaluateResultLoadSucess) => ({
  autoQuery: true,
  transport: {
    read: {
      url: `${SPUC}/v1/0/erp-contract-evaluates/${props.match.params.contractId}/getEvaluateTplData`,
      method: 'GET',
    },
  },
  feedback: {
    loadSuccess: evaluateResultLoadSucess,
  },
  fields: [
    {
      name: 'evalTplId',
      type: FieldType.number,
    },
    {
      name: 'evalTplCode',
      type: FieldType.string,
    },
    {
      name: 'evalTplName',
      type: FieldType.string,
    },
    {
      name: 'versionNum',
      type: FieldType.number,
    },
    {
      name: 'evalTplType',
      type: FieldType.string,
    },
    {
      name: 'evaluateFlag',
      type: FieldType.boolean,
    },
    {
      name: 'viewFlag',
      type: FieldType.boolean,
    },
  ],
});
