import { Col, Row, Table } from 'hzero-ui';
import React from 'react';
import intl from 'utils/intl';

const DateModifyHistory = ({ prompt, res }) => {
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
      {res.length > 0 ? (
        <Row>
          <Col span={24} style={{ paddingRight: '20px', borderRight: '1px solid #f5f5f5' }}>
            <div style={{ marginBottom: '20px' }}>
              {intl.get(`${prompt}.model.dateModifyHistory.costCountHistory`).d('发票服务日期修改历史')}
            </div>
            {res.map((item, index) => {
              return (
                <div style={{ marginBottom: '20px' }} key={index}>
                  <Row>
                    <Col span={4}>NO.{item.auditVersionNum}</Col>
                    <Col span={10}>
                      {intl.get(`${prompt}.model.dateModifyHistory.auditName`).d('修改人:')}
                      {item.auditName}
                    </Col>
                    <Col span={10}>
                      {intl.get(`${prompt}.model.dateModifyHistory.auditDate`).d('修改时间:')}
                      {item.auditDate}
                    </Col>
                  </Row>
                  <Table
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
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {intl.get(`${prompt}.model.dateModifyHistory.dataOfNull`).d('暂无修改记录')}
        </div>
      )}
    </>
  );
};

export default DateModifyHistory;
