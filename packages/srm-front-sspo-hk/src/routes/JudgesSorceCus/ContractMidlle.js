/**
 * index.js - 商务应答表
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

export default class ContractMidlle extends React.Component {
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
   * getAnswerTable - 查询商务应答表
   */
  @Bind()
  getAnswerTable(milestoneId, page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getAnswerList',
      payload: {
        page,
        milestoneId: milestoneId !== undefined ? milestoneId : -1,
        proId: match.params.proId, // 测试proId：3
        state: 1, //商务应答表
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
        answerSource = [],
        answerMilestones = [],
        enumMap,
        answerPagination = {},
      },
    } = this.props;
    const { yesNO = [] } = enumMap;
    const { milestoneId } = this.state;
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
          title: intl.get(`${dashPrompt}.view.title.clause`).d('大条款'),
          key: 'clause',
          dataIndex: 'clause',
          fixed: 'left',
          width: 150,
          ellipsis: true,
          resizable: true,
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.clauseitems`).d('细节条款'),
          key: 'clauseDetail',
          dataIndex: 'clauseDetail',
          fixed: 'left',
          width: 200,
          ellipsis: true,
          resizable: true,
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.keyindicators`).d('是否关键指标'),
          key: 'isLowestRequire',
          dataIndex: 'isLowestRequire',
          fixed: 'left',
          width: 120,
          resizable: true,
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
      if (answerSource[0].list.length > 0) {
        answerSource[0].list.map((item, i) => {
          columns.push({
            key: `${item.supplierName}`,
            dataIndex: `${item.supplierName}`,
            title: `${item.supplierName}` != 'null' ? `${item.supplierName}` : '',
            width: 300,
            ellipsis: true,
            // className: 'border_bottom',
            children: [
              {
                title: intl.get(`${prompt}.view.title.response`).d('应答情况'),
                width: 120,
                key: `${item.answerCondition}`,
                dataIndex: `${item.answerCondition}`,
                ellipsis: true,
                resizable: true,
                // onHeaderCell: () => ({ className: [styles.border_left] }),
                render: (_, row) => {
                  if (row.list != undefined) {
                    return (
                      // <span>{row.list[i].answerCondition !== null ? row.list[i].answerCondition : ''}</span>
                      <span>{row.list[i].answerCondition}</span>
                    )
                  }
                },
              },
              {
                title: intl.get(`${prompt}.bid.title.DeviationDescription`).d('偏离情况说明'),
                width: 120,
                key: `${item.deviationRemark}`,
                dataIndex: `${item.deviationRemark}`,
                ellipsis: true,
                resizable: true,
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
          dataIndex: 'clause',
          width: 150,
          ellipsis: true,
          resizable: true,
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.clauseitems`).d('细节条款'),
          key: 'clauseDetail',
          dataIndex: 'clauseDetail',
          width: 200,
          ellipsis: true,
          resizable: true,
          render: tooltipRender,
        },
        {
          title: intl.get(`${prompt}.view.title.keyindicators`).d('是否关键指标'),
          key: 'isLowestRequire',
          dataIndex: 'isLowestRequire',
          width: 120,
          ellipsis: true,
          resizable: true,
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
    const otherListProps = {
      dataSource: answerSource,
      columns,
      pagination: answerPagination,
      scroll: { x: tableScrollWidth(columns) },
      onChange: (page) => this.getAnswerTable(milestoneId !== '' ? milestoneId : -1, page),
    };
    return (
      <Form ref={this.contractForm}>
        <div className={styles['cusTableHeader']}>
          <CusTable {...otherListProps} />
        </div>
      </Form>
    );
  }
}
