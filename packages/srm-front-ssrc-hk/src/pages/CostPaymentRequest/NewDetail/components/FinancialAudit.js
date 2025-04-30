import React, { useState } from 'react';
import intl from 'utils/intl';
import {
  getCurrentLanguage,
  isTenantRoleLevel,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import PanelHeader from '_cus_components/CusCollapse';
import styled from 'styled-components';

const organizationId = getCurrentOrganizationId();
const prompt = 'spcm.costPayment';
const WrapDiv = styled.div`
  ul {
    padding-left: 0px;
  }
  li {
    list-style: none;
  }
`;

const FinancialAudit = ({ idpValueMap }) => {
  const [visible, setVisible] = useState(false);

  const handleFinancialAuditDownload = () => {
    const value = getCurrentLanguage() === 'zh_CN' ? 'FINANCIAL' : 'FINANCIALEN';
    const fileUrl = idpValueMap['SPCM.FINANCIAL_AUDIT_FILE']?.find((item) => item.value === value)
      ?.tag;
    if (fileUrl) {
      const api = ''
        .concat(HZERO_FILE, '/v1/')
        .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
      downloadFile({
        requestUrl: api,
        queryParams: [
          {
            name: 'url',
            value: encodeURIComponent(fileUrl),
          },
          {
            name: 'bucketName',
            value: 'private-bucket',
          },
        ],
      }).then((res) => {
        if (getResponse(res)) {
          CusNotification.success();
        }
      });
    }
  };

  return (
    <>
      <CusButton
        onClick={() => {
          setVisible(true);
        }}
      >
        {intl.get(`${prompt}.button.financialAudit`).d('财务审核说明')}
      </CusButton>
      {visible && (
        <CusModal
          visible={visible}
          width={600}
          onCancel={() => {
            setVisible(false);
          }}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
          bodyStyle={{ marginTop: '0px' }}
        >
          <PanelHeader
            style={{ paddingTop: '0px' }}
            showArrow={false}
            title={intl.get('spcm.costPayment.view.title.financialAudit').d('财务审核说明')}
            buttons={
              <CusButton onClick={handleFinancialAuditDownload}>
                {intl.get(`${prompt}.button.financialAuditDownload`).d('说明下载')}
              </CusButton>
            }
          />
          <WrapDiv>
            <span>
              {intl
                .get(`${prompt}.view.title.financialAuditExplain`)
                .d('财务提供的付款申请常见清单如下：')}
            </span>
            <ul>
              <li>{'- ' + intl.get(`${prompt}.view.financialAudit.content1`).d('发票')}</li>
              <li>{'- ' + intl.get(`${prompt}.view.financialAudit.content2`).d('合同 SO/PO')}</li>
              <li>
                {'- ' +
                  intl
                    .get(`${prompt}.view.financialAudit.content3`)
                    .d(
                      '银行详细信息（所选择/新增的银行信息须与发票/合同/订单等支撑文件相匹配，否则须提供供应商签字盖章的信函）'
                    )}
              </li>
              <li>
                {'- ' + intl.get(`${prompt}.view.financialAudit.content4`).d('送货单或验收单')}
              </li>
              <li>
                {'- ' +
                  intl
                    .get(`${prompt}.view.financialAudit.content5`)
                    .d('付款金额的特殊条件（例如付款金额取决于交付/完成质量）')}
              </li>
              <li>
                {'- ' + intl.get(`${prompt}.view.financialAudit.content6`).d('检查是否有预付款')}
              </li>
              <li>
                {'- ' +
                  intl
                    .get(`${prompt}.view.financialAudit.content7`)
                    .d('如果合同条款要求在付款供应商之前收到客户的付款，则提供客户付款收据证明')}
              </li>
            </ul>
            <span>
              {intl
                .get(`${prompt}.view.financialAudit.lastContent`)
                .d('***备注：如有需求，会要求提供额外的文件')}
            </span>
          </WrapDiv>
        </CusModal>
      )}
    </>
  );
};

export default FinancialAudit;
