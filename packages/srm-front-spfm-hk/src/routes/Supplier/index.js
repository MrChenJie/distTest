/**
 * 供应商管理 - 供应商列表页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/7
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import './index.less';
import FilterForm from '@/routes/Supplier/components/FilterForm';
import { Bind } from 'lodash-decorators';
import ListTable from '@/routes/Supplier/components/ListTable';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  platformLoading: loading.effects['supplierHK/queryPlatformSupplierAccessList'],
  platformList: supplierHK.platformList || {},
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser()
}))
@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
export default class Supplier extends Component {
  constructor(props) {
    super(props);
    this.queryPageSize = 10;
    this.platformFilter = {};
    this.invitationRegisterForm = {};
    this.rowKey = 'supplierId';
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      invitationRegisterVisible: false,
      userUnit: null,
      loading: false
    };
    this.CMHK_SUPPLIER = '/cmhk-supplier';
  }

  componentDidMount() {
    const { supplierHK: { platformPagination = {} }, } = this.props;
    this.handleSupplierSearch(platformPagination);
    this.queryCurrentUserUnit();
  }

  /**
   * 查询当前登录人部门
   */
  @Bind()
  queryCurrentUserUnit() {
    const { dispatch, currentUser: { id } } = this.props;
    dispatch({
      type: 'supplierHK/queryUnit',
      payload: {
        userId: id,
      }
    }).then(res => {
      this.setState({
        userUnit: res?.userUnit
      })
    })
  }

  /**
   * 查询供应商列表
   * @param page
   */
  @Bind()
  handleSupplierSearch(page = {}) {
    const { dispatch, tenantId, currentUser } = this.props;
    const values = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    values.supplierAccessTime = values.supplierAccessTime && values.supplierAccessTime.format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'supplierHK/queryPlatformSupplierAccessList',
      payload: {
        tenantId,
        page,
        ...values,
      },
    });
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
    const { supplierAccessTime } = fieldValues;
    return {
      ...fieldValues,
      supplierAccessTime: dayjs.isDayjs(supplierAccessTime)
        ? supplierAccessTime.format("YYYY-MM-DD 00:00:00")
        : undefined,
    }
  }

  /**
   * 主数据导出报表
   */
  @Bind()
  masterDataExport() {
    const { dispatch } = this.props;
    this.setState({
      loading: true
    })
    dispatch({
      type: 'supplierHK/masterDataExport',
      payload: {
        ...this.getQueryParams(),
      }
    }).then(res => {
      if(res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.view.export.master.data.fileName`).d('主数据导出报表') + `(${dayjs().format('YYYYMMDD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.setState({
          loading: false
        })
      } else {
        this.setState({
          loading: false
        })
      }
    })
  }

  render() {
    const {
      platformLoading,
      platformList,
      supplierHK: { platformPagination },
      tenantId,
      dispatch
    } = this.props;
    const {
      activeKey,
      isPub,
      userUnit,
      loading
    } = this.state;
    const filterFormProps = {
      onSearch: this.handleSupplierSearch,
      tenantId
    };
    const platformListProps = {
      rowKey: 'supplierId',
      loading: platformLoading,
      pagination: platformPagination,
      dataSource: platformList.content,
      handleTableChange: this.handleSupplierSearch,
      rowSelection: {
        onChange: this.handleSelectRows
      },
      onChange: this.handleSupplierSearch,
      isPub,
      dispatch,
      userUnit
    };
    const supplierDataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier/supplier/search/listExport`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`${prompt}.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`${prompt}.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams
    };
    return (
      <PageWrapper loading={platformLoading}>
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
                this.platformFilter = ref;
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
                    <CusExcelExport mini {...supplierDataExportProps} />
                    <CusButton loading={loading} mini type="primary" onClick={this.masterDataExport}>{intl.get(`${prompt}.view.button.master.data.export`).d('主数据导出')}</CusButton>
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
