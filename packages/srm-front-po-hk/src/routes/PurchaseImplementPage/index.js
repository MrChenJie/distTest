/**
 * index.js - 简易询价列表页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Collapse } from 'antd';
import querystring from 'querystring';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import dayjs from 'dayjs';
import styles from './index.less';
import SimpleInquireTab from '../SimpleInquire';

const commonPrompt = 'HKPC.commom';
@connect(({ loading = {}, evaluationList = {} }) => ({
  evaluationList,
}))

export default class PurchaseImplement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'table'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      isShowImplement: false, //默认显示询价Tab
    };
  }

  componentWillMount() {
    const searchParams = new URLSearchParams(window.location.search);
    const isShowGeneral = searchParams.get('isShowGeneral');
    console.log(isShowGeneral,'isShowGeneral');
    if(isShowGeneral == "true"){
      this.setState({
        isShowImplement : true
      })
    }
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const values = this.baseForm.current?.getFieldsValue(true);
    const { startDate, endDate } = values || {};
    return {
      ...values,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
    };
  }

  /**
 * 切换tab注入key
 */
  @Bind()
  changeTabs(key) {
    this.setState({ isShowImplement: key === 'implement' });
  }

  render() {
    const { location } = this.props;
    const { isShowImplement } = this.state;
    const { proCode } = querystring.parse(location.search.substr(1));
    return (
      <>
        <CusSearchTabs
          activeKey={isShowImplement ? 'implement' : 'simple'}
          items={[
            {
              forceRender: true,
              label: intl.get(`${commonPrompt}.view.title.simpleinquiry`).d('询价'),
              key: 'simple',
              children: (
                <SimpleInquireTab />
              )
            },
            {
              forceRender: true,
              label: intl.get(`${commonPrompt}.view.title.procurementimplementation`).d('采购实施'),
              key: 'implement',
              children: (
                <div className={styles['iframe-style']}>
                  <iframe
                    src={`/pub/sspo/online-purchase/list${proCode ? `?proCode=${proCode}` : ''}`}
                    width="100%"
                    height="100% !important"
                    frameBorder="0"
                  />
                </div>
              )
            }
          ]}
          onChange={this.changeTabs}
        />
      </>
    )
  }
}