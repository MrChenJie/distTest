/**
 * index.js - 新建项目-设置评委
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Row, Col, Modal, Select, Input, Tooltip } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { sum } from 'lodash';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Content } from 'components/Page';
import { getEditTableData, getCurrentUser, getCurrentLanguage } from 'utils/utils';
import { getCurrentOrganizationId, createPagination } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from '@/components/ExcelExport';
import { SRM_BID } from '@/common/config';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import styles from './index.less';
import { split } from 'lodash';
import CusNotification from '_cus_components/CusNotification';
import PageMessage from '_cus_components/Page/PageMessage';
import TopInfoMsg from './TopInfoMsg';

const commonPrompt = 'srsp.nrcEstimate';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@connect(({ loading = {}, contractMaintain = {} }) => ({
  // fetchSourceList: loading.effects['contractMaintain/getJudgesTableList'],
  saveLoading: loading.effects['contractMaintain/saveJudgesTableList'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord'
  ],
})
@Form.create({ fieldNameProp: null })

export default class SetJudgesTable extends Component {
  constructor(props) {
    super(props);
    const { Form, matchs } = this.props;
    this.state = {
      fileUrl: '',
      upload: false,
      fileList: [],
      visible: false,
      messageVisible: false,
      showRules: false,
      tenantId: getCurrentOrganizationId(),
      userId: '',
      judgesPeoNum: 0,
      canAdd: false, //是否允许添加评委
      newJudgesList: {},
      judgesCount: 0,
      stateNum: 0, // 放弃的评委个数
      acceptNum: 0, // 参与的评委个数
      saveSorce: [], //保存后的评委数据
      newDataList: [],
      deleteCountFLag: 0,
      saveList: [], // 保存后的本地数据存储
      groupUnsaveFlag: false,
      checkSwitch: false,
    };
  }

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchCheckSwitch();
  }

  // 查询 灰度测试开关已开启，并且当前登陆人在灰度测试采购名单中
  @Bind()
  fetchCheckSwitch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getCheckSwitch',
      payload: {}
    }).then((res) => {
      if(res) {
        this.setState({
          checkSwitch: res.message === 'NO'
        })
      }
    })
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   * isAdd - 是否时添加功能
   */
  @Bind()
  fetchList(page = {}, isAdd) {
    const {
      dispatch,
      matchs,
    } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractMaintain/getJudgesTableList',
      payload: {
        proId: matchs.params.proId, //matchs.params.proId
        page,
        // userIds: [0], // 评委弹框选中后的多个评委selectedRowKeys
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        const pagination = createPagination(content);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        let isState = 0;
        content.map((i) => {
          if (i.effectState === 'Participate') {
            isState += 1;
          }
        })
        if (isAdd === undefined) { // 正常查询
          this.setState({ newDataList: newDataSource })
          if (isState === res.judgesCount) {
            this.setState({ canAdd: true });
          }
        }
        // if (newDataSource.length > 0 && isAdd === undefined) {
        //   this.setState({ newDataList: this.state.newDataList })
        // }
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            judgesDataSource: newDataSource,
            judgesPagination: pagination,
          },
        });
        this.setState({
          acceptNum: isState,
          stateNum: Number(content.length - isState),
          judgesCount: res.judgesCount,
          saveList: newDataSource,
          groupUnsaveFlag: false,
        })
        if (isAdd) {
          // if (res.state === 'YES') {
            this.addJudges()
          // } else {
          //   notification.error({
          //     message: intl
          //       .get(`bid.bidcommon.view.message.addexpertsremind`)
          //       .d('请在截标前两天添加评委！')
          //   })
          // }
        } else {
          const pagination = createPagination(res);
          const newDataSource = content.map((item) => ({
            ...item,
            _status: 'update',
            rowKey: uuidv4(),
          }));
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              judgesDataSource: newDataSource,
              judgesPagination: pagination,
            },
          });
          
        }
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

  // 取消
  @Bind
  handleCancel() {
    this.setState({
      visible: false,
      messageVisible: false,
      fileList: [],
      message: '',
    });
  }

  // change评委人数用作判断
  @Bind
  changePeopleNum(e) {
    const { newDataList } = this.state;
    let num = 0;
    // 分离出参与人数
    newDataList.map((i) => {
      if (i.effectState === 'Participate') {
        num += 1;
      }
    })
    this.setState({
      acceptNum: num,
      stateNum: Number(newDataList.length - num),
      judgesPeoNum: e
    })
    if (num < Number(e)) {
      this.setState({ canAdd: false })
    } else {
      this.setState({ canAdd: true })
    }
  }

  // 新建-添加行
  @Bind
  handleAdd(isAdd) {
    const { pagination } = this.props;
    !isAdd && this.fetchList(pagination, true);
  }

  @Bind
  @Debounce(200)
  addJudges() {
    const { matchs, contractMaintain } = this.props;
    const { judgesDataSource = [] } = contractMaintain;
    const { judgesPeoNum, judgesCount, newDataList } = this.state;
    if (judgesPeoNum > 0 || judgesCount > 0) {
      const newData = {
        effectState: "Participate", // 默认参与
        judgesRuleState: 0, // 1：已读已提交 ， 0：未读 ，2：已读未提交
        judgesType: "",
        department: "",
        mobile: "",
        email: "",
        remark: "",
        remarkReq: false,
        proId: matchs.params.proId,
        _status: 'create',
        poOrderId: uuidv4(),
        organizationId: getCurrentOrganizationId(),
      };
      // newDataList.unshift(newData);
      // const newDataSource = [...newDataList, ...judgesDataSource];
      let newDataSource = [...newDataList, newData];
      this.setState({ newDataList: newDataSource });
      let num = 0;
      // 分离出参与状态的评委人数
      newDataSource.map((i) => {
        if (i.effectState === 'Participate') {
          num += 1;
        }
      })
      // 当分离(参与)人数小于选择人数，更新添加状态
      if (num < (Number(judgesPeoNum) || judgesCount)) {
        this.setState({ canAdd: false })
      } else {
        this.setState({ canAdd: true })
      }
      this.props.isTrue()
      this.setState({ groupUnsaveFlag: true });
    } else {
      notification.error({
        message: intl.get(`bid.bidcommon.view.message.xianselectpwno`).d('请先选择评委人数')
      })
    }
  }

  @Debounce(300, { leading: true })
  @Bind()
  handleSave() {
    const { dispatch, match, contractMaintain: { judgesDataSource } } = this.props;
    const { judgesCount, judgesPeoNum, newDataList, saveList } = this.state;
    // 查询评委是否有相同的，如果有则不允许进行保存
    let messageRepeatFlag = false;
    for (let i = 0; i < newDataList.length; i++) {
      for (let j = i + 1; j < newDataList.length; j++) {
        if (newDataList[i].userId == newDataList[j].userId) {
          messageRepeatFlag = true;
        }
      }
    }
    let newStateNum = 0;
    newDataList.map((i) => {
      // 保存时校验人数
      if (i.effectState === 'Participate') {
        newStateNum += 1;
      }
    })
    // 对比保存前和保存后的数据是否有做更改，如果有，校验备注必填
    // newDataList.map((j) => {
    //   saveList.map((k) => {
    //     if (j.judgesType !== k.judgesType || j.userId !== k.userId) {
    //       j.remarkReq = true
    //     } else {
    //       j.remarkReq = false
    //     }
    //   })
    // })

    const newData = getEditTableData(newDataList).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    for (let i = 0; i < newData.length; i++) {
      newData[i].proId = match.params.proId;
      newData[i].judgesSetCount = Number(judgesPeoNum) || judgesCount;
    }
    let data = newData.sort(); // 正序保存
    if (data.length > 0) {
      if (messageRepeatFlag) {
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.noxiangtongren`).d('不能有相同评委')
        })
      } else {
        if ((Number(judgesPeoNum) || judgesCount) === newStateNum) {
          this.setState({ canAdd: true });
          dispatch({
            type: 'contractMaintain/saveJudgesTableList',
            payload: {
              data: [...data]
            }
          }).then((res) => {
            if(res && res.failed) {
              const messageOne = getCurrentLanguage() === 'zh_CN' ? split(res?.message, '#')[0] : split(res?.message, '#')[0]
              const messageTwo = getCurrentLanguage() === 'zh_CN' ? split(res?.message, '#')[1] : split(res?.message, '#')[1]
              return CusNotification.error({
                message:
                <>
                  <div>{messageOne}</div>
                  <div style={{marginTop: '10px'}}>{messageTwo}</div>
                </>,
                duration: null,
              })
            }
            this.fetchList();
              this.setState({ saveList: data });
              notification.success({
                message: intl
                  .get(`bid.bidcommon.view.title.savesuccessfully`)
                  .d('保存成功'),
              });
              this.props.isFalse()
          })
        } else {
          notification.error({
            message: intl
              .get(`bid.bidcommon.view.message.renshuyizhi`)
              .d('参与人数需与评委人数一致'),
          });
        }
      }
    };
  }

  // 删除
  @Bind
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows, selectedRowKeys, judgesCount, judgesPeoNum, newDataList } = this.state;
    // 删除前校验人数是否一致，一致则不允许删除
    let num = 0; // 当前参与评委人数
    newDataList.map((k) => {
      if (k.effectState === "Participate") {
        num += 1;
      }
    })
    const data = selectedRows.filter((item) => item._status === 'update');
    // 筛选出勾选的数据中是否有create和保存过的数据
    let creatNum = 0;
    let isSave = 0;
    let isQuit = 0;
    selectedRows.map((p) => {
      if (p._status === 'create') {
        creatNum += 1; // 新建
      }
      if (p.judgesId !== undefined) {
        isSave += 1; // 已保存
      }
      if (p.effectState === 'Quit') {
        isQuit += 1; // 放弃
      }
    })
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      // if ((Number(judgesPeoNum) || judgesCount) === num && ((creatNum === 0 && isSave > 0) || isQuit === 0)) {
      if ((Number(judgesPeoNum) || judgesCount) === num && isSave > 0) {
        notification.warning({
          message: intl.get(`bid.bidcommon.view.message.rensamenoshan`).d('当前评委人数一致，已不可删除'),
        });
      } else if (
        ((Number(judgesPeoNum) || judgesCount) === num && isQuit > 0) ||  // 人数一致，有放弃人数，且有新建人数 允许删除
        creatNum > 0
      ) {
        Modal.confirm({
          title: intl.get(`hzero.common.message.confirm.remove`).d('是否确认删除'),
          okText: intl.get(`bid.bidcommon.view.button.surequeren`).d('确定'),
          cancelText: intl.get(`bid.bidcommon.view.button.cancel`).d('取消'),
          onOk: () => {
            let deleteNewDataList = [];
            for (let i in selectedRows) {
              if (selectedRows[i]._status === 'update') {
                selectedRows.map((item, i) => {
                  newDataList.map((ite, j) => {
                    if (item.poOrderId === ite.poOrderId && item._status === 'update') {
                      deleteNewDataList.push(ite);
                      newDataList.splice(j, 1)
                    }
                  })
                })
                this.setState({ newDataList: newDataList })
              } else {
                // 删除本地数据
                console.log("newDataListNEW=====", newDataList);
                console.log("selectedRowsNew====", selectedRows);
                selectedRows.map((item, i) => {
                  newDataList.map((ite, j) => {
                    if (item.poOrderId === ite.poOrderId && item._status === 'create') {
                      newDataList.splice(j, 1)
                    }
                  })
                })
                this.setState({ selectedRows: [], selectedRowKeys: [] })
              }
            }
            if (deleteNewDataList.length > 0) {
              dispatch({
                type: 'contractMaintain/deleteJudgesTableList',
                payload: {
                  data: [...data],
                },
              }).then((res) => {
                // notification.success();
              });
            }
            notification.success();
            let num = 0;
            // 循环查询同意人数
            for (let i in newDataList) {
              if (newDataList[i].effectState === 'Participate') {
                num += 1;
              }
            }
            if (num < judgesPeoNum) {
              this.setState({ canAdd: false })
            } else {
              this.setState({ canAdd: true })
            }
          },
        })
      } else {
        notification.error({
          message: intl.get(`bid.bidcommon.view.message.rensamenoshan`).d('当前评委人数一致，已不可删除'),
        })
      }
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  // 更改评委类型
  @Bind
  changeJudgesType(item, record) {
    const { form } = this.props
    if (item === undefined) {
      record.judgesType = ''
    } else {
      form.setFieldsValue({ judgesType: item.key })
    }
    if (record._status === 'update') {
      if (item && item.key !== record.judgesType) {
        record.remarkReq = true
      }
    }
  }

  // 更新评委状态
  @Bind
  changeState(item, record, index) {
    const { form, contractMaintain: { judgesDataSource } } = this.props;
    const { acceptNum, stateNum, newDataList, judgesPeoNum } = this.state;
    if (item === undefined) {
      record.effectState = ''
    } else {
      form.setFieldsValue({ effectState: item.key })
    }
    // 当选择放弃状态时，允许添加，更新参与人数去更新添加状态
    // if (record.effectState !== 'Participate') {
    //   newDataList[index].effectState = 'Quit';
    //   this.setState({ stateNum: Number(judgesDataSource.length - acceptNum) })
    // } else if (record.effectState !== 'Quit') {
    //   newDataList[index].effectState = 'Participate'
    // };
    if (item && item.key !== record.effectState) {
      record.effectState = item.key;
    }
    // 判断保存后是否有修改，有就校验备注必填
    if (record._status === 'update') {
      if (item && item.key === record.effectState) {
        record.remarkReq = true
      }
    }
    let num = 0;
    newDataList.map((k) => {
      if (k.effectState === 'Participate') {
        num += 1;
      }
    })
    if (num === Number(judgesPeoNum)) {
      this.setState({ canAdd: true });
    } else {
      this.setState({ canAdd: false });
    }
  }

  @Bind
  handleChange(item, record) {
    if (record._status === 'update') {
      if (item.employeeId !== record.userId) {
        record.remarkReq = true
      }
    }
  }
  
  /**
   * 监听编辑事件，更改当前未保存状态
   */
  @Bind
  handleDataChange() {
    const { groupUnsaveFlag } = this.state;
    if (!groupUnsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
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
          this.fetchList(page);
        },
      });
    } else {
      this.fetchList(page);
    }
  }

  render() {
    const { loginName } = getCurrentUser();
    const {
      matchs,
      saveLoading,
      contractMaintain,
      deleteLinesLoading = false,
      form = {},
      detailEnumMap = {},
      disabled,
      getDetailList
    } = this.props;
    const { judgesDataSource = [], judgesPagination = {} } = contractMaintain;
    const { judgesNums = [], judgesType = [], judgesState = [] } = detailEnumMap;
    let distribution = 'No';
    const {
      selectedRows = [],
      selectedRowKeys = [],
      tenantId,
      canAdd,
      judgesCount,
      newDataList,
      checkSwitch,
    } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: 80,
        editable: true,
        render: (val, row, index) => {
          if (row || val) {
          }
          return (
            index + 1
          );
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.experttype`).d('评委类型'),
        dataIndex: 'judgesType',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('judgesType', {
              initialValue: `${record.judgesType}`,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('bid.bidcommon.view.title.experttype').d('评委类型'),
                  }),
                }
              ],
            })(
              <Select allowClear style={{ minWidth: 150 }} disabled={distribution != 'No'}
                // onChange={() => { record.judgesType = record.$form.getFieldValue('judgesType') }} >
                onChange={(text, item) => {this.changeJudgesType(item, record)
                  this.props.isTrue()
                }} >
                {judgesType.map((n) => (
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
        title: intl.get(`bid.bidcommon.view.title.expertname`).d('评委姓名'),
        dataIndex: 'name',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, record, index) => (
          <Form.Item {...formItemLayout} >
            {record.$form.getFieldDecorator('name', {
              initialValue: record.name,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('bid.bidcommon.view.title.expertname').d('评委姓名'),
                  }),
                },
                {
                  validator: (rule, value, callback) => {
                    if (value === loginName && checkSwitch && (getDetailList.purchaseType === 'public_bidding' || getDetailList.purchaseType === 'invited_bidding')) {
                      callback(
                        new Error(
                          intl
                            .get('bid.bidcommon.view.message.bunengshibenren')
                            .d('评委不能是本人')
                        )
                      );
                    } else {
                      callback()
                    }
                  }
                }
              ],
            })(
              <Lov
                disabled={distribution != 'No'}
                style={{ width: '120px' }}
                code="BID.JUDGESNEW"
                queryParams={{ tenantId }}
                // textField={record.name}
                textValue={record.name}
                onChange={(text, item) => {
                  const { loginName } = getCurrentUser()
                  this.handleChange(item, record)
                  if (loginName === item.employeeNum && checkSwitch && (getDetailList.purchaseType === 'public_bidding' || getDetailList.purchaseType === 'invited_bidding')) {
                    record.name = '';
                    record.userId = '';
                    record.department = '';
                    record.mobile = '';
                    record.email = '';
                    record.twoUnitName = '';
                  } else {
                    record.name = item.name;
                    record.userId = item.employeeId;
                    record.department = item.unitName;
                    record.mobile = item.mobile;
                    record.email = item.email;
                    record.twoUnitName = item.twoUnitName;
                  }
                  this.props.isTrue()
                }}
              />
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`bid.bidcommon.view.title.judgedevision`).d('评委所在部'),
        dataIndex: 'twoUnitName',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.department`).d('评委所在部门'),
        dataIndex: 'department',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.telephone`).d('电话'),
        dataIndex: 'mobile',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mail`).d('邮箱'),
        dataIndex: 'email',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, record) => (
          <Tooltip placement="topLeft" title={record.email}>
            <span>{record.email}</span>
          </Tooltip>
        )
      },
      {
        title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
        dataIndex: 'effectState',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 120,
        render: (text, record, index) => (
          <Form.Item>
            {record.$form.getFieldDecorator('effectState', {
              initialValue: `${record.effectState}`,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('bid.biddashbord.model.title.status').d('状态'),
                  }),
                },
              ],
            })(
              <Select allowClear style={{ minWidth: 100 }} disabled={distribution != 'No'}
                placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                onChange={(text, item) => {this.changeState(item, record, index)
                  this.props.isTrue()
                }}
              >
                {judgesState.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )
      },
      !disabled && {
        title: intl.get(`bid.bidcommon.bid.title.Statusofreadingjudgesrules`).d('阅读评委守则状态'),
        dataIndex: 'judgesRuleState',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, row, val) => {
          if (row.$form != undefined) {
            if (row.judgesRuleState === 0) {
              return (
                <span>{intl.get(`bid.bidcommon.view.title.unread`).d('未阅读')}</span>
              )
            } else {
              if (row.Status === 0) {
                return (
                  <span>{intl.get(`bid.bidcommon.view.title.unread`).d('未阅读')}</span>
                )
              } else if (row.Status === 1) {
                return (
                  <span>{intl.get(`bid.bidcommon.view.title.readandcomfirmed`).d('已阅读并确认')}</span>
                )
              } else if (row.Status === 2) {
                return (
                  <span>{intl.get(`bid.bidcommon.view.title.readbutuncomfirmed`).d('已阅读未确认')}</span>
                )
              }
            }
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (text, row) => {
          if (row.$form !== undefined) {
            return (
              <Form.Item>
                {row.$form.getFieldDecorator('remark', {
                  initialValue: row.remark,
                  rules: [
                    {
                      required: row.remarkReq, // 当已保存可以不校验必填
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
                      }),
                    }
                  ]
                })(
                  <Input
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                    onChange={() => {row.remark = row.$form.getFieldValue('remark')
                    this.props.isTrue()
                  }} />
                )}
              </Form.Item>
            );
          }
        }
      }
    ].filter(Boolean);
    const listProps = {
      dataSource: newDataList,
      columns,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
      },
      pagination: judgesPagination,
      selectedRows,
      selectedRowKeys,
      rowKey: 'poOrderId',
      // loading: fetchSourceList,
      onChange: (page) => this.handlePageChange(page), // 分页查询
      handleDataChange: this.handleDataChange,
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content style={{ padding: '0' }}>
          <div style={{margin: '-16px', marginBottom: '16px'}}>
            <PageMessage>
              <TopInfoMsg />
            </PageMessage>
          </div>
          <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-5px' }}>
            <Col style={{ width: '50%', textAlign: 'left' }}>
              <div className={styles['spo-basic-style']}>
                <Form.Item label={intl.get(`bid.bidcommon.view.title.expertstaffamount`).d('项目评委人数')}
                  style={{ display: 'flex' }}>
                  {form.getFieldDecorator('judgesPeoNum', {
                    initialValue: judgesCount === 0 ? intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择') : judgesCount,
                    rules: [
                      {
                        required: false
                      },
                    ],
                  })(
                    <Select allowClear style={{ width: 150 }} disabled={distribution != 'No'}
                      // placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                      onChange={this.changePeopleNum} >
                      {judgesNums.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </div>
            </Col>
            <Col span={24} className="customize-buttons" style={{ width: '50%' }} >
              <ExcelExport
                requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-pro-judgess/exportProInfo?proId=${matchs.params.proId}&language=Zh_CN`}
                // queryParams={this.fileList()}
                downloadType="Blob"
                fileName={intl
                  .get(`bid.bidcommon.view.title.expertsetting`)
                  .d('评委组设置')}
                otherButtonProps={{
                  icon: null,
                }}
                buttonText={
                  <>
                    <img src={exportIcon} alt="" />
                    {intl.get(`bid.bidcommon.view.button.export`).d('导出')}
                  </>
                }
              />
              <Button
                onClick={this.handleDelete}
                loading={deleteLinesLoading}
                disabled={distribution != 'No'}
              >
                <img src={deleteIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.delete`).d('删除')}
              </Button>
              <Button onClick={() => this.handleAdd(false)}
                // Number(judgesDataSource.length - stateNum) < judgesPeoNum || 
                disabled={!canAdd ? false : true}>
                <img src={addIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
              </Button>
              <Button onClick={this.handleSave} disabled={distribution != 'No'} loading={saveLoading}>
                <img src={saveIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
              </Button>
            </Col>
          </Row>
          <EditTable bordered {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
