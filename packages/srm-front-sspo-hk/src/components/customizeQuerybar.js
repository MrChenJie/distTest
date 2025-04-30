import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Row, Col, Button, Avatar } from 'hzero-ui';

import intl from 'utils/intl';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';

export default (props) => {
  return <QueryBar {...props} key="querybar" />;
};

class QueryBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandFlag: false,
    };
  }

  render() {
    const { queryFields, queryDataSet, queryFieldsLimit = 3, dataSet, buttons } = this.props;
    const { expandFlag } = this.state;
    if (queryDataSet) {
      return (
        <>
          <Row gutter={24}>
            <Col span={24}>
              <Form
                columns={queryFieldsLimit}
                dataSet={queryDataSet}
                useColon
                onKeyDown={(e) => {
                  if (e.nativeEvent && e.nativeEvent.code === 'Enter') {
                    dataSet.query();
                  }
                }}
              >
                {expandFlag ? queryFields : queryFields.slice(0, queryFieldsLimit * 2)}
              </Form>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <div className="custmize-querybar-buttons">
                <Button onClick={() => queryDataSet.current.reset()}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    dataSet.query();
                  }}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                {!expandFlag && (
                  <Button
                    onClick={() => {
                      this.setState({
                        expandFlag: true,
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                )}
                {expandFlag && (
                  <Button
                    onClick={() => {
                      this.setState({
                        expandFlag: false,
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size="small" src={queryResBtn} />
                <span style={{ verticalAlign: 'middle' }}>
                  {intl.get('hzero.common.button.result').d('结果')}
                </span>
              </div>
            </Col>
            <Col span={12} className="customize-buttons">
              {buttons}
            </Col>
          </Row>
        </>
      );
    }
  }
}
