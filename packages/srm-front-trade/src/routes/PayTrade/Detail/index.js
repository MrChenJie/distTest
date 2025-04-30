import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Row, Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import {
  getCurrentOrganizationId,
  createPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import { ready } from '../udc-sdk-esm';
import { closeWindow } from '_cus_utils/utils';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';
import FileList from './FileList';
import { queryFileList } from './utils';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS'])
@connect(({ loading, payTradeModal }) => ({
  payTradeModal,
  qeuryLoading: loading.effects['payTradeModal/queryDetail'] ||
  loading.effects['payTradeModal/queryListDetail'],
  confirmLoading: loading.effects['payTradeModal/savePayInfo'],
  // detailList: payTradeModal.detailList,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { activeId, formRecordId, caseId } =
    queryString.parse(location?.search?.substr(1)) || {};
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    if (!caseId) {
      this.handleReady();
    }
    this.state = {
      formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      isPub,
      activeKey: ['form', 'table', 'fileTable'],
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      bucketName: 'private-bucket',
      reasonVisible: false,
    };
  }

  /**
 * @name: 操作 - 设置致远自定义按钮
 */
  @Bind()
  handleReady = () => {
    console.log('开始调用设置致远自定义按钮');
    const btns = [
      {
        name: intl.get(`spfmhk.trade.button.Refuse`).d('退回'),
        buttonType: 'ghost',
        customEvents: [
          {
            type: 'click',
            messageType: 'NoAgree',
            func: () => {
              console.log('贸易商退回');
              // this.handleDisAgree();
              this.setState({
                reasonVisible: true
              })
            },
          },
        ],
      },
    ];
    console.log('btns', btns);
    ready(
      {
        mode: 'iframe',
        tenant: 'CMI',
      },
      (instance) => {
        instance.getCustomApi().insertBtnForToolbar({
          // 按钮插入位置
          position: 1,
          btns,
        });
      }
    );
  };

  componentDidMount() {
    this.queryDetail();
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  // 致远自定义按钮-退回
  handleDisAgree = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    this.basicForm.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'payTradeModal/savePayInfo',
          payload: {
            id: formRecordId,
            reason: values?.reason,
            status: 'Returned',
          }
        }).then((res) => {
          if(res) {
            // 通知致远关闭窗口
            window.parent?.postMessage({ messageType: 'CLOSE_WINDOW' }, '*');
          }
        })
        console.log('values', values)
      }
    })
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
            Salesman: params?.Salesman,
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
              Salesman: params?.Salesman, // 业务员
            });
          }
        });
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  queryDetail = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'payTradeModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res
        }, () => {
          this.queryListDetail();
          this.queryListFile();
          this.getTradeWinTotal();
        })
      }
    });
  };

  getTradeWinTotal = () => {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    dispatch({
      type: 'payTradeModal/getTradeWinTotal',
      payload: {
        refHeadId: headerInfo?.refHeadId,
        refTradeId: headerInfo?.refTradeId,
      },
    }).then((res) => {
      if(res) {
        this.setState({
          orderQuantityTotal: res?.orderQuantityTotal,
          orderQuoteHkdTotal: res?.orderQuoteHkdTotal,
        })
      }
    })
  }

  queryListDetail = (page = {}) => {
    const { dispatch } = this.props;
    const { headerInfo, formRecordId } = this.state;
    dispatch({
      type: 'payTradeModal/queryListDetail',
      payload: {
        page,
        isWin: 'y', // 是否筛选中标数>0的数据
        refHeadId: headerInfo?.refHeadId,
        refTradeId: headerInfo?.refTradeId,
      },
    }).then((res) => {
      if (res) {
        console.log('中标信息', res)
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'payTradeModal/updateState',
          payload: {
            successBidDetailSource: newDataSource,
            successBidDetailPagination: pagination,
          },
        });
      }
    });
  }

  queryListFile = () => {
    const { dispatch } = this.props;
    const { headerInfo, bucketName } = this.state;
    if(headerInfo?.attachmentUuid) {
      queryFileList({
        tenantId: organizationId,
        bucketName,
        attachmentUUID: headerInfo?.attachmentUuid,
      }).then((fileList) => {
        if (fileList) {
          console.log('fileList', fileList);
          dispatch({
            type: 'payTradeModal/updateState',
            payload: {
              fileDetailSource: fileList
            }
          })
        }
      });
    }
  }

  @Bind()
  handleSave = (callback) => {
    const { dispatch } = this.props;
    const { formRecordId, headerInfo } = this.state;
    dispatch({
      type: 'payTradeModal/savePayInfo',
      payload: {
        id: formRecordId,
      }
    }).then((res) => {
      if(res) {
        console.log('headerInfo', headerInfo);
        callback({
          formRecordId,
          subject: '标题',
          info: res,
          Salesman: headerInfo?.createrCode, // 业务员code
        })
      }
    })
  }

  render() {
    const {
      form,
      qeuryLoading = false,
      idpValueMap,
      payTradeModal,
      importUploading = false,
      confirmLoading = false,
    } = this.props;
    const {
      activeKey,
      headerInfo,
      bucketName,
      reasonVisible,
      orderQuantityTotal,
      orderQuoteHkdTotal,
    } = this.state;

    const { getFieldDecorator } = form;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.status);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const detailListrops = {
      ...this.props,
      readyOnly,
      onChange: this.queryListDetail
    };

    const fileListrops = {
      ...this.props,
      bucketName,
    }

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
                title={intl.get(`spfmhk.trade.title.bidinfo`).d('中标信息')}
                arrowActive={activeKey.includes('table')}
              />
            }
            key="table"
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
            <DetailList {...detailListrops} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.trade.title.attachment`).d('附件')}
                arrowActive={activeKey.includes('fileTable')}
              />
            }
            key="fileTable"
          >
            <FileList {...fileListrops} />
          </Panel>
        </Collapse>
        <CusModal
          title={intl.get('spfmhk.trade.field.Refuse.Reason').d('退回原因')}
          visible={reasonVisible}
          destroyOnClose
          width={600}
          onCancel={() => {
            this.setState({
              reasonVisible: false,
            })
          }}
          onOk={this.handleDisAgree}
          confirmLoading={confirmLoading}
        >
          <Form className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.noteTrader`).d('给贸易商备注')}
                >
                  {getFieldDecorator('reason', {
                    initialValue: headerInfo?.reason,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.trade.field.noteTrader`).d('给贸易商备注'),
                        })
                      }
                    ]
                  })(
                    <CusInput.TextArea
                      rows={3}
                      autoSize={{ minRows: 3, maxRows: 3 }}
                      maxLength={500}
                      showCharacter
                      disabled={false}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>
      </PageWrapper>
    );
  }
}
