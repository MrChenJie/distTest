import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Input, Form, Row, Col } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { getDateFormat } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';
import EmailEditor from '@/components/QuillEditor';
import CusSelect from '_cus_components/CusSelect'

const { Panel } = Collapse;
const dateFormat = getDateFormat();

@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS'])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  queryLoading: loading.effects['PartnerInformationModal/queryList'],
  // dataSource: PartnerInformationModal?.dataSource ,
  dataSource: [{
    actId: '业务创建',
    isDisable: true
  }, {
    actId: '业务创建',
    isDisable: false
  }],
  pagination: PartnerInformationModal?.pagination,
}))
class PartnerInformationList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      addEmail: false,
      emailContent: ''
    };
  }

  form1 = React.createRef();

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'PartnerInformationModal/queryList',
    //   payload: {
    //     page,
    //     ...this.getQueryParams(),
    //   },
    // });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
      quoteEndTimeStart: fieldsValue?.quoteEndTimeStart ? dayjs(fieldsValue?.quoteEndTimeStart).format(dateFormat) : null,
    };
  };

  handleAddLines = () => {
    const templateCode = 'BPM-SCM-JJJGFQ'; // 致远templateCode
    // const url = `${
    //   process.env.APPROVAL_PROCESS
    // }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
    //   `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/platForm/activey-application/Detail`
    // )}`;
    window.open(url, '_blank');
    // window.open('/pub/platForm/activey-application/Detail', '_blank')
  }

  handleDeleteLines = () => {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const isDraft = selectedRows.every((item) => {
      return item.status === 'Draft'
    });
    if (selectedRowKeys.length > 0) {
      if (isDraft) {
        CusModal.CusDeleteConfirm(() => {
          dispatch({
            type: 'PartnerInformationModal/deleteLine',
            payload: selectedRows
          }).then((res) => {
            if (res) {
              this.handleSearch();
            }
          })
        })
      } else {
        CusNotification.error({
          message: intl.get('demoTitle1').d('只能删除状态为"草稿"的单据'),
        });
      }
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  handleSend = () => {
    // this.setState({
    //   addEmail: true
    // })
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      addEmail,
      emailContent,
    } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      // columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
      handleSend: this.handleSend
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
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusButton
                      // mini
                      onClick={this.handleDeleteLines}
                    >
                      {intl.get('hzero.common').d('引入邀请')}
                    </CusButton>
                    <CusButton
                      // mini
                      onClick={this.handleAddLines}
                    >
                      {intl.get('hzero.common').d('数据导出')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>
        <CusModal
          title={intl.get('hzero.common').d('给合作伙伴发送生产账号')}
          visible={addEmail}
          width="70%"
          onCancel={() => {
            this.setState({
              addEmail: false,
            });
          }}
          onOk={() => {
            this.handleAddEmail();
          }}
          maskClosable={false}
          cancelText={intl.get('hzero.common').d('返回')}
          okText={intl.get('hzero.common').d('发送邀请')}
        >
          <Form ref={this.form1} className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spcm.`).d('邮件标题')}
                  wrapperCol={{ span: 24 }}
                  name="fileDesc1"
                  initialValue={intl.get(`spcm.`).d('生产系统账号发放')}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spcm.`).d('邮件模板选择')}
                  wrapperCol={{ span: 24 }}
                  name="fileDesc3"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.announcement`).d('邮件模板选择'),
                      })
                    },
                  ]}
                  initialValue={idpValueMap['HKTB.ACTIVITY_PROSTATUS']?.length? idpValueMap['HKTB.ACTIVITY_PROSTATUS'][0]?.value : ''}
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKTB.ACTIVITY_PROSTATUS']}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div style={{padding: '16px 0 0'}}>
            <EmailEditor
              defaultValue={emailContent || ''}
              editorKey='emailModal'
              // disabledValue={isEditExtendDetailFlag || isEmpty(authorityButtons) || (!(isEmpty(authorityButtons)) && (authorityButtons.BatchEditEmail === '3'))}
              onChange={(value) => {
                this.setState({ emailContent: value });
              }}
            />
          </div>
        </CusModal>
      </PageWrapper>
    );
  }
}

export default PartnerInformationList;
