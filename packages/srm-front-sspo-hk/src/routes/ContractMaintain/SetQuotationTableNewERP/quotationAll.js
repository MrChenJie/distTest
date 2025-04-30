/*
 * ui 修改
 * @date: 2023-08-04
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Modal, Upload, Select, InputNumber, Tooltip } from 'antd';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusSpin from '_cus_components/CusSpin';
import CusInput from '_cus_components/CusInput';
import { Bind, Debounce } from 'lodash-decorators';
import styles from './index.less';
import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, tableScrollWidth, getCurrentLanguage, getEditTableData, getDateFormat } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusNotification from '_cus_components/CusNotification';
import { downloadFile } from 'hzero-front/lib/services/api';
import InputLov from './CusLov';
import CusLov from '_cus_components/CusLov';
import CusModal from '_cus_components/CusModal';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import { tooltipRender } from '_cus_utils/render';
import { uniqWith, filter } from 'lodash';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusDatePicker from '_cus_components/CusDatePicker';
import dayjs from 'dayjs';
import CusMultiLov from '_cus_components/CusMultiLov';

const status = ['create', 'update'];
const organizationId = getCurrentOrganizationId();
const FormItem = Form.Item;

@formatterCollections({
  code: ['bid.bidcommon', 'HKPC.commom'],
})
export default class QuotationAllList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      templatePriceCode: 'HKPC.PURCHASE_REQUEST_IMPORT_BID',
      selectItem: props.getDetailList.priceType || 'unitPrice',
      uploadLoading: false,
    };
  }

  componentDidMount() {
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
  }

  @Bind
  handleChangeFormItem(val) {
    // CusModal.confirm({
    //   content: intl
    //     .get('bid.bidcommon.view.message.confirmswitch')
    //     .d('切换报价模式将清空当前报价数据，请确认是否切换？'),
    //   okType: 'normal',
    //   onOk: () => {
    //     const { onChangeFormItem = (e) => e } = this.props;
    //     onChangeFormItem(val);
    //     this.handleDataChange()
    //     this.setState({
    //       selectItem: val,
    //     });
    //   },
    // });
    const { onChangeFormItem = (e) => e } = this.props;
    onChangeFormItem(val);
    this.handleDataChange()
    this.setState({
      selectItem: val,
    });
  }

  /**
   * 添加行
   *
   * @memberof QuotationAllList
   */
  @Bind
  handleAddLine() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
    //  this.handleDataChange();
  }

  /**
   *删除行
   *
   * @memberof QuotationAllList
   */
  @Bind
  @Debounce(300, { leading: true })
  handleDeleteLine() {
    const { onDeleteLine = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onDeleteLine(selectedRowKeys, selectedRows, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    });
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof QuotationAllList
   */
  @Bind
  handleDataChange() {
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof QuotationAllList
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
        onOk: () => {
          onPageChange();
        },
      });
    } else {
      onPageChange(page);
    }
  }

  @Bind
  beforeUpload(file) {
    const {
      templateCode = 'BID.PRICE_CONFIGS',
      param = {},
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    if (file.uid) {
      const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        query: param,
        body: formData,
        responseType: 'text',
      })
        .then((res) => {
          if (this.isJSON(res)) {
            CusNotification.error({
              message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败'),
            });
          } else if (res) {
            // 导入成功后查一遍数据进行导入的数据展示
            const params = {
              templateCode: templateCode,
              batch: res,
            };
            setTimeout(() => {
              this.handleImportData(params, file)
            }, 500)
          }
        })
    }
    return false;
  }

  isJSON(str) {
    let result;
    try {
      result = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return isObject(result) && !isString(result);
  }

  /**
   * 处理数据导入后的数据展示(保存)
   *
   * @memberof Import
   */
  @Bind()
  handleImportData(params) {
    const { onImportData = (e) => e } = this.props;
    onImportData(params);
    setTimeout(() => {
      this.setState({
        uploadLoading: false,
      });
    }, 500)
  }

  /**
   * 下载模板
   */
  @Bind()
  handleDownloadTemplateClick() {
    const { templatePriceCode } = this.state;
    const api = `${SRM_BID}/v1/${organizationId}/import/template/${templatePriceCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] });
  }

  // 选完之后直接保存选中数据
  @Bind()
  handleSavePrice() {
    const { dispatch, matchs, dataSource, getQuotationList = (e) => e } = this.props;
    const newList = getEditTableData(dataSource).map((item) =>
    item._status === 'create'
      ? {
        ...item,
        poOrderId: undefined,
        proId: matchs.params.proId
      }
      : {
        ...item,
      }
    );
    let data = newList.sort();
    console.log('newList', newList)
    const repeatDataSource = uniqWith(newList, (r1, r2) => r1.remarks === r2.remarks);
    if(repeatDataSource.length !== data.length) {
      CusNotification.error({
        message: intl.get('HKcommom').d('重复选择物料')
      });
      return;
    }
    // if(data.length > 0) {
    //   dispatch({
    //     type: 'contractMaintain/saveQuotation',
    //     payload: {
    //       data,
    //     },
    //   }).then((res) => {
    //     if(res) {
    //       getQuotationList()
    //     }
    //   })
    // }
  }

  // 选择物料
  @Bind
  handleMat(record) {
    const { onMatLine = (e) => e } = this.props;
    onMatLine(record);
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      onSave = (e) => e,
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      priceFlag = false,
      getDetailList = {},
      matchs,
      detailEnumMap = {},
      disabled,
      match,
      erpAllInfo,
      importTemplate = (e) => e,
    } = this.props;
    console.log('erpAllInfo', erpAllInfo)
    console.log('data', priceFlag ,getDetailList ,getDetailList.priceType !== null)
    const { proId } = matchs.params;
    const { proCode } = match.params;
    const { quotationMode = [], budgetTypeList = [], purchaseCategoryList = [] } = detailEnumMap;
    const { selectItem, selectedRowKeys = [], uploadLoading = false } = this.state;
    const { projectNumber, projectType } = erpAllInfo;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 130,
        fixed: 'left',
        dataIndex: 'orderSeq',
        render: (val, row, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`HKPC.commom.view.title.estimatedbudgettype`).d('预估预算类型'),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        required: true,
        render: (val, record) => {
          let budgetTypeListData;
          if(projectType == '2') {
            budgetTypeListData = filter(budgetTypeList, (item) =>
              ['INVENTORY'].includes(item.value)
            );
          } else {
            budgetTypeListData = filter(budgetTypeList, (item) =>
              ['CAPEX', 'OPEX'].includes(item.value)
            );
          }

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
                  options={
                    budgetTypeListData
                  }
                  onChange={(e) => {
                    record.budgetType = e;
                    record.purchasingCategoryMeaning = null
                    record.purchasingCategory = null
                    record.$form.setFieldsValue({
                      purchasingCategoryMeaning: null,
                      purchasingCategory: null,
                    })
                    // if(!e) {
                    //   record.purchasingCategoryMeaning = null
                    //   record.purchasingCategory = null
                    //   record.$form.setFieldsValue({
                    //     purchasingCategoryMeaning: null,
                    //     purchasingCategory: null,
                    //   })
                    // }
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
          } else if(record.budgetType === 'CAPEX') {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['INV', 'INV_ICTS', 'INVS_COUP'].includes(item.value)
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
        key: 'purchaseContent',
        width: 300,
        dataIndex: 'purchaseContent',
        required: !disabled,
        render: (val, record) => (
          disabled ? tooltipRender(val) : (<Form.Item>
              {record.$form.getFieldDecorator('purchaseContentVal', {
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
                  projectType == '2' ?
                  <CusLov
                    code="CMHK.CATEGORY.ORGANIZATION"
                    lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                    queryParams={{ tenantId: organizationId, purchasingCategory: record.purchasingCategory }}
                    textValue={val}
                    disabled={!(record.purchasingCategory)}
                    onChange={(_, item) => {
                      record.unit = item?.uomCode;
                      record.matNumber = item?.itemNumber;
                      record.purchaseContent = item?.itemDescription
                      record.$form.setFieldsValue({
                        serviceContent: item?.itemLongDescription,
                        unit: item?.uomCode,
                        matNumber: item?.itemNumber,
                        purchaseContent: item?.itemDescription,
                      });
                    }}
                  />
                  :
                  <InputLov
                    isInput
                    code="CMHK.CATEGORY.ORGANIZATION"
                    lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                    queryParams={{ tenantId: organizationId, purchasingCategory: record.purchasingCategory }}
                    textValue={val}
                    disabled={!(record.purchasingCategory)}
                    onChange={(val, item) => {
                      if(item) {
                        record.unit = item?.uomCode;
                        record.matNumber = item?.itemNumber;
                        record.purchaseContent = item?.itemDescription
                        record.$form.setFieldsValue({
                          serviceContent: item?.itemLongDescription,
                          unit: item?.uomCode,
                          matNumber: item?.itemNumber,
                          purchaseContent: item?.itemDescription,
                        });
                      } else {
                        // 手动输入的时候
                        record.matNumber = '';
                        record.purchaseConten = val;
                      }
                    }}
                  />
                )}
          </Form.Item>)
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'serviceContent',
        width: 300,
        // required: !disabled,
        dataIndex: 'serviceContent',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('serviceContent', {
                initialValue: record.serviceContent,
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
                //     }),
                //   },
                // ],
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
          )
        }
      },
      // {
      //   title: intl.get('HKPC.commom.view.title.quotationCurrency').d('报价货币'),
      //   key: 'priceCurrency',
      //   width: 120,
      //   required: !disabled,
      //   dataIndex: 'priceCurrency',
      //   render: (_, record) => {
      //     return (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('priceCurrency', {
      //           initialValue: record.priceCurrency,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get('HKPC.commom.view.title.quotationCurrency').d('报价货币'),
      //               }),
      //             },
      //           ],
      //         })(
      //           <CusLov
      //             allowClear={false}
      //             code="HPFM.CURRENCY"
      //             textValue={record.priceCurrency}
      //           />
      //         )}
      //       </Form.Item>
      //     )
      //   }
      // },
      {
        title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
        key: 'unit',
        width: 180,
        required: !disabled,
        dataIndex: 'unit',
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
      {
        title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
        key: 'count',
        width: 110,
        required: !disabled,
        dataIndex: 'count',
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('count', {
                initialValue: record.count,
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
                  className='cus-input-money'
                  allowThousandth
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
        key: 'deliverAddress',
        width: 300,
        required: !disabled,
        dataIndex: 'deliverAddress',
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
                  allowClear={false}
                  code="CMHK.ERP.ADDRESS"
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'detailedAddress' }}
                  textValue={record.deliverAddress}
                  onChange={(_, item) => {
                    record.deliveryContactCode = item?.employeeNumber
                    record.deliverContact = item?.name
                    record.deliveryPhoneNumber = item?.contactTel
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
        required: !disabled,
        dataIndex: 'deliverContact',
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
                  allowClear={false}
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
        required: !disabled,
        dataIndex: 'deliverDate',
        render: (_, record) => {
          console.log('creationDate', record.creationDate)
          console.log('deliverDate', record.deliverDate)
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
        required: !disabled,
        dataIndex: 'deliveryPhoneNumber',
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterName',
        key: 'costCenterName',
        width: 150,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 180,
        required: true,
        render: (_, record) => {
          console.log('record', record)
          return (
            <Form.Item>
            {record.$form.getFieldDecorator(`businessActivitiesNameVal`, {
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

    const loading = saveLoading || deleteLoading || fetchLoading;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record._status === undefined || disabled,
      }),
    };

    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };

    return (
      <CusSpin spinning={fetchLoading || deleteLoading || uploadLoading}>
        <div>
          <Form className="customize-form" >
            <div
              className="formItemLabel"
              style={{
                display: 'flex',
                float: 'right'
              }}
            >
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.quotemode`).d('报价模式')}
              >
                <CusSelect
                  style={{ width: '100%' }}
                  // disabled={priceFlag || getDetailList.priceType}
                  defaultValue='unitPrice'
                  placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                  options={quotationMode}
                  onChange={this.handleChangeFormItem}
                >
                </CusSelect>
              </FormItem>
              {!disabled && <FormItem>
                <CusButton
                  mini
                  onClick={() => this.handleDownloadTemplateClick()}
                >
                  {intl.get('hzero.common.view.button.download').d('下载')}
                </CusButton>
                <CusExcelExport
                  disabled={disabled || selectItem === ''}
                  requestUrl={`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/exportProInfo?proId=${proId}`}
                  downloadType="Blob"
                  fileName={intl
                    .get(`view.export.estimateCode`)
                    .d('报价表设置导出')}
                  otherButtonProps={{
                    mini: true,
                    icon: null,
                  }}
                  buttonText={
                    <>
                      {intl.get('bid.bidcommon.view.button.export').d('导出')}
                    </>
                  }
                />
                <CusButton
                  mini
                  onClick={importTemplate}
                >
                  {intl.get('hzero.common.view.button.Import').d('导入')}
                </CusButton>
                { !(selectedRowKeys.length === 0 || loading) &&<CusButton
                  onClick={this.handleDeleteLine}
                  mini
                  disabled={selectedRowKeys.length === 0 || loading}
                >
                  {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                </CusButton>}
                <CusMultiLov
                  isButton
                  code="BID_PRO_QUOTATION"
                  lovOptions={{ displayField: 'matName', valueField: 'id' }}
                  queryParams={{ tenantId: organizationId, proCode: proCode }}
                  onChange={(_, record) => {
                    this.handleMat(record);
                  }}
                >{intl.get(`HKPC.commom.view.title.choosematerial`).d('选择物料')}</CusMultiLov>
                { !(selectItem === '' ||
                    (selectItem === 'totalPrice' && dataSource.length > 0) ||
                    (getDetailList.priceType === 'totalPrice' && dataSource.length > 0)) &&<CusButton
                  onClick={this.handleAddLine}
                  mini
                  disabled={
                    selectItem === '' ||
                    (selectItem === 'totalPrice' && dataSource.length > 0) ||
                    (getDetailList.priceType === 'totalPrice' && dataSource.length > 0)
                  }
                >
                  {intl.get('bid.bidcommon.view.button.add').d('添加')}
                </CusButton>}
                {/* <CusButton
                  mini
                  onClick={onSave}
                  disabled={selectItem === ''}
                >
                  {intl.get('bid.bidcommon.view.button.save').d('保存')}
                </CusButton> */}
              </FormItem>}

            </div>
          </Form>
          <div style={{ marginTop: '16px' }}>
            <EditTable
              rowKey="poOrderId"
              dataSource={dataSource}
              pagination={pagination}
              onChange={this.handlePageChange}
              columns={columns}
              rowSelection={rowSelection}
              onDataChange={this.handleDataChange}
              scroll={{ x: tableScrollWidth(columns) }}
            />
          </div>
        </div>
      </CusSpin>
    );
  }
}
