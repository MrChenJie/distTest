/**
 * rfqService - 询价单 service
 * @since 2022-02-14
 * @author xinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import cusRequest from '_cus_utils/request';
import { SRM_SSRC, SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1/${organizationId}`;

/**
 * 通用请求API前缀
 * @type {string}
 */
const commonPrefix = `${SRM_SSRC}/v1/${organizationId}/enquiry-prices-common`;

/**
 * 查询询价列表数据
 * @async
 * @function queryRfqList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
// /v1/{organizationId}/enquiry-prices/selectEnquiryPriceByCondition
export async function queryRfqList(params) {
  return cusRequest(`${prefix}/enquiry-prices/selectEnquiryPriceByCondition`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 询价历史记录汇总界面查询
// /v1/{organizationId}/enquiry-prices/selectEnquiryPriceHisByCondition
export async function queryRfqHistoryList(params) {
  return cusRequest(`${prefix}/enquiry-prices/selectEnquiryPriceHisByCondition`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

/**
 * @description 查询线上报价情况
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
// /v1/{organizationId}/enquiry-details/selectEnquiryDetailDTO
export async function queryRfqResponse(params) {
  return cusRequest(`${prefix}/enquiry-details/selectEnquiryDetailDTO`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

/**
 * 更新价格录入信息-保存
 * @async
 * @function updateRfqInfo
 */
export async function updateRfqInfo(params) {
  return cusRequest(`${prefix}/enquiry-prices`, {
    method: 'POST',
    body: params,
  });
}

/**
 * ICTS更新价格录入信息-保存
 * @async
 * @function updateRfqIctsInfo
 */
