import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import { numberRender, dateRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
export default class PurchaseAskInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    };
    this.state = {
    };
  }

  render() {
    const {
      singlePurchaseApplicationModel,
      onSearch = (e) => e,
    } = this.props;
    const {
    } = this.state;
    const { purchaseApproveLineList = [], purchaseApproveLinePagination, purchaseApproveForm } = singlePurchaseApplicationModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'enquiryPriceNum',
        width: 80,
        render: (val, record, index) => {
          return index + 1
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Rbudgettype`).d('关联预算类型'),
        dataIndex: 'budgetType',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategoryMeaning',
        width: 160,
        render: tooltipRender,
      },
      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
        dataIndex: 'expenditureType',
        width: 180,
        render: tooltipRender,
      },
      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
        dataIndex: 'taskCode',
        width: 160,
        render: tooltipRender,
      },
      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
        dataIndex: 'taskName',
        width: 120,
        render: tooltipRender,
      },
      // 支出类型+任务编码+任务名称
      {
        title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
        dataIndex: 'materialCode',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'realMatName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'specificationModel',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'materialBudgetNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额(HKD)'),
        dataIndex: 'purchaseAmountHkd',
        width: 180,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenter',
        width: 120,
        render: tooltipRender,
      },

      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivities',
        width: 120,
        render: tooltipRender,
      },
      purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetItemNumber',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliveryAddressContact',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliveryAddress',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryContactNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliveryAddressRemarks',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliveryDate',
        width: 160,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
        dataIndex: 'lastPoNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
        dataIndex: 'lastPurchasePriceHkd',
        width: 160,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
        width: 160,
        render: tooltipRender,
      },
    ].filter(Boolean);

    return (
      <React.Fragment>
        <EditTable
          rowKey='rowId'
          dataSource={purchaseApproveLineList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseApproveLinePagination}
          onChange={onSearch}
        />
      </React.Fragment>
    );
  }
}
