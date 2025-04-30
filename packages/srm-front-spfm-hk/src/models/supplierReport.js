/**
 * accessToSupplierHK.js - 供应商报表model
 * @Author: jinkai.lu@hand-china.com
 * @Date: 2024/01/29
 * @Copyright: Copyright (c), 2023, hand
 */

import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import { getPeriodAddInfo,getPeriodModifyInfo } from '@/services/supplierReport/supplierReportService'
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierReport',
  state: {
    platformList: {}, // 供应商列表
    platformPagination: {}, // 供应商分页数据
    previewData: {}, // 供应商预览详情数据
    supplierCheckData: {}, // 供应商查重数据
    supplierCheckDataPagination: {}, // 供应商查重数据分页
    basicInfo: {}, // 基本信息数据
    fileCascader: [],// 附件类型值集
    enumMap: {}, // 值集,
    pagination: {},
    // _____________
    dataSource: [],
    modifyDataSource: [],
    modifyPagination:{}
  },
  effects: {
    // 期间新增
    *getPeriodAddInfo({ payload }, { call, put }) {
        const res = yield call(getPeriodAddInfo, payload);
        if(res){
          yield put({
            type: 'updateState',
            payload: {
              dataSource: res.content || [],
              pagination: createPagination(res),
            },
          });
        }
        return cusGetResponse(res);
      },

      // 期间修改
    *getPeriodModifyInfo({ payload }, { call, put }) {
      const res = yield call(getPeriodModifyInfo, payload);
      console.log(res);
      if(res){
        yield put({
          type: 'updateState',
          payload: {
            modifyDataSource: res.content || [],
            modifyPagination: createPagination(res),
          },
        });
      }
      return cusGetResponse(res);
    }
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
}
