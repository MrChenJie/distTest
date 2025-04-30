/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:36
 * Copyright (c) 2024, All Rights Reserved. 
 */
/**
 * @Description: 活动申请
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
   saveTraders,
   queryTradersListDetail,
   queryStageListDetail,
   deleteTradeLine,
   saveEditTime,
   handleSendAllEmail,
   handleSendEmail,
   handleEmailTemplate,
   getPayTrade,
 } from '@/services/bidManagementListService';
 
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
   namespace: 'bidManagementListModal',
 
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
 
     // 查询活动详情-基本信息
     *queryDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryDetail, payload));
       return response;
     },
 
     // 查询活动详情-商品详情
     *queryListDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryListDetail, payload));
       return response;
     },
 
     // 保存邀请贸易商
     *saveTraders({ payload }, { call }) {
       const response = getResponse(yield call(saveTraders, payload));
       return response;
     },
 
     // 查询邀请贸易商
     *queryTradersListDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryTradersListDetail, payload));
       return response;
     },
 
     // 查询邀请贸易商
     *deleteTradeLine({ payload }, { call }) {
       const response = getResponse(yield call(deleteTradeLine, payload));
       return response;
     },
 
     // 里程碑阶段查询
     *queryStageListDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryStageListDetail, payload));
       return response;
     },
 
     // 编辑时间保存
     *saveEditTime({ payload }, { call }) {
       const response = getResponse(yield call(saveEditTime, payload));
       return response;
     },
 
     // 全部发送
     *handleSendAllEmail({ payload }, { call }) {
       const response = getResponse(yield call(handleSendAllEmail, payload));
       return response;
     },
 
     // 单个发送
     *handleSendEmail({ payload }, { call }) {
       const response = getResponse(yield call(handleSendEmail, payload));
       return response;
     },
 
     // 单个发送
     *handleEmailTemplate({ payload }, { call }) {
       const response = getResponse(yield call(handleEmailTemplate, payload));
       return response;
     },
 
     // 付款详情
     *getPayTrade({ payload }, { call }) {
       const response = getResponse(yield call(getPayTrade, payload));
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
  