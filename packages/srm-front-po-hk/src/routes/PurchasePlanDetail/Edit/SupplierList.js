/**
 * QuotationTable - 邀请供应商
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
 import React, { PureComponent } from 'react';
 import { Bind } from 'lodash-decorators';
 // import { Tooltip } from 'antd';
 import { tableScrollWidth } from 'utils/utils';
 import { pullAllBy } from 'lodash';
 // import { routerRedux } from 'dva/router';
 import intl from 'utils/intl';
 import EditTable from '_cus_components/EditTable';
 import CusModal from '_cus_components/CusModal';
 // import querystring from 'querystring';
 // import { numberRender, dateRender } from 'utils/renderer';
 // import formatterCollections from 'utils/intl/formatterCollections';
 import CusTable from '_cus_components/CusTable';
 import { tooltipRender, labelTip } from '_cus_utils/render';
 import CusSelect from '_cus_components/CusSelect';
 import CusInput from '_cus_components/CusInput';
 import CusButton from '_cus_components/CusButton';
 import { Input, Tooltip } from 'antd';
 // import { Button, Dropdown, Form, Icon, Menu, Modal, Progress, Select, Tooltip } from 'hzero-ui';
 import { Form, Select } from 'hzero-ui';
 import CusLov from '_cus_components/CusLov';
 import CusExcelExport from '_cus_components/CusExcelExport';
 import dayjs from 'dayjs';
 import { getCurrentOrganizationId } from 'utils/utils';
 
 
 const promptCode = 'HKPC.commom';
 const ROW_KEY = 'enquiryPriceId';
 const FormItem = Form.Item
 const organizationId = getCurrentOrganizationId();
 export default class QuotationTable extends PureComponent {
   constructor(props) {
     super(props);
     this.state = {
       selectedRowKeys: [],
       selectedRows: [],
     };
   }

   componentDidMount() {
    //  console.log('111111', this.props)
   }
 
   @Bind()
   onSelect(record, selected) {
     const { selectedRows = [] } = this.state;
     const newSRows = selected
       ? selectedRows.concat(record)
       : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
     const newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item[ROW_KEY]);
     });
     console.log('newSRows', newSRows);
     this.setState({
       selectedRows: newSRows,
       selectedRowKeys: newSelectedRowKeys,
     });
   }
 
   @Bind()
   onSelectAll(selected, _, changeRows) {
     const { selectedRows = [] } = this.state;
     const newSRows = selected
       ? selectedRows.concat(changeRows)
       : pullAllBy([...selectedRows], changeRows, ROW_KEY);
     const newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item[ROW_KEY]);
     });
     this.setState({
       selectedRows: newSRows,
       selectedRowKeys: newSelectedRowKeys,
     });
   }
 
   render() {
     const {
       selectedRows,
       selectedRowKeys,
     } = this.state;
    //  console.log('this.props1111111111', this.props)
     const { supplierList = [],supplierPagination = {},match,proId ,todoFlag} = this.props
 
    //  const info = dataSource.projectSettingContent.inviteSuppliersContent;
     // 采购方案编号
     const prPlanNum = match.params.prPlanNum;
 
     const supperlierPagination ={}
     const columns = [
       {
         title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
         dataIndex: 'seq',
         width: 100,
         render:(val,record,index)=>{
           return <span>{index+1}</span>
         }
       },
       {
         title: intl.get(`HKPC.commom.view.title.Type`).d('类型'),
         dataIndex: 'supplierSourceTypeMeaning',
         width: 160,
       
       },
       {
         title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
         dataIndex: 'supplierName',
         width: 160,
       },
      //  {
      //    title: intl.get(`HKPC.commom.view.title.ictstatus`).d('状态'),
      //    dataIndex: 'processStateMeaning',
      //    width: 160,
      //  },
       {
         title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
         dataIndex: 'contact',
         width: 160,
       },
       {
         title: intl.get(`bid.bidcommon.view.title.contactphone`).d('联系方式'),
         dataIndex: 'contactinformation',
         width: 160,
       },
       {
         title: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
         dataIndex: 'mail',
         width: 160,
       },
     ];
 
     const rowSelection = {
       selectedRows,
       selectedRowKeys,
       onSelect: this.onSelect,
       onSelectAll: this.onSelectAll,
     };
 
     const tableProps = {
       dataSource: supplierList,
       columns,
       pagination: false,
       rowKey: 'auditNodeMeaning',
       scroll: { x: tableScrollWidth(columns) }, // y: 480
     };
     return (
       <>
        <CusTable {...tableProps} />
      </>
     )
   }
 }