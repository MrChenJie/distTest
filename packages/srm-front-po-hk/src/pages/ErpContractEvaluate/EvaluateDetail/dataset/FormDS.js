import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export const formDS = () => ({
  transport: {
    // read: {
    //   url: `${SRM_SSLM}/v1/score-groups/${detailId}`,
    //   method: 'get',
    //   params: {},
    // },
    // update: ({ data }) => {
    //   return {
    //     url: `${SRM_SSLM}/v1/score-groups`,
    //     method: 'put',
    //     data: data[0],
    //   };
    // }
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
