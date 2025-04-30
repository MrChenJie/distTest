import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Input, Form, Row, Col } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { getDateFormat, createPagination, getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import EmailEditor from '@/components/QuillEditor';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect'
import FilterForm from './Form';
import ListTable from './ListTable';
import StaticTextEditor from './StaticTextEditor';

const { Panel } = Collapse;
const dateFormat = getDateFormat();

@formatterCollections({ code: ['spfmhk.mylink'] })
@fastCodeLoader([
  'LINK.PARTNER_REVSTATUS',
  'HKSM.PRODCUT_SERVICE',
  'LINK_EMAIL_PRO'
])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  queryLoading: loading.effects['PartnerInformationModal/getCooperationList'],
  exportLoading: loading.effects['PartnerInformationModal/getExportDetail'],
  recallLoading: loading.effects['PartnerInformationModal/recall'],
}))
class PartnerInformationList extends Component {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.sendForm = React.createRef();
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      visibleEmailContent: false,
      emailContent: '',
      visibleEmailContentView: false,
      viewEmailContent: '',
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getCooperationList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            dataSource: newDataSource,
            pagination: pagination,
          },
        });
      }
    })
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue() || {};
    return {
      ...fieldsValue,
      beginRevDateFrom: fieldsValue?.beginRevDate ? fieldsValue?.beginRevDate[0].format('YYYY-MM-DD') : '',
      beginRevDateTo: fieldsValue?.beginRevDate ? fieldsValue?.beginRevDate[1].format('YYYY-MM-DD') : '',
      beginRevDate: null,
    };
  };

  // 数据导出
  handleExportDetail = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getExportDetail',
      payload: {
        form: {
          ...this.getQueryParams()
        }
      }
    }).then((res) => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.ms-excel',
        });
        const fileName = intl.get(`view.export.exchangeQuery`).d('合作伙伴详情');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xlsx`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    })
  }

  // 发起审批
  handleApproval = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const url = `/pub/mylink/select-judges/Detail`;
    console.log('selectedRows', selectedRows);
    if(selectedRows.length > 0) {
      dispatch({
        type: 'PartnerInformationModal/handleApproval',
        payload: {
          partnerIds: selectedRows.map(item => item.partnerId)
        },
      }).then((res) => {
        if(res) {
          localStorage.setItem(
            'approvalDetailInfo',
            JSON.stringify({
              approvalDetailInfo: res
            })
          );
          this.setState({
            selectedRows: [],
            selectedRowKeys: []
          })
          window.open(url, '_blank');
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

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

  // 编辑邮件按钮
  @Bind()
  handleEditEmail = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getTemplateContent',
      payload: {
        templateCode: 'HIAM.MYLINK.PARTNER.ACCOUNT.ASSIGN',
        tenantId: getCurrentOrganizationId(),
      }
    }).then((res) => {
      if(res) {
        this.setState({
          emailContent: res?.templateContent,
          visibleEmailContent: true,
          partnerId: record.partnerId,
        }, () => {
          this.sendForm?.current?.setFieldsValue({
            selectTemplate: 'HIAM.MYLINK.PARTNER.ACCOUNT.ASSIGN'
          })
        })
      }
    })
  }

  // 发送邀请
  @Bind()
  handleSendEmail = () => {
    const { dispatch } = this.props;
    const { partnerId } = this.state;
    console.log('staticTextEditor', this.staticTextEditor);

    this.sendForm?.current?.validateFields().then((err, values) => {
      const { editor } = (this.staticTextEditor.staticTextEditor || {}).current;
      if (!editor || !editor.getData()) {
        return CusNotification.warning({
          message: intl
            .get(`spfmhk.mylink.view.message.alert.contentRequired`)
            .d('请输入邮件内容'),
        });
      } else {
        dispatch({
          type: 'PartnerInformationModal/sendEmail',
          payload: {
            partnerId,
            messageContent: editor.getData(),
          }
        }).then((res) => {
          if(res) {
            this.setState({
              visibleEmailContent: false,
            }, () => {
              this.handleSearch();
            })
          }
        })
      }
    })
    
    
  }

  // 查看邮件按钮
  @Bind()
  handleViewEmail = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getEmailContent',
      payload: {
        messageId: record.messageId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          visibleEmailContentView: true,
          viewEmailContent: res?.content
        })
      }
    })
  }

  // 撤回
  @Bind()
  handleRecall = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/recall',
      payload: {
        partnerId: record.partnerId,
      }
    }).then((res) => {
      if(res) {
        this.handleSearch();
      }
    })
  }

  render() {
    const { queryLoading = false, idpValueMap = {}, exportLoading = false, recallLoading = false } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      visibleEmailContent,
      emailContent,
      visibleEmailContentView,
      viewEmailContent,
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
      getCheckboxProps: (record) => ({
        disabled: record.revStatus !== 'Draft'
      })
    };
    const listTableProps = {
      ...this.props,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
      handleEditEmail: this.handleEditEmail,
      handleViewEmail: this.handleViewEmail,
      handleRecall: this.handleRecall,
    };
    return (
      <PageWrapper loading={queryLoading || recallLoading}>
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
                        loading={exportLoading}
                        onClick={this.handleExportDetail}
                      >
                      {intl.get('spfmhk.mylink.button.data.export').d('数据导出')}
                    </CusButton>
                    <CusButton
                      mini
                      onClick={this.handleApproval}
                      type="primary"
                    >
                      {intl.get('spfmhk.mylink.button.initiate.approval').d('发起审批')}
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
          title={intl.get(`spfmhk.mylink.button.edit.email`).d('编辑邮件')}
          visible={visibleEmailContent}
          width={800}
          onCancel={() => {
            this.setState({
              visibleEmailContent: false,
            });
          }}
          onOk={() => {
            this.handleSendEmail();
          }}
          maskClosable={false}
          cancelText={intl.get('hzero.common.button.back').d('返回')}
          okText={intl.get('spfmhk.mylink.button.send.invitation').d('发送邀请')}
        >
          <Form ref={this.sendForm} className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.subject.mail`).d('邮件标题')}
                  wrapperCol={{ span: 24 }}
                  name="emailTitle"
                  initialValue={intl.get(`spfmhk.mylink.field.email.sendtitle`).d('Mylink生产系统账号发送')}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.mail.selection`).d('邮件模板选择')}
                  wrapperCol={{ span: 24 }}
                  name="selectTemplate"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.mail.selection`).d('邮件模板选择'),
                      })
                    },
                  ]}
                  initialValue='HIAM.MYLINK.REGISTER.REFUSE'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK_EMAIL_PRO']}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div style={{padding: '16px 0 0'}}>
            <StaticTextEditor
              key={uuidv4()}
              readOnly={false}
              content={emailContent || {}}
              config={{ height: 300 }}
              onRef={(staticTextEditor) => {
                this.staticTextEditor = staticTextEditor;
              }}
            />
          </div>
        </CusModal>
        <CusModal
          title={intl.get(`spfmhk.mylink.button.view.email`).d('查看邮件')}
          visible={visibleEmailContentView}
          width={800}
          onCancel={() => {
            this.setState({
              visibleEmailContentView: false
            })
          }}
          footer={null}
        >
          <StaticTextEditor
            key={uuidv4()}
            readOnly={true}
            content={viewEmailContent || {}}
            onRef={staticTextEditor => {
              this.staticTextEditor = staticTextEditor;
            }}
          />
        </CusModal>
      </PageWrapper>
    );
  }
}

export default PartnerInformationList;
