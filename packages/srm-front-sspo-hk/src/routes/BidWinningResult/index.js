/**
 * index.js - 中标结果提交审批
 * @date: 2022-04-20
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Select, Row, Col, Input, Form, Avatar, Card, LocaleProvider } from 'hzero-ui';
import { Modal, Tooltip } from 'choerodon-ui/pro';
import EditTable from 'components/EditTable';
import StaticTextEditor from './StaticTextEditor';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import uuid from 'uuid/v4';
import { isUndefined } from 'lodash';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, getCurrentLanguage, createPagination, getEditTableData } from 'utils/utils';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import btnTracking from '@/assets/approval/(签收历史）Tracking.png';
import btnSubmit from '@/assets/approval/(办理or提交）btn_submit.png';
// import btnDel from '@/assets/approval/（删除）btn_doDelete.png';
import btnForward from '@/assets/approval/（知会）btn_forward.png';
import btnForward2 from '@/assets/approval/（会签）btn_forward2.png';
import btnFlowChart from '@/assets/approval/（流程图）FlowChart.png';
import btnApprovalHistory from '@/assets/approval/（审批状态）ApprovalHistory.png';
import btnForwardback3 from '@/assets/approval/（转办）btn_forwardback3.png';
import styles from './index.less';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import CusNotification from '_cus_components/CusNotification';
import { closeWindow } from '_cus_utils/utils';

let newTableSource = [];
@connect(({ loading = {}, contractBidWinningResult = {}, purchaseOrder = {} }) => ({
  fetchEnumLoading: loading.effects['contractBidWinningResult/fetchEnum'],
  saveInfoLoading: loading.effects['contractBidWinningResult/saveInfo'],
  savePoInfoLoading: loading.effects['purchaseOrder/savePoInfo'],
  submitPoLoading: loading.effects['purchaseOrder/submitPo'],
  featchLoading: loading.effects['contractBidWinningResult/getTableInfo'],
  contractBidWinningResult,
  purchaseOrder,
}))
@formatterCollections({
  code: ['bid.bidcommon']
})
@Form.create({ fieldNameProp: null })

export default class BidWinningResult extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    this.staticTextEditor = React.createRef();
    this.state = {
      emailModel: false,
      tenantId: getCurrentOrganizationId(),
      decisionBox: false,
      requestId: '',
      newBasicsInfo: [], // mip保存传的数据
      poHeadersId: match.params,
      finallyIsView: false, // 是否显示mip按钮
      approvalRequestButtonVOList: [], // 接收按钮信息
      saveModal: false,
      costRequestId: match.params.proId,
      isDisabled: false,
      editorKey: uuid(),
      content: '', // 编辑器内容
      prevContent: '', // 保存用来比较编辑内容是否改变
      applyForState: '',
      groupUnsaveFlag: false,
      number: 0, // 相同供应商数量
    };
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.fetchBasicInfo();
    this.showDecision();
    this.getTableInfo();
    // 该方法是用于 goToClose 页面调用的，用于关闭modal框的方法
    window.addEventListener('message', this.receiveMessage, false);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/updateState',
      payload: {
        poHeader: {}, // 头信息
      },
    });
    window.addEventListener('message', this.receiveMessage, false);
  }

  @Bind
  getDerivedStateFromProps() {
    const { content, prevContent } = this.state;
    if (content !== prevContent) {
      this.setState({
        editorKey: uuid(),
        content: content || '',
        prevContent: content || '',
      })
    }
  }

  /**
   * 基本信息查询
  */
  @Bind
  fetchBasicInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getBasicInfo',
      payload: {
        proId: match.params.proId
      }
    }).then((res) => {
      if (res) {
        this.setState({ requestId: res.requestId, applyForState: res.applyForState });
        // 待审核和审批通过状态禁止编辑
        if (res.applyForState === 'PENDING_APPROVAL' || res.applyForState === 'APPROVED') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
        if (res.requestId) {
          this.setState({ finallyIsView: true, isDisabled: false })
          this.showDecision();
          this.approvalProcess(res.requestId)
        }
      }
    })
  }

  /**
   * 表查询
  */
  @Debounce(200)
  @Bind
  getTableInfo(page = {}) {
    const { dispatch, match } = this.props;
    const { requestId } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getTableInfo',
      payload: {
        page,
        proId: match.params.proId,
        state: 1, //0 表示不需要供应商编码  1 表示需要
      }
    }).then(res => {
      if (res && res.content) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
        }));
        dispatch({
          type: 'contractBidWinningResult/updateState',
          payload: {
            tableSource: newDataSource,
            tablePagination: pagination,
          },
        });
        // let isRequestid = '';
        // for (let i = 0; i < res.content.length; i++) {
        //   isRequestid = res.content[i].requestId
        // }
        if (requestId) {
          // this.setState({finallyIsView: true})
          this.approvalProcess(requestId)
        } else {
          this.setState({ isDisabled: true })
        }
        this.setState({ groupUnsaveFlag: false })
      }
    });
  }

  /**
   * 查询值集
   */
  @Bind
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/init',
    });
  }

  // 打开结果查看的邮件预览弹框
  @Bind
  previewEmail(record) {
    // const { isDisabled } = this.state;
    if (record.isBeChosen && record.isBeChosen.length > 0) {
      this.getTableEmailInfo(record)
    }
  }

  /**
   * 邮件模板的预览
  */
  @Bind
  getTableEmailInfo(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractBidWinningResult/getTableEmailInfo',
      payload: {
        supplierId: record.supplierId,
        isBeChosen: record.isBeChosen,
      }
    }).then((res) => {
      if (res) {
        this.setState({
          emailModel: true,
        })
      }
    })
  }

  @Bind
  changeChosen(value, lovRecord, record, index) {
    const { contractBidWinningResult: { infoSource, tableSource } } = this.props;
    if (record.$form != undefined && value !== undefined) {
      record.$form.setFieldsValue(
        record.isBeChosen = lovRecord.props.value, // 'YES','NO'
      );
      if (lovRecord.props.value === 'YES') {
        this.setState(() => {
            tableSource[index].$form.validateFields(['supplierNum'], { force: true })
          },
        )
        if (record.promptContent) {
          CusNotification.warning({ message: record.promptContent, closable: false });
        }
      } else {
        // tableSource[index].$form.resetFields('supplierNum');
        let num = 0;
        record.supplierNum = '';
        record.supplierNumName = '';
        tableSource.map((it) => {
          if (it.supplierNum === record.companyNum) {
            num += 1;
          }
        })
        this.setState({ number: num })
        // this.setState(() => {
        //   tableSource[index].$form.validateFields(['supplierNum'], { force: false })
        //   },
        // )
      }
    } else {
      if (value === 'result') {
        record.setFieldsValue(
          infoSource.informRejectResult = lovRecord.props.value,
        );
      }
      if (value === 'state') {
        record.setFieldsValue(
          infoSource.applyForState = lovRecord.props.value,
        );
      }
      // 处理清空选择框的值
      if (value === undefined) {
        record.isBeChosen = '';
      }
    }
  }

  @Bind()
  handleOk() {
    this.setState({
      emailModel: false,
    })
  }
  @Bind()
  handleCancel() {
    this.setState({
      emailModel: false,
    })
  }

  @Bind()
  onEditChange(val) {
    this.setState({ content: val })
  }

  // 保存
  @Bind()
  @Debounce(200)
  goSave(record) {
    const { dispatch, match, contractBidWinningResult: { infoSource, tableSource } } = this.props;
    const { content, number } = this.state;
    if (number > 1) {
      notification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    } else {
      let basicsInfo = {};
      let bidSuppliers = [];
      basicsInfo.proId = match.params.proId;
      for (let i = 0; i < tableSource.length; i++) {
        bidSuppliers.push(
          {
            id: tableSource[i].supplierId,
            supplierNum: tableSource[i].supplierNum, //供应商编号
            supplierNumName: tableSource[i].supplierNumName,
            supplierName: tableSource[i].supplierName,
            bidResult: tableSource[i].isBeChosen,
          }
        )
        if (tableSource[i].isBeChosen === 'YES') {
          this.setState(() => {
              tableSource[i].$form.validateFields(['supplierNumName'], { force: true })
            },
          )
        }
      }
      basicsInfo.decisionContent = content;
      basicsInfo.informRejectResult = infoSource.informRejectResult;
      // basicsInfo.applyForState = infoSource.applyForState;
      basicsInfo.bidSuppliers = bidSuppliers
      this.setState({ newBasicsInfo: basicsInfo })
      this.props.form.validateFieldsAndScroll((err, values) => {
        const newData = getEditTableData(tableSource).map((item) =>
          item
        );
        if (!err && newData.length > 0) {
          console.log('newData', newData)
          dispatch({
            type: 'contractBidWinningResult/saveInfo',
            payload: {
              basicsInfo
            }
          }).then((res) => {
            if (res) {
              notification.success({
                message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
              });
              // 显示决策内容
              this.showDecision()
              this.getTableInfo()
              this.setState({ requestId: res.requestId })
              record.applyForState = res.applyForState;
              if (res.requestId) {
                record.applyForState = res.applyForState;
                this.approvalProcess(res.requestId)
              }
            }
          });
        }
      })
    }
  }
  /**
   * 监听事件回调方法
   * @param param
   */
  @Bind
  receiveMessage(param) {
    const {
      data: { routerParam = {} },
    } = param;
    if (routerParam.opt === 'ok') {
      this.fetchBasicInfo();
      this.getTableInfo();
      this.showDecision();
      Modal.destroyAll();
      this.handleCloseModal();
    } else if (routerParam.opt === 'close') {
      this.fetchBasicInfo();
      this.getTableInfo();
      this.showDecision();
      Modal.destroyAll();
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      // 原意打算使用tab中的刷新，无奈改动太大，等后期有提出需求的时候再做变更
      window.location.reload();
    }
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCloseModal() {
    const { match, dispatch } = this.props;
    const flag = match.params.mipBack
    if (flag === 'mipBack') {
      dispatch(
        routerRedux.push({
          // 路由跳转
          pathname: `/pub/sspo/online-purchase/detail1/${match.params.proId}/proId`,
        })
      );
    } else {
      window.close();
      // 飞书提交审批后关闭tag页
      closeWindow();
    }
  }

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch } = this.props;
    const { applyForState } = this.state;
    dispatch({
      type: 'contractBidWinningResult/approvalProcess',
      payload: {
        requestId: getMipId,
        organizationId: getCurrentOrganizationId(),
      }
    }).then((res) => {
      if (res) {
        this.setState({
          approvalRequestButtonVOList: res.approvalRequestButtonVOList
        })
        // 待审核和审批通过状态禁止编辑
        if (applyForState === 'PENDING_APPROVAL' || applyForState === 'APPROVED') {
          this.setState({ isDisabled: false })
        } else {
          this.setState({ isDisabled: true })
        }
        this.setState({ finallyIsView: true })
        // 显示mip发起审批的按钮
        this.generateBtns()
      }
    })
  }

  // 保存后显示决策内容
  @Bind
  showDecision() {
    const { dispatch, match } = this.props;
    const { requestId } = this.state;
    dispatch({
      type: 'contractBidWinningResult/getDecision',
      payload: {
        proId: match.params.proId
      }
    }).then((res) => {
      if (res) {
        if (requestId) {
          this.approvalProcess(requestId)
        }
      }
      if (res.result != 'NO') {
        this.setState({
          content: res.content,
          decisionBox: true
        })
      } else {
        this.setState({
          content: res.content,
          decisionBox: false
        })
      }
      this.getDerivedStateFromProps()
    });
  }

  /**
   * 渲染审批按钮
   * @returns {unknown[]}
   */
  @Bind
  generateBtns() {
    const { approvalRequestButtonVOList } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    return approvalRequestButtonVOList && approvalRequestButtonVOList
      .sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      })
      .map((item) => {
        let src = btnTracking;
        switch (item.buttonKey) {
          case 'submitName':
            // 提交
            src = btnSubmit;
            break;
          // case 'DeleteBtn':
          //   // 注销流程
          //   src = btnDel;
          //   break;
          case 'LookView':
            // 流程图
            src = btnFlowChart;
            break;
          case 'forwardName':
            // 知会
            src = btnForward;
            break;
          case 'LookApproval':
            // 流程状态
            src = btnApprovalHistory;
            break;
          case 'takingopinionsName':
            // 会签
            src = btnForward2;
            break;
          case 'HandleForwardName':
            // 转办
            src = btnForwardback3;
            break;
          default:
            break;
        }
        if (
          item.buttonKey === 'submitName' ||
          item.buttonKey === 'takingopinionsName' ||
          item.buttonKey === 'forwardName' ||
          item.buttonKey === 'HandleForwardName' ||
          // item.buttonKey === 'DeleteBtn' ||
          item.buttonKey === 'LookApproval' ||
          item.buttonKey === 'LookView'
        ) {
          if (
            item.buttonKey === 'HandleForwardName' &&
            ['DRAFT', 'REVOKE', undefined].includes(status)
          ) {
            return null;
          }
          return (
            <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
              <div className='btn' onClick={() => this.openModal(item)}>
                <Avatar className='icon' src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className={styles.text}
                >
                  {isEn ? item.nameE : item.name}
                </p>
              </div>
            </Tooltip>
          );
          // }
        } else {
          if (item.buttonKey !== 'DeleteBtn') {
            return (
              <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
                <div className="btn" onClick={() => this.openModal(item)}>
                  <Avatar className="icon" src={src} />
                  <p
                    style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                    className="text"
                  >
                    {isEn ? item.nameE : item.name}
                  </p>
                </div>
              </Tooltip>
            );
          }
        }
      });
  }

  // 更换modalContainer的类名控制能否移动
  @Bind
  switchModalContainerClassName(flag) {
    if (flag) {
      const container = document.querySelector('.c7n-pro-modal-container');
      if (container) {
        container.className = styles['c7n-pro-modal-container-moveable'];
      }
    } else {
      const container = document.querySelector(`.${styles['c7n-pro-modal-container-moveable']}`);
      if (container) {
        container.className = 'c7n-pro-modal-container';
      }
    }
  }

  @Debounce(200)
  @Bind
  openModal(record) {
    const isEn = getCurrentLanguage() === 'en_US';
    Modal.open({
      key: Modal.key(),
      title: isEn ? record.nameE : record.name,
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      footer: null,
      style: {
        width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
        // height: `${record.buttonKey === 'DeleteBtn'}` ? '320px' : `${record.height + 40}px`,
        maxWidth: '90vw',
        overflow: 'hidden',
      },
      onClose: () => {
        this.switchModalContainerClassName();
      },
      children: (
        <iframe
          title="urlContent"
          src={record.url}
          frameBorder="0"
          // style={{ width: '100%', overflow: 'auto', height: record.buttonKey === 'DeleteBtn' ? '265px' : `${record.height - 15}px` }}
          style={{ width: '100%', overflow: 'auto', height: `${record.height - 15}px` }}
          marginWidth="1"
          marginHeight="1"
        />
      ),
    });
    this.switchModalContainerClassName(true);
  }

  /**
    * 按钮状态变更
    * @param {string} btn - 指示是哪个按钮
    */
  @Bind()
  getButtonStatus(btn = '') {
    const {
      purchaseOrder: {
        poHeader: { poStatus }, // 从model获取当前页面需要控制的按钮的状态
      },
    } = this.props;
    const obj = {
      // NEW 起草
      // COMMITED 已提交
      // CANCELED 已取消
      // APPROVED 审批通过
      // REJECTED 审批拒绝
      // CANCELING 取消中
      // 	APPROVING 审批中
      // TERMINATION 已终止
      // STARTCANCEL 发起取消/终止
      cancel: {
        NEW: false,
        COMMITED: false,
        APPROVED: false,
        REJECTED: false,
      },
      RDrafting: {
        COMMITED: false,
        APPROVED: false,
      },
      submit: {
        NEW: false,
        REJECTED: false,
      },
      submit1: {
        NEW: false,
      },
      save: {
        NEW: false,
        REJECTED: false,
        STARTCANCEL: false,
      },
      save1: {
        NEW: false,
        STARTCANCEL: false,
      },
      revoke: {
        STARTCANCEL: false,
      },
      return: {},
    };
    return isUndefined(obj[btn][poStatus]); // 获得该按钮在当前状态是否可编辑
  }

  @Bind
  changeSupplierNum(item, record, index) {
    const { form, contractBidWinningResult: { tableSource } } = this.props;
    let num = 0;
    form.setFieldsValue({ supplierNum: item.companyNum })
    form.setFieldsValue({ supplierNumName: item.companyName })
    // 选择供应商编码的时候校验该编码是否被选择过
    tableSource.map((it) => {
      if (it.supplierNum === item.companyNum) {
        num += 1;
      }
    })
    this.setState({ number: num })
    if (num > 1) {
      notification.error({ message: '一个供应商的编码只能绑定一个临时供应商' });
    }
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  @Bind
  handleDataChange() {
    this.setState({ groupUnsaveFlag: true })
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
          this.getTableInfo(page);
        },
      });
    } else {
      this.getTableInfo(page);
    }
  }

  render() {
    const {
      contractBidWinningResult,
      form = {},
      match,
      featchLoading = false,
      saveInfoLoading,
    } = this.props;
    const { infoSource = [], tableSource = [], tablePagination = {}, enumMap = {} } = contractBidWinningResult;
    const {
      tenantId,
      decisionBox,
      finallyIsView,
      emailModel,
      isDisabled,
    } = this.state;
    newTableSource = tableSource
    const { yesNo = [], status = [] } = enumMap;
    const {
      proName,
      packageNo,
      packageName,
      proCode,
      informRejectResult,
      applyForState
    } = infoSource;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.choosesuppliers`).d('选择供应商'),
        dataIndex: 'supplierNumName',
        width: 200,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record, index) => {
          if (record.$form != undefined) {
              if (record.isBeChosen === 'YES') {
                return (
                  <Form.Item>
                    {record.$form.getFieldDecorator('supplierNumName', {
                      initialValue: record.supplierNumName == 'abandon' ? '' : record.supplierNumName,
                      rules: [{
                        required: record.isBeChosen === 'YES',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                        })
                      }]
                    })(
                      <Lov placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                        disabled={!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO'}
                        code='BID.CHOOSESUPPLIERS'
                        queryParams={{ tenantId }}
                        textValue={record.supplierNumName == 'abandon' ? '' : record.supplierNumName}
                        onChange={(text, item) => {
                          record.supplierNumName = item.companyName
                          record.supplierNum = item.companyNum
                          this.changeSupplierNum(item, record, index)
                          this.handleDataChange()
                        }}
                      />
                    )}
                  </Form.Item>
                )
              } else {
                return (
                  <Form.Item>
                    <Lov placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                      disabled={!isDisabled || record.isBeChosen === '' || record.isBeChosen === null || record.isBeChosen === 'NO'}
                      code='BID.CHOOSESUPPLIERS'
                      queryParams={{ tenantId }}
                      textValue={''}
                    />
                  </Form.Item>
                )
              }
          }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
        dataIndex: 'isBeChosen',
        width: 150,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (text, record, index) => {
          if (record.$form != undefined) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`isBeChosen${index}`, {
                  initialValue: record.isBeChosen != undefined ? record.isBeChosen : '',
                  // validateTrigger: 'onChange',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
                      })
                    }
                  ]
                })(
                  <Select allowClear style={{ minWidth: 120 }} disabled={!isDisabled}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    onChange={(value, lovRecord) => { this.changeChosen(value, lovRecord, record, index); this.handleDataChange() }}
                  >
                    {yesNo.map((n) => (
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
        title: intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看'),
        width: 200,
        render: (text, record, index) => {
          return (
            <span style={{ 'color': '#0085d0', 'cursor': 'pointer' }} onClick={() => { this.previewEmail(record) }}>
              {intl.get(`bid.bidcommon.bid.button.Preview`).d('预览')}
            </span>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.approvalstatus`).d('审批结果'),
        dataIndex: 'result',
        width: 200,
        render: (text, record) => {
          if (record.result === 'pass') {
            return (
              <span>{intl.get(`bid.bidcommon.bid.button.Adopt`).d('通过')}</span>
            )
          } else if (record.result === 'reject') {
            return (
              <span>{intl.get(`bid.bidcommon.view.title.reject`).d('驳回')}</span>
            )
          }
        }
      },
    ];
    const tableList = {
      loading: featchLoading,
      dataSource: tableSource,
      columns,
      pagination: tablePagination,
      contractBidWinningResult,
      onChange: (page) => this.handlePageChange(page),
      onDataChange: this.handleDataChange,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        {isDisabled && <Header>
          <Button type='primary' onClick={() => this.goSave(infoSource)} loading={saveInfoLoading} >
            {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
          </Button>
        </Header>}
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zh_CN : undefined}>
            <Form>
              <Row gutter={24} >
                <Col>
                  <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                    label={intl.get('bid.bidcommon.view.title.purchaseschemename').d('采购方案名称')}
                  >
                    {getFieldDecorator('proName', {
                      initialValue: proName,
                    })(<Input disabled style={{ width: '77.8vw'}}/>)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                    label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                  >
                    {getFieldDecorator('packageNo', {
                      initialValue: packageNo,
                    })(<Input disabled style={{ width: 230 }} />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                    label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                  >
                    {getFieldDecorator('packageName', {
                      initialValue: packageName,
                    })(<Input disabled style={{ width: 230 }} />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                    label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                  >
                    {getFieldDecorator('proCode', {
                      initialValue: proCode,
                    })(<Input disabled style={{ width: 230 }} />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'flex' }} className={styles['conmi']}
                    label={intl.get('bid.bidcommon.view.title.informsupplierlose').d('通知落选者结果')}
                  >
                    {getFieldDecorator('informRejectResult', {
                      initialValue: informRejectResult,
                      rules: [{
                        required: informRejectResult === '',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.informsupplierlose`).d('通知落选者结果'),
                        })
                      }]
                    })(
                      <Select style={{ minWidth: 230 }} disabled={!isDisabled}
                        placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                        onChange={(value, lovRecord) => { this.changeChosen('result', lovRecord, form) }}
                      >
                        {yesNo.map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                    label={intl.get('bid.bidcommon.view.title.applystatus').d('申请状态')}
                  >
                    {getFieldDecorator('applyForState', {
                      initialValue: applyForState != '' ? applyForState : '',
                      rules: [{
                        required: false,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.informsupplierlose`).d('申请状态'),
                        })
                      }]
                    })(
                      <Select allowClear style={{ minWidth: 230 }} disabled
                        placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                        onChange={(value, lovRecord) => { this.changeChosen('state', lovRecord, form) }}
                      >
                        {status.map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
                <EditTable bordered {...tableList}></EditTable>
            </Form>
          </LocaleProvider>
          {/* <div style={{ 'display': decisionBox ? 'block' : 'none' }}> */}
          <div >
            <Card
              id="spcm-contract-maintain-detail-contract-header-information"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <h3>
                  {intl.get(`bid.bidcommon.view.title.waitingfordecisioncontent`).d('推荐供应商意见')}
                </h3>
              }
            ></Card>
            {/* <div className={styles[!isDisabled ? 'tinymacClass' : '']}> */}
            <div>
              <StaticTextEditor
                key={this.state.editorKey}
                content={this.state.prevContent}
                onRef={staticTextEditor => {
                  this.staticTextEditor = staticTextEditor;
                }}
                onEditChange={this.onEditChange}
              />
            </div>
          </div>
          <Modal
            className={styles['emailModel']}
            title={intl.get(`bid.bidcommon.view.title.mailcontent`).d('邮件查看')}
            style={{ 'display': emailModel ? 'flex' : 'none', 'width': '800px', 'height': '500px', 'zIndex': '998' }}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
            okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
          >
            <div dangerouslySetInnerHTML={{ __html: this.props.contractBidWinningResult.tableEmailSource }}></div>
          </Modal>
        </Content>
        {finallyIsView && <div className={styles['approval-btn']} >{this.generateBtns(true)}</div>}
      </Fragment>
    )
  }
}
