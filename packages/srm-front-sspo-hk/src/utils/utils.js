const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isUndefined } from 'lodash';

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

export function valueMapTag(dataList, code) {
  const target = dataList.find((item) => item.value === code);
  return isUndefined(target) ? code : target.tag;
}


export function valueMapMeaning(dataList, code) {
  const target = dataList.find(item => item.value === code);
  return isUndefined(target) ? code : target.meaning;
}
