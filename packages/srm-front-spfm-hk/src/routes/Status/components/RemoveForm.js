import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusUpload from '_cus_components/CusUpload';
import uuid from 'uuid/v4';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class RemoveForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      tenantId,
      initialValue,
      disabled = true,
    } = this.props;

    return (
      <>
        <div className='customize-form'>
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
                      },
                    ],
                    initialValue: initialValue?.head?.eventMeaning,
                  })(<CusInput trimAll typeCase='lower' allowClear disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.SpecificOccurrencePeriod`).d('具体发生期间')}>
                  {getFieldDecorator('occurMeaning', {
                    initialValue: initialValue?.head?.occurMeaning,
                  })(<CusInput style={{ width: '100%' }} disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.FromDisabledDate`).d('禁用日期起')}>
                  {getFieldDecorator('blackStartTime', {
                    initialValue: initialValue?.head?.blackStartTime ? dayjs(initialValue?.head?.blackStartTime) : undefined,
                  })(<CusDatePicker disabled style={{ width: '100%' }} onChange={(e) => {
                    if (e) {
                      setFieldsValue({
                        blackEndTime: dayjs(e).add(3, 'year'),
                      });
                    } else {
                      setFieldsValue({
                        blackEndTime: null,
                      });
                    }
                  }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.DisableDateTo`).d('禁用日期至')}>
                  {getFieldDecorator('blackEndTime', {
                    initialValue: initialValue?.head?.blackEndTime ? dayjs(initialValue?.head?.blackEndTime) : undefined,
                  })(<CusDatePicker style={{ width: '100%' }} disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.DelistedTimes`).d('已除名次数')}>
                  {getFieldDecorator('delistingNum', {
                    initialValue: initialValue?.head?.delistingNum,
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.remarks`).d('备注')}>
                  {getFieldDecorator('backup', {
                    initialValue: initialValue?.head?.backup,
                  })(<CusInput.TextArea autoSize={{ minRows: 2, maxRows: 6 }} disabled={disabled} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.list.basic.info.attachment`).d('附件')}>
                  {getFieldDecorator('attachmentUuid', {
                    initialValue: initialValue?.attach?.attachmentUuid || uuid(),
                  })(<CusUpload
                    viewOnly={disabled}
                    filePreview
                    bucketName='private-bucket'
                    tenantId={tenantId}
                    attachmentUUID={initialValue?.attach?.attachmentUuid ? initialValue?.attach?.attachmentUuid : this.props?.form?.getFieldValue('attachmentUuid')}
                  />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
