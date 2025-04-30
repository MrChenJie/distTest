/**
 * index.js - 中标结果提交审批
 * @date: 2022-04-20
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Collapse, Col, Input, Row } from 'antd';
import { tooltipRender } from '_cus_utils/render';
import CusModal from '_cus_components/CusModal';
import EditTable from '_cus_components/EditTable';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import StaticTextEditor from './StaticTextEditor';
import Lov from '_cus_components/CusLov';
import uuid from 'uuid/v4';
import { isEmpty, uniqBy, join, map, maxBy } from 'lodash';
import { routerRedux } from 'dva/router';
import {
  getCurrentOrganizationId,
  getCurrentLanguage,
  createPagination,
  getEditTableData,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';
import CusNotification from '_cus_components/CusNotification';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { largeScreenWidth } from '_cus_utils/constants';
import searchIcon from '@/assets/searchIcon.svg';
import MaterialList from './materialList';
import ImproveMaterialList from './improveMaterial';
import BudgetInforList from './budgetInforList';
import BudgetDetailList from './budgetDetailList';
import { numberRender } from 'utils/renderer';
import queryString from 'querystring';
import CusSpin from '_cus_components/CusSpin';
import CusExcelExport from '_cus_components/CusExcelExport';
import ProjectForm from '@/components/ProjectModal';
import PriceInfoList from './priceInfoList';
import { SRM_BID } from '@/common/config';
import dayjs from 'dayjs';
import EditMatComponent from '@/components/EditMatComponent';
import DecisionInformation from './decisionInformation';
import UploadList from '@/components/uploadList';
import PageMessage from '_cus_components/Page/PageMessage';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';

const { Panel } = Collapse;
const routerParam = queryString.parse(location.search.substr(1));
const { proId, formRecordId, permissionType } = routerParam;

let newTableSource = [];
@connect(({ loading = {}, contractBidWinningResult = {}, purchaseOrder = {} }) => ({
  fetchEnumLoading: loading.effects['contractBidWinningResult/fetchEnum'],
  saveInfoLoading: loading.effects['contractBidWinningResult/saveInfo'],
  savePoInfoLoading: loading.effects['purchaseOrder/savePoInfo'],
  submitPoLoading: loading.effects['purchaseOrder/submitPo'],
  featchLoading:
    loading.effects['contractBidWinningResult/getTableInfo'] ||
    loading.effects['contractBidWinningResult/fetchPricingList'] ||
    loading.effects['contractBidWinningResult/getDudgetDetailList'],
  contractBidWinningResult,
  purchaseOrder,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'HKPC.commom'],
})
@Form.create({ fieldNameProp: null })
export default class BidWinningResult extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.staticTextEditor = React.createRef();
    this.state = {
      emailModel: false,
      tenantId: getCurrentOrganizationId(),
      decisionBox: false,
      requestId: '',
      newBasicsInfo: [], // mip保存传的数据
      // poHeadersId: match.params,
      finallyIsView: false, // 是否显示mip按钮
      approvalRequestButtonVOList: [], // 接收按钮信息
      saveModal: false,
      costRequestId: proId || formRecordId,
      isDisabled: false,
      editorKey: uuid(),
      content: '', // 编辑器内容
      prevContent: '', // 保存用来比较编辑内容是否改变
      applyForState: '',
      shenqingren:'',
      groupUnsaveFlag: false,
      number: 0, // 相同供应商数量
      activeKeyProcurementResult: ['projectForm'],
      activeKey: [
        'form',
        'resultTable',
        'waitingfordecisioncontent',
        'budgetInfor',
        'purchaseLine',
        'improveMaterial',
        'inquiryInfo',
        'priceInfo',
        'budgetDetail',
        'decisionInformation',
      ],
      screenWidth: window.innerWidth,
      materialModel: false,
      materialDataSource: [],
      materialPagination: {},
      selectedRowKeys: [],
      selectedRows: [],
      lineRecord: {},
      improveMaterialSource: [],
      materialFlag: false,
      purchaseCategoryVal: '',
      budgetInforSource: [],
      budgetInforPagination: {},
      basincModal: false,
      setRowsItem: '',
      clearFlag: false,
      pricingSingleDataSource: [],
      pricingSinglePagination: {},
      round: null,
      addMatModalVisible: false,
      poHeaderInfo: {},
      searchTabActiveKey: 'procurementResult',
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.fetchBasicInfo();
    this.showDecision();
    this.getTableInfo();
    this.getImproveMaterial();
    this.getBudgetInfor();
    this.handleDudgetDetailData();
    this.handleDecisionInformation();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/updateState',
      payload: {
        poHeader: {}, // 头信息
      },
    });
    window.removeEventListener('resize', this.handleResize);
  }

  @Bind()
  handleUnitPrice(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo, round } = this.state;
    dispatch({
      type: 'contractBidWinningResult/fetchPricingList',
      payload: {
        page,
        proId: projectInfo?.proId,
        mileStoneId: round || maxBy(projectInfo?.roundsList, 'value')?.value,
        // priceType: 'unitPrice',
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuid(),
        }));
        dispatch({
          type: 'contractBidWinningResult/updateState',
          payload: {
            pricingSingleDataSource: newDataSource,
            pricingSinglePagination: pagination,
          },
        });
      }
    });
  }

  // 致远调用参数&流程
  @Bind()
  getBpmWork(totalAmount, equalFlag, manualNumRequired, purchasingEmpNum) {
    const { location, contractBidWinningResult } = this.props;
    const { infoSource = [] } = contractBidWinningResult;
    const { prNumber, prName } = infoSource;
    const routerParams = queryString.parse(location.search.substr(1));
    const { proId, formRecordId } = routerParams;
    top?.postMessage(
      {
        hasListener: true,
      },
      '*'
    );
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        if (['SUBMIT', 'AGREE', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.goSave((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    // 阻止页面关闭
                    preventClose: !['SEND', 'AGREE', 'SUBMIT'].includes(e.data.submitType),
                  },
                  //表单数据放这里
                  formData: {
                    //下面内容为表单数据
                    ...params,
                    formRecordId: proId || formRecordId, //表单记录id（Long）
                    amount: totalAmount, // 分支条件-金额
                    equal: equalFlag, // 分支条件-需求人是否与申请人一致
                    xuqiuren: manualNumRequired, // 当前的需求人工号
                    caigouyuan: purchasingEmpNum, // 采购经办人工号
                    affairTitle: intl
                      .get(`HKPC.commom.view.title.bpmPAApproval`, {
                        prNumber: prNumber,
                        prName: prName,
                        amount: numberRender(totalAmount, 2),
                      })
                      .d(`采购结果审批-关于${prNumber}:${prName}采购结果审批`), //待办流程名称
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['SEND'].includes(e.data.submitType)) {
          const { contractBidWinningResult, dispatch } = this.props;
          const { infoSource } = contractBidWinningResult;
          const { projectCode, projectType } = infoSource;
          const improveMaterialList = this.state.improveMaterialSource;
          this.goSave((params) => {
            if (params) {
              // 首次提交的时候触发金额检验
              const projectNumber = projectCode;
              const newPriceList = (improveMaterialList || []).map((item) => ({
                budType: item?.budgetType, // 预算类型
                budCode: item?.budgetProCode, // 预算项目编号
                amount: Number(item?.appliedAmountHkd), // 金额
                busActivityName: item?.operationalAction, // 业务活动名称
              }));
              dispatch({
                type: 'contractBidWinningResult/getPriceValidate',
                payload: {
                  applyType: projectType,
                  projectCode: projectNumber,
                  lines: newPriceList,
                },
              }).then((res) => {
                if (res) {
                  if (res.code == '204') {
                    // 框架采购的需要提示信息但能继续往下走
                    if(
                      ['frameworkProcurement1', 'frameworkProcurement2', 'frameworkProcurement3', 'frameworkProcurement4', 'frameworkProcurement5'].includes(params.prType)
                    ) {
                      CusModal.confirm({
                        content: res.msg + intl
                        .get('HKPC.commom.view.title.budgetinsufficient')
                        .d('预算金额不足，请重新检查'),
                        onOk: () => {
                          top?.postMessage(
                            {
                              success: true, //表单数据验证成功或不需要验证时传true，否则传false
                              submitType: e.data.submitType, //将此字段值回传
                              messageType: 'GET_FORM_DATA', //获取表单数据消息
                              actionInfo: {
                                // 阻止页面关闭
                                preventClose: !['SEND', 'AGREE', 'SUBMIT'].includes(e.data.submitType),
                              },
                              //表单数据放这里
                              formData: {
                                //下面内容为表单数据
                                ...params,
                                formRecordId: proId || formRecordId, //表单记录id（Long）
                                amount: totalAmount, // 分支条件-金额
                                equal: equalFlag, // 分支条件-需求人是否与申请人一致
                                xuqiuren: manualNumRequired, // 当前的需求人工号
                                caigouyuan: purchasingEmpNum, // 采购经办人
                                affairTitle: intl
                                .get(`HKPC.commom.view.title.bpmPAApproval`, {
                                  prNumber: prNumber,
                                  prName: prName,
                                  amount: numberRender(totalAmount, 2),
                                })
                                .d(`采购结果审批-关于${prNumber}:${prName}采购结果审批`), //待办流程名称
                              },
                            },
                            e.data.url
                          );
                        }
                      })
                    } else {
                      CusModal.warning({
                        content:
                          res.msg +
                          intl
                            .get('HKPC.commom.view.title.budgetinsufficientblock')
                            .d('预算金额不足，请重新检查'),
                      });
                    }
                  } else {
                    top?.postMessage(
                      {
                        success: true, //表单数据验证成功或不需要验证时传true，否则传false
                        submitType: e.data.submitType, //将此字段值回传
                        messageType: 'GET_FORM_DATA', //获取表单数据消息
                        actionInfo: {
                          // 阻止页面关闭
                          preventClose: !['SEND', 'AGREE', 'SUBMIT'].includes(e.data.submitType),
                        },
                        //表单数据放这里
                        formData: {
                          //下面内容为表单数据
                          ...params,
                          formRecordId: proId || formRecordId, //表单记录id（Long）
                          amount: totalAmount, // 分支条件-金额
                          equal: equalFlag, // 分支条件-需求人是否与申请人一致
                          xuqiuren: manualNumRequired, // 当前的需求人工号
                          caigouyuan: purchasingEmpNum, // 采购经办人
                          affairTitle: intl
                          .get(`HKPC.commom.view.title.bpmPAApproval`, {
                            prNumber: prNumber,
                            prName: prName,
                            amount: numberRender(totalAmount, 2),
                          })
                          .d(`采购结果审批-关于${prNumber}:${prName}采购结果审批`), //待办流程名称
                        },
                      },
                      e.data.url
                    );
                  }
                }
              });
            }
          });
        } else if(['BACK'].includes(e.data.submitType)) {
          this.goSave((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    // 阻止页面关闭
                    preventClose: !['BACK'].includes(e.data.submitType),
                  },
                  //表单数据放这里
                  formData: {
                    //下面内容为表单数据
                    ...params,
                    formRecordId: proId || formRecordId, //表单记录id（Long）
                    amount: totalAmount, // 分支条件-金额
                    equal: equalFlag, // 分支条件-需求人是否与申请人一致
                    xuqiuren: manualNumRequired, // 当前的需求人工号
                    caigouyuan: purchasingEmpNum, // 采购经办人工号
                    affairTitle: intl
                      .get(`HKPC.commom.view.title.bpmPAReject`, {
                        prNumber: prNumber,
                        prName: prName,
                        amount: numberRender(totalAmount, 2),
                      })
                      .d(`采购结果驳回-关于${prNumber}:${prName}采购结果驳回`), //待办流程名称
                  },
                },
                e.data.url
              );
            }
          });
        } else {
          top?.postMessage(
            {
              success: true, //传true
              submitType: e.data.submitType, //将此字段值回传
              messageType: e.data.messageType, //获取表单数据消息
              actionInfo: {
                // 阻止页面关闭
                preventClose: e.data.messageType === 'PROCESS_SHOW',
              },
              //表单数据放这里
              formData: {
                formRecordId: proId || formRecordId, //表单记录id（Long）
                amount: totalAmount, // 分支条件-金额
                equal: equalFlag, // 分支条件-需求人是否与申请人一致
                xuqiuren: manualNumRequired, // 当前的需求人工号
                caigouyuan: purchasingEmpNum, // 采购经办人
                affairTitle: intl
                .get(`HKPC.commom.view.title.bpmPAApproval`, {
                  prNumber: prNumber,
                  prName: prName,
                  amount: numberRender(totalAmount, 2),
                })
                .d(`采购结果审批-关于${prNumber}:${prName}采购结果审批`), //待办流程名称
              },
            },
            e.data.url
          );
        }
      }
    });
  }

  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth,
    });
  }

  @Bind
  getDerivedStateFromProps() {
    const { content, prevContent } = this.state;
    if (content !== prevContent) {
      this.setState({
        editorKey: uuid(),
        content: content || '',
        prevContent: content || '',
      });
    }
  }

  /**
   * 基本信息查询
   */
  @Bind
  fetchBasicInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getBasicInfo',
      payload: {
        proId: proId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          applyForState: res.applyForState,
          purchaseCategoryVal: res.purchaseCategory,
          shenqingren: res.applyApplicantCode,
        });
        if (['SEND', 'APPROVE', 'NOTICE', 'JOINTLY', 'COLLABORATION'].includes(permissionType)) {
          if (permissionType === 'SEND' && res.applyForState === 'DRAFT') {
            this.setState({ isDisabled: true });
          } else {
            this.setState({ isDisabled: false });
          }
        } else {
          this.setState({ isDisabled: true });
        }
        if (res.purchaseCategory) {
          this.setState({
            materialFlag: false,
          });
        } else {
          this.setState({
            materialFlag: true,
          });
        }
        this.getBpmWork(res.budgetLocalAmountTotal, res.equal, res.manualNumRequired, res.purchasingEmpNum);
        this.setState(
          {
            projectInfo: res,
          },
          () => {
            this.handleUnitPrice();
            // 查询项目id
            this.handleProjectId();
          }
        );
      }
    });
  }

  handleProjectId = () => {
    const { dispatch } = this.props;
    const { projectInfo } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getProjectId',
      payload: {
        prNumber: projectInfo?.prNumber,
      },
    }).then((res) => {
      if(res) {
        this.setState({
          projectId: res?.projectId,
        })
      }
    })
  }

  // 查询最终轮报价详情数据
  handleDudgetDetailData = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getDudgetDetailList',
      payload: {
        page,
        proId: proId || formRecordId,
      },
    }).then((res) => {
      const { content = [] } = res;
      const pagination = createPagination(res);
      const newDataSource = content.map((item) => ({
        ...item,
        _status: 'update',
        rowId: uuid(),
      }));
      dispatch({
        type: 'contractBidWinningResult/updateState',
        payload: {
          budgetDetailList: newDataSource,
          budgetDetailPagination: pagination,
        },
      });
    });
  };

  /**
   * 表查询
   */
  @Debounce(200)
  @Bind
  getTableInfo(page = {}) {
    const { dispatch } = this.props;
    const { requestId } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getTableInfo',
      payload: {
        page,
        proId: proId || formRecordId,
        state: 1, //0 表示不需要供应商编码  1 表示需要
      },
    }).then((res) => {
      if (res && res.content) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowId: uuid(),
        }));
        dispatch({
          type: 'contractBidWinningResult/updateState',
          payload: {
            tableSource: newDataSource,
            tablePagination: pagination,
          },
        });
        // let isRequestid = '';
        // for (let i = 0; i < res.content.length; i++) {
        //   isRequestid = res.content[i].requestId
        // }
        // if (requestId) {
        //   // this.setState({finallyIsView: true})
        //   this.approvalProcess(requestId)
        // } else {
        //   this.setState({ isDisabled: true })
        // }
        this.setState({ groupUnsaveFlag: false });
      }
    });
  }

  /**
   * 查询值集
   */
  @Bind
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/init',
    });
  }

  // 打开结果查看的邮件预览弹框
  @Bind
  previewEmail(record) {
    // const { isDisabled } = this.state;
    if (record.isBeChosen && record.isBeChosen.length > 0) {
      this.getTableEmailInfo(record);
    }
  }

  /**
   * 邮件模板的预览
   */
  @Bind
  getTableEmailInfo(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getTableEmailInfo',
      payload: {
        supplierId: record.supplierId,
        isBeChosen: record.isBeChosen === 'YES' ? 'YES' : 'NO',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          emailModel: true,
        });
      }
    });
  }

  @Bind
  changeChosen(value, lovRecord, record, index) {
    const {
      contractBidWinningResult: { infoSource, tableSource },
    } = this.props;
    if (record.$form != undefined && value !== undefined) {
      record.$form.setFieldsValue(
        (record.isBeChosen = lovRecord.props.value) // 'YES','NO'
      );
      if (['YES', 'Standby'].includes(lovRecord.props.value)) {
        this.setState(() => {
          tableSource[index].$form.validateFields(['supplierNum'], { force: true });
        });
        if (record.promptContent) {
          CusNotification.warning({ message: record.promptContent, closable: false });
        }
      } else {
        // tableSource[index].$form.resetFields('supplierNum');
        let num = 0;
        record.supplierNum = '';
        record.supplierNumName = '';
        tableSource.map((it) => {
          if (it.supplierNum === record.supplierNumber) {
            num += 1;
          }
        });
        this.setState({ number: num });
        // this.setState(() => {
        //   tableSource[index].$form.validateFields(['supplierNum'], { force: false })
        //   },
        // )
      }
    } else {
      if (value === 'result') {
        record.setFieldsValue((infoSource.informRejectResult = lovRecord ? lovRecord?.props?.value : ''));
      }
      if (value === 'state') {
        record.setFieldsValue((infoSource.applyForState = lovRecord ? lovRecord?.props?.value : ''));
      }
      // 处理清空选择框的值
      if (value === undefined) {
        record.isBeChosen = '';
      }
    }
  }

  @Bind()
  handleCancel() {
    this.setState({
      emailModel: false,
    });
  }

  @Bind()
  handleMaterialCancel() {
    this.setState({
      materialModel: false,
    });
  }

  // 单独保存采购结果
  @Bind()
  handleSaveOnlyResult(cb = (e) => e) {
    const { dispatch } = this.props;
    const { lineRecord } = this.state;
    dispatch({
      type: 'contractBidWinningResult/saveOnlyResult',
      payload: {
        dataList: [
          {
            bidResult: lineRecord.isBeChosen,
            id: lineRecord.supplierId,
            supplierNum: lineRecord.supplierNum,
            supplierNumName: lineRecord.supplierNumName,
          },
        ],
      },
    }).then((res) => {
      if (res) {
        cb(res);
      }
    });
  }

  // 物料名称弹框确认
  @Bind()
  handleSaveMaterial() {
    const { dispatch, form } = this.props;
    const { selectedRowKeys = [], selectedRows = [], materialDataSource } = this.state;
    const params = getEditTableData(selectedRows, ['ordersNumber', 'afterTaxPerPrice', 'warranty']);
    if (selectedRowKeys.length > 0) {
      if(params.length > 0) {
        const paramsData = selectedRows.map((item) => {
          const index = selectedRowKeys.findIndex((e) => e === item.poOrderId);
          if (index !== -1) {
            item['isDelete'] = 0;
          } else {
            item['isDelete'] = 1;
          }
          return item;
        });
        dispatch({
          type: 'contractBidWinningResult/saveMaterial',
          payload: {
            paramsData,
          },
        }).then((res) => {
          if (res) {
            this.handleSaveOnlyResult((valList) => {
              if (valList.length > 0) {
                this.setState({
                  materialModel: false,
                });
                this.getTableInfo();
                this.getImproveMaterial();
              }
            });
          }
        });
      } else {
        CusNotification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl.get('hzero.common.view.title.submitprompt').d('有必填字段未填写，请检查表单数据'),
          }),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据'),
      });
    }
  }

  @Bind()
  onEditChange(val) {
    this.setState({ content: val });
  }

  @Bind()
  handleSaveImproveMaterial(params, cb = (e) => e) {
    const { improveMaterialSource = [] } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/saveImproveMaterial',
      payload: {
        improveMaterialList: getEditTableData(improveMaterialSource),
      },
    }).then((res) => cb(res));
  }

  // 保存
  @Bind()
  @Debounce(200)
  goSave(callback) {
    const {
      dispatch,
      match,
      location,
      contractBidWinningResult: { infoSource, tableSource },
    } = this.props;
    const { content, number, purchaseCategoryVal, improveMaterialSource = [], shenqingren } = this.state;
    const routerParams = queryString.parse(location.search.substr(1));
    const { activityCode } = routerParams;
    if (number > 1) {
      CusNotification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    } else {
      let basicsInfo = {};
      let bidSuppliers = [];
      basicsInfo.proId = proId || formRecordId;
      for (let i = 0; i < tableSource.length; i++) {
        bidSuppliers.push({
          id: tableSource[i].supplierId,
          supplierNum: tableSource[i].supplierNum, //供应商编号
          supplierNumName: tableSource[i].supplierNumName,
          supplierName: tableSource[i].supplierName,
          bidResult: tableSource[i].isBeChosen,
        });
        if (['YES', 'Standby'].includes(tableSource[i].isBeChosen)) {
          this.setState(() => {
            tableSource[i].$form.validateFields(['supplierNumName'], { force: true });
          });
        }
      }
      basicsInfo.decisionContent = content;
      basicsInfo.informRejectResult = infoSource.informRejectResult;
      basicsInfo.uuid = infoSource.uuid;
      basicsInfo.purchaseCategory = purchaseCategoryVal;
      // basicsInfo.applyForState = infoSource.applyForState;
      basicsInfo.bidSuppliers = bidSuppliers;
      this.setState({ newBasicsInfo: basicsInfo });
      this.props.form.validateFieldsAndScroll((err, values) => {
        const newData = getEditTableData(tableSource).map((item) => item);
        const improveMaterialData = getEditTableData(improveMaterialSource);
        if (isEmpty(improveMaterialData)) {
          return;
        }
        if (!err && newData.length > 0) {
          dispatch({
            type: 'contractBidWinningResult/saveInfo',
            payload: {
              basicsInfo,
            },
          }).then((res) => {
            if (res) {
              if (typeof callback === 'function') {
                this.handleSaveImproveMaterial(improveMaterialSource, (n) => {
                  if (n) {
                    CusNotification.success({
                      message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                    });
                    // 显示决策内容
                    this.showDecision();
                    this.getTableInfo();
                    this.fetchBasicInfo();
                    this.getImproveMaterial();
                    this.getBudgetInfor();
                    callback({...res,shenqingren});
                  }
                });
              } else {
                this.handleSaveImproveMaterial(improveMaterialSource, (n) => {
                  if (n) {
                    CusNotification.success({
                      message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                    });
                    // 显示决策内容
                    this.showDecision();
                    this.getTableInfo();
                    this.fetchBasicInfo();
                    this.getImproveMaterial();
                    this.getBudgetInfor();
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  // 保存后显示决策内容
  @Bind
  showDecision() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getDecision',
      payload: {
        proId: proId || formRecordId,
      },
    }).then((res) => {
      if (res.result != 'NO') {
        this.setState({
          content: res.content,
          decisionBox: true,
        });
      } else {
        this.setState({
          content: res.content,
          decisionBox: false,
        });
      }
      this.getDerivedStateFromProps();
    });
  }

  @Bind
  addObjectToList = (arr, obj) => {
    const existingObj = arr?.find((item) => {
      // 判断对象是否已存在，这里以 id 属性作为判断依据
      return item.buttonKey === obj.buttonKey;
    });
    if (!existingObj) {
      arr.push(obj);
    }
    return arr;
  };

  // 更换modalContainer的类名控制能否移动
  @Bind
  switchModalContainerClassName(flag) {
    if (flag) {
      const container = document.querySelector('.c7n-pro-modal-container');
      if (container) {
        container.className = styles['c7n-pro-modal-container-moveable'];
      }
    } else {
      const container = document.querySelector(`.${styles['c7n-pro-modal-container-moveable']}`);
      if (container) {
        container.className = 'c7n-pro-modal-container';
      }
    }
  }

  @Bind
  openModal(record) {
    const { contractBidWinningResult } = this.props;
    const { infoSource } = contractBidWinningResult;
    if (record.buttonKey === 'submitName') {
      const { form } = this.props;
      let validateResult = true;
      let errMessageList = [];
      const { validateFieldsAndScroll = (e) => e } = form;
      validateFieldsAndScroll((err) => {
        if (err) {
          for (let child in err) {
            errMessageList.push(err[child].errors[0].message);
          }
          validateResult = false;
        }
      });
      if (validateResult) {
        this.goSave(infoSource, () => {
          this.cusApprovalBtns?.current?.openModal({ ...record });
        });
      } else {
        const description = (
          <div>
            {errMessageList.map((item) => (
              <p style={{ marginBottom: '0px' }}>{item}</p>
            ))}
          </div>
        );
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: description,
        });
      }
    } else if (record.buttonKey === 'saveName') {
      this.goSave(infoSource);
    } else {
      this.cusApprovalBtns?.current?.openModal({ ...record });
    }
  }

  @Bind
  fetchData(times) {
    const { requestId } = this.state;
    this.handleNotice();
    this.setState({
      generalRequestLoading: true,
    });
    // 去查询审批数据
    this.requestRound(requestId, times);
  }

  @Bind
  requestRound(targetHeaderId, times = 30, nextTime = 0) {
    const { requestId } = this.state;
    if (times <= 0) {
      this.setState({
        generalRequestLoading: false,
      });
      return;
    }
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      this.approvalProcess(requestId);
    }, nextTime);
  }

  @Bind
  changeSupplierNum(item, record, index) {
    const {
      form,
      contractBidWinningResult: { tableSource },
    } = this.props;
    let num = 0;
    form.setFieldsValue({ supplierNum: item.supplierNumber });
    form.setFieldsValue({ supplierNumName: item.companyNameCh });
    // 选择供应商编码的时候校验该编码是否被选择过
    tableSource.map((it) => {
      if (it.supplierNum === item.supplierNumber) {
        num += 1;
      }
    });
    this.setState({ number: num });
    if (num > 1) {
      CusNotification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    }
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  @Bind
  handleDataChange() {
    this.setState({ groupUnsaveFlag: true });
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page) {
    const { groupUnsaveFlag } = this.state;
    if (groupUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
        onOk: () => {
          this.getTableInfo(page);
        },
      });
    } else {
      this.getTableInfo(page);
    }
  }

  searchButton = () => {
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
        style={{ cursor: 'pointer', color: '#666' }}
        onClick={() => this.onSearchBtnClick()}
      />
    );
  };

  onSearchBtnClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getMaterialName',
      payload: {
        supplierId: record.supplierId,
        proId: proId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          supplierId: record.supplierId,
          proId: proId || formRecordId,
          _status: 'update',
          poOrderId: uuid(),
        }));
        const initialSelectedRowKeys = newDataSource
          .filter((item) => item.isSelected === 'Y')
          .map((item) => item.poOrderId);
        this.setState({
          materialModel: true,
          materialDataSource: newDataSource,
          lineRecord: record,
          selectedRowKeys: initialSelectedRowKeys,
          selectedRows: newDataSource.filter((item) => item.isSelected === 'Y'),
          // materialPagination: pagination
        });
      }
    });
  };

  @Bind
  getImproveMaterial() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getImproveMaterial',
      payload: {
        proId: proId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          // supplierId: record.supplierId,
          // proId: proId,
          _status: 'update',
          poOrderId: uuid(),
          budgetTypeVal: item.budgetType,
        }));
        this.setState({
          improveMaterialSource: newDataSource,
          // materialPagination: pagination
        });
      }
    });
  }

  // 选择否的时候清除剩余数量
  @Bind
  clearMaterial(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/delMaterial',
      payload: {
        proId: proId || formRecordId,
        supplierId: record.supplierId,
      },
    }).then((res) => {
      if (res.message === 'ok') {
        record.beSelectedMoney = null;
        record.materialName = null;
      }
    });
  }

  @Bind
  getBudgetInfor() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getBudgetInfor',
      payload: {
        proId: proId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuid(),
        }));
        this.setState({
          budgetInforSource: newDataSource,
          // budgetInforPagination: pagination
        });
      }
    });
  }

  // 项目变更管理
  @Bind()
  handleBasicInfoModal(val) {
    this.setState({
      basincModal: true,
      projectEditVal: val,
    });
  }

  @Bind()
  getRowsItem(item) {
    if (item) {
      this.setState({
        setRowsItem: item,
      });
    }
  }

  @Bind()
  handleOk() {
    const { dispatch, contractBidWinningResult } = this.props;
    const { infoSource } = contractBidWinningResult;
    const { refPrFirstId } = infoSource;
    const { setRowsItem, improveMaterialSource } = this.state;
    this.projectEditForm.validateFields((err, values) => {
      if (!err) {
        if (setRowsItem) {
          CusModal.confirm({
            content: intl.get('HKPC.commom.view.title.changproject').d('请确认是否变更项目'),
            onOk: () => {
              dispatch({
                type: 'contractBidWinningResult/projectEditName',
                payload: {
                  refPrFirstId: refPrFirstId, // 采购申请ID
                  projectName: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectName'), ',') : setRowsItem?.projectName, // 项目名称
                  projectNumber: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectCode'), ',') : setRowsItem?.projectCode, // 项目编码
                  projectBudType: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectBudType'), ',') : setRowsItem?.projectBudType, // 预算类型
                },
              }).then((res) => {
                if (res) {
                  this.setState({
                    basincModal: false,
                    clearFlag: true,
                    improveMaterialSource: (improveMaterialSource || []).map((item) => ({
                      ...item,
                      taskCode: item.$form.setFieldsValue({ taskCode: null }),
                      taskName: item.$form.setFieldsValue({ taskName: null }),
                      budgetProCode: item.$form.setFieldsValue({ budgetProCode: null }),
                      operationalActionCode: item.$form.setFieldsValue({
                        operationalActionCode: null,
                      }),
                      operationalAction: item.$form.setFieldsValue({ operationalAction: null }),
                      costCenterCode: item.$form.setFieldsValue({ costCenterCode: null }),
                      costCenter: item.$form.setFieldsValue({ costCenter: null }),
                    })),
                  });
                  this.fetchBasicInfo();
                }
              });
            },
          });
        }
      }
    });
  }

  @Bind
  goToPrNumberInfo(refSecondId) {
    const url = `/pub/ssrc-hk/purchase-plan-list/detail?formRecordId=${refSecondId}`
    window.open(url, '_blank')
  }

  @Bind
  handleAddMat() {
    const { dispatch } = this.props;
    this.setState({
      addMatModalVisible: true
    })
    dispatch({
      type: `contractBidWinningResult/updateState`,
      payload: {
        editMatDataSource: [],
      },
    });
  }

  @Bind
  handleOkMat() {
    const { dispatch, contractBidWinningResult } = this.props;
    const { editMatDataSource } = contractBidWinningResult;
    const params = getEditTableData(editMatDataSource, ['poOrderId']).map((item) => ({
      ...item,
      proId: proId || formRecordId,
      priceType: 'unitPrice',
      addStatus: '-1',
      deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD HH:mm:ss')
    }));
    if(params.length > 0) {
      dispatch({
        type: 'contractBidWinningResult/saveEditMat',
        payload: params
      }).then((res) => {
        if(res) {
          this.setState({
            addMatModalVisible: false
          })
        }
      })
    }
  }

  @Bind()
  handleDecisionInformation() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getDecisionInformation',
      payload: {
        proId: proId || formRecordId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          poHeaderInfo: res
        })
      }
    })
  }

  @Bind()
  handleTabChange(activeKey = '') {
    this.setState({
      tabKey: activeKey,
    });
  }

  render() {
    const {
      contractBidWinningResult,
      form = {},
      match,
      featchLoading = false,
      saveInfoLoading,
      location,
    } = this.props;
    const {
      infoSource = [],
      tableSource = [],
      tablePagination = {},
      enumMap = {},
      pricingSingleDataSource = [],
      pricingSinglePagination = {},
      budgetDetailList = [],
      budgetDetailPagination = {},
    } = contractBidWinningResult;
    const {
      tenantId,
      decisionBox,
      finallyIsView,
      emailModel,
      isDisabled,
      activeKey,
      activeKeyProcurementResult,
      showMore,
      screenWidth,
      materialModel,
      materialDataSource,
      materialPagination,
      selectedRowKeys = [],
      improveMaterialSource = [],
      materialFlag,
      budgetInforSource = [],
      purchaseCategoryVal,
      basincModal,
      clearFlag,
      addMatModalVisible,
      poHeaderInfo = {},
      lineRecord,
      projectInfo,
      searchTabActiveKey,
      projectId,
    } = this.state;    

    newTableSource = tableSource;
    const { yesNo = [], status = [], yesNoAlternate = [], decisionType = [] } = enumMap;
    const {
      prName,
      purchasingEmpName,
      applyingDepartmentName,
      prNumber,
      informRejectResult,
      applyForState,
      purchaseCategory,
      projectName,
      budgetItemNumber,
      projectType,
      projectNumber,
      roundsList,
      refSecondId,
      refPrFirstId,
      applicantUserName,
    } = infoSource;
    console.log('infoSource', infoSource);
    const projectNumberArray = projectNumber?.split(',') || [];  
    const { getFieldDecorator } = form;
    const routerParams = queryString.parse(location.search.substr(1));
    const { activityCode, state } = routerParams;
    // activityCode 等于需求人节点时才可以编辑(XQR01)
    // 审批流变更 现在 activityCode 等于申请人节点时候才可以编辑(Start)
    const isOnly = !(activityCode && activityCode !== 'Start') && isDisabled;
    const suffix = (
      <>
        <div className="cus-lov-clear" />
        {this.searchButton()}
      </>
    );
    const editMatComponentProps = {
      ...this.props,
    }
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: getCurrentLanguage() === 'zh_CN' ? 445 : 355,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'orderSeq',
        width: getCurrentLanguage() === 'zh_CN' ? (!isOnly ? 120 : 130) : 213,
        render: (_, record, index) => {
          if (record.$form != undefined) {
            return !isOnly ? (
              tooltipRender(
                record.isBeChosenMeaning
              )
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator(`isBeChosen${index}`, {
                  initialValue: record.isBeChosen,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.bidcommon.view.title.whetherthebidwaswon`)
                          .d('是否中选'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={
                      infoSource?.isFrameAgreement === 'Y' ?
                      yesNoAlternate : yesNo
                    }
                    lazyLoad={false}
                    disabled={!isOnly}
                    onChange={(value, lovRecord) => {
                      this.changeChosen(value, lovRecord, record, index);
                      this.handleDataChange();
                      if (!['YES', 'Standby'].includes(value)) {
                        this.clearMaterial(record);
                      }
                    }}
                  />
                )}
              </Form.Item>
            );
          }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.choosesuppliers`).d('选择供应商'),
        dataIndex: 'supplierNumName',
        width: getCurrentLanguage() === 'zh_CN' ? 405 : 355,
        render: (val, record, index) => {
          if (record.$form != undefined) {
            if (['YES', 'Standby'].includes(record.isBeChosen)) {
              return !isOnly ? (
                tooltipRender(record.supplierNumName)
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('supplierNumName', {
                    initialValue: record.supplierNumName == 'abandon' ? '' : record.supplierNumName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          const newTableData = tableSource.filter(
                            (item) => ['YES', 'Standby'].includes(item.isBeChosen)
                          );
                          // 检测 supplierNum 是否重复
                          const isSupplierNum = (newTableData, supplierNum) => {
                            // 使用 uniqBy 函数基于 supplierNum 属性移除重复项
                            const uniqueNames = uniqBy(newTableData, supplierNum);

                            // 如果去重后的数组长度小于原数组长度，说明有重复项
                            return uniqueNames.length !== newTableData.length;
                          };
                          if (isSupplierNum(newTableData, 'supplierNum')) {
                            callback(
                              new Error(
                                intl
                                  .get('HKPC.commom.bid.messaget.checkduplicatesup')
                                  .d('请勿选择重复供应商')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <Lov
                      code="CMHK.QUALIFIED_SUPPLIER"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'supplierNumber', displayField: 'companyNameCh' }}
                      textValue={record.supplierNumName == 'abandon' ? '' : record.supplierNumName}
                      onChange={(text, item) => {
                        record.supplierNumName = item.companyNameCh;
                        record.supplierNum = item.supplierNumber;
                        form.setFieldsValue({ supplierNum: item.supplierNumber });
                        form.setFieldsValue({ supplierNumName: item.companyNameCh });
                        this.handleDataChange();
                      }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return (
                tooltipRender(record.supplierNumName == 'abandon' ? '' : record.supplierNumName)
              )
            }
          }
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        dataIndex: 'materialName',
        width: 200,
        render: (_, record) => {
          return !isOnly ||
            (!['YES', 'Standby'].includes(record.isBeChosen)) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(
                `materialName`,
                {}
              )(
                <div>{tooltipRender(record.isBeChosen === 'NO' ? null : record.materialName)}</div>
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              <Input
                readOnly
                suffix={
                  <>
                    <div className="cus-lov-clear" />
                    <img
                      src={searchIcon}
                      alt="searchIcon"
                      style={{ cursor: 'pointer', color: '#666' }}
                      onClick={() => !(isEmpty(record.supplierNumName)) && this.onSearchBtnClick(record)}
                    />
                  </>
                }
                className={styles['lov-input']}
                value={record.materialName ? record.materialName : null}
                style={{ cursor: 'pointer', color: '#666' }}
                onClick={() => {
                  this.onSearchBtnClick(record);
                }}
                disabled={isEmpty(record.supplierNumName)}
              />
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.Selectedamount`).d('中选金额'),
        dataIndex: 'beSelectedMoney',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(
                `beSelectedMoney`,
                {}
              )(
                <div style={{ textAlign: 'right' }}>
                  {record.isBeChosen === 'NO' ? null : numberRender(record.beSelectedMoneyBefore ? record.beSelectedMoneyBefore : record.beSelectedMoney, 2)}
                </div>
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看'),
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (_, record) => {
          return (
            <CusButton type="plain" onClick={() => this.previewEmail(record)}>
              {intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            </CusButton>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.approvalstatus`).d('审批结果'),
        dataIndex: 'operation',
        width: getCurrentLanguage() === 'zh_CN' ? 95 : 146,
        render: (text, record) => {
          if (record.result === 'pass') {
            return tooltipRender(intl.get(`bid.bidcommon.bid.button.Adopt`).d('通过'));
          } else if (record.result === 'reject') {
            return tooltipRender(intl.get(`bid.bidcommon.view.title.reject`).d('驳回'));
          }
        },
      },
    ];
    const tableList = {
      rowKey: 'rowId',
      dataSource: tableSource,
      columns,
      pagination: tablePagination,
      contractBidWinningResult,
      onChange: (page) => this.handlePageChange(page),
      onDataChange: this.handleDataChange,
    };

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      fixed: true,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: record.isQuote === 'N',
      }),
    };

    const materialProps = {
      dataSource: materialDataSource,
      pagination: materialPagination,
      rowSelection,
      lineRecord,
      ...this.props,
    };

    const improveMaterialListProps = {
      isOnly,
      projectNumberArray,
      dataSource: improveMaterialSource,
      materialFlag,
      purchaseCategoryVal,
      clearFlag,
      ...this.props,
    };

    const budgetInforListProps = {
      dataSource: budgetInforSource,
      // pagination: budgetInforPagination,
      ...this.props,
    };

    const budgetDetailListProps = {
      ...this.props,
      budgetDetailList,
      budgetDetailPagination,
      onChange: this.handleDudgetDetailData,
    };

    const priceInfoListProps = {
      ...this.props,
      // dataSource: pricingSingleDataSource,
      // pagination: pricingSinglePagination,
      onChange: this.handleUnitPrice
    };

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    const gridSpan = getDFormGridSpan();

    // 小屏为false，大屏为true
    const isShow = screenWidth < largeScreenWidth;

    const projectFormProps = {
      ...this.props,
      projectNumberArray,
      onRef: (node) => {
        this.projectEditForm = node.props.form;
      },
      onRowsItem: this.getRowsItem,
    };

    const decisionInformationProps = {
      ...this.props,
      poHeaderInfo,
      decisionType,
    };

    console.info('activityCode', activityCode, isOnly, state);

    const messageTitle = (() => {
      if (isOnly) {
        return intl.get(`HKPC.commom.view.title.procurementResultDraft`).d('起草采購結果');
      } else {
        if(activityCode === 'XQR01') {
          return intl.get(`HKPC.commom.view.title.procurementResultVerify`).d('核對采購結果');
        }
        if(activityCode === 'CWJL01') {
          return intl.get(`HKPC.commom.view.title.budgetVerify`).d('核對項目預算');
        }
        if(['XQRJL01', 'XQRZG02', 'CBZXBM03'].includes(activityCode)) {
          return intl.get(`HKPC.commom.view.title.procurementResultApproval`).d('審批采購結果');
        }
      }
    })();

    return (
      <div style={{marginBottom: '16px'}}>
        {!['DONE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45', margin: '0 0 16px 0' }}
        />}
        <CusSpin spinning={saveInfoLoading || featchLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKeyProcurementResult}
            onChange={(collapseKeys) => {
              this.setState({ activeKeyProcurementResult: collapseKeys });
            }}
          >
            {['0', '1'].includes(projectType) && <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.bid.title.projectinfo`).d('项目信息')}
                  arrowActive={activeKeyProcurementResult.includes('projectForm')}
                  buttons={
                    <>
                      {projectType == '0' && isOnly && (
                        <CusButton
                          mini
                          onClick={() => {
                            this.handleBasicInfoModal('demand');
                          }}
                        >
                          {intl
                            .get(`HKPC.commom.view.title.projectchangemanagement`)
                            .d('项目变更管理')}
                        </CusButton>
                      )}
                    </>
                  }
                />
              }
              key="projectForm"
            >
              <Form className="customize-form">
                <Row>
                  <Col span={24}>
                    {projectType == '0' ? (
                      <Form.Item
                        label={intl.get('HKPC.commom.view.title.projectname').d('项目名称')}
                      >
                        {getFieldDecorator('projectName', {
                          initialValue: projectName,
                        })(<Input disabled />)}
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label={intl
                          .get('HKPC.commom.view.title.BudgetProjectnumber')
                          .d('预算项目编号')}
                      >
                        {getFieldDecorator('projectNumber', {
                          initialValue: projectNumber,
                        })(<Input disabled />)}
                      </Form.Item>
                    )}
                  </Col>
                </Row>
              </Form>
            </Panel>}
            </Collapse>
            <div className={styles['tab-style']} style={{marginTop: '16px'}}>
              <CusTabs
                defaultActiveKey={'scoreDetailTwo'}
                onChange={this.handleTabChange}
                items={[
                  {
                    label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                    key: 'scoreDetail',
                    children: (
                      <CusSearchTabs
                        style={{
                          backgroundColor: '#fff',
                          padding: '16px 16px 0 16px',
                        }}
                        activeKey="0"
                        items={[
                          {
                            label: intl.get(`HKPC.commom.bid.title.projectinfo`).d('项目信息'),
                            key: '0',
                            children: (
                              <div className={styles['iframe-style']}>
                                <iframe
                                  style={{ width: '100%', height: '100vh' }}
                                  src={`${process.env.ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`}
                                  width="100%"
                                  // height="100vh !important"
                                  frameBorder="0"
                                />
                              </div>
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                    key: 'scoreDetailTwo',
                    children: (
                      <div className={styles['cusTabs-panelBody']}>
                        <div style={{ display: 'flex' }} className={styles['tab-panel']}>
                          <div
                            className={
                              searchTabActiveKey === 'requirement' ? styles['tab-panel-active'] : styles['tab-panel-default']
                            }
                            onClick={() => this.setState({ searchTabActiveKey: 'requirement' })}
                          >
                            <div className={styles['tab-panel-title']}>
                              {intl.get(`HKPC.commom.view.title.ProcurementRequisition`).d('采购申请')}
                            </div>
                            {searchTabActiveKey === 'requirement' && <div className={styles['tab-panel-active-line']} />}
                          </div>
                          <div
                          className={
                            searchTabActiveKey === 'programme'
                              ? styles['tab-panel-active']
                              : styles['tab-panel-default']
                          }
                          onClick={() => {
                            this.setState({ searchTabActiveKey: 'programme' });
                          }}
                        >
                          <div className={styles['tab-panel-title']}>
                            {intl.get(`HKPC.commom.view.title.ProcurementScheme`).d('采购方案')}
                          </div>
                          {searchTabActiveKey === 'programme' && <div className={styles['tab-panel-active-line']} />}
                          </div>
                          <div
                            className={
                              searchTabActiveKey === 'procurementResult'
                                ? styles['tab-panel-active']
                                : styles['tab-panel-default']
                            }
                            onClick={() => {
                              this.setState({ searchTabActiveKey: 'procurementResult' });
                            }}
                          >
                            <div className={styles['tab-panel-title']}>
                              {intl.get(`HKPC.commom.view.title.ProcurementResults`).d('采购结果')}
                            </div>
                            {searchTabActiveKey === 'procurementResult' && <div className={styles['tab-panel-active-line']} />}
                          </div>
                        </div>

                        {/* 采购申请 */}
                        {searchTabActiveKey === 'requirement' && (
                          <div style={{ height: '100vh' }}>
                            <iframe
                              style={{ width: '100%', height: '100%' }}
                              src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${refPrFirstId}`}
                              width="100%"
                              height="100% !important"
                              frameBorder="0"
                            />
                          </div>
                        )}

                        {/* 采购方案 */}
                        {searchTabActiveKey === 'programme' && (
                          <div style={{ height: '100vh' }}>
                            <iframe
                              style={{ width: '100%', height: '100%' }}
                              src={`/pub/ssrc-hk/purchase-plan-list/detail/castrate?id=${refSecondId}`}
                              width="100%"
                              height="100% !important"
                              frameBorder="0"
                            />
                          </div>
                        )}

                        {/* 采购结果 */}
                        {searchTabActiveKey === 'procurementResult' && (
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
                                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                                  arrowActive={activeKey.includes('form')}
                                />
                              }
                              key="form"
                            >
                              <Form className="customize-form">
                                <GenerateFormGrid isPackUp={isShow} defaultPackUp={false}>
                                  <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl
                                        .get('HKPC.commom.view.title.prnumber')
                                        .d('采购申请编号')}
                                    >
                                      {getFieldDecorator('prNumber', {
                                        initialValue: prNumber,
                                      })(
                                        <Input disabled />
                                      )}
                                    </Form.Item>
                                  </Col>
                                  <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl
                                        .get('HKPC.commom.view.title.prname')
                                        .d('采购申请名称')}
                                    >
                                      {getFieldDecorator('prName', {
                                        initialValue: prName,
                                      })(<Input disabled />)}
                                    </Form.Item>
                                  </Col>
                                  <Col {...gridSpan}>
                                    <Form.Item label={intl.get('HKPC.commom.view.title.applicant').d('申请人')}>
                                      {getFieldDecorator('purchasingEmpName', {
                                        initialValue: purchasingEmpName,
                                      })(<Input disabled />)}
                                    </Form.Item>
                                  </Col>
                                  <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl.get('HKPC.commom.view.title.applyingdepartment').d('申请人部门')}
                                    >
                                      {getFieldDecorator('applyingDepartmentName', {
                                        initialValue: applyingDepartmentName,
                                      })(<Input disabled />)}
                                    </Form.Item>
                                  </Col>
                                  <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl.get('HKPC.commom.view.title.ettimatedbudgetamountH').d('预估总金额(HKD)')}
                                    >
                                      {getFieldDecorator('budgetAmount', {
                                        initialValue: numberRender(poHeaderInfo?.budgetAmount, 2),
                                      })(
                                        <Input disabled />
                                      )}
                                    </Form.Item>
                                  </Col>
                                  <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl.get('HKPC.commom.view.title.procurementhandler').d('采购经办人')}
                                    >
                                      {getFieldDecorator('applicantUserName', {
                                        initialValue: applicantUserName,
                                      })(
                                        <Input disabled />
                                      )}
                                    </Form.Item>
                                  </Col>
                                  {(isEmpty(activityCode) || activityCode === 'Start' || activityCode === 'XQR01') && <Col {...gridSpan}>
                                    <Form.Item
                                      label={intl
                                        .get('bid.bidcommon.view.title.informsupplierlose')
                                        .d('通知落选者结果')}
                                    >
                                      {getFieldDecorator('informRejectResult', {
                                        initialValue: informRejectResult,
                                      })(
                                        <CusSelect
                                          options={yesNo}
                                          lazyLoad={false}
                                          allowClear
                                          disabled={true}
                                          // onChange={(_, lovRecord) => {
                                          //   this.changeChosen('result', lovRecord, form);
                                          // }}
                                        />
                                      )}
                                    </Form.Item>
                                  </Col>}
                                  <Col span={24}>
                                    <Form.Item
                                      label={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                                    >
                                    {getFieldDecorator('uuid', {
                                        initialValue: poHeaderInfo?.uuid,
                                      })(
                                        <UploadList
                                          viewOnly={!isDisabled}
                                          multiple={true}
                                          bucketName='bidding'
                                          tenantId={getCurrentOrganizationId()}
                                          filePreview
                                          onUploadSuccess={(file, fileList, attachmentUUID) => {
                                            console.log('上传成功', attachmentUUID);
                                            form.setFieldsValue((
                                              infoSource.uuid = attachmentUUID
                                            ));
                                          }}
                                          attachmentUUID={poHeaderInfo?.uuid}
                                          setLoading={(uploading = false) => {
                                            this.setState({
                                              uploading,
                                            });
                                          }}
                                        />
                                      )}
                                    </Form.Item>
                                  </Col>
                                </GenerateFormGrid>
                              </Form>
                            </Panel>
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`HKPC.commom.view.title.budgetlinformation`).d('预算信息')}
                                  arrowActive={activeKey.includes('budgetInfor')}
                                  buttons={
                                    <>
                                      <CusExcelExport
                                        requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-collect-art-grade/exportBidComMaterialBudInfoClassify`}
                                        otherButtonProps={{
                                          mini: true,
                                          icon: null,
                                        }}
                                        downloadType="Blob"
                                        fileName={
                                          intl.get(`HKPC.commom.view.title.budgetlinformation`).d('预算信息')
                                        }
                                        queryParams={{
                                          proId: proId || formRecordId,
                                        }}
                                      />
                                    </>
                                  }
                                />
                              }
                              key="budgetInfor"
                            >
                              <BudgetInforList {...budgetInforListProps} />
                            </Panel>
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`HKPC.commom.view.title.Recommendedsupplierinformation`).d('中选供应商信息')}
                                  arrowActive={activeKey.includes('resultTable')}
                                  buttons={
                                    <>
                                      <CusExcelExport
                                        requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-collect-art-grade/exportPurchaseResultSupplier`}
                                        otherButtonProps={{
                                          mini: true,
                                          icon: null,
                                        }}
                                        downloadType="Blob"
                                        fileName={
                                          intl.get(`HKPC.commom.view.title.Recommendedsupplierinformation`).d('中选供应商信息')
                                        }
                                        queryParams={{
                                          proId: proId || formRecordId,
                                          state: '1'
                                        }}
                                      />
                                      {isDisabled && <CusButton mini onClick={this.handleAddMat}>
                                        {intl.get('HKPC.commom.view.title.additem').d('新增物料')}
                                      </CusButton>}
                                    </>
                                  }
                                />
                              }
                              key="resultTable"
                            >
                              <EditTable {...tableList}></EditTable>
                            </Panel>
                            {/* <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl
                                    .get(`bid.bidcommon.view.title.waitingfordecisioncontent`)
                                    .d('推荐供应商意见')}
                                  arrowActive={activeKey.includes('waitingfordecisioncontent')}
                                />
                              }
                              key="waitingfordecisioncontent"
                            >
                              {isDisabled ? (
                                <StaticTextEditor
                                  key="editorKey1"
                                  content={this.state.prevContent}
                                  onRef={(staticTextEditor) => {
                                    this.staticTextEditor = staticTextEditor;
                                  }}
                                  onEditChange={this.onEditChange}
                                />
                              ) : (
                                <StaticTextEditor
                                  key="editorKey2"
                                  content={this.state.prevContent}
                                  onRef={(staticTextEditor) => {
                                    this.staticTextEditor = staticTextEditor;
                                  }}
                                  onEditChange={this.onEditChange}
                                  isDisabled={true}
                                />
                              )}
                            </Panel> */}
                            {/* {activityCode && activityCode !== 'Start' && (
                              <> */}
                                {/* 这里的采购类别挪动到improveMaterial表格中 */}
                                {/* <Panel
                                  showArrow={false}
                                  header={
                                    <PanelHeader
                                      title={intl.get(`HKPC.commom.view.title.InformationofInquiry`).d('询价信息')}
                                      arrowActive={activeKey.includes('inquiryInfo')}
                                    />
                                  }
                                  key="inquiryInfo"
                                >
                                  {activityCode && activityCode !== 'Start' && <Form className="customize-form">
                                    <Row>
                                      <Col span={8}>
                                        <Form.Item
                                          label={intl.get('HKPC.commom.view.title.prcategory').d('采购类别')}
                                        >
                                          {getFieldDecorator('purchaseCategory', {
                                            initialValue: purchaseCategory,
                                            rules: [
                                              {
                                                required: true,
                                                message: intl.get('hzero.common.validation.notNull', {
                                                  name: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
                                                }),
                                              },
                                            ],
                                          })(
                                            <CusSelect
                                              disabled={!isOnly}
                                              options={category}
                                              lazyLoad={false}
                                              allowClear
                                              onChange={(value) => {
                                                if(value) {
                                                  this.setState({
                                                    materialFlag: false
                                                  })
                                                } else {
                                                  this.setState({
                                                    materialFlag: true
                                                  })
                                                }
                                                this.setState({
                                                  purchaseCategoryVal: value
                                                })
                                              }}
                                            />
                                          )}
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  </Form>}
                              </Panel> */}
                              <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl
                                      .get(`HKPC.commom.view.title.materialbudgetinformation`)
                                      .d('完善物料信息')}
                                    arrowActive={activeKey.includes('improveMaterial')}
                                    buttons={
                                      <>
                                        <CusExcelExport
                                          requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-collect-art-grade/exportLookComMaterialBudInfor`}
                                          otherButtonProps={{
                                            mini: true,
                                            icon: null,
                                          }}
                                          downloadType="Blob"
                                          fileName={
                                            intl.get(`bid.bidcommon.view.title.Pure`).d('采购结果')
                                          }
                                          queryParams={{
                                            proId: proId || formRecordId,
                                          }}
                                        />
                                      </>
                                    }
                                  />
                                }
                                key="improveMaterial"
                              >
                                <ImproveMaterialList {...improveMaterialListProps} />
                              </Panel>
                              <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl.get(`HKPC.commom.view.title.quotationdetail`).d('报价详情')}
                                    arrowActive={activeKey.includes('priceInfo')}
                                    buttons={
                                      <>
                                        <Form className="customize-form">
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
                                                      this.handleUnitPrice();
                                                    }
                                                  );
                                                }}
                                              />
                                            )}
                                          </Form.Item>
                                        </Form>
                                      </>
                                    }
                                  />
                                }
                                key="priceInfo"
                              >
                                <PriceInfoList {...priceInfoListProps} />
                              </Panel>
                              {(isEmpty(activityCode) || activityCode === 'Start' || activityCode === 'XQR01') && <Panel
                                showArrow={false}
                                header={
                                  <PanelHeader
                                    title={intl.get(`bid.bidcommon.view.title.meetingjiyao`).d('上会纪要')}
                                    arrowActive={activeKey.includes('decisionInformation')}
                                  />
                                }
                                key="decisionInformation"
                              >
                                <DecisionInformation {...decisionInformationProps} />
                              </Panel>}
                          </Collapse>
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </div>
        </CusSpin>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看')}
          visible={emailModel}
          footer={
            <CusButton onClick={this.handleCancel}>
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
        >
          <div
            dangerouslySetInnerHTML={{
              __html: this.props.contractBidWinningResult.tableEmailSource,
            }}
          ></div>
        </CusModal>
        <CusModal
          title={intl.get(`HKPC.commom.view.title.materialname`).d('物料名称')}
          visible={materialModel}
          width={800}
          onOk={this.handleSaveMaterial}
          onCancel={this.handleMaterialCancel}
        >
          <MaterialList {...materialProps} />
        </CusModal>
        <CusModal
          title={intl.get(`HKPC.commom.view.title.projectchangemanagement`).d('项目变更管理')}
          visible={basincModal}
          destroyOnClose={true}
          width={800}
          onCancel={() => {
            this.setState({
              basincModal: false,
            });
          }}
          onOk={this.handleOk}
        >
          <ProjectForm {...projectFormProps} />
        </CusModal>

        <CusModal
          title={intl.get('HKPC.commom.view.title.additem').d('新增物料')}
          visible={addMatModalVisible}
          width={1000}
          destroyOnClose
          maskClosable={false}
          onCancel={() => {
            this.setState({
              addMatModalVisible: false,
            });
          }}
          onOk={this.handleOkMat}
        >
          <EditMatComponent {...editMatComponentProps} />
        </CusModal>
      </div>
    );
  }
}
