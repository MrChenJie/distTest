/**
 * index.js - 采购人技术评分汇总
 * @date: 2022-04-18
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Input, Table, Row, Col, Card, Avatar, Modal, Select, Tooltip, LocaleProvider } from 'hzero-ui';
import EditTable from 'components/EditTable';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentLanguage, getEditTableData } from 'utils/utils';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { sum, isEmpty } from 'lodash';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';
import style from './index.less';
import UploadFile from './UploadFile';
import styles from './index.less';
import formatterCollections from 'utils/intl/formatterCollections';
// import submitIcon from '@/assets/buttonIcons/提交.png';

const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ loading = {}, contractTechnicalMerit = {} }) => ({
  priceFileListLoading: loading.effects['contractTechnicalMerit/getPriceTable'],
  revertListLoading: loading.effects['contractTechnicalMerit/getScoreDetail'],
  reviewResultsLoading: loading.effects['contractTechnicalMerit/getComplianceList'],
  contractTechnicalMerit,
}))
@formatterCollections({
  code: ['bid.bidcommon']
})

@Form.create({ fieldNameProp: null })

export default class TechnicalMerit extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      saveScore: [], // 保存的数据
      selectedRows: [],
      selectedRowKeys: [],
      selectedRows1: [],
      selectedRowKeys1: [],
      selectedRows2: [],
      selectedRowKeys2: [],
      isPrice: false, // 是否发起报价确认框
      isChoiceJudges: false, //退回先择评委的弹框
      socreConfigIdList: [], // 退回打开弹框传项目id
      fastCodes: {},
      milState: '',
      isSubmitPrice: false, // 是否发起报价的显示判断
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.getMilestoneInfo();
    this.getProjectInfo();
    this.getPriceTable();
    this.getScoreDetail();
    this.getCompliance();
  }
  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/init',
    });
  }
  /**
   * getProjectInfo - 查询是否退回
   */
  @Bind()
  getProjectInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getProjectInfo',
      payload: {
        proId: match.params.proId
      },
    }).then((res) => {
      if (res) {
        if (res.submit && res.milestoneState !== 'affirmed') {
          this.setState({ isSubmitPrice: true })
        } else {
          this.setState({ isSubmitPrice: false })
        }
      }
    })
  }
  /**
   * 查询里程碑状态
   */
  @Bind()
  getMilestoneInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getMilestoneInfo',
      payload: {
        milestoneId: match.params.milestoneId
      },
    }).then((res) => {
      if (res) {
        this.setState({ milState: res.milestoneState });
      }
    })
  }

  // 查询报价汇总表
  @Bind
  getPriceTable() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getPriceTable',
      payload: {
        proId: match.params.proId
      },
    })
  }

  // 查询符合性审查表汇总表
  @Bind
  getCompliance() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getComplianceList',
      payload: {
        proId: match.params.proId
      },
    })
  }

  @Bind
  makeSure() {
    const { dispatch, match } = this.props
    Modal.confirm({
      title: intl.get('bid.bidcommon.view.button.sfcts').d('是否确认技术汇总'),
      onOk: () => {
        dispatch({
          type: 'contractTechnicalMerit/finishList',
          payload: {
            milestoneId: match.params.milestoneId,
          },
        }).then(res => {
          notification.success();
        })
      }
    });
  }

  // 发起报价-显示确认框
  @Bind
  showPriceBox() {
    this.setState({ isPrice: true });
  }

  // 发起报价
  @Bind
  handleInitiate() {
    const { dispatch, match, contractTechnicalMerit: { priceSource } } = this.props;
    // const { selectedRows } = this.state;
    let suppliers = [];
    // 该条数据是否发起报价：isInitiateQuote：0否1是
    for (let i = 0; i < priceSource.length; i++) {
      suppliers.push(priceSource[i].supplierId)
    }
    // if (selectedRows.length > 0) {
    dispatch({
      type: 'contractTechnicalMerit/startPrice',
      payload: {
        milestoneId: match.params.milestoneId,
        proId: match.params.proId,
        supplierIds: suppliers
      },
    }).then((res) => {
      if (res.message == 'ok') {
        this.setState({ isPrice: false })
        this.getProjectInfo();
        this.getMilestoneInfo();
        notification.success({
          message: intl.get(`bid.bidcommon.view.message.quatationsuc`)
            .d('发起报价成功'),
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    })
    // } else {
    //   notification.error({
    //     message: intl
    //       .get(`bid.bidcommon.view.message.leastdata`)
    //       .d('请至少选择一行数据'),
    //   });
    // }
  }

  // 查询技术评分详情表
  @Bind
  getScoreDetail() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getScoreDetail',
      payload: {
        proId: match.params.proId
      },
    })
  }

  // 退回显示选择框
  @Bind
  handleRevert() {
    this.setState({ isChoiceJudges: true });
    this.getJudgesList()
  }

  // 点击退回带参查看评委列表
  @Bind
  getJudgesList() {
    const { dispatch, match } = this.props;
    // let socreIdList = [];
    // for (let i = 0; i < selectedRows1.length; i++) {
    //   socreIdList.push(selectedRows1[i].socreConfigId)
    // }
    dispatch({
      type: 'contractTechnicalMerit/getJudgesList',
      payload: {
        proId: match.params.proId,
        // socreConfigIds: socreIdList
      },
    })
    // .then(() => {
    //   this.setState({ socreConfigIdList: socreIdList })
    // })
  }

  // 确认退回
  @Bind()
  revertJudges() {
    const { dispatch, match, contractTechnicalMerit } = this.props;
    const { selectedRows2 } = this.state;
    let newList = {};
    newList.proId = match.params.proId;
    newList.judgesIdAndReasonsDTOList = [];
    selectedRows2.map((item) => {
      newList.judgesIdAndReasonsDTOList.push(
        {
          judgesId: item.judgesId,
          reason: item.returnReason,
        }
      )
    })
    const params = getEditTableData(selectedRows2, ['returnReason']);
    if(isEmpty(selectedRows2)) {
      return notification.error({
        message: intl
          .get(`warning.message.createNeedAfterSave`)
          .d('没有选中数据'),
      });
    }
    if (params.length > 0) {
      dispatch({
        type: 'contractTechnicalMerit/revertDetail',
        payload: {
          newList
          // proId: match.params.proId,
          // judgesIds: judgesIdList,
          // reason: reasonList,
          // socreConfigIds: socreConfigIdList,
        },
      }).then((res) => {
        if (res.message == 'ok') {
          notification.success({
            message: intl
              .get(`warning.message.createNeedAfterSave`)
              .d(`退回成功`),
          });
          this.setState({
            isChoiceJudges: false,
            selectedRows2: [],
            selectedRowKeys2: []
          });
        } else {
          notification.error({
            message: intl
              .get(`warning.message.createNeedAfterSave`)
              .d(`${res.message}`),
          });
        }
      })
    }
  }

  @Bind
  handleOk() {
    this.revertJudges()
  }

  @Bind
  handleCancel() {
    this.setState({
      isPrice: false,
      isChoiceJudges: false,
      selectedRows2: [],
      selectedRowKeys2: []
    });
  }

  // 确认发起报价
  @Bind
  handleYes() {
    this.setState({ isPrice: true });
    this.handleInitiate();
  }

  /**
   * 表格一设置选中行
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
  /**
   * 表格二设置选中行
   * @param {Array} selectedRowKeys1
   * @param {Array} selectedRows1
   */
  @Bind()
  onRowSelectChange1(selectedRowKeys1, selectedRows1) {
    this.setState({
      selectedRows1,
      selectedRowKeys1,
    });
  }
  /**
   * 退回选择评委弹框表格设置选中行
   * @param {Array} selectedRowKeys2
   * @param {Array} selectedRows3
   */
  @Bind()
  onRowSelectChange2(selectedRowKeys2, selectedRows2) {
    this.setState({
      selectedRows2,
      selectedRowKeys2,
    });
  }

  render() {
    const {
      contractTechnicalMerit,
      priceFileListLoading,
      revertListLoading,
      reviewResultsLoading,
      form = {},
      match,
      pagination,
    } = this.props;
    const { infoSource = [], priceSource = [], scorcDetail = [], complianceList = [], judgesList = [], enumMap = {} } = contractTechnicalMerit;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      selectedRows1 = [],
      selectedRowKeys1 = [],
      selectedRows2 = [],
      selectedRowKeys2 = [],
      fastCodes = {},
      milState,
      isSubmitPrice
    } = this.state;
    const { yesNO = [] } = enumMap;
    let newDataList = []; // 查询后放初始查询的数据源
    let newScoreDTOS = []; // 查询后放初始查询的skillQuerySupplierScoreDTOS数据
    const { saveScore = [] } = scorcDetail.map((item) => {
      newDataList.push(item)
    })
    let revertColumns = [];
    let newSorceDetail = []; //添加总分和权重添加两个空数据的数组
    const { skillQuerySupplierScoreDTOS = [] } = newDataList.map((item) => {
      newScoreDTOS.push(item.skillQuerySupplierScoreDTOS)
    })
    // 获取newScoreDTOS后每个对象里的skillQueryJudgesDTOS
    let realNameList = []
    const { skillQueryJudgesDTOS = [] } = newScoreDTOS.map((item, index) => {
      item[index] != undefined && realNameList.push(item[index].skillQueryJudgesDTOS)
    })
    newSorceDetail = [...scorcDetail]
    const priceColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 100,
        render: (row, record) => (<span>{record.supplierName}</span>)
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.TechnicalDocuments`).d('技术文件'),
        dataIndex: 'tenFileUrls',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 100,
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.tenFileDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.BusinessDocuments`).d('商务文件'),
        dataIndex: 'busiFileUrls',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 100,
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.busiFileDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表文件'),
        dataIndex: 'answerFileUrls',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 100,
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.answerFileDTOS}
            disabled
          />
        )
      }
    ];
    // 退回按钮下的表格columns
    revertColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'scoreClause',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        fixed: 'left',
        width: 150,
        render: (text, row, index) => {
          if (row.scoreClause) {
            if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
              if (row.scoreClause === '总分（百分制）' || row.scoreClause === 'Total Score(percentile)') {
                return {
                  children: <span>{row.scoreClause}</span>,
                  props: { colSpan: 2 },
                }
              } else {
                let proportion = row.scoreClause.substring(0, row.scoreClause.indexOf("("));
                if (proportion === '加权得分' || proportion === 'Proportion') {
                  return {
                    children: <span>{row.scoreClause}</span>,
                    props: { colSpan: 2 },
                  }
                } else {
                  return (
                    <Tooltip title={row.scoreClause} placement="topLeft">
                      <span>{row.scoreClause}</span>
                    </Tooltip>
                  );
                }
              }
            } else {
              return (
                <Tooltip title={row.scoreClause} placement="topLeft">
                  <span>{row.scoreClause}</span>
                </Tooltip>
              );
            }
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'clauseDetail',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        onCell: () => ({ className: styles['cell-border-left'] }),
        fixed: 'left',
        width: 150,
        render: (text, row, index) => {
          if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
            if (newSorceDetail[0].skillQuerySupplierScoreDTOS[0].skillQueryJudgesDTOS[0].realName) { // 当有评委数据时
              return {
                children: 
                  <Tooltip title={row.clauseDetail} placement="topLeft" arrowPointAtCenter={false}>
                    <span>{row.clauseDetail}</span>
                  </Tooltip>,
                props: { colSpan: 0 },
              }
            } else { // 当评委被全部退回后
              return (
                <Tooltip title={row.clauseDetail} placement="topLeft" arrowPointAtCenter={false}>
                  <span>{row.clauseDetail}</span>
                </Tooltip>
              )
            }
          } else {
            return (
              <Tooltip title={row.clauseDetail} placement="topLeft" arrowPointAtCenter={false}>
                <span>{row.clauseDetail}</span>
              </Tooltip>
            );
          }
        }
      }
    ];
    newSorceDetail[0] && newSorceDetail[0].skillQuerySupplierScoreDTOS.map((v, i) => {
      revertColumns.push({
        key: `${i}`,
        title: `${v.supplierName}`,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        children: [
          ...(v.skillQueryJudgesDTOS).map((h, j) => {
            return {
              key: `${i}${j}`,
              dataIndex: `${i}${j}`,
              title: `${h.realName !== null ? h.realName : ''}`,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              children: [
                {
                  key: `${i}${j}分值`,
                  dataIndex: `${i}${j}分值`,
                  title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                  onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                  width: 60,
                  render: (val, row, index) => {
                    if (row.skillQuerySupplierScoreDTOS[i] && row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j] !== undefined) {
                      if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightOne) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightTWO) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightTWO) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <span style={{ 'color': '#e4cc5a' }}>
                                {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                              </span>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                        return (
                          <Tooltip placement="topLeft" title={intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                            <span style={{ 'color': '#e4cc5a' }}>
                              {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                            </span>
                          </Tooltip>
                        )
                      } else {
                        if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
                          return {
                            children: <span style={{ 'color': '#333333' }}>{(Number(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore)).toFixed(2)}{intl.get(`bid.bidcommon.view.title.point`).d('分')}</span>,
                            props: {
                              colSpan: 2
                            }
                          }
                        } else {
                          return (
                            <span style={{ 'color': '#333333' }}>
                              {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || ''}
                            </span>
                          )
                        }
                      }
                    }
                  }
                }, {
                  key: `${i}${j}理由`,
                  dataIndex: `${i}${j}理由`,
                  title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                  // onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                  render: (val, row, index) => {
                    if (row.skillQuerySupplierScoreDTOS[i] && row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j] !== undefined) {
                      if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
                        return {
                          children: <span>{row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetReason || ''}</span>,
                          props: {
                            colSpan: 0
                          }
                        }
                      } else {
                        return (
                          <Tooltip title={row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetReason || ''} placement="topLeft">
                            <span>
                              {row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetReason || ''}
                            </span>
                          </Tooltip>
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
    // 退回的评委columns
    const judgesColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.expertname`).d('评委姓名'),
        dataIndex: 'realName',
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
        dataIndex: 'returnReason',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip placement="topLeft" title={val} >
              {record.$form.getFieldDecorator('returnReason', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.Reason`).d('理由'),
                    }),
                  },
                ],
              })(<Input onChange={(e) => {
                record.returnReason = e.target.value
              }} disabled={record.isMark === 0} placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')} />
              )}
            </Tooltip>
          </Form.Item>
        )
      }
    ];
    const newreviewList = [{
      _status: 'update',
      complianceList
    }]
    // 查询结果汇总的columns
    let reviewColumns = [
      ...(newreviewList[0].complianceList).map((v, i) => {
        return {
          key: `${i}`,
          dataIndex: `${i}`,
          title: `${v.supplierName}`,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          children: [
            ...(v.skillQueryJudgesDTOS).map((h, j) => {
              return {
                key: `${i}${j}`,
                dataIndex: `${i}${j}`,
                title: `${h.realName}`,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                children: [
                  {
                    key: `${i}${j}结果`,
                    dataIndex: `${i}${j}结果`,
                    title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结果（请填写是否通过审查）'),
                    onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                    width: 60,
                    render: (val, record, index) => {
                      if (index !== 0) {
                        return null;
                      }
                      if (index === 0) {
                        return (
                          <Form.Item>
                            {record.$form.getFieldDecorator(`answerGetScore${index}`, {
                              // initialValue: record.skillQueryJudgesDTOS[j].answerGetScore,
                              initialValue: h.answerGetScore,
                              rules: [
                                {
                                  required: false,
                                  message: intl.get('hzero.common.validation.notNull', {
                                    name: intl.get('bid.bidcommon.view.title.reviewresults').d('审查结果（请填写是否通过审查）'),
                                  }),
                                },
                              ],
                            })(
                              <Select allowclear style={{ minWidth: 150 }} disabled={match.params.state === 'edit'}
                                onChange={() => { h.answerGetScore = record.$form.getFieldValue('answerGetScore') }} >
                                {yesNO.map((n) => (
                                  <Select.Option key={n.value} value={n.value}>
                                    {n.meaning}
                                  </Select.Option>
                                ))}
                              </Select>
                            )}
                          </Form.Item>
                        )
                      }
                    }
                  },
                  {
                    key: `${i}${j}理由`,
                    dataIndex: `${i}${j}理由`,
                    title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                    onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                    width: 150,
                    render: (val, record, index) => {
                      if (index !== 0) {
                        return null;
                      }
                      if (index === 0) {
                        return (
                          <Form.Item>
                            <Tooltip placement="topLeft" title={h.answerGetReason} >
                              {record.$form.getFieldDecorator('qaContent', {
                                // initialValue: record.skillQueryJudgesDTOS[j].answerGetReason,
                                initialValue: h.answerGetReason,
                                rules: [
                                  {
                                    required: false,
                                    message: intl.get('hzero.common.validation.notNull', {
                                      name: intl.get('bid.bidcommon.bid.title.Reason').d('理由'),
                                    }),
                                  },
                                ],
                              })(
                                <Input disabled={match.params.state === 'edit'}
                                  placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                                  onChange={(e) => { h.answerGetReason = e.currentTarget.value }} />
                              )}
                            </Tooltip>
                          </Form.Item>
                        )
                      }
                    }
                  }
                ]
              }
            })
          ]
        }
      })
    ];
    const priceFileList = {
      dataSource: priceSource,
      columns: priceColumns,
      pagination: false,
      selectedRows,
      selectedRowKeys,
      contractTechnicalMerit,
      loading: priceFileListLoading
    };
    const revertList = {
      dataSource: newSorceDetail,
      columns: revertColumns,
      pagination: false,
      selectedRows: selectedRows1,
      selectedRowKeys: selectedRowKeys1,
      contractTechnicalMerit,
      loading: revertListLoading
    };
    const reviewResults = {
      dataSource: newreviewList,
      columns: reviewColumns,
      pagination: false,
      contractTechnicalMerit,
      loading: reviewResultsLoading,
      // className: classnames(styles['lastTrNone']),
    };
    const judgesLists = {
      rowKey:"judgesId",
      dataSource: judgesList,
      columns: judgesColumns,
      pagination,
      rowSelection: {
        selectedRowKeys: selectedRowKeys2,
        onChange: this.onRowSelectChange2,
        getCheckboxProps: record => ({
          disabled: record.isMark === 0,
        }),
      },
      selectedRows: selectedRows2,
      selectedRowKeys: selectedRowKeys2,
      contractTechnicalMerit,
    }
    priceFileList.scroll = { x: sum(priceFileList.columns.map((n) => n.width)) + 300 };
    revertList.scroll = { x: sum(revertList.columns.map((n) => n.width)) + 300 };
    reviewResults.scroll = { x: sum(reviewResults.columns.map((n) => n.width)) + 300 };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <Fragment>
        <Content>
          <Card
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
              </h3>
            }
          >
            <Row style={{ marginTop: '15px' }}>
              <Col span={24}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.purchaseschemename').d('采购方案名称')}
                  {...formlayout}
                >
                  <Input style={{ width: '87.7vw' }} value={infoSource.proName} disabled />
                </Form.Item>
              </Col>
              <Col span={8} {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                  {...formlayout}
                >
                  <Input value={infoSource.packageName} disabled />
                </Form.Item>
              </Col>
              <Col span={8} {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                  {...formlayout}
                >
                  <Input value={infoSource.packageNo} disabled />
                </Form.Item>
              </Col>
              <Col span={8} {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                  {...formlayout}
                >
                  <Input value={infoSource.proCode} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* <Card
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl.get(`bid.bidcommon.view.title.biddinground`).d('投标轮次')}
              </h3>
            }
          >
            <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('bid.bidcommon.view.title.round').d('轮次')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input value={infoSource.round} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('bid.bidcommon.view.title.deadline').d('截止时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input value={infoSource.milestoneEndTime} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('bid.bidcommon.view.title.tendersubmissiontime').d('递交投标时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input value={infoSource.milestoneStartTime} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card> */}
          {match.params.state === 'edit' && milState && milState !== 'affirmed' && (infoSource.purchaseType === 'invited_bidding' || infoSource.purchaseType === 'public_bidding') ? (
            <div className={style['price-btn-style']}>
              <Avatar size="small" src={queryResBtn} />
              {/* <Button onClick={this.showPriceBox} >
              {intl.get('view.button.initiatequotation').d('发起报价')}
            </Button> */}
              <span style={{ verticalAlign: 'middle', cursor: 'pointer', color: isSubmitPrice ? '#0085d0':'#999999' }} onClick={isSubmitPrice && this.showPriceBox}>
                {intl.get('bid.bidcommon.view.button.initiatequotation').d('发起报价')}
              </span>
            </div>
          ) : (
            <p></p>
          )}
          {match.params.state === 'edit' && milState && milState !== 'affirmed' && infoSource.purchaseType !== 'invited_bidding' && infoSource.purchaseType !== 'public_bidding' ? (
            <div className={style['price-btn-style']}>
              <Avatar size="small" src={queryResBtn} />
              <span style={{ verticalAlign: 'middle', cursor: 'pointer' }} onClick={this.makeSure}>
                {intl.get('bid.bidcommon.view.button.cts').d('确认技术汇总')}
              </span>
            </div>
          ) : (
            <p></p>
          )}
          <Table className={style['tableMargin-bottom']} bordered {...priceFileList}></Table>
          {infoSource.purchaseType === 'invited_bidding' || infoSource.purchaseType === 'public_bidding' ? (
            <>
              {match.params.state === 'edit' && milState && milState !== 'affirmed' && <div className={style['price-btn-style']}>
                <Avatar size="small" src={queryResBtn} />
                <span style={{ verticalAlign: 'middle', cursor: 'pointer' }} onClick={this.handleRevert}>
                  {intl.get('bid.bidcommon.view.button.return').d('退回')}
                </span>
              </div>}
              <Table className={style['tableMargin-bottom']} bordered {...revertList}></Table>
            </>
          ) : (
            <EditTable className={style['tableMargin-top', 'tableMargin-bottom', 'compreReviewStyle']} bordered {...reviewResults}></EditTable>
          )}
          < Modal title={intl.get('bid.bidcommon.view.message.confirmquatation').d("是否确认发起报价")}
            visible={this.state.isPrice}
            onOk={this.handleYes}
            onCancel={this.handleCancel}
          >
            <p>{intl.get('bid.bidcommon.view.title.quoteconfirm').d('说明：请确认技术评分无异常，再发起报价阶段')}</p>
          </Modal>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <Modal
              destroyOnClose
              title={intl.get('bid.bidcommon.view.title.returnscore').d("退回技术评分")}
              visible={this.state.isChoiceJudges}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
              okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
              width="40%"
            >
              <EditTable bordered {...judgesLists} />
            </Modal>
          </LocaleProvider>
        </Content>
      </Fragment >
    );
  }
}
