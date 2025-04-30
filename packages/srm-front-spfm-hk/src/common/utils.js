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
import { Row, Col, Tooltip } from 'choerodon-ui';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
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

export function tooltipRender(text) {
  return (
    <Tooltip placement="topLeft" title={text}>
      {text}
    </Tooltip>
  );
}

export function getGrade(score, form) {
  debugger
  if(score !== '') {
    if (score >= 85) {
      return form.setFieldsValue({
        creditRating: 'A'
      });
    } else if (score >= 75) {
      return form.setFieldsValue({
        creditRating: 'B'
      });
    } else if (score >= 50) {
      return form.setFieldsValue({
        creditRating: 'C'
      });
    } else {
      return form.setFieldsValue({
        creditRating: 'D'
      });
    }
  } else {
    return form.setFieldsValue({
      creditRating: ''
    });
  }
}
