/**
 * index.js - 线下公告
 * @date: 2023-05-11
 * @author: shumingxu <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import { connect } from 'dva';
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Form, Input, Row, Col, Collapse, Card, Space, Dropdown } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusTabs from '_cus_components/CusTabs';
import CusNotification from '_cus_components/CusNotification';
import { some } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import uuid from 'uuid/v4';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import expand from '@/assets/expand.png';
import fold from '@/assets/fold.png';
import StaticTextEditor from './StaticTextEditor';
import OperationType from './OperationType';
import styles from './index.less';
import classnames from 'classnames';

const { Panel } = Collapse;
const { TextArea } = Input;
const bidcommon = 'srsp.riskmanagement';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  editNoticesLoading: loading.effects['contractMaintain/editNotices'],
  saveLoading: loading.effects['contractMaintain/editNotices'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.announcement'
  ],
})

export default class EditOfflineNotice extends React.Component {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.headerRef = React.createRef();
    this.leftPageRef = React.createRef(); //为左侧的pagearapper设置ref属性，用于后期获取高度
    this.rightPageRef = React.createRef(); //为右侧的pagearapper设置ref属性，用于后期获取高度
    this.pageRef = React.createRef(); //流转区域
    this.state = {
      activeKey: ['explain'],
      activeKeys: ['operationType'],
      itemKey: '0',
      requestId: 0,
      editorKey: uuid(),
      noticeList: [],
      approvalRequestButtonVOList: [], // 接收按钮信息
      isDisabled: false,
      noticeId: '', // 用于第一次保存后再次保存作为参数
      noticeState: '', // 公告状态
      anchorFlag: true, // 是否显示右侧流转区域
      noticeId: '', // 保存成功后公告id
      mipSubmit: false, // 判断是否已提交mip
      headerHeight: null,
      leftHeight: null,
      rightHeight: null,
      windowHeight: null,
      isPower: true, // 根据MIP按钮判断按钮的隐藏与显示
      saveFlag: false,
    };
  }

  componentDidMount() {
    this.fetchEnum();
    // 页面初始查询，若有requestId调用handleNotice，没有不调用
    if (this.props?.match?.params.noticeId) {
      this.handleNotice(this.props.match.params.noticeId);
    } else {
      this.generateBtns();
    }
    // 在页面加载完成后等待一段时间再获取元素高度;
    window.setTimeout(() => {
      this.getHeight();
    }, 3000);
    window.addEventListener('message', this.receiveMessage, false);
    window.addEventListener('resize', this.getHeight);
  }

  // componentWillUnmount() {
  //   window.addEventListener('message', this.receiveMessage, false);
  //   window.addEventListener('resize', this.getHeight);
  // }
  
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.noticeList === [] && this.state.noticeList.length > 0) {
  //     this.setState({ itemKey: "0" });
  //   }
  // }

  // 获取高度
  @Bind()
  getHeight() {
    // const headerHeight = this.headerRef?.current.offsetHeight;
    const leftHeight = this.leftPageRef?.current?.offsetHeight;
    const rightHeight = this.rightPageRef?.current?.offsetHeight;
    const windowHeight = window.innerHeight;
    this.setState({
      // headerHeight,
      leftHeight,
      rightHeight,
      windowHeight,
    });
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

  foldAnchor = () => {
    const { anchorFlag } = this.state;
    this.setState({
      anchorFlag: !anchorFlag,
    })
  }

  // 切换公告类型时查询对应模板
  getOffLineNotices = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getOffLineNotices',
      payload: {
        type: val, // 公告类型'BID.BIDANNOUNCE'
      },
    }).then((res) => {
      if (res) {
        this.setState({
          editorKey: uuid(),
          noticeList: res,
        })
      }
    })
  }

  // 保存公告
  @Debounce(200)
  saveNotice = () => {
    const { dispatch, match } = this.props;
    const { noticeList, noticeId } = this.state;
    const isPub = location.pathname.includes('pub');
    if (noticeList.cnSimpleNoticeContent !== '' && noticeList.cnTradNoticeContent !== '' && noticeList.enNoticeContent !== '') {
      this.leftPageRef?.current?.validateFields().then((fieldsValue) => {
        fieldsValue.noticeId = noticeId;
        dispatch({
          type: 'contractMaintain/saveOffLineNotices',
          payload: { fieldsValue },
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get(`${bidcommon}.view.title.savesuccessfully`).d('保存成功'),
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
              }, 300)
            }
          }
        });
      }).catch()
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

  // 保存公告后调用查询
  handleNotice = (noticeId) => {
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

  // 切换公告类型
  changeNoticeList = (val) => {
    this.getOffLineNotices(val); // 切换公告类型获取初始模板
  }

  onEditChange = (val, language) => {
    if (language === 'english') {
      this.leftPageRef?.current?.setFieldsValue({
        enNoticeContent: val
      })
    } else if (language === 'mulity') {
      this.leftPageRef?.current?.setFieldsValue({
        cnTradNoticeContent: val
      })
    } else {
      this.leftPageRef?.current?.setFieldsValue({
        cnSimpleNoticeContent: val
      })
    }
  }

  /**
   * 监听事件回调方法
   * @param param
   */
  @Bind()
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
  @Bind()
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
        // 判断MIP有无提交按钮去区别权限
        let flag = some(res.approvalRequestButtonVOList, (item) => {
          return item.buttonKey === 'submitName';
        });
        this.setState({
          isPower: flag,
          approvalRequestButtonVOList: res.approvalRequestButtonVOList,
        })
        // 审批中和已完成状态禁止编辑
        if (noticeState !== '' && (noticeState === 'under_approval' || noticeState === 'completed')) {
          this.setState({ isDisabled: true })
        } else {
          this.setState({ isDisabled: false })
        }
        // 显示mip发起审批的按钮
        this.generateBtns()
      }
    })
  }

  // mip按钮更新成数组塞到option
  @Bind()
  generateBtns() {
    const { approvalRequestButtonVOList, isPower, saveFlag } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    // submitName-提交
    // DeleteBtn-注销
    // LookView-流程图
    // forwardName-知会
    // LookApproval-流程状态
    // takingopinionsName-会签
    // HandleForwardName-转办
    const newButtonVOList = approvalRequestButtonVOList;
    // 页面初始进入只有保存按钮
    if (!saveFlag || !this.props.match.params.noticeId) {
      let saveBtn = [
        {
          buttonOrder: 4,
          buttonKey: 'btnSave',
          name: '保存',
          nameE: 'Save',
          width: '700',
          height: '240',
        },
      ];
      return saveBtn.map((item) => {
        return (
          <Col span={7}>
            <CusButton
              style={{ width: '100%', marginLeft: '0' }}
              onClick={this.saveNotice}
            >
              {isEn ? item.nameE : item.name}
            </CusButton>
          </Col>
        );
      })
    }
    // 第一个不是提交按钮代表已提交
    if (newButtonVOList.length > 0 && newButtonVOList[0].buttonKey !== 'submitName') {
      return (
        (newButtonVOList !== undefined && 
        newButtonVOList)
        .sort((one, two) => {
          return one.buttonOrder - two.buttonOrder;
        }).map((item) => {
          // 已提交/已审批 只显示 知会/流程状态/流程图 三个按钮
          if (item.buttonKey === 'forwardName' || item.buttonKey === 'LookApproval' || item.buttonKey === 'LookView') {
            if (item.buttonKey === 'HandleForwardName' && ['DRAFT', 'REVOKE', undefined].includes(status)) {
              return null;
            }
            if (!isPower) {
              return (
                <Col span={8}>
                  <CusButton
                    style={{ width: '100%', marginLeft: '0' }}
                    onClick={() => this.openModal(item)}
                  >
                    {isEn ? item.nameE : item.name}
                  </CusButton>
                </Col>
              )
            }
          }
        })
      )
    }
    // 第一个是提交按钮代表未提交，此时第二个是保存按钮
    else if (newButtonVOList.length > 0 && newButtonVOList[0].buttonKey === 'submitName') {
      newButtonVOList[1].buttonKey !== 'btnSave' && newButtonVOList.splice(1, 0, {
        buttonOrder: 4,
        buttonKey: 'btnSave',
        name: '保存',
        nameE: 'Save',
        width: '700',
        height: '240',
      });
      // 截取前三个按钮
      const firstBtns = newButtonVOList.slice(0, 3);
      // 截取...里面的更多按钮
      let moreButton = [];
      if (newButtonVOList.length > 3) {
        moreButton.push(...newButtonVOList.slice(3))
      }
      let items = [];
      moreButton.map((item, index) => {
        items.push({
          key: index,
          label: (
            <a target="_blank" onClick={() => this.openModal(item)}>
              {isEn ? item.nameE : item.name}
            </a>
          ),
          buttonKey: item.buttonKey,
          buttonOrder: item.buttonOrder,
          width: item.width,
          height: item.height,
          url: item.url,
          name: item.name,
          nameE: item.nameE,
        })
      })
      // console.log('moreButton', items, firstBtns)
      if (isPower && items) {
        return (
          <>
            {firstBtns && firstBtns.map((item) => {
              if (item.buttonKey === 'HandleForwardName' && ['DRAFT', 'REVOKE', undefined].includes(status)) {
                return null;
              }
              if (isPower) {
                return (
                  <Col span={7}>
                    {item.buttonKey === 'submitName' ? <CusButton
                      type='primary'
                      style={{ width: '100%', marginLeft: '0' }}
                      onClick={() =>this.openModal(item)}
                    >
                      {isEn ? item.nameE : item.name}
                    </CusButton> : 
                    <CusButton
                      style={{ width: '100%', marginLeft: '0' }}
                      onClick={() => this.props.contractMaintain.noticeFlowRecordDtoList ? this.openModal(item) : this.saveNotice()}
                    >
                      {isEn ? item.nameE : item.name}
                    </CusButton>}
                  </Col>
                );
              }
            })}
            {items && <Space>
              <Dropdown menu={{ items }} placement="bottomRight">
                <CusButton icon={<EllipsisOutlined />} className={styles.dropIcon}/>
              </Dropdown>
            </Space>}
          </>
        );
      }
    }
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

  render() {
    const {
      editNoticesLoading,
      saveLoading,
      contractMaintain,
    } = this.props;
    const { enumMap, noticeFlowRecordDtoList } = contractMaintain;
    const {
      noticeList,
      isDisabled,
      anchorFlag,
      activeKey,
      activeKeys,
      itemKey,
      requestId,
      windowHeight,
      rightHeight,
      saveFlag,
      approvalRequestButtonVOList,
    } = this.state;
    const { offlineType, offlineTypeTC, offlineTypeEN } = enumMap;
    console.log('noticeList', noticeList);
    const OperationTypeProps = {
      ...this.props,
      contractMaintain,
    }
    const tabItems = offlineType && [
      {
        key: '0',
        label: '简体',
        children: <>
          <Form.Item label="公告名称"
            name="cnSimpleNoticeTitle"
            initialValue={noticeList.cnSimpleNoticeTitle}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announname`).d('公告名称'),
                })
              },
            ]}
          >
            <Input placeholder='请输入'
              onChange={(e) => this.state.noticeList.cnSimpleNoticeTitle = e.target.value}
            />
          </Form.Item>
          <Form.Item label="公告类型"
            name="noticeType"
            initialValue={noticeList.noticeType}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.AnnounCategory`).d('公告类型'),
                })
              },
            ]}
          >
            <CusSelect placeholder='请选择' options={offlineType} onChange={this.changeNoticeList} />
          </Form.Item>
          <Form.Item label="公告内容"
            name="cnSimpleNoticeContent"
            initialValue={noticeList.cnSimpleNoticeContent}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announcontent`).d('公告内容'),
                })
              },
            ]}
          >
            {/* <div className={styles[!isDisabled ? 'tinymacClass' : '']} > */}
            <StaticTextEditor
              key='chinese'
              loading={editNoticesLoading}
              content={noticeList.cnSimpleNoticeContent}
              onRef={staticTextEditor => {
                this.staticTextEditor = staticTextEditor;
              }}
              onEditChange={this.onEditChange}
              newContent='chinese'
            />
            {/* </div> */}
          </Form.Item>
        </>
      },
      {
        key: '1',
        label: '繁體',
        children: <>
          <Form.Item label="公告名稱"
            name="cnTradNoticeTitle"
            initialValue={noticeList.cnTradNoticeTitle}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announname`).d('公告名稱'),
                })
              },
            ]}
          >
            <Input placeholder='請輸入'
              onChange={(e) => this.state.noticeList.cnTradNoticeTitle = e.target.value}
            />
          </Form.Item>
          <Form.Item label="公告類型"
            name="noticeType"
            initialValue={noticeList.noticeType}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.AnnounCategory`).d('公告類型'),
                })
              },
            ]}
          >
            <CusSelect placeholder='请選擇' options={offlineTypeTC} onChange={this.changeNoticeList} />
          </Form.Item>
          <Form.Item label="公告內容"
            name="cnTradNoticeContent"
            initialValue={noticeList.cnTradNoticeContent}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announcontent`).d('公告內容'),
                })
              },
            ]}
          >
            {/* <div className={styles[!isDisabled ? 'tinymacClass' : '']}> */}
            <StaticTextEditor
              key='mulity'
              content={noticeList.cnTradNoticeContent}
              onRef={staticTextEditor => {
                this.staticTextEditor = staticTextEditor;
              }}
              onEditChange={this.onEditChange}
              newContent='mulity'
            />
            {/* </div> */}
          </Form.Item>
        </>
      },
      {
        key: '2',
        label: 'English',
        children: <>
          <Form.Item label="Announ name"
            labelCol={{ flex: '110px' }}
            name="enNoticeTitle"
            initialValue={noticeList.enNoticeTitle}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announname`).d('Announ Name'),
                })
              },
            ]}
          >
            <Input placeholder='Please enter'
              onChange={(e) => this.state.noticeList.enNoticeTitle = e.target.value}
            />
          </Form.Item>
          <Form.Item label="Announ type"
            labelCol={{ flex: '110px' }}
            name="noticeType"
            initialValue={noticeList.noticeType}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.AnnounCategory`).d('Announ type'),
                })
              },
            ]}
          >
            <CusSelect placeholder='Please select' options={offlineTypeEN} onChange={this.changeNoticeList} />
          </Form.Item>
          <Form.Item label="Announ content"
            labelCol={{ flex: '110px' }}
            name="enNoticeContent"
            initialValue={noticeList.enNoticeContent}
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`bid.announcement.view.title.announcontent`).d('Announ content'),
                })
              },
            ]}
          >
            {/* <div className={styles[!isDisabled ? 'tinymacClass' : '']}> */}
            <StaticTextEditor
              key='english'
              content={noticeList.enNoticeContent}
              onRef={staticTextEditor => {
                this.staticTextEditor = staticTextEditor;
              }}
              onEditChange={this.onEditChange}
              newContent='english'
            />
            {/* </div> */}
          </Form.Item>
        </>
      }
    ]
    return (
      <div className={styles.pageBackground}>
        <img
          className={styles[!anchorFlag ? '_cus_fold' : '_cus_expand']}
          src={!anchorFlag ? expand : fold}
          onClick={() => this.foldAnchor()}
        />
        <div style={{ transition: 'width 0.5s', padding: '0', width: !anchorFlag ? '100%' : '73.6%' }}>
          <PageWrapper>
            <>
              <Card className={styles['tipTitleStyle']} ref={this.headerRef}>
                <p className={styles.title}>{intl.get(`${bidcommon}.view.message.Tips`).d('提示：')}</p>
                {this.state.requestId === 0 && <p className={styles.content}>{intl.get(`${bidcommon}.view.message.Pleaseeditandsave`).d('请对“简体、繁体、英文公告内容”进行编辑和保存。')}</p>}
                {this.state.requestId !== 0 && <p className={styles.content}>{intl.get(`${bidcommon}.view.message.Beforeapprovalpmst`).d('通过审批前，请务必阅读及审核 “简体、繁体、英文公告内容”无误。')}</p>}
              </Card>
              <Form ref={this.leftPageRef} wrapperCol={{ span: 24 }}>
                <CusTabs
                  defaultActiveKey={itemKey}
                  items={tabItems}
                  moreIcon={false}
                  className={styles.tabStyle}
                  onChange={(collapseKeys) => {
                    this.setState({ itemKey: collapseKeys });
                  }}
                />
              </Form>
            </>
          </PageWrapper>
        </div>
        <div className={styles['rightTipBox']} style={{ transition: 'display 1s', padding: '0', display: !anchorFlag ? 'none' : 'block' }}>
          <Row gutter={8} className={styles['tipButton']}>
            {/* 编辑和未提交时显示负责人区域 */}
            {(!saveFlag || (approvalRequestButtonVOList.length > 0 && approvalRequestButtonVOList[0].buttonKey === 'submitName'))&& <Collapse
              className={classnames('customize-collapse')}
              defaultActiveKey={activeKey}
            >
              <Panel
                ref={this.rightPageRef}
                collapsible="disabled"
                showArrow={false}
                header={
                  <PanelHeader
                    showArrow={false}
                    title={intl.get(`${bidcommon}.view.title.Director`).d('负责人')}
                    arrowActive={activeKey.includes('explain')}
                  />
                }
                key="explain"
              >
                <TextArea autoSize={{ minRows: 6, maxRows: 6 }} />
              </Panel>
            </Collapse>}
            <>{this.generateBtns(true)}</>
          </Row>
          <Collapse
            className={classnames('customize-collapse', 'collapse-right')}
            defaultActiveKey={activeKeys}
          >
            <Panel
              ref={this.pageRef}
              style={{
                height: windowHeight - rightHeight - 48,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
              className="operationType_backgrond"
              collapsible="disabled"
              showArrow={false}
              header={
                <PanelHeader
                  showArrow={false}
                  verticalLine={noticeFlowRecordDtoList.length !== 0}
                  title={noticeList.length === 0 ? intl.get(`${bidcommon}.view.title.instructions`).d('使用说明') : 
                    intl.get(`${bidcommon}.view.title.CirculationComments`).d('流转意见')}
                  arrowActive={activeKeys.includes('operationType')}
                />
              }
              key="operationType"
            >
              <div className='operationType-box' style={{ height: windowHeight - rightHeight - 48 + 'px' }}>
                {noticeList.length === 0 &&
                  // <p className={styles['p-tip-box']} style={{ height: windowHeight - rightHeight - 48 - 53 + 'px' }} dangerouslySetInnerHTML={{ __html: instruceValue }}></p>
                  <p className={styles['p-tip-box']} style={{ height: windowHeight - rightHeight - 48 - 53 + 'px' }} dangerouslySetInnerHTML={{ __html: '1111' }}></p>
                }
                {noticeList.length > 0 && <OperationType {...OperationTypeProps} />}
              </div>
            </Panel>
          </Collapse>
        </div>
      </div >
    );
  }
}