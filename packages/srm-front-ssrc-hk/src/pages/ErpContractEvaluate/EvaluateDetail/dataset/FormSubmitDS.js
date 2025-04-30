import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export const formSubmitDS = (param) => ({
  data: param,
  submitUrl: '/spuc/v1/0/erp-contract-evaluates/submitErpEvaluate',
  fields: [
    {
      name: 'contractId',
      type: FieldType.string,
    },
    {
      name: 'evalTplId',
      type: FieldType.number,
    },
    {
      name: 'score',
      type: FieldType.number,
    },
    {
      name: 'evaluateRecordList',
      type: FieldType.object,
    },
  ],
});
