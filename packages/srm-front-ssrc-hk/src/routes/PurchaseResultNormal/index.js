import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import dayjs from 'dayjs';
import { Collapse, Form } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';
import { queryPurchaseResultList } from '@/services/purchaseResultService';

/**
 * 国际化前缀
 */
const promptCode = 'ssrc.resaleRfq';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseResultModel, loading }) => ({
  purchaseResultModel,
  // fetchLoading: loading.effects['purchaseApplicationModel/queryPurchaseApplicationList'],
  // submitLoading: loading.effects['resaleRfq/submitSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitSummary'] ||
  //   loading.effects['resaleRfq/submitValidateSummary'] ||
  //   loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
  //   loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // publishLoading: loading.effects['resaleRfq/publishSummary'] ||
  //   loading.effects['resaleRfq/ictsPublishSummary'] ||
  //   loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
  //   loading.effects['resaleRfq/submitValidateCommonSummary'],
  // deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  // queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  // exportLoading: loading.effects['resaleRfq/enquiryExport'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRTYPE',
  'HKPC.RELATEDTOPROJECT',
  'HKPC.PURCHASINGCATEGORY',
  'HKPC.BUDGETTYPE',
  'HKPC.PRRECORDSSTATUS',
])
export default class purchaseResultNormal extends React.Component {
  modalForm = React.createRef();
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      purchaseTypeVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询采购结果列表数据
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseResultModel/queryPurchaseResultList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then(res => {
      if (res) {
        if (this.table) {
          const { clearState = (e) => e } = this.table;
          clearState();
        }
      }
    });
  }

  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  @Bind
  translateEbsCode(code) {
    const { idpValueMap = {} } = this.props;
    const valuelist = idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    const { meaning } = valuelist.find((item) => item.value === code) || {};
    return meaning;
  }

  /**
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.description;
    }
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    console.log('fieldsValue', fieldsValue);
    const {
      creationDateFrom,
      creationDateTo,
      enquiryStartDateFrom,
      enquiryStartDateTo,
      enquiryEndDateFrom,
      enquiryEndDateTo,
    } = fieldsValue || {};
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom)
        ? creationDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo)
        ? creationDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom)
        ? enquiryStartDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo)
        ? enquiryStartDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom)
        ? enquiryEndDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo)
        ? enquiryEndDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
    };
  }

  @Bind()
  handleCreateQuotation() {
    const { idpValueMap } = this.props;
    const { dataList = {}, isPub, purchaseTypeVisible } = this.state;
    const values = this.createForm?.current?.getFieldsValue() || {};
    let path;
    const description = this.getFastCode(idpValueMap.RS_IBOSS_PRODUCT_TYPE_ISP_RFP, values.productType);
    if (values.productType) {
      if (description === 'SP_RFP_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/standard/create`;
      } else if (description === 'SP_RFP_ICTS_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/create`;
      } else if (description === 'SP_RFP_CDIA_TEMPLATE') {
        path = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/china-dia/create`;
      } else {
        CusNotification.error({
          message: intl.get('ssrc.resaleRfq.view.message.noModal').d('匹配不到模板'),
        });
        return 0;
      }
      this.setState({
        modalVisible: false,
      });
      this.createForm?.current?.resetFields();
      window.open(`${path}?${querystring.stringify({ ...dataList, ...values })}`, '_blank');
      // openTab({
      //   key: path,
      //   path,
      //   search: querystring.stringify({
      //     ...dataList,
      //     ...values,
      //   }),
      // });
      // setTimeout(() => {
      //   closeTab('/ssrc/resale-rfq');
      // }, 200);
    } else {
      CusNotification.error({
        message: intl.get('ssrc.resaleRfq.view.modal.warning').d('请选择询价单类型'),
      });
    }
  }

  @Bind()
  handleRequireCodeChange(val, dataList) {
    this.setState({
      dataList,
    });
    this.createForm?.current?.setFieldsValue({
      subSoId: dataList.subSoId,
      subsId: dataList.subsId,
      soEnquiryCode: dataList.handleCode,
      soRequireCode: dataList.requireCode,
      orderOwner: dataList.orderOwnerCode,
      orderOwnerMeaning: dataList.orderOwnerName,
      contractEntityNo: dataList.contractEntityEbsCode,
      contractEntityNoMeaning: this.translateEbsCode(dataList.contractEntityEbsCode),
      sprNumber: dataList.sprNo,
      nonSlaNumber: dataList.unslaNo,
      soRequireNo: `${dataList.handleCode ? dataList.handleCode : ''}${dataList.requireCode && dataList.handleCode ? '/' : ''
        }${dataList.requireCode ? dataList.requireCode : ''}`,
      productType: ['6600200001', '6600200003'].includes(dataList.productType) ? '6600202' : dataList.productType,
      productTypeMeaning: dataList.productName,
      empty: '',
      sprRequestId: dataList.sprRequestId,
      ibossBussinessType: dataList.ibossBussinessType,
      custId: dataList.custId,
      custName: dataList.custName,
      endCustomer: dataList.endCustomer,
    });
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval(data = []) {
    const { dispatch } = this.props;
    const { id } = currentUser;
    const flag = data.some(item => item.createdBy !== id);
    if (flag) {
      CusNotification.error({
        message: intl.get(`${promptCode}.warning.tips.onlySubmitYouself`).d('仅可提交录入员为您本人的询价单！'),
      });
      return 0;
    }
    ;
    const businessType = data[0]?.businessType;
    // 是否同一类型询价单
    const submitFlag = data.every(item => item.businessType === businessType);
    if (submitFlag) {
      if (businessType === 'ICTS') {
        CusModal.confirm({
          content: intl.get(`${promptCode}.view.config.isSubmitTickRfq`).d('请确认是否提交勾选的询价单'),
          onOk: () => {
            dispatch({
              type: 'resaleRfq/ictsSubmitValidateSummary',
              payload: data.map(item => {
                return {
                  enquiryPriceId: item.enquiryPriceId,
                  enquiryPriceRoundsId: item.enquiryPriceRoundsId,
                };
              }),
            }).then(r => {
              if (r) {
                dispatch({
                  type: 'resaleRfq/ictsSubmitSummary',
                  payload: {
                    enquiryPriceList: data,
                  },
                }).then(res => {
                  if (res) {
                    CusNotification.success();
                    this.handleSearch();
                  }
                });
              }
            });
          },
        });
      } else if (businessType === 'STANDARD') {
        if (data.every(item => item.subSoId)) {
          this.setState({
            selectSubmitData: data,
            submitModalVisible: true,
          });
        } else if (data.every(item => !item.subSoId)) {
          CusModal.confirm({
            content: intl.get(`${promptCode}.view.config.isSubmitTickRfq`).d('请确认是否提交勾选的询价单'),
            onOk: () => {
              this.setState({
                selectSubmitData: data,
              }, () => {
                this.handleSubmit('Y');
              });
            },
          });
        } else {
          CusNotification.error({
            message: intl.get(`${promptCode}.tips.pleaseOtherSubmitRfq`).d('请将有意向单和无意向单的询价单分别提交'),
          });
        }
      } else if (businessType === 'CHINA_DIA') {
        CusModal.confirm({
          content: intl.get(`${promptCode}.view.config.isSubmitTickRfq`).d('请确认是否提交勾选的询价单'),
          onOk: () => {
            this.handleSubmitCommon(data, 'Y');
          },
        });
      }
      ;
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlySubmitSameType`).d('只能批量提交同一产品类型的询价单!'),
      });
    }
    ;
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const deleteFlag = data.every(item => item.enquiryPriceStatus === 'NEW');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList',
            payload: data,
          }).then(res => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
            ;
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish(data = []) {
    const { dispatch } = this.props;
    const businessType = data[0]?.businessType;
    // 是否同一类型询价单
    const publishFlag = data.every(item => item.businessType === businessType);
    if (publishFlag) {
      if (businessType === 'CHINA_DIA') {
        dispatch({
          type: 'resaleRfq/submitValidateCommonSummary',
          payload: {
            enquiryPriceRoundsList: data.map(item => {
              return {
                enquiryPriceId: item.enquiryPriceId,
                enquiryPriceRoundsId: item.enquiryPriceRoundsId,
              };
            }),
            typeCode: 'CHINA_DIA',
          },
        }).then(r => {
          if (r) {
            dispatch({
              type: 'resaleRfq/publishEnquiryPriceSummary',
              payload: {
                enquiryPublishDTOList: data.map(item => {
                  return {
                    enquiryPriceId: item.enquiryPriceId,
                    enquiryPriceRoundsId: item.enquiryPriceRoundsId,
                    enquiryDetailList: [],
                  };
                }),
                typeCode: 'CHINA_DIA',
              },
            }).then(res => {
              if (res) {
                CusNotification.success();
                this.handleSearch();
              }
            });
          }
        });
      } else if (['ICTS', 'STANDARD'].includes(businessType)) {
        dispatch({
          type: businessType === 'ICTS' ? 'resaleRfq/ictsPublishSummary' : 'resaleRfq/publishSummary',
          payload: data.map(item => {
            return {
              enquiryPriceId: item.enquiryPriceId,
              enquiryPriceRoundsId: item.enquiryPriceRoundsId,
              enquiryDetailList: [],
            };
          }),
        }).then(res => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
          ;
        });
      }
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyPublishSameType`).d('只能批量发布同一产品类型的询价单!'),
      });
    }
  }

  /**
   * @description 批量创建
   */
  @Bind()
  handleMassCreate() {
    const { history } = this.props;
    const { isPub } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/ssrc/resale-rfq/batchImport`,
    });
  }

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary',
      payload: selectSubmitData.map(item => {
        return {
          enquiryPriceId: item.enquiryPriceId,
          enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary',
          payload: {
            enquiryPriceList: selectSubmitData,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            this.setState({
              submitModalVisible: false,
            });
            CusNotification.success();
            this.handleSearch();
          }
          ;
        });
      }
      ;
    });
  }

  /**
   * @description 公用的提交 handleSubmitCommon
   * @param {*} data 提交的数据
   * @param {*} onlySubmit 是否是只提交
   */
  @Bind()
  handleSubmitCommon(data = [], onlySubmit = 'N') {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/submitValidateCommonSummary',
      payload: {
        enquiryPriceRoundsList: data.map(item => {
          return {
            enquiryPriceId: item.enquiryPriceId,
            enquiryPriceRoundsId: item.enquiryPriceRoundsId,
          };
        }),
        typeCode: 'CHINA_DIA',
        validateAllFlag: 'Y',
      },
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitEnquiryPriceSummary',
          payload: {
            typeCode: 'CHINA_DIA',
            enquiryPriceRoundsList: data,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
          ;
        });
      }
      ;
    });
  }

  // 导出
  @Bind()
  handleExport() {
    const { dispatch } = this.props;
    dispatch({
      type: 'resaleRfq/enquiryExport',
      payload: {
        ...this.getQueryParams(),
        fillerType: 'peer-multi-sheet',
        async: false,
        exportType: 'DATA',
        ids: [2, 3, 4, 5, 6],
      },
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl
          .get(`${promptCode}.view.export.fileName`)
          .d('询价单导出报表') + `(${dayjs().format('YYYYMMDD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  // 新增采购申请类型
  @Bind()
  addPurchaseType(e) {
    this.setState({
      purchaseTypeVisible: true,
    });
  }

  // 隐藏采购申请类型弹框
  @Bind()
  hidePurchaseTypeModal() {
    this.setState({
      purchaseTypeVisible: false,
    });
  }

  // 采购申请类型弹窗确认事件
  @Bind()
  handleSavePurchaseType() {
    console.log(this.modalForm?.current?.getFieldsValue());
    const modalFormValue = this.modalForm?.current?.getFieldsValue();
    const { dispatch } = this.props;
    this.setState({
      purchaseTypeVisible: false,
    },
      () => {
        dispatch(
          routerRedux.push({
            pathname: `/ssrc-hk/purchaseApplication/edit/${modalFormValue.prType}/${modalFormValue.relatedToProject}`,
          }),
        );
      },
    );

  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      purchaseResultModel,
    } = this.props;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      purchaseTypeVisible,
    } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
    };
    const tableProps = {
      ...this.props,
      onRef: this.onTableRef,
      onSubmitToApproval: this.handleSubmitToApproval,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onPublish: this.handlePublish,
      onMassCreate: this.handleMassCreate,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      onExport: this.handleExport,
      purchaseResultModel
    };

    return (
      <>
        <PageWrapper loading={fetchLoading}>
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`hzero.common.view.button.search`).d('查询')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key='form'
            >
              <FilterSearch {...formProps} />
            </Panel>

            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                  arrowActive={activeKey.includes('table')}
                  showArrow={false}
                  buttons={
                    <>
                      <CusButton mini>{intl.get(`HKPC.commom.view.button.export`).d('导出')}</CusButton>
                    </>
                  }
                />
              }
              key='table'
            >
              <DataTable {...tableProps} />
            </Panel>

          </Collapse>
        </PageWrapper>
      </>

    );
  }
}
