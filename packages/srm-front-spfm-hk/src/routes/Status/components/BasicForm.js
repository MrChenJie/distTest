import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusButton from '_cus_components/CusButton';
import dayjs from 'dayjs';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class BasicForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this)
    this.state = {
      showMore: true,
      userId: null
    }
  }
  componentDidMount() {
  }

  render() {
    const { form: { getFieldDecorator }, initialValue } = this.props;
    const { showMore } = this.state;

    return (
      <>
        <div className="customize-form">
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.application.num`).d('申请单号')}>
                  {getFieldDecorator('applyNo', {
                    initialValue: initialValue?.head?.applyNo
                  })(<CusInput disabled allowClear/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.request.status`).d('申请状态')}>
                  {getFieldDecorator('applyStatus', {
                    initialValue: initialValue?.head?.applyStatus
                  })(<CusSelect style={{ width: '100%' }}
                                lovCode="HKSP.APPLICATION_STATUS"
                                disabled
                  />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.ApplicationType`).d('申请类型')}>
                  {getFieldDecorator('applyType', {
                    initialValue: 'supplierStatusChange'
                  })(<CusSelect style={{ width: '100%' }}
                                lovCode="HKSP.SUPPLIER_APPLY_TYPE"
                                disabled
                  />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                  {getFieldDecorator('supplierNumber', {
                    initialValue: initialValue?.head?.supplierNumber
                  })(<CusInput disabled allowClear/>)}
                </Form.Item>
              </Col>
              <div style={{ display: showMore ? 'block' : 'none' }}>
                <Col span={12}>
                  <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
                    {getFieldDecorator('companyNameEn', {
                      initialValue: initialValue?.head?.companyNameEn
                    })(<CusInput disabled allowClear/>)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
                    {getFieldDecorator('companyNameCh', {
                      initialValue: initialValue?.head?.companyNameCh
                    })(<CusInput disabled allowClear/>)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get(`${prompt}.field.request.date`).d('申请日期')}>
                    {getFieldDecorator('applyDate', {
                      initialValue: initialValue?.head?.applyDate ? dayjs(initialValue?.head?.applyDate) : dayjs()
                    })(<CusDatePicker style={{ width: '100%' }} disabled/>)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get(`${prompt}.field.changetype`).d('变更类型')}>
                    {getFieldDecorator('changeType', {
                      initialValue: initialValue?.head?.changeType
                    })(<CusSelect style={{ width: '100%' }}
                                  lovCode="HKSP.CHANGE_TYPE"
                                  disabled
                    />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get(`${prompt}.field.modifmethod`).d('变更方式')}>
                    {getFieldDecorator('changeMethod', {
                      initialValue: initialValue?.head?.changeMethod
                    })(<CusSelect style={{ width: '100%' }}
                                  lovCode="HKSP.MODIFY_METHOD"
                                  disabled
                    />)}
                  </Form.Item>
                </Col>
              </div>
              <Col span={24}>
                <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
                  <CusButton type="plain" onClick={() => this.setState({ showMore: !showMore })}>
                    {showMore
                      ? intl.get('hzero.common.button.packUp').d('收起')
                      : intl.get('hzero.common.button.unfold').d('展开')}
                  </CusButton>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    )
  }
}
