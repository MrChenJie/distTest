/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:43
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';
const promptCode = 'HKPC.commom';
export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleStoreLink = (record,status) => {
    const url = `/pub/ssrc-hk/propertyLease/maintenance/${record.storeNumber}`;
    if(status){
      window.open(url+`?isModify=${status}`, '_blank');
    }else{
      window.open(url, '_blank');
    }
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      idpValueMap
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.propertyno`).d('主体编号'),
        width: 160,
        dataIndex: 'storeNumber',
        key: 'storeNumber',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleStoreLink(record)}>
              {tooltipRender(record.storeNumber)}
            </a>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.propertyname`).d('主体名称'),
        width: 300,
        dataIndex: 'storeName',
        key: 'storeName',
        render: (_, record) => {
          return (
            <p>{record.storeNameCn}/{record.storeNameEn}</p>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.formstate`).d('单据状态'),
        width: 160,
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
      },
      {
        title: intl.get(`${promptCode}.view.title.districtsofhk`).d('香港十八区'),
        width: 160,
        dataIndex: 'area',
        key: 'area',
        render: (_, record) => {
          const meaning = idpValueMap['HKPC.DISTRICTS_OF_HONGKONG']?.filter(i=> i?.value === record.area)[0]?.meaning
          return <>{meaning}</>
         }
      },
      {
        title: intl.get(`${promptCode}.view.title.fillindate`).d('填写日期'),
        width: 100,
        dataIndex: 'createDate',
        key: 'createDate',
      },
      {
        title: intl.get(`${promptCode}.view.title.propertysize`).d('主体尺寸(Sq.ft)'),
        width: 100,
        dataIndex: 'storeSize',
        key: 'storeSize',
      },
      {
        title: intl.get(`${promptCode}.view.title.headofgrid`).d('网格长'),
        width: 100,
        dataIndex: 'griderCodeMeaning',
        key: 'griderCodeMeaning',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operate',
        // width: getCurrentLanguage() === 'zh_CN' ? 108 : 162,
        dataIndex: 'operate',
        render: (_, record) => (
          <>
            {
              record.statusMeaning=='已提交'&&
              <CusButton
                type="plain"
                onClick={() => this.handleStoreLink(record,'modify')}
                style={{ marginRight: '16px' }}
              >
                {intl.get(`${promptCode}.view.button.modify`).d('修改')}
              </CusButton>
            }
          </>
        ),
      },
    ];
    return (
      <>
        <CusTable
          rowKey="id"
          rowSelection={rowSelection}
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
