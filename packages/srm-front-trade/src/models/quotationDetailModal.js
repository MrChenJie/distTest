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
   queryDetail,
   getQuotationDetailsList,
   getTradeWinList,
   getEditCommitList,
   saveMat,
   saveAllocateWin,
   submitAllocateWin,
   goExport,
   goAllocateWinBidExport,
   saveInfo,
 } from '@/services/quotationDetailService';
 
 export default {
   namespace: 'quotationDetailModal',
 
   state: {},
 
   effects: {
     // 查询报价基本信息
     *queryDetail({ payload }, { call }) {
       const response = getResponse(yield call(queryDetail, payload));
       return response;
     },
 
     // 查询贸易商报价明细
     *getQuotationDetailsList({ payload }, { call }) {
       const response = getResponse(yield call(getQuotationDetailsList, payload));
       return response;
     },
 
     // 查询分配数量
     *getTradeWinList({ payload }, { call }) {
       const response = getResponse(yield call(getTradeWinList, payload));
       return response;
     },
 
     // 查询修改记录
     *getEditCommitList({ payload }, { call }) {
       const response = getResponse(yield call(getEditCommitList, payload));
       return response;
     },
 
     // 保存贸易商报价明细
     *saveMat({ payload }, { call }) {
       const response = getResponse(yield call(saveMat, payload));
       return response;
     },
 
     // 保存分配数量
     *saveAllocateWin({ payload }, { call }) {
       const response = getResponse(yield call(saveAllocateWin, payload));
       return response;
     },
 
     // 提交分配数量
     *submitAllocateWin({ payload }, { call }) {
       const response = getResponse(yield call(submitAllocateWin, payload));
       return response;
     },
 
     // 导出报价明细
     *goExport({ payload }, { call }) {
       const response = getResponse(yield call(goExport, payload));
       return response;
     },
 
     // 导出中标数量明细
     *goAllocateWinBidExport({ payload }, { call }) {
       const response = getResponse(yield call(goAllocateWinBidExport, payload));
       return response;
     },
 
     // 保存基本信息
     *saveInfo({ payload }, { call }) {
       const response = getResponse(yield call(saveInfo, payload));
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
  