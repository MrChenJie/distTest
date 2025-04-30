/**
 * index.js - 发布线下公告发起MIP审批
 * @date: 2023-08-16
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Input, Card } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusTabs from '_cus_components/CusTabs';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusNotification from '_cus_components/CusNotification';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { Modal } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import moment from 'moment';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import styles from './index.less';
import './index.less';
import StaticTextEditor from './StaticTextEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import { closeTab } from 'utils/menuTab';

const dateTimeFormat = getDateTimeFormat();

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

export default class EditOfflineNoticeCus extends Component {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.state = {
      itemKey: '0',
      requestId: 0,
      editorKey: uuid(),
      noticeList: [],
      approvalRequestButtonVOList: [], // 接收按钮信息
      isRequestid: 0,
      isDisabled: false,
      noticeId: '', // 用于第一次保存后再次保存作为参数
      noticeState: '', // 公告状态
      newProId: '',
      endTime: '',
    };
    this.cusApprovalBtns = React.createRef();
    // this.changeNoticeTitle = this.changeNoticeTitle.bind(this);
  }
  componentDidMount() {
    this.fetchEnum(); // 查询值集
    // 页面初始查询，若有requestId调用handleNotice，没有不调用
    if (this.props?.match?.params.noticeId) {
      this.handleNotice(this.props.match.params.noticeId);
    }
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
  @Bind
  changeNoticeTitle(value, val) {
    const { form: { validateFields  } } = this.props;
    validateFields((err, values) => {
      this.setState(prevState => {
        const noticeList = { ...prevState.noticeList }; // 先复制一份旧的noticeList对象
        if (val === 'jt') {
          noticeList.cnSimpleNoticeTitle = value;
        }
        if (val === 'ft') {
          noticeList.cnTradNoticeTitle = value;
        }
        if (val === 'en') {
          noticeList.enNoticeTitle = value;
        }
        return { noticeList }; // 返回更新后的noticeList对象
      });
    });
  }

  // 切换公告类型
  @Bind()
  changeNoticeList(val) {
    const { form } = this.props;
    const { endTime } = this.state;
    const signUpEndTime = form.getFieldValue('signUpEndTime');
    if (!signUpEndTime) {
      return (
        CusNotification.error({
          message: intl.get('hzero.common.validation.notNull', {
            name: intl
              .get(`bid.announcement.view.title.deadlinetraditionalNewJT`)
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
        signUpEndTime: endTime ? endTime : dayjs(signUpEndTime).format('YYYY-MM-DD HH:mm:ss'), // 截止时间
        noticeId: match.params.noticeId,
      } : {
        type: val, // 公告类型
        signUpEndTime: endTime ? endTime : dayjs(signUpEndTime).format('YYYY-MM-DD HH:mm:ss'), // 截止时间
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
        form.validateFields((err, values) => {
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
  saveNotice(callback) {
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
              if (typeof callback === 'function') {
                callback();
              } else {
                CusNotification.success({
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
            }
          });
        }
      })
    } else {
      CusNotification.error({
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

  // MIP审批明细查询
  @Bind
  approvalProcess(getMipId) {
    const { dispatch } = this.props;
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
        })
        // 审批中和已完成状态禁止编辑
        if (noticeState !== '' && (noticeState === 'under_approval' || noticeState === 'completed')) {
          this.setState({ isDisabled: true })
        } else {
          // 已办(知会/流程图/流程状态/撤回)禁止编辑
          let items = res.approvalRequestButtonVOList;
          if (items.length === 4) {
            if (items[0].buttonKey === 'forwardName' && items[1].buttonKey === 'LookApproval' &&
              items[2].buttonKey === 'LookView' && items[3].buttonKey === 'isretractName') {
              this.setState({ isDisabled: true })
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
   */
  @Bind
  generateBtns(isEdit) {
    const { approvalRequestButtonVOList = [], isDisabled } = this.state;
    // 向知会前面插入保存按钮
    if (!isDisabled) {
      const saveButton = {
        nameE: intl.get('hzero.common.button.save').d('保存'),
        name: intl.get('hzero.common.button.save').d('保存'),
        buttonOrder: 15,
        buttonKey: 'saveName',
        disabled: !isEdit,
      };
      if (!approvalRequestButtonVOList.find((item) => item.buttonKey === 'saveName') && isEdit) {
        approvalRequestButtonVOList.push(saveButton);
      }
    }
    const updatedList = approvalRequestButtonVOList.map(item => {
      if (item.buttonKey === 'forwardName') {
        item.buttonOrder = '16'
      }
      if (item.buttonKey === 'takingopinionsName') {
        item.buttonOrder = '19'
      }
      return item;
    });
    return updatedList
      .sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      });
  }

  @Bind
  openModal(record) {
    if (record.buttonKey === 'submitName') {
      const { form } = this.props;
      let validateResult = true;
      let errMessageList = [];
      const { validateFieldsAndScroll = (e) => e } = form;
      validateFieldsAndScroll((err) => {
        if (err) {
          for (let child in err) {
            errMessageList.push(err[child].errors[0].message);
          }
          validateResult = false;
        };
      });
      if (validateResult) {
        this.saveNotice(() => {
          this.cusApprovalBtns?.current?.openModal({ ...record })
        })
      } else {
        const description = (
          <div>
            {errMessageList.map((item) => (
              <p style={{ marginBottom: '0px' }}>{item}</p>
            ))}
          </div>
        );
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: description,
        });
      }
    } else if (record.buttonKey === 'saveName') {
      this.saveNotice();
    } else {
      this.cusApprovalBtns?.current?.openModal({ ...record });
    }
  }

  @Bind
  fetchData(times) {
    const { requestId } = this.state;
    this.handleNotice();
    this.setState({
      generalRequestLoading: true,
    });
    // 去查询审批数据
    this.requestRound(requestId, times);
  }

  @Bind
  requestRound(targetHeaderId, times = 30, nextTime = 0) {
    const { requestId } = this.state;
    if (times <= 0) {
      this.setState({
        generalRequestLoading: false,
      });
      return;
    }
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      this.approvalProcess(requestId);
    }, nextTime);
  }

  @Bind
  onChangeLast(e) {
    const { form, match } = this.props;
    const noticeType = form.getFieldValue('noticeType');
    this.setState({
      endTime: dayjs(e).format('YYYY-MM-DD HH:mm:ss'),
    })
    if (noticeType && e && !match.params.noticeId) {
      this.getOffLineNotices(noticeType, dayjs(e).format('YYYY-MM-DD HH:mm:ss'));
    }
  }

  render() {
    const {
      form = {},
      location: { state: { _back } = {} },
      editNoticesLoading,
      saveLoading,
      contractMaintain
    } = this.props;
    const { enumMap } = contractMaintain;
    const { offlineType, offlineTypeTC, offlineTypeEN } = enumMap;
    const { noticeList, isDisabled, itemKey, generalRequestLoading = false } = this.state;
    const { getFieldDecorator = (e) => e } = form;

    const tabItems = [
      {
        key: '0',
        label: '简体',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="公告名称：" className={styles['nativeLable']}>
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
                  <Input
                    placeholder='请输入'
                    disabled={isDisabled}
                    style={{ width: '99%' }}
                    onChange={(e) => this.changeNoticeTitle(e.target.value, 'jt')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止时间" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: noticeList.signUpEndTime ? dayjs(noticeList.signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewJT`)
                        .d('截止时间'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    disabled={isDisabled}
                    style={{ width: '98%' }}
                    format={dateTimeFormat}
                    onChange={e => this.onChangeLast(e)}
                    disabledDate={currentDate =>
                      currentDate && currentDate < dayjs().startOf('day')
                    }
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="公告类型" className={styles['nativeLable']}>
                {getFieldDecorator('noticeType', {
                  initialValue: noticeList.noticeType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('公告类型'),
                    }),
                  }]
                })(
                  <CusSelect allowClear style={{ width: '98%' }}
                    placeholder='请选择'
                    onChange={this.changeNoticeList}
                    disabled={isDisabled}
                    options={offlineType}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="公告内容：" className={styles['nativeLable']}>
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
                  <div className={styles[isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      },
      {
        key: '1',
        label: '繁體',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="公告名稱：" className={styles['nativeLable']}>
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
                  <Input
                    placeholder='請輸入'
                    disabled={isDisabled}
                    style={{ width: '99%' }}
                    onChange={(e) => this.changeNoticeTitle(e.target.value, 'ft')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止時間:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: noticeList.signUpEndTime ? dayjs(noticeList.signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewFT`)
                        .d('截止時間'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='請選擇'
                    disabled={isDisabled}
                    style={{ width: '98%' }}
                    format={dateTimeFormat}
                    onChange={e => this.onChangeLast(e)}
                    disabledDate={currentDate =>
                      currentDate && currentDate < dayjs().startOf('day')
                    }
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="公告類型" className={styles['nativeLable']}>
                {getFieldDecorator('noticeType', {
                  initialValue: noticeList.noticeType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('公告類型'),
                    }),
                  }]
                })(
                  <CusSelect allowClear style={{ width: '98%' }}
                    placeholder='请選擇'
                    onChange={this.changeNoticeList}
                    disabled={isDisabled}
                    options={offlineTypeTC}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="公告內容：" className={styles['nativeLable']}>
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
                  <div className={styles[isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      },
      {
        key: '2',
        label: 'English',
        children: <>
          <Row>
            <Col span={24}>
              <Form.Item label="Announ name：" className={styles['nativeLable']}>
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
                  <Input
                    placeholder='Please enter'
                    disabled={isDisabled}
                    style={{ width: '99%' }}
                    onChange={(e) => this.changeNoticeTitle(e.target.value, 'en')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End time:" className={styles['nativeLable']}>
                {getFieldDecorator('signUpEndTime', {
                  initialValue: noticeList.signUpEndTime ? dayjs(noticeList.signUpEndTime) : undefined,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`bid.announcement.view.title.deadlinetraditionalNewEN`)
                        .d('Deadline'),
                    }),
                  }]
                })(
                  <CusDatePicker
                    placeholder='Please select'
                    disabled={isDisabled}
                    style={{ width: '98%' }}
                    format={dateTimeFormat}
                    onChange={e => this.onChangeLast(e)}
                    disabledDate={currentDate =>
                      currentDate && currentDate < dayjs().startOf('day')
                    }
                    showTime
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Announ type" className={styles['nativeLable']}>
                {getFieldDecorator('noticeType', {
                  initialValue: noticeList.noticeType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.AnnounCategory`).d('Announ type'),
                    }),
                  }]
                })(
                  <CusSelect allowClear style={{ width: '98%' }}
                    placeholder='Please select'
                    onChange={this.changeNoticeList}
                    disabled={isDisabled}
                    options={offlineTypeEN}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Announ content:" className={styles['nativeLable']}>
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
                  <div className={styles[isDisabled ? 'tinymacClass' : '']}
                    style={{ width: '99%' }}
                  >
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
            </Col>
          </Row>
        </>
      }
    ]
    return (
      <>
        <PageWrapper loading={generalRequestLoading}>
          <div className={styles.marginLeft0}>
            <Form className="customize-form">
              <Card className={styles['tipTitleStyle']}>
                <p className={styles.title}>{intl.get(`bid.bidcommon.view.message.Tips`).d('提示：')}</p>
                {this.state.requestId === 0 && <p className={styles.content}>{intl.get(`bid.bidcommon.view.message.Pleaseeditandsave`).d('请对“简体、繁体、英文公告内容”进行编辑和保存。')}</p>}
                {this.state.requestId !== 0 && <p className={styles.content}>{intl.get(`bid.bidcommon.view.message.Beforeapprovalpmst`).d('通过审批前，请务必阅读及审核 “简体、繁体、英文公告内容”无误。')}</p>}
              </Card>
              <CusTabs
                defaultActiveKey={itemKey}
                items={tabItems}
                moreIcon={false}
                onChange={(collapseKeys) => {
                  this.setState({ itemKey: collapseKeys });
                }}
              />
            </Form>
          </div>
        </PageWrapper>
        <CusApprovalButtons
          approvalRequestButtonVOList={this.generateBtns(true)}
          openModal={this.openModal}
          ref={this.cusApprovalBtns}
          onOk={() => this.fetchData(1)}
        />
      </>
    );
  }
}
EditOfflineNoticeCus = Form.create({})(EditOfflineNoticeCus);