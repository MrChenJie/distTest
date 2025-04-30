import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import cusRequest from '_cus_utils/request';

const organizationId = getCurrentOrganizationId();
const CMHK_PR_CENTER = '/cmhk-pr-center';

/**
 * 采购方案-列表
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {

  const query = parseParameters(filterNullValueObject(params));
  console.log('query',query);
  return request(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/synthesisSearch`, {
    method: 'GET',
    query: query,
  });
}

/**
 * 导出
 */
 export async function goDownInfo(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/synthesisExport`, {
      method: 'GET',
      responseType: 'blob',
      query: params,
    });
  }

  // 采购申请详细页数据获取（申请编号）
  export async function getPrDetailData0(params) {
    // params上面信息,申请编号,方案编号都可以
    const {prNum} = params;
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/build/${prNum}`, {
      method: 'GET',
    });
  }

  // 采购申请详细页数据获取（方案编号）
  export async function getPrDetailData(params) {
    // params上面信息,申请编号,方案编号都可以
    const {prPlanNum} = params;
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/${prPlanNum}`, {
      method: 'GET',
    });
  }

  // 分标包页面数据获取
  export async function getSubcontractInfo(params) {
    const {pacNum} = params;
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/info/${pacNum}`, {
      method: 'GET',
    });
  }

  // 技术应答表导入
  export async function tecResIm(params) {
    const {pacNum} = params;
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/tech-reply-import/${pacNum}`, {
      method: 'POST',
      body: params
    });
  }

  // 分标包详细页面保存
  export async function pacSave(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/save/`, {
      method: 'POST',
      body: params
    });
  }

  //采购方案详细页保存
  export async function prPlanSave(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/buildBidProInfo`, {
      method: 'POST',
      body: params
    });
  }

  //采购方案根据采购方案编号获取自标包的信息
  export async function getSmallPac(params) {
    // 采购方案编号
    const { prPlanNum } = params
    return cusRequest(`/bidding/v1/${organizationId}/bid-pro-infos/query-bidding-data-scm?procurementPlanNumber=${prPlanNum}`, {
      method: 'GET',
    });
  }

  //获取评委组设置的数据
  export async function getJudgeInfo(params) {
    // 采购方案编号
    const { proId } = params
    return cusRequest(`/bidding/v1/${organizationId}/bid-pro-judgess/select/${proId}?page=0&proId=${proId}&size=10`, {
      method: 'GET',
    });
  }

  // 获取【是否客观分】【分值类型】
  export async function getBothData(params) {
    const { proId } = params
    return cusRequest(`/bidding/v1/${organizationId}/bid-score-configs?page=0&proId=${proId}&size=10`, {
      method: 'GET',
    });
  }

  // 提交跳转调用接口
  export async function goToPage(params) {
    const { prPlanNum } = params
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/purchase-scheme-approval?prPlanNum=${prPlanNum}`, {
      method: 'GET',
    });
  }

   // 节点判断
   export async function judgementNode(params) {
    return cusRequest(`/cmhk-supplier/v1/${organizationId}/cmhk-supplier/supplier/getActivityInfo`, {
      method: 'GET',
      query: params
    });
  }

  // 查询项目id
  export async function getProjectId(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-apply-detail-heads/getProjectIdByCode`, {
      method: 'GET',
      query: params,
    });
  }

  // 查询附件
  export async function getFileList(params) {
    const {attachmentUUID,bucketName} = params;
    return cusRequest(`/hfle/v1/${organizationId}/files/${attachmentUUID}/file?attachmentUUID=${attachmentUUID}&bucketName=${bucketName}`, {
      method: 'GET',
      // query: params,
    });
  }

  // 邀请供应商
  export async function getSupplierList(params) {
    return cusRequest(`/bidding/v1/${organizationId}/bid-suppliers/listAllSupplier`, {
      method: 'GET',
      query: params,
    });
  }

  // 校验主数据
  export async function getDataCheck(params) {
    return cusRequest(`/bidding/v1/${organizationId}/bid-pro-infos/checkProInfoPerfect/${params.proCode}`, {
      method: 'GET',
      query: params,
    });
  }

  // 查询决策信息数据
  export async function getDecisionInfo(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second-decisions/${params.refHeadId}`, {
      method: 'GET',
    });
  }

  // 保存决策信息数据
  export async function saveDecisionInfo(params) {
    return cusRequest(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second-decisions`, {
      method: 'POST',
      body: params,
    });
  }

  // 查询申请信息
  export async function getApplyInfo(params) {
    return cusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-detail-heads/${params.id}`, {
      method: 'GET',
    });
  }

