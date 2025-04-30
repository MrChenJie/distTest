import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId,getCurrentUser } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Form } from 'hzero-ui';

const commonPrompt = 'spfmhk.dict';
const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();
@Form.create()
export default class QaForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleReset = () => {
    this.form.current?.resetFields();
  };

  render() {
    const {
      idpValueMap,
      form,
      partnerInfo = {},
      dataSource
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.common.partnername`).d('合作伙伴名称')}
                name="partnerName"
              >
                {getFieldDecorator('partnerName', {
                  initialValue: partnerInfo.partnerName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.cooperationmode`).d('合作模式')}
                name="partnerModeMeaning"
              >
                {getFieldDecorator('partnerModeMeaning', {
                  initialValue: partnerInfo.partnerModeMeaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portalreplystatus`).d('回复状态')}
                name="replyStatus"
              >
                {getFieldDecorator('replyStatus', {
                  initialValue: partnerInfo.replyStatus,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.QUESTION_REPLY_STATUS']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.title.user`).d('业务员')} name="salesman">
                {getFieldDecorator('salesman', {
                  initialValue: partnerInfo.salesmanMeaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
