import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Upload, Col, Row, Spin, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import uuid from 'uuid/v4';
import './index.less';
import en from './lanuage/en_US.json';
import sc from './lanuage/zh_CN.json';
import tc from './lanuage/zh_TS.json';
import '@/utils/omniapi-1.0.0';
import Success from './success.js';
import { join } from 'lodash';
const { Option } = Select;
const { Dragger } = Upload;
const prompt = 'spfmhk.mylink';
const languages = {
  en: en,
  sc: sc,
  tc: tc,
};
const Notification = (message) => {
  return (
    <span>
      <InfoCircleOutlined style={{ verticalAlign: 'text-bottom', marginRight: '5px' }} />
      {message}
    </span>
  );
};
const omniApiSdkEnv = process.env.APP_OMNI_API_SDK_ENV;
const omniPartnerToken = process.env.OMNI_PARTNER_TOKEN;
OmniApi.sdkInit(omniApiSdkEnv, omniPartnerToken);
@connect(({ loading = {}, registerMyLinkModel = {} }) => ({
  registerMyLinkModel,
  lovLoading:
    loading.effects['registerMyLinkModel/queryLovData'] ||
    loading.effects['registerMyLinkModel/queryLovViewInfo'],
  registerLoading: loading.effects['registerMyLinkModel/register'],
}))
class MyComponentLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLanguage: undefined,
      colSpan: 24,
      width: '80%',
      br: null,
      isDomestic: null,
      isPub: props.location.pathname.includes('/pub'),
      isTrue: true,
      productOptions: [],
      partnerModeOptions: [],
      registrationAddressOptions: [],
      uuid: uuid(),
    };
  }

  formRef = React.createRef(); // 用于访问表单

  async componentDidMount() {
    this.updateLanguage();
    this.handleResize(); // 初始化调用
    window.addEventListener('resize', this.handleResize); // 添加窗口大小变化事件监听
    const { dispatch } = this.props;
    const { isOK, detail } = await OmniApi.pageInit();
    console.info('pageInit', isOK, detail);
    if (isOK) {
      OmniApi.jsonPostXhr(
        `/hande/external/api/core/getToken?client_id=${process.env.CLIENT_ID_REGISTER}&client_secret=${process.env.CLIENT_SECRET}&grant_type=${process.env.GRANT_TYPE}`
      ).then((res) => {
        if (res?.access_token) {
          dispatch({
            type: 'registerMyLinkModel/updateState',
            payload: {
              access_token: res.access_token,
            },
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        isPub: this.props.location.pathname.includes('/pub'),
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize); // 清除事件监听
  }

  updateLanguage = () => {
    const { location } = this.props;
    if (location.pathname.includes('/sc')) {
      this.setState({ currentLanguage: 'sc' });
    } else if (location.pathname.includes('/tc')) {
      this.setState({ currentLanguage: 'tc' });
    } else {
      this.setState({ currentLanguage: 'en' });
    }
  };

  translate = (key) => {
    const { currentLanguage } = this.state;
    return languages[currentLanguage]?.[key] || key;
  };

  handleResize = () => {
    if (window.innerWidth <= 420) {
      this.setState({
        colSpan: 24, // 手机屏幕时
        width: '340px',
      });
    } else {
      this.setState({
        colSpan: 12, // 其他屏幕时
        width: '80%',
      });
    }
  };

  onFinish = () => {
    const { dispatch, registerMyLinkModel } = this.props;
    const { currentLanguage } = this.state;
    const { access_token } = registerMyLinkModel;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        OmniApi.jsonPostXhr(
          '/hande/external/api/mylink/signUp',
          {
            access_token,
            ...values,
            partnerModeId: join(values.partnerModeId, ','),
            langType: currentLanguage === 'en' ? 'EN_US' : 'ZH_CN',
          },
          headerMap
        ).then((res) => {
          if (res) {
            this.setState({
              isTrue: false,
            });
          }
        });
      })
      .catch((err) => {
        console.log('err');
      });
  };

  PageBack = () => {
    window.location.reload();
    // this.formRef.current.resetFields(); // 使用 ref 重置表单
  };

  handleSelectChange = (value) => {
    this.setState({ isDomestic: value });
  };
  getProductOptions = () => {
    const { registerMyLinkModel, dispatch } = this.props;
    const { currentLanguage } = this.state;
    const { access_token } = registerMyLinkModel;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    if (access_token) {
      OmniApi.jsonGetXhr(
        `/hande/external/api/core/queryLovValue?access_token=${access_token}&lovCode=HKSM.PRODCUT_SERVICE&langType=${
          currentLanguage === 'en' ? 'EN_US' : 'ZH_CN'
        }`
      ).then((res) => {
        this.setState({
          productOptions: res,
        });
      });
    }
  };
  getPartnerModeOptions = () => {
    const { registerMyLinkModel, dispatch } = this.props;
    const { access_token } = registerMyLinkModel;
    const { currentLanguage } = this.state;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    if (access_token) {
      OmniApi.jsonGetXhr(
        `/hande/external/api/core/queryLovViewInfo?access_token=${access_token}&viewCode=LINK.SIGN_PART_MODE&langViewType=${
          currentLanguage === 'en' ? 'EN_US' : currentLanguage === 'sc' ? 'ZH_CN' : 'ZH_TW'
        }`
      ).then((res) => {
        this.setState({
          partnerModeOptions: res,
        });
      });
    }
  };
  getRegistrationAddress = () => {
    const { registerMyLinkModel, dispatch } = this.props;
    const { access_token } = registerMyLinkModel;
    const { currentLanguage } = this.state;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    if (access_token) {
      OmniApi.jsonGetXhr(
        `/hande/external/api/core/queryLovValue?access_token=${access_token}&lovCode=REGISTRATION_ADDRESS&langType=${
          currentLanguage === 'en' ? 'EN_US' : 'ZH_CN'
        }`
      ).then((res) => {
        this.setState({
          registrationAddressOptions: res,
        });
      });
    }
  };
  handleUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerMyLinkModel } = this.props;
    const { uuid } = this.state;
    const { access_token } = registerMyLinkModel;
    const formData = new FormData();
    formData.append('attachmentUUID', uuid);
    formData.append('access_token', access_token);
    formData.append('bucketName', 'mylink');
    formData.append('file', fileToUpload, fileToUpload.filename);
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    OmniApi.formPostXhr(
      '/hande/external/api/core/uploadFile',
      {
        formData,
        accessToken: access_token,
      },
      headerMap
    )
      .then((res) => {
        file.onSuccess(res);
      })
      .catch((err) => {
        // 上传失败时，调用 onError 来通知 Upload 组件
        file.onError(err);
      });
  };
  handleChange = (info) => {
    const { uuid } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({ fileUuid: uuid });
  };
  render() {
    const {
      colSpan,
      width,
      br,
      isDomestic,
      isTrue,
      productOptions,
      partnerModeOptions,
      registrationAddressOptions,
      registerLoading,
      lovLoading,
    } = this.state;
    return (
      <>
        {isTrue && (
          <>
            <div className="register-container" style={{ width, marginTop: '40px' }}>
              <div className="register-title">
                <span>{this.translate(`${prompt}.view.title`)}</span>
              </div>
              <div style={{ height: '100%' }}>
                <div className="font-link"></div>
                <Form ref={this.formRef} className="register-form">
                  <Row gutter={20}>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.companyName`)}
                        name="companyName"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.companyName`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.webapp`)}
                        name="webSiteApp"
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.email`)}
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.company.email`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>

                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.contactper`)}
                        name="contact"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.company.contactper`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.contacphone`)}
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.company.contacphone`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.cooperate.mode`)}
                        name="partnerModeId"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseselect`)} ${this.translate(
                                `${prompt}.field.cooperate.mode`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Select
                          placeholder={this.translate(`${prompt}.view.pleaseselect`)}
                          onDropdownVisibleChange={this.getPartnerModeOptions}
                          mode="multiple"
                          className="select-input"
                          maxTagCount={1}
                          loading={lovLoading}
                          options={partnerModeOptions.map((option) => ({
                            value: option.modeId,
                            label: option.cooperationMode,
                          }))}
                          suffixIcon={
                            <img src={require('../../../../src/assets/register/select.png')}></img>
                          }
                        ></Select>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.productSer`)}
                        name="product"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseselect`)} ${this.translate(
                                `${prompt}.field.company.productSer`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Select
                          placeholder={this.translate(`${prompt}.view.pleaseselect`)}
                          onDropdownVisibleChange={this.getProductOptions}
                          className="select-input"
                          loading={lovLoading}
                          suffixIcon={
                            <img src={require('../../../../src/assets/register/select.png')}></img>
                          }
                        >
                          {productOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.meaning}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.Registadd`)}
                        name="signAddress"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseselect`)} ${this.translate(
                                `${prompt}.field.company.Registadd`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Select
                          placeholder={this.translate(`${prompt}.view.pleaseselect`)}
                          className="select-input"
                          onDropdownVisibleChange={this.getRegistrationAddress}
                          onChange={this.handleSelectChange}
                          loading={lovLoading}
                          suffixIcon={
                            <img src={require('../../../../src/assets/register/select.png')}></img>
                          }
                        >
                          {registrationAddressOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.meaning}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    {isDomestic === 'Mainland' && (
                      <Col span={colSpan}>
                        <Form.Item
                          label={this.translate(`${prompt}.field.company.creditcode`)}
                          name="registrationNumber"
                          rules={[
                            {
                              required: true,
                              message: Notification(
                                `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                  `${prompt}.field.company.creditcode`
                                )}`
                              ),
                            },
                          ]}
                        >
                          <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                        </Form.Item>
                      </Col>
                    )}
                    {isDomestic === 'OutSide' && (
                      <Col span={colSpan}>
                        <Form.Item
                          label={this.translate(`${prompt}.field.company.br`)}
                          name="businessCode"
                          rules={[
                            {
                              required: true,
                              message: Notification(
                                `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                  `${prompt}.field.company.br`
                                )}`
                              ),
                            },
                          ]}
                        >
                          <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={colSpan} className="upload-col">
                      <Form.Item
                        label={this.translate(`${prompt}.button.clickUpload`)}
                        name="fileUuid"
                      >
                        <Dragger
                          customRequest={(file) => this.handleUpload(file)}
                          onChange={this.handleChange}
                          maxCount={1}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                        >
                          <p className="ant-upload-drag-icon">
                            <img
                              src={require('../../../../src/assets/register/upload-icon.png')}
                            ></img>
                          </p>
                          <p className="ant-upload-text">
                            {this.translate(`${prompt}.button.uploadfile`)}
                          </p>
                        </Dragger>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
            <div style={{ width, margin: '0 auto' }} className="register-btn-container">
              <Button
                type="primary"
                className="register-btn"
                onClick={this.onFinish}
                loading={registerLoading}
              >
                {this.translate(`${prompt}.button.register`)}
              </Button>
            </div>
          </>
        )}
        {!isTrue && <Success PageBack={this.PageBack} />}
      </>
    );
  }
}

export default MyComponentLink;
