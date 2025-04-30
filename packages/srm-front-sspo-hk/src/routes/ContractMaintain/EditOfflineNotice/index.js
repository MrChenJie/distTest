/**
 * index.js - 发布公告发起MIP审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Tabs, Input, Avatar, LocaleProvider, Select, DatePicker } from 'hzero-ui';
import { Card } from 'antd';
import { Modal, Tooltip } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import moment from 'moment';
import btnTracking from '@/assets/approval/(签收历史）Tracking.png';
import btnSubmit from '@/assets/approval/(办理or提交）btn_submit.png';
import btnDel from '@/assets/approval/（删除）btn_doDelete.png';
import btnForward from '@/assets/approval/（知会）btn_forward.png';
import btnForward2 from '@/assets/approval/（会签）btn_forward2.png';
import btnFlowChart from '@/assets/approval/（流程图）FlowChart.png';
import btnApprovalHistory from '@/assets/approval/（审批状态）ApprovalHistory.png';
import btnForwardback3 from '@/assets/approval/（转办）btn_forwardback3.png';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import styles from './index.less';
import './index.less';
import StaticTextEditor from './StaticTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { closeTab } from 'utils/menuTab';

const TabPane = Tabs.TabPane;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@connect(({ loading = {}, contractMaintain = {} }) => ({
  editNoticesLoading: loading.effects['contractMaintain/editNotices'],
  saveLoading: loading.effects['contractMaintain/saveOffLineNotices'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.announcement'
  ],
})
@Form.create({ fieldNameProp: null })
export default class EditReleaseNotices extends Component {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.state = {
      requestId: 0,
      editorKey: uuid(),
      noticeList: [],
      finallyIsView: false, // 是否显示mip按钮
      approvalRequestButtonVOList: [], // 接收按钮信息
      isRequestid: 0,
      isDisabled: false,
      noticeId: '', // 用于第一次保存后再次保存作为参数
      noticeState: '', // 公告状态
      newProId: '',
      endTime: '',
    };
  }
  componentDidMount() {
    this.fetchEnum(); // 查询值集
    // 页面初始查询，若有requestId调用handleNotice，没有不调用
    if (this.props?.match?.params.noticeId) {
      this.handleNotice(this.props.match.params.noticeId);
    }
    // else {
    //   this.generateBtns();
    // }
    // 该方法是用于 goToClose 页面调用的，用于关闭modal框的方法
    window.addEventListener('message', this.receiveMessage, false);
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/init',
    });
  }

  // 保存公告后调用查询
  @Bind()
  handleNotice(noticeId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/handleOffLineNotices',
      payload: {
        noticeId: noticeId ? noticeId : this.state.noticeId, // 公告id
      },
    }).then((res) => {
      if (res) {
        this.setState({
          editorKey: uuid(),
          noticeList: res,
          noticeId: res.noticeId,
          noticeState: res.noticeState,
          endTime: res.signUpEndTime,
        })
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            noticeFlowRecordDtoList: res.noticeFlowRecordDtoList || []
          }
        })
        if (res.requestId) {
          this.setState({ requestId: res.requestId, saveFlag: true })
          this.approvalProcess(res.requestId)
        }
      }
    })
  }

  // 编辑公告标题
  @Bind()
  changeNoticeTitle() {
    const { form: { validateFieldsAndScroll } } = this.props;
    validateFieldsAndScroll({ focus: true }, (err, values) => {
      this.state.noticeList.cnSimpleNoticeTitle = values.cnSimpleNoticeTitle;
      this.state.noticeList.cnTradNoticeTitle = values.cnTradNoticeTitle;
      this.state.noticeList.enNoticeTitle = values.enNoticeTitle;
    });
  }

  // 切换公告类型
  @Bind()
  changeNoticeList(val) {
    const { form } = this.props;
    const { endTime } = this.state;
    const signUpEndTime = form.getFieldValue('signUpEndTime');
    if(!signUpEndTime) {
      return (
        notification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl
              .get(`bid.announcement.view.title.deadlinetraditional`)
              .d('截止时间'),
          }),
        })
      )
    } else {
      this.getOffLineNotices(val, endTime ? endTime : signUpEndTime); // 切换公告类型获取初始模板
    }
  }

  // 切换公告类型时查询对应模板
  getOffLineNotices = (val, endTime) => {
    const { dispatch, form, match } = this.props;
    const { noticeList } = this.state;
    let newContents = noticeList;
    const signUpEndTime = form.getFieldValue('signUpEndTime');
    dispatch({
      type: 'contractMaintain/getOffLineNotices',
      payload: match.params.noticeId ? {
        type: val, // 公告类型
        signUpEndTime: endTime ? endTime : moment(signUpEndTime).format('YYYY-MM-DD HH:mm:ss'), // 截止时间
        noticeId: match.params.noticeId,
      } : {
        type: val, // 公告类型
        signUpEndTime: endTime ? endTime : moment(signUpEndTime).format('YYYY-MM-DD HH:mm:ss'), // 截止时间
      },
    }).then((res) => {
      if (res) {
        this.setState({
          editorKey: uuid(),
          noticeList: {
            cnSimpleNoticeTitle: newContents.cnSimpleNoticeTitle ? newContents.cnSimpleNoticeTitle : res.cnSimpleNoticeTitle,
            cnTradNoticeTitle: newContents.cnTradNoticeTitle ? newContents.cnTradNoticeTitle : res.cnTradNoticeTitle,
            enNoticeTitle: newContents.enNoticeTitle ? newContents.enNoticeTitle : res.enNoticeTitle,
            noticeType: newContents.noticeType ? newContents.noticeType : res.noticeType,
            signUpEndTime: newContents.signUpEndTime ? newContents.signUpEndTime : res.signUpEndTime,
            cnSimpleNoticeContent: res.cnSimpleNoticeContent,
            cnTradNoticeContent: res.cnTradNoticeContent,
            enNoticeContent: res.enNoticeContent,
          },
        })
        this.props.form.resetFields(['cnSimpleNoticeContent', 'cnTradNoticeContent', 'enNoticeContent'])
        form.validateFieldsAndScroll({ focus: true }, (err, values) => {
          res.cnSimpleNoticeContent = values.cnSimpleNoticeContent;
          res.cnTradNoticeContent = values.cnTradNoticeContent;
          res.enNoticeContent = values.enNoticeContent;
        });
      }
    })
  }

  // 保存
  @Bind()
  @Debounce(200)
  saveNotice() {
    const { dispatch, match, form } = this.props;
    const { noticeList, noticeId, endTime } = this.state;
    const isPub = location.pathname.includes('pub');
    if (noticeList.cnSimpleNoticeContent !== '' && noticeList.cnTradNoticeContent !== '' && noticeList.enNoticeContent !== '') {
      form.validateFields((err, fieldsValue) => {
        if (isEmpty(err)) {
          fieldsValue.noticeId = noticeId;
          fieldsValue.signUpEndTime = endTime;
          dispatch({
            type: 'contractMaintain/saveOffLineNotices',
            payload: { fieldsValue },
          }).then((res) => {
            if (res) {
              notification.success({
                message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
              });
              if (match.params.noticeId) {
                this.handleNotice(match.params.noticeId);
              } else {
                setTimeout(() => {
                  dispatch(
                    routerRedux.push({
                      pathname: `${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/offlineNotice/${res.noticeId}`,
                    })
                  );
                  closeTab(`${isPub ? '/pub' : ''}/sspo/online-purchase/notices1/offlineNotice`)
                }, 300)
              }
            }
          });
        }
      })
    } else {
      notification.error({
        message: intl.get('hzero.common.validation.notNull', {
          name: intl
            .get(`bid.announcement.view.title.announname`)
            .d('公告名称')
        })
      });
    }
  }

  @Bind
  onEditChange(val, language) {
    const { form: { setFieldsValue } } = this.props;
    if (language === 'english') {
      setFieldsValue({
        enNoticeContent: val
      })
    } else if (language === 'mulity') {
      setFieldsValue({
        cnTradNoticeContent: val
      })
    } else {
      setFieldsValue({
        cnSimpleNoticeContent: val
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
    console.log('param=========init', param)
    if (routerParam.opt === 'ok') {
      console.log('ok', routerParam.opt)
      this.handleNotice();
      this.fetchEnum(); // 查询值集
      Modal.destroyAll();
      window.close(); // 关闭当前页
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      console.log('close', routerParam.opt)
      this.handleNotice();
      this.fetchEnum(); // 查询值集
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      // 原意打算使用tab中的刷新，无奈改动太大，等后期有提出需求的时候再做变更
      window.location.reload();
    }
  }

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch, match } = this.props;
    const { noticeState } = this.state;
    dispatch({
      type: 'contractMaintain/approvalProcess',
      payload: {
        requestId: getMipId,
        organizationId: getCurrentOrganizationId(),
      }
    }).then((res) => {
      if (res) {
        this.setState({
          approvalRequestButtonVOList: res.approvalRequestButtonVOList,
          finallyIsView: true
        })
        // 初始化时没有提交按钮就禁止页面编辑
        // if ((this.state.approvalRequestButtonVOList.length > 0 && this.state.approvalRequestButtonVOList[0].buttonKey !== 'submitName') || match.params.editFlag === '0') {
        //   this.setState({ finallyIsView: true, isDisabled: false })
        // } else {
        //   this.setState({ finallyIsView: true, isDisabled: true });
        // }
        // 审批中和已完成状态禁止编辑
        if (noticeState !== '' && (noticeState === 'under_approval' || noticeState === 'completed')) {
          this.setState({ isDisabled: true })
        } else {
          // 已办(知会/流程图/流程状态/撤回)禁止编辑
          let items = res.approvalRequestButtonVOList;
          if (items.length === 4) {
            if (items[0].buttonKey === 'forwardName' && items[1].buttonKey === 'LookApproval' &&
            items[2].buttonKey === 'LookView' && items[3].buttonKey === 'isretractName') {
              this.setState({ isDisabled : true })
            }
          } else {
            this.setState({ isDisabled: false })
          }
        }
        // 显示mip发起审批的按钮
        this.generateBtns()
      }
    })
  }

  /**
   * 渲染审批按钮
   * @returns {unknown[]}
   */
  @Bind
  generateBtns() {
    const { approvalRequestButtonVOList } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    return approvalRequestButtonVOList
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
          case 'DeleteBtn':
            // 注销
            src = btnDel;
            break;
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
          item.buttonKey === 'DeleteBtn' ||
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
        } else if (item.buttonKey !== 'isretractName') { // 撤回不渲染
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
        // height: record.buttonKey === 'LookView' && `${record.height - 300}px`,
        // height: `${record.buttonKey === 'DeleteBtn'}` ? `${record.height}px` : `${record.height + 35}px`,
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
          style={{ width: '100%', overflow: 'auto', height: `${record.height - 15}px` }}
          // style={{ width: '100%', overflow: record.buttonKey === 'LookView' ? 'hidden' : 'auto', height: record.buttonKey === 'LookView' ? '100%' : `${record.height - 12}px` }}
          marginWidth="1"
          marginHeight="1"
        />
      ),
    });
    this.switchModalContainerClassName(true);
  }

  @Bind
  onChangeLast(e) {
    const { form, match } = this.props;
    const noticeType = form.getFieldValue('noticeType');
    this.setState({
      endTime: moment(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    if(noticeType && e && !match.params.noticeId) {
      this.getOffLineNotices(noticeType, moment(e).format('YYYY-MM-DD HH:mm:ss'));
    }
  }

  render() {
    const {
      match,
      form = {},
      location: { state: { _back } = {} },
      editNoticesLoading,
      saveLoading,
      contractMaintain
    } = this.props;
    const { enumMap } = contractMaintain;
    const { offlineType, offlineTypeTC, offlineTypeEN } = enumMap;
    const { noticeList, finallyIsView, isDisabled } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <Content>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Card className={styles['tipTitleStyle']}>
              <p className={styles.title}>{intl.get(`bid.bidcommon.view.message.Tips`).d('提示：')}</p>
              {this.state.requestId === 0 && <p className={styles.content}>{intl.get(`bid.bidcommon.view.message.Pleaseeditandsave`).d('请对“简体、繁体、英文公告内容”进行编辑和保存。')}</p>}
              {this.state.requestId !== 0 && <p className={styles.content}>{intl.get(`bid.bidcommon.view.message.Beforeapprovalpmst`).d('通过审批前，请务必阅读及审核 “简体、繁体、英文公告内容”无误。')}</p>}
            </Card>
            {!isDisabled && <Button type="primary" onClick={() => this.saveNotice()} loading={saveLoading}
            >
              {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
            </Button>}
          </div>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zh_CN : undefined}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="简体" key="1">
                <Form.Item label="公告名称：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnSimpleNoticeTitle', {
                    initialValue: noticeList.cnSimpleNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('公告名称'),
                      }),
                    }]
                  })(
                    <Input placeholder='请输入' disabled={isDisabled}
                      onChange={() => this.changeNoticeTitle()} />
                  )}
                </Form.Item>
                <Form.Item label="截止时间" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: noticeList.signUpEndTime && moment(noticeList.signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('截止时间'),
                      }),
                    }]
                  })(
                    <DatePicker format="YYYY-MM-DD HH:mm:ss" disabled={isDisabled}
                      onChange={e => this.onChangeLast(e)}
                      disabledDate={currentDate =>
                        currentDate && currentDate < moment().startOf('day')
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item label="公告类型" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('noticeType', {
                    initialValue: noticeList.noticeType,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('公告类型'),
                      }),
                    }]
                  })(
                    <Select allowClear style={{ width: '100%' }}
                      placeholder='请选择'
                      onChange={this.changeNoticeList}
                      disabled={isDisabled}
                    >
                      {offlineType && offlineType.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="公告内容：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnSimpleNoticeContent', {
                    initialValue: noticeList.cnSimpleNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('公告内容'),
                      }),
                    }]
                  })(
                    <div className={styles[isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='chinese'
                        loading={editNoticesLoading}
                        content={noticeList.cnSimpleNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='chinese'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
              <TabPane tab="繁體" key="2">
                <Form.Item label="公告名稱：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnTradNoticeTitle', {
                    initialValue: noticeList.cnTradNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('公告名稱'),
                      }),
                    }]
                  })(
                    <Input placeholder='請輸入' disabled={isDisabled}
                      onChange={() => this.changeNoticeTitle()}
                    />
                  )}
                </Form.Item>
                <Form.Item label="截止時間:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: noticeList.signUpEndTime && moment(noticeList.signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('截止時間'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='請選擇' format="YYYY-MM-DD HH:mm:ss" disabled={isDisabled}
                      onChange={e => this.onChangeLast(e)}
                      disabledDate={currentDate =>
                        currentDate && currentDate < moment().startOf('day')
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item label="公告類型" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('noticeType', {
                    initialValue: noticeList.noticeType,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('公告類型'),
                      }),
                    }]
                  })(
                    <Select allowClear style={{ width: '100%' }}
                      placeholder='请選擇'
                      onChange={this.changeNoticeList}
                      disabled={isDisabled}
                    >
                      {offlineTypeTC && offlineTypeTC.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="公告內容：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('cnTradNoticeContent', {
                    initialValue: noticeList.cnTradNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('公告內容'),
                      }),
                    }]
                  })(
                    <div className={styles[isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='mulity'
                        content={noticeList.cnTradNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='mulity'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
              <TabPane tab="English" key="3">
                <Form.Item label="Announ name：" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('enNoticeTitle', {
                    initialValue: noticeList.enNoticeTitle,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announname`)
                          .d('Announ Name'),
                      }),
                    }]
                  })(
                    <Input placeholder='Please enter' disabled={isDisabled}
                      onChange={() => this.changeNoticeTitle()}
                    />
                  )}
                </Form.Item>
                <Form.Item label="End time:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('signUpEndTime', {
                    initialValue: noticeList.signUpEndTime && moment(noticeList.signUpEndTime),
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.deadlinetraditional`)
                          .d('Deadline'),
                      }),
                    }]
                  })(
                    <DatePicker placeholder='Please select' format="YYYY-MM-DD HH:mm:ss" disabled={isDisabled}
                      onChange={e => this.onChangeLast(e)}
                      disabledDate={currentDate =>
                        currentDate && currentDate < moment().startOf('day')
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item label="Announ type" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('noticeType', {
                    initialValue: noticeList.noticeType,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('Announ type'),
                      }),
                    }]
                  })(
                    <Select allowClear style={{ width: '100%' }}
                      placeholder='Please select'
                      onChange={this.changeNoticeList}
                      disabled={isDisabled}
                    >
                      {offlineTypeEN && offlineTypeEN.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="Announ content:" className={styles['nativeLable']} {...formItemLayout}>
                  {getFieldDecorator('enNoticeContent', {
                    initialValue: noticeList.enNoticeContent,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`bid.announcement.view.title.announcontent`)
                          .d('Announ content'),
                      }),
                    }]
                  })(
                    <div className={styles[isDisabled ? 'tinymacClass' : '']}>
                      <StaticTextEditor
                        key='english'
                        content={noticeList.enNoticeContent || ''}
                        onRef={staticTextEditor => {
                          this.staticTextEditor = staticTextEditor;
                        }}
                        onEditChange={this.onEditChange}
                        newContent='english'
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
            </Tabs>
          </LocaleProvider>
        </Content>
        {finallyIsView && <div className={styles['approval-btn']} >{this.generateBtns(true)}</div>}
      </Fragment>
    );
  }
}
EditReleaseNotices = Form.create({})(EditReleaseNotices);
