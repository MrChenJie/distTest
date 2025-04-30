import React, { useState } from 'react';
import CusModal from '@/components/CusModal';
import { Form, Row, Col } from 'hzero-ui';
import CusInput from '@/components/CusInput';
import CusButton from '@/components/CusButton';
import CusTable from '@/components/CusTable';

export default function ButtonInBodyModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <CusButton onClick={() => setVisible(true)}>ButtonInBodyModal</CusButton>
      <CusModal visible={visible} title="SingleFormModal" footer={null} marginBottom={40}>
        <Form className="customize-form">
          <Row>
            <Col>
              <Form.Item label="input">
                <CusInput />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ height: '80px' }} />
        <CusTable columns={[{ title: 'test' }]} dataSource={[]} />
        <div className="cus-modal-body-buttons" style={{ textAlign: 'right' }}>
          <CusButton>确定</CusButton>
          <CusButton onClick={() => setVisible(false)}>取消</CusButton>
        </div>
      </CusModal>
    </>
  );
}
