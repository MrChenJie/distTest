import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';
import { numberRender, dateRender } from 'utils/renderer';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import { filter } from 'lodash';
import CusInput from '_cus_components/CusInput';

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class ImproveMaterial extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      dataSource,
      materialFlag = false,
      isOnly,
      contractBidWinningResult,
      projectNumberArray,
    } = this.props;

    const {
      infoSource: { projectCode, projectType },
      enumMap = {},
    } = contractBidWinningResult;

    const { category = [], budgetType = [] } = enumMap;

    // console.log('purchaseCategoryVal', purchaseCategoryVal)

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.SN').d('序号'),
        key: 'orderSeq',
        dataIndex: 'orderSeq',
        width: 75,
        render: (_, record, index) => {
          return <div style={{ textAlign: 'center' }}>{index + 1}</div>;
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
        key: 'budgetType',
        dataIndex: 'budgetType',
        required: true,
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator, setFieldsValue } = record.$form;
          let budgetTypeListData;
          if(projectType == '2') {
            budgetTypeListData = filter(budgetType, (item) =>
              ['INVENTORY'].includes(item.value)
            );
          } else {
            budgetTypeListData = filter(budgetType, (item) =>
              ['CAPEX', 'OPEX'].includes(item.value)
            );
          }
          return (
            <Form.Item>
              {getFieldDecorator('budgetType', {
                initialValue: record.budgetType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
                    }),
                  },
                ],
              })(
                isOnly ? (
                  // <CusLov
                  //   code="CMHK.API.C/O"
                  //   queryParams={{ tenantId, projectNum: projectCode }}
                  //   lovOptions={{ displayField: 'projectBudType', valueField: 'id' }}
                  //   textValue={record.budgetType}
                  //   onChange={(_, item) => {
                  //     record.proName = item.name; // 项目名称
                  //     record.costCenter = item.costCenterName; // 成本中心名称
                  //     record.costCenterCode = item.costCenterCode; // 成本中心编号
                  //     record.operationalAction = item.busActivityName; // 业务活动名称
                  //     record.operationalActionCode = item.busActivityCode; // 业务活动编号
                  //     record.budgetCoding = item.code; // 预算编号
                  //     record.budgetProCode = item.budProjectCode; // 预算项目编号
                  //     record.budgetType = item.projectBudType; // 预算类型
                  //     record.availableAmount = item.availableAmount; // 余额
                  //     if(!record.budgetType) {
                  //       setFieldsValue({
                  //         expenditureType: null
                  //       })
                  //     }
                  //   }}
                  //   />
                  <CusSelect
                    disabled={!record.budgetType}
                    options={budgetTypeListData}
                    lazyLoad={false}
                    onChange={(e) => {
                      record.budgetType = e;
                      record.purchaseCategoryMeaning = null;
                      record.purchaseCategory = null;
                      record.operationalAction = null;
                      record.expenditureType = null;
                      record.taskCode= null;
                      record.$form.setFieldsValue({
                        purchaeCategoryMeaning: null,
                        purchaseCategory: null,
                        operationalAction: null,
                        expenditureType: null,
                        taskCode: null,
                      });
                    }}
                  />
                ) : (
                  tooltipRender(record.budgetType)
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchaseCategory',
        required: true,
        width: 350,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          let purchaseCategoryFilteredData
          if(record.budgetType === 'OPEX') {
            purchaseCategoryFilteredData = filter(category, (item) =>
              ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
            );
          } else if(record.budgetType === 'CAPEX') {
            purchaseCategoryFilteredData = filter(category, (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = filter(category, (item) =>
              ['INV', 'INV_ICTS', 'INVS_COUP'].includes(item.value)
            );
          }
          return (
            <Form.Item>
              {getFieldDecorator('purchaseCategory', {
                initialValue: record?.purchaseCategory,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
                    }),
                  },
                ],
              })(
                isOnly ? (
                  <CusSelect options={purchaseCategoryFilteredData} lazyLoad={false} allowClear />
                ) : (
                  tooltipRender(record.purchasingCategoryMeaning)
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.materialcode').d('物料编码'),
        key: 'materialCode',
        dataIndex: 'materialCode',
        required: true,
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator, getFieldValue } = record.$form;
          const purchaseCategoryVal = getFieldValue('purchaseCategory');
          return (
            <Form.Item>
              {getFieldDecorator('materialCode', {
                initialValue: record.materialCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.materialcode').d('物料编码'),
                    }),
                  },
                ],
              })(
                isOnly ? (
                  <CusLov
                    code="CMHK.CATEGORY.ORGANIZATION"
                    textValue={record.materialCode}
                    disabled={!purchaseCategoryVal || !isOnly}
                    queryParams={{ tenantId, purchasingCategory: purchaseCategoryVal }}
                    lovOptions={{ displayField: 'itemNumber', valueField: 'itemNumber' }}
                    onChange={(_, item) => {
                      record.realMatName = item.itemDescription; // 选择完后的物料名称
                      record.materialCode = item.itemNumber; // 物料编码
                      record.unit = item.uomCode; // 单位
                      record.organizationCode = item.organizationCode; // 组织编码
                      record.lastPoNo = null;
                      record.lastPurchasePriceHkd = null;
                      record.$form.setFieldsValue({
                        lastPoNo: null
                      })
                    }}
                  />
                ) : (
                  tooltipRender(record.materialCode)
                )
              )}
            </Form.Item>
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
        key: 'materialName',
        dataIndex: 'materialName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.specification').d('规格型号'),
        key: 'specificationModel',
        dataIndex: 'specificationModel',
        width: 180,
        // render: (_, record) => {
        //   // const { getFieldDecorator } = record.$form;
        //   return tooltipRender(record.specificationModel);
        //   // <Form.Item>
        //   //   {getFieldDecorator(`specificationModel`, {
        //   //     initialValue: record?.specificationModel,
        //   //   })(
        //   //     isOnly ? (
        //   //       <CusInput.TextArea autoChangeSize />
        //   //     ) : (
        //   //       tooltipRender(record.specificationModel)
        //   //     )
        //   //   )}
        //   // </Form.Item>
        // },
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`specificationModel`, {
                initialValue: record?.specificationModel,
              })(
                isOnly ? (
                  <CusInput.TextArea autoChangeSize />
                ) : (
                  tooltipRender(record.specificationModel)
                )
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.unit').d('单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 180,
        render: tooltipRender,
      },
      projectNumberArray.length < 2 && ['0', '1'].includes(projectType) && {
        title: labelTip({
          label: intl.get(`HKPC.commom.view.title.Expendituretype`).d('支出类型'),
          tip: intl.get(`HKPC.commom.view.title.expendituretypeinfo`).d('若预算类型为Opex，可不填支出类型'),
        }),
        dataIndex: 'expenditureType',
        width: 270,
        render: (_, record) => {
          const { getFieldDecorator, getFieldValue } = record.$form;
          const purchaseCategoryVal = getFieldValue('purchaseCategory');
          return (
            <Form.Item>
              {getFieldDecorator(`expenditureType`, {
                initialValue: record?.expenditureType,
                rules: [
                  {
                    required: record.budgetType === 'OPEX' ? false : true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.Expendituretype`).d('支出类型'),
                    }),
                  },
                ],
              })(
                isOnly ? (
                  record.budgetType === 'CAPEX' ? (
                    <CusLov
                      style={{ width: '100%' }}
                      code="CMHK.EXPENDITURE.TYPE"
                      queryParams={{
                        budgetProject: record.budgetType,
                        procurementType: purchaseCategoryVal,
                      }}
                      lovOptions={{
                        displayField: 'expenditureType',
                        valueField: 'expenditureType',
                      }}
                      onChange={(_, lovRecord) => {
                        record.expenditureType = lovRecord.expenditureType;
                      }}
                      textValue={record.expenditureType}
                      disabled={!(record.budgetType && purchaseCategoryVal)}
                    />
                  ) : (
                    <></>
                  )
                ) : (
                  tooltipRender(record.expenditureType)
                )
              )}
            </Form.Item>
          );
        },
      },
      projectNumberArray.length < 2 && ['0', '1'].includes(projectType) && {
        title: labelTip({
          label: intl.get(`HKPC.commom.view.title.tasknumber`).d('任务编码'),
          tip: intl.get(`HKPC.commom.view.title.tasknote`).d('若预算类型为Opex，可不填任务编码'),
        }),
        dataIndex: 'taskCode',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`taskCode`, {
                initialValue: record?.taskCode,
                rules: [
                  {
                    required: record.budgetType === 'OPEX' ? false : true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.tasknumber`).d('任务编码'),
                    }),
                  },
                ],
              })(
                isOnly ? (
                  record.budgetType === 'CAPEX' ? (
                    <CusLov
                      style={{ width: '100%' }}
                      code="CMHK.API.TASKCODE"
                      queryParams={{ projectCode: projectCode }}
                      lovOptions={{ displayField: 'code', valueField: 'code' }}
                      onChange={(_, lovRecord) => {
                        record.taskCode = lovRecord.code;
                        record.taskName = lovRecord.name; // 更改任务名称
                      }}
                      textValue={record.taskCode}
                    />
                  ) : (
                    <></>
                  )
                ) : (
                  tooltipRender(record.taskCode)
                )
              )}
            </Form.Item>
          );
        },
      },
      projectNumberArray.length < 2 && ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.taskname`).d('任务名称'),
        dataIndex: 'taskName',
        width: 200,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get('HKPC.commom.view.title.costcenter').d('成本中心'),
        key: 'costCenter',
        dataIndex: 'costCenter',
        width: 180,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: labelTip({
          label: intl.get('HKPC.commom.view.title.BusinessActivities').d('业务活动'),
          tip: intl.get(`HKPC.commom.view.title.businessactivity`).d('若预算类型为Opex，可不填业务活动'),
        }),
        key: 'operationalAction',
        dataIndex: 'operationalAction',
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`operationalAction`, {
                initialValue: record?.operationalAction,
                rules: [
                  {
                    required: isOnly && record.budgetType === 'OPEX',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.BusinessActivities').d('业务活动'),
                    }),
                  },
                ],
              })(
                isOnly && record.budgetType === 'OPEX' ? (
                  <CusLov
                    code="CPEX.OPEX"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      projectCode: projectCode,
                      applyType: projectType,
                    }}
                    textValue={record.operationalAction}
                    onChange={(_, item) => {
                      record.budgetProCode = item.budCode; // 预算项目编码
                      record.operationalActionCode = item.busActivityCode; // 业务活动编码
                      record.operationalAction = item.busActivityName; // 业务活动名称
                      record.costCenterCode = item.costCenterCode; // 成本中心编码
                      record.costCenter = item.costCenternName; // 成本中心名称
                    }}
                  />
                ) : (
                  tooltipRender(record.operationalAction)
                )
              )}
            </Form.Item>
          );
        },
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get('HKPC.commom.view.title.BudgetProjectnumber').d('预算项目编号'),
        key: 'budgetProCode',
        dataIndex: 'budgetProCode',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.quantity').d('数量'),
        key: 'quantity',
        dataIndex: 'quantity',
        width: 180,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{record.quantity}</div>;
        },
      },
      // {
      //   title: intl.get('HKPC.commom.view.title.PRAmountH').d('采购申请金额（HKD）'),
      //   key: 'appliedAmount',
      //   dataIndex: 'appliedAmount',
      //   required: true,
      //   width: 180,
      //   render: (_, record) => {
      //     const { getFieldDecorator } = record.$form;
      //     return (
      //       <Form.Item>
      //         {getFieldDecorator(`appliedAmount`, {
      //           initialValue: record.appliedAmount,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get('HKPC.commom.view.title.PRAmountH').d('采购申请金额（HKD）'),
      //               }),
      //             },
      //           ]
      //         })(
      //           isOnly ?
      //             <CusInputNumber
      //               precision={2}
      //               formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      //               parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
      //               className="cus-input-money"
      //               disabled={!isOnly}
      //             />
      //             :
      //             <div style={{ textAlign: 'right' }}>
      //               {numberRender(record.appliedAmount, 2)}
      //             </div>
      //         )}
      //       </Form.Item>
      //     )
      //   }
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.UnitPrice').d('单价'),
      //   key: 'unitPrice',
      //   dataIndex: 'unitPrice',
      //   width: 180,
      //   render: (_, record) => {
      //     return (
      //       <div style={{ textAlign: 'right' }}>
      //         {numberRender(record.unitPrice, 2)}
      //       </div>
      //     )
      //   }
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.otherfeename').d('其他费用名称'),
      //   key: 'otherExpenseName',
      //   dataIndex: 'otherExpenseName',
      //   width: 180,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.otherfeeamount').d('其他费用金额（原币）'),
      //   key: 'otherExpensePrice',
      //   dataIndex: 'otherExpensePrice',
      //   width: 200,
      //   render: (_, record) => {
      //     return (
      //       <div style={{ textAlign: 'right' }}>
      //         {numberRender(record.otherExpensePrice, 2)}
      //       </div>
      //     )
      //   }
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.projectname').d('项目名称'),
      //   key: 'proName',
      //   dataIndex: 'proName',
      //   width: 180,
      //   render: tooltipRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.Budgetnumber').d('预算编号'),
      //   key: 'budgetCoding',
      //   dataIndex: 'budgetCoding',
      //   width: 180,
      //   render: tooltipRender
      // },
      {
        title: intl.get('HKPC.commom.view.title.LastPOnumber').d('上次PO单号'),
        key: 'lastPoNo',
        dataIndex: 'lastPoNo',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`poLineId`, {
                initialValue: record?.lastPoNo,
              })(
                isOnly ? (
                  <CusLov
                    code="CMHK.PO.INFO"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      itemCode: record?.materialCode, // 物料编码,
                      organizationCode: record?.organizationCode, // 组织编码,
                    }}
                    textValue={record.lastPoNo}
                    onChange={(_, item) => {
                      record.lastPurchasePriceHkd = Number(item.price);
                      record.lastPoNo = item.poNumber;
                    }}
                  />
                ) : (
                  tooltipRender(record.lastPoNo)
                )
              )}
            </Form.Item>
          );
        },
      },
      // {
      //   title: intl.get('HKPC.commom.view.title.SuppliersquotationH').d('供应商报价(HKD)'),
      //   key: 'supplierQuoteHkd',
      //   dataIndex: 'supplierQuoteHkd',
      //   width: 180,
      //   render: (_, record) => {
      //     return (
      //       <div style={{ textAlign: 'right' }}>
      //         {numberRender(record.supplierQuoteHkd, 2)}
      //       </div>
      //     )
      //   }
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.SuppliersquotationO').d('供应商报价(原币)'),
      //   key: 'supplierQuote',
      //   dataIndex: 'supplierQuote',
      //   width: 180,
      //   render: (_, record) => {
      //     return (
      //       <div style={{ textAlign: 'right' }}>
      //         {numberRender(record.supplierQuote, 2)}
      //       </div>
      //     )
      //   }
      // },
      {
        title: intl.get('HKPC.commom.view.title.LastpurchasepriceH').d('上次采购价（HKD）'),
        key: 'lastPurchasePriceHkd',
        dataIndex: 'lastPurchasePriceHkd',
        width: 200,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(record.lastPurchasePriceHkd, 2)}</div>
          );
        },
      },
      // {
      //   title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
      //   key: 'guaranteePeriod',
      //   dataIndex: 'guaranteePeriod',
      //   width: 180,
      //   render: tooltipRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.Contact').d('联系人'),
      //   key: 'deliveryAddressContact',
      //   dataIndex: 'deliveryAddressContact',
      //   width: 180,
      //   render: tooltipRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
      //   key: 'deliveryAddress',
      //   dataIndex: 'deliveryAddress',
      //   width: 180,
      //   render: tooltipRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.NameofWinningSupplier').d('中标供应商名称'),
      //   key: 'bidSupplierName',
      //   dataIndex: 'bidSupplierName',
      //   width: 180,
      //   render: tooltipRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
      //   key: 'deliveryDate',
      //   dataIndex: 'deliveryDate',
      //   width: 180,
      //   render: dateRender
      // },
      // {
      //   title: intl.get('HKPC.commom.view.title.Remark').d('备注'),
      //   key: 'deliveryAddressRemark',
      //   dataIndex: 'deliveryAddressRemark',
      //   width: 180,
      //   render: tooltipRender
      // },
    ].filter(Boolean);

    const tableProps = {
      dataSource: dataSource,
      columns,
      rowKey: 'poOrderId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };

    return (
      <>
        <CusSpin spinning={false}>
          <EditTable {...tableProps} />
        </CusSpin>
      </>
    );
  }
}
