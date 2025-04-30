import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { getCurrentUser } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { maxBy } from 'lodash';
import uuidv4 from 'uuid/v4';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusSelect from '_cus_components/CusSelect';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import SearchApplication from './SearchApplication';
import SupplierDataTable from './SupplierDataTable';
import PriceSheetDataTable from './PriceSheetDataTable';
import ClauseDataTable from './ClauseDataTable';
import PurchaseOrderDataTable from './PurchaseOrderDataTable';
import FilterSearch from './FilterSearch';
import styles from './index.less';
import classnames from 'classnames';
import PriceInfoList from '../../../../../srm-front-po-hk/src/routes/CusPriceSummaryDetail/PriceInfoList';
import PageMessage from '_cus_components/Page/PageMessage';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseResultModel, purchaseApplicationCusModel, loading }) => ({
  purchaseResultModel,
  purchaseApplicationCusModel,
  exportLoading: loading.effects['purchaseResultModel/getExportPriceAll'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRRECORDSSTATUS',
  'HKSP.SUPPLIER',
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
        'supplierTable',
        'budgetTable',
        'priceSheetTable',
        'clauseTable',
        'purchaseOrderTable',
        'detail',
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      searchTabActiveKey: 'procurement',
      affairTitle: '',
      tabKey: 'purchase',
      tabActiveKey: '0',
      round: null,
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleSearch();
      this.handleQuery();
    }, 2000);
    this.listener();
  }

  // 查询项目信息数据
  @Bind()
  handleQuery() {
    const { dispatch, location: { search = '' } } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
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
        }, () => {
          // 报价明细
          this.handlePriceInfo();
        });
      }
    });
  }

  @Bind()
  handlePriceInfo(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo = {}, round } = this.state;
    console.log('projectInfo', projectInfo)
    dispatch({
      type: 'purchaseApplicationCusModel/getQuotationListDetail',
      payload: {
        page,
        id: projectInfo?.id,
        // refPrFirstId: projectInfo?.prId,
        // projectNumber: projectInfo?.projectNumber,
        // currency: projectInfo?.currency,
        rounds: round || maxBy(projectInfo?.roundsList, 'value')?.value,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuidv4(),
        }));
        dispatch({
          type: 'purchaseApplicationCusModel/updateState',
          payload: {
            quotationList: newDataSource,// 报价明细数据
            quotationPagination: pagination, // 报价明细分页
          }
        })
      }
    })
  }
  

  /**
   * @description 查询采购结果详情数据
   */
  @Bind()
  handleSearch() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    dispatch({
      type: 'purchaseResultModel/queryPurchaseResultDetail',
      payload: {
        proCode: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log(res, 'res查询详情');
        dispatch({
          type: 'purchaseResultModel/commentUpdateState',
          payload: {
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
            paStatus: res.cmhkPrFourthHead?.paStatus,
            prResult: res.cmhkPrFourthHead?.id,
          },
        });
        dispatch({
          type: 'purchaseResultModel/queryPrId',
          payload: {
            prFourthId: res.cmhkPrFourthHead?.id,
          },
        }).then((res1) => {
          console.log('ressssss11', res1);
          if (res1) {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                // 申请id
                prId: res1.prHeadId,
              },
            });
          }
        });

        dispatch({
          type: 'purchaseResultModel/queryProjectId',
          payload: {
            prNumber: res.cmhkPrFourthHead?.prNo,
          },
        }).then((res2) => {
          if (res2) {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                projectId: res2.projectId, //项目id
                prPlanId: res2.id, //采购方案id
              },
            });
          }
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

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary',
      payload: selectSubmitData.map((item) => {
        return {
          enquiryPriceId: item.enquiryPriceId,
          enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then((r) => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary',
          payload: {
            enquiryPriceList: selectSubmitData,
            onlySubmit,
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
      type: 'resaleRfq/submitValidateCommonSummary',
      payload: {
        enquiryPriceRoundsList: data.map((item) => {
          return {
            enquiryPriceId: item.enquiryPriceId,
            enquiryPriceRoundsId: item.enquiryPriceRoundsId,
          };
        }),
        typeCode: 'CHINA_DIA',
        validateAllFlag: 'Y',
      },
    }).then((r) => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitEnquiryPriceSummary',
          payload: {
            typeCode: 'CHINA_DIA',
            enquiryPriceRoundsList: data,
            onlySubmit,
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
    const { formRecordId } = querystring.parse(search.substring(1));
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
                    formRecordId: formRecordId, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params?.cmhkPrFourthHead?.paNumber,
                        prName: params?.cmhkPrFourthHead?.paName,
                        amount: numberRender(params.cmhkPrFourthHead.paAmountHkd, 2),
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
                    formRecordId: formRecordId, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        prNumber: params?.cmhkPrFourthHead?.paNumber,
                        prName: params?.cmhkPrFourthHead?.paName,
                        amount: numberRender(params.cmhkPrFourthHead.paAmountHkd, 2),
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
                    formRecordId: formRecordId, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params?.cmhkPrFourthHead?.paNumber,
                        prName: params?.cmhkPrFourthHead?.paName,
                        amount: numberRender(params.cmhkPrFourthHead.paAmountHkd, 2),
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
    const { affairTitle } = this.state;
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
          type: 'purchaseResultModel/savePurchaseResultDetail',
          payload: {
            cmhkPrFourthHead: {
              ...cmhkPrFourthHead,
              ...resultFormObj,
              paAmountHkd: cmhkPrFourthHead?.paAmountHkd.toString().replace(/,/g, ''),
            },
            cmhkPrFourthSup: {
              ...cmhkPrFourthSup,
              orderHandler,
              orderHandlerName,
              chooseSupplier,
              supplierNameCh,
            },
            cmhkPrFourthBgList,
            cmhkPrFourthQuoteList,
            cmhkPrFourthClause,
            cmhkPrFourthPoList,
          },
        }).then((res) => {
          this.handleSearch();
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

  @Bind()
  handleTabChange(activeKey = '') {
    console.log(activeKey, 'activeKey');
    this.setState({
      tabKey: activeKey,
    });
  }

  // 导出全部轮次报价
  @Bind()
  handleExportPriceAll() {
    const { dispatch, purchaseResultModel } = this.props;
    const { projectInfo = {}, round } = this.state;
    const { cmhkPrFourthHead } = purchaseResultModel;
    dispatch({
      type: 'purchaseResultModel/getExportPriceAll',
      payload: {
        id: projectInfo?.id,
        rounds: round || maxBy(projectInfo?.roundsList, 'value')?.value,
      },
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.ms-excel',
        });
        const fileName =
          intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情') + cmhkPrFourthHead?.prNo +
          `(${dayjs().format('YYYY-MM-DD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xlsx`);
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

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      exportLoading = false,
      history,
      location,
      purchaseResultModel,
      form,
      dispatch,
    } = this.props;
    const { activityCode, state } = querystring.parse(location?.search.substring(1));
    // 采购员才能编辑
    const isEdit = (!['CGY01', 'CGJL01'].includes(activityCode)) || ['DONE', 'SENT'].includes(state);
    
    const { projectId, prId, cmhkPrFourthHead } = purchaseResultModel;
    console.log('cmhkPrFourthHead', cmhkPrFourthHead);
    
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      searchTabActiveKey,
      tabKey,
      tabActiveKey,
      projectInfo,
    } = this.state;
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
    const resultFormProps = {
      idpValueMap,
      projectInfo,
      onRef: (ref) => {
        this.resultForm = ref;
      },
      purchaseResultModel,
      form,
      location,
      isEdit,
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
      dispatch,
      isEdit,
      activityCode,
    };

    const priceInfoListProps = {
      ...this.props,
      onChange: this.handlePriceInfo,
    };

    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (!isEdit) {
        return intl.get(`${promptCode}.view.title.procurementResultEdit`).d('編輯采購結果');
      } else {
        if(['SCM022', 'SCM01'].includes(activityCode)) {
          return intl.get(`${promptCode}.view.title.procurementResultVerify`).d('核對采購結果');
        }
        if(activityCode === 'SCM033') {
          return intl.get(`${promptCode}.view.title.procurementResultApproval`).d('審批采購結果');
        }
      }
    })();

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        {!['DONE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45' }}
        />}
        <PageWrapper loading={fetchLoading}>
          {cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch {...projectFormProps} />
            </Panel>
          </Collapse>}
          <div className={styles['tab-style']} style={{marginTop: '16px'}}>
            <CusTabs
              defaultActiveKey={'purchase'}
              onChange={this.handleTabChange}
              items={[
                cmhkPrFourthHead?.projectId && {
                  label: intl.get(`${promptCode}.view.title.CreateProject`).d('立项'),
                  key: 'approval',
                  children: (
                    <div style={{ height: '100vh' }}>
                      <iframe
                        style={{ width: '100%', height: '100%' }}
                        src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectInfo?.projectId}`}
                        width="100%"
                        height="100vh !important"
                        frameBorder="0"
                      />
                    </div>
                  ),
                },
                {
                  label: intl.get(`${promptCode}.view.title.Procurement`).d('采购'),
                  key: 'purchase',
                  children: (
                    <div className={styles['cusTabs-panelBody']}>
                    <div style={{ display: 'flex' }} className={styles['tab-panel']}>
                      <div
                        className={
                          searchTabActiveKey === 'purchase' ? styles['tab-panel-active'] : styles['tab-panel-default']
                        }
                        onClick={() => this.setState({ searchTabActiveKey: 'purchase' })}
                      >
                        <div className={styles['tab-panel-title']}>
                          {intl.get(`${promptCode}.view.title.ProcurementRequisition`).d('采购申请')}
                        </div>
                        {searchTabActiveKey === 'purchase' && <div className={styles['tab-panel-active-line']} />}
                      </div>
                      <div style={{ marginRight: '32px' }}>|</div>
                      <div
                        className={
                          searchTabActiveKey === 'procurement'
                            ? styles['tab-panel-active']
                            : styles['tab-panel-default']
                        }
                        onClick={() => {
                          this.setState({ searchTabActiveKey: 'procurement' });
                        }}
                      >
                        <div className={styles['tab-panel-title']}>
                          {intl.get(`${promptCode}.view.title.ProcurementResults`).d('采购结果')}
                        </div>
                        {searchTabActiveKey === 'procurement' && <div className={styles['tab-panel-active-line']} />}
                      </div>
                    </div>

                    {searchTabActiveKey === 'purchase' ? (
                      <div style={{ height: '100vh' }}>
                        <iframe
                          style={{ width: '100%', height: '100%' }}
                          src={`${this.state.isPub ? '/pub' : ''
                            }/ssrc-hk/purchaseApplicationErp/edit?id=${prId}`}
                          width="100%"
                          height="100% !important"
                          frameBorder="0"
                        />
                      </div>
                    ) : (
                      <>
                        <Collapse
                            className="customize-collapse"
                            defaultActiveKey={activeKey}
                            onChange={(collapseKeys) => {
                              this.setState({ activeKey: collapseKeys });
                            }}
                          >
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`hzero.common.view.title.Resulttable`)
                                    .d('结果展示')}
                                  arrowActive={activeKey.includes('resultTable')}
                                />
                              }
                              key="resultTable"
                            >
                              <SearchApplication {...resultFormProps} />
                            </Panel>
                            {/* <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`${promptCode}.view.title.budgetlinformation`)
                                    .d('预算信息')}
                                  arrowActive={activeKey.includes('budgetTable')}
                                />
                              }
                              key="budgetTable"
                            >
                              <BudgetDataTable {...budgetTableProps} />
                            </Panel> */}
                            {activityCode !== 'SCM033' && <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(
                                      `${promptCode}.view.title.Recommendedsupplierinformation`
                                    )
                                    .d('中选供应商信息')}
                                  arrowActive={activeKey.includes('supplierTable')}
                                />
                              }
                              key="supplierTable"
                            >
                              <SupplierDataTable {...supplierTableProps} />
                            </Panel>}
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(
                                      `${promptCode}.view.title.Informationaboutpurchaseorders`
                                    )
                                    .d('采购订单相关信息')}
                                  arrowActive={activeKey.includes('purchaseOrderTable')}
                                />
                              }
                              key="purchaseOrderTable"
                            >
                              <PurchaseOrderDataTable {...purchaseOrderTableProps} />
                            </Panel>
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`${promptCode}.view.title.quotationdetail`)
                                    .d('报价详情')}
                                  arrowActive={activeKey.includes('detail')}
                                  showArrow={true}
                                  buttons={
                                    <>
                                      {/* <Form className='customize-form'>
                                        <Form.Item
                                          label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                                        >
                                          {form.getFieldDecorator('round', {
                                            initialValue: maxBy(projectInfo?.roundsList, 'value')?.value
                                          })(
                                            <CusSelect
                                              style={{ width: '100%' }}
                                              options={projectInfo?.roundsList || []}
                                              onChange={(val) => {
                                                this.setState({
                                                  round: val
                                                }, () => {
                                                  this.handlePriceInfo();
                                                })
                                              }}
                                            />
                                          )}
                                        </Form.Item>
                                      </Form> */}
                                      <CusButton
                                        mini
                                        onClick={this.handleExportPriceAll}
                                        loading={exportLoading}
                                      >
                                        {intl.get(`${promptCode}.view.button.export`).d('导出')}
                                      </CusButton>
                                    </>
                                  }
                                />
                              }
                              key="detail"
                            >
                              <PriceInfoList {...priceInfoListProps} />
                            </Panel>
                            {/* <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`${promptCode}.view.title.QuotationTerms`)
                                    .d('报价条款')}
                                  arrowActive={activeKey.includes('clauseTable')}
                                />
                              }
                              key="clauseTable"
                            >
                              <ClauseDataTable {...clauseTableProps} />
                            </Panel> */}
                            {/* <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`${promptCode}.view.title.Quotationinformation`)
                                    .d('报价单信息')}
                                  arrowActive={activeKey.includes('priceSheetTable')}
                                />
                              }
                              key="priceSheetTable"
                            >
                              <PriceSheetDataTable {...priceSheetTableProps} />
                            </Panel> */}
                        </Collapse>
                      </>
                    )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </PageWrapper>
      </div>
    );
  }
}
