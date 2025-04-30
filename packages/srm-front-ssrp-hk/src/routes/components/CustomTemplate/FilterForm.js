import React from 'react';
import { Form, InputNumber, Row, Col } from 'antd';
import intl from 'utils/intl';

import { mediumScreenWidth } from '_cus_utils/constants';

const prompt = 'spcm.customTemplate';
const screenWidth = window.screen.width;

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }
  form = React.createRef();

  render() {
    const { isEdit } = this.props;
    return (
      <>
        <div className="customize-info-message">
          {intl.get(`${prompt}.custom.evaluationScore.tips`).d('评估分数必须填入0-100之间，保留小数点后面两位小数。')}
        </div>
        <Form ref={this.form} className="customize-form">
          <Row>
            <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
              <Form.Item
                label={intl.get(`${prompt}.view.query.evaluationScore`).d('评估分数')}
                name="evaluationScore"
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.query.evaluationScore`).d('评估分数'),
                    }),
                  }
                ]}
              >
                <InputNumber min={0} max={100} precision={2} disabled={!isEdit} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    )
  }
}
