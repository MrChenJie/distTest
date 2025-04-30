/**
 * SignUpList - 报名响应模态框
 * @date: 2022/4/2
 * @author: chenjie <jie.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

 import React, { PureComponent } from 'react';
 import { Table } from 'hzero-ui';
 import intl from 'utils/intl';

 
 /**
  * 报名响应列表
  * @extends {PureComponent} - React.PureComponent
  * @reactProps {Array} dataSource - 列表数据
  * @reactProps {Boolean} loading - 数据加载完成标记
  * @reactProps {Function} onChange - 切换版本列表分页
  * @reactProps {Function} onFetch - 查询详情列表
  * @return React.element
  */
 export default class SignUpList extends PureComponent {
    state = {
        dataSource: []
    }

    // componentDidMount() {
    //     this.getSignUpTableList()
    // }
//     // 获取报名响应列表数据
//    @Bind()
//     getSignUpTableList() {
//         const { dispatch } = this.props;
//         dispatch({
//             type: 'contractMaintain/getSignUpTableList',
//             payload: [{ ...record }],
//           }).then((res) => {
//             if (res) {
//               notification.success();
//               this.fetchList();
//             }
//           });
//     }
   render() {
    //  const { dataSource, loading, onFetch, pagination, onChange } = this.props;
     const columns = [
       {
         title: intl.get('hzero.common.components.dataAudit.version1').d('供应商编码'),
         dataIndex: 'supplierNum',
         width: 200
       },
       {
         title: intl.get('hzero.common.components.dataAudit.operationType1').d('供应商名称'),
         dataIndex: 'supplierName',
         width: 200,
       },
       {
         title: intl.get('hzero.common.explain1').d('是否参与'),
         dataIndex: 'processState',
         width: 100,
       },
     ];
     return (
       <Table
         rowKey="auditDataId"
         bordered
         columns={columns}
         dataSource={dataSource}
        //  pagination={pagination}
        //  loading={loading}
        //  onChange={page => onChange(page)}
       />
     );
   }
 }
 