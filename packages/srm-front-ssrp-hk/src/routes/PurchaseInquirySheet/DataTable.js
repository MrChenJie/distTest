import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'equipmentLineNo';
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
      nowRecord: {},
      equipmentLineNo: '',
      glCode: '',
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  componentDidMount() {
    // setTimeout(() => {
    //   this.selectedDevoice();
    // }, 1000);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onDetele(selectedRows, this.clearState);
  }

  // @Bind()
  // onSelect(record, selected) {
  //   this.setState({
  //     equipmentLineNo: record.equipmentLineNo
  //   }, () => {
  //     this.props.getEquipmentLineNo(this.state.equipmentLineNo)
  //   })
  //   const { selectedRows = [] } = this.state;
  //   const newSRows = selected
  //     /? selectedRows.concat(record)
  //     : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
  //   const newSelectedRowKeys = [];
  //   newSRows.forEach((item) => {
  //     newSelectedRowKeys.push(item[ROW_KEY]);
  //   });
  //   this.setState({
  //     selectedRows: newSRows,
  //     selectedRowKeys: newSelectedRowKeys,
  //   });

  // const { selectedRows = [] } = this.state;
  // let newSRows = [];
  // let newSelectedRowKeys = [];

  // if (selected) {
  //   // If a new item is selected, clear the previous selection and select the current one
  //   newSRows = [record];
  //   newSelectedRowKeys = [record[ROW_KEY]];
  // }

  // this.setState({
  //   selectedRows: newSRows,
  //   selectedRowKeys: newSelectedRowKeys,
  // }, () => {
  //   // Trigger the callback with the selected item
  //   this.props.getEquipmentLineNo(selected ? record.equipmentLineNo : null);
  // });
  // }

  renderButtons = ({ parent }) => {
    const { deleteLoading = false, exportLoading = false } = parent.props;
    const { onMassCreate = (e) => e, onOpenModal = (e) => e, onExport = (e) => e } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton mini onClick={this.handleDelete} loading={deleteLoading}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type="primary">
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };
  // @Bind()
  // selectedDevoice() {
  //   const { purchaseInquirySheetModel, dispatch } = this.props;
  //   const { cmhkIctPrDeviceInfoList, equipmentLineNo, prApplyStatus } = purchaseInquirySheetModel;
  //   console.log(cmhkIctPrDeviceInfoList, 'cmhkIctPrDeviceInfoList');
  //   const selectedDevoice = cmhkIctPrDeviceInfoList.find(
  //     (item) => item.equipmentLineNo == equipmentLineNo
  //   );
  //   console.log(selectedDevoice, '2222222222222222');
  //   if (selectedDevoice?.length > 0) {
  //     dispatch({
  //       cmhkIctPrDeviceInfoList: [selectedDevoice],
  //     });
  // this.setState({
  //   selectedRowKeys: [selectedDevoice.equipmentLineNo],
  //   selectedRows: [selectedDevoice],
  // });
  // }
  // }

  render() {
    const { onChange = (e) => e, deviceInfoListValue, purchaseInquirySheetModel } = this.props;
    const { cmhkIctPrDeviceInfoList, equipmentLineNo, prApplyStatus } = purchaseInquirySheetModel;
    const { selectedRows, selectedRowKeys, nowRecord } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.product`).d('产品'),
        dataIndex: 'product',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.subproducts`).d('子产品'),
        dataIndex: 'subProduct',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.feetype`).d('费用名称'),
        dataIndex: 'feeName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.servicetype`).d('服务类型'),
        dataIndex: 'serviceType',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.costcenter`).d('成本中心'),
        dataIndex: 'costCenter',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.glcode`).d('GL Code'),
        dataIndex: 'glCode',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.billdescription`).d('账单描述（中文）'),
        dataIndex: 'billDescCn',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'billDescEn',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.ponumber`).d('采购单号'),
        dataIndex: 'purchaseOrderNo',
        width: 220,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.supplier`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 160,
        align: 'left',
      },
    ];

    //TODO: 反显选中的那条设备信息行
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (keys, rows) => {
        console.log('keys', keys);
        console.log('rows', rows);
        this.setState(
          {
            selectedRowKeys: keys, //1001262
            selectedRows: rows, //equipmentLineNo
            equipmentLineNo: keys[0],
            deviceInfoList: rows[0],
          },
          () => {
            this.props.getEquipmentLineNo(this.state.equipmentLineNo);
          }
        );
        this.props.dispatch({
          type: 'purchaseInquirySheetModel/commentUpdateState',
          payload: {
            equipmentLineNo: keys[0],
            hasCmhkIctPrDeviceInfoList: rows,
          },
        });
      },
    };
    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={cmhkIctPrDeviceInfoList || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
