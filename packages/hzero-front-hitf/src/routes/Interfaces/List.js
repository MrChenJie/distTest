/**
 * List  - 应用管理 - 首页列表
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { yesOrNoRender, operatorRender } from 'utils/renderer';

export default class List extends PureComponent {
  defaultTableRowKey = 'id';

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      openDocument = e => e,
      onChange = e => e,
      openAuthConfig = () => {},
      rowSelection = {},
    } = this.props;
    const tableColumns = [
      {
        title: intl.get(`hitf.interfaces.model.interfaces.tenantName`).d('所属租户'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.interfaceCode`).d('接口编码'),
        dataIndex: 'interfaceCode',
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
        width: 150,
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.serverCode`).d('服务代码'),
        dataIndex: 'serverCode',
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.serverName`).d('服务名称'),
        dataIndex: 'serverName',
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.serverType`).d('服务类型'),
        dataIndex: 'serverType',
        width: 100,
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.isPublicFlag`).d('是否公共'),
        dataIndex: 'isPublicFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`hitf.interfaces.model.interfaces.authFlag`).d('授权'),
        dataIndex: 'authFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: dataSource.some(o => o.authFlag === 1) ? 180 : 90,
        fixed: 'right',
        render: (text, record) => {
          const operators = [
            {
              key: 'viewDocument',
              ele: (
                <a onClick={() => openDocument(record)}>
                  {intl.get(`hitf.interfaces.view.button.viewDocument`).d('查看文档')}
                </a>
              ),
              len: 4,
              title: intl.get(`hitf.interfaces.view.button.viewDocument`).d('查看文档'),
            },
          ];
          if (record.authFlag === 1) {
            operators.push({
              key: 'auth',
              ele: (
                <a onClick={() => openAuthConfig(record)}>
                  {intl.get(`hitf.interfaces.view.button.auth`).d('认证配置')}
                </a>
              ),
              len: 4,
              title: intl.get(`hitf.interfaces.view.button.auth`).d('认证配置'),
            });
          }
          return operatorRender(operators, record);
        },
      },
    ];
    const tableProps = {
      dataSource,
      loading,
      onChange,
      rowSelection,
      pagination,
      bordered: true,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowKey: this.defaultTableRowKey,
    };
    return <Table {...tableProps} />;
  }
}
