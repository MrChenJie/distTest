import { getResponse } from 'utils/utils';

import { queryQuestionSurvey } from '@/services/questionSurveyServices';

export default {
  namespace: 'questionSurvey',
  state: {},
  effects: {
    * queryQuestionSurvey({ payload }, { call }) {
      const response = getResponse(yield call(queryQuestionSurvey, payload));
      return response;
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
