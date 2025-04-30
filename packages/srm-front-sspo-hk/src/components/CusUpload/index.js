import React, { PureComponent } from 'react';
import { Alert, Tag } from 'hzero-ui';
import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { getAttachmentUrl, queryFileList, queryUUID, removeFile } from './utils';
import UploadButton from './UploadButton';
import request from '_cus_utils/request';
import { getResponse } from '_cus_utils/utils';
import CusFileViewer from '_cus_components/CusFileViewer';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusSpin from '_cus_components/CusSpin';
import { Tooltip } from 'antd';
import tipIcon from '@/assets/tips.svg';

const DEFAULT_BUCKET_NAME = 'spfm-comp';

/**
 * 使用UUID上传组件
 * @extends {Component} - React.Component
 * @reactProps {?String} bucketName - 附件桶
 * @reactProps {?String} bucketDirectory - 目录名称
 * @reactProps {?Object} attachmentUUID - 传入的UUID，如果不传入，组件可生成
 * @reactProps {?Object} currentData - 当前行数据
 * @reactProps {?function} afterOpenUploadModal - 展开modal后触发的方法
 * @reactProps {?Boolean} hasTemplate - 是否有附件模版
 * @reactProps {?String} templateAttachmentUUID - 附件模版UUID,通过 Tooltip 提示用户附件模版
 * @reactProps {?function} removeCallback - 删除文件后回调
 * @reactProps {?function} onCloseUploadModal - 关闭弹框时调用方法
 * @reactProps {?Boolean} viewOnly - 是否只读
 * @reactProps {?Boolean} isEncrypt - 是否使用加解密接口
 * @return React.element
 */
