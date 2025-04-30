/*
 * ContractMaintainDetail - 统计图表
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Card, Radio } from 'hzero-ui';
import { Content } from 'components/Page';
// import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import StatisticsShow from '../StatisticsShow'
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['bid.bidcommon'],
})

@connect(({ contractMaintain }) => ({
  contractMaintain,
  statisticsInfo: contractMaintain.statisticsInfo,
}))

export default class Statistics extends PureComponent {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      size: '本周',
      startTime: '',
      endTime: '',
    };
  }

  add0(m) { return m < 10 ? '0' + m : m }
  format(shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    let time = new Date(shijianchuo);
    let y = time.getFullYear();
    let m = time.getMonth() + 1;
    let d = time.getDate();
    return y + '-' + this.add0(m) + '-' + this.add0(d);
  }

  onChange = (e) => {
    this.setState({ size: e.target.value });
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    if (month === 0) {
        month = 12;
        year = year - 1;
    } else if (month < 10) {
        month = '0' + month;
    }
    // 获取本周开始和结束时间
    let nowTime = now.getTime();
    let day = now.getDay();
    let oneDayTime = 24 * 60 * 60 * 1000;
    let MondayTime = nowTime - (day - 1) * oneDayTime; //显示周一
    let SundayTime = nowTime + (7 - day) * oneDayTime; //显示周日
    let monday = new Date(MondayTime);
    let sunday = new Date(SundayTime);
    let startMonday = year + '-' + (monday.getMonth() + 1) + '-' + monday.getDate();
    let ensSunday = year + '-' + (sunday.getMonth() + 1) + '-' + sunday.getDate();
    console.log('本周',startMonday,ensSunday)

    // 获取上⼀周的开始和结束时间
    let weekDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);// 计算开始时间⽤
    let weekDate2 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);// 计算结束时间⽤
    let weekday = weekDate.getDay();
    let time = weekDate.getDate() - weekday + (weekday === 0 ? -6 : 1);
    let startDate = new Date(weekDate.setDate(time));
    let beginTime = startDate.getFullYear() + '-'+ (startDate.getMonth() + 1) + '-' + startDate.getDate();
    let endDate = new Date(weekDate2.setDate(time + 6));
    let endDayTime = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
    console.log('上⼀周',beginTime,endDayTime)

    // 获取本⽉的开始和结束时间
    let myDate1 = new Date(year, month, 1);
    let myDate2 = new Date(year, month + 1, 0);
    let theMonthStart = year + '-' + (myDate1.getMonth() + 1) + myDate1.getDate();
    let theMonthEnd = year + '-' + (myDate2.getMonth() + 1) + '-' + myDate2.getDate();
    console.log('本⽉',theMonthStart,theMonthEnd)

    // 获取上⼀⽉的开始和结束时间
    let monthDate = new Date(year, month, 0);
    let beginMonthTime = year + '-' + month + '-01';
    let endMonthTime = year + '-' + month + '-' + monthDate.getDate();
    console.log('上⼀⽉',beginMonthTime,endMonthTime)
    
    if (e.target.value == '本周') {
      this.setState(
        {
          startTime: startMonday,
          endTime: ensSunday,
        }
      )
    }
    if (e.target.value == '上周') {
      this.setState(
        {
          startTime: beginTime,
          endTime: endDayTime,
        }
      )
    }
    if (e.target.value == '本月') {
      this.setState(
        {
          startTime: theMonthStart,
          endTime: theMonthEnd,
        }
      )
    }
    if (e.target.value == '上月') {
      this.setState(
        {
          startTime: beginMonthTime,
          endTime: endMonthTime,
        }
      )
    }
  }

  render() {
    const { fetchRulePercentageLoading, contractMaintain } = this.props;
    const { size, startTime, endTime } = this.state;
    const statistisTimes = { startTime, endTime }
    return (
      <Fragment>
        <Content>
          <Card
            loading={fetchRulePercentageLoading}
            title={intl.get(`bid.projectplantab.view.title.projectplantab`).d('项目进度统计表')}
          >
            <Radio.Group value={size} onChange={this.onChange} style={{ marginBottom: 16 }}>
              <Radio.Button value="本周">{intl.get(`bid.bidcommon.view.title.thisweek`).d('本周')}</Radio.Button>
              <Radio.Button value="上周">{intl.get(`bid.bidcommon.view.title.lastweek`).d('上周')}</Radio.Button>
              <Radio.Button value="本月">{intl.get(`bid.bidcommon.view.title.thismonth`).d('本月')}</Radio.Button>
              <Radio.Button value="上月">{intl.get(`bid.bidcommon.view.title.lastmonth`).d('上月')}</Radio.Button>
            </Radio.Group>
            <StatisticsShow {...statistisTimes}></StatisticsShow>
          </Card>
        </Content>
      </Fragment>
    );
  }
}
