/**
 * 供应商财务信息 - 列表页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/19
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Col, Collapse, Row } from 'antd';
import intl from 'utils/intl';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import './index.less';
import FilterForm from '@/routes/Finance/components/FilterForm';
import { Bind } from 'lodash-decorators';
import ListTable from '@/routes/Finance/components/ListTable';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import dayjs from 'dayjs';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusModal from '_cus_components/CusModal';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  financeUpdateInfoList: supplierHK.financeUpdateInfoList || {},
  loading: loading.effects['supplierHK/queryFinanceUpdateInfo'],
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser()
}))
export default class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      userUnit: null,
      supplierCategory: null,
      supplierNumber: null,
    };
    this.platformFilter = {};
    this.CMHK_SUPPLIER = '/cmhk-supplier';
  }

  componentDidMount() {
    const { supplierHK: { financeUpdateInfoPagination = {} }, dispatch } = this.props;
    this.queryCurrentUserUnit();
    this.handleSearch(financeUpdateInfoPagination);
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
        userUnit: res
      });
      if (res?.some(item => ['D0091', 'D0021', 'D0238'].includes(item.unitCode))) {
        this.setState({
          supplierCategory: 'FINANCIALPAYMENT',
        });
      } else if (res?.some(item => ['D0022', 'D0094'].includes(item.unitCode))) {
        this.setState({
          supplierCategory: 'ICT',
        });
      } else {
        this.setState({
          supplierCategory: null
        });
      }
    })
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    values.applyDate = values.applyDate && values.applyDate.format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'supplierHK/queryFinanceUpdateInfo',
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
    const { currentUser } = this.props;
    const { loginName } = currentUser;
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
   * 新增信息变更
   */
  @Bind()
  handleOpenNewModal() {
    this.setState({
      visible: true
    })
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'supplierHK/delFinanceUpdateInfo',
      payload: {
        selectedRowKeys
      }
    }).then(res => {
      if (res) {
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
        });
        this.handleSearch();
      }
    })
  }

  /**
   * 新增供应商信息
   */
  @Bind()
  newSupplierInfo() {
    const { form, dispatch } = this.props;
    const { userUnit, isPub } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          visible: false
        });
        // window.open(`/pub/spfm-hk/supplier/finance-draft?id=${values.supplierId}`);
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BMP-GYSCWXXBG&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/finance-draft?id=${values.supplierId}`)}`);
      }
    })
  }

  // 校验是否能新增
  @Bind
  checkAdd(page = {}) {
    const { form, tenantId, dispatch } = this.props;
    form.validateFields((err, values) => {
      console.log('values', values)
      if (!err) {
        dispatch({
          type: 'supplierHK/queryFinanceUpdateInfoCheck',
          payload: {
            tenantId,
            page,
            supplierNumber: this.state?.supplierNumber
          },
        }).then(res=> {
          if(res) {
            const { content = [] } = res
            const checkList = content?.filter((item) => item.applyStatus != 'Approved')
            console.log(checkList)
            if(checkList.length == 0) {
              this.newSupplierInfo()
            } else {
              CusNotification.error({
                message: intl.get('spfmhk.supplier.view.inprocess.check').d('当前供应商存在发起流程，请完成后重新发起'),
              });
            }
          }
        });
      }
    })
  }

  render() {
    const {
      loading,
      financeUpdateInfoList,
      supplierHK: { financeUpdateInfoPagination },
      tenantId,
      dispatch,
      form: { getFieldDecorator },
    } = this.props;
    const {
      activeKey,
      isPub,
      selectedRows,
      visible,
    } = this.state;
    const filterFormProps = {
      onSearch: this.handleSearch,
      tenantId
    };
    const platformListProps = {
      rowKey: 'applyNumber',
      loading: loading,
      pagination: financeUpdateInfoPagination,
      dataSource: financeUpdateInfoList?.content || [],
      handleTableChange: this.handleSearch,
      rowSelection: {
        onChange: this.handleSelectRows
      },
      onChange: this.handleSearch,
      isPub,
      dispatch,
    };
    // 列表数据导出
    const dataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier/supplier/financeInfoUpdate/export`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`${prompt}.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`${prompt}.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams
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
            key="table"
          >
            <ListTable {...platformListProps} />
          </Panel>
        </Collapse>
        <CusModal
          title={intl.get(`${prompt}.field.SelectSupplier`).d('选择供应商')}
          visible={visible}
          destroyOnClose
          width={600}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.checkAdd}
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
                    })(<CusLov code="HKSP.ACCESS_SUPPLIER"
                      onChange={(_, item) => {
                        this.setState({
                          supplierNumber: item?.supplierNumber,
                        })
                      }}
                      queryParams={{ approvalStatus: 'Approved' }}
                    />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </CusModal>
      </PageWrapper>
    )
  }
}
