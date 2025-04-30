import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { Form, Row, Col } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { getDFormGridSpan } from '_cus_utils/utils';
import querystring from 'querystring';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const gridSpan = getDFormGridSpan();
export default class PurchaseOrderDataTable extends React.Component {
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

  form = React.createRef();

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  render() {
    const { onChange = (e) => e, getQueryParams = (e) => e, purchaseResultModel, form, isEdit, dispatch, activityCode } = this.props;
    const { selectedRows, selectedRowKeys, rfqResponseVisible, nowRecord } = this.state;
    const { cmhkPrFourthPoList = [], cmhkPrFourthSup, cmhkPrFourthHead } = purchaseResultModel;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'serialNumber',
        width: 80,
        render: (text, record, index) => index + 1,
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'specification',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
        dataIndex: 'unitPrice',
        width: 120,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.totalammount`).d('总金额'),
        dataIndex: 'prAmountHkd',
        width: 120,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 120,
      },
      activityCode === 'SCM033' && {
        title: intl.get(`${promptCode}.view.title.NameofWinningSupplier`).d('中标供应商名称'),
        dataIndex: 'nameOfWinningSupplier',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliveryAddressContacter',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliveryAddress',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliveryAddressRemarks',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliveryDate',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remarks',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.materialnumber`).d('物料编码'),
        dataIndex: 'materialNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Rbudgettype`).d('关联预算类型'),
        dataIndex: 'budgetType',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategoryMeaning',
        width: 180,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额(HKD)'),
      //   dataIndex: 'prAmountHkd',
      //   width: 120,
      //   render: (_, record) => {
      //     return (
      //       <span style={{ display: 'block', textAlign: 'right' }}>
      //         {numberRender(record.prAmountHkd, 2)}
      //       </span>
      //     );
      //   },
      // },
      cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budgetProjectNumber',
        width: 120,
        render: tooltipRender,
      },
      cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCentre',
        width: 120,
        render: tooltipRender,
      },
      cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivities',
        width: 120,
        render: tooltipRender,
      },
      cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.BudgetProjectName`).d('预算项目名称'),
        dataIndex: 'budgetProjectName',
        width: 120,
        render: tooltipRender,
      },
      cmhkPrFourthHead?.prApplyBudgetType !== 'INVENTORY' && {
        title: intl.get(`${promptCode}.view.title.Budgetnumber`).d('预算编号'),
        dataIndex: 'budgetNumber',
        width: 120,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.Expendituretype`).d('支出类型'),
      //   dataIndex: 'expenditureType',
      //   width: 120,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.tasknumber`).d('任务编码'),
      //   dataIndex: 'taskCode',
      //   width: 120,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.taskname`).d('任务名称'),
      //   dataIndex: 'taskName',
      //   width: 120,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价(HKD)'),
      //   dataIndex: 'lastPurchasePriceHkd',
      //   width: 120,
      //   render: (_, record) => {
      //     return (
      //       <span style={{ display: 'block', textAlign: 'right' }}>
      //         {numberRender(record.lastPurchasePriceHkd, 2)}
      //       </span>
      //     );
      //   },
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
      //   dataIndex: 'lastPoNumber',
      //   width: 120,
      //   render: tooltipRender,
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价(HKD)'),
      //   dataIndex: 'supplierQuotationHkd',
      //   width: 120,
      //   render: (_, record) => {
      //     return (
      //       <span style={{ display: 'block', textAlign: 'right' }}>
      //         {numberRender(record.supplierQuotationHkd, 2)}
      //       </span>
      //     );
      //   },
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价(原币)'),
      //   dataIndex: 'supplierOriginalCurrency',
      //   width: 120,
      //   render: (_, record) => {
      //     return (
      //       <span style={{ display: 'block', textAlign: 'right' }}>
      //         {numberRender(record.supplierOriginalCurrency, 2)}
      //       </span>
      //     );
      //   },
      // },
    ].filter(Boolean);

    return (
      <>
        <Form className="customize-form" style={{marginBottom: '16px'}}>
          <Row style={{marginBottom: '16px'}}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.OrderHandler`).d('订单经办人')}
              >
                {getFieldDecorator('orderHandlerName', {
                  initialValue: cmhkPrFourthSup?.orderHandlerName,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.OrderHandler`).d('订单经办人'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={isEdit}
                    textValue={cmhkPrFourthSup?.orderHandlerName}
                    code="HKPC.PROCUREMENTAGENT"
                    // queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
                    onChange={(_, lovData) => {
                      dispatch({
                        type: 'purchaseResultModel/commentUpdateState',
                        payload: {
                          orderHandler: lovData.loginName,
                          orderHandlerName: lovData.userName,
                        },
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <CusTable
          rowKey='id'
          dataSource={cmhkPrFourthPoList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
        />
      </>
    );
  }
}
