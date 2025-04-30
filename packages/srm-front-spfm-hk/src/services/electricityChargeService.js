/**
 * @Description: IDC电费用量 - service
 * @date 2022-12-06
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import request from '_cus_utils/request';
import { HZERO_MSG } from 'utils/config';
import { SRM_SQAM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prompt = `${SRM_SQAM}/v1/${organizationId}`;

/**
 * iDC电费汇总-成本
 * @param payload
 */
export async function fetchCostRequest(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/idc-charge-summary/selectCostRequest`, {
    method: 'GET',
    query,
  });
}

/**
 * IDC电费汇总-价格
 * @param payload
 */
export async function fetchPriceRequest(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/idc-charge-summary/selectPriceRequest`, {
    method: 'GET',
    query,
  });
}

/**
 * IDC电费汇总-iBOSS出账数据查询
 * @param payload
 */
export async function fetchIbossData(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/idc-charge-payouts/selectPayout`, {
    method: 'GET',
    query,
  });
}

export async function fetchIbossDataSummary(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/idc-charge-payouts/selectPayout`, {
    method: 'GET',
    query,
  });
}

/**
 * IDC电费汇总-提交
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-detail/batchSubmit
 */
export async function batchSubmit(payload) {
  return request(`${prompt}/idc-charge-detail/batchSubmit`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * IDC电费汇总-价格模版导出
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-export/template-export
 */
export async function templateExport(payload) {
  return request(`${prompt}/idc-charge-export/template-export`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}

/**
 * IDC电费汇总-导出报表
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-export/export/{exportType}
 */
export async function exportForm(payload) {
  const { exportType, chargeIds } = payload;
  return request(`${prompt}/idc-charge-export/export/${exportType}`, {
    method: 'POST',
    body: chargeIds,
    responseType: 'blob',
  });
}

/**
 * IDC电费汇总-下载PDF
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-summary/exportPdf
 */
 export async function exportPdf(payload) {
  const { exportType, chargeIds } = payload;
  return request(`${prompt}/idc-charge-summary/exportPdf`, {
    method: 'POST',
    query: {
      exportType,
    },
    body: chargeIds,
    responseType: 'blob',
  });
}

/**
 * IDC电费汇总-删除
 * @param payload
 * @description DELETE /v1/{organizationId}/idc-charge-summary/delete
 */
export async function idcDelete(payload) {
  return request(`${prompt}/idc-charge-summary/delete`, {
    method: 'DELETE',
    body: payload,
  });
}

/**
 * IDC电费汇总-同步iboss
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-detail/syncToIboss
 */
export async function syncToIboss(payload) {
  return request(`${prompt}/idc-charge-detail/syncToIboss`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * IDC电费汇总-附件查询
 * @param payload
 * @description GET /v1/{organizationId}/idc-charge-files/selectFile/{chargeId}
 */
export async function selectFile(payload) {
  const { chargeId } = payload;
  return request(`${prompt}/idc-charge-files/selectFile/${chargeId}`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * IDC电费汇总-批量导入模板下载
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-export/download-template
 */
export async function downloadTemplate(payload) {
  return request(`${prompt}/idc-charge-export/download-template`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}

/**
 * IDC电费汇总-导入结果查询
 * @param payload
 * @description GET /v1/{organizationId}/idc-charge-export/import-result/{batchId}
 */
export async function queryImportResult(payload) {
  const { batchId } = payload;
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/idc-charge-export/import-result/${batchId}`, {
    method: 'GET',
    query,
  });
}

/**
 * IDC电费详情-查询
 * @param payload
 * @description GET /v1/{organizationId}/idc-charge-detail/queryDetail/{chargeId}
 */
export async function queryDetail(payload) {
  const { chargeId } = payload;
  return request(`${prompt}/idc-charge-detail/queryDetail/${chargeId}`, {
    method: 'GET',
  });
}

/**
 * IDC电费详情-保存
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-detail/save
 */
export async function save(payload) {
  return request(`${prompt}/idc-charge-detail/save`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * IDC电费详情-提交
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-detail/submit/{chargeId}
 */
export async function submit(payload) {
  const { chargeId } = payload;
  return request(`${prompt}/idc-charge-detail/submit/${chargeId}`, {
    method: 'POST',
  });
}

/**
 * IDC电费详情-退回
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-detail/returnBack/{chargeId}
 */
export async function returnBack(payload) {
  const { chargeId, query } = payload;
  return request(`${prompt}/idc-charge-detail/returnBack/${chargeId}`, {
    method: 'POST',
    query,
  });
}

/**
 * IDC电费详情-附件删除
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-files/delete
 */
export async function filesDelete(payload) {
  return request(`${prompt}/idc-charge-files/delete`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * IDC电费- 获取配置维护
 * @description GET /v1/{organizationId}/idc-charge-summary/profile-value
 */
export async function profileValue() {
  return request(`${prompt}/idc-charge-summary/profile-value`, {
    method: 'GET',
    query: {
      profileCode: 'SPUC.IDC_ELECTRICITY_CONTROL',
    },
    responseType: 'text',
  });
}

export async function profileValueSummary() {
  return request(`${prompt}/idc-charge-summary/profile-value`, {
    method: 'GET',
    query: {
      profileCode: 'SPUC.IDC_ELECTRICITY_CONTROL',
    },
    responseType: 'text',
  });
}

/**
 * IDC电费详情-getEmailTemplateInfo(获取邮件模板)
 * @param payload
 * @description GET /v1/{organizationId}/idc-charge-summary/email-template-info
 */
export async function getEmailTemplate() {
  return request(`${prompt}/idc-charge-summary/email-template-info`, {
    method: 'GET',
    query: {
      templateCode: 'SQAM.IDC_CHARGE_MANUAL_EMAIL',
    },
  });
}

/**
 * IDC电费详情-sendEmail(发送邮件)
 * @param payload
 * @description POST /v1/{organizationId}/idc-charge-summary/send-email
 */
export async function sendEmail(payload) {
  return request(`${prompt}/idc-charge-summary/send-email`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * iDC电费汇总-emailRecord(获取邮件详情)
 * @param payload
 * @description GET /v1/{organizationId}/idc-charge-detail/email-record/{chargeId}
 */
export async function getEmailRecord(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  const { chargeId } = query;
  return request(`${prompt}/idc-charge-detail/email-record/${chargeId}`, {
    method: 'GET',
    query,
  });
}

// 查询邮件详情
export async function queryEmailDetail(params) {
  const { messageId, tenantId } = params;
  return request(`${HZERO_MSG}/v1/${tenantId}/messages/${messageId}/contents`, {
    method: 'GET',
  });
}

export async function customFileSummary(params) {
  const { uuidList } = params;
  return request(`/hfle/v1/${organizationId}/custom-file/summary`, {
    method: 'GET',
    query: {
      uuidList,
    },
  });
}
