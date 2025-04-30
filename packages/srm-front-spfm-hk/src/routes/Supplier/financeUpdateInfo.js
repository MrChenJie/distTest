/**
 * 供应商信息更新 - 财务供应商草稿
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/25
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
import { Form } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import '../AccessToSuppliers/index.less';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import HeaderForm from '@/routes/Supplier/components/HeaderForm';
import ContactTable from '@/routes/Supplier/components/ContactTable';
import uuid from 'uuid/v4';
import notification from '_cus_components/CusNotification';
import FinanceBasicInfoForm from '@/routes/Supplier/components/FinanceBasicInfoForm';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';
import dayjs from 'dayjs';
import { ready } from '@/plugin/udc-sdk-esm';
import { some, isEmpty, every } from 'lodash';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt, 'HKPC.commom'] })
@fastCodeLoader([

])
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  updateInfo: supplierHK.updateInfo || {},
  loading: loading.effects['supplierHK/updateInfoDetail'],
  tenantId: getCurrentOrganizationId()
}))
export default class FinanceUpdateInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['head', 'basic', 'contact', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
      contactRemove: [], // 联系信息删除data
      loading: false,
      state: 'READY', // 默认为草稿
      isPurchase: true,
      permissionType: null,
      attachmentDataSource: [], // 公司附件信息Table data
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
      attachmentRemove: [], // 附件信息删除data
    };
    this.platform = {};
    this.handleContactChange = this.handleContactChange.bind(this);
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
  }

  componentDidMount() {
    this.init();
    this.listener();
  }

  // 致远流程
  @Bind()
  listener() {
    const { location: { search } } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    let applyNumber;
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if (params) {
              console.log(params, 'params');
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  formRecordId: params?.editHead?.id || formRecordId,//表单记录id（Long）
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        } else if (e.data.submitType === 'DRAFT_HANDLE') {
          this.handleSave((params) => {
            if (params) {
              console.log(params, 'params');
              applyNumber = params?.editHead?.applyNumber;
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  formRecordId: params?.editHead?.id || formRecordId,//表单记录id（Long）
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
              ready({
                mode: 'iframe',
                tenant: 'CMI',
              }, (instance) => {
                //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
                instance.getCustomApi().insertBtnForToolbar({
                  // 按钮插入位置
                  position: 1,
                  btns: [{
                    // 按钮名称
                    name: intl.get(`${prompt}.view.button.comparison`).d('信息比对'),
                    buttonType: 'primary',
                    customEvents: [
                      {
                        type: 'click',
                        func: () => {
                          // 业务逻辑
                          window.open(`/pub/spfm-hk/supplier/finance-comparison?applyNumber=${applyNumber}`);
                        }
                      }
                    ]
                  }]
                });
              });
            }
          });
        } else {
          this.handleSave((params) => {
            if (params) {
              console.log(params, 'params');
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  formRecordId: params?.editHead?.id || formRecordId,//表单记录id（Long）
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        }
      } else if (e.data.messageType === 'PROCESS_ACTION_SUCCESS') {
        if(e.data.messageType === 'DRAFT_HANDLE') {
          window.parent?.postMessage({
            messageType: 'REFRESH',
          }, e.data.url)
          window.location.reload();
        }
      }
    })
  }

  @Bind()
  async init() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber, id, formRecordId, state, permissionType } = queryString.parse(search.substring(1));
    console.log(state, 'state')
    console.log(permissionType, 'permissionType')
    if (id) {
      await dispatch({
        type: 'supplierHK/newSupplierInfo',
        payload: {
          supplierId: id
        }
      }).then(res => {
        if (res) {
          const newContactPersonDataSource = (res?.contacts || []).map((item) => ({
            ...item,
            _status: 'update',
            id: uuid(),
          }))
          this.setState({
            contactPersonDataSource: newContactPersonDataSource,
            attachmentDataSource: res?.attachments || [],
          });
        }
      })
    }
    if (applyNumber || formRecordId !== 'null') {
      await this.queryUpdateInfoDetail();
    }
    this.setState({
      state: state ? state : 'READY',
      permissionType
    })
  }

  handleContactChange(data = []) {
    this.setState({ contactPersonDataSource: data });
  }

  handleAttachmentChange(data = []) {
    this.setState({ attachmentDataSource: data });
  }

  /**
   * 查询供应商信息更新单详情
   */
  @Bind()
  queryUpdateInfoDetail() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber, formRecordId, state } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/updateInfoDetail',
      payload: {
        applyNumber: applyNumber || formRecordId
      }
    }).then(res => {
      if (res) {
        this.handleContactChange(res?.contacts || []);
        this.handleAttachmentChange(res?.attachments || []);
        ready({
          mode: 'iframe',
          tenant: 'CMI',
        }, (instance) => {
          //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
          instance.getCustomApi().insertBtnForToolbar({
            // 按钮插入位置
            position: 1,
            btns: [{
              // 按钮名称
              name: intl.get(`${prompt}.view.button.comparison`).d('信息比对'),
              buttonType: 'primary',
              customEvents: [
                {
                  type: 'click',
                  func: () => {
                    // 业务逻辑
                    window.open(`/pub/spfm-hk/supplier/finance-comparison?applyNumber=${res?.editHead?.applyNumber}`);
                  }
                }
              ]
            }]
          });
        });
        // if (state === 'READY') {
        //
        // }
      }
    })
  }

  /**
   * 页面大保存
   */
  @Bind()
  handleSave(callback) {
    this.headform.props.form.validateFields((err, values) => {
      if (!err) {
        this.platform.props.form.validateFields((err, values) => {
          if (!err) {
            const {
              contactPersonDataSource,
              attachmentDataSource,
            } = this.state;
            const { tenantId, dispatch, updateInfo, location: { search } } = this.props;
            const { id } = queryString.parse(search.substring(1));
            const headEdit = {
              applyNumber: this.headform.props.form.getFieldValue('applyNumber'),
              applyStatus: this.headform.props.form.getFieldValue('applyStatus'),
              applyDate: dayjs.isDayjs(this.headform.props.form.getFieldValue('applyDate'))
                ? this.headform.props.form.getFieldValue('applyDate').format("YYYY-MM-DD 00:00:00")
                : undefined,
              applyUser: this.headform.props.form.getFieldValue('applyUser'),
              supplierNumber: this.headform.props.form.getFieldValue('supplierNumber'),
              editReason: this.headform.props.form.getFieldValue('editReason'),
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
              foundDate: dayjs.isDayjs(values.foundDate)
                ? values.foundDate.format('YYYY-MM-DD 00:00:00')
                : undefined,
              foundAddress: values.foundAddress,
              registrationNumber: values.registrationNumber,
              country: values.country,
              orderMoneyType: values.orderMoneyType,
              prompt: values.prompt,
              paymentMethod: values.paymentMethod,
              deliveryClause: values.deliveryClause,
              supplierStatus: values.supplierStatus,
              enableValid: values.enableValid,
              expireDate: dayjs.isDayjs(values.expireDate)
                ? values.expireDate.format('YYYY-MM-DD 00:00:00')
                : undefined,
              id: updateInfo?.editHead.id,
              refSupHeadId: id || updateInfo?.editHead?.refSupHeadId, // 供应商id
            };
            const lineEdit = {
              reason: values.reason,
              purchaseInfo: values.purchaseInfo,
              isRelatedTrader: values.isRelatedTrader,
              liabilityAccount: values.liabilityAccount,
              dealings: values.dealings,
              isRelatedBudget: values.isRelatedBudget,
              foundDate: dayjs.isDayjs(values.foundDate)
                ? values.foundDate.format('YYYY-MM-DD 00:00:00')
                : undefined,
              expireDate: dayjs.isDayjs(values.expireDate)
                ? values.expireDate.format('YYYY-MM-DD 00:00:00')
                : undefined,
              id: updateInfo?.lineEdit.id,
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

            const attachment = attachmentDataSource?.map(i => {
              return {
                type: i.type,
                subType: i.subType,
                description: i.description,
                // expirationDate: dayjs.isDayjs(i.expirationDate)
                //   ? i.expirationDate.format("YYYY-MM-DD 00:00:00")
                //   : dayjs(i.expirationDate).format('YYYY-MM-DD 00:00:00'),
                attachmentDate: dayjs.isDayjs(i.attachmentDate)
                  ? i.attachmentDate.format("YYYY-MM-DD HH:mm:ss")
                  : undefined,
                attachmentUuid: i.attachmentUuid,
                uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N'
              }
            });
            // 判断附件中的附件类型有没有填写
            const checkUndefinedField = attachment.some(item => item.type === undefined);
            if(checkUndefinedField) {
              return notification.error({
                message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
              })
            }

            // 联系人新增行附件类型空，必须填写
            const isTypeEmpty = some(contact, item => isEmpty(item.type));
            if(isTypeEmpty) {
              notification.error({
                message: intl.get(`${prompt}.contact.verify`).d('请补充完整供应商联系人信息')
              });
              return false
            }

            //联系人判断如果联系人名称、电邮 电话，都为空就通过，如果这三个值都不为空 就通过
            const isAllEmpty = every(contact, item => {
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
            // 2025.02.27新增优化：勾选默认联系人校验
            const defaultContact = contact.filter(item => item.isDefault === 'Y');
            if (defaultContact.length >= 1) {
              this.setState({
                loading: true
              });
              dispatch({
                type: 'supplierHK/updateInfoSave',
                payload: {
                  headEdit,
                  lineEdit,
                  contact,
                  attachment,
                }
              }).then(res => {
                if (res) {
                  notification.success();
                  this.setState({
                    contactPersonDataSource: res?.contacts || [],
                    attachmentDataSource: res?.attachments || [],
                    loading: false,
                  });
                  if (typeof callback === 'function') {
                    callback({
                      ...res,
                      affairTitle: intl.get(`${prompt}.todotask.basicinfo.update`).d('供应商基本信息更新：') + headEdit?.companyNameCh, //待办流程名称
                    });
                    console.log(intl.get(`${prompt}.todotask.basicinfo.update`).d('供应商基本信息更新：') + headEdit?.companyNameCh, 'affairTitle');
                  }
                } else {
                  this.init();
                  this.setState({
                    loading: false
                  });
                }
              })
            } else {
              notification.error({
                message: intl.get(`${prompt}.form.validateFields.contacts.default`).d('至少需要维护一条默认联系人。'),
              })
            }
          } else {
            notification.error({
              message: intl.get('HKPC.commom.view.title.submitprompt').d('有必填字段未填写，请检查表单数据'),
            })
          }
        })
      } else {
        notification.error({
          message: intl.get('HKPC.commom.view.title.submitprompt').d('有必填字段未填写，请检查表单数据'),
        })
      }
    });
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
        isDefault: 'N',
        uuid: uuid(),
      }],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactPersonData() {
    const { contactPersonDataSource = [], contactPersonSelectedRows = [] } = this.state;
    this.setState({
      contactPersonDataSource: contactPersonDataSource.filter(r => contactPersonSelectedRows.every(rd => rd.uuid !== r.uuid)),
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

  // 新增一行附件信息
  @Bind()
  handleAddAttachmentData() {
    const { attachmentDataSource } = this.state;
    this.setState({
      attachmentDataSource: [...attachmentDataSource, {
        id: uuid(),
        _status: 'create',
        type: undefined,
        subType: undefined,
        description: undefined,
        // expirationDate: undefined,
        attachmentDate: undefined,
        attachmentUuid: uuid(),
        uuid: uuid(),
      }],
    });
  }

  // 删除一行附件信息
  @Bind()
  handleDelAttachmentData() {
    const { attachmentDataSource = [], attachmentSelectRows = [] } = this.state;
    this.setState({
      attachmentDataSource: attachmentDataSource.filter(r => attachmentSelectRows.every(rd => rd.uuid !== r.uuid)),
      attachmentRemove: attachmentSelectRows,
      attachmentSelectRowKeys: [],
      attachmentSelectRows: []
    });
  }

  // 附件信息表格checkBox
  @Bind()
  handleAttachmentRowSelectionChange(keys, rows) {
    console.log(keys, rows);
    this.setState({
      attachmentSelectRowKeys: keys,
      attachmentSelectRows: rows,
    })
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      contactPersonSelectedRowKeys,
      state,
      permissionType,
      attachmentDataSource,
      attachmentSelectRowKeys,
    } = this.state;
    const {
      form,
      supplierHK,
      updateInfo,
    } = this.props;
    const isPurchase = state === 'READY' && updateInfo?.editHead?.supplierCategory !== 'FINANCIALPAYMENT';
    const isBack = state === 'PENDING' && permissionType === 'SEND';
    console.log(isPurchase, 'isPurchase');
    const headFormProps = {
      initialValues: {
        ...updateInfo?.editHead,
        ...updateInfo?.lineEdit,
      },
      disabled: state !== 'READY' && !isBack,
    };
    const financeFormProps = {
      initialValues: {
        ...updateInfo?.editHead,
        ...updateInfo?.lineEdit,
      },
      disabled: state !== 'READY',
      isPurchase,
      isBack
    };
    const contactTableProps = {
      rowKey: 'uuid',
      dataSource: contactPersonDataSource,
      otherDataSource: contactPersonDataSource,
      handleContactChange: this.handleContactChange,
      rowSelection: {
        selectedRowKeys: contactPersonSelectedRowKeys,
        onChange: this.handleContactPersonRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: state !== 'READY' || isPurchase
        })
      },
      readOnly: state !== 'READY' || isPurchase,
    };
    const attachmentTableProps = {
      initialValues: {
        ...updateInfo?.editHead,
        ...updateInfo?.lineEdit,
      },
      supplierHK,
      form,
      rowKey: 'uuid',
      dataSource: attachmentDataSource,
      otherDataSource: attachmentDataSource,
      rowSelection: {
        selectedRowKeys: attachmentSelectRowKeys,
        onChange: this.handleAttachmentRowSelectionChange,
        getCheckboxProps: (record) => ({
          disabled: (state !== 'READY' && !isPurchase && !isBack) || record?.uploadErpStatus === 'Y'
        })
      },
      handleAttachmentChange: this.handleAttachmentChange,
      tag: 'bank',
      readOnly: state !== 'READY' && !isPurchase && !isBack
    };
    return (
      <PageWrapper>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('head')}
              />
            }
            key='head'
          >
            <HeaderForm
              onRef={ref => this.headform = ref}
              {...headFormProps}
            />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key='basic'
          >
            <p>{intl.get(`${prompt}.view.title.basicInfo.tips`).d('适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证')}</p>
            <FinanceBasicInfoForm
              onRef={ref => this.platform = ref}
              {...financeFormProps}
            />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                arrowActive={activeKey.includes('contact')}
                buttons={
                  <>
                    {state === 'READY' && !isPurchase && <CusButton mini
                      onClick={this.handleDelContactPersonData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {state === 'READY' && !isPurchase && <CusButton mini type='primary'
                      onClick={this.handleAddContactPersonData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key='contact'
          >
            <p>{intl.get(`${prompt}.view.title.contact.tips`).d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。 ')}</p>
            <ContactTable {...contactTableProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.company.attachment`).d('公司附件')}
                arrowActive={activeKey.includes('attachment')}
                buttons={
                  <>
                    {!(state !== 'READY' && !isPurchase && !isBack) && <CusButton mini
                                onClick={this.handleDelAttachmentData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {!(state !== 'READY' && !isPurchase && !isBack) && <CusButton mini type="primary"
                                onClick={this.handleAddAttachmentData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key='attachment'
          >
            { false && <p>{intl.get(`${prompt}.view.title.attachment.tips`).d('请上传商业登记证、供应商信息登记表、资质证照或其他辅助材料（如有)')}</p>}
            <AttachmentTable {...attachmentTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
