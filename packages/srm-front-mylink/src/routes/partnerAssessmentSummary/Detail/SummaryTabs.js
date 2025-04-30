import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import CusButton from '_cus_components/CusButton';
import DetailList from './DetailList';

export default class SummaryTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      handleSummaryExport = (e) => e,
      handleWithdrawalRequest = (e) => e,
    } = this.props;
    const {} = this.state;

    const detailListProps = {
      ...this.props,
      tabsTag: 'summary',
    };
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: intl.get(`spfmhk.mylink.field.score.tips`).d('A级：90≤总平均分≤100</br>B级：75≤总平均分＜90</br>C级：60≤总平均分＜75</br>D级：总平均分＜60') }}></div>
        <div style={{margin: '16px 0', textAlign: 'right'}}>
          <CusButton
            mini
            onClick={handleWithdrawalRequest}
          >
            {intl.get(`spfmhk.mylink.button.exit.apply`).d('退出申请')}
          </CusButton>
          <CusButton
            mini
            onClick={handleSummaryExport}
          >
            {intl.get(`spfmhk.mylink.button.export`).d('导出')}
          </CusButton>
        </div>
        <div style={{marginBottom: '16px'}}>
          <DetailList {...detailListProps} />
        </div>
      </>
    )
  }
}