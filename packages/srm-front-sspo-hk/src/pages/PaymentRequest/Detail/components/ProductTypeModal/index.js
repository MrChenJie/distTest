import React from 'react';

import { Modal, Row, Col, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default ({
  options=[],
  defaultValue=[],
  visible=false,
  onCancel=e=>e,
}) => {

  return (
    <Modal
      title={intl.get('spcm.paymentRequest.view.productType').d('查看业务类型')}
      visible={visible}
      onCancel={onCancel}
      width={800}
      destroyOnClose
      footer={null}
    >
    <div className={styles['product-type-list']}>
      <Checkbox.Group value={defaultValue}>
        <Row gutter={48}>
          {
            options.map(item => (
              <Col span={8} key={item.value} style={{paddingTop: '4px', paddingBottom: '4px'}}>
                <Checkbox value={item.value}><span title={item.label}>{item.label}</span></Checkbox>
              </Col>
            ))
          }
        </Row>
      </Checkbox.Group>
      </div>
    </Modal>
  )
}