/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: liuliyuan
 * @Email: liyuan.liu@hand-china.com
 * @Date: 2020-10-16 15:32
 * @LastEditors: liuliyuan
 * @LastEditTime: 2020-11-04
 */
import React, { Component } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { Upload, Icon } from 'choerodon-ui';
import notification from 'utils/notification';
import { Button } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getAccessToken, isTenantRoleLevel } from 'utils/utils';
import { API_HOST, HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { queryIdpValue } from 'hzero-front/lib/services/api';
// import { flatMap } from 'lodash';
import { downloadFile } from 'hzero-front/lib/services/api';
import ExcelExport from '@/components/ExcelExport';
import { ParticipantsListDS } from '../stores/ParticipantsListDS';
import templateDS from '../stores/TemplateDS';

/**
 * 国际化前缀
 */
const promptCode = 'spfm.participantsBatchImport';
const { Column } = Table;
const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();

// 上传模板
const templateProps = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    Authorization: 'bearer '.concat(accessToken),
    Accept: '*/*',
  },
  name: 'file',
  action: `${API_HOST}/spfm/v1/${organizationId}/company-basic-ifs/update/template`,
  multiple: false,
  accept: ['.xlsx', '.xls'],
  showUploadList: false,
};

// 选择上传文件
const Props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    Authorization: 'bearer '.concat(accessToken),
    Accept: '*/*',
  },
  name: 'file',
  action: `${API_HOST}/spfm/v1/${organizationId}/company-basic-ifs/batchImport`,
  multiple: true,
  accept: ['.xlsx', '.xls'],
  showUploadList: false,
};

@formatterCollections({ code: [promptCode] })
export default class participantsBatchImport extends Component {
  participantsListDataSet = new DataSet({
    ...ParticipantsListDS(),
  });

  templateDataSet = new DataSet(templateDS());

  state = {
    importLoading: false,
    importTemplateLoading: false,
    batchNumber: 0,
    exportQueryParams: {},
  };

  // 上传模板
  @Bind()
  handleUploadTemplateError() {
    this.setState({
      importTemplateLoading: false,
    });
    notification.error({
      description: intl.get(`${promptCode}.import.permissionDenied`).d('权限不足!'),
    });
  }

  @Bind()
  handleUploadTemplateSuccess() {
    this.setState({
      importTemplateLoading: false,
    });
    notification.success();
  }

  @Bind()
  beforeTemplateUpload() {
    this.setState({
      importTemplateLoading: true,
    });
    return true;
  }

  // 模板下载
  @Bind()
  handleDownloadTemplate() {
    queryIdpValue(['SPFM.COMPANY_IMPORT_TEMPLATE']).then((res) => {
      const templateField = res.find((e) => e.value === 'COMPANY_IMPORT') || {};
      const fileUrl = templateField.tag;
      if (fileUrl) {
        const api = ''
          .concat(HZERO_FILE, '/v1/')
          .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
        // console.log('api的值', api);
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
    });

  }

  // 选择上传文件
  @Bind()
  handleUploadError() {
    this.setState({
      importLoading: false,
    });
    notification.error({
      description: intl.get(`${promptCode}.import.reUpload`).d('请重新上传!'),
    });
  }

  @Bind()
  handleUploadSuccess(responseData) {
    this.setState({
      importLoading: false,
    });
    if (responseData.type === 'warn') {
      notification.info({
        message: responseData.message,
      });
    } else if (responseData.data === null) {
      notification.error({
        description: intl.get(`${promptCode}.import.reUpload`).d('请重新上传!'),
      });
    } else {
      const batchNumValue = responseData.data;
      this.participantsListDataSet.setQueryParameter('batchNum', batchNumValue);
      this.participantsListDataSet.query();
      this.setState({
        batchNumber: batchNumValue,
      });
      notification.success();
    }
  }

  @Bind()
  beforeUpload() {
    this.setState({
      importLoading: true,
    });
    // const isLt50M = file.size / 1024 / 1024 < 50;
    // if (!isLt50M) {
    //   notification.error('文件必须小于 50MB!');
    // }
    // return isLt50M;
    return true;
  }

  // 数据导出
  @Bind()
  getExportQueryParams() {
    const data = this.participantsListDataSet.queryDataSet.toData();
    // console.log('data的值', data);
    if (data.length > 0) {
      this.setState({
        exportQueryParams: data[0],
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header
        // title={intl.get(`${promptCode}.view.message.ParticipantsBatch`).d('参与方信息批量导入')}
        >
          <ExcelExport
            onClick={() => this.getExportQueryParams()}
            requestUrl={`/spfm/v1/${organizationId}/company-basic-ifs/detailExport/${this.state.batchNumber}`}
            otherButtonProps={{ type: '#FFFFFF' }}
            queryParams={this.state.exportQueryParams}
            buttonText={intl.get(`${promptCode}.import.exportData`).d('数据导出')}
          />
          <Spin spinning={this.state.importLoading}>
            <Upload
              {...Props}
              onError={this.handleUploadError}
              onSuccess={this.handleUploadSuccess}
              beforeUpload={this.beforeUpload}
            >
              <Button type="primary">
                <Icon type="file_upload" />{' '}
                {intl.get(`${promptCode}.import.importData`).d('选择导入文件')}
              </Button>
            </Upload>
          </Spin>
          <Button
            type="#FFFFFF"
            style={{ marginRight: '8px' }}
            onClick={this.handleDownloadTemplate}
          >
            <Icon type="get_app" />{' '}
            {intl.get(`${promptCode}.import.downloadTemplate`).d('下载模板')}
          </Button>
          <Spin spinning={this.state.importTemplateLoading}>
            <Upload
              {...templateProps}
              onError={this.handleUploadTemplateError}
              onSuccess={this.handleUploadTemplateSuccess}
              beforeUpload={this.beforeTemplateUpload}
            >
              <Button type="#FFFFFF">
                <Icon type="file_upload" />{' '}
                {intl.get(`${promptCode}.import.importTemplate`).d('上传模板')}
              </Button>
            </Upload>
          </Spin>
        </Header>
        <Content>
          <Table dataSet={this.participantsListDataSet}>
            <Column name="processStatusMeaning" editor={false} align="center" />
            <Column name="processMessage" editor={false} align="center" />
            <Column name="companyNum" editor={false} align="center" />
            <Column name="ebsCode" editor={false} align="center" />
            <Column name="companyName" editor={false} align="center" />
            <Column name="companyEnglishName" editor={false} align="center" />
            <Column name="shortName" editor={false} align="center" />
          </Table>
        </Content>
      </React.Fragment>
    );
  }
}
