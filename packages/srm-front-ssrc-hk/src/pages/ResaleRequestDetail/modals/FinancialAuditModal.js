/*
 * @Description: 财务审核说明
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-21 18:38:17
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { connect } from 'dva';
import { downloadFile } from 'services/api';
import { HZERO_FILE } from 'utils/config';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import CusNotification from '_cus_components/CusNotification';
import styled from 'styled-components';

const WrapDiv = styled.div`
  ul {
    padding-left: 0px;
  }
  li {
    list-style: none;
  }
`;

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = {
    downloadLoading: false,
  };

  /**
   * @name: 操作 - 说明下载
   */
  handleDownload = () => {
    const { isEn, lovData } = this.props.resaleRequestDetail;
    const value = isEn ? 'FINANCIALEN' : 'FINANCIAL';
    const fileUrl = lovData['SPCM.FINANCIAL_AUDIT_FILE']?.find((item) => item.value === value)?.tag;
    if (fileUrl) {
      this.setState({ downloadLoading: true });
      downloadFile({
        requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
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
      })
        .then((res) => {
          if (getResponse(res)) {
            CusNotification.success();
          }
        })
        .finally(() => {
          this.setState({ downloadLoading: false });
        });
    }
  };

  render() {
    const { downloadLoading } = this.state;
    return (
      <>
        <PanelHeader
          style={{ paddingTop: 0 }}
          showArrow={false}
          title={intl.get('spcm.paymentRequest.view.title.financialAudit').d('财务审核说明')}
          buttons={
            <CusButton onClick={this.handleDownload} loading={downloadLoading}>
              {intl.get(`spcm.paymentRequest.button.financialAuditDownload`).d('说明下载')}
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
            <li>{`- ${intl.get(`${prompt}.view.financialAudit.content1`).d('发票')}`}</li>
            <li>{`- ${intl.get(`${prompt}.view.financialAudit.content2`).d('合同 SO/PO')}`}</li>
            <li>
              {`- ${intl
                .get(`${prompt}.view.financialAudit.content3`)
                .d(
                  '银行详细信息（所选择/新增的银行信息须与发票/合同/订单等支撑文件相匹配，否则须提供供应商签字盖章的信函）'
                )}`}
            </li>
            <li>{`- ${intl.get(`${prompt}.view.financialAudit.content4`).d('送货单或验收单')}`}</li>
            <li>
              {`- ${intl
                .get(`${prompt}.view.financialAudit.content5`)
                .d('付款金额的特殊条件（例如付款金额取决于交付/完成质量）')}`}
            </li>
            <li>
              {`- ${intl.get(`${prompt}.view.financialAudit.content6`).d('检查是否有预付款')}`}
            </li>
            <li>
              {`- ${intl
                .get(`${prompt}.view.financialAudit.content7`)
                .d('如果合同条款要求在付款供应商之前收到客户的付款，则提供客户付款收据证明')}`}
            </li>
          </ul>
          <span>
            {intl
              .get(`${prompt}.view.financialAudit.lastContent`)
              .d('***备注：如有需求，会要求提供额外的文件')}
          </span>
        </WrapDiv>
      </>
    );
  }
}
