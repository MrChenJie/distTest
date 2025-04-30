import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';

const gridSpan = getLFormGridSpan();

const prompt = 'spfmhk.mylink';

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {};
  }

  form = React.createRef();

  handleReset = () => {
    this.form.current?.resetFields();
    this.props.onSearch();
  };

  render() {
    const { onSearch = (e) => e, idpValueMap } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <GenerateSearchFormGrid onQuery={onSearch} onReset={this.handleReset}>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.cooperate.mode`).d('合作模式')}
                  name="partnerMode"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.filed.review.no`).d('评估单号')}
                  name="evalNo"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.review.year`).d('评估年度')}
                  name="evalYear"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.evaluate.status`).d('评估状态')}
                  name="evalStatus"
                >
                   <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER_EVAL_STATUS']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.review.period`).d('评估周期')}
                  name="evalPeriod"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER_EVAL_PERIOD']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.review.date`).d('评估日期')}
                  name="evalDateRange"
                >
                  <CusDatePicker.RangePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
