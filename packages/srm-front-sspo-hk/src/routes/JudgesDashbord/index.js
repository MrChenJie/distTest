/**
 * index.js - 评委工作台
 * @date: 2022-04-07
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import uuidv4 from 'uuid/v4';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentLanguage} from 'utils/utils';
import CusNotification from '_cus_components/CusNotification';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination } from 'hzero-front/lib/utils/utils';
import styles from './index.less';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse, Menu, Tooltip } from 'antd';
import querystring from 'querystring'; // 勿删
import { tooltipRender } from '_cus_utils/render';
import CusSearchTabs from '_cus_components/CusSearchTabs';

const { Panel } = Collapse;
const currentLanguage = getCurrentLanguage();

@connect(({ loading = {}, contractJudgesDashbord = {} }) => ({
  queryListLoading: loading.effects['contractJudgesDashbord/queryList'],
  updateReadStateLoading: loading.effects['contractJudgesDashbord/updateReadState'],
  contractJudgesDashbord,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon'
  ],
})
export default class JudgesDashbord extends Component {
  constructor(props) {
    super(props);
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    this.state = {
      showRules: false,
      timeNum: 5,
      readEndFlag: false,
      clickChoice: 0,
      poHeaderInfo: {},
      stateNum: 0,
      activeKey: ['form'],
      cachTabKey: '0',
    };
  }

  componentDidMount() {
    const isProdId = this.props.location.search.includes('proId');
    const todoParams = querystring.parse(this.props.location.search.substr(1));
    const record = {
      proId: todoParams.proId, // 待办给的prodId
      purchaseType: todoParams.purchaseType, // 待办给的招标方式
    }
    this.fetchList();

    isProdId && this.showModel(record);
  }

  @Bind
  changeNum(key) {
    // if (key === '3') {
    //   this.setState({ stateNum: 3 });
    // }
    if (key === '0') {
      this.setState({ stateNum: 0 });
    }
    if (key === '1') {
      this.setState({ stateNum: 1 });
    }
    this.fetchList();
  }

  /**
   * fetchList - 获取评委权限表格数据
   * @param {object} params - 查询条件
   */
  @Bind
  @Debounce(200)
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const { stateNum } = this.state;
    dispatch({
      type: 'contractJudgesDashbord/queryList',
      payload: {
        page,
        state: stateNum === '' ? 0 : stateNum
      }
    }).then((res) => {
      if (res) {
        const { content = [] } = res.page;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesDashbord/updateState',
          payload: {
            dataSource: newDataSource,
            pagination: createPagination(res.page),
          },
        });
        this.setState({
          poHeaderInfo: res
        })
      }
    });
    // const { contractJudgesDashbord: { dataSource } } = this.props;
    // this.setState({dataSource: dataSource})
  }
  /**
   * 查询值集
   */
  @Bind
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesDashbord/init',
    });
  }

  /**
   * 显示评委守则弹框
   * */
  @Bind
  showModel(record) {
    const { dispatch } = this.props;
    const isPub = location.pathname.includes('pub');
    dispatch({
      type: 'contractJudgesDashbord/setReadState',
      payload: {
        proId: record.proId,
      }
    }).then((res) => {
      if (res != 1) { // 0未阅 1已阅并提交 2已阅未提交 3说明项目不存在或者该登录用户不是评委
        if (res == 3) {
          CusNotification.error({ message: '项目不存在或者该登录用户不是评委' })
        } else {
          this.setState({
            showRules: true,
            readEndFlag: true,
            clickChoice: record, // 点击指定的评分按钮
            proInfoSystemWording: record.proInfoSystemWording, // 系统用词判断
          });
          dispatch({
            type: 'contractJudgesDashbord/setReadState',
            payload: {
              proId: record.proId,
            }
          });
          setTimeout(() => {
            this.timeOut();
          }, 100)
        }
      } else {
        this.setState({
          clickChoice: record, // 点击指定的评分按钮
        });
        let url = `${isPub ? '/pub' : ''}/sspo/online-purchase/JudgesSorce/${record.proId}/${record.purchaseType}`
        window.open(url, '_blank');
      }
    });
  }
  verifyInterval; // 倒计时定时器
  // 5秒倒计时
  @Bind
  timeOut() {
    let timeNum = 5;
    const _this = this;
    this.verifyInterval = setInterval(() => {
      timeNum--;
      _this.setState({
        timeNum,
      });
      if (timeNum < 0) {
        clearInterval(this.verifyInterval);
        _this.setState({
          timeNum: 5,
          readEndFlag: false,
        });
      }
    }, 1000);
  }
  @Bind
  handleOk() {
    const { dispatch } = this.props;
    const { clickChoice } = this.state;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let Id = clickChoice.proId;
    let purchaseType = clickChoice.purchaseType;

    dispatch({
      type: 'contractJudgesDashbord/updateReadState',
      payload: {
        proId: Id,
        stateNum: 1,  // 阅读状态为已确认
        organizationId: getCurrentOrganizationId()
      }
    }).then((res) => {
      this.setState({
        showRules: false,
      }, () => {
        const pathname = `${isPub ? '/pub' : ''}/sspo/online-purchase/JudgesSorce/${Id}/${purchaseType}`;
        window.open(pathname, '_blank')
      })
    });
  }

  // 取消按钮
  @Bind
  handleCancel() {
    // clearInterval(this.timeOut());
    // 倒计时结束后才可点击取消
    this.setState({
      showRules: false,
      readEndFlag: false,
    });
  }

  // 弹框点击x关闭
  @Bind
  handleCancelClick() {
    this.setState({
      showRules: false,
    })
    clearInterval(this.verifyInterval);
  }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    this.setState({ cachTabKey: key });
    this.changeNum(key);
  }

  render() {
    const {
      queryListLoading,
      contractJudgesDashbord: { dataSource = [], pagination = {} },
      updateReadStateLoading = false
    } = this.props;
    const { poHeaderInfo, activeKey, cachTabKey, proInfoSystemWording } = this.state;
    const columns = [
      {
        dataIndex: 'proName',
        title: intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'proCode',
        title: intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号'),
        width: 130,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageName',
        title: intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'packageNo',
        title: intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号'),
        width: 150,
        render: tooltipRender,
      },
      // {
      //   dataIndex: 'demandPrtDeptName',
      //   title: intl.get(`bid.biddashbord.model.title.superiorDemandDepartment`).d('需求部'),
      //   width: 300,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'demandDeptName',
        title: intl.get(`bid.biddashbord.model.title.demandDepartment`).d('需求部门'),
        width: 300,
        render: tooltipRender,
      },
      // {
      //   dataIndex: 'productType',
      //   title: intl.get(`bid.bidcommon.view.title.typedashbord`).d('种类'),
      //   width: 200,
      //   render: tooltipRender,
      // },
      // {
      //   dataIndex: 'productName',
      //   title: intl.get(`bid.bidcommon.view.title.productname`).d('产品名称'),
      //   width: 200,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'operator',
        title: intl.get(`bid.milestonecommon.view.title.operation`).d('操作'),
        width: currentLanguage === 'zh_CN' ? 65 : 70,
        fixed: 'right',
        render: (val, record, index) => {
          return (
            <>
              <CusButton
                type="plain"
                onClick={() => this.showModel(record, index)}
              >
                {intl.get(`bid.bidcommon.bid.button.Score`).d('评分')}
              </CusButton>
            </>
          )
        },
      },
    ].filter(Boolean);
    const listProps = {
      dataSource: dataSource,
      columns,
      pagination,
      onChange: this.fetchList,
    };
    return (
      <>
        <PageWrapper loading={queryListLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
          >
            <Panel
              showArrow={false}
              collapsible="disabled"
              header={
                <PanelHeader
                  showArrow={false}
                  title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                  arrowActive={activeKey.includes('form')}
                />}
              key='form'
            >
              {/* <Menu onClick={this.changeNum} defaultSelectedKeys={['0']} mode="horizontal" style={{ marginLeft: '-16px', borderBottom: '0', marginBottom: '16px', fontSize: '14px', lineHeight: '22px', height: '26px' }}>
                <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.state.stateNum == '0' ? 'ant-menu-item-active' : '']]} key='0'>{intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}</Menu.Item>
                <Menu.Item className={[styles['ant-menu-item-selected'], styles[this.state.stateNum == '1' ? 'ant-menu-item-active' : '']]} key='1'>{intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}</Menu.Item>
              </Menu>
              <CusTable {...listProps} /> */}
              <div className={styles['tabs-pad']}>
                <CusSearchTabs
                  activeKey={cachTabKey}
                  items={[
                    {
                      label: intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中'),
                      key: '0',
                      children: <CusTable {...listProps} />,
                    },
                    {
                      label: intl.get(`bid.biddashbord.view.title.completed`).d('已完成'),
                      key: '1',
                      children: <CusTable {...listProps} />,
                    },
                  ]}
                  onChange={this.changeTabs}
                />
              </div>
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.expertprinciple`).d('评委守则')}
          visible={this.state.showRules}
          destroyOnClose
          width={1000}
          footer={[
            <CusButton
              onClick={() => {
                this.handleCancel()
              }}
              disabled={this.state.readEndFlag}
            >
              {intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
            </CusButton>,
            <CusButton
              htmlType="submit"
              type="primary"
              onClick={() => {
                this.handleOk()
              }}
              disabled={this.state.readEndFlag}
              loading={updateReadStateLoading}
            >
              {intl.get(`bid.bidcommon.bid.button.Ihavereadandconfirmedthecontentofthejudgescode`).d('我已阅读，确认评委守则内容')}
            </CusButton>
          ]}
        >
          {/* <p dangerouslySetInnerHTML={{ __html: poHeaderInfo.judgeRules }}></p> */}
          <p dangerouslySetInnerHTML={{ __html: proInfoSystemWording ? poHeaderInfo.judgeRules : poHeaderInfo.judgeRulesNew }}></p>
          <p>
            {intl.get(`bid.bidcommon.view.title.judgemessage`).d('本人承诺完全遵守上述评标工作守则。')}
            {this.state.readEndFlag && <span>({this.state.timeNum}s)</span>}
          </p>
        </CusModal>
      </>
    );
  }
}
