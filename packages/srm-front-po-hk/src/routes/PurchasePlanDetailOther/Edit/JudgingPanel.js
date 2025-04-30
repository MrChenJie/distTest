/**
 * JudgingPanel - 报价表格式设置
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


const promptCode = 'HKPC.commom';
const FormItem = Form.Item
const ROW_KEY = 'enquiryPriceId';

export default class JudgingPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      tableInfo: []
    };
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

  // 根据项目评委人数显示table数据
  @Bind
  changeType(val){
    const renderFunc = (option)=>{
      let data2
      data2 = this.props.dataSource.filter((item,index)=>{
           return  item.status == '参与'
      })
      let newDataSource = data2.length > option ? data2.slice(0,option) : data2;
      this.setState({
        tableInfo:newDataSource
      })
    }
    if(val == 'Number3'){
      renderFunc(3)
    }
    if(val == 'Number5'){
      renderFunc(5)
    }
    if(val == 'Number7'){
      renderFunc(7)
    }
    if(val == 'Number9'){
      renderFunc(9)
    }
  }


  render() {
    const {
      selectedRows,
      selectedRowKeys,
    } = this.state;


    const { dataSource, idpValueMap,selectInfo  } = this.props

    // console.log(dataSource,'评委组数据源');


    const supperlierPagination = {}
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        dataIndex: 'seq',
        width: 100,
        render: (val, record, index) => {
          return <span>{index + 1}</span>
        }
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.ExpertType`).d('评委类型'),
      //   dataIndex: 'judgesTypeMeaning',
      //   required: 'true',
      //   width: 160,

      // },
      {
        title: intl.get(`${promptCode}.view.title.ExpertName`).d('评委姓名'),
        dataIndex: 'name',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Department`).d('评委所在部门'),
        dataIndex: 'department',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Phone`).d('电话'),
        dataIndex: 'mobile',
        // required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.MailAddress2`).d('邮箱'),
        dataIndex: 'email',
        // required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Status`).d('状态'),
        dataIndex: 'effectStateMeaning',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
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
      dataSource: dataSource,
      // rowSelection: rowSelection,
      columns,
      pagination: supperlierPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };

    return <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom:'16px' }}>
        <Form className='customize-form'>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.OnlineResponse`).d('项目评委人数')}
            >
              <CusSelect
                  value={selectInfo}
                  // allowClear
                  disabled= {true}
                  popupClassName="customize-select"
                  options={idpValueMap['HKPC.NUMBEROFPROJECTJUDGES']}
                  onChange={(val) => this.changeType(val)}
                />
            </Form.Item>
        </Form>
      </div>
      <CusTable {...tableProps} />
    </>;
  }
}