import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
@formatterCollections({ code: [promptCode] })
export default class BudgetInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
    };
  }

  render() {
    const {
      singlePurchaseApplicationModel,
    } = this.props;
    const {
    } = this.state;
    const { purchaseApproveList } = singlePurchaseApplicationModel;
    console.log('purchaseApproveList', purchaseApproveList);

    const columnsTwo = [
      {
        title: intl.get(`${promptCode}.view.title.budgettype`).d('预算类型'),
        dataIndex: 'budgetType',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
        dataIndex: 'budgetNumber',
        width: 110,
        render: (_, record) => {
          return (
            record?.budgetNumber === 'INVENTORY' ?
            <></>
            :
            tooltipRender(record.budgetNumber)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectName`).d('预算项目名称'),
        dataIndex: 'entryName',
        width: 180,
        render: (_, record) => {
          return (
            record?.budgetNumber === 'INVENTORY' ?
            <></>
            :
            tooltipRender(record.entryName)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetItemNumber',
        width: 100,
        render: (_, record) => {
          return (
            <div>{record.budgetItemNumber === 'null' ? null : tooltipRender(record.budgetItemNumber)}</div>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenter',
        width: 150,
        render: (_, record) => {
          return (
            <div>{record.costCenter === 'null' ? null : tooltipRender(record.costCenter)}</div>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivities',
        width: 150,
        render: (_, record) => {
          return (
            <div>{record.businessActivities === 'null' ? null : tooltipRender(record.businessActivities)}</div>
          )
        }
      },
      // {
      //   title: tooltipRender(
      //     intl.get(`${promptCode}.view.title.purchaseamountO`).d('采购金额(原币)')
      //   ),
      //   dataIndex: 'purchaseAmount',
      //   width: 100,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额(HKD)'),
        dataIndex: 'purchaseAmountHkd',
        width: 100,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchaseAmountHkd, 2))}</div>;
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowId"
          dataSource={purchaseApproveList}
          columns={columnsTwo}
          scroll={{ x: tableScrollWidth(columnsTwo) }}
          pagination={false}
        />
      </>
    );
  }
}
