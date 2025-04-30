/**
 * DataTable
 */

import React, { Component } from 'react';

import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Form, Input } from 'antd';

import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { getResponse as cusGetResponse } from '_cus_utils/utils';

import { historyDataUpdate } from './historyDataService';

export default class DataTable extends Component {
  /**
   * 编辑
   * @param {Object} record 数据行
   */
  @Bind()
  handleEdit(record = {}) {
    const { parent, dataSource } = this.props;
    parent.setState({
      dataSource: dataSource.map((item = {}) => {
        if (item['taskId'] === record['taskId']) {
          return { ...item, _status: 'update' };
        } else {
          return item;
        }
      }),
    });
  }

  /**
   * 保存
   * @param {Object} record 数据行
   */
  @Bind
  handleSave(record = {}) {
    const { parent } = this.props;
    const { taskName } = record;
    let len = 0;
    if (!isEmpty(taskName)) {
      for (let i = 0; i < taskName.length; i++) {
        const char = taskName.charAt(i);
        if (char.match(/[^\x00-\xff]/gi) !== null) {
          len += 3;
        } else {
          len += 1;
        }
      }
    }
    // 前缀RESALE_，默认长度为7；
    if (len > 150 + 7) {
      console.log(len);
      CusNotification.error({
        message: intl
          .get('spcm.resaleQuery.resale.taskNameTooLong')
          .d('【备注信息】字段最多可填入150个字符（最多全中文可填入50个汉字）；'),
      });
      return;
    }
    historyDataUpdate(record).then((res) => {
      if (cusGetResponse(res)) {
        CusNotification.success();
        parent.handleSearch();
      }
    });
  }

  /**
   * 行数据更新
   *
   * @param {String} fieldName 字段名
   * @param {String} value 字段值
   */
  @Bind()
  handleUpdate(fieldName, value = undefined) {
    const { parent, dataSource, taskNamePrefix } = this.props;

    // [0] 数据编号
    // [1] 字段名称
    const [id, name] = fieldName.split('#');

    parent.setState({
      dataSource: dataSource.map((item = {}) => {
        if (item['taskId'] === id * 1) {
          item[name] = `${taskNamePrefix}${value}`;
          return item;
        }
        return item;
      }),
    });
  }

  getColumns() {
    return [
      // 任务名称 -> 备注信息
      {
        title: intl.get('hzero.common.component.excelExport.hd.m.hd.desc').d('备注信息'),
        width: 400,
        align: 'center',
        dataIndex: 'taskName',
        render: (_, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item
              style={{ margin: '-10px 0' }}
              name={`${record.taskId}#taskName`}
              initialValue={(record?.taskName?.split('_') || [])[1]}
            >
              <Input
                style={{ textAlign: 'center' }}
                onChange={({ target }) =>
                  this.handleUpdate(`${record.taskId}#taskName`, target.value)
                }
              />
            </Form.Item>
          ) : (
            (record?.taskName?.split('_') || [])[1]
          ),
      },
      {
        title: intl.get('hzero.common.component.excelExport.hd.m.hd.state').d('任务状态'),
        width: 120,
        align: 'center',
        dataIndex: 'state',
        render: (val) => {
          const statusLists = [
            {
              status: 'DONE',
              color: 'green',
              text: intl.get('hzero.common.component.excelExport.hd.m.hd.state.done').d('已结束'),
            },
            {
              status: 'DOING',
              color: '',
              text: intl
                .get('hzero.common.component.excelExport.hd.m.hd.state.doing')
                .d('正在进行'),
            },
            {
              status: 'CANCELLED',
              color: 'red',
              text: intl
                .get('hzero.common.component.excelExport.hd.m.hd.state.cancelled')
                .d('已取消'),
            },
            {
              status: 'FAILED',
              color: 'red',
              text: intl.get('hzero.common.component.excelExport.hd.m.hd.state.failed').d('失败'),
            },
          ];
          return TagRender(val, statusLists);
        },
      },
      // {
      //   title: intl.get('hzero.common.component.excelExport.hd.m.hd.creationDate').d('任务开始时间'),
      //   dataIndex: 'creationDate',
      //   width: 200,
      //   render: dateTimeRender,
      // },
      // {
      //   title: intl.get('hzero.common.component.excelExport.hd.m.hd.endDateTime').d('任务结束时间'),
      //   dataIndex: 'endDateTime',
      //   width: 200,
      //   render: dateTimeRender,
      // },
      // {
      //   title: intl.get('hzero.common.component.excelExport.hd.m.hd.errorInfo').d('异常信息'),
      //   dataIndex: 'errorInfo',
      //   width: 300,
      //   render: (errorInfo) =>
      //     errorInfo ? (
      //       <a
      //         onClick={() => {
      //           const { onShowErrorInfo } = this.props;
      //           onShowErrorInfo(errorInfo);
      //         }}
      //       >
      //         {errorInfo}
      //       </a>
      //     ) : null,
      // },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        align: 'center',
        render: (text, record) => {
          const { onRecordDownload } = this.props;
          if (record.state === 'DONE') {
            return (
              <div>
                <CusButton
                  type="plain"
                  style={{ marginRight: '16px' }}
                  onClick={() => {
                    onRecordDownload(record);
                  }}
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </CusButton>
                {['update'].includes(record._status) ? (
                  <CusButton type="plain" onClick={() => this.handleSave(record)}>
                    {intl.get('hzero.common.button.save').d('保存')}
                  </CusButton>
                ) : (
                  <CusButton type="plain" onClick={() => this.handleEdit(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </CusButton>
                )}
              </div>
            );
          } else {
            return (
              <div>
                <CusButton type="plain" style={{ marginRight: '16px' }} disabled>
                  {intl.get('hzero.common.button.exporting').d('导出中')}
                </CusButton>
                {/* {['update'].includes(record._status) ? (
                  <CusButton
                    type="plain"
                    onClick={() => this.handleSave(record)}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </CusButton>
                ) : (
                  <CusButton
                    type="plain"
                    onClick={() => this.handleEdit(record)}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </CusButton>
                )} */}
              </div>
            );
          }
        },
      },
    ];
  }

  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  form = React.createRef();

  render() {
    const { dataSource = [], pagination = {}, onChange } = this.props;
    const columns = this.getColumns();
    return (
      <Form ref={this.form} style={{ paddingLeft: '16px' }} className="customize-form customize-table-from">
        <CusTable
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
      </Form>
    );
  }
}
