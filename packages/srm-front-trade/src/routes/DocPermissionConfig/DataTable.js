/**
 * 单据权限配置 - DataTable
 *
 * @date    2023-03-23
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */

import dayjs from 'dayjs';
import uuid from 'uuid/v4';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import moment from 'moment';
import { Form } from 'antd';
import CusTable from '_cus_components/CusTable';
import CusLov from '_cus_components/CusLov';
import CusButton from '_cus_components/CusButton';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusPagination from '_cus_components/CusPagination';
import CusNotification from '_cus_components/CusNotification';

import { dateRender } from 'utils/renderer';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import './index.less';

const promptKey = 'spub.docPermissionConfig';
export default class DataTable extends Component {
  /**
   * 行数据更新
   *
   * @param {String} fieldName 字段名
   * @param {String} value 字段值
   */
  @Bind()
  handleUpdate(fieldName, value = undefined) {
    const { match, parent, docPermissionConfig } = this.props;
    const docType = match?.params?.docType;
    const dataList = docPermissionConfig[`${docType}-configList`];

    // [0] 数据编号
    // [1] 字段名称
    const [id, name] = fieldName.split('#');

    parent.handleUpdateState({
      [`${docType}-configList`]: dataList.map((item) => {
        const temp = item || {};
        if (item.tempId === id) {
          temp[name] = value;
          return temp;
        }
        return temp;
      }),
    });
  }

  /**
   * 编辑
   * @param {Object} record 数据行
   */
  @Bind()
  handleEdit(record = {}) {
    const docType = this.props?.match?.params?.docType;
    const dataList = this.props.docPermissionConfig[`${docType}-configList`];
    const { formRef } = this.props.parent;
    this.props.dispatch({
      type: 'docPermissionConfig/updateState',
      payload: {
        [`${docType}-configList`]: dataList.map((item) => {
          if (item['tempId'] === record['tempId']) {
            return { ...item, _status: 'update' };
          } else {
            return item;
          }
        }),
      },
    });
  }

  /**
   * 取消
   * @param {Object} record 数据行
   */
  @Bind()
  handleCancel(record = {}) {
    const docType = this.props?.match?.params?.docType;
    const dataList = this.props.docPermissionConfig[`${docType}-configList`];
    const data = [];
    dataList.map((item) => {
      if (item['tempId'] === record['tempId']) {
        if (item._status === 'update') {
          data.push({
            ...item.cacheData,
            cacheData: item.cacheData,
            _status: undefined,
            tempId: uuid(),
          });
        }
        return { ...item, _status: undefined };
      } else {
        data.push(item);
        return item;
      }
    });
    this.props.dispatch({
      type: 'docPermissionConfig/updateState',
      payload: {
        [`${docType}-configList`]: data,
      },
    });
  }

  /**
   * 保存
   * @param {Object} record 数据行
   */
  @Bind
  handleSave(record = {}) {
    const docType = this.props?.match?.params?.docType;

    if (docType === 'AP') {
      const errorFlag =
        isUndefined(record['userId']) ||
        isUndefined(record['lovField1']) ||
        isUndefined(record['lookUpCodeField1']) ||
        isUndefined(record['effectiveDateFrom']);

      if (errorFlag) {
        CusNotification.error({
          message: intl
            .get(`${promptKey}.saveError`)
            .d('用户名称、公司主体、业务类型、有效时间从 为必输字段，请检查'),
        });
        return;
      }
    }

    this.props
      .dispatch({
        type: 'docPermissionConfig/batchUpdate',
        payload: {
          query: { docType },
          body: [record],
        },
      })
      .then((res) => {
        if (res) {
          this.props.parent.handleSearch();
        }
      });
  }

