import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row, Upload } from 'antd';
import { getCurrentOrganizationId, getCurrentUser, getDateFormat, getAccessToken, tableScrollWidth } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import UploadTable from './UploadTable';
import styles from './index.less';
import CusUpload from '_cus_components/CusUpload';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { isObject, isUndefined, filter } from 'lodash';
import uuid from 'uuid/v4';
import queryString from 'querystring';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
export default class SearchApplication extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
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
    };
  }

  @Form.create()

  componentDidMount() {
    const {
      location: { search },
    } = this.props;
    const { state } = queryString.parse(search.substring(1));
    this.setState({
      prState: state,
    });
    this.setState({
      isSave: this.props.isClickSave,
      rateFather: this.props.rate,
    });
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

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.searchForm.current?.resetFields();
    onSearch();
  }

  /**
   * 展开高级查询
   * @function handleShowMore
   */
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

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

  // 将子组件文件信息传递给父组件
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
    const { tenantId, rateFather, prState } = this.state;
    const {
      related,
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
    } = this.props;
    const {
      // fileSource,
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
      prReason, //采购原因
      prReq, //采购需求
      techSpecs, // 技术规范
      deliveryReqs, // 交付要求
      performanceHistory, // 历史执行情况
      supplierCriteria, // 潜在供应商报名资格条件建议
      techScoCriteria, // 技术评分细则建议
      prBakup, //需求部门备注给(采购部)
      supBakup, //需求部门备注给(供应商)
      prSuggestion, //建议采购计划
      attachUuid,
      purchasingCategory,
      erpPrType,
      budgetType,
      procurementType,
    } = purchaseApplicationModel;
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
    const formLayout = this.computeFormLayout();
    // 根据采购申请类型判断小于等于100万的隐藏
    const isShowContent = !['simpleInquiry1', 'generalProcurement1', 'frameworkProcurement1', 'frameworkProcurement2', 'frameworkProcurement3'].includes(prType);

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
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              >
                {getFieldDecorator('prName', {
                  initialValue: contentObj?.prName,
                })(
                  <Input disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true} />,
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}>
                {getFieldDecorator('prNumber', {
                  initialValue: prNumber,
                })(
                    <>
                      <Input disabled />
                      <a
                        onClick={() => {
                          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${contentObj?.caseId}`);
                        }}
                        className={styles['outer-link']}
                      >
                        {prNumber}
                      </a>
                    </>
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
              >
                {getFieldDecorator('applicantUserName', {
                  initialValue: applier,
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
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
              >
                {getFieldDecorator('applyingDepartmentName', {
                  initialValue: getCurrentUser().language == 'zh_CN' ? applyingDepartmentName : applyingDepartmentEnName,
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
                label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}
              >
                {getFieldDecorator('applyUserName', {
                  initialValue: demander ? demander : contentObj?.applyUserName,
                })(
                  <CusLov
                    disabled={
                      prStatusState != 'PENDING_REFER' && prStatusState != ''
                        ? true
                        : (projectName != '' && projectName != undefined && projectName != null) ||
                        projectType == '1'
                          ? false
                          : true
                    }
                    textValue={demander ? demander : contentObj?.applyUserName}
                    code='CMHK.EMPLOYEEUNIT'
                    queryParams={{
                      tenantId,
                      lang: language,
                      isProject: projectType,
                      projectCode: projectNumber,
                    }}
                    lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                    onChange={(_, lovData) => {
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
                label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
              >
                {getFieldDecorator('applyUserDepName', {
                  initialValue: getCurrentUser().language == 'zh_CN' ? demanderDepartment : demanderDepartmentEn,
                    // ? demanderDepartment
                    // : contentObj.applyUserDepName,
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
                      employeeNum,
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
              <Form.Item label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}>
                {getFieldDecorator('currency', {
                  initialValue: currencyCode,
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
                    ? numberRender(estimatedBudgetAmountHkd, 2)
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
                label={intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别')}
              >
                {getFieldDecorator('purchasingCategory', {
                  initialValue: purchasingCategory,
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
              <Form.Item label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}>
                {getFieldDecorator('prType', {
                  initialValue: idpValueMap['HKPC.PRTYPE']?.find((item) => item?.value === prType)
                    ?.meaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
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
                    options={isShowContent ? idpValueMap['HKPC.PPPROCUREMENTMETHOD'] : idpValueMap['BID.PROCUREMENT_METHOD']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.venorcategory`).d('采购业务类别')}
              >
                {getFieldDecorator('erpPrType', {
                  initialValue: erpPrType,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.VENDOR_CATEGORY']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prreason`).d('采购原因')}
              >
                {getFieldDecorator('prReason', {
                  initialValue: prReason,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl.get(`${promptCode}.view.title.prrequirment`).d('采购需求')}
              >
                {getFieldDecorator('prReq', {
                  initialValue: prReq,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.technicalSpecifications`)
                  .d('技术规范')}
              >
                {getFieldDecorator('techSpecs', {
                  initialValue: techSpecs,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.deliveryRequirements`)
                  .d('交付要求')}
              >
                {getFieldDecorator('deliveryReqs', {
                  initialValue: deliveryReqs,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.historicalExecutionStatus`)
                  .d('历史执行情况')}
              >
                {getFieldDecorator('performanceHistory', {
                  initialValue: performanceHistory,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.supplierRecommendations`)
                  .d('潜在供应商报名资格条件建议')}
              >
                {getFieldDecorator('supplierCriteria', {
                  initialValue: supplierCriteria,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.technicalScoringSuggestions`)
                  .d('技术评分细则建议')}
              >
                {getFieldDecorator('techScoCriteria', {
                  initialValue: techScoCriteria,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.applicantremarkpc`)
                  .d('需求部门给采购的备注')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: prBakup,
                })(
                  <CusInput.TextArea
                    disabled
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
                label={intl
                  .get(`${promptCode}.view.title.applicantremarks`)
                  .d('需求部门给供应商的备注')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: supBakup,
                })(
                  <CusInput.TextArea
                    disabled
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
                {/* {getFieldDecorator('attachUuid', {
                  initialValue: attachUuid,
                })(
                  <CusUpload
                    filePreview
                    bucketName="spfm-comp"
                    tenantId={getCurrentOrganizationId()}
                    viewOnly
                    attachmentUUID={attachUuid}
                    isEncrypt
                  />
                )} */}
                <CusTable
                  columns={columns}
                  dataSource={fileDataSource}
                  scroll={{x: tableScrollWidth(columns)}}
                />
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
                      <CusButton onClick={this.handleDetele} mini>
                        {intl.get(`${promptCode}.view.button.bulkdelete`).d('批量删除')}
                      </CusButton>
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
