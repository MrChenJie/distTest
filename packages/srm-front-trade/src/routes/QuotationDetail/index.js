/**
 * index.js - 竞价
 * @date: 2024-07-26
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2024, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Input, Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import queryString from 'querystring';
import { filter, reduce, forEach } from 'lodash';
import { createPagination } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { fastCodeLoader } from '@/utils/decorators';
import { getCurrentOrganizationId, getEditTableData } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import Information from './Information';
import QuotationDetails from './QuotationDetails';
import AllocateWinBid from './AllocateWinBid';
import EditCommit from './EditCommit';
import uuid from 'uuid/v4';

const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })

@formatterCollections({
  code: ['spfmhk.trade'],
})

@fastCodeLoader([
  'HKTB.ACTIVITY_YN'
])

@connect(({ loading = {}, quotationDetailModal = {} }) => ({
  initLoading: loading.effects['quotationDetailModal/queryDetail'] ||
  loading.effects['quotationDetailModal/getQuotationDetailsList'] ||
  loading.effects['quotationDetailModal/getTradeWinList'] ||
  loading.effects['quotationDetailModal/getEditCommitList'],
  exportLoading: loading.effects['quotationDetailModal/goExport'],
  exportAllocateWinBidLoading: loading.effects['quotationDetailModal/goAllocateWinBidExport'],
  quotationDetailModal,
}))

export default class QuotationDetail extends Component {
  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    const {
      location,
    } = this.props;
    const { activeId, formRecordId } =
    queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['information', 'QuotationDetails', 'AllocateWinBid', 'EditCommit'],
      winDataSource: [],
    };
  }

  componentDidMount() {
    this.getAssessInformation();
    this.getQuotationDetails();
    this.getAllocateDetails();
    this.handleEditCommit();
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  /**
 * @name: 监听事件 - 监听致远点击按钮
 * @param {object} e
 */
  handleClickBtn = (e) => {
    console.log('监听的message', e);
    const { submitType, messageType, url } = e.data || {};

    const handlePostMessage = (params) => {
      debugger
      window.parent?.postMessage(
        {
          success: true,
          submitType: submitType,
          messageType: messageType,
          formData: {
            formRecordId: params?.formRecordId,
            subject: params?.subject,
            info: params?.info,
            ...params,
          },
        },
        url
      );
    };

    if (e.data.messageType === 'GET_FORM_DATA') {
      if (['DRAFT_HANDLE'].includes(submitType)) {
        // 保存
        this.handleSave((params) => {
          console.log('save', params)
          if (params) {
            handlePostMessage({
              formRecordId: params?.formRecordId,
              subject: params?.subject,
              info: params?.infoList,
            });
          }
        });
      } else if(['SEND'].includes(submitType)) {
        // 提交
        this.handleSubmit((params) => {
          console.log('submit', params)
          if (params) {
            handlePostMessage({
              formRecordId: params?.formRecordId,
              subject: params?.subject,
              info: params?.infoList,
            });
          }
        })
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  // 查询基本信息
  @Bind()
  getAssessInformation() {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'quotationDetailModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'quotationDetailModal/updateState',
          payload: {
            AssessFormSource: res,
          },
        });
      }
    });
  }

  // 查询贸易商报价明细
  @Bind()
  getQuotationDetails() {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'quotationDetailModal/getQuotationDetailsList',
      payload: {
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'update',
        }));
        dispatch({
          type: 'quotationDetailModal/updateState',
          payload: {
            AppraisalDataSource: newDataSource,
          },
        });
      }
    });
  }

  // 查询分配中标数量
  @Bind()
  getAllocateDetails() {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'quotationDetailModal/getTradeWinList',
      payload: {
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'update',
        }));
        const totals = reduce(newDataSource, (acc, item) => {
          forEach(item.tradeWinList, (trade) => {
            acc.totalOrderQuantity += trade.orderQuantity;
            acc.totalOrderQuoteHkd += trade.orderQuoteHkd;
          });
          return acc;
        }, { totalOrderQuantity: 0, totalOrderQuoteHkd: 0 });
        dispatch({
          type: 'quotationDetailModal/updateState',
          payload: {
            AllocateDataSource: newDataSource,
            orderQuantityTotal: totals?.totalOrderQuantity,
            orderQuoteHkdTotal: totals?.totalOrderQuoteHkd,
          },
        });
      }
    });
  }

  // 查询分配中标数量的总数
  @Bind()
  getAllocateDetailsTotals() {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'quotationDetailModal/getTradeWinList',
      payload: {
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const totals = reduce(res, (acc, item) => {
          forEach(item.tradeWinList, (trade) => {
            acc.totalOrderQuantity += trade.orderQuantity;
            acc.totalOrderQuoteHkd += trade.orderQuoteHkd;
          });
          return acc;
        }, { totalOrderQuantity: 0, totalOrderQuoteHkd: 0 });
        dispatch({
          type: 'quotationDetailModal/updateState',
          payload: {
            orderQuantityTotal: totals?.totalOrderQuantity,
            orderQuoteHkdTotal: totals?.totalOrderQuoteHkd,
          },
        });
      }
    });
  }

  // 查询修改记录
  @Bind()
  handleEditCommit(page = {}) {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'quotationDetailModal/getEditCommitList',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res); 
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status: 'update',
        }));
        dispatch({
          type: 'quotationDetailModal/updateState',
          payload: {
            editCommitDataSource: newDataSource,
            editCommitPagination: pagination,
          },
        });
      }
    });
  }

  // 导出贸易商报价详情表格
  handleExport = (event) => {
    const { match, dispatch } = this.props;
    const { formRecordId } = this.state;
    event.preventDefault();
    event.stopPropagation();
    dispatch({
      type: 'quotationDetailModal/goExport',
      payload: {
        refHeadId: formRecordId,
      }
    }).then(res => {
      if(res) {
        // 创建下载的链接
        const url = window.URL.createObjectURL(new Blob([res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = `${intl.get(`spfmhk.trade.view.title.QuoteDetail`).d('贸易商报价明细')}.xlsx`;
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    });
  }

  // 导出中标数量表格
  handleExportAllocateWinBid = (event) => {
    const { match, dispatch } = this.props;
    const { formRecordId } = this.state;
    event.preventDefault();
    event.stopPropagation();
    dispatch({
      type: 'quotationDetailModal/goAllocateWinBidExport',
      payload: {
        refHeadId: formRecordId,
      }
    }).then(res => {
      if(res) {
        // 创建下载的链接
        const url = window.URL.createObjectURL(new Blob([res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = `${intl.get(`spfmhk.trade.field.TradeBidWinQuan`).d('分配中标数量')}.xlsx`;
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    });
  }

  // 保存贸易商报价明细
  @Bind()
  saveQuotationDetail = (callback) => {
    const { dispatch, quotationDetailModal } = this.props;
    const { AppraisalDataSource = [] } = quotationDetailModal;
    const newAppraisalDataSource = filter(AppraisalDataSource, (item) => item.cost || item.cost === 0)
    const quotationDetailList = getEditTableData(AppraisalDataSource, ['rowKey']);
    console.log('newAppraisalDataSource',newAppraisalDataSource);
    if(this.filterForm?.getFieldValue('isFailWin') === 'Y') {
      if (typeof callback === 'function') {
        callback(true)
      }
      return;
    }
    if(newAppraisalDataSource.length > 0) {
      const params = newAppraisalDataSource.map(item => ({
        cost: item.cost,
        id: item.id,
      }))
      dispatch({
        type: 'quotationDetailModal/saveMat',
        payload: params
      }).then((res) => {
        if(res) {
          if (typeof callback === 'function') {
            callback(res)
          }
          // this.getQuotationDetails();
        }
      })
    } else {
      CusNotification.warning({
        message: intl.get('demoTitle1').d('请完善贸易商报价明细')
      })
    }
  }
  
  // 保存分配数量
  @Bind()
  saveAllocateWin = (callback) => {
    if(this.filterForm?.getFieldValue('isFailWin') === 'Y') {
      if (typeof callback === 'function') {
        callback(true)
      }
      return;
    }
    if(this.AllocateChild) {
      this.AllocateChild.saveWin((params) => {
        console.log('params', params);
        if (typeof callback === 'function') {
          callback(params)
        }
      });
    }
  }
    
  // 提交分配数量
  @Bind()
  submitAllocateWin = (callback) => {
    if(this.filterForm?.getFieldValue('isFailWin') === 'Y') {
      if (typeof callback === 'function') {
        callback(true)
      }
      return;
    }
    if(this.AllocateChild) {
      this.AllocateChild.submitWin((params) => {
        console.log('params', params);
        if (typeof callback === 'function') {
          callback(params)
        }
      });
    }
  }

  // 点击保存按钮调用方法
  @Bind()
  handleSave = (callback) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    this.filterForm.validateFields((err, value) => {
      if(!err) {
        console.log('value', value);
        dispatch({
          type: 'quotationDetailModal/saveInfo',
          payload: {
            isFailWin: value?.isFailWin,
            id: formRecordId
          }
        }).then((res) => {
          if(res) {
            this.saveQuotationDetail((quotationParams) => {
              if(quotationParams) {
                this.saveAllocateWin((winParams) => {
                  if(winParams) {
                    this.getQuotationDetails();
                    this.getAllocateDetailsTotals();
                    if (typeof callback === 'function') {
                      callback({
                        formRecordId: formRecordId,
                        subject: '标题',
                        infoList: {
                          quotationParams,
                          winParams,
                        },
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  // 点击提交按钮调用方法
  @Bind()
  handleSubmit = (callback) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    this.filterForm.validateFields((err, value) => {
      if(!err) {
        dispatch({
          type: 'quotationDetailModal/saveInfo',
          payload: {
            isFailWin: value?.isFailWin,
            id: formRecordId
          }
        }).then((res) => {
          if(res) {
            this.saveQuotationDetail((quotationParams) => {
              if(quotationParams) {
                this.submitAllocateWin((winParams) => {
                  if(winParams) {
                    this.getAllocateDetailsTotals();
                    if (typeof callback === 'function') {
                      callback({
                        formRecordId: formRecordId,
                        subject: '标题',
                        infoList: {
                          quotationParams,
                          winParams,
                        },
                      })
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  render() {
    const {
      initLoading,
      quotationDetailModal,
      exportLoading = false,
      exportAllocateWinBidLoading = false,
    } = this.props;
    const {
      AssessFormSource = {},
      AppraisalDataSource = [],
      orderQuantityTotal,
      orderQuoteHkdTotal,
    } = quotationDetailModal;
    const {
      activeKey,
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;

    const informationProps = {
      ...this.props,
      onRef: (ref) => {
        this.filterForm = ref.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      ...this.props,
      onRef: (ref) => {
        this.AllocateChild = ref
      },
      isFailWinValue: this.filterForm?.getFieldValue('isFailWin')
    };

    const editCommitProps = {
      ...this.props,
      onChange: this.handleEditCommit,
    }

    return (
      <PageWrapper loading={initLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            key='information'
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.BasicInfor`).d('基本信息')}
                arrowActive={activeKey.includes('information')}
              />}
          >
            <Information {...informationProps} />
          </Panel>
          <Panel
            key='QuotationDetails'
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.QuoteDetail`).d('贸易商报价明细')}
                arrowActive={activeKey.includes('QuotationDetails')}
                buttons={[
                  <CusButton loading={exportLoading} mini onClick={(e) => this.handleExport(e)}>
                    {intl.get(`spfmhk.trade.field.export`).d('导出')}
                  </CusButton>
                ]}
              />}
          >
            <QuotationDetails {...listProps} />
          </Panel>
          <Panel
            key='AllocateWinBid'
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.field.TradeBidWinQuan`).d('分配中标数量')}
                arrowActive={activeKey.includes('AllocateWinBid')}
                buttons={[
                  <CusButton loading={exportAllocateWinBidLoading} mini onClick={(e) => this.handleExportAllocateWinBid(e)}>
                    {intl.get(`spfmhk.trade.field.export`).d('导出')}
                  </CusButton>
                ]}
              />}
          >
            <div style={{marginBottom: '16px'}}>
              <Form className='customize-form'>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('spfmhk.trade.field.TradeBidWinQuan').d('贸易商投标数量')}
                    >
                      <Input value={orderQuantityTotal} disabled/>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('spfmhk.trade.field.TradeBidWinAmount').d('贸易商投标总金额')}
                    >
                      <Input style={{textAlign: 'right'}} value={numberRender(orderQuoteHkdTotal, 2)} disabled  />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
            <AllocateWinBid {...listProps} />
          </Panel>
          <Panel
            key='AllocateWinBid'
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.ModifyRecord`).d('修改记录')}
                arrowActive={activeKey.includes('EditCommit')}
              />}
          >
            <EditCommit {...editCommitProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
