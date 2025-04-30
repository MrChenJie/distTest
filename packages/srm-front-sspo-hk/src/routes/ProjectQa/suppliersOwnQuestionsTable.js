/** -- 订单小组
 * @date: 2021/03/29 11:50:55
 * @author: Xukuan <kuan.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

 import React, { Component } from 'react';
 import { Form, Input, Button, Modal } from 'hzero-ui';
 import { Bind, Debounce } from 'lodash-decorators';
 
 import intl from 'utils/intl';
 import { getCurrentOrganizationId, tableScrollWidth, getResponse } from 'utils/utils';
 import { dateRender } from 'utils/renderer';
 import Lov from 'components/Lov';
 import EditTable from 'components/EditTable';
 import ValueList from 'components/ValueList';
 import { queryMapIdpValue } from 'services/api';
 
 import deleteIcon from '@/assets/buttonIcons/删除.png';
 import saveIcon from '@/assets/buttonIcons/保存1.png';
 import addIcon from '@/assets/buttonIcons/新建.png';
 
 const status = ['create', 'update'];
 const tenantId = getCurrentOrganizationId();
 const promptCode = `sodr.standardPurchaseOrder`;
 
 export default class OrderGroup extends Component {
   constructor(props) {
     super(props);
     this.state = {
       // selectedRows: [],
       selectedRowKeys: [],
       fastCodes: {},
     };
     // this.unsaveFlag = false;
   }
 
   componentDidMount() {
     // this.checkPermission();
     this.fetchFastCode();
   }
 
   checkStatus(record) {
     const { isEdit } = this.props;
     return status.includes(record._status) && isEdit;
   }
 
   // /**
   //  * 查询当前用户是否拥有编辑权限
   //  *
   //  * @memberof OrderGroup
   //  */
   // checkPermission() {
   //   const code = 'SPUC.PO_PERMISSION';
   //   queryIdpValue(code).then((res) => {
   //     const response = getResponse(res);
   //     if (response) {
   //       const { loginName } = currentUser || {};
   //       if (response.some((item) => item.value === loginName)) {
   //         this.setState({
   //           editFlag: true,
   //         });
   //       }
   //     }
   //   });
   // }
 
   fetchFastCode() {
     const codes = {
       'SPFM.YES_NO': 'SPFM.YES_NO',
     };
     queryMapIdpValue(codes).then((res) => {
       const response = getResponse(res);
       if (response) {
         this.setState({
           fastCodes: response,
         });
       }
     });
   }
 
   /**
    * 添加行
    *
    * @memberof OrderGroup
    */
   @Bind
   handleAddLine() {
     const { onAddLine = (e) => e } = this.props;
     onAddLine();
     this.handleDataChange();
   }
 
   /**
    *删除行
    *
    * @memberof OrderGroup
    */
   @Bind
   @Debounce(300, { leading: true })
   handleDeleteLine() {
     const { onDeleteLine = (e) => e } = this.props;
     const { selectedRowKeys } = this.state;
     onDeleteLine(selectedRowKeys, () => {
       this.setState({
         selectedRowKeys: [],
         // selectedRows: [],
       });
     });
   }
 
   /**
    * 监听编辑事件，更改当前未保存状态
    *
    * @memberof OrderGroup
    */
   @Bind
   handleDataChange() {
     const { unsaveFlag } = this.props;
     if (!unsaveFlag) {
       const { onEdit = (e) => e } = this.props;
       onEdit(true);
     }
   }
 
   /**
    * 监听分页变化，判断是否有未保存的数据
    *
    * @param {object} page
    * @memberof OrderGroup
    */
   @Bind
   handlePageChange(page) {
     const { onPageChange = (e) => e, unsaveFlag } = this.props;
     if (unsaveFlag) {
       Modal.confirm({
         title: intl
           .get('hzero.common.message.confirm.giveUpTip')
           .d('你有修改未保存，是否确认离开？'),
         onOk: () => {
           onPageChange(page);
         },
       });
     } else {
       onPageChange(page);
     }
   }
 
   render() {
     const {
       dataSource = [],
       pagination = {},
       onSave = (e) => e,
       saveLoading = false,
       fetchLoading = false,
       deleteLoading = false,
       isEdit = false,
     } = this.props;
     const { selectedRowKeys = [], fastCodes = {} } = this.state;
     const columns = [
       {
         title: (
           <div
             style={{ display: 'contents' }}
             title={intl.get(`${promptCode}.orderGroup.model.userName`).d('用户名称')}
           >
             {intl.get(`${promptCode}.orderGroup.model.userName`).d('用户名称')}
           </div>
         ),
         dataIndex: 'employeeNum',
         width: 180,
         render: (val, record) =>
           this.checkStatus(record) ? (
             <Form.Item>
               {record.$form.getFieldDecorator('employeeNum', {
                 initialValue: val,
                 rules: [
                   {
                     required: true,
                     message: intl.get('hzero.common.validation.notNull', {
                       name: intl.get(`${promptCode}.orderGroup.model.userName`).d('用户名称'),
                     }),
                   },
                 ],
               })(
                 <Lov
                   code="HPFM.EMPLOYEE"
                   queryParams={{ tenantId }}
                   lovOptions={{
                     displayField: 'name',
                   }}
                   textValue={record.employeeName}
                 />
               )}
             </Form.Item>
           ) : (
             val
           ),
       },
       {
         title: (
           <div
             style={{ display: 'contents' }}
             title={intl.get(`${promptCode}.orderGroup.model.editable`).d('是否可编辑')}
           >
             {intl.get(`${promptCode}.orderGroup.model.editable`).d('是否可编辑')}
           </div>
         ),
         dataIndex: 'editFlag',
         width: 180,
         render: (val, record) =>
           this.checkStatus(record) ? (
             <Form.Item>
               {record.$form.getFieldDecorator('editFlag', {
                 initialValue: val,
                 rules: [
                   {
                     required: true,
                     message: intl.get('hzero.common.validation.notNull', {
                       name: intl.get(`${promptCode}.orderGroup.model.editable`).d('是否可编辑'),
                     }),
                   },
                 ],
               })(
                 <ValueList
                   style={{ width: '100%' }}
                   options={fastCodes['SPFM.YES_NO']}
                   lazyLoad={false}
                   allowClear
                 />
               )}
             </Form.Item>
           ) : (
             val
           ),
       },
       {
         title: (
           <div
             style={{ display: 'contents' }}
             title={intl.get(`${promptCode}.orderGroup.model.creator`).d('创建人')}
           >
             {intl.get(`${promptCode}.orderGroup.model.creator`).d('创建人')}
           </div>
         ),
         dataIndex: 'realName',
         width: 180,
       },
       {
         title: (
           <div
             style={{ display: 'contents' }}
             title={intl.get(`${promptCode}.orderGroup.model.createDate`).d('创建日期')}
           >
             {intl.get(`${promptCode}.orderGroup.model.createDate`).d('创建日期')}
           </div>
         ),
         dataIndex: 'creationDate',
         width: 180,
         render: (val) => dateRender(val),
       },
       {
         title: (
           <div
             style={{ display: 'contents' }}
             title={intl.get(`${promptCode}.orderGroup.model.remarks`).d('备注')}
           >
             {intl.get(`${promptCode}.orderGroup.model.remarks`).d('备注')}
           </div>
         ),
         dataIndex: 'comments',
         render: (val, record) =>
           this.checkStatus(record) ? (
             <Form.Item>
               {record.$form.getFieldDecorator('comments', {
                 initialValue: val,
               })(<Input />)}
             </Form.Item>
           ) : (
             val
           ),
       },
     ];
 
     const loading = saveLoading || deleteLoading || fetchLoading;
 
     const rowSelection = isEdit && {
       columnWidth: 50,
       selectedRowKeys,
       onChange: (keys) => {
         this.setState({
           selectedRowKeys: keys,
           // selectedRows: rows,
         });
       },
     };
 
     return (
       <div style={{ marginTop: '-10px' }}>
         {isEdit && (
           <div
             style={{
               marginBottom: '10px',
               float: 'right',
             }}
             className="customize-buttons"
           >
             <Button
               onClick={this.handleDeleteLine}
               disabled={selectedRowKeys.length === 0 || loading}
               loading={deleteLoading}
             >
               <img src={deleteIcon} alt="" />
               {intl.get('hzero.common.button.delete').d('删除')}
             </Button>
             <Button onClick={onSave} loading={saveLoading} disabled={loading}>
               <img src={saveIcon} alt="" style={{ width: '15px' }} />
               {intl.get('hzero.common.button.save').d('保存')}
             </Button>
             <Button onClick={this.handleAddLine}>
               <img src={addIcon} alt="" />
               {intl.get('hzero.common.button.add').d('新增')}
             </Button>
           </div>
         )}
         <div style={{ clear: 'both' }} />
         <EditTable
           bordered
           rowKey="poOrderId"
           dataSource={dataSource}
           pagination={pagination}
           onChange={this.handlePageChange}
           columns={columns}
           loading={fetchLoading}
           rowSelection={rowSelection}
           onDataChange={this.handleDataChange}
           scroll={{ x: tableScrollWidth(columns) }}
         />
       </div>
     );
   }
 }
 