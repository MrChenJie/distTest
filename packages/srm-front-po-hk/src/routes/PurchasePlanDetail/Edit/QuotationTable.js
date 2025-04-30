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

    const { dataSource,match,proId ,todoFlag} = this.props
    // console.log(proId,'proidquottttttt');

    const info = dataSource.projectSettingContent.quotationSettingContent
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
      // {
      //   title: intl.get(`HKPC.commom.view.title.estimatedbudgettype`).d('预估预算类型'),
      //   dataIndex: 'budgetType',
      //   required: 'true',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
      //   dataIndex: 'purchasingCategoryMeaning',
      //   required: 'true',
      //   width: 160,
      // },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'quotationPurchaseContent',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'quotationServiceContent',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: 'quotationCurrency',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quotationQuantity',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'quotationUOM',
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
      dataSource: info,
      columns,
      // rowSelection:rowSelection,
      pagination: supperlierPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom:'16px' }}>
        <CusExcelExport
          requestUrl={`/bidding/v1/${organizationId}/bid-pro-price-configs/exportProInfo?proId=${proId}`}
          otherButtonProps={{
            mini: true,
          }}
          method="GET"
          downloadType="Blob"
          fileName={intl.get(`${promptCode}.view.button.export`).d('导出') + dayjs().format('YYYY-MM-DD')}
          buttonText={intl.get(`${promptCode}.view.button.export`).d('导出')}
        />
      </div>
      <CusTable {...tableProps} />
    </>;
  }
}