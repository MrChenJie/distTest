/**
 * 供应商基本信息更新 - 列表页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/25
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
const { Panel } = Collapse;
import intl from 'utils/intl';
import ApplyFilterForm from '@/routes/Supplier/components/ApplyFilterForm';
import { Bind } from 'lodash-decorators';
import ApplyListTable from '@/routes/Supplier/components/ApplyListTable';
import { connect } from 'dva';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
import CusModal from '_cus_components/CusModal';
import CusLov from '_cus_components/CusLov';
import notification from 'utils/notification';
import { Row, Col } from 'antd';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';

const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  updateInfoList: supplierHK.updateInfoList || {},
  loading: loading.effects['supplierHK/queryUpdateInfo'],
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser()
}))
export default class UpdateInfoList extends Component {
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
    const { supplierHK: { updateInfoPagination = {} }, dispatch } = this.props;
    this.queryCurrentUserUnit();
    setTimeout(() => {
      this.handleSearch(updateInfoPagination);
    }, 500)
    dispatch({
      type: 'supplierHK/init',
    })
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
          // supplierCategory: 'FINANCIALPAYMENT',
          supplierCategory: '',
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
      type: 'supplierHK/queryUpdateInfo',
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
    const { realName } = currentUser;
    const fieldValues = (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    const { applyDate } = fieldValues;
    return {
      ...fieldValues,
      applyDate: dayjs.isDayjs(applyDate)
        ? applyDate.format("YYYY-MM-DD 00:00:00")
        : undefined,
      salesMan: realName,
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
      type: 'supplierHK/delUpdateInfo',
      payload: {
        selectedRowKeys
      }
    }).then(res => {
      if(res) {
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
        // 采购发起
        if (userUnit?.some(item => ['D0022', 'D0094'].includes(item.unitCode))) {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BMP-CGGYSXXBG&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/purchase-supplier-info?id=${values.supplierId}`)}`);
        }
        // 财务发起
        if (userUnit?.some(item => ['D0091', 'D0021', 'D0238'].includes(item.unitCode))) {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_CWGYSXXBG&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/finance-supplier-info?id=${values.supplierId}`)}`);
        }
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
          type: 'supplierHK/queryPlatformSupplierAccessListCheck',
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
      updateInfoList,
      supplierHK: { updateInfoPagination, enumMap: { unitCode } },
      tenantId,
      dispatch,
      form: { getFieldDecorator },
    } = this.props;
    const {
      activeKey,
      isPub,
      selectedRows,
      visible,
      userUnit,
      supplierCategory
    } = this.state;
    const filterFormProps = {
      onSearch: this.handleSearch,
      tenantId
    };
    const platformListProps = {
      rowKey: 'applyNumber',
      loading: loading,
      pagination: updateInfoPagination,
      dataSource: updateInfoList.content,
      handleTableChange: this.handleSearch,
      rowSelection: {
        onChange: this.handleSelectRows
      },
      onChange: this.handleSearch,
      isPub,
      dispatch,
      userUnit,
      unitCode
    };
    // 列表数据导出
    const dataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier/supplier/baseInfoUpdate/export`,
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
            <ApplyFilterForm
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
                    {(userUnit?.some(item => ['D0021', 'D0022', 'D0094', 'D0091', 'D0238'].includes(item.unitCode)))
                       && (
                      <>
                        <CusButton mini disabled={selectedRows.length === 0} onClick={this.handleDelete}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                        <CusButton mini type="primary" onClick={this.handleOpenNewModal}>{intl.get('hzero.common.view.button.add').d('新建')}</CusButton>
                      </>
                    )}

                  </>
                }
              />
            }
            key="table"
          >
            <ApplyListTable {...platformListProps} />
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
                    })(<CusLov code="HKSP.ACCESS_SUPPLIER_JBGX"
                        onChange={(_, item) => {
                          this.setState({
                            supplierNumber: item?.supplierNumber,
                          })
                        }}
                      queryParams={{ supplierCategory, approvalStatus: 'Approved' }}
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
