import React, { useState } from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { getCurrentLanguage, isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import notification from 'utils/notification';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const FinancialAudit = ({
  prompt,
  idpValueMap,
}) => {
  const [financialAuditDownloadLoading, setFinancialAuditDownloadLoading] = useState(false);

  const handleFinancialAuditDownload = () => {
    const value = getCurrentLanguage() === 'zh_CN' ? 'FINANCIAL' : 'FINANCIALEN';
    const fileUrl = idpValueMap['SPCM.FINANCIAL_AUDIT_FILE']?.find(item => (item.value === value))?.tag;
    if (fileUrl) {
      setFinancialAuditDownloadLoading(true);
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
          notification.success();
        }
      }).finally(() => {
        setFinancialAuditDownloadLoading(false)
      })
    }
  }

  return (
    <div className={styles['financial-audit']}>
      <Row>
        <Col className='col'>
          <Button
            icon="file_download_black-o"
            onClick={handleFinancialAuditDownload}
            loading={financialAuditDownloadLoading}
          >
            {intl.get(`${prompt}.button.financialAuditDownload`).d('说明下载')}
          </Button>
        </Col>
      </Row>
      <div>
        <h4>
          {intl.get(`${prompt}.view.title.financialAuditExplain`).d('财务提供的付款申请常见清单如下：')}
        </h4>
        <ol>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content1`).d('发票')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content2`).d('合同 SO/PO')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content3`).d('银行详细信息（所选择/新增的银行信息须与发票/合同/订单等支撑文件相匹配，否则须提供供应商签字盖章的信函）')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content4`).d('送货单或验收单')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content5`).d('付款金额的特殊条件（例如付款金额取决于交付/完成质量）')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content6`).d('检查是否有预付款')}
          </li>
          <li>
            {'- ' + intl.get(`${prompt}.view.financialAudit.content7`).d('如果合同条款要求在付款供应商之前收到客户的付款，则提供客户付款收据证明')}
          </li>
        </ol>
        <div>
          {intl.get(`${prompt}.view.financialAudit.lastContent`).d('***备注：如有需求，会要求提供额外的文件')}
        </div>
      </div>
    </div>
  )
};

export default FinancialAudit;
