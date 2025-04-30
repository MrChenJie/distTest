import React, { Component } from 'react';
import { DataSet, Table, Button, Upload, Spin } from 'choerodon-ui/pro';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SSLM } from '_utils/config';
import { API_HOST } from 'utils/config';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import request from 'utils/request';
import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';

const { Column } = Table;
const accessToken = getAccessToken();

const uploadProps = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    Authorization: 'bearer '.concat(accessToken),
    Accept: 'application/json',
  },
  name: 'file',
  action: `${API_HOST}${SRM_SSLM}/v1/batch-contracts/eval/batch/import`,
  multiple: false,
  accept: ['.xlsx', '.xls'],
  uploadImmediately: true,
  showUploadList: false,
};

@formatterCollections({ code: ['sslm.erp'] })
export default class batchEvaluateImport extends Component {
  state = { submitLoading: false, importLoading: false, data: [], hasError: false };

  importDataSet = new DataSet({
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        name: 'status',
        type: 'string',
        label: intl.get(`sslm.erp.view.batch.evaluate.import.status`).d('验证结果'),
      },
      {
        name: 'errorMessage',
        type: 'string',
        label: intl.get(`sslm.erp.view.batch.evaluate.import.errorMsg`).d('校验结果'),
      },
    ],
  });

  uploadFile = (
    <Upload
      {...uploadProps}
      onUploadError={this.handleUploadError}
      onUploadSuccess={this.handleUploadSuccess}
      beforeUpload={this.beforeUpload}
    >
      {intl.get(`sslm.erp.view.batch.evaluate.import.selectFile`).d('选择文件')}
    </Upload>
  );

  submitEvaluate = (
    <Button icon="save" color="primary" onClick={this.handleSubmitEvaluate}>
      {intl.get(`sslm.erp.view.batch.evaluate.import.submitEvaluate`).d('提交')}
    </Button>
  );

  @Bind()
  handleSubmitEvaluate() {
    if (this.state.hasError) {
      notification.error({
        description: intl
          .get(`sslm.erp.view.batch.evaluate.import.hasError`)
          .d('已上传的评估记录中存在不符合规范的数据，请检查后重新上传'),
        placement: 'bottomRight',
      });
      return;
    }
    if (this.state.data.length === 0) {
      notification.error({
        description: intl
          .get(`sslm.erp.view.batch.evaluate.import.isEmpty`)
          .d('内容为空，请选择文件！'),
        placement: 'bottomRight',
      });
      return;
    }
    this.setState({
      submitLoading: true,
    });
    request(`/spuc/v1/0/erp-contract-evaluates/batch/submitErpEvaluate`, {
      method: 'POST',
      body: this.state.data,
    })
      .then((resonseData) => {
        this.setState({
          submitLoading: false,
          data: [],
        });
        this.importDataSet.loadData([], 0);
        if (resonseData.failed) {
          notification.error({
            description: resonseData.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            placement: 'bottomRight',
            message: intl.get(`sslm.erp.view.batch.evaluate.submit.success`).d(`保存成功!`),
          });
        }
      })
      .catch(() => {
        notification.error({
          description: 'error',
          placement: 'bottomRight',
        });
      });
  }

  @Bind()
  handleUploadSuccess(response) {
    this.setState({
      importLoading: false,
      hasError: false,
    });
    const result = JSON.parse(response);
    if (result.failed) {
      notification.error({ description: result.message });
      return;
    }
    for (let index = 0; index < result.length; index++) {
      const row = result[index];
      if (row.status !== 'N') {
        row.status = 'Y';
        row.errorMessage = intl.get(`sslm.erp.view.batch.evaluate.import.success`).d('校验成功');
      } else {
        this.setState({
          hasError: true,
        });
      }
    }
    if (!this.state.hasError) {
      this.setState({
        data: result,
      });
    }
    this.importDataSet.loadData(result, result.length);
  }

  @Bind()
  beforeUpload() {
    this.setState({
      importLoading: true,
      data: [],
    });
    return true;
  }

  @Bind()
  handleUploadError(_error, response) {
    this.setState({
      importLoading: false,
    });
    const result = JSON.parse(response);
    notification.error({
      description: result.message,
    });
  }

  render() {
    const buttons = [
      <div
        style={{
          float: 'right',
        }}
      >
        {this.uploadFile}
        {this.submitEvaluate}
      </div>,
      <div style={{ clear: 'both' }} />,
    ];
    return (
      <PageHeaderWrapper
        title={intl.get(`sslm.erp.view.batch.evaluate.import.title`).d('批量评估记录导入')}
      >
        <Spin spinning={this.state.importLoading | this.state.submitLoading}>
          <Table dataSet={this.importDataSet} buttons={buttons}>
            <Column name="status" width={100} />
            <Column name="errorMessage" tooltip="overflow" />
          </Table>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
