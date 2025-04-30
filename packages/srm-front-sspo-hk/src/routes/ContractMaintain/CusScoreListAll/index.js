/**
 * index.js - 综合评分汇总
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Input, Collapse, Row, Col } from 'antd';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';
import { SRM_BID } from '@/common/config';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import CusNotification from '_cus_components/CusNotification';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusExcelExport from '_cus_components/CusExcelExport';
import PanelHeader from '_cus_components/CusCollapse';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { tooltipRender } from '_cus_utils/render';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';

let priceFlag = false
const gridSpan = getDFormGridSpan();
const { Panel } = Collapse;

@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'HKPC.commom'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, contractMaintain = {}, contractTechnicalMerit = {},projectQaModels }) => ({
  fetchListLoading: loading.effects['contractMaintain/getListAll'],
  getMilestoneInfoLoading: loading.effects['contractTechnicalMerit/getMilestoneInfo'],
  contractMaintain,
  contractTechnicalMerit,
  projectQaModels
}))
export default class ScoreListAll extends Component {
  state = {
    list: [],
    listHead: {
      proName: '',
      proCode: '',
      packageNo: '',
      packageName: ''
    },
    milState: '',
    activeKey: ['form', 'table']
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
    const { proId } = match.params;
    dispatch({
      type: 'contractMaintain/getSupplierApprovalTableList',
      payload: {
        proId: proId,
      },
    }).then(res=>{
      if (res) {
        this.setState({
          listHead: res.content
        })
    }})
    dispatch({
      type: 'contractMaintain/getListAll',
      payload: {
        proId: proId,
        page
      },
    }).then(res => {
      console.log('list==', res)
      if (res) {
        this.setState({
          list: res.content,
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
    const { milestoneId } = match.params;
    dispatch({
      type: 'contractTechnicalMerit/getMilestoneInfo',
      payload: {
        milestoneId: milestoneId
      },
    }).then(res => {
      if (res) {
        this.setState({ milState: res.milestoneState });
      }
    })
  }
  @Bind
  finish(){
    const {dispatch, match} = this.props;
    const { milestoneId, proId } = match.params;
    dispatch({
      type: 'contractMaintain/getCheckSummary',
      payload: {
        proId,
      }
    }).then((res) => {
      if(res) {
        if(res?.msg === 'price_file_total') {
          CusNotification.warning({
            message: intl.get(`HKPC.commom.view.title.pricenotconfirmed`).d('价格评分汇总未确认'),
          });
        } else if(res?.msg === 'total_ten_score') {
          CusNotification.warning({
            message: intl.get(`HKPC.commom.view.title.technotconfirmed`).d('技术评分汇总未确认'),
          });
        } else if(res?.msg === 'all') {
          CusNotification.warning({
            message: intl.get(`HKPC.commom.view.title.allnotconfirmed`).d('价格和技术评分汇总未确认'),
          });
        } else {
          dispatch({
            type: 'contractMaintain/finishList',
            payload: {
              milestoneId: milestoneId,
            },
          }).then(res=>{
            if(res) {
              this.getMilestoneInfo();
              CusNotification.success();
            }
          })
        }
      }
    })
  }

  render() {
    const {
      match,
      contractMaintain,
      projectQaModels,
      fetchListLoading = false,
      getMilestoneInfoLoading = false,
    } = this.props;
    const { paginationN } = contractMaintain;
    const { poHeaderInfo } = projectQaModels
    const {
      list,
      listHead,
      milState,
      activeKey,
    } = this.state
    if(poHeaderInfo.priceSecret === 'NO' && poHeaderInfo.specialPrice === 'NO' ){
      priceFlag = true
    }
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
        dataIndex: 'supplierName',
        width: 610,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.technicalscore`).d('技术得分'),
        dataIndex: 'tenRateScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 147,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.pricescore`).d('价格得分'),
        dataIndex: 'priceRateScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 120,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.comprehensivescore`).d('综合得分'),
        dataIndex: 'totalScoreStr',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 189,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.ranking`).d('综合排名'),
        dataIndex: 'totalRank',
        width: getCurrentLanguage() === 'zh_CN' ? 90 : 95,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.finalprice`).d('最后投标价'),
        dataIndex: 'confirmPricePlaceHoder',
        width: getCurrentLanguage() === 'zh_CN' ? 106 : 118,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{record}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.finalpricehkd`).d('最后投标价（HKD）'),
        dataIndex: 'confirmPricePlaceHoderHkd',
        width: getCurrentLanguage() === 'zh_CN' ? 106 : 118,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{record}</div>;
        },
      },
      priceFlag && {
        title: intl.get(`bid.bidcommon.view.title.currency`).d('币种'),
        dataIndex: 'priceCurrency',
        width: getCurrentLanguage() === 'zh_CN' ? 55 : 105,
      }
    ].filter(Boolean);


    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      proName = '',
      proCode = '',
      packageNo = '',
      packageName = '',
    } = listHead

    return (
      <>
        <PageWrapper loading={fetchListLoading || getMilestoneInfoLoading}>
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
              <Form className="customize-form">
                <Row>
                  <GenerateFormGrid isPackUp={false}>
                    <Col {...gridSpan}>
                      <Form.Item
                        label={intl
                          .get('bid.bidcommon.view.title.purchaseschemename')
                          .d('采购方案名称')}
                      >
                        {getFieldDecorator('proName', {
                          initialValue: proName || '',
                        })(<Input disabled />)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item
                        label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                      >
                        {getFieldDecorator('packageName', {
                          initialValue: packageName || '',
                        })(<Input disabled />)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item
                        label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                      >
                        {getFieldDecorator('packageNo', {
                          initialValue: packageNo || '',
                        })(<Input disabled />)}
                      </Form.Item>
                    </Col>
                    <Col {...gridSpan}>
                      <Form.Item
                        label={intl
                          .get('bid.bidcommon.view.title.purchaseschemeno')
                          .d('采购方案编号')}
                      >
                        {getFieldDecorator('proCode', {
                          initialValue: proCode || '',
                        })(<Input disabled />)}
                      </Form.Item>
                    </Col>
                  </GenerateFormGrid>
                </Row>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.ViCoScSu`).d('查看综合评分汇总')}
                  arrowActive={activeKey.includes('table')}
                  buttons={
                    <CusExcelExport
                      requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-suppliers/exportComprehensiveScoreList/${
                        match.params.proId
                      }`}
                      otherButtonProps={{
                        icon: null,
                        mini: true,
                      }}
                      downloadType="Blob"
                      buttonText={intl.get('hzero.common.button.export').d('导出')}
                      fileName={intl.get(`bid.bidcommon.view.title.ViCoScSu`).d('查看综合评分汇总')}
                      queryParams={{ proId: match.params.proId }}
                    />
                  }
                />
              }
              key="table"
            >
              <CusTable
                columns={columns}
                dataSource={list}
                pagination={paginationN}
                onChange={this.fetchList}
                scroll={{ x: tableScrollWidth(columns) }}
              />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {milState && milState !== 'affirmed' && (
            <CusButton onClick={this.finish}>
              {intl.get(`bid.bidcommon.view.button.qrzhhz`).d('确认综合汇总')}
            </CusButton>
          )}
        </CusApprovalButtons>
      </>
    );
  }
}
