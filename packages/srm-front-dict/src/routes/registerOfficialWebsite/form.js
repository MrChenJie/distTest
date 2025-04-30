/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-04 13:56:55
 */
import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getLFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusMultiLov from '_cus_components/CusMultiLov';
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

  @Bind()
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
                  label={intl.get(`${prompt}.view.field.companyname`).d('公司名称')}
                  name="cmpanyName"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.cooperationmode`).d('合作模式')}
                  name="modeNoticeId"
                >
                  <CusSelect
                    lovCode="DICT.MODE_NOTICE_REGISTER"
                    mode="multiple"
                    maxTagCount="responsive"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.recruitmentmethod`).d('招募方式')}
                  name="source"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.RECUITMENT_METHOD']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl
                    .get(`${prompt}.view.search.officialWebsiteRegistrationDate`)
                    .d('官网报名日期')}
                  name="registrationDate"
                >
                  <CusDatePicker.RangePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.search.systemautomaticreview`).d('系统自动审核')}
                  name="isSuccess"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.AUTO_CHECK_REGISTETR']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.search.doestheportalsubmit`).d('门户是否提交')}
                  name="portalSubmit"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.PORTAL_SUBMIT_CHECK']}
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
