/**
 * index.js - 技术评分表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React from 'react';
import { Form, Input, Upload, Modal, InputNumber } from 'antd';
import CusButton from '_cus_components/CusButton';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusNotification from '_cus_components/CusNotification';
import { tooltipRender } from '_cus_utils/render';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentLanguage, tableScrollWidth } from 'utils/utils';
import styles from './index.less';

const prompt = 'bid.bidcommon';

@connect(({ loading = {}, contractJudgesCusSorce = {} }) => ({
  judgesSorceList: loading.effects['contractJudgesCusSorce/getTechnical'],
  contractJudgesCusSorce,
}))

export default class TechnicalScore extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      newDatasource: [],
      saveScoreFlag: false, // 是否点击了保存
      saveScore: [], // 保存的数据
      code: 'BID_SCORECONFIG',
      upload: false,
      groupUnsaveScoreFlag: false,
      data: [],
    };
  }

  scoreForm = React.createRef();

  componentDidMount() {
    const { fetchScoreTable = (e) => e } = this.props;
    fetchScoreTable(); // 查询数据
  }

  @Bind
  changeChosen(record, index) {
    const { contractJudgesCusSorce: { passStatus } } = this.props;
    passStatus[index].unqualifiedSupplier = this.scoreForm.current?.getFieldValue(`unqualifiedSupplier`)
  }

  @Bind
  beforeUpload(file) {
    const {
      match,
      dispatch,
      fetchScoreTable = (e) => e
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    dispatch({
      type: 'contractJudgesCusSorce/updateState',
      payload: {
        judgesSorceDataSource: [],
      },
    });
    if (file.uid) {
      this.setState({
        uploadLoading: true,
      });
      dispatch({
        type: 'contractJudgesCusSorce/goImport',
        payload: {
          exportInfo: {
            proId: match.params.proId,
            organizationId: getCurrentOrganizationId()
          },
          file: formData,
        }
      }).then(res => {
        let mess = JSON.parse(res);
        fetchScoreTable();
        this.setState({data: this.props.contractJudgesCusSorce.judgesSorceDataSource})
        if (mess.message === 'err') {
          CusNotification.error({
            message: intl.get(`${prompt}.view.title.scoreoutofrange`).d('存在分数超出设置范围'),
          });
        } else if (mess.message === 'ok') {
          fetchScoreTable();
          CusNotification.success({
            message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
          });
        } else if (mess.message === 'overlong') {
          // 分数最大300，理由最大字符1000
          CusNotification.error({
            message: intl.get(`${prompt}.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符'),
          });
        } else {
          CusNotification.error({
            message: intl.get(`${prompt}.view.title.inporterror`).d('传入数据有误或者文件类型不匹配'),
          });
        }
      }).finally(() => {
        this.setState({
          uploadLoading: false,
        });
      });
    }
    return false;
  }

  // 导出
  @Bind
  handleExport(event) {
    event.preventDefault();
    event.stopPropagation();
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/goExport',
      payload: {
        exportInfo: {
          proId: match.params.proId,
          organizationId: getCurrentOrganizationId()
        }
      }
    }).then(res => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(new Blob([res],
        // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const location = document.createElement('a');
      location.style.display = 'none';
      const fileName = "技术评分表导出.xlsx";
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    });
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  @Bind
  handleDataChange() {
    const { groupUnsaveScoreFlag } = this.state;
    if (!groupUnsaveScoreFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page) {
    const { groupUnsaveScoreFlag, fetchScoreTable = (e) => e } = this.state;
    if (groupUnsaveScoreFlag) {
      Modal.confirm({
        title: intl
          .get(`${prompt}.view.message.confirmgetout`)
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        onOk: () => {
          fetchScoreTable();
        },
      });
    } else {
      fetchScoreTable(page);
    }
  }

  render() {
    const {
      contractJudgesCusSorce: {
        judgesSorceDataSource,
        enumMap,
      },
      basicInfo,
      submitState,
      paStating,
    } = this.props;
    const { yesNo = [] } = enumMap;
    // const uploadProps = {
    //   accept: '.xls,.xlsx,.csv',
    //   beforeUpload: this.beforeUpload,
    //   showUploadList: false,
    // };
    // 查询所有数据后获取每个对象里的list
    let lists = []
    let newDataList = []; // 查询后放初始查询的list数据
    let newDatasource = [...judgesSorceDataSource]; // newDatasource:为添加总分和权重添加两个空数据的数组
    if (judgesSorceDataSource.length > 0) {
      judgesSorceDataSource.map((item) => {
        lists.push(item.list)
      })
      newDataList = judgesSorceDataSource[0].list
    }
    const sorceList = judgesSorceDataSource.length > 0 ? [
      {
        title: intl.get(`${prompt}.view.title.scoringprojects`).d('评审大项'),
        // key: 'scoreClause',
        dataIndex: 'operator',
        width: 100,
        fixed: true,
        required: true,
        render: (text, record, index) => {
          if (index < newDatasource.length - 2) {
            return tooltipRender(record.scoreClause)
          } else if (index == newDatasource.length - 2) {
            return {
              children: 
                <span>
                  {tooltipRender(intl.get(`${prompt}.view.title.totalscore`).d('总分(百分制)'))}
                </span>,
              width: 260,
              props: {
                colSpan: 3,
              },
            };
          } else if (index == newDatasource.length - 1) {
            return {
              children: 
                <span>
                  {tooltipRender(intl.get(`${prompt}.view.title.proportion`).d('加权得分') + '（' + `${newDatasource[0].tenRate}` + '%）')}
                </span>,
              width: 260,
              props: {
                colSpan: 3,
              },
            };
          }
        },
      },
      {
        title: intl.get(`${prompt}.view.title.scoringitems`).d('评分细项'),
        // key: 'clauseDetail',
        dataIndex: 'soLineNumber',
        width: 100,
        fixed: true,
        required: true,
        render: (text, record, index) => {
          if (index < newDatasource.length - 2) {
            return (
              tooltipRender(record.clauseDetail)
            )
          } else if (index == newDatasource.length - 2) {
            return {
              children: getCurrentLanguage() === 'zh_CN' ? <div style={{ textAlign: 'right' }}>100.00</div>
               : 
                <div style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'right' }}>100.00</div>,
              props: {
                colSpan: 1,
              },
            }
          }
          // 技术评分比例:tenRate
          else if (index == newDatasource.length - 1) {
            return {
              children: 
                getCurrentLanguage() === 'zh_CN' ? 
                <div style={{ textAlign: 'right' }}>{(100 * newDatasource[0].tenRate / 100).toFixed(2)}</div>
                : <div style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'right' }}>
                  {(100 * newDatasource[0].tenRate / 100).toFixed(2)}
                </div>,
              props: {
                // colSpan: newDatasource[0].list.length * 2 + 1,
                colSpan: 1,
              },
            }
          }
        }
      },
      {
        title: intl.get(`HKPC.commom.view.title.scorerange`).d('设置分值下拉值'),
        key: 'operation',
        dataIndex: 'operation',
        width: 100,
        fixed: true,
        render: (text, record, index) => {
          if (index < newDatasource.length - 2) {
            return (
              tooltipRender(record.setScore)
            )
          } else if (index === newDatasource.length - 2) {
            return {
              children: <span />,
              props: { colSpan: 0 },
            }
          } else if (index === newDatasource.length - 1) {
            return {
              children: <span />,
              props: { colSpan: 0 },
            }
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.score`).d('分值'),
        // key: 'score',
        dataIndex: 'lineNum',
        width: 80,
        fixed: true,
        required: true,
        render: (text, record, index) => {
          if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            return {
              children: <span />,
              props: {
                colSpan: 0,
                style: { borderLeft: 'none' },
              },
            }
          } else {
            return (
              <div style={{ 'color': '#333333', textAlign: 'right' }}>{Number(record.score).toFixed(2)}</div>
            )
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.objective`).d('是否客观分'),
        // key: 'isObjectiveScore',
        dataIndex: 'orderSeq',
        width: 80,
        fixed: true,
        required: true,
        className: styles.borderRightBolder,
        render: (row, record, index) => {
          if (index === newDatasource.length - 2) {
            return {
              children: <span />,
              props: {
                colSpan: 1,
                style: { borderLeft: 'none' },
              },
            }
          } else if (index === newDatasource.length - 1) {
            return {
              children: <span />,
              props: {
                colSpan: 0,
                style: { borderLeft: 'none' },
              },
            }
          } else {
            yesNo.map((item) => {
              if (item.meaning === record.isObjectiveScore) {
                record.isObjectiveScore = item.meaning
              }
            })
            return (
              <span>{record.isObjectiveScore}</span>
            )
          }
        }
      },
      ...(newDataList).map((v, k) => {
        return {
          key: `${v.supplierName}${v.supplierId}`,
          dataIndex: `${v.supplierName}${v.supplierId}`,
          title: `${v.supplierName}`,
          // width: 130,
          className: k > 0 ? styles.borderBolder : styles.borderNone,
          children: [
            {
              title: intl.get(`${prompt}.view.title.score`).d('分值'),
              key: `${v.answerGetScore}${v.supplierId}`,
              dataIndex: `${v.answerGetScore}${v.supplierId}`,
              width: 80,
              required: true,
              className: k > 0 ? styles.borderBolder : styles.borderNone,
              render: (text, record, index) => {
                if (index < newDatasource.length - 2) {
                  // 客观计件式（一般计件-带下限值）,客观计件式（一般计件-下限值=0）,客观计件式（是非式）,客观计件式（负偏离扣分）
                  if (record.scoreType === 'objectivePieceCount_generalpiececount_withlowerlimit' ||
                    record.scoreType === 'objectivePieceCount_generalpiececount_withlowerlimit0' ||
                    record.scoreType === 'objectivePieceCounting_yesorno' ||
                    record.scoreType === 'objectivePieceCounting_deductionfornegativedeviation') {
                    return (
                      // (record.submit || !this.props.paStating) ?
                      ((!basicInfo.rateYesOrNo && (record.submit || !this.props.paStating)) || (basicInfo.rateYesOrNo && record.list[k].answerGetState === '1')) ?
                        <div style={{ textAlign: 'right' }}>
                          {Number(record.list[k].answerGetScore).toFixed(2)}
                        </div>
                      : <Form.Item
                        name={record.list[k].uuid}
                        rules={[
                          {
                            required: !record.list[k].answerGetScore,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${prompt}.view.title.scorefenshu`).d('分值'),
                            })
                          },
                        ]}
                        // initialValue={record.list[k].answerGetScore}
                      >
                        <CusSelect style={{ width: '100%' }} placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                          // disabled={record.submit || !this.props.paStating}
                          defaultValue={record.list[k].answerGetScore}
                          options={record.scoreRange}
                          onChange={(val) => {
                            if (record.list[k].answerGetScore !== val) {
                              record.list[k].answerGetScore = val;
                              const data = newDatasource;
                              data[index].list[k].answerGetScore = val;
                              if (lists.length > 0) {
                                for (let i = 0; i < data[index].list.length; i++) {
                                  let total = 0;
                                  for (let j = 0; j < data.length - 2; j++) {
                                    // if (data[j].list[i].answerGetScore !== null) {
                                      total += Number(data[j].list[i].answerGetScore ? data[j].list[i].answerGetScore : 0);
                                      record.list[i].total = (total).toFixed(2);
                                      data[j].list[i].total = (total).toFixed(2);
                                      if (data[j + 1].list !== undefined) {
                                        data[j + 1].list[i].total = (total).toFixed(2);
                                      }
                                    // }
                                  }
                                  total = 0;
                                }
                                this.setState({ data: data })
                              }
                            }
                          }}
                        />
                      </Form.Item>
                    );
                  } else {
                    return (
                      ((!basicInfo.rateYesOrNo && (record.submit || !this.props.paStating)) || (basicInfo.rateYesOrNo && record.list[k].answerGetState === '1')) ?
                        <div style={{ textAlign: 'right' }}>
                          {Number(record.list[k].answerGetScore).toFixed(2)}
                        </div>
                      : <Form.Item
                        name={record.list[k].uuid}
                        // initialValue={record.list[k].answerGetScore}
                        rules={[
                          {
                            required: !record.list[k].answerGetScore,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${prompt}.view.title.scorefenshu`).d('分值'),
                            })
                          },
                        ]}
                        className={styles['inputNumber']}
                      >
                        <InputNumber style={{ width: '100%', textAlign: 'right' }} placeholder={intl.get(`${prompt}.view.title.pleaseenter`).d('请输入')}
                          // disabled={record.submit || !this.props.paStating}
                          defaultValue={record.list[k].answerGetScore}
                          precision={2}
                          onChange={(e) => {
                            record.list[k].answerGetScore = e
                            const data = newDatasource;
                            data[index].list[k].answerGetScore = e;
                              if (lists.length > 0) {
                                for (let i = 0; i < data[index].list.length; i++) {
                                  let total = 0;
                                  for (let j = 0; j < data.length - 2; j++) {
                                    // if (data[j].list[i].answerGetScore !== null) {
                                      total += Number(data[j].list[i].answerGetScore ? data[j].list[i].answerGetScore : 0);
                                      record.list[i].total = (total).toFixed(2);
                                      data[j].list[i].total = (total).toFixed(2);
                                      if (data[j + 1].list !== undefined) {
                                        data[j + 1].list[i].total = (total).toFixed(2);
                                      }
                                    // }
                                  }
                                  total = 0;
                                }
                                // this.setState({ data: data })
                              }
                          }}
                          onKeyDown={(e) => {
                            if ((e.keyCode === 13 || e.keyCode === 32) && e.target) {
                              e.preventDefault();
                              const form = e.target.closest('form');
                              const submitBtn = form && form.querySelector('button[type="submit"]');
                              if (submitBtn) {
                                submitBtn.click();
                              }
                              return false;
                            }
                          }}
                        />
                      </Form.Item>
                    );
                  }
                }
                if (index === newDatasource.length - 2) {
                  return {
                    children:
                      <div style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'right' }}>
                        {this.state.data.length > 0 ? this.state.data[this.state.data.length - 3]?.list[k].total : newDatasource[newDatasource.length - 3].list[k].total}
                        {/* {getCurrentLanguage() === 'zh_CN' ? intl.get(`${prompt}.view.title.point`).d('分') : ''} */}
                      </div>,
                    props: {
                      colSpan: 1,
                    },
                  };
                }
                if (index === newDatasource.length - 1) {
                  return {
                    props: {
                      colSpan: 0,
                      style: { borderLeft: 'none' },
                    },
                  }
                }
              }
            },
            {
              title: intl.get(`${prompt}.bid.title.Reason`).d('理由'),
              key: `${v.answerGetReason}${v.supplierId}`,
              dataIndex: `${v.answerGetReason}${v.supplierId}`,
              width: 120,
              render: (text, record, index) => {
                if (index < newDatasource.length - 2) {
                  return (
                    ((!basicInfo.rateYesOrNo && (record.submit || !this.props.paStating)) || (basicInfo.rateYesOrNo && record.list[k].answerGetState === '1')) ?
                    tooltipRender(record.list[k].answerGetReason)
                    : <Form.Item name={record.list[k].uuid2} key={record.list[k].uuid2}>
                      <CusInput.TextArea
                        autoChangeSize={true}
                        inputChinese={true}
                        // disabled={record.submit || !this.props.paStating}
                        defaultValue={record.list[k].answerGetReason}
                        placeholder={intl.get(`${prompt}.view.title.pleaseenter`).d('请输入')}
                        onBlur={(e) => {
                          let value = e.target.value;
                          record.list[k].answerGetReason = value;
                          }
                        }
                      />
                    </Form.Item>
                  )
                }
                if (index === newDatasource.length - 2) {
                  return {
                    props: {
                      colSpan: 1,
                      style: { borderLeft: 'none' },
                    },
                  };
                }
                if (index === newDatasource.length - 1) {
                  return {
                    props: {
                      colSpan: 0,
                      style: { borderLeft: 'none' },
                    },
                  };
                }
              }
            }
          ],
        };
      }),
    ] : [
      {
        title: intl.get(`${prompt}.view.title.scoringprojects`).d('评审大项'),
        key: 'scoreClause',
        dataIndex: 'scoreClause',
        width: 120,
        required: true,
      },
      {
        title: intl.get(`${prompt}.view.title.scoringitems`).d('评分细项'),
        key: 'clauseDetail',
        dataIndex: 'clauseDetail',
        width: 140,
        fixed: true,
        required: true,
      },
      {
        title: intl.get(`HKPC.commom.view.title.ScoreValue`).d('设置分值下拉值'),
        key: 'setScore',
        dataIndex: 'setScore',
        width: 140,
        fixed: true,
      },
      {
        title: intl.get(`${prompt}.view.title.score`).d('分值'),
        key: 'score',
        dataIndex: 'score',
        width: 80,
        required: true,
        render: (text) => {
          return (<div>{Number(text).toFixed(2)}</div>)
        }
      },
      {
        title: intl.get(`${prompt}.view.title.objective`).d('是否客观分'),
        key: 'isObjectiveScore',
        dataIndex: 'isObjectiveScore',
        width: 120,
        required: true,
      },
    ];

    return (
      <>
        {/* <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <CusButton mini onClick={(e) => this.handleExport(e)}>
            {intl.get(`${prompt}.view.button.export`).d('导出')}
          </CusButton>
          <Upload {...uploadProps}>
            <CusButton mini disabled={this.props.submitState || !this.props.paStating} >
              {intl.get(`${prompt}.view.button.import`).d('导入')}
            </CusButton>
          </Upload>
        </div> */}
        <div className={styles['scoreTableStyle']} >
        <Form ref={this.scoreForm}>
          <EditTable
            dataSource={judgesSorceDataSource}
            columns={sorceList}
            pagination={false}
            rowClassName={[styles["tableLastTwoCol"]]}
            scroll={{ x: tableScrollWidth(sorceList) }}
          />
          </Form>
        </div>
      </>
    );
  }
}