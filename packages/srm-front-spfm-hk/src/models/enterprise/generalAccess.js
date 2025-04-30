import {
  companyCheckResult,
  queryCNCountry,
  validateCompanyEnglishName,
  validateCompanyName,
  validateUnifiedSocialCode,
} from '@/services/legalService';
import { getResponse } from 'utils/utils';
import { fetchIndustries } from '@/services/businessService';
import { queryCurrentCMIData } from '@/services/bankService';
import { queryAttachmentType } from '@/services/attachmentService';
import {
  deleteAddressList,
  deleteAttachmentList,
  deleteBankList,
  next,
  query,
  save,
} from '@/services/generalAccessService';
import { permissions } from '@/services/commonService';

export default {
  namespace: 'generalAccess',

  state: {
    countryCNData: {},
    industries: [], // 使用行业的数据当做品类的数据

    registerInfo: {}, // 地址信息
    addressList: [], // 地址信息
    bankList: [], // 银行信息
    attachmentList: [], // 附件信息
    contactList: [], // 联系人信息
  },

  effects: {
    *permissions({ payload }, { call }) {
      return getResponse(yield call(permissions, payload));
    },

    *init({ payload }, { call, put }) {
      const industries = yield call(fetchIndustries, payload);
      const countryType = yield call(queryCNCountry);
      yield put({
        type: 'updateState',
        payload: {
          industries,
          countryCNData: countryType.content[0] || {},
        },
      });
    },

    *validateUnifiedSocialCode({ payload }, { call }) {
      return yield getResponse(call(validateUnifiedSocialCode, payload));
    },

    *validateCompanyName({ payload }, { call }) {
      return yield getResponse(call(validateCompanyName, payload));
    },

    *validateCompanyEnglishName({ payload }, { call }) {
      return yield getResponse(call(validateCompanyEnglishName, payload));
    },

    *companyCheckResult({ payload }, { call }) {
      return getResponse(yield call(companyCheckResult, payload));
    },

    *queryCurrentCMIData({ payload }, { call, put }) {
      const res = yield call(queryCurrentCMIData, payload);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            currentCMIData: res.content[0] || {},
          },
        });
      }
    },

    *fetchAttachmentType({ payload }, { call, put }) {
      const response = yield call(queryAttachmentType, payload);
      const data = getResponse(response);
      const arr = [];
      data.map((d) => {
        return arr.push({
          ...d,
          isLeaf: false,
        });
      });
      if (data) {
        yield put({
          type: 'queryAttachmentType',
          payload: arr,
        });
      }
    },

    *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
    },
    *next({ payload }, { call }) {
      return getResponse(yield call(next, payload));
    },
    *query({ payload }, { call, put }) {
      const res = getResponse(yield call(query, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            registerInfo: res.companyBasicDTO || {},
            addressList: res.companyAddressDTOList.map((i) => ({ ...i, _status: 'update' })) || [],
            bankList: res.companyBankAccountDTOList.map((i) => ({ ...i, _status: 'update' })) || [],
            contactList: res.companyContactDTOList.map((i) => ({ ...i, _status: 'update' })) || [],
            attachmentList:
              res.companyAttachmentList.map((i) => ({ ...i, _status: 'update' })) || [],
          },
        });
        return res;
      }
    },
    *deleteAddressList({ payload }, { call }) {
      return getResponse(yield call(deleteAddressList, payload));
    },
    *deleteBankList({ payload }, { call }) {
      return getResponse(yield call(deleteBankList, payload));
    },
    *deleteAttachmentList({ payload }, { call }) {
      return getResponse(yield call(deleteAttachmentList, payload));
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    queryAttachmentType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          AttachmentType: action.payload,
        },
      };
    },
  },
};
