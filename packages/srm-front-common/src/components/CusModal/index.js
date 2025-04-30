import React, { useEffect } from 'react';
import { Modal } from 'antd';
import intl from 'utils/intl';
import './index.less';
import { getCurrentLanguage } from 'utils/utils';
import CusButton from '@/components/CusButton';
import errorIcon from '@/assets/errorIcon.svg';
import warnIcon from '@/assets/warnIcon.svg';
import infoIcon from '@/assets/infoIcon.svg';
import { Scrollbars } from 'react-custom-scrollbars';
import { wordTruncation } from '@/utils/utils';

const language = getCurrentLanguage();

// 判断是否在iframe中，即是不是嵌套到飞书中
function isIFrame() {
  return window.self !== window.top;
}

function confirm(props) {
  const {
    title,
    content,
    footer,
    okType = 'primary',
    okText = intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    cancelText = intl.get('hzero.common.cusModal.button.cancel').d('取消'),
    onCancel = (e) => e,
    onOk = (e) => e,
    closable = false,
    mask,
    centered = true,
    style,
    ...others
  } = props;
  const isIFrameFlag = isIFrame();

  const modal = Modal.confirm({
    closable,
    title: title ? title : intl.get('hzero.common.cusModal.title.msgConfirm').d('信息确认'),
    wrapClassName: 'customise-modal-confirm',
    style: { marginBottom: '120px', ...style },
    icon: null,
    mask: !isIFrameFlag,
    centered,
    content: (
      <>
        <img src={warnIcon} alt="warnIcon" />
        <span>{content}</span>
      </>
    ),
    footer: footer ? (
      footer
    ) : (
      <div className="ant-modal-customise-footer">
        <CusButton
          onClick={() => {
            onCancel();
            modal.destroy();
          }}
        >
          {cancelText}
        </CusButton>
        <CusButton
          type={okType}
          onClick={() => {
            onOk();
            modal.destroy();
          }}
        >
          {okText}
        </CusButton>
      </div>
    ),
    ...others,
  });
}

function warning(props) {
  const {
    title,
    content,
    footer,
    okType = 'primary',
    okText = intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    onOk = (e) => e,
    closable = false,
    mask,
    centered = true,
    style,
    ...others
  } = props;
  const isIFrameFlag = isIFrame();
  const modal = Modal.confirm({
    closable,
    title: title ? title : intl.get('hzero.common.cusModal.title.msgWarning').d('信息警告'),
    wrapClassName: 'customise-modal-confirm',
    style: { marginBottom: '120px', ...style },
    icon: null,
    mask: !isIFrameFlag,
    centered,
    content: (
      <>
        <img src={warnIcon} alt="warnIcon" />
        <span>{content}</span>
      </>
    ),
    footer: footer ? (
      footer
    ) : (
      <div className="ant-modal-customise-footer">
        <CusButton
          type={okType}
          onClick={() => {
            onOk();
            modal.destroy();
          }}
        >
          {okText}
        </CusButton>
      </div>
    ),
    ...others,
  });
}

function info(props) {
  const {
    title,
    content,
    footer,
    okType = 'primary',
    okText = intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    onOk = (e) => e,
    closable = false,
    mask,
    centered = true,
    style,
    ...others
  } = props;
  const isIFrameFlag = isIFrame();
  const modal = Modal.confirm({
    closable,
    title: title ? title : intl.get('hzero.common.cusModal.title.msgInfo').d('信息提示'),
    wrapClassName: 'customise-modal-confirm',
    style: { marginBottom: '120px', ...style },
    icon: null,
    mask: !isIFrameFlag,
    centered,
    content: (
      <>
        <img src={infoIcon} alt="infoIcon" />
        <span>{content}</span>
      </>
    ),
    footer: footer ? (
      footer
    ) : (
      <div className="ant-modal-customise-footer">
        <CusButton
          type={okType}
          onClick={() => {
            onOk();
            modal.destroy();
          }}
        >
          {okText}
        </CusButton>
      </div>
    ),
    ...others,
  });
}

