/**
 * refSummary - 询价单历史记录汇总页面
 * @since 2022-02-18
 * @author xinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { fastCodeLoader } from '@/utils/decorators';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';
import './index.less';

/**
 * 国际化前缀
 */
const promptCode = 'ssrc.resaleRfqHistory';
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ resaleRfq, loading }) => ({
  resaleRfq,
  fetchLoading: loading.effects['resaleRfq/queryRfqHistoryList'],
  queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
])
export default class resaleRfqSummaryHistory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * @description 查询询价汇总数据
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/queryRfqHistoryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  }


  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    const {
      creationDateFrom,
      creationDateTo,
      enquiryStartDateFrom,
      enquiryStartDateTo,
      enquiryEndDateFrom,
      enquiryEndDateTo,
    } = fieldsValue;
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom)
        ? creationDateFrom.format("YYYY-MM-DD 00:00:00")
        : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo)
        ? creationDateTo.format("YYYY-MM-DD 23:59:59")
        : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom)
        ? enquiryStartDateFrom.format("YYYY-MM-DD 00:00:00")
        : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo)
        ? enquiryStartDateTo.format("YYYY-MM-DD 23:59:59")
        : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom)
        ? enquiryEndDateFrom.format("YYYY-MM-DD 00:00:00")
        : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo)
        ? enquiryEndDateTo.format("YYYY-MM-DD 23:59:59")
        : undefined,
    };
  }

  render() {
    const { idpValueMap = {}, fetchLoading = false } = this.props;
    const { activeKey } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
    };
    const tableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onChange: this.handleSearch,
    };

    return (
      <PageWrapper loading={fetchLoading}>
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
            <FilterSearch { ...formProps } />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={(
                  <CusExcelExport
                    requestUrl={`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/enquiry-prices/enquiryHisExport`}
                    otherButtonProps={{
                      mini: true,
                      // type: 'primary',
                    }}
                    method="GET"
                    downloadType="Blob"
                    buttonText = {intl.get(`ssrc.resaleRfqHistory.button.priceExport`).d('导出')}
                    queryParams={this.getQueryParams}
                    fileName={
                      `${intl
                        .get(`ssrc.resaleRfqHistory.view.export.resaleRFq`)
                        .d('导出')}` + `${dayjs().format('YYYY-MM-DD')}`
                    }
                  />
                )}
              />
            }
            key="table"
          >
            <DataTable { ...tableProps } />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
