/*
 * ContractBusinessTerms - 业务条款
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, InputNumber, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth } from 'utils/utils';
import EditTable from 'components/EditTable';

const FormItem = Form.Item;
const viewMessagePrompt = 'spcm.common.view.message';

/**
 * ContractBusinessTerms - 业务条款
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@formatterCollections({
  code: ['spcm.common', 'spcm.purchaseRequisitionCreation'],
})
export default class ContractBusinessTerms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // tenantId: getCurrentOrganizationId(),
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
    onChangeState({ termEdited: true });
  }

  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    const { onSelectionChange } = this.props;
    onSelectionChange(selectedRowKeys, selectedRows, 'term');
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { editable, maintainEditable } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeCode`).d('业务条款编码'),
        dataIndex: 'termTypeCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termTypeName`).d('业务条款名称'),
        dataIndex: 'termTypeName',
        width: 120,
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termContent`).d('业务条款内容'),
        dataIndex: 'termContent',
        width: 250,
        render: (val, record) => {
          let Com;
          switch (record.termType) {
            case 'VARCAHR':
              Com = <Input onChange={this.handleChangeFormItem} />;
              break;
            case 'DECIMAL':
              Com = (
                <InputNumber
                  style={{ width: '100%' }}
                  max={99999999999999}
                  onChange={this.handleChangeFormItem}
                />
              );
              break;
            case 'DATE':
              Com = <DatePicker style={{ width: '100%' }} onChange={this.handleChangeFormItem} />;
              break;
            case 'DATETIME':
              Com = (
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  onChange={this.handleChangeFormItem}
                  placeholder={intl.get(`${viewMessagePrompt}.timePlaceholder`).d('请输入时间')}
                  format={DEFAULT_DATETIME_FORMAT}
                />
              );
              break;
            default:
              Com = <Input />;
              break;
          }
          const rules = [
            {
              required: record.nullableFlag === 0,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl
                  .get(`spcm.purchaseRequisitionCreation.model.termContent`)
                  .d('业务条款内容'),
              }),
            },
          ];
          if (record.termType === 'VARCAHR') {
            rules.push({
              max: 480,
              message: intl.get('hzero.common.validation.max', { max: 480 }),
            });
          }
          // else if (record.termType === 'DECIMAL') {
          //   rules.push({
          //     validator: (rule, value, callback) => {
          //       console.log(rule, value.length);
          //       if (isString(value) && value.length > 14) {
          //         callback(intl.get('hzero.common.validation.max', { max: 14 }));
          //       }
          //       callback();
          //     },
          //   });
          // }
          if (['create', 'update'].includes(record._status) && (editable || maintainEditable)) {
            let initialValue;
            if (record.termType === 'DATE') {
              initialValue = record.termContent
                ? moment(record.termContent, DEFAULT_DATE_FORMAT)
                : null;
            } else if (record.termType === 'DATETIME') {
              initialValue = record.termContent ? moment(record.termContent) : null;
            } else {
              initialValue = record.termContent;
            }
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`termContent`, {
                  rules,
                  initialValue,
                })(Com)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spcm.purchaseRequisitionCreation.model.termRemark`).d('业务条款说明'),
        dataIndex: 'remark',
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      onSearch,
      selectedRows = [],
      pagination = {},
      dataSource = [],
      check,
      checkArtificial,
    } = this.props;
    const rowKey = 'termId';
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
      pagination,
      dataSource,
      rowKey,
      rowSelection: check || (checkArtificial && rowSelection),
      bordered: true,
      onChange: page => onSearch(page),
      scroll: { x: scrollX },
    };
    return <EditTable {...editTableProps} />;
  }
}
