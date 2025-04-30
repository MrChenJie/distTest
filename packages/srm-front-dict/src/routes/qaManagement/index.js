import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { getDateFormat } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { getCurrentOrganizationId } from 'utils/utils';

import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const dateFormat = getDateFormat();
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfmhk.trade', 'spfmhk.dict'] })
@fastCodeLoader(['DICT.QUESTION_REPLY_STATUS', 'DICT.QUESTION_TYPE'])
@connect(({ loading, qaManagementModel }) => ({
  qaManagementModel,
  queryLoading: loading.effects['qaManagementModel/queryList'],
  dataSource: qaManagementModel?.dataSource,
  pagination: qaManagementModel?.pagination,
}))
class qaManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      selectedId: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  @Bind
  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    this.setState({ selectedId: [] });
    dispatch({
      type: 'qaManagementModel/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  @Bind
  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
    };
  };

  @Bind
  resetData = () => {
    this.setState({ selectedId: [] });
  };

  @Bind
  handleKeyPress(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleSearch();
    }
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const { activeKey, isPub, selectedRowKeys } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
      onReset: this.resetData,
    };
    const rowSelection = {
      // columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        const ids = rows.map((item) => {
          return item.qaId;
        });
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
          selectedId: ids,
        });
      },
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
                buttons={
                  <CusExcelExport
                    buttonText={
                      <>{intl.get(`spfmhk.dict.view.field.portalanswerexport`).d('列表导出')}</>
                    }
                    requestUrl={`/dict/v1/${organizationId}/qas/exportPartnerQaList`}
                    queryParams={{
                      qaIds: this.state.selectedId,
                      ...this.getQueryParams(),
                    }}
                    downloadType="Blob"
                    fileName={intl
                      .get(`spfmhk.dict.view.file.title.qalistexport`)
                      .d('门户答疑列表导出')}
                  ></CusExcelExport>
                }
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

export default qaManagement;
