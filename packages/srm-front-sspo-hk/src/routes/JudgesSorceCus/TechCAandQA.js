/**
 * index.js - 技术澄清提问
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React from 'react';
import { Form, Input } from 'antd';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusEditTable from '_cus_components/CusEditTable';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';
import CusLov from '_cus_components/CusLov';
import { tooltipRender } from '_cus_utils/render';
import { dateRender } from 'utils/renderer';
import { sum, isEmpty, pullAllBy, cloneDeep } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
} from 'hzero-front/lib/utils/utils';
import UploadFile from './UploadFile';
import styles from './index.less';

const prompt = 'bid.bidcommon';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@connect(({ loading = {}, contractJudgesCusSorce }) => ({
  deleteLinesLoading: loading.effects['contractJudgesCusSorce/deleteClarification'],
  contractJudgesCusSorce,
}))

export default class TechCAandQA extends React.Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    props?.onRef(this);
    this.state = {
      milstonesInfo: [],
      milestoneEndTime: '',
      milestoneStartTime: '',
      milestoneState: '', // 里程碑状态
      milestoneId: '',
      proId: match.params.proId,
      pageMilestoneId: '', // 切换分页传的对应轮次milestoneId
    };
  }

  caAndQaForm = React.createRef();

  componentDidMount() {
    const { fetchCAandQAList = (e) => e, fetchOtherList = (e) => e } = this.props;
    fetchCAandQAList();
    fetchOtherList();
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
   */
  @Bind
  handleDataChange() {
    this.props.dispatch({
      type: 'contractJudgesCusSorce/updateState',
      payload: {
        groupUnsaveFlag: true,
      },
    });
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page = {}) {
    const { fetchCAandQAList = (e) => e, contractJudgesCusSorce: { groupUnsaveFlag } } = this.props;
    const { pageMilestoneId } = this.state;
    if (groupUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get(`${prompt}.view.message.confirmgetout`)
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
        cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
        onOk: () => {
          fetchCAandQAList(page, pageMilestoneId);
        },
      });
    } else {
      fetchCAandQAList(page, pageMilestoneId);
    }
  }

  // 添加
  // @Bind
  // @Debounce(200)
  // handleAddQusetionLine() {
  //   const {
  //     match,
  //     dispatch,
  //     contractJudgesCusSorce: {
  //       mySource = [],
  //       myPagination = {},
  //     },
  //     milestoneId,
  //     milestoneState,
  //     milestoneEndTime,
  //     milestoneStartTime,
  //     applicationList,
  //     applicationPagination
  //   } = this.props;
  //   let list = applicationList;
  //   let pagination = applicationPagination;
  //   // 获取当前时间
  //   const today = moment().format('YYYY-MM-DD HH:mm:ss');
  //   if (milestoneStartTime === '' && milestoneEndTime === '') { // 待开展
  //     CusNotification.error({
  //       message: intl.get(`${prompt}.view.message.remindsetdate`).d('请联系采购创建技术、商务澄清里程碑有效时间')
  //     })
  //   } else {
  //     if (today > milestoneEndTime || milestoneState === 'completed') { // 已完成
  //       CusNotification.error({
  //         message: intl.get(`${prompt}.view.message.techqaend`)
  //           .d('本轮技术商务澄清里程碑已完成，若需再提交疑问，请联系采购发起下一轮技术澄清里程碑')
  //       })
  //     } else if (today < milestoneStartTime) { // 未开展
  //       CusNotification.error({
  //         message: intl.get(`${prompt}.view.message.techqanotstart`).d('本轮技术商务澄清还未开展，请与采购确认澄清的有效期限')
  //       })
  //     } else {
        // const newPagination = addItemToPagination(
        //   mySource.length,
        //   myPagination
        // );
        // const newDataList = [
        //   ...mySource,
        //   {
        //     canEdit: 1, // 编辑标识
        //     _status: 'create',
        //     organizationId: getCurrentOrganizationId(),
        //     proId: match.params.proId, // 项目ID测试:61
        //     milestoneId: milestoneId,
        //     tempId: uuidv4(),
        //     supplierName: '',
        //     questTo: '',
        //     qaType: '',
        //     qaTypeNew: '',
        //     caseDetail: '',
        //     qaContent: '',
        //     published: 'n',
        //   }
        // ]
        // this.setState({ thisGroupUnsaveFlag: true, newDataList: newDataList });
        // dispatch({
        //   type: 'contractJudgesCusSorce/updateState',
        //   payload: {
        //     mySource: newDataList,
        //     myPagination: newPagination,
        //   },
        // });
  //     }
  //   }
  // }

  /**
   * 删除提示框
   */
  @Bind()
  deleteConfirm(onOk) {
    CusModal.confirm({
      content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  // 删除
  @Bind
  @Debounce(200)
  handleDeleteQusetionLine() {
    const {
      milestoneId,
      deleteCAandQA = (e) => e,
      applicationList,
      deleteNewRows = (e) => e,
      deleteExistRows = (e) => e,
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const newApplicationList = cloneDeep(applicationList);
    // 根据selectedRowKeys查找出选中行
    // const selectedRows = [];
    // selectedRowKeys && applicationList.forEach((i) => {
    //   selectedRowKeys.forEach((j) => {
    //     if (i.tempId === j) {
    //       selectedRows.push(i);
    //     }
    //   });
    // });
    // if (selectedRowKeys && selectedRowKeys.length > 0 && milestoneId !== '') {
      // // 选中行的新建行
      // const newRows = selectedRows.filter((n) => n._status === 'create');
      // // 选中行的已有行
      // const existRows = selectedRows.filter((n) => n._status !== 'create');
      // const newList = pullAllBy(newApplicationList, newRows, 'tempId');
      // if (isEmpty(newRows)) {
      //   this.deleteConfirm(() => deleteExistRows(selectedRowKeys, newList));
      // } else if (isEmpty(existRows)) {
      //   this.deleteConfirm(() => deleteNewRows(newList));
      // } else {
      //   CusModal.confirm({
      //     content: intl.get(`${prompt}.view.message.suredelete`).d('是否确认删除'),
      //     okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
      //     cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
      //     onOk: () => {
            deleteCAandQA(selectedRows, selectedRowKeys);
            // const data = selectedRows.filter((item) => item._status === 'update');
            // const remainCreateData = selectedRows.filter((item) => item._status === 'create');
            // if (data.length) {
            //   this.handleDelete(data);
            // }
            // let allList = mySource;
            // let newCreatList = [];
            // newCreatList = allList.filter((item) => item._status === 'create');
            // selectedRowKeys.map((i) => {
            //   allList = allList.filter(item => item.tempId !== i)
            //   this.delete(i, allList)
            // })
            // // fetchCAandQAList();
          // }
        // })
      // }
    // } else {
    //   CusNotification.warning({
    //     message: intl.get(`${prompt}.view.message.leastdata`).d('请至少选择一行数据'),
    //   });
    // }
  }

  handleDelete = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/deleteClarification',
      payload: { data },
    })
    // .then((res) => {
    //   if (res) {
    //     this.setState({ selectedRows: [] });
    //     CusNotification.success();
    //   }
    // });
  }

  @Bind
  delete(item, list) {
    const { dispatch, contractJudgesCusSorce: { mySource } } = this.props;
    let data = mySource.filter(ite => ite.tempId === item)
    if (data[0].proId) {
      dispatch({
        type: 'contractJudgesCusSorce/deleteClarification',
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
  del(list) {
    const { dispatch, contractJudgesCusSorce: { mySource, myPagination } } = this.props;
    const { selectedRowKeys } = this.state;
    const newPagination = delItemsToPagination(
      selectedRowKeys.length,
      mySource.length,
      myPagination
    );
    selectedRowKeys.length > 0 && selectedRowKeys.map((item) => {
      if (item !== undefined) {
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: { 
            mySource: list,
            myPagination: newPagination,
          },
        })
      } else {
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: { 
            mySource: [],
            myPagination: newPagination,
          },
        });
      }
    })
    // if (key[0].tempId !== undefined) {
    //   dispatch({
    //     type: 'contractJudgesCusSorce/updateState',
    //     payload: {
    //       mySource: key,
    //       myPagination: newPagination,
    //     },
    //   })
    // } else {
    //   dispatch({
    //     type: 'contractJudgesCusSorce/updateState',
    //     payload: {
    //       mySource: [],
    //       myPagination: newPagination,
    //     },
    //   });
    // }
  }

  @Bind
  handleChangeFormItem(milestoneId) {
    const {
      fetchCAandQAList = (e) => e,
      fetchOtherList = (e) => e,
      milstonesInfo,
      changeRoundCAandQA = (e) => e,
    } = this.props;
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
    // let today = moment().format('YYYY-MM-DD HH:mm:ss');
    // if (today > this.state.milestoneEndTime || this.state.milestoneState === 'completed') {
    //   this.setState({ localMilestonesEnd: true });
    // }
    this.setState({ pageMilestoneId: milestoneId });
    fetchCAandQAList(_, milestoneId);
    fetchOtherList(_, milestoneId);
    changeRoundCAandQA(milestoneId);
  }

  render() {
    const {
      deleteLinesLoading = false,
      contractJudgesCusSorce: {
        mySource = [],
        myMilestones = [],
        myPagination = {},
        otherSource = [],
        otherPagination = {},
        enumMap,
        groupUnsaveFlag,
      },
      milestonesEnd,
      milestoneId,
      fetchOtherList = (e) => e,
      applicationList,
      applicationPagination,
      handleAddQusetionLine = (e) => e,
      btnEnd,
    } = this.props;
    const {
      selectedRowKeys = [],
      proId,
      pageMilestoneId,
    } = this.state;
    const { sheetList = [] } = enumMap;
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
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 200,
        ellipsis: true,
        resizable: true,
        required: true,
        render: (val, record, index) =>
          record.published === 'n' ? (
            <Form.Item
              name={`supplierName${index}`}
              initialValue={val}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('${prompt}.view.title.suppliername').d('供应商'),
                  })
                },
              ]}
            >
              <CusLov
                disabled={record.published === 'y'}
                code='BID.SELECTPJSUPPLIER'
                queryParams={{ proId }}
                textValue={record.supplierName}
                lovOptions={{ displayField: 'supplierName' }}
                onChange={(_, lovData) => {
                  record.supplierName = lovData.supplierName;
                  record.questTo = lovData.userId;
                  this.handleDataChange();
                }}
              />
            </Form.Item>
          ) : (
            tooltipRender(record.supplierName)
          )
      },
      {
        title: intl.get(`${prompt}.view.title.customerfeedbackclassification`).d('问题分类'),
        key: 'qaType',
        dataIndex: 'qaType',
        width: 150,
        ellipsis: true,
        resizable: true,
        required: true,
        render: (val, record, index) =>
          record.published === 'n' ? (
            <Form.Item
              name={`qaType${record.tempId}`}
              initialValue={val}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.view.title.customerfeedbackclassification`).d('问题分类'),
                  })
                },
              ]}
            >
              <CusSelect
                allowclear="true"
                disabled={record.published === 'y'}
                options={this.props.contractJudgesCusSorce?.enumMap?.sheetList}
                onChange={(_, selectList) => {
                  record.qaType = selectList.value;
                  this.handleDataChange()
                }}
              />
            </Form.Item>
          ) : (
            tooltipRender(record.qaTypeMeaning)
          )
      },
      {
        title: intl.get(`${prompt}.view.title.clause`).d('条目'),
        dataIndex: 'caseDetail',
        width: 120,
        ellipsis: true,
        resizable: true,
        required: true,
        render: (val, record, index) =>
          record.published === 'n' ? (
            <Form.Item
              name={`caseDetail${record.tempId}`}
              initialValue={val}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.view.title.clause`).d('条目'),
                  })
                },
              ]}
            >
              <Input
                disabled={record.published === 'y'}
                onChange={(e) => {
                  record.caseDetail = e.target.value
                  this.handleDataChange();
                }}
              />
            </Form.Item>
          ) : (
            tooltipRender(record.caseDetail)
          )
      },
      {
        title: intl.get(`${prompt}.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 200,
        ellipsis: true,
        resizable: true,
        required: true,
        render: (val, record, index) =>
          record.published === 'n' ? (
            <Form.Item
              name={`qaContent${record.tempId}`}
              initialValue={val}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('${prompt}.view.title.question').d('问题'),
                  })
                },
              ]}
            >
              <Input
                disabled={record.published === 'y'}
                onChange={(e) => {
                  record.qaContent = e.target.value;
                  this.handleDataChange();
                }}
              />
            </Form.Item>
          ) : (
            tooltipRender(record.qaContent)
          )
      },
      {
        title: tooltipRender(intl.get(`${prompt}.view.title.questionDate`).d('提问日期')),
        dataIndex: 'askQuestTime',
        width: 110,
        ellipsis: true,
        resizable: true,
        required: true,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplycontent`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        width: 170,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplytime`).d('供应商答复时间'),
        dataIndex: 'answerTime',
        width: 150,
        ellipsis: true,
        resizable: true,
        required: true,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.title.attachment`).d('附件'),
        dataIndex: 'answerFileUrl',
        width: 100,
        ellipsis: true,
        // className: 'noRequired',
        render: (row, record, index) => {
          // if (row.enclosure == '未发布') {
          return (
            record.answerFileUrl ? <UploadFile
              disabled
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              // parentId={record.qaId}
              parentId={getCurrentOrganizationId()}
              value={row}
            // isEdit={record.published !== 'y'}
            /> : 'N/A'
          )
          // }
        }
      }
    ];
    const otherColumns = [
      {
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 200,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.customerfeedbackclassification`).d('问题分类'),
        key: 'qaTypeNew',
        dataIndex: 'qaTypeNew',
        width: 150,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.clause`).d('条目'),
        dataIndex: 'caseDetail',
        width: 120,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 200,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender
      },
      {
        title: tooltipRender(intl.get(`${prompt}.view.title.questionDate`).d('提问日期')),
        dataIndex: 'askQuestTime',
        width: 110,
        ellipsis: true,
        resizable: true,
        required: true,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplycontent`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        width: 170,
        ellipsis: true,
        resizable: true,
        required: true,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplytime`).d('供应商答复时间'),
        dataIndex: 'answerTime',
        width: 150,
        ellipsis: true,
        resizable: true,
        required: true,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.title.attachment`).d('附件'),
        dataIndex: 'answerFileUrl',
        width: 100,
        ellipsis: true,
        // className: 'noRequired',
        resizable: false,
        render: (row, record, index) => {
          // if (row.enclosure == '未发布') {
          return (
            record.answerFileUrl ? <UploadFile
              disabled
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              // parentId={record.qaId}
              parentId={getCurrentOrganizationId()}
              value={row}
            // isEdit={record.published !== 'y'}
            /> : 'N/A'
          )
          // }
        }
      }
    ];
    const listProps = {
      dataSource: applicationList,
      columns: myColumns,
      pagination: applicationPagination,
      rowSelection: {
        fixed: true,
        columnWidth: 38,
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
      rowKey: 'tempId',
      resizable: true,
      onChange: this.handlePageChange, // 校验切换分页前是否存在未保存数据
      onDataChange: this.handleDataChange,
    };
    const otherListProps = {
      rowKey: 'otherId',
      dataSource: otherSource,
      columns: otherColumns,
      pagination: otherPagination,
      rowSelection: {
        fixed: true,
        columnWidth: 38,
        getCheckboxProps: record => ({
          disabled: true,
        }),
      },
      resizable: true,
      onChange: (page) => fetchOtherList(page, pageMilestoneId),
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Form ref={this.caAndQaForm}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span className={styles.twoLevelTitle} style={{ marginBottom: '16px' }}>
            {intl.get(`${prompt}.view.title.experthavequestion`).d('评委提出的问题')}
          </span>
          <div style={{ display: 'flex', marginTop: '-4px' }}>
            {myMilestones.length > 0 &&
              <Form.Item
                {...formItemLayout}
                label={intl.get(`${prompt}.view.title.round`).d('轮次')}
                name='questionRound'
                style={{ margin: '0px 12px 10px 0' }}
                initialValue={`${myMilestones.length > 0 && myMilestones[0].meaning}`}
                className={styles['label-name']}
              >
                <CusSelect style={{ width: 80 }}
                  options={myMilestones}
                  onChange={(e) => this.handleChangeFormItem(e)}
                />
              </Form.Item>
            }
            <CusButton
              onClick={this.handleDeleteQusetionLine}
              disabled={milestonesEnd || btnEnd}
              loading={deleteLinesLoading}
            >
              {intl.get(`${prompt}.view.button.delete`).d('删除')}
            </CusButton>
            <CusButton
              onClick={handleAddQusetionLine}
              disabled={milestonesEnd || btnEnd}
            >
              {intl.get(`${prompt}.bid.button.NewlyBuild`).d('新建')}
            </CusButton>
          </div>
        </div>
        <div className={styles['fileNoBorder']} >
          <CusTable {...listProps} />
        </div>
        <div className={styles.twoLevelTitle} style={{ margin: '18px 0 16px 0' }}>
          {intl.get(`${prompt}.view.title.otherexpertquestion`).d('其他评委提出的问题')}
        </div>
        <div className={styles['fileNoBorder']} >
          <CusTable {...otherListProps} />
        </div>
      </Form>
    );
  }
}
