import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy, filter } from 'lodash';

import { tooltipRender, labelTip } from '_cus_utils/render';
import { numberRender, dateRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import ValueList from 'components/ValueList';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import { InputNumber } from 'antd';
import CusNotification from '_cus_components/CusNotification';
// import RfqResponse from './components/RfqResponse';
// import QuotationDocumentSubmitNextModal from './QuotationDocumentSubmitNextModal'
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Tooltip } from 'antd';
// import ExportHistoryData from './components/ExportHistoryData';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'uuid';
const FormItem = Form.Item;
@formatterCollections({
  code: [promptCode],
})
@Form.create()
export default class BudgetInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      aaa: true,
      budgetTypeVal: false, //判断关联预算是否有值
      tempBudgetType: '', //关联预算的temp
      tenantId: getCurrentOrganizationId(),
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }

  /**
   * 选中关联预算类型Lov时的操作
   * @param value
   * @param lovRecord
   * @param record
   */
  @Bind()
  budgetTypeOnChange(value, lovRecord, record) {
    // console.log('lovRecord', lovRecord);
    // console.log('record', record);
    const { dispatch, purchaseApplicationModel, getNewAllOpex } = this.props;
    const { $form } = record;
    const { budgetInfoList = [] } = purchaseApplicationModel;
    this.setState({
      tempBudgetType: value,
    });
    // $form.setFieldsValue({
    //   bankName: lovRecord.bank,
    //   branchName: lovRecord.bankBranchName,
    //   country: lovRecord.bankCountryCode,
    //   interRemittanceNum: lovRecord.swiftCode,
    // });
    budgetInfoList.map((item) => {
      if (item.uuid === record.uuid) {
        item.budgetType = lovRecord.projectBudType; // 预算类型
        item.entryName = lovRecord.name; //项目名称
        item.budgetNumber = lovRecord.code; //预算编号
        item.budgetItemNumber = lovRecord.budProjectCode; // 预算项目编号
        item.costCenter = lovRecord.costCenterName; // 成本中心名称
        item.businessActivities = lovRecord.busActivityName; //	业务活动名称
        item.costCenterCode = lovRecord.costCenterCode; // 成本中心编号
        item.businessActivitiesCode = lovRecord.busActivityCode; // 业务活动编号
        // item. = lovRecord.projectCode; // 项目编码
        // item. = lovRecord.availableAmount; //	余额
      }
      return item;
    });
    let changes = true;
    budgetInfoList.map((item) => {
      if (item.budgetType !== 'OPEX') {
        changes = false;
      }
    });
    getNewAllOpex(changes);

    if (value) {
      this.setState({
        budgetTypeVal: true,
      });
    } else {
      // 清空数据的同时清空支出类型
      record.expenditureType = '';
    }

    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        budgetInfoList,
      },
    });
  }

  @Bind()
  budgetTypeOnChange2(value, record) {
    const { dispatch, purchaseApplicationModel, getNewAllOpex } = this.props;
    const { budgetInfoList = [] } = purchaseApplicationModel;
    this.setState({
      tempBudgetType: value,
    });
    budgetInfoList.map((item) => {
      if (item.uuid === record.uuid) {
        item.budgetType = value; // 预算类型
      }
      return item;
    });
    let changes = true;
    budgetInfoList.map((item) => {
      if (item.budgetType !== 'OPEX') {
        changes = false;
      }
    });
    // getNewAllOpex(changes);

    if (value) {
      this.setState({
        budgetTypeVal: true,
      });
    } else {
      // 清空数据的同时清空支出类型
      record.expenditureType = '';
    }

    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        budgetInfoList,
      },
    });
  }
  /**
   * 选中物料编码Lov时的操作
   * @param value
   * @param lovRecord
   * @param record
   */
  @Bind()
  materialCodeOnChange(value, lovRecord, record) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { $form } = record;
    const { budgetInfoList = [] } = purchaseApplicationModel;
    budgetInfoList.map((item) => {
      if (item.uuid === record.uuid) {
        item.matNumber = lovRecord.itemNumber; //物料编码
        item.realMatName = lovRecord.itemDescription; //修改后的物料名称
        // item.specificationModel = lovRecord.itemLongDescription;  // 规格型号
        // item.unit = lovRecord.unitOfMeasure;  // 单位名称
        item.unit = lovRecord.uomCode; // 单位编码
        item.organizationCode = lovRecord.organizationCode; // 组织编码
        // item. = lovRecord.startDateActive; // 开始生效日期
        // item. = lovRecord.endDateActive; // 结束生效日期
        // item. = lovRecord.productCode; //	产品编码
      }
      return item;
    });

    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        budgetInfoList,
      },
    });
  }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { businessType, enquiryPriceId, enquiryPriceRoundsId } = record;
    let url = '';
    switch (businessType) {
      case 'STANDARD':
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${
          isPub ? '/pub' : ''
        }${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
    }
    window.open(url);
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onDetele(selectedRows, this.clearState);
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
  }

  // // 支出类型的change事件
  // @Bind
  // PTchange(value, lovRecord){
  //   const {
  //     dispatch,
  //     purchaseApplicationModel,
  //   } = this.props;
  //   const { purchasingCategoriesCode } = purchaseApplicationModel;
  //   // record.xxx = lovRecord.yyy
  // }

  @Bind
  changePurchasingCategories(e, a, record) {
    const { purchaseApplicationModel, dispatch } = this.props;
    // const { purchasingCategoriesVal } = purchaseApplicationModel;
    if (e) {
      dispatch({
        type: `purchaseApplicationModel/updateState`,
        payload: {
          purchasingCategoriesVal: true,
        },
      });
    }

    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        purchasingCategoriesCode: e ? e : '',
        purchasingCategories: e ? e : '',
        purchasingCategoriesMean: a?.meaning ? a?.meaning : '',
      },
    });
  }

  render() {
    const { budgetTypeVal } = this.state
    const {
      purchaseApplicationModel,
      idpValueMap,
      form,
      isEdit,
    } = this.props;
    const {
      budgetInfoList = [],
      purchasingCategoriesVal,
      projectNumber,
      purchasingCategoriesCode,
      purchasingCategories,
      purchasingCategoriesMean,
      prNumber,
      projectType,
    } = purchaseApplicationModel;
    const { getFieldDecorator } = form;
    const controlETShow = (record) => {
      // console.log(budgetTypeVal,'111111111111');
      // console.log(purchasingCategoriesVal,'2222222222222222');
      // if(budgetTypeVal && purchasingCategoriesVal){
      //   return true
      // }else {
      //   alert(1)
      //   return false
      // }

      // alert('00000')
      const { purchaseApplicationModel } = this.props;
      const { purchasingCategoriesCode } = purchaseApplicationModel;
      // record.budgetType == "CAPEX"
      //
      if (!purchasingCategoriesCode) {
        record.expenditureType = '';
      }
      if (record.budgetType && purchasingCategoriesCode) {
        return true;
      } else {
        // alert(1)
        return false;
      }
    };

    // 控制支出类型的值集code
    // const controlPTShow = (record)=>{
    //   const {
    //     dispatch,
    //     purchaseApplicationModel,
    //   } = this.props;
    //   const { $form } = record;
    //   const { purchasingCategoriesCode } = purchaseApplicationModel

    //   console.log(record.budgetType,'预算类型aaaaaaaa');
    //   console.log(purchasingCategoriesCode,'采购类别bbbbbb');
    //   if(record.budgetType == 'CAPEX' && purchasingCategoriesCode == 'GP_CAPEX_NP'){
    //     return 'CMHK.API.EXPENDITURE.TYPE.CAPEX'
    //   }else {
    //     return 'CMHK.API.EXPENDITURE.TYPE'
    //   }
    // }

    // const columns = [
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
    //     width: 80,
    //     render: (val, record, index) => {
    //       return <span>{index + 1}</span>
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型')),
    //     dataIndex: 'budgetType',
    //     required: true,
    //     width: 160,
    //     render: (_, record) => {
    //       return (
    //         <Form.Item>
    //           {getFieldDecorator(`budgetType${record.uuid}`, {
    //             initialValue: record?.budgetType,
    //             rules: [
    //               {
    //                 required: true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型'),
    //                 }),
    //               },
    //             ],
    //           })(
    //           // <CusLov style={{ width: '100%' }}
    //           //   code="CMHK.API.C/O"
    //           //   queryParams={{ projectNum: projectNumber }}
    //           //   lovOptions={{ displayField: 'projectBudType', valueField: 'id' }}
    //           //   onChange={(value, lovRecord) => this.budgetTypeOnChange(value, lovRecord, record)}
    //           //   textValue={record.budgetType}
    //           //   disabled={isEdit}
    //           // />
    //           (record?.budgetTypeFlag == "CAPEX" || record?.budgetTypeFlag == "MIX") ? <CusSelect
    //                     lovCode="HKPC.BUDGETTYPE"
    //                     allowClear
    //                     textValue={record.budgetType}
    //                     popupClassName="customize-select"
    //                     onChange={(value) => {
    //                       record.purchasingCategories = null;
    //                       form.resetFields(`purchasingCategories${record.uuid}`);
    //                       this.budgetTypeOnChange2(value, record)
    //                       if(value === 'OPEX') {
    //                         form.resetFields();
    //                       }
    //                     }}
    //                     style={{ width: '100%' }}
    //                     placeholder={intl.get(`${promptCode}.view.title.inputbudgettype`).d('请选择预算类型')}
    //                 />: tooltipRender(record.budgetType)
    //                 )}
    //         </Form.Item>
    //       )
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')),
    //     dataIndex: 'purchasingCategories',
    //     required: true,
    //     width: 350,
    //     render: (_, record) => {
    //       console.log('record', record)

    //       let purchaseCategoryFilteredData
    //       if(record.budgetType === 'OPEX') {
    //         purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
    //           ['NET_CELL_SITE', 'GP_OPEX'].includes(item.value)
    //         );
    //       } else if(record.budgetType === 'CAPEX') {
    //         purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
    //           ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
    //         );
    //       } else {
    //         purchaseCategoryFilteredData = idpValueMap['HKPC.PURCHASINGCATEGORY'];
    //       }
    //       return (
    //         <Form.Item
    //           required
    //         >
    //           {getFieldDecorator(`purchasingCategories${record.uuid}`, {
    //             // 看鸿飞返回的位置调整
    //             initialValue: record?.purchasingCategories,
    //             rules: [{
    //               required: true,
    //               message: intl.get('hzero.common.validation.notNull', {
    //                 name: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
    //               }),
    //             }],
    //           })(
    //             <CusSelect
    //               allowClear
    //               options={purchaseCategoryFilteredData}
    //               onChange={(e, a) => {
    //                 this.changePurchasingCategories(e, a,record)
    //               }}
    //               disabled={isEdit}
    //               popupClassName="customize-select"
    //               style={{ width: '100%' }}
    //             />
    //           )}
    //         </Form.Item>
    //       )
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型')),
    //     dataIndex: 'expenditureType',
    //     required: true,
    //     width: 200,
    //     disabled: true,
    //     render: (_, record) => {
    //       const budgetProject = record.budgetType;
    //       const procurementType = purchasingCategoriesCode;
    //       if (controlETShow(record)) {
    //         return (
    //           <Form.Item>
    //             {getFieldDecorator(`expenditureType${record.uuid}`, {
    //               initialValue: record?.expenditureType,
    //               rules: [
    //                 {
    //                   required: record.budgetType === 'OPEX' ? false : true,
    //                   message: intl.get('hzero.common.validation.notNull', {
    //                     name: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
    //                   }),
    //                 },
    //               ],
    //             })(<CusLov style={{ width: '100%' }}
    //               // code={controlPTShow(record)}
    //               code='CMHK.EXPENDITURE.TYPE'
    //               queryParams={{ budgetProject, procurementType }}
    //               lovOptions={{ displayField: 'expenditureType', valueField: 'rowId' }}
    //               onChange={(value, lovRecord) => {
    //                 record.expenditureType = lovRecord.expenditureType
    //               }}
    //               disabled={isEdit}
    //               textValue={record.expenditureType}
    //             />)}
    //           </Form.Item>
    //         )
    //       } else {
    //         return tooltipRender('')
    //       }
    //     }
    //   },
    //   {
    //     // title: tooltipRender(intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码')),
    //     title: labelTip({
    //       label: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
    //       tip: intl.get(`${promptCode}.view.title.tasknote`).d('若预算类型为Opex，可不填任务编码')
    //     }),
    //     dataIndex: 'taskCode',
    //     required: true,
    //     width: 200,
    //     render: (_, record) => {
    //       return (
    //         <Form.Item>
    //           {getFieldDecorator(`taskCode${record.uuid}`, {
    //             initialValue: record?.taskCode,
    //             rules: [
    //               {
    //                 required: record.budgetType === 'OPEX' ? false : true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
    //                 }),
    //               },
    //             ],
    //           })(<CusLov style={{ width: '100%' }}
    //             code="CMHK.API.TASKCODE"
    //             queryParams={{ projectCode: projectNumber }}
    //             lovOptions={{ displayField: 'code', valueField: 'rowId' }}
    //             onChange={(value, lovRecord) => {
    //               record.taskCode = lovRecord.code
    //               record.taskName = lovRecord.name// 更改任务名称
    //             }}
    //             disabled={isEdit}
    //             textValue={record.taskCode}
    //           />)}
    //         </Form.Item>
    //       )
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.taskname`).d('任务名称')),
    //     dataIndex: 'taskName',
    //     disabled: true,
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.taskName),
    //   },
    //   // 支出类型+任务编码+任务名称
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码')),
    //     dataIndex: 'materialCode',
    //     width: 200,
    //     required: true,
    //     render: (_, record) => {
    //       // console.log('this.props.purchaseApplicationModel.purchasingCategories', this.props.purchaseApplicationModel.purchasingCategories);
    //       return this.props.purchaseApplicationModel.purchasingCategories ? (
    //         <Form.Item>
    //           {getFieldDecorator(`materialCode${record.uuid}`, {
    //             initialValue: record?.materialCode,
    //             rules: [
    //               {
    //                 required: true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
    //                 }),
    //               },
    //             ],
    //           })(<CusLov style={{ width: '100%' }}
    //             code="CMHK.CATEGORY.ORGANIZATION"
    //             queryParams={{ purchasingCategory: this.props.purchaseApplicationModel.purchasingCategories }}
    //             lovOptions={{ displayField: 'materialCode', valueField: 'rowId' }}
    //             onChange={(value, lovRecord) => this.materialCodeOnChange(value, lovRecord, record)}
    //             textValue={record.materialCode}
    //             disabled={isEdit}
    //           />)}
    //         </Form.Item>
    //       ) : tooltipRender('')
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get('HKPC.commom.view.title.materialname').d('物料名称')),
    //     key: 'realMatName',
    //     dataIndex: 'realMatName',
    //     width: 180,
    //     render: tooltipRender
    //   },
    //   {
    //     title: tooltipRender(intl.get('HKPC.commom.view.title.orimaterialname').d('原物料名称')),
    //     dataIndex: 'materialName',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.materialName),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.specification`).d('规格型号')),
    //     dataIndex: 'specificationModel',
    //     width: 200,
    //     render: (_, record) => {
    //       return (
    //         isEdit ? tooltipRender(record.specificationModel)
    //         :
    //         <Form.Item>
    //           {getFieldDecorator(`specificationModel${record.uuid}`, {
    //             initialValue: record?.specificationModel,
    //           })(
    //             <CusInput.TextArea
    //               autoChangeSize
    //               onChange={(e) => {
    //                 record.specificationModel = e.target.value;
    //               }}
    //             />
    //           )}
    //         </Form.Item>
    //       )
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.unit`).d('单位')),
    //     dataIndex: 'unit',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.unit),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心')),
    //     dataIndex: 'costCenter',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.costCenter),
    //   },
    //   {
    //     title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
    //     dataIndex: 'businessActivities',
    //     width: 200,
    //     required: true,
    //     render: (_, record) => {
    //       return (
    //         isEdit ? tooltipRender(record.businessActivities) :
    //         <Form.Item>
    //         {record.$form.getFieldDecorator(`businessActivities`, {
    //           initialValue: record?.businessActivities,
    //           rules: [
    //             {
    //               required: record.budgetType === 'OPEX',
    //               message: intl.get('hzero.common.validation.notNull', {
    //                 name: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
    //               }),
    //             },
    //           ],
    //           })(
    //             record.budgetType === 'OPEX' ?
    //             <CusLov
    //               code="CPEX.OPEX"
    //               queryParams={{
    //                 tenantId: getCurrentOrganizationId(),
    //                 projectCode: prNumber,
    //                 applyType: projectType,
    //               }}
    //               textValue={record.businessActivities}
    //               onChange={(_, item) => {
    //                 record.budgetItemNumber = item.budCode; // 预算项目编码
    //                 record.businessActivitiesCode = item.busActivityCode; // 业务活动编码
    //                 record.businessActivities = item.busActivityName; // 业务活动名称
    //                 record.costCenterCode = item.costCenterCode; // 成本中心编码
    //                 record.costCenter = item.costCenternName; // 成本中心名称
    //               }}
    //             />
    //             :
    //             <></>
    //           )}
    //         </Form.Item>
    //       )
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title`).d('PR数量')),
    //     dataIndex: 'materialBudgetNumber',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.materialBudgetNumber),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量')),
    //     dataIndex: 'materialBudgetRealityNumber',
    //     required: true,
    //     width: 200,
    //     render: (_, record) => {
    //       return (
    //         <Form.Item>
    //           {getFieldDecorator(`materialBudgetRealityNumber${record.uuid}`, {
    //             initialValue: record?.materialBudgetRealityNumber,
    //             rules: [
    //               {
    //                 required: true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
    //                 }),
    //               },
    //               {
    //                 validator: (_, value) => {
    //                   if (value <= record.materialBudgetNumber) {
    //                     return Promise.resolve();
    //                   }
    //                   return Promise.reject(new Error(intl.get(`${promptCode}.view.message.purcahsequantutyprompt`).d('请知悉采购数量不得多于PR数量')));
    //                 },
    //               },
    //             ],
    //           })(
    //             <InputNumber
    //               className={styles['number-input']}
    //               step={0.01}
    //               formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    //               parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
    //               precision={2}
    //               onChange={(e) => {
    //                 record.materialBudgetRealityNumber = e;
    //                 record.purchaseAmountHkd = parseInt(e || 0) * parseFloat(record.unitPrice || 0) * parseFloat(record.exchangeRate || 0);
    //                 record.purchaseAmountHkdSummary = parseFloat(record.purchaseAmountHkd || 0) + parseFloat(record.otherExpensePrice || 0);
    //               }}
    //               disabled={isEdit}
    //             />
    //           )}
    //         </Form.Item>
    //       )
    //     }
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价（原币）')),
    //     dataIndex: 'unitPrice',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.rateportal`).d('汇率')),
    //     dataIndex: 'exchangeRate',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.exchangeRate),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额（HKD）')),
    //     dataIndex: 'purchaseAmountHkd',
    //     required: true,
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.otherfeename`).d('其他费用名称')),
    //     dataIndex: 'otherExpenseName',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.otherExpenseName),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.otherfeeamount`).d('其他费用金额')),
    //     dataIndex: 'otherExpensePrice',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title`).d('采购金额汇总（HKD）')),
    //     dataIndex: 'purchaseAmountHkdSummary',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.BudgetProjectName`).d('预算项目名称')),
    //     dataIndex: 'entryName',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.entryName),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号')),
    //     dataIndex: 'budgetNumber',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.budgetNumber),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')),
    //     dataIndex: 'budgetItemNumber',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.budgetItemNumber),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号')),
    //     dataIndex: 'lastPoNumber',
    //     width: 200,
    //     render: (_, record) => tooltipRender(record.lastPoNumber),
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）')),
    //     dataIndex: 'supplierQuotationHkd',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）')),
    //     dataIndex: 'supplierQuotationOri',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期')),
    //     dataIndex: 'warrantyPeriod',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人')),
    //     dataIndex: 'deliveryAddressContact',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址')),
    //     dataIndex: 'deliveryAddress',
    //     width: 200,
    //     render: tooltipRender,
    //   },

    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.NameofWinningSupplier`).d('中标供应商名称')),
    //     dataIndex: 'nameWinningSupplier',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话')),
    //     dataIndex: 'deliveryContactNumber',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注')),
    //     dataIndex: 'deliveryAddressRemarks',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期')),
    //     dataIndex: 'deliveryDate',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)')),
    //     dataIndex: 'lastPurchasePriceHkd',
    //     width: 200,
    //     render: (record) => {
    //       return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
    //     },
    //   },
    //   {
    //     title: tooltipRender(intl.get(`${promptCode}.view.title.Remark`).d('备注')),
    //     dataIndex: 'remark',
    //     width: 200,
    //     render: tooltipRender,
    //   },
    // ];

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 80,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型'),
        dataIndex: 'budgetType',
        required: true,
        width: 160,
        render: (_, record) => {
          return isEdit ? (
            <div>{tooltipRender(record.budgetType)}</div>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`budgetType`, {
                initialValue: record?.budgetType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  lovCode="HKPC.BUDGETTYPE"
                  allowClear
                  textValue={record.budgetType}
                  popupClassName="customize-select"
                  onChange={(value) => {
                    record.purchasingCategories = null;
                    record.purchasingCategoriesCode = null;
                    record.matNumber = null;
                    record.expenditureType = null;
                    record.$form.setFieldsValue({
                      purchasingCategories: null,
                      purchasingCategoriesCode: null,
                      expenditureType: null,
                      matNumber: null,
                    });
                    this.budgetTypeOnChange2(value, record);
                  }}
                  style={{ width: '100%' }}
                  placeholder={intl
                    .get(`${promptCode}.view.title.inputbudgettype`)
                    .d('请选择预算类型')}
                  disabled={isEdit}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategories',
        required: true,
        width: 200,
        render: (_, record) => {
          let purchaseCategoryFilteredData;
          if (record.budgetType === 'OPEX') {
            purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
              ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
            );
          } else if (record.budgetType === 'CAPEX') {
            purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = idpValueMap['HKPC.PURCHASINGCATEGORY'];
          }
          return isEdit ? (
            <div>{tooltipRender(record.purchasingCategoryMeaning)}</div>
          ) : (
            <Form.Item required>
              {record.$form.getFieldDecorator(`purchasingCategories`, {
                initialValue: record?.purchasingCategories,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  options={purchaseCategoryFilteredData}
                  onChange={(e, a) => {
                    record.purchasingCategories = e;
                    record.purchasingCategoriesCode = e;
                    record.expenditureType = null;
                    record.matNumber = null;
                    this.changePurchasingCategories(e, a, record);
                  }}
                  disabled={isEdit}
                  popupClassName="customize-select"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
        dataIndex: 'matNumber',
        width: 180,
        required: true,
        render: (_, record) => {
          return record.purchasingCategories ? (
            isEdit ? (
              <div>{tooltipRender(record.matNumber)}</div>
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator(`matNumber`, {
                  initialValue: record?.matNumber,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    style={{ width: '100%' }}
                    code="CMHK.CATEGORY.ORGANIZATION"
                    queryParams={{ purchasingCategory: record.purchasingCategories }}
                    lovOptions={{ displayField: 'matNumber', valueField: 'rowId' }}
                    onChange={(value, lovRecord) => {
                      this.materialCodeOnChange(value, lovRecord, record);
                      record.lastPurchasePriceHkd = null;
                    }}
                    textValue={record.matNumber}
                    disabled={isEdit}
                  />
                )}
              </Form.Item>
            )
          ) : (
            tooltipRender('')
          );
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'realMatName',
        dataIndex: 'realMatName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.orimaterialname').d('原物料名称'),
        dataIndex: 'materialName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'specificationModel',
        width: 200,
        render: tooltipRender,
        // render: (_, record) => {
        //   return (
        //     isEdit ? tooltipRender(record.specificationModel)
        //     :
        //     <Form.Item>
        //       {record.$form.getFieldDecorator(`specificationModel`, {
        //         initialValue: record?.specificationModel,
        //       })(
        //         <CusInput.TextArea
        //           autoChangeSize
        //           onChange={(e) => {
        //             record.specificationModel = e.target.value;
        //           }}
        //         />
        //       )}
        //     </Form.Item>
        //   )
        // }
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
        dataIndex: 'expenditureType',
        required: true,
        width: 180,
        disabled: true,
        render: (_, record) => {
          const budgetProject = record.budgetType;
          const procurementType = record.purchasingCategoriesCode;
          return isEdit ? (
            <div>{tooltipRender(record.expenditureType)}</div>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`expenditureType`, {
                initialValue: record?.expenditureType,
                rules: [
                  {
                    required: record.budgetType === 'OPEX' ? false : true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
                    }),
                  },
                ],
              })(
                record.budgetType === 'CAPEX' &&
                  (record.purchasingCategories || record.purchasingCategoriesCode) ? (
                  <CusLov
                    style={{ width: '100%' }}
                    code="CMHK.EXPENDITURE.TYPE"
                    queryParams={{ budgetProject, procurementType }}
                    lovOptions={{ displayField: 'expenditureType', valueField: 'rowId' }}
                    onChange={(_, lovRecord) => {
                      record.expenditureType = lovRecord.expenditureType;
                    }}
                    disabled={isEdit}
                    textValue={record.expenditureType}
                  />
                ) : (
                  <></>
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: labelTip({
          label: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
          tip: intl.get(`${promptCode}.view.title.tasknote`).d('若预算类型为Opex，可不填任务编码'),
        }),
        dataIndex: 'taskCode',
        required: true,
        width: 200,
        render: (_, record) => {
          return record.budgetType === 'CAPEX' ? (
            isEdit ? (
              <div>{tooltipRender(record.taskCode)}</div>
            ) : (
              <Form.Item>
                {record.$form.getFieldDecorator(`taskCode`, {
                  initialValue: record?.taskCode,
                  rules: [
                    {
                      required: record.budgetType === 'OPEX' ? false : true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    style={{ width: '100%' }}
                    code="CMHK.API.TASKCODE"
                    queryParams={{ projectCode: projectNumber }}
                    lovOptions={{ displayField: 'code', valueField: 'rowId' }}
                    onChange={(value, lovRecord) => {
                      record.taskCode = lovRecord.code;
                      record.taskName = lovRecord.name; // 更改任务名称
                    }}
                    disabled={isEdit}
                    textValue={record.taskCode}
                  />
                )}
              </Form.Item>
            )
          ) : (
            <></>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
        dataIndex: 'taskName',
        disabled: true,
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenter',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivities',
        width: 200,
        required: true,
        render: (_, record) => {
          return isEdit ? (
            tooltipRender(record.businessActivities)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`businessActivities`, {
                initialValue: record?.businessActivities,
                rules: [
                  {
                    required: record.budgetType === 'OPEX',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
                    }),
                  },
                ],
              })(
                record.budgetType === 'OPEX' ? (
                  <CusLov
                    code="CPEX.OPEX"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      projectCode: prNumber,
                      applyType: projectType,
                    }}
                    textValue={record.businessActivities}
                    onChange={(_, item) => {
                      record.budgetItemNumber = item.budCode; // 预算项目编码
                      record.businessActivitiesCode = item.busActivityCode; // 业务活动编码
                      record.businessActivities = item.busActivityName; // 业务活动名称
                      record.costCenterCode = item.costCenterCode; // 成本中心编码
                      record.costCenter = item.costCenternName; // 成本中心名称
                    }}
                  />
                ) : (
                  <></>
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prquantity`).d('PR数量'),
        dataIndex: 'materialBudgetNumber',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'materialBudgetRealityNumber',
        required: true,
        width: 200,
        render: (_, record) => {
          return isEdit ? (
            tooltipRender(record.materialBudgetRealityNumber)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`materialBudgetRealityNumber`, {
                initialValue: record?.materialBudgetRealityNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (value <= record.materialBudgetNumber) {
                        callback();
                      } else {
                        callback(
                          new Error(
                            intl
                              .get(`${promptCode}.view.message.purcahsequantutyprompt`)
                              .d('请知悉采购数量不得多于PR数量')
                          )
                        );
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  className={styles['number-input']}
                  step={0.01}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  precision={2}
                  onChange={(e) => {
                    record.materialBudgetRealityNumber = e;
                    record.purchaseAmountHkd =
                      parseInt(e || 0) *
                      parseFloat(record.unitPrice || 0) *
                      parseFloat(record.exchangeRate || 0);
                    record.purchaseAmountHkdSummary = parseFloat(record.purchaseAmountHkd || 0);
                    // + parseFloat(record.otherExpensePrice || 0);
                  }}
                  disabled={isEdit}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价（原币）'),
        dataIndex: 'unitPrice',
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.rateportal`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额（HKD）'),
        dataIndex: 'purchaseAmountHkd',
        required: true,
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.otherfeename`).d('其他费用名称'),
      //   dataIndex: 'otherExpenseName',
      //   width: 200,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.otherfeeamount`).d('其他费用金额'),
      //   dataIndex: 'otherExpensePrice',
      //   width: 200,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamounttotal`).d('采购金额汇总（HKD）'),
        dataIndex: 'purchaseAmountHkdSummary',
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectName`).d('预算项目名称'),
        dataIndex: 'entryName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
        dataIndex: 'budgetNumber',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetItemNumber',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）'),
        dataIndex: 'supplierQuotationHkd',
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
        dataIndex: 'supplierQuotationOri',
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warrantyPeriod',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliveryAddressContact',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliveryAddress',
        width: 200,
        render: tooltipRender,
      },

      {
        title: intl.get(`${promptCode}.view.title.NameofWinningSupplier`).d('中标供应商名称'),
        dataIndex: 'nameWinningSupplier',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryContactNumber',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliveryAddressRemarks',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliveryDate',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
        dataIndex: 'lastPoNumber',
        width: 200,
        render: (_, record) => {
          return isEdit ? (
            tooltipRender(record.lastPoNumber)
          ) : (
            record?.matNumber ?
            <Form.Item>
              {record.$form.getFieldDecorator(`poLineId`, {
                initialValue: record?.lastPoNumber,
              })(
                <CusLov
                  code="CMHK.PO.INFO"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    itemCode: record?.matNumber, // 物料编码
                    organizationCode: record?.organizationCode, // 库存组织编码
                  }}
                  textValue={record.lastPoNumber}
                  onChange={(_, item) => {
                    record.lastPurchasePriceHkd = item.price;
                    record.lastPoNumber = item.poNumber;
                  }}
                />
              )}
            </Form.Item>
            :
            <></>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
        dataIndex: 'lastPurchasePriceHkd',
        width: 200,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: tooltipRender,
      },
    ];

    return (
      <>
        <EditTable
          rowKey={ROW_KEY}
          pagination={false}
          columns={columns}
          dataSource={budgetInfoList}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
