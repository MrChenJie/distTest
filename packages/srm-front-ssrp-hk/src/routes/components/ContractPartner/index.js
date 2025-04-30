/*
 * ContractPartner - 采购协议伙伴信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Input, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction } from 'lodash';
import { EMAIL } from 'utils/regExp';
import withCustomize from 'hzero-front-hcuz';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';

import styles from './index.less';

const rowKey = 'partnerId';
const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';

/**
 * ContractPartner - 采购协议伙伴信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER'],
})
export default class ContractPartner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ partnerEdited: true });
  }

  /**
   * 公司Lov改变回调
   */
  @Bind()
  handleChangeCompany(value, lovRecord, record) {
    const { onChangeListData, dataSource = [], onFetchExtended } = this.props;
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    registerField('companyNum');
    setFieldsValue({
      companyName: lovRecord.supplierCompanyName,
      companyNum: lovRecord.supplierCompanyCode,
    });
    onFetchExtended(lovRecord.supplierCompanyId).then(res => {
      if (res) {
        const {
          legalRepName,
          address,
          telNum,
          bankName,
          bankAccountName,
          bankAccountNum,
          remark,
        } = res;
        const newDataSource = dataSource.map(item => {
          if (item[rowKey] === record[rowKey]) {
            return {
              ...item,
              legalRepName,
              address,
              telNum,
              bankName,
              bankAccountName,
              bankAccountNum,
              remark,
            };
          }
          return item;
        });
        onChangeListData({ partnerDataSource: newDataSource });
      }
    });
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
    onSelectionChange(selectedRowKeys, selectedRows, 'partner');
  }

  /**
   * 合作伙伴下拉框改变回调
   */
  handleChangePartner(value, record) {
    const { dataSource, onChangeListData, detailEnumMap = {} } = this.props;
    const { partnerTypes = [] } = detailEnumMap;
    const enumItem = partnerTypes.find(item => item.partnerTypeCode === value);
    const newDataSource = dataSource.map(item => {
      if (item[rowKey] === record[rowKey]) {
        return {
          ...item,
          partnerTypeId: (enumItem && enumItem.partnerTypeId) || '',
          partnerTypeCode: (enumItem && enumItem.partnerTypeCode) || '',
          partnerTypeName: (enumItem && enumItem.partnerTypeName) || '',
        };
      }
      return item;
    });
    onChangeListData({ partnerDataSource: newDataSource });
    this.handleChangeFormItem();

    // 带出说明字段
    if (!record.remark && !isEmpty(enumItem)) {
      record.$form.setFieldsValue({
        remark: enumItem.remark,
      });
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const { editable, maintainEditable, detailEnumMap = {} } = this.props;
    const { partnerTypes = [] } = detailEnumMap;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.partnerTypeName`).d('伙伴类型名称'),
        dataIndex: 'partnerTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.partnerTypeName`).d('伙伴类型名称'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeCode,
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={value => this.handleChangePartner(value, record)}
                >
                  {partnerTypes.map(n => (
                    <Select.Option key={n.partnerTypeCode} value={n.partnerTypeCode}>
                      {n.partnerTypeName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.partnerTypeCode`).d('伙伴类型编码'),
        dataIndex: 'partnerTypeCode',
        width: 120,
      },
      {
        title: intl.get(`entity.company.code`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          record.predefinedFlag !== 1 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyId`, {
                initialValue: record.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.code`).d('公司编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPCM.USER_AUTH.SUPPLIER"
                  queryParams={{ enabledFlag: 1, tenantId }}
                  textValue={record.companyNum}
                  lovOptions={{ displayField: 'supplierCompanyCode' }}
                  onChange={(value, lovRecord) =>
                    this.handleChangeCompany(value, lovRecord, record)
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.companyName`).d('公司名称'),
                    }),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', { max: 360 }),
                  },
                ],
                initialValue: record.companyName,
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.legalRepName`).d('代表人'),
        dataIndex: 'legalRepName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`legalRepName`, {
                initialValue: record.legalRepName,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.corporateDuty`).d('法人职务'),
        dataIndex: 'corporateDuty',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`corporateDuty`, {
                initialValue: record.corporateDuty,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.address`).d('地址'),
        dataIndex: 'address',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`address`, {
                initialValue: record.address,
                rules: [
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', { max: 150 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.contacts`).d('联系人'),
        dataIndex: 'contacts',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`contacts`, {
                initialValue: record.contacts,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.telNum`).d('联系电话'),
        dataIndex: 'telNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`telNum`, {
                initialValue: record.telNum,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.faxes`).d('传真'),
        dataIndex: 'faxes',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`faxes`, {
                initialValue: record.faxes,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.mail`).d('邮箱'),
        dataIndex: 'mail',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`mail`, {
                initialValue: record.mail,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankName`).d('开户行名称'),
        dataIndex: 'bankName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankName`, {
                initialValue: record.bankName,
                rules: [
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', { max: 150 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankAccountName`).d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountName`, {
                initialValue: record.bankAccountName,
                rules: [
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', { max: 80 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.bankAccountNum`).d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`bankAccountNum`, {
                initialValue: record.bankAccountNum,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', { max: 30 }),
                  },
                ],
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.explain`).d('说明'),
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
              })(<Input onChange={this.handleChangeFormItem} />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    return columnArray;
  }

  render() {
    const {
      deleting,
      loading,
      onSearch,
      onAdd,
      onDelete,
      editable,
      maintainEditable,
      selectedRows = [],
      dataSource = [],
      check,
      checkArtificial,
      customizeTable,
    } = this.props;
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map(n => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
      getCheckboxProps: record => ({
        disabled: record.predefinedFlag === 1, // Column configuration not to be checked
      }),
    };
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: check || (checkArtificial && rowSelection),
      rowKey,
      pagination: false,
      bordered: true,
      onChange: page => onSearch(page),
      scroll: { x: scrollX },
    };
    return (
      <Fragment>
        {(editable || maintainEditable) && (
          <div className={styles['btn-wrapper']}>
            <Button type="primary" onClick={onAdd}>
              {intl.get(`hzero.common.button.create`).d('新建')}
            </Button>
            <Button
              loading={deleting}
              onClick={onDelete}
              disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          </div>
        )}
        {customizeTable(
          {
            code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
          },
          <EditTable {...editTableProps} />
        )}
      </Fragment>
    );
  }
}
