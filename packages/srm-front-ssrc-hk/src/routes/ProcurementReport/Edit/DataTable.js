import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { numberRender } from 'utils/renderer';
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
    if (this.props.contentObj?.prApplyMaterialList == null) {
      this.setState({
        prApplyMaterialListValue: [],
      });
    } else {
      this.setState({
        prApplyMaterialListValue: this.props.contentObj.prApplyMaterialList,
        purchaseApplicationLineList: [
          ...this.props.purchaseApplicationLineSource,
          ...this.state.prApplyMaterialListValue,
        ],
      });
    }

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
      prStatusState
    } = this.props;
    const { selectedRows, selectedRowKeys, purchaseApplicationLineList, prApplyMaterialListValue, prState } =
      this.state;
    const { deliverAddress, prStatus, projectType, materialsList, materialsPagination } = purchaseApplicationModel;
    // console.log(idpValueMap['HKPC.BUDGETTYPE'], "idpValueMap['HKPC.BUDGETTYPE']");
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        dataIndex: 'serialId',
        key: 'serialId',
        width: 100,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.materialname`).d('物料名称')),
        dataIndex: 'matName',
        key: 'matName',
        width: 200,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#matName`, {
                initialValue: record.matName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })(
                <CusInput.TextArea
                  disabled={prStatus == 'PENDING_REFER' || prStatus == '' ? false : true}
                  autoChangeSize={true}
                  onChange={(e) => {
                    // console.log('e', e);
                    record.matName = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.specification`).d('规格型号')),
        dataIndex: 'matType',
        key: 'matType',
        width: 150,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#matType`, {
                initialValue: record.matType,
              })(
                <CusInput.TextArea
                  autoChangeSize={true}
                  onChange={(e) => {
                    record.matType = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.ettimatedunitamountH`).d('预估金额单价(HKD)')
        ),
        dataIndex: 'matPriceHkd',
        key: 'matPriceHkd',
        width: 300,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item className={styles['matPriceHkd']}>
              {form.getFieldDecorator(`${record['uuid']}#matPriceHkd`, {
                initialValue: record.matPriceHkd,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.ettimatedunitamountH`)
                        .d('预估金额单价(HKD)'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  step={0.01}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  precision={2}
                  onChange={(e) => {
                    // console.log(e, 'e');
                    record.matPriceHkd = e;
                    this.handlePurchaseApplicationLine(record, record.matPriceHkd, 'matPriceHkd');
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span style={{ display: 'block', textAlign: 'right' }}>{numberRender(val, 2)}</span>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.unit`).d('单位')),
        dataIndex: 'unit',
        key: 'unit',
        width: 100,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#unit`, {
                initialValue: record.unit,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.unit`).d('单位'),
                    }),
                  },
                ],
              })(
                <CusLov
                  textValue={record.unit}
                  lovOptions={{ displayField: 'uomName', valueField: 'uomCode' }}
                  code="CMHKHPFM.UOM"
                  onChange={(_, lovData) => {
                    record.unit = lovData.uomCode;
                    form.setFieldsValue({
                      unit: lovData?.uomCode,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.quantity`).d('数量')),
        dataIndex: 'qty',
        key: 'qty',
        width: 150,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#qty`, {
                initialValue: record.qty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
                    }),
                  },
                ],
              })(
                <CusInput.TextArea
                  autoChangeSize={true}
                  onChange={(e) => {
                    record.qty = e.target.value;
                    this.handlePurchaseApplicationLine(record, record.qty, 'qty');
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.estimatedbudgettype`).d('预估预算类型')
        ),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#budgetType`, {
                initialValue: upperFirst(val),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.estimatedbudgettype`)
                        .d('预估预算类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={
                    projectType == '0'
                      ? idpValueMap['HKPC.BUDGETTYPE']
                      : idpValueMap['HKPC.BUDGETTYPE']?.filter((item) => item.tag == '1')
                  }
                  onChange={(e) => {
                    record.budgetType = e;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{upperFirst(val)}</span>
          );
        },
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)')
        ),
        dataIndex: 'budgetPricesHkd',
        key: 'budgetPricesHkd',
        width: 300,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#budgetPricesHkd`, {
                initialValue: val,
              })(
                <span
                  style={{ display: 'block', paddingBottom: '8px', textAlign: 'right' }}
                >
                  {record.qty == '' || record.matPriceHkd == ''
                    ? ''
                    : numberRender(
                        Number(form.getFieldValue(`${record['uuid']}#qty`)) *
                          Number(form.getFieldValue(`${record['uuid']}#matPriceHkd`)),
                        2
                      )}
                </span>
              )}
            </Form.Item>
          ) : (
            <span style={{ display: 'block', textAlign: 'right' }}>{numberRender(val, 2)}</span>
          );
        },
      },
      // {
      //   title: tooltipRender(intl.get(`${promptCode}.view.title.expecteddeliverydate`).d('需求日期')),
      //   dataIndex: 'reqDate',
      //   key: 'reqDate',
      //   width: 120,
      //   required: true,
      //   render: (val, record) => {
      //     return prStatus != 'Approved' ? (
      //       <div className="customize-form" style={{ paddingLeft: '16px', paddingBottom: '16px' }}>
      //         <Form.Item>
      //           {form.getFieldDecorator(`${record['uuid']}#reqDate`, {
      //             initialValue: record.reqDate ? dayjs(record.reqDate, 'YYYY-MM-DD') : null,
      //             rules: [
      //               {
      //                 required: true,
      //                 message: intl.get('hzero.common.validation.notNull', {
      //                   name: intl
      //                     .get(`${promptCode}.view.title.expecteddeliverydate`)
      //                     .d('需求日期'),
      //                 }),
      //               },
      //             ],
      //           })(
      //             <CusDatePicker
      //               disabledDate={(currentDate) => {
      //                 return currentDate.isBefore(dayjs().format('YYYY-MM-DD'));
      //               }}
      //               disabled={prStatus == 'Approved' ? true : false}
      //               format={'YYYY-MM-DD'}
      //               onChange={(e) => {
      //                 // record.reqDate = e;
      //                 record.reqDate = dayjs(e).format('YYYY-MM-DD');
      //               }}
      //             />
      //           )}
      //         </Form.Item>
      //       </div>
      //     ) : (
      //       <span>{dayjs(record.reqDate).format('YYYY-MM-DD')}</span>
      //     );
      //   },
      // },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址')),
        dataIndex: 'deliverAddress',
        key: 'deliverAddress',
        width: 180,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#deliverAddress`, {
                initialValue: record.deliverAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
                    }),
                  },
                ],
              })(
                <CusLov
                  textValue={record.deliverAddress}
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'detailedAddress' }}
                  code="CMHK.ERP.ADDRESS"
                  onChange={(_, lovData) => {
                    console.log(lovData);
                    record.deliverAddress = lovData.detailedAddress;
                    record.deliverContact = lovData.name;
                    record.deliveryPhoneNumber = lovData.contactTel;
                    form?.setFieldsValue({
                      [`${record['uuid']}#deliverContact`]: lovData.name,
                      [`${record['uuid']}#deliveryPhoneNumber`]: lovData.contactTel,
                    });
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        deliverAddress: lovData.detailedAddress,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: labelTip({
          label: intl.get(`${promptCode}.view.title.deliveryaddresscontacter`).d('送货地址联系人'),
          tip: intl.get(`${promptCode}.view.title.selectaddress`).d('请先选择送货地址'),
        }),
        dataIndex: 'deliverContact',
        key: 'deliverContact',
        width: 200,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#deliverContact`, {
                initialValue: record?.deliverContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.deliveryaddresscontacter`)
                        .d('送货地址联系人'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={ !record.deliverAddress }
                  textValue={record.deliverContact}
                  textField={record.deliverContact}
                  lovOptions={{ displayField: 'name', valueField: 'rowId' }}
                  code="CMHK.API.DELIVERYADDRESSPERSON"
                  onChange={(_, lovData) => {
                    record.deliverContact = lovData.name;
                    record.deliveryPhoneNumber = lovData.contactTel;
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        deliverContact: lovData.name,
                        deliveryPhoneNumber: lovData.contactTel,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注')
        ),
        dataIndex: 'deliverAddressBakup',
        key: 'deliverAddressBakup',
        width: 200,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#deliverAddressBakup`, {
                initialValue: record.deliverAddressBakup,
              })(
                <CusInput.TextArea
                  autoChangeSize={true}
                  onChange={(e) => {
                    record.deliverAddressBakup = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期')),
        dataIndex: 'deliverDate',
        key: 'deliverDate',
        width: 180,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <div className="customize-form" style={{ paddingLeft: '16px', paddingBottom: '16px' }}>
              <Form.Item>
                {form.getFieldDecorator(`${record['uuid']}#deliverDate`, {
                  initialValue: record.deliverDate ? dayjs(record.deliverDate, 'YYYY-MM-DD') : null,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
                      }),
                    },
                  ],
                })(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      return currentDate.isBefore(dayjs().format('YYYY-MM-DD'));
                    }}
                    format={'YYYY-MM-DD'}
                    onChange={(e) => {
                      // record.deliverDate = e;
                      record.deliverDate = dayjs(e).format('YYYY-MM-DD');
                    }}
                  />
                )}
              </Form.Item>
            </div>
          ) : (
            <span>{dayjs(record.deliverDate).format('YYYY-MM-DD')}</span>
          );
        },
      },
      {
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话')
        ),
        dataIndex: 'deliveryPhoneNumber',
        key: 'deliveryPhoneNumber',
        width: 120,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.Remark`).d('备注')),
        dataIndex: 'deliveryAddressRemarks',
        key: 'deliveryAddressRemarks',
        width: 120,
        align: 'left',
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {form.getFieldDecorator(`${record['uuid']}#deliveryAddressRemarks`, {
                initialValue: record.deliveryAddressRemarks,
              })(
                <CusInput.TextArea
                  autoChangeSize={true}
                  onChange={(e) => {
                    record.deliveryAddressRemarks = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled: prStatusState != 'PENDING_REFER' && prStatusState != '', // 选择框的是否可选
      }),
    };
    return (
      <>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={ (prStatusState == 'PENDING_REFER' || prStatusState == '') ? purchaseApplicationLineSource : materialsList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={ (prStatusState == 'PENDING_REFER' || prStatusState == '') ? false : materialsPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
