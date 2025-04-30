import React, { Component } from 'react';
import { Button, Table, Modal, Form, Row, Col, Upload, Icon, LocaleProvider } from 'hzero-ui';
// eslint-disable-next-line camelcase
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import request from 'utils/request';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { HZERO_PLATFORM, HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  getResponse,
  createPagination,
  isTenantRoleLevel,
  getCurrentLanguage,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import { downloadFile } from 'hzero-front/lib/services/api';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const currentLanguage = getCurrentLanguage();

/**
 *  导入数据
 *
 * @param {object} formData - 发送数据
 * @param {number} costRequestId - 付款申请头ID
 * @returns
 */
async function importData(formData, costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/import/${costRequestId}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

/**
 * 查询模板URL
 *
 * @returns
 */
async function queryTemplateUrl() {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/data`, {
    method: 'GET',
    query: {
      lovCode: 'SPUC.RESALE_PAYMENT_TEMPLATE',
    },
  });
}

const prefix = 'spcm.paymentRequest';

const SEARCH_ITEM_LESS = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};

@formatterCollections({ code: [prefix] })
@Form.create()
export default class Import extends Component {
  constructor(props) {
    super(props);
    const { location = {} } = props;
    const { state = {} } = location;
    const { costRequestId, backPath } = state;
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    this.state = {
      open,
      dataSource: [],
      pagination: {},
      visible: false,
      formData: undefined,
      loading: false,
      costRequestId,
      backPath,
      downloadLoading: false,
      fileName: undefined,
    };
  }

  /**
   * 点击导入按钮打开导入弹窗
   *
   * @memberof Import
   */
  @Bind()
  handleImport() {
    this.setState({
      visible: true,
    });
  }

  /**
   * 监听Input Change
   *
   * @param {object} e
   * @memberof Import
   */
  @Bind()
  handleFileChange(e) {
    const { files } = e.target;
    const file = files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.setState({
        formData,
      });
    } else {
      this.setState({
        formData: undefined,
      });
    }
  }

  /**
   * 处理数据导入
   *
   * @memberof Import
   */
  @Bind()
  handleImportData() {
    this.setState({
      loading: true,
    });
    const { formData, costRequestId, backPath, open } = this.state;
    const { history } = this.props;
    importData(formData, costRequestId).then((res) => {
      const response = getResponse(res);
      if (response) {
        const { status, errorMsg } = response;
        if (!status) {
          Modal.warning({
            title: intl
              .get(`spcm.paymentRequest.message.importFaild`)
              .d('导入校验失败，请查看错误信息'),
          });
          this.setState({
            dataSource: errorMsg
              .map((item) => ({ ...item, rowKey: uuidv4() }))
              .sort((a, b) => parseInt(a.lineNum, 10) - parseInt(b.lineNum, 10)),
            pagination: createPagination({
              number: 0,
              size: 10,
              totalElements: errorMsg.length,
            }),
          });
        } else {
          Modal.confirm({
            title: intl
              .get(`spcm.paymentRequest.message.importSuccess`)
              .d('导入校验成功，是否提交？'),
            onOk: () => {
              history.push(open ? `${backPath}?open=fs` : backPath);
            },
            okText: intl.get('hzero.common.status.yes').d('是'),
            cancelText: intl.get('hzero.common.status.no').d('否'),
          });
        }
      }
      this.setState({
        loading: false,
        visible: false,
      });
    });
  }

  @Bind()
  handleDownloadTemplate() {
    queryTemplateUrl().then((res) => {
      this.setState({
        downloadLoading: false,
      });
      const response = getResponse(res);
      if (response && Array.isArray(response)) {
        const { tag } = response[0] || {};
        const api = ''
          .concat(HZERO_FILE, '/v1/')
          .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
        downloadFile({
          requestUrl: api,
          queryParams: [
            {
              name: 'url',
              value: encodeURIComponent(tag),
            },
            {
              name: 'bucketName',
              value: 'private-bucket',
            },
          ],
        });
      }
    });
  }

  /**
   * 处理换页
   *
   * @param {object} page
   * @memberof Import
   */
  @Bind()
  handlePageChange(page) {
    this.setState({
      pagination: createPagination({
        size: page.pageSize,
        number: page.current - 1,
        totalElements: page.total,
      }),
    });
  }

  render() {
    const {
      dataSource,
      visible,
      formData,
      loading,
      backPath,
      downloadLoading,
      pagination,
      fileName,
      open,
    } = this.state;
    const columns = [
      {
        title: intl.get('spcm.paymentRequest.pi.column.title.No').d('序号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: intl.get('spcm.paymentRequest.pi.column.title.errorMessage').d('报错信息'),
        dataIndex: 'msg',
      },
    ];
    const uploadPorps = {
      showUploadList: false,
      beforeUpload: (file) => {
        if (file) {
          const newFormData = new FormData();
          newFormData.append('file', file, file.name);
          this.setState({
            formData: newFormData,
            fileName: file.name,
          });
        } else {
          this.setState({
            formData: undefined,
            fileName: undefined,
          });
        }
        return false;
      },
    };
    return (
      <>
        <Header
          backPath={open ? `${backPath}?open=fs` : backPath}
          /* title={
            open === 'fs'
              ? intl.get(`spcm.paymentRequest.fsTitle.import`).d('付款申请批量导入【转售采购成本】')
              : intl.get(`spcm.paymentRequest.title.import`).d('付款申请批量导入')
          } */
        >
          <Button type="primary" onClick={this.handleImport}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
          <Button loading={downloadLoading} onClick={this.handleDownloadTemplate}>
            {intl.get(`spcm.paymentRequest.view.downloadTemplate`).d('下载模板')}
          </Button>
        </Header>
        <Content>
          {/* eslint-disable-next-line camelcase */}
          <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}>
            <Table
              bordered
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              onChange={(page) => {
                this.handlePageChange(page);
              }}
              rowKey="rowkey"
            />
          </LocaleProvider>
        </Content>
        {visible && (
          <Modal
            title={intl
              .get(`spcm.paymentRequest.view.paymentRequestInvoiceImport`)
              .d('付款申请发票导入')}
            destroyOnClose
            footer={null}
            visible={visible}
            onCancel={() => {
              this.setState({ visible: false });
            }}
            width={600}
          >
            <fieldset>
              <legend>{intl.get(`spcm.paymentRequest.view.import.notice`).d('导入注意')}</legend>
              <p>
                1.
                {intl
                  .get(`spcm.paymentRequest.view.import.notice.message1`)
                  .d('严格按照导入模板整理数据，并检查是否缺少所需事项的数据。')}
              </p>
              <p>
                2.
                {intl
                  .get(`spcm.paymentRequest.view.import.notice.message2`)
                  .d('导入程序仅支持Excel Office。')}
              </p>
              <p>
                {intl
                  .get(`spcm.paymentRequest.view.import.notice.message3`)
                  .d('请仔细阅读以上内容并检查确认。')}
              </p>
              <p>
                {intl
                  .get(`spcm.paymentRequest.view.import.notice.message4`)
                  .d('操作完成后，验证数据是否导入成功。')}
              </p>
            </fieldset>
            <Form>
              <fieldset className={styles['fieldset-form']}>
                <legend>{intl.get(`spcm.paymentRequest.view.import.file`).d('导入文件')}</legend>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      label={intl.get(`spcm.paymentRequest.view.fileChoose`).d('选择文件')}
                      {...SEARCH_ITEM_LESS}
                    >
                      <Upload {...uploadPorps}>
                        <Button>
                          <Icon type="upload" />
                          {intl.get('spcm.paymentRequest.view.selectDocument').d('选择文件')}
                        </Button>
                      </Upload>
                      {/* <input type="file" onChange={this.handleFileChange} name={intl.get('spcm.paymentRequest.view.selectDocument').d('选择文件1')} placeholder={'No file has been selected'} /> */}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <div
                      title={fileName}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '14px',
                      }}
                    >
                      {fileName}
                    </div>
                  </Col>
                  <Col offset={2} span={4}>
                    <Form.Item>
                      <Button
                        onClick={this.handleImportData}
                        disabled={!formData}
                        type="primary"
                        loading={loading}
                      >
                        {intl.get('hzero.common.button.import').d('导入')}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </fieldset>
            </Form>
          </Modal>
        )}
      </>
    );
  }
}
