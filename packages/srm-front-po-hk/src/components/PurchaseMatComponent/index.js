/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-5-21 11:37:41
 * Copyright (c) 2024, All Rights Reserved.
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth, getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusButton from '_cus_components/CusButton';
import formatterCollections from 'utils/intl/formatterCollections';
import { filter } from 'lodash';
import InputLov from './CusLov';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import dayjs from 'dayjs';
import queryString from 'querystring';

const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['HKPC.commom', 'bid.bidcommon'],
})
@Form.create({ fieldNameProp: null })
export default class EditMatComponent extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { refHeadId, formRecordId } = queryString.parse(search.substr(1)) || {};
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      dataSource: [],
      refHeadId,
      formRecordId,
    };
  }

  componentDidMount() {
    this.fetchEnum();
  }

  /**
 * 查询值集
 */
  fetchEnum = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/fetchDetailEnum',
    });
  }

  handleAddMat = () => {
    const { purchaseApplicationModel, dispatch } = this.props;
    const { editMatDataSource, headerInfo } = purchaseApplicationModel;
    const { currency } = headerInfo;
    const { refHeadId, formRecordId } = this.state;
    const newLine = {
      _status: 'create',
      refHeadId: refHeadId || formRecordId,
      poOrderId: uuidv4(),
      currency: currency,
    };
    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        editMatDataSource: [...editMatDataSource, newLine],
      },
    });
  }

  handleDelMat = () => {
    const { purchaseApplicationModel, dispatch } = this.props;
    const { editMatDataSource } = purchaseApplicationModel;
    const { selectedRows } = this.state;
    if (selectedRows.length > 0) {
      selectedRows.map((item) => {
        editMatDataSource.map((ite, j) => {
          if (item.poOrderId === ite.poOrderId && item._status === 'create') {
            editMatDataSource.splice(j, 1)
          }
        })
      })
      this.setState({ selectedRows: [], selectedRowKeys: [] })
      dispatch({
        type: `purchaseApplicationModel/updateState`,
        payload: {
          editMatDataSource: [...editMatDataSource],
        },
      });
    }
  }

  render() {
    const { purchaseApplicationModel } = this.props;
    const { headerInfo = {}, editMatDataSource = [], detailEnumMap = {} } = purchaseApplicationModel;
    const { projectNumber, projectType } = headerInfo;
    const { selectedRowKeys = [] } = this.state;
    const { budgetTypeList, purchaseCategoryList } = detailEnumMap;
    console.log('purchaseApplicationModel', purchaseApplicationModel);

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const columns = [
      {
        title: intl.get(`HKPC.commom.view.title.estimatedbudgettype`).d('预估预算类型'),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        required: true,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`budgetType`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`HKPC.commom.view.title.estimatedbudgettype`)
                        .d('预估预算类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={budgetTypeList}
                  onChange={(e) => {
                    record.budgetType = e;
                    record.purchasingCategoryMeaning = null
                    record.purchasingCategory = null
                    record.$form.setFieldsValue({
                      purchasingCategoryMeaning: null,
                      purchasingCategory: null,
                    })
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategory',
        required: true,
        width: 350,
        render: (_, record) => {
          let purchaseCategoryFilteredData
          if(record.budgetType === 'OPEX') {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          }
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`purchasingCategory`, {
                initialValue: record?.purchasingCategory,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={purchaseCategoryFilteredData}
                  disabled={!(record.budgetType)}
                  lazyLoad={false}
                  allowClear
                  onChange={(val) => {
                    record.purchasingCategory = val
                    record.$form.setFieldsValue({
                      purchasingCategory: val
                    })
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
        key: 'matName',
        width: 300,
        dataIndex: 'matName',
        required: true,
        render: (val, record) => (
          (<Form.Item>
              {record.$form.getFieldDecorator('matName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })
                (
                  <InputLov
                    isInput
                    code="CMHK.CATEGORY.ORGANIZATION"
                    lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                    queryParams={{ tenantId: organizationId, purchasingCategory: record.purchasingCategory }}
                    textValue={val}
                    disabled={!(record.purchasingCategory)}
                    onChange={(_, item) => {
                      if(item) {
                        record.unit = item?.uomCode;
                        record.matName = item?.itemDescription;
                        record.matNumber = item?.itemNumber;
                        record.$form.setFieldsValue({
                          model: item?.itemLongDescription,
                          unit: item?.uomCode,
                          matNumber: item?.itemNumber,
                        });
                      } else {
                        // 手动输入的时候
                        record.matNumber = '';
                      }
                    }}
                  />
                )}
          </Form.Item>)
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'model',
        width: 300,
        dataIndex: 'model',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('model', {
                initialValue: record.model,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
        key: 'unit',
        width: 180,
        dataIndex: 'unit',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('unit', {
                initialValue: record.unit,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
                    }),
                  },
                ],
              })(
                <CusLov
                  allowClear={false}
                  code="CMHKHPFM.UOM"
                  textValue={record.unitMeaning ? record.unitMeaning : record.unit}
                />
              )}
            </Form.Item>
          )
        }
      },
      // {
      //   title: intl.get('HKPC.commom.view.title.quotationCurrency').d('报价货币'),
      //   key: 'currency',
      //   width: 120,
      //   dataIndex: 'currency',
      //   render: tooltipRender,
      // },
      {
        title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
        key: 'quantity',
        width: 110,
        dataIndex: 'quantity',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('quantity', {
                initialValue: record.quantity,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  precision={4}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  className='cus-input-money'
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`HKPC.commom.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterName',
        key: 'costCenterName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 180,
        required: true,
        render: (_, record) => {
          console.log('record', record)
          return (
            <Form.Item>
            {record.$form.getFieldDecorator(`businessActivitiesName`, {
              initialValue: record.businessActivitiesName,
              rules: [
                {
                  required: record.budgetType === 'OPEX',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
                  }),
                },
              ],
            })(
              (record.budgetType === 'OPEX' || record.businessActivitiesName) ?
              <CusLov
                code="CPEX.OPEX"
                queryParams={{
                  tenantId: getCurrentOrganizationId(),
                  projectCode: projectNumber,
                  applyType: projectType,
                }}
                textValue={record.businessActivitiesName}
                onChange={(_, item) => {
                  record.budgetItemNumber = item.budCode; // 预算项目编码
                  record.businessActivitiesCode = item.busActivityCode; // 业务活动编码
                  record.businessActivitiesName = item.busActivityName; // 业务活动名称
                  record.costCenterCode = item.costCenterCode; // 成本中心编码
                  record.costCenterName = item.costCenternName; // 成本中心名称
                }}
              />
              :
              <></>
            )}
            </Form.Item>
          )
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
        key: 'deliverAddress',
        width: 300,
        dataIndex: 'deliverAddress',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('deliverAddress', {
                initialValue: record.deliverAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="CMHK.ERP.ADDRESS"
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'detailedAddress' }}
                  textValue={record.deliverAddress}
                  onChange={(_, item) => {
                    record.deliveryContactCode = item?.employeeNumber
                    record.deliverContact = item?.name
                    record.deliveryPhoneNumber = item?.contactTel
                    record.deliverAddressCode = item?.addressCode
                    record.$form.setFieldsValue({
                      deliveryContactCode: item?.employeeNumber,
                      deliverContact: item?.name,
                      deliveryPhoneNumber: item?.contactTel,
                    })
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddresscontacter').d('送货地址联系人'),
        key: 'deliverContact',
        width: 220,
        dataIndex: 'deliverContact',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('deliverContact', {
                initialValue: record.deliverContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliveryaddresscontacter').d('送货地址联系人'),
                    }),
                  },
                ],
              })(
                <CusLov
                  lovOptions={{ displayField: 'name', valueField: 'name' }}
                  code="CMHK.API.DELIVERYADDRESSPERSON"
                  textValue={record.deliverContact}
                  onChange={(_, item) => {
                    record.deliveryContactCode = item?.employeeNumber
                    record.deliveryPhoneNumber = item?.contactTel
                    record.$form.setFieldsValue({
                      deliveryContactCode: item?.employeeNumber,
                      deliveryPhoneNumber: item?.contactTel
                    })
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddressremrks').d('送货地址备注'),
        key: 'deliverAddressBakup',
        width: 300,
        dataIndex: 'deliverAddressBakup',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('deliverAddressBakup', {
                initialValue: record.deliverAddressBakup,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
        key: 'deliverDate',
        width: 160,
        dataIndex: 'deliverDate',
        required: true,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('deliverDate', {
                initialValue: record.deliverDate && dayjs(record.deliverDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  format={getDateFormat()}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverycontactnumber').d('送货联系电话'),
        key: 'deliveryPhoneNumber',
        width: 150,
        dataIndex: 'deliveryPhoneNumber',
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.Remark').d('备注'),
        key: 'deliveryAddressRemarks',
        width: 180,
        dataIndex: 'deliveryAddressRemarks',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('deliveryAddressRemarks', {
                initialValue: record.deliveryAddressRemarks,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
          )
        }
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: editMatDataSource,
      columns,
      pagination: false,
      rowSelection: rowSelection,
      rowKey: 'poOrderId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };

    return (
      <>
        <CusSpin spinning={false}>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
            {selectedRowKeys.length > 0 && <CusButton mini onClick={this.handleDelMat}>
              {intl.get('hzero.common.view.button.delete').d('删除')}
            </CusButton>}
            <CusButton mini onClick={this.handleAddMat}>
              {intl.get('hzero.common.button.create').d('新增')}
            </CusButton>
          </div>
          <EditTable {...tableProps} />
        </CusSpin>
      </>
    );
  }
}
