/**
 * @Description: 成本付款
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Button, Collapse, Dropdown } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import querystring from 'querystring';
import {
  getResponse,
  createPagination,
  addItemToPagination,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import {
  getCurrentLanguage,
  getCurrentUser,
  getCurrentOrganizationId,
  getEditTableData,
} from 'utils/utils';
import dayjs from 'dayjs';
import { DATETIME_MIN } from 'utils/constants';
import { numberRender } from 'utils/renderer';
import HeadInfo from './HeadInfo';
import PayDetail from './PayDetail';
import BankInfo from './BankInfo';
import AttachFiles from './AttachFiles';
import SupAttachment from './SupAttachment';
import ApprovalList from './ApprovalList';
// import FinancialAudit from './components/FinancialAudit';
import SelfSubmitModal from './components/SelfSubmitModal';
import PageErrorMessage from './components/PageErrorMessage';
import StepPanel from './components/StepPanel';
import { queryIdpValue, queryUnifyIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import { cloneDeep, sum, remove, isEmpty, isNumber } from 'lodash';
import { fastCodeLoader } from '@/utils/decorators';
import { batchDownloadFile } from '@/common/utils';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusOpenModal from '_cus_components/CusOpenModal';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusNotification from '_cus_components/CusNotification';
import CusExcelExport from '_cus_components/CusExcelExport';
import { cusDateFormat, closeWindow } from '_cus_utils/utils';
import ellipsis from 'srm-front-common/lib/assets/ellipsis.svg';

const prompt = 'spcm.costPayment';
const currentUser = getCurrentUser();
const organizationId = getCurrentOrganizationId();

@fastCodeLoader([
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'SPCM.COST_REQUEST_STATUS',
  'SPCM.COST_PRESS_LEVEL',
  'SPUC.COST_ORIGINAL_RECEIVED',
  'SRSP.PAYMENT_REQUEST_SOURCE',
  'SRSP.BANK_CHARGE_TYPE',
  'SPUC.COMMISSION_INFO_AUTHORITY',
  'SPUC.PAYMENT_INVOCIE_NUM_CHAR',
  'RS_IP_INVOICETAX_SIGN_ENTITY',
  'RS_FIN_INVOICETAX_SIGN_ENTITY',
  'VP.COST_PAYMENT_COST_CENTER',
  'SPCM_COST_WITHOUTHING_SUPPLIER',
  'RS_IP_ATTACHMENT_TYPE',
  'SPCM.FINANCIAL_AUDIT_FILE',
  'SPFM.URGE.FORMLINK',
])
@formatterCollections({ code: [prompt] })
@connect(({ loading, costRequest }) => ({
  costRequest,
  supAttViewButtonFlag: costRequest.supAttViewButtonFlag,
  queryLoading:
    loading.effects['costRequest/getDetailInfo'] ||
    loading.effects['costRequest/getBillList'] ||
    loading.effects['costRequest/getBillDetail'] ||
    loading.effects['costRequest/getAttachFiles'] ||
    loading.effects['costRequest/getWriteOff'],
  exportPdfLoading: loading.effects['costRequest/exportPdf'],
  saveLoading: loading.effects['costRequest/saveAll'],
  mipLoading:
    loading.effects['costRequest/mipSubmit'] ||
    loading.effects['costRequest/checkRepeatInvoice'] ||
    loading.effects['costRequest/checkAllowReturnBank'] ||
    loading.effects['costRequest/pureCheck'],
  deleteOtherAttLoading: loading.effects['costRequest/deleteOtherAtt'],
  queryAttachLoading: loading.effects['costRequest/getAttachFiles'],
}))
@Form.create({ fieldNameProp: null })
class CostPayment extends Component {
  constructor(props) {
    super(props);
    const { customerPayFlag = 0 } = querystring.parse(this.props.location.search.substr(1));
    const { match = {} } = this.props;
    const { params } = match;
    const { costRequestId } = params;
    this.state = {
      costRequestId: costRequestId || -1, // 申请id
      requestStatus: undefined, // 申请状态
      currencyCode: undefined, // 币种
      precision: 2, // 页面精度控制
      isCreate: false, // 是否创建页面
      currentOperatorFlag: false,
      defaultFlag: true, // 默认 无节点状态
      dMgMFlag: false, // 待审批节点
      withholdingTaxFlag: false, // 预提税节点
      financeFlag: false, // 待复核节点
      archiveFlag: false, // 归档节点
      fileFlag: false, // 起草人补充节点
      bankModifyFlag: false, // 起草人银行修改
      costRequestLoading: false, // 审批流循环调用loading
      approvalRequestHeaderVO: {}, // 审批基础信息
      approvalReqRecVOList: [], // 审批历史
      approvalRequestButtonVOList: [], // 审批按钮
      activeKey: [
        'headInfo',
        'bankInfo',
        'payInfo',
        'fileInfo',
        'supplyAttachmentInfo',
        'approvalInfo',
      ],
      submitErrorMessage: '', // 提交校验错误信息
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      customerPayFlag, // 是否对客户付款， 由‘付款申请【是否对客户付款】’菜单跳转传入
      isCommissionFlag: false, // 是否渠道商变更
      currentActiveInvoiceId: null, // 当前定位的发票id
      billDataSource: [], // 账单头 - 行 列表数据
      billPagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      }, // 账单头分页
      billLineQueryId: [], // 查询过的账单行 对应的 账单头id
    };
  }

  billList = React.createRef();
  cusApprovalBtns = React.createRef();

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      match: { params = {} },
    } = nextProps;
    if (params.costRequestId !== prevState.costRequestId) {
      return {
        costRequestId: params.costRequestId,
      };
    }
    return null;
  }

  componentDidMount() {
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
      this.getCompanyName().then((r) => {});
      this.handelCustomerPay();
    } else {
      this.setState({
        isCreate: false,
        costRequestLoading: true,
      });

      this.handleRefreshData();

      // 导入发票成功 获取审批流
      const { query } = location;
      if (query) {
        this.workFlowDetailInfo(+params.costRequestId, 30);
      } else {
        this.workFlowDetailInfo(+params.costRequestId, 2);
      }
    }
  }

  /**
   * 查询页面信息
   */
  @Bind
  handleRefreshData() {
    this.getDetailInfo();
    this.getBillList();
    this.getAttachFiles('1');
    this.getAttachFiles('0');
    this.getWriteOff();
    this.bankInfo?.queryBankInfo();
  }

  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  /**
   * 处理 mip 弹框确定按钮回调
   * @returns {boolean}
   */
  @Bind
  handleReceiveMipOK() {
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
  }

  /**
   * 详情查询
   * @param flag 是否进行审批流轮询
   */
  @Bind
  getDataSetDetail(flag = false) {
    const { match = {} } = this.props;
    const { params } = match;
    let num = 5;
    if (flag) {
      this.setState({
        costRequestLoading: true,
      });
      this.timer = setInterval(() => {
        this.workFlowDetailInfo(+params.costRequestId, 1);
        num -= 1;
        if (num <= 0) {
          this.setState({
            costRequestLoading: false,
          });
          clearInterval(this.timer);
        }
      }, 1000);
    } else {
      this.workFlowDetailInfo(+params.costRequestId, 1);
    }
    this.handleRefreshData();
  }

  /**
   * 导出 pdf
   */
  @Bind
  @Debounce(300, { leading: true })
  exportPdf() {
    const { form, dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'costRequest/exportPdf',
      payload: costRequestId,
    }).then((res) => {
      if (res) {
        const href = window.URL.createObjectURL(res);
        const fileName = `${form.getFieldValue('requestNum')}.pdf`;
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
   * 附件下载
   * @returns {Promise<void>}
   */
  @Bind()
  async fileBatchDownload() {
    const { form, dispatch } = this.props;
    const { costRequestId } = this.state;
    this.setState({
      fileDownloadLoading: true,
    });
    const fileList = await dispatch({
      type: 'costRequest/fileBatchDownload',
      payload: costRequestId,
    });
    const fileName = `${form.getFieldValue('requestNum')}-${intl
      .get(`${prompt}.button.fileDownload`)
      .d('附件下载')}-${dayjs(new Date()).format('YYYYMMDD')}`;
    await batchDownloadFile(fileList.batchFileList, fileName);
    this.setState({
      fileDownloadLoading: false,
    });
  }

  /**
   * 审批流按钮
   * @returns {*[]}
   */
  @Bind
  generateApprovalBtns(exportPdfLoading, fileDownloadLoading) {
    const {
      defaultFlag,
      withholdingTaxFlag,
      financeFlag,
      fileFlag,
      bankModifyFlag,
      isCreate,
      costRequestId,
    } = this.state;
    const { idpValueMap } = this.props;
    const isEn = getCurrentLanguage() === 'en_US';
    let { approvalRequestHeaderVO = {}, approvalRequestButtonVOList = [] } = this.state;
    const { currentNodeName = '' } = approvalRequestHeaderVO;

    // 插入保存按钮
    if (defaultFlag || withholdingTaxFlag || financeFlag || fileFlag || bankModifyFlag) {
      this.addObjectToList(approvalRequestButtonVOList, {
        nameE: intl.get('hzero.common.button.save').d('保存'),
        name: intl.get('hzero.common.button.save').d('保存'),
        buttonOrder: 3.5,
        buttonKey: 'saveName',
      });
    }

    // 审批节点 12 财务第二复核人审批 currentNodeName （增加参数isImportEbs，用于走客制化审批弹框）
    if (currentNodeName.slice(0, 2) === '12') {
      const submitButton = approvalRequestButtonVOList.find(
        (item) => item.buttonKey === 'submitName'
      );
      if (submitButton) {
        submitButton['isImportEbs'] = true;
      }
    }

    // 合并 流程图，流程状态按钮
    const lookButton = approvalRequestButtonVOList
      .filter((item) => ['LookView', 'LookApproval'].includes(item.buttonKey))
      .map((item) => ({
        key: item.buttonKey,
        label: isEn ? item.nameE : item.name,
      }));
    return (
      <>
        {approvalRequestButtonVOList
          ?.sort((one, two) => {
            return one.buttonOrder - two.buttonOrder;
          })
          .filter((item) => !['LookView', 'LookApproval'].includes(item.buttonKey))
          .map((item, index) => {
            return (
              <CusButton
                key={index}
                type={index === 0 ? 'primary' : 'normal'}
                onClick={() => this.approvalButtonClick(item)}
              >
                {isEn ? item.nameE : item.name}
              </CusButton>
            );
          })}
        {/*<FinancialAudit idpValueMap={idpValueMap} />*/}
        {!isCreate && (
          <>
            <CusExcelExport
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/export-detail/${costRequestId}`}
            />
            <CusButton loading={fileDownloadLoading} onClick={this.fileBatchDownload}>
              {intl.get(`${prompt}.button.fileDownload`).d('附件下载')}
            </CusButton>
            <CusButton loading={exportPdfLoading} onClick={this.exportPdf}>
              {intl.get(`${prompt}.view.detail.downloadPdf`).d('下载PDF')}
            </CusButton>
          </>
        )}
        {lookButton.length === 2 && (
          <Dropdown
            menu={{
              items: lookButton,
              onClick: ({ key }) => {
                const buttonData = approvalRequestButtonVOList.find((b) => b.buttonKey === key);
                this.approvalButtonClick(buttonData);
              },
            }}
          >
            <Button
              className="customize-button-normal"
              style={{ padding: '0 8px', minWidth: '44px' }}
            >
              {intl.get(`${prompt}.view.button.processDetail`).d('流程明细')}
              <img style={{ marginTop: '2px', marginLeft: '8px' }} src={ellipsis} alt="ellipsis" />
            </Button>
          </Dropdown>
        )}
      </>
    );
  }

  /**
   * 向数组中添加对象
   * @param arr 被添加数组
   * @param obj 添加对象
   * @returns {*}
   */
  @Bind
  addObjectToList = (arr, obj) => {
    const existingObj = arr.find((item) => {
      // 判断对象是否已存在，这里以 id 属性作为判断依据
      return item.buttonKey === obj.buttonKey;
    });
    if (!existingObj) {
      arr.push(obj);
    }
    return arr;
  };

  /**
   * 底部按钮点击按钮- 转发
   * @param record
   */
  @Bind
  approvalButtonClick(record) {
    const { dispatch } = this.props;
    this.optionButtonKey = record.buttonKey;
    const { approvalRequestHeaderVO, costRequestId, requestStatus } = this.state;
    // 判断当前按钮是否为提交审批
    if (record.buttonKey === 'saveName') {
      this.handleSaveAll();
    } else if (record.buttonKey === 'urge') {
      this.handleUrge(record);
    } else if (record.buttonKey === 'submitMaterial') {
      this.handelSubmitMaterial(record);
    } else if (record.buttonKey === 'submitBankBack') {
      this.handleSubmitBankBack(record);
    } else if (
      ['submitName', 'takingopinionsName'].includes(record.buttonKey) &&
      (['DRAFT', 'PENDING_REVIEW', 'PENDING_MODIFY', 'REVOKE', 'TRANSPORTING', 'PAYING'].includes(
        requestStatus
      ) ||
        record.isImportEbs)
    ) {
      const submitCkeck = () => {
        dispatch({
          type: 'costRequest/pureCheck',
          payload: {
            costRequestId,
            approveHeader: approvalRequestHeaderVO,
          },
        }).then((res) => {
          if (res.warnFlag) {
            CusNotification.error({
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
                submitErrorMessage,
              },
              () => {
                this.getDataSetDetail(false);
                this.handleScrollTop();
              }
            );
            return;
          }
          if (res.riskFlag) {
            CusModal.warning({
              content: (
                <div>
                  {res.riskMsgList.map((i) => {
                    return <div>{i}</div>;
                  })}
                </div>
              ),
              okText: intl.get(`hzero.common.button.ok`).d('确定'),
              onOk: () => {
                this.validateBeforeOpenModal(approvalRequestHeaderVO, record);
              },
            });
          } else {
            this.validateBeforeOpenModal(approvalRequestHeaderVO, record);
          }
        });
      };
      this.handleSaveAll(false).then((resp) => {
        if (resp) {
          submitCkeck();
        }
      });
    } else {
      // 打开mip弹框
      this.cusApprovalBtns?.current?.openModal(record);
    }
  }

  @Bind()
  handleScrollTop() {
    const node = document.querySelector('.page-container');
    if (node.scrollTo) {
      node.scrollTo(0, 0);
    } else {
      node.scrollTop = 0;
    }
  }

  /**
   * 催办
   * @param record
   */
  @Bind
  handleUrge(record) {
    const { idpValueMap = {} } = this.props;
    const { costRequestId, approvalRequestHeaderVO } = this.state;
    const formLink = idpValueMap['SPFM.URGE.FORMLINK'].find((item) => item.value === 'COST_PAYMENT')
      .tag;
    const formLinkApp = idpValueMap['SPFM.URGE.FORMLINK'].find(
      (item) => item.value === 'formLinkApp'
    ).tag;
    record.paramVO.formLinkApp = `${formLinkApp}${approvalRequestHeaderVO.sourceRequestId}`;
    record.paramVO.formLinkPc = `${formLink}${costRequestId}?requestid=${approvalRequestHeaderVO.sourceRequestId}&workflowtype=SCM_ZCFKSQ&open=fs`;
    _DIC_COMMON_JS_.showUrgeDialog(record.paramVO).then((res) => {
      //回调
      console.log(res);
    });
  }

  /**
   * 补充材料
   * @param record
   */
  @Bind
  handelSubmitMaterial(record) {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'costRequest/checkRepeatInvoice',
      payload: { costRequestId },
    }).then((res) => {
      if (res.repeatFlag === 'Y') {
        this.setState(
          {
            submitErrorMessage: res.repeatMsg,
          },
          () => {
            this.handleScrollTop();
          }
        );
      } else {
        this.cusApprovalBtns?.current?.openModal(record);
      }
    });
  }

  /**
   * 银行退回
   * @param record
   */
  @Bind
  handleSubmitBankBack(record) {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'costRequest/checkAllowReturnBank',
      payload: { costRequestId },
    }).then((res) => {
      if (getResponse(res) && res.returnFlag === 'N') {
        this.setState(
          {
            submitErrorMessage: res.checkMsg,
          },
          () => {
            this.handleScrollTop();
          }
        );
      } else {
        this.cusApprovalBtns?.current?.openModal(record);
      }
    });
  }

  /**
   * 点击提交前校验
   * isImportEbs  是否最后节点的提交
   * @param approvalRequestHeaderVO 审批数据头信息
   * @param record 点击按钮信息
   */
  @Bind
  validateBeforeOpenModal(approvalRequestHeaderVO, record) {
    const { form } = this.props;
    const { isCheckBankInfo } = this.state;
    this.setState({
      submitErrorMessage: '',
    });
    let paymentBankInfo = {};
    if (this.bankInfo) {
      paymentBankInfo = this.bankInfo.state.dataSource[0] || {};
    }
    const { bankApprovalStatus } = paymentBankInfo;
    if (record.isImportEbs) {
      this.openSelfSubmitModal(paymentBankInfo);
    } else {
      const { totalAmountHK, companyOrgCode } = form.getFieldsValue() || {};
      const { currentNodeName } = approvalRequestHeaderVO;
      // 判断是否为总部，总部编码为1510，是则判断大于100万，否则判断大于50万
      const thresholdAmount = companyOrgCode === '1510' ? 1000000 : 500000;

      const msg = [];
      if (record.buttonKey === 'submitName' && currentNodeName === '11 财务第一复核人审批') {
        if (bankApprovalStatus !== 'Y' && isCheckBankInfo) {
          msg.push(
            <p>
              {intl
                .get('spcm.costPayment.message.confirm.bankInfo')
                .d('请对银行信息进行审核，请确认。')}
            </p>
          );
        }
        if (totalAmountHK && totalAmountHK > thresholdAmount) {
          msg.push(
            <p>
              {intl.get('spcm.costPayment.modal.tip.submit.largeAmount', {
                amount: numberRender(thresholdAmount, 2),
              })}
            </p>
          );
        }
      }
      if (msg.length > 0) {
        CusModal.info({
          content: msg,
          okText: intl.get('spcm.costPayment.modal.okText.haveRead').d('已阅读'),
          onOk: () => {
            this.cusApprovalBtns?.current?.openModal(record);
          },
        });
      } else {
        this.cusApprovalBtns?.current?.openModal(record);
      }
    }
  }

  /**
   * 单据自身提交审批弹框
   */
  @Bind
  openSelfSubmitModal(paymentBankInfo) {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    let isNeedBankOption = false;
    const bankInfoMsg = intl
      .get('spcm.costPayment.valuelist.meaning.bankInfo')
      .d('【银行信息已审核】');
    if (isEmpty(paymentBankInfo)) {
      isNeedBankOption = false;
    } else {
      const { bankApprovalStatus } = paymentBankInfo;
      isNeedBankOption = !(bankApprovalStatus === 'Y' || bankApprovalStatus === 'FINISHED');
    }

    CusOpenModal(SelfSubmitModal, {
      onCancel: () => this.getDataSetDetail(true),
      onOk: (remark) => {
        const { approvalRequestButtonVOList } = this.state;
        const { url } = approvalRequestButtonVOList[0];
        const requestId = url.split('&')[2].split('=')[1];
        const loginId = currentUser.loginName;
        dispatch({
          type: 'costRequest/mipSubmit',
          payload: {
            costRequestId,
            requestId,
            loginId,
            remark: isNeedBankOption ? `${bankInfoMsg};` + remark : remark,
            operationType: 'submitname',
          },
        })
          .then((res) => {
            if (res.warnFlag) {
              CusNotification.error({
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
              CusNotification.error({
                message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
                description: res.message,
              });
              return false;
            } else {
              this.pollingWorkFLowDetail('14_2 已完成等待系统自动归档');
            }
          })
          .catch(() => {
            CusNotification.error();
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
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    if (this.polling) {
      return false;
    }
    this.setState({
      costRequestLoading: true,
    });
    this.polling = setInterval(() => {
      dispatch({
        type: 'costRequest/approvalDetail',
        payload: {
          requestType: 'SCM_ZCFKSQ',
          targetHeaderId: costRequestId,
          tenantId: getCurrentOrganizationId(),
        },
      }).then((res) => {
        if (getResponse(res)) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          if (currentNodeName === nodeName) {
            clearInterval(this.polling);
            this.polling = undefined;
            this.workFlowDetailInfo(+costRequestId, 1);
            this.handleRefreshData();
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
   * 处理对客户付款逻辑
   *  供应商只有一个时，默认当前供应商
   */
  @Bind
  handelCustomerPay() {
    const { form } = this.props;
    const { customerPayFlag } = this.state;
    form.setFieldsValue({
      customerPayFlag: +customerPayFlag,
    });
    if (+customerPayFlag === 1) {
      queryUnifyIdpValue('SSLM.COST_SUPPLIER_INFO_URL', {
        customerPayFlag: +customerPayFlag,
      }).then((res) => {
        if (res && res.length === 1) {
          this.changeVendor(res[0]);
        }
      });
    }
  }

  @Bind()
  getDetailInfo() {
    const { dispatch } = this.props;
    const { match = {} } = this.props;
    const { params } = match;
    const { costRequestId } = params;
    if (costRequestId === '-1') {
      return false;
    }
    dispatch({
      type: 'costRequest/getDetailInfo',
      payload: { costRequestId },
    }).then((responseData) => {
      if (responseData) {
        const { requestTitle, requestStatus, returnRequestId, commissionFlag } = responseData;
        const cosIf = requestTitle ? requestTitle.split('COS-') : '';
        this.setState({
          costRequestId: responseData.costRequestId,
          returnRequestId,
          requestStatus,
          isCheckBankInfo: responseData.vendorPayFlag === '0' && responseData.chequePayFlag === 'N',
          isCommissionFlag: commissionFlag === 'Y',
          headerData: {
            ...responseData,
            requestTitle: cosIf.length <= 1 ? requestTitle : cosIf[cosIf.length - 1],
          },
          currencyCode: responseData.currencyCode,
          precision: ['IDR', 'VND', 'JPY', 'KRW'].includes(responseData.currencyCode) ? 0 : 2,
        });
      }
    });
  }

  /**
   * 查询账单列表
   */
  @Bind
  getBillList() {
    const { dispatch, match = {} } = this.props;
    const { billPagination } = this.state;
    const { params } = match;
    const { costRequestId } = params;
    dispatch({
      type: 'costRequest/getBillList',
      payload: {
        costRequestId,
      },
    }).then((res) => {
      if (res) {
        if (this.billDetail) {
          this.billDetail.setDataHasChange(false);
        }
        (async () => {
          const promise = new Promise((resolve) => {
            queryIdpValue('RS_IP_ATTACHMENT_TYPE').then((r) => {
              if (getResponse(r)) {
                resolve(r);
              } else {
                resolve([]);
              }
            });
          });

          let currentActiveInvoiceId;
          if (res.content.length > 0) {
            currentActiveInvoiceId = res.content[0].costInvoiceId;
          }
          const lovData = await promise;
          this.setState(
            {
              billLineQueryId: [],
              currentActiveInvoiceId,
              billDataSource: res.content.map((item) => {
                const { costInvoiceFilesList = [] } = item;
                return {
                  ...item,
                  _status: 'update',
                  attachmentLineList: costInvoiceFilesList
                    .filter((item1) => {
                      const { fileType } = item1;
                      const type = lovData.find((d) => d.value === fileType);
                      return type && type.tag === '1';
                    })
                    .map((att) => ({ ...att, _status: 'update' })),
                  otherAttachmentLineList: costInvoiceFilesList.filter((item2) => {
                    const { fileType } = item2;
                    const type = lovData.find((d) => d.value === fileType);
                    return type && type.tag === '0';
                  }),
                  originalData: { ...item },
                };
              }),
              billPagination: {
                ...billPagination,
                current: 1,
                pageSize: 10,
                total: res.content.length,
              },
            },
            () => {
              this.queryBillDetail({});
            }
          );
        })();
      }
    });
  }

  /**
   * 查询账单行明细
   *
   * @param {*} page
   * @param {*} flag: 是否分页查询
   * @memberof Detail
   */
  @Bind
  queryBillDetail(page = {}, flag = false) {
    const { dispatch } = this.props;
    const { currentActiveInvoiceId, billDataSource, billLineQueryId } = this.state;
    // 已存在账单行明细数据时，不执行查询，防止当前页缓存数据丢失
    if (billLineQueryId.includes(currentActiveInvoiceId) && !flag) {
      return false;
    }
    // 有选中的发票头， 且发票id是number类型，即不是新建的发票头
    if (currentActiveInvoiceId && typeof currentActiveInvoiceId === 'number') {
      dispatch({
        type: 'costRequest/getBillDetail',
        payload: {
          costInvoiceId: currentActiveInvoiceId,
          page,
        },
      }).then((res) => {
        if (res) {
          for (const item of billDataSource) {
            if (item.costInvoiceId === currentActiveInvoiceId) {
              const newItem = cloneDeep(item);
              item.billLineDataSource = res.content.map((line) => ({
                ...line,
                _status: 'update',
                originalData: { ...line },
                parent: newItem,
              }));
              item.billLinePagination = createPagination(res);
              break;
            }
          }
          billLineQueryId.push(currentActiveInvoiceId);
          this.setState({
            billLineQueryId,
            billDataSource,
          });
        }
      });
    }
  }

  /**
   * 查询附件
   * @param requiredFlag
   *  0 ： 其他附件
   *  1 ： 必要附件
   */
  @Bind
  getAttachFiles(requiredFlag = '0') {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'costRequest/getAttachFiles',
      payload: {
        requiredFlag,
        costRequestId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          [requiredFlag === '0'
            ? 'otherAttDataSource'
            : 'requireAttDataSource']: res.content.map((item) => ({ ...item, _status: 'update' })),
          [requiredFlag === '0' ? 'otherAttPagination' : 'requireAttPagination']: createPagination(
            res
          ),
        });
      }
    });
  }

  /**
   * 支付及核销信息
   */
  @Bind()
  getWriteOff() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    const { costRequestId } = params;
    dispatch({
      type: 'costRequest/getWriteOff',
      payload: { costRequestId },
    }).then((res) => {
      if (res) {
        this.setState({
          payWriteOffData: res,
        });
      }
    });
  }

  /**
   * 审批记录获取
   */
  @Bind
  workFlowDetailInfo(costRequestId, times = 30, nextTime = 0) {
    const { dispatch } = this.props;
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
      dispatch({
        type: 'costRequest/approvalDetail',
        payload: {
          requestType: 'SCM_ZCFKSQ',
          targetHeaderId: costRequestId,
          tenantId: getCurrentOrganizationId(),
        },
      }).then((res) => {
        if (res && !res.failed && res.approvalRequestHeaderVO) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          const node = currentNodeName.split(' ')[0];
          const currentOperator = res.approvalReqRecVOList.find(
            (o) => o.currentNodeName.split(' ')[0] === node
          )?.operator;
          let defaultFlag = true; // 默认 无节点状态
          let dMgMFlag = false; // 待审批节点
          let withholdingTaxFlag = false; // 预提税节点
          let financeFlag = false; // 待复核节点
          let fileFlag = false; // 起草人补充节点
          let archiveFlag = false; // 归档节点
          let currentOperatorFlag = false; // 复核环节 判断是否为当前用户是否为申请人
          let bankModifyFlag = false; // 起草人银行修改
          if (node !== '01') {
            defaultFlag = false;
          }
          if (node === '01') {
            const editFlag = res.approvalRequestButtonVOList
              .map((v) => {
                return v.buttonKey;
              })
              .includes('submitName');
            defaultFlag = !!editFlag;
          } else if (
            node === '08' ||
            node === '09'
            // 待审批阶段 所有内容不可编辑
          ) {
            dMgMFlag = true;
          } else if (node === '10') {
            // 预提税审核节点 预提税金额 机构 名称字段显示
            withholdingTaxFlag = currentOperator === currentUser.realName;
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
            fileFlag = currentOperator === currentUser.realName;
          } else if (node === '15_2') {
            bankModifyFlag = currentOperator === currentUser.realName;
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
            bankModifyFlag,
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

  /**
   * 获取当前员工 默认申请人
   */
  @Bind
  getEmployeeName() {
    const { form, dispatch } = this.props;
    dispatch({
      type: 'costRequest/getEmployeeName',
    }).then((res) => {
      if (res) {
        form.setFieldsValue({
          requestEmployeeName: getCurrentLanguage() === 'en_US' ? res.nameEn : res.name,
          requestEmployeeNum: currentUser.loginName,
        });
      }
    });
  }

  /**
   * 获取当前用户的公司主体
   */
  @Bind
  async getCompanyName() {
    const { form, dispatch } = this.props;
    try {
      const res = await dispatch({ type: 'costRequest/getCompanyName' });
      const org = await queryIdpValue('VP.PRICE_CONTRACT_SIGN_ENTITY');
      // 获取默认公司主体code
      form.setFieldsValue({
        companyOrgName: res ? res.companyCode : '',
      });
      this.changeOrgName(res.companyCode, org);
    } catch (e) {
      return false;
    }
  }

  /**
   * 供应商名称 变更，同时删除银行信息
   * @param vendor
   */
  @Bind()
  changeVendor(vendor) {
    const { form } = this.props;
    if (vendor) {
      form.setFieldsValue({
        vendorCompanyId: vendor.vendorId,
        vendorCompanyNum: vendor.vendorNum,
        vendorCompanyName: vendor.vendorName,
        companyBankAccountId: vendor.bankAccountId,
      });
      if (form.getFieldValue('vendorPayFlag') === '0') {
        const { bankAccountName } = vendor;
        if (bankAccountName) {
          form.setFieldsValue({
            vendorSiteCode: vendor.vendorSiteCode,
          });
        }
      }
    } else {
      form.setFieldsValue({
        vendorCompanyId: undefined,
        vendorCompanyNum: undefined,
        vendorCompanyName: undefined,
        companyBankAccountId: undefined,
      });
      if (form.getFieldValue('vendorPayFlag') === '0') {
        form.setFieldsValue({
          vendorSiteCode: undefined,
        });
      }
    }
    this.bankInfo?.handleDeleteBank().then((r) => {});
  }

  /**
   * 公司主体变更
   * @param companyCode
   * @param orgList
   */
  @Bind()
  changeOrgName(companyCode, orgList = []) {
    const { form, idpValueMap } = this.props;
    const { billDataSource } = this.state;
    const org =
      (idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || orgList)?.find(
        (item) => item.value === companyCode
      ) || {};
    form.setFieldsValue({
      ouOrgCode: org.tag,
      companyOrgName: org.meaning,
      companyOrgCode: org.value,
      currencyCode: org.description,
    });
    // 触发币种变更
    this.changeCurrencyCode(org.description);

    if (this.billList) {
      this.billList.setWithholdingTaxVendor(billDataSource).then((r) => ({}));
    }

    // 当 ouCode变更为 CMI时，计算发票头上金额
    if (org?.tag === 'CMI') {
      const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(org.description) ? 0 : 2;
      if (billDataSource.length < 1) return false;
      billDataSource.forEach((line) => {
        const { billLineDataSource } = line;
        if (billLineDataSource) {
          // 统计发票明细行上的 发票行金额 到发票头
          const invoiceAmount = billLineDataSource.reduce((total, currentValue) => {
            return total + currentValue.$form?.getFieldValue('lineAmount') || 0;
          }, 0);
          Object.assign(line, {
            invoiceAmount: Number(numberRender(invoiceAmount, precision, false)),
            invoiceTaxAmount: 0,
            excludingTaxAmount: Number(numberRender(invoiceAmount, precision, false)),
          });
        } else {
          // 如果是其他发票的行明细还未请求加载时 把头上的税额清零
          Object.assign(line, {
            invoiceTaxAmount: 0,
            excludingTaxAmount: line.invoiceAmount,
          });
        }
      });
    }
  }

  /**
   * 是否员工代付变更，为是时，删除银行信息
   * @param value
   */
  @Bind
  vendorPayFlagChange(value) {
    const { form } = this.props;
    if (value === '0') {
      form.setFieldsValue({
        payCompanyId: undefined,
        payCompanyNum: undefined,
        payCompanyName: undefined,
        vendorSiteCode: undefined,
      });
      this.setState({
        isCheckBankInfo: true,
      });
      this.bankInfo?.queryBankInfo();
    } else {
      this.setState({
        isCheckBankInfo: false,
      });
      this.bankInfo?.handleTempDeleteBank();
    }
  }

  /**
   * 是否以支票支付 变更
   * @param value
   */
  @Bind
  chequePayFlagChange(value) {
    if (value === 'N') {
      this.setState({
        isCheckBankInfo: true,
      });
      this.bankInfo?.queryBankInfo();
    } else {
      this.setState({
        isCheckBankInfo: false,
      });
      this.bankInfo?.handleTempDeleteBank();
      CusModal.info({
        content: intl
          .get(`${prompt}.view.chequePayFlag.info`)
          .d('请以信函形式提供付款指示，并在公司信笺下盖章签名。'),
        onOk: () => {},
      });
    }
  }

  /**
   * 渠道商付款变更
   *    同时清空发票行所有数据
   * @param value
   * @returns {boolean}
   */
  @Bind()
  commissionFlagChange(value) {
    const { dispatch } = this.props;
    const { costRequestId, isCreate } = this.state;
    if (value === 'Y') {
      this.setState({
        isCommissionFlag: true,
      });
    } else {
      this.setState({
        isCommissionFlag: false,
      });
    }
    if (isCreate) {
      this.setState({
        billDataSource: [],
        billPagination: {},
      });
      return false;
    }

    dispatch({
      type: 'costRequest/batchRemoveInvoices',
      payload: costRequestId,
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.getBillList();
      }
    });
  }

  /**
   * 新建账单头信息
   * @param callback
   */
  @Bind
  handleCreateBillList(callback = (e) => e) {
    const { billDataSource, billPagination } = this.state;
    const newId = uuidv4();
    const newItem = {
      costInvoiceId: newId,
      excludingTaxAmount: 0,
      invoiceAmount: 0,
      invoiceTaxAmount: 0,
      payAmount: 0,
      tempId: Date.now(),
      _status: 'create',
    };
    const newBillPagination = addItemToPagination(billDataSource.length, billPagination);
    const newBillDataSource = [...billDataSource, newItem];
    this.setState(
      {
        billDataSource: newBillDataSource,
        currentActiveInvoiceId: newId,
        billPagination: newBillPagination,
      },
      () => {
        callback(newBillDataSource);
      }
    );
  }

  /**
   * 新建账单行信息
   */
  @Bind
  handleCreateBillDetail(callback = (e) => e) {
    const { billDataSource, currentActiveInvoiceId } = this.state;
    if (billDataSource.length === 0) {
      CusNotification.error({
        message: intl.get(`${prompt}.view.detail.invoice-no-records`).d('请先新增发票'),
      });
      return false;
    }
    const newItem = {
      costDetailLineId: uuidv4(),
      costInvoiceId: currentActiveInvoiceId,
      vendorSiteCode: undefined,
      _status: 'create',
    };
    const newBillDataSource = billDataSource.map((item) => {
      if (item.costInvoiceId === currentActiveInvoiceId) {
        let newBillLinePagination = {};
        const { billLineDataSource = [], billLinePagination = {} } = item;
        newBillLinePagination = addItemToPagination(billLineDataSource.length, billLinePagination);
        return {
          ...item,
          billLineDataSource: [newItem, ...billLineDataSource],
          billLinePagination: newBillLinePagination,
        };
      } else {
        return item;
      }
    });
    this.setState({
      billDataSource: newBillDataSource,
    });
  }

  /**
   * 行切换事件
   * @param activeBillLine 当前激活的账单行数据
   * @param id 点击id
   * @returns {boolean}
   */
  @Bind
  handleClickRow(id) {
    const { billDataSource, currentActiveInvoiceId } = this.state;
    const activeBillLine =
      billDataSource.find((item) => item && item['costInvoiceId'] === currentActiveInvoiceId) || {};
    this.saveCurrentRow(activeBillLine);
    if (currentActiveInvoiceId === id) {
      return false;
    } else {
      this.setState(
        {
          currentActiveInvoiceId: null,
        },
        () => {
          this.setState(
            {
              currentActiveInvoiceId: id,
            },
            () => {
              this.queryBillDetail();
            }
          );
        }
      );
    }
  }

  /**
   * 切换行时缓存 账单行 数据
   * @param activeBill
   */
  @Bind
  saveCurrentRow(activeBill = {}) {
    if (activeBill.billLineDataSource) {
      // eslint-disable-next-line array-callback-return
      activeBill.billLineDataSource.map((item) => {
        if (item.$form) {
          const billLineValues = item.$form.getFieldsValue();
          const {
            serviceStartDate,
            serviceEndDate,
            apportionStartDate,
            apportionEndDate,
            expectRecycleDate,
          } = billLineValues;
          const replaceValue = {
            serviceStartDate: cusDateFormat(serviceStartDate, DATETIME_MIN, item.serviceStartDate),
            serviceEndDate: cusDateFormat(serviceEndDate, DATETIME_MIN, item.serviceEndDate),
            apportionStartDate: cusDateFormat(
              billLineValues.apportionStartDate,
              DATETIME_MIN,
              item.apportionStartDate
            ),
            apportionEndDate: cusDateFormat(
              billLineValues.apportionEndDate,
              DATETIME_MIN,
              item.apportionEndDate
            ),
            expectRecycleDate: cusDateFormat(
              billLineValues.expectRecycleDate,
              DATETIME_MIN,
              item.expectRecycleDate
            ),
          };
          Object.assign(item, {
            ...billLineValues,
            ...replaceValue,
          });
        }
      });
    }
  }

  /**
   * 账单头删除
   * @param keys 勾选行对应的rowKey
   * @param rows 勾选行
   * @param callback
   */
  @Bind
  handleDeleteBillList(keys = [], rows = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const { billDataSource, billPagination } = this.state;
    const deleteData = billDataSource.filter(
      (item) => keys.includes(item.costInvoiceId) && item._status === 'update'
    );
    if (deleteData.length > 0) {
      dispatch({
        type: 'costRequest/deleteBillList',
        payload: deleteData,
      }).then((res) => {
        if (res) {
          CusNotification.success();
          callback();
          this.getBillList(billPagination);
        }
      });
    } else {
      const newDataSource = billDataSource.filter((item) => !keys.includes(item.costInvoiceId));
      const delItemsLength = billDataSource.length - newDataSource.length;
      const newPagination = delItemsToPagination(
        delItemsLength,
        billDataSource.length,
        billPagination
      );
      this.setState(
        {
          billDataSource: newDataSource,
          billPagination: newPagination,
        },
        () => {
          callback();
        }
      );
    }
  }

  /**
   * 复制 账单行
   * @param rows
   * @param callback
   * @returns {boolean}
   */
  @Bind
  handleCopyBillList(rows = [], callback = (e) => e) {
    const { billDataSource, billPagination } = this.state;
    if (rows.length < 1) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return false;
    }
    const newId = uuidv4();
    const copyRows = rows.map((item) => {
      const copyItem = cloneDeep(item);
      const setNilField = {
        costInvoiceId: newId,
        tempId: Date.now(),
        _status: 'create',
        costDetailLineList: undefined,
        excludingTaxAmount: undefined,
        paymentCount: undefined,
        instalmentFlag: '0',
        invoiceAmount: undefined,
        invoiceTaxAmount: undefined,
        billTotalAmount: undefined,
        ebsInvoiceNum: undefined,
        originalData: {},
        billLineDataSource: [],
        billLinePagination: {},
        attachmentLineList: [],
        costInvoiceFilesList: [],
        otherAttachmentLineList: [],
      };
      return { ...copyItem, ...setNilField };
    });
    const newBillPagination = addItemsToPagination(
      copyRows.length,
      billDataSource.length,
      billPagination
    );
    const newBillDataSource = [...billDataSource, ...copyRows];
    this.setState(
      {
        billDataSource: newBillDataSource,
        billPagination: newBillPagination,
      },
      () => {
        callback();
      }
    );
  }

  /**
   * 跳转导入界面
   */
  @Bind
  handelExport() {
    const { history, location = {} } = this.props;
    const { pathname } = location;
    const { isPub } = this.state;
    this.handleSaveAll(false).then((result) => {
      const {
        costPaymentRequest: { costRequestId },
      } = result;
      history.push({
        pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/import/${costRequestId}`,
        state: {
          costRequestId,
          backPath: pathname,
        },
      });
    });
  }

  /**
   * 账单行复制
   * @param rows
   * @param callback
   * @returns {boolean}
   */
  @Bind
  handleCopyBillDetail(rows = [], callback = (e) => e) {
    const { billDataSource, currentActiveInvoiceId } = this.state;
    if (rows.length < 1) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
      return false;
    }
    const newId = uuidv4();
    const copyRows = rows.map((item) => {
      const copyItem = cloneDeep(item);
      const setNilField = {
        costDetailLineId: newId,
        costInvoiceId: currentActiveInvoiceId,
        tempId: Date.now(),
        _status: 'create',
        pendingApportionAmount: undefined,
      };
      return { ...copyItem, ...setNilField };
    });

    const newBillDataSource = billDataSource.map((item) => {
      if (item.costInvoiceId === currentActiveInvoiceId) {
        let newBillLinePagination = {};
        const { billLineDataSource = [], billLinePagination = {} } = item;
        newBillLinePagination = addItemsToPagination(
          copyRows.length,
          billLineDataSource.length,
          billLinePagination
        );
        return {
          ...item,
          billLineDataSource: [...copyRows, ...billLineDataSource],
          billLinePagination: newBillLinePagination,
        };
      } else {
        return item;
      }
    });
    this.setState({
      billDataSource: newBillDataSource,
    });
  }

  /**
   * 账单行删除
   * @param keys 勾选行对应的rowKey
   * @param rows 勾选行
   * @param callback
   */
  @Bind
  handleDeleteBillDetail(keys, rows, callback) {
    const { dispatch } = this.props;
    const { billDataSource, currentActiveInvoiceId, billLineQueryId } = this.state;
    const billLineDataSource =
      billDataSource.find((item) => item.costInvoiceId === currentActiveInvoiceId)
        ?.billLineDataSource || [];

    const deleteData = billLineDataSource.filter(
      (item) => keys.includes(item.costDetailLineId) && item._status === 'update'
    );
    if (deleteData.length > 0) {
      dispatch({
        type: 'costRequest/deleteBillLine',
        payload: deleteData,
      }).then((res) => {
        if (res) {
          CusNotification.success();
          callback();
          remove(billLineQueryId, () => (item) => item === currentActiveInvoiceId);
          this.setState(
            {
              billLineQueryId,
            },
            () => {
              this.queryBillDetail();
              this.computeAmount(rows[0].costInvoiceId, rows);
            }
          );
        }
      });
    } else {
      const newLineDataSource = billLineDataSource.filter(
        (item) => !keys.includes(item.costDetailLineId)
      );
      const delItemsLength = billLineDataSource.length - newLineDataSource.length;

      for (const item of billDataSource) {
        if (item.costInvoiceId === currentActiveInvoiceId) {
          const newLinePagination = delItemsToPagination(
            delItemsLength,
            billLineDataSource.length,
            item.billLinePagination
          );

          item.billLineDataSource = newLineDataSource;
          item.billLinePagination = newLinePagination;
          break;
        }
      }
      this.setState(
        {
          billDataSource,
        },
        () => {
          callback();
          this.computeAmount(rows[0].costInvoiceId, rows);
        }
      );
    }
  }

  /**
   * 发票头 金额计算
   * @param costInvoiceId
   * @param deleteRows
   */
  @Bind
  computeAmount(costInvoiceId, deleteRows) {
    const { dispatch } = this.props;
    const { billDataSource, currentActiveInvoiceId, precision } = this.state;
    const billData =
      billDataSource.find((item) => item.costInvoiceId === currentActiveInvoiceId) || {};
    if (!isNumber(costInvoiceId)) return false;
    dispatch({
      type: 'costRequest/getLinesAmountSum',
      payload: costInvoiceId,
    }).then((res) => {
      if (res) {
        const { lineAmountSum, invoiceTaxAmountSum, excludingTaxAmountSum } = res;

        // 统计删除发票明细行上的 发票行金额
        const invoiceAmount = deleteRows.reduce((total, currentValue) => {
          return total + currentValue.originalData['lineAmount'];
        }, 0);
        // 统计删除发票明细行上的 发票税额
        const taxAmount = deleteRows.reduce((total, currentValue) => {
          return total + currentValue.originalData['invoiceTaxAmount'];
        }, 0);

        // 统计删除发票明细行上的 发票不含税金额
        const excludingTaxAmount = deleteRows.reduce((total, currentValue) => {
          return total + currentValue.originalData['excludingTaxAmount'];
        }, 0);

        // 发票行金额、税额、不含税金额重新统计 到发票头
        Object.assign(billData, {
          invoiceAmount: Number(numberRender(lineAmountSum - invoiceAmount, precision, false)),
          invoiceTaxAmount: Number(numberRender(invoiceTaxAmountSum - taxAmount, precision, false)),
          excludingTaxAmount: Number(
            numberRender(excludingTaxAmountSum - excludingTaxAmount, precision, false)
          ),
        });
        this.setState({});
      }
    });
  }

  /**
   * 基础信息保存
   *  用于保存产品类型
   */
  @Bind
  handleSaveRequestHeader() {
    const { form, dispatch } = this.props;
    const { headerData } = this.state;
    const values = form.getFieldsValue();
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'costRequest/saveAll',
        payload: {
          costPaymentRequest: {
            ...headerData,
            ...values,
            requestTitle: `COS-${values.requestTitle || ''}`,
            requestDate: cusDateFormat(values.requestDate, DATETIME_MIN),
            expectPaymentDate: cusDateFormat(values.expectPaymentDate, DATETIME_MIN),
            productType: values.productType.join(','),
          },
        },
      }).then((res) => {
        if (res) {
          CusNotification.success();
          this.getDetailInfo();
          resolve(res);
        } else {
          reject();
        }
      });
    });
  }

  /**
   * 保存
   */
  @Bind
  @Debounce(500, { leading: true })
  handleSaveAll(isTip = true) {
    const { form, dispatch, history } = this.props;
    const {
      isPub,
      costRequestId,
      headerData,
      billDataSource,
      currentActiveInvoiceId,
      otherAttDataSource,
    } = this.state;

    const values = form.getFieldsValue();
    let paymentBankInfo = {};
    if (this.bankInfo) {
      paymentBankInfo = this.bankInfo.state.dataSource[0];
    }
    const costDetailInvoiceList = billDataSource.map((item) => {
      const billValues = item.$form?.getFieldsValue() || {};
      // eslint-disable-next-line no-unused-vars
      const { invoiceAttachment = [] } = billValues;
      invoiceAttachment.forEach((invoiceFile) => {
        if (invoiceFile._status === 'create') {
          // eslint-disable-next-line no-param-reassign
          delete invoiceFile.invoiceFileId;
          // eslint-disable-next-line no-param-reassign
          delete invoiceFile.costInvoiceId;
        }
      });
      return {
        costDetailInvoice: {
          ...item,
          ...billValues,
          costInvoiceId: item._status === 'create' ? undefined : item.costInvoiceId,
          invoiceDate: cusDateFormat(billValues.invoiceDate, DATETIME_MIN, item.invoiceDate),
          termsDate: cusDateFormat(billValues.termsDate, DATETIME_MIN, item.termsDate),
          glDate: cusDateFormat(billValues.glDate, DATETIME_MIN, item.glDate),
        },
        costDetailLineList: item.billLineDataSource?.map((line) => {
          const billLineValues = line.$form?.getFieldsValue() || {};
          let diffDetail;
          if (currentActiveInvoiceId === line.costInvoiceId) {
            diffDetail = {
              ...line,
              ...billLineValues,
              serviceStartDate: cusDateFormat(
                billLineValues.serviceStartDate,
                DATETIME_MIN,
                line.serviceStartDate
              ),
              serviceEndDate: cusDateFormat(
                billLineValues.serviceEndDate,
                DATETIME_MIN,
                line.serviceEndDate
              ),
              apportionStartDate: cusDateFormat(
                billLineValues.apportionStartDate,
                DATETIME_MIN,
                line.apportionStartDate
              ),
              apportionEndDate: cusDateFormat(
                billLineValues.apportionEndDate,
                DATETIME_MIN,
                line.apportionEndDate
              ),
              expectRecycleDate: cusDateFormat(
                billLineValues.expectRecycleDate,
                DATETIME_MIN,
                line.expectRecycleDate
              ),
            };
          } else {
            diffDetail = {
              ...line,
            };
          }
          return {
            costDetailLine: {
              ...diffDetail,
              costDetailLineId:
                diffDetail._status === 'create' ? undefined : diffDetail.costDetailLineId,
              costInvoiceId: diffDetail._status === 'create' ? undefined : diffDetail.costInvoiceId,
            },
            costCoaAccount: line.costCoaAccount ? line.costCoaAccount : undefined,
            taxCostCoaAccount: line.taxCostCoaAccount ? line.taxCostCoaAccount : undefined,
          };
        }),
        costInvoiceFilesList: billValues.invoiceAttachment,
      };
    });
    const costAttachFileList = getEditTableData(otherAttDataSource, ['costAttachFileId']);
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'costRequest/saveAll',
        payload: {
          costPaymentRequest: {
            ...headerData,
            ...values,
            requestTitle: `COS-${values.requestTitle || ''}`,
            requestDate: cusDateFormat(values.requestDate, DATETIME_MIN),
            expectPaymentDate: cusDateFormat(values.expectPaymentDate, DATETIME_MIN),
            productType: values.productType.join(','),
          },
          costDetailInvoiceList,
          costAttachFileList,
          paymentBankInfo,
        },
      }).then((res) => {
        if (res) {
          if (isTip) {
            CusNotification.success();
          }
          const { costPaymentRequest } = res;

          if (costRequestId !== `${costPaymentRequest.costRequestId}`) {
            history.push({
              pathname: `${isPub ? '/pub' : ''}/spcm/cost/payment/request/detail/${
                costPaymentRequest.costRequestId
              }`,
            });
            this.setState({
              costRequestId: costPaymentRequest.costRequestId,
              requestStatus: costPaymentRequest.requestStatus,
            });
            this.handleRefreshData();
            this.workFlowDetailInfo(costPaymentRequest.costRequestId, 30);
          } else {
            this.handleRefreshData();
            resolve(res);
          }
        } else {
          reject();
        }
      });
    });
  }

  /**
   * 更新基础信息总金额
   */
  @Bind()
  getTotalAmount() {
    const { billDataSource, precision } = this.state;
    const invoiceAmount = billDataSource.reduce((total, currentValue) => {
      return total + currentValue['invoiceAmount'];
    }, 0);
    return Number(numberRender(invoiceAmount, precision, false));
  }

  /**
   * 更新发票头 金额
   * @param billLineRecord
   * @param precision
   * @param fieldName
   * @param headerName
   */
  @Bind
  updateInvoiceHeaderAmount(billLineRecord, precision, fieldName = '', headerName = '') {
    const { billDataSource, currentActiveInvoiceId } = this.state;

    // 当前发票头，发票行数据
    const billData =
      billDataSource.find((item) => item.costInvoiceId === currentActiveInvoiceId) || {};
    const billLineData = billData?.billLineDataSource || [];

    const computed = (fieldName, headerName) => {
      const oldAmount = sum(billLineData.map((item) => item.originalData?.fieldName || 0));
      const newAmount = sum(billLineData.map((item) => item[fieldName] || 0));
      // 计算发票头的金额
      const headerAmount = (billData.originalData?.headerName || 0) + newAmount - oldAmount;
      Object.assign(billData, {
        [headerName]: Number(numberRender(headerAmount, precision, false)),
      });
    };
    computed(fieldName, headerName);
    computed('excludingTaxAmount', 'excludingTaxAmount');
    this.setState({});
  }

  /**
   * 新建其他附件
   */
  @Bind()
  handleCreateOtherAtt() {
    const { otherAttDataSource = [], otherAttPagination = {} } = this.state;
    const newItem = {
      costAttachFileId: uuidv4(),
      _status: 'create',
      fileType: 'OTHER',
    };
    const newPagination = addItemToPagination(otherAttDataSource.length, otherAttPagination);
    this.setState({
      otherAttDataSource: [...otherAttDataSource, newItem],
      otherAttPagination: newPagination,
    });
  }

  /**
   * 删除其他附件
   * @param rows
   * @param keys
   * @param callback
   */
  @Bind()
  handleDeleteOtherAtt(rows, keys, callback) {
    const { otherAttDataSource, otherAttPagination } = this.state;
    const updateLines = rows.filter((item) => item._status === 'update');
    const newDataSource = otherAttDataSource.filter(
      (item) => !keys.includes(item.costAttachFileId)
    );
    const newPagination = delItemsToPagination(
      rows.length,
      otherAttDataSource.length,
      otherAttPagination
    );
    if (updateLines.length > 0) {
      const { dispatch } = this.props;
      dispatch({
        type: 'costRequest/deleteOtherAtt',
        payload: updateLines,
      }).then((res) => {
        if (res) {
          CusNotification.success();
          if (newDataSource.length === 0) {
            this.getAttachFiles('0');
          } else {
            this.setState(
              {
                otherAttDataSource: newDataSource,
                otherAttPagination: newPagination,
              },
              () => {
                callback();
              }
            );
          }
        }
      });
    } else {
      this.setState(
        {
          otherAttDataSource: newDataSource,
          otherAttPagination: newPagination,
        },
        () => {
          callback();
        }
      );
    }
  }

  /**
   * 渠道商酬金选择
   * @param callback
   * @returns {boolean|number}
   */
  @Bind()
  selectChannelCommission(callback = (e) => e) {
    const { form } = this.props;
    const { currencyCode } = this.state;
    const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');
    const ouOrgCode = form.getFieldValue('ouOrgCode');
    if (!this.billList) {
      console.warn('this billList ref is empty');
      return false;
    }
    const { selectedRows } = this.billList.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneInvoice').d('请至少选择一行发票头'),
      });
      return 0;
    }
    if (vendorCompanyNum && ouOrgCode && currencyCode) {
      callback();
      this.setState({
        commissionDataVisible: true,
      });
    } else {
      CusNotification.error({
        message: intl
          .get(`${prompt}.view.detail.vendorCompanyNum-ouOrgCode-currencyCode`)
          .d('请先维护币种、供应商和公司主体'),
      });
    }
  }

  /**
   * 渠道商选择点击确认
   * @param data
   * @returns {boolean}
   */
  @Bind()
  handleChannelCommissionOk(data = []) {
    const { billDataSource } = this.state;
    if (!this.billList) {
      console.warn('this billList ref is empty');
      return false;
    }
    const { selectedRows } = this.billList.state;
    selectedRows.forEach((record = {}) => {
      const billData = billDataSource.find((item) => item.costInvoiceId === record.costInvoiceId);
      const newBillLine = data.map((item) => ({
        ...item,
        costProductCategoryName: item.costProductCategory,
        lineAmount: item.unpaidPaymentAmount,
        costInvoiceId: record.costInvoiceId,
        tempId: record.tempId, // 使用临时id与新增未保存的发票头创建关联
        sourceLineId: item['dataId'] || -1, // 来源id，渠道商酬金数据主键id，空给-1（正常情况不会空），用于定位问题；
        sourceCode: 'SPCM_COMMISSION_DATA', // 来源编码，常量（SPCM_COMMISSION_DATA），渠道商酬金数据表名；
        remarks: 'Commission', // 付款申请行描述默认为Commission
        _status: 'create',
      }));

      billData.billLineDataSource = [...billData.billLineDataSource, ...newBillLine];
    });
    this.setState({
      billDataSource,
    });
    this.handleSaveAll();
  }

  /**
   * coa保存
   * @param callback
   */
  @Bind
  handleSaveCoa(callback = (e) => e) {
    this.handleSaveAll().then(() => {
      callback();
    });
  }

  /**
   * 币种变更，同时计算精度
   **/
  @Bind
  changeCurrencyCode(value) {
    const precision = ['IDR', 'VND', 'JPY', 'KRW'].includes(value) ? 0 : 2;
    this.setState({
      currencyCode: value,
      precision,
    });
  }

  render() {
    const {
      form,
      idpValueMap = {},
      exportPdfLoading = false,
      mipLoading = false,
      queryLoading = false,
      saveLoading = false,
      deleteOtherAttLoading = false,
      queryAttachLoading = false,
      supAttViewButtonFlag,
    } = this.props;
    const {
      activeKey,
      headerData = {},
      billDataSource,
      billPagination,
      currentActiveInvoiceId,
      fileFlag,
      defaultFlag,
      bankModifyFlag,
      isCheckBankInfo = true,
      otherAttDataSource,
      requireAttDataSource,
      approvalReqRecVOList,
      isCreate,
      costRequestId,
      fileDownloadLoading = false,
      costRequestLoading = false,
      submitErrorMessage,
    } = this.state;
    const headInfoProps = {
      parent: this,
      ...this.state,
      ...this.props,
      headerData: headerData,
      changeCurrencyCode: this.changeCurrencyCode,
      changeOrgName: this.changeOrgName,
      changeVendor: this.changeVendor,
      chequePayFlagChange: this.chequePayFlagChange,
      vendorPayFlagChange: this.vendorPayFlagChange,
      getTotalAmount: this.getTotalAmount,
      commissionFlagChange: this.commissionFlagChange,
      saveRequestHeader: this.handleSaveRequestHeader,
    };
    const payInfoProps = {
      ...this.state,
      ...this.props,
      activeRowKey: currentActiveInvoiceId,
      billListProps: {
        onCreate: this.handleCreateBillList,
        onDelete: this.handleDeleteBillList,
        onCopy: this.handleCopyBillList,
        toExport: this.handelExport,
        onClickRow: this.handleClickRow,
        billDataSource: billDataSource,
        billPagination: billPagination,
        onRef: (node) => {
          this.billList = node;
        },
      },
      billDetailProps: {
        billDataSource: billDataSource,
        dataSource:
          billDataSource.find((item) => item.costInvoiceId === currentActiveInvoiceId)
            ?.billLineDataSource || [],
        pagination:
          billDataSource.find((item) => item.costInvoiceId === currentActiveInvoiceId)
            ?.billLinePagination || {},
        onCreate: this.handleCreateBillDetail,
        onDelete: this.handleDeleteBillDetail,
        onCopy: this.handleCopyBillDetail,
        onChange: (page) => this.queryBillDetail(page, true),
        selectChannelCommission: this.selectChannelCommission,
        handleChannelCommissionOk: this.handleChannelCommissionOk,
        onUpdateAmount: this.updateInvoiceHeaderAmount,
        onSaveCoa: this.handleSaveCoa,
        onGetBillList: this.getBillList,
        onRef: (node) => {
          this.billDetail = node;
        },
      },
    };

    const bankInfoProps = {
      ...this.props,
      ...this.state,
      onRef: (node) => {
        this.bankInfo = node;
      },
    };

    const supAttachmentProps = {
      isCreate,
      infoFlag: headerData.checkDateFlag === 'Y',
      costRequestId,
      idpValueMap,
      onRef: (node) => {
        this.supAttachment = node;
      },
    };

    return (
      <>
        <PageWrapper
          requiredColor={true}
          loading={queryLoading || costRequestLoading || mipLoading || saveLoading}
          pageTop={
            <>
              {submitErrorMessage ? <PageErrorMessage message={submitErrorMessage} /> : null}
              <StepPanel pressLevel={form.getFieldValue('pressLevel')} requestId={costRequestId} />
            </>
          }
        >
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Collapse.Panel
              key="headInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.detail.info.title`).d('基本信息')}
                  arrowActive={activeKey.includes('headInfo')}
                />
              }
            >
              <HeadInfo {...headInfoProps} />
            </Collapse.Panel>
            <Collapse.Panel
              key="payInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.detail.pay.title`).d('付款明细')}
                  arrowActive={activeKey.includes('payInfo')}
                />
              }
            >
              <PayDetail {...payInfoProps} />
            </Collapse.Panel>
            <Collapse.Panel
              key="bankInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.bankInfo.info.title`).d('银行信息')}
                  arrowActive={activeKey.includes('bankInfo')}
                  buttons={this.bankInfo?.getButtons(
                    form,
                    fileFlag,
                    defaultFlag,
                    isCheckBankInfo,
                    bankModifyFlag
                  )}
                />
              }
            >
              <BankInfo {...bankInfoProps} />
            </Collapse.Panel>
            <Collapse.Panel
              key="fileInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.detail.file.title`).d('附件上传')}
                  arrowActive={activeKey.includes('fileInfo')}
                />
              }
            >
              <AttachFiles
                loading={queryAttachLoading}
                deleteLoading={deleteOtherAttLoading}
                dataSource={otherAttDataSource}
                isOther
                isEdit={defaultFlag || fileFlag}
                onCreate={this.handleCreateOtherAtt}
                onDelete={this.handleDeleteOtherAtt}
                idpValueMap={idpValueMap}
              />
              <div style={{ marginTop: '24px' }} />
              {/*必要附件*/}
              <AttachFiles
                dataSource={requireAttDataSource}
                isEdit={false}
                idpValueMap={idpValueMap}
              />
            </Collapse.Panel>
            <Collapse.Panel
              key="supplyAttachmentInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.detail.supplyAttachment.title`).d('补充附件')}
                  arrowActive={activeKey.includes('supplyAttachmentInfo')}
                  buttons={supAttViewButtonFlag ? <div style={{ height: '32px' }} /> : null}
                />
              }
            >
              <SupAttachment {...supAttachmentProps} />
            </Collapse.Panel>
            <Collapse.Panel
              key="approvalInfo"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.detail.approval.title`).d('审批历史')}
                  arrowActive={activeKey.includes('approvalInfo')}
                />
              }
            >
              <ApprovalList dataSource={approvalReqRecVOList} />
            </Collapse.Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons
          ref={this.cusApprovalBtns}
          onOk={this.handleReceiveMipOK}
          onClose={() => this.getDataSetDetail(false)}
          onModalCancel={this.handleRefreshData}
          isCloseModal={false}
        >
          {this.generateApprovalBtns(exportPdfLoading, fileDownloadLoading)}
        </CusApprovalButtons>
      </>
    );
  }
}

export default CostPayment;
