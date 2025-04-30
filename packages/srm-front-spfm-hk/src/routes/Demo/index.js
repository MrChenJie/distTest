import React, { Component } from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { fastCodeLoader } from '@/utils/decorators';

import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import './index.less';

const { Panel } = Collapse;
const prompt = 'spfm.sanctionsList';

@formatterCollections({ code: [prompt] })
@fastCodeLoader([
  'SPFM.SANCTIONS_TYPE',
  'SPFM.SANCTIONS_SIMILARITY_STATUS',
])
@connect(({ loading, sanctionsList }) => ({
  sanctionsList,
  queryLoading: loading.effects['sanctionsList/queryList'],
  exportLoading: loading.effects['sanctionsList/exportSanctions'],
  updateLoading: loading.effects['sanctionsList/updateStatus'],
  dataSource: sanctionsList?.dataSource,
  pagination: sanctionsList?.pagination,
}))
export default class SanctionsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      selectedRowKeys: [],
      selectedRows: [],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      sorter: {}, // 排序选择记录
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}, _, sorter) => {
    const { dispatch } = this.props;
    const { sorter: stateSorter } = this.state;
    // 通过state暂时缓存排序
    this.setState({
      sorter: sorter ? sorter : stateSorter,
    });
    dispatch({
      type: 'sanctionsList/queryList',
      payload: {
        page,
        sorter: sorter ? sorter : stateSorter,
        ...this.getQueryParams(),
      },
    }).then(res => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue() || {};
    const { activeTimeFrom, activeTimeTo } = fieldsValue;
    return {
      ...fieldsValue,
      activeTimeFrom: dayjs.isDayjs(activeTimeFrom) ? activeTimeFrom.format(DEFAULT_DATETIME_FORMAT) : undefined,
      activeTimeTo: dayjs.isDayjs(activeTimeTo) ? activeTimeTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
    };
  };

  handleExport = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sanctionsList/exportSanctions',
      payload: {
        ...this.getQueryParams(),
      }
    }).then(res => {
      if (res) {
        const fileName = intl.get(`${prompt}.view.fileName.export`).d('制裁名单导出') + `${dayjs().format('YYYY-MM-DD')}`;
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.setState({ exportPending: false });
      }
    })
  }

  handleStatusUpdate = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    if (selectedRowKeys.length <= 0) {
      CusNotification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return 0;
    }
    CusModal.confirm({
      content: intl
        .get(`${prompt}.view.confirm.updateStatus`)
        .d('只有生效状态的数据，才会在选择参与方数据时出现【该参与方存在制裁名单中】提示，请谨慎修改。'),
      onOk: () => {
        dispatch({
          type: 'sanctionsList/updateStatus',
          payload: selectedRows,
        }).then(res => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
          };
        })
      },
      okType: 'normal',
    })
  }

  renderButtons = () => {
    const { exportLoading = false, updateLoading = false }= this.props;
    return (
      <>
        <CusButton mini onClick={this.handleExport} loading={exportLoading}>
          {intl.get(`${prompt}.button.export`).d('导出')}
        </CusButton>
        <CusButton mini type="primary" onClick={this.handleStatusUpdate} loading={updateLoading}>
          {intl.get(`${prompt}.button.statusUpdate`).d('状态修改')}
        </CusButton>
      </>
    )
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const { activeKey, selectedRowKeys, isPub } = this.state;
    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows,
        })
      }
    }
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const listTableProps = {
      ...this.props,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
    };
    return (
      <PageWrapper loading={queryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={this.renderButtons()}
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}