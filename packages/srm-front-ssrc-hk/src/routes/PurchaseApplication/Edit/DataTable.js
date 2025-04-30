import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { multiply, pullAllBy, upperFirst, filter, isEmpty } from 'lodash';
import { labelTip, tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import { Input, Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import dayjs from 'dayjs';
import styles from './index.less';
import queryString from 'querystring';
import CusInputNumber from '_cus_components/CusInputNumber';
import InputLov from '_cus_components/InputLov';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import searchIcon from '@/assets/searchIcon.svg';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'rowKey';
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
      prState: '',
      costCenterModel: false,
      visible: false,
      recordData: {},
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
    });
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
    let budgetPricesHkdTotal = 0;
    lineResultList.map((item) => {
      budgetPricesHkdTotal += multiply(Number(item.qty) * Number(item?.matPriceHkd));
    });
    this.props.getPurchaseApplicationLine(budgetPricesHkdTotal);
    // console.log(budgetPricesHkdTotal,'????');
    // console.log('lineResultList',lineResultList);
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        purchaseApplicationLineSource: lineResultList,
        estimatedBudgetAmountHkd: budgetPricesHkdTotal,
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

  searchButton = () => {
    return <img src={searchIcon} alt="searchIcon" style={{ cursor: 'pointer', color: '#666' }} />;
  };

  onSearchBtnClick = () => {
    // this.handleSearch();
    this.setState({
      costCenterModel: true,
    });
  };

  // 打开规格型号modal
  handleOpenMatTypeModal = (record) => {
    this.setState({ visible: true, recordData: record });
    // 移除焦点
    document.activeElement.blur();
    // const { form } = this.props;
    // const value = form.getFieldsValue()[`${record['uuid']}#matType`];
    // form.setFieldsValue({ matTypeText: value });
    // 阻止事件冒泡
    // event.preventDefault();
    // event.stopPropagation();
  };

  // 规格型号弹窗确认
  handleOkMatType = () => {
    const { recordData } = this.state;
    const { form, dispatch, purchaseApplicationLineSource } = this.props;
    const value = form.getFieldsValue().matTypeText;
    this.setState({ visible: false });
    recordData.$form.setFieldsValue({ matType: value });
    form.setFieldsValue({
      matTypeText: null
    })
    const data = purchaseApplicationLineSource.map((item) => {
      if (item.rowKey === recordData.rowKey) {
        item.matType = value;
      }
      return item;
    });
    // 更新Modal
    dispatch({
      type: 'purchaseApplicationModel/commentUpdateState',
      payload: {
        purchaseApplicationLineSource: data,
      },
    });
  };

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
      location: { search },
      prStatusState,
    } = this.props;
    const {
      visible,
      recordData,
      selectedRows,
      selectedRowKeys,
      purchaseApplicationLineList,
      prApplyMaterialListValue,
      prState,
    } = this.state;
    const {
      deliverAddress,
      prStatus,
      projectType,
      materialsList,
      materialsPagination,
      projectNumber,
      prType,
    } = purchaseApplicationModel;
    // console.log(idpValueMap['HKPC.BUDGETTYPE'], "idpValueMap['HKPC.BUDGETTYPE']");
    const suffix = (
      <>
        <div className="cus-lov-clear" />
        {this.searchButton()}
      </>
    );
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'serialId',
        key: 'serialId',
        width: 100,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.estimatedbudgettype`).d('预估预算类型'),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`budgetType`, {
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
                      ? ['simpleInquiry1', 'generalProcurement1', 'generalProcurement2', 'generalProcurement3', 'frameworkSubOrder'].includes(prType) ?
                        filter(idpValueMap['HKPC.BUDGETTYPE'], (item) =>
                          ['CAPEX', 'OPEX'].includes(item.value)
                        )
                        :
                        filter(idpValueMap['HKPC.BUDGETTYPE'], (item) =>
                          ['CAPEX', 'OPEX', 'INVENTORY'].includes(item.value)
                        )
                      : idpValueMap['HKPC.BUDGETTYPE']?.filter((item) => item.tag == '1')
                  }
                  onChange={(e) => {
                    record.budgetType = e;
                    record.purchasingCategoryMeaning = null;
                    record.purchasingCategory = null;
                    record.$form.setFieldsValue({
                      purchasingCategory: null,
                      businessActivitiesName: null,
                    });
                    record.$form.resetFields();
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span>{upperFirst(val)}</span>
          );
        },
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategoryMeaning',
        required: true,
        width: 350,
        render: (_, record) => {
          let purchaseCategoryFilteredData;
          if (record.budgetType === 'OPEX') {
            purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
              ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          }
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
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
                  lazyLoad={false}
                  allowClear
                  onChange={(val) => {
                    record.purchasingCategory = val;
                    record.$form.setFieldsValue({
                      purchasingCategory: val,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(record.purchasingCategoryMeaning)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        key: 'matName',
        width: 350,
        required: true,
        render: (val, record) => {
          record.$form.resetFields();
          const purchasingCategoryVal = record.$form.getFieldValue('purchasingCategory');
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`matName`, {
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
                projectType == '2' ?
                <CusLov
                  allowClear={false}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    purchasingCategory: purchasingCategoryVal || record.purchasingCategory,
                  }}
                  code="CMHK.CATEGORY.ORGANIZATION"
                  textValue={record.matName}
                  lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                  disabled={!purchasingCategoryVal && !record.purchasingCategory}
                  onChange={(_, item) => {
                    // 选择的时候
                    record.matName = item?.itemDescription; // 物料名称
                    record.matType = item?.itemLongDescription; // 规格型号
                    record.matNumber = item?.itemNumber; // 物料编号
                    record.unit = item?.uomCode; // 单位编码
                    record.$form.setFieldsValue({
                      unit: item?.uomCode, // 单位编码
                    })
                  }}
                />
                :
                <InputLov
                  isInput
                  code="CMHK.CATEGORY.ORGANIZATION"
                  disabled={!purchasingCategoryVal && !record.purchasingCategory}
                  textValue={record.matName}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    purchasingCategory: purchasingCategoryVal || record.purchasingCategory,
                  }}
                  lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                  onChange={(val, item) => {
                    if (item) {
                      // 选择的时候
                      if (val) {
                        record.matName = item?.itemDescription; // 物料名称
                        record.matType = item?.itemLongDescription; // 规格型号
                        record.matNumber = item?.itemNumber; // 物料编号
                        record.unit = item?.uomCode; // 单位编码
                        record.$form.setFieldsValue({
                          unit: item?.uomCode, // 单位编码
                        })
                      } else {
                        record.matName = record.matName; // 物料名称
                        record.matType = record.matType; // 规格型号
                        record.matNumber = record.matNumber; // 物料编号
                        record.unit = record.unit; // 单位编码
                      }
                    } else {
                      // 手动输入的时候
                      record.matName = val; // 物料名称
                      record.matNumber = null;
                    }
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
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        key: 'matType',
        width: 150,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`matType`, {
                initialValue: record.matType,
              })(
                // <CusInput.TextArea
                //   autoChangeSize={true}
                //   onChange={(e) => {
                //     record.matType = e.target.value;
                //   }}
                // />
                <CusInput onFocus={() => this.handleOpenMatTypeModal(record)}></CusInput>
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        key: 'unit',
        width: 180,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`unit`, {
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
                    record.$form.setFieldsValue({
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
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'qty',
        key: 'qty',
        width: 150,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`qty`, {
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
                <CusInputNumber
                  min={0}
                  precision={4}
                  allowThousandth
                  className="cus-input-money"
                  onChange={(e) => {
                    record.qty = e;
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
        title: intl.get(`${promptCode}.view.title.ettimatedunitamountH`).d('预估金额单价(HKD)'),
        dataIndex: 'matPriceHkd',
        key: 'matPriceHkd',
        width: 300,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item className={styles['matPriceHkd']}>
              {record.$form.getFieldDecorator(`matPriceHkd`, {
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
                <CusInputNumber
                  precision={4}
                  allowThousandth
                  className="cus-input-money"
                  onChange={(e) => {
                    console.log(e, 'e');
                    record.matPriceHkd = e;
                    this.handlePurchaseApplicationLine(record, record.matPriceHkd, 'matPriceHkd');
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <span style={{ display: 'block', textAlign: 'right' }}>{numberRender(val, 4)}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        dataIndex: 'budgetPricesHkd',
        key: 'budgetPricesHkd',
        width: 300,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`budgetPricesHkd`, {
                initialValue: val,
              })(
                <span style={{ display: 'block', paddingBottom: '8px', textAlign: 'right' }}>
                  {record.qty == '' || record.matPriceHkd == ''
                    ? ''
                    : numberRender(
                        Number(record.$form.getFieldValue(`qty`)) *
                          Number(record.$form.getFieldValue(`matPriceHkd`)),
                        4
                      )}
                </span>
              )}
            </Form.Item>
          ) : (
            <span style={{ display: 'block', textAlign: 'right' }}>{numberRender(val, 4)}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryaddress`).d('送货地址'),
        dataIndex: 'deliverAddress',
        key: 'deliverAddress',
        width: 180,
        required: true,
        render: (val, record, recordIndex) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
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
                        deliverContactCode: null
                      });
                    } else {
                      record.addressCode = data.addressCode;
                      record.deliverContact = data.name;
                      record.deliverAddress = data.detailedAddress;
                      record.deliveryPhoneNumber = data.contactTel;
                      record.deliverContactCode = data?.employeeNumber
                      record.$form.setFieldsValue({
                        addressCode: data.addressCode,
                        deliverContact: data.name,
                        deliverAddress: data.detailedAddress,
                        deliveryPhoneNumber: data.contactTel,
                        deliverContactCode: data?.employeeNumber
                      });
                    }
                    const dataLineSource = purchaseApplicationLineSource?.map((item) => {
                      if(recordIndex === 0 && !(item?.deliverAddress)) {
                        item.deliverAddress = data?.detailedAddress;
                        item.addressCode = data?.addressCode;
                        item.deliverContact = data?.name;
                        item.deliveryPhoneNumber = data?.contactTel;
                        item.deliverContactCode = data?.employeeNumber
                      }
                      return item;
                    })
                    form.resetFields([`deliveryPhoneNumber`, `deliverContact`])
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        deliverAddress: data.detailedAddress,
                        purchaseApplicationLineSource: dataLineSource,
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
              {record.$form.getFieldDecorator(`deliverContact`, {
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
        title: intl.get(`${promptCode}.view.title.deliveryaddressremrks`).d('送货地址备注'),
        dataIndex: 'deliverAddressBakup',
        key: 'deliverAddressBakup',
        width: 200,
        // required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliverAddressBakup`, {
                initialValue: record.deliverAddressBakup,
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`${promptCode}.view.title.deliveryaddressremrks`)
                //         .d('送货地址备注'),
                //     }),
                //   },
                // ],
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
        title: intl.get(`${promptCode}.view.title.deliverydate`).d('送货日期'),
        dataIndex: 'deliverDate',
        key: 'deliverDate',
        width: 180,
        required: true,
        render: (val, record, recordIndex) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <div className="customize-form" style={{ paddingLeft: '16px', paddingBottom: '16px' }}>
              <Form.Item>
                {record.$form.getFieldDecorator(`deliverDate`, {
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
                      record.deliverDate = e ? dayjs(e).format('YYYY-MM-DD') : null;
                      const dataLineSource = purchaseApplicationLineSource?.map((item) => {
                      if(recordIndex === 0 && !(item?.deliverDate)) {
                        item.deliverDate = e ? dayjs(e).format('YYYY-MM-DD') : null;
                      }
                        return item;
                      })
                      dispatch({
                        type: 'purchaseApplicationModel/commentUpdateState',
                        payload: {
                          purchaseApplicationLineSource: dataLineSource,
                        },
                      });
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
        title: intl.get(`${promptCode}.view.title.DeliveryPhonenumber`).d('送货联系电话'),
        dataIndex: 'deliveryPhoneNumber',
        key: 'deliveryPhoneNumber',
        width: 120,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterNM',
        key: 'costCenterNM',
        width: 150,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 150,
        required: true,
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`busActivityName`, {
                initialValue: record.businessActivitiesName,
                rules: [
                  {
                    required: record.budgetType === 'OPEX',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.BusinessActivities`).d('业务活动'),
                    }),
                  },
                ],
              })(
                record.budgetType === 'OPEX' ? (
                  <CusLov
                    code="CPEX.OPEX"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      projectCode: projectNumber,
                      applyType: projectType,
                    }}
                    isInitVal
                    textValue={record.businessActivitiesName}
                    onChange={(_, item) => {
                      record.budgetItemNumber = item.budCode; // 预算项目编码
                      record.businessActivitiesCode = item.busActivityCode; // 业务活动编码
                      record.businessActivitiesName = item.busActivityName; // 业务活动名称
                      record.costCenterCode = item.costCenterCode; // 成本中心编码
                      record.costCenterNM = item.costCenternName; // 成本中心名称
                    }}
                  />
                ) : (
                  <></>
                )
              )}
            </Form.Item>
          ) : (
            <span>{val}</span>
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
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'deliveryAddressRemarks',
        key: 'deliveryAddressRemarks',
        width: 120,
        align: 'left',
        render: (val, record) => {
          return prStatusState == 'PENDING_REFER' || prStatusState == '' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`deliveryAddressRemarks`, {
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
    ].filter(Boolean);

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
          dataSource={
            prStatusState == 'PENDING_REFER' || prStatusState == ''
              ? purchaseApplicationLineSource
              : materialsList
          }
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={
            prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : materialsPagination
          }
          onChange={onChange}
          rowSelection={rowSelection}
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
