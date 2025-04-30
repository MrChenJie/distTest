/*
 * ui 修改
 * @date: 2023-08-04
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import CusLov from '_cus_components/CusLov';
import CusModal from '_cus_components/CusModal';
import { sum } from 'lodash';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Content } from 'components/Page';
import { getEditTableData, getCurrentUser, getCurrentLanguage } from 'utils/utils';
import { getCurrentOrganizationId, createPagination } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import CusExcelExport from '_cus_components/CusExcelExport';
import { SRM_BID } from '@/common/config';
import uuidv4 from 'uuid/v4';
import styles from './index.less';
import { split } from 'lodash';
import CusNotification from '_cus_components/CusNotification';
import PageMessage from '_cus_components/Page/PageMessage';
import TopInfoMsg from './TopInfoMsg';
import eventBus from '@/routes/components/ev';
import CusInputNumber from '_cus_components/CusInputNumber';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  fetchSourceList: loading.effects['contractMaintain/getJudgesTableList'],
  saveLoading: loading.effects['contractMaintain/setJudgesSave'], // 保存
  sendDealLoading: loading.effects['contractMaintain/setJudgesSendDeal'], // 发送通知
  contractMaintain,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'HKPC.commom'],
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
      checkSend: false,
    };
  }

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchCheckSwitch();
    this.fetchCheckSend();
    eventBus.on('saveJudge', this.handleSave);
  }

  componentWillUnmount() {
    eventBus.off('saveJudge', this.handleSave);
  }

  // 查询当前项目下的里程碑阶段（技术及商务文件递交）是否已完成
  @Bind()
  fetchCheckSend() {
    const { dispatch, matchs } = this.props;
    const { proId } = matchs.params;
    dispatch({
      type: 'contractMaintain/getCheckSend',
      payload: {
        proId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          checkSend: res?.isCompleted,
        });
      }
    });
  }

  // 查询 灰度测试开关已开启，并且当前登陆人在灰度测试采购名单中
  @Bind()
  fetchCheckSwitch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getCheckSwitch',
      payload: {},
    }).then((res) => {
      if (res) {
        this.setState({
          checkSwitch: res.message === 'NO',
        });
      }
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   * isAdd - 是否时添加功能
   */
  @Bind()
  fetchList(page = {}, isAdd) {
    const { dispatch, matchs } = this.props;
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
        const pagination = createPagination(res.page);
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
        });
        if (isAdd === undefined) {
          // 正常查询
          this.setState({ newDataList: newDataSource });
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
        });
        if (isAdd) {
          // if (res.state === 'YES') {
          this.addJudges();
          // } else {
          //   CusNotification.error({
          //     message: intl
          //       .get(`bid.bidcommon.view.message.addexpertsremind`)
          //       .d('请在截标前两天添加评委！')
          //   })
          // }
        } else {
          const pagination = createPagination(res.page);
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
    });
    this.setState({
      acceptNum: num,
      stateNum: Number(newDataList.length - num),
      judgesPeoNum: e,
    });
    if (num < Number(e)) {
      this.setState({ canAdd: false });
    } else {
      this.setState({ canAdd: true });
    }
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag();
  }

  // 新建-添加行
  @Bind
  handleAdd(isAdd) {
    const { pagination } = this.props;
    !isAdd && this.fetchList(pagination, true);
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag();
  }

  @Bind
  @Debounce(200)
  addJudges() {
    const { matchs, contractMaintain } = this.props;
    const { judgesDataSource = [] } = contractMaintain;
    const { judgesPeoNum, judgesCount, newDataList } = this.state;
    if (judgesPeoNum > 0 || judgesCount > 0) {
      const newData = {
        effectState: 'Participate', // 默认参与
        judgesRuleState: 0, // 1：已读已提交 ， 0：未读 ，2：已读未提交
        judgesType: '',
        department: '',
        mobile: '',
        email: '',
        remark: '',
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
      });
      // 当分离(参与)人数小于选择人数，更新添加状态
      if (num < (Number(judgesPeoNum) || judgesCount)) {
        this.setState({ canAdd: false });
      } else {
        this.setState({ canAdd: true });
      }
      this.props.isTrue();
      this.setState({ groupUnsaveFlag: true });
    } else {
      CusNotification.error({
        message: intl.get(`bid.bidcommon.view.message.xianselectpwno`).d('请先选择评委人数'),
      });
    }
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag();
  }

  @Debounce(300, { leading: true })
  @Bind()
  handleSave(callback) {
    const {
      dispatch,
      matchs,
      contractMaintain: { judgesDataSource },
      activeKey,
    } = this.props;
    const { judgesCount, judgesPeoNum, newDataList, saveList } = this.state;
    if (judgesPeoNum === 0 && judgesCount === 0) {
      CusNotification.error({
        message: intl.get(`bid.bidcommon.view.message.xianselectpwno`).d('请先选择评委人数'),
      });
    } else {
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
      });
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
        newData[i].proId = matchs.params.proId;
        newData[i].judgesSetCount = Number(judgesPeoNum) || judgesCount;
      }

      let data = newData.sort(); // 正序保存
      if (data.length > 0) {
        if (messageRepeatFlag) {
          CusNotification.error({
            message: intl.get(`bid.bidcommon.view.message.noxiangtongren`).d('不能有相同评委'),
          });
          if (activeKey == 'setJudgesTable') eventBus.emit('callback', 'setJudgesTable', true);
        } else {
          if ((Number(judgesPeoNum) || judgesCount) === newStateNum) {
            this.setState({ canAdd: true });
            dispatch({
              type: 'contractMaintain/setJudgesSave',
              payload: {
                data: [...data],
              },
            }).then((res) => {
              if (res) {
                if (res.failed) {
                  const messageOne =
                    getCurrentLanguage() === 'zh_CN'
                      ? split(res?.message, '#')[0]
                      : split(res?.message, '#')[0];
                  const messageTwo =
                    getCurrentLanguage() === 'zh_CN'
                      ? split(res?.message, '#')[1]
                      : split(res?.message, '#')[1];
                  return CusNotification.error({
                    message: (
                      <>
                        <div>{messageOne}</div>
                        <div style={{ marginTop: '10px' }}>{messageTwo}</div>
                      </>
                    ),
                    duration: null,
                  });
                } else {
                  if (typeof callback === 'function') {
                    callback();
                  } else if (res) {
                    this.fetchList();
                    this.setState({ saveList: data });
                    CusNotification.success({
                      message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                    });
                    this.props.isFalse();
                  }
                }
              }
            });
          } else {
            CusNotification.error({
              message: intl
                .get(`bid.bidcommon.view.message.renshuyizhi`)
                .d('参与人数需与评委人数一致'),
            });
            if (activeKey == 'setJudgesTable') eventBus.emit('callback', 'setJudgesTable', true);
          }
        }
      } else {
        CusNotification.error({
          message: intl.get(`bid.bidcommon.view.message.pleasecheckitem`).d('请检查必填项并保存!'),
        });
        if (activeKey == 'setJudgesTable') eventBus.emit('callback', 'setJudgesTable', true);
      }
    }
  }

  // 删除
  @Bind
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows, selectedRowKeys, judgesCount, judgesPeoNum, newDataList } = this.state;
    // 删除前校验人数是否一致，一致则不允许删除
    let num = 0; // 当前参与评委人数
    newDataList.map((k) => {
      if (k.effectState === 'Participate') {
        num += 1;
      }
    });
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
    });
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      // if ((Number(judgesPeoNum) || judgesCount) === num && ((creatNum === 0 && isSave > 0) || isQuit === 0)) {
      if ((Number(judgesPeoNum) || judgesCount) === num && isSave > 0) {
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.message.rensamenoshan`)
            .d('当前评委人数一致，已不可删除'),
        });
      } else if (
        ((Number(judgesPeoNum) || judgesCount) === num && isQuit > 0) || // 人数一致，有放弃人数，且有新建人数 允许删除
        creatNum > 0
      ) {
        CusModal.confirm({
          content: intl.get(`hzero.common.message.confirm.remove`).d('是否确认删除'),
          okType: 'normal',
          onOk: () => {
            let deleteNewDataList = [];
            for (let i in selectedRows) {
              if (selectedRows[i]._status === 'update') {
                selectedRows.map((item, i) => {
                  newDataList.map((ite, j) => {
                    if (item.poOrderId === ite.poOrderId && item._status === 'update') {
                      deleteNewDataList.push(ite);
                      newDataList.splice(j, 1);
                    }
                  });
                });
                this.setState({ newDataList: [...newDataList] });
              } else {
                // 删除本地数据
                selectedRows.map((item, i) => {
                  newDataList.map((ite, j) => {
                    if (item.poOrderId === ite.poOrderId && item._status === 'create') {
                      newDataList.splice(j, 1);
                    }
                  });
                });
                this.setState({
                  selectedRows: [],
                  selectedRowKeys: [],
                  newDataList: [...newDataList],
                });
              }
            }
            if (deleteNewDataList.length > 0) {
              dispatch({
                type: 'contractMaintain/deleteJudgesTableList',
                payload: {
                  data: [...data],
                },
              }).then((res) => {
                // CusNotification.success();
              });
            }
            CusNotification.success();
            let num = 0;
            // 循环查询同意人数
            for (let i in newDataList) {
              if (newDataList[i].effectState === 'Participate') {
                num += 1;
              }
            }
            if (num < judgesPeoNum) {
              this.setState({ canAdd: false });
            } else {
              this.setState({ canAdd: true });
            }
          },
        });
      } else {
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.message.rensamenoshan`)
            .d('当前评委人数一致，已不可删除'),
        });
      }
    } else {
      CusNotification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  // 更改评委类型
  // @Bind
  // changeJudgesType(item, record) {
  //   const { form } = this.props
  //   if (item === undefined) {
  //     record.judgesType = ''
  //   } else {
  //     form.setFieldsValue({ judgesType: item.value })
  //   }
  //   if (record._status === 'update') {
  //     if (item && item.value !== record.judgesType) {
  //       record.remarkReq = true
  //     }
  //   }
  // }

  // 更新评委状态
  @Bind
  changeState(item, record, index) {
    const {
      form,
      contractMaintain: { judgesDataSource },
    } = this.props;
    const { acceptNum, stateNum, newDataList, judgesPeoNum, judgesCount } = this.state;
    if (item === undefined) {
      record.effectState = '';
    } else {
      form.setFieldsValue({ effectState: item.value });
    }
    // 当选择放弃状态时，允许添加，更新参与人数去更新添加状态
    // if (record.effectState !== 'Participate') {
    //   newDataList[index].effectState = 'Quit';
    //   this.setState({ stateNum: Number(judgesDataSource.length - acceptNum) })
    // } else if (record.effectState !== 'Quit') {
    //   newDataList[index].effectState = 'Participate'
    // };
    if (item && item.value !== record.effectState) {
      record.effectState = item.value;
    }
    // 判断保存后是否有修改，有就校验备注必填
    if (record._status === 'update') {
      if (item && item.value === record.effectState) {
        record.remarkReq = true;
      }
    }
    let num = 0;
    newDataList.map((k) => {
      if (k.effectState === 'Participate') {
        num += 1;
      }
    });
    if (num < (Number(judgesPeoNum) || judgesCount)) {
      this.setState({ canAdd: false });
    } else {
      this.setState({ canAdd: true });
    }
  }

  @Bind
  handleChange(item, record) {
    if (record._status === 'update') {
      if (item.employeeAssignId !== record.employeeAssignId) {
        record.remarkReq = true;
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
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag();
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page) {
    const { groupUnsaveFlag } = this.state;
    if (groupUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
        onOk: () => {
          this.fetchList(page);
        },
      });
    } else {
      this.fetchList(page);
    }
  }

  // 发送评委待办通知
  handleSend = () => {
    const { dispatch, match } = this.props;
    const { judgesCount, judgesPeoNum, newDataList } = this.state;
    if (judgesPeoNum === 0 && judgesCount === 0) {
      CusNotification.error({
        message: intl.get(`bid.bidcommon.view.message.xianselectpwno`).d('请先选择评委人数'),
      });
    } else {
      const data = getEditTableData(newDataList).map((item) =>
        item._status === 'create'
          ? {
              ...item,
              poOrderId: undefined,
            }
          : item
      );
      for (let i = 0; i < data.length; i++) {
        data[i].proId = match.params.proId;
        data[i].judgesSetCount = Number(judgesPeoNum) || judgesCount;
      }
      if (data.length > 0) {
        this.handleSave(() => {
          dispatch({
            type: 'contractMaintain/setJudgesSendDeal',
            payload: {
              data: [...data],
            },
          }).then((res) => {
            if (res) {
              CusNotification.success();
            }
          });
        });
      }
    }
  };

  render() {
    const { loginName } = getCurrentUser();
    const {
      matchs,
      saveLoading = false,
      fetchSourceList = false,
      contractMaintain,
      deleteLinesLoading = false,
      form = {},
      detailEnumMap = {},
      disabled,
      getDetailList,
      sendDealLoading = false,
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
      judgesPeoNum,
      checkSend,
    } = this.state;
    console.log('checkSend', checkSend);
    console.log('disabled', disabled);
    console.log('flag', getDetailList?.proState !== 'completed');
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 125,
        editable: true,
        fixed: 'left',
        dataIndex: 'orderSeq',
        render: (val, row, index) => {
          return <div style={{ textAlign: 'center' }}>{index + 1}</div>;
        },
      },
      // {
      //   title: intl.get(`bid.bidcommon.view.title.experttype`).d('评委类型'),
      //   dataIndex: 'judgesType',
      //   required: true,
      //   width: getCurrentLanguage() === 'zh_CN'? 140 : 185,
      //   render: (text, record) => (
      //     <Form.Item>
      //       {record.$form.getFieldDecorator('judgesType', {
      //         initialValue: `${record.judgesType}`,
      //         rules: [
      //           {
      //             required: true,
      //             message: intl.get('hzero.common.validation.notNull', {
      //               name: intl.get('bid.bidcommon.view.title.experttype').d('评委类型'),
      //             }),
      //           }
      //         ],
      //       })(
      //         <CusSelect
      //           allowClear
      //           disabled={distribution != 'No'}
      //           options={judgesType}
      //           onChange={(text, item) => {
      //             this.changeJudgesType(item, record)
      //             this.props.isTrue()
      //           }} >
      //         </CusSelect>
      //       )}
      //     </Form.Item>
      //   )
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.expertname`).d('评委姓名'),
        dataIndex: 'name',
        required: true,
        width: 200,
        render: (text, record, index) =>
          ['completed', 'closed'].includes(getDetailList?.proState) ||
          (this.props.getDetailList.proState === 'in_process' &&
            this.props.getDetailList.purchasingEmpNum !== loginName &&
            this.props.getDetailList.transferorEmpNum !== loginName) ? (
            <div>{record.name}</div>
          ) : (
            <Form.Item>
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
                      if (
                        value === loginName &&
                        checkSwitch &&
                        (getDetailList.purchaseType === 'public_bidding' ||
                          getDetailList.purchaseType === 'invited_bidding')
                      ) {
                        callback(
                          new Error(
                            intl
                              .get('bid.bidcommon.view.message.bunengshibenren')
                              .d('评委不能是本人')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <CusLov
                  disabled={distribution != 'No'}
                  code="BID.JUDGESNEW"
                  queryParams={{ tenantId }}
                  textValue={record.name}
                  onChange={(text, item) => {
                    const { loginName } = getCurrentUser();
                    this.handleChange(item, record);
                    if (
                      loginName === item.employeeNum &&
                      checkSwitch &&
                      (getDetailList.purchaseType === 'public_bidding' ||
                        getDetailList.purchaseType === 'invited_bidding')
                    ) {
                      record.name = '';
                      record.userId = '';
                      record.department = '';
                      record.positionName = '';
                      record.mobile = '';
                      record.email = '';
                      record.twoUnitName = '';
                      record.employeeAssignId = '';
                      CusNotification.error({
                        message: intl
                        .get('bid.bidcommon.view.message.bunengshibenren')
                        .d('评委不能是本人')
                      })
                    } else {
                      record.name = item.name;
                      record.userId = item.employeeId;
                      record.department = item.unitName;
                      record.positionName = item.positionName;
                      record.mobile = item.mobile;
                      record.email = item.email;
                      record.twoUnitName = item.twoUnitName;
                      record.employeeAssignId = item.employeeAssignId;
                    }
                    this.props.isTrue();
                  }}
                />
              )}
            </Form.Item>
          ),
      },
      // {
      //   title: intl.get(`bid.bidcommon.view.title.judgedevision`).d('评委所在部'),
      //   dataIndex: 'twoUnitName',
      //   required: true,
      //   width: 150,
      //   render: tooltipRender,
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.department`).d('评委所在部门'),
        dataIndex: 'department',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.judgementposition`).d('评委职位'),
        dataIndex: 'positionName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.telephone`).d('电话'),
        dataIndex: 'mobile',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.mail`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
        dataIndex: 'effectState',
        required: true,
        width: getCurrentLanguage() === 'zh_CN' ? 110 : 150,
        render: (text, record, index) =>
          ['completed', 'closed'].includes(getDetailList?.proState) ||
          (this.props.getDetailList.proState === 'in_process' &&
            this.props.getDetailList.purchasingEmpNum !== loginName &&
            this.props.getDetailList.transferorEmpNum !== loginName) ? (
            <div>{record.effectStateMeaning}</div>
          ) : (
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
                <CusSelect
                  allowClear
                  disabled={distribution != 'No'}
                  options={judgesState}
                  onChange={(text, item) => {
                    this.changeState(item, record, index);
                    this.props.isTrue();
                  }}
                ></CusSelect>
              )}
            </Form.Item>
          ),
      },
      // !disabled && {
      //   title: intl.get(`bid.bidcommon.bid.title.Statusofreadingjudgesrules`).d('阅读评委守则状态'),
      //   dataIndex: 'judgesRuleState',
      //   required: true,
      //   width: 150,
      //   render: (text, row, val) => {
      //     if (row.$form != undefined) {
      //       if (row.judgesRuleState === 0) {
      //         return (
      //           <span>{intl.get(`bid.bidcommon.view.title.unread`).d('未阅读')}</span>
      //         )
      //       } else {
      //         if (row.Status === 0) {
      //           return (
      //             <span>{intl.get(`bid.bidcommon.view.title.unread`).d('未阅读')}</span>
      //           )
      //         } else if (row.Status === 1) {
      //           return (
      //             <span>{intl.get(`bid.bidcommon.view.title.readandcomfirmed`).d('已阅读并确认')}</span>
      //           )
      //         } else if (row.Status === 2) {
      //           return (
      //             <span>{intl.get(`bid.bidcommon.view.title.readbutuncomfirmed`).d('已阅读未确认')}</span>
      //           )
      //         }
      //       }
      //     }
      //   }
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (text, row) => {
          if (row.$form !== undefined) {
            return ['completed', 'closed'].includes(getDetailList?.proState) ||
              (this.props.getDetailList.proState === 'in_process' &&
                this.props.getDetailList.purchasingEmpNum !== loginName &&
                this.props.getDetailList.transferorEmpNum !== loginName) ? (
              <div>{row.remark}</div>
            ) : (
              <Form.Item>
                {row.$form.getFieldDecorator('remark', {
                  initialValue: row.remark,
                  rules: [
                    {
                      required: row.remarkReq, // 当已保存可以不校验必填
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    autoChangeSize={true}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                    onChange={() => {
                      row.remark = row.$form.getFieldValue('remark');
                      this.props.isTrue();
                    }}
                  />
                )}
              </Form.Item>
            );
          }
        },
      },
    ].filter(Boolean);
    const listProps = {
      dataSource: newDataList,
      columns,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
        getCheckboxProps: (record) => ({
          disabled:
            ['completed', 'closed'].includes(getDetailList?.proState) ||
            (this.props.getDetailList.proState === 'in_process' &&
              this.props.getDetailList.purchasingEmpNum !== loginName &&
              this.props.getDetailList.transferorEmpNum !== loginName),
        }),
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
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) };
    return (
      <CusSpin spinning={fetchSourceList || saveLoading}>
        {/* <div style={{margin: '-16px', marginBottom: '16px'}}>
          <PageMessage>
            <TopInfoMsg />
          </PageMessage>
        </div> */}
        <div>
          {(getDetailList?.isOpen === 'y' || !['public_bidding', 'invited_bidding'].includes(getDetailList.purchaseType)) && <Form className="customize-form">
            <div
              className="formItemLabel"
              style={{
                display: 'flex',
                float: 'right',
              }}
            >
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.expertstaffamount`).d('项目评委人数')}
              >
                {form.getFieldDecorator('judgesPeoNum', {
                  initialValue: judgesCount === 0 ? null : judgesCount,
                })(
                  // <CusSelect
                  //   disabled={distribution != 'No'}
                  //   style={{ width: '100%' }}
                  //   options={judgesNums}
                  //   placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                  //   onChange={this.changePeopleNum} >
                  // </CusSelect>
                  <CusInputNumber
                    disabled={
                      ['completed', 'closed'].includes(getDetailList?.proState) ||
                      (this.props.getDetailList.proState === 'in_process' &&
                        this.props.getDetailList.purchasingEmpNum !== loginName &&
                        this.props.getDetailList.transferorEmpNum !== loginName)
                    }
                    min={0}
                    className="cus-input-money"
                    style={{ width: '100%' }}
                    onChange={this.changePeopleNum}
                  />
                )}
              </Form.Item>

              <CusExcelExport
                requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-pro-judgess/exportProInfo?proId=${
                  matchs.params.proId
                }&language=Zh_CN`}
                downloadType="Blob"
                fileName={intl.get(`bid.bidcommon.view.title.expertsetting`).d('评委组设置')}
                otherButtonProps={{
                  icon: null,
                  mini: true,
                }}
                buttonText={<>{intl.get(`bid.bidcommon.view.button.export`).d('导出')}</>}
              />
              {!(distribution != 'No' || selectedRows.length == 0) && (
                <CusButton
                  onClick={this.handleDelete}
                  loading={deleteLinesLoading}
                  mini
                  disabled={distribution != 'No' || selectedRows.length == 0}
                >
                  {intl.get(`bid.bidcommon.view.button.delete`).d('删除')}
                </CusButton>
              )}
              {!canAdd && (
                <CusButton
                  onClick={() => this.handleAdd(false)}
                  mini
                  disabled={!canAdd ? false : true}
                >
                  {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
                </CusButton>
              )}
              {disabled &&
                !(['completed', 'closed'].includes(getDetailList?.proState)) &&
                !(
                  this.props.getDetailList.proState === 'in_process' &&
                  this.props.getDetailList.purchasingEmpNum !== loginName &&
                  this.props.getDetailList.transferorEmpNum !== loginName
                ) && (
                  <CusButton
                    onClick={this.handleSave}
                    disabled={distribution != 'No'}
                    mini
                    loading={saveLoading}
                  >
                    {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
                  </CusButton>
                )}
              {disabled &&
                checkSend &&
                !(['completed', 'closed'].includes(getDetailList?.proState)) &&
                !(
                  this.props.getDetailList.proState === 'in_process' &&
                  this.props.getDetailList.purchasingEmpNum !== loginName &&
                  this.props.getDetailList.transferorEmpNum !== loginName
                ) && (
                  <CusButton
                    type="primary"
                    onClick={this.handleSend}
                    mini
                    loading={sendDealLoading}
                  >
                    {intl.get(`bid.bidcommon.view.button.SeNo`).d('发送通知')}
                  </CusButton>
                )}
            </div>
          </Form>}
          <div style={{ marginTop: '16px' }}>
            <EditTable {...listProps} />
          </div>
        </div>
      </CusSpin>
    );
  }
}
