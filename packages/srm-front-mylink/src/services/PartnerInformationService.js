import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_MYLINK } from '@/utils/config';
import { query } from 'hzero-front/lib/services/user';

const organizationId = getCurrentOrganizationId();

/**
 * 合作伙伴列表查询
 */
export async function getCooperationList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/partnerList`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 数据导出
 */
export async function getExportDetail(params) {
  const query = filterNullValueObject(params.form);
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/LinkPartSign-export`,
    {
      method: 'GET',
      query,
      responseType: 'blob',
    }
  );
}

/**
 * 邮件模板查询
 */
export async function getTemplateContent(params) {
  const query = filterNullValueObject(params);
  return cusRequest(`/hmsg/v1/${organizationId}/message/templates/template-code`, {
    method: 'GET',
    query,
  });
}

/**
 * 发送邮件
 */
export async function sendEmail(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/sendProdAccount`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查看邮件内容
 */
export async function getEmailContent(params) {
  return cusRequest(`/hmsg/v1/0/messages/${params.messageId}/contents`, {
    method: 'GET',
  });
}

/**
 * 发起审批
 */
export async function handleApproval(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/list/beginApprove`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 评委抽取
 */
export async function getDrawjudgeList() {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/expertSelection`,
    {
      method: 'GET',
    }
  );
}

/**
 * 重新抽取
 */
export async function getRedrawList(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/againSelection/${params.judgeId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 发起审批
 */
export async function submitBeginProcess(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/beginProcess`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// ========= 详情页接口 ========

/**
 * 名称进入-查询基础信息
 */
export async function getQueryBasicName(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/name/${params.partnerId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 单号进入-查询基础信息
 */
export async function getQueryBasicNum(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/revNum/${params.partnerId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 合作伙伴信息详情-保存
 */
export async function saveInfo(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 合作伙伴信息详情-删除附件
 */
export async function deleteTradeLine(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/attachment/${params.partnerId}`,
    {
      method: 'DELETE',
      body: params.deleteData,
    }
  );
}

/**
 * 合作伙伴信息详情-退回商户
 */
export async function returned(params) {
  let formData = new FormData();
  formData.append('businessManRemark', params?.businessManRemark);
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/returnToMerchant/${params.partnerId}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

/**
 * 合作伙伴信息详情-不通过
 */
export async function notPass(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/info/stop/${params.partnerId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取得分详情
 */
export async function getRevTotalNum(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/score/${params.partnerId}`,
    {
      method: 'GET',
    }
  );
}

export async function queryFileTypeList(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

export async function queryPartnerhead(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/link-partner-head-hiss`, {
    method: 'GET',
    query,
  });
}

/**
 * 列表删除
 */
export async function deleteLine(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/link-partner-head-hiss`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 合作伙伴信息详情-保存
 */
export async function saveInfoPartner(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/link-partner-head-hiss`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 合作伙伴信息详情-查询
 */
export async function getQueryBasicPartner(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/link-partner-head-hiss/${params.partnerId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 合作伙伴信息详情-删除附件更新
 */
export async function deletePartner(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/link-partner-file-hiss`, {
    method: 'DELETE',
    body: params.deleteData,
  });
}

/**
 * 店铺行数据删除
 */
export async function deleteStoreLine(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/partner-type-update/deleteStoreInfo/${params.partnerId}`,
    {
      method: 'DELETE',
      body: params.deleteData,
    }
  );
}

/**
 * 信息更新的店铺行数据删除
 */
export async function deleteUpdateStoreLine(params) {
  return cusRequest(
    `${SRM_MYLINK}/v1/${organizationId}/link-partner-head-hiss/deleteStoreInfo/${params.partnerId}`,
    {
      method: 'DELETE',
      body: params.deleteData,
    }
  );
}

/**
 * 撤回
 */
export async function recall(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-information/returnToPortal/${params.partnerId}`, {
    method: 'POST',
  });
}
