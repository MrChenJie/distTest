import React, { Component } from 'react';
import intl from 'utils/intl';
import CusTable from '@/components/CusTable';
import CusSpin from '@/components/CusSpin';

export default class ExportPage extends Component {
  render() {
    const {
      dataSource = {},
      rowSelection = {},
      fetchColumnLoading,
      queryFormItem,
      renderQueryForm,
      selectAllTitle = intl.get('hzero.common.model.cusExcelExport.SelectAll').d('全选'),
    } = this.props;
    const columns = [
      {
        title: selectAllTitle,
        key: 'title',
        dataIndex: 'title',
        width: 400,
      }
    ]
    return (
      <CusSpin spinning={fetchColumnLoading}>
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
          />
      </CusSpin>
    );
  }
}
