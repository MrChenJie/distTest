/**
 * index.js - 供应商信息
 * @date: 2022-05-06
 * @author:  <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { dateRender, numberRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  fetchSupplierList: loading.effects['contractJudgesSorce/getSupplierList'],
  contractJudgesSorce,
}))

export default class SupplierInfos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplierSource: [],
      supplierPagination: {},
    };
  }
  componentDidMount() {
    this.fetchSupplierList();
  }
  /**
   * fetchSupplierList - 查询供应商信息
   */
  @Bind()
  fetchSupplierList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getSupplierList',
      payload: {
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          supplierSource: res.content.map(n => ({
            ...n,
            _status: 'update',
          })),
          supplierPagination: createPagination(res),
        })
      }
    });
  }

  render() {
    const { contractJudgesSorce, fetchSupplierList } = this.props;
    const { supplierSource, supplierPagination } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`bid.bidcommon.view.title.EstablishDate`).d('成立日期'),
        dataIndex: 'establishmentDate',
        render: dateRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.RegisterCapital`).d('注册资本'),
        dataIndex: 'registeredCapital',
        render: (val) => numberRender(val, 2)
      },
      {
        title: intl.get(`bid.bidcommon.view.title.rcurrency`).d('注册币种'),
        dataIndex: 'currency',
      }
    ];
    const listProps = {
      dataSource: supplierSource,
      columns,
      pagination: supplierPagination,
      contractJudgesSorce,
      loading: fetchSupplierList
    };
    listProps.scroll = { x: sum(columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content>
          <Table bordered {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
