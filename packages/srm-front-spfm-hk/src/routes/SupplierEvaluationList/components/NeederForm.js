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
export default class NeederForm extends PureComponent {

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  @Bind()
  filterFieldValue(data, fieldName) {
    if (data?.demand?.demandInfo?.length > 0) {
      if (data?.demand?.demandInfo?.find(i => i.revScoreItem === fieldName)?.isScore === 'N') {
        return 'N/A';
      } else {
        return (data?.demand?.demandInfo?.find(i => i.revScoreItem === fieldName)?.score)?.toString();
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
              label={intl.get(`${prompt}.list.Assess.questionOne`, {
                num: '1'
              }).d('1. 品质(产品/服务表现)')}
            >
              {/*<Form.Item label={intl.get(`${prompt}.list.Assess.questionTEST`).d('打分标题测试')}>*/}
              {getFieldDecorator('quality', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.list.Assess.questionOne`, {
                          num: '1'
                        })
                        .d('1. 品质(产品/服务表现)'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'quality'),
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
              label={intl
                .get(`${prompt}.list.Assess.questionThree`, {
                  num: '2'
                })
                .d('2. 订单价格表现(价格具竞争性/保持稳定性/即省成本建议)')}
            >
              {getFieldDecorator('pricePerformance', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.list.Assess.questionThree`, {
                          num: '2'
                        })
                        .d('2. 订单价格表现(价格具竞争性/保持稳定性/即省成本建议)'),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(evaluationDetail, 'pricePerformance'),
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
              label={intl
                .get(`${prompt}.list.Assess.questionFour`, {
                  num: '3'
                })
                .d(
                  '3. 售后服务及技术/维修服务支援(能提供保质期内的承诺/快捷及及时的支援/解决问题能力及专业技能)'
                )}
            >
              {getFieldDecorator('afterSalesServiceAndTechnicalOrRepairServiceSupport', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.list.Assess.questionFour`, {
                          num: '3'
                        })
                        .d(
                          '3. 售后服务及技术/维修服务支援(能提供保质期内的承诺/快捷及及时的支援/解决问题能力及专业技能)'
                        ),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(
                  evaluationDetail,
                  'afterSalesServiceAndTechnicalOrRepairServiceSupport'
                ),
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
              label={intl
                .get(`${prompt}.list.Assess.questionNine`, {
                  num: '4'
                })
                .d(
                  '4. 订单及合同履行情况'
                )}
            >
              {getFieldDecorator('orderAndContractFulfillment', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.list.Assess.questionNine`, {
                          num: '4'
                        })
                        .d(
                          '4. 订单及合同履行情况'
                        ),
                    }),
                  },
                ],
                initialValue: this.filterFieldValue(
                  evaluationDetail,
                  'orderAndContractFulfillment'
                ),
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
            <Form.Item label={intl.get(`${prompt}.list.basic.info.comments`).d('其他意见(必填)')}>
              {getFieldDecorator('requireDepSug', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.list.basic.info.comments`).d('其他意见(必填)'),
                    }),
                  },
                ],
                initialValue: evaluationDetail?.revHead?.requireDepSug,
              })(<CusInput.TextArea disabled={disabled} autoSize={{ minRows: 2, maxRows: 6 }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.demandepart.score`).d('需求部得分')}>
              {getFieldDecorator('mulDemanderScore', {
                initialValue: evaluationDetail?.revHead?.mulDemanderScore,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.attachment.placeHolder`).d('附件')}>
              {getFieldDecorator('attachmentUuid', {
                initialValue: evaluationDetail?.demand?.demandAttach?.attachmentUuid || uuid(),
              })(
                <CusUpload
                  viewOnly={disabled}
                  filePreview
                  bucketName="private-bucket"
                  tenantId={tenantId}
                  attachmentUUID={
                    evaluationDetail?.demand?.demandAttach?.attachmentUuid
                      ? evaluationDetail?.demand?.demandAttach?.attachmentUuid
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
