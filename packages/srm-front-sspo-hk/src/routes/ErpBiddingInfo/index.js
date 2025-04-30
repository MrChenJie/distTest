/*
 * index.js - ERP基本信息
 * @date: 2022/05/23 10:54:30
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Button, Card, Form, Spin, Modal, LocaleProvider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
// eslint-disable-next-line camelcase
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

import {
  // addItemsToPagination,
  // delItemsToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentLanguage,
} from 'utils/utils';
import notification from 'utils/notification';
import { queryIdpValue } from 'services/api';

// import { addItemToPagination } from 'hzero-front/lib/utils/utils';
import { getCurrentUser } from 'hzero-front/lib/utils/utils';
import BidInfo from './bidInfo';
import ContractInfo from './contractInfo';
import styles from './index.less';

const currentLanguage = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['bid.bidcommon'],
})
@connect(({ erpBiddingInfo,contractMaintain, loading }) => ({
  erpBiddingInfo,
  contractMaintain,
  erpInfo: erpBiddingInfo.erpInfo,
  erpAllInfo: erpBiddingInfo.erpAllInfo,
  panesAll: erpBiddingInfo.panesAll,
  initLoading: loading.effects['erpBiddingInfo/getErpProCode'],
  fetchLoading: loading.effects['erpBiddingInfo/getPanesAll'],

}))
export default class ErpBiddingInfo extends Component {
  constructor(props) {
    super(props);
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    const { pendingFlag } = querystring.parse(this.props.location.search.substr(1));
    this.state = {
      pendingFlag,
      open,
      isPub,
      orderMilestoneVisible: true,
      downloadContractLoading: false,
      previewContractLoading: false,
      soUrl: undefined,
      supportElectronicLovDatas: [],
      supportElectronic: false, // 支持电子签署
      contractExecutionStatusList: [],
      proId: ''
    };
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { proCode } = match.params;
    dispatch({
      type: 'erpBiddingInfo/getErpProCode',
      payload: {
        proCode: proCode
      }
    }).then((res) => {
      if(res) {
        this.setState({
          proId: res.proId
        })
        this.init();
      }
    })
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
        type: 'erpBiddingInfo/updateState',
        payload: {
          erpInfo: {}, // 头信息
          erpAllInfo: {},
          panesAll: {}
        },
      });  
  }

  @Bind()
  init() {
    this.getContentInfo();
    this.fetchEnum();
    this.getPanesAll();
  }

    /**
   * 查询详情值集
   */
     @Bind()
     fetchEnum() {
       const { dispatch } = this.props;
       dispatch({
         type: 'contractMaintain/fetchDetailEnum',
       });
     }

  /**
   * 查询订单头信息
   */
  @Bind
  getContentInfo() {
    const { dispatch } = this.props;
    const { proId } = this.state;
    dispatch({
        type: 'erpBiddingInfo/getErpInfo',
        payload: {
            proId: proId
        },
    })
  }
    
  // 获取分标包所有信息
  @Bind
  getPanesAll() {
    const { dispatch, match } = this.props;
    const { proCode } = match.params;
    dispatch({
      type: 'erpBiddingInfo/getPanesAll',
      payload: {
        procurementPlanNumber: proCode
      }
    })
  }

  @Bind
  handleSave() {
    this.getPanesAll();
  }
  @Bind
  changPanes(values,data){
    
    this.props.panesAll.packageContent = this.props.panesAll.packageContent.map((item,index)=>{
      if(item.packageNo == values.packageNo){
        item = {...values,...data}
      }
      // console.log(index, item)
      return item
    })
    // console.log('new',newdata)
    // const { dispatch } = this.props
    // dispatch({
    //   type: 'erpBiddingInfo/updateState',
    //       payload: {
    //         panesAll: newdata,
    //       },
    // })
    
  }

  render() {
    const {
      form,
      location,
      match,
      procurementContract = {},
      organizationId,
      saveLoading = false,
      initLoading = false,
      confirmLoading = false,
      editSlaLoading = false,
      querySlaLoading = false,
      contractSignLoading = false,
      fetchAttachmentLoading = false,
      deleteAttachLoading = false,
      cancelConfirmationLoading = false,
      submitLoading = false,
      deletePoConLinesLoading = false,
      queryApprovalHistoryLoading = false,
      cancelContractLoading = false,
      submitReversePoConHeaderLoading = false,
      fetchLoading = false,
      erpInfo,
      erpAllInfo,
      panesAll,
      contractMaintain: { detailEnumMap = {} },
    } = this.props;
    const { proCode, proName } = erpAllInfo;
    const {
      orderMilestoneVisible,
      downloadContractLoading,
      previewContractLoading,
      isPub,
      open,
      supportElectronic,
      contractExecutionStatusList,
      pendingFlag,
      proId
    } = this.state;

    const {
      purchaseOrderDatasource = [],
      purchaseOrderPagination = {},
      contractAttachmentDataSource = [],
      // procurementContractPagination = {},
      headerData = {},
      historyList = [],
      historyPagination = {},
      // editFlag,
    } = procurementContract;
    const editFlag =
      procurementContract.editFlag === 'N' || headerData.editFlag === 'N' ? 'N' : 'Y';
    const { contractStatus, contractId, contractExecutionStatus } = headerData;
    const { tag: contractExecutionStatusTag } =
      contractExecutionStatusList.find((item) => item.value === contractExecutionStatus) || {};
    const bidInfoProps = {
      form,
      proCode,
      proName,
    };
    const contractInfoProps = {
      form,
      match,
      erpInfo,
      detailEnumMap,
      proId,
      panesAll,
      fetchLoading,
      onSave: this.handleSave,
      onFeatch: this.getPanesAll,
      onTest:this.changPanes
    };
  //  console.log('panesAllindex',panesAll)
    let purchaseOrderMilestonesDataSource = [];
    purchaseOrderDatasource.forEach((item) => {
      if (item._status !== 'delete' && Array.isArray(item.poMilestonesList)) {
        purchaseOrderMilestonesDataSource = [
          ...purchaseOrderMilestonesDataSource,
          ...item.poMilestonesList,
        ];
      }
    });
    const purchaseOrderMilestonesPorps = {
      dataSource: purchaseOrderMilestonesDataSource,
    };
    const contractAttachmentProps = {
      editFlag,
      contractStatus,
      dataSource: contractAttachmentDataSource,
      // pagination: procurementContractPagination,
      loading: fetchAttachmentLoading || deleteAttachLoading,
      deleteAttachLoading,
      contractHeaderId: headerData.contractHeaderId,
      onAddLine: this.handleAddAttachmentLine,
      onDeleteLine: this.handleDeleteAttachmentLine,
      // onUpdateLine: this.handleUpdateAttachmentLine,
      onFileTypeChange: this.handleFileTypeChange,
      onCancel: this.handleAttachmentCancel,
      onEdit: this.handleAttachmentEdit,
      onSave: this.handleAttachmentSave,
    };

    const approvalHistoryProps = {
      dataSource: historyList,
      loading: queryApprovalHistoryLoading,
      pagination: historyPagination,
      onChange: this.handleQueryApprovalHistory,
    };
    const { search } = location;
    const { evaluateQuery } = querystring.parse(search.substr(1));
    let backPath;
    if (search && evaluateQuery === 'Y') {
      backPath = '/sodr/po-evaluate/evaluate/query';
    } else {
      backPath = '/sodr/procurement-contract';
    }
    const { authorizeFlag, stampFlag } = form.getFieldsValue();
    return (
      <>
        <Content className={styles.content}>
        <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
          {/* eslint-disable-next-line camelcase */}
          <Spin spinning={initLoading}>
            <Card
              key="bidInfo"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <h3>{intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}</h3>
              }
            >
              <BidInfo {...bidInfoProps} />
            </Card>
            <Card
              key="packageInfo"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <h3>{intl.get(`bid.bidcommon.view.title.packageinforbbxx`).d('标包信息')}</h3>
              }
            >
              <ContractInfo {...contractInfoProps} />
            </Card>
          </Spin>
          </LocaleProvider>
        </Content>
      </>
    );
  }
}
