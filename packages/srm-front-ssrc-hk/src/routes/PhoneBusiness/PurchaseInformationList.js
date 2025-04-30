import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import { Debounce } from 'lodash-decorators';
import dayjs from 'dayjs';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from '_cus_components/CusSelect';
import CusModal from '_cus_components/CusModal';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import { getCurrentOrganizationId, tableScrollWidth, getDateFormat } from 'utils/utils';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { filter, isEmpty } from 'lodash';
import { numberRender } from 'utils/renderer';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const promptCode = 'HKPC.commom';
@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      recordData: {},
      purchasingCategoryList: [],
    }
  }
  
  // 打开规格型号modal
  handleOpenMatTypeModal = (record) => {
    this.setState({ visible: true, recordData: record });
    // 移除焦点
    document.activeElement.blur();
  };

  // 规格型号弹窗确认
  handleOkMatType = () => {
    const { recordData } = this.state;
    const { form, dispatch, purchaseInformationDetailSource } = this.props;
    const value = form.getFieldsValue().matTypeText;
    this.setState({ visible: false });
    recordData.$form.setFieldsValue({ matType: value });
    form.setFieldsValue({
      matTypeText: null
    })
    // const data = purchaseInformationDetailSource.map((item) => {
    //   if (item.rowKey === recordData.rowKey) {
    //     item.matType = value;
    //   }
    //   return item;
    // });
    // // 更新Modal
    // dispatch({
    //   type: 'purchaseApplicationModel/commentUpdateState',
    //   payload: {
    //     purchaseInformationDetailSource: data,
    //   },
    // });
  };

  // 旧PO过来查询的采购类别
  handlePurchasingCategory = (item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/getPurchasingCategory',
      payload: {
        invOrgCode: item.invOrgCode, // 采购类型
      }
    }).then((res) => {
      if(res) {
        this.setState({
          purchasingCategoryList: res.map((item) => ({
            meaning: item.purchasingCategoryName,
            value: item.purchasingCategory
          }))
        })
      }
    })
  }

  @Debounce(500)
  reduceAmountHkd() {
    const { dispatch, phoneBusinessListModal } = this.props;
    const { purchaseInformationDetailSource } = phoneBusinessListModal
    const estimatedBudgetAmountHkd = purchaseInformationDetailSource.reduce((a, b) => a + b.purchaseRequestAmountHkd, 0)
    dispatch({
      type: 'phoneBusinessListModal/updateState',
      payload:{
        estimatedBudgetAmountHkd
      }
    })
  }

  // 选择币种查询当前汇率
  handleSearchRate = (val, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/getPurchaseApplicationRate',
      payload: {
        currencyCode: val,
        rateDate: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then((res) => {
      if(res) {
        record.exchangeRate = res?.rate //汇率
        record.$form.setFieldsValue({
          exchangeRate: res?.rate
        })
        this.reduceAmountHkd();
      }
    })
  }

  // 获取PO编号
  getPoNumber = (page = {}, record, item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/getPoNumber',
      payload: {
        page,
        itemCode: item.itemnumber || item.itemNumber,
        organizationCode: item.invOrgCode || item.organizationCode,
      },
    }).then((res) => {
      if(res) {
        record.poNumber = res?.content?.[0]?.poNumber;
        record.purchasePrice = res?.content?.[0]?.price;
        record.$form.setFieldsValue({
          poNumberVal: res?.content?.[0]?.poNumber,
          poNumber: res?.content?.[0]?.poNumber,
          purchasePrice: res?.content?.[0]?.price,
        })
      }
    })
  }

  render() {
    const {
      form,
      dispatch,
      idpValueMap,
      rowSelection,
      phoneBusinessListModal,
      readyOnly = false,
      onChange = (e) => e,
      basicForm,
    } = this.props;

    const {
      visible,
      recordData,
      purchasingCategoryList,
    } = this.state;

    const {
      brandList,
      purchaseInformationDetailSource,
      purchaseInformationDetailPagination,
      associatedAgreement,
      // winningSupplier
    } = phoneBusinessListModal;

      console.log('associatedAgreement', associatedAgreement);
      
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'orderSeq',
        key: 'orderSeq',
        width: 80,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.suppliers`).d('供应商'),
        dataIndex: 'winningSupplier',
        width: 250,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.winningSupplier)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('winningSupplierVal', {
                initialValue: record.winningSupplier,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.suppliers`).d('供应商'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="CMHK.QUALIFIED_SUPPLIER"
                  disabled={associatedAgreement}
                  queryParams={{ tenantId: organizationId }}
                  lovOptions={{ displayField: 'companyNameCh', valueField: 'rowId' }}
                  textValue={record.winningSupplier}
                  onChange={(_, item) => {
                    record.winningSupplierNumber = item.supplierNumber;
                    record.winningSupplier = item.companyNameCh;
                    record.contacts = item.realName;
                    record.supplierPhone = item.phone;
                    record.$form.setFieldsValue({
                      winningSupplierNumber: item.supplierNumber,
                      winningSupplier: item.companyNameCh,
                      contacts: item.realName,
                      supplierPhone: item.phone,
                    })
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
      //   dataIndex: 'purchasingCategory',
      //   required: true,
      //   width: 250,
      //   render: (_, record) => {
      //     const matName = record.$form.getFieldValue('matName');
      //     console.log('purchasingCategoryList || purchaseCategoryFilteredData', purchasingCategoryList || purchaseCategoryFilteredData);
          
      //     let purchaseCategoryFilteredData;
      //     if (record.contentBudgetType === 'OPEX') {
      //       purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
      //         ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
      //       );
      //     } else if(record.contentBudgetType === 'CAPEX') {
      //       purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
      //         ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
      //       );
      //     }else{
      //       purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
      //         ['INV', 'INVS_ICTS', 'INVS_COUP'].includes(item.value)
      //       );
      //     }
      //     // return prStatusState == 'PENDING_REFER' || prStatusState == '' ?
      //     return readyOnly ? (
      //       tooltipRender(record.purchasingCategoryMeaning)
      //     ) : (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator(`purchasingCategory`, {
      //           initialValue: record?.purchasingCategory,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
      //               }),
      //             },
      //           ],
      //         })(
      //           <CusSelect
      //             options={purchasingCategoryList.length > 0 ? purchasingCategoryList : purchaseCategoryFilteredData}
      //             disabled={(basicForm?.isAssociatedAgreement === 'Y' && !(record?.$form?.getFieldValue('matName')))}
      //             lazyLoad={false}
      //             allowClear
      //             onChange={(val) => {
      //               record.purchasingCategory = val;
      //               if(basicForm?.isAssociatedAgreement === 'N') {
      //                   record.$form.setFieldsValue({
      //                   purchasingCategory: val,
      //                   matName: null,
      //                   brand: null,
      //                   brandCode: null,
      //                   matType: null,
      //                   productCode: null,
      //                   unit: null,
      //                 });
      //               }
      //             }}
      //           />
      //         )}
      //       </Form.Item>
      //     );
      //   },
      // },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        width: 150,
        required: true,
        render: (_, record) => {
          const purchasingCategoryVal = record.$form.getFieldValue('matName');
          return readyOnly ? (
            <Form.Item>
              {record?.$form?.getFieldDecorator('matName', {
                initialValue: record.matName,
              })(
                tooltipRender(record.matName)
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('matNameVal', {
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
                basicForm?.isAssociatedAgreement === 'Y' ?
                <CusLov
                  code="CMHK.CATEGORY.ORGANIZATION.NEW"
                  queryParams={{
                    frameworkCode: associatedAgreement,
                    brandCode: brandList
                    // purchasingCategory: record.purchasingCategory
                  }}
                  lovOptions={{ displayField: 'itemdescription', valueField: 'id' }}
                  textValue={record.matName}
                  disabled={!record.purchasingCategory}
                  onChange={(_, item) => {
                    console.log('item',item)
                    // record.purchasingCategory = item?.prType //采购类别
                    record.brand = item?.productLineName; // 品牌Name
                    record.brandCode = item?.productLineCode; // 品牌Code
                    record.matType = item?.itemlongdescription; // 规格型号
                    record.productCode = item?.productCode; // 产品编码
                    record.exchangeRate = item.exchangeRate //汇率
                    record.currency = item?.currency; // 币种
                    record.unitPrice = item.price //单价
                    record.warrantyPeriod = item.warranty //质保期
                    record.unit = item.unitofmeasure //单位
                    record.contentBudgetType = item?.budgettype; // 预算类型
                    record.matName = item?.itemdescription; // 物料名称
                    record.matCode = item?.itemnumber; // 物料编号
                    record.invOrgCode = item?.invOrgCode; // 采购类型
                    record.isNewOrOld = item?.isNewOrOld; // 是否旧PO数据(New=>新;Old=>旧)
                    record.lineNumber = item?.linenumber; // 行号
                    record.$form.setFieldsValue({
                      matName: item?.itemdescription, // 物料名称
                      matCode: item?.itemnumber, // 物料编号
                      currency: item?.currency, // 币种
                    })
                    // if(item.isNewOrOld === 'Old') {
                    //   this.handlePurchasingCategory(item);
                    // }
                    this.reduceAmountHkd();
                    this.getPoNumber(_, record, item);
                  }}
                />
                :
                <CusLov
                  code="CMHK.CATEGORY.ORGANIZATION"
                  disabled={!record.purchasingCategory}
                  textValue={record.matName}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    purchasingCategory: record.purchasingCategory,
                    brandCode: brandList,
                    consignFlag: basicForm?.prType === 'salesbusinessproduct' ? null : basicForm?.prType === 'consignment' ? 'Y' : 'N', // 是否寄售: 寄售品传Y,免费品传N
                  }}
                  lovOptions={{ displayField: 'itemDescription', valueField: 'id' }}
                  onChange={(_, item) => {
                    record.matName = item?.itemDescription; // 物料名称
                    record.brand = item?.productLineName; // 品牌Name
                    record.brandCode = item?.productLineCode; // 品牌Code
                    record.matType = item?.itemLongDescription; // 规格型号
                    record.productCode = item?.productCode; // 产品编码
                    record.matCode = item?.itemNumber; // 物料编号
                    record.unit = item?.uomCode; // 单位编码
                    record.isNewOrOld = 'New';
                    record.$form.setFieldsValue({
                      unit: item?.uomCode, // 单位编码
                      matCode: item?.itemNumber, // 物料编号
                      matName: item?.itemDescription, // 物料名称
                    })
                    this.getPoNumber(_, record, item);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        width: 200,
        render: (_, record) => {
          return readyOnly ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`matType`, {
                initialValue: record?.matType,
              })(
                tooltipRender(record.matType)
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`matType`, {
                initialValue: record?.matType,
              })(
                <CusInput onFocus={() => this.handleOpenMatTypeModal(record)} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ProductCode`).d('产品编码'),
        dataIndex: 'productCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'qty',
        width: 100,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            <Form.Item>
              {record?.$form?.getFieldDecorator('qty', {
                initialValue: record.qty,
              })(
                tooltipRender(record.qty)
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('qty', {
                initialValue: record.qty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  precision={4}
                  onChange={() => {
                    this.reduceAmountHkd();
                  }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
        dataIndex: 'unitPrice',
        width: 100,
        required: basicForm?.prType !== 'freeofcharge',
        render: (_, record) => {
          return (readyOnly || basicForm?.prType === 'freeofcharge') ? (
            <Form.Item>
              {record?.$form?.getFieldDecorator('unitPrice', {
                initialValue: basicForm?.prType === 'freeofcharge' ? 0 : record.unitPrice,
              })(
                <div style={{ textAlign: 'right' }}>{numberRender(basicForm?.prType === 'freeofcharge' ? 0 : record.unitPrice, 4)}</div>
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  className="cus-input-money"
                  style={{ width: '100%' }}
                  step={0.1}
                  min={0}
                  precision={4}
                  allowThousandth
                  onChange={() => {
                    this.reduceAmountHkd();
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountO`).d('预估总金额原币'),
        dataIndex: 'estimatedTotalAmount',
        key: 'estimatedTotalAmount',
        width: 180,
        required: basicForm?.prType !== 'freeofcharge',
        render: (val, record) => {
          const estimatedTotalAmount = record?.$form?.getFieldValue('qty') * record?.$form?.getFieldValue('unitPrice');
          record.estimatedTotalAmount = estimatedTotalAmount;
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(estimatedTotalAmount, 4)}</div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 120,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.currency)
          ) :  (
            <Form.Item>
              {record?.$form?.getFieldDecorator('currency', {
                initialValue: record.currency,
              })(
                <CusLov
                  disabled={readyOnly}
                  textValue={record.currency}
                  code="CMHKHPFM.CURRENCY"
                  lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                  onChange={(val) => {
                    this.handleSearchRate(val, record);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.rate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 100,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(record?.exchangeRate, 4)}</div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        dataIndex: 'purchaseRequestAmountHkd',
        width: 150,
        render: (_, record) => {
          const purchaseRequestAmountHkd = record?.estimatedTotalAmount * record?.exchangeRate;
          record.purchaseRequestAmountHkd = purchaseRequestAmountHkd;
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(purchaseRequestAmountHkd, 4)}</div>
          )
          // return readyOnly ? (
          //   <div style={{ textAlign: 'right' }}>{numberRender(purchaseRequestAmountHkd, 4)}</div>
          // ) : (
          //   <Form.Item>
          //     {record?.$form?.getFieldDecorator('purchaseRequestAmountHkd', {
          //       initialValue: record.purchaseRequestAmountHkd,
          //     })(
          //       <CusInputNumber
          //         className="cus-input-money"
          //         style={{ width: '100%' }}
          //         step={0.01}
          //         min={0}
          //         allowThousandth
          //         onChange={(value)=>{
          //           record.purchaseRequestAmountHkd = value;
          //           const estimatedBudgetAmountHkd = purchaseInformationDetailSource.reduce((a, b)=>a + b.purchaseRequestAmountHkd,0)
          //           dispatch({
          //             type: 'phoneBusinessListModal/updateState',
          //             payload:{
          //               estimatedBudgetAmountHkd
          //             }
          //           })
          //           console.log('phoneBusinessListModal',phoneBusinessListModal)
          //         }}
          //       />
          //     )}
          //   </Form.Item>
          // );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warrantyPeriod',
        width: 150,
        render: (_, record) => {
          return readyOnly ? (
            <Form.Item>
              {record?.$form?.getFieldDecorator('warrantyPeriod', {
                initialValue: record.warrantyPeriod,
              })(
                tooltipRender(record.warrantyPeriod)
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('warrantyPeriod', {
                initialValue: record.warrantyPeriod,
              })(
                <CusInput.TextArea autoChangeSize={true} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
        dataIndex: 'deliveryTerms',
        width: 200,
        required: true,
        render: (_, record) => {
          return (
            <>
              <Row>
                <Col span={record.$form.getFieldValue('deliveryTerms') === 'N/A' ? 12 : 24}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('deliveryTerms', {
                      initialValue: record.deliveryTerms || 'DDP',
                      rules: [
                        {
                          required: !readyOnly,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
                          }),
                        },
                      ],
                    })(
                      <CusSelect
                        allowClear
                        style={{ width: '100%' }}
                        options={idpValueMap['HKPC.DELIVERYTERMS']}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>
                {record.$form.getFieldValue('deliveryTerms') === 'N/A' && <Col span={12}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('deliveryTermsExtend', {
                      initialValue: record.deliveryTermsExtend,
                    })(
                      <CusInput.TextArea
                        rows={3}
                        autosize={{ minRows: 3, maxRows: 3 }}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>}
              </Row>
            </>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
        dataIndex: 'paymentTerms',
        width: 200,
        required: true,
        render: (_, record) => {
          return (
            <>
              <Row>
                <Col span={record.$form.getFieldValue('paymentTerms') === 'OTHERS' ? 12 : 24}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('paymentTerms', {
                      initialValue: record.paymentClause || '30D',
                      rules: [
                        {
                          required: !readyOnly,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
                          }),
                        },
                      ],
                    })(
                      <CusSelect
                        allowClear
                        style={{ width: '100%' }}
                        options={idpValueMap['HKPC.PAYMENTTERMS']}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>
                {record.$form.getFieldValue('paymentTerms') === 'OTHERS' && <Col span={12}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('paymentTermsExtend', {
                      initialValue: record.paymentTermsExtend,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
                          }),
                        },
                      ],
                    })(
                      <CusInput.TextArea
                        rows={3}
                        autosize={{ minRows: 3, maxRows: 3 }}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>}
              </Row>
            </>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
        dataIndex: 'paymentType',
        width: 200,
        required: true,
        render: (_, record) => {
          return (
            <>
              <Row>
                <Col span={record.$form.getFieldValue('paymentType') === 'P_NA' ? 12 : 24}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('paymentType', {
                      initialValue: record.paymentType,
                      rules: [
                        {
                          required: !readyOnly,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
                          }),
                        },
                      ],
                    })(
                      <CusSelect
                        allowClear
                        style={{ width: '100%' }}
                        options={idpValueMap['HKPC.PAYMENTMETHOD']}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>
                {record.$form.getFieldValue('paymentType') === 'P_NA' && <Col span={12}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('paymentTypeExtend', {
                      initialValue: record.paymentTypeExtend,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
                          }),
                        },
                      ],
                    })(
                      <CusInput.TextArea
                        rows={3}
                        autosize={{ minRows: 3, maxRows: 3 }}
                        disabled={readyOnly}
                      />
                    )}
                  </Form.Item>
                </Col>}
              </Row>
            </>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
        dataIndex: 'paymentArrangement',
        required: basicForm?.prType === 'salesbusinessproduct',
        width: 150,
        render: (_, record) => {
          return readyOnly ? (
            <Form.Item>
              {record?.$form?.getFieldDecorator('paymentArrangement', {
                initialValue: record.paymentArrangement,
              })(
                tooltipRender(record.paymentArrangement)
              )}
            </Form.Item>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('paymentArrangement', {
                initialValue: record.paymentArrangement,
                rules: [
                  {
                    required: basicForm?.prType === 'salesbusinessproduct',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
                    }),
                  },
                ],
              })(
                <CusInput.TextArea autoChangeSize={true} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.demandcompletiondate`).d('需求完成日期'),
        dataIndex: 'requirementDate',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.requirementDate)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('requirementDate', {
                initialValue: dayjs(record.requirementDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.demandcompletiondate`)
                        .d('需求完成日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  disabled={readyOnly}
                  disabledDate={(currentDate) => dayjs().isAfter(currentDate, 'day')}
                  format={getDateFormat()}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliverDate',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.deliverDate)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('deliverDate', {
                initialValue: record.deliverDate ? dayjs(record.deliverDate) : dayjs(),
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
                  disabled={readyOnly}
                  disabledDate={(currentDate) => dayjs().isAfter(currentDate, 'day')}
                  format={getDateFormat()}
                  onChange={(val) => {
                    record.deliverDate = val
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliverAddress',
        key: 'deliverAddress',
        width: 180,
        required: true,
        render: (_, record, recordIndex) => {
          return readyOnly ? (
            tooltipRender(record.deliverAddress)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverAddressId`, {
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
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'id' }}
                  code="CMHK.ERP.ADDRESS"
                  onChange={(val, data) => {
                    if (!val) {
                      record.addressCode = null;
                      record.deliverContact = null;
                      record.deliverAddress = null;
                      record.deliveryPhoneNumber = null;
                      record.deliverContactCode = null;
                      record.$form.setFieldsValue({
                        addressCode: null,
                        deliverContact: null,
                        deliverAddress: null,
                        deliveryPhoneNumber: null,
                        deliverContactCode: null,
                      });
                    } else {
                      record.addressCode = data.addressCode;
                      record.deliverContact = data.name;
                      record.deliverAddress = data.detailedAddress;
                      record.deliveryPhoneNumber = data.contactTel;
                      record.deliverContactCode = data?.employeeNumber;
                      record.$form.setFieldsValue({
                        addressCode: data.addressCode,
                        deliverContact: data.name,
                        deliverAddress: data.detailedAddress,
                        deliveryPhoneNumber: data.contactTel,
                        deliverContactCode: data?.employeeNumber,
                      });
                    }
                    const dataLineSource = purchaseInformationDetailSource?.map((item) => {
                      if(recordIndex === 0 && !(item?.deliverAddress)) {
                        item.deliverAddress = data?.detailedAddress;
                        item.addressCode = data?.addressCode;
                        item.deliverContact = data?.name;
                        item.deliveryPhoneNumber = data?.contactTel;
                        item.deliverContactCode = data?.employeeNumber
                      }
                      return item;
                    });
                    form.resetFields([`deliveryPhoneNumber`, `deliverContact`]);
                    dispatch({
                      type: 'phoneBusinessListModal/updateState',
                      payload: {
                        deliverAddress: data.detailedAddress,
                        purchaseInformationDetailSource: dataLineSource,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: labelTip({
          label: intl.get(`${promptCode}.view.title.deliverycontact`).d('送货地址联系人'),
          tip: intl.get(`${promptCode}.view.title.selectaddress`).d('请先选择送货地址'),
        }),
        dataIndex: 'deliverContact',
        key: 'deliverContact',
        width: 200,
        required: true,
        render: (val, record) => {
          return readyOnly ? (
            tooltipRender(record.deliverContact)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverContactId`, {
                initialValue: record?.deliverContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.deliverycontact`)
                        .d('送货地址联系人'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={!record.deliverAddress}
                  textValue={record.deliverContact}
                  textField={record.deliverContact}
                  lovOptions={{ displayField: 'name', valueField: 'rowId' }}
                  code="CMHK.API.DELIVERYADDRESSPERSON"
                  onChange={(_, lovData) => {
                    record.deliverContact = lovData.name;
                    record.deliveryPhoneNumber = lovData.contactTel;
                    record.deliverContactCode = lovData.employeeNumber;
                    dispatch({
                      type: 'phoneBusinessListModal/updateState',
                      payload: {
                        deliverContact: lovData.name,
                        deliveryPhoneNumber: lovData.contactTel,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliverycontactnumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        key: 'deliveryPhoneNumber',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.LastPOnumber`).d('上次PO单号'),
        dataIndex: 'poNumber',
        width: 180,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.poNumber)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('poNumberVal', {
                initialValue: record.poNumber,
              })(
                <CusLov
                  textValue={record.poNumber}
                  code="CMHK.PO.INFO"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    itemCode: record?.matCode, // 物料编码
                    organizationCode: record?.invOrgCode, // 库存组织编码
                  }}
                  onChange={(_, data) => {
                    record.poNumber = data.poNumber;
                    record.purchasePrice = data.price;
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.LastpurchasepriceH`).d('上次采购价 (HKD）'),
        dataIndex: 'purchasePrice',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(record?.purchasePrice, 4)}</div>
          )
        },
      },
      basicForm?.prType === 'freeofcharge' && {
        title: intl.get(`${promptCode}.view.title.invoiceaddress`).d('发票地址'),
        dataIndex: 'invoiceAddress',
        width: 250,
        render: (_, record) => {
          const invoiceAddress = intl.get(`${promptCode}.view.title.invoiceaddresssvalue`).d('发票地址value');
          return (
            <Form.Item>
              {record?.$form?.getFieldDecorator('invoiceAddress', {
                initialValue: invoiceAddress,
              })(
                tooltipRender(invoiceAddress)
              )}
            </Form.Item>
          )
        },
      },
    ].filter(Boolean);

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={readyOnly ? false : rowSelection}
          dataSource={purchaseInformationDetailSource}
          pagination={purchaseInformationDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />

        <CusModal
          title={intl.get(`${promptCode}.view.title.specification`).d('规格型号')}
          visible={visible}
          onCancel={() => {
            this.setState({ visible: false });
            form.setFieldsValue({ matTypeText: null });
          }}
          onOk={this.handleOkMatType}
          width={800}
          destroyOnClose
        >
          <div className={styles['out-ant-input']}>
            <Form className="customize-form">
              <Form.Item>
                {form.getFieldDecorator(`matTypeText`, {
                  initialValue: !(isEmpty(recordData)) && recordData?.$form.getFieldValue('matType'),
                })(
                  <CusInput.TextArea
                    rows={3}
                    autosize={3}
                    onChange={(e) => {
                      form.setFieldsValue({ matTypeText: e });
                    }}
                  />
                )}
              </Form.Item>
            </Form>
          </div>
        </CusModal>
      </>
    );
  }
}
