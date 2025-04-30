import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, createPagination } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import SearchApplication from './SearchApplication';
import DecisionDataTable from './DecisionDataTable';
import PackageDataTable from './PackageDataTable';
import PriceSheetDataTable from './PriceSheetDataTable';
import ClauseDataTable from './ClauseDataTable';
import PurchaseOrderDataTable from './PurchaseOrderDataTable';
import FilterSearch from './FilterSearch';
import ViCoScSuTable from './ViCoScSuTable';
import styles from './index.less';
import classnames from 'classnames';
import uuid from 'uuid/v4';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode, 'bid.bidcommon'] })
@connect(({ purchaseResultModel, singlePurchaseApplicationCusModel, loading }) => ({
  purchaseResultModel,
  singlePurchaseApplicationCusModel,
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
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRRECORDSSTATUS',
  'HKSP.SUPPLIER',
  'HKPC.PURCHASINGCATEGORY',
  'BID.PROCUREMENT_METHOD',
])
@Form.create()
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    this.state = {
      activeKey: [
        'form',
        'resultTable',
        'uploadTable',
        'packageTable',
        'decisionTable',
        'priceSheetTable',
        'clauseTable',
        'purchaseOrderTable',
        'viCoScSuTable',
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      SearchTabActiveKey: '2',
      isShowDecision: true,
      projectInfo: {},
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    this.getPurchaseResultWay()
    this.handleSearch();
    this.listener();
  }

  /**
   * @description 查询采购结果详情数据
   */
  @Bind()
  handleSearch(resPrNo) {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { prNumber, estimatedBudgetAmountHkd, proCode, formRecordId, prNumberErp } = querystring.parse(
      search.substring(1),
    );
    console.log(formRecordId, 'formRecordId');
    console.log(proCode, 'proCode');
    dispatch({
      type: 'purchaseResultModel/getResultModal',
      payload: {
        proCode: resPrNo || proCode || formRecordId || prNumber || prNumberErp,
      },
    }).then((res) => {
      if (res) {
        if(res?.cmhkPrFourthHead?.decisionType) {
          this.handleDecisionInformation(res?.cmhkPrFourthHead?.refThirdId);
        } else {
          this.handleQuery(res?.cmhkPrFourthHead?.refThirdId);
        }
        console.log(res, 'res查询详情');
        dispatch({
          type: 'purchaseResultModel/commentUpdateState',
          payload: {
            fourthHead: res?.cmhkPrFourthHead, //主表数据
            fourthPackageList: res?.cmhkPrFourthPackageList?.map(item => {
              return {
                ...item,
                uuid: uuid(),
              };
            }), //标包数据
            content: res?.content, //决策内容
            decisionsList: res?.prFourthDecisionFileList, //决策附件信息
            fourthFileList: res?.cmhkPrFourthDecisionsList?.flatMap(obj => obj.cmhkPrFourthFiles.map(file => ({
              fileName: file.fileName,
              fileUrl: file.fileUrl,
            }))), //决策信息里的附件
            fourthQuoteList: res?.cmhkPrFourthQuoteList, //报价单信息
            fourthClauseList: res?.cmhkPrFourthClauseList,//报价条款
            fourthPoList: res?.cmhkPrFourthPoList,//采购订单相关信息
            paStatusYB: res?.cmhkPrFourthHead?.paStatus,
          },
        });
        if(res?.cmhkPrFourthHead?.tenRate) {
          // 综合评分汇总
          this.handleViCoScSu();
        }
      }
    });
  }

  @Bind()
  handleDecisionInformation(formRecordId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseResultModel/getDecisionInformation',
      payload: {
        proId: formRecordId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          projectInfo: res
        })
      }
    })
  }

  // 查询项目信息数据
  @Bind()
  handleQuery(formRecordId) {
    const { dispatch } = this.props;
    // 查询报价文件详情数据
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getPriceCollect',
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

  @Bind()
  handleViCoScSu(page = {}) {
    const { dispatch, purchaseResultModel } = this.props;
    const { fourthHead } = purchaseResultModel;
    dispatch({
      type: 'purchaseResultModel/getViCoScSu',
      payload: {
        page,
        proId: fourthHead?.proId,
      }
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuid(),
        }));
        dispatch({
          type: 'purchaseResultModel/commentUpdateState',
          payload: {
            viCoScSuDataSource: newDataSource,
            viCoScSuPagination: pagination,
          }
        })
      }
    })
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
      creationDateFrom,
      creationDateTo,
      enquiryStartDateFrom,
      enquiryStartDateTo,
      enquiryEndDateFrom,
      enquiryEndDateTo,
    } = fieldsValue || {};
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom)
        ? creationDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo)
        ? creationDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom)
        ? enquiryStartDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo)
        ? enquiryStartDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom)
        ? enquiryEndDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo)
        ? enquiryEndDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
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
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList',
            payload: data,
          }).then((res) => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
  }

  // 导出
  @Bind()
  handleExport() {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/enquiryExport',
      payload: {
        ...this.getQueryParams(),
        fillerType: 'peer-multi-sheet',
        async: false,
        exportType: 'DATA',
        ids: [2, 3, 4, 5, 6],
      },
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName =
          intl.get(`${promptCode}.view.export.fileName`).d('询价单导出报表') +
          `(${dayjs().format('YYYYMMDD')})`;
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
    const { proCode, formRecordId } = querystring.parse(search.substring(1));
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      console.log('e', e);
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (
          [
            'SUBMIT',
            'DRAFT_HANDLE',
            'BACK',
            'UNDO',
            'NOTICE',
            'GIVE',
            'PROCESS_SHOW',
            'SEND',
          ].includes(e.data.submitType)
        ) {
          this.save((params) => {
            console.log(params, 'params');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: proCode || formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
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
                    //下面内容为表单数据
                    ...params,
                    jine: params.cmhkPrFourthHead.paAmountHkd,
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
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: proCode || formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
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
                    //下面内容为表单数据
                    ...params,
                    jine: params.cmhkPrFourthHead.paAmountHkd,
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

  //一般采购结果保存按钮
  @Bind()
  save(callback) {
    const { dispatch, purchaseResultModel } = this.props;
    const {
      fourthHead, //主表数据
      fourthPackageList, //标包数据
      decisionsList, //决策信息
      fourthFileList, //决策附件
      fourthQuoteList, //报价单信息
      fourthClauseList,//报价条款
      fourthPoList,//采购订单相关信息
    } = purchaseResultModel;
    const resultFormObj = this.resultForm.props.form.getFieldsValue();
    console.log(resultFormObj, '6688');
    dispatch({
      type: 'purchaseResultModel/saveNormalPurchaseResultDetail',
      payload: {
        cmhkPrFourthHead: { ...fourthHead, paName: resultFormObj.paName },
        cmhkPrFourthPackageList: fourthPackageList,
        // cmhkPrFourthDecisionsList: decisionsList,
        cmhkPrFourthFileList: fourthFileList,
        cmhkPrFourthQuoteList: fourthQuoteList,
        cmhkPrFourthClauseList: fourthClauseList,
        cmhkPrFourthPoList: fourthPoList,
      },
    }).then((res) => {
      console.log(res, 'res一般采购结果');
      this.handleSearch(res?.cmhkPrFourthHead?.prNo);
      if (res) {
        if (typeof callback === 'function') {
          callback(res);
        }
        // window.close();
        CusNotification.success();
      }
    });
  }
  // 判断是否展示决策信息
  @Bind()
  getPurchaseResultWay() {
    const { purchaseResultModel } = this.props
    const { fourthHead } = purchaseResultModel
    if (fourthHead.estimatedBudgetAmountHkd > 500000 && fourthHead.estimatedBudgetAmountHkd <= 1000000) {
      if (fourthHead.prPlanWay === 'ppopentender' || fourthHead.prPlanWay === 'ppinvitedtender') {
        this.setState({
          isShowDecision: true
        })
      } else {
        this.setState({
          isShowDecision: false
        })
      }
    } else {
      if (fourthHead.prPlanWay === 'ppsinglesourcenegotiation' || fourthHead.prPlanWay === 'ppinternalprocurement') {
        this.setState({
          isShowDecision: false
        })
      } else {
        this.setState({
          isShowDecision: true
        })
      }
    }

  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      history,
      location,
      purchaseResultModel,
      form,
      dispatch,
    } = this.props;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      SearchTabActiveKey,
      isShowDecision,
      projectInfo,
    } = this.state;
    const { fourthHead } = purchaseResultModel;
    //基本信息-项目信息
    const projectFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.projectForm = ref.projectForm;
      },
      purchaseResultModel,
      form,
    };
    //结果信息
    const basicFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.resultForm = ref;
      },
      purchaseResultModel,
      form,
      projectInfo,
    };
    //决策信息
    const decisionTableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel,
      dispatch,
      form,
    };
    //标包信息
    const packageTableProps = {
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

    // 综合评分汇总
    const viCoScSuTableProps = {
      ...this.props,
      form,
      onChange: this.handleViCoScSu,
    }

    return (
      <div
        className={styles['out-pageWrapper']}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <PageWrapper loading={fetchLoading}>
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('resultTable')}
                />
              }
              key='resultTable'
            >
              <SearchApplication {...basicFormProps} />
            </Panel>
            {fourthHead?.decisionType && <Panel
              style={{ display: isShowDecision === true ? 'block' : 'none' }}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}`).d('决策信息')}
                  arrowActive={activeKey.includes('decisionTable')}
                />
              }
              key='decisionTable'
            >
              <DecisionDataTable {...decisionTableProps} />
            </Panel>}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}.view.title.PackageInformation`).d('标包信息')}
                  arrowActive={activeKey.includes('packageTable')}
                />
              }
              key='packageTable'
            >
              <PackageDataTable {...packageTableProps} />
            </Panel>
           {fourthHead?.tenRate && <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.ViCoScSu`).d('综合评分汇总')}
                  arrowActive={activeKey.includes('viCoScSuTable')}
                />
              }
              key='viCoScSuTable'
            >
              <ViCoScSuTable {...viCoScSuTableProps} />
            </Panel>}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}.view.title.Informationaboutpurchaseorders`).d('采购订单相关信息')}
                  arrowActive={activeKey.includes('purchaseOrderTable')}
                />
              }
              key='purchaseOrderTable'
            >
              <PurchaseOrderDataTable {...purchaseOrderTableProps} />
            </Panel>
            {/* <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}.view.title.QuotationTerms`).d('报价条款')}
                  arrowActive={activeKey.includes('clauseTable')}
                />
              }
              key='clauseTable'
            >
              <ClauseDataTable {...clauseTableProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${promptCode}.view.title.Quotationinformation`).d('报价单信息')}
                  arrowActive={activeKey.includes('priceSheetTable')}
                />
              }
              key='priceSheetTable'
            >
              <PriceSheetDataTable {...priceSheetTableProps} />
            </Panel> */}
          </Collapse>
        </PageWrapper>
      </div>
    );
  }
}
