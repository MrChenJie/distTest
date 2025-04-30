import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })

export default class BudgetInforList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      dataSource,
      // pagination,
    } = this.props;

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
        key: 'budgetType',
        dataIndex: 'budgetType',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.Budgetnumber').d('预算编号'),
        key: 'budgetCoding',
        dataIndex: 'budgetCoding',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.projectname').d('项目名称'),
        key: 'proName',
        dataIndex: 'proName',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.BudgetProjectnumber').d('预算项目编号'),
        key: 'budgetProCode',
        dataIndex: 'budgetProCode',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.costcenter').d('成本中心'),
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
      // {
      //   title: intl.get('HKPC.commom.view.title.PRAmountO').d('采购申请金额（原币）'),
      //   key: 'purchaseRequestAmount',
      //   dataIndex: 'purchaseRequestAmount',
      //   width: 180,
      //   render: (_, record) => {
      //     return (
      //       <div style={{textAlign: 'right'}}>
      //         {numberRender(record.purchaseRequestAmount, 2)}
      //       </div>
      //     )
      //   }
      // },
      {
        title: intl.get('HKPC.commom.view.title.PRAmountH').d('采购申请金额（HKD）'),
        key: 'purchaseRequestAmountHkd',
        dataIndex: 'purchaseRequestAmountHkd',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.purchaseRequestAmountHkd, 2)}
            </div>
          )
        }
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: dataSource,
      // pagination: pagination,
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