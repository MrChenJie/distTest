import React from 'react';
import { notification } from 'antd';
import intl from 'utils/intl';
import './index.less';
import successIcon from '@/assets/successIcon.svg';
import errorIcon from '@/assets/errorIcon.svg';
import warnIcon from '@/assets/warnIcon.svg';
import infoIcon from '@/assets/infoIcon.svg';
import closeIcon from '@/assets/closeIcon.svg';

/**
 * 操作成功通知提示
 * @function success
 * @param {?string} [options.message=操作成功] - 提示信息
 * @param {?string} [options.description] - 详细描述
 * @param {?boolean} [options.closable] - 是否显示关闭图标
 */
function success(options) {
  const { message, description, closable = true, duration = 3, ...others } = options || {};
  notification.success({
    message: message || intl.get('hzero.common.notification.success').d('操作成功'),
    description,
    duration,
    icon: <img src={successIcon} alt="successIcon" />,
    className: 'customize-notification cus-success',
    closeIcon: closable ? <img style={{ width: '16px' }} src={closeIcon} alt="closeIcon" /> : false,
    ...others,
  });
}

/**
 * 操作失败通知提示
 * @function error
 * @param {?string} [options.message=操作失败] - 提示信息
 * @param {?string} [options.description] - 详细描述
 * @param {?boolean} [options.closable] - 是否显示关闭图标
 */
function error(options) {
  const { message, description, closable = true, duration = 3, ...others } = options || {};
  notification.error({
    message: message || intl.get('hzero.common.notification.error').d('操作失败'),
    description,
    duration,
    className: 'customize-notification cus-error',
    icon: <img src={errorIcon} alt="errorIcon" />,
    closeIcon: closable ? <img style={{ width: '16px' }} src={closeIcon} alt="closeIcon" /> : false,
    ...others,
  });
}

/**
 * 操作异常通知提示
 * @function warning
 * @param {?string} [options.message=操作异常] - 提示信息
 * @param {?string} [options.description] - 详细描述
 * @param {?boolean} [options.closable] - 是否显示关闭图标
 */
function warning(options) {
  const { message, description, closable = true, duration = 3, ...others } = options || {};
  notification.warning({
    message: message || intl.get('hzero.common.notification.warn').d('操作异常'),
    description,
    duration,
    className: `customize-notification cus-warn`,
    icon: <img src={warnIcon} alt="warnIcon" />,
    closeIcon: closable ? <img style={{ width: '16px' }} src={closeIcon} alt="closeIcon" /> : false,
    ...others,
  });
}

/**
 * 操作信息通知提示
 * @function info
 * @param {?string} [options.message] - 提示信息
 * @param {?string} [options.description] - 详细描述
 * @param {?boolean} [options.closable] - 是否显示关闭图标
 */
function info(options) {
  const { message, description, closable = true, duration = 3, ...others } = options || {};
  notification.info({
    message: message || intl.get('hzero.common.notification.tips').d('操作提示'),
    description,
    duration,
    className: 'customize-notification cus-info',
    icon: <img src={infoIcon} alt="infoIcon" />,
    closeIcon: closable ? <img style={{ width: '16px' }} src={closeIcon} alt="closeIcon" /> : false,
    ...others,
  });
}

export default {
  success,
  error,
  warning,
  info,
};
