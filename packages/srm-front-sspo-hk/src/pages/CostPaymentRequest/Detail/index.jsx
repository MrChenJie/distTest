import React, { PureComponent } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse, LocaleProvider, Avatar, Spin } from 'hzero-ui';
import intl from 'utils/intl';
import querystring from 'querystring';
import { Icon, notification, Tag } from 'choerodon-ui';
import request from 'utils/request';
import { numberRender, dateRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import './index.less';
import {
  Button,
  Form,
  DataSet,
  Lov,
  TextField,
  TextArea,
  Modal,
  Select,
  CheckBox,
  DatePicker,
  Tooltip,
  Row,
  Col,
  NumberField,
  Output,
} from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { isObject, isString } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getCurrentLanguage,
  getResponse,
} from 'utils/utils';
import { queryIdpValue } from 'services/api';
import { SRM_SPUC, SRM_PLATFORM } from '_utils/config';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import detailInfo from './dataset/detailInfoDS';
import InvoiceTable from './components/InvoiceTable';
import AttachFiles from './components/AttachFiles';
import CoaInfo from './components/CoaInfo';
import InvoiceSplit from './components/InvoiceSplit';
import invoiceInfo from './dataset/invoiceTableDS';
import invoiceLIneInfo from './dataset/invoiceLineInfoDS';
import coaAccountInfo from './dataset/coaInfoDS';
import attachFileInfo from './dataset/attachFileInfoDS';
import ApprovalList from './components/ApprovalList';
import { getStringBytes, interceptString } from './utils';
import ProductTypeModal from './components/ProductTypeModal/index';
import { fastCodeLoader } from '@/utils/decorators';
import { closeWindow } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const { ERP_HOST } = process.env;
const currentUser = getCurrentUser();
const { Option } = Select;
const { Panel } = Collapse;
const { CheckableTag } = Tag;
notification.config({
  placement: 'bottomRight',
  duration: 6.0,
});

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

const prompt = 'spcm.costPayment';
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['SPFM.ICON_LINK_CONFIG'])
export default class CostPaymentRequestDetail extends PureComponent {
  constructor(props) {
    super(props);
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    this.invoiceInfoDS.bind(this.detailInfoDS, 'costDetailInvoiceList');
    this.invoiceLineInfoDS.bind(this.invoiceInfoDS, 'costDetailLineList');
    this.attachFilesDS.bind(this.detailInfoDS, 'costAttachFileList');
    this.attachOtherFilesDS.bind(this.detailInfoDS, 'costAttachOtherFileList');
    this.coaInfoDS.bind(this.invoiceLineInfoDS, 'costCoaAccount');
    this.taxCoaInfoDS.bind(this.invoiceLineInfoDS, 'taxCostCoaAccount');
    this.state = {
      requestStatus: '',
      currencyCode: '',
      isCreate: false,
      isSubmitBtn: false,
      employeeName: '',
      costRequestId: '',
      companyCode: '',
      requestStatusFlag: '',
      currentOperatorFlag: false,
      isSave: false,
      defaultFlag: true,
      dMgMFlag: false,
      withholdingTaxFlag: false,
      financeFlag: false,
      archiveFlag: false,
      fileFlag: false,
      showSave: true,
      loading: false,
      mipSubLoading: false,
      costRequestLoading: false,
      requestTitleLen: 0,
      requestRemarkLen: 0,
      approvalRequestHeaderVO: {},
      approvalReqRecVOList: [],
      approvalRequestButtonVOList: [],
      activeKey: ['headInfo', 'bankInfo', 'payInfo', 'fileInfo', 'approvalInfo'],
      submitErrorMessage: '',
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      open,

      productTypeModalVisible: false,
      productTypeCodes: [],
      productTypeModalConfirmLoading: false,
    };
  }

  /**
   * 获取当前员工
   */
  getEmployeeName() {
    request(`/hpfm/v1/${organizationId}/employees/employee-num`, {
      method: 'GET',
      query: {
        organizationId,
        employeeNum: currentUser.loginName,
      },
    }).then((res) => {
      if (res) {
        if (res.failed) {
          notification.error({
            message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
            description: res.message,
          });
          return;
        }
        const employeeName = getCurrentLanguage() === 'en_US' ? res.nameEn : res.name;
        this.setState(
          {
            employeeName,
          },
          () => {
            this.detailInfoDS.current.set('requestEmployeeName', employeeName);
            this.detailInfoDS.current.set('requestEmployeeNum', currentUser.loginName);
          }
        );
      }
    });
  }

