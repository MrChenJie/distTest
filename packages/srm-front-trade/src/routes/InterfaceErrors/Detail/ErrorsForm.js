import React from 'react';
import { Form, Row, Col, Input } from 'antd';
import intl from 'utils/intl';

const { TextArea } = Input;
const prompt = 'spub.interfaceErrors';

export default class ErrorsForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }
  errorsForm = React.createRef();

  render() {
    return (
      <div className="customize-form">
        <Form name="errors" ref={this.errorsForm} disabled>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${prompt}.view.errors.stacktrace`).d('异常信息')}
                wrapperCol={{ span: 24 }}
                name="stacktrace"
                className="ant-label-textArea"
              >
                <TextArea autoSize={{ minRows: 6, maxRows: 6 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