export default class Upload extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      modalLoading: false,
      uploading: false,
      templateList: [],
      fileList: [],
      previewVisible: false,
      previewImages: [],
      attachmentUUID: '',
    };
  }

  upload;

  componentDidMount() {
    const { bucketName = DEFAULT_BUCKET_NAME, attachmentUUID, tenantId } = this.props;
    if (attachmentUUID) {
      queryFileList({
        tenantId,
        bucketName,
        attachmentUUID,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList),
          });
        }
      });
    }
  }

  /**
   * 如果attachmentUUID变化 请求新UUID中的文件列表
   * @param {Object} nextProps 下个状态的props
   */
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { bucketName = DEFAULT_BUCKET_NAME, tenantId } = this.props;
    if (this.props.attachmentUUID !== nextProps.attachmentUUID && nextProps.attachmentUUID) {
      queryFileList({ tenantId, bucketName, attachmentUUID: nextProps.attachmentUUID }).then(
        (fileList) => {
          if (getResponse(fileList)) {
            this.setState({
              fileList: this.changeFileList(fileList),
            });
          }
        }
      );
    }
  }

  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response) {
    const { bucketName = DEFAULT_BUCKET_NAME, bucketDirectory, tenantId, isEncrypt } = this.props;
    return response.map((res, index) => {
      console.log('changeFileList', res)
      return {
        uid: index + 1,
        name: res.fileName,
        creationDate: res.creationDate,
        status: 'done',
        url: getAttachmentUrl({
          url: res.fileUrl,
          bucketName,
          tenantId,
          bucketDirectory,
          isEncrypt,
        }),
      };
    });
  }

  /**
   *打开modal后返回方法，可返回当前行数据和UUID
   *
   * @memberof UploadModal
   */
  @Bind()
  handleAfterOpenModal() {
    const { afterOpenUploadModal, attachmentUUID } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    if (isFunction(afterOpenUploadModal)) {
      afterOpenUploadModal(attachmentUUID || stateAttachmentUUID);
    }
  }

  @Bind()
  closeUploadModal() {
    const { onCloseUploadModal } = this.props;
    this.setState({
      visible: false,
    });
    if (onCloseUploadModal) {
      onCloseUploadModal();
    }
  }

  @Bind()
  async openUploadModal() {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      attachmentUUID,
      templateAttachmentUUID,
      tenantId,
    } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    this.setState({
      visible: true,
      loading: true,
    });

    let state = { loading: false };
    if (templateAttachmentUUID) {
      const tempalteList = await queryFileList({
        tenantId,
        bucketName,
        attachmentUUID: templateAttachmentUUID,
      });
      if (getResponse(tempalteList)) {
        state = {
          ...state,
          templateList: tempalteList,
        };
      }
    }

    let uuid = attachmentUUID || stateAttachmentUUID;
    if (!uuid) {
      const response = await queryUUID({ tenantId });
      if (response) {
        uuid = response.content;
      }
    }
    state = {
      ...state,
      attachmentUUID: uuid,
    };
    if (uuid) {
      const fileList = await queryFileList({
        tenantId,
        bucketName,
        attachmentUUID: uuid,
      });
      if (getResponse(fileList)) {
        state = {
          ...state,
          fileList: this.changeFileList(fileList),
        };
        if (this.upload) {
          this.upload.setFileList(this.changeFileList(fileList));
        }
      }

      this.setState(state, () => {
        this.handleAfterOpenModal();
      });
    }
  }

  /**
   *Ref
   *
   * @param {*} upload
   * @memberof UploadModal
   */
  @Bind()
  onRef(upload) {
    this.upload = upload;
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess(file, fileList) {
    const { uploadSuccess } = this.props;
    if (uploadSuccess) {
      uploadSuccess();
    }
    this.setState({
      fileList,
    });
    const { onChange } = this.props;
    if (onChange) {
      const { single } = this.props;
      if (single) {
        // 由 UploadButton 触发 onUploadSuccess
      } else {
        const { attachmentUUID } = this.props;
        const { attachmentUUID: stateAttachmentUUID } = this.state;
        onChange(attachmentUUID || stateAttachmentUUID);
      }
    }
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewImages: [
        {
          src: file.url || file.thumbUrl,
          alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
        },
      ],
      previewVisible: true,
    });
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewImages: [],
      previewVisible: false,
    });
  }

  /**
   *删除文件
   *
   * @param {*} file 文件
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file) {
    const {
      removeCallback,
      bucketName = DEFAULT_BUCKET_NAME,
      tenantId,
      attachmentUUID,
    } = this.props;
    const { attachmentUUID: stateAttachmentUUID, fileList } = this.state;
    this.setState({
      modalLoading: true,
    });
    if (file.url) {
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      return removeFile({
        tenantId,
        bucketName,
        attachmentUUID: attachmentUUID || stateAttachmentUUID,
        urls: [fileUrl],
      }).then((res) => {
        if (getResponse(res)) {
          CusNotification.success();
          this.setState({
            modalLoading: false,
            fileList: fileList.filter((list) => list.url !== file.url),
          });
          if (this.upload) {
            this.upload.setFileList(fileList.filter((list) => list.url !== file.url));
          }
          if (removeCallback) {
            removeCallback();
          }
          return true;
        } else {
          this.setState({
            modalLoading: false,
          });
          return false;
        }
      });
    } else {
      this.setState({
        modalLoading: false,
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  @Bind()
  handlePreviewFile(item) {
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'docx') {
      request(item.url, {
        responseType: 'blob',
        method: 'GET',
      }).then((response) => {
        if (response.size === 0) {
          CusNotification.warning({
            message: intl.get('hzero.common.cannot.preview.empty.file').d('不能预览空白文件'),
          });
          return false;
        } else {
          this.setState({
            previewFileVisible: true,
            fileExt,
            previewUrl: item.url,
          });
        }
      });
    } else {
      this.setState({
        previewFileVisible: true,
        fileExt,
        previewUrl: item.url,
      });
    }
  }

  render() {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      bucketDirectory,
      viewOnly = false,
      icon = viewOnly ? 'paper-clip' : 'upload',
      filesNumber = '',
      showFilesNumber = true,
      hasTemplate,
      multiple = true,
      btnText = viewOnly
        ? intl.get('hzero.common.upload.view').d('查看附件')
        : intl.get('hzero.common.upload.text').d('上传附件'),
      description,
      onChange,
      tenantId,
      btnProps = {},
      title = intl.get('hzero.common.upload.modal.title').d('附件'),
      docType,
      storageCode, // 存储配置编码
      isEncrypt,
      tip,
      isOnlyButton = false,
      ...otherProps
    } = this.props;
    const { attachmentUUID } = this.props;
    const {
      visible,
      modalLoading,
      previewVisible,
      previewImages,
      templateList = [],
      loading = false,
      uploading = false,
      attachmentUUID: stateAttachmentUUID,
      previewFileVisible = false,
      fileExt,
      previewUrl,
    } = this.state;
    let { fileList } = this.state;
    if (this.upload) {
      // eslint-disable-next-line prefer-destructuring
      fileList = this.upload.state.fileList.filter((item) => item.status !== 'removed');
    }
    const actionPathname = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/${isEncrypt ? 'encrypt-multipart' : 'multipart'
      }`
      : `${HZERO_FILE}/v1/files/attachment/multipart`;
    const action = `${actionPathname}`;
    const filesNumberWidth = showFilesNumber && ((filesNumber && filesNumber !== 0) || fileList.length > 0) ? 24 : 0;
    const tipWidth = tip ? 24 : 0;
    const activeWidth = `${filesNumberWidth + tipWidth}px`;
    const uploadLinkButton = !isOnlyButton ? (
      <div style={{ display: 'flex', alignItems: 'center', width: `calc(100% - ${activeWidth})` }} className="cus-upload-tag">
        {isEmpty(btnProps) ? (
          <CusButton type="plain" onClick={this.openUploadModal}>
            {btnText}
          </CusButton>
        ) : (
          <CusButton onClick={this.openUploadModal} {...btnProps}>
            {btnText}
          </CusButton>
        )}
        {showFilesNumber && ((filesNumber && filesNumber !== 0) || fileList.length > 0) && (
          <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : fileList.length}</Tag>
        )}
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img src={tipIcon} style={{ width: '16px', marginLeft: '8px' }} alt="tip" />
          </Tooltip>
        )}
      </div>
    ) : (
      <CusButton onClick={this.openUploadModal} {...btnProps}>
        {btnText}
      </CusButton>
    );

    let descriptionBlock = null;
    if (hasTemplate || description) {
      const templateLinks = templateList.map((tpl) => {
        return (
          <Tag>
            <a
              style={{ color: '#108ee9' }}
              href={tpl.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tpl.fileName}
            </a>
          </Tag>
        );
      });
      const message = (
        <React.Fragment>
          <div>{description}</div>
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}{' '}
              </span>
            )}
          </div>
        </React.Fragment>
      );

      descriptionBlock = (
        <Alert
          showIcon
          message={message}
          style={{ marginRight: '8px', marginBottom: '15px' }}
          type="info"
        />
      );
    }

    const modalContent = (
      <React.Fragment>
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px 50px' }}>
            <CusSpin />
          </div>
        )}
        <div style={{ display: loading ? 'none' : '', overflow: 'hidden' }}>
          {descriptionBlock}
          <CusSpin spinning={modalLoading || uploading}>
            <UploadButton
              handlePreviewFile={this.handlePreviewFile}
              viewOnly={viewOnly}
              multiple={multiple}
              // listType="picture-card"
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              onRef={this.onRef}
              tenantId={tenantId}
              onRemove={this.removeFile}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录？'),
                showRemoveIcon: !viewOnly,
              }}
              action={action}
              filePreview
              {...otherProps}
              attachmentUUID={attachmentUUID || stateAttachmentUUID}
              isEncrypt={isEncrypt}
              setLoading={(uploading = false) => {
                this.setState({
                  uploading,
                })
              }}
            />
          </CusSpin>
        </div>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        {uploadLinkButton}
        <CusModal
          // className="modal-margin-unset"
          visible={visible}
          width={610}
          footer={
            <CusButton
              onClick={this.closeUploadModal}
              disabled={uploading}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
          onCancel={this.closeUploadModal}
          bodyStyle={{
            marginTop: '0px',
          }}
          maskClosable={!uploading}
          destroyOnClose
        >
          {modalContent}
        </CusModal>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handlePreviewCancel}
          images={previewImages}
        />
        <CusFileViewer
          visible={previewFileVisible}
          fileType={fileExt}
          filePath={previewUrl}
          onCancel={() => {
            this.setState({ previewFileVisible: false });
          }}
          onClosePreview={() => {
            this.setState({
              previewFileVisible: false,
            })
          }}
        />
      </React.Fragment>
    );
  }
}
