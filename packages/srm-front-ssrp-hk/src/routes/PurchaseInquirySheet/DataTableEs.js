import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllB, multiply } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import RfqResponse from './components/RfqResponse';
import uuid from 'uuid/v4';
import { Form } from 'hzero-ui';
import CusSelect from '_cus_components/CusSelect';
import { numberRender } from 'utils/renderer';
import { InputNumber } from 'antd';
import dayjs from 'dayjs';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'equipmentAndServiceId';
@Form.create()
export default class DataTableEs extends React.Component {
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
      equipmentAndServiceSource: [], // 设备及服务信息
      totalPriceOrigin: 0, //总金额原币种
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e, dispatch, purchaseInquirySheetModel } = this.props;
    const { ictPrDetailMatList } = purchaseInquirySheetModel
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        ictPrDetailMatList: ictPrDetailMatList.filter(ele => !selectedRows.includes(ele)),
      }
    })
    let matIdList = [];
    selectedRows.map((item) => {
      matIdList.push(item.id);
    });
    this.props.getChildDelMatList(matIdList);
    onDetele(selectedRows, this.clearState);
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

  // 新增一行设备及服务信息
  @Bind()
  handleAddEquipmentAndService() {
    const { purchaseInquirySheetModel } = this.props;
    const { ictPrDetailMatList } = purchaseInquirySheetModel
    let equipmentAndServiceSource = [...ictPrDetailMatList, {
      equipmentAndServiceId: uuid(),
      _status: 'create',
      serviceType: '',
      matNo: '',
      matName: '',
      spec: '',
      model: '',
      brand: '',
      pduNo: '',
      quantity: '',
      price: '',
      currency: '',
      totalAmount: '',
      prDate: '',
      remark: '',
      isDefault: false,
    }]
    this.updatEquipmentAndServiceSource(equipmentAndServiceSource)
  }

  //更新model中设备信息数据
  @Bind()
  updatEquipmentAndServiceSource(ictPrDetailMatList) {
    const { dispatch } = this.props
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        ictPrDetailMatList
      }
    })
  }

  // 定义修改设备及服务信息的方法
  @Bind()
  handleChangeEquipmentAndService(record, value, field) {
    const { dispatch, purchaseInquirySheetModel } = this.props;
    const { ictPrDetailMatList } = purchaseInquirySheetModel
    let total = 0
    ictPrDetailMatList.map(item => {
      total += item.quantity * item.price
    })
    record.totalAmount = record.quantity * record.price
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        totalAmount: total, //总金额原币
      },
    });
  }


  renderButtons = ({ parent }) => {
    const {
      publishLoading = false,
      submitLoading = false,
      deleteLoading = false,
      exportLoading = false,
    } = parent.props;
    const {
      onMassCreate = (e) => e,
      onOpenModal = (e) => e,
      onExport = (e) => e,
    } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type='primary'>
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => e,
      esFormValue,
      flag,
      form,
      dispatch,
      purchaseInquirySheetModel,
      idpValueMap,
    } = this.props;
    const { ictPrDetailMatList, prApplyStatus, currency } = purchaseInquirySheetModel;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.servicetype`).d('服务分类'),
        dataIndex: 'serviceType',
        width: 160,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {form.getFieldDecorator(`${record['equipmentAndServiceId']}#serviceType`, {
                  initialValue: val,
                })(
                  <CusSelect
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    allowClear
                    options={idpValueMap['HKPC.ICT.SERVICETYPE']}
                    onChange={(e) => {
                    record.serviceType = idpValueMap['HKPC.ICT.SERVICETYPE']?.find(
                      (item) => item?.value === e
                      )?.meaning;
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialcode`).d('物料编码'),
        dataIndex: 'matNo',
        width: 220,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {record.$form.getFieldDecorator(`${record['equipmentAndServiceId']}#matNo`, {
                  initialValue: record.matNo,
                })(
                  <CusLov
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    textValue={record.matNo}
                    lovOptions={{ displayField: 'itemNumber', valueField: 'itemNumber' }}
                    code="HKICT.PCCWITEM"
                    onChange={(_, lovData) => {
                      record.matNo = lovData.itemNumber;
                      record.matName = lovData.itemDescription;
                      record.spec = lovData.itemLongDescription;
                      record.pduNo = lovData.productCode;
                      record.model = lovData.productClassName;
                      record.brand = lovData.productLineName;
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}`).d('物料名称'),
        dataIndex: 'matName',
        width: 120,
        render: (_, record) => tooltipRender(record.matName),
      },
      {
        title: intl.get(`${promptCode}`).d('规格型号'),
        dataIndex: 'spec',
        width: 120,
        render: (_, record) => tooltipRender(record.matName),
      },
      {
        title: intl.get(`${promptCode}.view.title.model`).d('模型'),
        dataIndex: 'model',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.productcode`).d('产品编码'),
        dataIndex: 'pduNo',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'quantity',
        width: 100,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {record.$form.getFieldDecorator(`${record['equipmentAndServiceId']}#quantity`, {
                  initialValue: record.quantity,
                })(
                  <InputNumber
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    step={1}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={(e) => {
                      record.quantity = e;
                      record.$form.setFieldsValue({
                        quantity: e,
                      });
                      this.handleChangeEquipmentAndService(record, record.quantity, 'quantity');
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
        dataIndex: 'price',
        width: 220,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {record.$form.getFieldDecorator(`${record['equipmentAndServiceId']}#price`, {
                  initialValue: record.price,
                })(
                  <InputNumber
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    precision={2}
                    onChange={(e) => {
                      record.price = e;
                      record.$form.setFieldsValue({
                        price: e,
                      });
                      this.handleChangeEquipmentAndService(record, record.price, 'price');
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return <span>{currency ? currency : record.currency}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.amount`).d('金额'),
        dataIndex: 'totalAmount',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {form.getFieldDecorator(`${record['equipmentAndServiceId']}#totalAmount`, {
                  initialValue: val,
                })(
                  <span>
                    {numberRender(
                      record.quantity == '' || record.price == '' ? '' : record.totalAmount,
                      2
                    )}
                  </span>
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.expecteddeliverydate`).d('需求日期'),
        dataIndex: 'prDateTo',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className="customize-form">
              <Form.Item>
                {record.$form.getFieldDecorator('prDateTo', {
                  initialValue: record?.prDateTo ? dayjs(record.prDateTo, 'YYYY-MM-DD') : null,
                })(
                  <CusDatePicker
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    style={{ marginBottom: '16px', marginLeft: '8px' }}
                    format={'YYYY-MM-DD'}
                    onChange={(e) => {
                      record.prDateTo = dayjs(e).format('YYYY-MM-DD');
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {record.$form.getFieldDecorator(`${record['equipmentAndServiceId']}#remark`, {
                  initialValue: record.remark,
                })(
                  <CusInput.TextArea
                    disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                    autoChangeSize={true}
                    onChange={(e) => {
                      record.remark = e.target.value;
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          {prApplyStatus == 'PENDING_REFER' ? (
            <>
              <CusButton mini onClick={this.handleDelete}>
                {intl.get('HKPC.commom.view.button.bulkdelete').d('批量删除')}
              </CusButton>
              <CusButton mini type="primary" onClick={this.handleAddEquipmentAndService}>
                {intl.get(`hzero.common.view.button.add`).d('新建')}
              </CusButton>
            </>
          ) : (
            ''
          )}
        </div>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={ictPrDetailMatList || []}
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
