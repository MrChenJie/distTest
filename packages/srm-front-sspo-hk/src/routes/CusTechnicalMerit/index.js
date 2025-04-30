/**
 * index.js - 采购人技术评分汇总
 * @date: 2022-04-18
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Tooltip } from 'hzero-ui';
import { Input, Col, Collapse } from 'antd';

import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getEditTableData, getCurrentLanguage } from 'utils/utils';
import { sum, isEmpty } from 'lodash';
import UploadFile from './UploadFile';
import styles from './index.less';
import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import EditTable from '_cus_components/EditTable';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { tooltipRender } from '_cus_utils/render';
import CusInput from '_cus_components/CusInput';
import CusNotification from '_cus_components/CusNotification';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { numberRender } from 'utils/renderer';
import { closeWindow } from '_cus_utils/utils';

const { Panel } = Collapse;

@connect(({ loading = {}, contractTechnicalMerit = {} }) => ({
  priceFileListLoading: loading.effects['contractTechnicalMerit/getPriceTable'],
  revertListLoading: loading.effects['contractTechnicalMerit/getScoreDetail'] || loading.effects['contractTechnicalMerit/getScoreDetailJudge'],
  reviewResultsLoading: loading.effects['contractTechnicalMerit/getComplianceList'],
  downLoadJudgeLoading: loading.effects['contractTechnicalMerit/downloadJudgeList'],
  contractTechnicalMerit,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'HKPC.commom',
  ]
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
      activeKey: ['form', 'uploadTable', 'table', 'judgessTable'],
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.getMilestoneInfo();
    this.getProjectInfo();
    this.getPriceTable();
    this.getScoreDetail();
    this.getScoreDetailJudge();
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
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
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
    CusModal.confirm({
      content: intl.get('bid.bidcommon.view.button.sfcts').d('是否确认技术汇总'),
      onOk: () => {
        dispatch({
          type: 'contractTechnicalMerit/finishList',
          payload: {
            milestoneId: match.params.milestoneId,
          },
        }).then(res => {
          if(res) {
            this.getMilestoneInfo(); // 更新确认技术汇总按钮状态
            CusNotification.success();
            window.close();
            // 飞书提交审批后关闭tag页
            closeWindow();
          }
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
        CusNotification.success();
      } else {
        CusNotification.error({
          message: res.message,
        });
      }
    })
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

  // 查询评委评分详情表
  @Bind
  getScoreDetailJudge() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getScoreDetailJudge',
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
      return CusNotification.error({
        message: intl
          .get(`bid.bidcommon.view.message.hasnotbeenselected`)
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
          CusNotification.success({
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
          CusNotification.error({
            message: res.message,
          });
        }
      })
    }
  }

  @Bind
  handleOk() {
    this.revertJudges();
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

  @Bind()
  downLoadJudge() {
    const { dispatch, match, contractTechnicalMerit } = this.props;
    const { infoSource } = contractTechnicalMerit;
    dispatch({
      type: 'contractTechnicalMerit/downloadJudgeList',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(
        new Blob(
          [res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        )
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      const fileName = intl.get(`HKPC.commom.bid.button.judgesscores`).d('评委评分');
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    })
  }

  // 导出
  handleExport = () => { 
    event.preventDefault();
    event.stopPropagation();
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/skillQueryNewExport',
      payload: { proId: match.params.proId },
    }).then((res) => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(
        new Blob(
          [res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        )
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      const fileName = intl.get(`bid.bidcommon.view.title.TeScSu`).d('技术评分汇总');
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    });
  }

  render() {
    const gridSpan = getDFormGridSpan();
    const {
      contractTechnicalMerit,
      priceFileListLoading,
      revertListLoading,
      reviewResultsLoading,
      form: { getFieldDecorator },
      match,
      pagination,
      downLoadJudgeLoading = false,
    } = this.props;
    const { infoSource = [], priceSource = [], scorcDetail = [], scorcDetailJudge = [], complianceList = [], judgesList = [], enumMap = {} } = contractTechnicalMerit;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      selectedRows1 = [],
      selectedRowKeys1 = [],
      selectedRows2 = [],
      selectedRowKeys2 = [],
      fastCodes = {},
      milState,
      isSubmitPrice,
      activeKey,
    } = this.state;
    const { yesNO = [] } = enumMap;
    let newDataList = []; // 查询后放初始查询的数据源
    let newScoreDTOS = []; // 查询后放初始查询的skillQuerySupplierScoreDTOS数据
    const { saveScore = [] } = scorcDetail.map((item) => {
      newDataList.push(item)
    })
    let revertColumns = [];
    let judgeRevertColumns = [];
    let newSorceDetail = []; //添加总分和权重添加两个空数据的数组
    let newSorceDetailJudge = []; //添加总分和权重添加两个空数据的数组
    const { skillQuerySupplierScoreDTOS = [] } = newDataList.map((item) => {
      newScoreDTOS.push(item.skillQuerySupplierScoreDTOS)
    })
    // 获取newScoreDTOS后每个对象里的skillQueryJudgesDTOS
    let realNameList = []
    const { skillQueryJudgesDTOS = [] } = newScoreDTOS.map((item, index) => {
      item[index] != undefined && realNameList.push(item[index].skillQueryJudgesDTOS)
    })
    newSorceDetail = [...scorcDetail]
    newSorceDetailJudge = [...scorcDetailJudge]
    const priceColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: 300,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.TechnicalDoc`).d('技术文件'),
        dataIndex: 'technicalDocDTOS',
        width: 100,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.technicalDocDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.CoveringLetter`).d('说明书'),
        dataIndex: 'coveringLetterDTOS',
        width: 100,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.coveringLetterDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.ExecutiveSum`).d('经营综合报告'),
        dataIndex: 'executiveSumDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.executiveSumDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.ProjectProposal`).d('项目提案'),
        dataIndex: 'projectProposalDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.projectProposalDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.TendererQualifications`).d('投标资格说明书'),
        dataIndex: 'tendererQualificationsDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.tendererQualificationsDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.ConfidentAgree`).d('保密协议'),
        dataIndex: 'confidentAgreeDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.confidentAgreeDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.AcknowledgementLetter`).d('反串谋确认函'),
        dataIndex: 'acknowledgementLetterDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.acknowledgementLetterDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.brcertificate`).d('商业登记证明'),
        dataIndex: 'brCertificateDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.brCertificateDTOS}
            disabled
          />
        )
      },
      {
        title: intl.get(`HKPC.commom.view.title.Others`).d('其他'),
        dataIndex: 'othersDTOS',
        width: getCurrentLanguage() === 'zh_CN' ? 100 : 200,
        className: 'tenFile',
        render: (row, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.supplierId}
            value={record.othersDTOS}
            disabled
          />
        )
      }
    ];
    // 退回按钮下的表格columns
    revertColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'orderSeq',
        fixed: 'left',
        width: 200,
        render: (text, row, index) => {
          if (row.scoreClause) {
            if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
              if (row.scoreClause === '总分（百分制）' || row.scoreClause === 'Total Score(percentile)') {
                return {
                  children: <span>{row.scoreClause}</span>,
                  props: { 
                    colSpan: 2,
                    className:'borderRightBolder'
                  },
                }
              } else {
                let proportion = row.scoreClause.substring(0, row.scoreClause.indexOf("("));
                if (proportion === '加权得分' || proportion === 'Proportion') {
                  return {
                    children: <span>{row.scoreClause}</span>,
                    props: { 
                      colSpan: 2,
                      className:'borderRightBolder'
                     },
                  }
                } else {
                  return (
                    tooltipRender(row.scoreClause)
                  );
                }
              }
            } else {
              return (
                tooltipRender(row.scoreClause)
              );
            }
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'operator',
        fixed: 'left',
        width: 200,
        className: 'borderRightBolder',
        render: (text, row, index) => {
          if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
            if (newSorceDetail[0].skillQuerySupplierScoreDTOS[0].skillQueryJudgesDTOS[0].realName) { // 当有评委数据时
              return {
                children:
                  tooltipRender(row.clauseDetail),
                props: { colSpan: 0 },
              }
            } else { // 当评委被全部退回后
              return (
                tooltipRender(row.clauseDetail)
              )
            }
          } else {
            return (
              tooltipRender(row.clauseDetail)
            );
          }
        }
      }
    ];
    newSorceDetail[0] && newSorceDetail[0].skillQuerySupplierScoreDTOS.map((v, i) => {
      revertColumns.push({
        key: `${i}`,
        title: `${v.supplierName}`,
        width: 150,
        className:i > 0 ? 'borderBolder' : 'borderNone',
        children: [
          ...(v.skillQueryJudgesDTOS).map((h, j) => {
            return {
              key: `${i}${j}`,
              dataIndex: `${i}${j}`,
              title: `${h.realName !== null ? h.realName : ''}`,
              className:j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0? 'borderNone' : '',
              children: [
                {
                  key: `${i}${j}分值`,
                  dataIndex: `${i}${j}分值`,
                  title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                  width: 70,
                  className:j == 0 && i > 0 ? 'borderBolder' : j == 0 &&i == 0? 'borderNone' : '',
                  render: (val, row, index) => {
                    if (row.skillQuerySupplierScoreDTOS[i] && row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j] !== undefined) {
                      if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightOne) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightTWO) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightTWO) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightThree) {
                        if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].highlightFurth) {
                        return (
                          <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                            <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                              {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                            </div>
                          </Tooltip>
                        )
                      } else {
                        if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
                          return {
                            children:
                              <div style={{ textAlign: 'right' }}>
                                {(Number(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore)).toFixed(2)}
                              </div>,
                            props: {
                              colSpan: 1
                            }
                          }
                        } else {
                          return (
                            <div style={{ textAlign: 'right' }}>
                              {numberRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetScore || '', 2)}
                            </div>
                          )
                        }
                      }
                    }
                  }
                }, {
                  key: `${i}${j}理由`,
                  dataIndex: `${i}${j}理由`,
                  width: 80,
                  title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                  className: `${styles['reasonClass']}`,
                  render: (val, row, index) => {
                    if (row.skillQuerySupplierScoreDTOS[i] && row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j] !== undefined) {
                      if (index == newSorceDetail.length - 1 || index == newSorceDetail.length - 2) {
                        return {
                          props: {
                            colSpan: 1
                          }
                        }
                      } else {
                        return (
                          tooltipRender(row.skillQuerySupplierScoreDTOS[i].skillQueryJudgesDTOS[j].answerGetReason || '')
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
    // 评委评分表格
    judgeRevertColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'orderSeq',
        fixed: 'left',
        width: 200,
        render: (text, row, index) => {
          if (row.scoreClause) {
            if (index == newSorceDetailJudge.length - 1 || index == newSorceDetailJudge.length - 2) {
              if (row.scoreClause === '总分（百分制）' || row.scoreClause === 'Total Score(percentile)') {
                return {
                  children: <span>{row.scoreClause}</span>,
                  props: { 
                    colSpan: 2,
                    className:'borderRightBolder'
                  },
                }
              } else {
                let proportion = row.scoreClause.substring(0, row.scoreClause.indexOf("("));
                if (proportion === '加权得分' || proportion === 'Proportion') {
                  return {
                    children: <span>{row.scoreClause}</span>,
                    props: { 
                      colSpan: 2,
                      className:'borderRightBolder'
                     },
                  }
                } else {
                  return (
                    tooltipRender(row.scoreClause)
                  );
                }
              }
            } else {
              return (
                tooltipRender(row.scoreClause)
              );
            }
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'operator',
        fixed: 'left',
        width: 200,
        className: 'borderRightBolder',
        render: (text, row, index) => {
          if (index == newSorceDetailJudge.length - 1 || index == newSorceDetailJudge.length - 2) {
            if (newSorceDetailJudge[0].skillQueryJudgesScoreDTOS[0].skillQuerySupplierDTOS[0].realName) { // 当有评委数据时
              return {
                children:
                  tooltipRender(row.clauseDetail),
                props: { colSpan: 0 },
              }
            } else { // 当评委被全部退回后
              return (
                tooltipRender(row.clauseDetail)
              )
            }
          } else {
            return (
              tooltipRender(row.clauseDetail)
            );
          }
        }
      }
    ];
    newSorceDetailJudge[0] && newSorceDetailJudge[0].skillQueryJudgesScoreDTOS.map((v, i) => {
      judgeRevertColumns.push({
        key: `${i}`,
        title: `${v.realName}`,
        width: 150,
        className:i > 0 ? 'borderBolder' : 'borderNone',
        children: [
          ...(v.skillQuerySupplierDTOS).map((h, j) => {
            return {
              key: `${i}${j}`,
              dataIndex: `${i}${j}`,
              title: `${h.supplierName !== null ? h.supplierName : ''}`,
              className:j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0? 'borderNone' : '',
              children: [
                {
                  key: `${i}${j}分值`,
                  dataIndex: `${i}${j}分值`,
                  title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                  width: 70,
                  className:j == 0 && i > 0 ? 'borderBolder' : j == 0 &&i == 0? 'borderNone' : '',
                  render: (val, row, index) => {
                    if (row.skillQueryJudgesScoreDTOS[i] && row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j] !== undefined) {
                      if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightOne) {
                        if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightTWO) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.keguanfendiyusishi`).d('客观分低于该评分项的40%，且主观分接近满分；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightTWO) {
                        if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightThree) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweitongshichuxiangaofenzhi`).d('全部评委对同一项主观分的评分同时出现，高于该项分值90%、低于该项分值30%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightThree) {
                        if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightFurth) {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；') + intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        } else {
                          return (
                            <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweizhuguanfenchaershi`).d('该评委主观分打分与平均得分相差+-20%；')}>
                              <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                                {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                              </div>
                            </Tooltip>
                          )
                        }
                      } else if (row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].highlightFurth) {
                        return (
                          <Tooltip placement="top" overlayClassName="customize-tooltip" color={'#646A73'} title={intl.get(`bid.bidcommon.view.title.pingweidafenbaochiyizhi`).d('各个评委对客观分的打分分值必须保持一致；')}>
                            <div className="customize-tooltip-text" style={{ 'color': '#e4cc5a', textAlign: 'right', display: 'block' }}>
                              {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                            </div>
                          </Tooltip>
                        )
                      } else {
                        if (index == newSorceDetailJudge.length - 1 || index == newSorceDetailJudge.length - 2) {
                          return {
                            children:
                              <div style={{ textAlign: 'right' }}>
                                {(Number(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore)).toFixed(2)}
                              </div>,
                            props: {
                              colSpan: 1
                            }
                          }
                        } else {
                          return (
                            <div style={{ textAlign: 'right' }}>
                              {numberRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetScore || '', 2)}
                            </div>
                          )
                        }
                      }
                    }
                  }
                }, {
                  key: `${i}${j}理由`,
                  dataIndex: `${i}${j}理由`,
                  width: 80,
                  title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                  className: `${styles['reasonClass']}`,
                  render: (val, row, index) => {
                    if (row.skillQueryJudgesScoreDTOS[i] && row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j] !== undefined) {
                      if (index == newSorceDetailJudge.length - 1 || index == newSorceDetailJudge.length - 2) {
                        return {
                          props: {
                            colSpan: 1
                          }
                        }
                      } else {
                        return (
                          tooltipRender(row.skillQueryJudgesScoreDTOS[i].skillQuerySupplierDTOS[j].answerGetReason || '')
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
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
        dataIndex: 'returnReason',
        required: true,
        width: 150,
        render: (val, record) => (
          record.isMark === 0 ?
          tooltipRender(val)
          :
          <Form.Item>
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
            })(
              <CusInput.TextArea
                autoChangeSize={true}
                onChange={(e) => {
                  record.returnReason = e.target.value
                }}
              />
            )}
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
          className:i > 0 ? 'borderBolder' : 'borderNone',
          children: [
            ...(v.skillQueryJudgesDTOS).map((h, j) => {
              return {
                key: `${i}${j}`,
                dataIndex: `${i}${j}`,
                title: `${h.realName}`,
                className:j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0? 'borderNone' : '',
                children: [
                  {
                    key: `${i}${j}结果`,
                    dataIndex: `${i}${j}结果`,
                    title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结果（请填写是否通过审查）'),
                    required: !match.params.state === 'edit',
                    width: getCurrentLanguage() === 'zh_CN' ? 120 : 160,
                    className:j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0? 'borderNone' : '',
                    render: (val, record, index) => {
                      if (index !== 0) {
                        return null;
                      }
                      if (index === 0) {
                        return (
                          match.params.state === 'edit' ?
                          tooltipRender(h.answerGetScoreMeaning)
                          :
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
                              <CusSelect
                                allowclear
                                style={{ width: '100%' }}
                                onChange={() => { h.answerGetScore = record.$form.getFieldValue('answerGetScore') }}
                                options={yesNO}
                              />
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
                    required: !match.params.state === 'edit',
                    width: 150,
                    render: (val, record, index) => {
                      if (index !== 0) {
                        return null;
                      }
                      if (index === 0) {
                        return (
                          match.params.state === 'edit' ?
                          tooltipRender(h.answerGetReason)
                          :
                          <Form.Item>
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
                              <CusInput.TextArea
                                autoChangeSize={true}
                                onChange={(e) => {
                                  h.answerGetReason = e.currentTarget.value
                                }}
                              />
                            )}
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
    };
    const revertList = {
      dataSource: newSorceDetail,
      columns: revertColumns,
      pagination: false,
      selectedRows: selectedRows1,
      selectedRowKeys: selectedRowKeys1,
      contractTechnicalMerit,
    };
    const judgeRevertList = {
      dataSource: newSorceDetailJudge,
      columns: judgeRevertColumns,
      pagination: false,
      selectedRows: selectedRows1,
      selectedRowKeys: selectedRowKeys1,
      contractTechnicalMerit,
    };
    const reviewResults = {
      dataSource: newreviewList,
      columns: reviewColumns,
      pagination: false,
      contractTechnicalMerit,
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
    revertList.scroll = { x: sum(revertList.columns.map((n) => n.width)) + 300,  y: 520 };
    judgeRevertList.scroll = { x: sum(judgeRevertList.columns.map((n) => n.width)) + 300,  y: 520 };
    reviewResults.scroll = { x: sum(reviewResults.columns.map((n) => n.width)) + 300 };

    return (
      <>
        <PageWrapper loading={revertListLoading || reviewResultsLoading || priceFileListLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <Form className="customize-form">
                <GenerateFormGrid isPackUp={false}>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get('bid.bidcommon.view.title.purchaseschemename')
                        .d('采购方案名称')}
                    >
                      {getFieldDecorator('proName', {
                        initialValue: infoSource.proName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      {getFieldDecorator('packageName', {
                        initialValue: infoSource.packageName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}>
                      {getFieldDecorator('packageNo', {
                        initialValue: infoSource.packageNo,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get('bid.bidcommon.view.title.purchaseschemeno')
                        .d('采购方案编号')}
                    >
                      {getFieldDecorator('proCode', {
                        initialValue: infoSource.proCode,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                </GenerateFormGrid>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.biddingdocumenttbnew`).d('应答文件')}
                  arrowActive={activeKey.includes('uploadTable')}
                />
              }
              key="uploadTable"
            >
              <CusTable {...priceFileList} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.TeScSu`).d('技术评分汇总')}
                  arrowActive={activeKey.includes('table')}
                  buttons={
                    <CusButton mini onClick={() => {this.handleExport()}}>
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton>
                  }
                />
              }
              key="table"
            >
              {['invited_bidding', 'public_bidding'].includes(infoSource.purchaseType) ? (
                <CusTable rowClassName={styles['revertClass']} {...revertList} />
              ) : (
                <EditTable {...reviewResults}></EditTable>
              )}
            </Panel>
            {['invited_bidding', 'public_bidding'].includes(infoSource.purchaseType) && (<Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.bid.button.judgesscores`).d('评委评分')}
                  arrowActive={activeKey.includes('judgessTable')}
                  buttons={
                    <CusButton mini onClick={this.downLoadJudge}>
                      {intl.get(`HKPC.commom.view.button.export`).d('导出')}
                    </CusButton>
                  }
                />
              }
              key="judgessTable"
            >
              <CusTable rowClassName={styles['revertClass']} {...judgeRevertList} />
            </Panel>)}
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {/* 采购方式不同，调用接口不同，但是多语言一致，这个针对采购方式：公开招标和邀请招标 */}
          {match.params.state === 'edit' &&
            milState &&
            milState !== 'affirmed' &&
            ['invited_bidding', 'public_bidding'].includes(infoSource.purchaseType) &&
            isSubmitPrice && (
              <CusButton onClick={this.showPriceBox}>
                {intl.get('bid.bidcommon.view.button.cts').d('确认技术汇总')}
              </CusButton>
            )}
          {match.params.state === 'edit' &&
            milState &&
            milState !== 'affirmed' &&
            !['invited_bidding', 'public_bidding'].includes(infoSource.purchaseType) && (
              <CusButton onClick={this.makeSure}>
                {intl.get('bid.bidcommon.view.button.cts').d('确认技术汇总')}
              </CusButton>
            )}
          {match.params.state === 'edit' &&
            milState &&
            milState !== 'affirmed' &&
            ['invited_bidding', 'public_bidding'].includes(infoSource.purchaseType) && (
              <CusButton onClick={this.handleRevert}>
                {intl.get('bid.bidcommon.view.button.return').d('退回')}
              </CusButton>
            )}
        </CusApprovalButtons>
        <CusModal
          destroyOnClose
          title={intl.get('bid.bidcommon.view.button.sfcts').d('是否确认技术汇总')}
          visible={this.state.isPrice}
          onOk={this.handleYes}
          onCancel={this.handleCancel}
        >
          <p>{intl.get('bid.bidcommon.view.title.quoteconfirm').d('说明：请确认技术评分无异常')}</p>
        </CusModal>
        <CusModal
          destroyOnClose
          title={intl.get('bid.bidcommon.view.title.returnscore').d('退回技术评分')}
          visible={this.state.isChoiceJudges}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <EditTable {...judgesLists} />
        </CusModal>
      </>
    );
  }
}
