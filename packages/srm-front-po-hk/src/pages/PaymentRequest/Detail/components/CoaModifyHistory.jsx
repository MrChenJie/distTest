import { Col, Row, Table } from 'hzero-ui';
import React from 'react';
import intl from 'utils/intl';
const prompt = 'spcm.paymentRequest';

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
      {costData.length > 0 || taxData.length > 0 ? (
        <Row>
          <Col span={12} style={{ paddingRight: '20px', borderRight: '1px solid #f5f5f5' }}>
            <div style={{ marginBottom: '20px' }}>
              {intl.get(`${prompt}.model.coaModifyHistory.costCountHistory`).d('账户组合修改历史')}
            </div>
            {costData.map((item, index) => {
              return (
                <div style={{ marginBottom: '20px' }} key={index}>
                  <Row>
                    <Col span={3}>NO.{item.auditVersionNum}</Col>
                    <Col span={8}>
                      {intl.get(`${prompt}.model.costCountHistory.auditByName`).d('修改人:')}
                      {item.auditByName}
                    </Col>
                    <Col span={1}></Col>
                    <Col span={12}>
                      {intl.get(`${prompt}.model.costCountHistory.auditDate`).d('修改时间:')}
                      {item.auditDate}
                    </Col>
                  </Row>
                  <Table
                    rowKey="id"
                    bordered
                    pagination={false}
                    dataSource={(item.fieldAuditDTOList || []).map((item, index) => {
                      return {
                        ...item,
                        fieldRegion: intl
                          .get(`${prompt}.model.coaModifyHistory.costCoaAccount`)
                          .d('账户组合'),
                        id: index,
                      };
                    })}
                    columns={historyColumns}
                  />
                </div>
              );
            })}
          </Col>
          <Col span={12} style={{ paddingLeft: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              {intl.get(`${prompt}.model.coaModifyHistory.taxACountHistory`).d('税账户修改历史')}
            </div>
            {taxData.map((item) => {
              return (
                <div style={{ marginBottom: '20px' }}>
                  <Row>
                    <Col span={3}>NO.{item.auditVersionNum}</Col>
                    <Col span={8}>
                      {intl.get(`${prompt}.model.taxACountHistory.auditByName`).d('修改人:')}
                      {item.auditByName}
                    </Col>
                    <Col span={1}></Col>
                    <Col span={12}>
                      {intl.get(`${prompt}.model.taxACountHistory.auditDate`).d('修改时间:')}
                      {item.auditDate}
                    </Col>
                  </Row>
                  <Table
                    rowKey="rowKey"
                    bordered
                    pagination={false}
                    dataSource={(item.fieldAuditDTOList || []).map((item, index) => {
                      return {
                        ...item,
                        fieldRegion: intl
                          .get(`${prompt}.model.coaModifyHistory.taxCoaAccount`)
                          .d('税账户'),
                        id: index,
                      };
                    })}
                    columns={historyColumns}
                  />
                </div>
              );
            })}
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {intl.get(`${prompt}.model.coaModifyHistory.dataOfNull`).d('暂无修改记录')}
        </div>
      )}
    </>
  );
};

export default CoaModifyHistory;
