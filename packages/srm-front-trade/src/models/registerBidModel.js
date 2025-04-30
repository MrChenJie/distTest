
import uuid from 'uuid/v4';
import { getResponse } from '_cus_utils/utils';
import {
  getToken,
  queryLovData,
  uploadFile,
  queryLovViewInfo,
  register,
  getAllCurrencyCode,
  getBidNotice,
  getScaleByCurrency
} from '@/services/registerBidService';

function dealDataState(data) {
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuid(),
      };
    });
  }
  return config;
}

export default {
  namespace: 'registerBidModel',

  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
  },

  effects: {

    // 获取token
    *getToken({ payload }, { call }) {
      const response = getResponse(yield call(getToken, payload));
      return response;
    },
    // 查询固定值集
    *queryLovData({ payload }, { call }) {
      const response = getResponse(yield call(queryLovData, payload));
      return response;
    },
    // 查询汇率
    *getScaleByCurrency({ payload }, { call }) {
      return getResponse(yield call(getScaleByCurrency, payload));
    },
    // 查询值集视图
    *queryLovViewInfo({ payload }, { call }) {
      const response = getResponse(yield call(queryLovViewInfo, payload));
      return response;
    },
    // 查询所有币种
    *getAllCurrencyCode({ payload }, { call }) {
      const response = getResponse(yield call(getAllCurrencyCode, payload));
      return response;
    },
    // 查询招标公告
    *getBidNotice({ payload }, { call }) {
      const response = getResponse(yield call(getBidNotice, payload));
      return response;
    },
    // 文件上传
    *uploadFile({ payload }, { call }) {
      const response = getResponse(yield call(uploadFile, payload));
      return response;
    },
    // 注册
    *register({ payload }, { call }) {
      const response = getResponse(yield call(register, payload));
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
 