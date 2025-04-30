/**
 * 供应商管理 - 黑名单列表
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/9
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Col, Collapse, Row } from 'antd';
import intl from 'utils/intl';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Bind } from 'lodash-decorators';
import ListTable from '@/routes/Blacklist/components/ListTable';
import { getCurrentOrganizationId } from 'utils/utils';
import FilterForm from '@/routes/Blacklist/components/FilterForm';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import CusLov from '_cus_components/CusLov';
import CusModal from '_cus_components/CusModal';
import notification from 'utils/notification';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  blackInfoList: supplierHK.blackInfoList || {},
  loading: loading.effects['supplierHK/queryBlackList'],
  tenantId: getCurrentOrganizationId(),
}))

export default class Blacklist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
    };
    this.platformFilter = {};
    this.CMHK_SUPPLIER = '/cmhk-supplier';
  }

  componentDidMount() {
    const { supplierHK: { platformPagination = {} }, dispatch } = this.props;
    this.handleSearch(platformPagination);
  }

  /**
   * 新增信息变更
   */
  @Bind()
  handleOpenNewModal() {
    this.setState({
      visible: true
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
   * 查询黑名单列表
   * @param page
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    values.applyDate = values.applyDate && values.applyDate.format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'supplierHK/queryBlackList',
      payload: {
        tenantId,
        page,
        ...values,
      },
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

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'supplierHK/delBlackListInfo',
      payload: {
        selectedRowKeys
      }
    }).then(res => {
      notification.success();
      this.handleSearch();
    })
  }

  /**
   * 新增黑名单
   */
  @Bind()
  newBlack() {
    const { form, dispatch } = this.props;
    const { isPub } = this.state;
    form.validateFields((err, values) => {
      if(!err) {
        this.setState({
          visible: false
        });
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM-HGGYS-HMDGYS&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/edit-blacklist?id=${values.supplierId}`)}`);
        // window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/blacklist-new?id=${values.supplierId}`)
      }
    })
  }


  render() {
    const {
      loading,
      blackInfoList,
      supplierHK: { blackInfoListPagination },
      tenantId,
      dispatch,
      form: { getFieldDecorator }
    } = this.props;
    const {
      activeKey,
      isPub,
      visible,
      selectedRows
    }  = this.state;
    const filterFormProps = {
      onSearch: this.handleSearch,
      tenantId
    };
    const platformListProps = {
      rowKey: 'applyNumber',
      loading: loading,
      pagination: blackInfoListPagination,
      dataSource: blackInfoList?.content,
      handleTableChange: this.handleSearch,
      rowSelection: {
        onChange: this.handleSelectRows
      },
      onChange: this.handleSearch,
      isPub,
      dispatch
    };
    // 列表数据导出
    const dataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier/supplier/blackList/export`,
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
                    <CusExcelExport mini {...dataExportProps} />
                    <CusButton mini disabled={selectedRows.length === 0} onClick={this.handleDelete}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                    <CusButton mini type="primary" onClick={this.handleOpenNewModal}>{intl.get('hzero.common.view.button.add').d('新建')}</CusButton>
                  </>
                }
              />
            }
            key="form"
          >
            <ListTable {...platformListProps}/>
          </Panel>
        </Collapse>
        <CusModal
          title={intl.get(`${prompt}.field.SelectSupplier`).d('选择供应商')}
          visible={visible}
          destroyOnClose
          width={600}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.newBlack}
        >
          <div className="customize-form">
            <Form>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label={intl.get(`${prompt}.field.Supplier`).d('供应商')}>
                    {getFieldDecorator('supplierId', {
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.Supplier`).d('供应商'),
                        }),
                      }]
                    })(<CusLov code="HKSP.ACCESS_SUPPLIER_BLACK"
                               queryParams={{ approvalStatus: 'Approved' }}
                    />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </CusModal>
      </PageWrapper>
    );
  }
}