export async function updateRfqIctsInfo(params) {
  return cusRequest(`${prefix}/enquiry-prices-icts`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 根据价格录入ID查询价格录入明细信息
 * @param {*} params - enquiryPriceId
 * @param {*} params - enquiryPriceRoundsId
 * /v1/{organizationId}/enquiry-prices/{enquiryPriceId}
 */
export async function queryRfqDetail(params) {
  const { enquiryPriceId, enquiryPriceRoundsId } = params;
  return cusRequest(`${prefix}/enquiry-prices/${enquiryPriceId}`, {
    method: 'GET',
    query: {
      enquiryPriceRoundsId,
    },
  });
}

// 销售需求单号查询
export async function querySoRequiry(payload) {
  const query = parseParameters(payload);
  return cusRequest(`${prefix}/enquiry-prices/so-header`, {
    method: 'GET',
    query,
  });
}

export async function querySoRequirySummary(payload) {
  const query = parseParameters(payload);
  return cusRequest(`${prefix}/enquiry-prices/so-header`, {
    method: 'GET',
    query,
  });
}

// 方案查询
export async function querySoLine(payload) {
  const query = parseParameters(payload);
  return cusRequest(`${prefix}/enquiry-prices/so-line`, {
    method: 'GET',
    query,
  });
}

// 方案行确认
// POST /v1/{organizationId}/enquiry-prices/so-line/confirm
// 参数：
// enquiryPriceId：报价单头id
// enquiryPriceRoundsId: 轮次id
// soLineId:方案行id
// serviceTypeCode：服务类型code
// productType: 产品类型

export async function confirmSoLine(payload) {
  return cusRequest(`${prefix}/enquiry-prices/so-line/confirm`, {
    method: 'POST',
    query: payload,
  });
}

// ICTS方案行确认
// POST /v1/{organizationId}/enquiry-prices-icts/line-confirm
// 参数：
// enquiryPriceId：报价单头id
// enquiryPriceRoundsId: 轮次id
// serviceTypeCode：服务类型code
// productType: 产品类型

export async function ictsConfirmSoLine(payload) {
  return cusRequest(`${prefix}/enquiry-prices-icts/line-confirm`, {
    method: 'POST',
    query: payload,
  });
}

// /v1/{organizationId}/enquiry-prices/so-line/associate
// 是否关联报价单的接口 true:关联了；false:未关联
export async function associate(payload) {
  return cusRequest(`${prefix}/enquiry-prices/so-line/associate`, {
    method: 'GET',
    query: payload,
  });
}

// 订单查询接口
export async function orderTracking(payload) {
  return cusRequest(`${prefix}/${organizationId}/standard-price-entrys/so-header`, {
    method: 'GET',
    query: payload,
  });
}

// 待办转已办接口
export async function finishWorkQueue(payload) {
  return cusRequest(
    `${SRM_SPUC}/v1/${organizationId}/so-headers-pres/finish-work-queue/${payload}`,
    {
      method: 'POST',
    }
  );
}

// 发布询价
// POST /ssrc/v1/{organizationId}/enquiry-prices/publish/{enquiryPriceId}/{enquiryPriceRoundsId}
export async function publish(payload) {
  return cusRequest(`${prefix}/enquiry-prices/publish`, {
    method: 'POST',
    body: payload,
  });
}

export async function publishSummary(payload) {
  return cusRequest(`${prefix}/enquiry-prices/publish`, {
    method: 'POST',
    body: payload,
  });
}

// ICTS发布询价
// POST /v1/{organizationId}/enquiry-prices-icts/publish
export async function ictsPublish(payload) {
  return cusRequest(`${prefix}/enquiry-prices-icts/publish`, {
    method: 'POST',
    body: payload,
  });
}

export async function ictsPublishSummary(payload) {
  return cusRequest(`${prefix}/enquiry-prices-icts/publish`, {
    method: 'POST',
    body: payload,
  });
}

// 停止询价
// POST /ssrc/v1/{organizationId}/enquiry-prices/stop/{enquiryPriceId}/{enquiryPriceRoundsId}
export async function stop(payload) {
  const { enquiryPriceId, enquiryPriceRoundsId } = payload;
  return cusRequest(`${prefix}/enquiry-prices/stop/${enquiryPriceId}/${enquiryPriceRoundsId}`, {
    method: 'POST',
  });
}

// 提交询价/批量创建报价单
// POST /ssrc/v1/{organizationId}/enquiry-prices/submit
export async function submit(payload) {
  const { enquiryPriceList, onlySubmit } = payload;
  return cusRequest(`${prefix}/enquiry-prices/submit`, {
    method: 'POST',
    body: enquiryPriceList,
    query: {
      onlySubmit,
    },
  });
}

export async function submitSummary(payload) {
  const { enquiryPriceList, onlySubmit } = payload;
  return cusRequest(`${prefix}/enquiry-prices/submit`, {
    method: 'POST',
    body: enquiryPriceList,
    query: {
      onlySubmit,
    },
  });
}

// ICTS提交询价/批量创建报价单
// POST /v1/{organizationId}/enquiry-prices-icts/submit
export async function ictsSubmit(payload) {
  const { enquiryPriceList, onlySubmit } = payload;
  return cusRequest(`${prefix}/enquiry-prices-icts/submit`, {
    method: 'POST',
    body: enquiryPriceList,
    query: {
      onlySubmit,
    },
  });
}

export async function ictsSubmitSummary(payload) {
  const { enquiryPriceList, onlySubmit } = payload;
  return cusRequest(`${prefix}/enquiry-prices-icts/submit`, {
    method: 'POST',
    body: enquiryPriceList,
    query: {
      onlySubmit,
    },
  });
}

// 重新询价
// POST /ssrc/v1/{organizationId}/enquiry-prices/re-enquiry/{enquiryPriceId}/{enquiryPriceRoundsId}
export async function reEnquiry(payload) {
  const { enquiryPriceId, enquiryPriceRoundsId, enquiryDetailsLines } = payload;
  return cusRequest(
    `${prefix}/enquiry-prices/re-enquiry/${enquiryPriceId}/${enquiryPriceRoundsId}`,
    {
      method: 'POST',
      body: enquiryDetailsLines,
    }
  );
}

// 询价单提交校验
// POST /v1/{organizationId}/enquiry-prices/submit/validate
export async function submitValidate(payload) {
  return cusRequest(`${prefix}/enquiry-prices/submit/validate`, {
    method: 'POST',
    body: payload,
  });
}

export async function submitValidateSummary(payload) {
  return cusRequest(`${prefix}/enquiry-prices/submit/validate`, {
    method: 'POST',
    body: payload,
  });
}

// ICTS询价单提交校验
// POST /v1/{organizationId}/enquiry-prices-icts/submit/validate
export async function ictsSubmitValidate(payload) {
  return cusRequest(`${prefix}/enquiry-prices-icts/submit/validate`, {
    method: 'POST',
    body: payload,
  });
}

export async function ictsSubmitValidateSummary(payload) {
  return cusRequest(`${prefix}/enquiry-prices-icts/submit/validate`, {
    method: 'POST',
    body: payload,
  });
}

// 批量删除询价单
// POST /v1/{organizationId}/enquiry-prices/deleteEnquiryPriceByList
export async function deleteEnquiryPriceByList(payload) {
  return cusRequest(`${prefix}/enquiry-prices/deleteEnquiryPriceByList`, {
    method: 'POST',
    body: payload,
  });
}

// 选择价格库接口
export async function queryStandardLibrary(params) {
  return cusRequest(
    `${prefix}/standard-price-entrys/standardLibraryLov?page=${params.page}&size=${params.pageSize}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 复制明细行
export async function copyDetailsLine(payload) {
  return cusRequest(`${prefix}/enquiry-details/copy`, {
    method: 'POST',
    body: payload,
  });
}

// ICTS复制明细行
export async function ictsCopyDetailsLine(payload) {
  return cusRequest(`${prefix}/enquiry-details/icts/copy`, {
    method: 'POST',
    body: payload[0],
  });
}

// 删除明细行
export async function deleteEnquiryDetailsLines(payload) {
  return cusRequest(`${prefix}/enquiry-details`, {
    method: 'DELETE',
    body: payload,
  });
}

// 附件查询
export async function queryEnquiryFiles(payload) {
  return cusRequest(`${prefix}/enquiry-files`, {
    method: 'GET',
    query: payload,
  });
}

// 附件删除
export async function deleteEnquiryFiles(payload) {
  return cusRequest(`${prefix}/enquiry-files`, {
    method: 'DELETE',
    body: payload,
  });
}

// 突发流量查询
export async function queryEnquiryDetailQtDbts(payload) {
  return cusRequest(`${prefix}/enquiry-detail-qt-dbts`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 突发流量查询-审计
export async function enquiryQtDbtAudits(payload) {
  return cusRequest(`${prefix}/enquiry-qt-dbt-audits`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 突发流量保存
export async function saveEnquiryDetailQtDbts(payload) {
  return cusRequest(`${prefix}/enquiry-detail-qt-dbts`, {
    method: 'POST',
    body: payload,
  });
}

// 突发流量删除
export async function deleteEnquiryDetailQtDbts(payload) {
  return cusRequest(`${prefix}/enquiry-detail-qt-dbts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 会话查询
export async function queryEnquiryConversations(payload) {
  return cusRequest(`${prefix}/enquiry-conversations`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 会话发送
export async function sendEnquiryConversations(payload) {
  return cusRequest(`${prefix}/enquiry-conversations`, {
    method: 'POST',
    body: payload,
  });
}

// ICTS 会话发送
export async function sendEnquiryConversationsIcts(payload) {
  return cusRequest(`${prefix}/enquiry-conversations/icts`, {
    method: 'POST',
    body: payload,
  });
}

// 询价历史记录汇总界面查询
export async function enquiryAuditRecord(payload) {
  return cusRequest(`${prefix}/enquiry-detail-audits/query/enquiry-audit-record`, {
    method: 'GET',
    query: filterNullValueObject(payload),
  });
}

// 模板导出
export async function enquiryPriceExport(payload) {
  return cusRequest(`${prefix}/enquiry-price-import/export`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}

// 导入结果查询
export async function validateFailed(payload) {
  return cusRequest(`${prefix}/enquiry-price-import/validate-failed/${payload.batchId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// icts模板导出
export async function ictsEnquiryPriceExport(payload) {
  return cusRequest(`${prefix}/enquiry-price-icts-import/export`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}

// icts导入结果查询
export async function ictsValidateFailed(payload) {
  return cusRequest(`${prefix}/enquiry-price-icts-import/validate-failed/${payload.batchId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// CHINA_DIA模板导出
export async function chinaDiaEnquiryPriceExport(payload) {
  return cusRequest(`${prefix}/enquiry-price-china-dia-import/export`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}

// CHINA_DIA导入结果查询
export async function chinaDiaValidateFailed(payload) {
  return cusRequest(`${prefix}/enquiry-price-china-dia-import/validate-failed/${payload.batchId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 费用明细查询
export async function queryEnquiryDetailDtls(payload) {
  return cusRequest(`${prefix}/enquiry-detail-dtls/selectByDetailId/${payload.enquiryDetailId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 询价单行费用明细历史记录列表
export async function queryEnquiryDetailDtlsAudits(payload) {
  return cusRequest(`${prefix}/enquiry-dtl-audits`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}

// 费用明细保存
export async function saveEnquiryDetailDtls(payload) {
  return cusRequest(`${prefix}/enquiry-detail-dtls/saveData`, {
    method: 'POST',
    body: payload,
  });
}

// 费用明细删除
export async function deleteEnquiryDetailDtls(payload) {
  return cusRequest(`${prefix}/enquiry-detail-dtls/delete`, {
    method: 'PUT',
    body: payload,
  });
}

/**
 * 根据价格录入ID查询价格录入明细信息 CHINA_DIA
 * @param {*} params - enquiryPriceId
 * @param {*} params - enquiryPriceRoundsId
 * /v1/{organizationId}/enquiry-prices-common/queryEnquiryPriceDetail/{enquiryPriceId}
 */
export async function queryEnquiryPriceDetail(params) {
  const { enquiryPriceId, enquiryPriceRoundsId, typeCode } = params;
  return cusRequest(`${commonPrefix}/queryEnquiryPriceDetail/${enquiryPriceId}`, {
    method: 'GET',
    query: {
      typeCode,
      enquiryPriceRoundsId,
    },
  });
}

/**
 * 更新价格录入信息-保存 CHINA_DIA
 * @async
 * @function saveEnquiryPrice
 * @description POST /v1/{organizationId}/enquiry-prices-common/saveEnquiryPrice
 */
export async function saveEnquiryPrice(params) {
  return cusRequest(`${commonPrefix}/saveEnquiryPrice`, {
    method: 'POST',
    body: params,
  });
}

// CHINA_DIA 提交询价/批量创建报价单
// POST /v1/{organizationId}/enquiry-prices-common/submitEnquiryPrice
export async function submitEnquiryPrice(payload) {
  return cusRequest(`${commonPrefix}/submitEnquiryPrice`, {
    method: 'POST',
    body: payload,
  });
}

export async function submitEnquiryPriceSummary(payload) {
  return cusRequest(`${commonPrefix}/submitEnquiryPrice`, {
    method: 'POST',
    body: payload,
  });
}

// 重新询价 CHINA_DIA
// POST /v1/{organizationId}/enquiry-prices-common/reEnquiryPrice/{enquiryPriceId}/{enquiryPriceRoundsId}
export async function reEnquiryPrice(payload) {
  const { enquiryPriceId, enquiryPriceRoundsId, enquiryPriceCommonDTO } = payload;
  return cusRequest(`${commonPrefix}/reEnquiryPrice/${enquiryPriceId}/${enquiryPriceRoundsId}`, {
    method: 'POST',
    body: enquiryPriceCommonDTO,
  });
}

// 询价单提交校验 CHINA_DIA
// POST /v1/{organizationId}/enquiry-prices-common/submitValidate
export async function submitValidateCommon(payload) {
  return cusRequest(`${commonPrefix}/submitValidate`, {
    method: 'POST',
    body: payload,
  });
}

export async function submitValidateCommonSummary(payload) {
  return cusRequest(`${commonPrefix}/submitValidate`, {
    method: 'POST',
    body: payload,
  });
}

// CHINA_DIA 发布询价
// POST /v1/{organizationId}/enquiry-prices-common/publishEnquiryPrice
export async function publishEnquiryPrice(payload) {
  return cusRequest(`${commonPrefix}/publishEnquiryPrice`, {
    method: 'POST',
    body: payload,
  });
}

export async function publishEnquiryPriceSummary(payload) {
  return cusRequest(`${commonPrefix}/publishEnquiryPrice`, {
    method: 'POST',
    body: payload,
  });
}

// 停止询价 CHINA_DIA
// POST /v1/{organizationId}/enquiry-prices-common/stopEnquiryPrice/{enquiryPriceId}/{enquiryPriceRoundsId}
export async function stopEnquiryPrice(payload) {
  const { enquiryPriceId, enquiryPriceRoundsId, enquiryPriceCommonDTO } = payload;
  return cusRequest(`${commonPrefix}/stopEnquiryPrice/${enquiryPriceId}/${enquiryPriceRoundsId}`, {
    method: 'POST',
    body: enquiryPriceCommonDTO,
  });
}

// 询价单导出
// GET /v1/{organizationId}/enquiry-prices/enquiry-export
export async function enquiryExport(payload) {
  return cusRequest(`${prefix}/enquiry-prices/enquiry-export`, {
    method: 'GET',
    query: payload,
    responseType: 'blob',
  });
}

// 询价单指派
// POST /v1/{organizationId}/enquiry-prices/assign
export async function enquiryAssign(payload) {
  const { territorialSupportBy, enquiryPriceRounds } = payload;
  return cusRequest(`${prefix}/enquiry-prices/assign`, {
    method: 'POST',
    query: {
      territorialSupportBy,
    },
    body: {
      ...enquiryPriceRounds,
    },
  });
}

// 询价单反馈
// POST /v1/{organizationId}/enquiry-prices/feedback
export async function enquiryFeedback(payload) {
  return cusRequest(`${prefix}/enquiry-prices/feedback`, {
    method: 'POST',
    body: payload,
  });
}

// 询价单指派审计查询
// GET /v1/{organizationId}/enquiry-assign-audits/queryList
export async function enquiryAssignAudits(payload) {
  return cusRequest(`${prefix}/enquiry-assign-audits/queryList`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(payload)),
  });
}
