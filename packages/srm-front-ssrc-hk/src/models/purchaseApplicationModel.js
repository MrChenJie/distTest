import { getResponse, createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import uuidv4 from 'uuid/v4';
import {
  addPurchaseApplicationList,
  approvePurchaseApplicationList,
  delPurchaseApplicationList,
  exportPurchaseApplicationDetail,
  getApplier,
  getApplyDept,
  getNodeInfo,
  getPurchaseApplicationDetail,
  getPurchaseApplicationDetailIndex,
  getPurchaseApplicationRate,
  getUserUnit,
  queryPurchaseApplicationList,
  getMaterialsDetail,
  getProjectId,
  queryProcurementReportList,
  getFileList,
  getProjectName,
  getUserDepat,
  getPriceValidate,
  getMountCountList,
  getCompanyAmountList,
  getSupplierAmountList,
  getWayAmountList,
  getSaveAmountList,
} from '../services/purchaseApplicationService';

export default {
  namespace: 'purchaseApplicationModel',
  state: {
    purchaseApplicationList: [], // 采购申请列表数据
    purchaseApplicationPagination: {}, // 分页对象
    procurementReportList: [], // 采购报表列表数据
    procurementReportPagination: {}, // 分页对象
    projectNameList: [], // 项目信息列表数据
    projectNamePagination: {}, // 分页对象
    projectName: '', //项目名称
    projectNumber: '', //项目编号
    projectManagerName: '', //项目经理名字
    projectType: '', //关联立项
    budProjectCode: '', //预算项目编号
    infomation: {}, // 基本信息&申请信息
    fileSource: [], // 附件信息
    fileSourceList: [], // 附件信息列表用于存放查询详情返回的文件防止被覆盖
    purchaseApplicationLineSource: [], // 采购申请行信息数据源
    purchaseApplicationLinePagination: {}, // 采购申请行信息分页
    demander: '', //需求人
    demanderId: '', //需求人id
    demanderPhone: '', //需求人电话
    demanderDepartment: '', //需求人部门
    demanderDepartmentEn: '', //需求人部门英文
    demanderDepartmentId: '', //需求人部门id
    employeeNum: '', // 需求人工号
    applier: '', //申请人
    applierId: '', //申请人id
    applyingDepartmentName: '', //申请人部门
    applyingDepartmentEnName: '', //申请人部门英文
    applyingDepartmentId: '', //申请人部门id
    prStatus: '', //申请状态
    currencyCode: 'HKD', //币种code值
    prRate: '', //汇率
    prReason: '', //采购原因
    prReq: '', //采购需求
    prBakup: '', //需求部门备注给(采购部)
    supBakup: '', //需求部门备注给(供应商)
    prSuggestion: '', //建议采购计划
    deliverAddress: '', //送货地址
    deliverContact: '', //送货地址联系人
    deliveryPhoneNumber: '', //电话
    allDetailsInfo: {}, //当前采购订单编号所有详情数据
    keyId: '', // 关键id
    prNumber: '', //采购申请编号
    projectManagerCode: '', //项目经理编号
    estimatedBudgetAmountHkd: '', //预估总金额HKD
    related: '', //是否关联
    prType: '', //采购类型
    unitCode: '', //申请人部门编码
    delSelectedRows: [], //被删除的数组
    materialsList: [], //物料列表数据
    materialsPagination: {}, //物料分页对象
    projectId: '', //项目id
    flag: '', //流程穿越判断
    UUid: '',

    mountCountList: {}, // 采购数量统计
    companyAmountList: {}, // 部门金额统计
    supplierAmountList: {}, // 供应商金额统计
    wayAmountList: {}, // 采购方式金额统计
    saveAmountList: {}, // 节省金额统计
  },

  effects: {
    // 采购报表列表查
    *queryProcurementReportList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryProcurementReportList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            procurementReportList: res.content.map((item) => {
              return {
                ...item,
                rowKey: uuidv4(),
              };
            }),
            procurementReportPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 查询物料列表数据
    *getMaterialsDetail({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(getMaterialsDetail, payload));
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          uuid: uuidv4(),
        }));
        yield put({
          type: 'commentUpdateState',
          payload: {
            materialsList: newDataSource,
            materialsPagination: pagination,
          },
        });
      }
      return res;
    },
    // 采购申请列表查\\\
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

    // 查询节点信息
    *getNodeInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(getNodeInfo, payload));
      return res;
    },
    // 查询项目id
    *getProjectId({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectId, payload));
      return res;
    },

    // 查询附件
    *getFileList({ payload }, { call }) {
      const res = cusGetResponse(yield call(getFileList, payload));
      return res;
    },

    // 查询总的项目名称
    *getProjectName({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectName, payload));
      return res;
    },

    // 查询需求人部门
    *getUserDepat({ payload }, { call }) {
      const res = cusGetResponse(yield call(getUserDepat, payload));
      return res;
    },

    // 校验金额字段
    *getPriceValidate({ payload }, { call }) {
      const res = getResponse(yield call(getPriceValidate, payload));
      return res;
    },
    *getMountCountList({ payload }, { call }) {
      const res = getResponse(yield call(getMountCountList, payload));
      return res;
    },
    *getCompanyAmountList({ payload }, { call }) {
      const res = getResponse(yield call(getCompanyAmountList, payload));
      return res;
    },
    *getSupplierAmountList({ payload }, { call }) {
      const res = getResponse(yield call(getSupplierAmountList, payload));
      return res;
    },
    *getWayAmountList({ payload }, { call }) {
      const res = getResponse(yield call(getWayAmountList, payload));
      return res;
    },
    *getSaveAmountList({ payload }, { call }) {
      const res = getResponse(yield call(getSaveAmountList, payload));
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
