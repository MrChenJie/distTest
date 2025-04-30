/**
 * index.js - 技术应答表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form } from 'antd';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import styles from './index.less';

const prompt = 'bid.bidcommon';
const dashPrompt = 'bid.biddashbord';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default class ContractMidlleJs extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      milestoneId: '',
    };
  }

  contractForm = React.createRef();

  componentDidMount() {
    this.getAnswerTable(); // 查询数据
  }

  /**
   * getAnswerTable - 技术应答表
   */
  @Bind()
  getAnswerTable(milestoneId, page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getAnswerListJs',
      payload: {
        page,
        milestoneId: milestoneId !== undefined ? milestoneId : -1,
        proId: match.params.proId, // 测试proId：3
        state: 0, //技术应答表
      },
    }).then((res) => {
      if (res) {
        this.setState({ milestoneId: milestoneId !== undefined ? milestoneId : res.milestones[0].milestoneId })
      }
    });
  }

  render() {
    const {
      contractJudgesCusSorce: {
        answerSourceJs = [],
        answerMilestonesJs = [],
        enumMap,
        answerPaginationJs = {},
      },
    } = this.props;
    const { yesNO = [] } = enumMap;
    const { milestoneId } = this.state;
    let lists = [];
    let newDataList = [];
    answerSourceJs.map((item) => {
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
          title: intl.get(`${dashPrompt}.view.title.clause`).d('大条款'),
          // key: 'clause',
          dataIndex: 'operator',
          fixed: 'left',
          width: 200,
          render: (_, record) => tooltipRender(record.clause),
        },
        {
          title: intl.get(`${prompt}.view.title.clauseitems`).d('细节条款'),
          // key: 'clauseDetail',
          dataIndex: 'soLineNumber',
          fixed: 'left',
          width: 200,
          render: (_, record) => tooltipRender(record.clauseDetail),
        },
        {
          title: intl.get(`${prompt}.view.title.keyindicators`).d('是否关键指标'),
          // key: 'isLowestRequire',
          dataIndex: 'orderSeq',
          fixed: 'left',
          width: 100,
          className: styles.borderRightBolder,
          render: (_, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <span>{record.isLowestRequire}</span>
            )
          }
        }
      ];
      if (answerSourceJs[0].list.length > 0) {
        answerSourceJs[0].list.map((item, i) => {
          columns.push({
            key: `${item.supplierName}${i}`,
            dataIndex: `${item.supplierName}${i}`,
            title: `${item.supplierName}` != 'null' ? `${item.supplierName}` : '',
            width: 300,
            // className: 'border_bottom',
            className: i > 0 ? styles.borderBolder : styles.borderNone,
            children: [
              {
                title: intl.get(`${prompt}.view.title.response`).d('应答情况'),
                width: 75,
                key: `${item.answerCondition}`,
                dataIndex: `${item.answerCondition}`,
                // onHeaderCell: () => ({ className: [styles.border_left] }),
                className: i > 0 ? styles.borderBolder : styles.borderNone,
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      <span>{row.list[i].answerCondition}</span>
                    )
                  }
                },
              },
              {
                title: intl.get(`${prompt}.bid.title.DeviationDescription`).d('偏离情况说明'),
                width: 215,
                key: `${item.deviationRemark}${i}`,
                dataIndex: `${item.deviationRemark}${i}`,
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      tooltipRender(row.list[i].deviationRemark)
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
          title: intl.get(`${dashPrompt}.view.title.clause`).d('大条款'),
          key: 'clause',
          width: 200,
          dataIndex: 'clause',
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.clauseitems`).d('细节条款'),
          key: 'clauseDetail',
          width: 200,
          dataIndex: 'clauseDetail',
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.keyindicators`).d('是否关键指标'),
          key: 'isLowestRequire',
          dataIndex: 'isLowestRequire',
          width: 100,
          render: (val, record) => {
            yesNO.map((item) => {
              if (item.value === record.isLowestRequire) {
                record.isLowestRequire = item.meaning
              }
            })
            return (
              <span>{record.isLowestRequire}</span>
            )
          }
        }
      ];
    }
    return (
      <Form ref={this.contractForm}>
        <div className={styles['cusTableHeader']}>
          <CusTable
            dataSource={answerSourceJs}
            pagination={answerPaginationJs}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={(page) => this.getAnswerTable(milestoneId !== '' ? milestoneId : -1, page)}
          />
        </div>
      </Form>
    );
  }
}
