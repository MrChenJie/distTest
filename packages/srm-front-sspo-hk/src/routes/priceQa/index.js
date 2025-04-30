/**
 * @Description: 价格提问
 * @date 2022-04-25
 * @author <haitao.lu02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form, Button, LocaleProvider, Spin, Collapse, Modal } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import styles from './index.less';
import uuidv4 from 'uuid/v4';
import { getCurrentLanguage, getEditTableData, getCurrentUser } from 'utils/utils';
import ProjectQaInfo from './projectQaInfo';
import formatterCollections from 'utils/intl/formatterCollections';
import BiddingRound from './biddingRound';
import PurchaseReplyTable from './purchaseReply';
import notification from 'utils/notification';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'hzero-front/lib/utils/utils';

const ROW_KEY = 'qaId';
const { Panel } = Collapse;
@connect(({ loading, projectQaModels }) => ({
  projectQaModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  revokeLoading: loading.effects['projectQaModels/revoke'],
  submitLoading: loading.effects['projectQaModels/submitPrice'],
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
    'sodr.purchaseOrder',
  ],
})
@Form.create({ fieldNameProp: null })
class priceQa extends Component {
  constructor(props) {
    super(props);
    // const {
    //   match
    // } = this.props;
    // 只读界面
    // const isViewOnly = match.path.includes('viewOnly');
    // 判断是否汇总页面跳转过来
    // const { isSummary = false } = state;
    this.state = {
      activeKey: [
        'projectQaInfo',
        'biddingRound',
        'purchaseReplyTable',
      ],
      timeFlag: false,
      submitFlag: false,
      groupUnsaveFlag: false
    };
  }

  componentDidMount() {
    this.init();
  }

  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'projectQaModels/updateState',
  //     payload: {
  //       poHeaderInfo: {}, // 头信息
  //       poHeaderMilestonesInfo: {},
  //     },
  //   });
  // }

  @Bind
  init() {
    this.getPurchaseReply();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
  }

  /**
   * 查询基本头信息
   */
  @Bind
  queryProjectQaInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/queryProjectQaInfo',
      payload: {
        proId: match.params.proId,
      },
    });
  }

  /**
   * 查询轮次信息
   */
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    const newDateTime = new Date().getTime();
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        const endTime = Date.parse(new Date(res.milestoneEndTime))
        if (newDateTime < endTime) {
          this.setState({
            timeFlag: true,
          });
        }
        this.setState({
          submitFlag: res.priceClassfyPublished === 'y'
        })
      }
    })
  }

  // 获取CMI答复内容数据
  @Bind
  getPurchaseReply(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/priceQaList',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
        // type: 2, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            purchaseReplyDataSource: newDataSource,
            purchaseReplyPagination: pagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }


  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  handleSavePurchaseReply(flag) {
    const { dispatch, projectQaModels } = this.props;
    const { purchaseReplyDataSource = [] } = projectQaModels;
    const data = getEditTableData(purchaseReplyDataSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    data.map((item,index)=>{
      purchaseReplyDataSource[index].qaContent  = item.qaContent 
    })
    // console.log('123',data,purchaseReplyDataSource)
    if (data.length > 0) {
      let newPurchaseReplyDataSource = purchaseReplyDataSource.sort();
      dispatch({
        type: 'projectQaModels/saveClarification',
        payload: {
          data:newPurchaseReplyDataSource,
        },
      }).then((resData) => {
        let newResData = resData.sort();
        if (resData) {
          dispatch({
            type: 'projectQaModels/saveClarificationAnswers',
            payload: {
              resData: newResData,
            },
          }).then((res) => {
            if (res) {
              if (flag === 'submit') {
                this.handleSubmit();
              } else {
                notification.success();
              }
              this.getPurchaseReply();
            } else {
              notification.success();
              this.getPurchaseReply();
            }
          
          })
    }
  })
}
  }

// 删除行
@Bind
handleDeleteGroupLine(selectedRowKeys, selectedRows, callback) {
  const { projectQaModels, dispatch } = this.props;
  const { purchaseReplyDataSource = [], purchaseReplyPagination = {} } = projectQaModels;
  const newDataSource = selectedRows;
  const deleteData = selectedRows;

  const data = selectedRows.filter((item) => item._status === 'update');
  if (deleteData.length > 0) {
    Modal.confirm({
      title: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
      okText: intl.get('bid.bidcommon.view.title.sure').d('确定'),
      cancelText: intl.get('bid.bidcommon.view.button.cancel').d('取消'),
      onOk: () => {
        let deleteNewDataList = [];
        let newDataList = purchaseReplyDataSource;
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
          } else {
            // 删除本地数据
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
            type: 'projectQaModels/deletePriceQa',
            payload: {
              data: [...data],
            },
          })
        }
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            purchaseReplyDataSource: newDataList,
          },
        });
        notification.success();
        // let newDataList = purchaseReplyDataSource
        // for (let i of deleteData) {
        //   if (i._status === 'update') {
        //     const data = [i]
        //     dispatch({
        //       type: 'projectQaModels/deletePriceQa',
        //       payload: {data}
        //     })
        //   }
        //  newDataList = newDataList.filter((item) => item.poOrderId !== i.poOrderId);
        // }
        // dispatch({
        //   type: 'projectQaModels/updateState',
        //   payload: {
        //     purchaseReplyDataSource: newDataList,
        //   },
        // });
      },
    });
  } else {
    notification.warning({
      message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
    });
  }
}



