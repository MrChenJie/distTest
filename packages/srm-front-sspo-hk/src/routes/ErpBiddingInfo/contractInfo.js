import React, { Component } from 'react';
import { Form, Row, Col, Input, Tabs, Button, Card } from 'hzero-ui';
import uuidv4 from 'uuid/v4';

import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import intl from 'utils/intl';
// import TemplateSelect from './TemplateSelect';
import formatterCollections from 'utils/intl/formatterCollections';
import ContractHeader from './contractHeader';
import BidSet from './bidSet';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { Header } from 'components/Page';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { numberRender } from 'utils/renderer';
import {
  createPagination,
} from 'hzero-front/lib/utils/utils';
const { TabPane } = Tabs;

const LABEL_WRAPPER_1_3 = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 15,
  },
};

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
      remainingAmount: 0
    };
  }

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
        panesAll: { packageContent = []}
    } = this.props;
    console.log('packageContent', packageContent)
    packageContent.map((item, index) => {
      if(item.talOriginalCurrency || item.budgetOriginalAmountTotal) {
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
    this.setState({ activeKey: e })
  }

  // 报价表
  @Bind()
  quotationList(e) {
    // console.log(e)
    const { dispatch, match } = this.props;
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
    const { dispatch, matchs } = this.props;
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
    this[action](targetKey);
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
        }
        //     const panes = this.state.panes;
        // const activeKey = `newTab${this.newTabIndex++}`;
        // panes.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey });
        // this.setState({ panes, activeKey });
        // console.log('packageContent', packageContent)
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
  handleSaveSubcontracting() {
    const { fidentialItems, specialQuotation } = this.state;
    const { dispatch, form, onSave = (e) => e, erpInfo, panesAll, onTest = (e) => e } = this.props;
    const { packageContent = [] } = panesAll;
    form.validateFields((err, values) => {
      const data = {
        priceSecret: fidentialItems ? fidentialItems : values.priceSecret,
        specialPrice: specialQuotation ? specialQuotation : values.specialPrice,
        buyerMeaning: values.buyerMeaning ? values.buyerMeaning : erpInfo.buyerMeaning,
        productNameMeaning: values.productNameMeaning ? values.productNameMeaning : erpInfo.productNameMeaning,
      };

      let rateFlag;
      if(values.tenRate !== undefined && values.priceRate !== undefined) {
        if(values.tenRate * 1 + values.priceRate * 1 == 100) {
          rateFlag = true
        } else {
          rateFlag = false
        }
      } else {
        rateFlag = true
      }
      if (isEmpty(err)) {
        if(rateFlag) {
          packageContent.map((item, index) => {
            if (!item.buyer) {
              packageContent[index] = {
                ...values,
                ...data
              }
            }
          })
            console.log('123123',values,erpInfo)
            if (values.packageNo) {
              onTest(values, data)
              // console.log('panesall',this.props.erpBiddingInfo.panesAll.packageContent,values)
              dispatch({
                type: 'erpBiddingInfo/subcontractingSave',
                payload: {
                  ...values,
                  ...data,
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  onSave();
                  this.setState({
                    subcontractingFlag: false,
                    setProjectFlag: true
                  });
                  this.getRemainingAmount();
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

  // add = () => {
  //   const panes = this.state.panes;
  //   const activeKey = `newTab${this.newTabIndex++}`;
  //   panes.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey });
  //   this.setState({ panes, activeKey });
  // };

  @Bind
  remove(targetKey) {
    const {
      panesAll: { packageContent = [] },
      onFeatch = (e) => e
    } = this.props;
    // let activeKey = this.state.activeKey;
    // let lastIndex;
    packageContent.forEach((pane, i) => {
      if (pane.packageNo === targetKey && pane.proId) {
        // lastIndex = i - 1;
        this.handleRemove(pane.proId);
      } else {
        if (packageContent.length === 1) {
          // console.log('res')
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
            packageContent.splice(i, 1);
            this.setState({
              subcontractingFlag: false,
              setProjectFlag: true
            });
          }
        }
      }
    });
    if(this.state.activeKey == targetKey){
        //console.log(targetKey)
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

  // @Bind
  // childEvevnt (childDate) {
  //   this.$child = childDate;
  // };

  render() {
    const {
      form = {},
      erpInfo,
      match,
      detailEnumMap = {},
      proId,
      panesAll,
      panesAll: { packageContent = [] },
      fetchLoading,
      saveLoading,
      subcontracteLoading,
    } = this.props;
    // console.log('panesAll2',panesAll)
    const { subcontractingFlag = false, setProjectFlag = false, activeKey, remainingAmount } = this.state;
    // 暂不删除
    // const operations = <div>{intl.get(`bid.bidcommon.view.title.Remainingamountofpurchaseschemeoriginalcurrency`).d('采购方案剩余金额(原币)')}{`: `}{ numberRender(remainingAmount, 2) }</div>

    if (packageContent) {
      packageContent.length > 1 && packageContent[0].packageNo.substring(packageContent[0].packageNo.length - 2) === '00' ? packageContent.shift() : packageContent
    }
    return (
      <>
        <Header>
          <Button type="primary" loading={saveLoading} onClick={this.handleSaveSubcontracting}>
            {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
          </Button>
          <Button
            disabled={subcontractingFlag}
            type="primary"
            onClick={this.handleAddSubcontracting}
            loading={subcontracteLoading}
          >
            {intl.get(`bid.bidcommon.bid.button.Split`).d('分标包')}
          </Button>
        </Header>
        <Tabs
          // tabBarExtraContent={operations}
          hideAdd
          onChange={this.onChange}
          // activeKey={activeKey}
          // onTabClick={this.onTabClick}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {packageContent.map((pane) => (
            <TabPane
              tab={
                intl.get(`bid.bidcommon.view.title.package`).d('标包: ') +
                pane.packageNo.substring(pane.packageNo.length - 2) || '无数据'
              }
              key={pane.packageNo || '无数据'}
              closable={pane.packageNo.substring(pane.packageNo.length - 2) === '00' ? false : true}
            >
              {(pane.packageNo == activeKey || !activeKey) && <ContractHeader
                form={form}
                fetchLoading={fetchLoading}
                erpInfo={pane}
                detailEnumMap={detailEnumMap}
                onSpecialQuotation={this.specialQuotationData}
                onFidentialItems={this.fidentialItemsData}
              />}
              {((pane.proId && setProjectFlag) || (pane.proId && pane.packageName)) && (
                <Card
                  key="bidSet"
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={
                    <h3>
                      {intl.get(`bid.bidcommon.view.title.projectsetting`).d('项目设置')}
                    </h3>
                  }
                >
                  <BidSet
                    match={match}
                    proId={pane.proId}
                    listAll={pane}
                    detailEnumMap={detailEnumMap}
                  />
                </Card>
              )}
            </TabPane>
          ))}
        </Tabs>
      </>
    );
  }
}
