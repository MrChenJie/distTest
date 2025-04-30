import React from 'react';
import dayjs from 'dayjs';
import qs from 'query-string';
import CusNotification from '_cus_components/CusNotification';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import {
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';


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

/**
 *
 * @param date 日期
 * @param format 格式
 * @param defaultValue 默认值，若不是日期格式直接返回默认值
 * @returns {string|undefined}
 */
export function cusDateFormat(date, format, defaultValue = undefined){
  if(date && dayjs(date).isValid()){
    return dayjs(date).format(format);
  }else {
    return defaultValue;
  }
}

/**
 * 通过文件服务器的接口获取可访问的文件URL
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
export function getAttachmentUrl(url, bucketName, tenantId, bucketDirectory, storageCode) {
  const accessToken = getAccessToken();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      access_token: accessToken,
      directory: bucketDirectory,
    })
  );
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/files/download?${params}&url=${encodeURIComponent(url)}`
    : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?${params}&url=${encodeURIComponent(
      url
    )}`;
  return newUrl;
}

/**
 * tableScrollWidth - 计算滚动表格的宽度
 * 如果 fixWidth 不传或者为0, 会将没有设置宽度的列 宽度假设为 200
 * @param {array} columns - 表格列
 * @param {number} fixWidth - 不固定宽度列需要补充的宽度
 * @return {number} - 返回计算过的 x 值
 */
export function tableScrollWidth(columns = [], fixWidth = 0) {
  let fillFixWidthCount = 0;
  const recursive = (cols) => {
    const total = cols.reduce((prev, current) => {
      if (current.children) {
        return prev + recursive(current.children);
      };
      if (current.width) {
        return prev + current.width;
      }
      fillFixWidthCount += 1;
      return prev;
    }, 0);
    return total;
  }
  const total = recursive(columns);
  if (fixWidth) {
    return total + fixWidth + 1;
  }
  return total + fillFixWidthCount * 200 + 1;
}

/**
 * 获得字符串字节数 UTF-8
 *
 * @export
 * @param {string} s
 * @returns {number}
 */
export function getStringBytes(s) {
  if (typeof s !== 'string') {
    return 0;
  }
  let num = 0;
  for (const c of s) {
    const codePoint = c.codePointAt(0);
    // eslint-disable-next-line no-nested-ternary
    num += codePoint < 0x0080 ? 1 : codePoint < 0x0800 ? 2 : codePoint < 0x10000 ? 3 : 4;
  }
  return num;
}

/**
 * 截取最大字节数字符串
 *
 * @export
 * @param {string} s --原字符串
 * @param {number} maxBytes --最大字节数
 * @returns {number} --newString
 */
export function interceptString(s, maxBytes) {
  if (
    typeof s !== 'string' ||
    typeof maxBytes !== 'number' ||
    Number.isNaN(maxBytes) ||
    maxBytes <= 0
  ) {
    return '';
  }
  const newS = s.substr(0, maxBytes);
  if (getStringBytes(newS) <= maxBytes) {
    return newS;
  } else {
    let from = 0;
    let to = newS.length;
    while (true) {
      const mid = Math.floor((from + to) / 2);
      const s1 = newS.substr(0, mid);
      const s2 = newS.substr(0, mid + 1);
      const b1 = getStringBytes(s1);
      const b2 = getStringBytes(s2);
      if (b1 === maxBytes || (b1 < maxBytes && b2 > maxBytes)) {
        return s1;
      } else if (b1 < maxBytes) {
        from = mid;
      } else {
        to = mid;
      }
    }
  }
}

/**
* 自定义单词截断函数
*/
export function wordTruncation() {
  const nodeList = document.querySelectorAll('.ant-form-item-label > label');

  for (let i = 0; i < nodeList.length; i++) {
    // 节点对象
    const node = nodeList[i];
    // 初始化宽度
    const width = node.clientWidth;
    // 初始化高度
    const height = node.clientHeight;
    // 初始化文本
    const textContent = node.textContent;

    if (width > 0 && height > 16 && !textContent.includes('-') && !/\n/g.test(textContent)) {
      for (let j = textContent.length; j > 0; j--) {
        node.textContent = textContent.slice(0, j);
        if (node.clientHeight !== height) {
          // 1. 次行首字符为字母 && 首行倒数第二位字符为字母 && 首行倒数第一位字符不为空格，单词截断，补充'-'符号；
          if (/[a-zA-Z]/.test(textContent[j]) && /[a-zA-Z]/.test(textContent[j - 2]) && textContent[j - 1] !== ' ') {
            node.textContent = `${textContent.slice(0, j)}-`;
            if (node.clientHeight === height) {
              // 情况1 - 子情况1：补充'-'符号后正常换行；
              node.textContent = `${textContent.slice(0, j - 1)}-${textContent.slice(j - 1, textContent.length)}`;
              break;
            } else {
              // 情况1 - 子情况2：补充'-'符号后宽度充足仍然保持单行状态；
              node.textContent = `${textContent.slice(0, j)}-${textContent.slice(j, textContent.length)}`;
              break;
            }
          }
          // 2. 次行首字符为字母 && 首行倒数第二位字符为空格，单词截断，但截断处为单词首字母，补充换行符让单词整体换行；
          if (/[a-zA-Z]/.test(textContent[j]) && textContent[j - 2] === ' ') {
            node.textContent = `${textContent.slice(0, j - 1)}\n${textContent.slice(j - 1, textContent.length)}`;
            break;
          }
          // 存在未考虑的情况，恢复原始文本，跳出循环；
          node.textContent = textContent;
          break;
        }
      }
    }
  }
}

/**
 * 获取行内编辑表格中的 form
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 $form
 * @param {object} formatList - 格式化日期组件
 * - 默认是基于页面滚动，如果需要基于表格内滚动，
 * - 需要：{ container: document.querySelector('.ant-table-body') }，同时需要设置Y轴滚动
 * @param {string} treeChildrenAlias = 'children' - 指定树形结构行内编辑的子节点名称
 */
export function getTableDataNotValidate(
  dataSource = [],
  filterList = [],
  formatList = [],
  treeChildrenAlias = 'children'
) {
  const paramsList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].$form && source[i]._status) {
          const values = source[i].$form.getFieldsValue();
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
          if (Array.isArray(formatList) && formatList.length > 0) {
            for (const item of formatList) {
              values[item.value] = cusDateFormat(values[item.value], item.type);
            };
          }
          list.push({ ...otherProps, ...values });
        }
        if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
          fetchForm(source[i][treeChildrenAlias], list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return paramsList;
}
