/*
 * index.js - ERP基本信息
 * @date: 2022/05/23 10:54:30
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusSpin from '_cus_components/CusSpin';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import querystring from 'querystring';
// eslint-disable-next-line camelcase
import { Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

// import { addItemToPagination } from 'hzero-front/lib/utils/utils';
import BidInfo from './bidInfo';
import ContractInfo from './contractInfo';
import styles from './index.less';
import eventBus from '../components/ev';
import PageMessage from '_cus_components/Page/PageMessage';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['bid.bidcommon', 'HKPC.commom'],
})
@connect(({ erpBiddingInfo,contractMaintain, loading }) => ({
  erpBiddingInfo,
  contractMaintain,
  erpInfo: erpBiddingInfo.erpInfo,
  erpAllInfo: erpBiddingInfo.erpAllInfo,
  panesAll: erpBiddingInfo.panesAll,
  initLoading: loading.effects['erpBiddingInfo/getErpProCode'],
  fetchLoading: loading.effects['erpBiddingInfo/getPanesAll'],
  saveLoading: loading.effects['contractMaintain/saveInviteSuppliers'],
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
      proId: '',
      activeKey:['bidInfo', 'packageInfo']
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
  @Debounce(500)
  save() {
    this.ContractInfoRef.handleSaveSubcontracting()
  }

  @Bind
  @Debounce(500)
  back() {
    this.ContractInfoRef.handleSaveSubcontracting((params) => {
      if(params) {
        setTimeout(() => {
          window.close();
          // 飞书提交审批后关闭tag页
          closeWindow();
        }, 4000)
      }
    })
  }

  @Bind
  changPanes(values,data){
    let newList = []
    newList = this.props.panesAll.packageContent.map((item)=>{
      if(item.packageNo == values.packageNo){
        item = {...values,...data}
      }
      return item
    })
    this.props.panesAll.packageContent = newList
    // const { dispatch } = this.props
    // dispatch({
    //   type: 'erpBiddingInfo/updateState',
    //       payload: {
    //         panesAll: newdata,
    //       },
    // })
    
  }

  @Bind
  changetab1() {
    eventBus.emit('callback', 'quotationTable', true)
  }

  @Bind
  changetab2() {
    eventBus.emit('callback', 'quotationTable', true)
  }

  render() {
    const {
      form,
      location,
      match,
      procurementContract = {},
      initLoading = false,
      fetchLoading = false,
      erpInfo,
      erpAllInfo,
      panesAll,
      saveLoading = false,
      contractMaintain: { detailEnumMap = {} },
    } = this.props;
    const { proCode, proName } = erpAllInfo;
    const {
      contractExecutionStatusList,
      proId,
      activeKey
    } = this.state;

    const {
      purchaseOrderDatasource = [],
      // procurementContractPagination = {},
      headerData = {},
      // editFlag,
    } = procurementContract;
    const { contractExecutionStatus } = headerData;
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
      erpAllInfo,
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
        <PageMessage
          message={
            intl.get('HKPC.commom.view.title.procurementPlanEdit').d('采购方案编辑')
          }
          style={{ color: '#F54A45' }}
        />
        <PageWrapper loading={false}>
          {/* eslint-disable-next-line camelcase */}
          <CusSpin spinning={initLoading}>
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
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('bidInfo')}
                />}
              key="bidInfo"
            >
              <BidInfo {...bidInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.packageinforbbxx`).d('标包信息')}
                  arrowActive={activeKey.includes('packageInfo')}
                />}
              key="packageInfo"
              className={styles.noMarginBottom}
            >
              <ContractInfo
                onRef={
                  (node) => {
                    this.ContractInfoRef = node
                  }
                }
                {...contractInfoProps} />
            </Panel>
            </Collapse>
          </CusSpin>
        </PageWrapper>
        <div>
          <CusApprovalButtons>
            <CusButton type="primary" loading={saveLoading} onClick={this.save}>
              {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
            </CusButton>
            <CusButton loading={saveLoading} onClick={this.back}>
              {intl.get(`hzero.common.button.back`).d('返回')}
            </CusButton>
          </CusApprovalButtons>
        </div>
      </>
    );
  }
}