  /**
   * 获取当前用户的公司主体
   */
  getCompanyName() {
    request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/getDefaultCompanyCode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).then((res) => {
      if (res) {
        if (res.failed) {
          return;
        }
        // 获取默认公司主体code
        this.setState(
          {
            companyCode: res ? res.companyCode : '',
          },
          () => {
            this.detailInfoDS.current.set('companyOrgName', res ? res.companyCode : '');
            this.changeOrgName();
          }
        );
      }
    });
  }

  /**
   * 组件加载时触发
   */
  componentDidMount() {
    window.addEventListener('message', this.receiveMessage, false);
    const {
      match: { params },
      location,
    } = this.props;
    // 新增
    if (params.costRequestId === '-1') {
      // 判断是否为新增 获取所需默认值
      this.setState({
        isCreate: true,
      });
      this.getEmployeeName();
      this.getCompanyName();
      try {
        this.invoiceInfoDS.records.clear();
        this.invoiceLineInfoDS.records.clear();
      } catch (e) {
        console.log(e);
      }
    } else {
      this.detailInfoDS.query();
      this.setState({
        isSave: true,
        isCreate: false,
        costRequestLoading: true,
      });
      // 导入发票成功 获取审批流
      const { query } = location;
      if (query) {
        this.workFlowDetailInfo(+params.costRequestId, 30);
      } else {
        this.workFlowDetailInfo(+params.costRequestId, 2);
      }
    }
    this.fetchProductTypeCodes();
  }

  componentDidUpdate() {
    this.changeHelpIcon();
  }

  /**
   * 改变表单提示图标
   *
   * @memberof CostPaymentRequestDetail
   */
  changeHelpIcon() {
    const icons = document.querySelectorAll('.c7n-pro-field-wrapper .icon-help');
    icons.forEach((node) => {
      // eslint-disable-next-line no-param-reassign
      node.className = 'icon icon-error_outline';
      // eslint-disable-next-line no-param-reassign
      node.style.color = '#0085d0';
      // eslint-disable-next-line no-param-reassign
      node.style.fontWeight = 'bold';
    });
  }

  // 审批流监听
  @Bind
  receiveMessage(param) {
    // const {
    //   approvalRequestHeaderVO: { currentNodeName },
    // } = this.state;
    const {
      data: { routerParam = {} },
    } = param;
    if (routerParam.opt === 'ok') {
      Modal.destroyAll();
      const { approvalRequestHeaderVO = {} } = this.state;
      const { currentNodeName } = approvalRequestHeaderVO;
      if (this.optionButtonKey === 'submitName' && currentNodeName === '11 财务第一复核人审批') {
        this.pollingWorkFLowDetail('12 财务第二复核人审批');
        return false;
      }
      this.getDataSetDetail(false);
      // 财务复核第一 第二阶段 提交审批后不关闭窗口
      if (
        currentNodeName &&
        currentNodeName.slice(0, 2) !== '11' &&
        currentNodeName.slice(0, 2) !== '12'
      ) {
        window.close();
      }
      // 飞书提交审批后关闭tag页
      closeWindow();
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      this.getDataSetDetail(false);
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      window.location.reload();
    }
  }

  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener('message', this.receiveMessage);
    // 组件卸载时，取消倒计时
    clearInterval(this.requestInterval);
  }

  // 详情查询
  @Bind
  getDataSetDetail(flag = false) {
    const { match = {} } = this.props;
    const { params } = match;
    let num = 5;
    if (flag) {
      this.setState({
        loading: true,
      });
      this.timer = setInterval(() => {
        this.workFlowDetailInfo(+params.costRequestId, 1);
        num -= 1;
        if (num <= 0) {
          this.setState({
            loading: false,
          });
          clearInterval(this.timer);
        }
      }, 1000);
    } else {
      this.workFlowDetailInfo(+params.costRequestId, 1);
    }
    this.detailInfoDS.query();
  }

  detailInfoDS = new DataSet({
    ...detailInfo(prompt),
    transport: {
      submit: () => {
        const url = `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/save`;
        return {
          url,
          method: 'POST',
          transformRequest: (data) => {
            this.setState({ costRequestLoading: true });
            const {
              costDetailInvoiceList,
              costAttachFileList,
              costAttachOtherFileList,
              ...costPaymentRequest
            } = data[0];
            const { requestTitle } = costPaymentRequest;
            const cosIf = requestTitle ? requestTitle.split('COS-') : '';
            const detail = {
              costPaymentRequest: {
                ...costPaymentRequest,
                requestTitle: cosIf.length <= 1 ? `COS-${requestTitle}` : requestTitle,
              },
              costDetailInvoiceList: this.getRequestInvoiceList(costDetailInvoiceList),
              costAttachFileList: [...costAttachFileList, ...costAttachOtherFileList],
            };
            return JSON.stringify(detail);
          },
          transformResponse: (data) => {
            return this.detailTransformResponse(data);
          },
        };
      },
      read: () => {
        const { match = {} } = this.props;
        const { params } = match;
        const { costRequestId } = params;
        if (costRequestId !== '-1') {
          const url = `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/no-cascade/${costRequestId}`;
          return {
            url,
            method: 'GET',
            transformResponse: (data) => {
              const responseData = JSON.parse(data);
              const { requestTitle, requestStatus, returnRequestId } = responseData;
              const cosIf = requestTitle ? requestTitle.split('COS-') : '';
              this.setState({
                costRequestId: responseData.costRequestId,
                returnRequestId,
                requestStatus,
                requestStatusFlag: requestStatus,
              });
              return {
                ...responseData,
                requestTitle: cosIf.length <= 1 ? requestTitle : cosIf[cosIf.length - 1],
              };
            },
          };
        }
      },
    },
    events: {
      submitSuccess: () => {
        return false;
      },
      load: ({ dataSet }) => {
        const requestStatus = dataSet.current.getField('requestStatus').getValue();
        if (requestStatus === 'DRAFT') {
          this.charChange(dataSet.current.getField('requestTitle').getValue(), 'requestTitle');
          this.charChange(dataSet.current.getField('requestRemarks').getValue(), 'requestRemarks');
        }
      },
      update: ({ dataSet, name, value }) => {
        if (name === 'ouOrgCode') {
          if (value === 'CMI') {
            const currencyCode = dataSet.current.get('currencyCode');
            const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
            const { children } = dataSet;
            const { costDetailInvoiceList } = children;
            if (!costDetailInvoiceList.records.length) return;
            costDetailInvoiceList.records.forEach((line) => {
              const { costDetailLineList } = line.dataSetSnapshot;
              if (costDetailLineList) {
                costDetailLineList.records.forEach((i) => {
                  i.set('invoiceTaxAmount', null);
                });
                // 统计发票明细行上的 发票行金额 到发票头
                const invoiceAmount = costDetailLineList.records.reduce((total, currentValue) => {
                  return total + currentValue.get('lineAmount');
                }, 0);
                line.set('invoiceAmount', Number(numberRender(invoiceAmount, precision, false)));
                line.set('invoiceTaxAmount', 0);
                line.set(
                  'excludingTaxAmount',
                  Number(numberRender(invoiceAmount, precision, false))
                );
              } else {
                // 如果是其他发票的行明细还未请求加载时 把头上的税额清零
                const invoiceAmount = line.get('invoiceAmount');
                line.set('invoiceAmount', invoiceAmount);
                line.set('invoiceTaxAmount', 0);
                line.set('excludingTaxAmount', invoiceAmount);
              }
            });
          }
        }
      },
    },
  });

  invoiceInfoDS = new DataSet({
    ...invoiceInfo(this.detailInfoDS, prompt),
    transport: {
      read: () => {
        const url = `${SRM_SPUC}/v1/${organizationId}/cost-detail-invoices`;
        return {
          url,
          method: 'GET',
          transformRequest: (data) => {
            const { costRequestId } = data;
            return costRequestId;
          },
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/cost-detail-invoices`,
          method: 'DELETE',
        };
      },
    },
  });

  invoiceLineInfoDS = new DataSet({
    ...invoiceLIneInfo(this.detailInfoDS, prompt),
    transport: {
      read: () => {
        const url = `${SRM_SPUC}/v1/${organizationId}/cost-detail-lines`;
        return {
          url,
          method: 'GET',
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/cost-detail-lines`,
          method: 'DELETE',
        };
      },
    },
  });

  // cos 账户组合
  coaInfoDS = new DataSet({ ...coaAccountInfo() });

  // 税账户组合
  taxCoaInfoDS = new DataSet({ ...coaAccountInfo() });

  // 重要附件
  attachFilesDS = new DataSet({ ...attachFileInfo(prompt, true) });

  // 其他附件
  attachOtherFilesDS = new DataSet({ ...attachFileInfo(prompt, false) });

  remarkDS = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'select',
        type: 'string',
      },
      {
        name: 'remark',
        type: 'string',
      },
    ],
  });

  /**
   * 将前端级联的发票信息改成后端的结构
   * @param {请求时级联的发票信息} costDetailInvoiceList
   */
  @Bind()
  getRequestInvoiceList(costDetailInvoiceList) {
    const invoiceList = [];
    if (!costDetailInvoiceList) {
      return invoiceList;
    }
    for (let index = 0; index < costDetailInvoiceList.length; index++) {
      const element = costDetailInvoiceList[index];
      const { costDetailLineList, ...costDetailInvoice } = element;
      invoiceList.push({
        costDetailInvoice,
        costDetailLineList: this.getRequestInvoiceLineList(costDetailLineList),
      });
    }
    return invoiceList;
  }

  /**
   * 将前端级联的发票行信息改成后端的结构
   * @param {请求时级联的发票行信息} costDetailInvoiceList
   */
  @Bind()
  getRequestInvoiceLineList(costDetailLineList) {
    const invoiceLIneList = [];
    if (!costDetailLineList) {
      return invoiceLIneList;
    }
    for (let index = 0; index < costDetailLineList.length; index++) {
      const element = costDetailLineList[index];
      const { costCoaAccount, taxCostCoaAccount, payCurrencyCode, ...costDetailLine } = element;
      const { costProductCategoryName = {} } = costDetailLine;
      const { costProductCategory } = costProductCategoryName;
      invoiceLIneList.push({
        costDetailLine: {
          ...costDetailLine,
          costProductCategoryName: costProductCategory || null,
        },
        costCoaAccount: costCoaAccount ? costCoaAccount[0] : null,
        taxCostCoaAccount: taxCostCoaAccount ? taxCostCoaAccount[0] : null,
      });
    }
    return invoiceLIneList;
  }

  /**
   * 将后端的结构改成前端的结构
   * @param {后端返回的发票信息} costDetailInvoiceList
   */
  @Bind()
  getResponseDetailInvoiceList(costDetailInvoiceList) {
    const result = [];
    if (!costDetailInvoiceList) {
      return result;
    }
    for (let index = 0; index < costDetailInvoiceList.length; index++) {
      const element = costDetailInvoiceList[index];
      const { costDetailInvoice, costDetailLineList, costAttachFileList } = element;
      result.push({
        ...costDetailInvoice,
        costDetailLineList: this.getResponsecostDetailLineList(costDetailLineList),
        costAttachFileList,
      });
    }
    return result;
  }

  /**
   * 将后端返回的发票行改成前端的结构
   * @param {后端返回的发票行} costDetailLineList
   */
  @Bind()
  getResponsecostDetailLineList(costDetailLineList) {
    const result = [];
    if (!costDetailLineList) {
      return result;
    }
    for (let index = 0; index < costDetailLineList.length; index++) {
      const element = costDetailLineList[index];
      const { costDetailLine, costCoaAccount, taxCostCoaAccount } = element;
      result.push({
        ...costDetailLine,
        costCoaAccount: [costCoaAccount],
        taxCostCoaAccount: [taxCostCoaAccount],
      });
    }
    return result;
  }

  /**
   * 查询与保存详情时对返回结果进行处理
   * @param {返回数据} data
   */
  @Bind()
  detailTransformResponse(data) {
    this.setState({
      costRequestLoading: true,
      isCreate: false,
    });
    // 防止类似没有权限的错误无法显示
    if (!isJSON(data)) {
      return;
    }
    const requestVO = JSON.parse(data);
    if (requestVO.failed) {
      this.setState({
        costRequestLoading: false,
      });
      return requestVO;
    }
    this.setState({
      isSave: true,
    });
    const { match = {}, history } = this.props;
    const { isPub, open } = this.state;
    const { params } = match;
    const { costPaymentRequest } = requestVO;
    const { costRequestId } = params;
    if (costRequestId !== `${costPaymentRequest.costRequestId}`) {
      history.push({
        pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/detail/${
          costPaymentRequest.costRequestId
        }`,
        search: `${open ? '?open=fs' : ''}`,
      });
    }
    this.setState({
      costRequestId: costPaymentRequest.costRequestId,
      requestStatusFlag: costPaymentRequest.requestStatus,
    });
    this.coaInfoDS.queryParameter = {
      coaAccountId: '',
    };
    this.taxCoaInfoDS.queryParameter = {
      coaAccountId: '',
    };
    this.detailInfoDS.query();
    // 获取审批流-----------------------------------------------------------
    this.workFlowDetailInfo(costPaymentRequest.costRequestId, 30);
    //--------------------------------------------------------------------
    return false;
  }

  /**
   * 点击发票详情按钮展示发票行信息
   */
  @Bind()
  lineDetailCommand() {
    const { defaultFlag, financeFlag } = this.state;
    return {
      header: intl.get('hzero.common.button.edit').d('编辑'),
      width: 120,
      align: 'left',
      hidden: !defaultFlag && !financeFlag,
      lock: 'left',
      renderer: ({ record }) => {
        return (
          <div style={{ height: '100%', display: 'flex', textAlign: 'left', alignItems: 'center' }}>
            <Tooltip placement="top" title={intl.get('hzero.common.button.edit').d('编辑')}>
              <Button
                funcType="flat"
                color="default"
                style={{ display: financeFlag || defaultFlag ? '' : 'none' }}
                icon="edit-o"
                onClick={() => this.editInvoiceLine(record)}
              />
            </Tooltip>
            <Tooltip
              placement="top"
              title={intl.get(`${prompt}.view.detail.createInvoiceNum`).d('生成发票号码')}
            >
              <Button
                funcType="flat"
                color="default"
                style={{ display: defaultFlag ? '' : 'none' }}
                icon="number"
                onClick={() => this.createInvoiceNum(record)}
              />
            </Tooltip>
          </div>
        );
      },
    };
  }

  @Bind()
  coaDetailCommand() {
    const { financeFlag, currentOperatorFlag } = this.state;
    return {
      hidden: !financeFlag && !currentOperatorFlag,
      header: 'COA',
      width: 80,
      align: 'left',
      lock: 'left',
      command: ({ record }) => [
        <div style={{ height: '100%', display: 'flex', textAlign: 'left', alignItems: 'center' }}>
          <Button
            funcType="flat"
            color="default"
            icon="view_list-o"
            onClick={() => this.showCoa(record)}
          />
        </div>,
      ],
    };
  }

  @Bind()
  invoiceSplitCommand() {
    const { financeFlag, currentOperatorFlag } = this.state;
    // 第一 第二复核界面拆分发票行
    return {
      hidden: !financeFlag && !currentOperatorFlag,
      header: intl.get(`${prompt}.view.detail.pendingApportion.preview`).d('待摊预览'),
      width: 80,
      align: 'left',
      lock: 'left',
      command: ({ record }) => [
        <div style={{ height: '100%', display: 'flex', textAlign: 'left', alignItems: 'center' }}>
          <Button
            funcType="flat"
            color="default"
            icon="search"
            onClick={() => this.showInvioceSplit(record)}
          />
        </div>,
      ],
    };
  }

  /**
   * 合同名称链接
   * @returns {{width: number, header: *, align: string, command: (function({record?: *}): (void|*)[])}}
   */
  @Bind()
  contractNameField() {
    return {
      header: intl.get(`${prompt}.view.detail.line.contractName`).d('合同名称'),
      width: 150,
      align: 'left',
      command: ({ record }) => [
        <a
          key="contractNameUrl"
          href={ERP_HOST.concat('/publicAction.do?method=contractView&account=')
            .concat(currentUser.loginName)
            .concat('&contractId=')
            .concat(record.data.contractId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {record.data.contractName}
        </a>,
      ],
    };
  }

  @Bind
  changePayCurrencyCode(pay, record) {
    record.set('payCurrencyCode', pay.currencyCode || null);
  }

  @Bind
  changeTaxAgencyName(value, record) {
    record.set('withholdingTaxVendorNum', value.bankAccountNum || null);
    record.set('withholdingTaxVendorName', value.bankAccountName || null);
    record.set('withholdingTaxVendorSite', value.vendorSiteCode || null);
  }

  // 根据规格生成发票号码
  @Bind
  createInvoiceNum(record) {
    // 发票号码生成规则为：
    // 获取当前发票头数据
    if (!this.invoiceLineInfoDS.records.length) {
      notification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl.get(`${prompt}.view.detail.noInvoiceLines`).d('请录入发票行'),
      });
      return;
    }
    const reg = RegExp('M2M|MVNO|GDS|JEGOTRIP');
    const invoiceLines = this.invoiceLineInfoDS.records.every((v) => {
      return reg.exec(v.data.costBigCategory) && reg.exec(v.data.costBigCategory).index === 0;
    });
    if (!invoiceLines) {
      notification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.validateCostBigCategory`)
          .d('发票号码自动生成仅适用于成本大类为M2M,GDS,MVNO,JEGO的业务'),
      });
      return;
    }
    // 获取服务开始日期list
    const serviceStartList = this.invoiceLineInfoDS.records.map((v) => {
      return v.data.serviceStartDate ? v.data.serviceStartDate.format('YYYYMMDD') : false;
    });
    // 获取服务结束日期list
    const serviceEndList = this.invoiceLineInfoDS.records.map((v) => {
      return v.data.serviceEndDate ? v.data.serviceEndDate.format('YYYYMMDD') : false;
    });
    // 服务开始时间-服务结束时间 Math.max(...arr)
    if (
      !serviceStartList.length ||
      !serviceEndList.length ||
      serviceStartList.includes(false) ||
      serviceEndList.includes(false)
    ) {
      notification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.service-message`)
          .d('请输入服务开始日期/服务结束日期'),
      });
      return;
    }
    // 获取成本大类list
    const costBigCategoryList = this.invoiceLineInfoDS.records.map((v) => {
      return reg.exec(v.data.costBigCategory)[0];
    });
    // 1. 当用户录入的发票行中成本大类为“M2M、MVNO、GDS、JEGOTRIP”中任意一个时，可用户选择触发发票编号生成；
    const onlyCategory = costBigCategoryList.map((i) => {
      return i === costBigCategoryList[0];
    });
    if (onlyCategory.includes(false)) {
      notification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: intl
          .get(`${prompt}.view.detail.costBigCategory-message`)
          .d('仅适用于发票行成本大类为M2M/MVNO/GDS/JEGOTRIP的业务'),
      });
    } else {
      // 成本大类
      const bigCategory = reg.exec(costBigCategoryList[0])[0];
      // OU短码
      const ouOrgCode = this.detailInfoDS.getField('ouOrgCode').getValue();
      if (!ouOrgCode) {
        notification.error({
          message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
          description: intl.get(`${prompt}.view.detail.OrgName-message`).d('请选择公司主体'),
        });
        return;
      }
      // 供应商编号
      const vendorCompanyNum = this.detailInfoDS.getField('vendorCompanyNum').getValue();
      if (!vendorCompanyNum) {
        notification.error({
          message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
          description: intl
            .get(`${prompt}.view.detail.vendorCompany-message`)
            .d('请选择供应商名称'),
        });
        return;
      }
      const serviceStartDate = Math.min(...serviceStartList);
      const serviceEndDate = Math.max(...serviceEndList);
      // 2. 发票号码生成规则为“成本大类_OU短码_供应商编号_服务开始时间-服务结束时间“，其中成本大类即为发票行第一行中的成本大类（英文）； costBigCategory costSmallCategory
      const invoiceNum = `${bigCategory}_${ouOrgCode}_${vendorCompanyNum}_${serviceStartDate}-${serviceEndDate}`;
      // 3. 当用户修改发票行第一行中的成本大类，或删除第一行发票时，发票号码不变；
      // 4. 发票号码生成按钮提示用户“仅适用于发票行首行成本大类为M2M/MVNO/GDS/JEGOTRIP的业务”
      record.set('invoiceNum', invoiceNum);
    }
  }

  @Bind
  numRenderder(value) {
    const currencyCode = this.detailInfoDS.current.get('currencyCode');
    const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
    return numberRender(value, precision);
  }

  @Bind
  stepRenderder() {
    const currencyCode = this.detailInfoDS.current.get('currencyCode');
    const step = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
    return step;
  }

  @Bind
  editInvoiceLine(record) {
    const {
      defaultFlag,
      withholdingTaxFlag,
      financeFlag,
      archiveFlag,
      currentOperatorFlag,
    } = this.state;
    // 编辑窗口
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.button.edit').d('编辑'),
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      style: {
        top: 50,
        width: '50%',
      },
      children: (
        <Form style={{ width: '100%' }} record={record} useColon labelWidth={140}>
          <TextField name="invoiceNum" disabled={!defaultFlag && !financeFlag} />
          <DatePicker name="invoiceDate" disabled={!defaultFlag} placeholder="Select date" />
          <TextField name="description" disabled={!defaultFlag && !financeFlag} />
          <NumberField name="invoiceAmount" renderer={({ value }) => this.numRenderder(value)} />
          <NumberField name="invoiceTaxAmount" renderer={({ value }) => this.numRenderder(value)} />
          <NumberField
            name="excludingTaxAmount"
            renderer={({ value }) => this.numRenderder(value)}
          />
          <CheckBox name="instalmentFlag" disabled={!defaultFlag} />
          <NumberField name="paymentCount" disabled={!defaultFlag} step={1} min={0} />
          <NumberField
            name="billTotalAmount"
            disabled={!defaultFlag}
            renderer={({ value }) => this.numRenderder(value)}
            step={this.stepRenderder()}
            min={0}
          />
          <TextField name="ebsInvoiceNum" />
          <NumberField
            label={
              <span style={{ color: 'red' }}>
                {intl.get(`${prompt}.view.detail.invoice.exchangeRate`).d('(税务)发票汇率')}
              </span>
            }
            disabled={!financeFlag && !defaultFlag}
            name="exchangeRate"
            step={0.000001}
            max={9999999}
            min={0}
          />
          <Lov
            dataSet={this.invoiceInfoDS}
            name="payCurrencyCode"
            disabled={!defaultFlag}
            onChange={(value) => this.changePayCurrencyCode(value, record)}
          />
          <NumberField name="payExchangeRate" disabled={!defaultFlag} step={0.01} min={0} />
          <NumberField
            name="payAmount"
            disabled={!defaultFlag}
            step={this.stepRenderder()}
            min={0}
          />
          {(withholdingTaxFlag || archiveFlag) && (
            <TextField disabled={!withholdingTaxFlag} name="withholdingTaxVendorNum" />
          )}
          {(withholdingTaxFlag || archiveFlag) && (
            <Lov
              disabled={!withholdingTaxFlag}
              dataSet={this.invoiceInfoDS}
              name="withholdingTaxVendorName"
              onChange={(value) => this.changeTaxAgencyName(value, record)}
            />
          )}
          {(withholdingTaxFlag || archiveFlag) && (
            <NumberField
              disabled={!withholdingTaxFlag}
              name="withholdingTaxAmount"
              step={this.stepRenderder()}
              min={0}
            />
          )}
          {(withholdingTaxFlag || archiveFlag) && (
            <TextField disabled={!withholdingTaxFlag} name="withholdingTaxRemarks" />
          )}
          {(financeFlag || currentOperatorFlag) && (
            <TextField
              label={
                <span style={{ color: 'red' }}>
                  {intl.get(`${prompt}.view.detail.invoice.vendorSiteCode`).d('供应商地点')}
                </span>
              }
              name="vendorSiteCode"
              disabled={!financeFlag}
            />
          )}
          {(financeFlag || archiveFlag) && (
            <DatePicker
              label={
                <span style={{ color: 'red' }}>
                  {intl.get(`${prompt}.view.detail.invoice.glDate`).d('GL Date')}
                </span>
              }
              disabled={!financeFlag}
              name="glDate"
            />
          )}
          {(financeFlag || archiveFlag) && (
            <TextField
              label={
                <span style={{ color: 'red' }}>
                  {intl.get(`${prompt}.view.detail.invoice.sscSuggestion`).d('(税务)SSC意见')}
                </span>
              }
              disabled={!financeFlag}
              name="sscSuggestion"
            />
          )}
        </Form>
      ),
    });
  }

  @Bind()
  showInvoiceLine(record) {
    const costInvoiceId = record.get('costInvoiceId');
    if (costInvoiceId) {
      this.invoiceLineInfoDS.queryParameter = {
        costInvoiceId,
      };
      this.invoiceLineInfoDS.query();
    }
  }

  @Bind()
  showCoa(record) {
    this.coaInfoDS.records.clear();
    this.taxCoaInfoDS.records.clear();
    this.coaInfoDS.queryParameter = {
      coaAccountId: record.get('coaAccountId') ? record.get('coaAccountId') : -1,
    };
    this.taxCoaInfoDS.queryParameter = {
      coaAccountId: record.get('taxAccountId') ? record.get('taxAccountId') : -1,
    };
    Modal.open({
      key: Modal.key(),
      title: 'COA',
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      style: {
        top: 50,
        width: '50%',
      },
      onOk: this.coaSave,
      children: CoaInfo(
        this.coaInfoDS,
        this.invoiceLineInfoDS,
        this.taxCoaInfoDS,
        this.state.defaultFlag,
        this.state.financeFlag,
        this.state.withholdingTaxFlag
      ),
    });
  }

  // 获取发票拆分行信息
  showInvioceSplit(record) {
    const { data } = record;
    const params = {
      currencyCode: this.detailInfoDS.current.getField('currencyCode').getValue() || null,
      glDate: this.invoiceInfoDS.current.getField('glDate').getValue() || null,
      costDetailLine: {
        ...data,
        serviceStartDate: data.serviceStartDate
          ? data.serviceStartDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        serviceEndDate: data.serviceEndDate
          ? data.serviceEndDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        apportionStartDate: data.apportionStartDate
          ? data.apportionStartDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
        apportionEndDate: data.apportionEndDate
          ? data.apportionEndDate.format(DEFAULT_DATETIME_FORMAT)
          : null,
      },
    };
    request(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines/getSplitInvoiceLine`, {
      method: 'POST',
      body: params,
    }).then((res) => {
      Modal.open({
        key: Modal.key(),
        title: intl.get(`${prompt}.view.detail.pendingApportion.preview`).d('待摊预览'),
        maskClosable: true,
        closable: true,
        destroyOnClose: true,
        footer: null,
        style: {
          top: 50,
        },
        children: InvoiceSplit({
          prompt,
          res,
        }),
      });
    });
  }

  // coa保存
  @Bind
  coaSave() {
    this.detailInfoDS.submit();
  }

  @Bind
  // 保存获取当前页面数据
  getSaveData() {
    const costPaymentRequest = this.detailInfoDS.current.data;
    const costDetailInvoiceList = this.invoiceInfoDS.records.map((i) => {
      let list = [];
      const { costDetailLineList } = i.dataSetSnapshot;
      if (costDetailLineList) {
        list = costDetailLineList.records.map((v) => {
          return {
            ...v.data,
            serviceStartDate: v.data.serviceStartDate
              ? v.data.serviceStartDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
            serviceEndDate: v.data.serviceEndDate
              ? v.data.serviceEndDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
            apportionStartDate: v.data.apportionStartDate
              ? v.data.apportionStartDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
            apportionEndDate: v.data.apportionEndDate
              ? v.data.apportionEndDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
          };
        });
      }
      return {
        ...i.data,
        glDate: i.data.glDate ? i.data.glDate.format('YYYY-MM-DD HH:mm:ss') : null,
        invoiceDate: i.data.invoiceDate ? i.data.invoiceDate.format('YYYY-MM-DD HH:mm:ss') : null,
        costDetailLineList: list,
      };
    });
    const costAttachFileList = this.attachFilesDS.records.map((v) => {
      return {
        ...v.data,
        creationDate: v.data.creationDate
          ? v.data.creationDate.format('YYYY-MM-DD HH:mm:ss')
          : null,
      };
    });
    const costAttachOtherFileList = this.attachOtherFilesDS.records.map((v) => {
      return {
        ...v.data,
        creationDate: v.data.creationDate
          ? v.data.creationDate.format('YYYY-MM-DD HH:mm:ss')
          : null,
      };
    });
    return {
      costPaymentRequest,
      costDetailInvoiceList,
      costAttachFileList,
      costAttachOtherFileList,
    };
  }

  // 保存
  @Bind()
  submit(toSave = false) {
    this.setState({
      costRequestLoading: true,
      isCreate: false,
    });
    const {
      costPaymentRequest,
      costDetailInvoiceList,
      costAttachFileList,
      costAttachOtherFileList,
    } = this.getSaveData();
    request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/save`, {
      method: 'POST',
      body: {
        costPaymentRequest: {
          ...costPaymentRequest,
          requestTitle: `COS-${costPaymentRequest.requestTitle || ''}`,
          requestDate: costPaymentRequest.requestDate
            ? costPaymentRequest.requestDate.format('YYYY-MM-DD HH:mm:ss')
            : null,
        },
        costDetailInvoiceList: this.getRequestInvoiceList(costDetailInvoiceList),
        costAttachFileList: [...costAttachFileList, ...costAttachOtherFileList],
      },
    }).then((res) => {
      this.setState({
        isCreate: false,
      });
      if (res) {
        if (res.failed) {
          this.setState({
            costRequestLoading: false,
          });
          notification.error({
            message: intl.get(`${prompt}.view.query.tip`).d('提示'),
            description: (
              <div style={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>{res.message}</div>
            ),
          });
          return;
        }
        notification.success({
          message: intl.get(`${prompt}.view.query.tip`).d('提示'),
          description: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.setState({
          isSave: true,
        });
        const { match = {}, history } = this.props;
        const { isPub, open } = this.state;
        const { params } = match;
        const { costRequestId } = params;
        if (costRequestId !== `${res.costPaymentRequest.costRequestId}`) {
          history.push({
            pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/detail/${
              res.costPaymentRequest.costRequestId
            }`,
            search: `${open ? '?open=fs' : ''}`,
          });
        }
        if (toSave) {
          this.toExport();
        }
        this.setState({
          costRequestId: res.costPaymentRequest.costRequestId,
          requestStatusFlag: res.costPaymentRequest.requestStatus,
        });
        this.detailInfoDS.query();
        // 获取审批流-----------------------------------------------------------
        this.workFlowDetailInfo(res.costPaymentRequest.costRequestId, 30);
        //--------------------------------------------------------------------
      }
    });
  }

  // 导出 pdf
  @Bind
  exportPdf() {
    const {
      match: { params },
    } = this.props;
    request(
      `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/exportPdf/${params.costRequestId}`,
      {
        method: 'GET',
        responseType: 'blob',
      }
    ).then((res) => {
      if (res) {
        const href = window.URL.createObjectURL(res);
        const fileName = `${this.detailInfoDS.current.getField('requestNum').getValue()}.pdf`;
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(res, fileName);
          } catch (e) {
            console.log(e);
          }
        } else {
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = href;
          // 申请编号 文件名
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  }

  /**
   * 审批流按钮
   * @returns {*[]}
   */
  @Bind
  generateApprovalBtns() {
    const { idpValueMap = {} } = this.props;
    const iconConfigList = idpValueMap['SPFM.ICON_LINK_CONFIG'] || [];
    const { approvalRequestHeaderVO = {}, approvalRequestButtonVOList = [] } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    const { currentNodeName } = approvalRequestHeaderVO;
    return approvalRequestButtonVOList
      .sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      })
      .map((item) => {
        const src = (
          iconConfigList.find((icon) => {
            return item.buttonKey === icon.value;
          }) || {}
        ).tag;
        // 审批节点 12 财务第二复核人审批 currentNodeName
        if (currentNodeName.slice(0, 2) === '12' && item.buttonKey === 'submitName') {
          return (
            <Tooltip placement="top" title={intl.get(`${prompt}.view.detail.submit`).d('提交审批')}>
              <div className="btn" onClick={() => this.openModal(item, true)}>
                <Avatar className="icon" src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className="text"
                >
                  {intl.get(`${prompt}.view.detail.submit`).d('提交审批')}
                </p>
              </div>
            </Tooltip>
          );
        } else if (
          item.buttonKey === 'takingopinionsName' ||
          item.buttonKey === 'forwardName' ||
          item.buttonKey === 'HandleForwardName' ||
          item.buttonKey === 'rejectName' ||
          item.buttonKey === 'isretractName' ||
          item.buttonKey === 'DeleteBtn'
        ) {
          const { processStatus } = this.detailInfoDS.current;
          if (
            processStatus === 'SUCCESS' ||
            (item.buttonKey === 'HandleForwardName' && currentNodeName.slice(0, 2) === '01')
          ) {
            return null;
          } else {
            return (
              <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
                <div className="btn" onClick={() => this.openModal(item)}>
                  <Avatar className="icon" src={src} />
                  <p
                    style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                    className="text"
                  >
                    {isEn ? item.nameE : item.name}
                  </p>
                </div>
              </Tooltip>
            );
          }
        } else {
          return (
            <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
              <div className="btn" onClick={() => this.openModal(item)}>
                <Avatar className="icon" src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className="text"
                >
                  {isEn ? item.nameE : item.name}
                </p>
              </div>
            </Tooltip>
          );
        }
      });
  }

  /**
   * 保存/导出按钮
   * @returns {*[]}
   */
  @Bind
  saveAndSubmit() {
    return (
      <>
        <Button icon="save" onClick={() => this.submit(false)}>
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      </>
    );
  }

  @Bind
  openEipModal(record) {
    // 提交审批成功 打开EIP弹窗
    Modal.open({
      key: Modal.key(),
      title: getCurrentLanguage() === 'en_US' ? record.nameE : record.name,
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      footer: null,
      afterClose: () => {
        this.getDataSetDetail(false);
      },
      style: {
        top: 50,
      },
      children: (
        <iframe
          title="urlContent"
          src={record.url}
          frameBorder="0"
          style={{
            width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
            height: `${record.height}px`,
          }}
          marginWidth="1"
          marginHeight="1"
        />
      ),
    });
  }

  @Bind
  openModal(record, isLastSubmit) {
    this.optionButtonKey = record.buttonKey;
    const { approvalRequestHeaderVO } = this.state;
    this.setState({
      costRequestLoading: true,
    });
    const {
      costPaymentRequest,
      costDetailInvoiceList,
      costAttachFileList,
      costAttachOtherFileList,
    } = this.getSaveData();
    const requestStatus = this.detailInfoDS.getField('requestStatus').getValue();
    // 判断当前按钮是否为提交审批
    if (
      ['submitName', 'takingopinionsName'].includes(record.buttonKey) &&
      (requestStatus === 'DRAFT' ||
        requestStatus === 'PENDING_REVIEW' ||
        requestStatus === 'PENDING_MODIFY' ||
        requestStatus === 'REVOKE' ||
        isLastSubmit)
    ) {
      request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/check`, {
        method: 'POST',
        body: {
          costPaymentRequest: {
            ...costPaymentRequest,
            requestTitle: `COS-${costPaymentRequest.requestTitle || ''}`,
            requestDate: costPaymentRequest.requestDate
              ? costPaymentRequest.requestDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
          },
          costDetailInvoiceList: this.getRequestInvoiceList(costDetailInvoiceList),
          costAttachFileList: [...costAttachFileList, ...costAttachOtherFileList],
          approveHeader: approvalRequestHeaderVO,
        },
      }).then((res) => {
        if (res.warnFlag) {
          this.setState({
            costRequestLoading: false,
          });
          notification.error({
            message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
            description: (
              <div>
                {res.warnMsgList.map((i) => {
                  return <div>{i}</div>;
                })}
              </div>
            ),
          });
          this.getDataSetDetail(false);
          return;
        }
        if (res.failed) {
          let submitErrorMessage = '';
          if (res.message.length) {
            submitErrorMessage = res.message.replace(/;/g, '\n');
          }
          this.setState(
            {
              costRequestLoading: false,
              submitErrorMessage,
            },
            () => {
              this.getDataSetDetail(false);
            }
          );
          return;
        }
        this.setState({
          submitErrorMessage: '',
        });
        if (isLastSubmit) {
          this.setState({
            costRequestLoading: false,
          });
          this.openSubmitModal();
        } else {
          this.setState({
            costRequestLoading: false,
          });
          const { totalAmountHK, companyOrgCode } = this.detailInfoDS.current.toData() || {};
          const { currentNodeName } = approvalRequestHeaderVO;
          // 判断是否为总部，总部编码为1510，是则判断大于100万，否则判断大于50万
          const thresholdAmount = companyOrgCode === '1510' ? 1000000 : 500000;
          if (
            record.buttonKey === 'submitName' &&
            currentNodeName === '11 财务第一复核人审批' &&
            totalAmountHK &&
            totalAmountHK > thresholdAmount
          ) {
            Modal.info({
              key: Modal.key(),
              children: intl.get('spcm.costPayment.modal.tip.submit.largeAmount', {
                amount: numberRender(thresholdAmount, 2),
              }),
              okText: intl.get('spcm.costPayment.modal.okText.haveRead').d('已阅读'),
            }).then(() => {
              this.openEipModal(record);
            });
          } else {
            this.openEipModal(record);
          }
        }
      });
    } else {
      this.setState({
        costRequestLoading: false,
      });
      Modal.open({
        key: Modal.key(),
        title: getCurrentLanguage() === 'en_US' ? record.nameE : record.name,
        maskClosable: true,
        closable: true,
        destroyOnClose: true,
        footer: null,
        children: (
          <iframe
            title="urlContent"
            src={record.url}
            frameBorder="0"
            style={{
              width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
              height: `${record.height}px`,
            }}
            marginWidth="1"
            marginHeight="1"
          />
        ),
      });
    }
  }

  @Bind
  selectChange(value) {
    this.remarkDS.current.set('remark', value);
  }

  @Bind
  openSubmitModal() {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`${prompt}.view.detail.archive`).d('归档'),
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: 800,
      },
      children: (
        <Form dataSet={this.remarkDS} labelLayout="horizontal">
          <Row style={{ display: 'flex', alignItems: 'center' }}>
            <Col span={4}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {intl.get(`${prompt}.view.detail.opinion`).d('签字意见')}
              </span>
            </Col>
            <Col span={4}>
              <Select name="select" onChange={this.selectChange}>
                <Option value={intl.get(`${prompt}.view.detail.handle`).d('请处理')}>
                  {intl.get(`${prompt}.view.detail.handle`).d('请处理')}
                </Option>
              </Select>
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col span={24}>
              <TextArea name="remark" style={{ width: '100%' }} />
            </Col>
          </Row>
        </Form>
      ),
      onClose: () => {
        this.getDataSetDetail(true);
      },
      onOk: () => {
        this.setState({
          mipSubLoading: true,
        });
        const { match = {} } = this.props;
        const { approvalRequestButtonVOList } = this.state;
        const { params } = match;
        const { costRequestId } = params;
        const { url } = approvalRequestButtonVOList[0];
        const requestId = url.split('&')[2].split('=')[1];
        const loginId = currentUser.loginName;
        const { remark } = this.remarkDS.current.data;
        request(`${SRM_SPUC}/v1/${organizationId}/mip-submit/${costRequestId}`, {
          method: 'POST',
          body: {
            requestId,
            loginId,
            remark,
            operationType: 'submitname',
          },
        })
          .then((res) => {
            if (res.warnFlag) {
              notification.error({
                description: (
                  <div>
                    {res.warnMsgList.map((i) => {
                      return <div>{i}</div>;
                    })}
                  </div>
                ),
              });
            }
            if (res.failed) {
              this.setState({
                mipSubLoading: false,
              });
              notification.error({
                message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
                description: res.message,
              });
              return;
            }
            if (this.state.isPub) {
              try {
                this.setState({
                  mipSubLoading: false,
                });
                // EIP待办 提交审批成功 关闭当前视图窗
                // window.close();
                this.pollingWorkFLowDetail('000 归档');
              } catch (e) {
                this.setState({
                  mipSubLoading: false,
                });
                console.log(e);
              }
            } else {
              this.setState({
                mipSubLoading: false,
              });
              this.pollingWorkFLowDetail('000 归档');
              // this.getDataSetDetail(true);
            }
          })
          .catch(() => {
            notification.error({
              message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
              description: 'error',
            });
          });
      },
    });
  }

  /**
   * 根据节点名称轮询,直至当前节点等于传入的节点,仅在最后审批时使用
   *
   * @param {*} nodeName
   * @memberof CostPaymentRequestDetail
   */
  @Bind()
  pollingWorkFLowDetail(nodeName) {
    if (this.polling) {
      return false;
    }
    this.setState({
      costRequestLoading: true,
    });
    this.polling = setInterval(() => {
      const { match = {} } = this.props;
      const { params } = match;
      const { costRequestId } = params;
      request(
        `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/approval-requests/detail/targetHeaderCost`,
        {
          method: 'POST',
          body: {
            requestType: 'SCM_ZCFKSQ',
            targetHeaderId: costRequestId,
            tenantId: getCurrentOrganizationId(),
          },
        }
      ).then((res) => {
        if (getResponse(res)) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          if (currentNodeName === nodeName) {
            clearInterval(this.polling);
            this.polling = undefined;
            this.workFlowDetailInfo(+costRequestId, 1);
            this.detailInfoDS.query();
          }
        } else {
          this.setState({
            costRequestLoading: false,
          });
          clearInterval(this.polling);
          this.polling = undefined;
        }
      });
    }, 1000);
  }

  /**
   * 审批记录获取
   */
  @Bind
  workFlowDetailInfo(costRequestId, times = 30, nextTime = 0) {
    if (times <= 0) {
      this.setState({
        costRequestLoading: false,
      });
      // 不在当前审批流中的人 无权限操作
      if (!this.state.approvalReqRecVOList.length) {
        this.setState({
          defaultFlag: false,
        });
      }
      clearTimeout(this.timeout);
      return;
    }
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      request(
        `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/approval-requests/detail/targetHeaderCost`,
        {
          method: 'POST',
          body: {
            requestType: 'SCM_ZCFKSQ',
            targetHeaderId: costRequestId,
            tenantId: getCurrentOrganizationId(),
          },
        }
      ).then((res) => {
        if (res && !res.failed && res.approvalRequestHeaderVO) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          const node = currentNodeName.slice(0, 2);
          let defaultFlag = true; // 默认 无节点状态
          let dMgMFlag = false; // 待审批节点
          let withholdingTaxFlag = false; // 预提税节点
          let financeFlag = false; // 待复核节点
          let fileFlag = false; // 起草人补充节点
          let archiveFlag = false; // 归档节点
          let currentOperatorFlag = false; // 复核环节 判断是否为当前用户是否为申请人
          if (node !== '01') {
            defaultFlag = false;
          }
          if (node === '01') {
            const editFlag = res.approvalRequestButtonVOList
              .map((v) => {
                return v.buttonKey;
              })
              .includes('submitName');
            if (editFlag) {
              defaultFlag = true;
            } else {
              defaultFlag = false;
            }
          } else if (
            node === '08' ||
            node === '09'
            // 待审批阶段 所有内容不可编辑
          ) {
            dMgMFlag = true;
          } else if (node === '10') {
            // 预提税审核节点 预提税金额 机构 名称字段显示
            withholdingTaxFlag = true;
          } else if (node === '11' || node === '12') {
            // 查找复核阶段操作人 判断是否为待复核节点可修改
            const operator = res.approvalReqRecVOList.map((item) => {
              if (item.currentNodeName.slice(0, 2) === node) {
                return item.operator;
              } else {
                return null;
              }
            });
            if (operator.includes(currentUser.realName)) {
              financeFlag = true;
            } else {
              currentOperatorFlag = true;
            }
          } else if (node === '13') {
            // 起草人补充节点 判断当前用户是否为申请人 是则可修改附件
            const canEdit = res.approvalReqRecVOList.map((item) => {
              if (item.currentNodeName.slice(0, 2) === '13') {
                return item.operator;
              } else {
                return null;
              }
            });
            if (canEdit.includes(currentUser.realName)) {
              fileFlag = true;
            }
          } else if (node === '00') {
            // 归档节点 所有字段展示 不可编辑
            archiveFlag = true;
          }
          // 审批历史中 10 预提税节点  11 12待复核节点筛选 审批时间
          const approvalList10 = res.approvalReqRecVOList.filter(
            (item) =>
              item.currentNodeName && item.currentNodeName.startsWith('10') && item.operateDate
          );
          const approvalList11 = res.approvalReqRecVOList.filter(
            (item) =>
              item.currentNodeName && item.currentNodeName.startsWith('11') && item.operateDate
          );
          const approvalList12 = res.approvalReqRecVOList.filter(
            (item) =>
              item.currentNodeName && item.currentNodeName.startsWith('12') && item.operateDate
          );
          const approvalReqRecVOList = res.approvalReqRecVOList.filter((i) => {
            const prefix = i.currentNodeName && i.currentNodeName.substr(0, 2);
            if (prefix === '00') {
              return i.approvingOpinion && i.optionTypeName;
            } else if (prefix === '10') {
              return approvalList10.length === 0 ? true : i.operateDate || !i.approvingOpinion;
            } else if (prefix === '11') {
              return approvalList11.length === 0 ? true : i.operateDate || !i.approvingOpinion;
            } else if (prefix === '12') {
              return approvalList12.length === 0 ? true : i.operateDate || !i.approvingOpinion;
            } else {
              return true;
            }
          });
          this.setState({
            defaultFlag,
            dMgMFlag,
            withholdingTaxFlag,
            financeFlag,
            archiveFlag,
            fileFlag,
            currentOperatorFlag,
            showSave: true,
            costRequestLoading: false,
            approvalRequestHeaderVO: res.approvalRequestHeaderVO || {},
            approvalReqRecVOList,
            approvalRequestButtonVOList: res.approvalRequestButtonVOList || [],
          });
        } else {
          this.workFlowDetailInfo(costRequestId, times - 1, 2000);
        }
      });
    }, nextTime);
  }

  @Bind()
  changeVendor(vendor) {
    this.setState({
      isCreate: false,
    });
    if (vendor) {
      this.detailInfoDS.current.set('vendorCompanyId', vendor.vendorId);
      this.detailInfoDS.current.set('vendorCompanyNum', vendor.vendorNum);
      this.detailInfoDS.current.set('vendorCompanyName', vendor.vendorName);
      this.detailInfoDS.current.set('companyBankAccountId', vendor.bankAccountId);
      if (this.detailInfoDS.current.getField('vendorPayFlag').getValue() === '0') {
        const { bankAccountName } = vendor;
        if (bankAccountName) {
          // this.detailInfoDS.current.set('bankAccountName', vendor.bankAccountName);
          // this.detailInfoDS.current.set('bankAccountNum', vendor.bankAccountNum);
          // this.detailInfoDS.current.set('bankName', vendor.bankName);
          // this.detailInfoDS.current.set('swiftCode', vendor.bankIdentificationCode);
          this.detailInfoDS.current.set('vendorSiteCode', vendor.vendorSiteCode);
        }
        // this.detailInfoDS.current.set('bankId', 1);
      }
    } else {
      this.detailInfoDS.current.set('vendorCompanyId', null);
      this.detailInfoDS.current.set('vendorCompanyNum', null);
      this.detailInfoDS.current.set('vendorCompanyName', null);
      this.detailInfoDS.current.set('companyBankAccountId', null);
      if (this.detailInfoDS.current.getField('vendorPayFlag').getValue() === '0') {
        // this.detailInfoDS.current.set('bankAccountName', null);
        // this.detailInfoDS.current.set('bankAccountNum', null);
        // this.detailInfoDS.current.set('bankId', 1);
        // this.detailInfoDS.current.set('bankName', null);
        // this.detailInfoDS.current.set('swiftCode', null);
        this.detailInfoDS.current.set('vendorSiteCode', null);
      }
    }
  }

  @Bind
  changePayName(pay) {
    this.setState({
      isCreate: false,
    });
    if (pay) {
      this.detailInfoDS.current.set('payCompanyId', pay.vendorId);
      this.detailInfoDS.current.set('payCompanyNum', pay.vendorNum);
      this.detailInfoDS.current.set('payCompanyName', pay.vendorName);
      // this.detailInfoDS.current.set('bankAccountNum', pay.bankAccountNum);
      // this.detailInfoDS.current.set('bankAccountName', pay.bankAccountName);
      // this.detailInfoDS.current.set('bankId', 1);
      // this.detailInfoDS.current.set('bankName', pay.bankName);
      // this.detailInfoDS.current.set('swiftCode', pay.bankIdentificationCode);
      this.detailInfoDS.current.set('vendorSiteCode', pay.vendorSiteCode);
    } else {
      this.detailInfoDS.current.set('payCompanyId', null);
      this.detailInfoDS.current.set('payCompanyNum', null);
      this.detailInfoDS.current.set('payCompanyName', null);
      // this.detailInfoDS.current.set('bankAccountNum', null);
      // this.detailInfoDS.current.set('bankAccountName', null);
      // this.detailInfoDS.current.set('bankId', 1);
      // this.detailInfoDS.current.set('bankName', null);
      // this.detailInfoDS.current.set('swiftCode', null);
      this.detailInfoDS.current.set('vendorSiteCode', null);
    }
  }

  @Bind
  vendorPayFlagChange(value) {
    this.setState({
      isCreate: false,
    });
    if (value === '0') {
      this.detailInfoDS.current.set('payCompanyId', null);
      this.detailInfoDS.current.set('payCompanyNum', null);
      this.detailInfoDS.current.set('payCompanyName', null);
      this.detailInfoDS.current.set('bankAccountName', null);
      this.detailInfoDS.current.set('bankAccountNum', null);
      this.detailInfoDS.current.set('bankId', null);
      this.detailInfoDS.current.set('bankName', null);
      this.detailInfoDS.current.set('swiftCode', null);
      this.detailInfoDS.current.set('vendorSiteCode', null);
    }
  }

  // 公司主体
  @Bind()
  changeOrgName() {
    const org = this.detailInfoDS.current.getField('companyOrgName').getLookupData();
    const { meaning } = org;
    if (!meaning) {
      this.detailInfoDS.current.set('ouOrgCode', null);
      this.detailInfoDS.current.set('companyOrgName', null);
      this.detailInfoDS.current.set('companyOrgCode', null);
      this.detailInfoDS.current.set('currencyCode', null);
      return;
    }
    this.detailInfoDS.current.set('ouOrgCode', org.tag);
    this.detailInfoDS.current.set('companyOrgName', org.meaning);
    this.detailInfoDS.current.set('companyOrgCode', org.value);
    this.detailInfoDS.current.set('currencyCode', org.description);
    try {
      // 公司主体为CMI总部时 发票明细上的发票税额不可编辑
      this.invoiceLineInfoDS.getField('invoiceTaxAmount').set('disabled', org.tag === 'CMI');
      // 查询发票头预提税机构名称 如果公司主体下的预提税机构有且仅有一个 则自动带出机构名称
      request(`${SRM_SPUC}/v1/lovs/sql/data`, {
        method: 'GET',
        query: {
          lovCode: 'SPCM_COST_WITHOUTHING_SUPPLIER',
          page: 0,
          size: 10,
          orgCode: org.tag,
        },
      }).then((res) => {
        if (res) {
          const { content } = res;
          if (content.length === 1) {
            this.invoiceInfoDS.records.forEach((line) => {
              line.set('withholdingTaxVendorName', content[0].bankAccountName);
              line.set('withholdingTaxVendorNum', content[0].bankAccountNum);
              line.set('withholdingTaxVendorSite', content[0].vendorSiteCode);
            });
          } else {
            this.invoiceInfoDS.records.forEach((line) => {
              line.set('withholdingTaxVendorName', null);
              line.set('withholdingTaxVendorNum', null);
              line.set('withholdingTaxVendorSite', null);
            });
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  @Bind()
  changeCurrencyCode(currencyCode) {
    // 申请头币种
    this.setState(
      {
        isCreate: false,
        currencyCode: currencyCode ? currencyCode.currencyCode : null,
      },
      () => {
        this.detailInfoDS.current.set(
          'currencyCode',
          currencyCode ? currencyCode.currencyCode : null
        );
      }
    );
  }

  @Bind()
  // 发票导入
  toExport() {
    const { match = {}, history } = this.props;
    const { isPub, open } = this.state;
    const { params } = match;
    const { costRequestId } = params;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/import/${costRequestId}`,
      search: `${open ? '?open=fs' : ''}`,
    });
  }

  @Bind()
  handleCollapseChange(keys) {
    this.setState({
      isCreate: false,
      activeKey: keys,
    });
  }

  @Bind
  charChange(value, name) {
    let num = 0;
    if (typeof value !== 'string') {
      num = 0;
    }
    num = getStringBytes(value);
    if (name === 'requestTitle') {
      this.setState({
        requestTitleLen: num,
      });
    } else if (name === 'requestRemarks') {
      this.setState({
        requestRemarkLen: num,
      });
    }
  }

  @Bind
  @Debounce(200)
  titleChange(value) {
    if (value && typeof value === 'string') {
      this.setState({
        requestTitleLen: getStringBytes(value),
      });
    } else {
      this.setState({
        isCreate: false,
        requestTitleLen: 0,
      });
    }
  }

  @Bind
  @Debounce(200)
  remarksChange(value) {
    if (value && typeof value === 'string') {
      this.setState({
        requestRemarkLen: getStringBytes(value),
      });
    } else {
      this.setState({
        isCreate: false,
        requestRemarkLen: 0,
      });
    }
  }

  /**
   * 获取业务类型编码
   *
   * @memberof CostPaymentRequestDetail
   */
  @Bind
  fetchProductTypeCodes() {
    const lovCode = 'RS_IBOSS_PRODUCT_TYPE';
    queryIdpValue(lovCode).then((res) => {
      if (getResponse(res)) {
        this.setState({
          productTypeCodes: res.map((item) => ({ value: item.value, label: item.meaning })),
        });
      }
    });
  }

  @Bind
  showProductTypeModal() {
    this.setState({
      productTypeModalVisible: true,
    });
  }

  @Bind
  hideProductTypeModal() {
    this.setState({
      productTypeModalVisible: false,
    });
  }

  /**
   * 点击业务类型确定按钮
   *
   * @param {*} [value=[]]
   * @memberof CostPaymentRequestDetail
   */
  @Bind
  handleProductTypeModalOk(value = []) {
    const { isCreate } = this.state;
    if (isCreate) {
      this.detailInfoDS.current.set('productType', value.join(','));
      this.hideProductTypeModal();
    } else {
      this.setState({
        productTypeModalConfirmLoading: true,
      });
      const { costPaymentRequest } = this.getSaveData();
      request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/save`, {
        method: 'POST',
        body: {
          costPaymentRequest: {
            ...costPaymentRequest,
            requestTitle: `COS-${costPaymentRequest.requestTitle || ''}`,
            requestDate: costPaymentRequest.requestDate
              ? costPaymentRequest.requestDate.format('YYYY-MM-DD HH:mm:ss')
              : null,
            productType: value.join(','),
          },
        },
      }).then((res) => {
        this.setState({
          productTypeModalConfirmLoading: false,
        });
        if (getResponse(res)) {
          notification.success({
            message: intl.get(`${prompt}.view.query.tip`).d('提示'),
            description: intl.get('hzero.common.notification.success.save').d('保存成功'),
          });
          this.detailInfoDS.query();
          this.hideProductTypeModal();
        }
      });
    }
  }

  @Bind()
  renderRequestNum() {
    const { returnRequestId } = this.state;
    const label = intl.get(`${prompt}.view.detail.requestNum`).d('申请编号');
    return (
      <span>
        <span>{label}</span>
        {returnRequestId && (
          <Tooltip title={`EBS Request ID：${returnRequestId}`}>
            <Icon style={{ color: '#0085d0' }} type="help_outline" />
          </Tooltip>
        )}
      </span>
    );
  }

  render() {
    const {
      activeKey,
      isSave,
      isCreate,
      costRequestId,
      currentOperatorFlag,
      requestStatusFlag,
      costRequestLoading,
      loading,
      mipSubLoading,
      employeeName,
      defaultFlag,
      dMgMFlag,
      withholdingTaxFlag,
      financeFlag,
      archiveFlag,
      fileFlag,
      showSave,
      approvalReqRecVOList = [],
      submitErrorMessage,
      open,
      requestTitleLen,
      requestRemarkLen,
      currencyCode,
      productTypeModalVisible,
      productTypeCodes,
      productTypeModalConfirmLoading,
    } = this.state;
    const {
      location: { search },
    } = this.props;
    const queryParams = querystring.parse(search.substr(1));
    const { workflowtype } = queryParams || {};
    if (isCreate) {
      // 新增清楚默认行
      this.invoiceInfoDS.records.clear();
      this.invoiceLineInfoDS.records.clear();
    }
    const status = this.detailInfoDS.current.get('requestStatus');
    const productType = this.detailInfoDS.current.get('productType');
    const defaultProductValue = typeof productType === 'string' ? productType.split(',') : [];
    const productTypeModalProps = {
      visible: productTypeModalVisible,
      options: productTypeCodes,
      defaultValue: defaultProductValue,
      confirmLoading: productTypeModalConfirmLoading,
      onCancel: this.hideProductTypeModal,
      onOk: this.handleProductTypeModalOk,
    };
    return (
      <>
        <Header
          backPath={
            !workflowtype &&
            `${this.state.isPub ? '/pub' : ''}/spcm/cost/payment/request/query${
              open ? '?open=fs' : ''
            }`
          }
        >
          {defaultFlag || withholdingTaxFlag || financeFlag || fileFlag
            ? this.saveAndSubmit()
            : null}
          {isSave && (
            <Button
              icon="download"
              onClick={this.exportPdf}
              disabled={costRequestLoading || mipSubLoading || loading}
            >
              {intl.get(`${prompt}.view.detail.downloadPdf`).d('下载PDF')}
            </Button>
          )}
        </Header>
        <Content className="content-bottom">
          {/* 提交校验错误信息 */}
          {submitErrorMessage && (
            <TextArea
              style={{ width: '100%', marginBottom: '10px' }}
              className="text-area-color"
              autoSize={{ minRows: 2, maxRows: 10 }}
              value={submitErrorMessage}
            />
          )}
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <Collapse activeKey={activeKey} onChange={this.handleCollapseChange}>
              <Panel
                header={intl.get(`${prompt}.view.detail.info.title`).d('基本信息')}
                key="headInfo"
              >
                <Form
                  dataSet={this.detailInfoDS}
                  disabled={!defaultFlag || !showSave}
                  columns={3}
                  labelWidth={120}
                  labelLayout={LabelLayout.horizontal}
                  useColon
                >
                  <TextField name="requestNum" label={this.renderRequestNum()} />
                  <TextField
                    name="requestStatus"
                    // dropdownMatchSelectWidth={false}
                    showHelp={status === 'PAID' && 'tooltip'}
                    help={
                      status === 'PAID' &&
                      intl
                        .get('spcm.costPayment.help.requestStatus')
                        .d('因网上转账时延，预计两天哪收到款项，如有疑问可与财务部联系')
                    }
                    renderer={({ value, record }) => {
                      const text = record.getField('requestStatus').getText(value) || '';
                      return status === 'PAID'
                        ? `${text} ${
                            record.get('paymentDate') ? dateRender(record.get('paymentDate')) : ''
                          }`
                        : text;
                    }}
                  />
                  <DatePicker name="requestDate" disabled />
                  <TextField name="requestEmployeeName" />
                  <Select
                    name="companyOrgName"
                    dropdownMatchSelectWidth={false}
                    onChange={this.changeOrgName}
                  />
                  <Select name="pressLevel" dropdownMatchSelectWidth={false} />
                  <TextField name="vendorCompanyNum" />
                  <Lov
                    name="vendorCompanyName"
                    tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                    onChange={this.changeVendor}
                  />
                  <Lov
                    name="currencyCode"
                    tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                    onChange={this.changeCurrencyCode}
                  />
                  <TextField
                    className="input-num cost-pr-right-align"
                    name="totalAmount"
                    renderer={({ value }) => {
                      return numberRender(value, 2);
                    }}
                  />
                  <TextField
                    className="input-num cost-pr-right-align"
                    name="totalAmountHK"
                    renderer={({ value }) => {
                      return numberRender(value, 2);
                    }}
                  />
                  {/* <Tooltip
                    name="importEbsFlag"
                    placement="right"
                    disabled={isSave}
                    title={intl
                      .get(`${prompt}.view.detail.import.ebs.help`)
                      .d('仅第一次开通自动转账的权限审批，不生成EBS端应付凭证')}
                  >
                    <CheckBox name="importEbsFlag" colSpan={2} />
                  </Tooltip> */}
                  <CheckBox name="vendorPayFlag" onChange={this.vendorPayFlagChange} />
                  <Lov
                    name="payCompanyName"
                    tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                    onChange={this.changePayName}
                  />
                  <Select name="originalReceived" dropdownMatchSelectWidth={false} />
                  <Output
                    name="productType"
                    renderer={() => (
                      <a onClick={this.showProductTypeModal}>
                        {intl.get('spcm.costPayment.view.selectProductType').d('选择业务类型')}
                      </a>
                    )}
                  />
                  <TextField
                    className="input-prefix"
                    newLine
                    name="requestTitle"
                    prefix="COS-"
                    colSpan={3}
                    onInput={(e) => {
                      const { nativeEvent } = e;
                      const { value } = nativeEvent.target;
                      if (getStringBytes(value) > 170) {
                        const newValue = interceptString(value, 170);
                        nativeEvent.target.value = newValue;
                      }
                      this.titleChange(nativeEvent.target.value);
                    }}
                    help={
                      defaultFlag
                        ? `${intl.get(`${prompt}.view.detail.characters.left`).d('剩余字符:')}${
                            170 - requestTitleLen
                          }`
                        : null
                    }
                  />
                  <TextArea
                    colSpan={3}
                    help={
                      defaultFlag
                        ? `${intl.get(`${prompt}.view.detail.characters.left`).d('剩余字符:')}${
                            770 - requestRemarkLen
                          }`
                        : null
                    }
                    name="requestRemarks"
                    onInput={(e) => {
                      const { nativeEvent } = e;
                      const { value } = nativeEvent.target;
                      if (getStringBytes(value) > 770) {
                        const newValue = interceptString(value, 770);
                        nativeEvent.target.value = newValue;
                      }
                      this.remarksChange(nativeEvent.target.value);
                    }}
                  />
                </Form>
              </Panel>
              {/* <Panel */}
              {/*  header={intl.get(`${prompt}.view.detail.bank.title`).d('银行信息')} */}
              {/*  key="bankInfo" */}
              {/* > */}
              {/*  <Form */}
              {/*    dataSet={this.detailInfoDS} */}
              {/*    disabled={!defaultFlag || !showSave} */}
              {/*    columns={2} */}
              {/*    labelLayout={LabelLayout.horizontal} */}
              {/*    labelWidth={120} */}
              {/*  > */}
              {/*    <TextField name="bankAccountName" /> */}
              {/*    <TextField name="bankAccountNum" /> */}
              {/*    <TextField name="bankName" /> */}
              {/*    <TextField name="swiftCode" /> */}
              {/*  </Form> */}
              {/* </Panel> */}
              <Panel
                header={intl.get(`${prompt}.view.detail.pay.title`).d('付款明细')}
                key="payInfo"
              >
                <InvoiceTable
                  costId={costRequestId}
                  requestStatusFlag={requestStatusFlag}
                  dataSet={this.invoiceInfoDS}
                  lineDetailCommand={this.lineDetailCommand()}
                  coaDetailCommand={this.coaDetailCommand()}
                  invoiceSplitCommand={this.invoiceSplitCommand()}
                  toExport={this.submit}
                  lineDataSet={this.invoiceLineInfoDS}
                  contractNameField={this.contractNameField()}
                  taxCoaInfoDS={this.taxCoaInfoDS}
                  coaInfoDS={this.coaInfoDS}
                  headerDataSet={this.detailInfoDS}
                  defaultFlag={defaultFlag}
                  dMgMFlag={dMgMFlag}
                  withholdingTaxFlag={withholdingTaxFlag}
                  financeFlag={financeFlag}
                  fileFlag={fileFlag}
                  archiveFlag={archiveFlag}
                  currentOperatorFlag={currentOperatorFlag}
                  prompt={prompt}
                  currencyCode={currencyCode}
                />
              </Panel>
              <Panel
                header={intl.get(`${prompt}.view.detail.file.title`).d('附件上传')}
                key="fileInfo"
              >
                <CheckableTag
                  key="requiredAttactment"
                  style={{ fontSize: '13px', margin: '8px 0 4px 0' }}
                >
                  {intl.get(`${prompt}.view.file.require`).d('必要附件')}
                </CheckableTag>
                <div style={{ height: 0, color: '#d50000' }}>
                  <span>
                    {intl
                      .get('spcm.costPayment.view.tip.requiredAttachment')
                      .d(
                        '注意：当上传附件选择附件类型为发票时，对应附件会开放给供应商查看，请注意发票类型的附件只能上传发票附件。'
                      )}
                  </span>
                </div>
                <AttachFiles
                  dataSet={this.attachFilesDS}
                  defaultFlag={defaultFlag}
                  fileFlag={fileFlag}
                  prompt={prompt}
                  employeeName={employeeName}
                />
                <CheckableTag
                  key="otherAttactment"
                  style={{ fontSize: '13px', margin: '15px 0 4px 0' }}
                >
                  {intl.get(`${prompt}.view.file.other`).d('其他附件')}
                </CheckableTag>
                <AttachFiles
                  dataSet={this.attachOtherFilesDS}
                  defaultFlag={defaultFlag}
                  fileFlag={fileFlag}
                  prompt={prompt}
                  employeeName={employeeName}
                  isOther
                />
              </Panel>
              <Panel
                header={intl.get(`${prompt}.view.detail.approval.title`).d('审批历史')}
                key="approvalInfo"
              >
                {approvalReqRecVOList.length > 0 && (
                  <ApprovalList dataSource={approvalReqRecVOList} />
                )}
              </Panel>
            </Collapse>
          </LocaleProvider>
        </Content>
        <Spin
          className="costPayment-spin"
          spinning={costRequestLoading || loading || mipSubLoading}
        />
        <div className="approval-btn">{this.generateApprovalBtns()}</div>
        {productTypeModalVisible && <ProductTypeModal {...productTypeModalProps} />}
      </>
    );
  }
}
