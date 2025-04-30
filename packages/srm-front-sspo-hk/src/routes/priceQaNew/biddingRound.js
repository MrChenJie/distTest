/**
 * @Description: 项目答疑-轮次
 * @date 2020-11-24
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import React, { useEffect, useState } from 'react';
 import { Form } from 'hzero-ui';
 import { Row, Col } from 'antd';
 import CusInput from '_cus_components/CusInput';
 import intl from 'utils/intl';
 import styles from './index.less';
 import { largeScreenWidth } from '_cus_utils/constants';
 
 const FormItem = Form.Item;

 function headerDataBiddingRound(props) {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth > largeScreenWidth);
    const handleResize = () => {
      setScreenWidth(window.innerWidth > largeScreenWidth);
    };
    useEffect(() => {
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
   const {
     form: { getFieldDecorator },
     poHeaderMilestonesInfo,
   } = props;
   
   return (
     <>
       <Form className="customize-form">
         <Row>
           <Col span={screenWidth ? 8 : 24}>
             <FormItem
               label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')}
             >
               {getFieldDecorator('round', {
                 initialValue: poHeaderMilestonesInfo.round,
               })(<CusInput disabled />)}
             </FormItem>
           </Col>
           <Col span={screenWidth ? 8 : 12}>
             <FormItem
               label={intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间')}
             >
               {getFieldDecorator('milestoneEndTime', {
                 initialValue: poHeaderMilestonesInfo.milestoneEndTime,
               })(<CusInput disabled />)}
             </FormItem>
           </Col>
           <Col span={screenWidth ? 8 : 12}>
             <FormItem
               label={intl.get(`bid.bidcommon.view.title.tendersubmissiontime`).d('递交投标时间')}
             >
               {getFieldDecorator('deliveryTime', {
                 initialValue: poHeaderMilestonesInfo.milestoneStartTime,
               })(<CusInput disabled />)}
             </FormItem>
           </Col>
         </Row>
       </Form>
     </>
   );
 }
 
 export default React.memo(headerDataBiddingRound);
 