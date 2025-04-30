import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
// import RfqResponse from '../components/RfqResponse';
import uuid from 'uuid/v4';
import { Form } from 'hzero-ui';
import CusSelect from '_cus_components/CusSelect';


/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
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

  componentDidMount() {
    console.log(this.props.ictPrDetailMatList);
    if (this.props.ictPrDetailMatList != [] && this.props.ictPrDetailMatList != undefined) {
      this.props.ictPrDetailMatList.map((item) => {
        item.equipmentAndServiceId = uuid();
      });
      this.setState({
        equipmentAndServiceSource: [...this.state.equipmentAndServiceSource, ...this.props.ictPrDetailMatList],
      });
    }
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
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
    }
    window.open(url);
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
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
    console.log(selectedRows, 'selectedRows');
    // console.log(this.state.attachmentSourceValue, 'attachmentSourceValue')
    this.setState({
      equipmentAndServiceSource: this.state.equipmentAndServiceSource.filter(ele => !selectedRows.includes(ele)),
    });
    let matIdList = [];
    selectedRows.map((item) => {
      matIdList.push(item.id);
    });
    this.props.getChildDelMatList(matIdList);
    onDetele(selectedRows, this.clearState);
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
  }

  @Bind()
  onSelect(record, selected) {
    console.log(record);
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    console.log('newSRows', newSRows);
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
    const { equipmentAndServiceSource } = this.state;
    if (!this.props.flag) {
      this.setState({
        equipmentAndServiceSource: [...equipmentAndServiceSource, {
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
        }],
      }, () => {
        this.props.getEquipmentAndService(this.state.equipmentAndServiceSource);
      });
    } else {
      this.setState({
        equipmentAndServiceSource: [...equipmentAndServiceSource, {
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
        }],
      }, () => {
        this.props.getEquipmentAndService(this.state.equipmentAndServiceSource);
      });
    }
  }

  // 定义修改设备及服务信息的方法
  @Bind()
  handleChangeEquipmentAndService(record, value, field) {
    const { equipmentAndServiceSource } = this.state;
    console.log('equipmentAndServiceSource', equipmentAndServiceSource);
    console.log('record', record);
    // 在修改之前先将状态标记为 ‘upstate’
    // 修改指定字段
    record[field] = value;
    // 更新设备及服务信息的数据源
    const newEquipmentAndServiceSource = [...equipmentAndServiceSource];
    const index = newEquipmentAndServiceSource.findIndex(item => item.equipmentAndServiceId === record.equipmentAndServiceId);
    newEquipmentAndServiceSource.splice(index, 1, {
      ...record,
    });
    this.setState(
      {
        equipmentAndServiceSource: newEquipmentAndServiceSource,
      },
      () => {
        // 最后更新父组件的数据
        this.props.getEquipmentAndService(this.state.equipmentAndServiceSource);
      },
    );
  }

  @Bind()
  getTotalAmount(record) {
    console.log('getTotalAmount', record);
    // this.setState({
    //   totalPriceOrigin: 20
    // })
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
          onClick={this.handleSubmitToApproval}
          loading={submitLoading}
        >
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handlePublish}
          loading={publishLoading}
        >
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
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
      getQueryParams = (e) => (e),
      ictPrDetailMatList,
      esFormValue,
      flag,
      form,
    } = this.props;
    // console.log('form', form)
    // console.log('flag', flag)
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
      equipmentAndServiceSource,
    } = this.state;
    // console.log('equipmentAndServiceSource', equipmentAndServiceSource)
    // console.log('ictPrDetailMatList', ictPrDetailMatList)
    const columns = [
      {
        title: intl.get(`${promptCode}.model.label`).d('服务分类'),
        dataIndex: 'serviceType',
        width: 160,
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  form.getFieldDecorator(`${record['equipmentAndServiceId']}#serviceType`, {
                    initialValue: record.serviceType,
                  })
                    (<CusSelect allowClear options={[
                      { value: '设备销售', meaning: '设备销售' },
                      { value: '系统集成', meaning: '系统集成' },
                      { value: '维保费', meaning: '维保费' },
                      { value: '云端服务', meaning: '云端服务' },
                      { value: 'IDC', meaning: 'IDC' },
                      { value: '专线', meaning: '专线' },
                      { value: '云转售', meaning: '云转售' },
                      { value: 'IOT', meaning: 'IOT' },
                    ]} onChange={e => {
                      record.serviceType = e;
                      this.handleChangeEquipmentAndService(record, record.serviceType, 'serviceType');
                    }} />)}
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('物料编码'),
        dataIndex: 'matNo',
        width: 220,
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  form.getFieldDecorator(`${record['equipmentAndServiceId']}#matNo`, {
                    initialValue: record.matNo,
                  })
                    (
                      <CusLov textValue={record.matNo}
                        lovOptions={{ displayField: 'itemNumber', valueField: 'itemNumber' }} code='HKICT.PCCWITEM'
                        onChange={(_, lovData) => {
                          record.matNo = lovData.itemNumber;
                          record.matName = lovData.itemDescription;
                          record.spec = lovData.itemLongDescription;
                          record.pduNo = lovData.productCode;
                          record.model = lovData.model;
                          record.brand = lovData.brand;
                          this.handleChangeEquipmentAndService(record, record.matNo, 'matNo');
                        }} />,
                    )
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('物料名称'),
        dataIndex: 'matName',
        width: 120,
        render: (_, record) => tooltipRender(record.matName),
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('规格型号'),
        dataIndex: 'spec',
        width: 120,
        render: (_, record) => tooltipRender(record.matName),
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('模型'),
        dataIndex: 'model',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('品牌'),
        dataIndex: 'brand',
        width: 120,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('产品编码'),
        dataIndex: 'pduNo',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('采购数量'),
        dataIndex: 'quantity',
        width: 100,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  form.getFieldDecorator(`${record['equipmentAndServiceId']}#quantity`, {
                    initialValue: record.quantity,
                  })
                    (<CusInput.TextArea autoChangeSize={true} onChange={() => {
                      setTimeout(() => {
                        record.quantity = form.getFieldValue(`${record['equipmentAndServiceId']}#quantity`);
                        this.setState({
                          quantity: Number(form.getFieldValue(`${record['equipmentAndServiceId']}#quantity`)),
                        });
                        this.handleChangeEquipmentAndService(record, record.quantity, 'quantity');
                      }, 600);
                    }} />)
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('单价'),
        dataIndex: 'price',
        width: 220,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  form.getFieldDecorator(`${record['equipmentAndServiceId']}#price`, {
                    initialValue: record.price,
                  })
                    (<CusInput.TextArea autoChangeSize={true} onChange={
                      () => {
                        setTimeout(() => {
                          record.price = form.getFieldValue(`${record['equipmentAndServiceId']}#price`);
                          this.setState({
                            price: Number(form.getFieldValue(`${record['equipmentAndServiceId']}#price`)),
                          });
                          this.handleChangeEquipmentAndService(record, record.price, 'price');
                        }, 600);
                      }
                    } />)
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('币种'),
        dataIndex: 'currency',
        width: 160,
        align: 'left',
        render: () => {
          return (
            <span>HKD</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('金额'),
        dataIndex: 'totalAmount',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  <span>{record.quantity == '' ? 0 : Number(form.getFieldValue(`${record['equipmentAndServiceId']}#quantity`)) * Number(form.getFieldValue(`${record['equipmentAndServiceId']}#price`))}</span>
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('需求日期'),
        dataIndex: 'prDate',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className='customize-form'>
              <Form.Item>
                {
                  form.getFieldDecorator('prDate', {
                    initialValue: record.prDate,
                  })
                    (<CusDatePicker style={{ marginLeft: '16px' }} format={'YYYY-MM-DD'} onChange={e => {
                      record.prDate = e;
                      this.handleChangeEquipmentAndService(record, record.prDate, 'prDate');
                    }} />)
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('备注'),
        dataIndex: 'remark',
        width: 160,
        align: 'left',
        render: (val, record) => {
          return (
            <Form className='customize-from'>
              <Form.Item>
                {
                  form.getFieldDecorator(`${record['equipmentAndServiceId']}#remark`, {
                    initialValue: record.remark,
                  })
                    (<CusInput.TextArea autoChangeSize={true} onChange={
                      () => {
                        record.remark = form.getFieldValue(`${record['equipmentAndServiceId']}#remark`);
                        this.handleChangeEquipmentAndService(record, record.remark, 'remark');
                      }
                    } />)
                }
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '16px' }}>
          <CusButton mini onClick={this.handleDelete}>批量删除</CusButton>
          <CusButton mini type='primary' onClick={this.handleAddEquipmentAndService}>新增</CusButton>
        </div>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={equipmentAndServiceSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={rowSelection}
        />

        {/* 询价响应 CusModal */}
        <CusModal
          visible={rfqResponseVisible}
          width={800}
          title={intl.get('ssrc.resaleRfq.create.rfqResponseModal.title').d('线上报价情况')}
          footer={
            <CusButton
              onClick={() => {
                this.setState({
                  rfqResponseVisible: false,
                });
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
          onCancel={() => this.setState({
            rfqResponseVisible: false,
          })}
          destroyOnClose
        >
          {/* <RfqResponse
            {...this.props}
            nowRecord={nowRecord}
          /> */}
        </CusModal>
      </React.Fragment>
    );
  }
}
