import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Form } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import CusRequest from '_cus_utils/request';
import { uniqBy } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentUser,
  isTenantRoleLevel,
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
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();

@formatterCollections({ code: ['spfmhk.mylink'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS', 'REGISTRATION_ADDRESS', 'HKSM.PRODCUT_SERVICE'])
@connect(({ loading, RegistrationInformationModal }) => ({
  RegistrationInformationModal,
  qeuryLoading: loading.effects['RegistrationInformationModal/queryDetail'] ||
    loading.effects['RegistrationInformationModal/queryListDetail'],
}))
export default class Detail extends React.Component {

  form = React.createRef();
  form0 = React.createRef();
  form1 = React.createRef();
  form2 = React.createRef();

  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { signId, formRecordId } =
      queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId:  signId || formRecordId,
      isPub,
      activeKey: ['form', 'table'],
      templateCode: 'mylink_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      itemKey: '0',
      fileList: []
    };
  }

  componentDidMount() {
    if (this.state.formRecordId) {
      this.queryDetail(this.state.formRecordId);
      // this.queryListDetail(_, this.state.formRecordId);
    }
    this.beforUpload({
      tenantId: getCurrentOrganizationId(),
      bucketName: "template",
      attachmentUUID: 'admin-1',
    })
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
      type: 'RegistrationInformationModal/queryDetail',
      payload: {
        id: formRecordId,
      },
    }).then((res) => {
      console.log(res)
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
      type: 'RegistrationInformationModal/queryListDetail',
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
          type: 'RegistrationInformationModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            productDetailPagination: pagination,
          },
        });
      }
    });
  }

  
  @Bind()
  handleDownloadTemplateClick = () => {
    const { templateCode } = this.state;
    const api = `/bidding/v1/${organizationId}/import/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] },);
  }

  payUpload = (payFileList = []) => {
    const { RegistrationInformationModal, dispatch } = this.props;
    const { productDetailSource = [] } = RegistrationInformationModal;
    const basicForm = this.basicForm?.getFieldsValue();
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    CusRequest(`/mylink/v1/${organizationId}/cmhk-act-mats/importMatExcelCheck`, {
      method: 'POST',
      body: formData,
      responseType: 'text',
    }).then((res) => {
      if (res) {
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
          type: 'RegistrationInformationModal/updateState',
          payload: {
            productDetailSource: newDataSource,
            // productDetailPagination: newPagination,
          }
        })
        this.setState({
          importUploading: false,
          productVisible: false,
        }, () => {
          if (response.msg) {
            CusNotification.error({
              message: response.msg,
            });
          }
        });
      }
    })
  }

  beforUpload = (params) => {
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${params.attachmentUUID
      }/file`,
      {
        method: 'GET',
        query: params,
      }
    ).then(res => {
      this.setState({
        fileList: res
      })
    });
  }

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      fileList,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.status) || (headerInfo?.createrCode && headerInfo?.createrCode !== loginName);

    const basicFormProps = {
      ...this.props,
      formRecordId,
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
                title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            bordered={false}
            key="form"
          >
            {(headerInfo?.companyName &&idpValueMap['REGISTRATION_ADDRESS']?.length >0 )&& <BasicForm {...basicFormProps} />}
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
