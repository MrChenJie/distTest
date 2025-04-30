/*
 * contractMaintain1 - 协议拟制model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  add,
  update,
  submit,
  cancel,
  queryList,
  getTableList,
  addTableList,
  updateTableList,
  saveTableList,
  deleteTableList,
  goImport,
  getJudgesTableList,
  addJudgesTableList,
  updateJudgesTableList,
  saveJudgesTableList,
  deleteJudgesTableList,
  editNotices,
  getResultList,
  getSorceList,
  completionQA,
  completionQAInquiry,
  approvalProcess,
  getNoticesLook,
  getNoticesLook1,
  getResultEmailList,
  deleteHeader,
  deletePro,
  deleteQuotation,
  pcSubjectLinesDelete,
  pcStageLinesDelete,
  partnerLinesDelete,
  pcRebateLinesDelete,
  fetchDetailHeader,
  fetchPartner,
  fetchOperationRecordList,
  bindHeaderAttachmentUuid,
  bindLineAttachmentUuid,
  fetchCategory,
  fetchOperationRecord,
  fetchSubject,
  fetchTerm,
  fetchPcPartnerTypes,
  updateContractTextUrl,
  fetchExtended,
  fetchStageOptions,
  fetchSourceList,
  sourceCreate,
  fetchLadderOffer,
  fetchSubjectCreateList,
  fetchSubjectQuoteList,
  appendValidate,
  queryCopyList,
  copyContract,
  quotationList,
  supplierList,
  supplierListMeeting,
  updateSupplierTableList,
  deleteSupplierTableList,
  saveQuotation,
  fetchPurchaseOrder,
  checkCreatePo,
  getSignUpTableList,
  getSupplierApprovalTableList,
  checkColludeBidQuery,
  issueTenders,
  getListDetail,
  fetchAddPurchaseOrder,
  queryNoticeType,
  saveHandover,
  getListAll,
  checkEdit,
  getStatisticInfo,
  getMilestoneStatistics,
  saveInviteSuppliers,
  queryProjectQaInfo,
  getBidInviteNot,
  getEmailInfo,
  saveProject,
  finishList,
  getStartSorceList,
  saveStartSorceList,
  checkColludeBidSave,
  checkColludeBidSubmit,
  getMilestoneId,
  submitDecisionInfo,
  getOffLineNotices,
  saveOffLineNotices,
  handleOffLineNotices,
  checkSupplierBlackFlag,
  sendSupplierEmailInvited,
  getCheckSwitch,
  getCheckScoreMessage,
  setJudgesSendDeal,
  setJudgesSave,
  checkClarificationTime,
  priceListDeleteAll,
  getCheckSend,
  getCheckSummary,
  saveClause,
  getClauseInfo,
  handleClauseTemInfo,
  checkClauseInfo,
  getSupplierList,
  saveOnlyResultUrl,
  getIsSelectSup,
  getSupplierBidOpenList,
  saveOpenBid,
  saveFailedBid,
  getBidCheckFile,
  queryUuidByFileType,
  saveAttachmentType,
  saveAttachmentTypeOther,
  getTechfileList,
  saveTechfileList,
  checkUploadTechfile,
} from '@/services/contractMaintainService';

export default {
  namespace: 'contractMaintain',

  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    judgesDataSource: [], // 评委组设置数据源
    addState: '',
    counts: '',
    judgesPagination: {},
    quotationSource: [], // 报价表数据
    quotationPagination: {}, // 报价表分页
    pagination: {},
    paginationN:{},
    quoteSourceList: [],
    dataSource1: [],
    sourceResultDTOs: [],
    noticeLists: [],
    noticePagination: {},
    resultList: [], //采购结果查询弹框表数据源
    resultPagination: {}, //采购结果查询弹框表分页
    sorceList: [], //评委评分弹框表数据源
    sorcePagination: {},
    emailPreview: '',
    quoteSourcePagination: {},
    copyModalDataSource: [], // 协议复制单据数据
    copyModalPagination: {}, // 协议复制单据分页
    copyEnumMap: {}, // 协议复制值集
    purchaseOrderList: [], // 采购订单列表
    purchaseOrderPagination: {}, // 采购订单分页
    code: {}, // 采购订单值集
    addPoList: [],
    addPoPagination: {},
    dataRegistration: {},
    onlineData:[],
    onlinePagination:{},
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据,
    noticeCascaderType: [], // 里程碑及状态值集
    supplierSource: [], // 邀请供应商数据
    supplierPagination: {},
    technologySource: [],
    technologyPagination: {},
    SelectPagination1:{},
    SelectPagination0:{},
    newFile:'',
    newList:[],
    startSorceList:[],
    supplierListPagination:{},
    paginationApproval: {},
    checkList:[],
    checkFlag:false,
    noticeFlowRecordDtoList: [], // 流转信息数据源
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      // console.log('params',params)
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          demandDepart: 'BID.DEMAND.DEPARTMENT',
          status: 'BID.STATE',
          superiorDemandDepart: '',
          flag: 'SPCM.CONTRACT.STATUS',
          status: 'SPCM.CONTRACT.KIND',
          checkListFlag: 'BID.IDENTIFICATION_RESULT',
          area: 'BID.AREA',
          offlineType: 'BID.OFFLINE_NOTICE_TYPE1', // 线下公告-简体
          offlineTypeTC: 'BID.OFFLINE_NOTICE_TYPE_TC1', // 线下公告-繁体
          offlineTypeEN: 'BID.OFFLINE_NOTICE_TYPE_EN1', // 线下公告-英文
          bpmGuid: 'BPM_SCM_GGSP', // 致远guid
        })
      );
      const noticeCascaderType = getResponse(
        yield call(queryNoticeType, {
          'BID.MILESTONEANDSTATE-MS': 1,
          'BID.MILESTONEANDSTATE-STATE': 2,
        })
      );
      // if (enumMap) {
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
          noticeCascaderType,
        },
      });
      // }
 
      if(params) {
        const { lovCodes = null } = params;
        if(lovCodes) {
        const res = getResponse(yield call(queryMapIdpValue, lovCodes));
        const { typeList, sheetList } = res;
        yield put({
          type: 'setCodeReducer',
          payload: {
            'BID.YES_OR_NO': typeList,
            'BID.SUPPLY_WAY': sheetList,
          },
        })
      }
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
          listType: 'BID.PROCUREMENT_METHOD',
          yesNo:'BID.YES_OR_NO',
          checkListFlag: 'BID.IDENTIFICATION_RESULT',
          scoreType: 'BID.SCORE_TYPE_SUBJECTIVE', // 分值类型(主观)
          scoreType1: 'BID.SCORE_TYPE_OBJECTIVE', // 分值类型(客观)
          judgesNums: 'BID.AMOUNT', // 评委人数
          judgesType: 'BID.EXPERT_TYPE', // 评委类型值集
          judgesState: 'BID.POTENCY_STATUS', // 评委状态
          readStates: 'BID.READ_STATUS', //评委守则阅读状态
          newType:'BID.DECISION_TYPE', //决策类型
          quotationMode: 'BID.QUOTE_MODE', // 报价模式
          noticeState: 'BID.STATE',
          showPass: 'BID.EXPERT_JURY_REVIEW',
          publishState: 'BID.STATE',
          listTypeNew: 'BID.PROCUREMENT_METHOD_1', // 预算总金额50~100万没有公开询价
          bpmGuid: 'BPM_SCM_GGSP', // 详情页请求的致远guid
          budgetTypeList: 'HKPC.BUDGETTYPE', // 预算类型
          purchaseCategoryList: 'HKPC.PURCHASINGCATEGORY', // 采购类别
          yesNoAlternate: 'HKPC.SELECTED_SUP',
          portalAttachlist: 'CMHK.PORTAL.ATTACHLIST',
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

    // 校验新增标的数据正确性
    *appendValidate({ payload }, { call }) {
      const res = yield call(appendValidate, payload);
      return getResponse(res);
    },

    // -查询合作伙伴值集
    *fetchPcPartnerTypes({ payload }, { put, call, select }) {
      const { detailEnumMap } = yield select((state) => state.contractMaintain1);
      const result = getResponse(yield call(fetchPcPartnerTypes, payload));
      // 查询协议阶段值集
      const stageOptions = getResponse(yield call(fetchStageOptions, payload));
      if (result && stageOptions) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap: {
              ...detailEnumMap,
              partnerTypes: (result && result.filter((i) => i.enabledFlag)) || [],
              stageOptions: stageOptions.content || [],
            },
          },
        });
      }
    },

    //获取表格信息商务应答
    *getListDetail({ payload }, { call, put }) {
      const response = getResponse(yield call(getListDetail, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource1: response.map((n) => ({
              ...n,
            })),
            // pagination: createPagination(response),
          },
        });
      }
    },
    //邀请函模板预览
    *getBidInviteNot({ payload }, { call, put }) {
      const response = getResponse(yield call(getBidInviteNot, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            emailPreview: response.templateContent,
          },
        });
      }
    },

    *queryProjectQaInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(queryProjectQaInfo, payload));
      return res;
    },
    // -采购工作台查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // 保存
    *saveProject({ payload }, { call }) {
      const response = getResponse(yield call(saveProject, payload));
      return response;
    },

    // 报价表查询列表
    *quotationList({ payload }, { call }) {
      const response = getResponse(yield call(quotationList, payload));
      return response;
    },

    // 报价表数据更新
    *saveQuotation({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveQuotation, payload));
      return response;
    },
    // check
    *checkEdit({ payload }, { call }) {
      const response = getResponse(yield call(checkEdit, payload));
      return response;
    },
    // 汇总表
    *getListAll({ payload = {} }, { call, put }) {
      const { page, ...params } = payload;
      const response = getResponse(yield call(getListAll, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            paginationN: createPagination(response),
          },
        });
      }
      return response
    },
    // -删除报价表
    *deleteQuotation({ payload }, { call }) {
      const response = getResponse(yield call(deleteQuotation, payload));
      return response;
    },

    // 供应商列表查询
    *supplierList({ payload }, { call }) {
      const response = getResponse(yield call(supplierList, payload));
      return response
    },

    // 述标会议列表查询
    *supplierListMeeting({ payload }, { call }) {
      const response = getResponse(yield call(supplierListMeeting, payload));
      return response
    },

    // 供应商列表数据更新
    *updateSupplierTableList({ payload }, { call }) {
      const response = getResponse(yield call(updateSupplierTableList, payload));
      return response;
    },

    // 删除供应商表数据
    *deleteSupplierTableList({ payload }, { call }) {
      const response = getResponse(yield call(deleteSupplierTableList, payload));
      return response;
    },

    // -删除投标项目
    *deletePro({ payload }, { call }) {
      const response = getResponse(yield call(deletePro, payload));
      return response;
    },

    // 报名响应列表数据
    *getSignUpTableList({ payload }, { call, put }) {
      const { page, ...params } = payload;
      const response = getResponse(yield call(getSignUpTableList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: params,
            signUpList: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // 报名审批查询列表
    *getSupplierApprovalTableList({ payload = {} }, { call, put }) {
      const { page, ...params } = payload;
      const response = getResponse(yield call(getSupplierApprovalTableList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: params,
            checkFlag: response.showButton || false,
            dataRegistration: response.content,
            paginationApproval: createPagination(response),
          },
        });
      }
      return response
    },

    // 报名审批查询列表串标
    *checkColludeBidQuery({ payload = {} }, { call, put }) {
      const response = getResponse(yield call(checkColludeBidQuery, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            checkList: response.map((n) => ({
              ...n,
              _status: 'update',
            })),
          },
        });
      }
      return response
    },
    // 报名审批查询列表串标保存
    *checkColludeBidSave({ payload }, { call }) {
      const response = getResponse(yield call(checkColludeBidSave, payload));
      return response;
    },
    // 报名审批查询列表串标提交
    *checkColludeBidSubmit({ payload }, { call }) {
      const response = getResponse(yield call(checkColludeBidSubmit, payload));
      return response;
    },

    // 结束
    *finishList({ payload }, { call, put }) {
      const response = getResponse(yield call(finishList, payload));
      return response
    },

    // 通过审批发放标书（采购）
    *issueTenders({ payload }, { call }) {
      const response = cusGetResponse(yield call(issueTenders, payload));
      return response;
    },

    // 技术评分表---------------------------------------------------------------------
    // 获取技术评分表数据
    *getTableList({ payload }, { call, put }) {
      // const { page, ...params } = payload;
      const response = getResponse(yield call(getTableList, payload));
      return response;
    },

    // -查询技术评分表的导入
    // *uploadList({ payload }, { call, put }) {
    //   const response = getResponse(yield call(uploadList, payload));
    //   debugger
    //   if (response) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         dataSource: response.content.map((n) => ({
    //           ...n,
    //           _status: 'update',
    //         })),
    //         pagination: createPagination(response),
    //       },
    //     });
    //   }
    // },
    // -新建技术评分表数据
    *addTableList({ payload }, { call }) {
      const response = getResponse(yield call(addTableList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            technologySource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            technologyPagination: createPagination(response),
          },
        });
      }
    },
    // -更新技术评分表数据
    *updateTableList({ payload }, { call }) {
      const response = getResponse(yield call(updateTableList, payload));
      return response;
    },

    // 保存技术评分表数据
    *saveTableList({ payload }, { call, put }) {
      const response = getResponse(yield call(saveTableList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            technologySource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            technologyPagination: createPagination(response),
          },
        });
      }
    },

    // 删除技术评分表数据
    *deleteTableList({ payload }, { call }) {
      const response = getResponse(yield call(deleteTableList, payload));
      return response;
    },

    // 技术评分表导入
    *goImport({ payload }, { call }) {
      const response = getResponse(yield call(goImport, payload));
      return response;
    },

    // 评委组设置---------------------------------------------------------------------
    // 获取评委设置表数据
    *getJudgesTableList({ payload }, { call, put }) {
      const response = getResponse(yield call(getJudgesTableList, payload));
      // if (response.page && response.page.content.length > 0) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       judgesDataSource: response.page.content.map((n) => ({
      //         ...n,
      //         _status: 'update',
      //       })),
      //       addState: response.state,
      //       counts: response.judgesCount,
      //       judgesPagination: createPagination(response),
      //     },
      //   });
      //   return response;
      // } else {
        return response;
      // }
    },

    // -新建评委设置表数据
    *addJudgesTableList({ payload }, { call }) {
      const response = getResponse(yield call(addJudgesTableList, payload));
      return response;
    },
    // -更新评委设置表数据
    *updateJudgesTableList({ payload }, { call }) {
      const response = getResponse(yield call(updateJudgesTableList, payload));
      return response;
    },

    // 保存评委设置表数据
    *saveJudgesTableList({ payload }, { call }) {
      const response = yield call(saveJudgesTableList, payload);
      return response;
    },

    // 删除评委设置表数据
    *deleteJudgesTableList({ payload }, { call }) {
      const response = getResponse(yield call(deleteJudgesTableList, payload));
      return response;
    },

    // 公告相关接口----------------------------------------------------------------------------------
    // 保存公告
    *editNotices({ payload }, { call, put }) {
      const response = cusGetResponse(yield call(editNotices, payload));
      if (response && !response.failed) {
        yield put({
          type: 'updateState',
          payload: {
            noticeList: response.map((n) => ({
              ...n,
            })),
            // resultPagination: createPagination(response),
          },
        });
      }
      return response
    },
    // 保存公告后发起MIP审批
    *approvalProcess({ payload }, { call }) {
      const response = getResponse(yield call(approvalProcess, payload));
      return response;
    },

    // 查询公告列表
    *getNoticesLook({ payload }, { call, put }) {
      const response = getResponse(yield call(getNoticesLook, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            noticeLists: response.content.map((n) => ({
              ...n,
            })),
            noticePagination: createPagination(response),
          },
        });
      }
    },
    *getNoticesLook1({ payload }, { call, put }) {
      const response = getResponse(yield call(getNoticesLook1, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            noticeLists: response.content.map((n) => ({
              ...n,
            })),
            noticePagination: createPagination(response),
          },
        });
      }
    },

    //采购结果查询
    *getResultList({ payload }, { call, put }) {
      const response = getResponse(yield call(getResultList, payload));
      if (response.content != undefined) {
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            resultList: response.content.map((n) => ({
              ...n,
            })),
            resultPagination: createPagination(response),
          },
        });
      }
      return response;
    }
    },
    //采购结果的模板预览
    *getResultEmailList({ payload }, { call, put }) {
      const response = getResponse(yield call(getResultEmailList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            emailPreview: response.content,
          },
        });
      }
    },

    //查看评委评分弹框表数据查询
    *getSorceList({ payload }, { call, put }) {
      const response = getResponse(yield call(getSorceList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            sorceList: response,
            sorcePagination: createPagination(response),
          },
        });
      }
    },

    // 答疑完结-采购方式除公开询价，邀请询价外调用
    *completionQA({ payload }, { call }) {
      const response = getResponse(yield call(completionQA, payload));
      return response;
    },

    // 答疑完结-采购方式为公开询价，邀请询价调用
    *completionQAInquiry({ payload }, { call }) {
      const response = getResponse(yield call(completionQAInquiry, payload));
      return response;
    },

    // 获取项目状态统计/项目最终报价金额
    *getStatisticInfo({ payload }, { call }) {
      const response = getResponse(yield call(getStatisticInfo, payload));
      return response;
    },

    // 获取项目最终报价金额
    *getMilestoneStatistics({ payload }, { call }) {
      const response = getResponse(yield call(getMilestoneStatistics, payload));
      return response;
    },

    // -新建采购申请头
    *add({ payload }, { call }) {
      const response = getResponse(yield call(add, payload));
      return response;
    },
    // -更新采购申请头
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload));
      return response;
    },
    // -更新头上协议文本url
    *updateContractTextUrl({ payload }, { call }) {
      const response = getResponse(yield call(updateContractTextUrl, payload));
      return response;
    },

    // -提交采购协议
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload));
      return response;
    },
    // -删除采购申请
    *delete({ payload }, { call }) {
      const response = getResponse(yield call(deleteHeader, payload));
      return response;
    },

    // 取消采购申请
    *cancel({ payload }, { call }) {
      const response = getResponse(yield call(cancel, payload.prHeaderDTOs));
      return response;
    },
    // 查询明细头
    *fetchDetailHeader({ pcHeaderId }, { call }) {
      const response = yield call(fetchDetailHeader, pcHeaderId);
      return getResponse(response);
    },
    // 查询合作伙伴列表
    *fetchPartner({ payload }, { call }) {
      const res = yield call(fetchPartner, payload);
      return getResponse(res);
    },
    // 查询标的信息列表
    *fetchSubject({ payload }, { call }) {
      const res = yield call(fetchSubject, payload);
      return getResponse(res);
    },
    // 查询标的信息列表
    *fetchTerm({ payload }, { call }) {
      const res = yield call(fetchTerm, payload);
      return getResponse(res);
    },
    // -删除标的信息
    *pcSubjectLinesDelete({ payload }, { call }) {
      const res = yield call(pcSubjectLinesDelete, payload);
      return getResponse(res);
    },
    // 删除阶段信息
    *pcStageLinesDelete({ payload }, { call }) {
      const res = yield call(pcStageLinesDelete, payload);
      return getResponse(res);
    },
    // -删除合作伙伴
    *partnerLinesDelete({ payload }, { call }) {
      const res = yield call(partnerLinesDelete, payload);
      return getResponse(res);
    },
    // -删除返利信息行
    *pcRebateLinesDelete({ payload }, { call }) {
      const res = yield call(pcRebateLinesDelete, payload);
      return getResponse(res);
    },
    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 绑定头附件id
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },
    // 绑定行附件id
    *bindLineAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindLineAttachmentUuid, payload));
      return result;
    },
    // -查询品类定义
    *fetchCategory({ payload }, { call }) {
      const res = getResponse(yield call(fetchCategory, payload));
      return res;
    },
    // 查询操作记录
    *fetchOperationRecord({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperationRecord, payload));
      return res;
    },
    // 查询公司扩展信息
    *fetchExtended({ payload }, { call }) {
      const res = getResponse(yield call(fetchExtended, payload));
      return res;
    },
    // 查询公司扩展信息
    *fetchSourceList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchSourceList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quoteSourceList: res.content,
            quoteSourcePagination: createPagination(res),
          },
        });
      }
    },

    // 检验是否可创建
    *sourceCreate({ payload }, { call }) {
      const res = getResponse(yield call(sourceCreate, payload));
      return res;
    },

    // 查询阶梯报价
    *fetchLadderOffer({ payload }, { call }) {
      const res = getResponse(yield call(fetchLadderOffer, payload));
      return res;
    },

    // 查询新建标的模态框列表
    *querySubjectCreateList({ pcHeaderId, params }, { call }) {
      const res = yield call(fetchSubjectCreateList, pcHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    // 查询寻源-标的模态框列表
    *querySubjectQuoteList({ pcHeaderId, params }, { call }) {
      const res = yield call(fetchSubjectQuoteList, pcHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    // 复制协议值集获取
    *getCopyBatchCode(params, { put, call }) {
      const copyEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
        })
      );
      if (copyEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            copyEnumMap,
          },
        });
      }
    },
    // 查询复制协议列表
    *queryCopyList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryCopyList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            copyModalDataSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            copyModalPagination: createPagination(response),
          },
        });
      }
    },

    // 复制协议
    *copyContract({ payload }, { call }) {
      const response = getResponse(yield call(copyContract, payload));
      return response;
    },

    // 查询采购订单
    *fetchPurchaseOrder({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchPurchaseOrder, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseOrderList: result.content,
            purchaseOrderPagination: createPagination(result),
          },
        });
      }
    },
    // 查询采购订单值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 校验是否可以引用订单创建
    *checkCreatePo({ payload }, { call }) {
      const response = getResponse(yield call(checkCreatePo, payload));
      return response;
    },
    // 查询新增标的行采购订单
    *fetchAddPurchaseOrder({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchAddPurchaseOrder, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            addPoList: result.content,
            addPoPagination: createPagination(result),
          },
        });
      }
    },

    // 项目转交
    *saveHandover({ payload }, { call }) {
      const res = getResponse(yield call(saveHandover, payload));
      return res;
    },

    // 邀请供应商-保存
    *saveInviteSuppliers({ payload }, { call }) {
      const response = getResponse(yield call(saveInviteSuppliers, payload));
      return response;
    },

    // 邀请供应商-查看理由
    *getEmailInfo({ payload }, { call }) {
      const response = getResponse(yield call(getEmailInfo, payload));
      return response;
    },
    
    //查看评委评审
    *getStartSorceList({ payload }, { call, put }) {
      const response = getResponse(yield call(getStartSorceList, payload));
      // debugger
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            startSorceList: response,
          },
        });
      }
      return response;
    },

    // -评分表确认技术澄清-查询里程碑信息
    *getMilestoneId({ payload }, { call, put }) {
      const response = getResponse(yield call(getMilestoneId, payload));
      return response;
    },

    // 保存
    *saveStartSorceList({ payload }, { call }) {
      const response = getResponse(yield call(saveStartSorceList, payload));
      return response;
    },

    // 邀请供应商设置时，是否存在黑名单中
    *checkSupplierBlackFlag({ payload }, { call }) {
      const response = cusGetResponse(yield call(checkSupplierBlackFlag, payload));
      return response;
    },

    
    // 决策信息提交
    *submitDecisionInfo({ payload }, { call }) {
      const response = getResponse(yield call(submitDecisionInfo, payload));
      return response;
    },

    // 线下公告查询
    *getOffLineNotices({ payload }, { call }) {
      const response = getResponse(yield call(getOffLineNotices, payload));
      return response;
    },

    // 线下公告保存
    *saveOffLineNotices({ payload }, { call }) {
      const response = getResponse(yield call(saveOffLineNotices, payload));
      return response;
    },

    // 线下公告保存后查询
    *handleOffLineNotices({ payload }, { call }) {
      const response = getResponse(yield call(handleOffLineNotices, payload));
      return response;
    },

    // 里程碑-给供应商发送邀请函
    *sendSupplierEmailInvited({ payload }, { call }) {
      const response = cusGetResponse(yield call(sendSupplierEmailInvited, payload));
      return response;
    },

    // 查询灰度测试开关已开启，并且当前登陆人在灰度测试采购名单中
    *getCheckSwitch({ payload }, { call }) {
      const response = yield call(getCheckSwitch, payload);
      return response;
    },

    // 技术评分表风险明细
    *getCheckScoreMessage({ payload }, { call }) {
      const response = getResponse(yield call(getCheckScoreMessage, payload));
      return response;
    },

    // 评委组设置发送待办通知
    *setJudgesSendDeal({ payload }, { call }) {
      const response = cusGetResponse(yield call(setJudgesSendDeal, payload));
      return response;
    },

    // 评委组设置-新增发送待办通知功能后的保存接口
    *setJudgesSave({ payload }, { call }) {
      const response = getResponse(yield call(setJudgesSave, payload));
      return response;
    },

    // 技术、商务澄清第一阶段的编辑时间校验
    *checkClarificationTime({ payload }, { call }) {
      const response = cusGetResponse(yield call(checkClarificationTime, payload));
      return response;
    },

    // -删除报价表数据
    *priceListDeleteAll({ payload }, { call }) {
      const response = getResponse(yield call(priceListDeleteAll, payload));
      return response;
    },

    // 判断发送按钮是否显示
    *getCheckSend({ payload }, { call }) {
      const response = getResponse(yield call(getCheckSend, payload));
      return response;
    },

    // 校验确认综合评分汇总
    *getCheckSummary({ payload }, { call }) {
      const response = getResponse(yield call(getCheckSummary, payload));
      return response;
    },

    // 保存条款
    *saveClause({ payload }, { call }) {
      const response = getResponse(yield call(saveClause, payload));
      return response;
    },

    // 查询条款明细
    *getClauseInfo({ payload }, { call }) {
      const response = getResponse(yield call(getClauseInfo, payload));
      return response;
    },

    // 查询条款模板信息
    *handleClauseTemInfo({ payload }, { call }) {
      const response = getResponse(yield call(handleClauseTemInfo, payload));
      return response;
    },

    // 校验是否设置条款信息
    *checkClauseInfo({ payload }, { call }) {
      const response = getResponse(yield call(checkClauseInfo, payload));
      return response;
    },

    // 获取供应商条款情况
    *getSupplierList({ payload }, { call }) {
      const response = getResponse(yield call(getSupplierList, payload));
      return response;
    },

    // 保存建议中选供应商
    *saveOnlyResultUrl({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveOnlyResultUrl, payload));
      return response;
    },

    // 查询是否已提交的中选供应商
    *getIsSelectSup({ payload }, { call }) {
      const response = cusGetResponse(yield call(getIsSelectSup, payload));
      return response;
    },

    // 查询已报价供应商
    *getSupplierBidOpenList({ payload }, { call }) {
      const response = cusGetResponse(yield call(getSupplierBidOpenList, payload));
      return response;
    },

    // 确认开标
    *saveOpenBid({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveOpenBid, payload));
      return response;
    },

    // 确认流标
    *saveFailedBid({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveFailedBid, payload));
      return response;
    },

    // 里程碑检查文件获取9类文件
    *getBidCheckFile({ payload }, { call }) {
      const response = cusGetResponse(yield call(getBidCheckFile, payload));
      return response;
    },

    // 查询对应的uuid
    *queryUuidByFileType({ payload }, { call }) {
      const response = cusGetResponse(yield call(queryUuidByFileType, payload));
      return response;
    },

    // 移动非8类（商务标书和报价文件）附件
    *saveAttachmentType({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveAttachmentType, payload));
      return response;
    },

    // 移动8类附件
    *saveAttachmentTypeOther({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveAttachmentTypeOther, payload));
      return response;
    },

    // 分类上传技术标书查询
    *getTechfileList({ payload }, { call }) {
      const response = cusGetResponse(yield call(getTechfileList, payload));
      return response;
    },

    // 保存分类上传技术标书
    *saveTechfileList({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveTechfileList, payload));
      return response;
    },

    // 校验分类上传技术标书
    *checkUploadTechfile({ payload }, { call }) {
      const response = cusGetResponse(yield call(checkUploadTechfile, payload));
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
    // 由于 可能异步问题 导致 数据不一致, 所以更新放到 reducer 中
    updateTreeDataSource(state, { payload }) {
      const { queryChild, unitId, treeData } = payload;
      return {
        ...state,
        treeDataSource: queryChild
          ? buildNewTreeDataSource(state.treeDataSource, (item) => {
              return {
                ...item,
                // children: treeData,
              };
            })
          : treeData,
        expandKeys: queryChild ? [...state.expandKeys, unitId] : [],
      };
    },
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
  },
};
