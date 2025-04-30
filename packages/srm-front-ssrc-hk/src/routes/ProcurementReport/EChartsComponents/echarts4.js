/*
 * @Description: 
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2024-04-15 21:14:00
 */
import React from 'react';
import { connect } from 'dva';
import { Col, Collapse, Form, Row, Card } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import { numberRender } from 'utils/renderer';
import * as echarts from 'echarts';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
}))
export default class echarts1 extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = null;
    this.state = {
      chart: null,
      option: {
        color: ['#3271FE'],
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
          nameTextStyle: {
            padding: [0, 0, 16, 0], // 可以通过 padding 调整单位与图表的距离
          },
          name: intl.get('HKPC.commom.view.title.amountunit').d('单位:万元'), // 设置 Y 轴顶端显示的单位
          axisLabel: {
            formatter: function (value) {
              return value / 10000; // 格式化显示，如保留两位小数并添加单位
            },
          },
        },
        tooltip: {
          formatter: function (params) {
            return numberRender(params.value); // 在提示框中显示完整的省略文字
          },
        },
        series: [
          {
            data: [],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)',
            },
          },
        ],
      },
    };
  }

  componentDidMount() {
    this.initChart();
  }

  componentDidUpdate(props) {
    const { option, chart } = this.state;
    const { purchaseApplicationModel } = this.props;
    const { saveAmountList } = purchaseApplicationModel;

    option.xAxis.data = saveAmountList.nameData;
    option.series[0].data = saveAmountList.valueData;
    chart.setOption(option);
  }

  componentWillUnmount() {
    const { chart } = this.state;
    chart.dispose();
  }

  // 初始化渲染
  initChart = () => {
    const chart = echarts.init(this.myRef);
    this.setState({ chart: chart });
    const { option } = this.state;
    chart.setOption(option);
  };

  render() {
    return <div ref={(ref) => (this.myRef = ref)} style={{ width: '100%', height: '400px' }} />;
  }
}
