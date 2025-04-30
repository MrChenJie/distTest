/**
 * index.js - 技术澄清提问
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React from 'react';
import { Form } from 'antd';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import EditTable from '_cus_components/EditTable';
import CusTable from '_cus_components/CusTable';
import CusLov from '_cus_components/CusLov';
import { tooltipRender } from '_cus_utils/render';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  delItemsToPagination,
  getCurrentLanguage,
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

export default class PhaseTwoTechCAandQA extends React.Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    props?.onRef(this);
    this.state = {
      milestoneEndTime: '',
      milestoneStartTime: '',
      milestoneState: '', // 里程碑状态
      milestoneId: '',
      proId: match.params.proId,
      pageMilestoneId: '', // 切换分页传的对应轮次milestoneId
      // stateMilestonesEnd: btnMilestonesEnd, // 切换轮次时判断是否在截止时间内
    };
  }

  caAndQaForm = React.createRef();

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { btnMilestonesEndTwo } = nextProps;
  //   return {
  //     stateMilestonesEnd: btnMilestonesEndTwo,
  //   };
  // }

  componentDidMount() {
    const { fetchCAandQAListTwo = (e) => e, fetchOtherListTwo = (e) => e } = this.props;
    fetchCAandQAListTwo();
    fetchOtherListTwo();
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
        groupUnsaveFlagTwo: true,
      },
    });
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page = {}) {
    const { fetchCAandQAListTwo = (e) => e, contractJudgesCusSorce: { groupUnsaveFlagTwo } } = this.props;
    const { pageMilestoneId } = this.state;
    if (groupUnsaveFlagTwo) {
      CusModal.confirm({
        content: intl
          .get(`${prompt}.view.message.confirmgetout`)
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
        cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
        onOk: () => {
          fetchCAandQAListTwo(page, pageMilestoneId);
        },
      });
    } else {
      fetchCAandQAListTwo(page, pageMilestoneId);
    }
  }

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
      deleteCAandQA = (e) => e,
      applicationListTwo,
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    deleteCAandQA(selectedRows, selectedRowKeys);
  }

  handleDelete = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/deleteClarification',
      payload: { data },
    })
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
  }

  @Bind
  handleChangeFormItem(milestoneId) {
    const {
      fetchCAandQAListTwo = (e) => e,
      fetchOtherListTwo = (e) => e,
      milstonesInfoTwo,
    } = this.props;
    milstonesInfoTwo.map((item) => {
      if (milestoneId === item.milestoneId) {
        this.setState({
          milestoneState: item.milestoneState || '', // 里程碑状态
          milestoneId: item.milestoneId || '',
          milestoneStartTime: item.milestoneStartTime || '',
          milestoneEndTime: item.milestoneEndTime || '',
        })
        // 判断里程碑是否完结
        let today = moment().format('YYYY-MM-DD HH:mm:ss');
        if (today > item.milestoneEndTime || item.milestoneState === 'completed') {
          this.setState({ stateMilestonesEnd: false });
        } else {
          this.setState({ stateMilestonesEnd: this.props.btnMilestonesEndTwo });
        }
      }
    })
    
    // 判断切换的该轮次是否允许编辑

    this.setState({ pageMilestoneId: milestoneId });
    fetchCAandQAListTwo(_, milestoneId);
    fetchOtherListTwo(_, milestoneId);
  }

  render() {
    const {
      deleteLinesLoading = false,
      contractJudgesCusSorce: {
        myMilestonesTwo = [],
        otherSourceTwo = [],
        otherPaginationTwo = {},
        enumMap,
      },
      milestonesEnd,
      fetchOtherListTwo = (e) => e,
      applicationListTwo,
      applicationPaginationTwo,
      handleAddQusetionLine = (e) => e,
      btnMilestonesEndTwo,
    } = this.props;
    const {
      selectedRowKeys = [],
      proId,
      stateMilestonesEnd = btnMilestonesEndTwo,
    } = this.state;
    const { sheetList = [] } = enumMap;
    // 循环匹配查询其他评委的问题分类code
    sheetList.map((item) => {
      otherSourceTwo.map((mean) => {
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
        required: true,
        render: (val, record, index) => {
          if (record.published === 'y' || !stateMilestonesEnd) {
            return tooltipRender(record.supplierName)
          } else {
            return (
              <Form.Item
                name={`supplierName${index}`}
                initialValue={val}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.title.suppliername`).d('供应商'),
                    })
                  },
                ]}
              >
                <CusLov
                  // disabled={record.published === 'y'}
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
            )
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.customerfeedbackclassification`).d('问题分类'),
        required: true,
        dataIndex: 'selected',
        width: getCurrentLanguage() === 'zh_CN' ? 165 : 198,
        required: true,
        render: (val, record, index) => {
          if (record.published === 'y' || !stateMilestonesEnd) {
            return tooltipRender(record.qaTypeMeaning)
          } else {
            return (
              <Form.Item
                name={`qaType${record.tempId}`}
                initialValue={record.qaTypeMeaning}
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
                  // disabled={record.published === 'y'}
                  options={this.props.contractJudgesCusSorce?.enumMap?.sheetList}
                  onChange={(_, selectList) => {
                    record.qaType = selectList.value;
                    this.handleDataChange()
                  }}
                />
              </Form.Item>
            )
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.clause`).d('条目'),
        dataIndex: 'caseDetail',
        width: 180,
        required: true,
        render: (val, record, index) => {
          if (record.published === 'y' || !stateMilestonesEnd) {
            return tooltipRender(record.caseDetail)
          } else {
            return (
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
                <CusInput
                  // disabled={record.published === 'y'}
                  onChange={(e) => {
                    record.caseDetail = e
                    this.handleDataChange();
                  }}
                />
              </Form.Item>
            )
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 180,
        required: true,
        render: (val, record, index) => {
          if (record.published === 'y' || !stateMilestonesEnd) {
            return tooltipRender(record.qaContent)
          } else {
            return (
              <Form.Item
                name={`qaContent${record.tempId}`}
                initialValue={val}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.title.question`).d('问题'),
                    })
                  },
                ]}
              >
                <CusInput
                  // disabled={record.published === 'y'}
                  onChange={(e) => {
                    record.qaContent = e;
                    this.handleDataChange();
                  }}
                />
              </Form.Item>
            )
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.title.questiontime`).d('提问时间'),
        dataIndex: 'lineNum',
        width: 175,
        required: true,
        render: (_, record) => dateTimeRender(record.askQuestTime),
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplycontent`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        width: 180,
        required: true,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplytime`).d('供应商答复时间'),
        dataIndex: 'orderSeq',
        width: 175,
        required: true,
        render: (_, record) => dateTimeRender(record.answerTime),
      },
      {
        title: intl.get(`${prompt}.view.title.attachment`).d('附件'),
        dataIndex: 'upload',
        width: getCurrentLanguage() === 'zh_CN' ? 85 : 115,
        render: (row, record, index) => {
          return (
            record.answerFileUrl ? <UploadFile
              disabled
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              // parentId={record.qaId}
              parentId={getCurrentOrganizationId()}
              value={record.answerFileUrl}
            // isEdit={record.published !== 'y'}
            /> : 'N/A'
          )
        }
      }
    ];
    const otherColumns = [
      {
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 200,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.customerfeedbackclassification`).d('问题分类'),
        dataIndex: 'selected',
        width: getCurrentLanguage() === 'zh_CN' ? 165 : 198,
        required: true,
        render: (_, record) => tooltipRender(record.qaTypeNew)
      },
      {
        title: intl.get(`${prompt}.view.title.clause`).d('条目'),
        dataIndex: 'caseDetail',
        width: 180,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 180,
        required: true,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.view.title.questiontime`).d('提问时间'),
        dataIndex: 'lineNum',
        width: 175,
        required: true,
        render: (_, record) => dateTimeRender(record.askQuestTime),
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplycontent`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        width: 180,
        required: true,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.title.supplierreplytime`).d('供应商答复时间'),
        dataIndex: 'orderSeq',
        width: 175,
        required: true,
        render: (_, record) => dateTimeRender(record.answerTime),
      },
      {
        title: intl.get(`${prompt}.view.title.attachment`).d('附件'),
        dataIndex: 'upload',
        width: getCurrentLanguage() === 'zh_CN' ? 85 : 115,
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
              value={record.answerFileUrl}
            // isEdit={record.published !== 'y'}
            /> : 'N/A'
          )
          // }
        }
      }
    ];
    const listProps = {
      dataSource: applicationListTwo,
      columns: myColumns,
      pagination: applicationPaginationTwo,
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
          disabled: record.published === 'y' || !stateMilestonesEnd,
        }),
      },
      rowKey: 'tempId',
      resizable: true,
      onChange: this.handlePageChange, // 校验切换分页前是否存在未保存数据
      onDataChange: this.handleDataChange,
    };
    const otherListProps = {
      rowKey: 'otherId',
      dataSource: otherSourceTwo,
      columns: otherColumns,
      pagination: otherPaginationTwo,
      rowSelection: {
        fixed: true,
        columnWidth: 38,
        getCheckboxProps: record => ({
          disabled: true,
        }),
      },
      resizable: true,
      onChange: fetchOtherListTwo,
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Form ref={this.caAndQaForm}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className={styles.twoLevelTitle}>
            {intl.get(`${prompt}.view.title.experthavequestion`).d('评委提出的问题')}
          </span>
          {myMilestonesTwo.length > 0 &&
            <div style={{ display: 'flex', alignItems: 'flex-start', maxHeight: '32px' }}>
              <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
              <Form.Item
                {...formItemLayout}
                name='questionRound'
                initialValue={`${myMilestonesTwo.length > 0 && myMilestonesTwo[0].meaning}`}
              >
                <CusSelect style={{ width: 80 }}
                  options={myMilestonesTwo}
                  onChange={(e) => this.handleChangeFormItem(e)}
                />
              </Form.Item>
              {stateMilestonesEnd && <>
                <CusButton
                  mini
                  onClick={this.handleDeleteQusetionLine}
                  // disabled={milestonesEnd}
                  loading={deleteLinesLoading}
                >
                  {intl.get(`${prompt}.view.button.delete`).d('删除')}
                </CusButton>
                <CusButton
                  mini
                  onClick={handleAddQusetionLine}
                  // disabled={milestonesEnd}
                >
                  {intl.get(`${prompt}.bid.button.NewlyBuild`).d('新建')}
                </CusButton>
              </>
              }
            </div>
          }
        </div>
        <EditTable {...listProps} />
        <div className={styles.twoLevelTitle} style={{ margin: '16px 0' }}>
          {intl.get(`${prompt}.view.title.otherexpertquestion`).d('其他评委提出的问题')}
        </div>
        <CusTable {...otherListProps} />
      </Form>
    );
  }
}