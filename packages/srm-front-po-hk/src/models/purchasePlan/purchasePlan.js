/**
 * index.js - 采购实施页面
 * @date: 2019-05-20
 * @author: 36712
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  queryList,
  goDownInfo,
  getPrDetailData,
  getSubcontractInfo,
  tecResIm,
  pacSave,
  prPlanSave,
  getSmallPac,
  getJudgeInfo,
  getBothData,
  getPrDetailData0,
  goToPage,
  judgementNode,
  getProjectId,
  getFileList,
  getSupplierList,
  getDataCheck,
  getDecisionInfo,
  saveDecisionInfo,
  getApplyInfo,
} from '@/services/purchasePlan/purchasePlanService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'purchasePlan',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],

    headFromDataSource:{}, // 方案信息及方案负责人数据源
    attachDataSource:[], // 采购方案-附件信息数据源
    pacFormDataSource:[], // 采购方案-标包基本信息数据源 ,
    scoreDataSource:[], // 技术评分表设置数据源 ,
    scoreDataPagination:{}, // 技术评分表设置数据源分页
    quoteDataSource:[], // 报价表格式设置数据源 ,
    quoteDataPagination:[], // 报价表格式设置数据源分页
    judgeDataSource:[], // 评委组设置数据源 ,
    judgeDataPagination:{},// 评委组设置数据源分页


    packageHeadFromDataSource:{},//分标包头部信息
    techReplyDataSource:[], //技术应答表设置信息
    techReplyDataPagination:{},//技术应答表设置信息分页
    busReplyDataSource:[], //商务应答表设置信息
    busReplyDataPagination:{},//商务应答表设置信息分页

    controlTecResp: false,//控制两个【比例】是否显示

    bidProInfo:{}, //主包信息
    smallPacInfo:[], // 子标包信息
    allProId:[], // 所有的proid
    budgeInfo:[], // 评委组信息
    fileSource: [], //文件集合
    bothInfo: [], //both
    selectInfo:'', //审批table下拉框值
    proId:'', // 各个标包的proid
    lastPrNum: '', //采购方案编号
    lastFlag: false, //控制的flag
    // 申请带来的TextArea的文本内容
    projectDesc: '', //项目概况
    prPlan:'', //采购实施计划
    dataSpliceFlag: false, // init0时给true用作【项目概况】【采购实施计划】渲染值来自采购申请的Falg
    delSelectedRows: [], //方案信息中被删除的列
    projectCode:'', //项目编号
    projectId: '', //项目id
    purchaseIdIframe: '', //跳转至申请页需要的申请id
    UUid:'',
    supplierList: [],
    supplierPagination: {}
  },

  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryUnifyIdpValue, {
          // 申请部门
          applyDepartment: '',
          // 采购方案状态
          prStatues: 'HKPC.PRRECORDSSTATUS',
          // 采购申请类型
          prType: '',
          // 采购经办人
          prPerson: '',
          // 申请人
          applicant: ''
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
    // -查询列表
    *queryList({ params }, { put,call }) {
      const res = yield call(queryList, params);
      const response = getResponse(res);
      console.log(response,'response');
      console.log(params,'paramsparams');
      if(response){
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content || [],
            pagination: createPagination(response),
          },
        });
      }
      return response
    },

    /**
     * 导出
     */
    *goDownInfo({ payload }, { call }) {
      const response = getResponse(yield call(goDownInfo, payload));
      return response;
    },

    // 详细页数据
    *getPrDetailData0({ payload }, { put,call }) {
      const res = yield call(getPrDetailData0, payload);
      const response = getResponse(res);
      return response
    },

    // 详细页数据
    *getPrDetailData({ payload }, { put,call }) {
      const res = yield call(getPrDetailData, payload);
      const response = getResponse(res);
      return response
    },

    // 分标包页面数据
    *getSubcontractInfo({ payload }, { put,call }) {
      const res = yield call(getSubcontractInfo, payload);
      const response = getResponse(res);
      return response
    },

    // 技术应答表导入
    *tecResIm({ payload }, { put,call }) {
      const res = yield call(tecResIm, payload);
      const response = getResponse(res);
      return response
    },

    // 分标包页面保存
    *pacSave({ payload }, { put,call }) {
      const res = yield call(pacSave, payload);
      const response = getResponse(res);
      return response
    },

    // 采购方案详情页面保存
    *prPlanSave({ payload }, { put,call }) {
      const res = yield call(prPlanSave, payload);
      const response = getResponse(res);
      return response
    },

    // 获取子标包数据
    *getSmallPac({ payload }, { put,call }) {
      const res = yield call(getSmallPac, payload);
      const response = getResponse(res);
      return response
    },

    // 获取评委组设置的数据
    *getJudgeInfo({ payload }, { put,call }) {
      const res = yield call(getJudgeInfo, payload);
      const response = getResponse(res);
      return response
    },

    // 获取【是否客观分】【分值类型】
    *getBothData({ payload }, { put,call }) {
      const res = yield call(getBothData, payload);
      const response = getResponse(res);
      return response
    },

    // 跳转时跳转接口
    *goToPage({ payload }, { put,call }) {
      const res = yield call(goToPage, payload);
      const response = getResponse(res);
      return response
    },

     // 节点判断
     *judgementNode({ payload }, { put,call }) {
      const res = yield call(judgementNode, payload);
      const response = getResponse(res);
      return response
    },


    // 查询项目id
    *getProjectId({ payload }, { call }) {
      const res = getResponse(yield call(getProjectId, payload));
      return res;
    },

    // 查询附件
    *getFileList({ payload }, { call }) {
      const res = getResponse(yield call(getFileList, payload));
      return res;
    },

    // 邀请供应商
    *getSupplierList({ payload }, { call }) {
      const res = getResponse(yield call(getSupplierList, payload));
      return res;
    },

    // 校验总数据
    *getDataCheck({ payload }, { call }) {
      const res = cusGetResponse(yield call(getDataCheck, payload));
      return res;
    },

    // 查询决策信息数据
    *getDecisionInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(getDecisionInfo, payload));
      return res;
    },

    // 保存决策信息数据
    *saveDecisionInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveDecisionInfo, payload));
      return res;
    },

    // 查询申请信息
    *getApplyInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(getApplyInfo, payload));
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
