import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';
const SRM_DICT = '/dict';
const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS', 'DICT.RECUITMENT_METHOD', 'DICT.REVIEW_APPLICATION_STATUS'])
@connect(({ loading, registerManagementModel }) => ({
  registerManagementModel,
  queryLoading: loading.effects['registerManagementModel/queryList'],
  dataSource: registerManagementModel?.dataSource,
  pagination: registerManagementModel?.pagination,
}))
class registerManagement extends Component {
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
      type: 'registerManagementModel/queryList',
      payload: {
        page,
        ...this.getQueryParams('search'),
      },
    });
  };

  getQueryParams = (type) => {
    const { selectedRows } = this.state;
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    if (fieldsValue?.registerDate) {
      fieldsValue.registrationstartDate = dayjs(fieldsValue.registerDate[0].hour(0).minute(0).second(0)).format(DEFAULT_DATETIME_FORMAT);
      fieldsValue.registrationEndDate = dayjs(fieldsValue.registerDate[1].hour(0).minute(0).second(-1)).add(1, 'day').format(DEFAULT_DATETIME_FORMAT);
    }
    if(fieldsValue?.registerDate===null){
      fieldsValue.registrationstartDate = null;
      fieldsValue.registrationEndDate = null;
    }
    const partnerIds = selectedRows?.map((i) => {
      return i.partnerId;
    });
    if (type === 'export') {
      return {
        ...fieldsValue,
        partnerIds: partnerIds,
      };
    }
    return {
      ...fieldsValue,
    };
  };

  handleApprove = () => {
    const { selectedRowKeys } = this.state;
    window.open(`/pub/dict/register-management/detail?partnerInfoIds=${selectedRowKeys}`, '_blank');
  };

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      selectedRows,
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
      isPub,
      rowSelection,
      idpValueMap,
      onChange: this.handleSearch,
      rowKey: 'partnerId',
    };
    const dataExportProps = {
      requestUrl: `${SRM_DICT}/v1/${tenantId}/partner-infos/exportRegistrationList`,
      method: 'GET',
      downloadType: 'Blob',
      buttonText: intl.get(`${prompt}.view.field.portalanswerexport`).d('列表导出'),
      fileName: intl.get(`${prompt}.view.file.title.registerexport`).d('报名库列表导出'),
      queryParams: this.getQueryParams('export'),
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
                  <>
                    <CusExcelExport mini {...dataExportProps} />
                    <CusButton
                      mini
                      type="primary"
                      onClick={this.handleApprove}
                      disabled={!((selectedRows?.filter(item => ['FINISHED', 'PENDING_REVIEW', 'RETURN_FOR_APPROVAL', 'BACKOUT'].includes(item.reviewStatus)).length === 0) && selectedRowKeys?.length !== 0)}
                    >
                      {intl.get(`${prompt}.view.field.intiateapproval`).d('发起审批')}
                    </CusButton>
                  </>
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

export default registerManagement;
