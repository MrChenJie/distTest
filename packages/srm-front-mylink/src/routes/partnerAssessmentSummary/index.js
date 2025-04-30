import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const prompt = 'spfmhk.mylink';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['LINK.PARTNER_EVAL_PERIOD'])
@connect(({ loading, partnerAssessmentSummaryModal }) => ({
  partnerAssessmentSummaryModal,
  queryLoading: loading.effects['partnerAssessmentSummaryModal/queryList'],
  dataSource: partnerAssessmentSummaryModal?.dataSource,
  pagination: partnerAssessmentSummaryModal?.pagination,
}))
class partnerAssessmentSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnerAssessmentSummaryModal/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
        evalDateRange: null
      },
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    if (fieldsValue?.evalDateRange) {
      fieldsValue.evalDateStart = dayjs(fieldsValue.evalDateRange[0]).format(DEFAULT_DATE_FORMAT);
      fieldsValue.evalDateEnd = dayjs(fieldsValue.evalDateRange[1]).format(DEFAULT_DATE_FORMAT);
    } else {
      fieldsValue.evalDateStart = null;
      fieldsValue.evalDateEnd = null;
    }
    return {
      ...fieldsValue,
    };
  };

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
    } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      idpValueMap,
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

export default partnerAssessmentSummary;
