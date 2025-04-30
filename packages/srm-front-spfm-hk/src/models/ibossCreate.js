/**
 * @Description: IBOSS客商资料创建 - modal
 * @date 2022-09-23
 * @author <yuzhang,dong@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import { getResponse, createPagination } from 'utils/utils';
 import { fetchEBSRecord, rePush, cancel, save } from '@/services/ibossCreateService';
 import uuid from 'uuid/v4';
 import { queryMapIdpValue } from 'services/api';
 
 function dealDataState(data) {
   // 处理行 处理字段为update
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
   namespace: 'ibossCreate',
   state: {
     dataSource: [],
     pagination: {},
     recordTypeList: [],
     recordStatusList: [],
   },
   effects: {
     // 聚合快码请求
     *loadMutilFastCode({ payload }, { call, put }) {
       const res = yield call(queryMapIdpValue, payload);
       if (getResponse(res)) {
         yield put({
           type: 'updateState',
           payload: {
             ...res,
           },
         });
       }
     },
 
     //  查询列表
     *fetchEBSRecord({ payload }, { call, put }) {
       const res = yield call(fetchEBSRecord, payload);
       if (getResponse(res)) {
         yield put({
           type: 'updateState',
           payload: {
             dataSource: dealDataState(res.content),
             pagination: createPagination(res),
           },
         });
       }
     },
 
     // 重推
     *rePush({ payload }, { call }) {
       return getResponse(yield call(rePush, payload));
     },
 
     // 取消
     *cancel({ payload }, { call }) {
       return getResponse(yield call(cancel, payload));
     },

     // 取消
     *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
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
 