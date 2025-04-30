import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { numberRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
export default class BudgetDataTable extends React.Component {
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
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  render() {
    const { onChange = (e) => e, purchaseResultModel, form } = this.props;
    const { cmhkPrFourthBgList = [] } = purchaseResultModel;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.budgettype`).d('预算类型'),
        dataIndex: 'budgetType',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
        dataIndex: 'budgetNumber',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectName`).d('预算项目名称'),
        dataIndex: 'budgetProjectName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetProjectNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCentre',
        width: 120,
        render: (_, record) => {
          return <span>{record.costCentre == 'null' ? '/' : record.costCentre}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivities',
        width: 120,
        render: (_, record) => {
          return (
            <span>{record.businessActivities == 'null' ? '/' : record.businessActivities}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamountO`).d('采购金额(原币)'),
        dataIndex: 'prAmountOriginalCurrency',
        width: 120,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.prAmountOriginalCurrency, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额(HKD)'),
        dataIndex: 'prAmountHkd',
        width: 120,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.prAmountHkd, 2)}
            </span>
          );
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={cmhkPrFourthBgList || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
        />
      </>
    );
  }
}
