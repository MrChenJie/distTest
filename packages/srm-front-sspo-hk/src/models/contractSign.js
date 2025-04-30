/*
 * @Description: contractSign.js - 协议签署
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-16 15:19:06
 * @LastEditTime: 2019-08-16 15:42:04
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  update,
  queryList,
  fetchHeader,
  contractSign,
  getCheckCode,
  confirmMobile,
  rejectContract,
  sureRejectContract,
  confirmContract,
  sureContract,
  fetchSignImgList,
  getLineAttachmentUuid,
  getHeaderAttachmentUuid,
} from '@/services/contractSignService';

export default {
  namespace: 'contractSign',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    picArray: [], // 印章图片信息
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

    // -查询列表值集
    *fetchEnum({ put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPRM.PR_STATUS',
          source: 'SPRM.SRC_PLATFORM',
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
    // 查询详情值集
    *fetchDetailEnum({ put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          invoiceMethod: 'SPRM.PR_INVOICE_METHOD',
          invoiceType: 'SPRM.PR_INVOICE_TYPE',
          invoiceTitleType: 'SPRM.PR_INVOICE_TITLE_TYPE',
          invoiceDetailType: 'SPRM.PR_INVOICE_DETAIL_TYPE',
          paymentMethod: 'SCEC.COMPANYP_PAYMENT',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },
    // 查询公司印章图片集合
    *fetchSignImgList({ payload }, { call }) {
      const response = getResponse(yield call(fetchSignImgList, payload));
      return response;
    },
    // -确认协议
    *sureContract({ payload }, { call }) {
      const response = getResponse(yield call(sureContract, payload));
      return response;
    },
    // -确认协议
    *sureRejectContract({ payload }, { call }) {
      const response = getResponse(yield call(sureRejectContract, payload));
      return response;
    },
    // -确认协议
    *confirmContract({ payload }, { call }) {
      const response = getResponse(yield call(confirmContract, payload));
      return response;
    },
    // -拒绝协议
    *rejectContract({ payload }, { call }) {
      const response = getResponse(yield call(rejectContract, payload));
      return response;
    },
    // 获取明细头附件uuid
    *getHeaderAttachmentUuid({ data }, { call }) {
      const res = yield call(getHeaderAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 更新模板协议编码列表
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },
    // 获取验证码
    *getCheckCode({ payload }, { call }) {
      const response = getResponse(yield call(getCheckCode, payload));
      return response;
    },
    // 校验验证码.手机电签
    *confirmMobile({ payload }, { call }) {
      const response = getResponse(yield call(confirmMobile, payload));
      return response;
    },
    // 电签
    *contractSign({ payload }, { call }) {
      const response = getResponse(yield call(contractSign, payload));
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
