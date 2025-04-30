import React, { PureComponent } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { notification } from 'choerodon-ui';
import { Button, DataSet, Upload } from 'choerodon-ui/pro';
import { Table } from 'hzero-ui';
import { downloadFile } from 'hzero-front/lib/services/api';
import { Bind } from 'lodash-decorators';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAccessToken,
  createPagination,
} from 'utils/utils';
import { API_HOST, HZERO_FILE } from 'utils/config';
import querystring from 'querystring';
import { flatMap } from 'lodash';
import intl from 'utils/intl';
import templateDS from './dataset/templateDS';
import styles from './index.less';

notification.config({
  placement: 'bottomRight',
  duration: 6.0,
});

const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();
const prompt = 'spcm.costPayment';

@formatterCollections({ code: [prompt, 'spcm.paymentRequest'] })
export default class PriceMarkup extends PureComponent {
  state = {
    isPub: this.props.location.pathname.includes('pub'), // 判断是否为pub页面
    importLoading: false,
  };

  templateDataSet = new DataSet(templateDS());

  // importDataSet = new DataSet({
  //   autoQuery: false,
  //   selection: false,
  //   pageSize: 10,
  //   fields: [
  //     { name: 'seqNum', type: 'number', label: intl.get(`${prompt}.import.seqNum`).d('行号') },
  //     {
  //       name: 'errorFlag',
  //       type: 'string',
  //       label: intl.get(`${prompt}.import.errorFlag`).d('错误标识'),
  //     },
  //     {
  //       name: 'errorMsg',
  //       type: 'string',
  //       label: intl.get(`${prompt}.import.errorMsg`).d('错误信息'),
  //     },
  //   ],
  // });

  @Bind()
  handleUploadSuccess(response) {
    this.setState({
      importLoading: false,
    });
    const { costRequestId } = this.props.match.params;
    const { history } = this.props;
    const result = JSON.parse(response);
    if (result.failed) {
      notification.error({
        message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
        description: result.message,
      });
      return;
    }
    if (result.length) {
      const errorMsg = flatMap(result, (value) => {
        return value;
      });
      // this.importDataSet.loadData(errorMsg, errorMsg.length);
      this.setState({
        dataSource: errorMsg,
        pagination: createPagination(errorMsg),
      });
      return;
    }
    history.push({
      pathname: `${
        this.state.isPub ? '/pub' : ''
      }/spcm/cost/payment/request/detail/${costRequestId}`,
      query: {
        batchImport: true,
      },
    });
  }

  @Bind()
  beforeUpload() {
    this.setState({
      importLoading: true,
      dataSource: [],
      pagination: {},
    });
    return true;
  }

  @Bind()
  handleUploadError(_error, response) {
    this.setState({
      importLoading: false,
    });
    notification.error();
    const result = JSON.parse(response);
    const errorMsg = flatMap(result, (value) => {
      return value;
    });
    // this.importDataSet.loadData(errorMsg, errorMsg.length);
    this.setState({
      dataSource: errorMsg,
      pagination: createPagination(errorMsg),
    });
  }

  @Bind()
  handleDownloadTemplate() {
    const templateField = this.templateDataSet.getField('template');
    const data = templateField.getLookupData('TEMPLATE');
    const fileUrl = data.tag;
    if (fileUrl) {
      const api = ''
        .concat(HZERO_FILE, '/v1/')
        .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
      downloadFile({
        requestUrl: api,
        queryParams: [
          {
            name: 'url',
            value: encodeURIComponent(fileUrl),
          },
          {
            name: 'bucketName',
            value: 'private-bucket',
          },
        ],
      });
    }
  }

  @Bind
  pageChange(page) {
    const { dataSource } = this.state;
    const result = {
      content: dataSource,
      empty: false,
      number: page.current - 1,
      numberOfElements: 10,
      size: page.pageSize,
      totalElements: dataSource.length,
      totalPages: Math.ceil(dataSource.length / page.pageSize),
    };
    this.setState({
      pagination: createPagination(result),
    });
  }

  render() {
    const { costRequestId } = this.props.match.params;
    const { dataSource, pagination } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: 'bearer '.concat(accessToken),
        Accept: 'application/json',
      },
      name: 'excel',
      action: `${API_HOST}/spuc/v1/${organizationId}/cost-import/uploadDataAndValidate/${costRequestId}`,
      multiple: true,
      accept: ['.xlsx', '.xls'],
      uploadImmediately: true,
      showUploadList: false,
    };
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    // 表格columns
    const columns = [
      { dataIndex: 'seqNum', title: intl.get(`${prompt}.import.seqNum`).d('行号') },
      {
        dataIndex: 'errorFlag',
        title: intl.get(`${prompt}.import.errorFlag`).d('错误标识'),
      },
      {
        dataIndex: 'errorMsg',
        title: intl.get(`${prompt}.import.errorMsg`).d('错误信息'),
      },
    ];
    return (
      <>
        <Header
          /* title={
            open === 'fs'
              ? intl.get(`${prompt}.view.batch.import.fsTitle`).d('付款申请批量导入【业务运营成本】')
              : intl.get(`${prompt}.view.batch.import.title`).d('成本付款批量导入')
          } */
          backPath={`${
            this.state.isPub ? '/pub' : ''
          }/spcm/cost/payment/request/detail/${costRequestId}${open ? '?open=fs' : ''}`}
        >
          <div className={styles.upload}>
            <Button style={{ marginRight: '8px' }} onClick={this.handleDownloadTemplate}>
              {intl.get('spcm.paymentRequest.view.downloadTemplate').d('下载模板')}
            </Button>
            <Upload
              {...uploadProps}
              onUploadError={this.handleUploadError}
              onUploadSuccess={this.handleUploadSuccess}
              beforeUpload={this.beforeUpload}
            >
              {intl.get(`${prompt}.view.batch.importData`).d('导入')}
            </Upload>
          </div>
        </Header>
        <Content>
          <Table
            rowKey="rowKey"
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => this.pageChange(page)}
            loading={this.state.importLoading}
          />
        </Content>
      </>
    );
  }
}
