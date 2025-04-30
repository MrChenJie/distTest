/**
 * TechnicalScore - 报价表格式设置
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
import { getCurrentOrganizationId } from 'utils/utils';
import dayjs from 'dayjs';


const promptCode = 'HKPC.commom';
const ROW_KEY = 'quotationOrder';
const FormItem = Form.Item
const organizationId = getCurrentOrganizationId();

@Form.create()
export default class TechnicalScore extends PureComponent {
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
    const {dataSource,idpValueMap,bothInfo,match,proId,todoFlag} = this.props
    // console.log(proId,'proidTECCCCCC');
    const info = dataSource.projectSettingContent.technologyScoreContent
    // 采购方案编号
    const prPlanNum = match.params.prPlanNum;
    const {
      selectedRows,
      selectedRowKeys,
    } = this.state


    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      disabled:true
    };
    const supperlierPagination = {}
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        dataIndex: 'sep',
        width: 100,
        render:(val,record,index)=>{
          return <span>{index+1}</span>
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoringItem`).d('评分大项'),
        dataIndex: 'technologyMajorReviewItems',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoringDetails`).d('评分细项'),
        dataIndex: 'technologyScoringRubric',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Score`).d('分值'),
        dataIndex: 'technologyScore',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.ObjectiveScore`).d('是否客观分'),
        dataIndex: 'technologyObjectiveScore',
        key:'technologyObjectiveScore',
        required: 'true',
        width: 160,
        // optins:{idpValueMap['HKPC.YES_OR_NO']},
        render: (_, record, index) => {
          if(bothInfo[index]){
            return <span>{bothInfo[index]['isObjectiveScoreMeaning']}</span>
          }
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoreType`).d('分值类型'),
        dataIndex: 'technologyScoreType',
        required: 'true',
        width: 160,
        render: (_, record, index) => {
          if(bothInfo[index]){
            return <span>{bothInfo[index]['scoreTypeMeaning']}</span>
          }
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoreValue`).d('设置分值下拉值'),
        dataIndex: 'technologyScoreDropDown',
        required: 'true',
        width: 160,
      },
    ];

    const tableProps = {
      disabled:true,
      dataSource: info,
      // rowSelection: rowSelection,
      columns,
      pagination: supperlierPagination,
      rowKey: 'quotationOrder',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom:'16px' }}>
        {/* <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('导出')}</CusButton> */}
        <CusExcelExport
          requestUrl={`/bidding/v1/${organizationId}/bid-score-configs/exportConInfo?proId=${proId}&fillerType=single-sheet`}
          otherButtonProps={{
            mini: true,
          }}
          method="GET"
          downloadType="Blob"
          fileName={intl.get(`${promptCode}.view.button.export`).d('导出')+ dayjs().format('YYYY-MM-DD')}
          buttonText={intl.get(`${promptCode}.view.button.export`).d('导出')}
        />
      </div>
      <EditTable {...tableProps} />
    </>;
  }
}