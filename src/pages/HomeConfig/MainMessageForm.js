import React, { Component } from 'react';
import { Col, Form, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import { BKT_PUBLIC } from 'utils/config';
import { getAttachmentUrl } from './EncryptedUpload/utils';
import Upload from './EncryptedUpload/UploadButton';

import PreviewModal from './PreviewModal';

@Form.create()
export default class MainMessageForm extends Component {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    this.state = {
      fileList: undefined,
      previewUrl: undefined,
      previewVisible: false,
    };
  }

  /**
   * 上传图片成功
   *
   * @param {*} file
   * @memberof MainMessageForm
   */
  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        configBackground: file.response,
      });
      this.setState({
        fileList: [
          {
            uid: -1,
            status: 'done',
            url: file.response,
          },
        ],
      });
    }
  }

  /**
   * 删除图片成功
   *
   * @memberof MainMessageForm
   */
  @Bind()
  onCancelSuccess() {
    const { form } = this.props;
    form.setFieldsValue({
      configBackground: '',
    });
    this.setState({
      fileList: [],
    });
  }

  /**
   * 预览
   *
   * @memberof MainMessageForm
   */
  @Bind
  handlePreview() {
    const { form } = this.props;
    const url = form.getFieldValue('configBackground');
    this.setState({
      previewUrl: getAttachmentUrl(url, BKT_PUBLIC, 0, 'home_config', 'SCM-PORTAL'),
      previewVisible: true,
    });
  }

  /**
   * 取消预览
   *
   * @memberof MainMessageForm
   */
  @Bind
  handlePreviewCancel() {
    this.setState({
      previewVisible: false,
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      data = {},
      onRemove = (e) => e,
    } = this.props;
    const { fileList, previewUrl, previewVisible } = this.state;
    const bgFileList =
      fileList ||
      (data.configBackground
        ? [
          {
            uid: '-1',
            name: data.configBackground.split('@').reverse()[0],
            status: 'done',
            url: data.configBackground,
          },
        ]
        : []);
    return (
      <>
        <Form>
          <Row>
            <Col span={12}>
              <Form.Item
                label={intl.get('ptal.homeConfig.model.mainMessage.configTitle').d('主消息标题')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              >
                {getFieldDecorator('configTitle', {
                  initialValue: data.configTitle,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('ptal.homeConfig.model.mainMessage.configTitle')
                          .d('主消息标题'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get('ptal.homeConfig.model.mainMessage.configTitle')
                      .d('主消息标题')}
                    field='configTitle'
                    token={data._token}
                    inputSize={{ zh: 200, en: 200 }}
                    maxLength={200}
                  />,
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={intl.get('ptal.homeConfig.model.mainMessage.configContent').d('主消息内容')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              >
                {getFieldDecorator('configContent', {
                  initialValue: data.configContent,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('ptal.homeConfig.model.mainMessage.configContent')
                          .d('主消息内容'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get('ptal.homeConfig.model.mainMessage.configContent')
                      .d('主消息内容')}
                    field='configContent'
                    token={data._token}
                    inputSize={{ zh: 400, en: 400 }}
                    maxLength={400}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item style={{ display: 'none' }}>
                {getFieldDecorator('configBackground', {
                  initialValue: data.configBackground,
                })(<div />)}
              </Form.Item>
              <Form.Item
                label={intl
                  .get('ptal.homeConfig.model.mainMessage.configBackground')
                  .d('主消息背景')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                extra={intl
                  .get('hzero.common.upload.support', {
                    type: '*.png;*.jpeg',
                  })
                  .d('上传格式：*.png;*.jpeg')}
              >
                <Upload
                  accept='.jpeg,.png,.jpg'
                  fileType='image/jpeg,image/png'
                  listType='picture-card'
                  single
                  bucketName={BKT_PUBLIC}
                  bucketDirectory='home_config'
                  fileList={bgFileList}
                  onUploadSuccess={this.onUploadSuccess}
                  onRemoveSuccess={this.onCancelSuccess}
                  onPreview={this.handlePreview}
                  viewOnly={bgFileList.length > 0}
                  onRemove={onRemove}
                  storageCode='SCM-PORTAL'
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <PreviewModal
          visible={previewVisible}
          url={previewUrl}
          onCancel={this.handlePreviewCancel}
        />
      </>
    );
  }
}
