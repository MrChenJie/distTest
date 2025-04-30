import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Table, Form, CheckBox, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Button, Col, Modal, Row } from 'hzero-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Icon } from 'choerodon-ui';
import styles from './index.less';
import SupplierBankInfo from '@/components/SupplierBankInfo';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import ChangeRecord from './ChangeRecord';

async function deleteBankInfo(bankInfoId) {
  return request(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-infos/${bankInfoId}`, {
    method: 'DELETE',
  });
}

export default function BankInfo({
  dataSet,
  detailInfoDS,
  costRequestId,
  currentNodeName,
  isOperator,
  isCreate,
  status,
  viewOnly,
  history,
  isCheckBankInfo,
}) {
  const [selectBankVisible, setSelectBankVisible] = useState(false);
  const [seeBankVisible, setSeeBankVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  let isEdit =
    isCreate ||
    (status === 'DRAFT' && isOperator) ||
    (currentNodeName.includes('起草人补充') &&
      isOperator &&
      detailInfoDS.current.get('bankReturnFlag') === 'Y') ||
    (currentNodeName === '15 起草人银行修改' && isOperator);
  isEdit = isEdit && !viewOnly;
  const vendorCompanyNum = detailInfoDS.current.get('vendorCompanyNum');
  const columns = [
    {
      name: 'bankApprovalStatusMeaning',
      width: 150,
    },
    {
      name: 'changeReqNum',
      width: 80,
      renderer: ({ record }) => (
        <a
          onClick={() => {
            handleJump(record);
          }}
        >
          {intl.get('hzero.common.button.view').d('查看')}
        </a>
      ),
    },
    {
      name: 'bankAccountName',
      width: 150,
    },
    {
      name: 'bankName',
      width: 400,
    },
    {
      name: 'bankAccountNum',
      width: 150,
    },
    {
      name: 'iban',
      width: 150,
    },
    {
      name: 'bankFirm',
      width: 150,
    },
    {
      name: 'poNumber',
      width: 150,
    },
  ];

  const renderBankReturnFlag = () => {
    const label = intl.get(`spcm.paymentRequest.view.detail.bankReturnFlag`).d('退回修改');
    return (
      <span>
        <span>{label}</span>
        <Tooltip
          title={intl
            .get('spcm.paymentRequest.view.bankReturnFlag.tooltip')
            .d(
              '勾选【退回修改】并点击补充材料将付款申请退回至起草人补充节点，起草人可修改银行信息'
            )}
        >
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </span>
    );
  };

  const handleJump = (record) => {
    if (record.data.bankSource === 'SPFM_COMPANY_BANK_ACCOUNT') {
      window.open(
        `/pub/spfm/participants-suppliers/viewOnly/preview/${record.data.basicCompanyId}`
      );
    } else if (record.data.bankSource === 'SPFM_COM_BANK_ACC_REQ') {
      window.open(`/pub/sslm/new-supplier-bank/viewOnly/detail/${record.data.changeReqId}`);
    }
  };

  const handleBankSelect = (data) => {
    if (dataSet.length >= 1 && dataSet.records[0].data.bankInfoId) {
      deleteBankInfo(dataSet.records[0].data.bankInfoId).then(() => {
        dataSet.query().then(() => {
          dataSet.create(
            {
              ...data,
              bankSource: data.sourceTable,
              bankSourceId: data.sourceId,
              bankApprovalStatus: data.approvalStatus,
              bankApprovalStatusMeaning: data.approvalStatusMeaning,
            },
            0
          );
        });
      });
    } else {
      dataSet.removeAll();
      dataSet.create(
        {
          ...data,
          bankSource: data.sourceTable,
          bankSourceId: data.sourceId,
          bankApprovalStatus: data.approvalStatus,
          bankApprovalStatusMeaning: data.approvalStatusMeaning,
        },
        0
      );
    }
    setSelectBankVisible(false);
  };
  const bankPermissions = isEdit && vendorCompanyNum && isCheckBankInfo;

  return (
    <>
      <Row>
        <Col span={12}>
          {['05 财务第一复核人审批', '06 财务第二复核人审批'].includes(currentNodeName) && (
            <div className={styles['bank-info-form']}>
              <Form
                dataSet={detailInfoDS}
                columns={3}
                labelLayout={LabelLayout.horizontal}
                labelWidth={150}
                useColon
                labelAlign="right"
              >
                <CheckBox
                  name="bankReturnFlag"
                  label={renderBankReturnFlag()}
                  disabled={viewOnly}
                />
              </Form>
            </div>
          )}
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: '4px', textAlign: 'right' }}>
            <Button
              onClick={() => {
                setRecordVisible(true);
              }}
              style={{ marginRight: '8px' }}
            >
              {intl.get('spcm.costPayment.view.button.changeRecord').d('变更记录')}
            </Button>
            {!bankPermissions && (
              <Button
                type="primary"
                onClick={() => {
                  setSeeBankVisible(true);
                }}
              >
                {intl.get('spcm.paymentRequest.view.button.seeBank').d('查看银行信息')}
              </Button>
            )}
            {bankPermissions && (
              <Button
                type="primary"
                onClick={() => {
                  const currencyCode = detailInfoDS.current.get('currency');
                  const companyOrgCode = detailInfoDS.current.get('companyOrgCode');
                  if (isEmpty(currencyCode) || isEmpty(companyOrgCode)) {
                    notification.warning({
                      message: intl
                        .get(`spcm.paymentRequest.message.warning.currencyAndcompanyOrgCode.notNull`)
                        .d('付款CMI主体及发票币种尚未选择，请选择后再选择银行信息；'),
                    });
                    return;
                  }
                  setSelectBankVisible(true);
                }}
              >
                {intl.get('spcm.paymentRequest.view.button.selectBank').d('选择银行信息')}
              </Button>
            )}
          </div>
        </Col>
      </Row>
      <Table dataSet={dataSet} columns={columns} />
      {selectBankVisible && (
        <Modal
          title={intl.get('spcm.paymentRequest.view.selectSupplierBank').d('选择供应商银行')}
          visible={selectBankVisible}
          onCancel={() => setSelectBankVisible(false)}
          width={1000}
          destroyOnClose
          footer={null}
        >
          <SupplierBankInfo
            history={history}
            onOk={(data) => handleBankSelect(data)}
            onCancel={() => setSelectBankVisible(false)}
            vendorCompanyNum={vendorCompanyNum}
            costRequestId={costRequestId}
            bankModifyFlag={currentNodeName === '15 起草人银行修改' && isOperator}
            currencyCode={detailInfoDS.current.get('currency')}
            companyOrgCode={detailInfoDS.current.get('companyOrgCode')}
          />
        </Modal>
      )}
      {seeBankVisible && (
        <Modal
          title={intl.get('spcm.paymentRequest.view.seeSupplierBank').d('查看供应商银行')}
          visible={seeBankVisible}
          onCancel={() => setSeeBankVisible(false)}
          width={1000}
          destroyOnClose
          footer={null}
        >
          <SupplierBankInfo
            history={history}
            isOnlyView={true}
            onCancel={() => setSelectBankVisible(false)}
            vendorCompanyNum={vendorCompanyNum}
            costRequestId={costRequestId}
            currencyCode={detailInfoDS.current.get('currency')}
            companyOrgCode={detailInfoDS.current.get('companyOrgCode')}
          />
        </Modal>
      )}
      {recordVisible && (
        <Modal
          title={intl.get('spcm.costPayment.view.title.bankChangeRecord').d('付款申请银行变更记录')}
          visible={recordVisible}
          onCancel={() => setRecordVisible(false)}
          width={1000}
          destroyOnClose
          footer={null}
        >
          <ChangeRecord costRequestId={costRequestId} />
        </Modal>
      )}
    </>
  );
}
