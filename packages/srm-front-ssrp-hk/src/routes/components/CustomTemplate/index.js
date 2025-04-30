import React from 'react';
import { connect } from 'dva';
import queryString from 'querystring';
import uuidv4 from 'uuid/v4';
import { Upload, Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import { getAttachmentUrl } from '_cus_utils/utils';
import FilterForm from './FilterForm';
import { closeWindow } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const prompt = 'spcm.customTemplate';
const ROW_KEY = 'cooperateFileId';
const bucketName = 'purchase-con-files';
const { Panel } = Collapse;

@formatterCollections({ code: [prompt] })
@connect(({ loading, customTemplate }) => ({
  customTemplate,
  queryLoading: loading.effects['customTemplate/queryList'] ||
    loading.effects['customTemplate/submitEvaluate'] ||
    loading.effects['customTemplate/batchRemoveFiles'] ||
    loading.effects['customTemplate/queryFileList'],
  emsCooperateFiles: customTemplate.emsCooperateFiles,
  contractInfo: customTemplate.contractInfo,
}))
export default class CustomTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['evaluationScore', 'attachment'],
      selectedRowKeys: [],
      selectedRows: [],
      uploadLoading: false,
      flag: 'Y', // 是否可编辑页面
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = () => {
    const { dispatch } = this.props;
    const search = queryString.parse(this.props.location.search.substr(1)) || {};
    const { contractId, flag } = search;
    this.setState({
      flag,
    });
    dispatch({
      type: `customTemplate/queryList`,
      payload: {
        contractId,
      },
    }).then(res => {
      if (res) {
        this.form?.current?.setFieldsValue({
          evaluationScore: res.evaluationScore,
        });
      }
    })
  }

  getData = () => {
    const uuid = uuidv4();
    this.setState({
      uuid,
    });
    return {
      bucketName,
      attachmentUUID: uuid,
    };
  }

  handleOnUploadSuucess = () => {
    const { dispatch, emsCooperateFiles } = this.props;
    const { uuid } = this.state;
    dispatch({
      type: 'customTemplate/queryFileList',
      payload: {
        tenantId: organizationId,
        bucketName,
        attachmentUUID: uuid,
      },
    }).then(result => {
      if (result) {
        dispatch({
          type: `customTemplate/updateState`,
          payload: {
            emsCooperateFiles: [
              ...emsCooperateFiles,
              {
                ...result[0],
                uuid,
                uploadDate: result[0]?.creationDate,
                _status: 'create',
                [ROW_KEY]: uuidv4(),
              },
            ],
          },
        });
        CusNotification.success({
          message: intl.get(`hzero.common.uploadFile.view.uploadSuccess`).d('上传成功'),
        });
      }
    })
  }

  handleBatchDelete = () => {
    const { dispatch, emsCooperateFiles = [] } = this.props;
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    if (selectedRowKeys.length <= 0) {
      CusNotification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return 0;
    };
    const deleteAll = () => {
      const newAttachmentData = emsCooperateFiles.filter(row => {
        return !selectedRowKeys.includes(row[ROW_KEY]);
      })
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      }, () => {
        dispatch({
          type: `customTemplate/updateState`,
          payload: {
            emsCooperateFiles: newAttachmentData,
          },
        });
      })
    }
    const deleteData = selectedRows.filter(row => !['create'].includes(row._status));
    CusModal.CusDeleteConfirm(() => {
      if (deleteData.length > 0) {
        dispatch({
          type: 'customTemplate/batchRemoveFiles',
          payload: selectedRows,
        }).then(res => {
          if (res) {
            CusNotification.success();
            deleteAll();
          }
        })
      } else {
        deleteAll();
      }
    })
  }

  handleConfirm = () => {
    const { emsCooperateFiles, contractInfo, dispatch } = this.props;
    const { validateFields } = this.form?.current || {};
    validateFields()
      .then(values => {
        const { evaluationScore } = values;
        dispatch({
          type: `customTemplate/submitEvaluate`,
          payload: {
            ...contractInfo,
            evaluationScore,
            emsCooperateFiles: emsCooperateFiles.map(item => ({
              ...item,
              [ROW_KEY]: item._status === 'create' ? undefined : item[ROW_KEY],
            })),
          }
        }).then(res => {
          if (res) {
            this.handleSearch();
            CusNotification.success();
            window.close();
            // 飞书提交审批后关闭tag页
            closeWindow();
          }
        })
      })
  }

  render() {
    const { emsCooperateFiles = [], queryLoading = false } = this.props;
    const { selectedRowKeys, uploadLoading = false, flag, activeKey } = this.state;
    const isEdit = flag === 'Y';

    const formProps = {
      isEdit,
      onRef: (ref) => {
        this.form = ref.form;
      },
    }
    const columns = [
      {
        title: intl.get(`${prompt}.view.list.fileName`).d('文件名'),
        width: 800,
        dataIndex: 'fileName',
      },
      {
        title: intl.get(`${prompt}.view.list.operation`).d('操作'),
        width: 100,
        dataIndex: 'operation',
        render: (_, record) => {
          return (
            <CusButton type="plain">
              <a href={getAttachmentUrl(record.fileUrl, bucketName)}>
                {intl.get(`${prompt}.list.button.download`).d('下载')}
              </a>
            </CusButton>
          )
        }
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows,
        });
      },
    };
    const uploadProps = {
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
      },
      action: `${HZERO_FILE}/v1/${organizationId}/files/attachment/encrypt-multipart`,
      data: this.getData,
      beforeUpload: () => {
        this.setState({ uploadLoading: true });
        return true;
      },
      onSuccess: (res) => {
        if (res.failed) {
          CusNotification.error({ message: res.message });
        } else {
          this.handleOnUploadSuucess();
        }
        this.setState({ uploadLoading: false });
      },
      onError: (res) => {
        CusNotification.error({ message: JSON.parse(res).message });
        this.setState({ uploadLoading: false });
      },
      showUploadBtn: true,
      showUploadList: false,
    };
    const approvalRequestButtonVOList = [
      {
        name: intl.get(`hzero.common.button.submit`).d('提交'),
        nameE: intl.get(`hzero.common.button.submit`).d('提交'),
        onClick: this.handleConfirm,
        disabled: !isEdit,
      },
    ];

    return (
      <>
        <PageWrapper spinning={queryLoading}>
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
                  title={intl.get(`${prompt}.panel.header.evaluationScore`).d('评估分数')}
                  arrowActive={activeKey.includes('evaluationScore')}
                />
              }
              key="evaluationScore"
            >
              <FilterForm { ...formProps } />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.panel.header.attachment`).d('上传附件')}
                  arrowActive={activeKey.includes('attachment')}
                  buttons={
                    <>
                      <CusButton
                        mini
                        onClick={this.handleBatchDelete}
                        disabled={!isEdit}
                      >
                        {intl.get(`${prompt}.list.button.batchDelete`).d('批量删除')}
                      </CusButton>
                      <Upload {...uploadProps} style={{ marginLeft: '16px' }}>
                        <CusButton mini type="primary" disabled={!isEdit} loading={uploadLoading}>
                          {intl.get(`${prompt}.list.button.upload`).d('上传')}
                        </CusButton>
                      </Upload>
                    </>
                  }
                />
              }
              key="attachment"
            >
              <CusTable
                rowKey={ROW_KEY}
                pagination={false}
                columns={columns}
                dataSource={emsCooperateFiles}
                rowSelection={rowSelection}
              />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons
          approvalRequestButtonVOList={approvalRequestButtonVOList}
        />
      </>
    )
  }
}
