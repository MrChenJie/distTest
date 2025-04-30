import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { numberRender, dateRender } from 'utils/renderer';
import { multiply, pullAllBy, upperFirst } from 'lodash';
import { labelTip, tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import { InputNumber } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import dayjs from 'dayjs';
import styles from './index.less';
import queryString from 'querystring';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'uuid';
export default class DataTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      purchaseApplicationLineList: [],
      prApplyMaterialListValue: [],
      prState: ''
    };
  }

  @Form.create()
  componentDidMount() {
    // if (this.props.contentObj?.prApplyMaterialList == null) {
    //   this.setState({
    //     prApplyMaterialListValue: [],
    //   });
    // } else {
    //   this.setState({
    //     prApplyMaterialListValue: this.props.contentObj.prApplyMaterialList,
    //     purchaseApplicationLineList: [
    //       ...this.props.purchaseApplicationLineSource,
    //       ...this.state.prApplyMaterialListValue,
    //     ],
    //   });
    // }

    const {
      location: { search },
    } = this.props;
    
    const { state } = queryString.parse(search.substring(1));
    this.setState({
      prState: state,
    })
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
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
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e, purchaseApplicationLineSource, dispatch } = this.props;
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
    this.props.getPurchaseApplicationLine(lineResultList);
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
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
    // console.log('newSRows', newSRows);
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

  // 定义修改采购申请行信息的方法
  @Bind()
  handlePurchaseApplicationLine(record, value, field) {
    // console.log(record, 'record: ');
    const { purchaseApplicationLineSource, form, dispatch, purchaseApplicationModel } = this.props;
    const { infomation, estimatedBudgetAmountHkd } = purchaseApplicationModel;
    let budgetPricesHkdTotal = 0;
    purchaseApplicationLineSource.map((item) => {
      console.log(item, 'item: ');
      budgetPricesHkdTotal += multiply(Number(item.qty) * Number(item?.matPriceHkd));
    });
    let budgetPricesHkd = multiply(Number(record.qty) * Number(record?.matPriceHkd));
    record.budgetPricesHkd = budgetPricesHkd;
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        infomation: infomation,
        estimatedBudgetAmountHkd: budgetPricesHkdTotal,
      },
    });
  }

  render() {
    const {
      onChange = (e) => e,
      purchaseApplicationLineSource,
      form,
      idpValueMap = {},
      prApplyMaterialList,
      contentObj,
      dispatch,
      purchaseApplicationModel,
      location: {search},
      prStatusState,
    } = this.props;
    const { selectedRows, selectedRowKeys, purchaseApplicationLineList, prApplyMaterialListValue, prState } =
      this.state;
    const { deliverAddress, prStatus, projectType, materialsList, materialsPagination } = purchaseApplicationModel;
    // console.log(idpValueMap['HKPC.BUDGETTYPE'], "idpValueMap['HKPC.BUDGETTYPE']");
    console.log('prApplyMaterialList', prApplyMaterialList)
    console.log('this.props', this.props)
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'serialId',
        key: 'serialId',
        width: 80,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.estimatedbudgettype`).d('预估预算类型'),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategoryMeaning',
        width: 350,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        key: 'matName',
        width: 350,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        key: 'matType',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        key: 'unit',
        width: 130,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'qty',
        key: 'qty',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价（原币）'),
        dataIndex: 'matPriceHkd',
        key: 'matPriceHkd',
        width: 150,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.matPriceHkd, 2)}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.purchaseamount`).d('采购金额(HKD)'),
        dataIndex: 'budgetPricesHkd',
        key: 'budgetPricesHkd',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.budgetPricesHkd, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliverAddress',
        key: 'deliverAddress',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
        dataIndex: 'deliverContact',
        key: 'deliverContact',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliverAddressBakup',
        key: 'deliverAddressBakup',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliverDate',
        key: 'deliverDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        key: 'deliveryPhoneNumber',
        width: 120,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterNM',
        key: 'costCenterNM',
        width: 180,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'deliveryAddressRemarks',
        key: 'deliveryAddressRemarks',
        width: 120,
        render: tooltipRender,
      },
    ].filter(Boolean);

    return (
      <>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={ (prStatusState == 'PENDING_REFER' || prStatusState == '') ? purchaseApplicationLineSource : materialsList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={ (prStatusState == 'PENDING_REFER' || prStatusState == '') ? false : materialsPagination}
          onChange={onChange}
        />
      </>
    );
  }
}
