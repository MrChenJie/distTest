import React from 'react';
import { Link } from 'react-router-dom';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { tooltipRender, labelTip } from '_cus_utils/render';

import CusTable from '_cus_components/CusTable';

const prompt = 'spfm.sanctionsList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleOpenSuppliers = (record = {}) => {
    const { isPub } = this.props;
    const { companyId, companyName } = record;
    return (
      <Link
        to={`${isPub ? '/pub' : ''}/spfm/participants-suppliers-all/preview/${companyId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tooltipRender(companyName)}
      </Link>
    )
  }

  render() {
    const { dataSource = [], pagination = {}, rowSelection, onChange = (e) => e } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.list.companyName`).d('参与方名称'),
        width: 160,
        dataIndex: 'companyName',
        render: (_, record) => {
          return this.handleOpenSuppliers(record);
        },
        sorter: true,
      },
      {
        title: intl.get(`${prompt}.view.list.entityName`).d('疑似制裁名单'),
        width: 140,
        dataIndex: 'entityName',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.status`).d('状态'),
        width: 120,
        dataIndex: 'statusMeaning',
      },
      {
        title: intl.get(`${prompt}.view.list.similarity`).d('相似度'),
        width: 140,
        dataIndex: 'similarity',
        sorter: true,
      },
      {
        title: labelTip({
          label: intl.get(`${prompt}.view.list.sanctionsType`).d('制裁类型'),
          tip: (
            <>
             <div>
               {intl
                .get(`${prompt}.view.list.sanctionsType.tips`)
                .d('SDN List 限制事項：禁止与SDN 列表中的客户或供应商开展业务。')}
             </div>
             <div>
               {intl
                .get(`${prompt}.view.list.sanctionsType.tips1`)
                .d('实体名单限制事項：不允许向实体名单下的客户出售任何具有美国技术硬件，软件或物品。')}
             </div>
            </>
          ),
        }),
        width: 150,
        dataIndex: 'sanctionsTypeMeaning',
      },
      {
        title: intl.get(`${prompt}.view.list.activeTime`).d('生效时间'),
        width: 160,
        dataIndex: 'activeTime',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prompt}.view.list.invalidTime`).d('失效时间'),
        width: 160,
        dataIndex: 'invalidTime',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prompt}.view.list.operatorName`).d('更新人'),
        width: 160,
        dataIndex: 'operatorName',
      },
      {
        title: intl.get(`${prompt}.view.list.companyNum`).d('企业编号'),
        width: 120,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get(`${prompt}.view.list.supplierEbsCode`).d('供应商EBS编码'),
        width: 140,
        dataIndex: 'supplierEbsCode',
      },
      {
        title: intl.get(`${prompt}.view.list.custEbsCode`).d('客户EBS编码'),
        width: 190,
        dataIndex: 'custEbsCode',
      },
    ];
    return (
      <>
        <div className="customize-info-message">
          <div className='list-info-message'>
            <div className='info-message-all'>
              <span className='info-message-value'>
                {intl.get(`${prompt}.view.sanctions.tableTips`).d('制裁名单查询页面只展示相似度在50以上的数据')}
              </span>
            </div>
          </div>
        </div>
        <CusTable
          rowKey="resultId"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
