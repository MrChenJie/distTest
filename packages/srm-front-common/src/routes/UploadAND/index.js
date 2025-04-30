/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-09-03 10:48:40
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Collapse, Form } from 'antd';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId } from 'utils/utils';
import PageWrapper from '../../components/Page/PageWrapper';
import PanelHeader from '@/components/CusCollapse';
import CusUpload from '@/components/CusUpload';

const { Panel } = Collapse;

class UploadAND extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'dictForm'],
      dictUuid: uuidv4()
    };
  }

  componentDidMount() {
    // this.handleSearch();
  }

  render() {
    const { verticalLine, activeKey, dictUuid } = this.state;
    return (
      <>
        <PageWrapper loading={false}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`demoTitle`).d('上传AND和Anti-Collusion')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <CusUpload
                filePreview
                bucketName="template"
                tenantId={getCurrentOrganizationId()}
                viewOnly={false}
                attachmentUUID={'admin-1'}
                tip={intl
                  .get('demoTitle')
                  .d('请上传AND和Anti-Collusion')}
              />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`demoTitle`).d('上传dict附件')}
                  arrowActive={activeKey.includes('dictForm')}
                />
              }
              key="dictForm"
            >
            <>
              <CusUpload
                filePreview
                bucketName="dict"
                tenantId={getCurrentOrganizationId()}
                viewOnly={false}
                attachmentUUID={dictUuid}
                tip={intl
                  .get('demoTitle')
                  .d('请上传对应客户所需的初始化附件')}
              />
              <div>
                <span>本次附件对应的uuid：</span>
                <span style={{color: '#f70b0b', fontSize: '16px'}}>{`${dictUuid}`}</span>
              </div>
            </>
            </Panel>
          </Collapse>
        </PageWrapper>
      </>
    );
  }
}

export default UploadAND;
