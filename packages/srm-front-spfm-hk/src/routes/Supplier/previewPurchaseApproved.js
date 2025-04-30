/**
 * 供应商查询 - 预览采购审批
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/23
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
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusSpin from '_cus_components/CusSpin';
import { Checkbox, Form } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';
import '../AccessToSuppliers/index.less';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import PreviewPurchaseBasicInfoForm from '@/routes/Supplier/components/PreviewPurchaseBasicInfoForm';
import ClientTable from '@/routes/Supplier/components/ClientTable';
import BankTable from '@/routes/Supplier/components/BankTable';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';
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
  saveBankLoading: loading.effects['supplierHK/saveBankInfoList'],
  bankInfoExportLoading: loading.effects['supplierHK/bankInfoExport'],
  supplierCheckData: supplierHK.supplierCheckData || {},
  tenantId: getCurrentOrganizationId()
}))

export default class PreviewPurchaseApproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'client', 'bank', 'attachment', 'a2p'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      customersDataSource: [], // 客户信息Table data
      bankDataSource: [], // 银行信息Table data
      attachmentDataSource: [], // 公司附件信息Table data
      disabled: true,
      supplierId: null,
      isActivityFinished: 'F', // 当前流程状态 F 已结束 T未结束
      a2pData: {}, // a2p信息
      isA2p: false,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    };
    this.platform = {};
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
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

  handleAttachmentChange(data = []) {
    this.setState({ attachmentDataSource: data });
  }

  /**
   * 供应商预览详情
   */
  @Bind()
  async getSupplierDetailData() {
    const { location: { search }, dispatch } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    await dispatch({
      type: 'supplierHK/previewSupplierDetail',
      payload: {
        supplierId: supplierId || formRecordId
      }
    }).then(res => {
      if(res) {
        this.setState({
          contactPersonDataSource: res?.contacts,
          customersDataSource: res?.customers,
          supplierId: res?.head?.id,
          isA2p: res?.line?.isA2p === 'Y',
        })
      }
    })
    await dispatch({
      type: 'supplierHK/previewSupplierBankDetail',
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
    await dispatch({
      type: 'supplierHK/getNodeInfo',
      payload: {
        formRecordId: supplierId || formRecordId,
        templateCode: 'BMP-CGGYSZR'
      }
    }).then(res => {
      this.setState({
        isActivityFinished: res?.isActivityFinished
      });
    })
    await dispatch({
      type: 'supplierHK/previewSupplierAttachmentDetail',
      payload: {
        supplierId: supplierId || formRecordId,
        refType: ''
      }
    }).then(res => {
      if(res){
        this.setState({
          attachmentDataSource: res
        });
      }
    })
    await dispatch({
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
        render: (values, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
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

  // 删除银行地址信息
  handleDelAddressBankData = () => {
    const { dispatch, supplierHK } = this.props;
    const { addressBankInfoDataSource = [] } = supplierHK;
    const { selectedRowKeysAddressBank, selectedRowsAddressBank } = this.state;
    if(selectedRowKeysAddressBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = addressBankInfoDataSource.filter(
          (item) => selectedRowKeysAddressBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'supplierHK/deleteAddressBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              this.handleAddressBankInfoList();
            }
          })
        } else {
          // 本地删除
          const newDataSource = addressBankInfoDataSource.filter((item) => !selectedRowKeysAddressBank.includes(item['rowKey']));
          dispatch({
            type: 'supplierHK/updateState',
            payload: {
              addressBankInfoDataSource: newDataSource,
            },
          });
          this.setState({
            selectedRowKeysAddressBank: [],
            selectedRowsAddressBank: [],
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  // 新增银行地址信息
  handleAddAddressBankData = () => {
    const { supplierHK, dispatch, initialValues } = this.props;
    const { supplierId, formRecordId } = queryString.parse(this.props.location.search.substring(1));

    console.log('this.props', this.props);
    
    const {
      addressBankInfoDataSource = [],
    } = supplierHK;

    // 判断是否已有主地址
    const hasMainAddress = addressBankInfoDataSource.some(item => item.isMainAddress === 'Y');
    const newIsMainAddress = hasMainAddress ? 'N' : 'Y';

    const newDataSource = [
      ...addressBankInfoDataSource,
      {
        payerAddress: initialValues.addressEn, // 默认公司地址英文
        payerAccountName: initialValues.companyNameEn, // 默认公司名称英文
        isMainAddress: newIsMainAddress, // 默认主地址
        addressStatus: 'Y', // 默认生效
        _status: 'create',
        rowKey: uuid(),
        refSupId: supplierId || formRecordId,
      }
    ];

    dispatch({
      type: 'supplierHK/updateState',
      payload: {
        addressBankInfoDataSource: newDataSource,
      },
    })
  }

  // 删除银行明细信息
  handleDelBankData = () => {
    const { dispatch, supplierHK } = this.props;
    const { bankInfoListDataSource = [] } = supplierHK;
    const { selectedRowKeysBank, selectedRowsBank } = this.state;
    if(selectedRowKeysBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = bankInfoListDataSource.filter(
          (item) => selectedRowKeysBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'supplierHK/deleteBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
              dispatch({
                type: 'supplierHK/updateState',
                payload: {
                  bankInfoListDataSource: newDataSource,
                },
              });
              this.setState({
                selectedRowKeysBank: [],
                selectedRowsBank: [],
              })
            }
          })
        } else {
          // 本地删除
          const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
          dispatch({
            type: 'supplierHK/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            },
          });
          this.setState({
            selectedRowKeysBank: [],
            selectedRowsBank: [],
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  // 新增银行明细信息
  handleAddBankData = () => {
    const { supplierHK, dispatch, initialValues } = this.props;

    const { addressBankRecord = {} } = this.state;

    console.log('this.props', this.props);
    
    const {
      bankInfoListDataSource = [],
    } = supplierHK;

    // 将所有现有账号的 isMain 设为 N
    const updatedDataSource = bankInfoListDataSource.map(item => ({ ...item, isMain: 'N', bankStatus: 'N' }));

    const newDataSource = [
      ...updatedDataSource.map((item) => ({
        ...item,
        bindBankId: addressBankRecord.rowKey,
      })),
      {
        accountName: initialValues.companyNameEn, // 默认公司名称英文
        isMain: 'Y', // 默认主账号
        bankStatus: 'Y', // 默认生效
        _status: 'create',
        rowKey: uuid(),
        bindBankId: addressBankRecord.rowKey,
        refHeadId: addressBankRecord.id,
      }
    ];

    dispatch({
      type: 'supplierHK/updateState',
      payload: {
        bankInfoListDataSource: newDataSource,
      },
    })
  }

  render() {
    const {
      activeKey,
      contactPersonDataSource,
      customersDataSource,
      disabled,
      bankDataSource,
      attachmentDataSource,
      isActivityFinished,
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
      saveBankLoading = false,
      queryBankInfoListLoading = false,
      bankInfoExportLoading = false,
    } = this.props;
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const basicFormProps = {
      initialValues: {
        ...previewData.head,
        ...previewData.line,
      },
      isActivityFinished
    };
    const contactTableProps = {
      dataSource: contactPersonDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
    };
    const customersTableProps = {
      dataSource: customersDataSource,
      otherDataSource: customersDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: true
        })
      },
      rowKey: 'id',
      readOnly: disabled
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
      readOnly: disabled,
      handleAttachmentChange: this.handleAttachmentChange
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
            <PreviewPurchaseBasicInfoForm
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
            <ClientTable {...customersTableProps}/>
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
          {/* {
            isActivityFinished === 'T' && (
              <Panel
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
              </Panel>
            )
          } */}

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
                    {false && <div>
                      <CusButton
                        mini
                        onClick={this.handleDelAddressBankData}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                      <CusButton
                        mini
                        type='primary'
                        onClick={this.handleAddAddressBankData}
                      >
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </div>}
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
