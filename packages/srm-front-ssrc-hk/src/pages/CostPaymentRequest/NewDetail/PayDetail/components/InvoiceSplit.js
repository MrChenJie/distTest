import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import cusRequest from '_cus_utils/request';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { numberRender, dateRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { cusDateFormat } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const prompt = 'spcm.costPayment';

class InvoiceSplit extends Component {
  state = {};

  @Bind
  getValueDecimal(value) {
    if (value) {
      try {
        let pre = 0;
        const arr = value.split('.');
        if (arr.length > 1) {
          pre = arr[1].length;
        }
        return numberRender(value, pre);
      } catch (e) {
        return numberRender(value, 2);
      }
    } else {
      return numberRender(value);
    }
  }

  @Bind()
  showInvioceSplit() {
    this.setState(
      {
        visible: true,
      },
      () => {
        this.queryInvoiceSplit();
      }
    );
  }

  @Bind
  queryInvoiceSplit() {
    const params = this.getParams();
    cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines/getSplitInvoiceLine`, {
      method: 'POST',
      body: params,
    }).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          dataSource: res,
          pagination: {
            current: 1,
            pageSize: 10,
            total: res.length || 0,
          }
        });
      }
    });
  }

  @Bind
  getParams() {
    const { currencyCode, billLineData } = this.props;
    return {
      currencyCode,
      glDate: billLineData.parent.glDate || null,
      costDetailLine: {
        ...billLineData,
        serviceStartDate: cusDateFormat(billLineData.serviceStartDate, DATETIME_MIN, billLineData.serviceStartDate),
        serviceEndDate: cusDateFormat(billLineData.serviceEndDate, DATETIME_MAX, billLineData.serviceEndDate),
        apportionStartDate: cusDateFormat(billLineData.apportionStartDate, DATETIME_MIN, billLineData.apportionStartDate),
        apportionEndDate: cusDateFormat(billLineData.apportionEndDate, DATETIME_MAX, billLineData.apportionEndDate),
      },
    };
  }

  render() {
    const { visible, dataSource = [], pagination = {} } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.view.detail.line.serviceStartDate`).d('服务开始日期'),
        dataIndex: 'serviceStartDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.serviceEndDate`).d('服务结束日期'),
        dataIndex: 'serviceEndDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.apportionStartDate`).d('待摊开始时间'),
        dataIndex: 'deferredStartDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.apportionEndDate`).d('待摊结束时间'),
        dataIndex: 'deferredEndDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.line.split`).d('行金额'),
        dataIndex: 'amount',
        width: 150,
        align: 'left',
        render: (text) => {
          return <div style={{ textAlign: 'right' }}>{this.getValueDecimal(text)}</div>;
        },
      },
    ];
    return (
      <>
        <div>
          <CusButton type="plain" onClick={() => this.showInvioceSplit()}>
            {intl.get(`${prompt}.view.detail.pendingApportion.preview`).d('待摊预览')}
          </CusButton>
          {visible && (
            <CusModal
              title={intl.get(`${prompt}.view.detail.pendingApportion.preview`).d('待摊预览')}
              visible={visible}
              width={800}
              onCancel={() => {
                this.setState({
                  visible: false,
                });
              }}
              cancelText={intl.get('hzero.common.button.close').d('关闭')}
            >
              <CusTable bordered dataSource={dataSource} pagination={pagination} columns={columns} />
            </CusModal>
          )}
        </div>
      </>
    );
  }
}

export default InvoiceSplit;
