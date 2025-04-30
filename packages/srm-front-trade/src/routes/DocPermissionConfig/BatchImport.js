/**
 * 单据权限配置 - BatchImport
 *
 * @date    2023-03-31
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */

import { connect } from 'dva';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';

import { Collapse, notification } from 'antd';
import { Icon, Upload } from 'hzero-ui';

import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import request from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  tableScrollWidth,
  getAccessToken,
  getCurrentOrganizationId,
} from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { downloadFile } from 'services/api';

const promptKey = 'spub.docPermissionConfig';
const accessToken = getAccessToken();
const organizationId = getCurrentOrganizationId();

import './index.less';

@formatterCollections({ code: ['hzero.common', promptKey] })
@connect(({ docPermissionConfig, loading }) => ({
  docPermissionConfig,
}))
export default class BatchImport extends Component {

  @Bind()
  downloadTemplate() {
    const docType = this.props?.match?.params?.docType;
    const { importTemplateList = [] } = this.props.docPermissionConfig;
    const description = (importTemplateList.filter((item = {}) => item.value === docType) || [])[0]?.description;
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download?bucketName=private-bucket&access_token=${accessToken}`;
    if (isEmpty(description)) {
      notification.warning({
        className: 'config-customize-notification',
        description: intl.get(`${promptKey}.downloadTemplateError`).d('下载失败，未维护下载模板，请检查；'),
      });
      return;
    }
    downloadFile({
      requestUrl: api,
      queryParams: [
        {
          name: 'bucketName',
          value: 'download-template',
        },
        {
          name: 'directory',
          value: docType,
        },
        {
          name: 'url',
          value: description,
        },
      ],
    });
  }

  @Bind()
  handleUpload(file) {
    if (isEmpty(file)) {
      return;
    }
    const docType = this.props?.match?.params?.docType;
    const formData = new FormData();
    formData.append('file', file);
    request(`/spub/v1/${organizationId}/doc-permission-configs/batchImport/AP`, {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (getResponse(res)) {
        this.props.dispatch({
          type: 'docPermissionConfig/updateState',
          payload: {
            [`${docType}-importList`]: res,
          },
        });
      }
    });
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'docPermissionConfig/queryLovList',
      payload: {
        importTemplateList: 'SPUB.DOC_PER_IMP_TEMPLATE',
      },
    })
  }

  render() {
    const docType = this.props?.match?.params?.docType;
    const dataSource = this?.props?.docPermissionConfig[`${docType}-importList`] || [];
    const columns = [
      {
        width: 120,
        dataIndex: 'lineNum',
        title: intl.get(`${promptKey}.lineNum`).d('行号'),
        render: (text, record, index) => {
          return index + 1;
        },
      },
      {
        width: 120,
        dataIndex: 'errorFlag',
        title: intl.get(`${promptKey}.errorFlag`).d('错误标识'),
        render: (text, record) => {
          return isEmpty(record.errorMsg)
            ? intl.get('hzero.common.status.no').d('否')
            : intl.get('hzero.common.status.yes').d('是');
        },
      },
      {
        dataIndex: 'errorMsg',
        title: intl.get(`${promptKey}.errorMsg`).d('错误信息'),
      },
    ];

    const uploadProps = {
      // action: `${process.env.API_HOST}/spub/v1/${organizationId}/doc-permission-configs/batchImport/AP`,
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      beforeUpload: (file) => {
        this.handleUpload(file);
        return false;
      },
    };

    return (
      <PageWrapper>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={['import']}
        >
          <Collapse.Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                title={
                  <Icon
                    type="left"
                    style={{ color: '#646a73', cursor: 'pointer' }}
                    onClick={() => {
                      const { history } = this.props;
                      history.goBack();
                    }}
                  />
                }
                showArrow={false}
                verticalLine={false}
                buttons={
                  <div>
                    <CusButton mini onClick={() => this.downloadTemplate()}>
                      {intl.get(`${promptKey}.downloadTemplate`).d('下载模板')}
                    </CusButton>
                    <Upload {...uploadProps}>
                      <CusButton mini type="primary">
                        {intl.get('hzero.common.button.import').d('导入')}
                      </CusButton>
                    </Upload>
                  </div>
                }
              />
            }
            key="import"
          >
            <CusTable
              rowKey="tempId"
              pagination={{ current: 1, pageSize: 10, total: dataSource.length }}
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: tableScrollWidth(columns) }}
            />
          </Collapse.Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
