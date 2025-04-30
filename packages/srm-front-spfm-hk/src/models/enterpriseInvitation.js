import { getResponse as cusGetResponse } from '_cus_utils/utils';

import { queryList } from '@/services/enterpriseInvitationServices';

export default {
  namespace: 'enterpriseInvitation',
  state: {},
  effects: {
    *queryList({ payload }, { call }) {
      return cusGetResponse(yield call(queryList, payload));
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
