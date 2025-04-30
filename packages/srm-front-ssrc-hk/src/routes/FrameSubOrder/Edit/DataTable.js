import React from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Input } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { pullAllBy } from 'lodash';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import CusNotification from '_cus_components/CusNotification';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import dayjs from 'dayjs';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from '_cus_components/CusSelect';


/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'lineId';
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      purchasingCategoryList: [],
    };
  }

  componentDidMount() {}

  @Bind()
  handleDelete() {
    const { purchaseApplicationLineSource, dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    const lineResultList = purchaseApplicationLineSource.filter(
      (item) => !selectedRows.includes(item)
    );
    dispatch({
      type: 'frameSubOrderModel/commentUpdateState',
      payload: {
        purchaseApplicationLineSource: lineResultList,
      },
    });
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 旧PO过来查询的采购类别
  @Bind()
  handlePurchasingCategory(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'frameSubOrderModel/getPurchasingCategory',
      payload: {
        itemNumber: record.matCode, // 物料编码
      }
    }).then((res) => {
      if(res) {
        this.setState({
          purchasingCategoryList: res.map((item) => ({
            meaning: item.purchasingCategoryName,
            value: item.purchasingCategory
          }))
        })
      }
    })
  }

  render() {
    const {
      form,
      idpValueMap = {},
      infomation,
      projectNumber,
      purchaseApplicationLineSource,
      handleComputeAmount = (e) => e,
      handleNumber = (e) => e,
      related,
      dispatch,
    } = this.props;
    const { selectedRows, selectedRowKeys, purchasingCategoryList } = this.state;
    const frameworkCode = form.getFieldsValue().frameworkCode;
    const projectCode = form.getFieldsValue().projectCode;
//     const columns = [
//       {
//         title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
//         width: 100,
//         render: (val, record, index) => {
//           return <span>{index + 1}</span>;
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
//         dataIndex: 'matCode',
//         key: 'matCode',
//         width: 150,
//         required: true,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`matCode`, {
//                 initialValue: record.matCode,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
//                     }),
//                   },
//                 ],
//               })(
//                 <CusLov
//                   textValue={record.matCode}
//                   queryParams={{
//                     purchasingCategory: infomation?.frameworkPrType,
//                     frameworkCode: infomation?.associatedAgreement,
//                   }}
//                   lovOptions={{ displayField: 'itemNumber', valueField: 'id' }}
//                   code="CMHK.CATEGORY.ORGANIZATION.NEW"
//                   onChange={(val, data) => {
//                     record.matCode = data.itemnumber; // 物料编号
//                     record.matName = data?.itemdescription; // 物料名称
//                     record.unitPrice = data?.price; // 单价
//                     record.contentBudgetType = data?.budgettype; // 关联预算类型
//                     record.expenditureType = data?.expensetype; // 支出类型
//                     record.taskCode = data?.tasknumber; // 任务编码
//                     record.taskName = data?.taskname; // 任务名称
//                     record.matType = data?.itemlongdescription; // 规格型号
//                     record.unit = data?.unitofmeasure; // 单位名称
//                     record.costcenter = data?.actualcostcenter; // 成本中心code
//                     record.costcenterName = data?.costcentername; // 成本中心名称
//                     record.businessActivities = data?.bam; // 业务活动code
//                     record.businessActivitiesName = data?.operatingactivityname; // 业务活动名称
//                     record.entryName = data?.projectname; // 项目名称
//                     record.budgetNumber = data?.projectnumber; // 预算编号
//                     record.budgetItemNumber = data?.budgetnumber; // 预算项目编号
//                     record.poNumber = data?.poNumber; // 上次PO单号
//                     record.purchasePrice = data?.purchasePrice; // 上次采购价 (HKD）
//                     record.$form.setFieldsValue({
//                       matCode: data.itemnumber, // 物料编号
//                       matName: data?.itemdescription, // 物料名称
//                       unitPrice: data?.price, // 单价
//                       contentBudgetType: data?.budgettype, // 关联预算类型
//                       expenditureType: data?.expensetype, // 支出类型
//                       taskCode: data?.tasknumber, // 任务编码
//                       taskName: data?.taskname, // 任务名称
//                       matType: data?.itemlongdescription, // 规格型号
//                       unit: data?.unitofmeasure, // 单位名称
//                       costcenter: data?.actualcostcenter, // 成本中心code
//                       costcenterName: data?.costcentername, // 成本中心名称
//                       businessActivities: data?.bam, // 业务活动code
//                       businessActivitiesName: data?.operatingactivityname, // 业务活动名称
//                       entryName: data?.projectname, // 项目名称
//                       budgetNumber: data?.projectnumber, // 预算编号
//                       budgetItemNumber: data?.budgetnumber, // 预算项目编号
//                       poNumber: data?.poNumber, // 上次PO单号
//                       purchasePrice: data?.purchasePrice, // 上次采购价 (HKD）
//                     });
//                     handleNumber();
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
//         dataIndex: 'matName',
//         key: 'matName',
//         width: 200,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#matName`, {
//         //         initialValue: record.matName,
//         //       })(
//         //         <CusInput.TextArea
//         //           autoChangeSize
//         //           onChange={(val) => {
//         //             record.matName = val.target.value;
//         //             record.$form.setFieldsValue({ matName: val.target.value });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
//         dataIndex: 'qty',
//         key: 'qty',
//         width: 100,
//         required: true,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`qty`, {
//                 initialValue: record.qty,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
//                     }),
//                   },
//                 ],
//               })(
//                 <InputNumber
//                   step={1}
//                   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
//                   onChange={(e) => {
//                     record.qty = e;
//                     record.$form.setFieldsValue({ qty: e });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.PRAmountH`).d('采购申请金额(HKD)'),
//         dataIndex: 'purchaseRequestAmountHkd',
//         key: 'purchaseRequestAmountHkd',
//         width: 300,
//         required: true,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`purchaseRequestAmountHkd`, {
//                 initialValue: record?.purchaseRequestAmountHkd,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`${promptCode}.view.title.PRAmountH`).d('采购申请金额(HKD)'),
//                     }),
//                   },
//                 ],
//               })(
//                 // <InputNumber
//                 //   step={0.01}
//                 //   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                 //   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
//                 //   precision={2}
//                 //   onChange={(e) => {
//                 //     record.purchaseRequestAmountHkd = e;
//                 //     record.$form.setFieldsValue({ purchaseRequestAmountHkd: e });
//                 //     handleComputeAmount();
//                 //   }}
//                 // />
//                 <CusInputNumber
//                   precision={2}
//                   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
//                   className='cus-input-money'
//                   onChange={(e) => {
//                     record.purchaseRequestAmountHkd = e;
//                     record.$form.setFieldsValue({ purchaseRequestAmountHkd: e });
//                     handleComputeAmount();
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
//         dataIndex: 'unitPrice',
//         key: 'unitPrice',
//         width: 170,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.Rbudgettype`).d('关联预算类型'),
//         dataIndex: 'contentBudgetType',
//         key: 'contentBudgetType',
//         width: 200,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#contentBudgetType`, {
//         //         initialValue: record.contentBudgetType,
//         //         rules: [
//         //           {
//         //             required: true,
//         //             message: intl.get('hzero.common.validation.notNull', {
//         //               name: intl.get(`${promptCode}.view.title.Rbudgettype`).d('关联预算类型'),
//         //             }),
//         //           },
//         //         ],
//         //       })(
//         //         <CusLov
//         //           textValue={record.contentBudgetType}
//         //           queryParams={{ projectNum: projectNumber }}
//         //           lovOptions={{ displayField: 'projectBudType', valueField: 'id' }}
//         //           code="CMHK.API.C/O"
//         //           onChange={(val, data) => {
//         //             record.contentBudgetType = data.projectBudType;
//         //             record.costCenter = data.costCenterName;
//         //             record.businessActivities = data?.bam;
//         //             record.entryName = data?.name;
//         //             record.budgetNumber = data?.code;
//         //             record.budgetItemNumber = data?.budProjectCode;
//         //             record.$form.setFieldsValue({
//         //               costCenter: data?.costCenterName,
//         //               businessActivities: data?.bam,
//         //               entryName: data?.name,
//         //               budgetNumber: data?.code,
//         //               budgetItemNumber: data?.budProjectCode,
//         //               contentBudgetType: data.projectBudType,
//         //             });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
//         dataIndex: 'expenditureType',
//         key: 'expenditureType',
//         width: 200,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#expenditureType`, {
//         //         initialValue: record.expenditureType,
//         //         rules: [
//         //           {
//         //             required: true,
//         //             message: intl.get('hzero.common.validation.notNull', {
//         //               name: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
//         //             }),
//         //           },
//         //         ],
//         //       })(
//         //         <CusLov
//         //           textValue={record.expenditureType}
//         //           queryParams={{
//         //             budgetProject: record.contentBudgetType,
//         //             purchasingCategory: infomation?.frameworkPrType,
//         //           }}
//         //           lovOptions={{ displayField: 'expenditureType', valueField: 'rowId' }}
//         //           code="CMHK.EXPENDITURE.TYPE"
//         //           onChange={(val, data) => {
//         //             // console.log(data, 'data');
//         //             record.expenditureType = data.expenditureType;
//         //             record.$form.setFieldsValue({
//         //               expenditureType: data.expenditureType,
//         //             });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
//         dataIndex: 'taskCode',
//         key: 'taskCode',
//         width: 200,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#taskCode`, {
//         //         initialValue: record.taskCode,
//         //         rules: [
//         //           {
//         //             required: true,
//         //             message: intl.get('hzero.common.validation.notNull', {
//         //               name: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
//         //             }),
//         //           },
//         //         ],
//         //       })(
//         //         <CusLov
//         //           textValue={record.taskCode}
//         //           queryParams={{ projectCode: infomation?.projectCode }}
//         //           lovOptions={{ displayField: 'code', valueField: 'code' }}
//         //           code="CMHK.API.TASKCODE"
//         //           onChange={(val, data) => {
//         //             record.taskCode = data.code;
//         //             record.taskName = data?.name;
//         //             record.$form.setFieldsValue({
//         //               taskCode: data?.code,
//         //               taskName: data?.name,
//         //             });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
//         dataIndex: 'taskName',
//         key: 'taskName',
//         width: 200,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#taskName`, {
//         //         initialValue: record.taskName,
//         //         rules: [
//         //           {
//         //             required: true,
//         //             message: intl.get('hzero.common.validation.notNull', {
//         //               name: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
//         //             }),
//         //           },
//         //         ],
//         //       })(<Input />)}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: tooltipRender(intl.get(`${promptCode}.view.title.specification`).d('规格型号')),
//         dataIndex: 'matType',
//         key: 'matType',
//         width: 150,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {form.getFieldDecorator(`${record['lineId']}#matType`, {
//         //         initialValue: record.matType,
//         //       })(
//         //         <CusInput.TextArea
//         //           autoChangeSize
//         //           onChange={(val) => {
//         //             record.matType = val.target.value;
//         //             record.$form.setFieldsValue({ matType: val.target.value });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: tooltipRender(intl.get(`${promptCode}.view.title.unit`).d('单位')),
//         dataIndex: 'unit',
//         key: 'unit',
//         width: 180,
//         render: tooltipRender,
//         // render: (val, record) => {
//         //   return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//         //     <Form.Item>
//         //       {record.$form.getFieldDecorator(`${record['lineId']}#unit`, {
//         //         initialValue: record.unit,
//         //         rules: [
//         //           {
//         //             required: true,
//         //             message: intl.get('hzero.common.validation.notNull', {
//         //               name: intl.get(`${promptCode}.view.title.unit`).d('单位'),
//         //             }),
//         //           },
//         //         ],
//         //       })(
//         //         <CusLov
//         //           textValue={record.unit}
//         //           lovOptions={{ displayField: 'uomName', valueField: 'uomCode' }}
//         //           code="CMHKHPFM.UOM"
//         //           onChange={(val, data) => {
//         //             record.unit = data?.uomCode;
//         //             record.$form.setFieldsValue({
//         //               unit: data?.uomCode,
//         //             });
//         //           }}
//         //         />
//         //       )}
//         //     </Form.Item>
//         //   ) : (
//         //     <span>{val}</span>
//         //   );
//         // },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
//         dataIndex: 'costcenterName',
//         key: 'costcenterName',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
//         dataIndex: 'businessActivitiesName',
//         key: 'businessActivitiesName',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.projectname`).d('项目名称'),
//         dataIndex: 'entryName',
//         key: 'entryName',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
//         dataIndex: 'budgetNumber',
//         key: 'budgetNumber',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
//         dataIndex: 'budgetItemNumber',
//         key: 'budgetItemNumber',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
//         dataIndex: 'poNumber',
//         key: 'poNumber',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
//         dataIndex: 'warrantyPeriod',
//         key: 'warrantyPeriod',
//         width: 200,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`warrantyPeriod`, {
//                 initialValue: record.warrantyPeriod,
//               })(
//                 <CusInput.TextArea
//                   autoChangeSize
//                   onChange={(val) => {
//                     record.warrantyPeriod = val.target.value;
//                     record.$form.setFieldsValue({ warrantyPeriod: val.target.value });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
//         dataIndex: 'deliverAddress',
//         key: 'deliverAddress',
//         required: true,
//         width: 200,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`deliverAddress`, {
//                 initialValue: record.deliverAddress,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
//                     }),
//                   },
//                 ],
//               })(
//                 <CusLov
//                   textValue={record.deliverAddress}
//                   lovOptions={{ displayField: 'detailedAddress', valueField: 'detailedAddress' }}
//                   code="CMHK.ERP.ADDRESS"
//                   onChange={(val, data) => {
//                     if (!val) {
//                       record.deliverContact = null;
//                       record.deliverAddress = null;
//                       record.deliveryPhoneNumber = null;
//                       record.deliverContactCode = null;
//                       record.$form.setFieldsValue({
//                         deliverContact: null,
//                         deliverAddress: null,
//                         deliveryPhoneNumber: null,
//                         deliverContactCode: null
//                       });
//                     } else {
//                       record.deliverContact = data.name;
//                       record.deliverAddress = data.detailedAddress;
//                       record.deliveryPhoneNumber = data.contactTel;
//                       record.deliverContactCode = data?.employeeNumber
//                       record.$form.setFieldsValue({
//                         deliverContact: data.name,
//                         deliverAddress: data.detailedAddress,
//                         deliveryPhoneNumber: data.contactTel,
//                         deliverContactCode: data?.employeeNumber
//                       });
//                     }
//                     form.resetFields([`deliveryPhoneNumber`, `deliverContact`])
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
//         dataIndex: 'deliverContact',
//         key: 'deliverContact',
//         width: 200,
//         required: true,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`deliverContact`, {
//                 initialValue: record.deliverContact,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl
//                         .get(`${promptCode}.view.title.deliveryaddresscontacter`)
//                         .d('送货地址联系人'),
//                     }),
//                   },
//                 ],
//               })(
//                 <CusLov
//                   disabled={!record.deliverAddress}
//                   textValue={record.deliverContact}
//                   textField={record.deliverContact}
//                   lovOptions={{ displayField: 'name', valueField: 'rowId' }}
//                   code="CMHK.API.DELIVERYADDRESSPERSON"
//                   onChange={(val, data) => {
// //                    record.deliverAddress = data?.detailedAddress;
//                     if (!record.deliverContact) {
//                       record.deliverContact = data?.name;
//                       record.deliveryPhoneNumber = data?.contactTel;
//                       record.deliverContactCode = data?.employeeNumber;
//                     }
//                     record.deliverContact = data?.name;
//                     record.deliveryPhoneNumber = data?.contactTel;
//                     record.deliverContactCode = data?.employeeNumber;
//                     record.$form.setFieldsValue({
//                       deliverContact: data?.name,
//                       deliveryPhoneNumber: data?.contactTel,
//                       deliverContactCode: data?.employeeNumber,
//                     });
//                     form.resetFields(`deliveryPhoneNumber`)
//                     // console.log('data?.employeeNumber', data?.employeeNumber)
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
//         dataIndex: 'deliveryPhoneNumber',
//         key: 'deliveryPhoneNumber',
//         required: true,
//         width: 150,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`deliveryPhoneNumber`, {
//                 initialValue: record.deliveryPhoneNumber,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl
//                         .get(`${promptCode}.view.title.DeliveryPhonenumber`)
//                         .d('送货联系电话'),
//                     }),
//                   },
//                 ],
//               })(
//                 <Input
//                   onBlur={(val) => {
//                     record.deliveryPhoneNumber = val.target.value;
//                     record.$form.setFieldsValue({ deliveryPhoneNumber: val.target.value });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.NameofWinningSupplier`).d('中标供应商名称'),
//         dataIndex: 'winningSupplier',
//         key: 'winningSupplier',
//         width: 150,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
//         dataIndex: 'deliverAddressBakup',
//         key: 'deliverAddressBakup',
//         width: 200,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`deliverAddressBakup`, {
//                 initialValue: record.deliverAddressBakup,
//               })(
//                 <CusInput.TextArea
//                   autoChangeSize
//                   onChange={(val) => {
//                     record.deliverAddressBakup = val.target.value;
//                     record.$form.setFieldsValue({ deliverAddressBakup: val.target.value });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
//         dataIndex: 'deliverDate',
//         key: 'deliverDate',
//         required: true,
//         width: 150,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`deliverDate`, {
//                 initialValue: record.deliverDate ? dayjs(record.deliverDate, 'YYYY-MM-DD') : null,
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
//                     }),
//                   },
//                 ],
//               })(
//                 <CusDatePicker
//                   format={'YYYY-MM-DD'}
//                   disabledDate={(currentDate) => {
//                     return currentDate.isBefore(dayjs().format('YYYY-MM-DD'));
//                   }}
//                   onChange={(val) => {
//                     record.deliverDate = dayjs(val).format('YYYY-MM-DD');
//                     record.$form.setFieldsValue({ deliverDate: dayjs(val).format('YYYY-MM-DD') });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
//         dataIndex: 'purchasePrice',
//         key: 'purchasePrice',
//         width: 200,
//         render: tooltipRender,
//       },
//       {
//         title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
//         dataIndex: 'remark',
//         key: 'remark',
//         width: 200,
//         render: (val, record) => {
//           return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
//             <Form.Item>
//               {record.$form.getFieldDecorator(`remark`, {
//                 initialValue: record.remark,
//               })(
//                 <CusInput.TextArea
//                   autoChangeSize
//                   onChange={(val) => {
//                     record.remark = val.target.value;
//                     record.$form.setFieldsValue({ remark: val.target.value });
//                   }}
//                 />
//               )}
//             </Form.Item>
//           ) : (
//             <span>{val}</span>
//           );
//         },
//       },
//     ];

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 80,
        render: (val, record, index) => {
          return <span>{index + 1}</span>
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型'),
        dataIndex: 'contentBudgetType',
        required: true,
        width: 160,
        render: (_, record) => {
          console.log('record', record);
          if(record.isNewOrOld === 'Old') {
            if(['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(record.purchasingCategory)) {
              record.contentBudgetType = 'OPEX';
            } else if(['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(record.purchasingCategory)) {
              record.contentBudgetType = 'CAPEX';
            } else {
              record.contentBudgetType = '';
            }
            return (
              <div>{record.contentBudgetType}</div>
            )
          } else {
            return (
              <div>{record.contentBudgetType}</div>
            )
          }
        }
        // render: (_, record) => {
        //   return (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator(`contentBudgetType`, {
        //         initialValue: record?.contentBudgetType,
        //         rules: [
        //           {
        //             required: true,
        //             message: intl.get('hzero.common.validation.notNull', {
        //               name: intl.get(`${promptCode}.view.title.Rbudgettype`).d('预算类型'),
        //             }),
        //           },
        //         ],
        //       })(
        //           <CusSelect
        //             lovCode="HKPC.BUDGETTYPE"
        //             allowClear
        //             textValue={record.contentBudgetType}
        //             popupClassName="customize-select"
        //             onChange={(value) => {
        //               record.purchasingCategory = null;
        //               record.purchasingCategoriesCode = null;
        //               record.matCode = null;
        //               record.expenditureType = null;
        //               record.$form.setFieldsValue({
        //                 purchasingCategory: null,
        //                 purchasingCategoriesCode: null,
        //                 expenditureType: null,
        //                 matCode: null
        //               })
        //               this.budgetTypeOnChange2(value, record)
        //             }}
        //             style={{ width: '100%' }}
        //             placeholder={intl.get(`${promptCode}.view.title.inputbudgettype`).d('请选择预算类型')}
        //             disabled={isEdit}
        //           />
        //         )}
        //     </Form.Item>
        //   )
        // }
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategory',
        required: true,
        width: 230,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            if(record.isNewOrOld === 'Old') {
              const oldPurchasingCategoryList = (record?.oldPurchasingCategory || []).map((item) => ({
                meaning: item.purchasingCategoryName,
                value: item.purchasingCategory
              }))
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`purchasingCategory`, {
                    initialValue: record?.purchasingCategory,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
                      }),
                    }],
                  })(
                    <CusSelect
                      options={(purchasingCategoryList.length > 0 ? purchasingCategoryList : null) || oldPurchasingCategoryList}
                      onChange={(e, a) => {
                        record.purchasingCategory = e;
                        // record.expenditureType = null;
                        // record.matCode = null;
                      }}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              )
            } else {
              return (
                tooltipRender(record.purchasingCategoryMeaning)
              )
            }
          } else {
            return (
              tooltipRender(record.purchasingCategoryMeaning)
            )
          }
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
        dataIndex: 'matCode',
        width: 180,
        required: true,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`matId`, {
                  initialValue: record?.matCode,
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
                  code="CMHK.CATEGORY.ORGANIZATION.NEW"
                  queryParams={{
                    purchasingCategory: record.purchasingCategory,
                    frameworkCode: infomation?.associatedAgreement,
                  }}
                  lovOptions={{ displayField: 'itemNumber', valueField: 'id' }}
                  onChange={(val, data) => {
                    record.matCode = data.itemnumber; // 物料编号
                    record.matName = data?.itemdescription; // 物料名称
                    record.unitPrice = data?.price; // 单价
                    record.contentBudgetType = data?.budgettype; // 关联预算类型
                    record.expenditureType = data?.expensetype; // 支出类型
                    record.taskCode = data?.tasknumber; // 任务编码
                    record.taskName = data?.taskname; // 任务名称
                    record.matType = data?.itemlongdescription; // 规格型号
                    record.unit = data?.unitofmeasure; // 单位名称
                    record.costcenter = data?.actualcostcenter ? data?.actualcostcenter : record.costcenter; // 成本中心code
                    record.costcenterName = data?.costcentername ? data?.costcentername : record.costcenterName; // 成本中心名称
                    record.businessActivities = data?.bam ? data?.bam : record.businessActivities; // 业务活动code
                    record.businessActivitiesName = data?.operatingactivityname ? data?.operatingactivityname : record.businessActivitiesName; // 业务活动名称
                    record.entryName = data?.projectname; // 项目名称
                    record.budgetNumber = data?.projectnumber || infomation?.projectCode; // 预算编号
                    record.budgetItemNumber = data?.budgetnumber ? data?.budgetnumber : record.budgetItemNumber; // 预算项目编号
                    record.poNumber = data?.poNumber; // 上次PO单号
                    record.purchasePrice = data?.purchasePrice; // 上次采购价 (HKD）
                    record.exchangeRate = data?.exchangeRate; // 汇率
                    record.warrantyPeriod = data?.warranty; // 质保期
                    record.purchasingCategory = data?.prType; // 采购类别code
                    record.purchasingCategoryMeaning = data?.prTypeMeaning; // 采购类别名称
                    record.isNewOrOld = data?.isNewOrOld; // 是否旧PO数据(New=>新;Old=>旧)
                    record.invOrgCode = data?.invOrgCode; // 采购类型
                    record.lineNumber = data?.linenumber; // 行号
                    record.$form.setFieldsValue({
                      matCode: data.itemnumber, // 物料编号
                      matName: data?.itemdescription, // 物料名称
                      unitPrice: data?.price, // 单价
                      contentBudgetType: data?.budgettype, // 关联预算类型
                      expenditureType: data?.expensetype, // 支出类型
                      taskCode: data?.tasknumber, // 任务编码
                      taskName: data?.taskname, // 任务名称
                      matType: data?.itemlongdescription, // 规格型号
                      unit: data?.unitofmeasure, // 单位名称
                      costcenter: data?.actualcostcenter, // 成本中心code
                      costcenterName: data?.costcentername, // 成本中心名称
                      businessActivities: data?.bam, // 业务活动code
                      businessActivitiesName: data?.operatingactivityname, // 业务活动名称
                      entryName: data?.projectname, // 项目名称
                      budgetNumber: data?.projectnumber, // 预算编号
                      budgetItemNumber: data?.budgetnumber, // 预算项目编号
                      poNumber: data?.poNumber, // 上次PO单号
                      purchasePrice: data?.purchasePrice, // 上次采购价 (HKD）
                      exchangeRate: data?.exchangeRate, // 汇率
                      warrantyPeriod: data?.warranty, // 质保期
                      purchasingCategory: data?.prType, // 采购类别code
                      purchasingCategoryMeaning: data?.prTypeMeaning, // 采购类别名称
                      isNewOrOld: data?.isNewOrOld, // 是否旧PO数据(New=>新;Old=>旧)
                      invOrgCode: data?.invOrgCode, // 采购类型
                      lineNumber: data?.linenumber, // 行号
                    });
                    // handleNumber();
                    if(record.isNewOrOld === 'Old') {
                      this.handlePurchasingCategory(record);
                    }
                  }}
                  textValue={record.matCode}
                />
                )}
              </Form.Item>
            )
          } else {
            return (
              <span>{record.matCode}</span>
            )
          }
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'matName',
        dataIndex: 'matName',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        width: 200,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`matType`, {
                  initialValue: record?.matType,
                })(
                  <CusInput.TextArea
                    autoChangeSize
                    onChange={(e) => {
                      record.matType = e.target.value;
                    }}
                  />
                )}
              </Form.Item>
            )
          } else {
            return (
              tooltipRender(record.matType)
            )
          }
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'qty',
        required: true,
        width: 200,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`qty`, {
                  initialValue: record?.qty,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    step={0.01}
                    allowThousandth
                    precision={4}
                    onChange={(e) => {
                      record.qty = e;
                      record.purchaseRequestAmountHkd = (e || 0) * (record.unitPrice || 0) * (record.exchangeRate || 0);
                      // record.purchaseAmountHkdSummary = parseFloat(record.purchaseRequestAmountHkd || 0) + parseFloat(record.otherExpensePrice || 0);
                      handleComputeAmount();
                    }}
                  />
                )}
              </Form.Item>
            )
          } else {
            return (
              tooltipRender(record.qty)
            )
          }
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价'),
        dataIndex: 'unitPrice',
        required: true,
        width: 200,
        render: (_, record) => {
          if (infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`unitPrice`, {
                  initialValue: record?.unitPrice,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    step={0.01}
                    allowThousandth
                    precision={4}
                    onChange={(e) => {
                      record.unitPrice = e;
                      record.purchaseRequestAmountHkd =
                        (record.qty || 0) *
                        (e || 0) *
                        (record.exchangeRate || 0);
                      // record.purchaseAmountHkdSummary = parseFloat(record.purchaseRequestAmountHkd || 0) + parseFloat(record.otherExpensePrice || 0);
                      handleComputeAmount();
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (
              <div style={{ textAlign: 'right' }}>
                {tooltipRender(numberRender(record.unitPrice, 4))}
              </div>
            );
          }
          // return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.unitPrice, 2))}</div>;
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
        dataIndex: 'purchaseRequestAmountHkd',
        width: 200,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchaseRequestAmountHkd, 4))}</div>;
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
      // {
      //   title: intl.get(`${promptCode}.view.title`).d('采购金额汇总（HKD）'),
      //   dataIndex: 'purchaseAmountHkdSummary',
      //   width: 200,
      //   render: (_, record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchaseAmountHkdSummary, 2))}</div>;
      //   },
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.BudgetProjectName1`).d('项目名称'),
      //   dataIndex: 'entryName',
      //   width: 200,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
      //   dataIndex: 'budgetNumber',
      //   width: 200,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）'),
      //   dataIndex: 'supplierQuotationHkd',
      //   width: 200,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
      //   dataIndex: 'supplierQuotationOri',
      //   width: 200,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliverAddress',
        width: 200,
        required: true,
        render: (val, record, recordIndex) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverAddressId`, {
                initialValue: record.deliverAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
                    }),
                  },
                ],
              })(
                <CusLov
                  textValue={record.deliverAddress}
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'id' }}
                  code="CMHK.ERP.ADDRESS"
                  onChange={(val, data) => {
                    if (!val) {
                      record.addressCode = null;
                      record.deliverContact = null;
                      record.deliverAddress = null;
                      record.deliveryPhoneNumber = null;
                      record.deliverContactCode = null;
                      record.$form.setFieldsValue({
                        addressCode: null,
                        deliverContact: null,
                        deliverAddress: null,
                        deliveryPhoneNumber: null,
                        deliverContactCode: null
                      });
                    } else {
                      record.addressCode = data.addressCode;
                      record.deliverContact = data.name;
                      record.deliverAddress = data.detailedAddress;
                      record.deliveryPhoneNumber = data.contactTel;
                      record.deliverContactCode = data?.employeeNumber
                      record.$form.setFieldsValue({
                        addressCode: data.addressCode,
                        deliverContact: data.name,
                        deliverAddress: data.detailedAddress,
                        deliveryPhoneNumber: data.contactTel,
                        deliverContactCode: data?.employeeNumber
                      });
                    }
                    form.resetFields([`deliveryPhoneNumber`, `deliverContact`])
                    const dataLineSource = purchaseApplicationLineSource?.map((item) => {
                      if(recordIndex === 0 && !(item?.deliverAddress)) {
                        item.deliverAddress = data?.detailedAddress;
                        item.addressCode = data?.addressCode;
                        item.deliverContact = data?.name;
                        item.deliveryPhoneNumber = data?.contactTel;
                        item.deliverContactCode = data?.employeeNumber
                      }
                      return item;
                    })
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        purchaseApplicationLineSource: dataLineSource,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliverContact',
        width: 200,
        required: true,
        render: (val, record) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverContactId`, {
                initialValue: record.deliverContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.deliveryaddresscontacter`)
                        .d('送货地址联系人'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={!record.deliverAddress}
                  textValue={record.deliverContact}
                  lovOptions={{ displayField: 'name', valueField: 'rowId' }}
                  code="CMHK.API.DELIVERYADDRESSPERSON"
                  onChange={(val, data) => {
                    if (!record.deliverContact) {
                      record.deliverContact = data?.name;
                      record.deliveryPhoneNumber = data?.contactTel;
                      record.deliverContactCode = data?.employeeNumber;
                    }
                    record.deliverContact = data?.name;
                    record.deliveryPhoneNumber = data?.contactTel;
                    record.deliverContactCode = data?.employeeNumber;
                    record.$form.setFieldsValue({
                      deliverContact: data?.name,
                      deliveryPhoneNumber: data?.contactTel,
                      deliverContactCode: data?.employeeNumber,
                    });
                    form.resetFields(`${record['lineId']}#deliveryPhoneNumber`)
                    // console.log('data?.employeeNumber', data?.employeeNumber)
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliverAddressBakup',
        width: 200,
        render: (val, record) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverAddressBakup`, {
                initialValue: record.deliverAddressBakup,
              })(
                <CusInput.TextArea
                  autoChangeSize
                  onChange={(val) => {
                    record.deliverAddressBakup = val.target.value;
                    record.$form.setFieldsValue({ deliverAddressBakup: val.target.value });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliverDate',
        width: 200,
        required: true,
        render: (val, record, recordIndex) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverDate`, {
                initialValue: record.deliverDate ? dayjs(record.deliverDate, 'YYYY-MM-DD') : null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  format={'YYYY-MM-DD'}
                  disabledDate={(currentDate) => {
                    return currentDate.isBefore(dayjs().format('YYYY-MM-DD'));
                  }}
                  onChange={(val) => {
                    record.deliverDate = val ? dayjs(val).format('YYYY-MM-DD') : null;
                    record.$form.setFieldsValue({ deliverDate: val ? dayjs(val).format('YYYY-MM-DD') : null });
                    const dataLineSource = purchaseApplicationLineSource?.map((item) => {
                    if(recordIndex === 0 && !(item?.deliverDate)) {
                      item.deliverDate = val ? dayjs(val).format('YYYY-MM-DD') : null;
                    }
                      return item;
                    })
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        purchaseApplicationLineSource: dataLineSource,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        width: 200,
        required: true,
        render: (val, record) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliveryPhoneNumber`, {
                initialValue: record.deliveryPhoneNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.DeliveryPhonenumber`)
                        .d('送货联系电话'),
                    }),
                  },
                ],
              })(
                <CusInput
                  onBlur={(val) => {
                    record.deliveryPhoneNumber = val.target.value;
                    record.$form.setFieldsValue({ deliveryPhoneNumber: val.target.value });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetItemNumber',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warrantyPeriod',
        width: 200,
        render: tooltipRender,
      },
      {
        title: labelTip({
          label: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
          tip: intl.get(`${promptCode}.view.title.expendituretypeinfo`).d('若预算类型为Opex，可不填支出类型'),
        }),
        dataIndex: 'expenditureType',
        width: 180,
        render: (_, record) => {
          const budgetProject = record.contentBudgetType;
          const procurementType = record.purchasingCategory;
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            if(record.contentBudgetType === 'CAPEX') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`expenditureTypeVal`, {
                    initialValue: record?.expenditureType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
                        }),
                      },
                    ],
                  })(
                    <CusLov style={{ width: '100%' }}
                      code='CMHK.EXPENDITURE.TYPE'
                      queryParams={{ budgetProject, procurementType }}
                      lovOptions={{ displayField: 'expenditureType', valueField: 'id' }}
                      onChange={(_, lovRecord) => {
                        record.expenditureType = lovRecord.expenditureType
                      }}
                      textValue={record.expenditureType}
                    />
                  )}
                </Form.Item>
              )
            } else {
              return (
                tooltipRender(record.expenditureType)
              )
            }
          } else {
            return (
              tooltipRender(record.expenditureType)
            )
          }
        }
      },
      {
        title: labelTip({
          label: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
          tip: intl.get(`${promptCode}.view.title.tasknote`).d('若预算类型为Opex，可不填任务编码')
        }),
        dataIndex: 'taskCode',
        width: 200,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            if(record.isNewOrOld === 'Old' && record.contentBudgetType === 'CAPEX') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`taskCode`, {
                    initialValue: record.taskCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
                        }),
                      },
                    ],
                  })(
                    <CusLov
                      textValue={record.taskCode}
                      queryParams={{ projectCode: record?.budgetNumber }}
                      lovOptions={{ displayField: 'code', valueField: 'code' }}
                      code="CMHK.API.TASKCODE"
                      onChange={(val, data) => {
                        record.taskCode = data.code;
                        record.taskName = data?.name;
                        record.$form.setFieldsValue({
                          taskCode: data?.code,
                          taskName: data?.name,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              )
            } else {
              return (
                tooltipRender(record.taskCode)
              )
            }
          } else {
            return (
              tooltipRender(record.taskCode)
            )
          }
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
        dataIndex: 'taskName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costcenterName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        width: 200,
        render: (_, record) => {
          if(infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '') {
            if(record.isNewOrOld === 'Old' && record.contentBudgetType === 'OPEX') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`businessActivitiesName`, {
                    initialValue: record?.businessActivitiesName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
                        }),
                      },
                    ],
                  })(
                    <CusLov
                      code="CPEX.OPEX"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        projectCode: record.budgetNumber,
                        applyType: related,
                      }}
                      isInitVal
                      textValue={record.businessActivitiesName}
                      onChange={(_, item) => {
                        record.budgetItemNumber = item.budCode; // 预算项目编码
                        record.businessActivities = item.busActivityCode; // 业务活动编码
                        record.businessActivitiesName = item.busActivityName; // 业务活动名称
                        record.costcenter = item.costCenterCode; // 成本中心编码
                        record.costcenterName = item.costCenternName; // 成本中心名称
                      }}
                    />
                  )}
                </Form.Item>
              )
            } else {
              return (
                tooltipRender(record.businessActivitiesName)
              )
            }
          } else {
            return (
              tooltipRender(record.businessActivitiesName)
            )
          }
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.NameofWinningSupplier`).d('中标供应商名称'),
        dataIndex: 'winningSupplier',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
              })(
                <CusInput.TextArea
                  autoChangeSize
                  onChange={(e) => {
                    record.remark = e.target.value;
                    record.$form.setFieldsValue({ remark: e.target.value });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
        dataIndex: 'poNumber',
        width: 200,
        render: (val, record) => {
          return infomation?.prStatus == 'PENDING_REFER' || infomation?.prStatus == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`poLineId`, {
                initialValue: record.poNumber,
              })(
                <CusLov
                  textValue={record.poNumber}
                  code="CMHK.PO.INFO"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    itemCode: record?.matCode, // 物料编码
                    organizationCode: record?.invOrgCode, // 库存组织编码
                  }}
                  onChange={(_, data) => {
                    record.poNumber = data.poNumber;
                    record.purchasePrice = data.price;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
        dataIndex: 'purchasePrice',
        width: 200,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchasePrice, 4))}</div>;
        },
      },
    ];
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled: infomation?.prStatus != 'PENDING_REFER' && infomation?.prStatus != '',
      }),
    };
    return (
      <>
        <EditTable
          rowKey="lineId"
          dataSource={purchaseApplicationLineSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
