import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Form, Col, Row, Input } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { getDateFormat, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import { SRM_TRADE, SRM_MYLINK } from '@/utils/config';
import { EMAIL } from 'utils/regExp';

const { Panel } = Collapse;
const dateFormat = getDateFormat();
const User = getCurrentUser()

@formatterCollections({ code: ['spfmhk.trade', 'spfmhk.mylink', 'hzero.common'] })
@fastCodeLoader(['HKTB.ACTIVITY_PROSTATUS', 'HKSM.PRODCUT_SERVICE', 'HKSM.INTRODUCTION_MODE', 'HKSM.BENEFIT_PARTNER.CATEGORY'])
@connect(({ loading, RegistrationInformationModal }) => ({
  RegistrationInformationModal,
  queryLoading: loading.effects['RegistrationInformationModal/queryList'],
  dataSource: RegistrationInformationModal?.dataSource,
  pagination: RegistrationInformationModal?.pagination,
}))
class RegistrationInformation extends Component {



  constructor(props) {
    super(props);
    console.log('user', User)
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      addCaseFlag: false,
      accountCheckFlag: false,
      accountFlag: false,
      addList: {},
      id: null,
      headerInfo: {},
      reportFlag: false,
      inviterId: null,
    };
  }

  form1 = React.createRef();
  form = React.createRef();

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'RegistrationInformationModal/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  accountCheck = () => {
    this.setState({
      accountCheckFlag: true
    })
  }

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
      creationDateFrom: fieldsValue?.creationDate?.length ? dayjs(fieldsValue?.creationDate[0]).format(dateFormat) : null,
      creationDateTo: fieldsValue?.creationDate?.length ? dayjs(fieldsValue?.creationDate[1]).format(dateFormat) : null,
      creationDate: null
      // creationDateFrom:fieldsValue?.creationDate?.length ?fieldsValue?.creationDate[0]: null,
      // creationDateTo:fieldsValue?.creationDate?.length ? fieldsValue?.creationDate[1]: null,
    };
  };

  handleAddLines = () => {
    // const templateCode = 'BPM-SCM-JJJGFQ'; // 致远templateCode
    // const url = `${
    //   process.env.APPROVAL_PROCESS
    // }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
    //   `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/platForm/activey-application/Detail`
    // )}`;
    // window.open(url, '_blank');
    // window.open('/pub/platForm/activey-application/Detail', '_blank')
    const { dispatch } = this.props;
    const {
      addList,
      id
    } = this.state
    dispatch({
      type: 'RegistrationInformationModal/saveInvite',
      payload: {
        ...this.form1.current?.getFieldsValue(),
        partnerCategory: this.form1.current?.getFieldsValue().partnerCategory.join(","),
        refSignId: addList.signId,
        businessMan: id || User?.id
      }
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.handleSearch();
        this.setState({
          id:null,
          addCaseFlag: false,
          addList: {}
        })
      }
    })

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
            type: 'RegistrationInformationModal/deleteLine',
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

  handleOpenAdd = (record) => {
    const { dispatch } = this.props;
    this.form1.current?.setFieldsValue({ businessManName: User?.realName })
    dispatch({
      type: 'RegistrationInformationModal/queryDetail',
      payload: {
        id: record.signId,
      },
    }).then((res) => {
      console.log(res)
      this.setState({
        headerInfo: res,
        addCaseFlag: true,
        addList: record
      })
    });
  }

  handleAddAccountCheckFlag = () => {
    this.form.current.validateFields().then((values) => {
      this.setState({
        accountFlag: true
      })
    }).catch((err) => {
      console.log('err')
    })

  }



  handleReduce = (record) => {
    const { dispatch } = this.props;
    CusModal.confirm({
      content: intl.get(`spfmhk.mylink.button.email.refuse.confirm`).d('确认发送拒绝邮件'),
      onOk: () => {
        dispatch({
          type: 'RegistrationInformationModal/signsRefuse',
          payload: {
            id: record.signId
          }
        }).then((res) => {
          if (res) {
            CusNotification.success();
            this.handleSearch();
          }
        })
      },
    });
  }

  handleReport = () => {
    this.setState({
      reportFlag: true
    })
  }

  handleInviter = () => {
    const { dispatch } = this.props;
    const {
      inviterId
    } = this.state
    this.form.current?.validateFields().then((values)=> {
      console.log(values)
      dispatch({
      type: 'RegistrationInformationModal/inviteSign',
      payload: {
        ...values,
        businessMan: inviterId || User?.id,

      }
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.setState({
          reportFlag: false,
        })
      }
    })
    });
  }

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      addCaseFlag,
      accountCheckFlag,
      accountFlag,
      addList,
      headerInfo,
      reportFlag
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
      accountCheck: this.accountCheck,
      handleAdd: this.handleOpenAdd,
      handleReduce: this.handleReduce,
    };
    console.log(this.form1.current?.getFieldsValue())
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
                  <CusButton  onClick={this.handleReport}>
                    {intl.get('spfmhk.mylink.button.inviteRegister').d('邀请报名')}
                  </CusButton>
                    <CusExcelExport
                      requestUrl={`${SRM_MYLINK}/v1/${getCurrentOrganizationId()}/link-part-signs/LinkPartSign-export`}
                      queryParams={this.getQueryParams}
                      downloadType="Blob"
                      fileName={intl.get('spfmhk.mylink.field.export.partner.fileName').d('报名信息列表导出')}
                      otherButtonProps={{
                        icon: null,
                        mini: true,
                      }}
                      buttonText={intl.get('spfmhk.mylink.button.listExport').d('列表导出')}
                      title={intl.get('spfmhk.mylink.button.listExport').d('列表导出')}
                    />
                    {/* <CusButton
                      // mini
                      onClick={this.handleExport}
                    >
                      {intl.get('hzero.common.view.button.list.export').d('列表导出')}
                    </CusButton> */}
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
          title={intl.get('spfmhk.mylink.field.invitation.register').d('邀请合作伙伴注册')}
          visible={addCaseFlag}
          destroyOnClose
          onCancel={() => {
            this.setState({
              addCaseFlag: false,
            });
          }}
          onOk={() => {
            this.handleAddLines();
          }}
        >
          <Form ref={this.form1} className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.invitation.party`).d('邀请方')}
                  wrapperCol={{ span: 24 }}
                  name="inviter"
                  initialValue={'China Mobile Hong Kong Company Limited'}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.invitation.mode`).d('引入模式')}
                  wrapperCol={{ span: 24 }}
                  name="introductionMode"
                  initialValue={addList?.supplierNumber ? 'Invite_supplier' : 'Invite_new'}
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.INTRODUCTION_MODE']}
                    disabled
                    onChange={(val) => {
                      this.setState({
                        ...this.state
                      })
                      console.log(this.form1?.current?.getFieldsValue(), this.form1, val, 'file')
                    }
                    }
                  />
                </Form.Item>
              </Col>
              {addList?.supplierNumber && (<Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码')}
                  wrapperCol={{ span: 24 }}
                  name="supplierNum"
                  initialValue={addList?.supplierNumber}
                // rules={[
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码'),
                //     })
                //   },
                // ]}
                >
                  <Input disabled
                  />
                </Form.Item>
              </Col>)}
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.businessPar.category`).d('商盟伙伴类别')}
                  wrapperCol={{ span: 24 }}
                  name="partnerCategory"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.businessPar.category`).d('商盟伙伴类别'),
                      })
                    },
                  ]}
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    mode="multiple"
                    options={idpValueMap['HKSM.BENEFIT_PARTNER.CATEGORY']}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.partner.name`).d('合作伙伴名称')}
                  wrapperCol={{ span: 24 }}
                  name="partnerName"
                  disabled
                  rules={[
                    {
                      required: addList?.portalAccount == "N",
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.partner.name`).d('合作伙伴名称'),
                      })
                    },
                  ]}
                  initialValue={addList?.companyName}
                >
                  <Input disabled={addList?.portalAccount != "N"} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.partner.mail`).d('合作伙伴邮箱')}
                  wrapperCol={{ span: 24 }}
                  name="partnerEmail"
                  rules={[
                    {
                      required: addList?.portalAccount == "N",
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.partner.mail`).d('合作伙伴邮箱'),
                      })
                    },
                  ]}
                  initialValue={ headerInfo?.signInviteEmail  }
                >
                  <Input disabled/>
                </Form.Item>
              </Col>
              {/* <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.invitation.describ`).d('邀请说明')}
                  wrapperCol={{ span: 24 }}
                  name="inviteRemark"
                >
                  <Input />
                </Form.Item>
              </Col> */}
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.user`).d('商盟人员')}
                  wrapperCol={{ span: 24 }}
                  name="businessManName"
                  initialValue={User?.realName}
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.user`).d('商盟人员'),
                      })
                    },
                  ]}
                >
                  <CusLov
                    code="LINK.BUSINESS_MAN"
                    textValue={User?.realName}
                    lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    form={this.form1.current}
                    onChange={(_, item) => {
                      console.log(item, 'item')
                      this.form1.current?.setFieldsValue({ businessManName: item.realName })
                      this.setState({
                        id: item.id
                      })
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>
        <CusModal
          title={intl.get('spfmhk.mylink.field.invitation').d('邀请商户官网报名')}
          visible={reportFlag}
          destroyOnClose
          onCancel={() => {
            this.setState({
              reportFlag: false,
            });
          }}
          onOk={() => {
            this.handleInviter();
          }}
          cancelText={intl.get('spfmhk.mylink.field.invitation').d('返回')}
          okText={intl.get('spfmhk.mylink.field.invitation').d('发送邀请')}
        >
          <Form ref={this.form} className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.invitation.party`).d('邀请方')}
                  wrapperCol={{ span: 24 }}
                  name="inviter"
                  initialValue={'China Mobile Hong Kong Company Limited'}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.merchant.name`).d('商户名称')}
                  wrapperCol={{ span: 24 }}
                  name="businessName"
                  disabled
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.merchant.name`).d('商户名称'),
                      })
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.partner`).d('商户邮箱')}
                  wrapperCol={{ span: 24 }}
                  name="businessEmail"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.partner`).d('商户邮箱'),
                      })
                    },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                  ]}
                  // initialValue={ headerInfo?.signInviteEmail  }
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.user`).d('商盟人员')}
                  wrapperCol={{ span: 24 }}
                  name="businessMan"
                  initialValue={User?.realName}
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.user`).d('商盟人员'),
                      })
                    },
                  ]}
                >
                  <CusLov
                    code="LINK.BUSINESS_MAN"
                    textValue={User?.realName}
                    lovOptions={{ displayField: 'realName', valueField: 'id' }}
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    form={this.form1.current}
                    onChange={(_, item) => {
                      console.log(item, 'item')
                      this.form.current?.setFieldsValue({ businessMan: item.id })
                      this.setState({
                        inviterId: item.id
                      })
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>
      </PageWrapper>
    );
  }
}

export default RegistrationInformation;
