/*
 * prsaInfomationService - 采购复核供应商准入信息（门户）Service
 * @date: 2023-09-20
 * @author: FHS <huasheng.fang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import {
    getCurrentOrganizationId,
    filterNullValueObject,
    parseParameters,
    isTenantRoleLevel,
} from 'utils/utils';
import request from '_cus_utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();
const prompt = `${SRM_PLATFORM}/v1/${organizationId}`;


/**
 * 查询值集
 */
export async function queryNoticeType(params) {
    return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
        method: 'GET',
        query: params,
    });
}


/**
 * 查询供应商准入信息
 * @export
 */
export async function queryInfo(params) {
    return request(
        `${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/list/${params.userId}/${params.language}`,
        {
            method: 'GET',
        }
    );
}
/**
 * 查询采购审核供应商信息更新单
 * @export
 */
export async function queryBasicInfo(params) {
    return request(
        `${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/list/alteration`, {
        method: 'GET',
        query: params,
    });
}
/**
 * 查询财务审核财务信息变更单
 * @export
 */
export async function queryBankInfo(params) {
    return request(
        `${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/list/alterationBank`, {
        method: 'GET',
        query: params,
    });
}


/**
 * 采购复核供应商准入信息(门户) 保存
 * @export
 */
export async function saveInfo(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads`, {
        method: 'POST',
        body: params,
    });
}
/**
 * 采购复核供应商准入信息(门户) 经理提交——>已审批 
 * @export
 */
export async function accessSaveInfo(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/supplier/basic/update`, {
        method: 'POST',
        body: params,
    });
}
export async function accessSaveBasic(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/supplier/basic/updateBank`, {
        method: 'POST',
        body: params,
    });
}


/**
 * 采购复核供应商准入信息(基本信息) 提交
 * @export
 */
export async function submitInfo(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/list/updateAlteration`, {
        method: 'POST',
        body: params,
    });
}

/**
 * 采购复核供应商准入信息(财务信息) 提交
 * @export
 */
export async function submitBankInfo(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/list/updateAlterationBank`, {
        method: 'POST',
        body: params,
    });
}

/**
 * 采购复核供应商准入信息(门户) 退回需要参数
 * @export
 */
export async function backInfoQuery(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/supplierRegistrar`, {
        method: 'GET',
        query: params,
    });
}
/**
 * 采购复核供应商准入信息(门户) 退回
 * @export
 */
export async function backInfo(params) {
    return request(`/srm-portal/v1/${organizationId}/work-queues`, {
        method: 'POST',
        body: params,
    });
}
/**
 * 采购复核供应商准入信息(门户) 退回发送邮件
 * @export
 */
export async function backSendEmail(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/supplier/search/accessReturn`, {
        method: 'POST',
        body: params,
    });
}
/**
 * 待办变成已办
 * @export
 */
export async function finishedDone(params) {
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/finishedDone`, {
        method: 'GET',
        query: params,
    });
}



// -----------------------------------------------------------------------

// 供应商门户账户记录创建或更新
// /v1/{organizationId}/company-account-recs
export async function save(params) {
    return request(`${prompt}/company-account-recs`, {
        method: 'POST',
        body: params,
    });
}

//供应商账号生成
export async function generateAccount(params) {
    return request(`${prompt}/company-account-recs/batch-generator-account`, {
        method: 'POST',
        body: params,
    });
}

// 门户账号报表导出
export async function supplierExport() {
    return request(`/hrpt/v1/${organizationId}/supplier-portal-export/supplier-portal-acc-export`, {
        method: 'POST',
        responseType: 'blob',
    });
}

// 供应商门户账户记录列表
// get /v1/{organizationId}/company-account-recs
export async function fetchList(payload) {
    const queryParam = filterNullValueObject(payload.queryParam);
    const pageParam = filterNullValueObject(parseParameters(payload.pageParam));
    return request(`${prompt}/company-account-recs`, {
        method: 'GET',
        query: { ...pageParam, ...queryParam },
    });
}

// 批量删除
// DELETE /v1/{organizationId}/company-account-recs
export async function deleteLines(params) {
    return request(`${prompt}/company-account-recs`, {
        method: 'DELETE',
        body: params,
    });
}

/**
 * 查询角色可分配权限的菜单子树
 * @async
 * @function fetchPermissionTree
 * @param roleId
 * @param tenantId
 * @returns {object} fetch Promise
 */
export async function fetchPermissionTree(roleId, tenantId) {
    return request(
        organizationRoleLevel
            ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-set-tree`
            : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-set-tree`
    );
}

