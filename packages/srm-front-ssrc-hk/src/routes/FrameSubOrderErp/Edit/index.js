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
import { Bind } from 'lodash-decorators';

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

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

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
  'HKPC.RELATEDTOPROJECT',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.BUDGETTYPE',
  'HKPC.PRTYPE',
  'CMHKHPFM.UOM',
  'HKPC.PROCUREMENTAGENT',
  'HKPC.PASUPPLIERTYPE',
  'HKPC.PURCHASINGCATEGORY',
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
      fileInfoList: [],
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
      this.handleSearchRate();
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
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (
          ['SUBMIT', 'TEMPORARY', 'UNDO', 'BACK', 'NOTICE', 'PROCESS_SHOW', 'SEND'].includes(
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
                        prname: params.prNumber + ':' + params.prName,
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
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                        prname: params.prNumber + ':' + params.prName,
                      })
                      .d(
                        `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                      ), //待办流程名称
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
        }
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
    const { formRecordId, idErp } = queryString.parse(search.substring(1));
    console.log(id, 'id456');
    console.log(formRecordId, 'formRecordId456');
    dispatch({
      type: 'frameSubOrderModel/handleDetailInfomation',
      payload: {
        id: id || formRecordId || idErp,
      },
    }).then((res) => {
      if (res) {
        // 申请行信息
        const prApplySonMaterialList = res?.prApplySonMaterialList.map((item) => {
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
            fileSource: res?.prApplyAttachmentList || [],
            purchaseApplicationLineSource: prApplySonMaterialList || [],
            supplierlistSource: prWinningSupplier || [],
          },
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
          contacts: res.contactMan ? res.contactMan : null,
          supplierPhone: res.phoneNumber ? res.phoneNumber : null,
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

  // 新建采购申请行信息
  @Bind()
  handleAddPurchaseApplicationLine() {
    const { frameSubOrderModel } = this.props;
    const { purchaseApplicationLineSource, infomation } = frameSubOrderModel;
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
        deliverContact: null, // 送货地址联系人
        deliverAddress: null, // 送货地址
        winningSupplier: infomation.companyName ? infomation.companyName : null, //
        deliverAddressBakup: null, // 送货地址备注
        deliverDate: null, // 送货日期
        purchasePrice: null, // 上次采购价(HKD)
        deliveryPhoneNumber: null, // 送货联系电话
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
      totalAmount += item.purchaseRequestAmountHkd;
    });
    this.searchForm?.form?.setFieldsValue({
      estimatedBudgetAmountHkd: totalAmount, // 预估总金额(HKD)
    });
    infomation.estimatedBudgetAmountHkd = totalAmount;
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
  getProjectNumber(projectItem) {
    const { dispatch, frameSubOrderModel } = this.props;
    const { infomation = {} } = frameSubOrderModel;
    console.log(projectItem, 'projectItem');
    infomation.projectCode = projectItem.projectCode;
    infomation.applyUserId = projectItem.userId;
    infomation.applyUserDepId = projectItem.unitId;
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
        projectManagerCode: projectItem.projectManagerCode,
        employeeNum: projectItem.projectManagerCode,
        infomation: infomation,
      },
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
    const purchaseApplicationLineList = purchaseApplicationLineSource.map((item) => {
      return {
        ...item,
        tenantId: getCurrentOrganizationId(),
        // refHeadId: infomation.id,
      };
    });
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
            projectType: related, // 项目类型 0 yes  1 no
            tenantId: getCurrentOrganizationId(),
            id: infomation?.id ? infomation?.id : null,
            ...filterFormValue,
            ...searchFormValue,
            prAttachmentDTOList: attachmentSourceList, // 附件
            prLineDTOList: purchaseApplicationLineList, // 采购申请行信息
            selectedSupplier: { ...supplierlistSource[0], handledBy }, // 中选供应商信息
            estimatedBudgetAmount: searchFormValue?.estimatedBudgetAmount.toString().replace(/,/g, ''),
            estimatedBudgetAmountHkd: searchFormValue?.estimatedBudgetAmountHkd.toString().replace(/,/g, ''),
          },
        }).then((res) => {
          this.handleSearch(res.id);
          CusNotification.success({
            message: intl.get(`srsp.collectiondisplay`).d('保存成功'),
          });
          if (typeof callback === 'function') {
            callback(res);
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
    const { activeKey, SearchTabActiveKey, related, prType, fileInfoList } = this.state;

    const { purchaseApplicationLineSource, infomation, supplierlistSource, canClick } =
      frameSubOrderModel;
    // 基本信息
    const filterSearchFormProps = {
      form,
      dispatch,
      idpValueMap,
      infomation,
      onRef: (ref) => {
        this.filterForm = ref.props;
      },
      frameSubOrderModel,
      handleSearchApplier: this.handleSearchApplier, // 查询需求人
    };
    // 申请信息
    const searchFormProps = {
      form,
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
    // 采购申请行信息
    const tableProps = {
      form,
      dispatch,
      idpValueMap,
      infomation,
      purchaseApplicationLineSource,
      handleComputeAmount: this.handleComputeAmount,
      handleNumber: this.handleNumber,
    };

    // 中选供应商信息
    const supplierTableProps = {
      form,
      dispatch,
      idpValueMap,
      supplierlistSource,
      infomation,
    };

    return (
      <div className={classnames(styles['out-pageWrapper'])}>
        <CusSpin spinning={Loading}>
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
                    title={intl.get(`HKPC.commom.view.title.ApplicationInformation`).d('申请信息')}
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
                      .get(`HKPC.commom.view.title.ProcurementRequisitionLineInformation`)
                      .d('采购申请行信息')}
                    arrowActive={activeKey.includes('purchaseTable')}
                    buttons={
                      infomation?.prStatus != 'PENDING_REFER' && infomation?.prStatus != '' ? (
                        <></>
                      ) : (
                        <>
                          <CusButton
                            onClick={this.handleDetele}
                            mini
                            disabled={infomation?.frameworkPrType ? false : true}
                          >
                            {intl.get('hzero.common.view.button.delete').d('删除')}
                          </CusButton>
                          <CusButton
                            disabled={infomation?.frameworkPrType ? false : true}
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
                <DataTable onRef={(node) => (this.ChildRef = node)} {...tableProps} />
              </Panel>
              {infomation?.procurementHandler != null && infomation?.procurementHandler != '' ? (
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get('HKPC.commom.view.title.WinningSupplier').d('中选供应商信息')}
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
          </PageWrapper>
        </CusSpin>
      </div>

    );
  }
}
