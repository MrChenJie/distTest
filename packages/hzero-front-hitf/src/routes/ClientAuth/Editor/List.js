/**
 * Table - 菜单配置 - 列表页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Modal } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { totalRender } from 'utils/renderer';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import { PAGE_SIZE_OPTIONS } from 'utils/constants';
import { tableScrollWidth } from 'utils/utils';

export default class ServiceList extends PureComponent {
  @Bind()
  handleDeleteService() {
    const {
      selectedRowKeys,
      dataSource,
      onRowSelectionChange,
      deleteLines,
      fetchInformation,
      // onChangeState,
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        content: intl
          .get(`hitf.application.model.application.title.deleteContent`)
          .d('未保存的数据将会丢失,确定删除吗?'),
        onOk() {
          const ids = [];
          const newDataSource = [];
          dataSource.forEach(item => {
            if (
              !isUndefined(item.assignId) &&
              selectedRowKeys.indexOf(item.interfaceServerId) >= 0
            ) {
              ids.push(item.assignId);
            }
            if (selectedRowKeys.indexOf(item.interfaceServerId) < 0) {
              newDataSource.push(item);
            }
          });
          if (ids.length > 0) {
            deleteLines(ids).then(res => {
              if (res) {
                onRowSelectionChange([], []);
                notification.success();
                fetchInformation();
                // onChangeState('interfaceListDataSource', newDataSource);
              }
            });
          } else {
            onRowSelectionChange([], []);
            notification.success();
            fetchInformation();
            // onChangeState('interfaceListDataSource', newDataSource);
          }
        },
      });
    }
  }

  render() {
    const {
      dataSource = [],
      selectedRowKeys = [],
      loading,
      onRowSelectionChange = e => e,
      // formDataSource,
      listSelectedRows,
      addRoles = () => {},
      deleteRoles = () => {},
      // rowKey,
    } = this.props;
    // const { _token = '' } = formDataSource;
    const tableColumns = [
      {
        title: intl.get(`hitf.application.model.application.roleName`).d('角色名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`hitf.application.model.application.roleCode`).d('角色代码'),
        dataIndex: 'viewCode',
      },
    ];
    const tableProps = {
      dataSource,
      pagination: {
        showSizeChanger: true,
        pageSizeOptions: [...PAGE_SIZE_OPTIONS],
        pageSize: 10, // 每页大小
        total: dataSource.length,
        showTotal: totalRender,
      },
      loading,
      bordered: true,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      },
    };
    return (
      <Fragment>
        <div className="action" style={{ textAlign: 'right' }}>
          <Button
            icon="minus"
            disabled={isEmpty(listSelectedRows)}
            // onClick={addService}
            onClick={deleteRoles}
            style={{ marginRight: 8 }}
          >
            {intl.get(`hitf.application.view.button.deleteRole`).d('删除角色')}
          </Button>
          <Lov
            isButton
            type="primary"
            icon="plus"
            disabled={loading}
            code="HITF.USER_ROLE"
            onChange={addRoles}
            // queryParams={{
            //   organizationId: isTenantRoleLevel()
            //     ? formProps.dataSource.tenantId
            //     : formDataSource.tenantId,
            //   applicationId: isNumber(applicationId) ? applicationId : -1,
            //   // appTenantId: formDataSource.tenantId,
            // }}
          >
            {intl.get(`hitf.application.view.button.addRole`).d('添加角色')}
          </Lov>
        </div>
        <br />
        <Table {...tableProps} />
      </Fragment>
    );
  }
}
