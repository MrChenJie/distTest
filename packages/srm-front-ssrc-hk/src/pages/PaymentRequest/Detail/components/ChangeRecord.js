import React, { useEffect, useState } from 'react';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Card, Col, Row, Table } from 'hzero-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { isEmpty } from 'lodash';

async function auditBankInfo(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-audits/queryPaymentBankAuditInfo/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}

export default function ChangeRecord({ costRequestId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    auditBankInfo(costRequestId).then((res) => {
      if (getResponse(res)) {
        setData(res);
      }
    });
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'changeStatus',
      width: 100,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.bankApprovalStatus').d('审批状态'),
      dataIndex: 'bankApprovalStatusMeaning',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.bankAccountName').d('银行账户名称'),
      dataIndex: 'bankAccountName',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.bankName').d('收款银行'),
      dataIndex: 'bankName',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.bankAccountNum').d('收款银行账号'),
      dataIndex: 'bankAccountNum',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.bankFirm').d('SWIFT Code'),
      dataIndex: 'bankFirm',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.changeRecord.cnapsCode').d('National ID(银行联行号)'),
      dataIndex: 'cnapsCode',
      width: 150,
    },
  ];

  if (isEmpty(data)) {
    return (
      <div style={{ textAlign: 'center' }}>
        {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
      </div>
    )
  } else {
    return data.map((item, index) => {
      return (
        <Card
          key={index}
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={
            <div>
              <Row>
                <Col
                  span={5}
                  style={{ border: '1px solid #e8e8e8', textAlign: 'center', padding: '2px 0' }}
                >
                  <span title={item.auditDate}>{`NO.${index + 1}`}</span>&nbsp;&nbsp;
                  <span>{item.auditDate}</span>
                </Col>
                <Col
                  span={5}
                  style={{
                    borderTop: '1px solid #e8e8e8',
                    borderBottom: '1px solid #e8e8e8',
                    textAlign: 'center',
                    padding: '2px 0',
                  }}
                >
                  <span title={item.auditLoginName}>{item.auditLoginName}</span>
                </Col>
                <Col
                  span={5}
                  style={{ border: '1px solid #e8e8e8', textAlign: 'center', padding: '2px 0' }}
                >
                  <span title={item.auditTypeMeaning}>{item.auditTypeMeaning}</span>
                </Col>
              </Row>
            </div>
          }
          loading={false}
        >
          <Table
            rowKey="rowKey"
            bordered
            columns={columns}
            pagination={false}
            dataSource={[
              {
                changeStatus: intl
                  .get('spcm.costPayment.view.changeRecord.beforeChange')
                  .d('变更前'),
                ...item.lastAuditDataMap,
              },
              {
                changeStatus: intl
                  .get('spcm.costPayment.view.changeRecord.afterChange')
                  .d('变更后'),
                ...item.nextAuditDataMap,
              },
            ]}
          />
        </Card>
      );
    });
  }
}
