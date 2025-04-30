/**
 * @Description: 价格提问
 * @date 2022-04-25
 * @author <haitao.lu02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import CusModal from '_cus_components/CusModal';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import uuidv4 from 'uuid/v4';
import { getEditTableData } from 'utils/utils';
import ProjectQaInfo from './projectQaInfo';
import formatterCollections from 'utils/intl/formatterCollections';
import BiddingRound from './biddingRound';
import PurchaseReplyTable from './purchaseReply';
import CusNotification from '_cus_components/CusNotification';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'hzero-front/lib/utils/utils';

const { Panel } = Collapse;
@connect(({ loading, projectQaModels }) => ({
  projectQaModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  fetchListLoading: loading.effects['projectQaModels/priceQaList'],
  submitLoading: loading.effects['projectQaModels/submitPrice'],
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
  ],
})
@Form.create({ fieldNameProp: null })
class priceQa extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [
        'projectQaInfo',
        'biddingRound',
        'purchaseReplyTable',
      ],
      timeFlag: false,
      submitFlag: false,
      groupUnsaveFlag: false,
      selectedRowList:[],
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
    data.map((item, index) => {
      purchaseReplyDataSource[index].qaContent = item.qaContent
    })
    // console.log('123',data,purchaseReplyDataSource)
    if (data.length > 0) {
      let newPurchaseReplyDataSource = purchaseReplyDataSource.sort();
      dispatch({
        type: 'projectQaModels/saveClarification',
        payload: {
          data: newPurchaseReplyDataSource,
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
                CusNotification.success();
              }
              this.getPurchaseReply();
            } else {
              CusNotification.success();
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
      CusModal.confirm({
        content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okType:'normal',
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
          this.setState({
            selectedRowList: []
          })
          CusNotification.success();
        },
      });
    } else {
      CusNotification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 添加CMI答复内容行
   *
   * @memberof PurchaseReplyTable
   */
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
        CusNotification.success();
        this.setState({
          selectedRowList: []
        })
        this.getPurchaseReply();
        this.queryProjectQaInfo();
        this.queryProjectQaMilestonesInfo();
      }
    })
  }

  // 父调子
  @Bind
  handleAddLine() {
    this.PurchaseReplyTable.handleAddLine()
  }

  @Bind
  handleDeleteLine() {
    this.PurchaseReplyTable.handleDeleteLine()
  }

  render() {
    const {
      form,
      projectQaModels: {
        purchaseReplyDataSource = [],
        purchaseReplyPagination = {},
      },
      poHeaderInfo,
      poHeaderMilestonesInfo,
      match,
      submitLoading = false,
      fetchListLoading = false,
    } = this.props;
    const { activeKey, timeFlag, submitFlag, groupUnsaveFlag, selectedRowList } = this.state;
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
      onCheckRow: (rows) => {
        this.setState({
          selectedRowList: rows
        })
      },
    };

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <>
        <PageWrapper loading={submitLoading || fetchListLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={this.onCollapseChange}>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl
                    .get(`bid.bidcommon.bid.title.EssentialInformation`)
                    .d('基本信息')}
                  arrowActive={activeKey.includes('projectQaInfo')}
                />}
              key="projectQaInfo"
            >
              <ProjectQaInfo {...projectQaInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.bidzbluncirr`).d('招标轮次')}
                  arrowActive={activeKey.includes('biddingRound')}
                />}
              key="biddingRound"
            >
              <BiddingRound {...biddingRoundInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.milestonecommon.view.title.priceclarification`).d('价格澄清')}
                  arrowActive={activeKey.includes('purchaseReplyTable')}
                  buttons={
                    <>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {((!(!timeFlag || submitFlag)) && selectedRowList.length > 0) && <CusButton
                      mini
                      onClick={this.handleDeleteLine}
                    >
                      {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                    </CusButton>}
                        {!(!timeFlag || submitFlag) && <CusButton mini onClick={this.handleAddLine}>
                          {intl.get('bid.bidcommon.view.button.add').d('添加')}
                        </CusButton>}
                      </div>
                    </>
                  }
                />}
              key="purchaseReplyTable"
            >
              {true && <PurchaseReplyTable {...purchaseReplyTableProps} onRef={(node) => (this.PurchaseReplyTable = node)} />}
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {!(!timeFlag || submitFlag) && <CusButton
            type="primary"
            onClick={() => this.handleSavePurchaseReply('submit')}
          >
            {intl.get('bid.bidcommon.view.button.submit').d('提交')}
          </CusButton>}
          {!(!timeFlag || submitFlag) && <CusButton onClick={this.handleSavePurchaseReply}>
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </CusButton>}
        </CusApprovalButtons>
      </>
    );
  }
}

export default priceQa;
