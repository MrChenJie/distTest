import React, { Component } from 'react';
import { Upload } from 'hzero-ui';
import { getCurrentLanguage } from 'utils/utils';
import CusModal from '@/components/CusModal';
import CusTable from '@/components/CusTable';
import CusButton from '@/components/CusButton';
import PanelHeader from '@/components/CusCollapse';
import intl from 'utils/intl';
import './index.less';

class Index extends Component {
  state = {
    payFileList: [],
  };

  render() {
    const {
      visible,
      accept = '.xls,.xlsx',
      onCancel = (e) => e,
      payUpload = (e) => e,
      importUploading = false,
    } = this.props;
    const { payFileList } = this.state;
    // 导入文件的props
    const payProps = {
      action: ``,
      accept,
      showUploadList: false,
      multiple: false,
      beforeUpload: (file) => {
        this.setState({
          payFileList: [file],
        });
        return false;
      },
      fileList: payFileList,
    };

    return (
      <CusModal
        visible={visible}
        destroyOnClose
        onCancel={onCancel}
        className="batchImport"
        bodyStyle={{ marginTop: '0px' }}
        footer={
          <>
            <CusButton
              onClick={() => {
                this.setState({
                  payFileList: [],
                });
                onCancel();
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </CusButton>
            <CusButton
              type="primary"
              onClick={() => payUpload(payFileList)}
              disabled={payFileList.length === 0}
              loading={importUploading}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </CusButton>
          </>
        }
      >
        <div className="importTitle">
          {intl.get(`hzero.common.importModal.import-note`).d('导入注意')}
        </div>
        <div className="importContent">
          <p>
            {intl
              .get(`hzero.common.importModal.import-notice-one`)
              .d('1.严格按照导入模板整理数据，并检查是否缺少所需事项的数据。')}
          </p>
          <p style={{ marginBottom: '22px' }}>
            {intl.get(`hzero.common.importModal.import-notice-two`).d('2.仅支持指定下载模板导入。')}
          </p>
          <p>
            {intl
              .get(`hzero.common.importModal.import-notice-three`)
              .d('请仔细阅读以上内容并检查确认;操作完成后，验证数据是否导入成功。')}
          </p>
        </div>
        <PanelHeader
          title={intl.get(`hzero.common.importModal.import-file`).d('导入文件')}
          showArrow={false}
          verticalLine={false}
          buttons={
            <Upload {...payProps}>
              <CusButton mini>
                {intl.get(`hzero.common.importModal.select-file`).d('选择文件')}
              </CusButton>
            </Upload>
          }
        />
        <CusTable
          dataSource={payFileList}
          columns={[
            {
              title: intl.get(`hzero.common.view.fileName`).d('文件名称'),
              dataIndex: 'name',
              width: getCurrentLanguage() === 'zh_CN' ? 415 : 377,
            },
            {
              title: intl.get(`hzero.common.view.operation`).d('操作'),
              dataIndex: 'operation',
              width: getCurrentLanguage() === 'zh_CN' ? 62 : 101,
              render: () => (
                <CusButton
                  type="plain"
                  onClick={() =>
                    CusModal.CusDeleteConfirm(() => {
                      this.setState({
                        payFileList: [],
                      });
                    })
                  }
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
              ),
            },
          ]}
        />
      </CusModal>
    );
  }
}

export default Index;
