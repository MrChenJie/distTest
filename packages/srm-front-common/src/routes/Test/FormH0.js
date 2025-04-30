import React from 'react';
import { Input, Row, Col, Cascader, InputNumber, Checkbox, Radio } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusQueryButtons from '@/components/CusButton/CusQueryButtons';
import { getDateTimeFormat } from 'utils/utils';
import CusLov from '@/components/CusLov';
import CusMultiLov from '@/components/CusMultiLov';
import CusInputLov from '@/components/CusInputLov';
import CusDatePicker from '@/components/CusDatePicker';
import CusSelect from '@/components/CusSelect';
import CusCascader from '@/components/CusCascader';
import CusInput from '@/components/CusInput';
import { getLFormGridSpan } from '@/utils/utils';

const prompt = 'spfm.interfaceErrors';
const dateTimeFormat = getDateTimeFormat();
const { SHOW_CHILD } = Cascader;
const screenWidth = window.screen.width;

@Form.create()
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this.props);

    this.state = {
      isShowMore: false,
    }
  }

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields();
  }

  render() {
    const { onSearch = (e) => e, idpValueMap, form } = this.props;
    const { isShowMore } = this.state;
    const options = [
      {
        label: 'Light',
        value: 'light',
        children: new Array(20).fill(null).map((_, index) => ({
          label: `Number ${index}`,
          value: index,
        })),
      },
      {
        label: 'Bamboo',
        value: 'bamboo',
        children: [
          {
            label: 'Little',
            value: 'little',
            children: [
              {
                label: 'Toy Fish',
                value: 'fish',
              },
              {
                label: 'Toy Cards',
                value: 'cards',
              },
              {
                label: 'Toy Bird',
                value: 'bird',
              },
            ],
          },
        ],
      },
    ];
    const filter = (inputValue, path) =>
      path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    const { getFieldDecorator } = form;
    const isEdit = false;
    const gridSpan = getLFormGridSpan();
    return (
      <>
        <div className="customize-form">
          <Form>
            <Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.clientId`).d('客户端ID')}
                >
                  {getFieldDecorator('clientId', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusInput disabled={isEdit} trimAll inputChinese={false} typeCase="lower" tip="test" allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.invokeKey`).d('请求ID')}
                >
                  {getFieldDecorator('invokeKey', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusCascader
                      disabled={isEdit}
                      options={options}
                      multiple
                      maxTagCount="responsive"
                      showCheckedStrategy={Cascader.SHOW_PARENT}
                      showSearch={{
                        filter,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.serverCode`).d('服务代码')}
                >
                  {getFieldDecorator('serverCode')(
                    <Input disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: isShowMore ? 'block' : 'none' }}>
              <Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.serverName`).d('服务名称')}
                >
                  {getFieldDecorator('serverName', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusSelect
                      allowClear
                       disabled={isEdit}
                      options={idpValueMap['SPFM.SANCTIONS_TYPE']}
                      tip={
                        <>
                          <div>
                            {intl
                              .get(`${prompt}.view.list.sanctionsType.tips`)
                              .d('SDN List 限制事項：禁止与SDN 列表中的客户或供应商开展业务。')}
                          </div>
                          <div>
                            {intl
                              .get(`${prompt}.view.list.sanctionsType.tips1`)
                              .d('实体名单限制事項：不允许向实体名单下的客户出售任何具有美国技术硬件，软件或物品。')}
                          </div>
                        </>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceUrl`).d('第三方接口地址')}
                >
                  {getFieldDecorator('interfaceUrl')(
                    <Input  disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceCode`).d('接口编码')}
                >
                  {getFieldDecorator('interfaceCode')(
                    <Input  disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
              </Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceName`).d('接口名称')}
                >
                  {getFieldDecorator('interfaceName', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <Input.TextArea  disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceTime`).d('接口时间')}
                >
                  {getFieldDecorator('interfaceTime', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusDatePicker disabled={isEdit} tip="test" />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceTime`).d('接口个数')}
                >
                  {getFieldDecorator('interfaceNumber', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <InputNumber disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
              <Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试')}
                >
                  {getFieldDecorator('multiLovMeaning', {
                    initialValue: 'AED',
                  })}
                  {getFieldDecorator('multiLov', {
                    initialValue: '34',
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusLov
                      code="SSLM.COST_SUPPLIER_INFO"
                      textField="multiLovMeaning"
                       disabled={isEdit}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试1')}
                >
                  {getFieldDecorator('inputLov', {
                    initialValue: 'CHY',
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusInputLov
                      isInput
                      code="HPFM.CURRENCY"
                       disabled={isEdit}
                      lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试2')}
                  wrapperCol={{ span: 24 }}
                  name="treeLov"
                >
                  {getFieldDecorator('treeLov', {
                    rules: [{
                      required: true,
                    }],
                  })(
                    <CusMultiLov
                      code="SMDM.TREE_ITEM_CATEGORY"
                       disabled={isEdit}
                    />
                  )}
                </Form.Item>
              </Col>
              </Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.CheckBox`).d('CheckBox')}
                >
                  {getFieldDecorator('checkBox', {
                    valuePropName: 'checked',
                  })(
                    <Checkbox disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.Radio`).d('Radio')}
                >
                  {getFieldDecorator('radio')(
                    <Radio  disabled={isEdit} />
                  )}
                </Form.Item>
              </Col>
            </div>
              <Col {...gridSpan} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={() => {
                    console.log("H0form");}}
                  onReset={this.handleReset}
                  onShowMore={this.handleShowMore}
                  isShowMore={isShowMore}
                />
              </Col>
          </Form>
        </div>

      </>
    )
  }
}
