import cusRequest from '_cus_utils/request';
import request from 'utils/request';
import { SRM_SSRC, SRM_SPUC } from '_utils/config';
import { queryFileListOrg } from 'hzero-front/lib/services/api';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `/cmhk-pr-center/v1/${organizationId}`;

// 简易询价详情-------------------------
// 判断简易询价单据是否已存在
export async function isRepeat(params) {
  return cusRequest(`${prefix}/pr-third-heads/prThirdHead/${params.id}`, {
    method: 'GET',
  });
}
// 查询简易询价详情
export async function queryDetail(params) {
  return cusRequest(`${prefix}/pr-third-heads/query/${params.rqNumber}`, {
    method: 'GET',
  });
}
// 查询简易询价详情——采购申请进入 √
export async function applyQueryDetail(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/${params.id}`, {
    method: 'GET',
  });
}
// 查询项目id
export async function queryProjectId(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getProjectIdByCode`, {
    method: 'GET',
    query: params,
  });
}

// 保存简易询价 √
export async function saveDetail(params) {
  return cusRequest(`${prefix}/pr-third-heads/save`, {
    method: 'POST',
    body: params,
  });
}
// 简易询价 附件查询
export async function getUuid(params) {
  return cusRequest(`${prefix}/pr-third-sup-attachments/getUuid/${params.refHeadId}`, {
    method: 'GET',
  });
}
// 简易询价 附件保存
export async function saveAttachment(params) {
  return cusRequest(`${prefix}/pr-third-sup-attachments/saveAttachment`, {
    method: 'POST',
    body: params,
  });
}

// 邀请供应商查询 ——暂时先不要；
export async function checkSupplier(params) {
  return cusRequest(`${prefix}`, {
    method: 'POST',
    body: params,
  });
}

// 汇率查询 √
export async function getRate(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 阶段查询
export async function stageQuery(params) {
  return cusRequest(`${prefix}/pr-third-stages/stageList/${params.refHeadId}`, {
    method: 'GET',
  });
}

// 阶段预览
export async function stagePreview(params) {
  return cusRequest(`${prefix}/pr-third-sups/preview/${params.refHeadId}`, {
    method: 'GET',
  });
}

// 阶段——询价邀请 ——供应商预览
export async function supplierPreview(params) {
  return cusRequest(
    `${prefix}/pr-third-invites/previewTemplate/${params.proId}/${params.supplierId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 阶段——询价邀请 —— 发送(包括全部发送)
export async function supplierSend(params) {
  return cusRequest(`${prefix}/pr-third-invites/sendSupplierEmail`, {
    method: 'POST',
    body: params,
  });
}

// 编辑时间——轮次查询
export async function searchRound(params) {
  return cusRequest(`${prefix}/pr-third-roundss/editTime/${params.stageId}/${params.rounds}`, {
    method: 'GET',
  });
}
// 编辑时间保存
export async function editTimeSave(params) {
  return cusRequest(`${prefix}/pr-third-roundss/editTime`, {
    method: 'POST',
    body: params,
  });
}
// 添加下一轮保存
export async function addNextRoundSave(params) {
  return cusRequest(`${prefix}/pr-third-roundss/addNextRound`, {
    method: 'POST',
    body: params,
  });
}

// 价格汇总详情-------------------------

// 查询价格汇总基本信息
export async function getPriceCollect(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPrThirdPriceTolList?refHeadId=${params.id}`, {
    method: 'GET',
  });
}
// 查询价格汇总基本信息
export async function getPriceTolList(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPriceTolList?refHeadId=${params.refHeadId}`, {
    method: 'GET',
  });
}
// 选择报价——> 查询历史评审价格
export async function getReviewPrice(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPrThirdPrice2`, {
    method: 'GET',
    query: params,
  });
}
// 选择报价确认——> 查询价格汇总数据
export async function getPriceSummaryList(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPriceTol`, {
    method: 'POST',
    body: params,
  });
}
// 价格汇总保存
export async function priceSummarySave(params) {
  return cusRequest(`${prefix}/pr-third-heads/savePriceTol`, {
    method: 'POST',
    body: params,
  });
}

// 报价文件详情-------------------------

// 查询报价文件详情数据
export async function getQuotationDetail(params) {
  return cusRequest(`${prefix}/pr-third-heads/selectPrThirdHeadQuoteList`, {
    method: 'GET',
    query: params,
  });
}
// 查询报价文件详情数据——报价表
export async function getQuotationListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${prefix}/pr-third-heads/getPrThirdQuotationList`, {
    method: 'GET',
    query,
  });
}
// 查询报价文件详情数据——报价条款
export async function getQuotationClauseDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${prefix}/pr-third-heads/getQuoteTerms`, {
    method: 'GET',
    query,
  });
}
// 查询比价数据
export async function getPriceDetail(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPriceComparison`, {
    method: 'GET',
    query: params,
  });
}

