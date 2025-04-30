import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import { Form, Input, Row, Col } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { getDFormGridSpan } from '_cus_utils/utils';

const gridSpan = getDFormGridSpan();
export default class VicoScSuTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {};
  }

  render() {
    const {
      form,
      onChange = (e) => e,
      purchaseResultModel,
    } = this.props;
    const { viCoScSuDataSource = [], viCoScSuDataPagination = {}, fourthHead } = purchaseResultModel;
    const { getFieldDecorator } = form;

    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: 610,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.technicalscore`).d('技术得分'),
        dataIndex: 'tenRateScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 147,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.pricescore`).d('价格得分'),
        dataIndex: 'priceRateScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.comprehensivescore`).d('综合得分'),
        dataIndex: 'totalScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 189,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.ranking`).d('综合排名'),
        dataIndex: 'totalRank',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 95,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.finalprice`).d('最后投标价'),
        dataIndex: 'confirmPricePlaceHoder',
        width: getCurrentLanguage() === 'zh_CN' ? 106 : 118,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{record}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.finalpricehkd`).d('最后投标价(HKD)'),
        dataIndex: 'confirmPricePlaceHoderHkd',
        width: getCurrentLanguage() === 'zh_CN' ? 106 : 118,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{record}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.currency`).d('币种'),
        dataIndex: 'priceCurrency',
        width: getCurrentLanguage() === 'zh_CN' ? 55 : 105,
      }
    ].filter(Boolean);

    return (
      <>
        <Form className="customize-form" style={{marginBottom: '16px'}}>
          <Row style={{marginBottom: '16px'}}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.technicalproportion`).d('技术比例')}
              >
                {getFieldDecorator('tenRate', {
                  initialValue: fourthHead?.tenRate,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.priceproportion`).d('商务比例')}
              >
                {getFieldDecorator('priceRate', {
                  initialValue: fourthHead?.priceRate,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <CusTable
          rowKey='rowKey'
          dataSource={viCoScSuDataSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={viCoScSuDataPagination}
          onChange={onChange}
        />
      </>
    );
  }
}
