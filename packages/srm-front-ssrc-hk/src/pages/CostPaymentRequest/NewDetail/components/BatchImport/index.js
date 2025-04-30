import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { API_HOST, HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, getAccessToken } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { downloadFile } from 'services/api';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { Upload } from 'hzero-ui';
import CusNotification from '_cus_components/CusNotification';
import CusHeader from '_cus_components/Page/CusHeader';
import CusPanel from '_cus_components/Page/CusPanel';

const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();
const prompt = 'spcm.costPayment';

@formatterCollections({ code: [prompt] })
class BatchImport extends React.Component {
  constructor(props) {
    super(props);
    const { state = {} } = this.props.location;
    const { costRequestId } = this.props.match.params;
    const { backPath } = state;
    this.state = {
      costRequestId,
      backPath,
    };
  }

  @Bind()
  beforeUpload() {
    this.setState({
      importLoading: true,
      dataSource: [],
      pagination: { current: 1, pageSize: 10 },
    });
    return true;
  }

  @Bind()
  handleDownloadTemplate() {
    queryIdpValue(['SPCM.COST_IMPORT_TEMPLATE']).then((res) => {
      const fileUrl = res[0].tag;
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
    });
  }

  render() {
    const { history } = this.props;
    const { dataSource, pagination, importLoading, backPath, costRequestId } = this.state;
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
      showUploadList: false,
      beforeUpload: this.beforeUpload,
      onChange: (info) => {
        if (info.file.status === 'uploading') {
          this.setState({ importLoading: true });
          return false;
        } else if (info.file.status === 'done') {
          this.setState({ importLoading: false });
          const response = info.file.response;
          if (response.failed) {
            CusNotification.error({
              message: response.message,
            });
            return;
          }
          if (response.length) {
            this.setState({
              dataSource: response,
              pagination: {
                current: 1,
                pageSize: 10,
                total: response.length,
              },
            });
            return false;
          }
          history.push({ pathname: `${backPath}` });
        } else if (info.file.status === 'error') {
          this.setState({
            importLoading: false,
          });
          CusNotification.error();
        }
      },
    };
    const columns = [
      {
        dataIndex: 'seqNum',
        title: intl.get(`${prompt}.import.seqNum`).d('行号'),
        render: (val) => <div style={{ textAlign: 'center' }}>{val}</div>,
        width: 60,
      },
      {
        dataIndex: 'errorFlag',
        title: intl.get(`${prompt}.import.errorFlag`).d('错误标识'),
        width: 250,
      },
      {
        dataIndex: 'errorMsg',
        title: intl.get(`${prompt}.import.errorMsg`).d('错误信息'),
        width: 850,
      },
    ];
    return (
      <PageWrapper loading={importLoading}>
        <CusPanel>
          <CusHeader backPath={backPath} />
          <PanelHeader
            title={intl.get(`hzero.common.title.batchImport`).d('批量导入')}
            showArrow={false}
            style={{ paddingTop: '0px' }}
            buttons={
              <>
                <CusButton mini onClick={this.handleDownloadTemplate}>
                  {intl.get(`${prompt}.view.downloadTemplate`).d('下载模板')}
                </CusButton>
                <Upload {...uploadProps}>
                  <CusButton mini type="primary">
                    {intl.get(`${prompt}.view.batch.importData`).d('导入')}
                  </CusButton>
                </Upload>
              </>
            }
          />
          <CusTable
            rowKey="rowKey"
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
          />
        </CusPanel>
      </PageWrapper>
    );
  }
}

export default BatchImport;
