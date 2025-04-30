import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';
import cusRequest from '_cus_utils/request';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import { TextItem } from '_cus_utils/render';

const organizationId = getCurrentOrganizationId();
const prompt = 'spcm.costPayment';

export default class OperateHistory extends Component {
  state = {
    visible: false,
    coaHistory: {},
    dateHistory: {},
  };
  @Bind
  queryCoaHistory() {
    const { costDetailLineId } = this.props;
    cusRequest(
      `${SRM_SPUC}/v1/${organizationId}/cost-coa-account-audits/version-compare/${costDetailLineId}`,
      {
        method: 'GET',
        query: { auditSourceCode: 'COST' },
      }
    ).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          coaHistory: res,
        });
      }
    });
  }
  @Bind
  queryDateHistory() {
    const { costDetailLineId } = this.props;
    cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-payment-audits/queryAudit`, {
      method: 'GET',
      query: {
        auditSourceId: costDetailLineId,
        auditBelongType: 'COST_INVOICE_LINE',
        auditSourceTypeList: ['SERVICE_DATE', 'COST_CATEGORY_CONFIG'],
      },
    }).then((res) => {
      if (cusGetResponse(res)) {
        this.setState({
          dateHistory: res,
        });
      }
    });
  }

  @Bind
  showHistory() {
    this.setState(
      {
        visible: true,
      },
      () => {
        this.queryCoaHistory();
        this.queryDateHistory();
      }
    );
  }

  render() {
    const { visible = false, coaHistory = {}, dateHistory = {} } = this.state;
    return (
      <div>
        <CusButton type="plain" onClick={() => this.showHistory()}>
          {intl.get(`${prompt}.view.detail.coaModifyRecord`).d('COA操作记录')}
        </CusButton>
        {visible && (
          <CusModal
            title={intl.get(`${prompt}.view.detail.modifyRecord`).d('操作记录')}
            visible={visible}
            width={800}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            cancelText={intl.get('hzero.common.button.close').d('关闭')}
          >
            <CoaModifyHistory res={coaHistory} />
            <DateModifyHistory res={dateHistory} />
          </CusModal>
        )}
      </div>
    );
  }
}

const CoaModifyHistory = ({ res }) => {
  const historyColumns = [
    {
      title: intl.get(`${prompt}.model.coaModifyHistory.fieldRegion`).d('修改区域'),
      dataIndex: 'fieldRegion',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.coaModifyHistory.fieldNameView`).d('修改字段'),
      dataIndex: 'fieldNameView',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.coaModifyHistory.beforeChange`).d('修改前'),
      dataIndex: 'beforeChange',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.coaModifyHistory.afterChange`).d('修改后'),
      dataIndex: 'afterChange',
      width: 100,
      align: 'left',
    },
  ];
  const { costCoaAccountAuditDTOList = [], taxCoaAccountAuditDTOList = [] } = res;
  const costData = costCoaAccountAuditDTOList || [];
  const taxData = taxCoaAccountAuditDTOList || [];
  return (
    <>
      <PanelHeader
        title={intl.get(`${prompt}.model.coaModifyHistory.costCountHistory`).d('账户组合修改历史')}
        showArrow={false}
      />
      {costData.length > 0 ? (
        <>
          {costData.map((item, index) => {
            return (
              <div style={{ marginBottom: '24px' }} key={index}>
                {TextItem([
                  {
                    label: `NO.${item.auditVersionNum}`,
                  },
                  {
                    label: intl.get(`${prompt}.model.costCountHistory.auditByName`).d('修改人:'),
                    value: item.auditByName,
                  },
                  {
                    label: intl.get(`${prompt}.model.costCountHistory.auditDate`).d('修改时间:'),
                    value: item.auditDate,
                  },
                ])}
                <CusTable
                  rowKey="_id"
                  bordered
                  pagination={false}
                  dataSource={(item.fieldAuditDTOList || []).map((item, index) => {
                    return {
                      ...item,
                      fieldRegion: intl
                        .get(`${prompt}.model.coaModifyHistory.costCoaAccount`)
                        .d('账户组合'),
                      _id: index,
                    };
                  })}
                  columns={historyColumns}
                />
              </div>
            );
          })}
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {intl.get(`${prompt}.model.coaModifyHistory.dataOfNull`).d('暂无修改记录')}
        </div>
      )}

      <PanelHeader
        title={intl.get(`${prompt}.model.coaModifyHistory.taxACountHistory`).d('税账户修改历史')}
        showArrow={false}
      />
      {taxData.length > 0 ? (
        <>
          {taxData.map((item) => {
            return (
              <div style={{ marginBottom: '24px' }}>
                {TextItem([
                  {
                    label: `NO.${item.auditVersionNum}`,
                  },
                  {
                    label: intl.get(`${prompt}.model.taxACountHistory.auditByName`).d('修改人:'),
                    value: item.auditByName,
                  },
                  {
                    label: intl.get(`${prompt}.model.taxACountHistory.auditDate`).d('修改时间:'),
                    value: item.auditDate,
                  },
                ])}
                <CusTable
                  rowKey="_id"
                  bordered
                  pagination={false}
                  dataSource={(item.fieldAuditDTOList || []).map((item, index) => {
                    return {
                      ...item,
                      fieldRegion: intl
                        .get(`${prompt}.model.coaModifyHistory.taxCoaAccount`)
                        .d('税账户'),
                      _id: index,
                    };
                  })}
                  columns={historyColumns}
                />
              </div>
            );
          })}
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {intl.get(`${prompt}.model.coaModifyHistory.dataOfNull`).d('暂无修改记录')}
        </div>
      )}
    </>
  );
};

const DateModifyHistory = ({ res }) => {
  const historyColumns = [
    {
      title: intl.get(`${prompt}.model.dateModifyHistory.auditSourceTypeMeaning`).d('修改区域'),
      dataIndex: 'auditSourceTypeMeaning',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.dateModifyHistory.auditFieldMeaning`).d('修改字段'),
      dataIndex: 'auditFieldMeaning',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.dateModifyHistory.auditBeforeValue`).d('修改前'),
      dataIndex: 'auditBeforeValue',
      width: 100,
      align: 'left',
    },
    {
      title: intl.get(`${prompt}.model.dateModifyHistory.auditAfterValue`).d('修改后'),
      dataIndex: 'auditAfterValue',
      width: 100,
      align: 'left',
    },
  ];
  return (
    <>
      <div>
        <PanelHeader
          title={intl
            .get(`${prompt}.model.dateModifyHistory.costCountHistory`)
            .d('发票服务日期修改历史')}
          showArrow={false}
        />
        {res.length > 0 ? (
          <>
            {res.map((item, index) => {
              return (
                <div style={{ marginBottom: '24px' }} key={index}>
                  {TextItem([
                    {
                      label: `NO.${item.auditVersionNum}`,
                    },
                    {
                      label: intl.get(`${prompt}.model.dateModifyHistory.auditName`).d('修改人:'),
                      value: item.auditName,
                    },
                    {
                      label: intl.get(`${prompt}.model.dateModifyHistory.auditDate`).d('修改时间:'),
                      value: item.auditDate,
                    },
                  ])}
                  <CusTable
                    rowKey="id"
                    bordered
                    pagination={false}
                    dataSource={(item.auditList || []).map((item, index) => {
                      return {
                        ...item,
                        id: index,
                      };
                    })}
                    columns={historyColumns}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {intl.get(`${prompt}.model.dateModifyHistory.dataOfNull`).d('暂无修改记录')}
          </div>
        )}
      </div>
    </>
  );
};
