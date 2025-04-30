/*
 * contractJudgesSorce - 协议拟制model
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
// import uuidv4 from 'uuid/v4';
import {
  getProjectInfo,
  getAnswerList,
  getAnswerListJs,
  getTenderList,
  getDiddingList,
  getEnclosureList,
  getPriceFileList,
  getcaqaList,
  getOtherCaqaList,
  saveClarification,
  submit,
  deleteClarification,
  getTechnical,
  saveScore,
  submitScore,
  goExport,
  goImport,
  getCompliance,
  saveCompliance,
  submitCompliance,
  getbasicList,
  getMilestoneId,
  getQuestionList,
  goCommitSupplier,
  goCommitJudges,
  getDocumentList,
  queryProjectQaInfo,
  getPassFrame,
  supplierPass,
  getMilDeadline,
  getSupplierList,
  getDiddingRound,
  downLoadBidFilesZip,
  downloadTecbusqatotal,
  downloadTech,
} from '@/services/JudgesSorceService';

export default {
  namespace: 'contractJudgesSorce',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    infoSource: [], //基本信息
    mySource: [], // 自己的技术澄清提问
    myMilestones: [],
    myPagination: {},
    clarificationPagination: {},
    otherSource: [], // 其他人的技术澄清提问
    otherPagination: {},
    answerSourceJs: [],// 技术应答表数据源
    answerJsPaginationJs: {},
    milestonesJs: [],
    answerSource: [], // 商务应答表数据源
    answerPagination: {},
    milestones: [],
    fileSourceT: [], // 投标文件表数据源
    biddingpPagination: {},
    fileSource: [], // 投标文件附件表数据源
    bidPagination: {},
    priceFiles: [], // 报价文件表数据源
    pricePagination: {},
    judgesSorceDataSource: [], // 技术评分表数据源
    judgesSorcePagination: {},
    complianceSource: [], // 符合性审查表数据源
    passStatus: [],
    passPagination: {},
    pagination: {},
    tenderSource: [],
    tenderPagination: {},
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据,
    basicSource: {},
    milestoneIdSource: {},
    questionSource: [], // 技术商务答疑汇总数据源
    questionPagination: {}, // 技术商务答疑汇总分页
    supplierSource: [], // 供应商信息数据源
    supplierPagination: {}
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          sheetList: 'BID.CLASSIFICATION',
          yesNO: 'BID.YES_OR_NO',
          scoreType: 'BID.SCORE_TYPE_SUBJECTIVE', // 分值类型(主观)
          scoreType1: 'BID.SCORE_TYPE_OBJECTIVE', // 分值类型(客观)
          status: 'BID.EXPERT_JURY_REVIEW'
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

    // -查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          kinds: 'SPCM.CONTRACT.KIND',
          partnerTypes: 'SPCM.PC_PARTNER_TYPE',
          contractPurposeList: 'SPCM.CONTRACT_PURPOSE',
          acceptTypeList: 'SPCM.ACCEPT_TYPE',
          propertiesList: 'SPUC.PR_LINE_ITEM_PROPERTIE',
          kiad: 'BID.SUPPLY_WAY_TEST',
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

    *getProjectInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(getProjectInfo, payload));
      return response;
    },

    // -查询招标文件表
    *getTenderList({ payload }, { call }) {
      const response = getResponse(yield call(getTenderList, payload));
      return response;
    },

    // 应答表
    *getDocumentList({ payload }, { call, put }) {
      const response = getResponse(yield call(getDocumentList, payload));
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
      return response;
    },
    // -查询投标文件表
    *getDiddingList({ payload }, { call }) {
      const response = getResponse(yield call(getDiddingList, payload));
      return response;
    },

    // -查询投标文件附件表
    *getEnclosureList({ payload }, { call }) {
      const response = getResponse(yield call(getEnclosureList, payload));
      return response;
    },

    // -查询报价文件表
    *getPriceFileList({ payload }, { call }) {
      const response = getResponse(yield call(getPriceFileList, payload));
      return response;
    },

    *queryProjectQaInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryProjectQaInfo, payload));
      return res;
    },
    // -查询自己的技术澄清提问表
    *getcaqaList({ payload }, { call }) {
      const response = getResponse(yield call(getcaqaList, payload));
      return response;
    },

    // -查询别人的技术澄清提问表
    *getOtherCaqaList({ payload }, { call }) {
      const response = getResponse(yield call(getOtherCaqaList, payload));
      return response;
    },

    // 保存提问
    *saveClarification({ payload }, { call }) {
      const response = getResponse(yield call(saveClarification, payload));
      return response;
    },
    // 提交提问
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload));
      return response;
    },

    // 删除提问
    *deleteClarification({ payload }, { call }) {
      const response = getResponse(yield call(deleteClarification, payload));
      return response;
    },

    // 查询是否允许供应商继续评分
    *getPassFrame({ payload }, { call }) {
      const response = getResponse(yield call(getPassFrame, payload));
      return response;
    },

    // 确认供应商是否通过
    *supplierPass({ payload }, { call }) {
      const response = getResponse(yield call(supplierPass, payload));
      return response;
    },

    // -技术评分表
    *getTechnical({ payload }, { call }) {
      const response = getResponse(yield call(getTechnical, payload));
      return response;
    },

    // 技术评分表保存
    *saveScore({ payload }, { call }) {
      const response = getResponse(yield call(saveScore, payload));
      return response;
    },

    // 技术评分表提交
    *submitScore({ payload }, { call }) {
      const response = getResponse(yield call(submitScore, payload));
      return response;
    },

    // 技术评分表导出
    *goExport({ payload }, { call }) {
      const response = getResponse(yield call(goExport, payload));
      return response;
    },

    // 技术评分表导入
    *goImport({ payload }, { call }) {
      const response = getResponse(yield call(goImport, payload));
      return response;
    },

    // -查询商务文件表
    *getAnswerList({ payload }, { call }) {
      const response = getResponse(yield call(getAnswerList, payload));
      return response;
    },

    // -查询技术文件表
    *getAnswerListJs({ payload }, { call }) {
      const response = getResponse(yield call(getAnswerListJs, payload));
      return response;
    },

    // 符合性审查表
    *getCompliance({ payload }, { call, put }) {
      const response = getResponse(yield call(getCompliance, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            complianceSource: response.map(n => ({
              ...n,
              _status: 'update',
            })),
          },
        });
        return response;
      }
    },

    // 符合性审查表的保存
    *saveCompliance({ payload }, { call }) {
      const response = getResponse(yield call(saveCompliance, payload));
      return response;
    },

    // 符合性审查表的提交
    *submitCompliance({ payload }, { call }) {
      const response = getResponse(yield call(submitCompliance, payload));
      return response;
    },

    // -评分表确认技术澄清-基本信息查询
    *getbasicList({ payload }, { call, put }) {
      const response = getResponse(yield call(getbasicList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            basicSource: response
          },
        });
      }
    },

    // -评分表确认技术澄清-查询里程碑信息
    *getMilestoneId({ payload }, { call, put }) {
      const response = getResponse(yield call(getMilestoneId, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            milestoneIdSource: response
          },
        });
      }
    },

    // -评分表确认技术澄清-技术商务答疑汇总
    *getQuestionList({ payload }, { call }) {
      const response = getResponse(yield call(getQuestionList, payload));
      return response;
    },

    // -评分表确认技术澄清-转交提问给供应商
    *goCommitSupplier({ payload }, { call }) {
      const response = getResponse(yield call(goCommitSupplier, payload));
      return response;
    },

    // -评分表确认技术澄清-反馈答复给评委
    *goCommitJudges({ payload }, { call }) {
      const response = getResponse(yield call(goCommitJudges, payload));
      return response;
    },

    // 里程碑截止时间
    *getMilDeadline({ payload }, { call }) {
      const response = getResponse(yield call(getMilDeadline, payload));
      return response;
    },

    // 供应商信息查询
    *getSupplierList({ payload }, { call }) {
      const response = getResponse(yield call(getSupplierList, payload));
      return response;
    },

    // -查询投标文件和轮次-5.20版本
    *getDiddingRound({ payload }, { call, put }) {
      const response = getResponse(yield call(getDiddingRound, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            fileSourceT: response.datail && response.datail.content,
            biddingpPagination: createPagination(response.datail),
            milestonesTb: response.milestones &&
              response.milestones.map(item => ({
                value: item.milestoneId,
                meaning: item.round,
              }))
          }
        });
      }
      return response;
    },
    // -投标文件-指定行的全部下载
    *downLoadBidFilesZip({ payload }, { call }) {
      const response = getResponse(yield call(downLoadBidFilesZip, payload));
      return response;
    },

    // 技术商务答疑汇总下载11.25
    *downloadTecbusqatotal({ payload }, { call }) {
      const response = getResponse(yield call(downloadTecbusqatotal, payload));
      return response;
    },

    // 技术应答表
    *downloadTech({ payload }, { call }) {
      const response = getResponse(yield call(downloadTech, payload));
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
