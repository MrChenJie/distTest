import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import formatterCollections from 'utils/intl/formatterCollections';

const gridSpan = getLFormGridSpan();
const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
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
                  label={intl.get(`${prompt}.view.field.reviewno`).d('评审单号')}
                  name="reviewNum"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.companynameen`).d('公司名称（英文）')}
                  name="cmpanyNameEn"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.companynamecn`).d('公司名称（中文）')}
                  name="cmpanyNameCh"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.registrationdate`).d('报名日期')}
                  name="registerDate"
                >
                  <CusDatePicker.RangePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.reviewsatatus`).d('评审状态')}
                  name="reviewStatus"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.REVIEW_APPLICATION_STATUS']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.recruitmentmethod`).d('招募方式')}
                  name="recruitmentMethod"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.RECUITMENT_METHOD']}
                  />
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
