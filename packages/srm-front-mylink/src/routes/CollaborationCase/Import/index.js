/*
 * @Description: 支付单流程 - 更新付款状态 - 导入
 * @LastEditors: Please set LastEditors
 * @Date: 2024-07-12 17:29:14
 * @Copyright: Copyright (c) 2023, Hand
 */

import { downloadFile } from 'hzero-front/lib/services/api';
import React, { Component } from 'react';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import { actionImport } from '@/services/activeApplicationListService';
import { fastCodeLoader } from '@/utils/decorators';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import CusNotification from '_cus_components/CusNotification';
import ImportModal from '_cus_components/CusModal/ImportModal';
import CusTable from '_cus_components/CusTable';
import CusHeader from '_cus_components/Page/CusHeader';
import CusPanel from '_cus_components/Page/CusPanel';
import PageWrapper from '_cus_components/Page/PageWrapper';

@fastCodeLoader(['SRSP.EX_RATE.IMPORT_STATUS', 'SQAM.PAYMENT_EXCEL_TEMPLATE'])
@formatterCollections({ code: ['srsp.exchangeRateQuery'] })
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchListLoading: false, // 页面loading
      activeKey: ['table'], // 面板key
      dataSource: [], // 返回数据集
      importModalVisible: false, // 文件上传弹框显示标识
      importUploading: false, // 文件上传Loading
      downloadLoading: false, // 下载模板loading
    };
  }

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    const { idpValueMap = {} } = this.props;
    return [
      {
        title: intl.get(`srsp.exchangeRateQuery.field.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 80,
        render: (val) => <div style={{ textAlign: 'center' }}>{val}</div>,
      },
      {
        title: intl.get(`srsp.exchangeRateQuery.field.errorMsg1`).d('错误信息'),
        dataIndex: 'msg',
        width: 600,
      },
    ];
  }

  /**
   * @name: 操作 - 上传文件
   * @param {array} payFileList 上传文件列表
   */
  payUpload = async (payFileList = []) => {
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({ importUploading: true });
    const res = await actionImport(formData);
    if (res) {
      if (res.status === false) {
        this.setState({ dataSource: res?.errorMsg || [] });
      } else {
        CusNotification.success();
        this.setState({ dataSource: [] });
      }
      this.setState({ importModalVisible: false });
    }
    this.setState({ importUploading: false });
  };

  /**
   * @name: 操作 - 下载模板
   */
  handleDownloadTemplate = () => {
    const { idpValueMap = {} } = this.props;
    const url = idpValueMap['SQAM.PAYMENT_EXCEL_TEMPLATE']?.[0]?.value;
    if (url) {
      this.setState({ downloadLoading: true });
      // 下载文件
      downloadFile({
        requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
        queryParams: [
          {
            name: 'url',
            value: encodeURIComponent(url),
          },
          {
            name: 'bucketName',
            value: 'private-bucket',
          },
        ],
      }).then(() => this.setState({ downloadLoading: false }));
      this.setState({ downloadLoading: false });
    }
  };

  render() {
    const {
      fetchListLoading,
      activeKey,
      dataSource = [],
      importModalVisible,
      importUploading,
      downloadLoading,
    } = this.state;
    return (
      <PageWrapper loading={fetchListLoading}>
        <CusPanel>
          <CusHeader backPath="/pub/platform/activey-application/Detail" />
          <PanelHeader
            showArrow={false}
            title={intl.get('hzero.common.title.batchImport').d('批量导入')}
            arrowActive={activeKey.includes('table')}
            style={{ paddingTop: '0px' }}
            buttons={[
              <CusButton mini onClick={this.handleDownloadTemplate} loading={downloadLoading}>
                {intl.get('srsp.exchangeRateQuery.button.Template').d('下载模板')}
              </CusButton>,
              <CusButton
                type="primary"
                mini
                onClick={() => this.setState({ importModalVisible: true })}
              >
                {intl.get('hzero.common.button.import').d('导入')}
              </CusButton>,
            ]}
          />
          <CusTable
            rowKey="lineNum"
            columns={this.columns}
            dataSource={dataSource}
            pagination={{ current: 1, pageSize: 10, total: dataSource.length }}
          />

          <ImportModal
            visible={importModalVisible}
            onCancel={() => this.setState({ importModalVisible: false })}
            importUploading={importUploading}
            payUpload={this.payUpload}
          />
        </CusPanel>
      </PageWrapper>
    );
  }
}
