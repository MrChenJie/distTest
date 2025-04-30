/**
 * @Description: 比价
 * @date 2022-5-6
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form, Card } from 'hzero-ui';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Header, Content } from 'components/Page';
import PanelHeader from '_cus_components/CusCollapse';
import PriceInfo from './priceInfo'
import NewPriceList from './newPrice'
import QuotationProcess from './quotationProcess'
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';

const { Panel } = Collapse;
@formatterCollections({
  code: ['bid.bidcommon','ssrc.inquiryHall'],
})

@connect(({ priceComparisonModels, loading }) => ({
  priceComparisonModels,
  poHeaderInfo: priceComparisonModels.poHeaderInfo,
  fetchThisQuoteLoading: loading.effects['priceComparisonModels/fetchHistoryQuotationProcessChart'],
}))
@Form.create({ fieldNameProp: null })
class priceComparison extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPriceDataSource: [],
      historyQuotationProcessChartList:[],
      newPricePagination: {},
      xData:[],
      activeKey:['priceInfo', 'newPrice', 'quotationProcess']
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceComparisonModels/updateState',
      payload: {
        poHeaderInfo: {}, // 头信息
      },
    });
  }

  @Bind
  init() {
    this.getNewPrice();
    this.getPriceHeaderInfo();
    this.fetchHistoryQuotationProcessChart();
  }

  @Bind
  getNewPrice() {
    const { dispatch, match } = this.props;
    const { proId, milestoneId, priceType } = match.params;
    dispatch({
      type: 'priceComparisonModels/getNewPrice',
      payload: {
        proId: proId,
        mileStoneId: milestoneId,
        priceType: priceType
      }
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        //  const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        this.setState({
          newPriceDataSource: newDataSource,
          // newPricePagination: pagination
        })
      }
    })
  }

  /**
 * 查询订单头信息
 */
  @Bind
  getPriceHeaderInfo() {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'priceComparisonModels/priceHeaderInfo',
      payload: {
        proId: proId,
        mileStoneId: milestoneId
      },
    })
  }

  @Bind
  fetchHistoryQuotationProcessChart() {
    const { dispatch, match } = this.props;
    const { proId, mileStoneId, priceType } = match.params;
    dispatch({
      type: 'priceComparisonModels/fetchHistoryQuotationProcessChart',
      payload: {
        mileStoneId: mileStoneId,
        proId: proId,
        priceType: priceType
      }
    }).then(res => {
      if (res) {
        const  newData = []
        const newDataSource = res&&res.map(item => {
          const { list = []} = item;
          // console.log('1233',item)
          let elementValue = {};
          list.forEach(ele => {
            const { quotationDate, price, ...otherElement } = ele;
         
          elementValue = {
            ...elementValue,
            ...otherElement,
            [quotationDate]: price?Number(price):0,
          };
          newData.push(quotationDate);
          // console.log('12334',ele, quotationDate, price,elementValue)
          });
          return {
            supplierCompanyName: item.supplierName,
            ...elementValue,
          };
         
        });
        // console.log('312',newDataSource)
       
        this.setState({historyQuotationProcessChartList: newDataSource,
          xData:[...new Set(newData)]})
      }
    })

  }

  
  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  render() {
    const {
      poHeaderInfo,
      match,
      fetchThisQuoteLoading,
      priceComparisonModels: {
        // historyQuotationProcessChartList = []
      }
    } = this.props;

    const { newPriceDataSource = [],historyQuotationProcessChartList = [], xData, activeKey } = this.state;
    const priceInfoProps = {
      //    form,
      poHeaderInfo
    };

    const newPriceProps = {
      dataSource: newPriceDataSource,
    }

    const quotationProcessProps = {
      loading: fetchThisQuoteLoading,
      chartDataSource: historyQuotationProcessChartList,
      xData: xData
    }

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <PageWrapper loading={false}>
        <Collapse 
            className="customize-collapse"
            defaultActiveKey={activeKey} 
            onChange={this.onCollapseChange}>
          
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.basicinfocom`).d('基本信息对比')}
                  arrowActive={activeKey.includes('priceInfo')}
                />}
              key="priceInfo"
            >
              <PriceInfo {...priceInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.newestquatation`).d('最新报价（本轮）')}
                  arrowActive={activeKey.includes('newPrice')}
                />}
              key="newPrice"
            >
              <NewPriceList {...newPriceProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.thisquatationgc`).d('本次报价过程')}
                  arrowActive={activeKey.includes('quotationProcess')}
                />}
              key="quotationProcess"
            >
              <QuotationProcess {...quotationProcessProps} />
            </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}

export default priceComparison;