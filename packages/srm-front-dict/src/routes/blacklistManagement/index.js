import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse  , Col} from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDateFormat } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const dateFormat = getDateFormat();
const SRM_DICT = '/dict';
const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfmhk.dict'] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS','DICT.JUDGE_APPLY_STATUS','DICT.BLACK_APPLY_STATUS','DICT.EMPLOYEE_INFO'])
@connect(({ loading, blacklistManagementModel }) => ({
  blacklistManagementModel,
  queryLoading: loading.effects['blacklistManagementModel/queryList'],
  dataSource: blacklistManagementModel?.dataSource,
  pagination: blacklistManagementModel?.pagination,
}))
@Form.create()
class blacklistManagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      visible:false,
      partnerInfo:{},
      readyOnly:false,
      employeeNum:null,
    };
  }

  componentDidMount() {
    this.handleSearch();
    document.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  @Bind
  handleKeyPress(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleSearch();
    }
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'blacklistManagementModel/queryList',
      payload: {
        page,
        ...this.getQueryParams("search"),
      },
    }).then((res)=>{
      console.log("列表",res)
    }).catch((err)=>{
      console.log(err)
    });
  };

  getQueryParams = (type) => {
    const {selectedRows} = this.state
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    const blackIds=selectedRows?.map((i) => {
      return i.blackId;
    })
    if(type=="export"){
      return {
        ...fieldsValue,
        blackIds:blackIds,
      }
    }
    console.log("fieldsValue",fieldsValue)
    return {
      ...fieldsValue
    };
  };



  handleDelete = () => {
    const { dispatch, blacklistManagementModel,dataSource} = this.props;
    const { selectedRows, formRecordId, headId } = this.state;
    if(selectedRows.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const data = selectedRows?.map((i) => {
          return i?.blackId
        });
        const deleteData = dataSource.filter(
          (item) => data.includes(item.blackId)
        );
        if (deleteData.length > 0) {
          // 后台删除
          const blacklist = deleteData?.map((i) => {
            return {
              blackId:i?.blackId,
            }
          });
          console.log("blacklist",blacklist)
          dispatch({
            type: 'blacklistManagementModel/deleteLines',
            payload: {blacklist}
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get(`hzero.common.notification.success.delete`).d('删除成功')
              })
              this.handleSearch(_);
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
              });
            }
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
    }

  }
  handleAdd = () => {
    this.setState({
      visible: false,
    });
    const {partnerInfo} = this.state
    console.log("partnerInfo",partnerInfo)
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_DICTHMD&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/blacklist-management/detail?partnerId=${partnerInfo?.partnerId}`)}`);
    // window.open(`/pub/dict/blacklist-management/detail?partnerId=${partnerInfo?.partnerId}`, '_blank')
  }

  render() {
    const { queryLoading = false, idpValueMap = {} ,dispatch,dataSource,confirmLoading,form} = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      selectedRows,
      visible,
      readyOnly,
    } = this.state;
    const {getFieldDecorator} = form;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
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
      idpValueMap,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
    };
    const dataExportProps = {
      requestUrl: `${SRM_DICT}/v1/${tenantId}/black-lists/exportBlackList`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`spfmhk.dict.view.field.portalanswerexport`).d('列表导出'),
      fileName: intl.get(`spfmhk.dict.view.file.title.blacklistexport`).d('黑名单列表导出'),
      queryParams: this.getQueryParams("export")
    }
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
                      mini
                      onClick={this.handleDelete}
                      disabled={!((selectedRows?.filter(item => ['ON_APPROVAL', 'APPROVED'].includes(item.applyStatus)).length === 0) && selectedRowKeys?.length !== 0)}
                    >
                      {intl.get(`hzero.common.view.button.delete`).d('删除')}
                    </CusButton>
                    <CusExcelExport mini {...dataExportProps} />
                    <CusButton
                      mini
                      type="primary"
                      onClick={() => {
                        this.setState({
                          visible: true,
                        });
                      }}
                    >
                      {intl.get(`hzero.common.view.button.add`).d('新建')}
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
          title={intl.get(`spfmhk.dict.view.field.select.partner`).d('选择合作伙伴')}
          visible={visible}
          destroyOnClose
          width={600}
          onCancel={() => {
            this.setState({
              visible: false,
            });
          }}
          onOk={this.handleAdd}
          confirmLoading={confirmLoading}
        >
          <Form className="customize-form">
            <Col span={24}>
              <Form.Item label={intl.get(`spfmhk.dict.view.infoupdate.choosepartner`).d('合作伙伴')}>
                {getFieldDecorator('partner', {
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`spfmhk.dict.view.infoupdate.choosepartner`).d('合作伙伴'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    code="DICT.PARTNER_INFO_PASS"
                    queryParams={{ tenantId: tenantId }}
                    disabled={readyOnly}
                    onChange={(_, item) => {
                      console.log(item)
                      this.setState({
                        partnerInfo: item,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Form>
        </CusModal>
      </PageWrapper>
    );
  }
}

export default blacklistManagement;
