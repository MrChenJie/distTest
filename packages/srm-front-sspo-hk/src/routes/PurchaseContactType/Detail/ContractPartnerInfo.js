/**
 * PurchaseLineInfo - 伙伴类型定义维护
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty } from 'lodash';
import { Form, Input, Button } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
// const partnerRowKey = 'partnerTypeId';
const partnerRowKey = 'partnerTypeId';
const commonPrompt = 'spcm.purchaseContractType.model';
export default class ContractPartnerInfo extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onHandleRecord, editContractType = false } = this.props;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.porTemplateType`).d('协议伙伴编码'),
        dataIndex: 'partnerTypeCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.capitalLettersOrNumbersr`)
                      .d('协议伙伴编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.porTemplateType`).d('协议伙伴编码'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeCode,
              })(<Input typeCase="upper" disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.partnerTypeName`).d('协议伙伴名称'),
        dataIndex: 'partnerTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.partnerTypeName`).d('协议伙伴名称'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.signKeyword`).d('签署关键字'),
        dataIndex: 'signKeyword',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`signKeyword`, {
                rules: [
                  {
                    // required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.signKeyword`).d('签署关键字'),
                    }),
                  },
                ],
                initialValue: record.signKeyword,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.protocolRemark`).d('协议伙伴说明'),
        dataIndex: 'remark',
        // width: 100,
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
                      name: intl.get(`${commonPrompt}.protocolRemark`).d('协议伙伴说明'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(
                <TextArea
                  rows={1}
                  disabled={editContractType}
                  // style={{ height: '20px' }}
                  onChange={() => onHandleRecord(record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 60,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
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
      onSelectionChange = e => e,
      deletingLines,
      onAdd,
      onDelete,
      dataSource = [],
      selectedRows = [],
      editContractType = false,
    } = this.props;
    const selectedRowKeys = selectedRows.map(item => item[partnerRowKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'partnerType'),
      getCheckboxProps: record => ({
        disabled: record._status === 'update' && record[partnerRowKey], // Column configuration not to be checked
      }),
    };
    const tableProps = {
      pagination: false,
      loading,
      columns,
      dataSource,
      rowSelection,
      rowKey: partnerRowKey,
      bordered: true,
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