/**
 * 批量分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @returns {object} fetch Promise
 * @param payload
 */
export async function batchAssignPermissionSets(payload) {
    const { roleId, tenantId, data } = payload;

    return request(
        organizationRoleLevel
            ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-sets/assign`
            : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/assign`,
        {
            method: 'PUT',
            body: data,
        }
    );
}

/**
 * 新增/更新公司财务信息
 * @async
 * @function addAttachment
 * @param {object} params.data - 待保存数据
 * @param {!string} params.data.attachmentType - 附件类型
 * @param {!string} params.data.subAttachment - 附件子类型
 * @param {?string} params.data.attachmentUuid - 唯一id
 * @param {?string} params.data.description - 附件描述
 * @param {!string} params.data.companyId - 公司id
 * @param {?date} params.data.endDate - 文件到期日
 * @param {!date} params.data.uploadDate - 最后更新时间
 * @returns {object} fetch Promise
 */
export async function addAttachment(params) {
    return request(`${SRM_PLATFORM}/v1/com-attachment-reqs`, {
        method: 'POST',
        body: params,
    });
}

/**
 * 批量取消分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @returns {object} fetch Promise
 * @param payload
 */
export async function batchUnAssignPermissionSets(payload) {
    const { roleId, tenantId, data } = payload;
    return request(
        organizationRoleLevel
            ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-sets/recycle`
            : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/recycle`,
        {
            method: 'PUT',
            body: data,
        }
    );
}

/**
 * 查询用户信息
 * @param payload
 * @returns {Promise<void>}
 */
export async function fetchUserData(payload) {
    const { userId, tenantId } = payload;
    return request(
        `${HZERO_IAM}/hzero/v1/portal/${tenantId}/users/${userId}/selectPortalUserDetail`,
        {
            method: 'GET',
        }
    );
}

/**
 * 更新用户信息
 * @param params
 */
export async function updateUserData(params) {
    return request(`${HZERO_IAM}/hzero/v1/portal/${organizationId}/updatePortalUser`, {
        method: 'PUT',
        body: params,
    });
}



/**
 * 联系信息新增
 * @param params
 */
export async function contactAdd(params) {
    return request(`${prompt}/contactAdd`, {
        method: 'POST',
        body: params,
    });
}

/**
 * 验证供应商（公司）中英文名称.
 * @param payload
 * @returns {Promise<void>}
 */
export async function checkSupplierName(param) {
    return request(
        `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/supplierName`,
        {
            method: 'GET',
            query: param,
        }
    );
}
/**
 * 验证供应商商业登记证号码.
 * @param param
 * @returns {Promise<void>}
 */
export async function checkRegistrationNumber(param) {
    return request(
        `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/registrationNumber`,
        {
            method: 'GET',
            query: param,
        }
    );
}

export async function returnPortal(params) {
    let formData = new FormData()
    formData.append('returnRemark', params?.returnRemark);
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/info/returnPortal/${params.id}`, {
        method: 'POST',
        body: formData
    });
}

export async function returnPortalChange(params) {
    let formData = new FormData()
    formData.append('returnRemark', params?.returnRemark);
    formData.append('returnType', params?.returnType);
    formData.append('workQueueInstId', params?.workQueueInstId);
    return request(`${CMHK_SUPPLIER}/v1/${organizationId}/sup-access-try-heads/info-change/returnPortal/${params.id}`, {
        method: 'POST',
        body: formData
    });
}

/**
 * 查询银行地址信息
*/
export async function getAddressBankInfoList(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询银行明细信息
*/
export async function getBankInfoList(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line/${params.bankHeadId}`, {
    method: 'GET',
  })
}

/**
 * 删除银行地址信息
*/
export async function deleteAddressBankInfoLine(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 删除银行明细信息
*/
export async function deleteBankInfoLine(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 保存银行关联关系
*/
export async function saveBankInfoList(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance-bank-info/save`, {
    method: 'POST',
    body: params
  })
}

/**
 * 查询编辑供应商信息的银行地址信息
*/
export async function getEditAddressBankInfoList(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-head/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询编辑供应商信息的银行明细信息
*/
export async function getEditBankInfoList(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-line/${params.bankHeadId}`, {
    method: 'GET',
  })
}

/**
 * 供应商ID导出银行信息
*/
export async function bankInfoExport(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-data-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 变更Id导出银行信息
*/
export async function bankInfoEditExport(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance-bank-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 查询编码规则
*/
export async function getLeaveCode(params) {
  return request(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/code-rule/generate`, {
    method: 'GET',
    query: params
  })
}