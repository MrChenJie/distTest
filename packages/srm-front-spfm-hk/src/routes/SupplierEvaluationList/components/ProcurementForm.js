import React, { PureComponent } from 'react';
import { Row, Col, Radio } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusUpload from '_cus_components/CusUpload';
import CusInputNumber from '_cus_components/CusInputNumber';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

const RadioGroup = Radio.Group;

const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class ProcurementForm extends PureComponent {

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  @Bind()
  filterFieldValue(data, fieldName) {
    if (data?.procure?.procureInfo?.length > 0) {
      if (data?.procure?.procureInfo?.find(i => i.revScoreItem === fieldName)?.isScore === 'N') {
        return 'N/A';
      } else {
        return (data?.procure?.procureInfo?.find(i => i.revScoreItem === fieldName)?.score)?.toString();
      }
    } else {
      return undefined;
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      questionOneOptions,
      tenantId,
      evaluationDetail,
      disabled
    } = this.props;

    return (
      <Form className="customize-form">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.list.Assess.questionFive`, {
              num: '1'
            }).d('1. 售前服务')}>
              {getFieldDecorator('preSalesServices', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.Assess.questionFive`, {
                        num: '1'
                      }).d('1. 售前服务'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'preSalesServices'),
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
            <Form.Item label={intl.get(`${prompt}.list.Assess.questionSix`, {
              num: '2'
            }).d('2. 价格表现')}>
              {getFieldDecorator('poPricePerformance', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.Assess.questionSix`, {
                        num: '2'
                      }).d('2. 价格表现'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'poPricePerformance'),
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
            <Form.Item label={intl.get(`${prompt}.list.Assess.questionSeven`, {
              num: '3'
            }).d('3. 财务稳健')}>
              {getFieldDecorator('poPaymentTerms', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.Assess.questionSeven`, {
                        num: '3'
                      }).d('3. 财务稳健'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'poPaymentTerms'),
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
            <Form.Item label={intl.get(`${prompt}.list.Assess.questionEight`, {
              num: '4'
            }).d('4. 一般合同条款')}>
              {getFieldDecorator('contractGovernance', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.Assess.questionEight`, {
                        num: '4'
                      }).d('4. 一般合同条款'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'contractGovernance'),
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
            <Form.Item label={intl.get(`${prompt}.list.Assess.questionTen`, {
              num: '5'
            }).d('5. 商业信誉和合作关系')}>
              {getFieldDecorator('businessReputationAndPartnership', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.Assess.questionTen`, {
                        num: '5'
                      }).d('5. 商业信誉和合作关系'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'businessReputationAndPartnership'),
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
            <Form.Item
              label={intl.get(`${prompt}.view.table.ProtReviewComment`).d('采购部评估意见')}
            >
              {getFieldDecorator('prDepSug', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.table.ProtReviewComment`).d('采购部评估意见'),
                    }),
                  },
                ],
                initialValue: evaluationDetail?.revHead?.prDepSug,
              })(<CusInput.TextArea disabled={disabled} autoSize={{ minRows: 2, maxRows: 6 }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`${prompt}.view.table.totalSore`).d('总得分')}>
              {getFieldDecorator('mulProcureScore', {
                initialValue: evaluationDetail?.revHead?.mulProcureScore,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`${prompt}.field.assessment.level`).d('单据等级')}>
              {getFieldDecorator('revHeadGrade', {
                initialValue: evaluationDetail?.revHead?.revHeadGrade,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.attachment.placeHolder`).d('附件')}>
              {getFieldDecorator('attachmentUuid', {
                initialValue: evaluationDetail?.procure?.procureAttach?.attachmentUuid || uuid(),
              })(
                <CusUpload
                  viewOnly={disabled}
                  filePreview
                  bucketName="private-bucket"
                  tenantId={tenantId}
                  attachmentUUID={
                    evaluationDetail?.procure?.procureAttach?.attachmentUuid
                      ? evaluationDetail?.procure?.procureAttach?.attachmentUuid
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
