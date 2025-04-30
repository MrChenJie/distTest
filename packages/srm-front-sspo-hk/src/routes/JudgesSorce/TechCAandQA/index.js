/**
 * index.js - 技术澄清提问
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Table, Form, Input, Card, Row, Col, Modal, Select, Tooltip } from 'hzero-ui';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import moment from 'moment';
import intl from 'utils/intl';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  getEditTableData,
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'hzero-front/lib/utils/utils';
import UploadFile from '../UploadFile';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

let newDataList = [];

@connect(({ loading = {}, contractJudgesSorce }) => ({
  mySourceLoading: loading.effects['contractJudgesSorce/getcaqaList'],
  otherSourceLoading: loading.effects['contractJudgesSorce/getOtherCaqaList'],
  saveLoading: loading.effects['contractJudgesSorce/saveClarification'],
  submitLoading: loading.effects['contractJudgesSorce/submit'],
  deleteLinesLoading: loading.effects['contractJudgesSorce/deleteClarification'],
  contractJudgesSorce,
}))
@formatterCollections({
  code: ['bid.bidcommon']
})
@Form.create({ fieldNameProp: null })
export default class TechCAandQA extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.state = {
      milstonesInfo: [],
      milestoneEndTime: '',
      milestoneStartTime: '',
      milestoneState: '', // 里程碑状态
      milestoneId: '',
      proId: match.params.proId,
      milestonesEnd: false,
      groupUnsaveFlag: false,
      saveFlag: false,
    };
  }
  componentDidMount() {
    this.fetchCAandQAList(); // 查询数据
    this.fetchOtherList();
  }

  /**
   * fetchCAandQAList - 查询自己的技术澄清提问表格信息
   */
  @Bind()
  @Debounce(200)
  fetchCAandQAList(page = {}) {
    const { dispatch, match } = this.props;
    const { milestoneId } = this.state;
    dispatch({
      type: 'contractJudgesSorce/getcaqaList',
      payload: {
        page,
        milestoneId: milestoneId !== '' ? milestoneId : -1,
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            mySource: newDataSource,
            myPagination: createPagination(res.page),
            myMilestones: res.milestones,
          },
        });
        if (milestoneId !== '') {
          res.milestones && res.milestones.map((item) => {
            if (milestoneId === item.milestoneId) {
              this.setState({
                milestoneId: item.milestoneId,
                milestoneEndTime: item.milestoneEndTime,
                milestoneStartTime: item.milestoneStartTime,
                milestoneState: item.milestoneState,
              })
              // 判断里程碑是否完结
              let today = moment().format('YYYY-MM-DD HH:mm:ss');
              if (today > this.state.milestoneEndTime || this.state.milestoneState === 'completed') {
                this.setState({ milestonesEnd: true });
              } else {
                this.setState({ milestonesEnd: false });
              }
            }
          })
        } else {
          this.setState({
            milestoneId: res.milestones[0].milestoneId,
            milestoneEndTime: res.milestones[0].milestoneEndTime || '',
            milestoneStartTime: res.milestones[0].milestoneStartTime || '',
            milestoneState: res.milestones[0].milestoneState || '',
          })
          // 判断里程碑是否完结
          let today = moment().format('YYYY-MM-DD HH:mm:ss');
          if (today > res.milestones[0].milestoneEndTime || res.milestones[0].milestoneState === 'completed') {
            this.setState({ milestonesEnd: true });
          } else {
            this.setState({ milestonesEnd: false });
          }
        }
        this.setState({
          milstonesInfo: res.milestones,
          groupUnsaveFlag: false,
          saveFlag: false
        })
      }
    })
  }

  /**
   * 查询别人的技术澄清提问表格信息
  */
  @Bind
  @Debounce(200)
  fetchOtherList(page = {}) {
    const { dispatch, match } = this.props;
    const { milestoneId } = this.state;
    dispatch({
      type: 'contractJudgesSorce/getOtherCaqaList',
      payload: {
        page,
        milestoneId: milestoneId !== '' ? milestoneId : -1,
        proId: match.params.proId,
      }
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            otherSource: newDataSource,
            otherPagination: pagination,
          },
        });
      }
    })
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

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof ActiveClarificationTable
   */
  @Bind
  handleDataChange() {
    this.setState({ groupUnsaveFlag: true })
    // const { groupUnsaveFlag } = this.state;
    // if (!groupUnsaveFlag) {
    //   const { onEdit = (e) => e } = this.props;
    //   onEdit(true);
    // }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof ActiveClarificationTable
   */
  @Bind
  handlePageChange(page) {
    const { groupUnsaveFlag } = this.state;
    if (groupUnsaveFlag) {
      Modal.confirm({
        title: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        onOk: () => {
          this.fetchCAandQAList(page);
        },
      });
    } else {
      this.fetchCAandQAList(page);
    }
  }

  // 保存
  @Bind
  @Debounce(200)
  handleSave() {
    const { dispatch, contractJudgesSorce } = this.props;
    const { mySource = [] } = contractJudgesSorce;
    const { milestoneId, saveFlag } = this.state;
    const newData = getEditTableData(mySource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    for (let i = 0; i < newData.length; i++) {
      newData[i].type = 'judges_rate'
    }
    let data = newData.reverse();
    if (data.length > 0 && milestoneId !== '') {
      dispatch({
        type: 'contractJudgesSorce/saveClarification',
        payload: {
          milestoneId: milestoneId,
          data,
        },
      }).then((res) => {
        if (res) {
          notification.success({message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功')});
          this.setState({ saveFlag: true, groupUnsaveFlag: true });
          this.fetchCAandQAList();
        }
      });
    }
  }

  // 提交
  // 当存在里程碑，且里程碑有效期内，提交过的数据不支持修改
  @Bind
  @Debounce(200)
  handleSubmit() {
    const { dispatch, match, contractJudgesSorce } = this.props;
    const { mySource = [], myMilestones = [] } = contractJudgesSorce;
    const { milestoneId, milestoneState, milestoneEndTime, milestoneStartTime, saveFlag } = this.state;
    // 获取当前时间
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    // const remainCreateData = mySource.filter((item) => item._status === 'create');
    // milestoneState: "completed" 已完成
    if (milestoneStartTime === '' && milestoneEndTime === '') { // 待开展
      notification.error({
        message: intl.get(`bid.bidcommon.view.message.remindsetdate`).d('请联系采购创建技术、商务澄清里程碑有效时间')
      })
    } else {
      if (today > milestoneEndTime || milestoneState === 'completed') {
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.techqaend`)
            .d('本轮技术商务澄清里程碑已完成，若需再提交疑问，请联系采购发起下一轮技术澄清里程碑')
        })
      } else {
        if (!saveFlag) {
          const newData = getEditTableData(mySource).map((item) =>
            item._status === 'create'
              ? {
                ...item,
                poOrderId: undefined,
              }
              : item
          );
          for (let i = 0; i < newData.length; i++) {
            newData[i].type = 'judges_rate'
          }
          let data = newData.reverse();
          if (data.length > 0) {
            dispatch({
              type: 'contractJudgesSorce/saveClarification',
              payload: {
                milestoneId: milestoneId,
                data,
              },
            }).then((res) => {
              if (res) {
                dispatch({
                  type: 'contractJudgesSorce/submit',
                  payload: {
                    milestoneId: milestoneId,
                    proId: Number(match.params.proId),
                  },
                }).then(() => {
                  notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
                  this.fetchCAandQAList()
                })
              }
            })
          }
        } else {
          dispatch({
            type: 'contractJudgesSorce/submit',
            payload: {
              milestoneId: milestoneId,
              proId: Number(match.params.proId),
            },
          }).then(() => {
            notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
            this.fetchCAandQAList()
          })
        }
        this.setState({ saveFlag: false })
      }
    }
  }
  // 添加
  @Bind
  @Debounce(200)
  handleAddQusetionLine() {
    const { contractJudgesSorce, dispatch, match } = this.props;
    const { mySource = [], myPagination = {}, myMilestones = [] } = contractJudgesSorce;
    const { milestoneId, milestoneState, milestoneEndTime, milestoneStartTime } = this.state;
    // 获取当前时间
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    // milestoneState: "completed" 已完成
    // if (myMilestones.length > 0 && milestoneId !== '') {
    if (milestoneStartTime === '' && milestoneEndTime === '') { // 待开展
      notification.error({
        message: intl.get(`bid.bidcommon.view.message.remindsetdate`).d('请联系采购创建技术、商务澄清里程碑有效时间')
      })
    } else {
      if (today > milestoneEndTime || milestoneState === 'completed') { // 已完成
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.techqaend`)
            .d('本轮技术商务澄清里程碑已完成，若需再提交疑问，请联系采购发起下一轮技术澄清里程碑')
        })
      } else if (today < milestoneStartTime) { // 未开展
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.techqanotstart`).d('本轮技术商务澄清还未开展，请与采购确认澄清的有效期限')
        })
      } else {
        const newLine = {
          _status: 'create',
          organizationId: getCurrentOrganizationId(),
          proId: match.params.proId, // 项目ID测试:61
          milestoneId: milestoneId,
          poOrderId: uuidv4(),
        };
        const newDataSource = [newLine, ...mySource];
        const newPagination = addItemToPagination(
          mySource.length,
          myPagination
        );
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            mySource: newDataSource,
            myPagination: newPagination,
          },
        });
        this.setState({ groupUnsaveFlag: true });
      }
    }
  }

  // 删除
  @Bind
  handleDeleteQusetionLine() {
    const { contractJudgesSorce } = this.props;
    const { mySource = [] } = contractJudgesSorce;
    const { selectedRows, selectedRowKeys, milestoneId } = this.state;
    if (selectedRowKeys && selectedRowKeys.length > 0 && milestoneId !== '') {
      Modal.confirm({
        title: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okText: intl.get(`bid.bidcommon.view.title.sure`).d('确定'),
        cancelText: intl.get(`bid.bidcommon.view.button.cancel`).d('取消'),
        onOk: () => {
          const { selectedRowKeys } = this.state
          let allList = mySource;
          selectedRowKeys.map((i) => {
            allList = allList.filter(item => item.poOrderId !== i)
            this.delete(i, allList)
          })
          // selectedRowKeys.forEach(itemed => {
          //   allList = allList.filter(item => item.poOrderId !== itemed.poOrderId)
          //   this.delete(itemed, allList)
          // })
          notification.success();
          this.setState({
            selectedRowKeys: [],
          });
        }
      })
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }
  @Bind
  del(key) {
    const { dispatch, contractJudgesSorce: { mySource, myPagination } } = this.props;
    const { selectedRowKeys } = this.state;
    const newPagination = delItemsToPagination(
      selectedRowKeys.length,
      mySource.length,
      myPagination
    );
    if (key[0].poOrderId !== undefined) {
      dispatch({
        type: 'contractJudgesSorce/updateState',
        payload: {
          mySource: key,
          myPagination: newPagination,
        },
      })
    } else {
      dispatch({
        type: 'contractJudgesSorce/updateState',
        payload: {
          mySource: [],
          myPagination: newPagination,
        },
      });
    }
  }
  @Bind
  delete(item, list) {
    const { dispatch, contractJudgesSorce: { mySource } } = this.props;
    let data = mySource;
    data = data.filter(ite => ite.poOrderId === item)
    if (data[0].proId) {
      dispatch({
        type: 'contractJudgesSorce/deleteClarification',
        payload: {
          data,
        },
      }).then((res) => {
        if (res) {
          this.del(list)
        }
      });
    } else {
      this.del(list)
    }
  }

  @Bind
  handleChangeFormItem(milestoneId) {
    const { milstonesInfo } = this.state;
    milstonesInfo.map((item) => {
      if (milestoneId === item.milestoneId) {
        this.setState({
          milestoneState: item.milestoneState || '', // 里程碑状态
          milestoneId: item.milestoneId || '',
          milestoneStartTime: item.milestoneStartTime || '',
          milestoneEndTime: item.milestoneEndTime || '',
        })
      }
    })
    // 判断里程碑是否完结
    let today = moment().format('YYYY-MM-DD HH:mm:ss');
    if (today > this.state.milestoneEndTime || this.state.milestoneState === 'completed') {
      this.setState({ milestonesEnd: true });
    }
    this.fetchCAandQAList();
    this.fetchOtherList();
  }

  render() {
    const {
      form,
      contractJudgesSorce: {
        mySource = [],
        myMilestones = [],
        myPagination = {},
        otherSource = [],
        otherPagination = {},
        enumMap,
      },
      mySourceLoading,
      otherSourceLoading,
      deleteLinesLoading,
      saveLoading,
      submitLoading,
      match,
    } = this.props;
    const {
      selectedRowKeys = [],
      proId,
      milestonesEnd,
      milestoneId,
    } = this.state;
    const { sheetList = [] } = enumMap;
    const { getFieldDecorator } = form;

    // 从其他评委的问题中拎出answerDTOList循环供应商
    let lists = []
    const { answerDTOList = [] } = otherSource.map((item) => {
      lists.push(item.answerDTOList)
    })
    lists.map((items) => {
      newDataList.push(items)
    })
    // 循环匹配查询其他评委的问题分类code
    sheetList.map((item) => {
      otherSource.map((mean) => {
        if (mean.qaType === item.value) {
          mean.qaType = item.meaning
        }
      })
    })

    const myColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
        render: (val, record, index) => (
          <Form.Item>
            {record.$form.getFieldDecorator('supplierName', {
              initialValue: record.supplierName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('bid.bidcommon.view.title.suppliername').d('供应商'),
                  }),
                },
              ],
            })(
              <Lov
                disabled={record.published === 'y'}
                style={{ width: '200px' }}
                code='BID.SELECTPJSUPPLIER'
                queryParams={{ proId }}
                // textField={record.supplierName}
                textValue={record.supplierName}
                onChange={(text, item) => {
                  this.handleDataChange()
                  record.supplierName = item.supplierName
                  record.questTo = item.userId
                }}
              />
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
        key: 'qaType',
        dataIndex: 'qaType',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 230,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('qaType', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('bid.bidcommon.view.title.customerfeedbackclassification').d('问题分类'),
                  }),
                },
              ],
            })(
              <Select allowclear style={{ minWidth: 150 }} disabled={record.published === 'y'}
                onChange={() => { record.qaType = record.$form.getFieldValue('qaType'); record.qaTypeNew = record.$form.getFieldValue('qaType');
                this.handleDataChange() }} >
                {sheetList.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
        dataIndex: 'caseDetail',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
        render: (val, record) => (
          <Form.Item>
            <Tooltip placement="topLeft" title={record.caseDetail} >
              {record.$form.getFieldDecorator('caseDetail', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.clause').d('条目'),
                    }),
                  },
                ],
              })(
                <Input disabled={record.published === 'y'} onChange={() => this.handleDataChange()} />
              )}
            </Tooltip>
          </Form.Item>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
        render: (val, record) => (
          <Form.Item>
            <Tooltip placement="topLeft" title={record.qaContent} >
              {record.$form.getFieldDecorator('qaContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.question').d('问题'),
                    }),
                  },
                ],
              })(
                <Input disabled={record.published === 'y'} onChange={() => this.handleDataChange()} />
              )}
            </Tooltip>
          </Form.Item>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.questiontime`).d('提出问题时间'),
        dataIndex: 'askQuestTime',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.supplierreplycontent`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
        render: (text, record) => {
          return (
            <Tooltip placement="topLeft" title={record.answerContent}>
              <span>{record.answerContent}</span>
            </Tooltip>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.supplierreplytime`).d('供应商答复时间'),
        dataIndex: 'answerTime',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 200,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'answerFileUrl',
        width: 200,
        render: (row, record, index) => {
          // if (row.enclosure == '未发布') {
          return (
            <UploadFile
              disabled
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              // parentId={record.qaId}
              parentId={getCurrentOrganizationId()}
              value={row}
            // isEdit={record.published !== 'y'}
            />
          )
          // }
        }
      }
    ];
    let otherColumns = [];
    if (newDataList.length > 0) {
      otherColumns = [
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'qaType',
          key: 'qaType',
          width: 200,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          fixed: 'left',
          render: (text, record) => {
            return (
              <Tooltip placement="topLeft" title={record.qaType}>
                <span>{record.qaType}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'caseDetail',
          key: 'caseDetail',
          width: 200,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          fixed: 'left',
          render: (text, record) => {
            return (
              <Tooltip placement="topLeft" title={record.caseDetail}>
                <span>{record.caseDetail}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'qaContent',
          key: 'qaContent',
          width: 200,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          fixed: 'left',
          render: (text, record) => {
            return (
              <Tooltip placement="topLeft" title={record.qaContent}>
                <span>{record.qaContent}</span>
              </Tooltip>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.questiontime`).d('提问时间'),
          dataIndex: 'askQuestTime',
          key: 'askQuestTime',
          width: 200,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          fixed: 'left',
          render: (text, record) => {
            return (
              <Tooltip placement="topLeft" title={record.askQuestTime}>
                <span>{record.askQuestTime}</span>
              </Tooltip>
            )
          }
        },
      ];
      otherSource[0].answerDTOList.map((v, index) => {
        otherColumns.push({
          key: `${v.answerUserName}${index}`,
          title: `${v.answerUserName}` != 'null' ? `${v.answerUserName}` : '',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          children: [
            {
              title: intl.get(`bid.bidcommon.view.title.supplierreplycontent`).d('答复内容'),
              // dataIndex: `${v.answerContent}` != 'null' ? `${v.answerContent}` : '',
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              render: (_, row) => (
                <Tooltip title={row.answerDTOList[index].answerContent} placement="topLeft">
                  <span>{row.answerDTOList[index].answerContent}</span>
                </Tooltip>
              )
            },
            {
              title: intl.get(`bid.bidcommon.view.title.supplierreplytime`).d('答复时间'),
              // dataIndex: `${v.answerTime}` != 'null' ? `${v.answerTime}` : '',
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              width: 200,
              render: (_, row) => (
                <Tooltip title={row.answerDTOList[index].answerTime} placement="topLeft">
                  <span>{row.answerDTOList[index].answerTime}</span>
                </Tooltip>
              )
            }
          ]
        })
      })
    } else {
      otherColumns = [
        {
          title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
          dataIndex: 'qaType',
          key: 'qaType',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'),
          dataIndex: 'caseDetail',
          key: 'caseDetail',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
          dataIndex: 'qaContent',
          key: 'qaContent',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        },
        {
          title: intl.get(`bid.bidcommon.view.title.questiontime`).d('提问时间'),
          dataIndex: 'askQuestTime',
          key: 'askQuestTime',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        }
      ];
    }
    const listProps = {
      form,
      dataSource: mySource,
      columns: myColumns,
      pagination: myPagination,
      rowSelection: {
        selectedRowKeys,
        onChange: (keys, rows) => {
          this.setState({
            selectedRowKeys: keys,
            selectedRows: rows,
          });
          this.onRowSelectChange
        },
        getCheckboxProps: record => ({
          disabled: record.published === 'y',
        }),
      },
      loading: mySourceLoading,
      rowKey: 'poOrderId',
      // onChange: (page) => this.fetchCAandQAList(milestoneId !== '' ? milestoneId : -1, page),
      onChange: (page) => this.handlePageChange(page),
      onDataChange: this.handleDataChange,
      // unsaveFlag: groupUnsaveFlag, // 校验切换分页前是否存在未保存数据
      // onEdit: (flag) => {
      //   this.setState({
      //     groupUnsaveFlag: flag,
      //   });
      // },
    };
    const otherListProps = {
      dataSource: otherSource,
      columns: otherColumns,
      pagination: otherPagination,
      loading: otherSourceLoading,
      onChange: this.fetchOtherList
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              marginRight: '10px',
              color: '#666',
              fontSize: '14px',
              marginBottom: '14px'
            }}>
              {intl.get(`bid.bidcommon.view.title.round`).d('轮次')}
            </div>
            <Form.Item>
              {getFieldDecorator('round', {
                initialValue: milestoneId === '' ? myMilestones.length > 0 && myMilestones[0].milestoneId : milestoneId,
              })(
                <Select allowClear style={{ width: 150 }}
                  defaultValue={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                  onChange={(e) => this.handleChangeFormItem(e)} >
                  {myMilestones.map(n => (
                    <Select.Option key={n.milestoneId} value={n.milestoneId}>
                      {n.round}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </div>
          <Card
            // key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl.get(`bid.bidcommon.view.title.experthavequestion`).d('评委提出的问题')}
              </h3>
            }
          >
            <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
              <Col span={24} className="customize-buttons">
                <Button
                  onClick={this.handleDeleteQusetionLine}
                  loading={deleteLinesLoading}
                  disabled={milestonesEnd}
                >
                  <img src={deleteIcon} alt="" />
                  {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                </Button>
                <Button onClick={this.handleAddQusetionLine} disabled={milestonesEnd}>
                  <img src={addIcon} alt="" />
                  {intl.get('bid.bidcommon.bid.button.NewlyBuild').d('新建')}
                </Button>
                <Button onClick={this.handleSave} loading={saveLoading} disabled={milestonesEnd}>
                  <img src={saveIcon} alt="" />
                  {intl.get('bid.bidcommon.view.button.save').d('保存')}
                </Button>
                <Button onClick={this.handleSubmit} loading={submitLoading} disabled={milestonesEnd}>
                  <img src={submitIcon} alt="" />
                  {intl.get('bid.bidcommon.view.title.submitquestion').d('提交问题')}
                </Button>
              </Col>
            </Row>
            <EditTable bordered {...listProps} />
          </Card>
          <Card
            // key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl
                  .get(`bid.bidcommon.view.title.otherexpertquestion`)
                  .d('其他评委提出的问题')}
              </h3>
            }
          >
            <Table bordered {...otherListProps} />
          </Card>
        </Content>
      </Fragment >
    );
  }
}