// 需求人确认执行------------------------

// 需求人确认执行数据查询——新建进入
export async function demanderCreateQuery(params) {
  return cusRequest(`${prefix}/pr-third-heads/executRequeste/${params.refHeadId}`, {
    method: 'GET',
  });
}
// 需求人确认执行数据查询——编辑进入
export async function demanderEditQuery(params) {
  return cusRequest(
    `${prefix}/pr-third-inquirys/prThirdConfirmationSearch/${params.prThirdHeadId}`,
    {
      method: 'GET',
    }
  );
}
// 需求人确认执行数据保存
export async function demanderSave(params) {
  return cusRequest(`${prefix}/pr-third-inquirys/prThirdConfirmationSave`, {
    method: 'POST',
    body: params,
  });
}
// 简易询价财务审批
export async function handlePurchaseLineInfo(params) {
  const param = parseParameters(params.page);
  return cusRequest(`${prefix}/pr-third-inquirys/getPurchaseLineInfo/${params.prThirdHeadId}`, {
    method: 'GET',
    query: param,
  });
}
// 模拟致远走财务审批
export async function simulateApprove(params) {
  return cusRequest(`${prefix}/pr-third-heads/approve/${params.refHeadId}`, {
    method: 'GET',
  });
}

// 检验金额
export async function getPriceValidate(params) {
  return request(`/cmhk-synch-job/procurement/api/checkBudAmount`, {
    method: 'POST',
    body: params,
  });
}

// 查询总的项目名称
export async function getProjectName(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/cmhk-synch-job/procurement/api/getProjectInfoFromPccw`, {
    method: 'GET',
    query,
  });
}

// 项目变更管理
export async function projectEditName(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${prefix}/pr-project-changes/changeProject`, {
    method: 'POST',
    body: query,
  });
}

// 查询报价表数据
export async function getPriceList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${prefix}/pr-third-heads/quoteListBySup`, {
    method: 'GET',
    query,
  });
}
// 报价详情查询
export async function getInquireDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(
    `${prefix}/cmhk-pr-fourth-heads/getSupplierQuoteDetailByPpId?prThirdId=${query.prThirdId}`,
    {
      method: 'GET',
      query: query,
    }
  );
}

// 获取里程碑单行状态
export async function getMilestoneState(params) {
  return cusRequest(`${prefix}/pr-third-heads/stage/${params.stageId}`, {
    method: 'GET',
  });
}

// 保存新增的物料
export async function saveEditMat(params) {
  return cusRequest(`${prefix}/pr-third-settings`, {
    method: 'POST',
    body: params
  });
}

// 查询价格汇总 物料信息
export async function getMatList(params) {
  return cusRequest(`${prefix}/pr-third-heads/getSetting`, {
    method: 'GET',
    query: params,
  });
}

// 价格汇总 —— 物料保存
export async function priceSummaryMatsave(params) {
  return cusRequest(`${prefix}/pr-third-heads/saveMatList`, {
    method: 'POST',
    body: params,
  });
}
// 保存建议中选供应商
export async function saveSelectSupplier(params) {
  return cusRequest(`${prefix}/pr-third-heads/saveSelectSup`, {
    method: 'POST',
    body: params
  });
}

// 里程碑使用的查询推荐供应商弹窗
export async function getSelectSuppplier(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPrThirdPrice2`, {
    method: 'GET',
    query: params
  });
}

// 校验价格汇总表是否已申请
export async function getCheckSend(params) {
  return cusRequest(`${prefix}/pr-third-heads/getSelectSup`, {
    method: 'GET',
    query: params
  });
}

// 查询框架协议价格汇总表
export async function getPriceSumlList(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPriceTolList2`, {
    method: 'GET',
    query: params
  });
}

// 录入报价按钮查询供应商
export async function getEnterQuotationList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${prefix}/pr-third-invites/selectListByRound`, {
    method: 'GET',
    query,
  });
}