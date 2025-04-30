/*
 * ContractMaintainDetail - 统计图表
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Col, Row, Radio, Form, Select } from 'hzero-ui';
import { Axis, Chart, Coord, Geom, Legend, Tooltip } from 'bizcharts';
import style from './index.less';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord'],
})

@connect(({ contractMaintain }) => ({
  contractMaintain,
  statisticsInfo: contractMaintain.statisticsInfo,
}))
@Form.create({ fieldNameProp: null })

export default class StatisticsShow extends PureComponent {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      ststicType1: '0', //获取项目状态统计
      ststicType2: '1', //项目最终报价金额
      size: '1',
      size1: '3',
      staticticOne1: {}, //表1
      staticticOne2: {}, //表2
      staticticTwo: [],
      staticOne: true,
      staticTwo: false,
      staticThree: true,
      staticFour: false,
      sizeTab: '公开招标',
    };
  }

  componentDidMount() {
    const { ststicType1, ststicType2 } = this.state;
    this.getStatisticInfo(ststicType1, ststicType2);
    this.getMilestoneStatistics('公开招标');
    this.fetchEnum()
  }
  // 监听，获取主页面porps中的startTime, endTime
  componentWillReceiveProps(newProps) {
    const { ststicType1, ststicType2 } = this.state;
    this.getStatisticInfo(ststicType1, ststicType2);
    this.getMilestoneStatistics('公开招标');
  }

  // 获取项目状态统计/项目最终报价金额
  @Bind
  getStatisticInfo(ststicType1, ststicType2) {
    const { dispatch, startTime, endTime } = this.props;
    console.log('startTime1', startTime, endTime)
    let startMonday = '';
    let endSunday = '';
    if (startTime == '' && endTime == '') {
      let now = new Date();
      let year = now.getFullYear();
      // 获取本周开始和结束时间
      let nowTime = now.getTime();
      let day = now.getDay();
      let oneDayTime = 24 * 60 * 60 * 1000;
      let MondayTime = nowTime - (day - 1) * oneDayTime; //显示周一
      let SundayTime = nowTime + (7 - day) * oneDayTime; //显示周日
      let monday = new Date(MondayTime);
      let sunday = new Date(SundayTime);
      startMonday = year + '-' + (monday.getMonth() + 1) + '-' + monday.getDate();
      endSunday = year + '-' + (sunday.getMonth() + 1) + '-' + sunday.getDate();
    } else {
      startMonday = startTime;
      endSunday = endTime;
    }
    dispatch({
      type: 'contractMaintain/getStatisticInfo',
      payload: {
        startDate: startMonday,
        endDate: endSunday,
      },
    }).then((res) => {
      if (res) {
        if (ststicType1 == '0') {  // 表1
          this.setState({ staticticOne1: res })
        }
        if (ststicType2 == '1') { // 表2
          this.setState({ staticticOne2: res })
        }
      }
    })
  }

  // 获取项目最终报价金额
  @Bind
  getMilestoneStatistics(bidding) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getMilestoneStatistics',
      payload: {
        mileStoneType: bidding, //招标方式
      },
    }).then((res) => {
      if (res) {
        this.setState({ staticticTwo: res })
        console.log('staticticTwo', this.state.staticticTwo)
      }
    })
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    });
  }

  // 获取项目状态统计  切换饼图和柱状图
  @Bind()
  onChangeChart = (e) => {
    const { ststicType1 } = this.state;
    this.setState({ size: e.target.value });
    if (e.target.value == '1') {
      this.setState({ staticOne: true, staticTwo: false })
    }
    if (e.target.value == '2') {
      this.setState({ staticOne: false, staticTwo: true })
    }
    this.getStatisticInfo(ststicType1, null);
  }
  // 项目最终报价金额  切换饼图和柱状图
  @Bind()
  onChangeChart1 = (e) => {
    const { ststicType2 } = this.state;
    this.setState({ size1: e.target.value });
    if (e.target.value == '3') {
      this.setState({ staticThree: true, staticFour: false })
    }
    if (e.target.value == '4') {
      this.setState({ staticThree: false, staticFour: true })
    }
    this.getStatisticInfo(null, ststicType2);
  }

  // 项目轮次的报价金额  根据招标方式切换
  @Bind()
  onChangeEChart() {
    const {
      form,
    } = this.props;
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      this.state.sizeTab = values.purchaseType
    })
    if (this.state.sizeTab) {
      this.getMilestoneStatistics(this.state.sizeTab);
    }
  }

  render() {
    const { form, contractMaintain: { detailEnumMap = {} } } = this.props;
    const {
      size,
      size1,
      staticticOne1,
      staticticOne2,
      staticticTwo,
      staticOne,
      staticTwo,
      staticThree,
      staticFour,
      sizeTab,
      fastCodes,
    } = this.state;
    const { listType = [] } = detailEnumMap;
    /**------------data,cols:饼状图数据-----------------------------------------*/
    let data1 = [];
    if (staticticOne1.toBeCarriedOut >= 0) { //待开展
      let list = {
        item: intl.get(`bid.bidcommon.view.title.waitingfordep`).d('待开展'),
        count: staticticOne1.toBeCarriedOutPercentage,
        percent: (staticticOne1.toBeCarriedOutPercentage / 100).toFixed(2)
      }
      data1.push(list)
    }
    if (staticticOne1.completed >= 0) { // 已完成
      let list = {
        item: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
        count: staticticOne1.completedPercentage,
        percent: (staticticOne1.completedPercentage / 100).toFixed(2)
      }
      data1.push(list)
    }
    if (staticticOne1.inProcess >= 0) { // 进行中
      let list = {
        item: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
        count: staticticOne1.inProcessPercentage,
        percent: (staticticOne1.inProcessPercentage / 100).toFixed(2)
      }
      data1.push(list)
    }
    let data2 = [];
    if (staticticOne2.toBeCarriedOut >= 0) { //待开展
      let list = {
        item: intl.get(`bid.bidcommon.view.title.waitingfordep`).d('待开展'),
        count: staticticOne2.toBeCarriedOutPercentage,
        percent: (staticticOne2.toBeCarriedOutPercentage / 100).toFixed(2)
      }
      data2.push(list)
    }
    if (staticticOne2.completed >= 0) { // 已完成
      let list = {
        item: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
        count: staticticOne2.completedPercentage,
        percent: (staticticOne2.completedPercentage / 100).toFixed(2)
      }
      data2.push(list)
    }
    if (staticticOne2.inProcess >= 0) { // 进行中
      let list = {
        item: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
        count: staticticOne2.inProcessPercentage,
        percent: (staticticOne2.inProcessPercentage / 100).toFixed(2)
      }
      data2.push(list)
    }
    const cols = {
      percent: {
        min: 0,
        formatter: val => (val = `${val * 100}%`),
      },
      count: {
        min: 0,
        nice: true
      }
    }
    /**------------rulePercentageList:柱状图数据-----------------------------------------*/
    let rulePercentageList = staticticTwo

    return (
      <Fragment
      >
        <Row className={style['chartsPosition']}>
          <Col className={style['affix-menu-divider']} >
            <div className={style['affix-menu-fixed']}>
              <p>{intl.get(`bid.bidcommon.view.title.prostatusstatistic`).d('项目状态统计')}</p>
              <Radio.Group value={size} onChange={this.onChangeChart} style={{ marginBottom: 16 }}>
                <Radio.Button value="1">1</Radio.Button>
                <Radio.Button value="2">2</Radio.Button>
              </Radio.Group>
            </div>
            {data1.length > 0 ? (
              <Chart className={style[staticOne ? "active" : "active1"]} width={700} height={400} data={data1} scale={cols}
                onGetG2Instance={(chart) => {
                  // 饼图绘制多次会导致setSelected处理不生效，延时hack一下fixed
                  setTimeout(() => {
                    // 设置默认选中
                    const geom = chart.get('geoms')[0]; // 获取所有的图形
                    console.log(geom);
                    const items = geom.get('data'); // 获取图形对应的数据
                    console.log('items', JSON.stringify(items));
                    geom.setSelected(items[0]);
                  }, 2000);
                }} // 设置选中
                onPlotClick={(ev) => {
                  console.log(ev);
                }}
              >
                <Coord type="theta" radius={0.65} />
                <Axis name="percent" />
                <Legend position="right" offsetY={-400 / 2 + 120} offsetX={-100} />
                <Tooltip
                  showTitle={false}
                  showMarkers={false}
                // itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                />
                <Geom
                  type="intervalStack"
                  position="percent"
                  color="item"
                  // tooltip={[
                  //   'item*percent',
                  //   (item, percent) => {
                  //     percent = `${percent * 100}%`;
                  //     return {
                  //       name: item,
                  //       value: percent,
                  //     };
                  //   },
                  // ]}
                  style={{
                    lineWidth: 1,
                    stroke: '#fff',
                  }}
                />
              </Chart>
            ) : (
              <div className={style[staticOne ? "active" : "active1"]} style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}>
                {intl.get(`bid.bidcommon.view.title.nodata`).d('暂无数据')}
              </div>
            )}
            {data1.length > 0 ? (
              <Chart className={style[staticTwo ? "active" : "active1"]} width={700} height={400} data={data1} scale={cols} size={15}>
                <Axis name="item" />
                <Tooltip />
                <Geom tooltip={['item*count', (item, count) => {
                  return {
                    showCrosshairs: true,
                    showMarkers: false,
                    name: item,
                    value: count,
                  };
                }]}
                  type="interval"
                  x="item"
                  position="item*count"
                  color='item*count'
                  adjust='stack'
                >
                </Geom>
              </Chart>
            ) : (
              <div className={style[staticTwo ? "active" : "active1"]} style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}>
                {intl.get(`bid.bidcommon.view.title.nodata`).d('暂无数据')}
              </div>
            )}
          </Col>
          <Col className={style['affix-divider']}>
            <div className={style['affix-menu-fixed']} >
              <p>{intl.get(`view.title.proroundquatation`).d('项目轮次的报价金额')}</p>
              <Form.Item label={intl.get(`view.title.procurement`).d('采购方式')} style={{ display: 'flex', alignItems: 'center' }}>
                {form.getFieldDecorator(`purchaseType`, {
                  initialValue: sizeTab,
                })(
                  <Select allowClear style={{ minWidth: 150 }}
                    onChange={this.onChangeEChart}>
                    {listType.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
            {rulePercentageList.length > 0 ? (
              <Chart width={700} height={400} data={rulePercentageList}>
                {/* // <Coord transpose  />: transpose是Boolean类型，代表将坐标系x,y轴交换 */}
                <Axis name="ruleName" label={{
                  rotate: 40,
                }}
                />
                <Axis name="name" />
                <Tooltip />
                <Geom
                  tooltip={['name*count', (name, count) => {
                    return {
                      name: name,
                      value: count,
                    };
                  }]}
                  // 使用矩形或者弧形，用面积来表示大小关系的图形，一般构成柱状图、饼图等图表。
                  type="interval"
                  x="ruleName"
                  // 位置属性的映射
                  position="ruleName*count"
                  color='name*count'
                  adjust='stack'
                >
                </Geom>
              </Chart>
            ) : (
              <div className={style['font-line-height']} style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}>
                {intl.get(`bid.bidcommon.view.title.nodata`).d('暂无数据')}
              </div>
            )}
          </Col>
        </Row>
        <Row className={style['chartsPosition']}>
          <Col className={style['affix-menu-divider']} >
            <div className={style['affix-menu-fixed']}>
              <p>{intl.get(`bid.profinalquatation.view.title.profinalquatation`).d('项目最终报价金额')}</p>
              <Radio.Group value={size1} onChange={this.onChangeChart1} style={{ marginBottom: 16 }}>
                <Radio.Button value="3">3</Radio.Button>
                <Radio.Button value="4">4</Radio.Button>
              </Radio.Group>
            </div>
            {data2.length > 0 ? (
              <Chart className={style[staticThree ? "active" : "active1"]} width={700} height={400} data={data2} scale={cols}
                onGetG2Instance={(chart) => {
                  // 饼图绘制多次会导致setSelected处理不生效，延时hack一下fixed
                  setTimeout(() => {
                    // 设置默认选中
                    const geom = chart.get('geoms')[0]; // 获取所有的图形
                    console.log(geom);
                    const items = geom.get('data'); // 获取图形对应的数据
                    console.log(JSON.stringify(items));
                    geom.setSelected(items[1]);
                  }, 2000);
                }} // 设置选中
                onPlotClick={(ev) => {
                  console.log(ev);
                }}
              >
                <Coord type="theta" radius={0.65} />
                <Axis name="percent" />
                <Legend position="right" offsetY={-400 / 2 + 120} offsetX={-100} />
                <Tooltip
                  showTitle={false}
                  itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                />
                <Geom
                  type="intervalStack"
                  position="percent"
                  color="item"
                  tooltip={[
                    'item*percent',
                    (item, percent) => {
                      percent = `${percent * 100}%`;
                      return {
                        name: item,
                        value: percent,
                      };
                    },
                  ]}
                  style={{
                    lineWidth: 1,
                    stroke: '#fff',
                  }}
                />
              </Chart>
            ) : (
              <div className={style[staticThree ? "active" : "active1"]} style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}>
                {intl.get(`bid.bidcommon.view.title.nodata`).d('暂无数据')}
              </div>
            )}
            {data2.length > 0 ? (
              <Chart className={style[staticFour ? "active" : "active1"]} width={700} height={400} data={data2} scale={cols} size={15}>
                <Axis name="item" />
                <Tooltip showMarkers={false} />
                <Geom
                  type="interval"
                  x="item"
                  position="item*count"
                  color='item'
                  adjust='stack'
                >
                </Geom>
              </Chart>
            ) : (
              <div className={style[staticFour ? "active" : "active1"]} style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}>
                {intl.get(`bid.bidcommon.view.title.nodata`).d('暂无数据')}
              </div>
            )}
          </Col>
          <Col className={style['affix-menu-divider']} />
        </Row>
      </Fragment>
    );
  }
}
