import React, { Component } from 'react';
import { Spin, Tree } from 'hzero-ui';

import intl from 'utils/intl';

export default class ExportPage extends Component {
  render() {
    const {
      exportList,
      fetchColumnLoading,
      queryFormItem,
      checkedKeys,
      expandedKeys,
      renderQueryForm,
      renderTreeNodes,
      onExpand,
      onSelect,
    } = this.props;
    return (
      <Spin spinning={fetchColumnLoading}>
        {queryFormItem && (
          <>
            <div style={{ margin: '12px auto' }}>
              {intl.get(`hzero.common.components.export.condition`).d('设置导出条件')}
            </div>
            {renderQueryForm()}
          </>
        )}
        <div style={{ margin: '12px auto' }}>
          {intl.get(`hzero.common.components.export.columns`).d('选择要导出的列')}
        </div>
        <Tree
          checkable
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          defaultExpandedKeys={expandedKeys}
          onCheck={onSelect}
          checkedKeys={checkedKeys}
        >
          {renderTreeNodes(exportList)}
        </Tree>
      </Spin>
    );
  }
}
