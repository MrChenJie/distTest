import React, { PureComponent } from 'react';
import { Spin, Row, Col } from 'antd';
import CusSpin from '_cus_components/CusSpin';
// import { Bind } from 'lodash-decorators';
// import { isEmpty, sum, isNumber } from 'lodash';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { numberRender } from 'utils/renderer';

import intl from 'utils/intl';

import style from './index.less';

export default class ThisQuoteProcessTab extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 渲染最新报价提示框内容
   */
  renderLatestQuo(
    quotationDate,
    supplierName,
    price,
    itemName,
    uomName,
    entryMethod,
    quotationName
  ) {
    
    const offLine = entryMethod === 'OFFLINE' ? `<div>${quotationName}</div>` : '';
    return {
      name: `<div>${intl
        .get('ssrc.inquiryHall.model.inquiryHall.supplierCompany')
        .d('供应商')}:${supplierName}</div>
    
    <div>${intl.get('ssrc.inquiryHall.model.inquiryHall.unitPrice').d('单价')}:${[
      numberRender(price, 0),
      ]}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}</div>
    <div>${intl
      .get('ssrc.inquiryHall.model.inquiryHall.quotationTime')
      .d('报价时间')}:${quotationDate}</div>
    ${offLine}
    `,
    };
  }

  render() {
    const {
      //   activeItemName = undefined,
      chartDataSource = [],
      xData = [],
      //   sideBarMenuList = [],
      //   activeRfxLineItemId = undefined,
      loading,
      //   onClickItemBar,
    } = this.props;
    console.log('123',chartDataSource)
    // 本次图表数据
    const historicalQuoteDs = new DataSet();
    const historicalQuoteDv = historicalQuoteDs.createView().source(chartDataSource);
    historicalQuoteDv
      .transform({
        type: 'fold',
        fields: xData,
        key: 'quotationDate',
        value: 'price',
      })
      .transform({
        type: 'filter',
        callback(row) {
          return typeof row.price !== 'undefined';
        },
      });
    const range =
      chartDataSource.length > 1
        ? {
            type: 'time',
            range: [0.1, 0.9],
          }
        : {
            type: 'cat',
            range: [0.5, 1],
          };
    const cols = {
      quotationDate: {
        ...range,
        tickCount: 30,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
      price: {
        min: 0,
      },
    };
    return (
      <CusSpin spinning={loading}>
        <Row>
          <Col span={24}>
            {chartDataSource.length > 0 ? (
              <Chart height={300} data={historicalQuoteDv} scale={cols} forceFit>
                <Legend position='top' offsetY={8} background={{padding: 5}} marker />
                <Axis name="quotationDate" />
                <Axis name="price" />

                <Tooltip showTitle={false} inPlot={false} />
                <Geom
                  type="line"
                  position="quotationDate*price"
                  size={2}
                  color="supplierName"
                  tooltip={[
                    'quotationDate*supplierName*price*itemName*uomName*entryMethod*quotationName',
                    (
                      quotationDate,
                      supplierName,
                      price,
                      itemName,
                      uomName,
                      entryMethod,
                      quotationName
                    ) =>
                      this.renderLatestQuo(
                        quotationDate,
                        supplierName,
                        price,
                        itemName,
                        uomName,
                        entryMethod,
                        quotationName
                      ),
                      
                  ]}
                />
                <Geom
                  type="point"
                  position="quotationDate*price"
                  size={2}
                  color="supplierName"
                  shape="circle"
                  style={{
                    stroke: '#fff',
                    lineWidth: 1,
                  }}
                  tooltip={[
                    'quotationDate*supplierName*price*itemName*uomName*entryMethod*quotationName',
                    (
                      quotationDate,
                      supplierName,
                      price,
                      itemName,
                      uomName,
                      entryMethod,
                      quotationName
                    ) =>
                      this.renderLatestQuo(
                        quotationDate,
                        supplierName,
                        price,
                        itemName,
                        uomName,
                        entryMethod,
                        quotationName
                      ),
                      
                  ]}
                />
              </Chart>
            ) : (
              <div className={style['chart-empty']}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`).d('暂无数据')}
              </div>
            )}
          </Col>
        </Row>
      </CusSpin>
    );
  }
}
