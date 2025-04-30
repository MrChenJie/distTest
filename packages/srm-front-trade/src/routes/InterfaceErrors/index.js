import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import FilterForm from './Form';
import ListTable from './ListTable';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const { Panel } = Collapse;
const prompt = 'spub.interfaceErrors';

@formatterCollections({ code: [prompt] })
@fastCodeLoader([])
@connect(({ loading, interfaceErrors }) => ({
  interfaceErrors,
  queryLoading: loading.effects['interfaceErrors/queryList'],
  dataSource: interfaceErrors?.dataSource,
  pagination: interfaceErrors?.pagination,
}))
class InterfaceErrors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceErrors/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    const { dateFromStr, dateToStr } = fieldsValue;
    return {
      ...fieldsValue,
      dateFromStr: dayjs.isDayjs(dateFromStr) ? dateFromStr.format(DEFAULT_DATETIME_FORMAT) : undefined,
      dateToStr: dayjs.isDayjs(dateToStr) ? dateToStr.format(DEFAULT_DATETIME_FORMAT) : undefined,
    };
  };

  render() {
    const { queryLoading = false } = this.props;
    const { activeKey, isPub } = this.state;
    const filterFormProps = {
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const listTableProps = {
      ...this.props,
      isPub,
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

export default InterfaceErrors;
