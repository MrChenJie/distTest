import React from 'react';
import { pull, sortBy, uniq, isObject, isString } from 'lodash';
import { totalRender } from 'utils/renderer';
import { PAGE_SIZE_OPTIONS } from 'utils/constants';
import { Tooltip } from 'hzero-ui';
import tipIcon from '@/assets/buttonIcons/提示.png';

const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';

export function jdConvertImg(path, level = 0) {
  return `${JD_PREFIX_IMG_URL}/n${level}/${path}`;
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
              if (values[item] && values[item]._isAMomentObject) {
                values[item] = values[item].format(DEFAULT_DATETIME_FORMAT);
              }
            }
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

/**
 * 表格单个删除操作, 移除数据行，更新分页信息
 * @author WH <heng.wei@hand-china.com>
 * @param {number} length - 数据列表长度
 * @param {object} pagination - 原始分页对象
 * @returns {object} pagination - 分页对象
 */
export function delItemToPagination(length, pagination = {}) {
  const {
    total = 1,
    pageSize = 10,
    current = 1,
    sourceSize = pageSize,
    pageSizeOptions = PAGE_SIZE_OPTIONS,
  } = pagination;
  const size = length === pageSize ? pageSize - 1 : pageSize;
  const pages = uniq([...pull([...pageSizeOptions], `${pageSize}`), `${size}`]);
  return {
    ...pagination,
    // 更新数据总量
    total: total - 1,
    // 变更每页显示条数
    pageSizeOptions: sortBy(pages, (item) => +item),
    // 根据 数据列表的长度与每页大小的情况，更新分页大小
    pageSize: size,
    // 变更showTotal信息
    showTotal: () =>
      totalRender(total - 1, [
        sourceSize * (current - 1) + 1,
        sourceSize * (current - 1) + size < total - 1
          ? sourceSize * (current - 1) + size
          : total - 1,
      ]),
  };
}

export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

/**
 * 转义值集
 * @param {*} list - 值集列表
 * @param {*} value - 值
 */
export function getFastCode(list = [], value) {
  const item = list.find((e) => e.value === value);
  if (item) {
    return item.meaning;
  }
}

/**
 * 获得字符串字节数
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

export function labelTip({ label, tip }) {
  if (tip) {
    return (
      <span>
        <div>
          <div title={label}>{label}</div>
          <Tooltip title={tip}>
            <img src={tipIcon} alt="tip" />
          </Tooltip>
        </div>
      </span>
    );
  } else {
    return label;
  }
}

export function tooltipRender(text) {
  return (
    <Tooltip placement="topLeft" title={text}>
      {text}
    </Tooltip>
  );
}
