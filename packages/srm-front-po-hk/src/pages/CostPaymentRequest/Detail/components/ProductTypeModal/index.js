import React, { useState } from 'react';

import { Modal, Row, Col, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default ({
  options=[],
  defaultValue=[],
  visible=false,
  confirmLoading=false,
  onCancel=e=>e,
  onOk = e=>e,
}) => {

  const [value, setValue] = useState(defaultValue);

  function handleChange(value) {
    setValue(value);
  }

  function handleOk() {
    onOk(value);
  }

  return (
    <Modal
      title={intl.get('spcm.costPayment.view.selectProductType').d('选择业务类型')}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
    <div className={styles['product-type-list']}>
      <Checkbox.Group defaultValue={defaultValue} onChange={handleChange}>
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