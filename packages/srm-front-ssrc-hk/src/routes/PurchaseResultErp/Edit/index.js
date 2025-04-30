import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import SearchApplication from './SearchApplication';
import BudgetDataTable from './BudgetDataTable';
import SupplierDataTable from './SupplierDataTable';
import PriceSheetDataTable from './PriceSheetDataTable';
import ClauseDataTable from './ClauseDataTable';
import PurchaseOrderDataTable from './PurchaseOrderDataTable';
import FilterSearch from './FilterSearch';
import styles from './index.less';
import classnames from 'classnames';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] }) @connect(({ purchaseResultModel, purchaseApplicationCusModel, loading }) => ({
  purchaseResultModel,
  purchaseApplicationCusModel,
   // fetchLoading: loading.effects['purchaseApplicationModel/queryPurchaseApplicationList'],
  // submitLoading: loading.effects['resaleRfq/submitSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitSummary'] ||
  //   loading.effects['resaleRfq/submitValidateSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
  //   loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // publishLoading: loading.effects['resaleRfq/publishSummary'] ||
  //   loading.effects['resaleRfq/ictsPublishSummary'] ||
  //   loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  // queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  // exportLoading: loading.effects['resaleRfq/enquiryExport'],
})) @fastCodeLoader(['ISP.RFP_HEADER_STATUS', 'ISP.RFP_QUICK_SEARCH_CONDITION', 'RS_IBOSS_PRODUCT_TYPE_ISP_RFP', 'VP.PRICE_CONTRACT_SIGN_ENTITY', 'RS_RFQ_HEAD_STATUS', 'HKPC.PRRECORDSSTATUS', 'HKSP.SUPPLIER',]) @Form.create()
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'resultTable', 'uploadTable', 'supplierTable', 'budgetTable', 'priceSheetTable', 'clauseTable', 'purchaseOrderTable',],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      SearchTabActiveKey: '1',
      affairTitle: '',
      projectInfo: {},
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    this.handleSearch();
    this.listener();
  }

  /**
   * @description 查询采购结果详情数据
   */
  @Bind()
  handleSearch(resPrNo) {
    let nextActivityCode;
    let paName;
    let affairTitle;
    const {
      dispatch, location: { search },
    } = this.props;
    const { prNumber, estimatedBudgetAmountHkd, proCode, formRecordId, prNumberErp } = querystring.parse(search.substring(1));
    console.log(formRecordId, 'formRecordId');
    console.log(proCode, 'proCode');
    dispatch({
      type: 'purchaseResultModel/getResultModalEasy', payload: {
        proCode: resPrNo || proCode || formRecordId || prNumber || prNumberErp,
      },
    }).then((res) => {
      if (res) {
        this.handleQuery(res?.cmhkPrFourthHead?.refThirdId)
        console.log(res, 'res查询详情');
        paName: res.cmhkPrFourthHead.paName;
        dispatch({
          type: 'purchaseResultModel/commentUpdateState', payload: {
            cmhkPrFourthHead: res.cmhkPrFourthHead,
            cmhkPrFourthBgList: res.cmhkPrFourthBgList,
            cmhkPrFourthSup: res.cmhkPrFourthSup,
            cmhkPrFourthQuoteList: res.cmhkPrFourthQuoteList,
            cmhkPrFourthClause: res.cmhkPrFourthClause,
            cmhkPrFourthPoList: res.cmhkPrFourthPoList,
            orderHandler: res.cmhkPrFourthSup?.orderHandler,
            orderHandlerName: res.cmhkPrFourthSup?.orderHandlerName,
            chooseSupplier: res.cmhkPrFourthSup?.chooseSupplier,
            supplierNameCh: res.cmhkPrFourthSup?.supplierNameCh,
            paStatus: res.cmhkPrFourthHead.paStatus,
          },
        });
        // dispatch({
        //   type: 'purchaseResultModel/getNodeInfo',
        //   payload: {
        //     formRecordId: 'jyxjcgjg',
        //     formRecordCode: resPrNo || proCode || formRecordId || prNumber,
        //     templateCode: 'BPM_SCM_yibancaigoujieguo',
        //   },
        // }).then((res2) => {
        //   console.log(res2, '节点信息');
        //   if (res2) {
        //     nextActivityCode = res2?.nextActivityCode;
        //     switch (nextActivityCode) {
        //       case 'SCM01':
        //         affairTitle = intl
        //           .get('HKPC.commom.view.title.bpmPAApproval', { prname: paName })
        //           .d(`采购结果审批-关于${paName}采购结果审批`);
        //         break;
        //       case 'SCM02':
        //         affairTitle = intl
        //           .get('HKPC.commom.view.title.bpmPAApproval', { paname: paName })
        //           .d(`采购结果审批-关于${paName}采购结果审批`);
        //         break;
        //       default:
        //         affairTitle = intl
        //           .get('HKPC.commom.view.title.bpmPADraft', { prname: paName })
        //           .d(`采购结果起草-关于${paName}采购结果起草`);
        //     }
        //   }
        //   this.setState({
        //     affairTitle,
        //   });
        // });
      }
    });
  }

  // 查询项目信息数据
  @Bind()
  handleQuery(formRecordId) {
    const { dispatch } = this.props;
    // 查询报价文件详情数据
    dispatch({
      type: 'purchaseApplicationCusModel/getPriceCollect',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          projectInfo: res,
        });
      }
    });
  }

  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    const {
      creationDateFrom, creationDateTo, enquiryStartDateFrom, enquiryStartDateTo, enquiryEndDateFrom, enquiryEndDateTo,
    } = fieldsValue || {};
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom) ? creationDateFrom.format('YYYY-MM-DD 00:00:00') : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo) ? creationDateTo.format('YYYY-MM-DD 23:59:59') : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom) ? enquiryStartDateFrom.format('YYYY-MM-DD 00:00:00') : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo) ? enquiryStartDateTo.format('YYYY-MM-DD 23:59:59') : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom) ? enquiryEndDateFrom.format('YYYY-MM-DD 00:00:00') : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo) ? enquiryEndDateTo.format('YYYY-MM-DD 23:59:59') : undefined,
    };
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const deleteFlag = data.every((item) => item.enquiryPriceStatus === 'NEW');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'), onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList', payload: data,
          }).then((res) => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        }, okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
  }

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary', payload: selectSubmitData.map((item) => {
        return {
          enquiryPriceId: item.enquiryPriceId, enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then((r) => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary', payload: {
            enquiryPriceList: selectSubmitData, onlySubmit,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              submitModalVisible: false,
            });
            CusNotification.success();
            this.handleSearch();
          }
        });
      }
    });
  }

  /**
   * @description 公用的提交 handleSubmitCommon
   * @param {*} data 提交的数据
   * @param {*} onlySubmit 是否是只提交
   */
  @Bind()
  handleSubmitCommon(data = [], onlySubmit = 'N') {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/submitValidateCommonSummary', payload: {
        enquiryPriceRoundsList: data.map((item) => {
          return {
            enquiryPriceId: item.enquiryPriceId, enquiryPriceRoundsId: item.enquiryPriceRoundsId,
          };
        }), typeCode: 'CHINA_DIA', validateAllFlag: 'Y',
      },
    }).then((r) => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitEnquiryPriceSummary', payload: {
            typeCode: 'CHINA_DIA',
            enquiryPriceRoundsList: data, onlySubmit,
          },
        }).then((res) => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
        });
      }
    });
  }

  // 导出
  @Bind()
  handleExport() {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/enquiryExport', payload: {
        ...this.getQueryParams(), fillerType: 'peer-multi-sheet', async: false, exportType: 'DATA', ids: [2, 3, 4, 5, 6],
      },
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${promptCode}.view.export.fileName`).d('询价单导出报表') + `(${dayjs().format('YYYYMMDD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  //致远流程
  @Bind()
  listener() {
    const {
      location: { search },
    } = this.props;
    const { proCode, formRecordId, prNumber } = querystring.parse(search.substring(1));
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      console.log('e', e);
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 代办保存 知会 会签 发送
        if (['SUBMIT', 'DRAFT_HANDLE', 'NOTICE', 'GIVE', 'SEND'].includes(e.data.submitType)) {
          this.save((params) => {
            console.log(params, 'params');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId:
                      params.cmhkPrFourthHead.prNo || proCode || formRecordId || prNumber, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        paname:
                          params?.cmhkPrFourthHead?.paNumber +
                          ':' +
                          params?.cmhkPrFourthHead?.paName,
                      })
                      .d(
                        `采购结果审批-关于${params?.cmhkPrFourthHead?.paNumber}:${params?.cmhkPrFourthHead?.paName}采购结果审批`
                      ), //待办流程名称
                    jine: params.cmhkPrFourthHead.paAmountHkd,
                    managerId: getCurrentUser().loginName,
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['BACK'].includes(e.data.submitType)) {
          this.save((params) => {
            console.log(params, 'params');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId:
                      params.cmhkPrFourthHead.prNo || proCode || formRecordId || prNumber, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        paname:
                          params?.cmhkPrFourthHead?.paNumber +
                          ':' +
                          params?.cmhkPrFourthHead?.paName,
                      })
                      .d(
                        `采购结果驳回-关于${params?.cmhkPrFourthHead?.paNumber}:${params?.cmhkPrFourthHead?.paName}采购结果驳回`
                      ), //待办流程名称
                    jine: params.cmhkPrFourthHead.paAmountHkd,
                    managerId: getCurrentUser().loginName,
                  },
                },
                e.data.url
              );
            }
          });
        } else {
          this.save((params) => {
            console.log(params, 'params');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId:
                      params.cmhkPrFourthHead.prNo || proCode || formRecordId || prNumber, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        paname:
                          params?.cmhkPrFourthHead?.paNumber +
                          ':' +
                          params?.cmhkPrFourthHead?.paName,
                      })
                      .d(
                        `采购结果审批-关于${params?.cmhkPrFourthHead?.paNumber}:${params?.cmhkPrFourthHead?.paName}采购结果审批`
                      ), //待办流程名称
                    jine: params.cmhkPrFourthHead.paAmountHkd,
                    managerId: getCurrentUser().loginName,
                  },
                },
                e.data.url
              );
            }
          });
        }
      }
    });
  }

  //采购结果保存按钮
  @Bind()
  save(callback) {
    const { purchaseResultModel } = this.props;
    const { projectInfo } = this.state;
    const {
      cmhkPrFourthHead,
      cmhkPrFourthSup,
      cmhkPrFourthBgList,
      cmhkPrFourthQuoteList,
      cmhkPrFourthClause,
      cmhkPrFourthPoList,
      orderHandler,
      orderHandlerName,
      chooseSupplier,
      supplierNameCh,
    } = purchaseResultModel;
    const resultFormObj = this.resultForm.props.form.getFieldsValue();
    console.log(resultFormObj, 'resultFormObj');
    console.log(this.resultForm, 'this.resultForm');
    const { dispatch } = this.props;
    this.resultForm.props.form.validateFields((err, val) => {
      if (!err) {
        dispatch({
          type: 'purchaseResultModel/savePurchaseResultDetail', payload: {
            cmhkPrFourthHead: {
              ...cmhkPrFourthHead, ...resultFormObj, paAmountHkd: cmhkPrFourthHead?.paAmountHkd.toString().replace(/,/g, ''),
            }, cmhkPrFourthSup: {
              ...cmhkPrFourthSup, orderHandler, orderHandlerName, chooseSupplier, supplierNameCh,
            }, cmhkPrFourthBgList, cmhkPrFourthQuoteList, cmhkPrFourthClause, cmhkPrFourthPoList,
          },
        }).then((res) => {
          console.log(res, 'res');
          this.handleSearch(res.cmhkPrFourthHead.prNo);
          if (res) {
            if (typeof callback === 'function') {
              callback(res);
            }
            CusNotification.success();
          }
        });
      }
    });
  }

  render() {
    const {
      idpValueMap = {}, fetchLoading = false, submitLoading = false, history, location, purchaseResultModel, form, dispatch,
    } = this.props;
    const {
      activeKey, modalVisible = false, submitModalVisible = false, SearchTabActiveKey, projectInfo,
    } = this.state;
    //基本信息-项目信息
    const projectFormProps = {
      idpValueMap, onRef: (ref) => {
        this.projectForm = ref.projectForm;
      }, purchaseResultModel, form,
    };
    //结果信息
    const resultFormProps = {
      idpValueMap, onRef: (ref) => {
        this.resultForm = ref;
      }, purchaseResultModel, form, projectInfo,
    };
    //预算信息
    const budgetTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      form,
    };
    //推荐供应商信息
    const supplierTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      form,
      dispatch,
    };
    //报价单信息
    const priceSheetTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      form,
    };
    //报价条款
    const clauseTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      form,
    };
    //采购订单相关信息
    const purchaseOrderTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      form,
    };

    return (<div
      className={styles['out-pageWrapper']}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center',
      }}
    >
      <PageWrapper loading={fetchLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
              arrowActive={activeKey.includes('resultTable')}
            />}
            key="resultTable"
          >
            <SearchApplication {...resultFormProps} />
          </Panel>
          {/* <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`${promptCode}.view.title.budgetlinformation`).d('预算信息')}
              arrowActive={activeKey.includes('budgetTable')}
            />}
            key="budgetTable"
          >
            <BudgetDataTable {...budgetTableProps} />
          </Panel> */}
          <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`${promptCode}.view.title.Recommendedsupplierinformation`).d('中选供应商信息')}
              arrowActive={activeKey.includes('supplierTable')}
            />}
            key="supplierTable"
          >
            <SupplierDataTable {...supplierTableProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`${promptCode}.view.title.Informationaboutpurchaseorders`).d('采购订单相关信息')}
              arrowActive={activeKey.includes('purchaseOrderTable')}
            />}
            key="purchaseOrderTable"
          >
            <PurchaseOrderDataTable {...purchaseOrderTableProps} />
          </Panel>
          {/* <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`${promptCode}.view.title.QuotationTerms`).d('报价条款')}
              arrowActive={activeKey.includes('clauseTable')}
            />}
            key="clauseTable"
          >
            <ClauseDataTable {...clauseTableProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={<PanelHeader
              title={intl.get(`${promptCode}.view.title.Quotationinformation`).d('报价单信息')}
              arrowActive={activeKey.includes('priceSheetTable')}
            />}
            key="priceSheetTable"
          >
            <PriceSheetDataTable {...priceSheetTableProps} />
          </Panel> */}
        </Collapse>
      </PageWrapper>
      {/*<CusApprovalButtons*/}
      {/*  approvalRequestButtonVOList={[]}*/}
      {/*  ref={this.cusApprovalBtns}*/}
      {/*  children={*/}
      {/*    <>*/}
      {/*      <CusButton onClick={this.save}>保存</CusButton>*/}
      {/*    </>*/}
      {/*  }*/}
      {/*></CusApprovalButtons>*/}
    </div>);
  }
}
