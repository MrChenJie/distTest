/**
 * index.js - 采购人价格评分汇总
 * @date: 2022-04-18
 * @author:  <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Collapse, Checkbox } from 'antd';
import EditTable from '_cus_components/EditTable';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import { getEditTableData, tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';
import ProjectQaInfo from './projectQaInfo';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusNotification from '_cus_components/CusNotification';
import { tooltipRender } from '_cus_utils/render';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import styles from './index.less';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusExcelExport from '_cus_components/CusExcelExport';
import { closeWindow } from '_cus_utils/utils';
import QuotationDetails from './quotationDetails';
let priceFlag = false

const { Panel } = Collapse;

@connect(({ loading = {}, projectQaModels, contractTechnicalMerit = {} }) => ({
  contractTechnicalMerit,
  projectQaModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  queryListLoading: loading.effects['contractTechnicalMerit/getPriceTableList'],
  getPriceListLoading: loading.effects['contractTechnicalMerit/getPriceList'],
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'HKPC.commom'
  ],
})
@Form.create({ fieldNameProp: null })
export default class PriceScore extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      selectedRows1: [],
      selectedRowKeys1: [],
      dataSource: [],
      milState: '',
      changeFlag: false,
      activeKey: ['form', 'table', 'QuotationDetails'],
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: {}, // 头信息
      },
    });
  }

  componentDidMount() {
    this.getProjectInfo();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
    this.getQuotationDetails();
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
* 查询轮次信息
*/
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ milState: res.milestoneState })
      }
    })
  }

  /**
   * getProjectInfo - 查询项目基本信息
   */
  @Bind()
  getProjectInfo(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getProjectInfo',
      payload: {
        proId: match.params.proId,

      },
    });
    dispatch({
      type: 'contractTechnicalMerit/getPriceList',
      payload: {
        proId: match.params.proId,
        page
      },
    });
  }

  @Bind()
  processDataWithTotal(dataSource) {
    const sumsByTrade = dataSource.reduce((acc, item) => {
      item?.supQuoteList.forEach((quote, index) => {
        // 强制类型转换并过滤无效数据
        const totalPriceHKD = Number(quote.totalPriceHKD) || 0;
        const totalPriceOC = Number(quote.totalPriceOC) || 0;

        // if (totalPriceHKD > 0 || totalPriceOC > 0) { // 仅处理有效数据
        //   const current = acc[quote.userId] || { totalPriceHKD: 0, totalPriceOC: 0 };
        //   acc[quote.userId] = {
        //     ...current,
        //     index: index,
        //     totalPriceHKD: current.totalPriceHKD + totalPriceHKD,
        //     totalPriceOC: current.totalPriceOC + totalPriceOC
        //   };
        // }
        const current = acc[quote.userId] || { totalPriceHKD: 0, totalPriceOC: 0 };
          acc[quote.userId] = {
            ...current,
            index: index,
            totalPriceHKD: current.totalPriceHKD + totalPriceHKD,
            totalPriceOC: current.totalPriceOC + totalPriceOC
          };
      });
      return acc;
    }, {});

    console.log('sumsByTrade', sumsByTrade);

    // 排序时先拷贝并按 index 排序
    const sortedEntries = Object.entries(sumsByTrade).sort((a, b) => a[1].index - b[1].index);  // 按 index 排序
    
    const subTotalRow = {
      isSum: true,
      proPriceConfigId: null,
      rowKey: uuidv4(),
      _status: 'update',
      supQuoteList: sortedEntries.map(([userId, totals]) => ({
        userId: userId.toString(),
        totalPriceHKD: totals.totalPriceHKD,
        totalPriceOC: totals.totalPriceOC
      }))
    };

    return [...dataSource, subTotalRow];
  }

  @Bind()
  getQuotationDetails() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/handleQuotationDetails',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if(res) {
        const initList = res?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        const newDataSource = this.processDataWithTotal(initList);
        dispatch({
          type: 'contractTechnicalMerit/updateState',
          payload: {
            AppraisalDataSource: newDataSource,
          }
        })
      }
    });
  }

  @Bind()
  getProjectInfoN(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractTechnicalMerit/getProjectInfo',
      payload: {
        proId: match.params.proId,

      },
    });
    dispatch({
      type: 'contractTechnicalMerit/getPriceList',
      payload: {
        proId: match.params.proId,
        page
      },
    });

  }

  @Bind
  openModel() {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'contractTechnicalMerit/getPriceTableList',
      payload: {
        proId: proId,
        proPriceConfigId: milestoneId,

      },
    })
    this.setState({ modelFlag: true })
  }

  @Bind
  onOk() {
    const param = []
    this.props.contractTechnicalMerit.priceList.map(item => {
      item.datas.map(i => {
        if (i.seleted) {
          param.push({
            supplierId: i.supplierId,
            milestoneId: i.milestoneId,
          })
        }
      })
    })
    const { dispatch } = this.props
    dispatch({
      type: 'contractTechnicalMerit/uploadList',
      payload: param
      ,
    }).then(res => {
      if (res) {
        CusNotification.success();
        this.setState({ modelFlag: false });
        this.getProjectInfoN();
      }
    });
  }

  @Bind
  tips() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    CusModal.confirm({
      content: intl.get('bid.bidcommon.view.message.Confirmpricesummary').d('是否确认价格汇总'),
      onOk: () => {
        dispatch({
          type: 'contractTechnicalMerit/finishList',
          payload: {
            milestoneId: milestoneId,
          },
        }).then(res => {
          if(res) {
            this.queryProjectQaMilestonesInfo();// 更新确认价格汇总按钮状态
            CusNotification.success();
            window.close();
            // 飞书提交审批后关闭tag页
            closeWindow();
          }
        })
      }
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  save() {
    const {
      contractTechnicalMerit: { priceSourceList },
      dispatch,
      match
    } = this.props
    const list = []
    const param = getEditTableData(priceSourceList, ['_status']);
    param.map(item => {
      if(item.priceRateScore === ''){
        list.push({ ...item, proId: match.params.proId, priceScore: null})
      }else{
        list.push({ ...item, proId: match.params.proId })
      }
    })
    dispatch({
      type: 'contractTechnicalMerit/saveListNew',
      payload: list
      ,
    }).then(res => {
      if (res) {
        CusNotification.success();
      }
    });
  }

  @Bind
  onCancel() {
    this.setState({ modelFlag: false })
  }

  @Bind
  changeCheck(row, j) {
    this.props.contractTechnicalMerit.priceList.map(item => {
      if (item.datas[j].milestoneId == row.datas[j].milestoneId) {
        item.datas[j].seleted = true
      } else {
        item.datas[j].seleted = false
      }
    })
    const { dispatch } = this.props
    dispatch({
      type: 'contractTechnicalMerit/updateState',
      payload: {
        priceList: this.props.contractTechnicalMerit.priceList,
      },
    });
  }

  @Bind
  openChangeModel() {
    CusModal.confirm({
      title: intl
        .get('hzero.common.message.confirm.giveUpTip')
        .d('你有修改未保存，是否确认离开？'),
      onOk: () => {
        this.getProjectInfo();
      },
    });
  }

  render() {
    const { contractTechnicalMerit: { priceSourceList, paginationList,
      priceList, infoSource },
      form,
      match,
      poHeaderInfo,
      queryListLoading = false,
      getPriceListLoading = false,
    } = this.props
    const { modelFlag, milState, activeKey } = this.state;
    const projectQaInfoProps = {
      form,
      poHeaderInfo,
    };
    if (poHeaderInfo.priceSecret === 'NO' && poHeaderInfo.specialPrice === 'NO') {
      priceFlag = true
    }
    const reviewColumns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: getCurrentLanguage() === 'zh_CN' ? 300 :200,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.reviewquotation`).d('最新一轮报价'),// 评审报价
        dataIndex: 'confirmPrice',
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 208,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
      priceFlag && {
        title: intl.get(`bid.bidcommon.view.title.quotecurrency`).d('报价货币（原币）'),
        dataIndex: 'priceCurrency',
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 220,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.youxiaopsbj`).d('有效评审报价'),
        dataIndex: 'preTax',
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 225,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record, 2)}</div>;
        },
      },
          (infoSource.purchaseType === 'public_bidding' || infoSource.purchaseType === 'invited_bidding') && {
          title: intl.get(`bid.bidcommon.view.title.pricescore100pointsystem`).d('价格分数'),
          dataIndex: 'lineNum',
          width: getCurrentLanguage() === 'zh_CN' ? 90 : 238,
          render: (_, record) => {
            if(milState !== '' && milState === 'affirmed') {
              return (
                <div style={{ textAlign: 'right' }}>{numberRender(record.priceScore, 2)}</div>
              )
            } else {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator('priceScore', {
                    initialValue: record.priceScore,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.pricescore100pointsystem`).d('价格分数(100分制)'),
                        }),
                      },
                    ],
                  })(
                  <CusInputNumber
                      min={0}
                      max={100}
                      precision={2}
                      className="cus-input-money"
                      onChange={(e) => {
                        (e || e === 0) ? record.priceRateScore = Number(e) * Number(record.priceRate) / 100 : record.priceRateScore = ''
                      }}
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
        (infoSource.purchaseType === 'public_bidding' || infoSource.purchaseType === 'invited_bidding') && {
          title: intl.get(`bid.bidcommon.view.title.priceproportion`).d('价格比例'),
          dataIndex: 'orderSeq',
          width: getCurrentLanguage() === 'zh_CN' ? 90 : 143,
          render: (_, record) => (<span>{record.priceRate}%</span>)
        },
        (infoSource.purchaseType === 'public_bidding' || infoSource.purchaseType === 'invited_bidding') && {
          title: intl.get(`bid.bidcommon.view.title.convertedrating`).d('折算后评分'),
          dataIndex: 'operation',
          width: getCurrentLanguage() === 'zh_CN' ? 90 : 110,
          render: (_, record) => {
            return <div style={{ textAlign: 'right' }}>{numberRender(record.priceRateScore, 2)}</div>;
          },
        },
        (infoSource.purchaseType === 'public_bidding' || infoSource.purchaseType === 'invited_bidding') && {
          title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
          dataIndex: 'remarks',
          width: 300,
          render: (val, record) => {
            if(milState !== '' && milState === 'affirmed') {
              return (
                tooltipRender(val)
              )
            } else {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator('remarks', {
                    initialValue: val,
                  })(
                    <CusInput.TextArea autoChangeSize={true} />
                  )}
                </Form.Item>
              );
            }
          }
    }].filter(Boolean);
    const reviewResults = {
      dataSource: priceSourceList,
      columns: reviewColumns,
      pagination: paginationList,
      onChange: this.state.changeFlag ? this.openChangeModel : this.getProjectInfo,
      //  onDataChange: this.getChangeFlag,
      onDataChange: () => {
        if (!this.state.changeFlag) {
          this.setState({
            changeFlag: true,
          });
        }

      },
    };

    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.round`).d('轮次'),
        width: 150,
        render: (_, record) => {
          return (
            <span>
              {intl.get('bid.bidcommon.view.title.the').d('第')}
                {record.round}
              {intl.get('bid.bidcommon.view.title.turn').d('轮')}
            </span>
          )
        }
      },
    ]
    if (priceList.length > 0) {
      priceList[0].datas.map((v, j) => {
        columns.push({
          key: `${v.supplierId}`,
          title: `${v.supplierName}`,
          render: (_, row) => {
            return (
              <Checkbox checked={row.datas[j].seleted} onChange={() => this.changeCheck(row, j)} disabled={!row.datas[j].preTax}>
                {row.datas[j].preTax ? numberRender(row.datas[j].preTax, 2) : intl.get(`bid.bidcommon.view.title.notverified`).d('未核价')}
              </Checkbox>
            )
          }
        })
      }
      )
    }
    const tableList = {
      dataSource: priceList,
      columns: columns,
      pagination: false,
    }

    const quotationDetailProps = {
      ...this.props,
    }

    return (
      <>
        <PageWrapper loading={getPriceListLoading}>
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
              <ProjectQaInfo {...projectQaInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.zhaobiaometdfs`).d('选择或确认报价')}
                  arrowActive={activeKey.includes('table')}
                  buttons={
                    <CusExcelExport
                      requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-pro-price-config-answers/exportAllPriceSupplierExport`}
                      otherButtonProps={{
                        icon: null,
                        mini: true,
                      }}
                      downloadType="Blob"
                      buttonText={intl.get('hzero.common.button.export').d('导出')}
                      fileName={intl
                        .get(`bid.bidcommon.view.title.zhaobiaometdfs`)
                        .d('选择或确认报价')}
                      queryParams={{ proId: match.params.proId }}
                    />
                  }
                />
              }
              key="table"
            >
              <EditTable
                {...reviewResults}
                scroll={{ x: tableScrollWidth(reviewColumns) }}
                rowKey="id"
              ></EditTable>
            </Panel>
            <Panel
              key='QuotationDetails'
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.view.title.quotationdetail`).d('报价详情')}
                  arrowActive={activeKey.includes('QuotationDetails')}
                />
              }
            >
            <QuotationDetails {...quotationDetailProps} />
          </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          {/* {milState && milState !== 'affirmed' && (
            <CusButton onClick={this.openModel}>
              {intl.get(`bid.bidcommon.view.button.selectquatationprice`).d('选择保价')}
            </CusButton>
          )} */}
          {milState && milState !== 'affirmed' && (
            <CusButton
              onClick={
                infoSource.purchaseType === 'invited_bidding' ||
                infoSource.purchaseType === 'public_bidding'
                  ? this.save
                  : this.tips
              }
            >
              {(infoSource.purchaseType === 'invited_bidding' ||
                infoSource.purchaseType === 'public_bidding') &&
                intl.get('bid.bidcommon.view.button.save').d('保存')}
              {infoSource.purchaseType !== 'invited_bidding' &&
                infoSource.purchaseType !== 'public_bidding' &&
                intl.get('bid.bidcommon.view.button.Confirmpricesummary').d('确认价格汇总')}
            </CusButton>
          )}
        </CusApprovalButtons>
        <CusModal
          title={intl.get(`bid.bidcommon.view.title.zhaobiaometdfs`).d('选择或确认报价')}
          visible={modelFlag}
          destroyOnClose
          onOk={this.onOk}
          onCancel={this.onCancel}
          width={1000}
        >
          <CusSpin spinning={queryListLoading}>
            <EditTable {...tableList} />
          </CusSpin>
        </CusModal>
      </>
    );
  }
}