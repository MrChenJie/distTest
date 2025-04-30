import React, { Component } from 'react';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';

export default class ExportPage extends Component {
  render() {
    const {
      dataSource = {},
      rowSelection = {},
      fetchColumnLoading,
      queryFormItem,
      renderQueryForm,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.model.cusExcelExport.SelectAll').d('全选'),
        key: 'title',
        dataIndex: 'title',
        width: 400,
        ellipsis: true,
      },
    ];
    return (
      <>
        {queryFormItem && (
          <>
            <div style={{ margin: '12px auto' }}>
              {intl.get(`hzero.common.components.export.condition`).d('设置导出条件')}
            </div>
            {renderQueryForm()}
          </>
        )}
        <CusTable
          rowKey="id"
          columns={columns}
          pagination={false}
          dataSource={dataSource.children}
          rowSelection={rowSelection}
          paddingLeft={0}
          loading={fetchColumnLoading}
        />
      </>
    );
  }
}
