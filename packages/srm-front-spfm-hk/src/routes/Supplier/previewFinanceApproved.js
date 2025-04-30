/**
 * 供应商查询 - 财务供应商已审批预览
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/24
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
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import EditTable from '_cus_components/EditTable';
import { Checkbox, Form } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';
import '../AccessToSuppliers/index.less';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import BankTable from '@/routes/Supplier/components/BankTable';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';
import PreviewFinanceBasicInfoForm from '@/routes/Supplier/components/PreviewFinanceBasicInfoForm';
import A2PTable from '@/routes/Supplier/components/A2PTable';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  previewData: supplierHK.previewData || {},
  loading: loading.effects['supplierHK/previewSupplierDetail'],
  queryBankInfoListLoading: loading.effects['supplierHK/getBankInfoList'],
  bankInfoExportLoading: loading.effects['supplierHK/bankInfoExport'],
  supplierCheckData: supplierHK.supplierCheckData || {},
  tenantId: getCurrentOrganizationId()
}))

export default class PreviewFinanceApproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'a2p', 'bank', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      customersDataSource: [], // 客户信息Table data
      bankDataSource: [], // 银行信息Table data
      attachmentDataSource: [], // 公司附件信息Table data
      a2pData: {}, // a2p信息
      disabled: true,
      supplierId: null,
      isA2p: false,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    };
    this.platform = {};
  }

  componentDidMount() {
    this.getSupplierDetailData();
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
      type: 'supplierHK/getAddressBankInfoList',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res?.map((item) => ({
          ...item,
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
    } = this.props;
    if(record?.id) {
      dispatch({
        type: 'supplierHK/getBankInfoList',
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
  
  // 银行信息导出
  @Bind()
  handleExport() {
    const {
      dispatch,
      location: { search },
     } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/bankInfoExport',
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
          contactPersonDataSource: res?.contacts || [],
          customersDataSource: res?.customers || [],
          supplierId: res?.head?.id,
          isA2p: res?.line?.isA2p === 'Y',
        })
      }
    })
    dispatch({
      type: 'supplierHK/previewSupplierBankDetail',
      payload: {
        supplierId
      }
    }).then(res => {
      if(res){
        this.setState({
          bankDataSource: res
        });
      }
    })
    dispatch({
      type: 'supplierHK/previewSupplierAttachmentDetail',
      payload: {
        supplierId,
        refType: 'bank'
      }
    }).then(res => {
      if(res){
        this.setState({
          attachmentDataSource: res
        });
      }
    })
    dispatch({
      type: 'supplierHK/previewSupplierA2pDetail',
      payload: {
        supplierId,
      }
    }).then(res => {
      if(res){
        this.setState({
          a2pData: res
        });
      }
    })
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    return [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'typeMeaning',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        width: 200,
        align: 'left',
        render: (value, record) => {
          const { getFieldDecorator } = this.props.form;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${record.id}`, {
                initialValue: record.isDefault || 'N'
              })(<Checkbox checked={record.isDefault === 'Y'}
                           checkedValue="Y"
                           unCheckedValue="N"
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      disabled,
      bankDataSource,
      attachmentDataSource,
      a2pData,
      isA2p,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const {
      form,
      loading,
      previewData,
      supplierHK,
      queryBankInfoListLoading = false,
      bankInfoExportLoading = false,
    } = this.props;
    const basicFormProps = {
      initialValues: {
        ...previewData.head,
        ...previewData.line,
      }
    };
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const contactTableProps = {
      dataSource: contactPersonDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
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
      readOnly: disabled
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
      readOnly: disabled
    }
    const a2pProps = {
      data: a2pData,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
      form,
      disabled: true
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
          {/* 基本信息 */}
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
            <PreviewFinanceBasicInfoForm
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
              />
            }
            key="contact"
          >
            <EditTable
              bordered
              pagination={false}
              columns={contactPersonTableColumns}
              rowKey="id"
              {...contactTableProps}
            />
          </Panel>
          {isA2p && (
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
                title={intl.get(`${prompt}.view.title.bank.attachment`).d('银行附件')}
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
