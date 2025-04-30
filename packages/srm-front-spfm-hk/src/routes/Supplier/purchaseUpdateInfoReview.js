/**
 * 供应商信息更新 - 采购经理审核
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
import PurchaseBasicInfoForm from '@/routes/Supplier/components/PurchaseBasicInfoForm';
import ContactTable from '@/routes/Supplier/components/ContactTable';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';
import notification from 'utils/notification';
import ClientTable from '@/routes/Supplier/components/ClientTable';
import { ready } from '@/plugin/udc-sdk-esm';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  updateInfo: supplierHK.updateInfo || {},
  loading: loading.effects['supplierHK/updateInfoDetail'],
  tenantId: getCurrentOrganizationId()
}))
export default class PurchaseUpdateInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['head', 'basic', 'contact', 'client', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      customersDataSource: [], // 客户信息Table data
      attachmentDataSource: [], // 公司附件信息Table data
    };
    this.platform = {};
    this.handleContactChange = this.handleContactChange.bind(this);
    this.handleCustomersChange = this.handleCustomersChange.bind(this);
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierHK/init'
    })
    this.queryUpdateInfoDetail();
  }

  handleContactChange(data = []) {
    this.setState({ contactPersonDataSource: data });
  }

  handleCustomersChange(data = []) {
    this.setState({ customersDataSource: data });
  }

  handleAttachmentChange(data = []) {
    this.setState({ attachmentDataSource: data });
  }

  /**
   * 查询供应商信息更新单详情
   */
  @Bind()
  queryUpdateInfoDetail() {
    const { location: { search }, dispatch, updateInfo } = this.props;
    const { applyNumber, formRecordId } = queryString.parse(search.substring(1));
    let supplierName;
    dispatch({
      type: 'supplierHK/updateInfoDetail',
      payload: {
        applyNumber: applyNumber || formRecordId
      }
    }).then(res => {
      if(res) {
        this.handleContactChange(res.contacts);
        this.handleCustomersChange(res.customers);
        this.handleAttachmentChange(res.attachments);
        supplierName = res?.editHead?.companyNameCh;
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
                    window.open(`/pub/spfm-hk/supplier/supplier-comparison?applyNumber=${res?.editHead?.applyNumber}`);
                  }
                }
              ]
            }]
          });
        });
      }
    })
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if(e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if(['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
            formData: {
              formRecordId: applyNumber || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.basicinfo.update`).d('供应商基本信息更新') + supplierName, //待办流程名称
              //下面内容为表单数据
              ...updateInfo,
            }
          }, e.data.url)
        } else {
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
            formData: {
              formRecordId: applyNumber || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.basicinfo.update`).d('供应商基本信息更新') + supplierName, //待办流程名称
              //下面内容为表单数据
              ...updateInfo,
            }
          }, e.data.url)
        }
      }
    })
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      customersDataSource,
      attachmentDataSource,
    } = this.state;
    const {
      form,
      supplierHK,
      updateInfo,
      tenantId
    } = this.props;
    const { enumMap } = supplierHK || {};
    const headFormProps = {
      initialValues: {
        ...updateInfo?.editHead,
        ...updateInfo?.lineEdit,
      },
      disabled: true
    };
    const purchaseFormProps = {
      initialValues: {
        ...updateInfo?.editHead,
        ...updateInfo?.lineEdit,
      },
      disabled: true,
      enumMap
    };
    const contactTableProps = {
      rowKey: 'id',
      dataSource: contactPersonDataSource,
      otherDataSource: contactPersonDataSource,
      handleContactChange: this.handleContactChange,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    const clientTableProps = {
      dataSource: customersDataSource,
      otherDataSource: customersDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
      form,
      readOnly: true
    };
    const attachmentTableProps = {
      supplierHK,
      form,
      rowKey: 'id',
      dataSource: attachmentDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true,
      tenantId
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
              onRef={ref => this.platform = ref}
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
            <PurchaseBasicInfoForm
              onRef={ref => this.platform = ref}
              {...purchaseFormProps}
            />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                arrowActive={activeKey.includes('contact')}
              />
            }
            key='contact'
          >
            <ContactTable {...contactTableProps}/>
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                arrowActive={activeKey.includes('client')}
              />
            }
            key='client'
          >
            <ClientTable {...clientTableProps}/>
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.company.attachment`).d('公司附件')}
                arrowActive={activeKey.includes('attachment')}
              />
            }
            key='attachment'
          >
            <AttachmentTable {...attachmentTableProps}/>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
