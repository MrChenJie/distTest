/*
 * contractJudgesCusSorce - 协议拟制model
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import uuid from 'uuid/v4';
import {
  getProjectInfo,
  getAnswerList,
  getAnswerListJs,
  getTenderList,
  downLoadTenderFilesZip,
  getDiddingRound,
  getDiddingList,
  downLoadBidFilesZip,
  getEnclosureList,
  getPriceRound,
  getPriceFileList,
  downLoadPriceFilesZip,
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
  getPassFrameSubmit,
  getMilestoneIdInProId,
  getInstructions,
  isRefreshChance,
  getMilDeadline,
  getJudgesDetails,
  saveJudgesDetails,
  submitJudgesDetails,
} from '@/services/JudgesSorceCusService';

export default {
  namespace: 'contractJudgesCusSorce',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    infoSource: {}, //基本信息
    mySource: [], // 自己的技术澄清提问
    myMilestones: [], // 技术澄清提问轮次信息
    myPagination: {},
    editPassFrame: false, // 答疑完结后判断是否允许编辑初审/初评表
    clarificationPagination: {},
    otherSource: [], // 其他人的技术澄清提问
    otherPagination: {},
    answerSourceJs: [],// 技术应答表数据源
    answerPaginationJs: {},
    answerMilestonesJs: [],// 技术应答表轮次信息
    answerSource: [], // 商务应答表数据源
    answerPagination: {},
    answerMilestones: [],// 商务应答表轮次信息
    milestones: [],
    milestonesTb: [], // 投标文件轮次信息
    fileSourceT: [], // 投标文件表数据源
    biddingpPagination: {},
    fileSource: [], // 投标文件附件表数据源
    bidPagination: {},
    milestonesBj: [], // 报价文件轮次信息
    priceFiles: [], // 报价文件表数据源
    pricePagination: {},
    judgesSorceDataSource: [], // 技术评分表数据源
    judgesSorcePagination: {},
    complianceSource: [], // 符合性审查表数据源
    compliancePagination: {},
    passStatus: [],
    passPagination: {},
    gradingState: '', // 初审提交标识
    pagination: {},
    tenderSource: [],
    tenderPagination: {},
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据,
    basicSource: {},
    milestoneIdSource: {},
    questionSource: [], // 技术商务答疑汇总数据源
    questionPagination: {}, // 技术商务答疑汇总分页
    milestoneList: [], // 根据proId查询的所有里程碑
    groupUnsaveFlag: false, // 技术澄清提问分页校验是否有数据未保存
    compreUnsaveFlag: false, // 初审分页校验是否有数据未保存
    compreFirstUnsaveFlag: false, // 初评分页校验是否有数据未保存
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
          status: 'BID.EXPERT_JURY_REVIEW',
          listType: 'BID.PROCUREMENT_METHOD', // 采购方式
          listTypeNew: 'BID.PROCUREMENT_METHODNEW', // 更新系统用词的新值集
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
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            infoSource: response,
          },
        });
      }
      return response;
    },

    // -查询招标文件表
    *getTenderList({ payload }, { call }) {
      const response = getResponse(yield call(getTenderList, payload));
      return response;
    },

    // 招标文件-全部下载
    *downLoadTenderFilesZip({ payload }, { call }) {
      const response = getResponse(yield call(downLoadTenderFilesZip, payload));
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

    // -查询投标文件表
    *getDiddingList({ payload }, { call }) {
      const response = getResponse(yield call(getDiddingList, payload));
      return response;
    },

    // -投标文件-指定行的全部下载
    *downLoadBidFilesZip({ payload }, { call }) {
      const response = getResponse(yield call(downLoadBidFilesZip, payload));
      return response;
    },

    // -查询投标文件附件表
    *getEnclosureList({ payload }, { call }) {
      const response = getResponse(yield call(getEnclosureList, payload));
      return response;
    },

    // -查询报价文件和轮次-5.20版本
    *getPriceRound({ payload }, { call, put }) {
      const response = getResponse(yield call(getPriceRound, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            priceFiles: response.datail && response.datail.content,
            pricePagination: createPagination(response.datail),
            milestonesBj: response.milestones &&
              response.milestones.map(item => ({
                value: item.milestoneId,
                meaning: item.round,
              }))
          }
        });
      }
      return response;
    },

    // -查询报价文件表
    *getPriceFileList({ payload }, { call }) {
      const response = getResponse(yield call(getPriceFileList, payload));
      return response;
    },

    // 报价文件-指定行的全部下载
    *downLoadPriceFilesZip({ payload }, { call }) {
      const response = getResponse(yield call(downLoadPriceFilesZip, payload));
      return response;
    },

    *queryProjectQaInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryProjectQaInfo, payload));
      return res;
    },
    // -查询自己的技术澄清提问表
    *getcaqaList({ payload }, { call, put }) {
      let response = yield call(getcaqaList, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            mySource: response.page?.content.map(item => ({
              ...item,
              tempId: uuid(),
              canEdit: false,
              _status: 'update',
            })),
            myPagination: createPagination(response.page),
            myMilestones: response?.milestones.map(item => ({
                value: item.milestoneId,
                meaning: item.round,
                // state: item.milestoneState,
              })),
            editPassFrame: response.qaEnd !== 'y',
            qaEnd: response.qaEnd
          },
        });
      }
      return response;
    },

    // -查询别人的技术澄清提问表
    *getOtherCaqaList({ payload }, { call, put }) {
      const response = getResponse(yield call(getOtherCaqaList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            otherSource: response.content.map(item => ({
              ...item,
              _status: 'update',
              otherId: uuid(),
            })),
            otherPagination: createPagination(response),
          },
        });
      }
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
    *getAnswerList({ payload }, { call, put }) {
      const response = getResponse(yield call(getAnswerList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            answerSource: response.page?.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            answerPagination: createPagination(response.page),
            answerMilestones: response?.milestones.map(item => ({
              value: item.milestoneId,
              meaning: item.round,
            }))
          },
        });
        return response;
      }
    },

    // -查询技术文件表
    *getAnswerListJs({ payload }, { call, put }) {
      const response = getResponse(yield call(getAnswerListJs, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            answerSourceJs: response.page?.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            answerPaginationJs: createPagination(response.page),
            answerMilestonesJs: response?.milestones.map(item => ({
              value: item.milestoneId,
              meaning: item.round,
            }))
          },
        });
        return response;
      }
    },

    // 符合性审查表(初评)
    *getCompliance({ payload }, { call, put }) {
      const response = getResponse(yield call(getCompliance, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            complianceSource: response.content && response.content.map(n => ({
              ...n,
              canEdit: false,
              _status: 'update',
            })),
            compliancePagination: createPagination(response),
          },
        });
        return response;
      }
    },

    // 符合性审查表(初评)-保存
    *saveCompliance({ payload }, { call }) {
      const response = getResponse(yield call(saveCompliance, payload));
      return response;
    },

    // 符合性审查表(初评)-提交
    *submitCompliance({ payload }, { call }) {
      const response = getResponse(yield call(submitCompliance, payload));
      return response;
    },

    // 符合性审查表(初审)-5.20
    *getPassFrame({ payload }, { call, put }) {
      const response = getResponse(yield call(getPassFrame, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            passStatus: response.supplierGradingDTOList && response.supplierGradingDTOList.map((item) => ({
              ...item,
              unqualifiedSupplier: item.unqualifiedSupplier ? item.unqualifiedSupplier : 'y',
              canEdit: response.gradingState === 'y' ? true : false,
              _status: 'update',
            })),
            passPagination: createPagination(response.supplierGradingDTOList),
            // trialResultSubmit: response.trialResultSubmit,
            gradingState: response.trialResultSubmit,
          },
        });
        return response;
      }
    },

    // 符合性审查表(初审)-提交-5.20
    *getPassFrameSubmit({ payload }, { call }) {
      const response = getResponse(yield call(getPassFrameSubmit, payload));
      return response;
    },

    // 符合性审查表-初审保存-5.20
    *supplierPass({ payload }, { call }) {
      const response = getResponse(yield call(supplierPass, payload));
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

    *getMilestoneIdInProId({ payload }, { call, put }) {
      let result = yield call(getMilestoneIdInProId, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            milestoneList: result,
          },
        });
      }
      return result;
    },

    // 获取【使用说明】模板
    *getInstructions({ payload }, { call, put }) {
      const response = getResponse(yield call(getInstructions, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            instruceValue: response.value
          },
        });
      }
    },

    // 是否允许保存/提交
    *isRefreshChance({ payload }, { call }) {
      const response = getResponse(yield call(isRefreshChance, payload));
      return response;
    },

    // 技术澄清提问新建/删除时校验里程碑是否截止
    *getMilDeadline({ payload }, { call }) {
      const response = getResponse(yield call(getMilDeadline, payload));
      return response;
    },

    // 查询处理意见
    *getJudgesDetails ({ payload }, { call }) {
      const response = getResponse(yield call(getJudgesDetails, payload));
      return response;
    },

    // 保存处理意见
    *saveJudgesDetails ({ payload }, { call }) {
      const response = getResponse(yield call(saveJudgesDetails, payload));
      return response;
    },

    // 提交处理意见
    *submitJudgesDetails ({ payload }, { call }) {
      const response = getResponse(yield call(submitJudgesDetails, payload));
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
