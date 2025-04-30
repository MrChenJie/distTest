/*
 * 需求人确认
 * @date: 2023-10-18
 * @author: 36712
 */
import { getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import uuidv4 from 'uuid/v4';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuidv4(),
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'demanderConfirmationModel',
  state: {
    enumMap: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = cusGetResponse(
        yield call(queryUnifyIdpValue, {
          // 采购类别
          purchasingCategory:'HKPC.PURCHASINGCATEGORY'
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

     /**
     手工对冲查询
     */
     *getHedgingModular({ payload }, { call }) {
      const response = cusGetResponse(yield call(getHedgingModular, payload));
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
  // subscriptions: {
  //   setup({ history, dispatch }) {
  //     return history.listen(({ pathname }) => {
  //       if (!pathname.includes('/scpc/hedging-center/apply')) {
  //         dispatch({
  //           type: 'updateState',
  //           payload: {
  //             fetchInfoSource: {},
  //           },
  //         });
  //       }
  //     });
  //   },
  // },
};
