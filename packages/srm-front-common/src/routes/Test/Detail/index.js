import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '@/components/Page/PageWrapper';
import PanelHeader from '@/components/CusCollapse';
import CusButton from '@/components/CusButton';
import BasicForm from './BasicForm';
import DetailForm from './DetailForm';
import ErrorsForm from './ErrorsForm';

const { Panel } = Collapse;
const prompt = 'spfm.interfaceErrors';

@formatterCollections({ code: [prompt] })
@connect(({ loading, interfaceErrors }) => ({
  interfaceErrors,
  qeuryLoading: loading.effects['interfaceErrors/queryDetail'],
  detailList: interfaceErrors.detailList,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { interfaceLogId },
      },
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      interfaceLogId,
      isPub,
      activeKey: [
        'basic',
        'details',
        'errors',
      ],
    }
  }

  componentDidMount() {
    this.queryDetail();
  }

  queryDetail = () => {
    const { dispatch } = this.props;
    const { interfaceLogId } = this.state;
    dispatch({
      type: 'interfaceErrors/queryDetail',
      payload: {
        interfaceLogId,
      },
    }).then(res => {
      if (res) {
        const { interfaceRequestTime } = res;
        this.basicForm.current?.setFieldsValue({
          ...res,
          interfaceRequestTime: interfaceRequestTime ? moment(interfaceRequestTime) : undefined,
        });
        this.detailForm.current?.setFieldsValue({ ...(res?.interfaceLogDtlList || [])[0] });
        this.errorsForm.current?.setFieldsValue({ ...(res?.interfaceLogDtlList || [])[0] });
      };
    })
  }

  render() {
    const { qeuryLoading = false, detailList = {} } = this.props;
    const { activeKey } = this.state;
    const basicFormProps = {
      detailList,
      onRef: (ref) => {
        this.basicForm = ref.basicForm;
      },
    };
    const detailFormProps = {
      onRef: (ref) => {
        this.detailForm = ref.detailForm;
      },
    };
    const errorsFormProps = {
      onRef: (ref) => {
        this.errorsForm = ref.errorsForm;
      },
    };

    return (
      <PageWrapper loading={qeuryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={
            (collapseKeys) =>{
              this.setState({ activeKey: collapseKeys })}
            }
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.panel.header.basicInformation`).d("基础信息")}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key="basic"
          >
            <BasicForm { ...basicFormProps } />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.panel.header.details`).d("详情信息")}
                arrowActive={activeKey.includes('details')}
              />
            }
            key="details"
          >
            <div className="customize-table">
              <DetailForm { ...detailFormProps } />
            </div>
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.panel.header.errors`).d("异常信息")}
                arrowActive={activeKey.includes('errors')}
                buttons={<CusButton mini>测试</CusButton>}
              />
            }
            key="errors"
          >
            <div className="customize-table">
              <ErrorsForm { ...errorsFormProps } />
            </div>
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}
