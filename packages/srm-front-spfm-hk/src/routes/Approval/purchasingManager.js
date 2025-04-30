/**
 * 审批状态（待办相关） - 采购经理审核采购供应商准入信息
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/18
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Collapse } from 'antd';
const { Panel } = Collapse;
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import ContactTable from '@/routes/Approval/components/ContactTable';
import AttachmentTable from '@/routes/Approval/components/AttachmentTable';
import PreviewPurchaseApprovalForm from '@/routes/Approval/components/PreviewPurchaseApprovalForm';
import ClientTable from '@/routes/Approval/components/ClientTable';
import queryString from 'query-string';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ approvalHK, loading }) => ({
  approvalHK,
  previewData: approvalHK.previewData || {},
  fileData: approvalHK.fileData || [],
  loading: loading.effects['approvalHK/queryApprovalInfo'],
  tenantId: getCurrentOrganizationId()
}))
export default class PurchasingManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicInfo', 'basic', 'contact', 'client', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      disabled: true,
    }
  }

  componentDidMount() {
    this.queryApprovalInfo();
  }

  /**
   * 保存准入
   */
  @Bind()
  handleSave(callback) {
    const { dispatch, tenantId, previewData } = this.props;
    this.platform.props.form.validateFields((err, values) => {
      if(!err){
        const head = {
          ...previewData?.head,
        };
        const line = {
          ...previewData?.line,
        }
        const contact = previewData?.contacts;
        const customer = previewData?.customers;
        dispatch({
          type: 'approvalHK/supplierInfoDataSave',
          payload: {
            dto: {
              head: {...head},
              line: {...line},
              contact,
              customer
            }
          }
        }).then(res => {
          if(typeof callback === 'function') {
            callback(res);
          }
        })
      }
    });
  }

  @Bind()
  async queryApprovalInfo() {
    const { location: { search }, dispatch } = this.props;
    const { supplierId, formRecordId} = queryString.parse(search.substring(1)); // 通过致远url进入页面时supplierId会被转换成formRecordId
    let supplierCategoryMeaning;
    let supplierName;
    let id;
    await dispatch({
      type: 'approvalHK/queryApprovalInfo',
      payload: {
        supplierId: supplierId || formRecordId
      }
    }).then(res => {
      console.log(res, '===');
      supplierCategoryMeaning = res?.head?.supplierCategoryMeaning;
      supplierName = res?.head?.companyNameCh;
      id = res?.head?.id;
    })
    await dispatch({
      type: 'approvalHK/queryCompanyFile',
      payload: {
        supplierId: supplierId || formRecordId,
        refType: 'company'
      }
    })
    const processType = supplierCategoryMeaning === 'FINANCIALPAYMENT' ? 'N' : 'Y';
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if(e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if(['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          console.log(e.data.submitType, 'e.data.submitType 1');
          console.log('affairTitle', e.data.submitType === 'SUBMIT' ? intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName : intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName)
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
                },
                formData: {
                  formRecordId: supplierId || formRecordId || id,//表单记录id（Long）
                  affairTitle: e.data.submitType === 'SUBMIT'
                    ? intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName
                    : intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName, //待办流程名称
                  processType, // 采购 Y/ 非采购N
                  IfAutoPay: ['AUTOPAY', 'TELEGRAPHIC', 'ICBCAUTOPAY'].includes(params?.head?.paymentMethod) ? 'Y' : 'N', // 自动支付 Y/N
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        } else {
          console.log(e.data.submitType, 'e.data.submitType 2');
          console.log('affairTitle', e.data.submitType === 'SUBMIT' ? intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName : intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName)
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
                },
                formData: {
                  formRecordId: supplierId || formRecordId || id,//表单记录id（Long）
                  affairTitle: e.data.submitType === 'SUBMIT'
                    ? intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName
                    : intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName, //待办流程名称
                  processType, // 采购 Y/ 非采购N
                  IfAutoPay: ['AUTOPAY', 'TELEGRAPHIC', 'ICBCAUTOPAY'].includes(params?.head?.paymentMethod) ? 'Y' : 'N', // 自动支付 Y/N
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        }
      }
    })
  }

  render() {
    const { activeKey } = this.state;
    const { loading, form, approvalHK, previewData, fileData, tenantId } = this.props;
    const { fileCascader } = approvalHK;
    const { head, line, contacts, customers } = previewData;
    const previewPurchaseApprovalFormProps = {
      initialValues: {
        ...head,
        ...line
      }
    };
    const contactTableProps = {
      rowKey: 'id',
      dataSource: contacts,
      form,
      disabled: true,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readyOnly: true
    };

    const clientTableProps = {
      rowKey: 'id',
      dataSource: customers,
      form,
      disabled: true,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readyOnly: true
    };

    const attachmentTableProps = {
      rowKey: 'id',
      dataSource: fileData,
      form,
      disabled: true,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      fileCascader,
      tenantId,
      readyOnly: true
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
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key="basic"
          >
            <PreviewPurchaseApprovalForm
              onRef={ref => {
                this.platform = ref;
              }}
              {...previewPurchaseApprovalFormProps}
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
            key="contact"
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
            key="client"
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
            key="attachment"
          >
            <AttachmentTable {...attachmentTableProps}/>
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}
