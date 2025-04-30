import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import CusTable from '_cus_components/CusTable';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class RfqResponse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ResDataSource: [],
    }
  }

  componentDidMount() {
    const { dispatch, nowRecord } = this.props;
    const { enquiryPriceId, enquiryPriceRoundsId } = nowRecord;
    dispatch({
      type: 'resaleRfq/queryRfqResponse',
      payload: {
        enquiryPriceId,
        enquiryPriceRoundsId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          ResDataSource: res,
        });
      };
    });
  }

  render() {
    const { queryRfqResponseLoading = false } = this.props;
    const { ResDataSource } = this.state;

    const columns = [
      {
        title: intl.get(`${promptCode}.model.label.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.quotationLineStatus`).d('报价状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.validQuotation`).d('有效报价'),
        dataIndex: 'validQuotation',
        width: 160,
      },
    ];

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          columns={columns}
          loading={queryRfqResponseLoading}
          dataSource={ResDataSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </React.Fragment>
    )
  }
}
