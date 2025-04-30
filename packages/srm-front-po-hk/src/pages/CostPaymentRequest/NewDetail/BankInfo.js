/** 银行信息
 * @Description:
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Col, Row, Form, Checkbox } from 'hzero-ui';
import SupplierBankInfo from '@/components/SupplierBankInfoNew';
import ChangeRecord from './components/ChangeRecord';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import { labelTip } from '_cus_utils/render';

const prompt = 'spcm.costPayment';

@connect(({ costRequest, loading }) => ({
  costRequest,
  queryLoading: loading.effects['costRequest/queryBankInfo'],
  deleteLoading: loading.effects['costRequest/deleteBankInfo'],
}))
class BankInfo extends Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      selectBankVisible: false,
      seeBankVisible: false,
      recordVisible: false,
      dataSource: [],
    };
  }

  @Bind()
  queryBankInfo() {
    const { costRequestId, dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'costRequest/queryBankInfo',
        payload: costRequestId,
      }).then((res) => {
        if (res) {
          if (isEmpty(res)) {
            this.setState({
              dataSource: [],
            });
          } else {
            this.setState({
              dataSource: [res],
            });
          }
          resolve(res);
        } else {
          reject();
        }
      });
    });
  }

  @Bind
  handleJump(record) {
    if (record.bankSource === 'SPFM_COMPANY_BANK_ACCOUNT') {
      window.open(`/pub/spfm/participants-suppliers/viewOnly/preview/${record.basicCompanyId}`);
    } else if (record.bankSource === 'SPFM_COM_BANK_ACC_REQ') {
      window.open(`/pub/sslm/new-supplier-bank/viewOnly/detail/${record.changeReqId}`);
    }
  }

  @Bind
  async handleBankSelect(data) {
    const { dataSource } = this.state;
    if (dataSource.length === 1 && dataSource[0].bankInfoId) {
      this.handleDeleteBank().then(() => {
        this.setState({
          dataSource: [
            {
              ...data,
              bankSource: data.sourceTable,
              bankSourceId: data.sourceId,
              bankApprovalStatus: data.approvalStatus,
              bankApprovalStatusMeaning: data.approvalStatusMeaning,
            },
          ],
        });
      });
    } else {
      this.setState({
        dataSource: [
          {
            ...data,
            bankSource: data.sourceTable,
            bankSourceId: data.sourceId,
            bankApprovalStatus: data.approvalStatus,
            bankApprovalStatusMeaning: data.approvalStatusMeaning,
          },
        ],
      });
    }
    this.setState({
      selectBankVisible: false,
    });
  }

  @Bind
  handleTempDeleteBank() {
    this.setState({
      dataSource: [],
    });
  }

  @Bind
  async handleDeleteBank() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    try {
      await dispatch({
        type: 'costRequest/deleteBankInfo',
        payload: dataSource[0].bankInfoId,
      });
      await this.queryBankInfo();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  }

  @Bind
  getButtons(form, fileFlag, defaultFlag, isCheckBankInfo = true, bankModifyFlag) {
    const isEdit =
      defaultFlag || (form.getFieldValue('bankReturnFlag') === 'Y' && fileFlag) || bankModifyFlag;
    const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');
    const bankPermissions = isEdit && vendorCompanyNum && isCheckBankInfo;

    return [
      <div key="bankInfoButtons">
        <CusButton
          mini
          onClick={() => {
            this.setState({
              recordVisible: true,
            });
          }}
        >
          {intl.get('spcm.costPayment.view.button.changeRecord').d('变更记录')}
        </CusButton>
        {!bankPermissions && (
          <CusButton
            mini
            type="primary"
            onClick={() => {
              this.setState({
                seeBankVisible: true,
              });
            }}
          >
            {intl.get('spcm.costPayment.view.button.seeBank').d('查看银行信息')}
          </CusButton>
        )}
        {bankPermissions && (
          <CusButton
            mini
            type="primary"
            onClick={() => {
              const currencyCode = form.getFieldValue('currencyCode');
              const companyOrgCode = form.getFieldValue('companyOrgCode');
              if (isEmpty(currencyCode) || isEmpty(companyOrgCode)) {
                CusNotification.error({
                  message: intl
                    .get(`spcm.costPayment.message.warning.currencyAndcompanyOrgCode.notNull`)
                    .d('付款CMI主体及发票币种尚未选择，请选择后再选择银行信息；'),
                });
                return;
              }
              this.setState({
                selectBankVisible: true,
              });
            }}
          >
            {intl.get('spcm.costPayment.view.button.selectBank').d('选择银行信息')}
          </CusButton>
        )}
      </div>,
    ];
  }

  render() {
    const {
      form,
      headerData = {},
      costRequestId,
      financeFlag,
      currentOperatorFlag,
      history,
      bankModifyFlag,
    } = this.props;
    const { dataSource, selectBankVisible, seeBankVisible, recordVisible } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.model.bankInfo.bankApprovalStatus`).d('审批状态'),
        dataIndex: 'bankApprovalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.detail`).d('详情'),
        dataIndex: 'changeReqNum',
        width: 80,
        render: (_, record) => (
          <a
            onClick={() => {
              this.handleJump(record);
            }}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get(`${prompt}.model.bankInfo.bankAccountName`).d('银行账户名称'),
        dataIndex: 'bankAccountName',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.model.bankInfo.bankName`).d('收款银行'),
        dataIndex: 'bankName',
        width: 450,
      },
      {
        title: intl.get(`${prompt}.model.bankInfo.bankAccountNum`).d('收款银行账号'),
        dataIndex: 'bankAccountNum',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.model.bankInfo.iban`).d('IBAN'),
        dataIndex: 'iban',
        width: 150,
      },
      {
        title: intl.get(`${prompt}.model.bankInfo.bankFirm`).d('SWIFT Code'),
        dataIndex: 'bankFirm',
        width: 150,
      },
    ];

    const vendorCompanyNum = form.getFieldValue('vendorCompanyNum');

    return (
      <>
        {(financeFlag || currentOperatorFlag) && (
          <Row style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Form className="customize-form">
                <Form.Item
                  label={labelTip({
                    label: intl.get(`spcm.costPayment.view.detail.bankReturnFlag`).d('退回修改'),
                    tip: intl
                      .get('spcm.costPayment.view.bankReturnFlag.tooltip')
                      .d(
                        '勾选【退回修改】并点击补充材料将付款申请退回至起草人补充节点，起草人可修改银行信息'
                      ),
                  })}
                >
                  {form.getFieldDecorator('bankReturnFlag', {
                    initialValue: headerData.bankReturnFlag || 'N',
                  })(<Checkbox checkedValue="Y" unCheckedValue="N" />)}
                </Form.Item>
              </Form>
            </Col>
          </Row>
        )}
        <CusTable rowKey="bankInfoId" dataSource={dataSource} columns={columns} />
        {selectBankVisible && (
          <CusModal
            title={intl.get('spcm.costPayment.view.selectSupplierBank').d('选择供应商银行')}
            visible={selectBankVisible}
            onCancel={() => {
              this.setState({
                selectBankVisible: false,
              });
            }}
            width={1000}
            destroyOnClose
            footer={null}
            marginBottom={40}
          >
            <SupplierBankInfo
              history={history}
              onCancel={() => {
                this.setState({
                  selectBankVisible: false,
                });
              }}
              onOk={(data) => this.handleBankSelect(data)}
              vendorCompanyNum={vendorCompanyNum}
              costRequestId={costRequestId}
              bankModifyFlag={bankModifyFlag}
              currencyCode={form.getFieldValue('currencyCode')}
              companyOrgCode={form.getFieldValue('companyOrgCode')}
            />
          </CusModal>
        )}
        {seeBankVisible && (
          <CusModal
            title={intl.get('spcm.costPayment.view.seeSupplierBank').d('查看供应商银行')}
            visible={seeBankVisible}
            onCancel={() => {
              this.setState({ seeBankVisible: false });
            }}
            cancelText={intl.get('hzero.common.button.close').d('关闭')}
            width={1000}
            destroyOnClose
          >
            <SupplierBankInfo
              history={history}
              isOnlyView={true}
              onCancel={() => {
                this.setState({ seeBankVisible: false });
              }}
              vendorCompanyNum={vendorCompanyNum}
              costRequestId={costRequestId}
            />
          </CusModal>
        )}
        {recordVisible && (
          <CusModal
            title={intl
              .get('spcm.costPayment.view.title.bankChangeRecord')
              .d('付款申请银行变更记录')}
            visible={recordVisible}
            onCancel={() => {
              this.setState({ recordVisible: false });
            }}
            cancelText={intl.get('hzero.common.button.close').d('关闭')}
            width={1000}
            destroyOnClose
          >
            <ChangeRecord costRequestId={costRequestId} />
          </CusModal>
        )}
      </>
    );
  }
}

export default BankInfo;
