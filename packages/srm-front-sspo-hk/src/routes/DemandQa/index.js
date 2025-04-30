/**
 * @Description: 需求人答疑
 * @date 2022-05-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form, Button, LocaleProvider, Spin, Collapse } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import notification from 'utils/notification';
import {
  getCurrentLanguage,
  createPagination,
  getEditTableData,
} from 'utils/utils';
import DemandQaInfo from './demandQaInfo';
import DemandTable from './demandTableList';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';

const { Panel } = Collapse;
@connect(({ loading, demandQaModels }) => ({
  demandQaModels,
  poHeader: demandQaModels.poHeader,
  saveDemandLoading: loading.effects['demandQaModels/saveDemand'],
  revokeLoading: loading.effects['demandQaModels/revoke'],
  submitLoading: loading.effects['demandQaModels/demandSubmit'],
  fetchLoading: loading.effects['demandQaModels/fetchDemandList'],
}))
@formatterCollections({
  code: ['bid.bidcommon'],
})
@Form.create({ fieldNameProp: null })
class demandQa extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['demandQaInfo', 'demandTable'],
      demandDataSource: [],
      demandPagination: {},
      groupUnsaveFlag: false,
      submitFlag: false
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
        type: 'demandQaModels/updateState',
        payload: {
          poHeader: {}, // 头信息
        },
      });  
  }

  @Bind
  init() {
    this.getDemand();
    this.queryDemandInfo();
    this.getCheckIsAllQaPublished();
  }

  // 获取需求人是否已提交
  @Bind
  getCheckIsAllQaPublished() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    dispatch({
      type: 'demandQaModels/checkIsAllQaPublished',
      payload: {
        milestoneId
      }
    }).then((res) => {
      if (res) {
        this.setState({
          submitFlag: res.isAllPublished === 'y'
        })
        // if (res.isAllPublished === 'y') {
        //   this.setState({ groupUnsaveFlag: false })
        // } else {
        //   this.setState({ groupUnsaveFlag: true })
        // }
      }
    })
  }

  // 获取需求人答疑数据
  @Bind
  getDemand(page = {}) {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params
    dispatch({
      type: 'demandQaModels/fetchDemandList',
      payload: {
        page,
        proId: proId,
        milestoneId: milestoneId,
        type: 4, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'demandQaModels/updateState',
          payload: {
            demandDataSource: newDataSource,
            demandPagination: pagination,
          },
        });
        // let num = 0
        // newDataSource.map((item) => {
        //   if (item.publishedToJudge === 'y') {
        //     num++;
        //   }
        // })
        // if (num === newDataSource.length) {
        //   this.setState({ groupUnsaveFlag: false });
        // } else {
        //   this.setState({ groupUnsaveFlag: true });
        // }
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  handleSaveDemand() {
    const { demandQaModels, dispatch } = this.props;
    const { demandDataSource = [] } = demandQaModels;
    const data = getEditTableData(demandDataSource);
    if (data.length > 0) {
      return new Promise((resolve, reject) => {
        dispatch({
          type: 'demandQaModels/saveDemand',
          payload: {
            data,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.getDemand();
            resolve(res);
          } else {
            reject();
          }
        });
      })
    } else {
      return Promise.reject();
    }
  }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

    /**
   * 查询订单头信息
   */
  @Bind
  queryDemandInfo() {
    const { dispatch, match } = this.props;
    const { proId } = match.params
    dispatch({
        type: 'demandQaModels/queryDemandInfo',
        payload: {
            proId: proId
        },
    })
  }

  @Bind
  handleSubmit() {
    const { dispatch, match, demandQaModels } = this.props;
    const { proId, milestoneId } = match.params;
    const { demandDataSource = [] } = demandQaModels;
    // const data = getEditTableData(demandDataSource);
    // if(data.length > 0) {
    this.handleSaveDemand().then((res) => {
      if(res) {
        dispatch({
          type: 'demandQaModels/demandSubmit',
          payload: {
            proId: proId, // 项目Id
            milestoneId: milestoneId, // 里程碑Id
          },
        }).then((res) => {
          if(res) {
            notification.success();
            this.getCheckIsAllQaPublished();
            this.getDemand();
          }
        })
      }
    })
    // }
  }

  @Bind
  editPermisssion() {
    const { match } = this.props;
    return match.params.text === 'answer' ? true : false
  }

  render() {
    const {
      revokeLoading = false,
      form,
      poHeader,
      demandQaModels: { demandDataSource = [], demandPagination = {} },
      saveDemandLoading = false,
      match,
      submitLoading = false,
      fetchLoading = false
    } = this.props;
    const { proId, milestoneId } = match.params;
    const { activeKey, groupUnsaveFlag, submitFlag = false } = this.state;
    const demandQaInfoProps = {
      form,
      poHeader
    };
    const demandTableProps = {
      proId,
      milestoneId,
      fetchLoading: fetchLoading,
      dataSource: demandDataSource,
      pagination: demandPagination,
      saveLoading: saveDemandLoading,
      unsaveFlag: groupUnsaveFlag,
      submitFlag,
      isEdit: match.params.text === 'answer',
      onSave: this.handleSaveDemand,
      onChange: (page) => this.handlePageChange(page),
      onPageChange: this.getDemand,
      onDataChange: this.handleDataChange,
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
    };

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        {match.params.text === 'answer' && <Header>
          <div style={{ marginRight: '16px' }}>
            <Button
              onClick={() => this.handleSubmit()}
              loading={submitLoading}
              disabled={submitFlag}
            >
              {intl.get('bid.bidcommon.view.button.submit').d('提交')}
            </Button>
          </div>
        </Header>}
        <Content className="content-bottom">
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Spin spinning={revokeLoading}>
                <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                  <Panel
                    header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                    key="demandQaInfo"
                  >
                    <DemandQaInfo {...demandQaInfoProps} />
                  </Panel>
                  <Panel
                    header={intl.get(`bid.bidcommon.view.title.Requesteranswer`).d('需求人答疑')}
                    key="demandTable"
                  >
                    <DemandTable {...demandTableProps} />
                  </Panel>
                </Collapse>
              </Spin>
            </div>
          </LocaleProvider>
        </Content>
      </Fragment>
    );
  }
}

export default demandQa;