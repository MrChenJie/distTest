/** -- CMI主动澄清的表
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
 import Upload from 'srm-front-boot/lib/components/Upload/index';

 
 import deleteIcon from '@/assets/buttonIcons/删除.png';
 import saveIcon from '@/assets/buttonIcons/保存.png';
 import addIcon from '@/assets/buttonIcons/新建.png';
 
 const status = ['create', 'update'];
 const tenantId = getCurrentOrganizationId();
 const promptCode = `sodr.standardPurchaseOrder`;
 
 export default class ActiveClarificationTable extends Component {
   constructor(props) {
     super(props);
     this.state = {
       selectedRows: [],
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
 
   fetchFastCode() {
     const codes = {
       'BID.CLASSIFICATION': 'BID.CLASSIFICATION',
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
    * @memberof ActiveClarificationTable
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
    * @memberof ActiveClarificationTable
    */
   @Bind
   @Debounce(300, { leading: true })
   handleDeleteLine() {
     const { onDeleteLine = (e) => e } = this.props;
     const { selectedRowKeys, selectedRows } = this.state;
     onDeleteLine(selectedRowKeys,selectedRows, () => {
       this.setState({
         selectedRowKeys: [],
         selectedRows: [],
       });
     });
   }
 
   /**
    * 监听编辑事件，更改当前未保存状态
    *
    * @memberof ActiveClarificationTable
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
    * @memberof ActiveClarificationTable
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
     const columns =[
      {
        title: intl.get('spsm.taskHandover.model.taskT1ype').d('供应商'),
        dataIndex: 'employeeNum',
        width: 180,
      },
      {
        title: '采购内容',
        dataIndex: 'qaType',
        width: 180,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(qaTypeFlag ? 'qaTypeNew' : 'qaType', {
                initialValue: record.qaTypeNew ? record.qaTypeNew : record.qaType,
              })(
                <ValueList
                  style={{ width: '100%' }}
                  options={fastCodes['BID.CLASSIFICATION']}
                  lazyLoad={false}
                  allowClear
                  onChange={this.handleQaTypeChange}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: '规格型号/服务内容',
        dataIndex: 'caseDetail',
        width: 180,
        render: (val, record) => {
          return (
              <Form.Item>
              {record.$form.getFieldDecorator(caseDetailFlag ? 'caseDetailNew' : 'caseDetail', {
                initialValue: record.caseDetailNew ? record.caseDetailNew : record.caseDetail,
              })(<Input onChange={this.handleCaseDetailChange} />)}
            </Form.Item>
          )
        }
      },
      {
        title: '问题',
        dataIndex: 'qaContent',
        width: 180,
        // render: (val, record) => (
        //   <Form.Item>
        //     {record.$form.getFieldDecorator('qaContent', {
        //       initialValue: val,
        //     })(<Input disabled />)}
        //   </Form.Item>
        // ),
      },
      {
        title: '答复内容',
        dataIndex: 'qaContentNew',
        width: 180,
        render: (val, record) => {
          return (
              <Form.Item>
              {record.$form.getFieldDecorator('qaContentNew', {
                initialValue: val,
              })(<Input  />)}
            </Form.Item>
          )
        }
      },
      {
        title: '答复时间',
        dataIndex: 'answerTime',
        width: 180,
        render: (val) => dateRender(val),
      },
    ];
 
     const loading = saveLoading || deleteLoading || fetchLoading;
 
     const rowSelection = {
       columnWidth: 50,
       selectedRowKeys,
       onChange: (keys,rows) => {
         this.setState({
           selectedRowKeys: keys,
           selectedRows: rows,
         });
       },
     };
 
     return (
       <div style={{ marginTop: '-10px' }}>
         {/* {isEdit && ( */}
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
              //  loading={deleteLoading}
             >
               <img src={deleteIcon} alt="" />
               {intl.get('hzero.common.button.delete').d('删除')}
             </Button>
             <Button onClick={onSave}>
               <img src={saveIcon} alt="" style={{ width: '15px' }} />
               {intl.get('hzero.common.button.save').d('保存')}
             </Button>
             <Button onClick={this.handleAddLine}>
               <img src={addIcon} alt="" />
               {intl.get('hzero.common.button.add').d('新增')}
             </Button>
           </div>
         {/* )} */}
         <div style={{ clear: 'both' }} />
         <EditTable
           bordered
           rowKey="poOrderId"
           dataSource={dataSource}
           pagination={pagination}
          //  onChange={this.handlePageChange}
           columns={columns}
          //  loading={fetchLoading}
           rowSelection={rowSelection}
           onDataChange={this.handleDataChange}
           scroll={{ x: tableScrollWidth(columns) }}
         />
       </div>
     );
   }
 }
 