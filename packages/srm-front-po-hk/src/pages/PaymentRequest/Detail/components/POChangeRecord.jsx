import React from 'react';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { Table, LocaleProvider, Card, Row, Col, Avatar, Tooltip } from 'hzero-ui';
import { getCurrentLanguage, getCodeMeaning } from 'utils/utils';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { isEmpty } from 'lodash';
import TipsIcon from '@/assets/buttonIcons/提示.png';
import styles from './index.less';

const POChangeRecord = ({
  prompt,
  res = [],
  idpValueMap,
}) => {

  const columns = [
    {
      title: intl.get(`${prompt}.view.detail.line.changeBefore`).d('更新前'),
      dataIndex: 'changeBefore',
      width: 150,
      render: (val) => getCodeMeaning(val, idpValueMap['SPUC.PURCHASE_ORDER_LINE_STATUS']),
    },
    {
      title: intl.get(`${prompt}.view.detail.line.changeAfter`).d('更新后'),
      dataIndex: 'changeAfter',
      width: 150,
      render: (val) => getCodeMeaning(val, idpValueMap['SPUC.PURCHASE_ORDER_LINE_STATUS']),
    },
  ]

  return (
    <React.Fragment>
      <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
        <Content>
          {isEmpty(res) ? (
            <div style={{ textAlign: 'center' }}>
              {intl.get(`${prompt}.view.message.recordNull`).d('暂无变更记录')}
            </div>
          ) : (
            res.map((item, index) => {
              return (
                <Card
                  key={index}
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={
                    <div className={styles['changeRecordTitle']}>
                      <Row>
                        <Col span={6}>
                          <span title={`NO.${index + 1}`}>{`NO.${index + 1}`}</span>
                        </Col>
                        <Col span={14} style={{ display: 'flex', alignItems: 'center' }}>
                          <span title={item.lastUpdateDate}>{item.lastUpdateDate}</span>
                          <Tooltip
                            title={intl.get(`${prompt}.view.POChangeRecord.tips`).d('该时间为PO行状态实际更新时间')}
                          >
                            <Avatar size="small" src={TipsIcon} alt='tip' />
                          </Tooltip>
                        </Col>
                      </Row>
                    </div>
                  }
                  loading={false}
                >
                  <Table
                    rowKey="rowKey"
                    bordered
                    pagination={false}
                    dataSource={[item]}
                    columns={columns}
                  />
                </Card>
              );
            })
          )}
        </Content>
      </LocaleProvider>
    </React.Fragment>
  );
}

export default POChangeRecord;
