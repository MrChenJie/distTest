import { getResponse } from 'utils/utils';
import { permissions } from '@/services/commonService';
import { getButtonPermission, returnToSupplier } from '@/services/enterpriseRegisterService';

export default {
  namespace: 'enterpriseRegister',

  state: {
    editFlag: undefined, // 编辑权限 Y-可编辑，N-不可编辑
    ibossSupplierId: undefined,
    sourceSystem: undefined,
  },

  effects: {
    *permissions({ payload }, { call, put }) {
      const response = getResponse(yield call(permissions, payload));
      if (response) {
        const { editFlag } = response;
        yield put({
          type: 'updateState',
          payload: {
            editFlag,
          },
        });
      }
    },

    *getButtonPermission({ payload }, { call }) {
      return getResponse(yield call(getButtonPermission, payload));
    },

    *returnToSupplier({ payload }, { call }) {
      return getResponse(yield call(returnToSupplier, payload));
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
