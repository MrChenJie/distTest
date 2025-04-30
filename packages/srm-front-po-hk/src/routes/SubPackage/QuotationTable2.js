/**
 * QuotationTable - 报价表格式设置
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

export default class QuotationTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }


  render() {
    const {
      ccc,
      form,
      idpValueMap,quoteDataSource,quoteDataPagination
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
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        required: 'true',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: "chushi",
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: "yanzheng1"
                    }),
                  },
                ],
              })
                (<CusLov 
                // 等等业务
                // code:''
                />)}
            </FormItem>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'matType',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quantity',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: 'quotedCurrency',
        required: 'true',
        width: 160,
      },
    ];

    const tableProps = {
      dataSource: quoteDataSource,
      columns,
      pagination: quoteDataPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>;
  }
}