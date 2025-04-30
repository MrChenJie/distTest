/**
 * 公共方法
 * @author: zhihao.cai@hand-china.com
 * @since: 2020-01-16 17:14:14
 * @version 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Form } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { USER_DEFAULT_DATE_FORMAT, USER_DEFAULT_DATETIME_FORMAT } from '@/common/constants';
import style from './utils.less';

export const ACCESS_TOKEN = 'access_token';

/**
 * 快码转换
 * @param {Array} codeSet  快码列表
 * @param {String} params   value值
 * @returns {String} 快码描述
 */
export function getFastCode(code = [], value = '') {
  let result;
  if (!Array.isArray(code)) {
    return value;
  }
  if (value && !isEmpty(code)) {
    const codeList = code.filter((n) => n.value === value);
    if (!isEmpty(codeList)) {
      result = codeList[0].meaning;
    }
  }
  return result || value;
}

/**
 * 下载文件
 * @param {string} url - 文件地址
 * @param {string} filename - 文件名
 */
export function download(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_parent';
  if ('download' in a) {
    a.download = filename;
    (document.body || document.documentElement).appendChild(a);
    a.click();
    a.remove();
  }
}

/**
 * 搜索框 React Function
 * @param {Object} props
 */
export function QueryBarMore(props) {
  const { queryFields, queryDataSet, dataSet, buttons } = props;
  const queryFieldsLimit = queryFields.length >= 3 ? 3 : queryFields.length;
  const [hidden, setHidden] = useState(false);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      await dataSet.query();
    }
  };
  return (
    <div>
      {queryDataSet ? (
        <div style={{ alignItems: 'flex-start' }}>
          <Row>
            <Col span={queryFieldsLimit === 1 ? 7 : queryFieldsLimit === 2 ? 14 : 21}>
              <Form
                className={style.formInfo}
                columns={queryFieldsLimit}
                dataSet={queryDataSet}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) return query();
                }}
                useColon
              >
                {hidden ? queryFields.slice(0, 3) : queryFields}
              </Form>
            </Col>
            <div style={{ float: 'right', width: '50px' }}>
              {queryFields.length > 3 &&
                (hidden ? (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-down"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl.get('hzero.common.button.viewMore').d('更多查询')}
                  />
                ) : (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-up"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl.get('hzero.common.button.collected').d('收起查询')}
                  />
                ))}
            </div>
          </Row>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
}

export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

/**
 * 获取当前用户设置的日期格式
 * @param {String} defaultFormat
 */
export function getDateFormat(defaultFormat) {
  const { dateFormat } = getCurrentUser();
  if (dateFormat) {
    return dateFormat;
  }

  if (defaultFormat) {
    return defaultFormat;
  }

  return USER_DEFAULT_DATE_FORMAT;
}

/**
 * 获取当前用户的时间格式
 * @param {String} defaultFormat
 */
export function getDateTimeFormat(defaultFormat) {
  const { dateTimeFormat } = getCurrentUser();
  if (dateTimeFormat) {
    return dateTimeFormat;
  }

  if (defaultFormat) {
    return defaultFormat;
  }

  return USER_DEFAULT_DATETIME_FORMAT;
}

/**
 * 批量下载
 * return promise true: 接口请求成功， false：接口请求失败
 * @param {Array} batchFileList  batchFileList：[{attachmentUuid: 文件uuid, fileDir: 文件名}]
 * @param {String} zipFileName  压缩包名字
 */
export function batchDownloadFile(batchFileList = [], zipFileName) {
  return new Promise((resolve) => {
    request(`/hfle/v1/${getCurrentOrganizationId()}/files/downloadAndZipAttachmentList`, {
      method: 'POST',
      body: {
        batchFileList: batchFileList,
        fileName: zipFileName,
      },
      responseType: 'blob',
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/zip',
        });
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${zipFileName}.zip`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFileName;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
