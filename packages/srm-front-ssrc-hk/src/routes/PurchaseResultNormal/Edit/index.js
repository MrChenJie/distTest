import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, createPagination, getCurrentLanguage } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { numberRender } from 'utils/renderer';
import { maxBy } from 'lodash';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusSelect from '_cus_components/CusSelect';
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
import ViCoScSuTable from '../../PurchaseResultNormalErp/Edit/ViCoScSuTable';
import styles from './index.less';
import classnames from 'classnames';
import uuid from 'uuid/v4';
import PriceInfoList from '../../../../../srm-front-po-hk/src/routes/CusSingleDemanderConfirmation/PriceInfoList';
import PriceInfoListBid from '../../../../../srm-front-po-hk/src/routes/CusSingleDemanderConfirmation/PriceInfoList';
import PageMessage from '_cus_components/Page/PageMessage';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;

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
  exportLoading: loading.effects['purchaseResultModel/getExportPriceAll'],
  exportBidLoading: loading.effects['purchaseResultModel/getExportPriceAllBid'],
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
  'BID.DECISION_TYPE',
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
        'detail',
        'priceInfo',
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'),
      tabActiveKey: '0',
      SearchTabActiveKey: '2',
      tabKey: 'purchase',
      round: null,
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    const isBidding = location.pathname.includes('/bid');
    // setTimeout(() => {
    this.handleSearch();
    console.log('isBidding', isBidding);
    
    if(isBidding) {
      this.fetchBasicInfo();
      this.handleDecisionInformation();
    } else {
      this.handleQuery();
    }
    // }, 2000);
    this.listener();
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
    const isBidding = location.pathname.includes('/bid');
    dispatch({
      type: 'purchaseResultModel/normalQueryPurchaseResultDetail',
      payload: {
        proCode: formRecordId,
        resultType: isBidding ? 'bidding' : '', // 用于区分是否招投标的采购结果查询
      },
    }).then((res) => {
      if (res) {
        console.log(res, 'res查询详情');
        dispatch({
          type: 'purchaseResultModel/commentUpdateState',
          payload: {
            fourthHead: res?.cmhkPrFourthHead, //主表数据
            fourthPackageList: res?.cmhkPrFourthPackageList?.map((item) => {
              return {
                ...item,
                uuid: uuid(),
              };
            }), //标包数据
            content: res?.content, //决策内容
            decisionsList: res?.prFourthDecisionFileList, //决策信息
            fourthFileList: res?.cmhkPrFourthDecisionsList?.flatMap((obj) =>
              obj?.cmhkPrFourthFiles?.map((file) => ({
                fileName: file.fileName,
                fileUrl: file.fileUrl,
              }))
            ), //决策信息里的附件
            fourthQuoteList: res?.cmhkPrFourthQuoteList, //报价单信息
            fourthClauseList: res?.cmhkPrFourthClauseList, //报价条款
            fourthPoList: res?.cmhkPrFourthPoList, //采购订单相关信息
            paStatusYB: res?.cmhkPrFourthHead?.paStatus,
            prResult: res.cmhkPrFourthHead?.id,
          },
        });

        dispatch({
          type: 'purchaseResultModel/queryPrId',
          payload: {
            prFourthId: res?.cmhkPrFourthHead?.id,
          },
        }).then((res2) => {
          console.log('ressssss', res2);
          dispatch({
            type: 'purchaseResultModel/commentUpdateState',
            payload: {
              // 申请id
              prId: res2.prHeadId,
            },
          });
        });

        dispatch({
          type: 'purchaseResultModel/queryProjectId',
          payload: {
            prNumber: res?.cmhkPrFourthHead?.prNo,
          },
        }).then((res3) => {
          if (res3) {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                projectId: res3.projectId, //项目id
                prPlanId: res3.id, //采购方案id
              },
            });
          }
        });
        // 初始化进入页面判断根据采购结果金额判断采购方式
        if (
          res.cmhkPrFourthHead?.paAmountHkd > 500000 &&
          res.cmhkPrFourthHead?.paAmountHkd <= 1000000
        ) {
          if (
            res.cmhkPrFourthHead?.prPlanWay == 'ppopentender' ||
            res.cmhkPrFourthHead?.prPlanWay == 'ppinvitedtender'
          ) {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                isShow: false,
              },
            });
          } else {
            console.log('需要展示选择供应商');
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                isShow: true,
              },
            });
          }
        } else if (res.cmhkPrFourthHead?.paAmountHkd > 1000000) {
          if (
            res.cmhkPrFourthHead?.prPlanWay == 'ppsinglesourcenegotiation' ||
            res.cmhkPrFourthHead?.prPlanWay == 'ppinternalprocurement'
          ) {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                isShow: true,
              },
            });
          } else {
            dispatch({
              type: 'purchaseResultModel/commentUpdateState',
              payload: {
                isShow: false,
              },
            });
          }
        } else {
          dispatch({
            type: 'purchaseResultModel/commentUpdateState',
            payload: {
              isShow: false,
            },
          });
        }
        if(isBidding) {
          // 综合评分汇总
          this.handleViCoScSu();
        }
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
        // 提交 保存 撤回 知会 会签 查看流程
        if (
          [
            'SUBMIT',
            'DRAFT_HANDLE',
            'UNDO',
            'NOTICE',
            'GIVE',
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
                    formRecordId: formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params?.cmhkPrFourthHead?.paNumber,
                        prName: params?.cmhkPrFourthHead?.paName,
                        amount: numberRender(params.cmhkPrFourthHead.paAmountHkd, 2),
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
        } else if(['BACK'].includes(e.data.submitType)) {
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
                    formRecordId: formRecordId, //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        prNumber: params?.cmhkPrFourthHead?.paNumber,
                        prName: params?.cmhkPrFourthHead?.paName,
                        amount: numberRender(params.cmhkPrFourthHead.paAmountHkd, 2),
                      })
                      .d(
                        `采购结果驳回-关于${params?.cmhkPrFourthHead?.paNumber}:${params?.cmhkPrFourthHead?.paName}采购结果驳回`
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
          top?.postMessage(
            {
              success: true, //表单数据验证成功或不需要验证时传true，否则传false
              submitType: e.data.submitType, //将此字段值回传
              messageType: 'GET_FORM_DATA', //获取表单数据消息
              formData: {
                formRecordId: formRecordId, //表单记录id（Long）
              },
            },
            e.data.url
          );
        }
      }
    });
  }

  @Bind()
  save(callback) {
    const { dispatch, purchaseResultModel, location: { search } } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    const {
      agent,
      fourthHead, //主表数据
      fourthPackageList, //标包数据
      decisionsList, //决策信息
      fourthFileList, //决策附件
      fourthQuoteList, //报价单信息
      fourthClauseList, //报价条款
      fourthPoList, //采购订单相关信息
    } = purchaseResultModel;
    const resultFormObj = this.resultForm.props.form.getFieldsValue();
    console.log(resultFormObj, '6688');
    console.log(agent, 'agent');
    this.resultForm.props.form.validateFields((err, val) => {
      if (!err) {
        dispatch({
          type: 'purchaseResultModel/saveNormalPurchaseResultDetail',
          payload: {
            cmhkPrFourthHead: {
              ...fourthHead,
              paName: resultFormObj.paName,
              projectComparisonAmount: resultFormObj.projectComparisonAmount,
              comments: resultFormObj?.comments,
              decisionResult: resultFormObj?.decisionResult,
            },
            cmhkPrFourthDecision: {
              decisionType: resultFormObj?.decisionType,
              decisionMeetingDate: dayjs(resultFormObj?.decisionMeetingDate).format('YYYY-MM-DD HH:mm:ss'),
            },
            cmhkPrFourthPackageList: fourthPackageList?.map((item) => ({
              ...item,
              agent: agent ? agent : fourthHead?.agent
            })),
            // cmhkPrFourthDecisionsList: decisionsList,
            cmhkPrFourthFileList: fourthFileList,
            cmhkPrFourthQuoteList: fourthQuoteList,
            cmhkPrFourthClauseList: fourthClauseList,
            cmhkPrFourthPoList: fourthPoList,
          },
        }).then((res) => {
          console.log(res, 'res一般采购结果');
          this.handleSearch();
          if (res) {
            if (typeof callback === 'function') {
              callback(res);
            }
            // window.close();
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

  
  // 查询项目信息数据
  @Bind()
  handleQuery() {
    const { dispatch, location: { search }, } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
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
        }, () => {
          // 报价明细
          this.handlePriceInfo();
        });
      }
    });
  }

  // 50-100万报价详情查询
  @Bind()
  handlePriceInfo(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo = {}, round } = this.state;
    console.log('projectInfo', projectInfo)
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getQuotationListDetail',
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
          quotationId: uuid(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationCusModel/updateState',
          payload: {
            quotationList: newDataSource,// 报价明细数据
            quotationPagination: pagination, // 报价明细分页
          }
        })
      }
    })
  }

  // 100万以上的报价详情查询
  @Bind()
  handlePriceInfoBid(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo = {}, round } = this.state;
    console.log('projectInfo', projectInfo)
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getQuotationListDetailBid',
      payload: {
        page,
        proId: projectInfo?.proId,
        mileStoneId: round || maxBy(projectInfo?.roundsList, 'value')?.value,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuid(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationCusModel/updateState',
          payload: {
            quotationList: newDataSource,// 报价明细数据
            quotationPagination: pagination, // 报价明细分页
          }
        })
      }
    })
  }
  
  @Bind()
  handleDecisionInformation() {
    const { dispatch, location: { search } } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    dispatch({
      type: 'purchaseResultModel/getDecisionInformation',
      payload: {
        proId: formRecordId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          poHeaderInfo: res
        })
      }
    })
  }

  /**
 * 基本信息查询
 */
  @Bind
  fetchBasicInfo() {
    const { dispatch, location: { search } } = this.props;
    const { formRecordId } = querystring.parse(search.substring(1));
    dispatch({
      type: 'purchaseResultModel/getBasicInfo',
      payload: {
        proId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            projectInfo: res,
          },
          () => {
            this.handlePriceInfoBid();
          }
        );
      }
    });
  }

  // @Bind()
  // handleUnitPrice(page = {}) {
  //   const { dispatch } = this.props;
  //   const { projectInfo, round } = this.state;
  //   dispatch({
  //     type: 'purchaseResultModel/fetchPricingList',
  //     payload: {
  //       page,
  //       proId: projectInfo?.proId,
  //       milestoneId: round || maxBy(projectInfo?.roundsList, 'value')?.value,
  //       priceType: 'unitPrice',
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       const { content = [] } = res;
  //       const pagination = createPagination(res);
  //       const newDataSource = content.map((item) => ({
  //         ...item,
  //         _status: 'update',
  //         rowKey: uuid(),
  //       }));
  //       dispatch({
  //         type: 'purchaseResultModel/commentUpdateState',
  //         payload: {
  //           pricingSingleDataSource: newDataSource,
  //           pricingSinglePagination: pagination,
  //         },
  //       });
  //     }
  //   });
  // }

  // 导出全部轮次报价
  @Bind()
  handleExportPriceAll() {
    const { dispatch, purchaseResultModel } = this.props;
    const { fourthHead } = purchaseResultModel;
    const { projectInfo = {}, round } = this.state;
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
          intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情') + fourthHead?.prNo +
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

  // 导出100万全部轮次报价
  @Bind()
  handleExportPriceAllBid() {
    const { dispatch, purchaseResultModel } = this.props;
    const { fourthHead } = purchaseResultModel;
    const { projectInfo = {}, round } = this.state;
    dispatch({
      type: 'purchaseResultModel/getExportPriceAllBid',
      payload: {
        proId: projectInfo?.proId,
        mileStoneId: round || maxBy(projectInfo?.roundsList, 'value')?.value,
      },
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.ms-excel',
        });
        const fileName =
          intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情') + fourthHead?.prNo +
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
      history,
      location,
      purchaseResultModel,
      form,
      dispatch,
    } = this.props;
    const { activityCode, state } = querystring.parse(location?.search.substring(1));
    // 采购员才能编辑
    const isEdit = (!['CGY01', 'CGJL01'].includes(activityCode)) || ['DONE', 'SENT'].includes(state);
    const isBidding = location.pathname.includes('/bid');
    const { projectId, prPlanId, prId, fourthHead, pricingSingleDataSource = [], pricingSinglePagination = {}, infoSource = {}, fourthPackageList } = purchaseResultModel;
    console.log('pricingSingleDataSource', pricingSingleDataSource);
    const [{ purchaseType } = {}] = fourthPackageList || [];
    
    const {
      activeKey,
      modalVisible = false,
      exportLoading = false,
      exportBidLoading = false,
      SearchTabActiveKey,
      isShowDecision,
      tabKey,
      tabActiveKey,
      projectInfo,
      poHeaderInfo,
    } = this.state;
    console.log('infoSource', infoSource);
    
    const { roundsList = [] } = infoSource;
    const projectFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.projectForm = ref.projectForm;
      },
      purchaseResultModel,
      form,
    };
    const basicFormProps = {
      idpValueMap,
      projectInfo,
      poHeaderInfo,
      onRef: (ref) => {
        this.resultForm = ref;
      },
      purchaseResultModel,
      form,
      location,
      isEdit,
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
      location,
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
      isEdit,
    };

    // 综合评分汇总
    const viCoScSuTableProps = {
      ...this.props,
      form,
      onChange: this.handleViCoScSu,
    }

    const priceInfoListProps = {
      ...this.props,
      onChange: this.handlePriceInfo,
    };

    const priceInfoListBidProps = {
      ...this.props,
      // dataSource: pricingSingleDataSource,
      // pagination: pricingSinglePagination,
      onChange: this.handlePriceInfoBid,
      isBidding,
    };

    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (!isEdit) {
        return intl.get(`${promptCode}.view.title.procurementResultEdit`).d('編輯采購結果');
      } else {
        if(activityCode === 'CGJL01') {
          return intl.get(`${promptCode}.view.title.procurementResultVerify`).d('核對采購結果');
        }
        if(['CGZG02', 'CGFGLD03', 'CEOGSXZZC04', 'GSXZZC04'].includes(activityCode)) {
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
          {fourthHead?.prApplyBudgetType !== 'INVENTORY' && <Collapse
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
                  title={intl.get(`${promptCode}.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch {...projectFormProps} />
            </Panel>
          </Collapse>}
          <div
            className={classnames(
              styles['out-div-tab'],
              styles[tabKey === 'approval' ? 'approval' : ''],
              styles[SearchTabActiveKey === '1' ? 'prPlan' : ''],
              styles[SearchTabActiveKey === '0' ? 'purApp' : ''],
              styles[getCurrentLanguage() === 'en_US' ? 'search-tabs-cus' : '']
            )}
          >
            <CusTabs
              defaultActiveKey={'purchase'}
              onChange={this.handleTabChange}
              items={[
                fourthHead.projectId && {
                  label: intl.get(`${promptCode}.view.title.CreateProject`).d('立项'),
                  key: 'approval',
                  children: (
                    <CusSearchTabs
                      activeKey={tabActiveKey}
                      items={[
                        {
                          label: '项目信息',
                          key: '0',
                          children: (
                            <div style={{ height: '100%' }}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`}
                                width="100%"
                                height="100vh !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                      ]}
                      onChange={(val) => this.setState({ tabActiveKey: val })}
                    />
                  ),
                },
                {
                  label: intl.get(`${promptCode}.view.title.Procurement`).d('采购'),
                  key: 'purchase',
                  children: (
                    <CusSearchTabs
                      activeKey={SearchTabActiveKey}
                      items={[
                        {
                          label: <>
                            <span>
                              {intl
                              .get(`${promptCode}.view.title.ProcurementRequisition`)
                              .d('采购申请')}
                            </span>
                            <span style={{marginLeft: '36px'}}>|</span>
                          </>,
                          key: '0',
                          children: (
                            <div style={{ height: '100%' }}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`${
                                  this.state.isPub ? '/pub' : ''
                                }/ssrc-hk/purchaseApplicationErp/edit?id=${prId}`}
                                width="100%"
                                height="100% !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                        {
                          label: <>
                            <span>
                              {intl
                            .get(`${promptCode}.view.title.ProcurementScheme`)
                            .d('采购方案')}
                            </span>
                            <span style={{marginLeft: '36px'}}>|</span>
                          </>,
                          key: '1',
                          children: (
                            <div style={{ height: '100%' }}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`${
                                  this.state.isPub ? '/pub' : ''
                                }/ssrc-hk/purchase-plan-list/detail/castrate?id=${prPlanId}`}
                                width="100%"
                                height="100% !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                        {
                          label: intl
                            .get(`${promptCode}.view.title.ProcurementResults`)
                            .d('采购结果'),
                          key: '2',
                          children: (
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
                                      .get(`${promptCode}.view.title.basicinformation`)
                                      .d('基本信息')}
                                    arrowActive={activeKey.includes('resultTable')}
                                  />
                                }
                                key="resultTable"
                              >
                                <SearchApplication {...basicFormProps} />
                              </Panel>
                              {!(['CGZG02', 'CGFGLD03', 'CEOGSXZZC04', 'GSXZZC04'].includes(activityCode)) && <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl
                                      .get(`${promptCode}.view.title.Recommendedsupplierinformation`)
                                      .d('中选供应商信息')}
                                    arrowActive={activeKey.includes('packageTable')}
                                  />
                                }
                                key="packageTable"
                              >
                                <PackageDataTable {...packageTableProps} />
                              </Panel>}
                              {isBidding && <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl
                                      .get(`${promptCode}.view.title.decisioninfo`)
                                      .d('决策信息')}
                                    arrowActive={activeKey.includes('decisionTable')}
                                  />
                                }
                                key="decisionTable"
                              >
                                <DecisionDataTable {...decisionTableProps} />
                              </Panel>}
                              {(!(['public_inquiry', 'invitation_inquiry'].includes(purchaseType))) && (isBidding) && <Panel
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
                              {isBidding && <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl.get(`HKPC.commom.view.title.quotationdetail`).d('报价详情')}
                                    arrowActive={activeKey.includes('priceInfo')}
                                    buttons={
                                      <>
                                        {/* <Form className="customize-form">
                                          <Form.Item label={intl.get(`HKPC.commom.view.title.Round`).d('轮次')}>
                                            {form.getFieldDecorator(
                                              'round',
                                              {
                                                initialValue: maxBy(roundsList, 'value')?.value
                                              }
                                            )(
                                              <CusSelect
                                                style={{ width: '100%' }}
                                                options={roundsList || []}
                                                onChange={(val) => {
                                                  this.setState(
                                                    {
                                                      round: val,
                                                    },
                                                    () => {
                                                      this.handlePriceInfoBid();
                                                    }
                                                  );
                                                }}
                                              />
                                            )}
                                          </Form.Item>
                                        </Form> */}
                                        <CusButton
                                          mini
                                          onClick={this.handleExportPriceAllBid}
                                          loading={exportLoading}
                                        >
                                          {intl.get('HKPC.commom.view.button.export').d('导出')}
                                        </CusButton>
                                      </>
                                    }
                                  />
                                }
                                key="priceInfo"
                              >
                                <PriceInfoListBid {...priceInfoListBidProps} />
                              </Panel>}
                              {!isBidding && <Panel
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
                                          loading={exportBidLoading}
                                        >
                                          {intl.get('HKPC.commom.view.button.export').d('导出')}
                                        </CusButton>
                                      </>
                                    }
                                  />
                                }
                                key="detail"
                              >
                                <PriceInfoList {...priceInfoListProps} />
                              </Panel>}
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
                          ),
                        },
                      ]}
                      onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                    />
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
