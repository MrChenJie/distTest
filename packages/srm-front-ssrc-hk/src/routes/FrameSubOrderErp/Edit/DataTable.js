import React from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Input } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import { numberRender, dateRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import CusNotification from '_cus_components/CusNotification';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import dayjs from 'dayjs';

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
    };
  }

  componentDidMount() {}

  /**
   * @description 删除
   */
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

  render() {
    const {
      form,
      idpValueMap = {},
      infomation,
      purchaseApplicationLineSource,
      handleComputeAmount = (e) => e,
      handleNumber = (e) => e,
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const frameworkCode = form.getFieldsValue().frameworkCode;
    const projectCode = form.getFieldsValue().projectCode;
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
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategory',
        width: 230,
        render: (_, record) => {
          return (
            tooltipRender(record.purchasingCategoryMeaning)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
        dataIndex: 'matCode',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'matName',
        dataIndex: 'matName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        width: 200,
        render: tooltipRender,
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
        width: 180,
        render: (_, record) => {
          return (
            tooltipRender(record.expenditureType)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
        dataIndex: 'taskCode',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.taskCode)
          )
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
          return (
            tooltipRender(record.businessActivitiesName)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'qty',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.qty)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价'),
        dataIndex: 'unitPrice',
        width: 200,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.unitPrice, 2))}
            </div>
          );
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
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchaseRequestAmountHkd, 2))}</div>;
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
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliverAddress',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.deliverAddress)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliverContact',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.deliverContact)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.deliveryPhoneNumber)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliverAddressBakup',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.deliverAddressBakup)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliverDate',
        width: 200,
        render: (val, record) => {
          return (
            dateRender(record.deliverDate)
          )
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
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
        dataIndex: 'poNumber',
        width: 200,
        render: (_, record) => {
          return (
            tooltipRender(record.poNumber)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
        dataIndex: 'purchasePrice',
        width: 200,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record.purchasePrice, 2))}</div>;
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled: infomation?.prStatus != 'PENDING_REFER' && infomation?.prStatus != '', // 选择框的是否可选
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
          // onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
