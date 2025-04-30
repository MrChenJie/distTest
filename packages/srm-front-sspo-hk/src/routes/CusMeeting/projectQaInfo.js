/**
 * @Description: 决策信息-基本信息
 * @date 2023-9-4
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.1
 * @copyright Copyright (c) 2023, Hand
 */
 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import { Col, Input } from 'antd';
 import intl from 'utils/intl';
 import { Bind } from 'lodash-decorators';
 import CusSelect from '_cus_components/CusSelect';
 import { largeScreenWidth } from '_cus_utils/constants';
 import { getDFormGridSpan } from '_cus_utils/utils';
 import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
 
 const FormItem = Form.Item;

 export default class projectQaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: window.innerWidth,
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth
    })
  }
  render() {
    const {
      form: { getFieldDecorator },
      poHeaderInfo,
      code={},
      detailEnumMap: { listType },
    } = this.props;
    const { screenWidth }  =this.state;

    // 小屏为false，大屏为true
    const isShow = screenWidth < largeScreenWidth;

    const gridSpan = getDFormGridSpan();

    listType && listType.map(item => {
      if (item.value === poHeaderInfo.purchaseType) {
        poHeaderInfo.purchaseType = item.meaning;
      }
     })
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={isShow}>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: poHeaderInfo.proCode,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: poHeaderInfo.proName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
              >
                {getFieldDecorator('purchaseType', {
                  initialValue: poHeaderInfo.purchaseType,
                })(
                  <CusSelect
                    options={code['BID.SUPPLY_WAY']}
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    allowClear
                    disabled
                  />
                )}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
              >
                {getFieldDecorator('packageNo', {
                  initialValue: poHeaderInfo.packageNo,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
              >
                {getFieldDecorator('packageName', {
                  initialValue: poHeaderInfo.packageName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    )
  }
 }