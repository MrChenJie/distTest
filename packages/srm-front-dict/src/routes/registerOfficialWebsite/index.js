import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterForm from './form';
import ListTable from './table';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';
const SRM_DICT = '/dict';
const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: [prompt] })
@fastCodeLoader([
  'HKTB.ACTIVITY_PROSTATUS',
  'DICT.RECUITMENT_METHOD',
  'DICT.REVIEW_APPLICATION_STATUS',
  'DICT.AUTO_CHECK_REGISTETR',
  'DICT.PORTAL_SUBMIT_CHECK',
  'DICT.MODE_NOTICE',
  'DICT.MODE_NOTICE_REGISTER',
])
@connect(({ loading, registerOfficialWebsiteModel }) => ({
  registerOfficialWebsiteModel,
  queryLoading: loading.effects['registerOfficialWebsiteModel/queryList'],
  dataSource: registerOfficialWebsiteModel?.dataSource,
  pagination: registerOfficialWebsiteModel?.pagination,
}))
class registerOfficialWebsite extends Component {
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

  @Bind
  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    const params = this.getQueryParams('search');
    dispatch({
      type: 'registerOfficialWebsiteModel/queryList',
      payload: {
        page,
        ...params,
      },
    });
  };

  getQueryParams = (type) => {
    const { selectedRows } = this.state;
    const fieldsValue = cloneDeep(this.form?.current?.getFieldsValue(true));
    if (fieldsValue?.registrationDate) {
      fieldsValue.registrationstartDate = dayjs(
        fieldsValue.registrationDate[0].hour(0).minute(0).second(0)
      ).format(DEFAULT_DATETIME_FORMAT);
      fieldsValue.registrationEndDate = dayjs(
        fieldsValue.registrationDate[1].hour(0).minute(0).second(-1)
      )
        .add(1, 'day')
        .format(DEFAULT_DATETIME_FORMAT);
    }
    if (fieldsValue?.registrationDate === null) {
      fieldsValue.registrationstartDate = null;
      fieldsValue.registrationEndDate = null;
    }
    if (fieldsValue?.modeNoticeId) {
      if (Array.isArray(fieldsValue.modeNoticeId)) {
        fieldsValue.modeNoticeId = fieldsValue?.modeNoticeId?.join(',');
      } else {
        fieldsValue.modeNoticeId = String(fieldsValue.modeNoticeId);
      }
    }
    const recordIds = selectedRows?.map((i) => {
      return i.recordId;
    });
    if (type === 'export') {
      return {
        ...fieldsValue,
        recordIds: recordIds,
      };
    }
    return {
      ...fieldsValue,
    };
  };

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const { activeKey, isPub, selectedRowKeys, selectedRows } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      rowSelection,
      isPub,
      idpValueMap,
      onChange: this.handleSearch,
      // rowKey: 'recordId',
      rowKey: 'rowKey',
    };
    const dataExportProps = {
      requestUrl: `${SRM_DICT}/v1/${tenantId}/partner-register-records/exportRegistrationList`,
      method: 'GET',
      downloadType: 'Blob',
      buttonText: intl.get(`${prompt}.view.field.portalanswerexport`).d('列表导出'),
      fileName: intl
        .get(`${prompt}.view.file.title.registerOfficialWebsiteExport`)
        .d('官网注册列表导出'),
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
                buttons={<CusExcelExport mini {...dataExportProps} />}
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

export default registerOfficialWebsite;
