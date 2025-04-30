import React, { PureComponent } from 'react';
import { Row, Col, Radio } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusUpload from '_cus_components/CusUpload';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

const RadioGroup = Radio.Group;

const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class DeliveryForm extends PureComponent {

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  @Bind()
  filterFieldValue(data, fieldName) {
    if (data?.delivery?.deliveryInfo?.length > 0) {
      if (data?.delivery?.deliveryInfo?.find(i => i.revScoreItem === fieldName)?.isScore === 'N') {
        return 'N/A';
      } else {
        return (data?.delivery?.deliveryInfo?.find(i => i.revScoreItem === fieldName)?.score)?.toString();
      }
    } else {
      return undefined;
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      questionOneOptions,
      tenantId,
      evaluationDetail,
      disabled
    } = this.props;

    return (
      <Form className="customize-form">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${prompt}.list.Assess.questionTwo`, {
                num: '1'
              }).d('1. 送货表现（指定日期送货)')}
            >
              {getFieldDecorator('deliveryPerformance', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.list.Assess.questionTwo`, {
                          num: '1'
                        })
                        .d('1. 送货表现（指定日期送货)'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'deliveryPerformance'),
              })(
                <RadioGroup>
                  {questionOneOptions.map((i) => (
                    <Radio
                      disabled={disabled}
                      style={{ marginRight: 16 }}
                      value={i.value}
                      key={uuid()}
                    >
                      {i.label}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.receview.advice`).d('收货人评估意见')}>
              {getFieldDecorator('deliveryDepSug', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.receview.advice`).d('收货人评估意见'),
                    }),
                  },
                ],
                initialValue: evaluationDetail?.revHead?.deliveryDepSug,
              })(<CusInput.TextArea disabled={disabled} autoSize={{ minRows: 2, maxRows: 6 }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.recipient.score`).d('收货人打分')}>
              {getFieldDecorator('mulDeliveryScore', {
                initialValue: evaluationDetail?.revHead?.mulDeliveryScore,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.attachment.placeHolder`).d('附件')}>
              {getFieldDecorator('attachmentUuid', {
                initialValue: evaluationDetail?.delivery?.deliveryAttach?.attachmentUuid || uuid(),
              })(
                <CusUpload
                  viewOnly={disabled}
                  filePreview
                  bucketName="private-bucket"
                  tenantId={tenantId}
                  attachmentUUID={
                    evaluationDetail?.delivery?.deliveryAttach?.attachmentUuid
                      ? evaluationDetail?.delivery?.deliveryAttach?.attachmentUuid
                      : this.props?.form?.getFieldValue('attachmentUuid')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
