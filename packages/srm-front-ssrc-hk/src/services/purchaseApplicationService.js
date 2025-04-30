import cusRequest from '_cus_utils/request';
import request from 'utils/request';
import { filterNullValueObject, getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 请求api前缀
// const prefix = `${SRM_SSRC}/v1/${organizationId}`;
const prefix = `/cmhk-pr-center/v1/${organizationId}`;

//查询物料列表数据
export async function getMaterialsDetail(params) {
  return cusRequest(`${prefix}/pr-apply-materials/matQueryList`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 查询采购申请列表数据
export async function queryPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/queryList`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 新增-保存流程接口
export async function addPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/save`, {
    method: 'POST',
    body: params,
  });
}

// 采购申请-删除
export async function delPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/batchDelete`, {
    method: 'GET',
    query: params,
  });
}

// 点击采购申请编号查看详情
export async function getPurchaseApplicationDetail(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/${params.id}`, {
    method: 'GET',
  });
}

export async function getPurchaseApplicationDetailIndex(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/${params}`, {
    method: 'GET',
    query: params,
  });
}

export async function getPurchaseApplicationRate(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 采购申请-导出
export async function exportPurchaseApplicationDetail(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/export`, {
    method: 'GET',
    query: params,
  });
}

// 采购申请-申请人部门赋值默认值
export async function getUserUnit(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getUserUnit`, {
    method: 'GET',
    query: params,
  });
}

// 提交按钮
export async function approvePurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/approve`, {
    method: 'POST',
    body: params,
  });
}

// 查询需求人部门
export async function getApplier(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getEmp`, {
    method: 'GET',
    query: params,
  });
}

// 查询需求人部门
export async function getApplyDept(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getEmpDept`, {
    method: 'GET',
    query: params,
  });
}

// 查询节点信息/v1/{organizationId}/cmhk-supplier/supplier/getActivityInfo
export async function getNodeInfo(params) {
  return cusRequest(`/cmhk-supplier/v1/${organizationId}/cmhk-supplier/supplier/getActivityInfo`, {
    method: 'GET',
    query: params,
  });
}

// 查询项目id接口
export async function getProjectId(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getProjectIdByCode`, {
    method: 'GET',
    query: params,
  });
}

// 查询采购报表列表数据
export async function queryProcurementReportList(params) {
  return cusRequest(`${prefix}/pr-third-heads/report`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 查询附件
export async function getFileList(params) {
  const { attachmentUUID, bucketName } = params;
  return cusRequest(
    `/hfle/v1/${organizationId}/files/${attachmentUUID}/file?attachmentUUID=${attachmentUUID}&bucketName=${bucketName}`,
    {
      method: 'GET',
      // query: params,
    }
  );
}

// 查询需求人部门
export async function getUserDepat(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getUnit`, {
    method: 'GET',
    query: params,
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

// 检验金额
export async function getPriceValidate(params) {
  return request(`/cmhk-synch-job/procurement/api/checkBudAmount`, {
    method: 'POST',
    body: params,
  });
}

//  查询统计数量
export async function getMountCountList(params) {
  return cusRequest(`${prefix}/pr-fourth-reports/getCountsByCondition?year=${params.year}`, {
    method: 'GET',
  });
}
// 

//  查询部门采购金额
export async function getCompanyAmountList(params) {
  return cusRequest(`${prefix}/pr-fourth-reports/getCountAmountByDep?year=${params.year}`, {
    method: 'GET',
  });
}

//  查询供应商采购金额
export async function getSupplierAmountList(params) {
  return cusRequest(`${prefix}/pr-fourth-reports/getCountAmountBySup?year=${params.year}`, {
    method: 'GET',
  });
}

//  查询采购方式采购金额
export async function getWayAmountList(params) {
  return cusRequest(`${prefix}/pr-fourth-reports/getCountAmountByPurMethod?year=${params.year}`, {
    method: 'GET',
  });
}

//  查询节省金额
export async function getSaveAmountList(params) {
  return cusRequest(`${prefix}/pr-fourth-reports/getSaveAmountByMounth?year=${params.year}`, {
    method: 'GET',
  });
}
