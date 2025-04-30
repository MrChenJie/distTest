/**
 * index.js - 采购人价格评分汇总
 * @date: 2022-04-18
 * @author:  <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Table, Row, Col, Card, Avatar, Modal, Checkbox, InputNumber, LocaleProvider } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Link } from 'dva/router';
import { connect } from 'dva';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import notification from 'utils/notification';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { getEditTableData, getCurrentLanguage } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { FORM_COL_2_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';
import revokeIcon from '@/assets/buttonIcons/撤销.png';
import { numberRender } from 'utils/renderer';
import ProjectQaInfo from './projectQaInfo';
import RoundInfo from './roundInfo';
let priceFlag = false

const viewMessagePrompt = 'bid.dashbord.view.message.title';

@connect(({ loading = {}, projectQaModels, contractTechnicalMerit = {} }) => ({
  // queryListLoading: loading.effects['contractTechnicalMerit/unitsQueryLazyTree'],
  contractTechnicalMerit,
  projectQaModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
}))
@formatterCollections({
  code: [
    'spcm.contractTechnicalMerit',
    'spcm.common',
    'entity.company',
    'entity.organization',
    'entity.business',
    'spcm.purchaseContractType',
    'entity.roles',
    'bid.bidcommon',
    'bid.biddashbord',
    'sodr.purchaseOrder',
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
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: {}, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });
  }

  componentDidMount() {
    this.getProjectInfo();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
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

  // 发起报价
  @Bind()
  handleInitiate() {

  }

  // 退回
  @Bind()
  handleRevert() {

  }



  /**
   * 表格一设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }
  /**
   * 表格二设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange1(selectedRowKeys1, selectedRows1) {
    this.setState({
      selectedRows1,
      selectedRowKeys1,
    });
  }

  @Bind
  openModel() {
    const { dispatch, match } = this.props
    dispatch({
      type: 'contractTechnicalMerit/getPriceTableList',
      payload: {
        proId: match.params.proId,
        proPriceConfigId: match.params.milestoneId,

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
        notification.success();
        this.setState({ modelFlag: false });
        this.getProjectInfoN();
      }
    });
  }

  @Bind
  tips() {
    const { dispatch, match } = this.props
    Modal.confirm({
      title: intl.get('bid.bidcommon.view.message.Confirmpricesummary').d('是否确认价格汇总'),
      onOk: () => {
        dispatch({
          type: 'contractTechnicalMerit/finishList',
          payload: {
            milestoneId: match.params.milestoneId,

          },
        }).then(res => {
          notification.success();
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
    const params = []
    const param = getEditTableData(priceSourceList, ['_status']);
    // console.log('12',priceSourceList,param)
    param.map(item => {

      // params.push({ ...item, proId: match.params.proId })
      if(item.priceRateScore === ''){
       params.push({ ...item, proId: match.params.proId, priceScore: null})
      }else{
       params.push({ ...item, proId: match.params.proId })
      }
    })
    console.log(params)
    dispatch({
      type: 'contractTechnicalMerit/saveListNew',
      payload: params
      ,
    }).then(res => {
      if (res) {
        notification.success();
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
      // console.log('item',item)
    })
    const { dispatch } = this.props
    dispatch({
      type: 'contractTechnicalMerit/updateState',
      payload: {
        priceList: this.props.contractTechnicalMerit.priceList,
      },
    });
    // console.log('newDatasource',this.state.dataSource)
    //  const newDatasource = this.state.dataSource
    //   this.setState({dataSource:newDatasource})
  }

  @Bind
  openChangeModel() {
    Modal.confirm({
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
      poHeaderInfo,
      poHeaderMilestonesInfo,
      match } = this.props
    const { modelFlag, milState } = this.state;
    const roundInfoProps = {
      form,
      poHeaderMilestonesInfo
    }
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
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.reviewquotation`).d('最新一轮报价'),// 评审报价
        dataIndex: 'confirmPrice',
        width: 150,
        render: (record) => {
          //  console.log(record,'123')
          return <div >{numberRender(record, 2)}</div>;
        },
      },
      priceFlag && {
        title: intl.get(`bid.bidcommon.view.title.quotecurrency`).d('报价货币（原币）'),
        dataIndex: 'priceCurrency',
        width: 150,
      },
      //  {
      //    title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('价格分列'),
      //    dataIndex: 'jsLink3',
      //    width: 150,
      //  },
      {
        title: intl.get(`bid.bidcommon.view.title.youxiaopsbj`).d('有效评审报价'),
        dataIndex: 'preTax',
        width: 150,
        render: (record) => {
          return <div >{numberRender(record, 2)}</div>;
        },
        //  render: (text, row, index) => {
        //    return (
        //    <Button style={{color:'#1d85fe'}} onClick={this.openModel} >
        //      选择报价
        //    </Button>
        //    )
        //  }
      }
    ].filter(Boolean);
    if (infoSource.purchaseType === 'public_bidding' || infoSource.purchaseType === 'invited_bidding') {
      reviewColumns.push(
        {
          title: intl.get(`bid.bidcommon.view.title.pricescore100pointsystem`).d('价格分数(100分制)'),
          dataIndex: 'priceScore',
          width: 150,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('priceScore', {
                  initialValue: val,
                })(<InputNumber min={0} max={100} precision={2}
                  disabled={milState !=='' && milState === 'affirmed'}
                  onChange={(e) => {
                    (e || e === 0) ? record.priceRateScore = Number(e) * Number(record.priceRate) / 100 : record.priceRateScore = ''
                  }} />)}
              </Form.Item>
            );
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.priceproportion`).d('价格比例'),
          dataIndex: 'priceRate',
          width: 150,
          render: (val, record) => (<span>{record.priceRate}%</span>)
        },
        {
          title: intl.get(`bid.bidcommon.view.button.pricescore`).d('价格评分'),
          dataIndex: 'priceRateScore',
          width: 150,
          render: (record) => {
            return <span>{numberRender(record, 2)}</span>;
          },
        },
        {
          title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
          dataIndex: 'remarks',
          width: 150,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('remarks', {
                  initialValue: val,
                })(<Input min={0} max={100} precision={2}
                  disabled={milState  !=='' && milState === 'affirmed'}
                />)}
              </Form.Item>
            );
          }
        })
    }
    //  const priceFileData = [
    //    {
    //      supplierName: '供应商1',
    //      jsLink: '1',
    //      swLink: ''
    //    }
    //  ];
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

    const columns = [{
      title: intl.get(`bid.bidcommon.view.title.round`).d('轮次'),
      width: 150,
      render: (val, row) => {
        return (
          <span>
            {intl.get('bid.bidcommon.view.title.the').d('第')}
            {row.round}
            {intl.get('bid.bidcommon.view.title.turn').d('轮')}
          </span>
        )
      }
    },

      //  ...dataSource.map((v, i) =>{
      //    console.log('item',i)
      //     // 
      //     //   console.log(h)
      //     return {
      //         key:`${i}`,
      //         title:`${v.round}`,
      //         width: 150,
      //         render:(val, row) => {
      //           item.list.forEach((h,index) =>{
      //             return (
      //               <div>
      //                 {h.score}
      //               </div>
      //             )
      //           })
      //         }
      //    }

      //  })

      //  {
      //   title:(index) => `${dataSource.list[index]}`,
      //   width: 150,
      //   render:(val, row) => {
      //     return (
      //       <div>
      //         {'第'+ row.round +'轮'}
      //       </div>
      //     )
      //   }
      //  }
    ]
    if (priceList.length > 0) {
      priceList[0].datas.map((v, j) => {
        columns.push({
          key: `${v.supplierId}`,
          title: `${v.supplierName}`,
          render: (val, row) => {
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
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <Fragment>
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Card
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
                <ProjectQaInfo {...projectQaInfoProps} />
              </Card>
              {/* <Card
               id="spcm-contract-maintain-detail-contract-header-information"
               bordered={false}
               className={DETAIL_CARD_CLASSNAME}
               title={
                 <h3>
                   {intl
                     .get(`bid.bidcommon.view.title.round`)
                     .d('投标轮次')}
                 </h3>
               }
             >
              <RoundInfo {...roundInfoProps} />
           </Card> */}
              <Card
                id="spcm-contract-maintain-detail-contract-header-information"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>
                    {intl
                      .get(`bid.bidcommon.view.title.zhaobiaometdfs`)
                      .d('选择或确认报价')}
                  </h3>
                }
              >
                <div style={{ marginBottom: '50px', marginRight: '50px' }}>
                  {milState && milState !== "affirmed" && <Button style={{ color: '#1d85fe' }} onClick={this.openModel} >
                    {intl.get(`bid.bidcommon.view.button.selectquatationprice`).d('选择保价')}
                  </Button>}
                  {milState && milState !== "affirmed" && <Button style={{ color: '#1d85fe', marginLeft: 10, }} onClick={(infoSource.purchaseType === 'invited_bidding' || infoSource.purchaseType === 'public_bidding') ? this.save : this.tips} >
                    {(infoSource.purchaseType === 'invited_bidding' || infoSource.purchaseType === 'public_bidding') && (intl.get('bid.bidcommon.view.button.save').d('保存'))}
                    {(infoSource.purchaseType !== 'invited_bidding' && infoSource.purchaseType !== 'public_bidding') && (intl.get('bid.bidcommon.view.button.Confirmpricesummary').d('确认价格汇总'))}
                  </Button>}
                </div>
                <EditTable bordered {...reviewResults} rowKey='id' style={{ marginBottom: '50px' }}></EditTable>
              </Card>
              <Modal
                title={intl.get(`bid.bidcommon.view.title.zhaobiaometdfs`).d('选择或确认报价')}
                visible={modelFlag}
                onOk={this.onOk}
                onCancel={this.onCancel}
                width='60%'
                cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
                okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
              >
                <EditTable style={{ height: '300px', overflow: 'auto' }} {...tableList} />
              </Modal>
            </div>
          </LocaleProvider>
        </Content>
      </Fragment>
    );
  }
}