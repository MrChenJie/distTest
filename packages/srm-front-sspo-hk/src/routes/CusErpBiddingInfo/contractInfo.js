import React, { Component } from 'react';
import CusTabs from '../components/CusSearchTabs';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
// import TemplateSelect from './TemplateSelect';
import formatterCollections from 'utils/intl/formatterCollections';
import ContractHeader from './contractHeader';
import BidSet from './bidSet';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import notification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import {
  createPagination,
} from 'hzero-front/lib/utils/utils';
import eventBus from '../components/ev';
import deleteIcon from '../../assets/deleteIcon.svg';
import './index.less';

@formatterCollections({
  code: ['bid.bidcommon'],
})
@connect(({ erpBiddingInfo, loading, contractMaintain }) => ({
  erpBiddingInfo,
  contractMaintain,
  saveLoading: loading.effects['erpBiddingInfo/subcontractingSave'],
  subcontracteLoading: loading.effects['erpBiddingInfo/subcontracting'],
}))
export default class ContractInfo extends Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    // const panes = [
    //   { title: 'Tab 1', content: 'Content of Tab Pane 1', key: '1' },
    //   { title: 'Tab 2', content: 'Content of Tab Pane 2', key: '2' },
    // ];
    this.state = {
      activeKey: 0,
      panes: [],
      subcontractingFlag: false,
      fidentialItems: '',
      specialQuotation: '',
      setProjectFlag: false,
      remainingAmount: 0,
      listAll: [],
      isHeadChangeFlag: false
    };
    if (props.onRef) {
      props.onRef(this);
    }
  }
  headRef = React.createRef();

  @Bind
  componentDidMount() {
    this.getRemainingAmount();
    
  }

  @Debounce(800)
  @Bind
  getRemainingAmount() {
    let allTalOriginalCurrency = 0;
    let allTalOriginalCurrencyZero = 0;
    const {
      panesAll: { packageContent = [] }
    } = this.props;
    packageContent.map((item, index) => {
      if (item.talOriginalCurrency || item.budgetOriginalAmountTotal) {
        allTalOriginalCurrencyZero = item.talOriginalCurrencyZero
        allTalOriginalCurrency += packageContent[index].talOriginalCurrency ? packageContent[index].talOriginalCurrency : packageContent[index].budgetOriginalAmountTotal
      }
    })
    this.setState({
      remainingAmount: allTalOriginalCurrencyZero - allTalOriginalCurrency
    })
  }

  // 重新刷新表格
  @Bind
  onTabClick(e) {
    const newData = this.props.panesAll.packageContent.filter(item => item.packageNo == e)
    this.props.form.resetFields();
    this.quotationList(newData);
    this.supplierList(newData);
  }

  @Bind
  onChange(e) {
    console.log(this.headerRef )
    if(this.state.isHeadChangeFlag){
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.confirmsave`).d('请先保存数据'),
      });
    } else {
      console.log('false')
      let listAll = []
      if (this.props.panesAll.packageContent) listAll = this.props.panesAll.packageContent.filter(item=> item.packageNo == e)
      this.setState({ activeKey: e, listAll })
    }
    
  }

  // 报价表
  @Bind()
  quotationList(e) {
    const { dispatch } = this.props;
    // const { proId } = match.params;
    dispatch({
      type: 'contractMaintain/quotationList',
      payload: {
        proId: e[0].proId,
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
          type: 'contractMaintain/updateState',
          payload: {
            quotationSource: newDataSource,
            quotationPagination: pagination,
          },
        });
      }
    });
  }

  // 邀请供应商
  @Bind
  supplierList(e) {
    const { dispatch } = this.props;
    // const { proId } = matchs.params;
    dispatch({
      type: 'contractMaintain/supplierList',
      payload: {
        proId: e[0].proId
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
          type: 'contractMaintain/updateState',
          payload: {
            supplierSource: newDataSource,
            supplierPagination: pagination,
          },
        });
      }
    })
  }


  // onChange = (activeKey) => {
  //   this.setState({ activeKey });
  // };

  onEdit = (targetKey, action) => {
    if ( action !== 'add' ) this[action](targetKey); 
  };

  // 分标包
  @Debounce(500)
  @Bind
  handleAddSubcontracting() {
    const { dispatch, proId, panesAll } = this.props;
    const { packageContent = [] } = panesAll;
    dispatch({
      type: 'erpBiddingInfo/subcontracting',
      payload: {
        parentId: proId,
      },
    }).then((res) => {
      if (res) {
        packageContent.push(res);
        if (packageContent[0].packageNo.substring(packageContent[0].packageNo.length - 2) === '00') {
          packageContent.shift();
          this.setState({
            activeKey: packageContent.packageNo
          })
        }
        console.log(packageContent, 'packageContent')
        //     const panes = this.state.panes;
        // const activeKey = `newTab${this.newTabIndex++}`;
        // panes.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey });
        // this.setState({ panes, activeKey });
        this.setState({
          subcontractingFlag: true,
          // activeKey
        });
      }
    });
  }

  @Bind
  fidentialItemsData(val) {
    this.setState({
      fidentialItems: val,
    });
  }

  @Bind
  specialQuotationData(val) {
    this.setState({
      specialQuotation: val,
    });
  }

  // 保存基本信息
  @Debounce(500)
  @Bind
  handleSaveSubcontracting(callback) {
    const { fidentialItems, specialQuotation } = this.state;
    const { dispatch, form, onSave = (e) => e, erpInfo, panesAll, onTest = (e) => e } = this.props;
    const { packageContent = [] } = panesAll;
    form.validateFields((err, values) => {
      const data = {
        priceSecret: (fidentialItems ? fidentialItems : values.priceSecret) || 'NO',
        specialPrice: (specialQuotation ? specialQuotation : values.specialPrice) || 'NO',
        buyerMeaning: values.buyerMeaning ? values.buyerMeaning : erpInfo.buyerMeaning,
        productNameMeaning: values.productNameMeaning ? values.productNameMeaning : erpInfo.productNameMeaning,
      };

      let rateFlag;
      if (values.tenRate !== undefined && values.priceRate !== undefined) {
        if (values.tenRate * 1 + values.priceRate * 1 == 100) {
          rateFlag = true
        } else {
          rateFlag = false
        }
      } else {
        rateFlag = true
      }
      if (isEmpty(err)) {
        if (rateFlag) {
          packageContent.map((item, index) => {
            console.log('itemitem4', item);
            if (!item.buyer &&  values.packageNo == item.packageNo) {
              packageContent[index] = {
                ...values,
                ...data
              }
            }
          })
          if (values.packageNo) {
            onTest(values, data)
            dispatch({
              type: 'erpBiddingInfo/subcontractingSave',
              payload: {
                ...values,
                ...data,
              },
            }).then((res) => {
              if (res) {
                notification.success({
                  message: intl
                      .get(`bid.bidcommon.view.message.Piss`)
                      .d('标包信息保存成功'),
                });
                onSave();
                this.setState({
                  subcontractingFlag: false,
                  setProjectFlag: true
                });
                this.getRemainingAmount();
                console.log('res', res);
                this.saveTabs(res && res[0].proId)
                if (typeof callback === 'function') {
                  callback(true);
                }
              }
            });
            this.props.form.resetFields();
          }
        } else {
          notification.error({
            message: intl.get('bid.bidcommon.view.title.percentconfirm').d('请保持价格技术比例之和为100'),
          });
        }
      }
      
    });
  }

  @Debounce(500)
  @Bind
  saveTabs(id) {
    const { listAll } = this.state;
    eventBus.emit('save', id)
    eventBus.emit('saveJudge', id)
    eventBus.emit('saveBusinessNew', id)
    if (listAll.length === 0 ) {
      listAll.push(this.props.panesAll.packageContent[0])
    }
    console.log('listAll', listAll, this.props.panesAll.packageContent)
    if (listAll.length > 0) {
      if (listAll[0].procurementType === 'invited_bidding' || listAll[0].procurementType === 'public_bidding' || listAll[0].purchaseType === 'invited_bidding' || listAll[0].purchaseType === 'public_bidding' ) eventBus.emit('handleSave', id)
      eventBus.emit('handleSaveQuotation', id)
      if (['invited_bidding', 'invite_negotiation', 'single_source', 'internal_source', 'invitation_inquiry', 'direct_negotiation'].includes(listAll[0].purchaseType || listAll[0].procurementType)) eventBus.emit('handleSaveInviteSuppliers', id)
    }
    this.setState({isHeadChangeFlag: false})
  }

  // add = () => {
  //   const panes = this.state.panes;
  //   const activeKey = `newTab${this.newTabIndex++}`;
  //   panes.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey });
  //   this.setState({ panes, activeKey });
  // };

  @Bind
  remove(targetKey) {
    const {
      panesAll: { packageContent = [] }    } = this.props;
      const  activeKey = this.state;
    // let lastIndex;
    if(activeKey == targetKey) this.setState({isHeadChangeFlag: false})
    packageContent.forEach((pane, i) => {
      if (pane.packageNo === targetKey && pane.proId) {
        // lastIndex = i - 1;
        CusModal.confirm({
          content: intl
            .get('hzero.common.message.confirm.delete')
            .d('是否删除此条记录？'),
          okType: 'normal',
          onOk: () => this.handleRemove(pane.proId),
        })
      } else {
        if (packageContent.length === 1) {
          const { dispatch, match } = this.props;
          const { proCode } = match.params;
          dispatch({
            type: 'erpBiddingInfo/getPanesAll',
            payload: {
              procurementPlanNumber: proCode
            }
          })
          this.setState({
            subcontractingFlag: false,
            setProjectFlag: true
          });
        } else {
          if (pane.packageNo === targetKey) {
            CusModal.confirm({
              content: intl
                .get('hzero.common.message.confirm.delete')
                .d('是否删除此条记录？'),
              okType: 'normal',
              onOk: () => {
                packageContent.splice(i, 1);
                this.setState({
                  subcontractingFlag: false,
                  setProjectFlag: true
                });
              },
            })
          }
        }
      }
    });
    if (this.state.activeKey == targetKey) {
      // this.state.activeKey == packageContent[0].packageNo
      this.setState({
        activeKey: packageContent[0].packageNo
      })
    }
    this.props.form.resetFields();

    // const panes = this.state.panes.filter((pane) => pane.key !== targetKey);
    // if (lastIndex >= 0 && activeKey === targetKey) {
    //   activeKey = panes[lastIndex].key;
    // }
    // this.setState({ panes, activeKey });

  }

  // 分标包删除
  handleRemove(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'erpBiddingInfo/subcontractingRemove',
      payload: {
        proId: id,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.onFeatch();
        setTimeout(() => {
          this.getRemainingAmount();
        }, 500)
      }
    });
  }

  @Bind
  changeEditFlag() {
    console.log('key2', this.state.isHeadChangeFlag);
    this.setState({
      isHeadChangeFlag: true
    })
  }

  // @Bind
  // childEvevnt (childDate) {
  //   this.$child = childDate;
  // };

  render() {
    const {
      form = {},
      match,
      detailEnumMap = {},
      panesAll: { packageContent = [] },
      fetchLoading,
      subcontracteLoading,
      erpAllInfo,
    } = this.props;
    const { subcontractingFlag = false, setProjectFlag = false, activeKey, itemKey } = this.state;
    // 暂不删除
    // const operations = <div>{intl.get(`bid.bidcommon.view.title.Remainingamountofpurchaseschemeoriginalcurrency`).d('采购方案剩余金额(原币)')}{`: `}{ numberRender(remainingAmount, 2) }</div>

    const tabItems = []
    if (packageContent.length) {
      if (activeKey == 0) {
        this.setState({
          activeKey: packageContent[0].packageNo,
        })
      }
      packageContent.map((pane) => {
        tabItems.push({
          key: pane.packageNo || '无数据',
          label:
            // intl.get(`bid.bidcommon.view.title.package`).d('标包: ') +
              pane.packageNo.substring(pane.packageNo.length - 2) || '无数据',
          closable: pane.packageNo.substring(pane.packageNo.length - 2) === '00' ? false : true,
          closeIcon: (
            <>
              <div style={{ width: '12px', height: '12px' }}>
                <img src={deleteIcon} alt="" />
              </div>
            </>
          ),
          children: (
            <>
              <div>
                {(pane.packageNo == activeKey || !activeKey) && (
                  <ContractHeader
                    form={form}
                    fetchLoading={fetchLoading}
                    erpInfo={pane}
                    erpAllInfo={erpAllInfo}
                    detailEnumMap={detailEnumMap}
                    onSpecialQuotation={this.specialQuotationData}
                    onFidentialItems={this.fidentialItemsData}
                    onEdit={this.changeEditFlag}
                    ref={this.formRef}
                    onRef= {(node) => {
                      this.headerRef = node;
                    }}
                  />
                )}
                {/* {((pane.proId && setProjectFlag) || (pane.proId && pane.packageName)) && ( */}
                <div style={{ borderTop: '1px solid #DEE0E3' ,marginTop:'24px'}}></div>
                <BidSet
                  match={match}
                  proId={pane.proId}
                  listAll={pane}
                  detailEnumMap={detailEnumMap}
                  onEdit={this.changeEditFlag}
                  erpAllInfo={erpAllInfo}
                  form={form}
                />
                {/* )} */}
              </div>
            </>
          ),
        });
      })
    }

    if (packageContent.length > 1) {
      packageContent.length > 1 && packageContent[0].packageNo.substring(packageContent[0].packageNo.length - 2) === '00' ? packageContent.shift() : packageContent
      if (activeKey == 0) {
        this.setState({
          activeKey: packageContent[0].packageNo,
          listAll: packageContent
        })
      }
    }
    // console.log('packageContent', packageContent)
    // if(packageContent.length == 1) {
    //   this.setState({
    //     activeKey: packageContent[0].packageNo,
    //     listAll: packageContent
    //   })
    // }
    return (
      <>
{/*        
       <div className='tab-head' >
          <CusButton
            disabled={subcontractingFlag}
            type="primary"
            onClick={this.handleAddSubcontracting}
            loading={subcontracteLoading}
          >
            {intl.get(`bid.bidcommon.bid.button.Split`).d('分标包')}
          </CusButton>
          </div> */}
          <div className='contractInfoTabs'>
            {tabItems && <CusTabs
              // hideAdd
              onChange={this.onChange}
              onAdd={this.handleAddSubcontracting}
              isDisable={subcontractingFlag}
              destroyInactiveTabPane={true}
              subcontracteLoading={subcontracteLoading}
              activeKey={activeKey}
              // onTabClick={this.onTabClick}
              items={tabItems}
              defaultActiveKey={activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            />}
          </div>
      </>
    );
  }
}
