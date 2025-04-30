import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { getCurrentLanguage } from 'utils/utils';
import { pick } from 'lodash';
import CusModal from '_cus_components/CusModal';
import CusButton from '@/components/CusButton';
import { closeWindow } from '@/utils/utils';
import './index.less';

const isEn = getCurrentLanguage() === 'en_US';

export default forwardRef((props, ref) => {
  const {
    children,
    approvalRequestButtonVOList = [],
    isCloseModal = true, // 点击确定，是否关闭当前页面
    viewOnly = false, // 是否回退历史记录
    openModal = (e) => e,
    onOk = (e) => e,
    onClose = (e) => e,
    onRefresh = (e) => e,
    onModalCancel = (e) => e,
  } = props;
  const [ modalRecord, setModalRecord ] = useState({
    modalVisible: false,
    modalUrl: '',
    modalTitle: '',
    modalWidth: '',
    modalHeight: '',
  });

  const openThisModal = useCallback((record = {}) => {
    setModalRecord({
      ...modalRecord,
      modalUrl: record.url,
      modalTitle: isEn ? record.nameE : record.name,
      modalWidth: Number(record.width) > 1200 ? Number(record.width) - 300 : record.width,
      modalHeight: record.height,
      modalVisible: true,
    });
  });

  useImperativeHandle(ref, () => ({
    openModal: openThisModal,
  }));

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);

    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []);

  useEffect(() => {
    const btns = document.getElementById('cus-approval-btns');
    const pageContent = document.getElementsByClassName('page-wrapper-content');
    if (btns && pageContent[0]) {
      pageContent[0].style.paddingBottom = '96px';
    }
  }, [approvalRequestButtonVOList]);

  const receiveMessage = (param) => {
    const {
      data: { routerParam = {} },
    } = param || {};
    if (routerParam.opt === 'ok') {
      setModalRecord({
        ...modalRecord,
        modalVisible: false,
      });
      if (isCloseModal) {
        if (viewOnly) {
          // 弹框关闭会 window历史栈中多了一个记录，这里手动回退
          window.history.back(-1);
          return false;
        }
        window.close();
        // 飞书提交审批后关闭tag页
        closeWindow();
      }
      onOk(routerParam);
    } else if (routerParam.opt === 'close') {
      setModalRecord({
        ...modalRecord,
        modalVisible: false,
      });
      if (viewOnly) {
        // 弹框关闭会 window历史栈中多了一个记录，这里手动回退
        window.history.back(-1);
        return false;
      }
      onClose();
    } else if (routerParam.opt === 'refresh') {
      onRefresh();
    }
  }
  const buttonProps = ['children', 'mini', 'type', 'size', 'tooltipTitle', 'onClick', 'disabled'];
  const showChildren = Array.isArray(children)
    ? children?.filter(item => !!item)?.length > 0
    : true;

  return (
    <>
      {Array.isArray(approvalRequestButtonVOList) && approvalRequestButtonVOList.length > 0 && (
        <div id="cus-approval-btns">
          {approvalRequestButtonVOList?.map((item, index) => {
            return (
              <CusButton
                type={index === 0 ? 'primary' : 'normal'}
                onClick={() => openModal(item)}
                {...pick(item, buttonProps)}
              >
                {isEn ? item.nameE : item.name}
              </CusButton>
            );
          })}
        </div>
      )}
      {children && showChildren && (
        <div id="cus-approval-btns">
          {children}
        </div>
      )}
      <CusModal
        title={modalRecord.modalTitle}
        visible={modalRecord.modalVisible}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setModalRecord({ ...modalRecord, modalVisible: false });
          if(onModalCancel){
            onModalCancel();
          }
        }}
        width={Number(modalRecord.modalWidth || 700) + 40}
        // maskClosable={false}
      >
        <iframe
          title="urlContent"
          src={modalRecord.modalUrl}
          frameBorder="0"
          style={{ width: `${modalRecord.modalWidth}px`, height: `${modalRecord.modalHeight}px` }}
        />
      </CusModal>
    </>
  )
})
