import React from 'react';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';

const prompt = 'spub.interfaceErrors';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleDetail = (record = {}) => {
    const { history, isPub } = this.props;
    const { interfaceLogId } = record;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spub/interface-errors/detail/${interfaceLogId}`,
    });
  };

  render() {
    const { dataSource = [], pagination = {}, onChange = (e) => e } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.list.serverCode`).d('服务代码'),
        width: 200,
        dataIndex: 'serverCode',
        key: 'serverCode',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.serverName`).d('服务名称'),
        width: 160,
        dataIndex: 'serverName',
        key: 'serverName',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.clientId`).d('客户端ID'),
        width: 100,
        dataIndex: 'clientId',
        key: 'clientId',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.interfaceUrl`).d('第三方接口地址'),
        width: 200,
        dataIndex: 'interfaceUrl',
        key: 'interfaceUrl',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.interfaceCode`).d('接口编码'),
        width: 200,
        dataIndex: 'interfaceCode',
        key: 'interfaceCode',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.interfaceName`).d('接口名称'),
        width: 200,
        dataIndex: 'interfaceName',
        key: 'interfaceName',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.invokeKey`).d('请求ID'),
        width: 200,
        dataIndex: 'invokeKey',
        key: 'invokeKey',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.interfaceRequestTime`).d('平台请求时间'),
        width: 180,
        dataIndex: 'interfaceRequestTime',
        key: 'interfaceRequestTime',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.interfaceResponseStatus`).d('平台接口响应状态'),
        width: 100,
        dataIndex: 'interfaceResponseStatusMeaning',
        key: 'interfaceResponseStatusMeaning',
        ellipsis: true,
      },
      {
        title: intl.get(`${prompt}.view.list.operate`).d('操作'),
        width: getCurrentLanguage() === 'zh_CN' ? 80 : 70,
        dataIndex: 'operate',
        key: 'operate',
        ellipsis: true,
        render: (_, record) => {
          return (
            <CusButton type="plain" onClick={() => this.handleDetail(record)}>
              {intl.get(`${prompt}.view.list.button.detail`).d('详情')}
            </CusButton>
          );
        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey="errorId"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
