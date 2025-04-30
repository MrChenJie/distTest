/**
 * @Description: react-file-viewer文件预览
 * @date 2022-05-31
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Modal } from 'hzero-ui';
import intl from 'utils/intl';
import FileViewer from 'react-file-viewer';
import styles from './index.less';
import ErrorBoundary from './ErrorPage';

class CusFileViewer extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(
      this.props?.filePath === nextProps?.filePath && this.props?.visible === nextProps?.visible
    );
  }

  render() {
    const { visible, fileType, filePath, onCancel = (e) => e, ...config } = this.props;
    const modalProps = {
      title: intl.get('hzero.common.upload.filePreview').d('文件预览'),
      visible,
      width: 1000,
      bodyStyle: { height: '500px', padding: '0px' },
      footer: null,
      destroyOnClose: true,
      // maskClosable: true,
      onCancel: (e) => {
        onCancel(e);
      },
      ...config,
    };
    return (
      <Modal {...modalProps}>
        <div className={styles['fileViewer-style']}>
          {fileType && (
            <ErrorBoundary>
              <FileViewer
                fileType={fileType.toLowerCase()}
                filePath={filePath}
                onError={(e) => console.log(e, 'error in file-viewer')}
                errorComponent={<div>error! please contact the administrator.</div>}
                unsupportedComponent={
                  <div>
                    {intl.get('hzero.common.upload.unSupported.preview').d('该文件类型不支持预览')}
                  </div>
                }
              />
            </ErrorBoundary>
          )}
        </div>
      </Modal>
    );
  }
}

export default CusFileViewer;
