/**
 * @Description: 项目答疑-基本信息
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import React from 'react';
 import { Form, Row, Col, Input, Select } from 'hzero-ui';
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
 import { numberRender } from 'utils/renderer';
 
 const { ERP_HOST } = process.env;
 const currentUser = getCurrentUser();
 const FormItem = Form.Item;
 const { TextArea } = Input;
 const promptCode = `sodr.standardPurchaseOrder`;
 const formlayout1 = {
   labelCol: { span:6 },
   wrapperCol: { span: 18 },
 };
 const formlayout2 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
 

 function headerDataProjectQaInfo(props) {
   const {
     form,
     form: { getFieldDecorator },
     poHeaderInfo,
     code={},
     detailEnumMap: { listType, listTypeNew },
     poPartyLines,
     addressList,
     soUrl,
     isPub,
     isEdit,
     isExcel,
     idpValueMap,
     computeRate = (e) => e,
   } = props;
   if (poHeaderInfo.proInfoWording) {
    listType && listType.map(item => {
     if (item.value === poHeaderInfo.purchaseType) {
       poHeaderInfo.purchaseType = item.meaning;
     }
    })
   } else {
    listTypeNew && listTypeNew.map(item => {
     if (item.value === poHeaderInfo.purchaseType) {
       poHeaderInfo.purchaseType = item.meaning;
     }
    })
   }
   return (
     <div className={styles['spo-basic-style']}>
       <Form>
         <Row gutter={24}>
           <Col span={8}>
             <FormItem
               {...formlayout1}
               label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
             >
               {getFieldDecorator('proCode', {
                 initialValue: poHeaderInfo.proCode,
               })(<Input disabled />)}
             </FormItem>
           </Col>
       
           <Col span={8}>
           <FormItem
               {...formlayout2}
               label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
             >
                {getFieldDecorator('proName', {
                 initialValue: poHeaderInfo.proName  ,
               })(<Input disabled />)}
             </FormItem>
           </Col>
           <Col span={8}>
           <FormItem
               {...formlayout2}
               label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
             >
               {getFieldDecorator('purchaseType', {
                initialValue: poHeaderInfo.purchaseType ,
              })(
               (
                  <Select allowClear style={{ minWidth: 150 }}
                  disabled>
                    {(poHeaderInfo.proInfoWording ? (code['BID.SUPPLY_WAY'] || []) : (code['BID.PROCUREMENT_METHODNEW'] || [])).map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) 
              )}
              
             </FormItem>
           </Col>
         </Row>
         <Row gutter={24}>
           <Col span={8}>
             <FormItem
               {...formlayout1}
               label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
             >
               {getFieldDecorator('packageNo', {
                 initialValue: poHeaderInfo.packageNo ,
               })(<Input disabled />)}
             </FormItem>
           </Col>
        
           <Col span={8}>
           <FormItem
               {...formlayout2}
               label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
             >
               {getFieldDecorator('packageName', {
                 initialValue: poHeaderInfo.packageName ,
               })(<Input disabled />)}
             </FormItem>
           </Col>
           {/* <Col span={8}>
           <FormItem
               {...formlayout2}
               label={intl.get(`bid.bidcommon.view.title.bbysjehkd`).d('标包预算金额(港币)')}
             >
               {getFieldDecorator('budgetLocalAmountTotal', {
                 initialValue: numberRender(poHeaderInfo.budgetLocalAmountTotal, 2),
               })(<Input disabled />)}
             </FormItem>
           </Col> */}
         </Row>
       </Form>
     </div>
   );
 }
 
 export default React.memo(headerDataProjectQaInfo);
 