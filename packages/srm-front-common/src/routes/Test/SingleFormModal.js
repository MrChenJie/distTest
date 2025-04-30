import React, { useState } from 'react';
import CusModal from '../../components/CusModal';
import { Form, Row, Col } from 'hzero-ui';
import CusInput from '../../components/CusInput';
import CusButton from '@/components/CusButton';

export default function SingleFormModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <CusButton onClick={() => setVisible(true)}>SingleFormModal</CusButton>
      <CusModal visible={visible} title="SingleFormModal" onCancel={() => setVisible(false)}>
        <Form className="customize-form">
          <Row>
            <Col>
              <Form.Item label="input">
                <CusInput />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </CusModal>
    </>
  );
}
