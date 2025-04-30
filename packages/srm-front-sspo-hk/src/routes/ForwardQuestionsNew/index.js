/**
 * index.js - 评分表确认技术澄清
 * @date: 2022-05-13
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Collapse } from 'antd';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusSelect from '_cus_components/CusSelect';
import EditTable from '_cus_components/EditTable';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';
import classnames from 'classnames';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { createPagination } from 'hzero-front/lib/utils/utils';
import moment from 'moment';
import { isUndefined } from 'lodash';
import { getEditTableData, getCurrentLanguage } from 'utils/utils';
import UploadFile from './UploadFile';
import formatterCollections from 'utils/intl/formatterCollections';
import { getDFormGridSpan } from '_cus_utils/utils';
import { largeScreenWidth } from '_cus_utils/constants';
import CusNotification from '_cus_components/CusNotification';
import warnIcon from '@/assets/warnIcon.svg';
import './index.less';

const { Panel } = Collapse;

@connect(({ loading, contractJudgesSorce }) => ({
  contractJudgesSorce,
  questionSourceLoading: loading.effects['contractJudgesSorce/getQuestionList'],
  toSupplierLoading: loading.effects['contractJudgesSorce/goCommitSupplier'],
  toJudgesLoading: loading.effects['contractJudgesSorce/goCommitJudges'],
  saveLoading: loading.effects['contractJudgesSorce/saveClarification'],
  getMilDeadlineLoading: loading.effects['contractJudgesSorce/getMilDeadline'],
}))
@formatterCollections({
  code: ['bid.bidcommon', 'bid.milestonecommon']
})
@Form.create({ fieldNameProp: null })

export default class ForwardQuestions extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      activeKey: ['projectQaInfo', 'biddingRound', 'pricingTable'],
      saveFlag: false,
      changeFlag: false,
      screenWidth: window.innerWidth > largeScreenWidth,
      submitVisible: false,
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.getProjectInfo();
    this.getMilestoneId();
    this.getQuestionInfo();
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth > largeScreenWidth
    })
  }

  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    })
  }

  /**
   * getProjectInfo - 查询项目基本信息
   */
  @Bind()
  getProjectInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getbasicList',
      payload: {
        proId: match.params.proId,
      },
    })
  }

  @Bind()
  getMilestoneId() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getMilestoneId',
      payload: {
        milestoneId: match.params.milestoneId,
      },
    })
  }

  /**
   * getQuestionInfo - 查询技术商务答疑汇总表
   */
  @Bind()
  getQuestionInfo(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getQuestionList',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            questionSource: newDataSource,
            questionPagination: createPagination(res),
          },
        });
        this.setState({
          changeFlag: false
        })
      }
    })
  }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
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

  @Bind
  showSelectCommit = (name, buttonFlag) => {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    const { selectedRows } = this.state;
    if (name === 'transfer') {
      const isSupplier = selectedRows?.some((item) => item.publishedToSupplier === 'y');
      if(isSupplier) {
        CusNotification.error({
          message: intl.get(`bid.bidcommon.view.title.duplicatesubmit`).d('请勿重复提交'),
        });
        return false;
      }
      dispatch({
        type: 'contractJudgesSorce/getMilDeadline',
        payload: milestoneId,
      }).then((res) => {
        if (!isUndefined(res)) {
          if (selectedRows && selectedRows.length > 0) {
            this.setState({ submitVisible: true });
            // CusModal.confirm({
            //   content: intl.get(`bid.bidcommon.view.title.choosecounta`) + `${selectedRows.length}` + intl.get(`bid.bidcommon.view.title.choosecountb`),
            //   onOk: () => {
            //     this.handleOk(buttonFlag)
            //   },
            // })
          } else {
            CusNotification.warning({
              message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
            });
          }
        }
      })
    } else {
      if (selectedRows && selectedRows.length > 0) {
        const isJudge = selectedRows?.some((item) => item.publishedToJudge === 'y');
        if(isJudge) {
          CusNotification.error({
            message: intl.get(`bid.bidcommon.view.title.duplicatesubmit`).d('请勿重复提交'),
          });
          return false;
        }
        this.setState({ submitVisible: true });
        // CusModal.confirm({
        //   content: intl.get(`bid.bidcommon.view.title.choosecounta`) + `${selectedRows.length}` + intl.get(`bid.bidcommon.view.title.choosecountb`),
        //   onOk: () => {
        //     this.handleOk(buttonFlag)
        //   },
        // })
      } else {
        CusNotification.warning({
          message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
        });
      }
    }
    this.setState({
      isButtonFlag: buttonFlag,
    })
  }

  @Bind
  handleOk() {
    const { isButtonFlag } = this.state;
    this.commitSupplier(isButtonFlag)
  }

  @Bind
  handleCancel() {
    this.setState({ submitVisible: false });
  }

  /**
   * 转交提问提示框确认按钮
   * goCommitSupplier: 转交提问
   * goCommitJudges: 反馈答复
  */
  @Bind
  @Debounce(200)
  commitSupplier(buttonFlag, page = {}) {
    const { dispatch, contractJudgesSorce: { questionSource = [] } } = this.props;
    const { selectedRows, saveFlag } = this.state;
    let qaAnsearList = []; // 需要提交的数据(从勾选的数据中拿取数据)
    let ansearList = [];
    if (selectedRows && selectedRows.length > 0) { // 有勾选数据提交勾选数据
      for (let i = 0; i < selectedRows.length; i++) {
        qaAnsearList.push({
          'qaId': selectedRows[i].qaId,  //问题id
          'answerId': selectedRows[i].answerId, //回答id
          'publishedToJudge': selectedRows[i].publishedToJudge, //是否发布给评委
          'publishedToSupplier': selectedRows[i].publishedToSupplier, //是否发布给供应商
        })
      }
      ansearList = qaAnsearList;
    } else { // 没有勾选数据提示用户去选择数据
      CusNotification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
      return;
    }
    if (!saveFlag) {
      let data = [];
      ansearList.map((ite) => {
        questionSource.map((item) => {
          if (ite.qaId === item.qaId) {
            data.push(item);
          }
        })
      })
      // buttonFlag false/反馈答复  true/转交提问
      if (data.length > 0) {
        if (buttonFlag) {
          dispatch({
            type: 'contractJudgesSorce/saveClarification',
            payload: { data },
          }).then((res) => {
            if (res) {
              if (ansearList.length > 0) {
                dispatch({
                  type: buttonFlag ? 'contractJudgesSorce/goCommitSupplier' : 'contractJudgesSorce/goCommitJudges',
                  payload: { page, ansearList },
                }).then((res) => {
                  if(res) {
                    this.setState({ saveFlag: false, selectedRows: [], submitVisible: false })
                    this.getQuestionInfo();
                    CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
                  }
                })
              }
            }
          });
        } else {
          if (ansearList.length > 0) {
            dispatch({
              type: buttonFlag ? 'contractJudgesSorce/goCommitSupplier' : 'contractJudgesSorce/goCommitJudges',
              payload: { page, ansearList },
            }).then((res) => {
              if(res) {
                this.setState({ saveFlag: false, selectedRows: [], submitVisible: false })
                this.getQuestionInfo();
                CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
              }
            })
          }
        }
      }
    } else {
      if (ansearList.length > 0) {
        dispatch({
          type: buttonFlag ? 'contractJudgesSorce/goCommitSupplier' : 'contractJudgesSorce/goCommitJudges',
          payload: {
            page,
            ansearList,
          },
        }).then((res) => {
          if(res) {
            this.setState({ saveFlag: false, selectedRows: [], submitVisible: false })
            this.getQuestionInfo();
            CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
          }
        })
      }
    }
  }

  @Debounce(300, { leading: true })
  @Bind
  handleSave() {
    const { dispatch, contractJudgesSorce } = this.props;
    const { questionSource = [] } = contractJudgesSorce;
    const data = getEditTableData(questionSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    if (data.length > 0) {
      dispatch({
        type: 'contractJudgesSorce/saveClarification',
        payload: {
          data,
        },
      }).then((res) => {
        if (res) {
          CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功') });
          this.setState({ saveFlag: true });
          this.getQuestionInfo();
        }
      });
    }
  }

  @Bind
  handleRecordChange1(value, updateRecord) {
    const { form } = this.props;
    updateRecord.caseDetailNew = form.setFieldsValue({ caseDetailNew: value });
  }

  @Bind
  handleRecordChange2(value, updateRecord) {
    const { form } = this.props;
    updateRecord.qaContentNew = form.setFieldsValue({ qaContentNew: value });
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      updateRecord.qaContentNew = value
    })
  }

  @Bind
  getChangeFlag() {
    if (!this.state.changeFlag) {
      this.setState({
        changeFlag: true
      })
    }
  }

  @Bind
  openModal(page = {}) {
    CusModal.confirm({
      content: intl
        .get('hzero.common.message.confirm.giveUpTip')
        .d('你有修改未保存，是否确认离开？'),
      okType: 'normal',
      onOk: () => {
        this.getQuestionInfo(page);

      },
    });
  }

  // 技术商务答疑汇总下载
  downloadAll = () => {
    const { match, dispatch, contractJudgesSorce } = this.props;
    const { basicSource = {}, milestoneIdSource = {} } = contractJudgesSorce;
    dispatch({
      type: 'contractJudgesSorce/downloadTecbusqatotal',
      payload: {
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      const url = window.URL.createObjectURL(
        new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      let fileName = intl.get(`bid.bidcommon.view.title.filename`, {
        name: basicSource.packageName,
        round: milestoneIdSource.round
      }).d(`_技术商务澄清_轮次`) + '.xlsx';
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
      CusNotification.success({ message: intl.get(`bid.bidcommon.view.message.DoSu`).d('下载成功') });
        // this.getQuestionInfo();
    })
  }

  render() {
    const gridSpan = getDFormGridSpan();
    const {
      questionSourceLoading,
      toSupplierLoading = false,
      toJudgesLoading = false,
      saveLoading,
      contractJudgesSorce,
      match,
      getMilDeadlineLoading = false,
    } = this.props;
    const { basicSource = {}, questionSource = [], questionPagination = {}, milestoneIdSource = {}, enumMap = {} } = contractJudgesSorce;
    const { sheetList = [] } = enumMap;
    const {
      activeKey,
      selectedRows = [],
      selectedRowKeys = [],
      screenWidth,
      submitVisible,
    } = this.state;
    // 循环匹配查询其他评委的问题分类code
    sheetList.map((item) => {
      questionSource.map((mean) => {
        if (mean.qaTypeNew === item.value) {
          mean.qaTypeNew = item.meaning
        }
      })
    })
    let lists = [...questionSource];
    let columns = [];
    if (lists.length > 0) {
      columns = [
        {
          title: intl.get(`bid.bidcommon.view.title.judges`).d('评委'),
          dataIndex: 'orderSeq',
          width: 150,
          // fixed: 'left',
          render: (_, record) => {
            return (
              tooltipRender(record.judgeName)
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'lineNum',
          width: 150,
          // fixed: 'left',
          required: true,
          render: (_, record) => (
            (record.publishedToSupplier === 'y' || !buttonFlag) ? tooltipRender(record.qaTypeNew) :
              <Form.Item>
                {record.$form.getFieldDecorator('qaTypeNew', {
                  initialValue: `${record.qaTypeNew}`,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
                      }),
                    },
                  ],
                })(
                  <CusSelect style={{ width: '100%' }}
                    onChange={() => {
                      record.qaTypeNew = record.$form.getFieldValue('qaTypeNew')
                    }}
                    allowClear
                    options={sheetList}
                  >
                  </CusSelect>
                )}
              </Form.Item>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'operator',
          width: 240,
          // fixed: 'left',
          required: true,
          render: (_, record) => (
            (record.publishedToSupplier === 'y' || !buttonFlag) ? tooltipRender(record.caseDetailNew) :
              <Form.Item>
                {record.$form.getFieldDecorator('caseDetailNew', {
                  initialValue: record.caseDetailNew,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
                      }),
                    },
                  ],
                })(
                  <CusInput
                    onInput={(e) => this.handleRecordChange1(e.target.value, record)}
                  />
                )}
              </Form.Item>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'operation',
          width: 150,
          // fixed: 'left',
          render: (_, record) => {
            return (
              tooltipRender(record.qaContent)
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.Supplierstobeclarified`).d('需澄清的供应商'),
          dataIndex: 'inviteCooperation',
          width: 150,
          // fixed: 'left',
          render: (_, record) => {
            return (
              tooltipRender(record.supplierName)
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.fixedquestion`).d('采购修正问题'),
          dataIndex: 'soLineNumber',
          width: 150,
          // fixed: 'left',
          className: 'borderRightBolder',
          render: (_, record, index) => (
            (record.publishedToSupplier === 'y' || !buttonFlag) ? tooltipRender(record.qaContentNew === null ? record.qaContent : record.qaContentNew) :
              <Form.Item>
                {record.$form.getFieldDecorator(`qaContentNew`, {
                  initialValue: record.qaContentNew === null ? record.qaContent : record.qaContentNew,
                })(
                  <CusInput id={index}
                    onInput={(e) => this.handleRecordChange2(e.target.value, record)}
                  />
                )}
              </Form.Item>
          )
        },
      ];
      lists[0].answerDTOList.map((v, index) => {
        columns.push({
          key: `answerUserName${index}`,
          title: `${v.answerUserName}`,
          width: 620,
          className:index > 0 ? 'borderBolder' : 'borderNone',
          children: [
            {
              key: `answerContent${index}`,
              title: intl.get(`bid.bidcommon.view.title.supplierreplycontent`).d('供应商答复内容'),
              dataIndex: `answerContent${index}`,
              width: 310,
              className:index > 0 ? 'borderBolder' : 'borderNone',
              render: (row, record) => (
                tooltipRender(record.answerDTOList[index].answerContent)
              )
            },
            {
              key: `answerTime${index}`,
              title: intl.get(`bid.bidcommon.view.title.supplierreplytime`).d('供应商答复时间'),
              dataIndex: `answerTime${index}`,
              width: 180,
              render: (row, record) => (
                tooltipRender(record.answerDTOList[index].answerTime)
              )
            },
            {
              key: `answerFileUrl${index}`,
              title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
              dataIndex: `answerFileUrl${index}`,
              width: getCurrentLanguage() === 'zh_CN' ? 115 : 180,
              render: (row, record, k) => {
                return (
                  <UploadFile
                    // onUploadSuccess={(item) => onUploadSuccess(item, record)}
                    onDeleteSuccess={() => onDeleteSuccess(record)}
                    tableName="SPUC_PO_CON_ATTACH"
                    parentId={record.answerDTOList[index].answerFileUrl}
                    value={record.answerDTOList[index].answerFileUrl}
                    disabled
                  />
                )
              }
            }
          ]
        })
      })
    }
     else {
      columns = [
        {
          title: intl.get(`bid.bidcommon.view.title.judges`).d('评委'),
          dataIndex: 'judgeName',
          width: 110,
        },
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'qaTypeNew',
          width: 130,
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'caseDetailNew',
          width: 240,
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'qaContent',
          width: 250,
        },
        {
          title: intl.get(`bid.bidcommon.view.title.fixedquestion`).d('采购修正问题'),
          dataIndex: 'qaContentNew',
          width: 250, 
        },
      ];
    }

    const questionList = {
      dataSource: questionSource,
      columns,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
        getCheckboxProps: record => ({
          disabled: !buttonFlag,
        }),
      },
      rowKey: 'poOrderId',
      scroll: { x: tableScrollWidth(columns)},
      selectedRows,
      selectedRowKeys,
      pagination: questionPagination,
      onChange: this.state.changeFlag ? this.openModal : this.getQuestionInfo,
      onDataChange: this.getChangeFlag,
    };
    // questionList.scroll = { x: sum(questionList.columns.map((n) => n.width)) + 600 };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    // 判断在有效里程碑时间内
    let buttonFlag = false;
    let today = moment().format('YYYY-MM-DD HH:mm:ss');
    if (today < milestoneIdSource.milestoneEndTime) {
      buttonFlag = true;
    }
    if (today > milestoneIdSource.milestoneEndTime) {
      buttonFlag = false;
    }

    return (
      <>
        <PageWrapper loading={questionSourceLoading}>
          <Collapse defaultActiveKey={activeKey} className={classnames('customize-collapse')} onChange={this.onCollapseChange}>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl
                    .get(`bid.bidcommon.bid.title.EssentialInformation`)
                    .d('基本信息')}
                  arrowActive={activeKey.includes('projectQaInfo')}
                />}
              key="projectQaInfo"
            >
              <Form className='customize-form'>
                <Row>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.purchaseschemename').d('采购方案名称')}
                    >
                      <CusInput style={{ width: '100%' }} value={basicSource.proName} disabled />
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      <CusInput value={basicSource.packageName} disabled />
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                    >
                      <CusInput value={basicSource.packageNo} disabled />
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                    >
                      <CusInput value={basicSource.proCode} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.biddinground`).d('投标轮次')}
                  arrowActive={activeKey.includes('biddingRound')}
                />}
              key="biddingRound"
            >
              <Form className='customize-form'>
                <Row>
                  <Col span={screenWidth ? 8: 24} >
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.round').d('轮次')}
                    >
                      <CusInput value={milestoneIdSource.round} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={screenWidth ? 8 : 12} >
                    <Form.Item
                      label={intl.get('bid.milestonecommon.view.title.deadline').d('截止时间')}
                    >
                      <CusInput value={milestoneIdSource.milestoneEndTime} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={screenWidth ? 8 : 12} >
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.tendersubmissiontime').d('递交投标时间')}
                    >
                      <CusInput value={milestoneIdSource.milestoneStartTime} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.tecbusqatotal`).d('技术商务答疑汇总')}
                  arrowActive={activeKey.includes('pricingTable')}
                  buttons={
                    <CusButton mini onClick={this.downloadAll}>
                      {intl.get(`bid.bidcommon.view.button.MiDoDo`).d('下载')}
                    </CusButton>
                  }
                />}
              key="pricingTable"
            >
              <EditTable {...questionList}></EditTable>
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {/* {buttonFlag ?
            milestoneIdSource.isAllTransToSupplier !== 'y' && <CusButton type="primary" loading={getMilDeadlineLoading} onClick={() => this.showSelectCommit('transfer', buttonFlag)}
            >
              {intl.get(`bid.bidcommon.view.button.zhuanjiaodafu`).d('转交提问')}
            </CusButton> :
            milestoneIdSource.isAllTransToJudge !== 'y' && <CusButton type="primary" onClick={() => this.showSelectCommit('reply', buttonFlag)}
            >
              {intl.get(`bid.bidcommon.view.button.fankuidafu`).d('反馈答复')}
            </CusButton>
          } */}
            {buttonFlag && <CusButton type="primary" loading={getMilDeadlineLoading} onClick={() => this.showSelectCommit('transfer', true)}
            >
              {intl.get(`bid.bidcommon.view.button.zhuanjiaodafu`).d('转交提问')}
            </CusButton>}
            {buttonFlag && <CusButton type="primary" onClick={() => this.showSelectCommit('reply', false)}
            >
              {intl.get(`bid.bidcommon.view.button.fankuidafu`).d('提交至评委')}
            </CusButton>}
          {buttonFlag && <CusButton onClick={this.handleSave}>
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </CusButton>}
        </CusApprovalButtons>
        <CusModal
          title={intl.get('hzero.common.cusModal.title.msgConfirm').d('信息确认')}
          visible={submitVisible}
          onCancel={this.handleCancel}
          onOk={() => this.handleOk()}
          confirmLoading={toSupplierLoading || toJudgesLoading}
        >
          <>
            <img src={warnIcon} alt="warnIcon"
              style={{
                width: '20px',
                height: '20px',
                marginRight: '4px',
                marginTop: '-2px',
              }} 
            />
            {intl.get(`bid.bidcommon.view.title.choosecounta`) + `${selectedRows.length}` + intl.get(`bid.bidcommon.view.title.choosecountb`)}
          </>
        </CusModal>
      </>
    );
  }
}
