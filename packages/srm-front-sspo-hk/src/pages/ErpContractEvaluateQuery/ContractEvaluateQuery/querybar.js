import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Row, Col, Button } from 'hzero-ui';

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
            <Col span={24} style={{ textAlign: 'right' }}>
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
              </div>
            </Col>
          </Row>
          <Row style={{ marginBottom: '15px' }}>{buttons}</Row>
        </>
      );
    }
  }
}
