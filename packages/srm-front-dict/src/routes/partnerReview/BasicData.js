import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Form } from 'hzero-ui';

const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();
const commonPrompt = 'spfmhk.dict';

@Form.create()
export default class BasicData extends React.Component {
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
    } = this.props;

    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.reviewno`).d('评审单号')}
                name="applyNum"
              >
                {getFieldDecorator('partnerName', {
                  initialValue: partnerInfo.applyNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.wayofintitatereview`).d('发起评审方式')}
                name="startAppraisalWay"
              >
                {getFieldDecorator('startAppraisalWay', {
                  initialValue: partnerInfo.startAppraisalWay,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.START_APPRAISAL_WAY']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.initiator`).d('发起人')} name="startAppraisalMan">
                {getFieldDecorator('startAppraisalMan', {
                  initialValue: partnerInfo.startAppraisalMan,
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.reviewdate`).d('发起评审日期')}
                name="startAppraisalDate"
              >
                {getFieldDecorator('startAppraisalDate', {
                  initialValue: partnerInfo.startAppraisalDate?.slice(0,10),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.reviewsatatus`).d('评审状态')} name="partnerStatus">
                {getFieldDecorator('partnerStatus', {
                  initialValue: partnerInfo.partnerStatus,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.REVIEW_APPLICATION_STATUS']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.partnercategory`).d('合作伙伴类别')} name="partnerStatus">
                {getFieldDecorator('partnerCategory', {
                  initialValue: partnerInfo.partnerCategory,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER_CATEGORY']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
