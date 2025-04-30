import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  addPurchaseApplicationList,
  approvePurchaseApplicationList,
  delPurchaseApplicationList,
  exportPurchaseApplicationDetail,
  getApplier,
  getApplyDept,
  getPurchaseApplicationDetail,
  getPurchaseApplicationDetailIndex,
  getPurchaseApplicationRate,
  getUserUnit,
  handleDetailInfomation,
  handleSaveOrder,
  handleSupplierInfo,
  queryPurchaseApplicationList,
  getProjectId,
  getPurchasingCategory,
  getProjectName,
  getSinglePriceValidate,
  getUserDepat,
} from '@/services/frameSubOrderService';

export default {
  namespace: 'frameSubOrderModel',
  state: {
    // 框架子订单查询页面数据
    purchaseApplicationList: [], // 采购申请列表数据
    purchaseApplicationPagination: {}, // 分页对象
    infomation: {
      procurementHandler: '',
      prStatus: '',
    }, // 基本信息&申请信息
    fileSource: [], // 附件信息
    purchaseApplicationLineSource: [], // 采购申请行信息数据源
    purchaseApplicationLinePagination: {}, // 采购申请行信息分页
    supplierlistSource: [], // 中选供应商信息
    supplierlistPagination: [], // 中选供应商信息
    // projectNameList: [], // 项目信息列表数据
    // projectNamePagination: {}, // 分页对象
    projectName: '', //项目名称
    projectNumber: '', //项目名称
    demander: '', //需求人
    demanderId: '', //需求人id
    demanderPhone: '', //需求人电话
    demanderDepartment: '', //需求人部门
    demanderDepartmentId: '', //需求人部门id
    projectManagerCode: '', //需求人部门id
    employeeNum: '', // 需求人工号
    // applier: '', //申请人
    // applierId: '', //申请人id
    // applyingDepartmentName: '', //申请人部门
    // applyingDepartmentId: '', //申请人部门id
    unitCode: '', //申请人部门编码
    canClick: false, //在选择框架协议和采购类别的时候不可以新建单子
    projectId: '',
    deliverContactCode:''
  },

  effects: {
    // 框架子订单列表查询
    *queryPurchaseApplicationList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryPurchaseApplicationList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            purchaseApplicationList: res.content,
            purchaseApplicationPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 新增-保存流程接口
    *addPurchaseApplicationList({ payload }, { call }) {
      const res = cusGetResponse(yield call(addPurchaseApplicationList, payload));
      return res;
    },

    // 删除接口
    *delPurchaseApplicationList({ payload }, { call }) {
      const res = cusGetResponse(yield call(delPurchaseApplicationList, payload));
      return res;
    },

    // 详情接口
    *getPurchaseApplicationDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(getPurchaseApplicationDetail, payload));
      return res;
    },

    // 详情接口
    *getPurchaseApplicationDetailIndex({ payload }, { call }) {
      const res = cusGetResponse(yield call(getPurchaseApplicationDetailIndex, payload));
      return res;
    },
    // 详情接口
    *getPurchaseApplicationRate({ payload }, { call }) {
      const res = cusGetResponse(yield call(getPurchaseApplicationRate, payload));
      return res;
    },

    // 导出接口
    *exportPurchaseApplicationDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(exportPurchaseApplicationDetail, payload));
      return res;
    },

    // 申请人部门接口
    *getUserUnit({ payload }, { call }) {
      const res = cusGetResponse(yield call(getUserUnit, payload));
      return res;
    },

    // 提交按钮接口
    *approvePurchaseApplicationList({ payload }, { call }) {
      const res = cusGetResponse(yield call(approvePurchaseApplicationList, payload));
      return res;
    },

    // 查询需求人
    *getApplier({ payload }, { call }) {
      const res = cusGetResponse(yield call(getApplier, payload));
      return res;
    },

    // 查询需求人部门
    *getApplyDept({ payload }, { call }) {
      const res = cusGetResponse(yield call(getApplyDept, payload));
      return res;
    },

    // 查询项目信息-项目名称
    *queryProjectNameList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryProjectNameList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            projectNameList: res.data,
            projectNamePagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 框架子订单保存
    *handleSaveOrder({ payload }, { call }) {
      const res = cusGetResponse(yield call(handleSaveOrder, payload));
      return res;
    },

    // 框架子订单查询
    *handleDetailInfomation({ payload }, { call }) {
      const res = cusGetResponse(yield call(handleDetailInfomation, payload));
      return res;
    },

    // 框架子订单查询供应商信息
    *handleSupplierInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(handleSupplierInfo, payload));
      return res;
    },
    // 查询项目id
    * getProjectId({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectId, payload));
      return res;
    },
    // 旧PO查询的采购类别
    * getPurchasingCategory({ payload }, { call }) {
      const res = cusGetResponse(yield call(getPurchasingCategory, payload));
      return res;
    },
    
    // 查询总的项目名称
    *getProjectName({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectName, payload));
      return res;
    },
    
    // 校验子订单金额
    *getSinglePriceValidate({ payload }, { call }) {
      const res = cusGetResponse(yield call(getSinglePriceValidate, payload));
      return res;
    },
    
    // 查询需求人部门
    *getUserDepat({ payload }, { call }) {
      const res = cusGetResponse(yield call(getUserDepat, payload));
      return res;
    },
  },

  reducers: {
    commentUpdateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
