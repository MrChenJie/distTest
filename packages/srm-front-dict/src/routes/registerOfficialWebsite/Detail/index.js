import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import queryString from 'querystring';
import BasicData from './basicData';
import AttachmentTable from './attachmentTable';

const { Panel } = Collapse;
const commonPrompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [commonPrompt] })
@fastCodeLoader([
  'DICT.QUESTION_REPLY_STATUS',
  'DICT.QUESTION_TYPE',
  'DICT.MODE_NOTICE',
  'DICT.REVIEW_APPLICATION_STATUS',
  'DICT.PARTNER_FILE_TYPE',
  'DICT.START_APPRAISAL_WAY',
  'DICT.SCORE_ITEM',
])
@connect(({ loading, registerOfficialWebsiteModel }) => ({
  registerOfficialWebsiteModel,
  queryLoading:
    loading.effects['registerOfficialWebsiteModel/getBasicInfo'] ||
    loading.effects['registerOfficialWebsiteModel/getAttachmentInfo'],
  basicInfo: registerOfficialWebsiteModel?.basicInfo,
  attachmentList: registerOfficialWebsiteModel?.attachmentList,
}))
class registerOfficialWebsiteDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicData', 'attachmentTable'],
    };
  }

  componentDidMount() {
    this.getBasicInfo();
    this.getAttachmentInfo();
  }

  // 查询基本信息
  getBasicInfo = () => {
    const { location, dispatch } = this.props;
    const { search = '' } = location;
    const { recordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'registerOfficialWebsiteModel/getBasicInfo',
      payload: {
        recordId: recordId,
      },
    });
  };

  // 查询附件信息
  getAttachmentInfo = () => {
    const { dispatch, location } = this.props;
    const { search = '' } = location;
    const { recordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'registerOfficialWebsiteModel/getAttachmentInfo',
      payload: {
        recordId: recordId,
      },
    });
  };

  render() {
    const { activeKey } = this.state;
    const { queryLoading = false, basicInfo, idpValueMap, attachmentList } = this.props;
    const basicFormProps = {
      basicInfo,
    };
    const listTableProps = {
      idpValueMap,
      attachmentList,
    };
    return (
      <PageWrapper loading={queryLoading}>
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
                title={intl.get(`${commonPrompt}.view.field.common.basicinfo`).d('基础信息')}
                arrowActive={activeKey.includes('basicData')}
              />
            }
            key="basicData"
          >
            <BasicData {...basicFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${commonPrompt}.view.balcklist.attachments`).d('附件')}
                arrowActive={activeKey.includes('attachmentTable')}
              />
            }
            key="attachmentTable"
          >
            <AttachmentTable {...listTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}

export default registerOfficialWebsiteDetail;
