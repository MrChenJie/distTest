/**
 * @Description: 贸易商付款
 * @date 2024-07-12
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2024, Hand
 */
 import uuid from 'uuid/v4';
 import { createPagination } from 'utils/utils';
 import { getResponse } from '_cus_utils/utils';
 import {
   queryList,
   queryDetail,
   queryListDetail,
   savePayInfo,
   getTradeWinTotal,
 } from '@/services/payTradeService';
 
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
   namespace: 'payTradeModal',
 
   state: {
     dataSource: [], // 汇总的数据源
     pagination: {}, // 汇总的分页对象
   },
 
   effects: {
     *queryList({ payload }, { call, put }) {
       const res = yield call(queryList, payload);
       const response = getResponse(res);
       if (response) {
         yield put({
           type: 'updateState',
           payload: {
             dataSource: dealDataState(response.content),
             pagination: createPagination(response),
           },
         });
       }
       return res;
     },
 
     // 查询贸易商付款凭证-基本信息
     *queryDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryDetail, payload));
       return response;
     },
 
     // 查询贸易商付款凭证-商品详情
     *queryListDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryListDetail, payload));
       return response;
     },
 
     // 保存贸易商付款信息
     *savePayInfo({ payload }, { call }) {
       const response = getResponse(yield call(savePayInfo, payload));
       return response;
     },
 
     // 查询中标数量和金额
     *getTradeWinTotal({ payload }, { call }) {
       const response = getResponse(yield call(getTradeWinTotal, payload));
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
  