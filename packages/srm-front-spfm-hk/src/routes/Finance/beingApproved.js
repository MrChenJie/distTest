/**
 * 供应商财务信息 - 财务信息变更单（审批中）
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/18
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Col, Collapse, Row } from 'antd';
const { Panel } = Collapse;
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import BankTable from '@/routes/Finance/components/BankTable';
import AttachmentTable from '@/routes/Finance/components/AttachmentTable';
import HeaderForm from '@/routes/Finance/components/HeaderForm';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { EMAIL } from 'utils/regExp';
import formatterCollections from 'utils/intl/formatterCollections';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  financeUpdateInfo: supplierHK.financeUpdateInfo || {},
  loading: loading.effects['supplierHK/financeUpdateInfoDetail'],
  queryBankInfoListLoading: loading.effects['supplierHK/getEditBankInfoList'],
  bankInfoEditExportLoading: loading.effects['supplierHK/bankInfoEditExport'],
  tenantId: getCurrentOrganizationId()
}))
export default class BeingApproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicInfo', 'bank', 'bankAttachment', 'a2pInfo'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      bankInfoDataSource: [], // 银行信息Table data
      attachmentDataSource: [], // 附件信息Table data
      a2pContactDataSource: [], // a2p联系人信息Table data
      a2pAccountDataSource: [], // a2p账号信息Table data
      isA2p: 'N',
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
    this.platform = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.queryFinanceUpdateInfoDetail();
    dispatch({
      type: 'supplierHK/init',
    })
    // 查询变更单的供应商地址信息
    this.handleEditIdAddressBankInfoList();
  }

  // 变更id查询银行信息
  @Bind()
  handleEditIdAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/getEditAddressBankInfoList',
      payload: {
        supplierId: formRecordId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          isMainAddressFlagY: item?.isMainAddress === 'Y' ? 'Y' : 'N', // 保存时用来判断的主地址
          rowKey: uuid(),
          _status:'update',
        }))
        dispatch({
          type: 'supplierHK/updateState',
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
      location: { search },
    } = this.props;
    if(record?.id) {
      dispatch({
        type: 'supplierHK/getEditBankInfoList',
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
            type: 'supplierHK/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            }
          })
        }
      })
    } else {
      dispatch({
        type: 'supplierHK/updateState',
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

  // 变更Id银行信息导出
  @Bind()
  handleEditExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/bankInfoEditExport',
      payload: {
        supplierId: formRecordId,
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

  /**
   * 查询供应商财务信息更新单详情
   */
  @Bind()
  queryFinanceUpdateInfoDetail() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber, formRecordId } = queryString.parse(search.substring(1));
    let supplierName;
    let formData;
    dispatch({
      type: 'supplierHK/financeUpdateInfoDetail',
      payload: {
        applyNumber: applyNumber || formRecordId
      }
    }).then(res => {
      console.log(res);
      formData = res;
      supplierName = res?.editHead?.companyNameCh;
      this.setState({
        isA2p: res?.editHead?.isA2p,
        bankInfoDataSource: res?.banks || [],
        attachmentDataSource: res?.attachments || [],
        a2pContactDataSource: res?.a2pAll?.contacts || [],
        a2pAccountDataSource: res?.a2pAll?.account || [],
      })
    })
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
              formRecordId: applyNumber || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.financeinfo.update`).d('供应商银行信息更新：') + supplierName, //待办流程名称
              ...formData,
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
              formRecordId: applyNumber || formRecordId,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.financeinfo.update`).d('供应商银行信息更新：') + supplierName, //待办流程名称
              ...formData,
            }
          }, e.data.url)
        }
      }
    })
  }

  // 联系人表格
  @Bind()
  contactTypeColumns() {
    const { form } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.supplier.contact.type`).d('A2P业务联系人类型'),
        dataIndex: 'typeMeaning',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.person.name`).d('A2P业务联系人姓名'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.mailbox`).d('A2P业务联系人邮箱'),
        dataIndex: 'email',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.position`).d('A2P业务联系人职位'),
        dataIndex: 'position',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.phone.number`).d('A2P业务联系人电话'),
        dataIndex: 'phone',
        width: 200,
      },
    ]
  }
  // 账号表格
  @Bind()
  accountColumns() {
    const { form } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.access.account`).d('接入账号'),
        dataIndex: 'account',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.access.method`).d('接入方式'),
        dataIndex: 'method',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.protocol`).d('Protocol'),
        dataIndex: 'protocol',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.settlement.mode`).d('结算模式'),
        dataIndex: 'captiveModel',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.tps`).d('TPS'),
        dataIndex: 'tps',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.ip`).d('IP'),
        dataIndex: 'ip',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.session`).d('Session'),
        dataIndex: 'accountSession',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.a2p.special.configuration.instructions`).d('特殊配置说明'),
        dataIndex: 'specialConfiguration',
        width: 200,
      },
    ]
  }

  render() {
    const {
      activeKey,
      bankInfoDataSource,
      attachmentDataSource,
      a2pContactDataSource,
      a2pAccountDataSource,
      isA2p,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const {
      supplierHK,
      form,
      financeUpdateInfo,
      tenantId,
      queryBankInfoListLoading = false,
      bankInfoEditExportLoading = false,
    } = this.props;
    const { a2p = {}, a2pAll = {} } = financeUpdateInfo;
    const { getFieldDecorator } = form;
    const headFormProps = {
      initialValues: {
        ...financeUpdateInfo?.editHead,
        ...financeUpdateInfo?.lineEdit,
      },
      disabled: true
    };
    const bankTableProps = {
      form,
      rowKey: 'uuid',
      dataSource: bankInfoDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      readOnly: true
    };
    const attachmentTableProps = {
      supplierHK,
      form,
      rowKey: 'uuid',
      dataSource: attachmentDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      tenantId,
      readOnly: true
    };
    const a2pContactTableProps = {
      rowKey: 'uuid',
      dataSource: a2pContactDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
    };
    const a2pAccountTableProps = {
      rowKey: 'uuid',
      dataSource: a2pAccountDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
    };
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    const contactTypeColumns = this.contactTypeColumns();
    const accountColumns = this.accountColumns();
 
    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true
      })
    };

    const bankInfoColumnsRowSelection = {
      selectedRowKeysBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysBank: keys,
          selectedRowsBank: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true
      })
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
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('basicInfo')}
              />
            }
            key="basicInfo"
          >
            <HeaderForm
              onRef={ref => this.platform = ref}
              {...headFormProps}
            />
          </Panel>
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
                      onClick={this.handleEditExport}
                      loading={bankInfoEditExportLoading}
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
                      onClick={this.saveAllBankInfoList}
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
                title={intl.get(`${prompt}.view.title.bank.attachment`).d('银行附件')}
                arrowActive={activeKey.includes('bankAttachment')}
              />
            }
            key="bankAttachment"
          >
            <AttachmentTable {...attachmentTableProps}/>
          </Panel>
          {isA2p === 'Y' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                  arrowActive={activeKey.includes('a2pInfo')}
                />
              }
              key="a2pInfo"
            >
              <div className="customize-form">
                <Row gutter={24}>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件')}>
                      {getFieldDecorator('quoteEmail', {
                        rules: [
                          {
                            required: true,
                          },
                          {
                            pattern: EMAIL,
                            message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                          },
                        ],
                        initialValue: a2p?.quoteEmail || a2pAll?.a2p?.quoteEmail
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期')}>
                      {getFieldDecorator('priceIncreaseNotice', {
                        rules: [{
                          required: true,
                        }],
                        initialValue: a2p?.priceIncreaseNotice || a2pAll?.a2p?.priceIncreaseNotice
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.credit.limit`).d('Credit Limit')}>
                      {getFieldDecorator('creditLimit', {
                        initialValue: a2p?.creditLimit || a2pAll?.a2p?.creditLimit
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件')}>
                      {getFieldDecorator('settlementCondition',  {
                        rules: [{
                          required: true,
                        }],
                        initialValue: a2p?.settlementCondition || a2pAll?.a2p?.settlementCondition
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账号邮箱')}>
                      {getFieldDecorator('settlementEmail',  {
                        rules: [
                          {
                            required: true,
                          },
                          {
                            pattern: EMAIL,
                            message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                          },
                        ],
                        initialValue: a2p?.settlementEmail || a2pAll?.a2p?.settlementEmail
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限')}>
                      {getFieldDecorator('paymentDeadline',  {
                        rules: [{
                          required: true,
                        }],
                        initialValue: a2p?.paymentDeadline || a2pAll?.a2p?.paymentDeadline
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.sla`).d('SLA')}>
                      {getFieldDecorator('sla', {
                        initialValue: a2p?.sla || a2pAll?.a2p?.sla
                      })(<CusInput allowClear
                                   disabled
                      />)}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <br/>
              <EditTable
                bordered
                pagination={false}
                columns={contactTypeColumns}
                {...a2pContactTableProps}
              />
              <br/>
              <EditTable
                bordered
                pagination={false}
                columns={accountColumns}
                {...a2pAccountTableProps}
              />
            </Panel>
          )}
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
        </Collapse>
      </PageWrapper>
    )
  }
}
