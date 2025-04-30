import React from 'react';
import { Row, Col } from 'antd';
import CusInfoItem from '_cus_components/CusInfoItem';
import CusButton from '_cus_components/CusButton';

import DetailList from './DetailList';

export default class OtherTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      partnerAssessmentSummaryModal,
      handleOtherExport = (e) => e,
    } = this.props;
    const { evalNo } = partnerAssessmentSummaryModal;
    const {} = this.state;

    const detailListProps = {
      ...this.props,
    };
    return (
      <>
        <div style={{display: 'flex', justifyContent:'space-between', marginBottom: '10px'}}>
          <div style={{flex: 1}}>
            <Row>
              <Col span={8}>
                <CusInfoItem
                  label={intl.get(`spfmhk.mylink.filed.review.no`).d('评估单号')}
                  value={evalNo}
                />
              </Col>
            </Row>
          </div>
          <CusButton
            mini
            onClick={handleOtherExport}
          >
            {intl.get(`spfmhk.mylink.button.detail.export`).d('详情导出')}
          </CusButton>
        </div>
        <DetailList {...detailListProps} />
      </>
    )
  }
}