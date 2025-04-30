import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Col, Form, Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusTabs from '_cus_components/CusTabs';
import CusInput from '_cus_components/CusInput';
import CusNotification from '_cus_components/CusNotification';
import BasicForm from './BasicForm';
import DetailList from './DetailList';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.COOPERATE_APPLY_STATUS', 'DICT.PARTNER_FILE_TYPE', 'DICT.MODE_FILE_TYPE'])
@connect(({ loading, cooperationModeManagementModel }) => ({
  cooperationModeManagementModel,
  qeuryLoading: loading.effects['cooperationModeManagementModel/queryDetail'] ||
    loading.effects['cooperationModeManagementModel/queryAttachmentInfo'],
  detailList: cooperationModeManagementModel.detailList,
}))
export default class Detail extends React.Component {

  form0 = React.createRef();
  form1 = React.createRef();
  form2 = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      modeNoticeId: null,
      activeKey: ['basicForm', 'form', 'table'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      itemKey: '0',
      setLapse: null,
      setCopy: null,
      pageType: null,
      readOnly: false,
      reasonReadOnly: false,
      attachmentSource: [],
    };
  }

  componentDidMount() {
    this.pageInit();
  }

  pageInit() {
    const { location: { search }, dispatch } = this.props;
    const { formRecordId, pageType, state, permissionType, modeNoticeId } = queryString.parse(search.substring(1));
    this.setState({
      setLapse: pageType === 'lapse',
      setCopy: pageType === 'copy',
      formRecordId: modeNoticeId || formRecordId,
      pageType,
      readOnly: (formRecordId?.indexOf('null') < 0 && state !== 'READY' && !(state === 'PENDING' && permissionType === 'SEND')) || (pageType === 'lapse'), // 只有草稿和退回单可编辑,
      reasonReadOnly: formRecordId?.indexOf('null') < 0 && state !== 'READY' && !(state === 'PENDING' && permissionType === 'SEND'),
    });
    if (modeNoticeId || formRecordId !== 'null') {
      const params = {
        modeNoticeId: modeNoticeId || formRecordId,
        formRecordId: formRecordId,
        pageType,
      };
      this.queryDetail(params);
      //查询附件
      if (pageType !== 'copy' || (pageType === 'copy' && formRecordId !== 'null' && modeNoticeId)) {
        this.queryAttachmentInfo({ page: {}, ...params });
      }
    }
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 提交 保存 退回 会签 注销 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'GIVE', 'TERMINATION'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        } else {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        }
      }
    });
  }

  queryDetail = (params) => {
    const { modeNoticeId, pageType, queryType, formRecordId } = params;
    console.log(modeNoticeId, pageType, '~~', queryType, formRecordId);
    const { dispatch } = this.props;
    let id = modeNoticeId;
    if (formRecordId) {//保存时undefined
      id = formRecordId !== 'null' ? formRecordId : modeNoticeId;
    }
    console.log(id);
    dispatch({
      type: 'cooperationModeManagementModel/queryDetail',
      payload: {
        id: id,
      },
    }).then((res) => {
      if (res) {
        console.log('res', res);
        let newObj = {
          modeTypeChSimple: res.modeTypeChSimple,
          modeDetailChSimple: res.modeDetailChSimple,
          modeDetailChTrad: res.modeDetailChTrad,
          modeDetailEn: res.modeDetailEn,
          modeOrder: res.modeOrder,
          modeTypeEn: res.modeTypeEn,
          modeTypeChTrad: res.modeTypeChTrad,
        };
        if (pageType === 'copy') {
          if (formRecordId !== 'null' && modeNoticeId) {
            newObj = {
              ...newObj,
              applyNum: res.applyNum,
              modeNoticeId: res.modeNoticeId,
              _token: res._token,
            };
          }
          if (queryType === 'save') {
            newObj = {
              ...newObj,
              applyNum: res.applyNum,
              modeNoticeId: res.modeNoticeId,
              _token: res._token,
            };
          }
        } else if (pageType === 'lapse') {
          newObj = {
            ...newObj,
            applyNum: res.applyNum,
            applyStatus: res.applyStatus,
            createUserName: res.createUserName,
            creationDate: res.creationDate,
            objectVersionNumber: null, // 版本锁 每次调取保存后重置为NULL
          };
          console.log('newObj1', newObj);
          if (queryType === 'save') {
            newObj = {
              ...newObj,
              modeNoticeId: res.modeNoticeId,
              applyStatus: res.applyStatus,
              applyExpireNum: res.applyExpireNum,
              applyExpireReason: res.applyExpireReason,
              _token: res._token,
            };
            console.log('newObj2', newObj);
          }
        } else {
          newObj = {
            ...res,
            objectVersionNumber: null, // 版本锁 每次调取保存后重置为NULL
          };
        }
        this.setState({
          headerInfo: {
            ...newObj,
          },
        });
        this.form0.current.setFieldsValue({ modeDetailChSimple: newObj.modeDetailChSimple });//手动触发
        this.form1.current.setFieldsValue({ modeDetailChTrad: newObj.modeDetailChTrad });
        this.form2.current.setFieldsValue({ modeDetailEn: newObj.modeDetailEn });
      }
    });
  };

  queryAttachmentInfo = (params) => {
    const { dispatch } = this.props;
    const { page = {}, modeNoticeId, pageType, formRecordId } = params;
    console.log(pageType, 'pageType');
    let id = modeNoticeId;
    if (formRecordId) {//保存时undefined
      id = formRecordId !== 'null' ? formRecordId : modeNoticeId;
    }
    dispatch({
      type: 'cooperationModeManagementModel/queryAttachmentInfo',
      payload: {
        modeNoticeId: id,
      },
    }).then((res) => {
      if (res) {
        console.log('附件列表', res);
        //从后端查询过来的attachment,设置其_status为update,用于区分删除
        const { content = [] } = res;
        let newDataSource = [];
        if (pageType === 'copy') {
          newDataSource = content.map(({ modeNoticeId, ...rest }) => {
            return {
              ...rest,
              rowKey: uuidv4(),
            };
          });
        } else {
          newDataSource = content.map((item) => ({
            ...item,
            rowKey: uuidv4(),
            _status: 'update',
          }));
        }
        this.setState({
          attachmentSource: newDataSource,
        });
      }
    });
  };


  @Bind()
  handleDeleteLine = () => {
    const { dispatch, cooperationModeManagementModel } = this.props;
    const { selectedRowKeys, formRecordId, headId, attachmentSource } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = attachmentSource?.filter(
          (item) => selectedRowKeys.includes(item['rowKey']) && item._status !== 'create',
        );
        if (deleteData.length > 0) {
          // 后台删除
          const attachment = deleteData?.map((i) => {
            return {
              fileId: i.fileId,
            };
          });
          dispatch({
            type: 'cooperationModeManagementModel/deleteAttachmentLine',
            payload: { attachment },
          }).then((res) => {
            if (res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
              });
              this.queryAttachmentInfo({
                page: {},
                modeNoticeId: (formRecordId || headId),
              });
            }
          });
        } else {
          // 本地删除
          const newDataSource = attachmentSource?.filter((item) => !selectedRowKeys.includes(item.rowKey));
          this.setState({
            attachmentSource: newDataSource,
          });
        }
      });
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  };


  @Bind()
  handleAddLine = () => {
    const { dispatch } = this.props;
    const { attachmentSource } = this.state;
    //向数据源attachmentSource 添加一条数据
    this.setState({
      attachmentSource: [
        ...attachmentSource,
        {
          rowKey: uuidv4(),
          _status: 'create',
          fileType: undefined,
          fileDesc: undefined,
          fileUuid: uuidv4(),
        },
      ],
    });
  };

  @Bind()
  handleSave = (callback) => {
    const { dispatch, cooperationModeManagementModel } = this.props;
    const { headerInfo, itemKey, formRecordId, setLapse, setCopy, pageType, attachmentSource } = this.state;
    this[`basicForm${itemKey}`].validateFields((err, values) => {
      if (!err) {
        this[`form${itemKey}`].current.validateFields().then(() => {
          this.detailListForm.validateFields((err1, valuesList) => {
            if (!err1) {
              Promise.all([
                this.form0.current.validateFields(), //确保每个tab都填写
                this.form1.current.validateFields(),
                this.form2.current.validateFields(),
              ]).then((res) => {
                //当附件为空或者重复时，显示警告提醒
                if (attachmentSource.length === 0) {
                  return CusNotification.warning({
                    message: intl.get('spfmhk.dict.view.addattchmentinfo.check').d('请添加附件信息'),
                  });
                }
                const values2 = this[`form${itemKey}`].current.getFieldsValue();
                //数据汇总
                let data = [
                  {
                    ...headerInfo,
                    applyNum: values?.applyNum,
                    applyStatus: values?.applyStatus,
                    createUserName: values?.createUserName,
                    creationDate: values?.creationDate,
                    modeOrder: values.modeOrder,
                    modeTypeChSimple: values?.modeTypeChSimple ? values?.modeTypeChSimple : headerInfo.modeTypeChSimple,
                    modeTypeChTrad: values.modeTypeChTrad ? values.modeTypeChTrad : headerInfo?.modeTypeChTrad,
                    modeTypeEn: values.modeTypeEn ? values.modeTypeEn : headerInfo?.modeTypeEn,
                    modeDetailChSimple: values2.modeDetailChSimple ? values2.modeDetailChSimple : headerInfo?.modeDetailChSimple,
                    modeDetailChTrad: values2.modeDetailChTrad ? values2.modeDetailChTrad : headerInfo?.modeDetailChTrad,
                    modeDetailEn: values2.modeDetailEn ? values2.modeDetailEn : headerInfo?.modeDetailEn,
                  },
                ];
                if (setLapse) {
                  let expireData = {
                    modeNoticeId: formRecordId,
                    applyExpireReason: values.applyExpireReason,
                  };
                  dispatch({
                    type: 'cooperationModeManagementModel/expirePartnerMode',
                    payload: { expireData },
                  }).then((res) => {
                    //生成失效单号以及修改状态等
                    this.queryDetail({ modeNoticeId: formRecordId, pageType, queryType: 'save' });
                    if (typeof callback === 'function') {
                      callback({
                        ...res,
                        formRecordId: this.state.formRecordId,
                        affairTitle: intl.get('hzero.common.title.invalidate.dictcooperation.mode').d('合作模式失效流程') + '：' + res?.applyExpireNum,
                        applyType: 'expire',
                      });
                    }
                  });
                } else {
                  dispatch({
                    type: 'cooperationModeManagementModel/saveCooperationModeInfo',
                    payload: {
                      data,
                    },
                  }).then((res) => {
                    if (res) {
                      const modeNoticeId = res[0].modeNoticeId;
                      const applyType = pageType === 'add' ? 'work' : 'expire';
                      this.queryDetail({ modeNoticeId, pageType, queryType: 'save' });
                      this.setState({
                        headId: modeNoticeId,
                      });
                      //附件信息
                      let attachment = attachmentSource?.map((i) => {
                        return {
                          fileId: i?.fileId,
                          modeNoticeId: modeNoticeId,
                          fileType: i.fileType,
                          fileDesc: i.fileDesc,
                          fileUuid: i.fileUuid,
                        };
                      });
                      attachment[0].fileType = 'background_pic';
                      //保存附件信息
                      dispatch({
                        type: 'cooperationModeManagementModel/saveAttachmentInfo',
                        payload: { attachment },
                      }).then(res => {
                        if (res) {
                          this.setState({
                            attachmentSource: res?.map(item => {
                              return {
                                ...item,
                                rowKey: uuidv4(),
                              };
                            }),
                          });
                        }
                      });
                      if (typeof callback === 'function') {
                        console.log('待办标题: ', intl.get('hzero.common.title.dictcooperation.mode').d('合作模式新增流程') + '：' + res[0].applyNum);
                        callback({
                          ...res,
                          formRecordId: res[0].modeNoticeId,
                          affairTitle: intl.get('hzero.common.title.dictcooperation.mode').d('合作模式新增流程') + '：' + res[0].applyNum,
                          applyType: applyType,
                        });
                      }
                    }
                  });
                }
              }).catch((err) => {
                CusNotification.success({
                  message: intl
                    .get('spfmhk.dict.view.requiredfields.check')
                    .d('存在必输字段未填写'),
                });
              });
            }
          });
        });
      }
    });
  };

  render() {

    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      cooperationModeManagementModel,
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      itemKey,
      setLapse,
      readOnly,
      attachmentSource,
      reasonReadOnly,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    // const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.applyStatus) || (headerInfo?.createrCode && headerInfo?.createrCode !== loginName);
    const readyOnly = readOnly;

    //用同一个basicFormProps时，获取不到basicFomr的数据，无法进行校验
    const basicFormProps0 = {
      ...this.props,
      readyOnly,
      reasonReadOnly,
      headerInfo,
      detailList,
      idpValueMap,
      itemKey,
      setLapse,
      onRef: (ref) => {
        this.basicForm0 = ref.props.form;
      },
    };
    const basicFormProps1 = {
      ...this.props,
      readyOnly,
      reasonReadOnly,
      headerInfo,
      detailList,
      idpValueMap,
      itemKey,
      setLapse,
      onRef: (ref) => {
        this.basicForm1 = ref.props.form;
      },
    };
    const basicFormProps2 = {
      ...this.props,
      readyOnly,
      reasonReadOnly,
      headerInfo,
      detailList,
      idpValueMap,
      itemKey,
      setLapse,
      onRef: (ref) => {
        this.basicForm2 = ref.props.form;
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        console.log(keys, rows);
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
      getCheckboxProps: (record) => {
        console.log(record);
        return {
          disabled: attachmentSource[0]?.rowKey === record.rowKey,
        };
      },
    };
    const detailListProps = {
      ...this.props,
      readyOnly,
      idpValueMap,
      rowSelection,
      attachmentSource,
      onRef: (ref) => {
        this.detailListForm = ref.props.form;
      },
      onChange: (page) => this.queryAttachmentInfo({
        page: page,
        modeNoticeId: (formRecordId || headId),
      }),
    };
    const tabItems = [
      {
        key: '0',
        label: intl.get(`${prompt}.field.text.simple`).d('简体'),
        forceRender: true,
        children: (
          <>
            <Form ref={this.form0}>
              <Collapse
                defaultActiveKey={activeKey}
                bordered={false}
                onChange={(collapseKeys) => {
                  this.setState({ activeKey: collapseKeys });
                }}
                style={{ padding: ' 0 16px' }}
              >
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.basicsetting`).d('基本设置')}
                      arrowActive={activeKey.includes('basicForm')}
                    />
                  }
                  bordered={false}
                  key="basicForm"
                >
                  <BasicForm {...basicFormProps0} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.modesetting`).d('合作模式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.dict.view.field.codedescription`).d('描述')}
                        name="modeDetailChSimple"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.dict.view.field.codedescription`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={700}
                          showCharacter
                          disabled={readyOnly}
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
              </Collapse>
            </Form>
          </>
        ),
      },
      {
        key: '1',
        label: intl.get(`${prompt}.field.text.complex`).d('繁體'),
        forceRender: true,
        children: (
          <>
            <Form ref={this.form1}>
              <Collapse
                defaultActiveKey={activeKey}
                bordered={false}
                onChange={(collapseKeys) => {
                  this.setState({ activeKey: collapseKeys });
                }}
                style={{ padding: '0 16px' }}
              >
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.basicsetting`).d('基本设置')}
                      arrowActive={activeKey.includes('basicForm')}
                    />
                  }
                  bordered={false}
                  key="basicForm"
                >
                  <BasicForm {...basicFormProps1} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.modesetting`).d('合作模式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.dict.view.field.codedescription`).d('描述')}
                        name="modeDetailChTrad"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.dict.view.field.codedescription`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={700}
                          showCharacter
                          disabled={readyOnly}
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
              </Collapse>
            </Form>
          </>
        ),
      },
      {
        key: '2',
        label: intl.get(`${prompt}.field.text.english`).d('繁體'),
        forceRender: true,
        children: (
          <>
            <Form ref={this.form2}>
              <Collapse
                // className="customize-collapse"
                defaultActiveKey={activeKey}
                bordered={false}
                onChange={(collapseKeys) => {
                  this.setState({ activeKey: collapseKeys });
                }}
                style={{ padding: ' 0 16px' }}
              >
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.basicsetting`).d('基本设置')}
                      arrowActive={activeKey.includes('basicForm')}
                    />
                  }
                  bordered={false}
                  key="basicForm"
                >
                  <BasicForm {...basicFormProps2} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`spfmhk.dict.view.title.modesetting`).d('合作模式设置')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  bordered={false}
                  key="form"
                >
                  <div className="customize-form">
                    <Col span={24}>
                      <Form.Item
                        label={intl.get(`spfmhk.dict.view.field.codedescription`).d('描述')}
                        name="modeDetailEn"
                        rules={[
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`spfmhk.dict.view.field.codedescription`).d('描述'),
                            }),
                          },
                        ]}
                      >
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={700}
                          showCharacter
                          disabled={readyOnly}
                        />
                      </Form.Item>
                    </Col>
                  </div>
                </Panel>
              </Collapse>
            </Form>
          </>
        ),
      },
    ];
    return (
      <PageWrapper loading={qeuryLoading}>
        <CusTabs
          defaultActiveKey={itemKey}
          activeKey={itemKey}
          items={tabItems}
          moreIcon={false}
          onTabClick={(collapseKeys) => {
            this[`basicForm${itemKey}`].validateFields((err, values) => {
              if (!err) {
                console.log(values, 'values');
                this[`form${itemKey}`].current.validateFields().then(() => {
                  const detail = this[`form${itemKey}`].current.getFieldsValue();
                  //更新headerInfo数据
                  this.setState({ headerInfo: { ...headerInfo, ...values, ...detail } });
                  this.setState({ itemKey: collapseKeys });
                }).catch(() => {
                  this.setState({ itemKey: itemKey });
                });
              }
            });
          }}
        />
        <Collapse
          className="customize-collapse"
          // bordered={false}
          style={{ marginTop: '16px' }}
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            bordered={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.field.attachment`).d('附件上传')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  readyOnly ? (
                    <></>
                  ) : (
                    <>
                      <CusButton mini onClick={this.handleDeleteLine}>
                        {intl.get('hzero.common.view.button.delete').d('删除')}
                      </CusButton>
                      <CusButton mini type="primary" onClick={this.handleAddLine}>
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </>
                  )
                }
              />
            }
            key="table"
          >
            <Form>
              <DetailList {...detailListProps} />
            </Form>
          </Panel>
        </Collapse>
        {/*<CusButton onClick={this.handleSave}>test</CusButton>*/}
      </PageWrapper>
    );
  }
}
