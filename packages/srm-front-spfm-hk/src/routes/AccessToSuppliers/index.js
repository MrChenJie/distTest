/**
 * 供应商管理 - 供应商准入列表页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/7
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import './index.less';
import FilterForm from '@/routes/AccessToSuppliers/components/FilterForm';
import { Bind } from 'lodash-decorators';
import ListTable from '@/routes/AccessToSuppliers/components/ListTable';
import { getCurrentOrganizationId, getCurrentUser, createPagination } from 'utils/utils';
import dayjs from 'dayjs';
import InvitationRegisterModal from '@/routes/AccessToSuppliers/components/InvitationRegisterModal';
import InvitationEnrollmentModal from '@/routes/AccessToSuppliers/components/InvitationEnrollmentModal';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import CusNotification from '_cus_components/CusNotification';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';
import uuidv4 from 'uuid/v4';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@connect(({ accessToSupplierHK, loading }) => ({
  accessToSupplierHK,
  platformLoading: loading.effects['accessToSupplierHK/queryPlatformSupplierAccessList'],
  platformList: accessToSupplierHK.platformList || {},
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
  inviteLoading: loading.effects['accessToSupplierHK/inviteStateList'],
  invitationRegisterLoading: loading.effects['accessToSupplierHK/invitationRegister'],
  invitationEnrollmentLoading: loading.effects['accessToSupplierHK/invitationEnrollment'],
}))
@formatterCollections({ code: [prompt] })
@fastCodeLoader([])
export default class Supplier extends Component {
  constructor(props) {
    super(props);
    this.platformFilter = {};
    this.invitationRegisterForm = {};
    this.invitationEnrollmentForm = {};
    this.rowKey = 'supplierId';
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      invitationRegisterVisible: false,
      invitationEnrollmentVisible: false,
      invitationStatusVisible: false,
      unitCode: null,
      pagination: {},
      dataSource: [],
    };
    this.CMHK_SUPPLIER = '/cmhk-supplier';
  }

  componentDidMount() {
    const {
      accessToSupplierHK: { platformPagination = {} },
    } = this.props;
    this.handleSupplierSearch(platformPagination);
    this.queryCurrentUserUnit();
  }

  /**
   * 查询当前登录人部门
   */
  @Bind()
  queryCurrentUserUnit() {
    const {
      dispatch,
      currentUser: { id },
    } = this.props;
    dispatch({
      type: 'accessToSupplierHK/queryUnit',
      payload: {
        userId: id,
      },
    }).then((res) => {
      console.log(res, 'userUnit');
      this.setState({
        unitCode: res,
      });
    });
    dispatch({
      type: 'accessToSupplierHK/init',
    });
  }

  /**
   * 查询供应商列表
   * @param page
   */
  @Bind()
  handleSupplierSearch(page = {}) {
    const { dispatch, tenantId, currentUser } = this.props;
    const { realName } = currentUser;
    const values =
      (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    values.supplierAccessTime =
      values.supplierAccessTime && values.supplierAccessTime.format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'accessToSupplierHK/queryPlatformSupplierAccessList',
      payload: {
        salesMan: realName,
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
    const fieldValues =
      (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    const { supplierAccessTime } = fieldValues;
    return {
      ...fieldValues,
      supplierAccessTime: dayjs.isDayjs(supplierAccessTime)
        ? supplierAccessTime.format('YYYY-MM-DD 00:00:00')
        : undefined,
      salesMan: realName,
    };
  }

  /**
   * 主数据导出报表
   */
  @Bind()
  masterDataExport() {
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/masterDataExport',
      payload: {
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName =
          intl.get(`${prompt}.view.button.export.master.data.fileName`).d('主数据导出报表') +
          `(${dayjs().format('YYYYMMDD')})`;
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
      }
    });
  }

  /**
   * 邀请注册
   */
  @Bind()
  invitationRegister() {
    this.setState({
      invitationRegisterVisible: true,
    });
  }

  /**
   * 邀请登记
   */
  @Bind()
  invitationEnrollment() {
    this.setState({
      invitationEnrollmentVisible: true,
    });
  }

  /**
   * 发送登记邀请
   */
  @Bind()
  sendInvitationEnrollment() {
    this.invitationEnrollmentForm.props.form.validateFields((err, values) => {
      if (!err) {
        let values =
          (this.invitationEnrollmentForm.props &&
            this.invitationEnrollmentForm.props.form.getFieldsValue()) ||
          {};
        values = {
          ...values,
        };
        const { dispatch, tenantId } = this.props;
        dispatch({
          type:
            values.inviteType === 'DICT'
              ? 'accessToSupplierHK/invitationToRegister'
              : 'accessToSupplierHK/invitationEnrollment',
          payload:
            values.inviteType === 'DICT'
              ? {
                  tenantId,
                  ...values,
                }
              : {
                  dto: {
                    tenantId,
                    ...values,
                  },
                },
        }).then((res) => {
          if (res) {
            CusNotification.success();
            this.setState({
              invitationEnrollmentVisible: false,
            });
          }
        });
      }
    });
  }
  /**
   * 发送注册邀请
   */
  @Bind()
  sendInvitation() {
    this.invitationRegisterForm.props.form.validateFields((err, values) => {
      if (!err) {
        let values =
          (this.invitationRegisterForm.props &&
            this.invitationRegisterForm.props.form.getFieldsValue()) ||
          {};
        values = {
          ...values,
          invitedEmail: values.invitedEmail.toLowerCase(),
        };
        const { dispatch, tenantId } = this.props;
        dispatch({
          type: 'accessToSupplierHK/invitationRegister',
          payload: {
            dto: {
              tenantId,
              ...values,
            },
          },
        }).then((res) => {
          if (res) {
            CusNotification.success();
            this.setState({
              invitationRegisterVisible: false,
            });
          }
        });
      }
    });
  }

  @Bind()
  handleNewSupplier() {
    const { isPub } = this.state;
    window.open(`/pub/spfm-hk/supplier/add-admittance`);
  }

  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        dispatch({
          type: 'accessToSupplierHK/deleteSupplier',
          payload: {
            ids: selectedRowKeys,
          },
        }).then((res) => {
          if (res?.failed === true) {
            CusNotification.error({
              message: res.message,
            });
            this.handleSupplierSearch();
          } else {
            CusNotification.success({
              message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
            });
            this.handleSupplierSearch();
          }
        });
      },
    });
  }

  /**
   * 手动登记
   */
  @Bind()
  addNewSupplier() {
    this.invitationEnrollmentForm.props.form.validateFields((err, values) => {
      if (!err) {
        let values =
          (this.invitationEnrollmentForm.props &&
            this.invitationEnrollmentForm.props.form.getFieldsValue()) ||
          {};
        let newState = this.invitationEnrollmentForm.state;
        console.log(values);
        if (values?.dictPartnerId) {
          window.open(
            `/pub/spfm-hk/supplier/add-admittance?supId=${newState.id}&companyName=${values?.supName}&BRNum=${newState?.BRNum}&partnerId=${values?.dictPartnerId}`
          );
        } else {
          window.open(
            `/pub/spfm-hk/supplier/add-admittance?supId=${newState.id}&companyName=${values?.supName}&BRNum=${newState?.BRNum}`
          );
        }
      }
    });
  }

  @Bind()
  handleInvite(page = {}) {
    this.setState({
      invitationStatusVisible: true,
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/inviteStateList',
      payload: {
        // ids: selectedRowKeys
        page,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        this.setState({
          dataSource: content.map((item) => ({
            ...item,
            rowKey: uuidv4(),
            _status: 'update',
          })),
          pagination,
        });
      }
    });
  }

  render() {
    const {
      platformLoading,
      platformList,
      accessToSupplierHK: { platformPagination, enumMap },
      tenantId,
      dispatch,
      inviteLoading = false,
      invitationRegisterLoading = false,
      invitationEnrollmentLoading = false,
    } = this.props;
    const { inviteType = [] } = enumMap;
    const {
      activeKey,
      invitationRegisterVisible,
      invitationEnrollmentVisible,
      isPub,
      unitCode,
      invitationStatusVisible,
      dataSource = [],
      pagination = {},
    } = this.state;
    const filterFormProps = {
      onSearch: this.handleSupplierSearch,
    };
    const platformListProps = {
      rowKey: 'supplierId',
      loading: platformLoading,
      pagination: platformPagination,
      dataSource: platformList.content,
      handleTableChange: this.handleSupplierSearch,
      rowSelection: {
        onChange: this.handleSelectRows,
      },
      onChange: this.handleSupplierSearch,
      isPub,
      dispatch,
    };
    const supplierDataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier/supplier/search/listExport`,
      method: 'GET',
      downloadType: 'Blob',
      buttonText: intl.get(`${prompt}.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`${prompt}.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams,
    };
    const columns = [
      {
        title: intl.get(`${prompt}.field.invite.company`).d('邀请公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`${prompt}.field.login.status`).d('登入状态'),
        dataIndex: 'inviteStateMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prompt}.field.invitecom.email`).d('邀请公司邮箱'),
        dataIndex: 'email',
        width: 150,
      },
      {
        title: intl.get(`${prompt}.field.invite.date`).d('邀请日期'),
        dataIndex: 'inviteDate',
        width: 100,
      },
    ];

    const unitCodes = (unitCode || [])
      .map((item) => {
        // 从 unitCode 数组中的每个 unitCode 查找对应的 tag
        const tag = enumMap?.unitCode?.find((n) => n.value === item.unitCode)?.tag;
        // 根据找到的 tag 筛选 enumMap 中所有匹配的 unitCode 项
        return enumMap?.unitCode
          ?.filter((i) => i.tag === tag)
          ?.map((i) => i.value)
          ?.join(',');
      })
      ?.join(',');
    const isFinance = (unitCode || []).some((item) => {
      const tag = enumMap?.unitCode?.find((n) => n.value === item.unitCode)?.tag;
      return tag === 'finance'; // 如果 tag 是 'finance' 返回 true
    });

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
              onRef={(ref) => {
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
                    <CusButton mini onClick={this.handleInvite}>
                      {intl.get(`${prompt}.button.invitestatus`).d('邀请状态')}
                    </CusButton>
                    <CusButton mini onClick={this.handleDelete}>
                      {intl.get('hzero.common.view.button.delete').d('删除')}
                    </CusButton>
                    {!isFinance && (
                      <CusButton mini onClick={this.invitationRegister}>
                        {intl.get(`${prompt}.view.button.invitation.register`).d('邀请注册')}
                      </CusButton>
                    )}
                    {!isFinance && (
                      <CusButton mini onClick={this.invitationEnrollment}>
                        {intl.get(`hzero.common.button.register.invite`).d('邀请登记')}
                      </CusButton>
                    )}
                    <CusButton mini onClick={this.masterDataExport}>
                      {intl.get(`${prompt}.view.button.master.data.export`).d('主数据导出')}
                    </CusButton>
                    <CusExcelExport mini {...supplierDataExportProps} />
                    <CusButton mini type="primary" onClick={this.handleNewSupplier}>
                      {intl.get('hzero.common.view.button.add').d('新建')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...platformListProps} />
          </Panel>
        </Collapse>

        {/* 邀请注册Modal */}
        {invitationRegisterVisible && (
          <CusModal
            title={intl
              .get(`${prompt}.view.button.inviting.suppliers.to.register`)
              .d('邀请供应商注册')}
            visible={invitationRegisterVisible}
            destroyOnClose
            width={600}
            confirmLoading={invitationRegisterLoading}
            onCancel={() => this.setState({ invitationRegisterVisible: false })}
            onOk={this.sendInvitation}
            okText={intl.get(`${prompt}.view.button.send.invitation`).d('发送邀请')}
          >
            <InvitationRegisterModal
              onRef={(ref) => {
                this.invitationRegisterForm = ref;
              }}
              tenantId={tenantId}
              unitCodes={unitCodes}
              dispatch
            />
          </CusModal>
        )}
        {/* 邀请登记Modal */}
        {invitationEnrollmentVisible && (
          <CusModal
            title={intl.get(`hzero.common.titile.invite.supregister`).d('邀请供应商登记')}
            visible={invitationEnrollmentVisible}
            destroyOnClose
            width={600}
            confirmLoading={invitationEnrollmentLoading}
            onCancel={() => this.setState({ invitationEnrollmentVisible: false })}
            onOk={this.sendInvitationEnrollment}
            okText={intl.get(`${prompt}.view.button.send.invitation`).d('发送邀请')}
            footer={[
              <CusButton
                key="cancel"
                onClick={() => this.setState({ invitationEnrollmentVisible: false })}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>,
              <CusButton type="primary" onClick={this.addNewSupplier}>
                {intl.get(`hzero.common.button.register.new`).d('手工登记')}
              </CusButton>,
              <CusButton
                type="primary"
                loading={invitationEnrollmentLoading}
                onClick={this.sendInvitationEnrollment}
              >
                {intl.get(`${prompt}.view.button.send.invitation`).d('发送邀请')}
              </CusButton>,
            ]}
          >
            <InvitationEnrollmentModal
              onRef={(ref) => {
                this.invitationEnrollmentForm = ref;
              }}
              invitationEnrollmentForm={this.invitationEnrollmentForm}
              tenantId={tenantId}
              unitCodes={unitCodes}
              dispatch
              inviteType={inviteType}
            />
          </CusModal>
        )}
        {
          <CusModal
            title={intl.get(`${prompt}.view.invitestatus.inqury`).d('邀请状态查询')}
            visible={invitationStatusVisible}
            destroyOnClose
            width={800}
            onCancel={() => this.setState({ invitationStatusVisible: false })}
            cancelText={intl.get('hzero.common.button.close').d('关闭')}
            // onOk={this.sendInvitation}
          >
            <CusTable
              bordered
              loading={inviteLoading}
              pagination={pagination}
              columns={columns}
              dataSource={dataSource}
              // rowSelection={rowSelection}
              scroll={{ x: tableScrollWidth(columns) }}
              onChange={this.handleInvite}
              rowKey="rowKey"
            />
          </CusModal>
        }
      </PageWrapper>
    );
  }
}
