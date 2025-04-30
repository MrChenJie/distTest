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
const promptCode = 'HKPC.commom';
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {};
  }

  form = React.createRef();

  handleReset = () => {
    this.form.current?.resetFields();
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
                  label={intl.get(`${promptCode}.view.title.applicationformno`).d('申请单编号')}
                  name="laNumber"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.applicaitonformname`).d('申请单名称')}
                  name="laName"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
                  name="applyUserName"
                >
                  <CusLov
                    code="HKSP.PORTAL_PURCHASERR"
                    lovOptions={{ displayField: 'employeeName', valueField: 'employeeName' }}
                    queryParams={{ tenantId }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.propertyno`).d('主体编号')}
                  name="storeNumber"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.view.title.leasestartdatefrom`)
                    .d('租赁开始日期从')}
                  name="leaseStartDateFrom"
                >
                  <CusDatePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.view.title.leasestartdateto`).d('租赁开始日期至')}
                  name="leaseStartDateTo"
                >
                  <CusDatePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>

              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.leaseenddatefrom`).d('租赁结束日期从')}
                  name="leaseEndDateFrom"
                >
                  <CusDatePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.leaseenddateto`).d('租赁结束日期至')}
                  name="leaseEndDateTo"
                >
                  <CusDatePicker format={DEFAULT_DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.formstate`).d('单据状态')}
                  name="status"
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKPC.FORM_STATUS']}
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
