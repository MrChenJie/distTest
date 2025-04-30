/**
 * index.js - 价格汇总详细页
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import MyForm from './Form2';
import { Form } from 'hzero-ui';
import PriceSummaryTalbe from './PriceSummaryTalbe2';
import { Checkbox } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
// import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
import { createPagination, getEditTableData } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import { tooltipRender } from '_cus_utils/render';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
// import CusLov from '_cus_components/CusLov';
import EditTable from '_cus_components/EditTable';
import CusExcelExport from '_cus_components/CusExcelExport';
import { numberRender } from 'utils/renderer';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import dayjs from 'dayjs';
import queryString from 'querystring';
import CusSelect from '_cus_components/CusSelect';
import PriceInfoList from './PriceInfoList';
import EditMatComponent from '@/components/EditMatComponent';

const { Panel } = Collapse;
const promptCode = 'HKPC.commom';
@Form.create()
@formatterCollections({
  code: [promptCode],
})
@connect(({ singlePurchaseApplicationModel, loading }) => ({
  singlePurchaseApplicationModel,
  fetchLoading:
    loading.effects['singlePurchaseApplicationModel/getPriceCollect'] ||
    loading.effects['singlePurchaseApplicationModel/getQuotationListDetail'] ||
    loading.effects['singlePurchaseApplicationModel/getPriceTolList'],
}))
export default class PriceSummary extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { refHeadId, formRecordId, state } = queryString.parse(search.substr(1)) || {};
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'formTwo', 'tableOne', 'priceInfo'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      modalVisible: false,
      columns: [],
      supplierNameList: [], // 价格汇总——供应商名称表；
      selectData: [], //选择报价勾选中的数据；
      refHeadId, // 关联采购申请ID refPrFirstId
      formRecordId, // 致远id
      state, //  已办： state === 'DONE' || state === 'REVOKE'|| state === 'SENT'
      projectInfo: {},
      round: '1',
      addMatModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleQuery();
    this.listener();
  }

  // 查询数据
  @Bind()
  handleQuery() {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { refHeadId, formRecordId } = this.state;
    const id = refHeadId || formRecordId;
    // 查询报价文件详情数据
    dispatch({
      type: 'singlePurchaseApplicationModel/getPriceCollect',
      payload: {
        id,
      },
    }).then((res) => {
      if (res) {
        const priceBasicInfo = {
          ...res,
          numberRenderEstimatedHKD: numberRender(res?.estimatedHKD, 2),
        };
        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            priceBasicInfo,
          },
        });
        this.setState(
          {
            projectInfo: res,
          },
          () => {
            // 报价明细
            this.handlePriceInfo();
          }
        );
      }
    });
    // 查询价格汇总表数据
    dispatch({
      type: `singlePurchaseApplicationModel/getPriceTolList`,
      payload: {
        refHeadId: parseInt(id),
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            priceSummaryList: res.map((n) => ({
              ...n,
              materialName: n.matName,
              _status: 'update',
            })),
          },
        });
      }
    });
  }

  @Bind()
  handlePriceInfo(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo = {}, round } = this.state;
    console.log('projectInfo', projectInfo);
    dispatch({
      type: 'singlePurchaseApplicationModel/getQuotationListDetail',
      payload: {
        page,
        id: projectInfo?.id,
        refPrFirstId: projectInfo?.prId,
        projectNumber: projectInfo?.projectNumber,
        currency: projectInfo?.currency,
        rounds: round,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuid(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationModel/updateState',
          payload: {
            quotationList: newDataSource, // 报价表数据
            quotationPagination: pagination, // 报价表分页
          },
        });
      }
    });
  }

  // 报价汇总保存
  @Bind()
  save(callback) {
    const { dispatch, singlePurchaseApplicationModel, form } = this.props;
    const { refHeadId, formRecordId } = this.state;
    const { priceBasicInfo = {}, priceSummaryList = [] } = singlePurchaseApplicationModel;
    if (priceSummaryList.length <= 0) {
      CusNotification.error({
        message: intl
          .get(`${promptCode}.view.message.choosequotationprompt`)
          .d('请选择供应商的报价'),
      });
      return;
    }

    const id = refHeadId || formRecordId;
    let jine = priceSummaryList.reduce((amount, i) => {
      return amount + parseFloat(i.selectedAmount ? i.selectedAmount : 0) * i.exchangeRate;
    }, 0);
    // const jine = priceSummaryList[0]?.priceHkd;
    const headId = priceBasicInfo?.id;
    const xuqiuren = priceBasicInfo?.needUserCode;
    const shenqingbumen = priceBasicInfo?.applicantDeptCode;
    const prName = priceBasicInfo?.prName;
    const prNumber = priceBasicInfo?.prNumber;
    const refSupId = priceSummaryList[0]?.refSupId;
    const rounds = priceSummaryList[0]?.rounds;
    const equal = parseInt(priceBasicInfo?.applyUserId) === parseInt(priceBasicInfo?.applicantId);
    const shenqingren = priceBasicInfo?.applyApplicantCode;
    const newPriceSummaryList = getEditTableData(priceSummaryList);
    form.validateFields((err, values) => {
      if (!err) {
        if (newPriceSummaryList.length > 0) {
          dispatch({
            type: `singlePurchaseApplicationModel/priceSummarySave`,
            payload: priceSummaryList,
          }).then((res) => {
            if (res) {
              dispatch({
                type: `singlePurchaseApplicationModel/priceSummaryMatsave`,
                payload: priceSummaryList,
              }).then((res) => {
                if (res) {
                  if (typeof callback === 'function') {
                    callback({
                      refHeadId,
                      refSupId,
                      rounds,
                      jine,
                      equal,
                      headId,
                      id,
                      xuqiuren,
                      prName,
                      shenqingbumen,
                      shenqingren,
                      prNumber,
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  }

  // 致远流程
  @Bind()
  listener() {
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        console.log('e.data.submitType', e.data.submitType);
        // 提交 SEND 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
        if (['SEND', 'SUBMIT', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.save((params) => {
            if (params) {
              console.log('params', params);
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params?.id, //表单记录id（Long）
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmRQResult', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.jine, 2),
                      })
                      .d(
                        `简易询价结果反馈-关于${params.prNumber}:${params.prName}简易询价结果反馈`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmRQResult', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: params.jine,
                      })
                      .d(
                        `简易询价结果反馈-关于${params.prNumber}:${params.prName}简易询价结果反馈`
                      ), //待办流程名称
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        } else {
          top?.postMessage(
            {
              success: true, //表单数据验证成功或不需要验证时传true，否则传false
              submitType: e.data.submitType, //将此字段值回传
              messageType: 'GET_FORM_DATA', //获取表单数据消息
            },
            e.data.url
          );
        }
      }
    });
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const values = this.baseForm.current?.getFieldsValue(true);
    const { startDate, endDate } = values || {};
    return {
      ...values,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
    };
  }

  @Bind
  changeCheck(record, index) {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { reviewPriceData = [] } = singlePurchaseApplicationModel;
    const selectDataId = record.data[index].supId;
    const selectData = [];
    const newReviewPriceData = reviewPriceData.map((item, index2) => {
      item.data.map((i) => {
        if (i.supId === selectDataId) {
          i.seleted = !i.seleted;
        }
        if (i.seleted) {
          selectData.push({ ...i, roundNum: item.roundNum });
        }
        return i;
      });
      return item;
    });
    this.setState({
      selectData,
    });
    dispatch({
      type: `singlePurchaseApplicationModel/updateState`,
      payload: {
        reviewPriceData: newReviewPriceData,
      },
    });
  }

  // 比价按钮
  @Bind()
  handleComparePricebutton() {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { refHeadId, formRecordId, selectData } = this.state;
    const { priceSummaryList = [], priceBasicInfo = {} } = singlePurchaseApplicationModel;
    const { projectNumber, currency } = priceBasicInfo;
    const id = refHeadId || formRecordId;
    dispatch({
      type: `singlePurchaseApplicationModel/getReviewPrice`,
      payload: {
        id,
        projectNumber,
        currency,
      },
    }).then((res) => {
      if (res) {
        let columns = [
          {
            title: tooltipRender(intl.get(`${promptCode}.view.title.Round`).d('轮次')),
            dataIndex: 'roundNum',
            width: 150,
          },
        ];

        res?.supResultVoList?.map((item, index) => {
          const obj = {
            title: `${item.supName}`, // 供应商1、2、3
            key: uuid(),
            width: 160,
            render: (val, record) => {
              return (
                <Checkbox
                  disabled={record?.data[index]?.priceTotal === null}
                  checked={record?.data[index]?.seleted}
                  onChange={() => this.changeCheck(record, index)}
                >
                  {record?.data[index]?.priceTotal === null
                    ? intl.get(`${promptCode}.view.title.notsubmitquotation`).d('未报价')
                    : numberRender(record?.data[index]?.priceTotal, 2)}
                </Checkbox>
              );
            },
          };
          columns.push(obj);
        });

        this.setState({
          columns,
          supplierNameList: res?.supResultVoList,
        });

        const dataSource = res?.roundVoList?.map((i) => {
          let obj = {
            roundNum: i.roundNum,
            data: [],
          };
          i.supPriceVoList.map((item, index) => {
            obj.data.push({
              priceTotal: item.priceTotal,
              seleted: false,
              supId: uuid(),
              refSupId: item.refSupId,
            });
          });
          return obj;
        });

        // 第二次进来应该默认勾选原有数据
        if (priceSummaryList && priceSummaryList.length > 0) {
          dataSource.map((item) => {
            return item.data.map((i) => {
              priceSummaryList.map((n, index) => {
                if (
                  item.roundNum === priceSummaryList[index].rounds &&
                  i.refSupId === priceSummaryList[index].refSupId
                ) {
                  i.seleted = true;
                }
              });
            });
          });
        }

        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            reviewPriceData: dataSource,
          },
        });
        this.setState({
          modalVisible: true,
        });
      }
    });
  }

  // 比价modal的确认
  @Bind
  handleSave() {
    const { dispatch } = this.props;
    const { selectData, refHeadId, formRecordId } = this.state;
    const id = refHeadId || formRecordId;
    const params = selectData.map((item) => {
      return {
        refHeadId: parseInt(id),
        refSupId: parseInt(item?.refSupId),
        rounds: item?.roundNum,
      };
    });
    dispatch({
      type: `singlePurchaseApplicationModel/getPriceSummaryList`,
      payload: params || [],
    }).then((res) => {
      if (res) {
        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            priceSummaryList: (res || []).map((item) => ({
              ...item,
              rowKey: uuid(),
              _status: 'update',
            })),
          },
        });
        this.setState({
          modalVisible: false,
        });
      }
    });
  }

  // 比价modal的取消
  @Bind
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  handleAddMat = () => {
    const { dispatch } = this.props;
    this.setState({
      addMatModalVisible: true
    })
    dispatch({
      type: `singlePurchaseApplicationModel/updateState`,
      payload: {
        editMatDataSource: [],
      },
    });
  }

  handleOkMat = () => {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { editMatDataSource } = singlePurchaseApplicationModel;
    const params = getEditTableData(editMatDataSource, ['poOrderId']).map((item) => ({
      ...item,
      deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD HH:mm:ss')
    }));
    if(params.length > 0) {
      dispatch({
        type: 'singlePurchaseApplicationModel/saveEditMat',
        payload: params
      }).then((res) => {
        if(res) {
          this.setState({
            addMatModalVisible: false
          }, () => {
            this.handleQuery();
          })
        }
      })
    }
  }

  render() {
    const { singlePurchaseApplicationModel = [], fetchLoading = false, form } = this.props;
    const { activeKey, modalVisible, selectedRowKeys, columns, state, addMatModalVisible } = this.state;
    const {
      reviewPriceData = [],
      priceBasicInfo = {},
      priceSummaryList = [],
    } = singlePurchaseApplicationModel;
    const FormProps = {
      priceBasicInfo,
      onRef: (ref) => {
        this.baseForm = ref.props.baseForm;
      },
    };

    const priceSummaryProps = {
      state,
      singlePurchaseApplicationModel,
      form: this.props.form,
      ...this.props,
    };

    const priceInfoListProps = {
      ...this.props,
      onChange: this.handlePriceInfo,
    };

    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (keys) => {
        this.setState({
          selectedRowKeys: keys,
        });
      },
    };

    const editTableProps = {
      bordered: true,
      columns,
      dataSource: reviewPriceData,
      pagination: false,
      // rowSelection,
    };

    const editMatComponentProps = {
      ...this.props,
    }

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
              key="form"
              showArrow={false}
              header={
                <PanelHeader
                  arrowActive={activeKey.includes('form')}
                  title={intl.get(`${promptCode}.view.title.projectinformation`).d('项目基本信息')}
                />
              }
            >
              <MyForm {...FormProps} />
            </Panel>
            <Panel
              key="tableOne"
              showArrow={false}
              // collapsible="disabled"
              header={
                <PanelHeader
                  // showArrow={false}
                  arrowActive={activeKey.includes('tableOne')}
                  title={intl.get(`${promptCode}.view.title.Recommendedsupplierinformation`).d('中选供应商信息')}
                  buttons={
                    <>
                      {state !== 'DONE' && state !== 'REVOKE' && state !== 'SENT' && <div>
                        <CusButton onClick={this.handleComparePricebutton} mini>
                          {intl.get(`${promptCode}.view.button.ChooseQuotation`).d('选择报价')}
                        </CusButton>
                        <CusButton mini onClick={this.handleAddMat}>
                          {intl.get('HKPC.commom.view.title.additem').d('新增物料')}
                        </CusButton>
                      </div>}
                    </>
                  }
                />
              }
            >
              <PriceSummaryTalbe {...priceSummaryProps}></PriceSummaryTalbe>
            </Panel>
            <Panel
              key="priceInfo"
              showArrow={false}
              header={
                <PanelHeader
                  arrowActive={activeKey.includes('priceInfo')}
                  title={intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情')}
                  buttons={
                    <>
                      <Form className="customize-form">
                        <Form.Item label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}>
                          {form.getFieldDecorator('round', {
                            // initialValue: priceBasicInfo?.roundsList,
                          })(
                            <CusSelect
                              style={{ width: '100%' }}
                              options={priceBasicInfo?.roundsList || []}
                              defaultValue="1"
                              onChange={(val) => {
                                this.setState(
                                  {
                                    round: val,
                                  },
                                  () => {
                                    this.handlePriceInfo();
                                  }
                                );
                              }}
                            />
                          )}
                        </Form.Item>
                      </Form>
                    </>
                  }
                />
              }
            >
              <PriceInfoList {...priceInfoListProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons
          children={
            <CusButton
              onClick={this.save}
            >
              {intl.get(`hzero.common.view.button`).d('提交')}
            </CusButton>
          }
        ></CusApprovalButtons>
        <CusModal
          visible={modalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.title`).d('选择历史评审价格')}
          onCancel={this.handleCancel}
          onOk={this.handleSave}
        >
          <EditTable {...editTableProps} />
        </CusModal>

        <CusModal
          title={intl.get('HKPC.commom.view.title.additem').d('新增物料')}
          visible={addMatModalVisible}
          width={1000}
          destroyOnClose
          onCancel={() => {
            this.setState({
              addMatModalVisible: false,
            });
          }}
          onOk={this.handleOkMat}
        >
          <EditMatComponent {...editMatComponentProps} />
        </CusModal>
      </>
    );
  }
}