function error(props) {
  const {
    title,
    content,
    footer,
    okType = 'primary',
    okText = intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    onOk = (e) => e,
    closable = false,
    mask,
    centered = true,
    style,
    ...others
  } = props;
  const isIFrameFlag = isIFrame();
  const modal = Modal.confirm({
    closable,
    title: title ? title : intl.get('hzero.common.cusModal.title.msgError').d('错误信息'),
    wrapClassName: 'customise-modal-confirm',
    style: { marginBottom: '120px', ...style },
    icon: null,
    mask: !isIFrameFlag,
    centered,
    content: (
      <>
        <img src={errorIcon} alt="errorIcon" />
        <span>{content}</span>
      </>
    ),
    footer: footer ? (
      footer
    ) : (
      <div className="ant-modal-customise-footer">
        <CusButton
          type={okType}
          onClick={() => {
            onOk();
            modal.destroy();
          }}
        >
          {okText}
        </CusButton>
      </div>
    ),
    ...others,
  });
}

export default function CusModal(props) {
  const {
    title,
    footer,
    okType = 'primary',
    cancelText = intl.get('hzero.common.cusModal.button.cancel').d('取消'),
    okText = intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    onOk,
    onCancel,
    confirmLoading = false,
    visible = false,
    closable = false,
    mask,
    bodyStyle,
    marginBottom = 0,
    centered = true,
    style,
    ...others
  } = props;

  const isIFrameFlag = isIFrame();
  useEffect(() => {
    if (language === 'en_US') {
      // wordTruncation();
    }
  });
  // 重新判定 marginBottom 值
  const newMarginBottom = marginBottom ? 40 : 0;
  const titleHeight = title ? 0 : 30;
  const footerHeight = footer === null ? newMarginBottom : 40;
  const innerHeight = window.innerHeight - 80 - 36 - titleHeight - footerHeight;
  const innerWidth = window.innerWidth - 80 > 1000 ? 1000 : window.innerWidth - 80 ;

  const modalProps = {
    // title,
    closable,
    wrapClassName: `customise-modal ${language === 'en_US' ? 'form-label-120' : ''}`,
    style: {
      ...style,
      maxWidth: innerWidth,
    },
    open: visible,
    onOk,
    onCancel,
    mask: !isIFrameFlag,
    centered,
    bodyStyle:
      footer === null ? { ...bodyStyle, marginBottom: `${newMarginBottom}px` } : { ...bodyStyle },
    footer:
      footer || footer === null ? (
        footer
      ) : (
        <div className="ant-modal-customise-footer">
          {!!onCancel && (
            <CusButton
              onClick={() => {
                onCancel();
              }}
            >
              {cancelText}
            </CusButton>
          )}
          {!!onOk && (
            <CusButton
              type={okType}
              onClick={() => {
                onOk();
              }}
              loading={confirmLoading}
            >
              {okText}
            </CusButton>
          )}
        </div>
      ),
  };

  /**
   * 滚动条渲染函数
   * @param className
   * @returns {function({style: *, props: *}): *}
   */
  const getScrollBarFn = (className) => {
    return ({ style, props }) => <div {...props} style={{ ...style }} className={className} />;
  };

  return (
    <Modal {...modalProps} {...others}>
      <Scrollbars
        universal
        autoHeight
        autoHeightMin={0}
        autoHeightMax={100000}
        renderTrackHorizontal={getScrollBarFn('track-horizontal')}
        renderTrackVertical={getScrollBarFn('track-vertical')}
        renderThumbHorizontal={getScrollBarFn('thumb-horizontal')}
        renderThumbVertical={getScrollBarFn('thumb-vertical')}
        renderView={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              maxHeight: `${innerHeight}px`,
              paddingRight: '20px',
              position: 'unset',
            }}
          />
        )}
      >
        {title && (
          <div className="ant-modal-header">
            <div className="ant-modal-title">{title}</div>
          </div>
        )}
        <div
          style={{
            padding: '4px 0 8px',
            paddingTop: title ? '4px': '0',
            paddingBottom: footerHeight ? '8px' : '0',
            overflow: 'hidden',
          }}
        >
          {props.children}
        </div>
      </Scrollbars>
    </Modal>
  );
}

/**
 * 确认删除框
 * @param onOk
 */
function CusDeleteConfirm(onOk) {
  CusModal.confirm({
    content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
    onOk,
    okType: 'normal',
  });
}

CusModal.confirm = function (props) {
  return confirm(props);
};
CusModal.error = function (props) {
  return error(props);
};
CusModal.warning = function (props) {
  return warning(props);
};
CusModal.info = function (props) {
  return info(props);
};
CusModal.CusDeleteConfirm = function (props) {
  return CusDeleteConfirm(props);
};
