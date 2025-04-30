/**
 * @Description: 项目答疑-基本信息
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import React from 'react';
 import { Form, Row, Col, Input, InputNumber, DatePicker, Tooltip } from 'hzero-ui';
 import Lov from 'components/Lov';
 import ValueList from 'components/ValueList';
 import {
   getCurrentOrganizationId,
   getCurrentUser,
   getCurrentLanguage,
   getDateFormat,
 } from 'utils/utils';
 import { isEmpty } from 'lodash';
 import intl from 'utils/intl';
 import Base64 from 'crypto-js/enc-base64';
 import Utf8 from 'crypto-js/enc-utf8';
 import styles from './index.less';
 import moment from 'moment';
 
 const { ERP_HOST } = process.env;
 const currentUser = getCurrentUser();
 const FormItem = Form.Item;
 const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
 
 function headerDataProjectQaInfo(props) {
   const {
     form,
     form: { getFieldDecorator },
     poHeaderInfo,
     poPartyLines,
     addressList,
     soUrl,
     isPub,
     isEdit,
     isExcel,
     idpValueMap,
     computeRate = (e) => e,
   } = props;
 
   return (
    <div className={styles['spo-basic-style']}>
      <Form>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              {...formlayout}
              label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
            >
              {getFieldDecorator('proName', {
                initialValue: poHeaderInfo.proName,
              })(<Input style={{ width: '87.9vw' }} disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
              {...formlayout}
            >
              <Input value={poHeaderInfo.packageName} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
              {...formlayout}
            >
              <Input value={poHeaderInfo.packageNo} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
              {...formlayout}
            >
              <Input value={poHeaderInfo.proCode} disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
   );
 }
 
 export default React.memo(headerDataProjectQaInfo);
 