/**
 * index.js - 应答表
 * @date: 2022-04-07
 * @author:  <haitao.lu02shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, Tabs, Input, Form, LocaleProvider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

import { connect } from 'dva';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  FORM_COL_2_LAYOUT,
} from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import TenderDocuments from './TenderDocuments'; // 招标文件
import ContractMidlle from '../technicalDocuments/ContractMidlle'; // 技术、商务应答表
import SupplierInfos from './SupplierInfos'; // 供应商信息

const { TabPane } = Tabs;

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  queryListLoading: loading.effects['contractJudgesSorce/unitsQueryLazyTree'],
  fetchEnumLoading: loading.effects['contractJudgesSorce/fetchEnum'],
  submitting: loading.effects['contractJudgesSorce/submit'],
  queryCopyListLoading: loading.effects['contractJudgesSorce/queryCopyList'],
  getBatchCodeLoading: loading.effects['contractJudgesSorce/getCopyBatchCode'],
  contractJudgesSorce,
}))
@formatterCollections({
  code: [
    'spcm.contractJudgesSorce',
    'spcm.common',
    'entity.company',
    'entity.organization',
    'entity.business',
    'spcm.purchaseContractType',
    'entity.roles',
    'bid.bidcommon',
    'bid.biddashbord',

  ],
})
export default class JudgesSorce extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      dataSource: [],
      basicInfo: [],
      packageName: '',
      isNeedAnswer: 0,
      isNeedAnswerBusiness: 0,
      fileFlag: 0,
      tabFlag: 0,
    };
  }

  componentDidMount() {
    this.getPackageName();
    // this.fetchEnum(); // 查询值集
  }

  /**
   * getPackageName - 根据跳转带过来的packageName拿到标包名称
   */
  @Bind()
  getPackageName() {
    const { match, dispatch } = this.props;
    if (match.params.proId !== undefined) {
      dispatch({
        type: 'contractJudgesSorce/queryProjectQaInfo',
        payload: {
          proId: match.params.proId,
        },
      }).then(res => {
        this.setState({
          packageName: res.packageName,
          isNeedAnswer: res.isNeedAnswer,
          isNeedAnswerBusiness: res.isNeedAnswerBusiness,
          proInfoWording: res.proInfoWording
        })
      })
    }
  }
  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    });
  }

  @Bind()
  changeFlag() {
    this.setState({
      upFlag: false
    })
  }

  @Bind()
  callback(key) {
    // if(key == 1){ // 招标文件
    //   this.setState({ fileFlag: 0 })
    // }
    // if(key == 2){ // 投标文件
    //   this.setState({ fileFlag: 1 })
    // }
    if (key == 4) { // 技术应答表
      this.setState({
        tabFlag: 0,
        upFlag: true
      })
    }
    if (key == 5) { // 商务应答表
      this.setState({
        upFlag: true,
        tabFlag: 1
      })
    }
  }

  render() {
    const {
      match,
    } = this.props;
    const {
      tabFlag,
      upFlag,
      proInfoWording,
    } = this.state;
    const headerInfoFormProps = {
      match,
      jsTableFlag: tabFlag, // 
      flag: upFlag,
      onChangeFlag: this.changeFlag,
      proInfoWording,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        <Content>
          <Card
            key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl
                  .get(`bid.bidcommon.bid.title.EssentialInformation`)
                  .d('基本信息')}
              </h3>
            }
          >
            <Row gutter={24}>
              <Col span={24}>
                {/* <Input placeholder='基站项目' disabled /> */}
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                  {...FORM_COL_2_LAYOUT}
                >
                  <Input style={{ width: '70vw' }} placeholder='基站项目' disabled value={this.state.packageName} />
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('轮次')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('截止时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('递交投标时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col> */}
            </Row>
          </Card>
          <Row gutter={24}>
            <Col span={24}>
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Tabs defaultActiveKey="1" onChange={this.callback}>
                  <TabPane tab={this.state.proInfoWording ? 
                    intl.get(`bid.bidcommon.view.title.biddingdocumenttb`).d('投标文件')
                    : intl.get(`bid.bidcommon.view.title.biddingdocumenttbnew`).d('应答文件')} key="1"
                  >
                    <TenderDocuments {...headerInfoFormProps}/>
                  </TabPane>
                  {this.state.isNeedAnswer != 1 && <TabPane tab={intl.get(`bid.bidcommon.view.title.jishubiao`).d('技术应答表')} key="4"><ContractMidlle {...headerInfoFormProps} /></TabPane>}
                  {this.state.isNeedAnswerBusiness != 1 && <TabPane tab={intl.get(`bid.bidcommon.view.title.shangwubiao`).d('商务应答表')} key="5"><ContractMidlle {...headerInfoFormProps} /></TabPane>}
                  <TabPane tab={intl.get(`bid.bidcommon.view.title.SupplierInfor`).d('供应商信息')} key="3"><SupplierInfos {...headerInfoFormProps}/></TabPane>
                </Tabs>
              </LocaleProvider>
            </Col>
          </Row>
        </Content>
      </Fragment>
    );
  }
}
