import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Row, Col, Button, Divider, Tag } from 'hzero-ui';

import intl from 'utils/intl';

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
              <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
                {expandFlag ? queryFields : queryFields.slice(0, queryFieldsLimit * 2)}
              </Form>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <div className="custmize-querybar-buttons" style={{ textAlign: 'right' }}>
                <Button
                  onClick={() => queryDataSet.current.reset()}
                >
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
                {queryFields.length > 6 && !expandFlag && (
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
                {queryFields.length > 6 && expandFlag && (
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
          <Row>
            <div style={{ marginBottom: '15px' }}>{buttons}</div>
          </Row>
        </>
      );
    }
  }
}
