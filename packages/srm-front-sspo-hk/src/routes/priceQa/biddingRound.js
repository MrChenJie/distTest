/**
 * @Description: 项目答疑-轮次
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
 const { TextArea } = Input;
 const promptCode = `sodr.standardPurchaseOrder`;
 const formlayout = {
   labelCol: { span: 6 },
   wrapperCol: { span: 18 },
 };
 
 function headerDataBiddingRound(props) {
   const {
     form,
     form: { getFieldDecorator },
     poHeaderMilestonesInfo,
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
               label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')}
             >
               {getFieldDecorator('round', {
                 initialValue: poHeaderMilestonesInfo.round,
               })(<Input disabled />)}
             </FormItem>
           </Col>
           <Col span={8}>
             <FormItem
               {...formlayout}
               label={intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间')}
             >
               {getFieldDecorator('milestoneEndTime', {
                 initialValue: poHeaderMilestonesInfo.milestoneEndTime,
               })(<Input disabled />)}
             </FormItem>
           </Col>
           <Col span={8}>
             <FormItem
               {...formlayout}
               label={intl.get(`bid.bidcommon.view.title.tendersubmissiontime`).d('递交投标时间')}
             >
               {getFieldDecorator('deliveryTime', {
                 initialValue: poHeaderMilestonesInfo.milestoneStartTime,
               })(<Input disabled />)}
             </FormItem>
           </Col>
         </Row>
       </Form>
     </div>
   );
 }
 
 export default React.memo(headerDataBiddingRound);
 