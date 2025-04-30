/**
 * index.js - 评分表确认技术澄清
 * @date: 2022-05-13
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Row, Col, LocaleProvider, Collapse, Tooltip, Select, Modal } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { connect } from 'dva';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import moment from 'moment';
import { sum, isUndefined } from 'lodash';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import { getCurrentLanguage, getResponse, getEditTableData } from 'utils/utils';
import UploadFile from './UploadFile';
import styles from './index.less';
import saveIcon from '@/assets/buttonIcons/保存.png';
import formatterCollections from 'utils/intl/formatterCollections';

const { Panel } = Collapse;
const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ loading, contractJudgesSorce }) => ({
  contractJudgesSorce,
  questionSourceLoading: loading.effects['contractJudgesSorce/getQuestionList'],
  toSupplierLoading: loading.effects['contractJudgesSorce/goCommitSupplier'],
  toJudgesLoading: loading.effects['contractJudgesSorce/goCommitJudges'],
  saveLoading: loading.effects['contractJudgesSorce/saveClarification'],
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
      selectTip: false,
      selectNumer: 0,
      changeFlag:false,
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.getProjectInfo();
    this.getMilestoneId();
    this.getQuestionInfo();
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
          changeFlag:false
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
  showSelectCommit(name) {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    const { selectedRows } = this.state;
    if(name === 'transfer') {
      dispatch({
        type: 'contractJudgesSorce/getMilDeadline',
        payload: milestoneId,
      }).then((res) => {
        if(!isUndefined(res)) {
          if (selectedRows && selectedRows.length > 0) {
            this.setState({ selectNumer: selectedRows.length })
            this.setState({ selectTip: true })
          } else {
            notification.warning({
              message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
            });
          }
        }
      })
    } else {
      if (selectedRows && selectedRows.length > 0) {
        this.setState({ selectNumer: selectedRows.length })
        this.setState({ selectTip: true })
      } else {
        notification.warning({
          message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
        });
      }
    }
  }

  @Bind
  handleCancel() {
    this.setState({ selectTip: false })
  }

  @Bind
  handleOk(buttonFlag) {
    this.commitSupplier(buttonFlag)
    this.setState({ selectTip: false })
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
      notification.warning({
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
        if(buttonFlag) {
          dispatch({
            type: 'contractJudgesSorce/saveClarification',
            payload: { data },
          }).then((res) => {
            if (res) {
              if (ansearList.length > 0) {
                dispatch({
                  type: buttonFlag ? 'contractJudgesSorce/goCommitSupplier' : 'contractJudgesSorce/goCommitJudges',
                  payload: { page, ansearList },
                }).then(() => {
                  this.setState({ saveFlag: false, selectedRows: [] })
                  this.getQuestionInfo();
                  notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
                })
              }
              
            }
          });
        } else {
          if (ansearList.length > 0) {
            dispatch({
              type: buttonFlag ? 'contractJudgesSorce/goCommitSupplier' : 'contractJudgesSorce/goCommitJudges',
              payload: { page, ansearList },
            }).then(() => {
              this.setState({ saveFlag: false, selectedRows: [] })
              this.getQuestionInfo();
              notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
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
        }).then(() => {
          this.setState({ saveFlag: false, selectedRows: [] })
          this.getQuestionInfo();
          notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
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
          notification.success({ message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功') });
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
  getChangeFlag(){
    if(!this.state.changeFlag){
      this.setState({
        changeFlag: true
      })
    }
  }

  @Bind
  openModal(page={}){
    Modal.confirm({
      title: intl
        .get('hzero.common.message.confirm.giveUpTip')
        .d('你有修改未保存，是否确认离开？'),
      onOk: () => {
        this.getQuestionInfo(page);
       
      },
    });
  }

  render() {
    const {
      questionSourceLoading,
      toSupplierLoading,
      toJudgesLoading,
      saveLoading,
      contractJudgesSorce,
      match
    } = this.props;
    const { basicSource = {}, questionSource = [], questionPagination = {}, milestoneIdSource = {}, enumMap = {} } = contractJudgesSorce;
    const { sheetList = [] } = enumMap;
    const {
      activeKey,
      selectedRows = [],
      selectedRowKeys = [],
      selectTip,
      selectNumer,
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
          dataIndex: 'judgeName',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          width: 90,
          fixed: 'left',
          render: (val, record) => (
            <Tooltip title={record.judgeName} placement="topLeft">
              <span>{record.judgeName}</span>
            </Tooltip>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'qaTypeNew',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          width: 110,
          fixed: 'left',
          render: (val, record) => (
            <Form.Item>
              <Tooltip title={record.qaTypeNew} placement="topLeft">
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
                  <Select style={{ width: '100%' }} disabled={record.publishedToSupplier === 'y' || !buttonFlag}
                    onChange={() => { record.qaTypeNew = record.$form.getFieldValue('qaTypeNew') }} >
                    {sheetList.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Tooltip>
            </Form.Item>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'caseDetailNew',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          width: 110,
          fixed: 'left',
          render: (val, record) => (
            <Form.Item>
              <Tooltip title={record.caseDetailNew} placement="topLeft">
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
                  <Input disabled={record.publishedToSupplier === 'y' || !buttonFlag}
                    onInput={(e) => this.handleRecordChange1(e.target.value, record)}
                  />
                )}
              </Tooltip>
            </Form.Item>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'qaContent',
          width: 110,
          fixed: 'left',
          render: (val, record) => (
            <Tooltip title={record.qaContent} placement="topLeft" arrowPointAtCenter={false}>
              <span>{record.qaContent}</span>
            </Tooltip>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.Supplierstobeclarified`).d('需澄清的供应商'),
          dataIndex: 'supplierName',
          width: 110,
          fixed: 'left',
          render: (val, record) => (
            <Tooltip title={record.supplierName} placement="topLeft" arrowPointAtCenter={false}>
              <span>{record.supplierName}</span>
            </Tooltip>
          )
        },
        {
          title: intl.get(`bid.bidcommon.view.title.fixedquestion`).d('采购修正问题'),
          dataIndex: 'qaContentNew',
          width: 120,
          fixed: 'left',
          render: (val, record, index) => (
            <Form.Item>
              <Tooltip title={record.qaContentNew} placement="topLeft">
                {record.$form.getFieldDecorator(`qaContentNew`, {
                  initialValue: record.qaContentNew === null ? '' : record.qaContentNew,
                })(
                  <Input id={index} disabled={record.publishedToSupplier === 'y' || !buttonFlag}
                    onInput={(e) => this.handleRecordChange2(e.target.value, record)}
                  />
                )}
              </Tooltip>
            </Form.Item>
          )
        },
      ];
      lists[0].answerDTOList.map((v, index) => {
        columns.push({
          key: `answerUserName${index}`,
          title: `${v.answerUserName}`,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          children: [
            {
              key: `answerContent${index}`,
              title: intl.get(`bid.bidcommon.view.title.supplierreplycontent`).d('供应商答复内容'),
              dataIndex: `${v.answerContent}`,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              render: (row, record) => (
                <Tooltip title={record.answerDTOList[index].answerContent} placement="topLeft">
                  <span>{record.answerDTOList[index].answerContent}</span>
                </Tooltip>
              )
            },
            {
              key: `answerTime${index}`,
              title: intl.get(`bid.bidcommon.view.title.supplierreplytime`).d('供应商答复时间'),
              dataIndex: `${v.answerTime}`,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              render: (row, record) => (
                <Tooltip title={record.answerDTOList[index].answerTime} placement="topLeft">
                  <span>{record.answerDTOList[index].answerTime}</span>
                </Tooltip>
              )
            },
            {
              key: `answerFileUrl${index}`,
              title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
              dataIndex: `${v.answerFileUrl}`,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
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
    } else {
      columns = [
        {
          title: intl.get(`bid.bidcommon.view.title.judges`).d('评委'),
          dataIndex: 'judgeName',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'qaTypeNew',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'caseDetailNew',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'qaContent',
        },
        {
          title: intl.get(`bid.bidcommon.view.title.fixedquestion`).d('采购修正问题'),
          dataIndex: 'qaContentNew',
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
          disabled: buttonFlag ? record.publishedToSupplier === 'y' : record.publishedToJudge === 'y',
        }),
      },
      rowKey: 'poOrderId',
      selectedRows,
      selectedRowKeys,
      pagination: questionPagination,
      loading: questionSourceLoading,
      onChange: this.state.changeFlag? this.openModal: this.getQuestionInfo,
      onDataChange: this.getChangeFlag,
    };
    questionList.scroll = { x: sum(questionList.columns.map((n) => n.width)) + 300 };
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
      <Fragment>
        {(milestoneIdSource.isAllTransToSupplier !== 'y' || milestoneIdSource.isAllTransToJudge !== 'y') && <Header>
          {buttonFlag ?
            milestoneIdSource.isAllTransToSupplier !== 'y' && <Button icon="check" type="primary" onClick={() => this.showSelectCommit('transfer')}
              loading={toSupplierLoading}
            >
              {intl.get(`bid.bidcommon.view.button.zhuanjiaodafu`).d('转交提问')}
            </Button> :
            milestoneIdSource.isAllTransToJudge !== 'y' && <Button icon="check" type="primary" onClick={() => this.showSelectCommit('reply')}
              loading={toJudgesLoading}
            >
              {intl.get(`bid.bidcommon.view.button.fankuidafu`).d('反馈答复')}
            </Button>
          }
        </Header>}
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                <Panel
                  header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  key="projectQaInfo"
                >
                  <Row style={{ marginTop: '15px' }}>
                    <Col span={24}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.purchaseschemename').d('采购方案名称')}
                      >
                        <Input style={{ width: '87.7vw' }} value={basicSource.proName} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                      >
                        <Input value={basicSource.packageName} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                      >
                        <Input value={basicSource.packageNo} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                      >
                        <Input value={basicSource.proCode} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                <Panel
                  header={basicSource.proInfoWording ?
                    intl.get(`bid.bidcommon.view.title.biddinground`).d('投标轮次')
                    : intl.get(`bid.bidcommon.view.title.biddingroundnew`).d('应答轮次')
                  }
                  key="biddingRound"
                >
                  <Row style={{ marginTop: '15px' }}>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.round').d('轮次')}
                      >
                        <Input value={milestoneIdSource.round} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.milestonecommon.view.title.deadline').d('截止时间')}
                      >
                        <Input value={milestoneIdSource.milestoneEndTime} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8} {...FORM_COL_3_LAYOUT}>
                      <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                        {...formlayout}
                        label={intl.get('bid.bidcommon.view.title.tendersubmissiontime').d('递交投标时间')}
                      >
                        <Input value={milestoneIdSource.milestoneStartTime} disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                <Panel
                  header={intl.get(`bid.bidcommon.view.title.tecbusqatotal`).d('技术商务答疑汇总')}
                  key="pricingTable"
                >
                  <div style={{ marginTop: '-10px' }}>
                    <div
                      style={{
                        marginBottom: '10px',
                        float: 'right',
                      }}
                      className="customize-buttons"
                    >
                      {buttonFlag && <Button onClick={this.handleSave} loading={saveLoading}>
                        <img src={saveIcon} alt="" style={{ width: '15px' }} />
                        {intl.get('bid.bidcommon.view.button.save').d('保存')}
                      </Button>}
                    </div>
                    <div style={{ clear: 'both' }} />
                    <EditTable bordered {...questionList} style={{ marginBottom: '50px' }}></EditTable>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </LocaleProvider>
        </Content>
        <Modal
          destroyOnClose
          // title={intl.get('himp.commentImport.view.title.history').d('导入历史')}
          visible={selectTip}
          onCancel={this.handleCancel}
          onOk={() => this.handleOk(buttonFlag)}
          cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
          okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
        >
          <span>{intl.get(`bid.bidcommon.view.title.choosecounta`)}{selectNumer}{intl.get(`bid.bidcommon.view.title.choosecountb`)}</span>
        </Modal>
      </Fragment>
    );
  }
}
