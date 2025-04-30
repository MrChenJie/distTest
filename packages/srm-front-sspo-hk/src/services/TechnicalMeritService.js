/*
 * TechnicalMeritService - 技术评分汇总页面
 * @date: 2022-04-21
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
} from 'utils/utils';
import { SRM_BID } from '@/common/config'
const organizationId = getCurrentOrganizationId();

/**
 * -查询项目基本信息
 */
 export async function getProjectInfo(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/${params.proId}`, {
    method: 'GET',
  });
}
/**
 * -查询里程碑信息
 */
 export async function getMilestoneInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/${params.milestoneId}`, {
    method: 'GET',
  });
}

/**
 * 查询报价汇总表
 * */ 
export async function getPriceTable(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillLookCollectNew/${params.proId}`, {
    method: 'GET',
    query: params,
  });
}
/* 查询报价表
* */ 
export async function getPriceTableList(params) {
  const query = filterNullValueObject(parseParameters(params));
 return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers/selectAllPriceAnswers`, {
   method: 'POST',
   body: query
 });
}

/* 更新
* */ 
export async function uploadList(params) {
  // const query = filterNullValueObject(parseParameters(params));
 return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers/updateSupplierSeletedRound`, {
   method: 'POST',
   body: params
 });
}


/* 查询供应商报价表
* */ 
export async function getPriceList(params) {
  const query = filterNullValueObject(parseParameters(params));
 return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers/selectAllPriceSupplier`, {
   method: 'GET',
   query
 });
}

/**
 * 发起报价
 * */
export async function startPrice(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/launchQuotation`, {
    method: 'POST',
    body: params
  });
}

/**
 * 结束
 * */ 
 export async function finishList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/updateMilestoneStateInConform/${params.milestoneId}`, {
    method: 'GET',
  });
}


/**
 * 保存数据
 * */
 export async function saveList(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers`, {
    method: 'POST',
    body: params
  });
}

/**
 * 保存数据
 * */
 export async function saveListNew(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers/priceSkillColl`, {
    method: 'POST',
    body: params
  });
}
/**
 * 查询技术评分详情表
*/
export async function getScoreDetail(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillQuery?proId=${params.proId}`, {
    method: 'GET',
  });
}
/**
 * 查询评委评分详情表
*/
export async function getScoreDetailJudge(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillQueryNew?proId=${params.proId}`, {
    method: 'GET',
  });
}

/**
 * 点击退回带参查看评委列表
*/
export async function getJudgesList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillLookJudges`, {
    method: 'GET',
    query: params
  });
}

/**
 * 退回
 * */
export async function revertDetail(params) {
  const query = filterNullValueObject(parseParameters(params.newList));
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillSendBack`, {
    method: 'POST',
    body: query
  });
}

/**
 * 符合性审查表汇总表
 * */ 
export async function getComplianceList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/lookExamine/${params.proId}`, {
    method: 'GET',
  });
}

/**
 * 导出评委评审列表
 * */ 
export async function downloadJudgeList(params) {
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillQueryNewExport?proId=${params.proId}`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

/**
 * 导出技术评分汇总
 * */ 
export async function skillQueryNewExport(params) {
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/skillQueryExport?proId=${params.proId}`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

/**
 * 符合性审查表汇总表
 * */ 
export async function handleQuotationDetails(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/view/getBidItemSupQuoteList`, {
    method: 'GET',
    query: params
  });
}