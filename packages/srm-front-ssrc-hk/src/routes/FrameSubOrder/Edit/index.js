import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { getEditTableData } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import { numberRender } from 'utils/renderer';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';

import SearchApplication from './SearchApplication';
import DataTable from './DataTable';
import FilterSearch from './FilterSearch';
import SupplierDataTable from '@/routes/FrameSubOrder/Edit/SupplierDataTable';
import styles from './index.less';
import classnames from 'classnames';
import queryString from 'querystring';
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
const { activityCode } = queryString.parse(location?.search?.substr(1)) || {}; 

@formatterCollections({ code: [promptCode] })
@connect(({ frameSubOrderModel, loading }) => ({
  frameSubOrderModel,
  Loading: loading.effects['frameSubOrderModel/handleDetailInfomation'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.IS_UNIT_PRICE',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.BUDGETTYPE',
  'HKPC.PRTYPE',
  'CMHKHPFM.UOM',
  'HKPC.PROCUREMENTAGENT',
  'HKPC.PASUPPLIERTYPE',
  'HKPC.PURCHASINGCATEGORY',
  'HKPC.VENDOR_CATEGORY',
  'HKPC.IS_UNIT_PRICE',
])
@Form.create()
export default class purchaseInquiryQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'applicationTable', 'uploadTable', 'purchaseTable', 'supplier'],
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      related: new URLSearchParams(window.location.search).get('related'), // 是否关联立项 0为yes 1为no
      prType: new URLSearchParams(window.location.search).get('prType'), // 是否关联立项 0为yes 1为no
      SearchTabActiveKey: '1',
      tabKey: 'procurement',
      tabActiveKey: '0',
    };
  }

  componentDidMount() {
    // const formRecordId = new URLSearchParams(window.location.search).get('id');
    const {
      location: { search },
      dispatch,
    } = this.props;
    const { id, formRecordId } = queryString.parse(search.substring(1));
    console.log(id, 'id123');
    console.log(formRecordId, 'formRecordId123');
    // 查询数据
    if (id != undefined || formRecordId != 'null') {
      this.handleSearch(id);
    } else {
      // 查询首次进来的申请人部门名称
      this.handleSearchUnitName();
      // 查询首次进入的申请汇率
      // this.handleSearchRate();
    }
    // 监听致远
    this.listener();
  }

  // 致远流程
  @Bind()
  listener() {
    const id = new URLSearchParams(window.location.search).get('id');
    const formRecordId = new URLSearchParams(window.location.search).get('id');
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      console.log(e, 'e');
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 知会 会签
        if (
          ['SUBMIT', 'TEMPORARY', 'UNDO', 'BACK', 'NOTICE'].includes(
            e.data.submitType
          )
        ) {
          this.save((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params.id, //表单记录id（Long）
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.jine, 4),
                      })
                      .d(
                        `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                      ), //待办流程名称
                    // affairTitle: "简易询价采购申请",
                    //下面内容为表单数据
                    ...params,
                    loginName: params.applyUserCode,
                    managerId: params.managerId,
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['SEND'].includes(e.data.submitType)) {
          this.save((params) => {
            if (params) {
              // 首次提交的时候触发金额检验
              const { dispatch } = this.props;
              // 首次提交的时候触发框架协议校验
              dispatch({
                type: 'frameSubOrderModel/getSinglePriceValidate',
                payload: {
                  frameworkCode: params.associatedAgreement, // 框架协议编号
                  amount: Number(params.estimatedBudgetAmountHkd), // 预估总金额HKD
                  amountControl: params.amountControl, // 是否金额控制
                  priceControl: params.unitPriceCon, // 是否单价控制
                },
              }).then((res) => {
                if (res) {
                  if (res.data) {
                    top?.postMessage(
                      {
                        success: true, //表单数据验证成功或不需要验证时传true，否则传false
                        submitType: e.data.submitType, //将此字段值回传
                        messageType: 'GET_FORM_DATA', //获取表单数据消息
                        formData: {
                          formRecordId: params.id, //表单记录id（Long）
                          affairTitle: intl
                            .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                              prNumber: params.prNumber,
                              prName: params.prName,
                              amount: numberRender(params.jine, 4)
                            })
                            .d(`采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`), //待办流程名称
                          // affairTitle: "简易询价采购申请",
                          //下面内容为表单数据
                          ...params,
                          loginName: params.applyUserCode,
                          managerId: params.managerId,
                        },
                      },
                      e.data.url
                    );
                  } else {
                    CusNotification.error({
                      message: intl
                        .get('HKPC.commom.view.title.budgetinsufficient')
                        .d('预算金额不足，请重新检查'),
                    });
                  }
                }
              });
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

  // 流程穿越-查询项目信息
  @Bind()
  searchProjectInfo(projectCode) {
    const { dispatch } = this.props;
    dispatch({
      type: 'frameSubOrderModel/getProjectId',
      payload: {
        projectCode,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'frameSubOrderModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
            projectNumber: projectCode,
            projectName: res.projectName,
          },
        });
      }
    });
  }

  /**
   * @description 查询采购申请详情数据
   */
  @Bind()
  handleSearch(id) {
    // const { dispatch } = this.props;
    // const formRecordId = new URLSearchParams(window.location.search).get('id');
    const {
      location: { search },
      dispatch,
    } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    console.log(id, 'id456');
    console.log(formRecordId, 'formRecordId456');
    dispatch({
      type: 'frameSubOrderModel/handleDetailInfomation',
      payload: {
        id: id || formRecordId,
      },
    }).then((res) => {
      if (res) {
        // 申请行信息
        const prApplySonMaterialList = res?.prApplySonMaterialList?.map((item) => {
          return {
            ...item,
            _status: 'update',
            lineId: uuid(),
          };
        });
        // 中标供应商
        const prWinningSupplier = [{ ...res?.prWinningSupplier, _status: 'update', rowId: uuid() }];
        dispatch({
          type: 'frameSubOrderModel/commentUpdateState',
          payload: {
            infomation: res,
            projectNumber: res.projectNumber,
            fileSource: res?.prApplyAttachmentList || [],
            purchaseApplicationLineSource: prApplySonMaterialList || [],
            supplierlistSource: prWinningSupplier || [],
            budgetItemNumberUpdate: res.prApplySonMaterialList?.[0]?.budgetItemNumber, // 预算项目编码
            businessActivitiesUpdate: res.prApplySonMaterialList?.[0]?.businessActivities, // 业务活动编码
            businessActivitiesNameUpdate: res.prApplySonMaterialList?.[0]?.businessActivitiesName, // 业务活动名称
            costCenterUpdate: res.prApplySonMaterialList?.[0]?.costcenter, // 成本中心编码
            costCenterNameUpdate: res.prApplySonMaterialList?.[0]?.costcenterName, // 成本中心名称
          },
        });
        this.setState({
          related: res.projectType,
        });
        if(res?.attachUuid) {
          // 用uuid查询附件
          this.handleFileInfo(res?.attachUuid);
        }
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

  //新建查询申请人部门名称
  @Bind()
  handleSearchUnitName() {
    const userInfo = getCurrentUser();
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation } = frameSubOrderModel;
    dispatch({
      type: 'frameSubOrderModel/getUserUnit',
      payload: { tenantId: userInfo.tenantId, lang: userInfo.language, userId: userInfo.id },
    }).then((res) => {
      this.searchForm?.form?.setFieldsValue({
        unitCode: res?.content[0]?.unitCode, // 部门编号
        applicantUserName: res?.content[0]?.realName, // 申请人
        applyingDepartmentName: res?.content[0]?.unitName, // 申请人部门
        applierId: res?.content[0]?.userId,
        applyingDepartmentId: res?.content[0]?.unitId,
      });
      (infomation.unitCode = res?.content[0]?.unitCode), // 部门编号
        (infomation.applicantUserName = res?.content[0]?.realName);
      infomation.applyingDepartmentName = res?.content[0]?.unitName;
      infomation.applierId = res?.content[0]?.userId;
      infomation.applyingDepartmentId = res?.content[0]?.unitId;
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          infomation: infomation,
        },
      });
    });
  }

  // 新建查询申请汇率
  @Bind()
  handleSearchRate(currency) {
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation, supplierlistSource } = frameSubOrderModel;
    dispatch({
      type: 'frameSubOrderModel/getPurchaseApplicationRate',
      payload: {
        currencyCode: currency ? currency : 'HKD',
        rateDate: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then((res) => {
      this.searchForm?.form?.setFieldsValue({
        prRate: res?.rate, // 汇率
        currency: currency ? currency : 'HKD', // 币种
      });
      infomation.prRate = res?.rate;
      infomation.currency = currency ? currency : 'HKD';
      if (infomation.estimatedBudgetAmountHkd && infomation.estimatedBudgetAmount) {
        infomation.estimatedBudgetAmount = numberRender(
          this.searchForm?.form?.getFieldsValue().estimatedBudgetAmountHkd /
            Number(this.searchForm?.form?.getFieldsValue().prRate),
          2
        );
        this.searchForm?.form?.setFieldsValue({
          estimatedBudgetAmount: numberRender(
            this.searchForm?.form?.getFieldsValue().estimatedBudgetAmountHkd /
              Number(this.searchForm?.form?.getFieldsValue().prRate),
            2
          ),
        });
      }
      if (supplierlistSource.length != 0) {
        supplierlistSource[0].quotationCurrency = currency ? currency : 'HKD';
        supplierlistSource[0].hkdRate = res?.rate;
      }
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          infomation: infomation,
          supplierlistSource: supplierlistSource,
        },
      });
    });
  }

  //查询需求人
  @Bind()
  handleSearchApplier(projectManagerCode, projectManagerPhone, projectCode) {
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation } = frameSubOrderModel;
    if (!projectManagerCode && !projectManagerPhone) {
      this.searchForm?.form?.setFieldsValue({
        applyUserName: null, // 需求人
        applyUserPhone: null,
        applyUserDepName: null, // 需求部门
      });
      infomation.applyUserName = null;
      infomation.applyUserId = null;
      infomation.applyUserPhone = null;
      infomation.applyUserDepName = null;
      infomation.applyUserDepId = null;
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          infomation: infomation,
        },
      });
    } else {
      dispatch({
        type: 'frameSubOrderModel/getApplier',
        payload: {
          tenantId: getCurrentUser().tenantId,
          employeeNum: projectManagerCode,
        },
      }).then((res) => {
        let employeeNum = res?.content[0].employeeNum;
        this.searchForm?.form?.setFieldsValue({
          projectCode: projectCode, // 项目ID
          applyUserName: res?.content[0].realName, // 需求人
          applyUserPhone: projectManagerPhone, // 需求人电话
          // associatedAgreement: '关联框架协议自测数据', // 关联框架协议
          // unitPriceControl: '是', // 是否单价限制
        });
        infomation.projectCode = projectCode; // 项目ID
        infomation.applyUserName = res?.content[0].realName;
        infomation.applyUserId = res?.content[0].userId;
        infomation.applyUserPhone = projectManagerPhone;
        // infomation.associatedAgreement = '关联框架协议自测数据';
        // infomation.unitPriceControl = '是';
        dispatch({
          type: 'frameSubOrderModel/commentUpdateState',
          payload: {
            infomation: infomation,
          },
        });
        this.handleSearchApplyDept(employeeNum);
      });
    }
  }

  //查询需求人部门
  @Bind()
  handleSearchApplyDept(employeeNum) {
    const { dispatch, language, frameSubOrderModel } = this.props;
    const { infomation } = frameSubOrderModel;
    dispatch({
      type: 'frameSubOrderModel/getApplyDept',
      payload: {
        organizationId: getCurrentOrganizationId(),
        employeeNum: employeeNum,
        tenantId: getCurrentUser().tenantId,
        lang: language,
      },
    }).then((res) => {
      this.searchForm?.form?.setFieldsValue({
        applyUserDepName: res?.content[0].unitName, // 需求部门
      });
      infomation.applyUserDepName = res?.content[0].unitName;
      infomation.applyUserDepId = res?.content[0].unitId;
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          infomation: infomation,
        },
      });
    });
  }

  // 选择关联框架协议后续操作
  // 接口获取中选供应商信息
  @Bind()
  handleFrameWork(frameworkCode, EBS, companyName, frameworkPrType, unitPriceControl) {
    // frameworkCode 框架协议编号
    // EBS 供应商编号
    // companyName 供应商名称
    // frameworkPrType 框架协议的采购类别
    // unitPriceControl 是否单价控制
    // 需要判断是否单价限制
    console.log('frameworkCode', frameworkCode);
    console.log('EBS', EBS);
    console.log('companyName', companyName);
    console.log('frameworkPrType', frameworkPrType);
    console.log('unitPriceControl', unitPriceControl);
    const { dispatch, frameSubOrderModel, idpValueMap } = this.props;
    const { infomation } = frameSubOrderModel;
    this.searchForm?.form?.setFieldsValue({
      frameworkCode: frameworkCode, // 框架协议编号
      ebs: EBS, // 供应商编号
      companyName: companyName, // 供应商名称
      frameworkPrType: frameworkPrType, // 框架协议的采购类别
      unitPriceControl: unitPriceControl != 'N' ? 'yes' : 'no',
    });
    infomation.frameworkCode = frameworkCode; // 项目ID
    infomation.ebs = EBS;
    infomation.companyName = companyName;
    infomation.frameworkPrType = frameworkPrType;
    infomation.unitPriceControl = unitPriceControl != 'N' ? 'yes' : 'no';
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        infomation: infomation,
      },
    });

    // 获取中选供应商信息
    // 通过接口传参供应商名称或者编号获取供应商信息
    // -----------------------------------------------------------------
    // 测试使用数据
    // const supplierlist = [
    //   {
    //     rowId: uuid(),
    //     _status: 'create',
    //     handledBy: null,
    //     procurementAgent: null,
    //     supplierType: '中标',
    //     supplierTypeCode: idpValueMap['HKPC.PASUPPLIERTYPE'].filter((item) => {
    //       return item.meaning === '中标';
    //     })[0]?.value,
    //     supplierName: companyName,
    //     contacts: '联系人',
    //     supplierPhone: '供应商联系电话',
    //     totalAmount: 0,
    //     quotationCurrency: infomation?.currency ? infomation?.currency : null,
    //     hkdRate: infomation?.prRate ? infomation?.prRate : null,
    //   },
    // ];
    // dispatch({
    //   type: 'frameSubOrderModel/commentUpdateState',
    //   payload: {
    //     supplierlistSource: supplierlist,
    //   },
    // });
    // -----------------------------------------------------------------
    dispatch({
      type: 'frameSubOrderModel/handleSupplierInfo',
      payload: {
        supplierNumber: EBS,
      },
    }).then((res) => {
      // 更新到中选供应商信息
      const supplierlist = [
        {
          rowId: uuid(),
          handledBy: null,
          procurementAgent: null,
          supplierType: '中标',
          supplierTypeCode: idpValueMap['HKPC.PASUPPLIERTYPE'].filter((item) => {
            return item.meaning === '中标';
          })[0]?.value,
          supplierName: companyName,
          // contacts: res.contactMan ? res.contactMan : null,
          contacts: res?.content[0]?.contactMan ? res?.content[0]?.contactMan : null,
          // supplierPhone: res.phoneNumber ? res.phoneNumber : null,
          supplierPhone: res?.content[0]?.phoneNumber ? res?.content[0]?.phoneNumber : null,
          totalAmount: 0.0,
          quotationCurrency: infomation?.currency ? infomation?.currency : null,
          hkdRate: infomation?.prRate ? infomation?.prRate : null,
        },
      ];
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          supplierlistSource: supplierlist,
        },
      });
    });
  }

  // 接口物料获取质保期，上次PO单号，上次采购价
  @Bind()
  handleNumber() {
    // dispatch({
    //   type: 'frameSubOrderModel/getMaterialInfomation',
    //   payload: {
    //     ebs: EBS,
    //   },
    // }).then((res) => {});
  }

  @Bind()
  handleTabChange(activeKey = '') {
    const { frameSubOrderModel } = this.props;
    const { projectNumber } = frameSubOrderModel;
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

  // 新建采购申请行信息
  @Bind()
  handleAddPurchaseApplicationLine() {
    const { frameSubOrderModel } = this.props;
    const {
      purchaseApplicationLineSource,
      infomation,
      budgetItemNumberUpdate,
      businessActivitiesUpdate,
      businessActivitiesNameUpdate,
      costCenterUpdate,
      costCenterNameUpdate,
    } = frameSubOrderModel;
    const list = [
      ...purchaseApplicationLineSource,
      {
        lineId: uuid(),
        _status: 'create',
        contentBudgetType: null, // 关联预算类型
        matCode: null, // 物料编码
        matName: null, // 物料名称
        matType: null, // 规格型号
        unit: null, // 单位
        qty: null, // 数量
        purchaseRequestAmountHkd: null, // 采购申请金额(HKD)
        unitPrice: null, // 单价
        costCenter: null, // 成本中心
        businessActivities: null, // 业务活动
        entryName: null, // 项目名称
        budgetNumber: null, // 预算编号
        budgetItemNumber: null, // 预算项目编号
        poNumber: null, // 上次PO单号
        warrantyPeriod: null, // 质保期
        winningSupplier: infomation.companyName ? infomation.companyName : null, //
        deliverAddressBakup: null, // 送货地址备注
        purchasePrice: null, // 上次采购价(HKD)
        // 以下信息是从第一行数据带过来的
        addressCode: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].addressCode : null, // 送货地址code
        deliverContact: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverContact : null, // 送货地址联系人
        deliverAddress: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverAddress : null, // 送货地址
        deliveryPhoneNumber: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliveryPhoneNumber : null, // 送货联系电话
        deliverContactCode: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverContactCode : '', //联系人编码
        deliverDate: purchaseApplicationLineSource.length > 0 ? purchaseApplicationLineSource[0].deliverDate : null, // 送货日期
        budgetItemNumber: budgetItemNumberUpdate,
        businessActivities: businessActivitiesUpdate,
        businessActivitiesName: businessActivitiesNameUpdate,
        costcenter: costCenterUpdate,
        costcenterName: costCenterNameUpdate,
      },
    ];
    this.updateAttachmentData(list);
  }

  // 更新采购申请行信息数据
  @Bind
  updateAttachmentData(list) {
    const { dispatch } = this.props;
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        purchaseApplicationLineSource: list,
      },
    });
  }

  /**
   * @description 删除采购申请行信息数据
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    this.ChildRef?.handleDelete();
  }

  // 计算金额同步申请信息及中选供应商信息
  @Bind()
  handleComputeAmount() {
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation, purchaseApplicationLineSource, supplierlistSource } = frameSubOrderModel;
    let totalAmount = 0;
    purchaseApplicationLineSource.map((item) => {
      totalAmount += Number(item.purchaseRequestAmountHkd);
    });
    this.searchForm?.form?.setFieldsValue({
      estimatedBudgetAmountHkd: totalAmount, // 预估总金额(HKD)
      // estimatedBudgetAmount: numberRender(
      //   totalAmount / Number(this.searchForm?.form?.getFieldsValue().prRate),
      //   2
      // ),
    });
    infomation.estimatedBudgetAmountHkd = totalAmount;
    // infomation.estimatedBudgetAmount = totalAmount / this.searchForm?.form?.getFieldsValue().prRate;
    if (supplierlistSource.length != 0) {
      supplierlistSource[0].totalAmount = totalAmount;
    }
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        infomation: infomation,
        supplierlistSource: supplierlistSource,
      },
    });
  }

  // 接收子组件的传递的项目编号
  @Bind()
  getProjectNumber(projectItem, res) {
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation = {} } = frameSubOrderModel;
    console.log(projectItem, 'projectItem');
    infomation.projectCode = projectItem.projectCode;
    infomation.applyUserId = res[0].userId;
    infomation.applyUserDepId = res[0].unitId;
    infomation.projectBudType = projectItem.projectBudType;
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        projectName: projectItem.projectName,
        projectNumber: projectItem.projectCode,
        demander: projectItem.projectManagerName,
        demanderId: projectItem.userId,
        demanderDepartment: projectItem.unitName,
        demanderDepartmentId: projectItem.unitId,
        demanderPhone: projectItem.projectManagerPhone,
        projectManagerCode: res[0].userId,
        employeeNum: res[0].employeeNum,
        infomation: infomation,
      },
    });
    dispatch({
      type: 'frameSubOrderModel/getProjectId',
      payload: {
        projectCode: projectItem.projectCode,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'frameSubOrderModel/commentUpdateState',
          payload: {
            projectId: res.projectId,
            projectNumber: res.projectNumber,
          },
        });
      }
    });
  }

  // 页面大保存
  save = (callback) => {
    const { frameSubOrderModel, dispatch } = this.props;
    const { related } = this.state;
    const { infomation, fileSource, purchaseApplicationLineSource, supplierlistSource, handledBy } =
      frameSubOrderModel;
    const filterFormValue = this.filterForm.form.getFieldsValue();
    const searchFormValue = this.searchForm?.form?.getFieldsValue();
    const attachmentSourceList = fileSource.map((item) => {
      item.filePath = item.response;
      return {
        ...item,
        tenantId: getCurrentOrganizationId(),
        // refHeadId: infomation.id,
      };
    });
    const purchaseApplicationLineList = getEditTableData(
      purchaseApplicationLineSource.map((item) => {
        return {
          ...item,
          tenantId: getCurrentOrganizationId(),
          // refHeadId: infomation.id,
        };
      })
    );
    if (purchaseApplicationLineList.length === 0) {
      CusNotification.warning({
        message: intl.get(`HKPC.commom.view.message.executeprocurement`).d('请完善物料信息'),
      });
      return;
    }
    console.log('基本信息filterFormValue', filterFormValue);
    console.log('申请信息searchFormValue', searchFormValue);
    console.log('附件上传attachmentSourceList', attachmentSourceList);
    console.log('采购申请行信息purchaseApplicationLineList', purchaseApplicationLineList);
    console.log('中选供应商信息supplierlistSource', supplierlistSource);
    this.searchForm.form.validateFields((err) => {
      if (err) {
        return;
      } else {
        dispatch({
          type: 'frameSubOrderModel/handleSaveOrder',
          payload: {
            applyUserId: infomation?.applyUserId, //需求人ID
            applyUserDepId: infomation?.applyUserDepId, //需求人部门ID
            applyingDepartmentId: infomation?.applyingDepartmentId, //申请人部门ID
            unitCode: infomation?.unitCode, //申请人部门code
            applicantUserId: infomation?.applierId, //申请人ID
            projectNumber: infomation?.projectCode, // 项目编号
            attachUuid: infomation?.attachUuid, // 附件uuid
            projectType: related, // 项目类型 0 yes  1 no
            tenantId: getCurrentOrganizationId(),
            id: infomation?.id ? infomation?.id : null,
            ...filterFormValue,
            ...searchFormValue,
            companyName: infomation?.companyName, // 框架协议的中选供应商名称
            projectBudType: infomation?.projectBudType, // 项目预算类型
            prAttachmentDTOList: attachmentSourceList, // 附件
            prLineDTOList: purchaseApplicationLineList.map((item) => ({
              ...item,
              deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD'),
            })), // 采购申请行信息
            selectedSupplier: { ...supplierlistSource[0], handledBy }, // 中选供应商信息
            // estimatedBudgetAmount: searchFormValue?.estimatedBudgetAmount
            //   .toString()
            //   .replace(/,/g, ''),
            estimatedBudgetAmountHkd: searchFormValue?.estimatedBudgetAmountHkd
              .toString()
              .replace(/,/g, ''),
          },
        }).then((res) => {
          this.handleSearch(res.id);
          CusNotification.success({
            message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
          });
          if (typeof callback === 'function') {
            callback({...res,jine: Number(res.estimatedBudgetAmountHkd)});
          }
        });
      }
    });
  };

  render() {
    const {
      form,
      dispatch,
      language,
      idpValueMap,
      saveLoading = false, // 保存按钮Loading
      Loading = false,
      frameSubOrderModel,
    } = this.props;
    const { activeKey, SearchTabActiveKey, related, prType, tabKey, tabActiveKey, fileInfoList } = this.state;

    const {
      purchaseApplicationLineSource,
      infomation,
      supplierlistSource,
      canClick,
      projectName,
      projectNumber,
      projectId,
    } = frameSubOrderModel;
    const filterSearchFormProps = {
      form,
      dispatch,
      related,
      idpValueMap,
      infomation,
      onRef: (ref) => {
        this.filterForm = ref.props;
      },
      frameSubOrderModel,
      handleSearchApplier: this.handleSearchApplier, // 查询需求人
    };
    const searchFormProps = {
      form,
      location,
      related,
      prType,
      language,
      dispatch,
      idpValueMap,
      infomation,
      frameSubOrderModel,
      onRef: (ref) => {
        this.searchForm = ref.props;
      },
      handleSearchRate: this.handleSearchRate,
      handleFrameWork: this.handleFrameWork,
      fileDataSource: fileInfoList,
    };
    const tableProps = {
      form,
      dispatch,
      idpValueMap,
      related,
      infomation,
      projectNumber,
      purchaseApplicationLineSource,
      handleComputeAmount: this.handleComputeAmount,
      handleNumber: this.handleNumber,
    };

    const supplierTableProps = {
      form,
      dispatch,
      idpValueMap,
      supplierlistSource,
      infomation,
    };

    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (infomation.prStatus === 'PENDING_REFER' || infomation.prStatus === '') {
        return intl.get('HKPC.commom.view.title.purchaseRequirements').d('起草采购申请');
      } else {
        if(activityCode === 'XQR01') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredConfirm').d('确认采购申请');
        }
        if(activityCode === 'XQR02') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredVerify').d('核對采購申請');
        }
        if(activityCode === 'XQZG01') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredApproval').d('審批采購申請');
        }
        if(activityCode === 'CGJL03') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredAllocate').d('分派采購申請');
        }
        if(activityCode === 'CGY04') {
          return intl.get('HKPC.commom.view.title.purchaseRequiredVerify').d('核對采購申請');
        }
      }
    })();

    return (
      <CusSpin spinning={Loading}>
        {infomation.prStatus !== 'Approved' && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45' }}
        />}
        <PageWrapper>
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
            </Panel>
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
              items={[
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
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 16px 0 16px',
                      }}
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
                                <SearchApplication {...searchFormProps} />
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
                                      infomation?.prStatus != 'PENDING_REFER' &&
                                      infomation?.prStatus != '' ? (
                                        <></>
                                      ) : (
                                        <>
                                          <CusButton
                                            onClick={this.handleDetele}
                                            mini
                                            disabled={
                                              infomation?.associatedAgreement ? false : true
                                            }
                                          >
                                            {intl.get('hzero.common.view.button.delete').d('删除')}
                                          </CusButton>
                                          <CusButton
                                            disabled={
                                              infomation?.associatedAgreement ? false : true
                                            }
                                            mini
                                            type="primary"
                                            onClick={this.handleAddPurchaseApplicationLine}
                                          >
                                            {intl.get('hzero.common.view.button.add').d('新建')}
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
                                  {...tableProps}
                                />
                              </Panel>
                              {infomation?.procurementHandler != null &&
                              infomation?.procurementHandler != '' ? (
                                <Panel
                                  showArrow={false}
                                  header={
                                    <PanelHeader
                                      title={intl
                                        .get('HKPC.commom.view.title.WinningSupplier')
                                        .d('中选供应商信息')}
                                      arrowActive={activeKey.includes('supplier')}
                                    />
                                  }
                                  key="supplier"
                                >
                                  <SupplierDataTable
                                    onRef={(node) => (this.supplierRef = node)}
                                    {...supplierTableProps}
                                  />
                                </Panel>
                              ) : (
                                <></>
                              )}
                            </Collapse>
                          ),
                        },
                      ]}
                      onChange={this.handleTabChange}
                      // onChange={(val) => this.setState({ SearchTabActiveKey: val })}
                    />
                  ),
                },
              ]}
            />
          </div>
        </PageWrapper>
      </CusSpin>
    );
  }
}
