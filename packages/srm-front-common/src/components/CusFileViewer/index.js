/**
 * @Description: react-file-viewer文件预览
 * @date 2022-05-31
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import FileViewer from 'react-file-viewer';
import styles from './index.less';
import { getCurrentLanguage } from 'utils/utils';

import Modal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import ErrorBoundary from './ErrorPage';
import PdfPreview from './PdfPreview';

class CusFileViewer extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(
      this.props?.filePath === nextProps?.filePath && this.props?.visible === nextProps?.visible
    );
  }

  render() {
    const { visible, fileType, filePath, onCancel = (e) => e, onClosePreview, ...config } = this.props;
    const modalProps = {
      title: intl.get('hzero.common.upload.filePreview').d('文件预览'),
      visible,
      width: 1000,
      bodyStyle: { padding: '0px' },
      footer: (
        <CusButton onClick={onCancel}>
          {intl.get(`hzero.common.button.close`).d('关闭')}
        </CusButton>
      ),
      destroyOnClose: true,
      onCancel: (e) => {
        onCancel(e);
      },
      ...config,
    };
    return (
      <Modal {...modalProps}>
        <div className={styles[`${getCurrentLanguage() === 'zh_CN' ? 'fileViewer-style-zh' : 'fileViewer-style-us'}`]}>
          {fileType && (
            <ErrorBoundary>
              {fileType.toLowerCase() === 'pdf' ? (
                <PdfPreview filePath={filePath} onClosePreview={onClosePreview} />
              ) : (
                <FileViewer
                  fileType={fileType.toLowerCase()}
                  filePath={filePath}
                  onError={(e) => console.log(e, 'error in file-viewer')}
                  errorComponent={<div>error! please contact the administrator.</div>}
                  unsupportedComponent={
                    <div>
                      {intl
                        .get('hzero.common.upload.unSupported.preview')
                        .d('该文件类型不支持预览')}
                    </div>
                  }
                />
              )}
            </ErrorBoundary>
          )}
        </div>
      </Modal>
    );
  }
}

export default CusFileViewer;
