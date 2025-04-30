/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-05-11 16:52:51
 * Copyright (c) 2024, All Rights Reserved. 
 */
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import CusNotification from '_cus_components/CusNotification';

export function getDateTime(dayNum = 0) {
  let day = new Date();
  day.setDate(day.getDate() - dayNum);
  return day;
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
 export async function queryFileList(params) {
  const tenantId = getCurrentOrganizationId();
  return cusRequest(
    `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
      params.attachmentUUID
    }/file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export function getResponse(response, errorCallback) {
  if (response && response.failed === true) {
    if (errorCallback) {
      errorCallback(response);
    } else {
      const msg = {
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: response.message,
      };
      switch (response.type) {
        case 'info':
          CusNotification.info(msg);
          break;
        case 'warn':
          CusNotification.warning(msg);
          break;
        case 'error':
        default:
          CusNotification.error(msg);
          break;
      }
    }
  } else {
    return response;
  }
}