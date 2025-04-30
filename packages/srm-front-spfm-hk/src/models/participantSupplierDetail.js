/*
 * invitationList - 邀约汇总
 * @date: 2020-08-13
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import {
  queryPurchaseLinesDetail,
  queryEnterpriseLinesDetail,
  savePurchaseLinesDetail,
  deletePurchaseLine,
  saveEnterpriseLinesDetail,
  deleteEnterpriseLine,
  deleteProductLine,
  deleteChannelLine,
  saveProductLinesDetail,
  saveSimpleLinesDetail,
  saveMobileLinesDetail,
  saveOperatorLinesDetail,
  saveChannelLinesDetail,
  presaveChannelLinesDetail,
  queryProductLinesDetail,
  saveRevenueData,
  queryRevenueData,
  deleteRevenueData,
  saveAuthData,
  queryAuthData,
  deleteAuthData,
  saveCertData,
  queryCertData,
  deleteCertData,
  submitApproval,
  saveCompanyState,
  queryCompanyState,
  deleteStaffData,
  saveEngineeringData,
  queryEngineeringData,
  deleteEngineeringData,
  getApprovalList,
  fetchInviteStatus,
  fetchInviteData,
  getButtonPermission,
  returnToSupplier,
  createApproval,
  savePurchaseFirmChange,
  saveEnterpriseFirmChange,
  saveProductFirmChange,
  saveSimpleLinesChange,
  saveMobileFirmChange,
  saveOperatorFirmChange,
  saveChannelFirmChange,
  addCorporateBusiness,
  querySimpleLineDetail,
  queryMobileLineDetail,
  queryOperatorLineDetail,
  queryChannelLineDetail,
  deleteChCommissionLines,
  fetchCompanySupplierList,
  basicDisable,
  basicEnable,
  showFlag,
  queryUnderApproval,
  queryPoLinesByCompanyNum,
} from '@/services/participantsSuppliers';
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchEnterpriseInfo,
  getApprovalDetail,
  getByRequestId,
} from '@/services/enterpriseService';
import { getCircleScoreDataSource } from '@/utils/common';
import { permissions, queryProfilePermission } from '@/services/commonService';
import uuid from 'uuid/v4';

export default {
  namespace: 'participantSupplierDetail',

  state: {
    purchaseHeaderDetail: {},
    enterpriseHeaderDetail: {},
    productHeaderDetail: {},
    simpleHeaderDetail: {},
    mobileHeaderDetail: {},
    operatorHeaderDetail: {},
    channelHeaderDetail: {},
    otherIncomeDataSource: [],
    productServiceIncomeDataSource: [],
    guestIncomeDataSource: [],
    authDataSource: [],
    ISODataSource: [],
    otherCertificate: [],
    questionnaireDataSource: [],
    simpleLineDataSource: [],
    companyStateDataSource: [],
    equipmentPurchaseDataSource: [],
    engineeringServiceDataSource: [],
    softwareDataSource: [],
    cloudServiceDataSource: [],
    attachmentsDataSource: [],
    circleScoreDataSource: [],
    purchaseISOList: [],
    purchaseOtherList: [],
    productRFIList: [],
    smallRFIList: [],
    mobileRFIList: [],
    operatorRFIList: [],
    enterpriseICTList: [],
    channelRFIList: [],
    previewDetail: {},
    purApprovalDetail: {},
    ictApprovalListDetail: {},
    prodApprovalListDetail: {},
    simpleApprovalListDetail: {},
    mobileApprovalListDetail: {},
    operatorApprovalListDetail: {},
    channelApprovalListDetail: {},
    chCommissionLines: [],
    purchaseCertLineVOS: [],
    editFlag: undefined, // 编辑权限 Y-可编辑，N-不可编辑
    channelPermission: undefined, // 渠道商的编辑可读逻辑 WRITE/READ/NONE 对应可编辑、可读、不可读
    underApproval: {}, // 查询审核中线条的参数
  },
  effects: {
    // approvalReqRecVOList approvalRequestHeaderVO
    *getpurApprovalDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            purApprovalDetail: res || {},
          },
        });
      }
    },

    *getictApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            ictApprovalListDetail: res || {},
          },
        });
      }
    },

    *getprodApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            prodApprovalListDetail: res || {},
          },
        });
      }
    },

    *getSimpleApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            simpleApprovalListDetail: res || {},
          },
        });
      }
    },

    *getMobileApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            mobileApprovalListDetail: res || {},
          },
        });
      }
    },

    *getOperatorApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            operatorApprovalListDetail: res || {},
          },
        });
      }
    },

    *getChannelApprovalListDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            channelApprovalListDetail: res || {},
          },
        });
      }
    },

    *fetchPreviewDetail({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchEnterpriseInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            previewDetail: res,
          },
        });
        return res;
      }
    },

    *queryInviteTypes(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SPFM.PURCHASE_CERT_TYPE',
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        const purchaseISOList = [];
        const purchaseOtherList = [];
        const productRFIList = [];
        const smallRFIList = [];
        const mobileRFIList = [];
        const operatorRFIList = [];
        const enterpriseICTList = [];
        const channelRFIList = [];
        // res.inviteTypeCode
        for (let i = 0; i < res.inviteTypeCode.length; i++) {
          if (res.inviteTypeCode[i].tag === 'PURCHASE-ISO') {
            purchaseISOList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'PURCHASE-OTHER') {
            purchaseOtherList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'PRODUCT-RFI') {
            productRFIList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'ENTERPRISE-ICT') {
            enterpriseICTList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'SMALL-RFI') {
            smallRFIList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'MOBILE-RFI') {
            mobileRFIList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'OPERATOR-RFI') {
            operatorRFIList.push(res.inviteTypeCode[i]);
          } else if (res.inviteTypeCode[i].tag === 'CHANNEL-RFI') {
            channelRFIList.push(res.inviteTypeCode[i]);
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            purchaseISOList,
            purchaseOtherList,
            productRFIList,
            smallRFIList,
            mobileRFIList,
            operatorRFIList,
            enterpriseICTList,
            channelRFIList,
          },
        });
      }
    },

    *queryPurchaseLinesDetail({ payload }, { call, put }) {
      const res = yield call(queryPurchaseLinesDetail, payload);
      // purchaseAuthLines: [] // 授权数据
      // purchaseCertLines: [] // 证书数据
      // purchaseRevenueLines: [] // 收入数据(需要拆分为其他收入数据，产品服务，客户数据）
      if (getResponse(res)) {
        const otherIncomeDataSource = [];
        const productServiceIncomeDataSource = [];
        const guestIncomeDataSource = [];
        const ISODataSource = [];
        const otherCertificate = [];
        res.purchaseRevenueLines.forEach((item) => {
          if (item.revenueType === 'OTHER') {
            otherIncomeDataSource.push(item);
          } else if (item.revenueType === 'SERVICE') {
            productServiceIncomeDataSource.push(item);
          } else if (item.revenueType === 'CUSTOMER') {
            guestIncomeDataSource.push(item);
          }
        });
        res.purchaseCertLines.forEach((item) => {
          if (item.certificateCategory === 'PURCHASE-ISO') {
            ISODataSource.push(item);
          } else if (item.certificateCategory === 'PURCHASE-OTHER') {
            otherCertificate.push(item);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            otherIncomeDataSource,
            productServiceIncomeDataSource,
            guestIncomeDataSource,
            authDataSource: res.purchaseAuthLines || [],
            ISODataSource,
            otherCertificate,
            purchaseHeaderDetail: res.purchaseHeader || {},
            isCreate: (res.purchaseHeader || {}).purchaseHeaderId,
          },
        });
      }
    },

    // 整体保存采购线条数据
    *savePurchaseLinesDetail({ payload }, { call }) {
      const res = yield call(savePurchaseLinesDetail, payload);
      return getResponse(res);
    },

    // 删除采购线条数据
    *deletePurchaseLine({ payload }, { call }) {
      const res = yield call(deletePurchaseLine, payload);
      return getResponse(res);
    },

    *saveOtherIncome({ payload }, { call, put }) {
      const { purchaseHeaderId, otherDataList } = payload;
      const params = otherDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveRevenueData, params);
      if (getResponse(res)) {
        // 保存成功之后去查询数据，将数据库中的数据更新到界面，此处仅查询revenueType为OTHER的。
        const list = yield call(queryRevenueData, { purchaseHeaderId, revenueType: 'OTHER' });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              otherIncomeDataSource: list,
            },
          });
        }
      }
    },
    *saveProductServiceIncome({ payload }, { call, put }) {
      const { purchaseHeaderId, productServiceIncomeList } = payload;
      const params = productServiceIncomeList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveRevenueData, params);
      if (getResponse(res)) {
        const list = yield call(queryRevenueData, { purchaseHeaderId, revenueType: 'SERVICE' });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              productServiceIncomeDataSource: list,
            },
          });
        }
      }
    },
    *saveGuestIncome({ payload }, { call, put }) {
      const { purchaseHeaderId, guestIncomeList } = payload;
      const params = guestIncomeList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveRevenueData, params);
      if (getResponse(res)) {
        const list = yield call(queryRevenueData, { purchaseHeaderId, revenueType: 'CUSTOMER' });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              guestIncomeDataSource: list,
            },
          });
        }
      }
    },
    // 删除各种收入数据
    *deleteIncome({ payload }, { call }) {
      // revenueLineId
      const res = yield call(deleteRevenueData, payload);
      return getResponse(res);
    },

    // 保存授权数据
    *saveAuthData({ payload }, { call, put }) {
      const { purchaseHeaderId, authDataList } = payload;
      const params = authDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveAuthData, params);
      if (getResponse(res)) {
        const list = yield call(queryAuthData, { purchaseHeaderId });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              authDataSource: list,
            },
          });
        }
      }
    },
    // 删除授权数据
    *deleteAuthData({ payload }, { call }) {
      // revenueLineId
      const res = yield call(deleteAuthData, payload);
      return getResponse(res);
    },

    // 保存ISO证书数据
    *saveISOData({ payload }, { call, put }) {
      const { purchaseHeaderId, ISODataList } = payload;
      const params = ISODataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId,
          certificateCategory: 'PURCHASE-ISO',
          businessType: 'PUR',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              ISODataSource: list,
            },
          });
        }
      }
    },

    // 保存Other证书数据
    *saveOtherData({ payload }, { call, put }) {
      const { purchaseHeaderId, otherDataList } = payload;
      const params = otherDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId,
          certificateCategory: 'PURCHASE-OTHER',
          businessType: 'PUR',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              otherCertificate: list,
            },
          });
        }
      }
    },
    // 删除证书数据
    *deleteCertData({ payload }, { call }) {
      // revenueLineId
      const res = yield call(deleteCertData, payload);
      return getResponse(res);
    },

    *queryEnterpriseLinesDetail({ payload }, { call, put }) {
      const { previewDetail } = payload;
      const res = yield call(queryEnterpriseLinesDetail, payload);
      // enterpriseHeader 企业线头
      // enterpriseStaffLineVOS
      // enterpriseProLineVOS

      // attachmentsDataSource

      if (getResponse(res)) {
        const equipmentPurchaseDataSource = [];
        const engineeringServiceDataSource = [];
        const softwareDataSource = [];
        const cloudServiceDataSource = [];
        res.enterpriseProLineVOS.forEach((item) => {
          if (item.companyCapabilityType === 'ICT equipment purchase') {
            equipmentPurchaseDataSource.push(item);
          } else if (item.companyCapabilityType === 'Engineering service') {
            engineeringServiceDataSource.push(item);
          } else if (item.companyCapabilityType === 'Software/Application') {
            softwareDataSource.push(item);
          } else if (item.companyCapabilityType === 'Cloud service') {
            cloudServiceDataSource.push(item);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            equipmentPurchaseDataSource,
            engineeringServiceDataSource,
            softwareDataSource,
            cloudServiceDataSource,
            enterpriseHeaderDetail: res.enterpriseHeader || {},
            companyStateDataSource: res.enterpriseStaffLineVOS || [],
            attachmentsDataSource: res.purchaseCertLineVOS || [],
            isCreate: (res.enterpriseHeader || {}).enterpriseHeaderId,
            circleScoreDataSource: getCircleScoreDataSource(
              previewDetail,
              res.enterpriseHeader || {},
              res.enterpriseStaffLineVOS || []
            ),
          },
        });
        return res;
      }
    },
    // 整体保存企业线条数据
    *saveEnterpriseLinesDetail({ payload }, { call }) {
      const res = yield call(saveEnterpriseLinesDetail, payload);
      return getResponse(res);
    },

    // 删除企业线条数据
    *deleteEnterpriseLine({ payload }, { call }) {
      const res = yield call(deleteEnterpriseLine, payload);
      return getResponse(res);
    },

    // 保存职工数据
    *saveCompanyState({ payload }, { call, put }) {
      const { enterpriseHeaderId, companyStateList } = payload;
      const params = companyStateList.map((item) => {
        return {
          ...item,
          enterpriseHeaderId,
        };
      });
      const res = yield call(saveCompanyState, params);
      if (getResponse(res)) {
        const list = yield call(queryCompanyState, { enterpriseHeaderId });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              companyStateDataSource: list,
            },
          });
        }
      }
    },

    // 删除职工数据
    *deleteStaffData({ payload }, { call }) {
      const res = yield call(deleteStaffData, payload);
      return getResponse(res);
    },

    // 保存ICT工程数据
    *saveEquipmentPurchase({ payload }, { call, put }) {
      const { enterpriseHeaderId, equipmentPurchaseList } = payload;
      const params = equipmentPurchaseList.map((item) => {
        return {
          ...item,
          enterpriseHeaderId,
        };
      });
      const res = yield call(saveEngineeringData, params);
      if (getResponse(res)) {
        const list = yield call(queryEngineeringData, {
          enterpriseHeaderId,
          companyCapabilityType: 'ICT equipment purchase',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              equipmentPurchaseDataSource: list,
            },
          });
        }
      }
    },

    // 保存工程服务数据
    *saveEngineeringService({ payload }, { call, put }) {
      const { enterpriseHeaderId, engineeringServiceList } = payload;
      const params = engineeringServiceList.map((item) => {
        return {
          ...item,
          enterpriseHeaderId,
        };
      });
      const res = yield call(saveEngineeringData, params);
      if (getResponse(res)) {
        const list = yield call(queryEngineeringData, {
          enterpriseHeaderId,
          companyCapabilityType: 'Engineering service',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              engineeringServiceDataSource: list,
            },
          });
        }
      }
    },

    // 保存软件应用程序项目数据
    *saveSoftware({ payload }, { call, put }) {
      const { enterpriseHeaderId, softwareList } = payload;
      const params = softwareList.map((item) => {
        return {
          ...item,
          enterpriseHeaderId,
        };
      });
      const res = yield call(saveEngineeringData, params);
      if (getResponse(res)) {
        const list = yield call(queryEngineeringData, {
          enterpriseHeaderId,
          companyCapabilityType: 'Software/Application',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              softwareDataSource: list,
            },
          });
        }
      }
    },

    // 保存云服务项目数据
    *saveCloudService({ payload }, { call, put }) {
      const { enterpriseHeaderId, cloudServiceList } = payload;
      const params = cloudServiceList.map((item) => {
        return {
          ...item,
          enterpriseHeaderId,
        };
      });
      const res = yield call(saveEngineeringData, params);
      if (getResponse(res)) {
        const list = yield call(queryEngineeringData, {
          enterpriseHeaderId,
          companyCapabilityType: 'Cloud service',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              cloudServiceDataSource: list,
            },
          });
        }
      }
    },

    // 删除各种工程数据
    *deleteEngineeringData({ payload }, { call }) {
      const res = yield call(deleteEngineeringData, payload);
      return getResponse(res);
    },

    // 保存企业线条证书数据
    *saveAttachments({ payload }, { call, put }) {
      const { enterpriseHeaderId, attachmentsList } = payload;
      const params = attachmentsList.map((item) => {
        return {
          ...item,
          purchaseHeaderId: enterpriseHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId: enterpriseHeaderId,
          certificateCategory: 'ENTERPRISE-ICT',
          businessType: 'ICT',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              attachmentsDataSource: list,
            },
          });
        }
      }
    },

    *queryProductLinesDetail({ payload }, { call, put }) {
      const res = yield call(queryProductLinesDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            productHeaderDetail: res.productHeader || {},
            questionnaireDataSource: res.purchaseCertLineVOS || {},
            isCreate: (res.productHeader || {}).productHeaderId,
          },
        });
      }
    },

    *querySimpleLineDetail({ payload }, { call, put }) {
      const res = yield call(querySimpleLineDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            simpleHeaderDetail: res.smallExpendHeader || {},
            simpleLineDataSource: res.purchaseCertLineVOS || {},
            isCreate: (res.smallExpendHeader || {}).expendHeaderId,
          },
        });
      }
    },

    *queryMobileLineDetail({ payload }, { call, put }) {
      const res = yield call(queryMobileLineDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            mobileHeaderDetail: res.mobileHeader || {},
            mobileLineDataSource: res.purchaseCertLineVOS || {},
            isCreate: (res.mobileHeader || {}).mobileHeaderId,
          },
        });
      }
    },

    *queryOperatorLineDetail({ payload }, { call, put }) {
      const res = yield call(queryOperatorLineDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            operatorHeaderDetail: res.operatorHeader || {},
            operatorLineDataSource: res.purchaseCertLineVOS || {},
            isCreate: (res.operatorHeader || {}).operatorHeaderId,
          },
        });
      }
    },

    *queryChannelLineDetail({ payload }, { call, put, select }) {
      const res = yield call(queryChannelLineDetail, payload);
      const { channelRFIList } = yield select(state => state.participantSupplierDetail);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            channelHeaderDetail: res.channelHeader || {},
            chCommissionLines: (res?.chCommissionLines || []).map(item => ({ ...item, _status: 'update' })) || [],
            purchaseCertLineVOS:
              (res.purchaseCertLineVOS || []).length !== 0
                ? (res?.purchaseCertLineVOS || []).map(item => ({ ...item, _status: 'update' })) || []
                : channelRFIList?.map(item => {
                  return {
                    _status: 'create',
                    certificateCategory: 'ENTERPRISE-ICT',
                    businessType: 'CHANNEL',
                    certificateLineId: uuid(),
                    certificateType: item.value,
                    certificateTypeMeaning: item.meaning,
                  };
                }) || [],
            channelPermission: res.permission,
            isCreate: (res.channelHeader || {}).channelHeaderId,
          },
        });
      }
    },

    // 整体保存产品线条数据
    *saveProductLinesDetail({ payload }, { call }) {
      const res = yield call(saveProductLinesDetail, payload);
      return getResponse(res);
    },

    // 整体保存简易支出线条数据
    *saveSimpleLinesDetail({ payload }, { call }) {
      const res = yield call(saveSimpleLinesDetail, payload);
      return getResponse(res);
    },

    // 整体保存移动部线条数据
    *saveMobileLinesDetail({ payload }, { call }) {
      const res = yield call(saveMobileLinesDetail, payload);
      return getResponse(res);
    },

    // 整体保存运营部线条数据
    *saveOperatorLinesDetail({ payload }, { call }) {
      const res = yield call(saveOperatorLinesDetail, payload);
      return getResponse(res);
    },

    // 整体保存渠道商线条数据
    *saveChannelLinesDetail({ payload }, { call }) {
      const res = yield call(saveChannelLinesDetail, payload);
      return getResponse(res);
    },

    // 整体保存渠道商线条数据-不校验
    *presaveChannelLinesDetail({ payload }, { call }) {
      const res = yield call(presaveChannelLinesDetail, payload);
      return getResponse(res);
    },

    // 删除产品线条数据
    *deleteProductLine({ payload }, { call }) {
      const res = yield call(deleteProductLine, payload);
      return getResponse(res);
    },

    // 删除产品线条数据
    *deleteChannelLine({ payload }, { call }) {
      const res = yield call(deleteChannelLine, payload);
      return getResponse(res);
    },

    // 保存产品线条证书数据
    *saveQuestionnaireData({ payload }, { call, put }) {
      const { productHeaderId, questionnaireDataList } = payload;
      const params = questionnaireDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId: productHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId: productHeaderId,
          certificateCategory: 'PRODUCT-RFI',
          businessType: 'PROD',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              questionnaireDataSource: list,
            },
          });
        }
      }
    },

    // 保存简易支出线条证书数据
    *saveSimpleLineData({ payload }, { call, put }) {
      const { smallExpendHeaderId, simpleLineDataList } = payload;
      const params = simpleLineDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId: smallExpendHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId: smallExpendHeaderId,
          certificateCategory: 'SMALL-RFI',
          businessType: 'SMALL',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              simpleLineDataSource: list,
            },
          });
        }
      }
    },

    // 保存移动部线条证书数据
    *saveMobileLineData({ payload }, { call, put }) {
      const { mobileHeaderId, mobileLineDataList } = payload;
      const params = mobileLineDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId: mobileHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId: mobileHeaderId,
          certificateCategory: 'MOBILE-RFI',
          businessType: 'MOBILE',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              mobileLineDataSource: list,
            },
          });
        }
      }
    },

    // 保存运营部线条证书数据
    *saveOperatorLineData({ payload }, { call, put }) {
      const { operatorHeaderId, operatorLineDataList } = payload;
      const params = operatorLineDataList.map((item) => {
        return {
          ...item,
          purchaseHeaderId: operatorHeaderId,
        };
      });
      const res = yield call(saveCertData, params);
      if (getResponse(res)) {
        const list = yield call(queryCertData, {
          purchaseHeaderId: operatorHeaderId,
          certificateCategory: 'OPERATOR-RFI',
          businessType: 'OPERATOR',
        });
        if (getResponse(list)) {
          yield put({
            type: 'updateState',
            payload: {
              operatorLineDataSource: list,
            },
          });
        }
      }
    },


    *submitApproval({ payload }, { call }) {
      const res = yield call(submitApproval, payload);
      return getResponse(res);
    },

    *permissions({ payload }, { call, put }) {
      const response = getResponse(yield call(permissions, payload));
      if (response) {
        const { editFlag } = response;
        yield put({
          type: 'updateState',
          payload: {
            editFlag,
          },
        });
      }
    },

    *fetchInviteStatus({ payload }, { call }) {
      return getResponse(yield call(fetchInviteStatus, payload));
    },

    *fetchInviteData({ payload }, { call }) {
      return getResponse(yield call(fetchInviteData, payload));
    },

    *getButtonPermission({ payload }, { call }) {
      return getResponse(yield call(getButtonPermission, payload));
    },

    *returnToSupplier({ payload }, { call }) {
      return getResponse(yield call(returnToSupplier, payload));
    },

    *createApproval({ payload }, { call }) {
      return getResponse(yield call(createApproval, payload));
    },

    *savePurchaseFirmChange({ payload }, { call }) {
      return getResponse(yield call(savePurchaseFirmChange, payload));
    },

    *saveEnterpriseFirmChange({ payload }, { call }) {
      const res = yield call(saveEnterpriseFirmChange, payload);
      return getResponse(res);
    },

    *saveProductFirmChange({ payload }, { call }) {
      const res = yield call(saveProductFirmChange, payload);
      return getResponse(res);
    },

    *saveSimpleLinesChange({ payload }, { call }) {
      const res = yield call(saveSimpleLinesChange, payload);
      return getResponse(res);
    },

    *saveMobileFirmChange({ payload }, { call }) {
      const res = yield call(saveMobileFirmChange, payload);
      return getResponse(res);
    },

    *saveOperatorFirmChange({ payload }, { call }) {
      const res = yield call(saveOperatorFirmChange, payload);
      return getResponse(res);
    },

    *saveChannelFirmChange({ payload }, { call }) {
      const res = yield call(saveChannelFirmChange, payload);
      return getResponse(res);
    },

    *addCorporateBusiness({ payload }, { call }) {
      return getResponse(yield call(addCorporateBusiness, payload));
    },

    *getApprovalDetail({ payload }, { call }) {
      return getResponse(yield call(getApprovalDetail, payload));
    },

    *getByRequestId({ payload }, { call }) {
      const res = yield call(getByRequestId, payload);
      return res.sourceRequestId || null;
    },

    *deleteChCommissionLines({ payload }, { call }) {
      const res = yield call(deleteChCommissionLines, payload);
      return res;
    },

    //  新的查询列表
    *fetchCompanySupplierList({ payload }, { call }) {
      return getResponse(yield call(fetchCompanySupplierList, payload));
    },

    *basicDisable({ payload }, { call }) {
      return getResponse(yield call(basicDisable, payload));
    },

    *basicEnable({ payload }, { call }) {
      return getResponse(yield call(basicEnable, payload));
    },

    *showFlag({ payload }, { call }) {
      return getResponse(yield call(showFlag, payload));
    },

    *queryProfilePermission({ payload }, { call }) {
      return getResponse(yield call(queryProfilePermission, payload));
    },

    *queryPoLinesByCompanyNum({ payload }, { call }) {
      return getResponse(yield call(queryPoLinesByCompanyNum, payload));
    },

    *queryUnderApproval({ payload }, { call, put }) {
      const res = getResponse(yield call(queryUnderApproval, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            underApproval: res,
          },
        })
      }
      return res;
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
