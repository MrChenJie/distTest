import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import {
  getEditTableData,
  addItemsToPagination,
  delItemsToPagination,
  createPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';
import TraderslList from './TradersList';
import StageList from './StageList';

const { Panel } = Collapse;

@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.ACTIVITY_STATUS'])
@connect(({ loading, bidManagementListModal }) => ({
  bidManagementListModal,
  queryLoading: loading.effects['bidManagementListModal/queryDetail'],
  tradeLoading: loading.effects['bidManagementListModal/queryTradersListDetail'],
  stageLoading: loading.effects['bidManagementListModal/queryStageListDetail'],
  matLoading: loading.effects['bidManagementListModal/queryListDetail'],
  detailList: bidManagementListModal.detailList,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      match,
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { formRecordId } = match.params;
    this.state = {
      formRecordId,
      isPub,
      activeKey: ['form', 'productTable', 'tradersTable', 'stageTable'],
      code: 'BID.TEC_BUSINESS_CONFIGS',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
    };
  }

  componentDidMount() {
    this.queryDetail();
    this.queryProductListDetail();
    this.queryTradersListDetail();
    this.queryStageListDetail();
  }

  // 活动基本信息
  queryDetail = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'bidManagementListModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res
        })
      }
    });
  };

  // 商品详情
  queryProductListDetail = (page = {}) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'bidManagementListModal/queryListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('商品详情', res)
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'bidManagementListModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            productDetailPagination: pagination,
          },
        });
      }
    });
  }

  // 查询邀请贸易商
  queryTradersListDetail = (page = {}) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'bidManagementListModal/queryTradersListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'bidManagementListModal/updateState',
          payload: {
            tradersDetailSource: newDataSource,
            tradersDetailPagination: pagination,
          },
        });
      }
    });
  }

  // 竞价阶段
  queryStageListDetail = (page = {}) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'bidManagementListModal/queryStageListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'bidManagementListModal/updateState',
          payload: {
            stageDetailSource: newDataSource,
            stageDetailPagination: pagination,
          },
        });
      }
    });
  }

  @Bind()
  handleDeleteLine = () => {
    const { dispatch, bidManagementListModal } = this.props;
    const { tradersDetailSource, tradersDetailPagination } = bidManagementListModal;
    const { selectedRowKeys, selectedRows } = this.state;
    if(selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = tradersDetailSource.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          const isSendMail = deleteData.every((item) => {
            return item.isSendMail === 'N'
          });
          console.log('isSendMail', isSendMail);
          if(isSendMail) {
            // 后台删除
            dispatch({
              type: 'bidManagementListModal/deleteTradeLine',
              payload: deleteData
            }).then((res) => {
              if(res) {
                CusNotification.success({
                  message: intl.get('hzero.common.notification.success.delete').d('删除成功')
                })
                this.queryTradersListDetail();
              }
            })
          } else {
            CusNotification.error({
              message: intl.get('spfmhk.trade.view.verifytip.traderdelete').d('该贸易商已邀请，禁止刪除'),
            });
          }
        } else {
          // 本地删除
          const newDataSource = tradersDetailSource.filter((item) => !selectedRowKeys.includes(item['rowKey']));
          const delItemsLength = tradersDetailSource.length - newDataSource.length;
          const newPagination = delItemsToPagination(delItemsLength, tradersDetailSource.length, tradersDetailPagination);
          dispatch({
            type: 'bidManagementListModal/updateState',
            payload: {
              tradersDetailSource: newDataSource,
              tradersDetailPagination: newPagination,
            },
          });
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  @Bind()
  handleAddLine = () => {
    const { dispatch, bidManagementListModal } = this.props;
    const { tradersDetailSource = [], tradersDetailPagination = {} } = bidManagementListModal;
    const { formRecordId } = this.state;
    const newDataSource = [
      {
        refHeadId: formRecordId,
        rowKey: uuidv4(),
        _status: 'create',
      },
      ...tradersDetailSource
    ]
    const newPagination = addItemsToPagination(tradersDetailSource.length, tradersDetailPagination);
    dispatch({
      type: 'bidManagementListModal/updateState',
      payload: {
        tradersDetailSource: newDataSource,
        tradersDetailPagination: newPagination,
      },
    });
  }

  // 保存邀请的供应商
  @Bind()
  handleSaveLine = () => {
    const { dispatch, bidManagementListModal } = this.props;
    const { tradersDetailSource } = bidManagementListModal;
    const validateData = getEditTableData(tradersDetailSource, ['rowKey']);
    if (Array.isArray(validateData) && validateData.length === 0) {
      return;
    }
    dispatch({
      type: 'bidManagementListModal/saveTraders',
      payload: validateData,
    }).then((res) => {
      if(res) {
        CusNotification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功')
        })
        this.queryTradersListDetail();
        this.queryStageListDetail();
      }
    })
  }

  render() {
    const {
      queryLoading = false,
      detailList = {},
      idpValueMap,
      bidManagementListModal,
      tradeLoading = false,
      stageLoading = false,
      matLoading = false,
    } = this.props;
    const {
      activeKey,
      selectedRows,
      selectedRowKeys,
      headerInfo,
    } = this.state;
    const basicFormProps = {
      ...this.props,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const detailListrops = {
      ...this.props,
      idpValueMap,
      onChange: this.queryProductListDetail
    };

    const tradersListrops = {
      ...this.props,
      rowSelection,
      headerInfo,
      onChange: this.queryTradersListDetail
    }

    const stageListProps = {
      ...this.props,
      tradeLoading,
      headerInfo,
      onChange: this.queryStageListDetail,
      onSearch: this.queryTradersListDetail
    }

    return (
      <PageWrapper loading={queryLoading || tradeLoading || stageLoading || matLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.BasicInfor`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicForm {...basicFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.ProduInfor`).d('商品详情')}
                arrowActive={activeKey.includes('productTable')}
              />
            }
            key="productTable"
          >
            <DetailList {...detailListrops} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.TradeInvite`).d('邀请贸易商')}
                arrowActive={activeKey.includes('tradersTable')}
                buttons={
                  <>
                    {headerInfo?.actStatus === 'InProgress' && <div>
                      <CusButton
                        mini
                        onClick={this.handleSaveLine}
                      >
                        {intl.get('hzero.common.view.button.save').d('保存')}
                      </CusButton>
                      <CusButton
                        mini
                        onClick={this.handleDeleteLine}
                      >
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                      <CusButton
                        mini
                        type="primary"
                        onClick={this.handleAddLine}
                      >
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </div>}
                  </>
                }
              />
            }
            key="tradersTable"
          >
            <TraderslList {...tradersListrops} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.field.Bidstage.Set`).d('竞价阶段设置')}
                arrowActive={activeKey.includes('stageTable')}
              />
            }
            key="stageTable"
          >
            <StageList {...stageListProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
