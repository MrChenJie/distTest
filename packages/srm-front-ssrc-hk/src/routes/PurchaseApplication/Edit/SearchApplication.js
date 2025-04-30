import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row, Upload } from 'antd';
import { getCurrentOrganizationId, getCurrentUser, getDateFormat, getAccessToken, tableScrollWidth, isTenantRoleLevel } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import UploadTable from './UploadTable';
import styles from './index.less';
import CusUpload from '_cus_components/CusUpload';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { isObject, isUndefined, filter } from 'lodash';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import CusSelect from '_cus_components/CusSelect';
import { largeScreenWidth } from '_cus_utils/constants';
import UploadList from '@/components/uploadList'; 

const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
export default class SearchApplication extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      userId: '',
      applyUserId: '',
      applyUserDepId: '',
      applyingDepartmentId: '',
      applicantUserId: '',
      prStatusLoc: undefined,
      isSave: false,
      rateFather: '',
      totalAmountHKDChild: '',
      prState: '',
      stateAttachmentUUID: uuid(),
    };
  }

  @Form.create()

  componentDidMount() {
    const {
      location: { search },
      purchaseApplicationModel
    } = this.props;
    const { state } = queryString.parse(search.substring(1));
    this.setState({
      prState: state,
    });
    this.setState({
      isSave: this.props.isClickSave,
      rateFather: this.props.rate,
    });
    window.addEventListener('resize', this.computeChunkSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeChunkSize);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log(this.props.prStatus)
    if (this.props.prStatus != prevState.prStatusLoc) {
      this.setState({
        prStatusLoc: this.props.prStatus,
      });
    }
    if (this.props.isClickSave != prevProps.isClickSave) {
      this.setState({
        isSave: this.props.isClickSave,
      });
    }
    if (this.props.rate != prevProps.rate) {
      this.setState({
        rateFather: this.props.rate,
      });
    }
    if (this.props.totalAmountHKD != prevProps.totalAmountHKD) {
      // const { setFieldsValue } = this.props.form;
      // console.log("this.props.totalAmountHKD", this.props.totalAmountHKD)
      // setFieldsValue({ estimatedBudgetAmountHkd: this.props.totalAmountHKD });
      this.setState({
        totalAmountHKDChild: this.props.totalAmountHKD,
      });
    }
    // console.log('this.state.prStatusLoc', this.state.prStatusLoc == undefined)
  }

  @Bind()
  computeChunkSize() {
    this.setState({ });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.searchForm.current?.resetFields();
    onSearch();
  }


  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  onUploadSuccess = (record) => {
    const { form } = this.props;
    form.setFieldsValue({ files: record });
  };

  @Bind()
  getFileList(fileList) {
    this.props.getFatherFileList(fileList);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    this.ChildRef?.handleDelete();
  }

  @Bind()
  uploadData(file) {
    const {
      attachmentUUID,
      bucketName,
      uploadData,
      bucketDirectory,
      docType,
      storageCode, // 存储配置编码
    } = this.props;
    let data = uploadData ? uploadData(file) : {};
    if (!(data instanceof FormData)) {
      const currentData = data;
      data = new FormData();
      if (isObject(data)) {
        Object.keys(currentData).forEach((paramKey) => {
          data.append(paramKey, currentData[paramKey]);
        });
      }
    }
    if (!isUndefined(attachmentUUID)) {
      data.append('attachmentUUID', attachmentUUID);
    }
    if (!isUndefined(bucketName)) {
      data.append('bucketName', bucketName);
    }
    if (!isUndefined(docType)) {
      data.append('docType', docType);
    }
    if (!isUndefined(storageCode)) {
      data.append('storageCode', storageCode);
    }
    if (!isUndefined(bucketDirectory)) {
      data.append('directory', bucketDirectory);
    }
    return data;
  }

  render() {
    const { tenantId, rateFather, prState, stateAttachmentUUID } = this.state;
    const {
      location: { search },
      dispatch,
      purchaseApplicationModel,
      idpValueMap = {},
      form,
      attachmentSource,
      language,
      applyUserPhone,
      prApplyAttachmentList,
      contentObj,
      allDetailsInfo,
      handleSearchRate,
      prStatusState,
      fileSource,
      fileDataSource = [],
      applyUserCode,
    } = this.props;
    const { activityCode } = queryString.parse(search.substr(1)) || {};
    const {
      projectName,
      demander,
      demanderId,
      demanderDepartment,
      demanderDepartmentEn,
      demanderDepartmentId,
      employeeNum, // 需求人工号
      applier,
      applyingDepartmentName,
      applyingDepartmentEnName,
      prStatus,
      prNumber,
      currencyCode,
      prRate,
      prType,
      demanderPhone,
      estimatedBudgetAmountHkd,
      projectType,
      projectNumber,
      projectManagerName,
      delSelectedRows,
      prReason,
      prReq,
      prBakup,
      supBakup,
      prSuggestion,
      techSpecs,
      deliveryReqs,
      performanceHistory,
      supplierCriteria,
      techScoCriteria,
      flag,
      attachUuid = stateAttachmentUUID,
      procurementType,
      erpPrType,
      rowsData = [],
      budgetType,
      purchasingCategory,
      purchaseApplicationLineSource,
    } = purchaseApplicationModel;
    console.log('this.state', this.state.demoUUid);
    const { getFieldDecorator } = form;
    const uploadProps = {
      dispatch,
      purchaseApplicationModel,
      prApplyAttachmentList,
      attachmentSource,
      fileSource,
      prStatus,
      prState,
      prStatusState
    };

    console.log('projectNumber', projectNumber);
    const projectNumberArray = projectNumber?.split(',') || [];
    const formLayout = this.computeFormLayout();
    // 根据采购申请类型判断小于等于100万的隐藏
    const isShowContent = !['simpleInquiry1', 'generalProcurement1', 'frameworkProcurement1', 'frameworkProcurement2', 'frameworkProcurement3'].includes(prType);
    // 根据采购申请类型判断一般采购小于50万/框架采购小于等于5万/框架采购5-50万的显示
    const isShowProType = ['simpleInquiry1', 'frameworkProcurement1', 'frameworkProcurement2'].includes(prType);

    // 计算展开收起的行数
    let lineNum = 2;
    if (isShowContent) {
      lineNum = window.innerWidth >= largeScreenWidth ? 11 : 13
    } else {
      lineNum = window.innerWidth >= largeScreenWidth ? 7 : 9
    }

    const { permissionType } = queryString.parse(search.substring(1));
    console.log('permissionType', permissionType)

    const columns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
        dataIndex: 'fileName',
        width: 160,
      },
      {
        title: intl.get(`hzero.common.uploadFile.view.uploadTimeNew`).d('上传时间'),
        dataIndex: 'creationDate',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        dataIndex: 'operation',
        width: 120,
        render: (_, record) => {
          const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?access_token=${getAccessToken()}&bucketName=spfm-comp&url=${encodeURIComponent(record.fileUrl)}`;
          return (
            <>
              <CusButton type="plain">
                <a href={url} target="_blank">{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
              <CusButton
                type="plain"
                style={{ marginLeft: '16px' }}
                onClick={() => {
                  const { OOS_HOST } = process.env;
                  const onlineApi = `${OOS_HOST}?file=`;
                  const api = encodeURIComponent(
                    `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?access_token=${getAccessToken()}&bucketName=spfm-comp&url=${encodeURIComponent(record.fileUrl)}`
                  );
                  window.open(`${onlineApi}${api}`)
                  }
                }
              >
                {intl.get(`hzero.common.button.preview`).d('预览')}
              </CusButton>
            </>
          );
        },
      },
    ];

    return (
      <div className={styles['out-ant-input']}>
        <Form className='customize-form' ref={this.searchForm}>
          <GenerateFormGrid isPackUp={true} defaultPackUp={permissionType !== 'SEND'} showLine={lineNum}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              >
                {getFieldDecorator('prName', {
                  initialValue: contentObj?.prName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
                      }),
                    },
                  ],
                })(
                  <Input disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true} />,
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}>
                {getFieldDecorator('prNumber', {
                  initialValue: prNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
              >
                {getFieldDecorator('applicantUserName', {
                  initialValue: applier,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prstatus`).d('申请状态')}>
                {getFieldDecorator('prStatus', {
                  initialValue: idpValueMap['HKPC.PRRECORDSSTATUS']?.find(
                    (item) => item?.value === prStatus,
                  )?.meaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
              >
                {getFieldDecorator('applyingDepartmentName', {
                  initialValue: getCurrentUser().language == 'zh_CN' ? applyingDepartmentName : applyingDepartmentEnName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applyingdepartment`)
                          .d('申请人部门'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    textValue={getCurrentUser().language == 'zh_CN' ? applyingDepartmentName : applyingDepartmentEnName}
                    code='CMHK_USER_DEPT'
                    queryParams={{ tenantId, userId: getCurrentUser().id, lang: language }}
                    lovOptions={{ displayField: 'unitName', valueField: 'unitName' }}
                    onChange={(_, lovData) => {
                      dispatch({
                        type: 'purchaseApplicationModel/commentUpdateState',
                        payload: {
                          applyingDepartmentId: lovData.unitId,
                          applyingDepartmentName: lovData.unitName,
                          unitCode: lovData.unitCode,
                        },
                      });
                    }}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prdate`).d('申请日期')}>
                {getFieldDecorator('applyingDate', {
                  initialValue: dayjs(contentObj?.applyingDate).format('YYYY-MM-DD'),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}
              >
                {getFieldDecorator('applyUserName', {
                  initialValue: demander ? demander : contentObj?.applyUserName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.requester`).d('需求人'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      prStatusState != 'PENDING_REFER' && prStatusState != ''
                        ? true
                        : ((projectName != '' && projectName != undefined && projectName != null) ||
                           ['1', '2'].includes(projectType)) || projectNumberArray.length > 1
                          ? false
                          : true
                    }
                    textValue={demander ? demander : contentObj?.applyUserName}
                    code={projectNumberArray.length > 1 ? 'CMHK.EMPLOYEE.APPLY' : 'CMHK.EMPLOYEEUNIT'}
                    queryParams={{
                      tenantId,
                      lang: projectNumberArray.length > 1 ? null : language,
                      isProject: projectNumberArray.length > 1 ? null : projectType,
                      projectCode: projectNumberArray.length > 1 ? null : projectNumber,
                    }}
                    lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                    onChange={(_, lovData) => {
                      form.resetFields()
                      console.log(lovData, 'lovData');
                      this.setState(
                        {
                          userId: lovData.userId,
                          applyUserId: lovData.userId,
                        },
                        () => {
                          dispatch({
                            type: 'purchaseApplicationModel/commentUpdateState',
                            payload: {
                              demander: lovData.realName,
                              demanderId: lovData.userId,
                              demanderDepartment: lovData.unitName,
                              demanderDepartmentId: lovData.unitId,
                              demanderPhone: lovData.phone,
                              employeeNum: lovData.employeeNum,
                            },
                          });
                        },
                      );
                    }}
                    tip={
                      projectType == '0'
                        ? intl
                          .get(`${promptCode}.view.title.selectprojectname`)
                          .d('请先选择项目名称')
                        : null
                    }
                  />,
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.requestertel`).d('需求人电话')}>
                {getFieldDecorator('applyUserPhone', {
                  initialValue: demanderPhone ? demanderPhone : applyUserPhone,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
              >
                {getFieldDecorator('applyUserDepName', {
                  initialValue: getCurrentUser().language == 'zh_CN' ? demanderDepartment : demanderDepartmentEn,
                  // ? demanderDepartment
                  // : contentObj.applyUserDepName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.requesterdepartment`)
                          .d('需求人部门'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    textValue={
                      getCurrentUser().language == 'zh_CN' ? demanderDepartment : demanderDepartmentEn
                    }
                    code='CMHK.EMPLOYEEUNITDEPT'
                    queryParams={{
                      tenantId,
                      lang: language,
                      employeeNum: employeeNum || applyUserCode,
                    }}
                    lovOptions={{ displayField: 'unitName', valueField: 'unitName' }}
                    onChange={(_, lovData) => {
                      this.setState(
                        {
                          applyUserDepId: lovData.unitId,
                        },
                        () => {
                          dispatch({
                            type: 'purchaseApplicationModel/commentUpdateState',
                            payload: {
                              demanderDepartmentId: lovData.unitId,
                            },
                          });
                        },
                      );
                    }}
                  />,
                )}
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountO`)
                  .d('预估总金额(原币)')}
                name='estimatedBudgetAmount'
              >
                {getFieldDecorator('estimatedBudgetAmount', {
                  initialValue: estimatedBudgetAmountHkd
                    ? numberRender(round(estimatedBudgetAmountHkd / prRate, 2), 2)
                    : '',
                })(<Input disabled />)}
              </Form.Item>
            </Col> */}
            {/* <Col {...gridSpan}>
              <Form.Item required label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}>
                {getFieldDecorator('currency', {
                  initialValue: currencyCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    textValue={currencyCode}
                    code='CMHKHPFM.CURRENCY'
                    lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                    // textField="partnerNumber"
                    // form={this.form.current}
                    onChange={(_, lovData) => {
                      // this.form?.current?.setFieldsValue({ partnerName: lovData.partnername });
                      dispatch({
                        type: 'purchaseApplicationModel/commentUpdateState',
                        payload: {
                          currencyCode: lovData.currencyCode,
                        },
                      });
                      setTimeout(() => {
                        handleSearchRate();
                      }, 600);
                    }}
                  />,
                )}
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountH`)
                  .d('预估总金额(HKD)')}
              >
                {getFieldDecorator('estimatedBudgetAmountHkd', {
                  initialValue: estimatedBudgetAmountHkd
                    ? numberRender(estimatedBudgetAmountHkd, 4)
                    : '',
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            {projectType == '2' && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.estimatedbudgettype`).d('预估预算类型')}>
                {getFieldDecorator('budgetType', {
                  initialValue: projectType == '2' ? 'INVENTORY' : budgetType,
                })(
                  <CusSelect
                    options={idpValueMap['HKPC.RELATEDTOPROJECT']}
                    lazyLoad={false}
                    allowClear
                    disabled
                  />
                )}
              </Form.Item>
            </Col>}
            {projectType == '2' && <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别')}
              >
                {getFieldDecorator('purchasingCategory', {
                  initialValue: purchasingCategory,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
                    }),
                  }],
                })(
                  <CusSelect
                    options={
                      filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
                        ['INV', 'INV_ICTS', 'INVS_COUP'].includes(item.value)
                      )
                    }
                    lazyLoad={false}
                    allowClear
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    onChange={(val) => {
                      dispatch({
                        type: 'purchaseApplicationModel/commentUpdateState',
                        payload: {
                          purchasingCategory: val,
                          purchaseApplicationLineSource: (purchaseApplicationLineSource || []).map(item => ({
                            ...item,
                            matName: null,
                            purchasingCategory: val
                          }))
                        }
                      })
                    }}
                  />
                )}
              </Form.Item>
            </Col>}
            <Col {...gridSpan}>
              {flag == '1' &&
                (<Form.Item
                  label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}
                  {...formLayout}
                  name="prType"
                >
                  <CusSelect
                    placeholder={intl.get(`${promptCode}.view.title.inputPRtype`).d('采购申请类型')}
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.PRTYPE']}
                  />
                </Form.Item>)}
              {flag != '1' && (<Form.Item label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}>
                {getFieldDecorator('prType', {
                  initialValue: idpValueMap['HKPC.PRTYPE']?.find((item) => item?.value === prType)
                    ?.meaning,
                })(<Input disabled />)}
              </Form.Item>)}
            </Col>
            {<Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
              >
                {getFieldDecorator('procurementType', {
                  initialValue: procurementType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式'),
                    }),
                  }],
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={isShowContent ? idpValueMap['HKPC.PPPROCUREMENTMETHOD'] : isShowProType ? idpValueMap['BID.PROCUREMENT_METHOD'] : idpValueMap['HKPC.PPPROCUREMENTMETHOD']}
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                  />
                )}
              </Form.Item>
            </Col>}
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.venorcategory`).d('采购业务类别')}
              >
                {getFieldDecorator('erpPrType', {
                  initialValue: erpPrType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.venorcategory`).d('采购业务类别'),
                    }),
                  }],
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.VENDOR_CATEGORY']}
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' || (prStatusState === 'In_Approval' && activityCode === 'SCM02') ? false : true}
                  />
                )}
              </Form.Item>
            </Col>
            {/* {!(prStatusState == 'PENDING_REFER' || prStatusState == '') && <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
              >
                <CusTable
                  columns={columns}
                  dataSource={fileDataSource}
                  scroll={{x: tableScrollWidth(columns)}}
                />
              </Form.Item>
            </Col>} */}
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prreason`).d('采购原因')}
              >
                {getFieldDecorator('prReason', {
                  initialValue: prReason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prreason`).d('采购原因'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prrequirment`).d('采购需求')}
              >
                {getFieldDecorator('prReq', {
                  initialValue: prReq,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prrequirment`).d('采购需求'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />,
                )}
              </Form.Item>
            </Col>
            {/* 技术规范-根据采购申请类型判断小于等于100万的显示 */}
            {isShowContent && <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.technicalSpecifications`)
                  .d('技术规范')}
              >
                {getFieldDecorator('techSpecs', {
                  initialValue: techSpecs,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.technicalSpecifications`)
                          .d('技术规范'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />,
                )}
              </Form.Item>
            </Col>}
            {/* 交付要求 */}
            {isShowContent && <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.deliveryRequirements`)
                  .d('交付要求')}
              >
                {getFieldDecorator('deliveryReqs', {
                  initialValue: deliveryReqs,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.deliveryRequirements`)
                          .d('交付要求'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />,
                )}
              </Form.Item>
            </Col>}
            {/* 历史执行情况 */}
            {isShowContent && <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.historicalExecutionStatus`)
                  .d('历史执行情况')}
              >
                {getFieldDecorator('performanceHistory', {
                  initialValue: performanceHistory,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.historicalExecutionStatus`)
                          .d('历史执行情况'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>}
            {/* 潜在供应商报名资格条件建议 */}
            {isShowContent && <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.supplierRecommendations`)
                  .d('潜在供应商报名资格条件建议')}
              >
                {getFieldDecorator('supplierCriteria', {
                  initialValue: supplierCriteria,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.supplierRecommendations`)
                          .d('潜在供应商报名资格条件建议'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>}
            {/* 技术评分细则建议 */}
            {isShowContent && <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.technicalScoringSuggestions`)
                  .d('技术评分细则建议')}
              >
                {getFieldDecorator('techScoCriteria', {
                  initialValue: techScoCriteria,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.technicalScoringSuggestions`)
                          .d('技术评分细则建议'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>}
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarkpc`)
                  .d('需求部门给采购的备注')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: prBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarkpc`)
                          .d('需求部门给采购的备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                    showCharacter
                    placeholder={intl
                    .get(`${promptCode}.view.title.remarktoprocurement`)
                    .d('备注（给采购）的说明')}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarks`)
                  .d('需求部门给供应商的备注')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: supBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarks`)
                          .d('需求部门给供应商的备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                    placeholder={intl
                    .get(`${promptCode}.view.title.remarktosupplier`)
                    .d('备注（给供应商）的说明')}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
              >
                {getFieldDecorator('attachUuid', {
                  initialValue: attachUuid,
                })(
                  <UploadList
                    viewOnly={(prStatusState != 'PENDING_REFER' && prStatusState != '') && (prStatusState === 'In_Approval' && ['SCM02', 'SCM03'].includes(activityCode) ? false : true)}
                    multiple={true}
                    bucketName='spfm-comp'
                    tenantId={getCurrentOrganizationId()}
                    showUploadList={{
                      removePopConfirmTitle: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      showRemoveIcon: !(prStatusState != 'PENDING_REFER' && prStatusState != ''),
                    }}
                    filePreview
                    onUploadSuccess={(file, fileList, attachmentUUID) => {
                      console.log('上传成功', attachmentUUID);
                    }}
                    attachmentUUID={attachUuid}
                    setLoading={(uploading = false) => {
                      this.setState({
                        uploading,
                      });
                    }}
                    isTitle={intl.get(`${promptCode}.view.title.attachmentremark`).d('附件说明')}
                  />
                  // <CusUpload
                  //   filePreview
                  //   bucketName="spfm-comp"
                  //   tenantId={getCurrentOrganizationId()}
                  //   viewOnly={prStatusState != 'PENDING_REFER' && prStatusState != ''}
                  //   attachmentUUID={attachUuid}
                  //   isEncrypt
                  // />
                )}
              </Form.Item>
            </Col>
            {/* <Col span={24}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prplan`).d('建议采购计划')}>
                {getFieldDecorator('prSuggestion', {
                  initialValue: prSuggestion,
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                    maxLength={500}
                    showCharacter
                  />,
                )}
              </Form.Item>
            </Col> */}
            {/* <Col span={24} style={{ padding: '16px 0 16px 16px' }}>
              <Form.Item>
                <Row style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#646a73' }}>
                      {intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
                    </span>
                  </Col>
                  {prStatusState != 'PENDING_REFER' && prStatusState != '' ? (
                    <Col span={12}></Col>
                  ) : (
                    <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <CusUpload
                        delSelectedRows={delSelectedRows}
                        prStatus={prStatus}
                        getfileList={this.getFileList.bind(this)}
                      />
                    </Col>
                  )}
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <UploadTable onRef={(node) => (this.ChildRef = node)} {...uploadProps} />
                  </Col>
                </Row>
              </Form.Item>
            </Col> */}
            <div style={{ display: 'none' }}>
              <Col>
                <Form.Item label={intl.get(`${promptCode}.view.title.requester`).d('需求人id')}>
                  {getFieldDecorator('applyUserId', {
                    initialValue: demanderId ? demanderId : contentObj?.applyUserId,
                  })}
                </Form.Item>
              </Col>
            </div>
            <div style={{ display: 'none' }}>
              <Col>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门Id')}
                >
                  {getFieldDecorator('applyUserDepId', {
                    initialValue: demanderDepartmentId
                      ? demanderDepartmentId
                      : contentObj.applyUserDepId,
                  })}
                </Form.Item>
              </Col>
            </div>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
