import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';

const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();

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
                  label={intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号')}
                  name="applyNumber"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`spfmhk.dict.view.field.judge.name`).d('评委名称')} name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`spfmhk.dict.view.field.judge.department`).d('评委部门')} name="judgeUnitCode">
                  <CusLov
                    code="MYLINK.JUDGE_DEPARTMENT"
                    queryParams={{ tenantId: tenantId }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期')} name="applyDateRange">
                  <CusDatePicker.RangePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态')} name="headApplyStatus">
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.APPLICATION.STATUS']}
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
