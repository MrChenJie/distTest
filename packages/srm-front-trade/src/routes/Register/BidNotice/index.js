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
  DatePicker,
  ConfigProvider,
  Space,
  Modal,
  Table,
  Pagination,
  InputNumber,
  notification,
  message,
} from 'antd';
import uuid from 'uuid/v4';
import zhCN from 'antd/es/locale/zh_CN'; // 简体中文
import enUS from 'antd/es/locale/en_US'; // 英文
import zhTW from 'antd/es/locale/zh_TW'; // 繁体中文
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Bind } from 'lodash-decorators';
import { SEARCH_FORM_ITEM_LAYOUT, DATETIME_MIN } from 'utils/constants';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { createPagination } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import './index.less';
import  '@/utils/omniapi-1.0.0'
import en from './lanuage/en_US.json';
import sc from './lanuage/zh_CN.json';
import tc from './lanuage/zh_TS.json';
import Success from './success.js';
const { Option } = Select;
const { Dragger } = Upload;
const prompt = 'spfmhk.bid';
const languages = {
  en: en,
  sc: sc,
  tc: tc,
};
moment.locale('zh-cn');
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
@connect(({ loading = {}, registerBidModel = {} }) => ({
  registerBidModel,
  loading:
    loading.effects['registerBidModel/getToken'] &&
    loading.effects['registerBidModel/getBidNotice'],
  LovLoading:
    loading.effects['registerBidModel/queryLovViewInfo'] ||
    loading.effects['registerBidModel/getAllCurrencyCode'] ||
    loading.effects['registerBidModel/getScaleByCurrency'],
  registerLoading: loading.effects['registerBidModel/register'],
}))
class MyComponentDict extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeList: [],
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
      businessLicenseList: [],
      businessLicenseUrl: '',
      ndaFileUrlList: [],
      ndaFileUrl: '',
      suppRegFileUrlList: [],
      suppRegFileUrl: '',
      codeconductUrl: '',
      compliancecommitmentUrl: '',
      isModalVisible: false,
      currency: '',
      currencySource: [],
      currencyPagination: {},
      currencyBox: false,
      selectedRowKeys: [],
      selectedRows: [],
      cnSimpleNoticeContent: '',
      cnTradNoticeContent: '',
      enNoticeContent: '',
      bidNumber: '', //招标编号
      number: '', //编号
      bidNoticeContent: '', //招标公告内容
      exchangeRate: '', // 币种的汇率
      registeredCapitalHkd: '',
      registeredCapital: '',
      currencyRate: '',
      closeChosen: false, //二次确认弹框
      resultText: {},
    };
  }

  formRef = React.createRef(); // 用于访问表单
  currencyFormRef = React.createRef();
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
            type: 'registerBidModel/updateState',
            payload: {
              access_token: res.access_token,
            },
          });
          let headerMap = new Map();
          headerMap.set('Authorization', `bearer ${access_token}`);
          OmniApi.jsonGetXhr(
            `/hande/external/api/supplier/bid-notices/select?noticeId=${match.params.noticeId}&access_token=${res.access_token}`,
            {},
            headerMap
          ).then((res) => {
            this.setState({
              cnSimpleNoticeContent: res.cnSimpleNoticeContent,
              cnTradNoticeContent: res.cnTradNoticeContent,
              enNoticeContent: res.enNoticeContent,
            });
            this.getNoticeInformations();
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

  //抽出招标公告信息
  getNoticeInformations = () => {
    const { currentLanguage, cnSimpleNoticeContent, cnTradNoticeContent, enNoticeContent } =
      this.state;
    if (currentLanguage === 'sc') {
      let parser = new DOMParser();
      let doc = parser.parseFromString(cnSimpleNoticeContent, 'text/html');
      let firstP = doc.querySelector('p');
      let secondP = doc.querySelectorAll('p')[1];
      firstP.remove();
      secondP.remove();
      this.setState({
        bidNumber: firstP.querySelectorAll('span')[1].textContent,
        number: firstP.querySelectorAll('span')[3].textContent,
        bidTitle: secondP.innerHTML,
        bidNoticeContent: doc.body.innerHTML,
      });
    } else if (currentLanguage === 'tc') {
      let parser = new DOMParser();
      let doc = parser.parseFromString(cnTradNoticeContent, 'text/html');
      let firstP = doc.querySelector('p');
      let secondP = doc.querySelectorAll('p')[1];
      firstP.remove();
      secondP.remove();
      this.setState({
        bidNumber: firstP.querySelectorAll('span')[1].textContent,
        bidTitle: secondP.innerHTML,
        bidNoticeContent: doc.body.innerHTML,
      });
    } else {
      let parser = new DOMParser();
      let doc = parser.parseFromString(enNoticeContent, 'text/html');
      let firstP = doc.querySelector('p');
      let secondP = doc.querySelectorAll('p')[1];
      firstP.remove();
      secondP.remove();
      this.setState({
        bidNumber: firstP.querySelectorAll('span')[1].textContent,
        bidTitle: secondP.innerHTML,
        bidNoticeContent: doc.body.innerHTML,
      });
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
  @Bind
  openModal = () => {
    const { dispatch, registerBidModel,match } = this.props;
    const { currentLanguage, currency, registeredCapitalHkd } = this.state;
    const { access_token } = registerBidModel;
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        signInfo = { ...values };
        signInfo.registeredCapitalHkd = registeredCapitalHkd;
        signInfo.establishmentTime = dateRender(values.establishmentTime);
        signInfo.lang = currentLanguage === 'en' ? 'en_US' : 'zh_CN';
        signInfo.noticeId = match.params.noticeId;
        this.setState({ closeChosen: true, resultText: signInfo });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  PageBack = () => {
    window.location.reload();
  };

  handleSelectChange = (value) => {
    this.setState({ isDomestic: value });
  };

  //获取注册地信息
  getRegistrationAddress = () => {
    this.setState({
      typeList: [
        {
          value: 'withinMainlandChina',
          meaning: this.translate(`${prompt}.view.select.mainland`),
        },
        {
          value: 'outsideMainlandChina_includingHongKong_Macao_Taiwan',
          meaning: this.translate(`${prompt}.view.select.outside`),
        },
      ],
    });
  };

  //营业执照上传
  handleBusinessLicenseUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerBidModel } = this.props;
    const { access_token } = registerBidModel;
    const formData = new FormData();
    formData.append('attachmentUUID', uuid());
    formData.append('access_token', access_token);
    formData.append('fileName', fileToUpload.name);
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
        this.setState({
          businessLicenseUrl: res,
        });
        file.onSuccess(res);
      })
      .catch((err) => {
        file.onError(err);
      });
  };
  handleBusinessLicenseChange = (info) => {
    const { businessLicenseUrl } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({
      businessLicenseList: [
        {
          ...info.file,
          fileUrl: businessLicenseUrl,
        },
      ],
    });
  };

  //保密协议书上传
  handleNondisclosureUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerBidModel } = this.props;
    const { access_token } = registerBidModel;
    const formData = new FormData();
    formData.append('attachmentUUID', uuid());
    formData.append('access_token', access_token);
    formData.append('fileName', fileToUpload.name);
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
        this.setState({
          ndaFileUrl: res,
        });
        file.onSuccess(res);
      })
      .catch((err) => {
        file.onError(err);
      });
  };
  handleNondisclosureChange = (info) => {
    const { ndaFileUrl } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({
      ndaFileUrlList: [
        {
          ...info.file,
          fileUrl: ndaFileUrl,
        },
      ],
    });
  };

  //供应商登记表上传
  handleSupplierRegistrationUpload = (file) => {
    const fileToUpload = file?.file; // 提取 File 对象
    const { dispatch, registerBidModel } = this.props;
    const { access_token } = registerBidModel;
    const formData = new FormData();
    formData.append('attachmentUUID', uuid());
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
        this.setState({
          suppRegFileUrl: res,
        });
      })
      .catch((err) => {
        // 上传失败时，调用 onError 来通知 Upload 组件
        file.onError(err);
      });
  };
  handleSupplierRegistrationChange = (info) => {
    const { suppRegFileUrl } = this.state;
    if (info.file.status === 'done') {
      message.success(`${info.file.name}` + this.translate(`${prompt}.view.upload.success`));
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name}` + this.translate(`${prompt}.view.upload.error`));
    }
    this.formRef.current.setFieldsValue({
      suppRegFileUrlList: [
        {
          ...info.file,
          fileUrl: suppRegFileUrl,
        },
      ],
    });
  };

  /**
   * 重置表单
   */
  @Bind
  handleReset() {
    const { form } = this.props;
    form.resetFields('currencyCode');
    form.resetFields('currencyName');
  }
  // 查询所有币种
  @Bind
  getCurrency(page = {}) {
    const { dispatch, registerBidModel } = this.props;
    const { access_token } = registerBidModel;
    let fieldsValue = {};
    if (this.props.form) {
      fieldsValue = this.props.form.getFieldsValue();
      fieldsValue = {
        currencyCode: fieldsValue.currencyCode ? fieldsValue.currencyCode : '',
        currencyName: fieldsValue.currencyName ? fieldsValue.currencyName : '',
      };
    }
    let headerMap = new Map();
    headerMap.set('Authorization', `bearer ${access_token}`);
    OmniApi.jsonGetXhr(
      `/hande/external/api/supplier/bid-suppliers/selectCurrency?currencyCode=${fieldsValue.currencyCode}&currencyName=${fieldsValue.currencyName}&page=${0}&size=${100}`,
      // { ...fieldsValue, page },
      {},
      headerMap
    ).then((res) => {
      if (res) {
        const pagination = createPagination(res);
        const newDataSource = res.content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuid(),
        }));
        this.setState({
          currencySource: newDataSource,
          currencyPagination: pagination,
        });
      }
    });
  }

  // 选择币种
  @Bind
  onSearchCurrency() {
    this.setState({ currencyBox: true });
    this.getCurrency();
  }
  @Bind
  handleCancelBox() {
    this.setState({ closeChosenBox: false, currencyBox: false });
  }
  @Bind
  handleOkCurrency(value) {
    const { selectedRows, currency } = this.state;
    if (selectedRows.length > 0) {
      this.formRef.current.setFieldsValue({ currency: selectedRows[0].currencyCode });
      // currency = selectedRows[0].currencyCode;
      this.setState({
        currency: selectedRows[0].currencyCode,
        currencyBox: false,
      });

      this.getExchangeRate(selectedRows[0].currencyCode);
    }
    // this.setState({
    //   currency: selectedRows[0].currencyCode,
    //   currencyBox: false,
    // });
  }
  // 查询当天汇率
  @Bind
  getExchangeRate(code) {
    const { dispatch } = this.props;
    const { access_token, registeredCapital } = this.state;
    let headerMap = new Map();
    headerMap.set('Authorization', `${access_token}`);
    OmniApi.jsonGetXhr(
      `/hande/external/api/supplier/bid-suppliers/selectExchange?currency=${code||''}&currencyTO=HKD&cvtDate=${moment().format(DATETIME_MIN)}`,
      // {
      //   currency: code || '',
      //   currencyTO: 'HKD',
      //   cvtDate: moment().format(DATETIME_MIN),
      // },
      {},
      headerMap
    ).then((res) => {
      if (res) {
        if (res.currencyRate) {
          // registeredCapitalHkd = registeredCapital * res.currencyRate;
          this.setState({
            exchangeRate: res.currencyRate,
            registeredCapitalHkd: registeredCapital * res.currencyRate,
          });
        } else {
          this.setState({ exchangeRate: 1 });
        }
      }
    });
  }

  // 实时计算汇率转换后的值
  @Bind
  changeRate(val) {
    const { exchangeRate } = this.state;
    if (exchangeRate) {
      this.setState({
        registeredCapitalHkd: val * exchangeRate,
      });
    } else {
      this.setState({
        registeredCapitalHkd: val,
      });
    }
  }
  @Bind
  handleCancelClose() {
    this.setState({ closeChosen: false });
  }

  @Bind
  handleOkClose() {
    const { access_token,resultText } = this.state;
    const { dispatch } = this.props;
    let headerMap = new Map();
    headerMap.set('Authorization', `${access_token}`);
    OmniApi.jsonPostXhr(
      '/hande/external/api/supplier/bid-notices/apply',
      {
        ...resultText,
      },
      headerMap
    ).then((res) => {
      if (res) {
        this.setState({ closeChosen: false });
        if (res.message === 'ok') {
          this.setState({
            isTrue: false,
          });
        } else if (res.message === 'registrationFailed') {
          notification.error({
            message: this.translate(`${prompt}.view.register.registrationFailed`),
          });
        } else if (res.message === 'timeError') {
          notification.error({ message: this.translate(`${prompt}.view.register.timeError`) });
        } else if (res.message === 'repetitionApply') {
          notification.error({
            message: this.translate(`${prompt}.view.register.repetitionApply`),
          });
        } else if (res.message === 'err') {
          notification.error({ message: this.translate(`${prompt}.view.register.err`) });
        }
      }
    });
  }
  render() {
    const {
      colSpan,
      width,
      isTrue,
      isDomestic,
      registrationAddressOptions,
      registerLoading,
      LovLoading,
      currency,
      currencyBox,
      selectedRowKeys,
      selectedRows,
      currencySource,
      currencyPagination,
      bidNoticeContent,
      bidNumber,
      number,
      bidTitle,
      currentLanguage,
      typeList,
      closeChosen,
      resultText,
    } = this.state;

    const { registerBidModel } = this.props;
    const { access_token } = registerBidModel;
    const currencyColumns = [
      {
        title: this.translate(`${prompt}.view.modal.query.currencysymbol`),
        dataIndex: 'currencyCode',
        key: 'currencyCode',
        width: 150,
      },
      {
        title: this.translate(`${prompt}.view.modal.query.country`),
        dataIndex: 'countryName',
        key: 'countryName',
        width: 150,
      },
      {
        title: this.translate(`${prompt}.view.modal.query.currencyname`),
        dataIndex: 'currencyName',
        key: 'currencyName',
        width: 150,
      },
    ];
    // 行选择配置
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      type: 'radio', // 单选模式
    };
    const listProps = {
      columns: currencyColumns,
      dataSource: currencySource,
      pagination: false,
      bordered: true,
      rowKey: 'rowKey',
      rowSelection, // 设置行选择配置
    };
    let newResultInfo = {};
    newResultInfo = { ...resultText };
    if (newResultInfo.region === 'withinMainlandChina') {
      newResultInfo.region = this.translate(`${prompt}.view.select.mainland`);
    }
    if (newResultInfo.region === 'outsideMainlandChina_includingHongKong_Macao_Taiwan') {
      newResultInfo.region = this.translate(`${prompt}.view.select.outside`);
    }
    if (newResultInfo.businessLicenseList) {
      newResultInfo.fileNamesBus = '';
      for (let i = 0; i < newResultInfo.businessLicenseList.length; i++) {
        if (newResultInfo.businessLicenseList[i].name !== undefined) {
          newResultInfo.fileNamesBus += `${newResultInfo.businessLicenseList[i].name}，`;
        }
      }
      if (newResultInfo.fileNamesBus.length > 0) {
        newResultInfo.fileNamesBus = newResultInfo.fileNamesBus.substr(
          0,
          newResultInfo.fileNamesBus.length - 1
        );
      }
    }
    if (newResultInfo.ndaFileUrlList) {
      newResultInfo.fileNamesNda = '';
      for (let i = 0; i < newResultInfo.ndaFileUrlList.length; i++) {
        if (newResultInfo.ndaFileUrlList[i].name !== undefined) {
          newResultInfo.fileNamesNda += `${newResultInfo.ndaFileUrlList[i].name}，`;
        }
      }
      if (newResultInfo.fileNamesNda.length > 0) {
        newResultInfo.fileNamesNda = newResultInfo.fileNamesNda.substr(
          0,
          newResultInfo.fileNamesNda.length - 1
        );
      }
    }
    if (newResultInfo.suppRegFileUrlList) {
      newResultInfo.fileNamesSupplierRegistration = '';
      for (let i = 0; i < newResultInfo.suppRegFileUrlList.length; i++) {
        if (newResultInfo.suppRegFileUrlList[i].name !== undefined) {
          newResultInfo.fileNamesSupplierRegistration += `${newResultInfo.suppRegFileUrlList[i].name}，`;
        }
      }
      if (newResultInfo.fileNamesSupplierRegistration.length > 0) {
        newResultInfo.fileNamesSupplierRegistration =
          newResultInfo.fileNamesSupplierRegistration.substr(
            0,
            newResultInfo.fileNamesSupplierRegistration.length - 1
          );
      }
    }
    return (
      <>
        {isTrue && (
          <>
            <div style={{ background: '#F4F5F7', margin: '10px auto' }}>
              <p dangerouslySetInnerHTML={{ __html: `${bidTitle ? bidTitle : ''}` }} />
            </div>
            <div className="register-container" style={{ width }}>
              <div className="register-title">
                <span>{currentLanguage === 'sc' ? `${bidNumber}${number}` : `${bidNumber}`}</span>
              </div>
              <div style={{ height: '100%' }}>
                <div className="font-link">
                  <p dangerouslySetInnerHTML={{ __html: `${bidNoticeContent}` }} />
                </div>
                <Form ref={this.formRef} className="register-form">
                  <Row gutter={20}>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.companyName`)}
                        name="supplierName"
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
                        name="contactinformation"
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
                        name="mail"
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
                        label={this.translate(`${prompt}.field.company.address`)}
                        name="contactAddress"
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
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.Registadd`)}
                        name="region"
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
                          {typeList.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.meaning}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.establishmentime`)}
                        name="establishmentTime"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseenter`)} ${this.translate(
                                `${prompt}.field.company.establishmentime`
                              )}`
                            ),
                          },
                        ]}
                      >
                        {/* <ConfigProvider locale={zhCN}> */}
                        <DatePicker
                          placeholder={this.translate(`${prompt}.view.pleaseenter`)}
                          format={'YYYY-MM-DD'}
                          allowClear={false}
                        />
                        {/* </ConfigProvider> */}
                      </Form.Item>
                    </Col>
                    <Col span={colSpan}>
                      <Form.Item
                        label={this.translate(`${prompt}.field.company.registeredcapital`)}
                        className="registered-capital"
                      >
                        <Row>
                          <Col span={12}>
                            <Form.Item
                              name="currency"
                              rules={[
                                {
                                  required: true,
                                  message: Notification(
                                    `${this.translate(`${prompt}.view.pleaseenter`)}`
                                  ),
                                },
                              ]}
                            >
                              <div
                                style={{ display: 'inline-block' }}
                                onClick={this.onSearchCurrency}
                              >
                                <Input
                                  style={{ width: '50%', paddingLeft: '10px' }}
                                  placeholder={this.translate(`${prompt}.view.pleaseselect`)}
                                  suffix={<SearchOutlined />}
                                  value={currency}
                                  readOnly
                                />
                              </div>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="registeredCapital"
                              rules={[
                                {
                                  required: true,
                                  message: Notification(
                                    `${this.translate(`${prompt}.view.pleaseenter`)}`
                                  ),
                                },
                              ]}
                            >
                              <InputNumber
                                // style={{ width: '50% !important', height: '30px' }}
                                placeholder={this.translate(`${prompt}.view.pleaseenter`)}
                                onChange={(val) => this.changeRate(val)}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form.Item>
                    </Col>
                    {isDomestic === 'withinMainlandChina' && (
                      <Col span={colSpan}>
                        <Form.Item
                          label={this.translate(`${prompt}.field.company.creditcode`)}
                          name="companyIdentity"
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
                    {isDomestic === 'outsideMainlandChina_includingHongKong_Macao_Taiwan' && (
                      <Col span={colSpan}>
                        <Form.Item
                          label={this.translate(`${prompt}.field.company.br`)}
                          name="businessRegistrationNumber"
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
                        label={this.translate(`${prompt}.field.upload.businesslicense`)}
                        className="upload-dragger"
                        name="businessLicenseList"
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
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                          maxCount={1}
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
                        label={this.translate(`${prompt}.field.upload.supplierregistration`)}
                        className="upload-dragger"
                        name="suppRegFileUrlList"
                      >
                        <Dragger
                          customRequest={(file) => this.handleSupplierRegistrationUpload(file)}
                          onChange={this.handleSupplierRegistrationChange}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                          maxCount={1}
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
                          href="https://www.hk.chinamobile.com/upload/onlineshop/NDA-in-Chi-Rec-ver-2020-08-06.pdf"
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
                        label={this.translate(`${prompt}.field.upload.nondisclosure`)}
                        className="upload-dragger"
                        name="ndaFileUrlList"
                        rules={[
                          {
                            required: true,
                            message: Notification(
                              `${this.translate(`${prompt}.view.pleaseupload`)} ${this.translate(
                                `${prompt}.field.upload.nondisclosure`
                              )}`
                            ),
                          },
                        ]}
                      >
                        <Dragger
                          customRequest={(file) => this.handleNondisclosureUpload(file)}
                          onChange={this.handleNondisclosureChange}
                          accept=".jpeg,.png,.gif,.bmp,.jpg,.pdf,.txt,.doc,.docx,.xlsx"
                          maxCount={1}
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
                          href="https://www.hk.chinamobile.com/upload/export/sites/default/content/images/Tender/SupplierRegistrationForm.doc"
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
            <Modal
              closable={false}
              destroyOnClose
              title={this.translate(`${prompt}.view.modal.title`)}
              open={currencyBox}
              onCancel={this.handleCancelBox}
              onOk={this.handleOkCurrency}
              cancelText={this.translate(`${prompt}.view.modal.cancel`)}
              okText={this.translate(`${prompt}.view.modal.ok`)}
              width={900}
            >
              <Form ref={this.currencyFormRef}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label={this.translate(`${prompt}.view.modal.query.currencysymbol`)}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      name="currencyCode"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={this.translate(`${prompt}.view.modal.query.currencyname`)}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      name="currencyName"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col
                    span={24}
                    className="search-form-buttons"
                    style={{ marginTop: '-10px', marginBottom: '14px', textAlign: 'right' }}
                  >
                    <Button onClick={this.handleReset}>
                      {this.translate(`${prompt}.view.modal.reset`)}
                    </Button>
                    <Button onClick={this.getCurrency} type="primary">
                      {this.translate(`${prompt}.view.modal.query`)}
                    </Button>
                  </Col>
                </Row>
              </Form>
              <Table {...listProps} />
              {/* <LocaleProvider locale={language === 'en_US' ? undefined : zhCN}> */}
              <Pagination
                showSizeChanger
                onChange={(page) =>
                  this.getCurrency({
                    current: page,
                    pageSize: currencyPagination.pageSize,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showSizeChanger: true,
                    showTotal: currencyPagination?.total,
                    total: currencyPagination?.total,
                  })
                }
                defaultCurrent={1}
                defaultPageSize={10}
                total={currencyPagination?.total}
                style={{ textAlign: 'right', marginRight: '-8px', marginTop: '16px' }}
              />
              {/* </LocaleProvider> */}
            </Modal>
            <Modal
              title={this.translate(`${prompt}.view.modal.check`)}
              destroyOnClose
              open={closeChosen}
              onCancel={this.handleCancelClose}
              onOk={this.handleOkClose}
              cancelText={this.translate(`${prompt}.view.modal.cancel`)}
              okText={this.translate(`${prompt}.view.modal.ok`)}
              width={550}
              confirmLoading={registerLoading}
            >
              <span>
                {this.translate(`${prompt}.field.companyName`)}：
                <span>{newResultInfo.supplierName}</span>
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.contactper`)}：{newResultInfo.contact}
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.contacphone`)}：
                {newResultInfo.contactinformation}
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.email`)}：{newResultInfo.mail}
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.address`)}：{newResultInfo.contactAddress}
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.Registadd`)}：
                <span>{newResultInfo.region}</span>
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.establishmentime`)}:{' '}
                {dateRender(newResultInfo.establishmentTime)}
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.company.registeredcapital`)}:{' '}
                {numberRender(newResultInfo.registeredCapital, 2)} ({newResultInfo.currency})
              </span>
              <br />
              {isDomestic === 'withinMainlandChina' ? (
                <>
                  <span>
                    {this.translate(`${prompt}.field.company.creditcode`)}：
                    <span>{newResultInfo.companyIdentity}</span>
                  </span>
                  <br />
                </>
              ) : (
                <>
                  <span>
                    {this.translate(`${prompt}.field.company.br`)}：
                    <span>{newResultInfo.businessRegistrationNumber}</span>
                  </span>
                  <br />
                </>
              )}
              <span>
                {this.translate(`${prompt}.field.upload.businesslicense`)}：
                <span>{newResultInfo.fileNamesBus}</span>
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.upload.nondisclosure`)}：
                <span>{newResultInfo.fileNamesNda}</span>
              </span>
              <br />
              <span>
                {this.translate(`${prompt}.field.upload.supplierregistration`)}：
                <span>{newResultInfo.fileNamesSupplierRegistration}</span>
              </span>
              <br />
              <p />
              <div style={{ color: '#a19b9b', fontSize: '12px' }}>
                {this.translate(`${prompt}.view.modal.modalRemarkOne`)}
              </div>
              <div style={{ color: '#a19b9b', fontSize: '12px' }}>
                {this.translate(`${prompt}.view.modal.modalRemarkTwo`)}
              </div>
            </Modal>
          </>
        )}
        {!isTrue && <Success PageBack={this.PageBack} />}
      </>
    );
  }
}

export default MyComponentDict;
