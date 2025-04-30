import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import SearchApplication from './SearchApplication';
import DataTable from './DataTable';
import FilterSearch from './FilterSearch';
import styles from './index.less';
import classnames from 'classnames';
import uuid from 'uuid/v4';
import queryString from 'querystring';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { ERP_HOST } = process.env;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  saveLoading: loading.effects['purchaseApplicationModel/addPurchaseApplicationList'],
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
      prStatusState: ''
    };
    this.cusApprovalBtns = React.createRef();
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
    }).then(res => {
      if (res) {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
            projectNumber: projectCode,
            projectName: res.projectName
          },
        });
      }
    })
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
        flag
      },
    });
    if (id == undefined && formRecordId == 'null') {
      this.handleClearData();
      //查询首次进来的申请人部门名称
      this.handleSearchUnitName();
      // 查询首次进入的申请汇率
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
    } = this.props;
    const { employeeNum } = purchaseApplicationModel;
    const { id, formRecordId } = queryString.parse(search.substring(1));
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      console.log(e.data.submitType, 'e.data.submitType');
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'TEMPORARY', 'SEND'].includes(e.data.submitType)) {
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
                e.data.url,
              );
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
                        prname: params.prNumber + ':' + params.prName,
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
          this.save((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params.id, //表单记录id（Long）
                    affairTitle: params.affairTitle, //待办流程名称
                    //下面内容为表单数据
                    ...params,
                    loginName: params.applyUserCode,
                    jine: params.estimatedBudgetAmountHkd,
                    managerId: params.managerId,
                  },
                },
                e.data.url,
              );
            }
          });
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
      if (related == '1' || flag == '1') {
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
        //流程穿越，查询项目信息
        this.searchProjectInfo(projectCode)
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
    }).then(res2 => {
      if (res2) {
        console.log(res2, 'res222222');
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
                  };
                }),
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
                currencyCode: res?.currency,
                prRate: res?.prRate,
                demanderId: res?.applyUserId,//需求人ID
                demanderDepartmentId: res?.applyUserDepId,//需求人部门ID
                applyingDepartmentId: res?.applyingDepartmentId, //申请人部门ID
                demanderDepartment: res?.applyUserDepName,//需求人部门中文
                demanderDepartmentEn: res?.applyUserDepEnName,//需求人部门英文
                applyingDepartmentEnName: res?.applyingDepartmentEnName,//申请人部门英文
                prReason: res?.prReason, //采购原因
                prReq: res?.prReq, //采购需求
                prBakup: res?.prBakup, //需求部门备注给(采购部)
                supBakup: res?.supBakup, //需求部门备注给(供应商)
                prSuggestion: res?.prSuggestion, //建议采购计划
              },
            })
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
                        prname: prNumber + ':' + prName,
                      })
                      .d(`采购申请分发-关于${prNumber}:${prName}简易询价实施`);
                    break;
                  case 'SCM02':
                    affairTitle = intl
                      .get('HKPC.commom.view.title.bpmPCMangerAssign', {
                        prname: prNumber + ':' + prName,
                      })
                      .d(`采购申请指派-关于${prNumber}:${prName}简易询价实施`);
                    break;
                  default:
                    affairTitle = intl
                      .get('HKPC.commom.view.title.bpmPCApproval', {
                        prname: res.prNumber + ':' + res.prName,
                      })
                      .d(`采购申请审批-关于${res.prNumber}:${res.prName}采购申请审批`);
                }
              }
              this.setState({
                affairTitle,
              });
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
      applyingDepartmentId,
      applier,
      applierId,
      keyId,
      prType,
      projectType,
      unitCode,
      prStatus,
      projectNumber,
    } = purchaseApplicationModel;
    const searchFormValue = this.searchForm.form.getFieldsValue();
    console.log(searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, ''), 'asdfgh');
    const estimatedBudgetAmountHkd = searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, '');
    if (prType == 'simpleInquiry1' && estimatedBudgetAmountHkd > 500000) {
      CusNotification.warning({
        message: intl
          .get('HKPC.commom.view.message.amountprompt')
          .d('请控制预估金额（HKD）不多于50W'),
      });
    } else if (
      (prType == 'generalProcurement1' && (estimatedBudgetAmountHkd <= 500000 || estimatedBudgetAmountHkd > 1000000)) ||
      (prType == 'generalProcurement2' && (estimatedBudgetAmountHkd <= 1000000 || estimatedBudgetAmountHkd > 5000000)) ||
      (prType == 'generalProcurement3' && (estimatedBudgetAmountHkd <= 5000000)) ||
      (prType == 'frameworkProcurement1' && (estimatedBudgetAmountHkd > 50000)) ||
      (prType == 'frameworkProcurement2' && (estimatedBudgetAmountHkd <= 50000 || estimatedBudgetAmountHkd > 500000)) ||
      (prType == 'frameworkProcurement3' && (estimatedBudgetAmountHkd <= 500000 || estimatedBudgetAmountHkd > 1000000)) ||
      (prType == 'frameworkProcurement4' && (estimatedBudgetAmountHkd <= 1000000 || estimatedBudgetAmountHkd > 5000000)) ||
      (prType == 'frameworkProcurement5' && (estimatedBudgetAmountHkd <= 5000000))
    ) {
      CusNotification.warning({
        message: intl
          .get('HKPC.commom.view.title.validateamount')
          .d('请输入正确的金额'),
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
          console.log(values, 'values');
          return false;
        }
      });
      this.searchForm.form?.validateFields((err, values) => {
        if (!err) {
          this.setState({
            isClickSave: true,
          });
          const filterFormValue = this.filterForm.props.form?.getFieldsValue();
          const searchFormValue = this.searchForm.form.getFieldsValue();
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
              applyingDepartmentId: applyingDepartmentId, //申请人部门ID
              prAttachmentDTOList: attachmentSourceList,
              prLineDTOList: purchaseApplicationLineList,
              prStatus: prStatus == '' ? 'PENDING_REFER' : prStatus,
              prType: idpValueMap['HKPC.PRTYPE']?.find((item) => item?.value == prType)?.value,
              prNumber: contentObj.prNumber,
              projectType,
              projectNumber,
              unitCode,
              estimatedBudgetAmount: searchFormValue.estimatedBudgetAmount
                .toString()
                .replace(/,/g, ''),
              estimatedBudgetAmountHkd: searchFormValue.estimatedBudgetAmountHkd.replace(/,/g, ''),
              applicantUserId: applierId, //申请人ID
              applicantUserName: applier,
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
                            prname: res.prNumber + ':' + res.prName,
                          })
                          .d(`采购申请审批-关于${res.prNumber}:${res.prName}采购申请审批`)
                      : affairTitle,
                });
              }
            }
            if (prStatus == '' || prStatus == 'PENDING_REFER') {
              this.handleSearch(res.id);
            }
          });
        }
      });
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
    const { purchaseApplicationLineSource = [] } = purchaseApplicationModel;
    const list = [
      ...purchaseApplicationLineSource,
      {
        uuid: uuid(),
        _status: 'create',
        matName: '',
        matType: '',
        matPriceHkd: '',
        unit: '',
        qty: '',
        budgetType: '',
        budgetPrices: '',
        reqDate: null,
        deliverContact: '',
        deliverAddress: '',
        deliverAddressBakup: '',
        deliverDate: null,
        deliveryPhoneNumber: '',
        deliveryAddressRemarks: '',
        isDefault: '',
      },
    ];
    this.updateAttachmentData(list);
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
      }
    })
    const newFileSourceList = fileSourceList.map((file) => {
      return {
        attachmentUuid: uuid(),
        ...file,
      }
    })
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
  ) {
    const { dispatch, purchaseApplicationModel } = this.props;
    this.setState({
      projectNumber: projectNumberValue,
      projectManagerCode,
      projectManagerName,
    });
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        projectName: name,
        projectNumber: projectNumberValue,
        demander: projectManagerName,
        demanderId: projectItem.userId,
        demanderDepartmentEn: unitName,
        demanderDepartment: projectItem.unitCnName,
        demanderDepartmentId: projectItem.unitId,
        demanderPhone: projectManagerPhone,
        projectManagerCode,
        employeeNum: projectManagerCode,
      },
    });
    dispatch({
      type: 'purchaseApplicationModel/getProjectId',
      payload: {
        projectCode: projectNumberValue,
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
          },
        });
      }
    })
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
    const { purchaseApplicationModel } = this.props
    const { projectNumber } = purchaseApplicationModel
    console.log(activeKey, 'activeKey');
    this.setState({
      tabKey: activeKey,
    });
    this.searchProjectInfo(projectNumber)
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
      employeeNum, // 需求人编号
      prStatusState //单据状态
    } = this.state;
    const { purchaseApplicationLineSource, allDetailsInfo, prStatus, related, prType, projectType, projectId } =
      purchaseApplicationModel;
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
      prStatusState
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
      employeeNum, // 需求人编号
      prName: contentObj.prName, //采购申请名称
      prNumber: contentObj.prNumber, //采购申请编号
      applyingDate: contentObj.applyingDate, // 申请日期
      applyUserName: contentObj.applyUserName, // 需求人
      applyUserPhone: contentObj.applyUserPhone, // 需求人电话
      applyUserDepName: contentObj.applyUserDepName, //需求人部门
      estimatedBudgetAmount: contentObj.estimatedBudgetAmount, //预估总金额原币
      currency: contentObj.currency, //币种
      estimatedBudgetAmountHkd: contentObj.estimatedBudgetAmountHkd, //预估总金额HKD
      prRate: contentObj.prRate, // 申请汇率
      prType: prType, //采购申请类型
      prReason: contentObj.prReason, //采购原因
      prReq: contentObj.prReq, //采购需求
      prBakup: contentObj.prBakup, //需求部门给采购的备注
      supBakup: contentObj.supBakup, //需求部门给供应商的备注
      prSuggestion: contentObj.prSuggestion, //建议采购计划
      prApplyAttachmentList: contentObj.prApplyAttachmentList, //附件
      handleSearchRate: this.handleSearchRate, // 查询申请汇率
      prStatusState
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
      prStatusState
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key='form'
            >
              <FilterSearch
                getProjectNumber={this.getProjectNumber.bind(this)}
                {...filterSearchFormProps}
              />
            </Panel>
          </Collapse>
          <div className={classnames(styles['out-div-tab'], styles[tabKey === 'createProject' ? 'createProject' : ''])}>
            <CusTabs
              defaultActiveKey={'scoreDetail'}
              onChange={this.handleTabChange}
              items={projectType == '0' ? [
                contentObj?.projectName && {
                  label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                  key: 'createProject',
                  children:
                    <CusSearchTabs
                      activeKey={tabActiveKey}
                      items={[
                        {
                          label: '项目信息',
                          key: '0',
                          children:
                            <div style={{ height: '100%' }}>
                              <iframe style={{ width: '100%', height: '100%' }} src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`} width="100%" height="100vh !important" frameBorder="0" />
                            </div>
                        },
                      ]}
                      onChange={(val) => this.setState({ tabActiveKey: val })}
                    />,
                },
                {
                  label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                  key: 'procurement',
                  children:
                    <CusSearchTabs
                      activeKey={SearchTabActiveKey}
                      items={[
                        {
                          label: intl.get(`${promptCode}.view.title.ProcurementRequisition`).d('采购申请'),
                          key: '1',
                          children:
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
                                    title={intl.get(`HKPC.commom.view.title.ApplicationInformation`).d('申请信息')}
                                    arrowActive={activeKey.includes('applicationTable')}
                                  />
                                }
                                key='applicationTable'
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
                                      .get(`HKPC.commom.view.title.ProcurementRequisitionLineInformation`)
                                      .d('采购申请行信息')}
                                    arrowActive={activeKey.includes('purchaseTable')}
                                    buttons={
                                      prStatusState != 'PENDING_REFER' && prStatusState != '' ? (
                                        <></>
                                      ) : (
                                        <>
                                          <CusButton onClick={this.handleDetele} mini>
                                            {intl.get('hzero.common.view.button.delete').d('删除')}
                                          </CusButton>
                                          <CusButton
                                            mini
                                            type='primary'
                                            onClick={this.handleAddPurchaseApplicationLine}
                                          >
                                            {intl.get('hzero.common.view.button.add').d('新建')}
                                          </CusButton>
                                        </>
                                      )
                                    }
                                  />
                                }
                                key='purchaseTable'
                              >
                                <DataTable
                                  onRef={(node) => (this.ChildRef = node)}
                                  getPurchaseApplicationLine={this.getPurchaseApplicationLine.bind(this)}
                                  {...tableProps}
                                />
                              </Panel>
                            </Collapse>,
                        },
                      ]}
                      onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                    />,
                },
              ] : [{
                label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                key: 'procurement',
                children:
                  <CusSearchTabs
                    activeKey={SearchTabActiveKey}
                    items={[
                      {
                        label: intl.get(`${promptCode}.view.title.ProcurementRequisition`).d('采购申请'),
                        key: '1',
                        children:
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
                                  title={intl.get(`HKPC.commom.view.title.ApplicationInformation`).d('申请信息')}
                                  arrowActive={activeKey.includes('applicationTable')}
                                />
                              }
                              key='applicationTable'
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
                                    .get(`HKPC.commom.view.title.ProcurementRequisitionLineInformation`)
                                    .d('采购申请行信息')}
                                  arrowActive={activeKey.includes('purchaseTable')}
                                  buttons={
                                    state === 'PENDING' || state === 'DONE' || state == 'SENT' ? (
                                      <></>
                                    ) : (
                                      <>
                                        <CusButton onClick={this.handleDetele} mini>
                                          {intl.get('hzero.common.view.button.delete').d('删除')}
                                        </CusButton>
                                        <CusButton
                                          mini
                                          type='primary'
                                          onClick={this.handleAddPurchaseApplicationLine}
                                        >
                                          {intl.get('hzero.common.view.button.add').d('新建')}
                                        </CusButton>
                                      </>
                                    )
                                  }
                                />
                              }
                              key='purchaseTable'
                            >
                              <DataTable
                                onRef={(node) => (this.ChildRef = node)}
                                getPurchaseApplicationLine={this.getPurchaseApplicationLine.bind(this)}
                                {...tableProps}
                              />
                            </Panel>
                          </Collapse>,
                      },
                    ]}
                    onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                  />,
              }]}
            />
          </div>
        </PageWrapper>
      </div>
    );
  }
}
