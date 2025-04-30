import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusUpload from '_cus_components/CusUpload';

const prompt = 'spfmhk.supplier';
const screenWidth = window.screen.width;
import uuid from 'uuid/v4';
import dayjs from 'dayjs';

@Form.create()
export default class StatusForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const { form: { getFieldDecorator, setFieldsValue }, tenantId, initialValue, disabled } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.EventInvolved`).d('涉及事件')}>
                  {getFieldDecorator('event', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.EventInvolved`).d('涉及事件'),
                        }),
                      }
                    ],
                    initialValue: initialValue?.head?.event
                  })(<CusInput trimAll typeCase="lower" allowClear disabled={disabled}/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.SpecificOccurrencePeriod`).d('具体发生期间')}>
                  {getFieldDecorator('occur', {
                    initialValue: initialValue?.head?.occur
                  })(<CusInput style={{ width: '100%' }} disabled={disabled}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.FromDisabledDate`).d('禁用日期起')}>
                  {getFieldDecorator('blackStartTime', {
                    initialValue: initialValue?.head?.blackStartTime ? dayjs(initialValue?.head?.blackStartTime) : undefined
                  })(<CusDatePicker disabled={disabled} style={{ width: '100%' }} onChange={(e) => {
                    if(e) {
                      setFieldsValue({
                        blackEndTime: dayjs(e).add(3, 'year')
                      })
                    } else {
                      setFieldsValue({
                        blackEndTime: null
                      })
                    }
                  }}/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.DisableDateTo`).d('禁用日期至')}>
                  {getFieldDecorator('blackEndTime', {
                    initialValue: initialValue?.head?.blackEndTime ? dayjs(initialValue?.head?.blackEndTime) : undefined
                  })(<CusDatePicker style={{ width: '100%' }} disabled/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.CausesOfBlackout`).d('拉黑原因')}>
                  {getFieldDecorator('reason', {
                    initialValue: initialValue?.head?.reason
                  })(<CusInput.TextArea autoSize={{ minRows: 2, maxRows: 6 }} disabled={disabled}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.remarks`).d('备注')}>
                  {getFieldDecorator('backup', {
                    initialValue: initialValue?.head?.backup
                  })(<CusInput.TextArea autoSize={{ minRows: 2, maxRows: 6 }} disabled={disabled}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.list.basic.info.attachment`).d('附件')}>
                  {getFieldDecorator('attachmentUuid', {
                    initialValue: initialValue?.attch?.attachmentUuid
                  })(<CusUpload
                    viewOnly={disabled}
                    filePreview
                    bucketName="private-bucket"
                    tenantId={tenantId}
                    attachmentUUID={initialValue?.attch?.attachmentUuid ? initialValue?.attch?.attachmentUuid : uuid()}
                  />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    )
  }
}
