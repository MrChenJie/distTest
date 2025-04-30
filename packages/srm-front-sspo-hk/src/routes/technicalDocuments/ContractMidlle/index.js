/**
 * index.js - 技术/商务应答表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { createPagination } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  fetchSourceList: loading.effects['contractJudgesSorce/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractJudgesSorce/fetchEnum'],
  contractJudgesSorce,
}))
@formatterCollections({
  code: ['bid.bidcommon']
})

export default class ContractMidlle extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {};
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    });
  }

  /**
   * getAnswerTable - 查询技术、商务应答表
   */
  @Bind()
  getAnswerTable(page = {}) {
    const { dispatch, match, jsTableFlag } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractJudgesSorce/getAnswerList',
      payload: {
        page,
        proId: match.params.proId, // 测试proId：3
        state: jsTableFlag, //判断技术/商务应答表
        milestoneId: match.params.milestoneId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
        }));
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            answerSource: newDataSource,
            milestones: res.milestones,
            answerPagination: createPagination(res.page),
          },
        });
        this.setState({ milestoneId: res.milestones[0].milestoneId })
      }
    });
    this.props.onChangeFlag()
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }
  render() {
    const {
      fetchSourceList,
      contractJudgesSorce,
      flag,
    } = this.props;
    if (flag) {
      this.fetchEnum()
      this.getAnswerTable()
    }
    const { answerSource = [], answerPagination = {}, enumMap = {} } = contractJudgesSorce;
    const { yesNO = [] } = enumMap
    const {
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;

    let lists = [];
    let newDataList = [];
    answerSource.map((item) => {
      if (item.list.length > 0) {
        lists.push(item.list)
      }
    })
    lists.map((items) => {
      newDataList.push(items)
    })
    let columns = [];
    if (newDataList.length > 0) {
      columns = [
        {
          title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
          dataIndex: 'clause',
          fixed: 'left',
          width: 150,
          render: (_, record) => {
            return (
              <Tooltip placement="topLeft" title={record.clause}>
                <span>{record.clause}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
          dataIndex: 'clauseDetail',
          fixed: 'left',
          width: 200,
          render: (_, record) => {
            return (
              <Tooltip placement="topLeft" title={record.clauseDetail}>
                <span>{record.clauseDetail}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
          dataIndex: 'isLowestRequire',
          fixed: 'left',
          width: 120,
          render: (val, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <Tooltip placement="topLeft" title={record.isLowestRequire}>
                <span>{record.isLowestRequire}</span>
              </Tooltip>
            )
          }
        }
      ];
      if (answerSource[0].list.length > 0) {
        answerSource[0].list.map((item, i) => {
          columns.push({
            key: `${item.supplierName}`,
            title: `${item.supplierName}` != 'null' ? `${item.supplierName}` : '',
            children: [
              {
                title: intl.get(`bid.bidcommon.view.title.response`).d('应答情况'),
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      <span>{row.list[i].answerCondition}</span>
                    )
                  }
                },
              },
              {
                title: intl.get(`bid.bidcommon.bid.title.DeviationDescription`).d('偏离情况说明'),
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      <Tooltip placement="topLeft" title={row.list[i].deviationRemark}>
                        <span>{row.list[i].deviationRemark}</span>
                      </Tooltip>
                    )
                  }
                }
              }
            ],
          })
        })
      }
    } else {
      columns = [
        {
          title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
          dataIndex: 'clause',
          render: (_, record) => {
            return (
              <Tooltip placement="topLeft" title={record.clause}>
                <span>{record.clause}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
          dataIndex: 'clauseDetail',
          render: (_, record) => {
            return (
              <Tooltip placement="topLeft" title={record.clauseDetail}>
                <span>{record.clauseDetail}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
          dataIndex: 'isLowestRequire',
          render: (val, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <Tooltip placement="topLeft" title={record.isLowestRequire}>
                <span>{record.isLowestRequire}</span>
              </Tooltip>
            )
          }
        }
      ];
    }
    const otherListProps = {
      dataSource: answerSource,
      columns,
      pagination: answerPagination,
      selectedRows,
      selectedRowKeys,
      contractJudgesSorce,
      loading: fetchSourceList,
      onChange: this.getAnswerTable,
    };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content>
          <Table bordered {...otherListProps} />
        </Content>
      </Fragment>
    );
  }
}
