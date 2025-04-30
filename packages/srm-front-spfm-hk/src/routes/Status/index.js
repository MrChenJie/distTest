/**
 * 状态更新记录 - 列表
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/19
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Collapse } from 'antd';
import { connect } from 'dva';
import intl from 'utils/intl';
import FilterForm from '@/routes/Status/components/FilterForm';
import { Bind } from 'lodash-decorators';
import ListTable from '@/routes/Status/components/ListTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@connect(({ loading, status}) => ({
  status,
  statusList: status.statusList || {},
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
  loading: loading.effects['status/queryStatusList'],
}))
@formatterCollections({ code: [prompt] })
export default class Status extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
    };
    this.platformFilter = {};
    this.queryPageSize = 10;
    this.CMHK_SUPPLIER = '/cmhk-supplier';
  }

  componentDidMount() {
    const { status: { statusListPagination = {} }, } = this.props;
    this.handleStatusSearch(statusListPagination);
  }

  /**
   * 查询状态记录列表
   * @param page
   */
  @Bind()
  handleStatusSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    values.applyDate = values.applyDate && values.applyDate.format(DEFAULT_DATETIME_FORMAT)
    dispatch({
      type: 'status/queryStatusList',
      payload: {
        tenantId,
        page,
        ...values
      }
    })
  }

  /**
   * 列表选择数据
   * @param selectedRowKeys
   * @param selectedRows
   */
  @Bind()
  handleSelectRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldValues = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    const { applyDate } = fieldValues;
    return {
      ...fieldValues,
      applyDate: dayjs.isDayjs(applyDate)
        ? applyDate.format("YYYY-MM-DD 00:00:00")
        : undefined,
    }
  }

  render() {
    const {
      dispatch,
      tenantId,
      statusList,
      loading
    } = this.props;
    const { activeKey, isPub } = this.state;
    const filterFormProps = {
      onSearch: this.handleStatusSearch,
    };
    const platformListProps = {
      rowKey: 'id',
      loading,
      dataSource: statusList?.content || [],
      rowSelection: {
        onChange: this.handleSelectRows
      },
      isPub,
      dispatch
    }
    const listDataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier-auto-update/list/export`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`${prompt}.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`${prompt}.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams
    };
    return (
      <PageWrapper>
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
            <FilterForm
              onRef={ref => {
                this.platformFilter = ref
              }}
              {...filterFormProps}
            />
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
                    <CusExcelExport type="primary" mini {...listDataExportProps} />
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...platformListProps}/>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
