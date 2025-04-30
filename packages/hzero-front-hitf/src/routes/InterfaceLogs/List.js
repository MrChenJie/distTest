/*
 * List - 接口监控列表
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Table } from 'hzero-ui';
// import { getDateFormat } from 'utils/utils';
import { dateTimeRender, TagRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';

const tenantRoleLevel = isTenantRoleLevel();

export default class List extends PureComponent {
  render() {
    const { dataSource, history, pagination, loading, searchPaging } = this.props;
    const columns = [
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.tenant`).d('所属租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.serverCode`).d('服务代码'),
        dataIndex: 'serverCode',
        width: 120,
      },
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.serverName`).d('服务名称'),
        dataIndex: 'serverName',
        width: 120,
      },
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.clientId`).d('客户端ID'),
        dataIndex: 'clientId',
        width: 150,
      },
      {
        title: intl
          .get(`hitf.interfaceLogs.model.interfaceLogs.external.interfaceUrl`)
          .d('第三方接口地址'),
        dataIndex: 'interfaceUrl',
        width: 120,
      },
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.invokeType`).d('接口调用类型'),
        dataIndex: 'invokeTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`hitf.interfaceLogs.model.interfaceLogs.invokeKey`).d('请求ID'),
        dataIndex: 'invokeKey',
      },
      {
        title: intl
          .get(`hitf.interfaceLogs.model.interfaceLogs.internal.requestTime`)
          .d('平台接口请求时间'),
        width: 160,
        dataIndex: 'requestTime',
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`hitf.interfaceLogs.model.interfaceLogs.internal.responseStatus`)
          .d('平台接口响应状态'),
        dataIndex: 'responseStatus',
        width: 130,
        render: val => {
          const statusLists = [
            {
              status: 'success',
              color: 'green',
              text: intl.get('hitf.interfaceLogs.model.interfaceLogs.success').d('成功'),
            },
            {
              status: 'fail',
              color: 'red',
              text: intl.get('hitf.interfaceLogs.model.interfaceLogs.failure').d('失败'),
            },
          ];
          return TagRender(val, statusLists);
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 60,
        fixed: 'right',
        render: (val, record) => {
          const operators = [
            {
              key: 'detail',
              ele: (
                <a
                  onClick={() => {
                    history.push(`/hitf/interface-logs/detail/${record.interfaceLogId}`);
                  }}
                >
                  {intl.get(`hitf.interfaceLogs.view.message.detail`).d('详情')}
                </a>
              ),
              len: 2,
              title: intl.get(`hitf.interfaceLogs.view.message.detail`).d('详情'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Fragment>
        <Table
          bordered
          rowKey="interfaceLogId"
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          onChange={searchPaging}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
