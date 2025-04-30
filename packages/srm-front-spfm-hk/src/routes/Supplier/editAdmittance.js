/**
 * 供应商准入 - 编辑页
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/11
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import EditTable from '_cus_components/EditTable';
import CusTable from '_cus_components/CusTable';
import { closeWindow } from '_cus_utils/utils';
import PreviewBasicInfoForm from '@/routes/Supplier/components/PreviewBasicInfoForm';
import uuid from 'uuid/v4';
import { Checkbox, Form, message } from 'hzero-ui';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import '../AccessToSuppliers/index.less';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import dayjs from 'dayjs';
import notification from '_cus_components/CusNotification';
import { EMAIL } from 'utils/regExp';
import { some, isEmpty, every } from 'lodash';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';
const realName = getCurrentUser().realName;

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  previewData: supplierHK.previewData || {},
  loading: loading.effects['supplierHK/previewSupplierDetail'],
  getCaseIdLoading: loading.effects['supplierHK/getCaseId'],
  supplierCheckData: supplierHK.supplierCheckData || {},
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser()
}))
export default class EditAdmittance extends Component {
  messagesEnd: null
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'supplier'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
      supplierDataSource: [],
      disabled: true,
      supplierId: null,
      remove: [],
      btnLoading: false,
      userUnit: null,
      financeDisabled: false
    };
    this.platform = {};
  }
  componentDidMount() {
    this.getSupplierDetailData();
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
        userUnit: res
      });
      if(res?.some(item => ['D0091', 'D0021', 'D0238'].includes(item.unitCode))) {
        this.setState({
          supplierCategory: 'FINANCIALPAYMENT',
          financeDisabled: true
        });
      } else if(res?.some(item => ['D0022', 'D0094'].includes(item.unitCode))) {
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

  /**
   * 供应商预览详情
   */
  @Bind()
  getSupplierDetailData() {
    const { location: { search }, dispatch } = this.props;
    const { supplierId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/previewSupplierDetail',
      payload: {
        supplierId
      }
    }).then(res => {
      if(res) {
        this.setState({
          contactPersonDataSource: res.contacts,
          supplierId: res.head.id,
        })
        // 草稿状态：当前用户=该供应商业务员时，才可以编辑
        if(res.head?.approvalStatus === 'Draft' && res.head?.salesman === realName) {
          this.setState({
            disabledEdit: false, // 编辑权限
          })
        } else {
          this.setState({
            disabledEdit: true, // 编辑权限
          })
        }
      }
    })
  }

  /**
   * 保存准入
   */
  @Bind()
  handleSave() {
    const { dispatch, tenantId } = this.props;
    const { contactPersonDataSource, supplierId } = this.state;
    this.platform.props.form.validateFields({ force: true }, (err, values) => {
      if(!err){
        if(contactPersonDataSource.length === 0) {
          notification.error({
            message: intl.get(`${prompt}.form.validateFields.contacts`).d('联系人必须要填写一行')
          });
          return false;
        }
        if(contactPersonDataSource.length > 0) {
          const defaultContact = contactPersonDataSource.filter(i => i.isDefault === 'Y');
          if(defaultContact.length === 0){
            notification.error({
              message: intl.get(`${prompt}.form.validateFields.contacts.default`).d('至少需要维护一条默认联系人')
            });
            return false
          }
          
        // 联系人新增行附件类型空，必须填写
          const isTypeEmpty = some(contactPersonDataSource, item => isEmpty(item.type));
          if(isTypeEmpty) {
            notification.error({
              message: intl.get(`${prompt}.contact.verify`).d('请补充完整供应商联系人信息')
            });
            return false
          }

          //联系人判断如果联系人名称、电邮 电话，都为空就通过，如果这三个值都不为空 就通过
          const isAllEmpty = every(contactPersonDataSource, item => {
            const isEmptyCheck = isEmpty(item.phone) && isEmpty(item.name) && isEmpty(item.email);
            const isFullCheck = !isEmpty(item.phone) && !isEmpty(item.name) && !isEmpty(item.email);
            return isEmptyCheck || isFullCheck; // 满足任一条件：三者都为空或三者都不为空
          });
          if(!isAllEmpty) {
            notification.error({
              message: intl.get(`${prompt}.contact.verify`).d('请补充完整供应商联系人信息')
            });
            return false
          }
        }

        this.setState({
          btnLoading: true
        });
        const basicInfoParams = {
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
            ? values.foundDate.format("YYYY-MM-DD 00:00:00")
            : undefined,
          registrationNumber: values.registrationNumber,
          country: values.country,
          orderMoneyType: values.orderMoneyType,
          prompt: values.prompt,
          paymentMethod: values.paymentMethod,
          deliveryClause: values.deliveryClause,
          organizationId: tenantId,
          id: supplierId
        };
        const contact = contactPersonDataSource.map(i => {
          return {
            type: i.type,
            name: i.name,
            phone: i.phone,
            email: i.email,
            isDefault: i.isDefault,
            tenantId: tenantId,
          }
        });
        dispatch({
          type: 'supplierHK/supplierInfoDataSave',
          payload: {
            dto: {
              head: {...basicInfoParams},
              contact
            }
          }
        }).then(res => {
          if(res){
            notification.success();
            this.setState({
              btnLoading: false,
              repeatSupplierId: res.head.id, // 第一次保存后的供应商id
            })
          } else {
            this.setState({
              btnLoading: false
            })
          }
        })
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
    const arr = contactPersonDataSource.map(i => {
      if(i.id !== record.id || i.uuid !== record.uuid) {
        return {
          ...i,
          isDefault: 'N'
        }
      } else {
        return i
      }
    });
    this.setState({
      contactPersonDataSource: arr
    });
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    const { disabledEdit } = this.state;
    return [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return !disabledEdit ? (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: record.type,
              })(<CusSelect
                style={{ width: '100%' }}
                onChange={e => {
                  record.type = e;
                }}
                placeholder={intl.get(`${prompt}.field.placeholder.select.type`).d('请选择类型')}
                lovCode="HKSP.CONTACT_TYPE"
              />)}
            </Form.Item>
          ) : record.typeMeaning
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return !disabledEdit ? (
            <Form.Item>
              {getFieldDecorator(`name${record.id}`, {
                initialValue: record.name
              })(<CusInput placeholder={intl.get(`${prompt}.field.placeholder.contact.name`).d('请输入联系姓名')}
                  onChange={e => {
                    record.name = e;
                  }}
              />)}
            </Form.Item>
          ) : record.name
        }
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return !disabledEdit ? (
            <Form.Item>
              {getFieldDecorator(`phone${record.id}`, {
                initialValue: record.phone
              })(<CusInput onChange={e => {
                record.phone = e;
              }}
              />)}
            </Form.Item>
          ) : record.phone
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return !disabledEdit ? (
            <Form.Item>
              {getFieldDecorator(`email${record.id}`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput onChange={e => {
                record.email = e;
              }}
              />)}
            </Form.Item>
          ) : record.email
        }
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        align: 'left',
        width: 200,
        render: (values, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return !disabledEdit ? (
            <Form.Item>
              {getFieldDecorator(`isDefault${uuid()}`, {
                initialValue: record.isDefault || 'N'
              })(<Checkbox
                checked={record.isDefault === 'Y'}
                checkedValue="Y"
                unCheckedValue="N"
                onChange={(e) => this.setDefaultContact(e, record)}
              />)}
            </Form.Item>
          ) : record.isDefaultMeaning
        }
      },
    ]
  }

  // 新增一行联系人信息
  @Bind()
  handleAddContactPersonData() {
    const { contactPersonDataSource } = this.state;
    this.setState({
      contactPersonDataSource: [...contactPersonDataSource, {
        id: uuid(),
        _status: 'create',
        type: undefined,
        name: undefined,
        phone: undefined,
        email: undefined,
        isDefault: 'N'
      }],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactPersonData() {
    const { contactPersonDataSource = [], contactPersonSelectedRows = [] } = this.state;
    this.setState({
      contactPersonDataSource: contactPersonDataSource.filter(r => contactPersonSelectedRows.every(rd => rd.id !== r.id)),
      remove: contactPersonSelectedRows,
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
    })
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
            <a onClick={() => {this.pushRouterByApprovalStatus(record)}}>
              {intl.get(`${prompt}.table.field.details`).d('详情')}
            </a>
          )
        }
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
        title: intl.get(`${prompt}.table.commercial.registration.certificate.num`).d('商业登记证号码'),
        dataIndex: 'registrationNumber',
        width: 200,
      },
      // {
      //   title: intl.get(`${prompt}.table.fuzzy.duplicate.checking.rules`).d('模糊查重规则'),
      //   dataIndex: 'ruleMeaning',
      //   width: 200,
      // },
    ]
  }

  /**
   * 供应商准入
   */
  @Bind()
  accessToSupplier(){
    const { supplierId } = this.state;
    const { previewData, dispatch, location: { search } } = this.props;
    const { caseId } = queryString.parse(search.substring(1));
    const { head: { supplierCategory } } = previewData;
    console.log(supplierId, 'supplier')

    // 查询是否存在caseID
    dispatch({
      type: 'supplierHK/getCaseId',
      payload: {
        supplierId,
      }
    }).then((res) => {
      if(res) {
        if(res?.caseId) {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${res?.caseId}`);
          window.close();
          closeWindow();
        } else {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BMP-CGGYSZR&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/admittance-detail?supplierId=${res?.supplierId}`)}`);
          window.close();
          closeWindow();
        }
      }
    })
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
  supplierCheckResult(page= {}) {
    const { dispatch } = this.props;
    const { supplierId } = this.state;
    const { getFieldValue } = this.platform.props.form;
    dispatch({
      type: 'supplierHK/supplierCheck',
      payload: {
        companyNameCh: getFieldValue('companyNameCh') ? getFieldValue('companyNameCh') : undefined,
        companyNameEn: getFieldValue('companyNameEn') ? getFieldValue('companyNameEn') : undefined,
        id: supplierId,
        page
      }
    }).then(res => {
      if(res?.content?.length > 0) {
        this.scrollToBottom();
        message.info(intl.get(`${prompt}.field.supplier.check.tips`).d('供应商可能重复录入，请滚动条拉至底端进行确认。'))
      }
    })
  }

  /**
   * 根据单据状态区分跳转页面
   * @param record
   */
  @Bind()
  pushRouterByApprovalStatus(record) {
    const { isPub } = this.props;
    const { id, supplierNumber, approvalStatus, supplierCategory, caseId, accessSource, createdBy } = record;
    if(accessSource === 'portal') {
      window.open(`/pub/spfm-hk/supplier/PRSA-infomation-portal/manager?createdBy=${createdBy}`)
    } else {
      // 审批状态草稿单跳转编辑页面
      if(approvalStatus === 'Draft') {
        window.open(`/pub/spfm-hk/supplier/edit-admittance?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(approvalStatus)}`);
      }
      // 审批中根据审批状态和供应商类别跳转待办页
      if(approvalStatus === 'Inapproval') {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
      }
      // 已审批跳转预览页
      if(approvalStatus === 'Approved' && supplierCategory === 'FINANCIALPAYMENT') {
        window.open(`/pub/spfm-hk/supplier/finance-approved?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(approvalStatus)}`);
      }
      if(approvalStatus === 'Approved' && supplierCategory !== 'FINANCIALPAYMENT') {
        window.open(`/pub/spfm-hk/supplier/purchase-approved?supplierId=${id}&supplierNumber=${supplierNumber}&approvalStatus=${encodeURIComponent(approvalStatus)}`);
      }
    }
  }

  /**
   * 公司名称查重
   */
  @Bind()
  checkSupplierName(e) {
    const { dispatch } = this.props;
    const { supplierId, repeatSupplierId } = this.state;
    if(e.target.value) {
      dispatch({
        type: 'supplierHK/checkSupplierName',
        payload: {
          supplierName: e.target.value,
          supplierId: repeatSupplierId ? repeatSupplierId : supplierId
        }
      }).then(res => {
        if(!res) {
          notification.info({
            message: '已存在相同的数据'
          })
        }
      })
    }
  }

  /**
   * 商业登记证号码查重
   */
  @Bind()
  checkRegistrationNumber(e) {
    const { dispatch } = this.props;
    const { supplierId, repeatSupplierId } = this.state;
    if(e.target.value) {
      dispatch({
        type: 'supplierHK/checkRegistrationNumber',
        payload: {
          registrationNumber: e.target.value,
          supplierId: repeatSupplierId ? repeatSupplierId : supplierId
        }
      }).then(res => {
        if(!res) {
          notification.info({
            message: '已存在相同的数据'
          })
        }
      })
    }
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      contactPersonSelectedRowKeys,
      btnLoading,
      financeDisabled,
      disabledEdit,
    } = this.state;
    const {
      supplierCheckData,
      loading,
      previewData,
      supplierCheckDataPagination,
      getCaseIdLoading = false,
    } = this.props;
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const supplierColumns = this.supplierColumns();
    const basicFormProps = {
      initialValues: {
        ...previewData.head,
        ...previewData.line,
      },
      checkSupplierName: this.checkSupplierName,
      checkRegistrationNumber: this.checkRegistrationNumber,
      financeDisabled,
      disabledEdit,
    };
    const contactTableProps = {
      dataSource: contactPersonDataSource,
      rowSelection: {
        selectedRowKeys: contactPersonSelectedRowKeys,
        onChange: this.handleContactPersonRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: disabledEdit,
        })
      },
      disabledEdit,
    };
    return (
      <div ref={el => { this.messagesEnd = el }} style={{ overflow: 'auto'}}>
        <PageWrapper loading={loading}>
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
                      <CusButton mini type="primary" onClick={this.supplierCheckResult}>{intl.get(`${prompt}.view.button.supplier.recheck`).d('供应商查重')}</CusButton>
                    </>
                  }
                />
              }
              key="basic"
            >
              <p>{ intl.get(`${prompt}.view.title.basicInfo.tips`).d('适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证') }</p>
              <PreviewBasicInfoForm
                onRef={ref => {
                  this.platform = ref;
                }}
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
                      {!disabledEdit && <CusButton mini onClick={this.handleDelContactPersonData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                      {!disabledEdit && <CusButton mini type="primary" onClick={this.handleAddContactPersonData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                    </>
                  }
                />
              }
              key="contact"
            >
              <p>{ intl.get(`${prompt}.view.title.contact.tips`).d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。') }</p>
              <EditTable
                bordered
                pagination={false}
                columns={contactPersonTableColumns}
                rowKey="id"
                {...contactTableProps}
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
            <div style={{ textAlign: 'center', marginTop: '36px'}}>
              {!disabledEdit && <CusButton
                type="primary"
                onClick={this.handleSave}
                loading={btnLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </CusButton>}
              <CusButton onClick={this.accessToSupplier} loading={getCaseIdLoading}>
                {intl.get(`${prompt}.button.supplier.entry.date`).d('供应商准入')}
              </CusButton>
            </div>
          </Collapse>
        </PageWrapper>
      </div>
    );
  }
}
