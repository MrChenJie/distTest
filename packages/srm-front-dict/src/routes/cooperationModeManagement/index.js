import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;

const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.COOPERATE_APPLY_STATUS', 'DICT.PARTNER_FILE_TYPE', 'DICT.MODE_FILE_TYPE'])
@connect(({ loading, cooperationModeManagementModel }) => ({
  cooperationModeManagementModel,
  queryLoading: loading.effects['cooperationModeManagementModel/queryList'],
  dataSource: cooperationModeManagementModel?.dataSource,
  pagination: cooperationModeManagementModel?.pagination,
}))
class cooperationManagement extends Component {
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
    document.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  @Bind
  handleKeyPress(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleSearch();
    }
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cooperationModeManagementModel/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      console.log('合作方式列表', res);
    }).catch((err) => {
      console.log(err);
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
    };
  };

  handleAddLines = () => {
    // window.open('/pub/dict/cooperation-mode-management/detail?pageType=add', '_blank')
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTGGSP&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/cooperation-mode-management/detail?pageType=add`)}`);
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
      // columnWidth: 50,
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
                  <CusButton
                    mini
                    type="primary"
                    onClick={this.handleAddLines}
                  >
                    {intl.get('hzero.common.view.button.add').d('新建')}
                  </CusButton>
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

export default cooperationManagement;
