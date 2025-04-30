import { isEmpty } from 'lodash';
import {
  initValueList,
  queryCompanyBasic,
  queryCompanyBasicWithCompanyId,
  queryCompanyBasicWithSupplierId,
  // queryProvinceCity,
  queryCNCountry,
  saveLegalInfo,
  validateUnifiedSocialCode,
  validateCompanyName,
  validateCompanyEnglishName,
  validateCompanyEmail,
  saveOrgLegalInfo,
  queryCompanyName,
  fetchCompanyInfoFromOcr,
  loadCityData,
  fetchRepeatCompany,
  companyCheckResult,
} from '@/services/legalService';
import { getResponse } from 'utils/utils';
import { fetchIndustries } from '@/services/businessService';
import { queryMapIdpValue } from 'services/api';
// import { fetchCountryList } from 'hzero-front-hpfm/lib/services/countryService';
// import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'enterpriseLegal',

  state: {
    legalInfo: {},
    legalInfoOcr: {},
    companyType: [],
    taxpayerType: [],
    countryCNData: {},
    countryList: [],
    cityList: [],
    industries: [], // 使用行业的数据当做品类的数据
    companyName: '', // 查询当前用户注册的企业名称
    isShowCheckRepeat: false, // 当有当前供应商已经存在的时候，需要根据此属性显示 供应商查重按钮
    canEditNext: false, // 是否能点击下一步
  },

  effects: {
    *init({ payload }, { call, put }) {
      const vl = yield call(initValueList, payload);
      const industries = yield call(fetchIndustries, payload);
      let legalInfo = {};
      if (payload.companyId) {
        legalInfo = yield call(queryCompanyBasicWithCompanyId, payload);
      } else if(payload.sourceSystem === 'iBOSS'){
        legalInfo = yield call(queryCompanyBasicWithSupplierId, payload);
      }

      const countryType = yield call(queryCNCountry);

      yield put({
        type: 'updateState',
        payload: {
          industries,
          companyType: vl.companyType || [],
          taxpayerType: vl.taxpayerType || [],
          countryCNData: countryType.content[0] || {},
          legalInfo: {
            ...legalInfo,
            registeredCountryName:
              legalInfo.registeredCountryName || countryType.content[0].countryName,
          },
        },
      });
    },

    *queryCompanyBasic({ payload }, { call, put }) {
      const legalInfo = yield call(queryCompanyBasic, payload);
      yield put({
        type: 'updateState',
        payload: {
          legalInfo,
        },
      });
      return legalInfo;
    },

    *queryCompanyBasicWithCompanyId({ payload }, { call, put }) {
      const legalInfo = yield call(queryCompanyBasicWithCompanyId, payload);
      yield put({
        type: 'updateState',
        payload: {
          legalInfo,
        },
      });
      return legalInfo;
    },
    *queryCompanyBasicWithSupplierId({ payload }, { call, put }) {
      const legalInfo = yield call(queryCompanyBasicWithSupplierId, payload);
      yield put({
        type: 'updateState',
        payload: {
          legalInfo,
        },
      });
      return legalInfo;
    },

    // 初始化查询地区第一级
    *queryDefaultCity({ payload }, { call }) {
      // const countryRes = getResponse(
      //   yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      // );
      // if (countryRes) {
      // const { countryId } = countryRes[0];
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map((n) => {
          const m = {
            ...n,
          };
          m.isLeaf = false;
          return m;
        });
        return newCityResponse;
      }
      return [];
      // }
    },
    // 查询城市列表
    *queryCity({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map((n) => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        return newCityResponse;
      }
      return [];
    },

    // *queryProvinceCity({ payload }, { call, put }) {
    //   const cityList = yield call(queryProvinceCity, payload);
    //   const safeCityList = getResponse(cityList);
    //   if (safeCityList) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         cityList,
    //       },
    //     });
    //   }
    // },

    *queryCompanyName({ payload }, { call, put }) {
      const { companyName } = yield getResponse(call(queryCompanyName, payload));
      yield put({
        type: 'updateState',
        payload: {
          companyName,
        },
      });
    },

    // 从百度OCR接口获取企业信息
    *fetchCompanyInfoFromOcr({ payload }, { call, put }) {
      const response = yield call(fetchCompanyInfoFromOcr, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            legalInfoOcr: data,
          },
        });
      }
    },

    *saveLegalInfo({ payload }, { call }) {
      const response = yield call(saveLegalInfo, payload);
      return getResponse(response);
    },

    *saveOrgLegalInfo({ payload }, { call }) {
      const response = yield call(saveOrgLegalInfo, payload);
      return getResponse(response);
    },

    *validateUnifiedSocialCode({ payload }, { call }) {
      const response = yield call(validateUnifiedSocialCode, payload);
      return response;
    },

    *validateCompanyName({ payload }, { call }) {
      const response = yield call(validateCompanyName, payload);
      return response;
    },

    *validateCompanyEnglishName({ payload }, { call }) {
      const response = yield call(validateCompanyEnglishName, payload);
      return response;
    },

    *validateCompanyEmail({ payload }, { call }) {
      const respone = yield call(validateCompanyEmail, payload);
      return respone;
    },

    *fetchRepeatCompany({ payload }, { call }) {
      const response = yield call(fetchRepeatCompany, payload);
      return getResponse(response);
    },

    *companyCheckResult({ payload }, { call }) {
      return getResponse(yield call(companyCheckResult, payload));
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
