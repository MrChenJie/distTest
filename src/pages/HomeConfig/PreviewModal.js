import React from 'react';
import { Modal } from 'hzero-ui';

import './index.less';

export default ({ url, visible = false, onCancel = (e) => e }) => {
  return (
    <Modal visible={visible} footer={null} onCancel={onCancel}>
      <div className='chessboard'>
        <img alt='preview' style={{ width: '100%' }} src={url} />
      </div>
    </Modal>
  );
};
