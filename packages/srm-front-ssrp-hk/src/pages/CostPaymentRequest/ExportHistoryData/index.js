/**
 * HistoryData
 * 付款申请单独修改使用
 */

import React, { Component } from 'react';

import mime from 'mime-types';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { createPagination, getCurrentOrganizationId, getAccessToken } from 'utils/utils';

import cusRequest from '_cus_utils/request';
import { getResponse as cusGetResponse } from '_cus_utils/utils';

import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';

import { queryIdpValue } from 'hzero-front/lib/services/api';

import DataTable from './DataTable';
import FilterForm from './FilterForm';
import { historyDataCancel, historyDataQuery } from './historyDataService';

export default class HistoryData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeList: [], // 任务状态
      errorInfoModalVisible: false, // 错误信息展示弹窗的 页面
      errorInfo: '', // 错误信息
    };
  }

  componentDidMount() {
    queryIdpValue('HPFM.ASYNC.TASK.STATE').then((res) => {
      const typeList = cusGetResponse(res);
      if (typeList) {
        this.setState({ typeList });
      }
    });
    this.handleSearch();
  }

  // base
  handleSearch(pagination = {}) {
    const { taskName } = this.props;
    this.tableForm?.current?.resetFields();
    const params = this.filterForm?.current?.getFieldsValue(true);
    this.setState({ queryLoading: true }, () => {
      historyDataQuery({
        ...pagination,
        ...params,
        taskName: isEmpty(params.taskName) ? taskName : `${taskName}%${params.taskName}%`,
      }).then(
        (dataSourceRes) => {
          const dataSource = cusGetResponse(dataSourceRes);
          if (dataSource) {
            this.setState({
              dataSource: dataSource.content,
              pagination: createPagination(dataSource),
              cachePagination: pagination,
              queryLoading: false,
              cancelLoading: false,
            });
            this.tableForm?.current?.resetFields();
          } else {
            this.setState({
              queryLoading: false,
              cancelLoading: false,
            });
          }
        },
        () => {
          this.setState({
            queryLoading: false,
            cancelLoading: false,
          });
        }
      );
    });
  }

  reload() {
    const { cachePagination = {} } = this.state;
    this.handleSearch(cachePagination);
  }

  // FilterForm
  @Bind()
  handleFilterFormSearch() {
    this.handleSearch();
  }

  // DataTable
  @Bind()
  handleTableChange(page, filter, sort) {
    this.handleSearch({ page, sort });
  }

  /**
   * 显示错误信息
   * @param {string} errorInfo
   */
  @Bind()
  handleShowErrorInfo(errorInfo) {
    this.setState({
      errorInfoModalVisible: true,
      errorInfo,
    });
  }

  @Bind()
  handleRecordDownload(record) {
    const { fileName = 'exportFile' } = this.props;
    cusRequest(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`, {
      method: 'GET',
      query: {
        bucketName: 'private-bucket',
        url: encodeURIComponent(record.downloadUrl),
        access_token: getAccessToken(),
      },
      responseType: 'blob',
    }).then((res) => {
      if (res) {
        const extension = record.downloadUrl?.split('.').pop();
        const mimeType = mime.lookup(extension);
        const blob = new Blob([res], {
          type: mimeType,
        });
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.${extension}`);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${extension}`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  @Bind()
  handleRecordCancel(record) {
    historyDataCancel({ taskCode: decodeURIComponent(record.taskCode) }).then(
      (res) => {
        if (cusGetResponse(res)) {
          CusNotification.success();
          this.reload();
        } else {
          this.setState({
            cancelLoading: false,
          });
        }
      },
      () => {
        this.setState({
          cancelLoading: false,
        });
      }
    );
  }

  // ErrorInfo Modal
  @Bind()
  hideErrorInfoModal() {
    this.setState({
      errorInfo: '',
      errorInfoModalVisible: false,
    });
  }
  @Bind
  handleAsyncExport() {
    const { queryParams, taskName, requestUrl } = this.props;
    cusRequest(`${requestUrl}`, {
      method: 'GET',
      query: {
        ...queryParams,
        // fillerType: 'peer-multi-sheet',
        fileName: `${taskName}${intl
          .get('spcm.costPayment.resale.exportDefaultFileName')
          .d('业务运营成本付款申请导出')}`,
        async: true,
        exportType: 'DATA',
      },
    }).then((res) => {
      if (res && res.failed) {
        CusNotification.error({
          message: res.message,
        });
      } else {
        CusNotification.success();
        this.handleSearch();
      }
    });
  }

  render() {
    const { onCancel = (e) => e } = this.props;
    const {
      typeList,
      dataSource,
      pagination,
      errorInfo = '',
      errorInfoModalVisible = false,
      queryLoading,
      cancelLoading,
    } = this.state;
    const { taskName } = this.props;
    return (
      <>
        <CusSpin spinning={queryLoading || cancelLoading}>
          <FilterForm
            onRef={(node) => {
              this.filterForm = node.form;
            }}
            onSearch={this.handleFilterFormSearch}
            typeList={typeList}
          />
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <DataTable
              onRef={(node) => {
                this.tableForm = node.form;
              }}
              parent={this}
              dataSource={dataSource}
              pagination={pagination}
              taskNamePrefix={taskName}
              onChange={this.handleTableChange}
              onShowErrorInfo={this.handleShowErrorInfo}
              onRecordDownload={this.handleRecordDownload}
              onRecordCancel={this.handleRecordCancel}
            />
          </div>
        </CusSpin>

        <div className="cus-modal-body-buttons">
          <CusButton
            key="submit"
            type="primary"
            style={{ marginLeft: '8px' }}
            // onClick={ this.handleAsyncExport}
            onClick={() => {
              onCancel();
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </CusButton>
        </div>
        <CusModal
          title={intl.get('hzero.common.component.excelExport.v.hd.errorInfo').d('异常信息')}
          visible={errorInfoModalVisible}
          onCancel={this.hideErrorInfoModal}
          footer={null}
          wrapClassName="ant-modal-sidebar-right"
          transitionName="move-right"
        >
          {errorInfo}
        </CusModal>
      </>
    );
  }
}
