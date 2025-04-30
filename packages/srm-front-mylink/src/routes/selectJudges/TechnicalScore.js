import React, { Component } from 'react';
import { Form, Tooltip } from 'hzero-ui';

import { connect } from 'dva';
import intl from 'utils/intl';
import { sum, isEmpty, isNumber } from 'lodash';
import styles from './index.less';
import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';

@connect(({ loading = {}, contractTechnicalMerit = {}, contractJudgesSorce = {} }) => ({
  contractTechnicalMerit,
  contractJudgesSorce,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'hippius.hipsam']
})

@Form.create({ fieldNameProp: null })

export default class TechnicalMerit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      contractTechnicalMerit,
      match,
      scorcDetail,
    } = this.props;
    let revertColumns = [];
    let newSorceDetail = []; //添加总分和权重添加两个空数据的数组

    newSorceDetail = [...scorcDetail]
    // 退回按钮下的表格columns
    revertColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'orderSeq',
        fixed: 'left',
        width: 160,
        render: (text, row, index) => {
          if (row.revItem === 'sumAll') {
            return {
              children: <span>{row.revItemMeaning}</span>,
              props: { 
                colSpan: 2,
                className: 'borderRightBolder'
              },
            }
          } else {
            return (
              tooltipRender(row.revItemMeaning)
            );
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'operator',
        fixed: 'left',
        width: 220,
        className: 'borderRightBolder',
        render: (text, row, index) => {
          if (row.revItem === 'sumAll') {
            return {
              children: <span>{row.revSubItem}</span>,
              props: { 
                colSpan: 0,
                className: 'borderRightBolder'
              },
            }
          } else {
            return (
              tooltipRender(
                <span dangerouslySetInnerHTML={{ __html: `${row.revSubItem}` }} />
              )
            )
          }
        }
      }
    ];
    newSorceDetail[0] && newSorceDetail[0].scoreItemDetail.map((v, i) => {
      revertColumns.push({
        key: `${i}`,
        title: `${v.companyName}`,
        width: 150,
        className: i > 0 ? 'borderBolder' : 'borderNone',
        children: [
          ...(v.partnerScoreDetail).map((h, j) => {
            return {
              key: `${i}${j}`,
              dataIndex: `${i}${j}`,
              title: `${h.judgeName !== null ? h.judgeName : ''}`,
              className: j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0 ? 'borderNone' : '',
              children: [
                {
                  key: `${i}${j}分值`,
                  dataIndex: `${i}${j}分值`,
                  title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                  width: j == 0 && i > 0 ? 83 : 80,
                  className: j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0 ? 'borderNone' : '',
                  render: (val, row, index) => {
                    if (row.scoreItemDetail[i] && row.scoreItemDetail[i].partnerScoreDetail[j] !== undefined) {
                      if (row.revItem === 'sumAll') {
                        return {
                          children:
                            <div style={{ textAlign: 'right' }}>
                              {numberRender(isNumber(row.scoreItemDetail[i].partnerScoreDetail[j].score) ? row.scoreItemDetail[i].partnerScoreDetail[j].score : '', 2)}
                            </div>,
                          props: {
                            colSpan: 2,
                            style: {
                              borderLeft: 'none'
                            }
                          }
                        }
                      } else {
                        return (
                          <div style={{ textAlign: 'right' }}>
                            {numberRender(row.scoreItemDetail[i].partnerScoreDetail[j].score || 0, 2)}
                          </div>
                        )
                      }
                    }
                  }
                }, {
                  key: `${i}${j}理由`,
                  dataIndex: `${i}${j}理由`,
                  width: 100,
                  title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                  className: `${styles['reasonClass']}`,
                  render: (val, row, index) => {
                    if (row.scoreItemDetail[i] && row.scoreItemDetail[i].partnerScoreDetail[j] !== undefined) {
                      if(row.revItem === 'sumAll') {
                        return {
                          props: {
                            colSpan: 0,
                            style: {
                              borderLeft: 'none'
                            }
                          }
                        }
                      } else {
                        return (
                          tooltipRender(row.scoreItemDetail[i].partnerScoreDetail[j].reason || '')
                        )
                      }
                    }
                  }
                }
              ]
            }
          })
        ]
      })
    })

    const revertList = {
      dataSource: newSorceDetail,
      columns: revertColumns,
      pagination: false,
      contractTechnicalMerit,
    };
    revertList.scroll = { x: sum(revertList.columns.map((n) => n.width)) + 300,  y: 520 };

    return (
      <>
        <CusTable rowClassName={styles["revertClass"]} {...revertList} />
      </>
    );
  }
}
