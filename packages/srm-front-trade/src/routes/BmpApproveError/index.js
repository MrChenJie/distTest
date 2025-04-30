import React from 'react';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { queryErrorList } from '@/services/BpmApproveService';
import { createPagination } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const prompt = 'spfm.bmpApproveError';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['SPFM.BPM_DATA_TYPE', 'SPFM.BPM_TEMPLATE_CODE', 'SPFM.PROCESS_STATUS'])
export default class BmpApproveError extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: { path },
    } = props;
    const isPub = path.startsWith('/pub');
    this.state = {
      activeKey: ['form', 'table'],
      dataSource: [],
      pagination: {},
      loading: false,
      isPub,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const filterValues = this.getQueryParams();
    this.setState({
      loading: true,
    });
    queryErrorList({
      page,
      ...filterValues,
    })
      .then((res) => {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue() || {};
    const { processDateFrom, processDateTo } = fieldsValue;
    return {
      ...fieldsValue,
      processDateFrom: processDateFrom ? dayjs(processDateFrom).format(DATETIME_MIN) : undefined,
      processDateTo: processDateTo ? dayjs(processDateTo).format(DATETIME_MAX) : undefined,
    };
  };

  render() {
    const { idpValueMap = {} } = this.props;
    const { isPub, loading = false, activeKey = [], dataSource = [], pagination = {} } = this.state;

    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const listProps = {
      isPub,
      dataSource,
      pagination,
      onChange: this.handleSearch,
    };
    return (
      <PageWrapper loading={loading}>
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
            <ListTable {...listProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
