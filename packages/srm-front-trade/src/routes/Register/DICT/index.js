import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Col,
  Row,
  Radio,
  InputNumber,
  Spin,
  message,
} from 'antd';
import uuid from 'uuid/v4';
import { getAccessToken } from 'utils/utils';
import '@/utils/omniapi-1.0.0';
import { InfoCircleOutlined } from '@ant-design/icons';
import { HZERO_FILE } from 'utils/config';
import './index.less';
import en from './lanuage/en_US.json';
import sc from './lanuage/zh_CN.json';
import tc from './lanuage/zh_TS.json';
import Success from './success.js';
import { join } from 'lodash';
const { Option } = Select;
const { Dragger } = Upload;
const prompt = 'spfmhk.dict';
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
@connect(({ loading = {}, registerDICTModel = {} }) => ({
  registerDICTModel,
  loading: loading.effects['registerDICTModel/getToken'],
  LovLoading:
    loading.effects['registerDICTModel/queryLovViewInfo'] ||
    loading.effects['registerDICTModel/queryLovViewInfo'],
  registerLoading: loading.effects['registerDICTModel/register'],
}))
class MyComponentDict extends Component {
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
      selectedItems: [],
      partnerModeOptions: [],
      registrationAddressOptions: [],
      certificateUuid: uuid(),
      businessLicenseUuid: uuid(),
      actionRuleUuid: uuid(),
      commitLetterUuid: uuid(),
      codeconductUrl: '',
      compliancecommitmentUrl: '',
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
            type: 'registerDICTModel/updateState',
            payload: {
              access_token: res.access_token,
            },
          });
          this.getUrl();
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
        br: <br />,
      });
    } else {
      this.setState({
        colSpan: 12, // 其他屏幕时
        width: '80%',
        br: null,
      });
    }
  };

  onFinish = () => {
    const { dispatch, registerDICTModel } = this.props;
    const { currentLanguage } = this.state;
    const { access_token } = registerDICTModel;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        OmniApi.jsonPostXhr(
          '/external/api/dict/signUp',
          {
            access_token,
            ...values,
            modeNoticeId: join(values.modeNoticeId, ','),
            lang: currentLanguage === 'en' ? 'en_US' : 'zh_CN',
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

  getUrl = () => {
    const { dispatch, registerDICTModel } = this.props;
    const { access_token } = registerDICTModel;
    OmniApi.jsonGetXhr(
      `/hande/external/api/core/queryLovValue?access_token=${access_token}&lovCode=DICT.CONFIG`
    ).then((res) => {
      this.setState({
        codeconductUrl: res.find((item) => item.value === 'ACTION_RULE_FILE').tag,
        compliancecommitmentUrl: res.find((item) => item.value === 'COMMIT_LETTER_FILE').tag,
      });
    });
  };
  PageBack = () => {
    window.location.reload();
  };

  handleSelectChange = (value) => {
    this.setState({ isDomestic: value });
  };
  getPartnerModeOptions = () => {
    const { registerDICTModel, dispatch } = this.props;
    const { access_token } = registerDICTModel;
    const { currentLanguage } = this.state;
    if (access_token) {
      OmniApi.jsonGetXhr(
        `/hande/external/api/core/queryLovViewInfo?access_token=${access_token}&viewCode=DICT.MODE_NOTICE&langType=${
          currentLanguage === 'en' ? 'EN_US' : 'ZH_CN'
        }`
      ).then((res) => {
        this.setState({
          partnerModeOptions: res,
        });
      });
    }
  };
  getRegistrationAddress = () => {
    const { registerDICTModel, dispatch } = this.props;
    const { access_token } = registerDICTModel;
    const { currentLanguage } = this.state;
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
  handleCertificateUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerDICTModel } = this.props;
    const { certificateUuid } = this.state;
    const { access_token } = registerDICTModel;
    const formData = new FormData();
    formData.append('attachmentUUID', certificateUuid);
    formData.append('access_token', access_token);
    formData.append('bucketName', 'dict');
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
  handleCertificateChange = (info) => {
    const { certificateUuid } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({ certificateUuid });
  };

  handleBusinessLicenseUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerDICTModel } = this.props;
    const { businessLicenseUuid } = this.state;
    const { access_token } = registerDICTModel;
    const formData = new FormData();
    formData.append('attachmentUUID', businessLicenseUuid);
    formData.append('access_token', access_token);
    formData.append('bucketName', 'dict');
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
  handleBusinessLicenseChange = (info) => {
    const { businessLicenseUuid } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({ businessLicenseUuid });
  };

  handleActionRuleUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerDICTModel } = this.props;
    const { actionRuleUuid } = this.state;
    const { access_token } = registerDICTModel;
    const formData = new FormData();
    formData.append('attachmentUUID', actionRuleUuid);
    formData.append('access_token', access_token);
    formData.append('bucketName', 'dict');
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
  handleActionRuleChange = (info) => {
    const { actionRuleUuid } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({ actionRuleUuid });
  };

  handleCommitLetterUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerDICTModel } = this.props;
    const { commitLetterUuid } = this.state;
    const { access_token } = registerDICTModel;
    const formData = new FormData();
    formData.append('attachmentUUID', commitLetterUuid);
    formData.append('access_token', access_token);
    formData.append('bucketName', 'dict');
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
  handleCommitLetterChange = (info) => {
    const { commitLetterUuid } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({ commitLetterUuid });
  };
  render() {
    const {
      colSpan,
      width,
      br,
      isDomestic,
      isTrue,
      partnerModeOptions,
      registrationAddressOptions,
      selectedItems,
      registerLoading,
      LovLoading,
      codeconductUrl,
      compliancecommitmentUrl,
      currentLanguage,
    } = this.state;
    const downLoadCodeconductUrl = `${HZERO_FILE}/v1/0/files/decrypt-download-ext?bucketName=template&access_token=${getAccessToken()}
    &url=${encodeURIComponent(codeconductUrl)}`;
    const downLoadCompliancecommitmentUrl = `${HZERO_FILE}/v1/0/files/decrypt-download-ext?bucketName=template&access_token=${getAccessToken()}
    &url=${encodeURIComponent(compliancecommitmentUrl)}`;
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
                        name="cmpanyName"
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
                        label={this.translate(`${prompt}.field.cooperate.mode`)}
                        name="modeNoticeId"
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
                          options={partnerModeOptions.map((item) => ({
                            value: item.modeNoticeId,
                            label:
                              currentLanguage === 'sc'
                                ? item.modeTypeChSimple
                                : currentLanguage === 'tc'
                                ? item.modeTypeChTrad
                                : item.modeTypeEn,
                          }))}
                          loading={LovLoading}
                          suffixIcon={
                            <img src={require('../../../../src/assets/register/select.png')}></img>
                          }
                        ></Select>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.contactper`)}
                        name="contactsName"
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
                        label={this.translate(`${prompt}.field.company.Registadd`)}
                        name="establishmentPlace"
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
                          loading={LovLoading}
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
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.address`)}
                        name="addressCh"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.company.address`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Input placeholder={this.translate(`${prompt}.view.pleaseenter`)} />
                      </Form.Item>
                    </Col>
                    {isDomestic === 'Mainland' && (
                      <Col span={colSpan}>
                        <Form.Item
                          label={this.translate(`${prompt}.field.company.creditcode`)}
                          name="businessRegistration"
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
                          name="businessRegistration"
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
                    <Col span={24}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.informatization.experience`)}
                        name="isInformationProject"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseselect`)} ${this.translate(
                                `${prompt}.field.informatization.experience`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Radio.Group>
                          <Radio className="custom-radio" value={'Y'}>
                            {this.translate(`${prompt}.field.informatization.experience.yes`)}
                          </Radio>
                          <Radio className="custom-radio" value={'N'}>
                            {this.translate(`${prompt}.field.informatization.experience.no`)}
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                    {/* <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.informatization.number`)}
                        name="informationProjectCount"
                      >
                        <InputNumber
                          placeholder={this.translate(`${prompt}.view.pleaseenter`)}
                          precision={2}
                          step={1}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.informatization.amount`)}
                        name="informationProjectAmount"
                      >
                        <InputNumber
                          placeholder={this.translate(`${prompt}.view.pleaseenter`)}
                          precision={2}
                          step={1}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col> */}
                    <Col span={colSpan} className="upload-col">
                      <Form.Item
                        label={this.translate(`${prompt}.field.upload.certificate`)}
                        className="upload-dragger"
                        name="certificateUuid"
                      >
                        <Dragger
                          customRequest={(file) => this.handleCertificateUpload(file)}
                          onChange={this.handleCertificateChange}
                          maxCount={1}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                        >
                          <p className="ant-upload-drag-icon">
                            <img
                              src={require('../../../../src/assets/register/upload-icon.png')}
                            ></img>
                          </p>
                          <p className="ant-upload-text">
                            {this.translate(`${prompt}.button.clickUpload`)}
                          </p>
                        </Dragger>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan} className="upload-col">
                      <Form.Item
                        label={this.translate(`${prompt}.field.upload.businesslicense`)}
                        className="upload-dragger"
                        name="businessLicenseUuid"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseupload`)} ${this.translate(
                                `${prompt}.field.upload.businesslicense`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Dragger
                          customRequest={(file) => this.handleBusinessLicenseUpload(file)}
                          onChange={this.handleBusinessLicenseChange}
                          maxCount={1}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                        >
                          <p className="ant-upload-drag-icon">
                            <img
                              src={require('../../../../src/assets/register/upload-icon.png')}
                            ></img>
                          </p>
                          <p className="ant-upload-text">
                            {this.translate(`${prompt}.button.clickUpload`)}
                          </p>
                        </Dragger>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan} className="upload-col-template">
                      <Form.Item
                        label={this.translate(`${prompt}.field.upload.codeconduct`)}
                        className="upload-dragger"
                        name="actionRuleUuid"
                      >
                        <Dragger
                          customRequest={(file) => this.handleActionRuleUpload(file)}
                          onChange={this.handleActionRuleChange}
                          maxCount={1}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                        >
                          <p className="ant-upload-drag-icon">
                            <img
                              src={require('../../../../src/assets/register/upload-icon.png')}
                            ></img>
                          </p>
                          <p className="ant-upload-text">
                            {this.translate(`${prompt}.button.clickUpload`)}
                          </p>
                        </Dragger>
                        <a
                          href={downLoadCodeconductUrl}
                          className="responsive-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {this.translate(`${prompt}.view.templates`)}
                        </a>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan} className="upload-col-template">
                      <Form.Item
                        label={this.translate(`${prompt}.field.upload.compliancecommitment`)}
                        className="upload-dragger"
                        name="commitLetterUuid"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseupload`)} ${this.translate(
                                `${prompt}.field.upload.compliancecommitment`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Dragger
                          customRequest={(file) => this.handleCommitLetterUpload(file)}
                          onChange={this.handleCommitLetterChange}
                          maxCount={1}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                        >
                          <p className="ant-upload-drag-icon">
                            <img
                              src={require('../../../../src/assets/register/upload-icon.png')}
                            ></img>
                          </p>
                          <p className="ant-upload-text">
                            {this.translate(`${prompt}.button.clickUpload`)}
                          </p>
                        </Dragger>
                        <a
                          href={downLoadCompliancecommitmentUrl}
                          className="responsive-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {this.translate(`${prompt}.view.templates`)}
                        </a>
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

export default MyComponentDict;
