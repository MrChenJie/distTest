import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { SRM_SPUC } from '_utils/config';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import cusRequest from '_cus_utils/request';
import { CoaInfo } from './CoaInfo';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';

const prompt = 'spcm.costPayment';
const organizationId = getCurrentOrganizationId();

class BatchModifyCoa extends Component {
  state = {};

  coaRef = React.createRef();

  @Bind()
  showCoa() {
    this.setState({
      visible: true,
    });
  }

  @Bind
  handleBatchSaveCoa() {
    const { onSuccess = (e) => e, costInvoiceId, currentSelected } = this.props;
    if (this.coaRef) {
      const costCoaAccount = this.coaRef.getFieldsValue();
      let selectAllFlag;
      if (currentSelected.length < 1) {
        selectAllFlag = 'Y';
      } else {
        selectAllFlag = 'N';
      }
      if (costCoaAccount) {
        cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-coa-accounts/batch-update-coa`, {
          method: 'POST',
          body: {
            costCoaAccount: costCoaAccount,
            costDetailLineList: selectAllFlag === 'Y' ? [] : currentSelected,
            costInvoiceId,
            selectAllFlag,
          },
        }).then((res) => {
          if (cusGetResponse(res)) {
            this.setState({
              visible: false,
            });
            CusNotification.success();
            onSuccess();
          }
        });
      }
    }
  }

  render() {
    const { financeFlag } = this.props;
    const { visible } = this.state;
    return (
      <>
        <CusButton onClick={() => this.showCoa()}>
          {intl.get(`${prompt}.view.button.batchModifyCoa`).d('修改COA')}
        </CusButton>
        {visible && (
          <CusModal
            title="COA"
            visible={visible}
            width={800}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            onOk={this.handleBatchSaveCoa}
          >
            <PanelHeader
              title={intl.get(`${prompt}.view.coa.header`).d('账户组合')}
              showArrow={false}
            />
            <CoaInfo
              financeFlag={financeFlag}
              onRef={(node) => {
                this.coaRef = node.props.form;
              }}
            />
          </CusModal>
        )}
      </>
    );
  }
}

export default BatchModifyCoa;
