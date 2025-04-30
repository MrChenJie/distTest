import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';
import { numberRender, dateRender } from 'utils/renderer';
import CusLov from '_cus_components/CusLov';

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })

export default class QuotationTermsList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      dataSource,
      materialFlag = false,
    } = this.props;

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.SN').d('序号'),
        key: 'orderSeq',
        dataIndex: 'orderSeq',
        width: 75,
        render: (_, record, index) => {
          return (
            <div style={{textAlign: 'center'}}>{index + 1}</div>
          )
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
        key: 'budgetType',
        dataIndex: 'budgetType',
        required: true,
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('projectBudType', {
                initialValue: record.budgetType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
                    }),
                  },
                ]
              })(
                <CusLov
                  code="CMHK.API.C/O"
                  queryParams={{ tenantId }}
                  lovOptions={{ displayField: 'projectBudType', valueField: 'id' }}
                  textValue={record.budgetType}
                  textField='budgetType'
                  // textValue={record.budgetType}
                  onChange={(_, item) => {
                    record.proName = item.name;
                    record.costCenter = item.costCenterName;
                    record.operationalAction = item.busActivityCode;
                    record.budgetCoding = item.code;
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.materialcode').d('物料编码'),
        key: 'materialCode',
        dataIndex: 'materialCode',
        required: true,
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
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
                ]
              })(
                <CusLov
                  code="HKICT.PCCWITEM"
                  textField="materialCode"
                  disabled={materialFlag}
                  queryParams={{ tenantId }}
                  lovOptions={{ displayField: 'itemNumber', valueField: 'itemNumber' }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'materialName',
        dataIndex: 'materialName',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.specification').d('规格型号'),
        key: 'specificationModel',
        dataIndex: 'specificationModel',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.unit').d('单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.quantity').d('数量'),
        key: 'quantity',
        dataIndex: 'quantity',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {record.quantity}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.PRAmountH').d('采购申请金额（HKD）'),
        key: 'appliedAmount',
        dataIndex: 'appliedAmount',
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`appliedAmount`, {
                initialValue: record.appliedAmount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.PRAmountH').d('采购申请金额（HKD）'),
                    }),
                  },
                ]
              })(
                <CusInputNumber
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  className="cus-input-money"
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.UnitPrice').d('单价'),
        key: 'unitPrice',
        dataIndex: 'unitPrice',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.unitPrice, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.projectname').d('项目名称'),
        key: 'proName',
        dataIndex: 'proName',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.CostCentre').d('成本中心'),
        key: 'costCenter',
        dataIndex: 'costCenter',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.BusinessActivities').d('业务活动'),
        key: 'operationalAction',
        dataIndex: 'operationalAction',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.Budgetnumber').d('预算编号'),
        key: 'budgetCoding',
        dataIndex: 'budgetCoding',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.LastPOnumber').d('上次PO单号'),
        key: 'lastPoNo',
        dataIndex: 'lastPoNo',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.SuppliersquotationH').d('供应商报价(HKD)'),
        key: 'supplierQuoteHkd',
        dataIndex: 'supplierQuoteHkd',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.supplierQuoteHkd, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.SuppliersquotationO').d('供应商报价(原币)'),
        key: 'supplierQuote',
        dataIndex: 'supplierQuote',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.supplierQuote, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.LastpurchasepriceH').d('上次采购价（HKD）'),
        key: 'lastPurchasePriceHkd',
        dataIndex: 'lastPurchasePriceHkd',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.lastPurchasePriceHkd, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
        key: 'guaranteePeriod',
        dataIndex: 'guaranteePeriod',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.Contact').d('联系人'),
        key: 'deliveryAddressContact',
        dataIndex: 'deliveryAddressContact',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
        key: 'deliveryAddress',
        dataIndex: 'deliveryAddress',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddressremrks').d('送货地址备注'),
        key: 'deliverAddressBakup',
        dataIndex: 'deliverAddressBakup',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.NameofWinningSupplier').d('中标供应商名称'),
        key: 'bidSupplierName',
        dataIndex: 'bidSupplierName',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
        key: 'deliveryDate',
        dataIndex: 'deliveryDate',
        width: 180,
        render: dateRender
      },
      {
        title: intl.get('HKPC.commom.view.title.DeliveryPhonenumber').d('送货联系电话'),
        key: 'deliveryPhoneNumber',
        dataIndex: 'deliveryPhoneNumber',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.Remark').d('备注'),
        key: 'deliveryAddressRemark',
        dataIndex: 'deliveryAddressRemark',
        width: 180,
        render: tooltipRender
      },
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
    )
  }
}