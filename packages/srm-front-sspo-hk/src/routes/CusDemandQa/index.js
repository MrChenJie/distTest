/**
 * @Description: 需求人答疑
 * @date 2022-05-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

 import React, { Component } from 'react';
 import { connect } from 'dva';
 import { Bind, Debounce } from 'lodash-decorators';
 import { Form } from 'hzero-ui';
 import { Collapse } from 'antd';
 import {
   createPagination,
   getEditTableData,
   getCurrentOrganizationId,
 } from 'utils/utils';
 import DemandQaInfo from './demandQaInfo';
 import DemandTable from './demandTableList';
 import uuidv4 from 'uuid/v4';
 import formatterCollections from 'utils/intl/formatterCollections';
 import PageWrapper from '_cus_components/Page/PageWrapper';
 import PanelHeader from '_cus_components/CusCollapse';
 import CusButton from '_cus_components/CusButton';
 import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
 import CusExcelExport from '_cus_components/CusExcelExport';
 import CusNotification from '_cus_components/CusNotification';
 import { SRM_BID } from '@/common/config';
 
 const { Panel } = Collapse;
 const tenantId = getCurrentOrganizationId();
 @connect(({ loading, demandQaModels }) => ({
   demandQaModels,
   poHeader: demandQaModels.poHeader,
   saveDemandLoading: loading.effects['demandQaModels/saveDemand'],
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
       activeKey: ['form', 'table'],
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
            CusNotification.success();
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
             CusNotification.success();
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
       form,
       poHeader,
       demandQaModels: { demandDataSource = [], demandPagination = {} },
       saveDemandLoading = false,
       match,
       submitLoading = false,
       fetchLoading = false
     } = this.props;
     const isEdit = match.params.text === 'answer';
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
       isEdit: isEdit,
       onChange: (page) => this.handlePageChange(page),
       onPageChange: this.getDemand,
       onDataChange: this.handleDataChange,
       onEdit: (flag) => {
         this.setState({
           groupUnsaveFlag: flag,
         });
       },
     };
  
     return (
      <>
        <PageWrapper loading={fetchLoading}>
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
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <DemandQaInfo {...demandQaInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.Requesteranswer`).d('需求人答疑')}
                  arrowActive={activeKey.includes('table')}
                  buttons={
                    <>
                      {isEdit && <CusExcelExport
                        requestUrl={`${SRM_BID}/v1/${tenantId}/bid-qas/exportQueryPuestQuestionAnsList?proId=${proId}&milestoneId=${milestoneId}&type=4`}
                        downloadType="Blob"
                        fileName={intl
                          .get(`bid.bidcommon.view.title.Questionansweringoutputofthedemander`)
                          .d('需求人答疑导出')}
                        otherButtonProps={{
                          mini: true,
                          icon: null,
                        }}
                        buttonText={
                          <>
                            {intl.get('bid.bidcommon.view.button.export').d('导出')}
                          </>
                        }
                      />}
                    </>
                  }
                />
              }
              key="table"
            >
              <DemandTable {...demandTableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {match.params.text === 'answer' && !submitFlag && <CusButton
            type="primary"
            onClick={() => this.handleSubmit()}
            disabled={submitFlag}
            loading={submitLoading}
          >
            {intl.get('bid.bidcommon.view.button.submit').d('提交')}
          </CusButton>}
          {isEdit && !submitFlag && <CusButton onClick={this.handleSaveDemand} loading={saveDemandLoading} disabled={submitFlag}>
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </CusButton>}
        </CusApprovalButtons>
      </>
     );
   }
 }
 
 export default demandQa;