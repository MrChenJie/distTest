/*
 * ContractSubject - 采购协议标的信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { isArray, isEmpty, isFunction, isString } from 'lodash';
import queryString from 'query-string';
import { openTab } from 'utils/menuTab';
import withCustomize from 'hzero-front-hcuz';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  getDateFormat,
  tableScrollWidth,
  getCurrentOrganizationId,
  // getEditTableData,
} from 'utils/utils';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';

import SubjectInfo from './SubjectInfo';
import CreateModal from '../../ContractMaintain/QuotePurchaseOrder/CreateModal';
import styles from './index.less';

const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';

/**
 * ContractSubject - 采购协议标的信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sodr.common', 'spcm.common', 'spcm.contractSubject'],
})
@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT'],
})
export default class ContractSubject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      poVisible: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 格式化数值
   * 当 value 为 undefined,null,'',NaN,Infinity,-Infinity时 返回 ''
   * @param {string|number} value 需要格式化的数
   * @param {number} [precision=0] 数值精度 必须为自然数(0+正整数)
   * @param {boolean} [allowThousandth=true] 是否加上千分位
   * @param {boolean} [allowEndZero=true] 是否补全末尾0
   * @return {string}
   */

  /* eslint-disable */
  @Bind()
  numberRender(value) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var allowThousandth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var allowEndZero = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (
      // 空检查
      value === null ||
      value === undefined ||
      value === '' || // 非法数值的检查
      +value === Infinity ||
      +value === -Infinity ||
      isNaN(+value)
    ) {
      return '';
    } // 将 value 转为字符串并移除千分位

    var ret;
    var valueString = String(value).replace(/,/g, '');
    if (
      valueString.length > 0 &&
      Object.prototype.toString.call(valueString.split('.')) === '[object Array]'
    ) {
      if (valueString.split('.')[1] && valueString.split('.')[1].length > 2) {
        ret = Number(valueString).toFixed(valueString.split('.')[1].length);
      } else {
        ret = Number(valueString).toFixed(precision);
      }
    }

    if (allowThousandth && typeof ret === 'string' && ret.length > 0) {
      var retList = ret.split('.');
      var commaValue = retList[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 整数部分千分位替换

      if (retList.length > 1) {
        ret = [commaValue, retList[1]].join('.');
      } else {
        ret = commaValue;
      }
    }

    if (!allowEndZero && ret.indexOf('.')) {
      return ret.replace(/(0|\.0)*$/, '');
    }

    return ret;
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ pcSubjectEdited: true });
  }

  /**
   * 单位改变回调
   * @param {*} value
   * @param {*} lovRecord
   */
  @Bind()
  handleChangeUom(value, lovRecord, record) {
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    registerField('uomName');
    registerField('uomCode');
    setFieldsValue({ uomName: lovRecord.uomName, uomCode: lovRecord.uomCode });
    this.handleChangeFormItem();
  }

  /**
   * 选中行改变回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    const { onSelectionChange } = this.props;
    onSelectionChange(selectedRowKeys, selectedRows, 'pcSubject');
  }

  // 改变本币或原币时,修改汇率
  @Bind()
  handleChangeCurrencyCode(type, lovRecord, record) {
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    const { currencyCode = null } = lovRecord;
    type === 'currencyCode' && getFieldValue('purchaseCurrencyCode') === currencyCode
      ? setFieldsValue({ exchangeRate: 1 })
      : '';
    type === 'purchaseCurrencyCode' && getFieldValue('currencyCode') === currencyCode
      ? setFieldsValue({ exchangeRate: 1 })
      : '';
  }
  /* eslint-enable */

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleItemOnChange(value, lovRecord, record) {
    const { onChangeListData, dataSource, onFetchCategory, doubleUomFlag } = this.props;
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    this.handleChangeFormItem();
    const {
      itemName,
      primaryUomId,
      taxId,
      taxCode,
      taxRate,
      uomName,
      uomCode,
      partnerItemId,
      orderUomName,
      orderUomId,
    } = lovRecord;
    if (value) {
      const listDataSource = dataSource.map(item => {
        if (item.pcSubjectId === record.pcSubjectId) {
          return {
            ...item,
            taxRate,
            taxCode,
            uomCode,
            uomName,
            taxId,
            itemName, // 物料名称
            uomId: primaryUomId,
            itemId: partnerItemId,
          };
        }
        return item;
      });
      const fields = {
        itemName,
        taxId,
        taxCode,
        uomName: doubleUomFlag && orderUomName ? orderUomName : uomName,
        uomId: doubleUomFlag && orderUomId ? orderUomId : primaryUomId,
        itemId: partnerItemId,
      };
      registerField('itemId');
      setFieldsValue(fields);

      onChangeListData({ pcSubjectDataSource: listDataSource });
      onFetchCategory(partnerItemId).then(res => {
        if (res && isArray(res) && res.length === 1) {
          const { categoryName, categoryId, categoryCode } = res[0];
          const newListDataSource = listDataSource.map(item => {
            if (item.pcSubjectId === record.pcSubjectId) {
              return {
                ...item,
                categoryId,
                categoryCode,
                categoryName,
              };
            }
            return item;
          });
          setFieldsValue({ categoryId, categoryName });
          onChangeListData(newListDataSource);
        } else {
          const newListDataSource = listDataSource.map(item => {
            if (item.pcSubjectId === record.pcSubjectId) {
              return {
                ...item,
                categoryName: undefined,
              };
            }
            return item;
          });
          setFieldsValue({ categoryId: undefined, categoryName: undefined });
          onChangeListData(newListDataSource);
        }
      });
    } else {
      const fields = {
        orderUomId,
      };
      setFieldsValue(fields);
    }
  }

  /**
   * 税种Lov修改回调
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeTax(value, lovRecord, record) {
    const { onChangeListData, dataSource } = this.props;
    const { taxRate } = lovRecord;
    const listDataSource = dataSource.map(item => {
      if (item.pcSubjectId === record.pcSubjectId) {
        return {
          ...item,
          taxRate,
          edited: true,
        };
      }
      return item;
    });
    onChangeListData({ pcSubjectDataSource: listDataSource });
    this.handleChangeFormItem();
  }

  /**
   * onSubjectInfoModalOk - 新增信息行弹窗确定按钮事件
   */
  @Bind()
  onInfoModalOk() {
    const { addSubjectLines } = this.props;
    if (this.subjectInfo && !isEmpty((this.subjectInfo.state || {}).selectedListRows)) {
      // const { selectedListRows: modalList } = this.subjectInfo.state;
      // const transLines = getEditTableData(dataSource).map(item => {
      //   const { needByDate } = item;
      //   return {
      //     ...item,
      //     needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
      //   };
      // });
      // const poLineDetailDTOList = [...transLines, ...selectedListRows, ...modalList].map(item => {
      //   if (item._status === 'update') {
      //     const { poLineId, invOrganizationId } = item;
      //     return { poLineId, invOrganizationId };
      //   }
      //   const { prLineId, prHeaderId } = item;
      //   return { prLineId, prHeaderId };
      // });
      // onHandleAppendValidate(poLineDetailDTOList).then(res => {
      //   if (res) {
      //     addSubjectLines(this.subjectInfo.state.selectedListRows);
      //     this.closeSubjectInfoModal();
      //   }
      // });
      addSubjectLines(this.subjectInfo.state.selectedListRows);
      this.closeSubjectInfoModal();
    }
  }

  /**
   * 保管人、验收人存name
   * @param {*} lovField
   * @param {*} form
   * @param {*} field
   */
  @Bind()
  handleSetFormValue(value, form, field) {
    form.setFieldsValue({
      [field]: value,
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const {
      editable,
      maintainEditable,
      onHandleRecord,
      headerInfo,
      form: { getFieldValue },
      originPage = {},
      detailEnumMap = {},
      doubleUomFlag,
      taxIncludedUpRequired: taxIcUpRequired,
    } = this.props;
    const { propertiesList = [] } = detailEnumMap;
    const { pcSourceCode, pcKindCode, contractPurpose } = headerInfo;
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';

    // 当为true时价格批量不可编辑
    const unitPriceBatchFlag = ['SEARCH_SOURCE_RESULT', 'PURCHASE_ORDER'].includes(pcSourceCode);

    // 当协议性质为框架协议，协议用途为电商采购，该字段为false
    const taxIncludedUpRequired =
      taxIcUpRequired ||
      !(pcKindCode === 'FRAMEWORK_AGREEMENT' && contractPurpose === 'OMMERCE_PURCHASE');

    let columnArray = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemCode`, {
                initialValue: val,
              })(
                <Lov
                  code="SPRM.ITEM_RELATE_PUR_PRICE"
                  onChange={(value, lovRecord) => this.handleItemOnChange(value, lovRecord, record)}
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  textValue={val}
                  queryParams={{ enabledFlag: 1, companyId: headerInfo.companyId, tenantId }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
                    }),
                  },
                  {
                    max: 300,
                    message: intl.get('hzero.common.validation.max', { max: 300 }),
                  },
                ],
                initialValue: record.itemName,
              })(
                <Input
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryId`, {
                initialValue: record.categoryId,
              })(
                <Lov
                  code="SPRM.ITEM_CATEGOR"
                  textField="categoryName"
                  textValue={record.categoryName}
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`specifications`, {
                initialValue: record.specifications,
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`model`, {
                initialValue: record.model,
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 140,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.unit`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SPCM.UOM"
                  disabled={doubleUomFlag && record.$form.getFieldValue('itemCode')}
                  lovOptions={{ valueField: 'uomId', displayField: 'uomName' }}
                  textValue={record.uomName}
                  textField="uomName"
                  queryParams={{ tenantId }}
                  onChange={(value, lovRecord) => {
                    this.handleChangeUom(value, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (isString(value) && value.length > 20) {
                        callback(intl.get('hzero.common.validation.max', { max: 20 }));
                      }
                      callback();
                    },
                  },
                ],
                initialValue: record.quantity,
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  min={0}
                  max={999999999}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxId`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.taxType`).d('税种'),
                    }),
                  },
                ],
                initialValue: record.taxId,
              })(
                <Lov
                  code="SPCM.TAX"
                  textField="taxCode"
                  textValue={record.taxCode}
                  lovOptions={{ displayField: 'taxCode' }}
                  queryParams={{ tenantId }}
                  onChange={(value, lovRecord) => this.handleChangeTax(value, lovRecord, record)}
                />
              )}
            </FormItem>
          ) : (
            record.taxCode
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.unitPriceBatch`).d('价格批量'),
        dataIndex: 'unitPriceBatch',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !unitPriceBatchFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`unitPriceBatch`, {
                initialValue:
                  headerInfo.pcSourceCode === 'PURCHASE_NEED' && !record.unitPriceBatch
                    ? 1
                    : record.unitPriceBatch,
              })(
                <InputNumber
                  min={0}
                  onChange={() => {
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyCode`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.currencyCode`).d('原币币种'),
                    }),
                  },
                ],
                initialValue: record.currencyCode,
              })(
                <Lov
                  code="SPCM.CURRENCY"
                  textValue={record.currencyCode}
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                  onChange={(_, lovRecord) => {
                    this.handleChangeFormItem();
                    this.handleChangeCurrencyCode(`currencyCode`, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.currencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        dataIndex: 'purchaseCurrencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseCurrencyCode`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
                    }),
                  },
                ],
                initialValue: record.purchaseCurrencyCode,
              })(
                <Lov
                  code="SPCM.CURRENCY"
                  textValue={record.purchaseCurrencyCode}
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                  onChange={(_, lovRecord) => {
                    this.handleChangeFormItem();
                    this.handleChangeCurrencyCode(`purchaseCurrencyCode`, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.purchaseCurrencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        dataIndex: 'exchangeRate',
        width: 160,
        render: (val, record) =>{
          // 当原币不可编辑时，需要在form中赋予初始值，否则，getEditTableData获取的原币数据将会是undefined
          if(['create', 'update'].includes(record._status)&&((!editable && !maintainEditable) || onlyReadFlag)){
            record.$form.getFieldDecorator('currencyCode', {initialValue: record.currencyCode});
          }
          return ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`exchangeRate`, {
                rules: [
                  {
                    required: !!taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
                    }),
                  },
                ],
                initialValue:
                  record.$form.getFieldValue('purchaseCurrencyCode') ===
                  record.$form.getFieldValue('currencyCode')
                    ? 1
                    : record.exchangeRate,
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabled={
                    record.$form.getFieldValue('purchaseCurrencyCode') ===
                    record.$form.getFieldValue('currencyCode')
                  }
                  min={0.0000000001}
                  max={999999999}
                />
              )}
              :1
            </FormItem>
          ) : (
            `${record.exchangeRate}:1`
          );
        },
      },

      // {
      //   title: intl.get(`sodr.common.model.common.taxAmount`).d('税额'),
      //   dataIndex: 'taxAmount',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`spcm.common.model.common.currencyCode`).d('币种'),
      //   dataIndex: 'currencyCode',
      //   width: 120,
      //   render: (val, record) =>
      //     ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`currencyCode`, {
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`spcm.common.model.common.currencyCode`).d('币种'),
      //               }),
      //             },
      //           ],
      //           initialValue: record.currencyCode,
      //         })(
      //           <Lov
      //             code="SPCM.CURRENCY"
      //             textValue={record.currencyCode}
      //             queryParams={{ tenantId }}
      //             lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
      //             onChange={() => {
      //               this.handleChangeFormItem();
      //               onHandleRecord(record);
      //             }}
      //           />
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
        width: 140,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          taxIncludedUpRequired &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (isString(value) && value.length > 20) {
                        callback(intl.get('hzero.common.validation.max', { max: 20 }));
                      }
                      callback();
                    },
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  min={0}
                  max={999999999}
                  step={0.01}
                />
              )}
            </FormItem>
          ) : taxIncludedUpRequired ? (
            this.numberRender(val, 2)
          ) : null,
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxIncludedPrice`).d('本币含税单价'),
        dataIndex: 'purchaseTaxIncludedPrice',
        width: 120,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      {
        title: intl.get(`spcm.common.model.unitPrice`).d('原币不含税单价'),
        dataIndex: 'unitPrice',
        width: 120,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      {
        title: intl.get(`spcm.common.model.taxIncludedLineAmount`).d('原币含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxLineAmount`).d('本币含税行金额'),
        dataIndex: 'purchaseTaxLineAmount',
        width: 160,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      {
        title: intl.get(`spcm.common.model.lineAmount`).d('原币不含税行金额'),
        dataIndex: 'lineAmount',
        width: 160,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      {
        title: intl.get(`spcm.common.model.taxAmount`).d('原币税额'),
        dataIndex: 'taxAmount',
        width: 120,
        align: 'right',
        render: val => (taxIncludedUpRequired ? this.numberRender(val, 2) : null),
      },
      // {
      //   title: intl.get(`spcm.common.model.uncludedTaxUnitPrice`).d('不含税单价'),
      //   dataIndex: 'unitPrice',
      //   width: 120,
      //   align: 'right',
      //   render: (val, record) => numberRenderLib(val, 2),
      // },
      // {
      //   title: intl.get(`spcm.common.model.taxIncludedUnitPrice`).d('含税行金额'),
      //   dataIndex: 'taxIncludedLineAmount',
      //   width: 120,
      //   align: 'right',
      //   render: (val, record) => numberRenderLib(val, 2),
      // },
      // {
      //   title: intl.get(`spcm.common.model.uncludedTaxLineAmount`).d('不含税行金额'),
      //   dataIndex: 'lineAmount',
      //   width: 120,
      //   align: 'right',
      //   render: (val, record) => numberRenderLib(val, 2),
      // },
      {
        title: intl.get(`${commonPrompt}.needByDate`).d('交付日期'),
        width: 150,
        dataIndex: 'deliverDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`deliverDate`, {
                initialValue: record.deliverDate ? moment(record.deliverDate) : undefined,
              })(
                <DatePicker
                  placeholder={null}
                  format={getDateFormat()}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabledDate={currentDate => currentDate && moment().isAfter(currentDate, 'day')}
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`sodr.common.model.itemProperties`).d('属性'),
        dataIndex: 'itemProperties',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemProperties`, {
                initialValue: record.itemProperties,
              })(
                <Select
                  allowClear
                  style={{ minWidth: 150 }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                >
                  {propertiesList.map(n => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.itemPropertiesMeaning
          ),
      },
      {
        title: intl.get(`spcm.common.model.agentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`agentId`, {
                initialValue: record.agentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textValue={record.agentName}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.keeperUserName`).d('保管人'),
        dataIndex: 'keeperUserName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`keeperUserId`, {
                initialValue: record.keeperUserId,
              })(
                <Lov
                  code="SSLM.USER"
                  textValue={record.keeperUserName}
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.userName, record.$form, 'keeperUserName');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('keeperUserName', {
                initialValue: record.keeperUserName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.accepterUserName`).d('验收人'),
        dataIndex: 'accepterUserName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`accepterUserId`, {
                initialValue: record.accepterUserId,
              })(
                <Lov
                  code="SSLM.USER"
                  textValue={record.accepterUserName}
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.userName, record.$form, 'accepterUserName');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('accepterUserName', {
                initialValue: record.accepterUserName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`expBearDepId`, {
                initialValue: record.expBearDepId,
              })(
                <Lov
                  code="SPFM.UNIT_G_C"
                  textValue={record.expBearDep}
                  queryParams={{
                    organizationId: tenantId,
                    levelPathFrom: 0,
                    levelPathTo: 3,
                    unitTypeCode: 'D',
                    unitCompanyId: getFieldValue('companyOrgId'),
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.unitName, record.$form, 'expBearDep');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('expBearDep', {
                initialValue: record.expBearDep,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.location`).d('地点'),
        dataIndex: 'address',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`address`, {
                initialValue: record.locationMeaning,
              })(
                // TODO
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectNum`, {
                initialValue: record.projectNum,
              })(
                <Lov
                  code="SSRC.PROJECT"
                  textField="projectNum"
                  textValue={record.projectName}
                  queryParams={{
                    tenantId,
                    companyId: headerInfo.companyId,
                  }}
                  onChange={(_1, lov) => {
                    this.handleProjectChange(record.pcSubjectId, lov);
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 180,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                <Input
                  style={{ minWidth: '250px' }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    let maintainEditableAddColumn = [
      {
        title: intl.get(`spcm.common.model.sourceCode`).d('来源单据编号'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.sourceLineNum`).d('来源单据行号'),
        dataIndex: 'sourceLineNum',
        width: 120,
      },
    ];
    if (!originPage.contractMaintain) {
      const outOfMaintain = [
        {
          title: intl.get(`spcm.common.model.receiptsStatus`).d('执行状态'),
          dataIndex: 'receiptsStatusMeaning',
          width: 120,
        },
        {
          title: intl.get(`spcm.common.model.soureNum`).d('执行单据单号'),
          dataIndex: 'soureNum',
          width: 120,
        },
        {
          title: intl.get(`spcm.common.model.execteLineNum`).d('执行单据行号'),
          dataIndex: 'execteLineNum',
          width: 120,
        },
      ];
      maintainEditableAddColumn = maintainEditableAddColumn.concat(outOfMaintain);
    }
    // if (originPage.contractMaintain) {
    columnArray = columnArray.concat(maintainEditableAddColumn);
    // }

    return columnArray;
  }

  /**
   * 协议标的批量导入
   */
  @Bind()
  handleImport() {
    const { pcHeaderId } = this.props;
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/contract-maintain/detail?pcHeaderId=${pcHeaderId}`,
      }),
    });
  }

  /**
   * 处理项目编码变化
   */
  @Bind()
  handleProjectChange(pcSubjectId, lov) {
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = (dataSource || []).map(_subject => {
      const subject = _subject;
      if (subject.pcSubjectId === pcSubjectId) {
        subject.projectName = lov.projectName;
      }
      return subject;
    });

    onChangeListData({ pcSubjectDataSource: listDataSource });
  }

  @Bind()
  addSubject() {
    this.setState({
      visible: true,
    });
  }

  /**
   * closeSubjectInfoModal - 关闭弹窗
   */
  @Bind()
  closeSubjectInfoModal() {
    this.setState({
      visible: false,
    });
  }

  @Bind()
  handleControlPoModal() {
    const { poVisible } = this.state;
    this.setState({ poVisible: !poVisible });
  }

  render() {
    const {
      loading,
      deleting,
      editable,
      onAdd,
      onDelete,
      quoteSourceFlag, // 判断是否为寻源单据
      onPrePaginationChange,
      maintainEditable = false,
      selectedRows = [],
      pagination = {},
      dataSource = [],
      check,
      checkArtificial,
      headerInfo: { pcSourceCode, supplierCompanyId },
      fetchSubjectCreateList,
      customizeTable,
      onAddPurchaseOrder,
    } = this.props;
    const { visible, poVisible } = this.state;
    const rowKey = 'pcSubjectId';
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map(n => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: check || (checkArtificial && rowSelection),
      pagination,
      rowKey,
      bordered: true,
      onChange: page => onPrePaginationChange(page),
      scroll: { x: scrollX },
      className: styles['edit-table-wrapper'],
    };
    const subjectInfoProps = {
      visible,
      quoteSourceFlag,
      lineList: dataSource,
      width: 900,
      onRef: node => {
        this.subjectInfo = node;
      },
      // loading: queryCreateListLoading,
      fetchCreateList: fetchSubjectCreateList,
    };
    const createProps = {
      supplierCompanyId,
      resultId: isEmpty(dataSource) ? '' : dataSource[0].resultId,
      visible: poVisible,
      onCancel: this.handleControlPoModal,
      onAddPurchaseOrder,
    };
    return (
      <Fragment>
        {editable ||
          (maintainEditable && (
            <div className={styles['btn-wrapper']}>
              <Button
                type="primary"
                onClick={
                  ['PURCHASE_NEED', 'SEARCH_SOURCE_RESULT'].includes(pcSourceCode)
                    ? this.addSubject
                    : pcSourceCode === 'PURCHASE_ORDER'
                    ? this.handleControlPoModal
                    : onAdd
                }
              >
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button
                onClick={onDelete}
                loading={deleting}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
              <Button onClick={this.handleImport}>
                {intl.get('spcm.contractSubject.button.subjectImport').d('导入标的')}
              </Button>
            </div>
          ))}
        {customizeTable(
          {
            code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
          },
          <EditTable {...editTableProps} />
        )}
        <Modal
          title={intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行')}
          destroyOnClose
          width={900}
          visible={visible}
          onCancel={this.closeSubjectInfoModal}
          footer={
            <Button type="primary" onClick={this.onInfoModalOk}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <SubjectInfo {...subjectInfoProps} />
        </Modal>
        {poVisible && <CreateModal {...createProps} />}
      </Fragment>
    );
  }
}
