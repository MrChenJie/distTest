/**
 * JudgeTable - 评委组设置
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
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

export default class JudgeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }


  render() {
    const {
      form,idpValueMap,judgeDataSource,judgeDataPagination
    } = this.props
    const { getFieldDecorator, getFieldValue } = form;
    // const { supperlierSouce = [{ bbb: '细节条款' }], supperlierPagination = {} } = evaluationList
    const supperlierSouce =[{ aaa: '物料名称' }]
    const supperlierPagination ={}
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        dataIndex: 'lineNo',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.ExpertType`).d('评委类型'),
        dataIndex: 'judgeType',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.ExpertName`).d('评委姓名'),
        dataIndex: 'judgeName',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Department`).d('评委所在部门'),
        dataIndex: 'judgeDep',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Phone`).d('电话'),
        dataIndex: 'phone',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.MailAddress2`).d('邮箱'),
        dataIndex: 'email',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Status`).d('状态'),
        dataIndex: 'status',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'remark',
        width: 160,
      },
    ];

    const tableProps = {
      dataSource: judgeDataSource,
      columns,
      pagination: judgeDataPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <div>{intl.get(`${promptCode}.view.title.NumberofProjectExperts`).d('项目评委人数')}</div>
        <CusSelect
                allowClear
                popupClassName="customize-select"
                style={{ width: '100%' }}
                options={idpValueMap['HKPC.NUMBEROFPROJECTJUDGES']}
            />
        <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>;
  }
}