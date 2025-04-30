/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-06 15:47:11
 * Copyright (c) 2024, All Rights Reserved. 
 */
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

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

export function getEditTableData(
  dataSource = [],
  filterList = [],
  scrollOptions = {},
  treeChildrenAlias = 'children'
) {
  const paramsList = [];
  const errList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].$form && source[i]._status) {
          source[i].$form.validateFieldsAndScroll(
            { scroll: { allowHorizontalScroll: true }, ...scrollOptions },
            (err, values) => {
              if (!err) {
                const { $form, ...otherProps } = source[i];
                if (Array.isArray(filterList) && filterList.length > 0) {
                  for (const name of filterList) {
                    // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤$form
                    // eslint-disable-next-line
                    if (source[i][name] && source[i]._status === 'create') {
                      delete otherProps[name];
                      // eslint-disable-next-line
                      delete values[name];
                    }
                  }
                }
                list.push({ ...otherProps, ...values });
              } else {
                // 捕获表单效验错误
                errList.push(err);
              }
              return err;
            }
          );
        }
        if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
          fetchForm(source[i][treeChildrenAlias], list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return errList.length > 0 ? null : paramsList;
}