// /**
//  * 添加CMI答复内容行
//  *
//  * @memberof PurchaseReplyTable
//  */
@Bind
handleAddPurchaseReplyLine() {
  const { projectQaModels, dispatch, match } = this.props;
  const { proId, milestoneId } = match.params;
  const { purchaseReplyDataSource = [], purchaseReplyPagination = {} } = projectQaModels;
  const newLine = {
    _status: 'create',
    // type: 3,
    organizationId: getCurrentOrganizationId(),
    poOrderId: uuidv4(),
    proId: proId, // 项目ID
    milestoneId: milestoneId, // 里程碑ID
  };
  const newDataSource = [...purchaseReplyDataSource, newLine];
  const newPagination = addItemToPagination(
    purchaseReplyDataSource.length,
    purchaseReplyPagination
  );
  dispatch({
    type: 'projectQaModels/updateState',
    payload: {
      purchaseReplyDataSource: newDataSource,
      purchaseReplyPagination: newPagination,
    },
  });
}




// 提交
@Debounce(200)
@Bind
handleSubmit() {
  const { dispatch, match } = this.props;
  dispatch({
    type: 'projectQaModels/submitPrice',
    payload: {
      proId: match.params.proId, // 项目Id
      milestoneId: match.params.milestoneId, // 里程碑Id
    },
  }).then((res) => {
    if (res) {
      notification.success();
      this.getPurchaseReply();
      this.queryProjectQaInfo();
      this.queryProjectQaMilestonesInfo();
    }
  })
}

render() {
  const {
    revokeLoading = false,
    form,
    projectQaModels: {
      purchaseReplyDataSource = [],
      purchaseReplyPagination = {},
    },
    poHeaderInfo,
    poHeaderMilestonesInfo,
    match,
    submitLoading = false
  } = this.props;
  const { activeKey, timeFlag, submitFlag, groupUnsaveFlag } = this.state;
  const projectQaInfoProps = {
    form,
    poHeaderInfo,
  };
  const biddingRoundInfoProps = {
    form,
    poHeaderMilestonesInfo,
  };
  const flagShow = poHeaderInfo.specialPrice !== 'YES' && poHeaderInfo.priceSecret !== 'YES'
  const purchaseReplyTableProps = {
    form,
    match,
    dataSource: purchaseReplyDataSource,
    pagination: purchaseReplyPagination,
    isShow: flagShow,
    timeFlag,
    submitFlag,
    onAddLine: this.handleAddPurchaseReplyLine,
    onDeleteLine: this.handleDeleteGroupLine,
    onSave: this.handleSavePurchaseReply,
    onPageChange: this.getPurchaseReply, // 分页查询
    unsaveFlag: groupUnsaveFlag, // 校验切换分页前是否存在未保存数据
    onEdit: (flag) => {
      this.setState({
        groupUnsaveFlag: flag,
      });
    },
  };


  const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
  return (
    <Fragment>
      <Header>
        <div style={{ marginRight: '16px' }} >
          <Button
            type="primary"
            onClick={() => this.handleSavePurchaseReply('submit')}
            disabled={!timeFlag || submitFlag}
            loading={submitLoading}
          >
            {intl.get('bid.bidcommon.view.button.submit').d('提交')}
          </Button>
        </div>
      </Header>
      <Content className="content-bottom">
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <div>
            <Spin spinning={revokeLoading}>
              <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                <Panel
                  header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  key="projectQaInfo"
                >
                  <ProjectQaInfo {...projectQaInfoProps} />
                </Panel>
                <Panel
                  header={intl.get(`bid.bidcommon.view.title.round`).d('招标轮次')}
                  key="biddingRound"
                >
                  <BiddingRound {...biddingRoundInfoProps} />
                </Panel>
                <Panel
                  header={intl.get(`bid.milestonecommon.view.title.priceclarification`).d('价格澄清')}
                  key="purchaseReplyTable"
                >
                  <PurchaseReplyTable {...purchaseReplyTableProps} />
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

export default priceQa;
