import React from 'react';
import { Table } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';

const ROW_KEY = 'subId';
/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';

export default class ListTable extends React.Component {
  render() {
    const {
      dataSource = [],
      pagination = [],
      onChange = (e) => e,
      loading = false,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('段落行'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('产品类型'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('Service Type'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('带宽'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('品牌'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('型号'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('参与方名称'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('排名'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('NRC(不含税)'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('MRC(不含税)'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('合同期数(月)'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('线路总价(港币)'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('金额小计(含税)'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('报价时间'),
        dataIndex: 'createdName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.creator`).d('报价轮次'),
        dataIndex: 'createdName',
        width: 160,
      },
    ];

    return (
      <React.Fragment>
        <Table
          bordered
          rowKey={ROW_KEY}
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </React.Fragment>
    )
  }
}
