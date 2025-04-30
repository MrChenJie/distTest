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
import * as echarts from 'echarts';
require('echarts/theme/macarons');

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
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {d}%', // 设置提示框内容格式，包括百分比
        },
        legend: {
          top: '0%',
          left: 'center',
        },
        series: [
          {
            name: intl.get('HKPC.commom.view.title.procurement').d('采购方式'),
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 30,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [],
            center: ['50%', '60%'], // 调整饼图的位置，往下移动
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
    const { wayAmountList } = purchaseApplicationModel;

    option.series[0].data = wayAmountList;
    chart.setOption(option);
  }

  componentWillUnmount() {
    const { chart } = this.state;
    chart.dispose();
  }

  // 初始化渲染
  initChart = () => {
    const chart = echarts.init(this.myRef, 'macarons');
    this.setState({ chart: chart });
    const { option } = this.state;
    chart.setOption(option);
  };

  render() {
    return <div ref={(ref) => (this.myRef = ref)} style={{ width: '100%', height: '400px' }} />;
  }
}
