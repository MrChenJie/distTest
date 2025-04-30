/*
 * @Description: contractChapter - 协议用章
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:05:55
 * @LastEditTime: 2019-08-20 20:54:57
 * @version: 0.0.1
 */
import { getResponse, createPagination } from 'utils/utils';
// import { queryMapIdpValue } from 'services/api';
import {
  queryList,
  fetchHeader,
  getVerifyCode,
  querySealPictures,
  confirmMobileChapter,
  confirmChapter,
} from '../services/contractChapterService';

export default {
  namespace: 'contractChapter',
  state: {
    dataSource: [], // 列表数据
    pagination: {}, // 分页参数
  },
  effects: {
    // 查询明细头
    *fetchHeader({ payload }, { call }) {
      const response = yield call(fetchHeader, payload);
      return getResponse(response);
    },
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // -查询印章图片
    *fetchSealPictures({ payload }, { call }) {
      const response = getResponse(yield call(querySealPictures, payload));
      return response;
    },

    // 获取手机验证码
    *getVerifyCode({ payload }, { call }) {
      const response = getResponse(yield call(getVerifyCode, payload));
      return response;
    },

    // 手机验证签章
    *confirmMobileChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmMobileChapter, payload));
      return response;
    },

    // 无手机验证签章
    *confirmChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmChapter, payload));
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
