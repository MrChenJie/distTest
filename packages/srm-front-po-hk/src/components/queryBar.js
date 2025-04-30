import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Row, Col } from 'hzero-ui';

import styles from './customizeQuerybar.less';

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
    const { queryFields, queryDataSet, queryFieldsLimit = 1, dataSet, buttons } = this.props;
    const { expandFlag } = this.state;
    if (queryDataSet) {
      return (
        <div className={styles['c7nQueryBarStyle']}>
          <Row style={{ display: 'flex', alignItems: 'center' }}>
            <Col span={6}>
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
                {queryFields}
              </Form>
            </Col>
            <Col span={18}>
              {buttons}
            </Col>
          </Row>
        </div>
      );
    }
  }
}
