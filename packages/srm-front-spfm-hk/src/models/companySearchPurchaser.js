import { isEmpty, forEach } from 'lodash';
import { getResponse } from 'utils/utils';

import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  companySearchQueryPagePurchaser,
  companySearchIndustry,
  companySearchInviteSupplier,
  queryCompanyInformation,
} from '@/services/companySearchService';

export default {
  namespace: 'companySearchPurchaser',
  state: {
    // 值集
    code: {},
    // 行业信息
    // childIndustryLength 所有二级行业的 数量, 在选中 全部的 二级行业时, 不传二级行业给 接口
    // industries 所有的一级行业
    // industryMap 一级行业的Map  industryId: industry
    industries: {},
    // 后台 返回的 分页数据
    list: {},
  },
  effects: {
    // 合并请求 值集
    *batchCode({ payload }, { put, call }) {
      const { lovCodes } = payload;
      const code = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: {
            code,
          },
        });
      }
    },
    // 初始化 行业
    *initIndustry(_, { call, put }) {
      const industries = getResponse(yield call(companySearchIndustry));
      if (!isEmpty(industries)) {
        const dealIndustries = { industries: [], industryMap: {}, childIndustryLength: 0 };
        forEach(industries, industry => {
          const { children, ...copyIndustry } = industry;
          copyIndustry.children = [];
          dealIndustries.industries.push(copyIndustry);
          dealIndustries.industryMap[copyIndustry.industryId] = copyIndustry;
          forEach(children, childIndustry => {
            copyIndustry.children.push(childIndustry);
          });
          dealIndustries.childIndustryLength += copyIndustry.children.length;
        });
        // 对 行业做处理，转换为需要的形式
        yield put({
          type: 'updateState',
          payload: {
            industries: dealIndustries,
          },
        });
      }
    },
    // 查询公司信息
    *queryList({ payload }, { call, put }) {
      const { params, pagination, organizationId } = payload;
      const res = getResponse(
        yield call(companySearchQueryPagePurchaser, organizationId, params, pagination)
      );
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: {
            list: res,
          },
        });
      }
    },
    // 发送采购方邀约
    *invite({ payload }, { call }) {
      const response = yield call(companySearchInviteSupplier, payload);
      return getResponse(response);
    },

    // 查询公司信息
    *queryCompanyInformation({ payload }, { call, put }) {
      const response = yield call(queryCompanyInformation, payload);
      const data = getResponse(response);
      if (data) {
        const { basic = {}, business = {}, contactList = [], attachmentList = [] } = data;
        yield put({
          type: 'updateState',
          payload: { companyInformation: { ...basic, ...business, contactList, attachmentList } },
        });
      }
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
