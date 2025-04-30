/**
 * index.js - 综合评分汇总
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Table, Card, Form, Input, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification'; 
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';

let priceFlag = false
const organizationId = getCurrentOrganizationId();
const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, contractMaintain = {}, contractTechnicalMerit = {},projectQaModels }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  contractMaintain,
  contractTechnicalMerit,
  projectQaModels
}))
export default class ScoreListAll extends Component {
  state = {
    dataRegistration: {},
    list: [],
    listHead: {
      proName: '',
      proCode: '',
      packageNo: '',
      packageName: ''
    },
    milState: '',
  };

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.queryProjectQaInfo();//
  }

      /**
   * 查询基本头信息
   */
       @Bind
       queryProjectQaInfo() {
         const { dispatch, match } = this.props;
         const { proId } = match.params;
         dispatch({
           type: 'projectQaModels/queryProjectQaInfo',
           payload: {
             proId: proId,
           },
         });
       }
     

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page={}) {
    const { dispatch, match } = this.props;

    dispatch({
      type: 'contractMaintain/getSupplierApprovalTableList',
      payload: {
        proId: match.params.proId,
      },
    }).then(res=>{
      console.log(res.content)

      if (res) {
        this.setState({
          // list: res.content,
          listHead: res.content
        })
    }})
    dispatch({
      type: 'contractMaintain/getListAll',
      payload: {
        proId: match.params.proId,
        page
      },
    }).then(res => {
      if (res) {
        this.setState({
          list: res.content,
          // listHead: res.content[0]
        })
      }
    });
    this.getMilestoneInfo();
  }
  /**
   * 查询里程碑
   */
  @Bind
  getMilestoneInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getMilestoneInfo',
      payload: {
        milestoneId: match.params.milestoneId
      },
    }).then(res => {
      if (res) {
        this.setState({ milState: res.milestoneState });
      }
    })
  }
  @Bind
  finish(){
   const {dispatch, match} = this.props
   dispatch({
     type: 'contractMaintain/finishList',
     payload: {
       milestoneId: match.params.milestoneId,
       
     },
   }).then(res=>{
     if(res) {
      this.getMilestoneInfo();
      notification.success();
     }
   })
  }

  render() {
    const { contractMaintain,projectQaModels } = this.props;
    const { paginationN } = contractMaintain;
    const {poHeaderInfo} = projectQaModels
    const { list, listHead, milState } = this.state
    if(poHeaderInfo.priceSecret === 'NO' && poHeaderInfo.specialPrice === 'NO' ){
      priceFlag = true
    }
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.technicalscore`).d('技术得分'),
        dataIndex: 'tenRateScoreStr',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.pricescore`).d('价格得分'),
        dataIndex: 'priceRateScoreStr',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.comprehensivescore`).d('综合得分'),
        dataIndex: 'totalScoreStr',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.ranking`).d('综合排名'),
        dataIndex: 'totalRank',
        width: 150,
      },
      {
        title: poHeaderInfo.proInfoWording ?
          intl.get(`bid.bidcommon.view.title.finalprice`).d('最后投标价')
          : intl.get(`bid.bidcommon.view.title.finalpricenew`).d('最后报价'),
        dataIndex: 'confirmPricePlaceHoder',
        width: 150,
      },
      priceFlag && {
        title: intl.get(`bid.bidcommon.view.title.currency`).d('币种'),
        dataIndex: 'priceCurrency',
        width: 150,
      }
    ].filter(Boolean);


    const {
      form: { getFieldDecorator },
      match
    } = this.props;
    const {
      proName = '',
      proCode = '',
      packageNo = '',
      packageName = '',
    } = listHead
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        {milState && milState !== 'affirmed' && <Header>
          <Button type="primary" onClick={this.finish}>
            {intl.get(`bid.bidcommon.view.button.qrzhhz`).d('确认综合汇总')}
          </Button>
        </Header>}
        <Content>
          <Card
            key="contractHeaderInformation"
            id="registrantionInformation"
            bordered={false}
            title={<h3>{intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}</h3>}
          >
            <Form layout="inline">
              <Form.Item className={styles['labelStyle']}
                label={intl
                  .get('bid.bidcommon.view.title.purchaseschemename')
                  .d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: proName || '',
                })(<Input style={{ width: '15vw' }} disabled />)}
              </Form.Item>
              <Form.Item className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
              >
                {getFieldDecorator('packageName', {
                  initialValue: packageName || '',
                })(<Input style={{ width: '15vw' }} disabled />)}
              </Form.Item>
              <Form.Item className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
              >
                {getFieldDecorator('packageNo', {
                  initialValue: packageNo || '',
                })(<Input style={{ width: '15vw' }} disabled />)}
              </Form.Item>
              <Form.Item className={styles['labelStyle']}
                label={intl
                  .get('bid.bidcommon.view.title.purchaseschemeno')
                  .d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: proCode || '',
                })(<Input style={{ width: '15vw' }} disabled />)}
              </Form.Item>
            </Form>
          </Card>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zh_CN : undefined}>
            <Table
              // rowKey="auditDataId"
              bordered
              columns={columns}
              dataSource={list}
              pagination={paginationN}
              // loading={loading}
              onChange={this.fetchList}
            />
          </LocaleProvider>
        </Content>
      </Fragment>
    );
  }
}
