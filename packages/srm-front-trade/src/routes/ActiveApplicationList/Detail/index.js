import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import CusRequest from '_cus_utils/request';
import { uniqBy } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemsToPagination,
  delItemsToPagination,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFile } from 'hzero-front/lib/services/api';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import ImportModal from '_cus_components/CusModal/ImportModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();

@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS'])
@connect(({ loading, activeApplicationListModal }) => ({
  activeApplicationListModal,
  qeuryLoading: loading.effects['activeApplicationListModal/queryDetail'] ||
  loading.effects['activeApplicationListModal/queryListDetail'],
  detailList: activeApplicationListModal.detailList,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { activeId, formRecordId } =
    queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      isPub,
      activeKey: ['form', 'table'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
    };
  }

  componentDidMount() {
    if(this.state.formRecordId) {
      this.queryDetail(this.state.formRecordId);
      this.queryListDetail(_, this.state.formRecordId);
    }
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
      if (['DRAFT_HANDLE', 'SEND'].includes(submitType)) {
        // 保存 提交
        this.handleSave((params) => {
          console.log('save&submit', params)
          if (params) {
            handlePostMessage({
              formRecordId: params?.formRecordId,
              subject: params?.subject,
              info: params?.info,
            });
          }
        });
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  queryDetail = (formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'activeApplicationListModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res
        })
      }
    });
  };

  queryListDetail = (page = {}, formRecordId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'activeApplicationListModal/queryListDetail',
      payload: {
        page,
        refHeadId: formRecordId,
      },
    }).then((res) => {
      if (res) {
        console.log('商品详情', res)
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'activeApplicationListModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            productDetailPagination: pagination,
          },
        });
      }
    });
  }

  @Bind()
  handleDeleteLine = () => {
    const { dispatch, activeApplicationListModal } = this.props;
    const { productDetailSource, productDetailPagination } = activeApplicationListModal;
    const { selectedRowKeys, formRecordId, headId } = this.state;
    if(selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = productDetailSource.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'activeApplicationListModal/deleteProductLine',
            payload: deleteData
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              this.queryListDetail(_, (formRecordId || headId));
            }
          })
        } else {
          // 本地删除
          const newDataSource = productDetailSource.filter((item) => !selectedRowKeys.includes(item['rowKey']));
          // const delItemsLength = productDetailSource.length - newDataSource.length;
          // productDetailPagination.total = productDetailSource.length - 1
          // const newPagination = delItemsToPagination(delItemsLength, productDetailSource.length, productDetailPagination);
          dispatch({
            type: 'activeApplicationListModal/updateState',
            payload: {
              productDetailSource: newDataSource,
              // productDetailPagination: newPagination,
            },
          });
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  @Bind()
  handleDownloadTemplateClick = () => {
    const { templateCode } = this.state;
    const api = `/bidding/v1/${organizationId}/import/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] },);
  }

  @Bind()
  handleAddLine = () => {
    const { dispatch, activeApplicationListModal } = this.props;
    const { productDetailSource = [], productDetailPagination = {} } = activeApplicationListModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const newDataSource = [
      ...productDetailSource,
      {
        rowKey: uuidv4(),
        quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
        _status: 'create',
      },
    ]
    // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
    dispatch({
      type: 'activeApplicationListModal/updateState',
      payload: {
        productDetailSource: newDataSource,
        // productDetailPagination: newPagination,
      },
    });
  }

  @Bind()
  handleSave = (callback) => {
    const { dispatch, activeApplicationListModal } = this.props;
    const { productDetailSource } = activeApplicationListModal;
    const { headerInfo } = this.state;
    const validateData = getEditTableData(productDetailSource, ['rowKey']);
    const isUniqBy = uniqBy(validateData, item => `${item.productCode}`);
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        if (Array.isArray(validateData) && validateData.length === 0) {
          return CusNotification.warning({
            message: intl.get('spfmhk.trade.view.verifytip.addproduct').d('请添加商品行')
          })
        }
        if(isUniqBy.length < validateData.length) {
          return CusNotification.warning({
            message: intl.get('spfmhk.trade.view.verifytip.Product').d('存在相同商品，请检查')
          })
        }
        // 先保存基本信息，把id取到放到列表
        dispatch({
          type: 'activeApplicationListModal/saveActiveInfo',
          payload: {
            ...headerInfo,
            ...values,
            quoteEndTime: dayjs(values.quoteEndTime).format(DEFAULT_DATETIME_FORMAT),
            actStartTime: dayjs(values.actStartTime).format(DEFAULT_DATETIME_FORMAT)
          },
        }).then(info => {
          if (info) {
            this.queryDetail(info?.id);
            this.setState({
              headId: info?.id
            })
            dispatch({
              type: 'activeApplicationListModal/saveProductInfo',
              payload: {
                list: validateData.map((item) => ({
                  ...item,
                  currency: 'HKD',
                  refHeadId: info?.id
                }))
              }
            }).then((res) => {
              if(res) {
                if (typeof callback === 'function') {
                  callback({
                    formRecordId: info?.id,
                    subject: '标题',
                    info,
                  })
                }
                this.queryListDetail(_, info?.id);
              }
            })
          }
        });
      }
    })
  }

  payUpload = (payFileList = []) => {
    const { activeApplicationListModal, dispatch } = this.props;
    const { productDetailSource = [], productDetailPagination = {} } = activeApplicationListModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/trade/v1/${organizationId}/cmhk-act-mats/importMatExcelCheck`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if(res) {
        const response = JSON.parse(res);
        const data = (response?.data || [])?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          quoteRule: basicForm?.isFullQuote === 'Y' ? 'Bundled' : 'Singleton',
          _status: 'create',
        }));
        const newDataSource = [
          ...productDetailSource,
          ...data,
        ]
        // const newPagination = addItemsToPagination(productDetailSource.length, productDetailPagination);
        dispatch({
          type: 'activeApplicationListModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            // productDetailPagination: newPagination,
          }
        })
        this.setState({
          importUploading: false,
          productVisible: false,
        }, () => {
          if(response.msg){
            CusNotification.error({
              message: response.msg,
            });
          }
        });
      }
    })
  }

  // 导出商品详情表格
  handleExportProduInfor = (event) => {
    const { match, dispatch } = this.props;
    const { formRecordId } = this.state;
    event.preventDefault();
    event.stopPropagation();
    dispatch({
      type: 'activeApplicationListModal/goProduInforExport',
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
        const fileName = `${intl.get(`spfmhk.trade.view.title.ProduInfor`).d('商品详情')}.xlsx`;
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

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      activeApplicationListModal,
    } = this.props;
    const {
      productDetailSource,
      productDetailPagination
    } = activeApplicationListModal;
    const {
      activeKey,
      selectedRows,
      selectedRowKeys,
      headerInfo,
      productVisible,
      importUploading = false,
      headId,
      formRecordId,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.status) || (headerInfo?.createrCode && headerInfo?.createrCode !== loginName);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const detailListrops = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      basicForm: this.basicForm?.getFieldsValue(),
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId))
    };

    return (
      <PageWrapper loading={qeuryLoading}>
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
                title={intl.get(`spfmhk.trade.view.title.BasicInfor`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicForm {...basicFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.view.title.ProduInfor`).d('商品详情')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusButton loading={false} mini onClick={(e) => this.handleExportProduInfor(e)}>
                      {intl.get(`spfmhk.trade.field.export`).d('导出')}
                    </CusButton>
                    {
                      readyOnly ? <></> : (
                        <>
                          <CusButton
                            mini
                            onClick={this.handleDeleteLine}
                          >
                            {intl.get('hzero.common.view.button.delete').d('删除')}
                          </CusButton>
                          <CusButton
                            mini
                            onClick={this.handleDownloadTemplateClick}
                          >
                            {intl.get('spfmhk.trade.button.downloadtemp').d('下载模板')}
                          </CusButton>
                          <CusButton
                            mini
                            onClick={() => {
                              this.setState({
                                productVisible: true,
                              })
                            }}
                          >
                            {intl.get('hzero.common.view.button.Import').d('导入')}
                          </CusButton>
                          <CusButton
                            mini
                            type="primary"
                            onClick={this.handleAddLine}
                          >
                            {intl.get('hzero.common.button.add').d('新增')}
                          </CusButton>
                        </>
                      )
                    }
                  </>
                }
              />
            }
            key="table"
          >
            <Form>
              <DetailList {...detailListrops} />
            </Form>
          </Panel>
        </Collapse>
        <ImportModal
          visible={productVisible}
          onCancel={() => {
            this.setState({
              productVisible: false,
            })
          }}
          importUploading={importUploading}
          payUpload={this.payUpload}
        />
      </PageWrapper>
    );
  }
}
