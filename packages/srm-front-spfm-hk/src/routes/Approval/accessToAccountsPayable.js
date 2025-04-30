/**
 * 审批状态（待办相关） - 应付账项组组长审核财务供应商准入信息
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/13
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import { Collapse } from 'antd';
const { Panel } = Collapse;
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import ContactTable from '@/routes/Approval/components/ContactTable';
import A2PTable from '@/routes/Approval/components/A2PTable';
import BankTable from '@/routes/Approval/components/BankTable';
import AttachmentTable from '@/routes/Approval/components/AttachmentTable';
import PreviewFinanceApprovalForm from '@/routes/Approval/components/PreviewFinanceApprovalForm';
import queryString from 'query-string';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
@Form.create()
@connect(({ approvalHK, loading }) => ({
  approvalHK,
  previewData: approvalHK.previewData || {},
  fileData: approvalHK.fileData || [],
  loading: loading.effects['approvalHK/queryApprovalInfo'],
  queryBankInfoListLoading: loading.effects['approvalHK/getBankInfoList'],
  bankInfoExportLoading: loading.effects['approvalHK/bankInfoExport'],
  tenantId: getCurrentOrganizationId()
}))
export default class AccessToAccountsPayable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'a2p', 'bank', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      disabled: true,
      a2pData: {}, // a2p信息
      bankDataSource: [], // 银行信息Table data
      isA2p: false,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
  }

  componentDidMount() {
    this.queryApprovalInfo();
    // 获取银行地址信息
    this.handleAddressBankInfoList();
  }

  @Bind()
  handleAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'approvalHK/getAddressBankInfoList',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then((res) => {
      if(res) {
        debugger
        const newDataSource = res?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status:'update',
        }))
        dispatch({
          type: 'approvalHK/updateState',
          payload: {
            addressBankInfoDataSource: newDataSource,
          }
        })
      }
    });
  }

  // 根据地址行信息查询明细
  @Bind()
  handleBankInfoList(record) {
    const {
      dispatch,
    } = this.props;
    if(record?.id) {
      dispatch({
        type: 'approvalHK/getBankInfoList',
        payload: {
          bankHeadId: record?.id,
        }
      }).then((res) => {
        if(res) {
          const newDataSource = res?.map((item) => ({
            ...item,
            bindBankId: record?.rowKey,
            rowKey: uuid(),
            _status:'update',
          }))
          dispatch({
            type: 'approvalHK/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            }
          })
        }
      })
    } else {
      dispatch({
        type: 'approvalHK/updateState',
        payload: {
          bankInfoListDataSource: [],
        }
      })
    }
    this.setState({
      isShowBankInfo: true,
      addressBankRecord: record,
    })
  }

  // 银行信息导出
  @Bind()
  handleExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'approvalHK/bankInfoExport',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then(res => {
      if(res) {
        // 创建下载的链接
        const url = window.URL.createObjectURL(new Blob([res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = `${intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}.xlsx`;
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    });
  }

  @Bind()
  queryApprovalInfo() {
    const { location: { search }, dispatch } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    let supplierName;
    dispatch({
      type: 'approvalHK/queryApprovalInfo',
      payload: {
        supplierId: supplierId || formRecordId
      }
    }).then(res => {
      if(res) {
        this.setState({
          isA2p: res?.line?.isA2p
        });
        supplierName = res?.head?.companyNameCh;
      }
    })
    dispatch({
      type: 'approvalHK/queryCompanyFile',
      payload: {
        supplierId: supplierId || formRecordId,
        refType: 'bank'
      }
    })
    dispatch({
      type: 'approvalHK/previewSupplierA2pDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then(res => {
      if(res){
        this.setState({
          a2pData: res
        });
      }
    })
    dispatch({
      type: 'approvalHK/previewSupplierBankDetail',
      payload: {
        supplierId: supplierId || formRecordId
      }
    }).then(res => {
      if(res){
        this.setState({
          bankDataSource: res
        });
      }
    })
    const processType = 'N';
    // 审批流程监听
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
            actionInfo: {
              preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
            },
            formData: {
              formRecordId: supplierId || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.nonprocuresup.access`).d(`非采购供应商准入`) + supplierName, //待办流程名称
              processType, // 采购 Y/ 非采购N
            }
          }, e.data.url)
        } else {
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
            actionInfo: {
              preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
            },
            formData: {
              formRecordId: supplierId || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.nonprocuresup.access`).d(`非采购供应商准入`) + supplierName, //待办流程名称
              processType, // 采购 Y/ 非采购N
            }
          }, e.data.url)
        }
      }
    })
  }

  render() {
    const {
      activeKey,
      a2pData,
      bankDataSource,
      disabled,
      isA2p,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const { loading, form, approvalHK, previewData, fileData, tenantId, queryBankInfoListLoading = false, bankInfoExportLoading = false } = this.props;
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
      }
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
      tenantId
    };
    const a2pProps = {
      data: a2pData,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
      form,
    };
    const bankTableProps = {
      form,
      rowKey: 'id',
      dataSource: bankDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      disabled
    };
    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: true,
      }),
    };

    const bankInfoColumnsRowSelection = {
      selectedRowKeysBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysBank: keys,
          selectedRowsBank: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: true,
      }),
    };

    const addressBankInfoProps = {
      ...this.props,
      addressBankInfoColumnsRowSelection,
      handleBankInfoList: this.handleBankInfoList,
      disabled: true,
    }

    const bankInfoProps = {
      ...this.props,
      bankInfoColumnsRowSelection,
      disabled: true,
    }
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
            <PreviewFinanceApprovalForm {...previewPurchaseApprovalFormProps}/>
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
          {isA2p === 'Y' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                  arrowActive={activeKey.includes('a2p')}
                />
              }
              key="a2p"
            >
              <A2PTable {...a2pProps}/>
            </Panel>
          )}
          {/* <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
              />
            }
            key="bank"
          >
            <BankTable {...bankTableProps}/>
          </Panel> */}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
                buttons={
                  <>
                    <CusButton
                      mini
                      onClick={this.handleExport}
                      loading={bankInfoExportLoading}
                    >
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton>
                  </>
                }
              />
            }
            key="bank"
          >
            <AddressBankInfoList {...addressBankInfoProps} />
            {isShowBankInfo && <div>
              <CusSpin spinning={queryBankInfoListLoading}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: ' 16px 0' }}>
                  {false && <p>{intl.get(`${prompt}.view.title.bank.info.label`).d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}</p>}
                  {false && <div style={{ marginRight: '32px'}}>
                    <CusButton
                      mini
                      onClick={this.handleDelBankData}
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </CusButton>
                    <CusButton
                      mini
                      type='primary'
                      onClick={this.handleAddBankData}
                    >
                      {intl.get('hzero.common.button.add').d('新增')}
                    </CusButton>
                    <CusButton
                      mini
                      type='primary'
                      onClick={this.saveBankInfoList}
                      loading={saveBankLoading}
                    >
                      {intl.get(`${prompt}.button.savebankinfo`).d('保存银行信息')}
                    </CusButton>
                  </div>}
                </div>
                <BankInfoList {...bankInfoProps} />
              </CusSpin>
            </div>}
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
