import React, { useEffect, useState } from 'react';
import cusRequest from '_cus_utils/request';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { TextItem } from '_cus_utils/render';
import { isEmpty } from 'lodash';
import CusTable from '_cus_components/CusTable';

async function auditBankInfo(costRequestId) {
  return cusRequest(
    `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-audits/queryPaymentBankAuditInfo/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}
const prompt = 'spcm.costPayment';

export default function ChangeRecord({ costRequestId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    auditBankInfo(costRequestId).then((res) => {
      if (cusGetResponse(res)) {
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
    );
  } else {
    return data.map((item, index) => {
      return (
        <div key={index}>
          {TextItem([
            {
              label: `NO.${index + 1}`,
            },
            {
              label: intl.get(`${prompt}.model.ChangeRecord.auditByName`).d('修改人:'),
              value: item.auditLoginName,
            },
            {
              label: intl.get(`${prompt}.model.ChangeRecord.auditDate`).d('修改时间:'),
              value: item.auditDate,
            },
            {
              label: intl.get(`${prompt}.model.ChangeRecord.auditNode`).d('修改节点:'),
              value: item.auditTypeMeaning,
            },
          ])}
          <CusTable
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
        </div>
      );
    });
  }
}
