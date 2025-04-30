import React from 'react';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { queryLine } from '@/services/BpmApproveService';
import BasicInfo from './BasicInfo';
import ApproveLine from './ApproveLine';

const { Panel } = Collapse;
const prompt = 'spfm.bmpApprove';

@formatterCollections({ code: [prompt] })
export default class SupplierSourcing extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { approveHeaderId },
      },
    } = this.props;
    this.state = {
      approveHeaderId,
      activeKey: ['form', 'table'],
      bpmApproveHeader: [],
      bpmApproveLineList: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { approveHeaderId } = this.state;
    this.handleSearch(approveHeaderId, {});
  }

  handleSearch = (approveHeaderId, page = {}) => {
    this.setState({
      loading: true,
    });
    queryLine({
      approveHeaderId,
      page,
    })
      .then((res) => {
        this.setState({
          bpmApproveHeader: res.bpmApproveHeader,
          bpmApproveLineList: res.bpmApproveLineList,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { } = this.props;
    const {
      loading = false,
      activeKey = [],
      bpmApproveHeader = [],
      bpmApproveLineList = {},
    } = this.state;

    const basicInfoProps = {
      bpmApproveHeader,
    };
    const approveLineProps = {
      dataSource: bpmApproveLineList,
    };
    return (
      <PageWrapper loading={loading}>
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
                title={intl.get(`hzero.common.panel.header.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicInfo {...basicInfoProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.approveLine`).d('明细信息')}
                arrowActive={activeKey.includes('table')}
              />
            }
            key="table"
          >
            <ApproveLine {...approveLineProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
