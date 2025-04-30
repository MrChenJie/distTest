/**
 * ContractBusinessTerms - 业务条款
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty } from 'lodash';
import { Form, Input, Button, Select } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import styles from './index.less';

const commonPrompt = 'spcm.purchaseContractType.model';
const commonInput = 'spcm.common.model';
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const termTypeRowKey = 'termTypeId';
export default class ContractBusinessTerms extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      enumMap = {},
      onHandleRecord,
      enabledFlag = false,
      editContractType = false,
    } = this.props;
    const { busTerFlag = [] } = enumMap;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.termTypeCode`).d('条款编码'),
        dataIndex: 'termTypeCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`termTypeCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.onlyCapitalLettersOrNumber`)
                      .d('条款编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.termTypeCode`).d('条款编码'),
                    }),
                  },
                ],
                initialValue: record.termTypeCode,
              })(<Input typeCase="upper" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.termTypeName`).d('条款名称'),
        dataIndex: 'termTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`termTypeName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.termTypeName`).d('条款名称'),
                    }),
                  },
                ],
                initialValue: record.termTypeName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.termType`).d('条款格式'),
        dataIndex: 'termType',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`termType`, {
                rules: [
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', { max: 40 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.termType`).d('条款格式'),
                    }),
                  },
                ],
                initialValue: record.termType,
              })(
                <Select style={{ width: '100%' }} allowClear disabled={editContractType}>
                  {busTerFlag.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.termRemark`).d('条款说明'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.termRemark`).d('条款说明'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(
                <TextArea
                  rows={1}
                  onChange={() => onHandleRecord(record)}
                  disabled={editContractType}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonInput}.nullableFlag`).d('是否必输'),
        dataIndex: 'nullableFlag',
        width: 90,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`nullableFlag`, {
              initialValue: record.nullableFlag === 0 ? 1 : 0,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${commonInput}.reportFlag`).d('是否报表查询'),
        dataIndex: 'reportFlag',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`reportFlag`, {
              initialValue: record.reportFlag === 1 ? 1 : 0,
            })(<Checkbox disabled={!enabledFlag} onChange={() => onHandleRecord(record)} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      onSearch,
      deletingLines,
      onAdd,
      onDelete,
      pagination,
      onSelectionChange = e => e,
      dataSource = [],
      selectedRows = [],
      editContractType = false,
    } = this.props;
    const selectedRowKeys = selectedRows.map(item => item[termTypeRowKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'termType'),
      getCheckboxProps: record => ({
        disabled: record._status === 'update' && record[termTypeRowKey], // Column configuration not to be checked
      }),
    };
    const tableProps = {
      loading,
      columns,
      pagination,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: termTypeRowKey,
      onChange: page => onSearch(page),
    };

    return (
      <Fragment>
        <Form layout="inline" className={styles['btn-wrapper']}>
          <Button type="primary" onClick={onAdd} disabled={editContractType}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>

          <Button
            onClick={onDelete}
            loading={deletingLines}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`hzero.common.button.clean`).d('清除')}
          </Button>
        </Form>
        <EditTable {...tableProps} />
      </Fragment>
    );
  }
}
