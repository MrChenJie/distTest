import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

function prefixUrl(head, suffixUrl) {
  return `${head}/v1/${suffixUrl}`;
}

/**
 * 查询公告列表数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchNotice(params) {
  const { organizationId, ...other } = params;
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'GET',
    query: other,
  });
}

/**
 * 创建公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 */
export async function createNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function updateNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function deleteNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询公告明细数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function queryNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, `public-notices/${params.noticeId}`), {
    method: 'GET',
  });
}

/**
 * 发布公告
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function publicNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, `notices/${params.noticeId}/publish`), {
    method: 'POST',
    body: params,
  });
}

/**
 * 撤销删除公告
 * @param {Object} params - 查询参数
 * @param {String} [params.organizationId] - 租户ID
 * @param {String} [params.noticeId] - 公告ID
 */
export async function revokeNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, `notices/${params.noticeId}/revoke`), {
    method: 'POST',
    body: params.record,
  });
}

/**
 * 操作记录
 * @param {Object} params - 查询参数
 * @param {String} [params.organizationId] - 租户ID
 * @param {String} [params.noticeId] - 公告ID
 */
export async function noticeHistory(params) {
  return request(prefixUrl(SRM_PLATFORM, `portal-notice-actions/${params.noticeId}`), {
    method: 'GET',
  });
}