  render() {
    const docType = this.props?.match?.params?.docType;
    const { parent } = this.props;
    const {
      [`${docType}-configList`]: dataSource = [],
      pagination,
      selectedRowKeys,
    } = this.props.docPermissionConfig;

    const columns = [
      {
        width: 240,
        title: intl.get(`${promptKey}.model.userName`).d('用户名称'),
        ellipsis: true,
        orderSeq: 3,
        render: (_, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item
              style={{ margin: '-10px 0' }}
              name={`${record.tempId}#userId`}
              initialValue={record.userName}
            >
              <CusLov
                code="SPUB.DOC_PER_USER"
                textValue={record.userName}
                lovOptions={{
                  valueField: 'id',
                  displayField: 'userName',
                }}
                onChange={(_, employee) => {
                  this.handleUpdate(`${record.tempId}#userId`, employee.id);
                  this.handleUpdate(`${record.tempId}#unitName`, employee.unitName);
                }}
              />
            </Form.Item>
          ) : (
            record.userName
          ),
      },
      {
        width: 200,
        ellipsis: true,
        orderSeq: 7,
        dataIndex: 'levelUnitName',
        title: intl.get(`${promptKey}.model.unitName`).d('用户部门'),
      },
      {
        width: 136,
        ellipsis: true,
        dataIndex: 'effectiveDateFrom',
        required: true,
        title: intl.get(`${promptKey}.model.effectiveDateFrom`).d('有效日期从'),
        orderSeq: 30,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item
              style={{ margin: '-10px 0' }}
              name={`${record.tempId}#effectiveDateFrom`}
              initialValue={
                record.effectiveDateFrom && dayjs(record.effectiveDateFrom, DEFAULT_DATE_FORMAT)
              }
            >
              <CusDatePicker
                onChange={(val) => {
                  this.handleUpdate(
                    `${record.tempId}#effectiveDateFrom`,
                    dayjs.isDayjs(val) && val.format(DEFAULT_DATETIME_FORMAT)
                  );
                }}
                disabledDate={(date) => {
                  const { formRef } = this.props.parent;
                  const effectiveDateTo = formRef.current.getFieldValue(
                    `${record.tempId}#effectiveDateTo`
                  );
                  const currentDate = moment(new Date(date)).format('YYYYMMDD');
                  const monthToDate = moment(new Date(effectiveDateTo)).format('YYYYMMDD');
                  if (isEmpty(effectiveDateTo)) {
                    return false;
                  }
                  return currentDate > monthToDate;
                }}
              />
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        width: 136,
        ellipsis: true,
        dataIndex: 'effectiveDateTo',
        title: intl.get(`${promptKey}.model.effectiveDateTo`).d('有效日期至'),
        orderSeq: 40,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item
              style={{ margin: '-10px 0' }}
              name={`${record.tempId}#effectiveDateTo`}
              initialValue={
                record.effectiveDateTo && dayjs(record.effectiveDateTo, DEFAULT_DATE_FORMAT)
              }
            >
              <CusDatePicker
                onChange={(val) => {
                  this.handleUpdate(
                    `${record.tempId}#effectiveDateTo`,
                    dayjs.isDayjs(val) && val.format(DEFAULT_DATETIME_FORMAT)
                  );
                }}
                disabledDate={(date) => {
                  const { formRef } = this.props.parent;
                  const effectiveDateFrom = formRef.current.getFieldValue(
                    `${record.tempId}#effectiveDateFrom`
                  );

                  const currentDate = moment(new Date(date)).format('YYYYMMDD');
                  const monthFormDate = moment(new Date(effectiveDateFrom)).format('YYYYMMDD');
                  if (isEmpty(effectiveDateFrom)) {
                    return false;
                  }
                  return currentDate < monthFormDate;
                }}
              />
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        width: 240,
        orderSeq: 60,
        ellipsis: true,
        dataIndex: 'creator',
        title: intl.get(`${promptKey}.model.creator`).d('创建人'),
        render: (val, record = {}) => record.creator || record.createdBy,
      },
      {
        width: 112,
        orderSeq: 70,
        ellipsis: true,
        dataIndex: 'creationDate',
        title: intl.get(`${promptKey}.model.creationDate`).d('创建日期'),
        render: dateRender,
      },
      // 动态列
      ...parent.state.dynamicColumns,
      {
        width: getCurrentLanguage() === 'zh_CN' ? 104 : 106,
        orderSeq: 100,
        title: intl.get('hzero.common.table.column.option').d('操作'),
        dataIndex: 'operation',
        fixed: 'right',
        render: (_, record) => (
          <div>
            {!['create', 'update'].includes(record._status) ? (
              <CusButton type="plain" onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </CusButton>
            ) : (
              <CusButton type="plain" onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </CusButton>
            )}
            <CusButton
              style={{ marginLeft: '16px' }}
              type="plain"
              disabled={!['create', 'update'].includes(record._status)}
              onClick={() => this.handleSave(record)}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </CusButton>
          </div>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        parent.handleUpdateState({
          selectedRowKeys,
          selectedRows,
        });
      },
    };

    columns.sort((a, b) => a.orderSeq - b.orderSeq);

    return (
      <div className="config-table-from">
        <div className="customize-table-from">
          <CusTable
            rowKey="tempId"
            columns={columns}
            pagination={false}
            dataSource={dataSource}
            rowSelection={rowSelection}
            scroll={{ x: tableScrollWidth(columns) }}
          />
          <CusPagination
            {...pagination}
            hideOnSinglePage={false}
            onChange={({ current, pageSize }) => {
              parent.handleSearch(
                {},
                {
                  page: current - 1,
                  size: pageSize,
                }
              );
            }}
          />
        </div>
      </div>
    );
  }
}
