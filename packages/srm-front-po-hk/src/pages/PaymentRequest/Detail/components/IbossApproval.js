import React from 'react';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { Table, Card } from 'hzero-ui';
import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';

function IbossApproval({ ibossApproval, warnMsg }) {

  const handleToIboss = (busApprovedSceneId, circuitNumber) => {
    const { IBOSS_HOST } = process.env;
    const url = Base64.stringify(
      Utf8.parse(`/mks/cmi-unsla-query?mpType=10&apMenu=1&businessApprovedScene=${busApprovedSceneId}&circuitId=${circuitNumber}`
      )
    );
    window.open(`${IBOSS_HOST}/sso/iboss?Sys=eip&open=fs&url=${url}`)
  }

  const columns = [
    {
      title: intl.get('spcm.costPayment.view.ibossApproval.circuitNumber').d('客户电路编号'),
      dataIndex: 'circuitNumber',
      width: 150,
    },
    {
      title: intl.get('spcm.costPayment.view.ibossApproval.busApprovedScene').d('业务审批场景'),
      dataIndex: 'busApprovedSceneMeaning',
      width: 150,
      render:(val, record) => <a onClick={() => handleToIboss(record.busApprovedSceneId, record.circuitNumber)}>{val}</a>
    },
  ]

  return (
    <div style={{ marginTop: '-15px' }}>
      {warnMsg && (
        <Card
          key="information"
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={
            <h3>
              {intl.get(`spcm.costPayment.ibossApproval.title.information`).d('提示信息')}
            </h3>
          }
        >
          {warnMsg}
        </Card>
      )}
      {ibossApproval && (
        <Card
          key="approvalDetail"
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          style={{ marginBottom: '-16px' }}
          title={
            <h3>
              {intl.get(`spcm.costPayment.ibossApproval.title.approvalDetail`).d('数据业务特殊审批明细')}
            </h3>
          }
        >
          <Table rowKey="rowKey" bordered columns={columns} dataSource={ibossApproval} />
        </Card>
      )}
    </div>
  )
}

export default IbossApproval;
