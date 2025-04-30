import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row, Upload } from 'antd';
import { getCurrentOrganizationId, getCurrentUser, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import UploadTable from './UploadTable';
import styles from './index.less';
import CusUpload from '../components/CusUpload';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import { isObject, isUndefined, round } from 'lodash';
import uuid from 'uuid/v4';
import queryString from 'querystring';
import CusSelect from '_cus_components/CusSelect';

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
      prStatusState
    } = this.props;
    const {
      fileSource,
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
      prBakup, //需求部门备注给(采购部)
      supBakup, //需求部门备注给(供应商)
      prSuggestion, //建议采购计划
      flag, //流程穿越判断
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
    return (
      <div className={styles['out-ant-input']}>
        <Form className='customize-form' ref={this.searchForm}>
          <GenerateFormGrid isPackUp={true}>
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
            <Col {...gridSpan}>
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
            </Col>
            <Col {...gridSpan}>
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
            </Col>
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
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prrate`).d('申请汇率')}>
                {getFieldDecorator('prRate', {
                  initialValue: prRate,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
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
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarkpc`)
                  .d('需求部门备注给(采购部)')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: prBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarkpc`)
                          .d('需求部门备注给(采购部)'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3, maxRows: 3 }}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl
                  .get(`${promptCode}.view.title.applicantremarks`)
                  .d('需求部门备注给(供应商)')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: supBakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.applicantremarks`)
                          .d('需求部门备注(供应商)'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    rows={3}
                    autosize={{ minRows: 3 }}
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
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
            </Col>
            <Col span={24} style={{ padding: '16px 0 16px 16px' }}>
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
                      {/*<CusButton mini type='primary'>上传</CusButton>*/}
                      <CusUpload
                        delSelectedRows={delSelectedRows}
                        prStatus={prStatus}
                        getfileList={this.getFileList.bind(this)}
                      />
                      {/*<Upload*/}
                      {/*  name='file'*/}
                      {/*  showUploadList={false}*/}
                      {/*  // accept={acceptFileType}*/}
                      {/*  fileList={fileListRemaining}*/}
                      {/*  data={this.uploadData}*/}
                      {/*  customRequest={this.handleAction}*/}
                      {/*  headers={headers}*/}
                      {/*  onChange={this.onChange}*/}
                      {/*  // listType={listType}*/}
                      {/*  beforeUpload={this.beforeUpload}*/}
                      {/*  onRemove={this.onRemove}*/}
                      {/*>*/}
                      {/*  <CusButton type='primary' mini>上传</CusButton>*/}
                      {/*</Upload>*/}
                    </Col>
                  )}
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col>
                    <UploadTable onRef={(node) => (this.ChildRef = node)} {...uploadProps} />
                  </Col>
                </Row>
              </Form.Item>
            </Col>
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
