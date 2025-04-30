/**
 * @Description: 项目答疑-基本信息
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import React from 'react';
 import { Form } from 'hzero-ui';
 import { Row, Col } from 'antd';
 import CusInput from '_cus_components/CusInput';

 import intl from 'utils/intl';
 import styles from './index.less';
 import { getDFormGridSpan } from '_cus_utils/utils';
 
 const FormItem = Form.Item;
 
 function headerDataProjectQaInfo(props) {
   const {
     form: { getFieldDecorator },
     poHeaderInfo,
   } = props;

   const gridSpan = getDFormGridSpan();
 
   return (
    <>
      <Form className="customize-form">
        <Row>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
            >
              {getFieldDecorator('proName', {
                initialValue: poHeaderInfo.proName,
              })(<CusInput disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
            >
              <CusInput value={poHeaderInfo.packageName} disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
            >
              <CusInput value={poHeaderInfo.packageNo} disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
            >
              <CusInput value={poHeaderInfo.proCode} disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
   );
 }
 
 export default React.memo(headerDataProjectQaInfo);
 