/**
 * 供应商准入 - 新增页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/8
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import EditTable from '_cus_components/EditTable';
import CusTable from '_cus_components/CusTable';
import BasicInfoForm from '@/routes/AccessToSuppliers/components/BasicInfoForm';
import uuid from 'uuid/v4';
import { Checkbox, Form, message } from 'hzero-ui';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import queryString from 'querystring';
import notification from 'utils/notification';
import querystring from 'querystring';
import { EMAIL } from 'utils/regExp';

import './index.less';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import dayjs from 'dayjs';
import { head } from 'lodash';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ accessToSupplierHK }) => ({
  accessToSupplierHK,
  supplierCheckData: accessToSupplierHK.supplierCheckData || {},
  tenantId: getCurrentOrganizationId(),
  enumMap: accessToSupplierHK.enumMap,
  currentUser: getCurrentUser(),
}))
export default class AddAdmittance extends Component {
  messagesEnd: null;
  constructor(props) {
    super(props);
    const { supId, companyName, BRNum, partnerId } = querystring.parse(
      props.location.search.substr(1)
    );
    this.state = {
      activeKey: ['basic', 'contact', 'clientInformation', 'supplier'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [
        {
          id: uuid(),
          _status: 'create',
          type: 'MANAGEMENTPERSON',
          name: undefined,
          phone: undefined,
          email: undefined,
          isDefault: 'N',
        },
        {
          id: uuid(),
          _status: 'create',
          type: 'SALESPERSON',
          name: undefined,
          phone: undefined,
          email: undefined,
          isDefault: 'N',
        },
        {
          id: uuid(),
          _status: 'create',
          type: 'DELIVERYPERSON',
          name: undefined,
          phone: undefined,
          email: undefined,
          isDefault: 'N',
        },
        {
          id: uuid(),
          _status: 'create',
          type: 'PAYMENTPERSON',
          name: undefined,
          phone: undefined,
          email: undefined,
          isDefault: 'N',
        },
      ], // 联系人Table data
      clientTableDataSource: [], // 客户信息Table data
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
      supplierDataSource: [],
      disabled: true,
      supplierId: null,
      loading: false,
      supplierCategory: undefined,
      financeDisabled: false,
      supId,
      companyName,
      BRNum,
      partnerId,
    };
    console.log('companyName', companyName);
    this.platform = {};
  }
  componentDidMount() {
    this.init();
  }

  @Bind()
  async init() {
    const { partnerId } = this.state;
    const { dispatch } = this.props;
    await dispatch({
      type: 'accessToSupplierHK/init',
    });
    await this.queryCurrentUserUnit();
    if (partnerId) {
      await this.queryBasicInfo();
    }
  }

  /**
   * 新增准入
   */
  @Bind()
  handleSave() {
    const { dispatch, tenantId } = this.props;
    const { contactPersonDataSource, supplierId, isPub, supId } = this.state;
    this.platform.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        if (contactPersonDataSource.length === 0) {
          notification.error({
            message: intl.get(`${prompt}.form.validateFields.contacts`).d('联系人必须要填写一行'),
          });
          return false;
        }
        if (contactPersonDataSource.length > 0) {
          const defaultContact = contactPersonDataSource.filter((i) => i.isDefault === 'Y');
          if (defaultContact.length === 0) {
            notification.error({
              message: intl
                .get(`${prompt}.form.validateFields.contacts.default`)
                .d('至少需要维护一条默认联系人'),
            });
            return false;
          }
        }
        this.setState({
          loading: true,
        });
        let basicInfoParams = {
          salesman: values.salesman,
          companyNameEn: values.companyNameEn,
          companyNameCh: values.companyNameCh,
          addressEn: values.addressEn,
          addressCh: values.addressCh,
          phoneNumber: values.phoneNumber,
          fax: values.fax,
          email: values.email,
          companyWebsite: values.companyWebsite,
          companyType: values.companyType,
          product: values.product,
          companyClasses: values.companyClasses,
          professional: values.professional,
          supplierCategory: values.supplierCategory,
          supplierProductClass: values.supplierProductClass,
          foundAddress: values.foundAddress,
          foundDate: dayjs.isDayjs(values.foundDate)
            ? values.foundDate.format('YYYY-MM-DD 00:00:00')
            : undefined,
          registrationNumber: values.registrationNumber,
          country: values.country,
          orderMoneyType: values.orderMoneyType,
          prompt: values.prompt,
          paymentMethod: values.paymentMethod,
          deliveryClause: values.deliveryClause,
          id: supplierId,
        };
        if (supId) basicInfoParams = { ...basicInfoParams, refUserId: parseInt(supId) };
        const contactsAddDto = contactPersonDataSource.map((i) => {
          return {
            type: i.type,
            name: i.name,
            phone: i.phone,
            email: i.email,
            isDefault: i.isDefault,
            tenantId: tenantId,
          };
        });
        dispatch({
          type: 'accessToSupplierHK/supplierInfoDataSave',
          payload: {
            dto: {
              head: supplierId ? { ...basicInfoParams, id: supplierId } : { ...basicInfoParams },
              contact: [...contactsAddDto],
            },
          },
        }).then((res) => {
          if (res) {
            this.setState({
              disabled: false,
              supplierId: res.head.id,
              loading: false,
            });

            dispatch(
              routerRedux.push({
                pathname: `${isPub ? '/pub' : ''}/spfm-hk/supplier/edit-admittance`,
                search: querystring.stringify({
                  supplierId: res.head.id,
                  approvalStatus: 'Draft',
                }),
              })
            );
          } else {
            this.setState({
              loading: false,
            });
          }
        });
      }
    });
  }

  /**
   * 设置唯一默认联系人
   * @param val
   * @param record
   */
  @Bind()
  setDefaultContact(val, record) {
    const { contactPersonDataSource } = this.state;
    record.isDefault = val.target.checked;
    const arr = contactPersonDataSource.map((i) => {
      if (i.id !== record.id) {
        return {
          ...i,
          isDefault: 'N',
        };
      } else {
        return i;
      }
    });
    this.setState({
      contactPersonDataSource: arr,
    });
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    return [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 200,
        required: true,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('type', {
                initialValue: record.type,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  onChange={(e) => (record.type = e)}
                  placeholder={intl.get(`${prompt}.field.placeholder.select.type`).d('请选择类型')}
                  lovCode="HKSP.CONTACT_TYPE"
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
        required: true,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('name', {
                initialValue: record.name,
              })(
                <CusInput
                  onChange={(e) => (record.name = e)}
                  placeholder={intl
                    .get(`${prompt}.field.placeholder.contact.name`)
                    .d('请输入联系姓名')}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
        required: true,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`phone`, {
                initialValue: record.phone,
              })(<CusInput onChange={(e) => (record.phone = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
        required: true,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`email`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput onChange={(e) => (record.email = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        align: 'left',
        width: 200,
        required: true,
        render: (values, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault`, {
                initialValue: record.isDefault,
              })(
                <Checkbox
                  checked={record.isDefault === 'Y'}
                  checkedValue="Y"
                  unCheckedValue="N"
                  onChange={(e) => this.setDefaultContact(e, record)}
                />
              )}
            </Form.Item>
          );
        },
      },
    ];
  }

  // 新增一行联系人信息
  @Bind()
  handleAddContactPersonData() {
    const { contactPersonDataSource } = this.state;
    this.setState({
      contactPersonDataSource: [
        ...contactPersonDataSource,
        {
          id: uuid(),
          _status: 'create',
          type: undefined,
          name: undefined,
          phone: undefined,
          email: undefined,
          isDefault: 'N',
        },
      ],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactPersonData() {
    const { contactPersonDataSource = [], contactPersonSelectedRows = [] } = this.state;
    this.setState({
      contactPersonDataSource: contactPersonDataSource.filter((r) =>
        contactPersonSelectedRows.every((rd) => rd.id !== r.id)
      ),
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
    });
  }

  // 联系人信息表格checkBox
  @Bind()
  handleContactPersonRowSelectionChange(keys, rows) {
    this.setState({
      contactPersonSelectedRowKeys: keys,
      contactPersonSelectedRows: rows,
    });
  }

  // 供应商查重表格
  @Bind()
  supplierColumns() {
    return [
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        render: (value, record) => {
          return (
            <a
              onClick={() => {
                this.pushRouterByApprovalStatus(record);
              }}
            >
              {intl.get(`${prompt}.table.field.details`).d('详情')}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.supplier.name.en`).d('供应商英文名称'),
        dataIndex: 'companyNameEn',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.supplier.name.cn`).d('供应商中文名称'),
        dataIndex: 'companyNameCh',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.country`).d('国家'),
        dataIndex: 'country',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.address.cn`).d('地址（中文）'),
        dataIndex: 'addressCh',
        width: 200,
      },
      {
        title: intl
          .get(`${prompt}.table.commercial.registration.certificate.num`)
          .d('商业登记证号码'),
        dataIndex: 'registrationNumber',
        width: 200,
      },
    ];
  }

  /**
   * 供应商准入
   */
  @Bind()
  accessToSupplier() {
    const { dispatch } = this.props;
    const { supplierId, isPub } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/spfm-hk/supplier/admittance-detail`,
        search: queryString.stringify({
          supplierId,
        }),
      })
    );
  }

  @Bind()
  scrollToBottom() {
    if (this.messagesEnd) {
      const scrollHeight = this.messagesEnd.scrollHeight;
      const height = this.messagesEnd.clientHeight;
      const maxScrollTop = scrollHeight - height;
      this.messagesEnd.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }

  /**
   * 供应商查重
   */
  @Bind()
  supplierCheckResult(page = {}) {
    const { dispatch } = this.props;
    const { supplierId } = this.state;
    const { getFieldValue } = this.platform.props.form;
    dispatch({
      type: 'accessToSupplierHK/supplierCheck',
      payload: {
        companyNameCh: getFieldValue('companyNameCh') ? getFieldValue('companyNameCh') : undefined,
        companyNameEn: getFieldValue('companyNameEn') ? getFieldValue('companyNameEn') : undefined,
        id: supplierId,
        page,
      },
    }).then((res) => {
      if (res?.content?.length > 0) {
        this.scrollToBottom();
        message.info(
          intl
            .get(`${prompt}.field.supplier.check.tips`)
            .d('供应商可能重复录入，请滚动条拉至底端进行确认。')
        );
      }
    });
  }

  /**
   * 根据单据状态区分跳转页面
   * @param record
   */
  @Bind()
  pushRouterByApprovalStatus(record) {
    const { isPub, dispatch, userUnit } = this.props;
    const {
      id,
      supplierNumber,
      approvalStatus,
      supplierCategory,
      caseId,
      accessSource,
      createdBy,
    } = record;
    if (accessSource === 'portal') {
      window.open(`/pub/spfm-hk/supplier/PRSA-infomation-portal/manager?createdBy=${createdBy}`);
    } else {
      // 审批状态草稿单跳转编辑页面
      if (approvalStatus === 'Draft') {
        window.open(
          `/pub/spfm-hk/supplier/edit-admittance?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(
            approvalStatus
          )}`
        );
      }
      // 审批中根据审批状态和供应商类别跳转待办页
      if (approvalStatus === 'Inapproval') {
        window.open(
          `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`
        );
      }
      // 已审批跳转预览页
      if (approvalStatus === 'Approved' && supplierCategory === 'FINANCIALPAYMENT') {
        window.open(
          `/pub/spfm-hk/supplier/finance-approved?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(
            approvalStatus
          )}`
        );
      }
      if (approvalStatus === 'Approved' && supplierCategory !== 'FINANCIALPAYMENT') {
        window.open(
          `/pub/spfm-hk/supplier/purchase-approved?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(
            approvalStatus
          )}`
        );
      }
    }
  }

  /**
   * 公司名称查重
   */
  @Bind()
  checkSupplierName(e) {
    const { dispatch } = this.props;
    const { supplierId } = this.state;
    if (e.target.value) {
      dispatch({
        type: 'accessToSupplierHK/checkSupplierName',
        payload: {
          supplierName: e.target.value,
          id: supplierId,
        },
      }).then((res) => {
        if (!res) {
          notification.info({
            message: '已存在相同的数据',
          });
        }
      });
    }
  }

  /**
   * 商业登记证号码查重
   */
  @Bind()
  checkRegistrationNumber(e) {
    const { dispatch } = this.props;
    const { supplierId } = this.state;
    if (e.target.value) {
      dispatch({
        type: 'accessToSupplierHK/checkRegistrationNumber',
        payload: {
          registrationNumber: e.target.value,
          id: supplierId,
        },
      }).then((res) => {
        if (!res) {
          notification.info({
            message: '已存在相同的数据',
          });
        }
      });
    }
  }

  /**
   * 查询当前登录人部门
   */
  @Bind()
  queryCurrentUserUnit() {
    const {
      dispatch,
      currentUser: { id },
      enumMap,
    } = this.props;
    const financeCode = enumMap?.unitCode?.filter((i) => i.tag === 'finance') || [];
    dispatch({
      type: 'accessToSupplierHK/queryUnit',
      payload: {
        userId: id,
      },
    }).then((res) => {
      if (res?.some((item) => financeCode.findIndex((n) => n.value === item.unitCode) > -1)) {
        this.setState({
          supplierCategory: 'FINANCIALPAYMENT',
          financeDisabled: true,
        });
      }
    });
  }

  /**
   * 查询基本信息
   */
  @Bind()
  queryBasicInfo() {
    const { partnerId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/queryBasicInfo',
      payload: {
        partnerId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          head: {
            salesman: res.salesman,
            companyNameEn: res.cmpanyNameEn,
            companyNameCh: res.cmpanyNameCh,
            addressEn: res.addressEn,
            addressCh: res.addressCh,
            phoneNumber: res.phone,
            fax: res.fax,
            email: res.email,
            companyWebsite: res.websiteUrl,
            companyType: res.companyType,
            product: res.supplyOf,
            companyClasses: res.companyCategory,
            professional: res.businessNature,
            supplierCategory: null,
            supplierProductClass: null,
            foundAddress: res.establishmentPlaceMeaning,
            foundDate: res.establishmentDate ? dayjs(res.establishmentDate) : undefined,
            registrationNumber: res.businessRegistration,
            // 财务信息
            country: null,
            orderMoneyType: null,
            prompt: null,
            paymentMethod: null,
            deliveryClause: null,
          },
        });
        this.queryContactsInfo();
      }
    });
  }
  /**
   * 查询联系人信息
   */
  @Bind()
  queryContactsInfo() {
    const { partnerId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/queryContactsInfo',
      payload: {
        partnerId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          contactPersonDataSource: res.content.map((item) => {
            return {
              id: uuid(),
              _status: 'create',
              type: item.contactType,
              name: item.contactName,
              phone: item.contactPhone,
              email: item.contactEmail,
              isDefault: item.defaultContact,
            };
          }),
        });
        this.queryConvertSupplierInfo();
      }
    });
  }
  /**
   * 查询财务信息
   */
  @Bind()
  queryConvertSupplierInfo() {
    const { partnerId, head } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/queryConvertSupplierInfo',
      payload: {
        partnerId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          head: {
            ...head,
            // 财务信息
            country: res.country,
            countryMeaning: res.countryMeaning,
            orderMoneyType: res.orderCurrency,
            orderCurrencyMeaning: res.orderCurrencyMeaning,
            prompt: res.paymentProvision,
            paymentMethod: res.paymentMethod,
            deliveryClause: res.tradeTerms,
          },
        });
      }
    });
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      contactPersonSelectedRowKeys,
      disabled,
      loading,
      supplierCategory,
      financeDisabled,
      companyName,
      BRNum,
      head,
    } = this.state;
    const {
      supplierCheckData,
      accessToSupplierHK: { enumMap, supplierCheckDataPagination },
    } = this.props;
    const contactPersonRowSelection = {
      selectedRowKeys: contactPersonSelectedRowKeys,
      onChange: this.handleContactPersonRowSelectionChange,
    };
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const supplierColumns = this.supplierColumns();
    const basicFormProps = {
      checkSupplierName: this.checkSupplierName,
      checkRegistrationNumber: this.checkRegistrationNumber,
      supplierCategory,
      financeDisabled,
      companyName,
      BRNum,
      head,
    };
    return (
      <div
        ref={(el) => {
          this.messagesEnd = el;
        }}
        style={{ overflow: 'auto' }}
      >
        <PageWrapper>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            {/* 基本信息 */}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                  arrowActive={activeKey.includes('basic')}
                  buttons={
                    <>
                      <CusButton mini type="primary" onClick={this.supplierCheckResult}>
                        {intl.get(`${prompt}.view.button.supplier.recheck`).d('供应商查重')}
                      </CusButton>
                    </>
                  }
                />
              }
              key="basic"
            >
              <p>
                {intl
                  .get(`${prompt}.view.title.basicInfo.tips`)
                  .d(
                    '适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证'
                  )}
              </p>
              <BasicInfoForm
                onRef={(ref) => {
                  this.platform = ref;
                }}
                status="create"
                {...basicFormProps}
              />
            </Panel>
            {/* 联系人信息 */}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                  arrowActive={activeKey.includes('contact')}
                  buttons={
                    <>
                      <CusButton mini onClick={this.handleDelContactPersonData}>
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                      <CusButton mini type="primary" onClick={this.handleAddContactPersonData}>
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </>
                  }
                />
              }
              key="contact"
            >
              <p>
                {intl
                  .get(`${prompt}.view.title.contact.tips`)
                  .d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。')}
              </p>
              <EditTable
                bordered
                pagination={false}
                dataSource={contactPersonDataSource}
                columns={contactPersonTableColumns}
                rowSelection={contactPersonRowSelection}
                rowKey="id"
              />
            </Panel>
            {/* 供应商查重 */}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.supplier.recheck`).d('供应商查重')}
                  arrowActive={activeKey.includes('supplier')}
                />
              }
              key="supplier"
            >
              {/*<p>{intl.get(`${prompt}.view.title.supcheck.tips`).d('规则1： 英文首字母识别；规则2：去掉特定公司关键字后进行对比；')}</p>*/}
              <CusTable
                dataSource={supplierCheckData?.content}
                pagination={supplierCheckDataPagination}
                columns={supplierColumns}
                onChange={this.supplierCheckResult}
                rowKey="id"
              />
            </Panel>
            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <CusButton type="primary" onClick={this.handleSave} loading={loading}>
                {intl.get('hzero.common.button.save').d('保存')}
              </CusButton>
              <CusButton onClick={this.accessToSupplier} disabled={disabled}>
                {intl.get(`${prompt}.button.supplier.entry.date`).d('供应商准入')}
              </CusButton>
            </div>
          </Collapse>
        </PageWrapper>
      </div>
    );
  }
}
