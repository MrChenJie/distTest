import React from 'react';
import { Form, Col } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';

const prompt = 'spfm.bmpApproveError';
const gridSpan = getLFormGridSpan();

export default class FilterForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef && onRef(this);
  }
  form = React.createRef();

  handleReset = () => {
    this.form?.current?.resetFields();
  };

  render() {
    const { idpValueMap, onSearch = (e) => e } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <GenerateSearchFormGrid onQuery={onSearch} onReset={this.handleReset}>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.formRecordId`).d('单据数据ID')}
                  name="formRecordId"
                >
                  <CusInput />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.dataType`).d('通知事件类型')}
                  name="dataType"
                >
                  <CusSelect allowClear options={idpValueMap['SPFM.BPM_DATA_TYPE']} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.caseId`).d('流程实例ID')}
                  name="caseId"
                >
                  <CusInput />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.templateCode`).d('流程模板')}
                  name="templateCode"
                >
                  <CusSelect allowClear options={idpValueMap['SPFM.BPM_TEMPLATE_CODE']} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.processDateFrom`).d('处理日期从')}
                  name="processDateFrom"
                >
                  <CusDatePicker />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.processDateTo`).d('处理日期至')}
                  name="processDateTo"
                >
                  <CusDatePicker />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.processStatus`).d('处理状态')}
                  name="processStatus"
                >
                  <CusSelect allowClear options={idpValueMap['SPFM.PROCESS_STATUS']} />
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
