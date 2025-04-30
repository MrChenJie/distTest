import React, { Component } from 'react';

import { Col, Form, Input, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { BKT_PUBLIC } from 'utils/config';
import { EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import { getAttachmentUrl } from './EncryptedUpload/utils';
import Upload from './EncryptedUpload/UploadButton';
import PreviewModal from './PreviewModal';

@Form.create()
export default class SystemConfig extends Component {
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

  @Bind
  getValue(data = [], code, propName) {
    const record = data.find((item) => item.configCode === code);
    if (record) {
      return record[propName];
    }
  }

  /**
   * 上传图片成功
   *
   * @param {*} file
   * @memberof SystemConfig
   */
  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        HOME_CONFIG_SYSTEM_LOGO: file.response,
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
   * @memberof SystemConfig
   */
  @Bind()
  onCancelSuccess() {
    const { form } = this.props;
    form.setFieldsValue({
      HOME_CONFIG_SYSTEM_LOGO: '',
    });
    this.setState({
      fileList: [],
    });
  }

  /**
   * 预览图片
   *
   * @memberof SystemConfig
   */
  @Bind
  handlePreview() {
    const { form } = this.props;
    const logoUrl = form.getFieldValue('HOME_CONFIG_SYSTEM_LOGO');
    this.setState({
      previewUrl: getAttachmentUrl(logoUrl, BKT_PUBLIC, 0, 'home_config', 'SCM-PORTAL'),
      previewVisible: true,
    });
  }

  /**
   * 取消预览
   *
   * @memberof SystemConfig
   */
  @Bind
  handlePreviewCancel() {
    this.setState({
      previewVisible: false,
    });
  }

  render() {
    const {
      form: { getFieldDecorator = (e) => e },
      data = [],
      onRemove = (e) => e,
    } = this.props;
    const { fileList, previewUrl, previewVisible } = this.state;
    const logoUrl = this.getValue(data, 'HOME_CONFIG_SYSTEM_LOGO', 'configBackground');
    const logoFileList =
      fileList ||
      (logoUrl
        ? [
          {
            uid: '-1',
            name: logoUrl.split('@').reverse()[0],
            status: 'done',
            url: logoUrl,
          },
        ]
        : []);
    return (
      <>
        <Form>
          <Row gutter={48}>
            <Col span={12}>
              <Row>
                <Form.Item
                  label={intl.get('ptal.homeConfig.model.systemTitle').d('系统标题')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('HOME_CONFIG_SYSTEM_TITLE', {
                    initialValue: this.getValue(data, 'HOME_CONFIG_SYSTEM_TITLE', 'configContent'),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ptal.homeConfig.model.systemTitle').d('系统标题'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get('ptal.homeConfig.model.systemTitle').d('系统标题')}
                      field='configContent'
                      token={this.getValue(data, 'HOME_CONFIG_SYSTEM_TITLE', '_token')}
                      inputSize={{ zh: 200, en: 200 }}
                      maxLength={200}
                    />,
                  )}
                </Form.Item>
              </Row>
              <Row>
                <Form.Item style={{ display: 'none' }}>
                  {getFieldDecorator('HOME_CONFIG_SYSTEM_LOGO', {
                    initialValue: this.getValue(
                      data,
                      'HOME_CONFIG_SYSTEM_LOGO',
                      'configBackground',
                    ),
                  })(<div />)}
                </Form.Item>
                <Form.Item
                  label={intl.get('ptal.homeConfig.model.logo').d('LOGO')}
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
                    fileList={logoFileList}
                    onUploadSuccess={this.onUploadSuccess}
                    onRemoveSuccess={this.onCancelSuccess}
                    onPreview={this.handlePreview}
                    viewOnly={logoFileList.length > 0}
                    onRemove={onRemove}
                    storageCode='SCM-PORTAL'
                  />
                </Form.Item>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Form.Item
                  label={intl.get('ptal.homeConfig.model.copyright').d('版权信息')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('HOME_CONFIG_COPYRIGHT', {
                    initialValue: this.getValue(data, 'HOME_CONFIG_COPYRIGHT', 'configContent'),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ptal.homeConfig.model.copyright').d('版权信息'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Row>
              <Row>
                <Form.Item
                  label={intl.get('ptal.homeConfig.model.contact').d('联系我们邮箱地址')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('HOME_CONFIG_CONTACT_EMAIL', {
                    initialValue: this.getValue(data, 'HOME_CONFIG_CONTACT_EMAIL', 'configContent'),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ptal.homeConfig.model.contact').d('联系我们邮箱地址'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Row>
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
