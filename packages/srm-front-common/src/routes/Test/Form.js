import React from 'react';
import { Input, Row, Col, Form, Cascader, Checkbox, Radio, InputNumber, Tooltip } from 'antd';
import { Checkbox as HCheckBox } from 'hzero-ui';
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
import CusUpload from '@/components/CusUpload';
import { getLFormGridSpan } from '@/utils/utils';
import tipIcon from '@/assets/tips.svg';

const prompt = 'spfm.interfaceErrors';
const dateTimeFormat = getDateTimeFormat();
const { SHOW_CHILD } = Cascader;

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      isShowMore: false,
    }
  }

  form = React.createRef();

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  }

  handleReset = () => {
    this.form?.current.resetFields();
  }

  render() {
    const { onSearch = (e) => e, idpValueMap } = this.props;
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
    const gridSpan = getLFormGridSpan();
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.clientId`).d('客户端ID')}
                  wrapperCol={{ span: 24 }}
                  name="clientId"
                >
                  <CusInput trimAll showCharacter maxLength={10} inputChinese={false} typeCase="lower" tip={"testtesttesttesttest"} allowClear placeholder="提示文字" />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.invokeKey`).d('请求ID')}
                  wrapperCol={{ span: 24 }}
                  name="invokeKey"
                >
                  <CusInput.TextArea showCharacter maxLength={4000} />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.serverCode`).d('服务代码')}
                  wrapperCol={{ span: 24 }}
                  name="serverCode"
                  rules={[{
                    required: true,
                  }]
                  }
                >
                  <CusSelect
                    lovCode="RS_IBOSS_SO_PRODUCT_TYPE"
                    mode="multiple"
                    showSearch
                    filterOption={(inputValue, option) => {
                      return option.meaning.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: isShowMore ? 'block' : 'none' }}>
              <Row>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.serverName`).d('服务名称')}
                  wrapperCol={{ span: 24 }}
                  name="serverName"
                  rules={[{
                    required: true,
                  }]}
                >
                  <CusSelect
                    placeholder="提示文字"
                    allowClear
                    options={idpValueMap['CMI_COA_INTERCO']}
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
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceUrl`).d('第三方接口地址')}
                  wrapperCol={{ span: 24 }}
                  name="interfaceUrl"
                >
                  <Input />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceCode`).d('接口编码')}
                  wrapperCol={{ span: 24 }}
                  name="interfaceCode"
                >
                  <Input />
                </Form.Item>
              </Col>
              </Row>
              <Row>
                <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.dateFromStr`).d('请求时间从')}
                  wrapperCol={{ span: 24 }}
                  name="dateFromStr"
                >
                  <CusDatePicker.RangePicker
                    tip={"test"}
                  />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceName`).d('接口名称')}
                  wrapperCol={{ span: 24 }}
                  name="interfaceName"
                >
                  <Input />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试')}
                  wrapperCol={{ span: 24 }}
                  name="interfaceLov"
                  initialValue='ADE'
                  rules={[
                    {required: true}
                  ]}
                >
                  <CusLov
                    isInitQuery={false}
                    placeholder="提示文字"
                    code="SSLM.COST_SUPPLIER_INFO"
                    form={this.form?.current}
                    textField="interfaceLov"
                  />
                </Form.Item>
              </Col>
              </Row>
              <Row>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.dateToStr`).d('请求时间至')}
                  wrapperCol={{ span: 24 }}
                  name="dateToStr"
                  rules={[
                    {required: true}
                  ]}
                >
                  <CusDatePicker
                    placeholder="提示文字"
                    tip={"test"}
                    // showTime
                    format={dateTimeFormat}
                  />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试')}
                  wrapperCol={{ span: 24 }}
                  name="multiLov"
                >
                  <CusMultiLov
                    code="HPFM.CURRENCY"
                    // form={this.form?.current}
                  />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试')}
                  wrapperCol={{ span: 24 }}
                  name="inputLov"
                >
                  <CusInputLov
                    isInput
                    code="HPFM.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    // form={this.form?.current}
                  />
                </Form.Item>
              </Col>
              </Row>
              <Row>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.interfaceLov`).d('Lov测试')}
                  wrapperCol={{ span: 24 }}
                  name="treeLov"
                >
                  <CusMultiLov
                    code="SMDM.TREE_ITEM_CATEGORY"
                  />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.checkbox`).d('checkbox')}
                  wrapperCol={{ span: 24 }}
                  name="checkbox"
                  valuePropName="checked"
                >
                  <Checkbox />
                  <HCheckBox />
                </Form.Item>
              </Col>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.radio`).d('radio')}
                  wrapperCol={{ span: 24 }}
                  name="radio"
                >
                  <Radio />
                </Form.Item>
              </Col>
              </Row>
               <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.upload`).d('upload')}
                  wrapperCol={{ span: 24 }}
                  name="upload"
                >
                  <CusUpload
                    filePreview
                    bucketName="scm-source-files"
                    tenantId={463}
                    attachmentUUID="463d86834bc8fac437f8b3cfdaf142131b7"
                    isEncrypt
                    tip="test"
                    // viewOnly
                  />
                </Form.Item>
              </Col>
            </div>
            <Col {...gridSpan} style={{ float: 'right' }}>
              <CusQueryButtons
                onQuery={() => {
                  console.log("form");}}
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
