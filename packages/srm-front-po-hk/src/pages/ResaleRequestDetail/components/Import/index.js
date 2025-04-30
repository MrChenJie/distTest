/*
 * @Description: 转售付款申请 - 批量导入发票行
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-24 18:04:57
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { HZERO_FILE } from 'utils/config';
import uuidv4 from 'uuid/v4';
import { downloadFile } from 'hzero-front/lib/services/api';
import CusPanel from '_cus_components/Page/CusPanel';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import CusHeader from '_cus_components/Page/CusHeader';
import CusModal from '_cus_components/CusModal';
import ImportModal from '_cus_components/CusModal/ImportModal';
import { fastCodeLoader } from '@/utils/decorators';
import { actionImport } from '@/services/resaleRequestDetailService';

@fastCodeLoader(['SPUC.RESALE_PAYMENT_TEMPLATE'])
@formatterCollections({ code: ['spcm.paymentRequest'] })
export default class index extends Component {
  constructor(props) {
    super(props);
    const { location = {} } = props;
    const { costRequestId, backPath } = location?.state || {};
    const { open } = querystring.parse(location.search.substr(1)); // 判断是否飞书打开
    this.state = {
      open,
      dataSource: [], // 返回数据集
      activeKey: ['table'], // 面板key
      fetchListLoading: false, // 页面loading
      importUploading: false, // 文件上传Loading
      downloadLoading: false, // 下载模板loading
      importModalVisible: false, // 文件上传弹框显示标识
      costRequestId, // 转售单据Id
      backPath, // 返回的页面路由
    };
  }

  state = {};

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    return [
      {
        title: intl.get('spcm.paymentRequest.pi.column.title.No').d('序号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get('spcm.paymentRequest.pi.column.title.errorMessage').d('报错信息'),
        dataIndex: 'msg',
      },
    ];
  }

  /**
   * @name: 操作 - 上传文件
   * @param {array} payFileList 上传文件列表
   */
  payUpload = async (payFileList = []) => {
    const { history } = this.props;
    const { costRequestId, open, backPath } = this.state;
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({ importUploading: true });
    const res = await actionImport(formData, costRequestId);
    if (res) {
      const { status, errorMsg } = res;
      if (!status) {
        CusModal.error({
          content: intl
            .get(`spcm.paymentRequest.message.importFaild`)
            .d('导入校验失败，请查看错误信息'),
        });
        this.setState({
          dataSource: errorMsg
            .map((item) => ({ ...item, rowKey: uuidv4() }))
            .sort((a, b) => parseInt(a.lineNum, 10) - parseInt(b.lineNum, 10)),
        });
      } else {
        this.setState({ dataSource: [] });
        CusModal.confirm({
          content: intl
            .get(`spcm.paymentRequest.message.importSuccess`)
            .d('导入校验成功，是否提交？'),
          onOk: () => {
            history.push(open ? `${backPath}?open=fs` : backPath);
          },
        });
      }

      this.setState({
        importModalVisible: false,
      });
    }
    this.setState({ importUploading: false });
  };

  /**
   * @name: 操作 - 下载模板
   */
  handleDownloadTemplate = () => {
    const { idpValueMap = {} } = this.props;
    const url = idpValueMap['SPUC.RESALE_PAYMENT_TEMPLATE']?.[0]?.tag;
    console.log(url);
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
      open,
      backPath,
      fetchListLoading,
      activeKey,
      dataSource,
      importModalVisible,
      importUploading,
      downloadLoading,
    } = this.state;
    return (
      <PageWrapper loading={fetchListLoading}>
        <CusPanel>
          <CusHeader backPath={open ? `${backPath}?open=fs` : backPath} />
          <PanelHeader
            showArrow={false}
            title={intl.get('hzero.common.title.batchImport').d('批量导入')}
            arrowActive={activeKey.includes('table')}
            style={{ paddingTop: '0px' }}
            buttons={[
              <CusButton mini onClick={this.handleDownloadTemplate} loading={downloadLoading}>
                {intl.get(`spcm.paymentRequest.view.downloadTemplate`).d('下载模板')}
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
            scroll={{ x: tableScrollWidth(this.columns) }}
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
