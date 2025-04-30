import React, { useEffect, useState } from 'react';
import { Row, Col, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import styles from './index.less';

export default ({
  isCreate,
  options = [],
  value = [],
  onChange = (e) => e,
  saveRequestHeader = (e) => e,
}) => {
  const [checkBoxValue, setCheckBoxValue] = useState(value);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCheckBoxValue(value);
  }, [value]);
  /**
   * 点击业务类型确定按钮
   * @param value checkbox.Group值
   */
  const handleProductTypeModalOk = (value = []) => {
    if (isCreate) {
      onChange(value);
      setVisible(false);
    } else {
      setLoading(true);
      saveRequestHeader()
        .then(() => {
          onChange(value);
          setVisible(false);
          setLoading(false);
        })
        .catch(() => {
          setVisible(false);
          setLoading(false);
        });
    }
  };

  const handleChange = (value) => {
    setCheckBoxValue(value);
  };

  return (
    <>
      <CusButton type="plain" onClick={() => setVisible(true)}>
        {intl.get('spcm.costPayment.view.selectProductType').d('选择业务类型')}
      </CusButton>
      <CusModal
        title={intl.get('spcm.costPayment.view.selectProductType').d('选择业务类型')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setCheckBoxValue(value);
        }}
        onOk={() => handleProductTypeModalOk(checkBoxValue)}
        width={800}
        confirmLoading={loading}
        destroyOnClose
      >
        <div className={`cus-ant-checkbox ${styles['product-type-list']}`}>
          <Checkbox.Group defaultValue={checkBoxValue} onChange={handleChange}>
            <Row>
              {options.map((item) => (
                <Col span={8} key={item.value} className={styles['product-type-item']}>
                  <Checkbox value={item.value}>
                    <span title={item.label}>{item.label}</span>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
      </CusModal>
    </>
  );
};
