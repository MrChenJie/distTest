import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { Collapse, Upload } from 'antd';
import intl from 'utils/intl';
import { multiply } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { downloadFile } from 'hzero-front/lib/services/api';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusRequest from '_cus_utils/request';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import ImportModal from '_cus_components/CusModal/ImportModal';
import SearchApplication from './SearchApplication';
import DataTable from './DataTable';
import FilterSearch from './FilterSearch';
import styles from './index.less';
import classnames from 'classnames';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import CusModal from '_cus_components/CusModal';
import { getEditTableData } from 'hzero-front/lib/utils/utils';
import { queryFileList } from '@/utils/utils';
import { getResponse } from '_cus_utils/utils';
import PageMessage from '_cus_components/Page/PageMessage';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;
const organizationId = getCurrentOrganizationId();
const { activityCode, state } = queryString.parse(location?.search?.substr(1)) || {}; 

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  saveLoading: loading.effects['purchaseApplicationModel/addPurchaseApplicationList'],
  searchProjectInfoLoading: loading.effects['purchaseApplicationModel/getProjectName'],
  userDepatLoading: loading.effects['purchaseApplicationModel/getUserDepat'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.BUDGETTYPE',
  'HKPC.PRTYPE',
  'CMHKHPFM.UOM',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.PURCHASINGCATEGORY',
  'BID.PROCUREMENT_METHOD_2',
  'BID.PROCUREMENT_METHOD_1',
  'HKPC.PPPROCUREMENTMETHOD',
  'HKPC.VENDOR_CATEGORY',
  'HKPC.RELATEDTOPROJECT',
  'BID.PROCUREMENT_METHOD',
])
@Form.create()
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'applicationTable', 'purchaseTable'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      tabActiveKey: '0',
      tabKey: 'procurement',
      SearchTabActiveKey: '1',
      searchFilterForm: {},
      attachmentSource: [], // 附件信息
      purchaseApplicationLineListValue: [],
      projectNumber: '',
      totalAmountHKD: 0,
      applyUserId: '',
      applyUserDepId: '',
      applyingDepartmentId: '',
      applicantUserId: '',
      isClickSave: false,
      contentObj: {},
      unitName: '',
      related: '',
      rate: '',
      prNumber: '',
      id: '',
      projectManagerCode: '',
      projectManagerName: '',
      applierDeptName: '', // 需求人部门
      employeeNum: '', // 需求人编号，
      affairTitle: '',
      prStatusState: '',
      fileSource: [],
      fileInfoList: [],
      productVisible: false,
      importUploading: false,
      templateCode: 'HKPC.PURCHASE_REQUEST_IMPORT',
      bpmFormData: {},
    };
    this.cusApprovalBtns = React.createRef();
  }

  componentDidUpdate(prevProps,preSate){
    const {purchaseApplicationModel} = this.props;
    const {UUid} = purchaseApplicationModel
    // console.log('???',preSate);
    if(prevProps!=this.props){
      this.getFileList(UUid || '-1')
      this.setState({
        stateAttachmentUUID: uuid()
      })
    }
  }

  @Bind()
  getFileList(attachmentUUID){
    const { dispatch } = this.props;
    const bucketName = 'spfm-comp';
    dispatch({
      type:'purchaseApplicationModel/getFileList',
      payload:{
        attachmentUUID,
        bucketName
      }
    }).then((res)=>{
      if(res){
        this.setState({
          fileSource: res
        })
      }
    })
  }

  componentDidMount() {
    //查询数据
    this.init();
    this.listener();
  }

  // 流程穿越-查询项目信息
  @Bind()
  searchProjectInfo(projectCode) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getProjectId',
      payload: {
        projectCode,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
            projectNumber: projectCode,
            projectName: res.projectName,
          },
        });
      }
    });
  }

  @Bind()
  init() {
    const {
      location: { search },
      dispatch,
      purchaseApplicationModel,
    } = this.props;
    const { prStatus } = purchaseApplicationModel;
    const { related, id, formRecordId, prType, flag } = queryString.parse(search.substring(1));
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        projectType: related,
        prType,
        flag,
      },
    });
    if (id == undefined && formRecordId == 'null') {
      this.handleClearData();
      this.handleSearchUnitName();
      this.handleSearchRate();
    } else {
      this.handleSearch();
    }
  }

  // 致远流程
  @Bind()
  listener() {
    const {
      location: { search },
      purchaseApplicationModel,
      dispatch
    } = this.props;
    const { employeeNum } = purchaseApplicationModel;
    const { id, formRecordId } = queryString.parse(search.substring(1));
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      // console.log(e.data.submitType, 'e.data.submitType');
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 知会 会签 查看流程
        if (['SUBMIT', 'TEMPORARY', 'DRAFT_HANDLE', 'GIVE', 'NOTICE'].includes(e.data.submitType)) {
          this.save((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params.id, //表单记录id（Long）
                    //下面内容为表单数据
                    ...params,
                    affairTitle: params.affairTitle, //待办流程名称
                    loginName: params.applyUserCode,
                    jine: params.estimatedBudgetAmountHkd,
                    managerId: params.managerId,
                  },
                },
                e.data.url
              );
            }
          });
        } else if(['SEND'].includes(e.data.submitType)) {
          console.log('采购申请的首次提交SEND', e.data.submitType)
          this.save((params) => {
            if (params) {
              // 首次提交的时候触发金额检验
              const newPriceList = (params.prLineDTOList || []).map((item) => ({
                  budType: item?.budgetType, // 预算类型
                  budCode: item?.budgetItemNumber, // 预算项目编号
                  amount: Number(item?.budgetPricesHkd), // 金额
                  busActivityName: item?.businessActivitiesName, // 业务活动名称
              }));
              // 首次提交的时候触发金额检验
              dispatch({
                type: 'purchaseApplicationModel/getPriceValidate',
                payload: {
                  applyType: params?.projectType,
                  projectCode: params?.projectNumber,
                  lines: newPriceList
                }
              }).then((res) => {
                if(res) {
                  if(res.code == '204') {
                    CusModal.confirm({
                      content: res.msg + intl.get('HKPC.commom.view.title.budgetinsufficient').d('预算金额不足，请重新检查'),
                      onOk: () => {
                        top?.postMessage(
                          {
                            success: true, //表单数据验证成功或不需要验证时传true，否则传false
                            submitType: e.data.submitType, //将此字段值回传
                            messageType: 'GET_FORM_DATA', //获取表单数据消息
                            formData: {
                              formRecordId: params.id, //表单记录id（Long）
                              //下面内容为表单数据
                              ...params,
                              affairTitle: params.affairTitle, //待办流程名称
                              loginName: params.applyUserCode,
                              jine: params.estimatedBudgetAmountHkd,
                              managerId: params.managerId,
                            },
                          },
                          e.data.url
                        );
                      }
                    })
                  } else {
                    top?.postMessage(
                      {
                        success: true, //表单数据验证成功或不需要验证时传true，否则传false
                        submitType: e.data.submitType, //将此字段值回传
                        messageType: 'GET_FORM_DATA', //获取表单数据消息
                        formData: {
                          formRecordId: params.id, //表单记录id（Long）
                          //下面内容为表单数据
                          ...params,
                          affairTitle: params.affairTitle, //待办流程名称
                          loginName: params.applyUserCode,
                          jine: params.estimatedBudgetAmountHkd,
                          managerId: params.managerId,
                        },
                      },
                      e.data.url
                    );
                  }
                }
              })
            }
          });
        } else if (['BACK'].includes(e.data.submitType)) {
          console.log('123123');
          this.save((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    //下面内容为表单数据
                    ...params,
                    formRecordId: params.id, //表单记录id（Long）
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPCReject', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.estimatedBudgetAmountHkd, 4),
                      })
                      .d(`采购申请驳回-关于${params.prNumber}:${params.prName}采购申请驳回`), //待办流程名称
                    loginName: params.applyUserCode,
                    jine: params.estimatedBudgetAmountHkd,
                    managerId: params.managerId,
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
              formData: {},
            },
            e.data.url
          );
        }
      }
    });
  }

  @Bind()
  handleClearData() {
    const { dispatch } = this.props;
    this.setState({
      contentObj: {},
    });
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        purchaseApplicationList: [], // 采购申请列表数据
        purchaseApplicationPagination: {}, // 分页对象
        projectNameList: [], // 项目信息列表数据
        projectNamePagination: {}, // 分页对象
        projectName: '', //项目名称
        budProjectCode: '', //预算项目编号
        infomation: {}, // 基本信息&申请信息
        fileSource: [], // 附件信息
        purchaseApplicationLineSource: [], // 采购申请行信息数据源
        purchaseApplicationLinePagination: {}, // 采购申请行信息分页
        demander: '', //需求人
        demanderId: '', //需求人id
        demanderPhone: '', //需求人电话
        demanderDepartment: '', //需求人部门
        demanderDepartmentId: '', //需求人部门id
        employeeNum: '', // 需求人工号
        applier: '', //申请人
        applierId: '', //申请人id
        applyingDepartmentName: '', //申请人部门
        applyingDepartmentId: '', //申请人部门id
        prStatus: '', //申请状态
        currencyCode: 'HKD', //币种code值
        prRate: '', //汇率
        deliverAddress: '', //送货地址
        allDetailsInfo: {}, //当前采购订单编号所有详情数据
        keyId: '', // 关键id
        prNumber: '', //采购申请编号
        projectManagerCode: '', //项目经理编号
      },
    });
  }

  //查询需求人
  @Bind()
  handleSearchApplier() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { projectManagerCode, projectType, projectNumber } = purchaseApplicationModel;
    dispatch({
      type: 'purchaseApplicationModel/getApplier',
      payload: {
        // tenantId: getCurrentUser().tenantId,
        // employeeNum: this.state.projectManagerCode,
        // projectManagerCode,
        isProject: projectType,
        projectCode: projectNumber,
        lang: this.props.language,
      },
    })
      .then((res) => {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            demander: res?.content[0].realName,
            demanderId: res?.content[0].userId,
            employeeNum: res?.content[0].employeeNum,
          },
        });
      })
      .then((res) => {
        this.handleSearchApplyDept();
      });
  }

  //查询需求人部门
  @Bind()
  handleSearchApplyDept() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { employeeNum, projectManagerCode } = purchaseApplicationModel;
    dispatch({
      type: 'purchaseApplicationModel/getApplyDept',
      payload: {
        organizationId: getCurrentOrganizationId(),
        employeeNum: employeeNum,
        tenantId: getCurrentUser().tenantId,
        lang: this.props.language,
        projectManagerCode,
      },
    }).then((res) => {
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          demanderDepartment: res.content[0].unitName,
          demanderDepartmentId: res.content[0].unitId,
        },
      });
    });
  }

  // 查询申请汇率
  @Bind()
  handleSearchRate() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { currencyCode } = purchaseApplicationModel;
    dispatch({
      type: 'purchaseApplicationModel/getPurchaseApplicationRate',
      payload: {
        currencyCode: currencyCode,
        rateDate: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then((res) => {
      this.setState({
        rate: res?.rate,
      });
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          prRate: res?.rate,
        },
      });
    });
  }

  //查询首次进来的申请人部门名称
  @Bind()
  handleSearchUnitName() {
    const userInfo = getCurrentUser();
    const {
      dispatch,
      location: { search },
      purchaseApplicationModel,
    } = this.props;
    const { prStatus } = purchaseApplicationModel;
    const { id, related, formRecordId, flag, projectCode } = queryString.parse(search.substring(1));
    dispatch({
      type: 'purchaseApplicationModel/getUserUnit',
      payload: { tenantId: userInfo.tenantId, lang: userInfo.language, userId: userInfo.id },
    }).then((res) => {
      if (prStatus == 'PENDING_REFER' || prStatus == '') {
        console.log(prStatus, 'prStatus');
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            applier: res.content[0].realName,
            applierId: res.content[0].userId,
            applyingDepartmentName: res.content[0].unitName,
            applyingDepartmentEnName: res.content[0].unitName,
            applyingDepartmentId: res.content[0].unitId,
            unitCode: res.content[0].unitCode,
          },
        });
      }
      if (['1', '2'].includes(related) || flag == '1') {
        console.log(getCurrentUser(), 'getCurrentUser()');
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            demander: getCurrentUser().realName, // 需求人
            demanderId: getCurrentUser().id, //
            demanderPhone: getCurrentUser().phone, //需求人电话
            demanderDepartment: res.content[0].unitName, // 需求人部门中文
            demanderDepartmentEn: res.content[0].unitName, // 需求人部门英文
            demanderDepartmentId: res.content[0].unitId, //需求人部门id
            unitCode: res.content[0].unitCode,
          },
        });
        if (related == '0') {
          // 只有在关联立项的时候才会调用查询项目信息；
          //流程穿越，查询项目信息
          this.searchProjectInfo(projectCode);
        }
      }
    });
  }

  // 查询物料行数据
  @Bind()
  handleSearchMaterial(page = {}) {
    const { purchaseApplicationModel, dispatch } = this.props;
    const { keyId } = purchaseApplicationModel;
    dispatch({
      type: 'purchaseApplicationModel/getMaterialsDetail',
      payload: {
        page,
        refHeadId: keyId,
      },
    });
  }

  /**
   * @description 查询采购申请详情数据
   */
  @Bind()
  handleSearch(resId, page = {}) {
    let nextActivityCode;
    let prName;
    let affairTitle;
    let prNumber;
    let estimatedBudgetAmountHkd;
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { id, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'purchaseApplicationModel/getMaterialsDetail',
      payload: {
        page,
        refHeadId: resId || id || formRecordId,
      },
    }).then((res2) => {
      if (res2) {
        dispatch({
          type: 'purchaseApplicationModel/getPurchaseApplicationDetail',
          payload: {
            id: resId || id || formRecordId,
          },
        }).then((res) => {
          if (res) {
            console.log(res, 'res');
            prName = res?.prName;
            prNumber = res?.prNumber;
            estimatedBudgetAmountHkd = res?.estimatedBudgetAmountHkd;
            dispatch({
              type: 'purchaseApplicationModel/commentUpdateState',
              payload: {
                projectType: res?.projectType,
                prType: res?.prType,
                infomation: res,
                fileSource: res.prApplyAttachmentList || [],
                fileSourceList: res.prApplyAttachmentList || [],
                purchaseApplicationLineSource: res2.content[0]?.prApplyMaterialList?.map((item) => {
                  return {
                    ...item,
                    uuid: uuid(),
                    rowKey: uuid(),
                    _status: 'update'
                  };
                }),
                budgetTypeUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.budgetType, // 预算类型
                budgetItemNumberUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.budgetItemNumber, // 预算项目编码
                businessActivitiesCodeUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.businessActivitiesCode, // 业务活动编码
                businessActivitiesNameUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.businessActivitiesName, // 业务活动名称
                costCenterCodeUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.costCenterCode, // 成本中心编码
                costCenterNMUpdate: res2.content?.[0]?.prApplyMaterialList?.[0]?.costCenterNM, // 成本中心名称
                allDetailsInfo: res,
                projectName: res?.projectName,
                projectNumber: res?.projectNumber,
                prStatus: res?.prStatus,
                keyId: res?.id,
                estimatedBudgetAmountHkd: res?.estimatedBudgetAmountHkd,
                applier: res?.applicantUserName, //申请人
                applierId: res?.applicantUserId, //申请人id
                applyingDepartmentName: res?.applyingDepartmentName,
                // applyingDepartmentId: res?.applyingDepartmentId,
                unitCode: res?.unitCode,
                prNumber: res?.prNumber,
                // currencyCode: res?.currency,
                // prRate: res?.prRate,
                demanderId: res?.applyUserId, //需求人ID
                demanderDepartmentId: res?.applyUserDepId, //需求人部门ID
                applyingDepartmentId: res?.applyingDepartmentId, //申请人部门ID
                demanderDepartment: res?.applyUserDepName, //需求人部门中文
                demanderDepartmentEn: res?.applyUserDepEnName, //需求人部门英文
                applyingDepartmentEnName: res?.applyingDepartmentEnName, //申请人部门英文
                prReason: res?.prReason, //采购原因
                prReq: res?.prReq, //采购需求
                prBakup: res?.prBakup, //需求部门备注给(采购部)
                supBakup: res?.supBakup, //需求部门备注给(供应商)
                prSuggestion: res?.prSuggestion, //建议采购计划
                UUid : res?.prApplyAttachmentList?.[0]?.attachmentUuid || '',
                techSpecs: res?.techSpecs, // 技术规范
                deliveryReqs: res?.deliveryReqs, // 交付要求
                performanceHistory: res?.performanceHistory, // 历史执行情况
                supplierCriteria: res?.supplierCriteria, // 潜在供应商报名资格条件建议
                techScoCriteria: res?.techScoCriteria, // 技术评分细则建议
                attachUuid: res?.attachUuid, // 附件uuid
                procurementType: res?.procurementType, // 采购方式code
                erpPrType: res?.erpPrType, // 给erp的采购类型
                budgetType: res?.budgetType, // INVENTORY获取的预算类型
                purchasingCategory: res?.purchasingCategory, // INVENTORY获取的采购类别
              },
            });
            this.setState({
              contentObj: res,
              prStatusState: res?.prStatus,
            });
            dispatch({
              type: 'purchaseApplicationModel/getNodeInfo',
              payload: {
                formRecordId: id || formRecordId,
                templateCode: 'BPM_SCM_jianyixunjiacaigoushenqing',
              },
            }).then((res2) => {
              console.log(res2, '节点信息');
              if (res2) {
                nextActivityCode = res2?.nextActivityCode;
                switch (nextActivityCode) {
                  case 'SCM01':
                    affairTitle = intl
                      .get('HKPC.commom.view.title.bpmPCAssign', {
                        prNumber: prNumber,
                        prName: prName,
                        amount: numberRender(estimatedBudgetAmountHkd, 4),
                      })
                      .d(`采购申请分发-关于${prNumber}:${prName}简易询价实施`);
                    break;
                  case 'SCM02':
                    affairTitle = intl
                      .get('HKPC.commom.view.title.bpmPCMangerAssign', {
                        prNumber: prNumber,
                        prName: prName,
                        amount: numberRender(estimatedBudgetAmountHkd, 4),
                      })
                      .d(`采购申请指派-关于${prNumber}:${prName}简易询价实施`);
                    break;
                  default:
                    affairTitle = intl
                      .get('HKPC.commom.view.title.bpmPCApproval', {
                        prNumber: res.prNumber,
                        prName: res.prName,
                        amount: numberRender(res.estimatedBudgetAmountHkd, 4),
                      })
                      .d(`采购申请审批-关于${res.prNumber}:${res.prName}采购申请审批`);
                }
              }
              this.setState({
                affairTitle,
              }, () => {
                this.setState({
                  bpmFormData: {
                    ...res,
                    affairTitle:
                    this.state.affairTitle == ''
                      ? intl
                          .get('HKPC.commom.view.title.bpmPCApproval', {
                            prname: res.prNumber + ':' + res.prName,
                          })
                          .d(`采购申请审批-关于${res.prNumber}:${res.prName}采购申请审批`)
                      : this.state.affairTitle,
                  }
                })
              });
            });
            if(res?.attachUuid) {
              // 用uuid查询附件
              this.handleFileInfo(res?.attachUuid);
            }
          }
        });
      }
    });
  }

  @Bind()
  handleFileInfo(attachmentUUID) {
    queryFileList({
      tenantId: getCurrentOrganizationId(),
      bucketName: 'spfm-comp',
      attachmentUUID,
    }).then((fileInfoList) => {
      if (getResponse(fileInfoList)) {
        this.setState({
          fileInfoList,
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

  @Bind
  translateEbsCode(code) {
    const { idpValueMap = {} } = this.props;
    const valuelist = idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    const { meaning } = valuelist.find((item) => item.value === code) || {};
    return meaning;
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
    this.ChildRef?.handleDelete();
  }

  /**
   * @description 批量创建
   */
  @Bind()
  handleMassCreate() {
    const { history } = this.props;
    const { isPub } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/ssrc/resale-rfq/batchImport`,
    });
  }

  //保存按钮
  @Bind()
  save(callback) {
    const {
      dispatch,
      idpValueMap,
      purchaseApplicationModel,
      location: { search },
    } = this.props;
    const {
      purchaseApplicationLineSource,
      fileSource,
      demanderId,
      demanderDepartmentId,
      demanderDepartment,
      applyingDepartmentId,
      applier,
      applierId,
      keyId,
      prType,
      projectType,
      unitCode,
      prStatus,
      projectNumber,
      UUid
    } = purchaseApplicationModel;
    const searchFormValue = this.searchForm.form.getFieldsValue();
    console.log(searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, ''), 'asdfgh');
    const estimatedBudgetAmountHkd = searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, '');
    const purchaseApplicationLineSourceList = getEditTableData(purchaseApplicationLineSource)
    if (prType == 'simpleInquiry1' && estimatedBudgetAmountHkd > 500000) {
      CusNotification.warning({
        message: intl
          .get('HKPC.commom.view.message.amountprompt')
          .d('请控制预估金额（HKD）不多于50W'),
      });
    } else if (
      (estimatedBudgetAmountHkd <= 0) ||
      (prType == 'generalProcurement1' &&
        (estimatedBudgetAmountHkd <= 500000 || estimatedBudgetAmountHkd > 1000000)) ||
      (prType == 'generalProcurement2' &&
        (estimatedBudgetAmountHkd <= 1000000 || estimatedBudgetAmountHkd > 5000000)) ||
      (prType == 'generalProcurement3' && estimatedBudgetAmountHkd <= 5000000) ||
      (prType == 'frameworkProcurement1' && estimatedBudgetAmountHkd > 50000) ||
      (prType == 'frameworkProcurement2' &&
        (estimatedBudgetAmountHkd <= 50000 || estimatedBudgetAmountHkd > 500000)) ||
      (prType == 'frameworkProcurement3' &&
        (estimatedBudgetAmountHkd <= 500000 || estimatedBudgetAmountHkd > 1000000)) ||
      (prType == 'frameworkProcurement4' &&
        (estimatedBudgetAmountHkd <= 1000000 || estimatedBudgetAmountHkd > 5000000)) ||
      (prType == 'frameworkProcurement5' && estimatedBudgetAmountHkd <= 5000000)
    ) {
      CusNotification.warning({
        message: intl.get('HKPC.commom.view.title.validateamount').d('请输入正确的金额'),
      });
    } else {
      const { affairTitle } = this.state;
      console.log(queryString.parse(search.substring(1)), 'queryString.parse(search.substring(1))');
      const { contentObj } = this.state;
      //点击保存修改申请状态为草稿-如果prStatus为空代表创建单据阶段
      if (prStatus == '') {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            prStatus: 'PENDING_REFER',
          },
        });
      }
      this.ChildRef.props.form.validateFieldsAndScroll((err, values) => {
        if (err) {
          // console.log(values, 'values');
          // CusNotification.warning({
          //   message: intl
          //     .get('HKPC.commom.view.title.submitprompt')
          //     .d('有必填字段未填写'),
          // });
          return false;
        }
      });
      if(purchaseApplicationLineSourceList.length > 0) {
        this.searchForm.form?.validateFields((err, values) => {
          if (!err) {
            this.setState({
              isClickSave: true,
            });
            const filterFormValue = this.filterForm?.props.form?.getFieldsValue();
            const searchFormValue = this.searchForm?.form.getFieldsValue();
            const attachmentSourceList = fileSource.map((item) => {
              item.filePath = item.response;
              return {
                ...item,
                tenantId: getCurrentOrganizationId(),
                refHeadId: keyId,
              };
            });
            const purchaseApplicationLineList = purchaseApplicationLineSource?.map((item) => {
              return {
                ...item,
                tenantId: getCurrentOrganizationId(),
                budgetPricesHkd:
                  Number(item.qty) * Number((item.matPriceHkd.toString() + '').replace(/,/g, '')),
                refHeadId: keyId,
              };
            });
            dispatch({
              type: 'purchaseApplicationModel/addPurchaseApplicationList',
              payload: {
                id: keyId,
                tenantId: getCurrentOrganizationId(),
                ...filterFormValue,
                ...searchFormValue,
                applyUserId: demanderId.toString(), //需求人ID
                applyUserDepId: demanderDepartmentId, //需求人部门ID
                applyUserDepName: demanderDepartment, // 需求人部门名字
                applyingDepartmentId: applyingDepartmentId, //申请人部门ID
                prAttachmentDTOList: [{attachmentUuid: UUid}],
                prLineDTOList: purchaseApplicationLineList,
                prStatus: prStatus == '' ? 'PENDING_REFER' : prStatus,
                prType: idpValueMap['HKPC.PRTYPE']?.find((item) => item?.value == prType)?.value,
                prNumber: contentObj.prNumber,
                projectType,
                projectNumber,
                unitCode,
                // estimatedBudgetAmount: searchFormValue.estimatedBudgetAmount
                //   .toString()
                //   .replace(/,/g, ''),
                estimatedBudgetAmountHkd: searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, ''),
                applicantUserId: applierId, //申请人ID
                applicantUserName: applier,
                projectBudType: this.state.projectBudType
              },
            }).then((res) => {
              if (res) {
                this.setState({
                  prNumber: res.prNumber,
                  id: res.id,
                });
                dispatch({
                  type: 'purchaseApplicationModel/commentUpdateState',
                  payload: {
                    keyId: res.id,
                    prNumber: res.prNumber,
                    prStatus: res.prStatus, // 保存之后申请状态为草稿状态
                  },
                });
                CusNotification.success({
                  message: intl.get(`${promptCode}.view.message.savesuccessfully`).d('保存成功'),
                });
                if (typeof callback === 'function') {
                  callback({
                    ...res,
                    affairTitle:
                      this.state.affairTitle == ''
                        ? intl
                            .get('HKPC.commom.view.title.bpmPCApproval', {
                              prNumber: res.prNumber,
                              prName: res.prName,
                              amount: numberRender(res.estimatedBudgetAmountHkd, 4),
                            })
                            .d(`${res.prNumber}：${res.prName}（HKD:${numberRender(res.estimatedBudgetAmountHkd, 4)}）`)
                        : affairTitle,
                  });
                }
              }
              if (prStatus == '' || prStatus == 'PENDING_REFER') {
                this.handleSearch(res.id);
              }
            });
          } else {
            CusNotification.warning({
              message: intl.get('HKPC.commom.view.title.submitprompt').d('有必填字段未填写'),
            });
          }
        });
      } else {
        CusNotification.warning({
          message: intl.get('HKPC.commom.view.message.executeprocurement').d('请完善物料信息'),
        });
      }
    }
  }

  @Bind
  updateAttachmentData(list) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        purchaseApplicationLineSource: list,
      },
    });
  }

  // 新建采购申请行信息
  @Bind()
  handleAddPurchaseApplicationLine() {
    const { purchaseApplicationModel } = this.props;
    const {
      purchaseApplicationLineSource = [],
      projectType,
      purchasingCategory,
      budgetTypeUpdate,
      budgetItemNumberUpdate,
      businessActivitiesCodeUpdate,
      businessActivitiesNameUpdate,
      costCenterCodeUpdate,
      costCenterNMUpdate,
    } = purchaseApplicationModel;
    const list = [
      ...purchaseApplicationLineSource,
      {
        rowKey: uuid(),
        _status: 'create',
        matName: '',
        matType: '',
        matPriceHkd: '',
        unit: '',
        qty: '',
        budgetPrices: '',
        reqDate: null,
        deliverAddressBakup: '',
        deliveryAddressRemarks: '',
        isDefault: '',
        purchasingCategory: purchasingCategory ? purchasingCategory : '', // 采购类别
        // 以下信息是从第一行数据带过来的
        addressCode: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].addressCode : null, // 送货地址code
        deliverContact: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverContact : null, // 送货地址联系人
        deliverAddress: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverAddress : null, // 送货地址
        deliveryPhoneNumber: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliveryPhoneNumber : null, // 送货联系电话
        deliverContactCode: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverContactCode : '', //联系人编码
        deliverDate: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverDate : null, // 送货日期
        budgetType: projectType == '2' ? 'INVENTORY' : budgetTypeUpdate,
        budgetItemNumber: budgetItemNumberUpdate,
        businessActivitiesCode: businessActivitiesCodeUpdate,
        businessActivitiesName: businessActivitiesNameUpdate,
        costCenterCode: costCenterCodeUpdate,
        costCenterNM: costCenterNMUpdate,
      },
    ];
    this.updateAttachmentData(list);
  }

  // 导入申请行
  @Bind()
  payUpload = (payFileList = []) => {
    const { purchaseApplicationModel, dispatch } = this.props;
    const { prStatusState } = this.state;
    const { purchaseApplicationLineSource } = purchaseApplicationModel;
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-materials/importMatExcelCheck`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if(res) {
        const response = JSON.parse(res);
        let budgetPricesHkdTotal = 0;
        response?.data?.map((item) => {
          console.log(item, 'item: ');
          budgetPricesHkdTotal += multiply(Number(item.qty) * Number(item?.matPriceHkd));
        });
        const data = response?.data?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'create',
        }));
        const newDataSource = [
          ...purchaseApplicationLineSource,
          ...data,
        ]
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            purchaseApplicationLineSource: newDataSource,
            estimatedBudgetAmountHkd: budgetPricesHkdTotal,
          }
        })
        this.setState({
          importUploading: false,
          productVisible: false,
        }, () => {
          if(response.msg){
            CusNotification.error({
              message: response.msg,
            });
          }
        });
      }
    })
  }

  // 接收子组件传递过来的文件信息
  @Bind()
  getFatherFileList(fileList) {
    console.log(fileList, 'fileList');
    const { dispatch, purchaseApplicationModel } = this.props;
    const { fileSourceList } = purchaseApplicationModel;
    const newFileList = fileList.map((file) => {
      return {
        attachmentUuid: uuid(),
        ...file,
      };
    });
    const newFileSourceList = fileSourceList.map((file) => {
      return {
        attachmentUuid: uuid(),
        ...file,
      };
    });
    if (fileSourceList != []) {
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          fileSource: [...newFileSourceList, ...newFileList],
        },
      });
    } else {
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          fileSource: newFileList,
        },
      });
    }
  }

  // 接收子组件传递过来的的预估总金额HKD
  @Bind()
  getPurchaseApplicationLine(budgetPricesHkdTotal) {
    // console.log('拿到了吗',budgetPricesHkdTotal);
    this.setState({
      contentObj: {
        estimatedBudgetAmountHkd: budgetPricesHkdTotal,
      },
      totalAmountHKD: budgetPricesHkdTotal,
    });
  }

  // 接收子组件的传递的项目编号
  @Bind()
  getProjectNumber(
    projectItem,
    projectNumberValue,
    projectManagerCode,
    projectManagerName,
    name,
    projectManagerPhone,
    unitName,
    projectBudType
  ) {
    const { dispatch, purchaseApplicationModel } = this.props;
    this.setState({
      projectNumber: projectNumberValue,
      projectManagerCode,
      projectManagerName,
      projectBudType
    });
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        projectName: name,
        projectNumber: projectNumberValue,
        demander: projectManagerName,
        demanderId: projectItem.userId, // 员工id
        demanderDepartmentEn: unitName,
        demanderDepartment: projectItem.unitCnName, // 部门名称
        demanderDepartmentId: projectItem.unitId, // 部门id
        demanderPhone: projectManagerPhone, // 需求人电话
        projectManagerCode,
        employeeNum: projectManagerCode,
      },
    });
    dispatch({
      type: 'purchaseApplicationModel/getProjectId',
      payload: {
        projectCode: projectNumberValue,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
          },
        });
      }
    });
  }

  @Bind()
  getApplyUserId(applyUserId) {
    this.setState({
      applyUserId: applyUserId,
    });
  }

  @Bind()
  getApplyUserDepId(applyUserDepId) {
    this.setState({
      applyUserDepId: applyUserDepId,
    });
  }

  @Bind()
  getApplyingDepartmentId(applyingDepartmentId) {
    this.setState({
      applyingDepartmentId,
    });
  }

  @Bind()
  getApplicantUserId(applicantUserId) {
    this.setState({
      applicantUserId: applicantUserId,
    });
  }

  @Bind()
  handleTabChange(activeKey = '') {
    const { purchaseApplicationModel } = this.props;
    const { projectNumber } = purchaseApplicationModel;
    console.log(activeKey, 'activeKey');
    if (projectNumber) {
      this.setState({
        tabKey: activeKey,
      });
      this.searchProjectInfo(projectNumber);
    } else {
      CusNotification.warning({
        message: intl.get('HKPC.commom.view.title.selectprojectname').d('请先选择项目名称'),
      });
    }
  }

  // 下载采购申请行模板
  @Bind()
  handleDownloadTemplateClick() {
    const { templateCode } = this.state;
    const api = `/bidding/v1/${organizationId}/import/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] },);
  }

  render() {
    const {
      dispatch,
      idpValueMap = {},
      fetchLoading = false,
      form,
      language,
      purchaseApplicationModel,
      saveLoading,
      location: { search },
      searchProjectInfoLoading = false,
      userDepatLoading = false,
    } = this.props;
    const { state } = queryString.parse(search.substring(1));
    const {
      tabKey,
      activeKey,
      tabActiveKey,
      SearchTabActiveKey,
      attachmentSource,
      totalAmountHKD,
      isClickSave,
      contentObj,
      unitName,
      // related,
      rate,
      projectManagerCode,
      projectManagerName,
      applierDeptName, // 需求人部门
      applier, // 需求人
      prStatusState, //单据状态
      fileSource,
      fileInfoList,
      productVisible,
      importUploading,
      stateAttachmentUUID,
    } = this.state;
    const {
      purchaseApplicationLineSource,
      allDetailsInfo,
      prStatus,
      related,
      prType,
      projectType,
      projectId,
      projectName,
    } = purchaseApplicationModel;
    const {
      applyUserCode, // 需求人编号
    } = allDetailsInfo;
    console.log('applyUserCode', applyUserCode);
    
    const filterSearchFormProps = {
      idpValueMap,
      form,
      onRef: (ref) => {
        this.filterForm = ref;
      },
      projectName: contentObj?.projectName,
      contentObj,
      allDetailsInfo,
      handleSearchApplier: this.handleSearchApplier, //查询需求人
      handleSearchApplyDept: this.handleSearchApplyDept, //查询需求人部门
      dispatch,
      related,
      purchaseApplicationModel,
      location,
      prStatusState,
      searchProjectInfoLoading,
      userDepatLoading,
    };
    const searchFormProps = {
      location,
      prStatus,
      related,
      dispatch,
      purchaseApplicationModel,
      idpValueMap,
      language,
      form,
      onRef: (ref) => {
        this.searchForm = ref.props;
      },
      contentObj,
      allDetailsInfo,
      unitName, //首次计入携带的申请人部门信息
      attachmentSource,
      totalAmountHKD,
      isClickSave,
      rate,
      projectManagerCode,
      projectManagerName,
      applierDeptName, // 需求人部门
      applier, // 需求人
      applyUserCode, // 需求人编号
      prName: contentObj.prName, //采购申请名称
      prNumber: contentObj.prNumber, //采购申请编号
      applyingDate: contentObj.applyingDate, // 申请日期
      applyUserName: contentObj.applyUserName, // 需求人
      applyUserPhone: contentObj.applyUserPhone, // 需求人电话
      applyUserDepName: contentObj.applyUserDepName, //需求人部门
      // estimatedBudgetAmount: contentObj.estimatedBudgetAmount, //预估总金额原币
      // currency: contentObj.currency, //币种
      estimatedBudgetAmountHkd: contentObj.estimatedBudgetAmountHkd, //预估总金额HKD
      // prRate: contentObj.prRate, // 申请汇率
      prType: prType, //采购申请类型
      prReason: contentObj.prReason, //采购原因
      prReq: contentObj.prReq, //采购需求
      prBakup: contentObj.prBakup, //需求部门给采购的备注
      supBakup: contentObj.supBakup, //需求部门给供应商的备注
      prSuggestion: contentObj.prSuggestion, //建议采购计划
      prApplyAttachmentList: contentObj.prApplyAttachmentList, //附件
      techSpecs: contentObj?.techSpecs, // 技术规范
      deliveryReqs: contentObj?.deliveryReqs, // 交付要求
      performanceHistory: contentObj?.performanceHistory, // 历史执行情况
      supplierCriteria: contentObj?.supplierCriteria, // 潜在供应商报名资格条件建议
      techScoCriteria: contentObj?.techScoCriteria, // 技术评分细则建议
      attachUuid: contentObj?.attachUuid, // 附件uuid
      procurementType: contentObj?.procurementType, // 采购方式code
      erpPrType: contentObj?.erpPrType, // erp需要的采购申请类型
      budgetType: contentObj?.budgetType, // INVENTORY获取的预算类型
      purchasingCategory: contentObj?.purchasingCategory, // INVENTORY获取的采购类别
      handleSearchRate: this.handleSearchRate, // 查询申请汇率
      prStatusState,
      fileSource,
      fileDataSource: fileInfoList,
      stateAttachmentUUID,
    };
    const tableProps = {
      idpValueMap,
      ...this.props,
      onDetele: this.handleDetele,
      onChange: this.handleSearchMaterial,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      purchaseApplicationLineSource,
      form,
      prApplyMaterialList: contentObj.prApplyMaterialList,
      contentObj,
      dispatch,
      purchaseApplicationModel,
      location: { search },
      state,
      prStatusState,
    };

    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    }
    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (prStatusState === 'PENDING_REFER' || prStatusState === '') {
        return intl.get('HKPC.commom.view.title.purchaseRequirements').d('起草采购申请');
      } else {
        if(activityCode === 'SCM01') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredConfirm').d('确认采购申请');
        }
        if(activityCode === 'XQRJL05') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredVerify').d('核對采購申請');
        }
        if(['XQRBZG06', 'XQBFGLD07'].includes(activityCode)) {
          return intl.get('HKPC.commom.view.title.purchaseRequiredApproval').d('審批采購申請');
        }
        if(activityCode === 'SCM02') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredAllocate').d('分派采購申請');
        }
        if(activityCode === 'SCM03') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredArrange').d('分派采購申請');
        }
      }
    })();

    console.log('messageTitle', messageTitle);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!['DONE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45' }}
        />}
        <PageWrapper loading={fetchLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            {['0', '1'].includes(projectType) && <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch
                getProjectNumber={this.getProjectNumber.bind(this)}
                {...filterSearchFormProps}
              />
            </Panel>}
          </Collapse>
          <div
            className={classnames(
              styles['out-div-tab'],
              styles[tabKey === 'createProject' ? 'createProject' : '']
            )}
          >
            <CusTabs
              defaultActiveKey={'scoreDetail'}
              onChange={this.handleTabChange}
              activeKey={tabKey}
              items={
                projectType == '0'
                  ? [
                    projectName && {
                      label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                      key: 'createProject',
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
                      label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                      key: 'procurement',
                      children: (
                        <CusSearchTabs
                          activeKey={SearchTabActiveKey}
                          items={[
                            {
                              label: intl
                                .get(`${promptCode}.view.title.ProcurementRequisition`)
                                .d('采购申请'),
                              key: '1',
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
                                          .get(`HKPC.commom.view.title.ApplicationInformation`)
                                          .d('申请信息')}
                                        arrowActive={activeKey.includes('applicationTable')}
                                      />
                                    }
                                    key="applicationTable"
                                  >
                                    <SearchApplication
                                      getApplyUserId={this.getApplyUserId.bind(this)}
                                      getApplyUserDepId={this.getApplyUserDepId.bind(this)}
                                      getApplicantUserId={this.getApplicantUserId.bind(this)}
                                      getFatherFileList={this.getFatherFileList.bind(this)}
                                      {...searchFormProps}
                                    />
                                  </Panel>
                                  <Panel
                                    showArrow={false}
                                    header={
                                      <PanelHeader
                                        title={intl
                                          .get(
                                            `HKPC.commom.view.title.ProcurementRequisitionLineInformation`
                                          )
                                          .d('采购申请行信息')}
                                        arrowActive={activeKey.includes('purchaseTable')}
                                        buttons={
                                          prStatusState != 'PENDING_REFER' &&
                                            prStatusState != '' ? (
                                            <></>
                                          ) : (
                                            <>
                                              <CusButton
                                                mini
                                                onClick={this.handleDownloadTemplateClick}
                                              >
                                                {intl.get('hzero.common.view.button.download').d('下载')}
                                              </CusButton>
                                              <CusButton
                                                mini
                                                onClick={() => {
                                                  this.setState({
                                                    productVisible: true,
                                                  })
                                                }}
                                              >
                                                {intl.get('hzero.common.view.button.Import').d('导入')}
                                              </CusButton>
                                              <CusButton onClick={this.handleDetele} mini>
                                                {intl
                                                  .get('hzero.common.view.button.delete')
                                                  .d('删除')}
                                              </CusButton>
                                              <CusButton
                                                mini
                                                type="primary"
                                                onClick={this.handleAddPurchaseApplicationLine}
                                              >
                                                {intl
                                                  .get('hzero.common.view.button.add')
                                                  .d('新建')}
                                              </CusButton>
                                            </>
                                          )
                                        }
                                      />
                                    }
                                    key="purchaseTable"
                                  >
                                    <DataTable
                                      onRef={(node) => (this.ChildRef = node)}
                                      getPurchaseApplicationLine={this.getPurchaseApplicationLine.bind(
                                        this
                                      )}
                                      {...tableProps}
                                    />
                                  </Panel>
                                </Collapse>
                              ),
                            },
                          ]}
                          onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                        />
                      ),
                    },
                  ]
                  : [
                    {
                      label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                      key: 'procurement',
                      children: (
                        <CusSearchTabs
                          activeKey={SearchTabActiveKey}
                          items={[
                            {
                              label: intl
                                .get(`${promptCode}.view.title.ProcurementRequisition`)
                                .d('采购申请'),
                              key: '1',
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
                                          .get(`HKPC.commom.view.title.ApplicationInformation`)
                                          .d('申请信息')}
                                        arrowActive={activeKey.includes('applicationTable')}
                                      />
                                    }
                                    key="applicationTable"
                                  >
                                    <SearchApplication
                                      getApplyUserId={this.getApplyUserId.bind(this)}
                                      getApplyUserDepId={this.getApplyUserDepId.bind(this)}
                                      getApplicantUserId={this.getApplicantUserId.bind(this)}
                                      getFatherFileList={this.getFatherFileList.bind(this)}
                                      {...searchFormProps}
                                    />
                                  </Panel>
                                  <Panel
                                    showArrow={false}
                                    header={
                                      <PanelHeader
                                        title={intl
                                          .get(
                                            `HKPC.commom.view.title.ProcurementRequisitionLineInformation`
                                          )
                                          .d('采购申请行信息')}
                                        arrowActive={activeKey.includes('purchaseTable')}
                                        buttons={
                                          state === 'PENDING' ||
                                            state === 'DONE' ||
                                            state == 'SENT' ? (
                                            <></>
                                          ) : (
                                            <>
                                              <CusButton
                                                mini
                                                onClick={this.handleDownloadTemplateClick}
                                              >
                                                {intl.get('hzero.common.view.button.download').d('下载')}
                                              </CusButton>
                                              <CusButton
                                                mini
                                                onClick={() => {
                                                  this.setState({
                                                    productVisible: true,
                                                  })
                                                }}
                                              >
                                                {intl.get('hzero.common.view.button.Import').d('导入')}
                                              </CusButton>
                                              <CusButton onClick={this.handleDetele} mini>
                                                {intl
                                                  .get('hzero.common.view.button.delete')
                                                  .d('删除')}
                                              </CusButton>
                                              <CusButton
                                                mini
                                                type="primary"
                                                onClick={this.handleAddPurchaseApplicationLine}
                                              >
                                                {intl
                                                  .get('hzero.common.view.button.add')
                                                  .d('新建')}
                                              </CusButton>
                                            </>
                                          )
                                        }
                                      />
                                    }
                                    key="purchaseTable"
                                  >
                                    <DataTable
                                      onRef={(node) => (this.ChildRef = node)}
                                      getPurchaseApplicationLine={this.getPurchaseApplicationLine.bind(
                                        this
                                      )}
                                      {...tableProps}
                                    />
                                  </Panel>
                                </Collapse>
                              ),
                            },
                          ]}
                          onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                        />
                      ),
                    },
                  ]
              }
            />
          </div>
          <ImportModal
            visible={productVisible}
            onCancel={() => {
              this.setState({
                productVisible: false,
              })
            }}
            importUploading={importUploading}
            payUpload={this.payUpload}
          />
        </PageWrapper>
      </div>
    );
  }
}
