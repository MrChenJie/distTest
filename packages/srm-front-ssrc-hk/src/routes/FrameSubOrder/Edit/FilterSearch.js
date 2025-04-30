import React from 'react';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Col, Input } from 'antd';
import CusLov from '_cus_components/CusLov';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { filterNullValueObject, createPagination } from 'utils/utils';
import searchIcon from '@/assets/searchIcon.svg';
import CusModal from '_cus_components/CusModal';
import ProjectList from './projectList';
import styles from './index.less';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';

@connect(({ frameSubOrderModel, loading }) => ({
  frameSubOrderModel,
}))
export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      projectNameModel: false,
      rowsData: [],
      projectDataList: [],
      projectDataListPagination: {}
    };
  }
  @Form.create()
  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  searchButton = () => {
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
        style={{ cursor: 'pointer', color: '#666' }}
        onClick={() => this.onSearchBtnClick()}
      />
    );
  }

  @Bind
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this?.modalForm?.props.form)
      ? {}
      : filterNullValueObject(this?.modalForm?.props.form.getFieldsValue());
    dispatch({
      type: 'frameSubOrderModel/getProjectName',
      payload: {
        page,
        projectCode: filterValues.projectCode,
        projectName: filterValues.projectNameSearch,
        projectManagerName: filterValues.projectManagerName,
        projectBudType: filterValues.projectBudType,
      }
    }).then((res) => {
      if(res.code == '200') {
        const { content = [] } = res.data;
        const pagination = createPagination(res.data);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
        }));
        this.setState({
          projectDataList: newDataSource,
          projectDataListPagination: pagination,
        })
      }
    })
  }

  onSearchBtnClick = () => {
    this.handleSearch();
    this.setState({
      projectNameModel: true,
    })
  }

  onChangeRows = (item) => {
    this.setState({
      rowsData: item
    })
  }

  @Bind
  handleProjectName() {
    const { getProjectNumber, dispatch, form, infomation } = this.props;
    const { rowsData } = this.state;
    const item = rowsData.pop();
    if (isEmpty(item)) {
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          demander: null,
          demanderDepartment: null,
          demanderPhone: null,
        },
      });
      this.setState({
        projectNameModel: false,
      })
    } else {
      form.resetFields('associatedAgreement');
      infomation.associatedAgreement = null;
      dispatch({
        type: 'frameSubOrderModel/commentUpdateState',
        payload: {
          infomation: infomation,
        },
      });
      dispatch({
        type: 'frameSubOrderModel/getUserDepat',
        payload: {
          employeeNum: item.projectManagerCode
        }
      }).then((res) => {
        setTimeout(() => {
          getProjectNumber(item, res);
          this.setState({
            projectNameModel: false,
          })
          // handleSearchApplier();
        }, 600);
      })

    }
  }

  render() {
    const {
      form,
      infomation,
      handleSearchApplier = (e) => e,
      getProjectNumber,
      frameSubOrderModel,
      related,
      dispatch,
    } = this.props;
    const { projectName, purchaseApplicationLineSource } = frameSubOrderModel;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
    const {
      projectNameModel,
      projectDataList,
      projectDataListPagination,
    } = this.state;

    const suffix = (
      <>
        <div
          className="cus-lov-clear"
        />
        {this.searchButton()}
      </>
    );

    const projectProps = {
      ...this.props,
      dataSource: projectDataList,
      pagination: projectDataListPagination,
      onChangeRows: this.onChangeRows,
      onSearch: this.handleSearch,
      onRef: ref => {
        this.modalForm = ref;
      }
    }

    return (
      <>
        {related == '0' ? (
          <Form className="customize-form" ref={this.filterForm}>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
                {...formLayout}
              >
                {getFieldDecorator('projectName', {
                  initialValue: projectName ? projectName : infomation?.projectName,
                })(
                  <Input
                    readOnly
                    suffix={suffix}
                    className={styles['lov-input']}
                    value={
                      (projectName ? projectName : infomation?.projectName)
                        ? projectName
                          ? projectName
                          : infomation?.projectName
                        : null
                    }
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                      this.onSearchBtnClick();
                    }}
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                  />
                  // <CusLov
                  //   disabled={
                  //     infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '' ? false : true
                  //   }
                  //   textValue={infomation.projectName}
                  //   queryParams={{ lang: getCurrentUser().language }}
                  //   code="CMHK.API.CPEX/OPEX"
                  //   lovOptions={{ displayField: 'name', valueField: 'name' }}
                  //   onChange={(_, item) => {
                  //     if (isEmpty(item)) {
                  //       dispatch({
                  //         type: 'frameSubOrderModel/commentUpdateState',
                  //         payload: {
                  //           demander: null,
                  //           demanderDepartment: null,
                  //           demanderPhone: null,
                  //         },
                  //       });
                  //     } else {
                  //       setTimeout(() => {
                  //         getProjectNumber(item);
                  //         // handleSearchApplier();
                  //       }, 600);
                  //     }
                  //   }}
                  // />
                )}
              </Form.Item>
            </Col>
          </Form>
        ) : (
          <Form className="customize-form" ref={this.filterForm}>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')}
                {...formLayout}
              >
                {getFieldDecorator('projectNumber', {
                  initialValue: infomation?.projectNumber,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.BudgetProjectnumber`)
                          .d('预算项目编号'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    disabled={
                      infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == ''
                        ? false
                        : true
                    }
                    textValue={infomation?.projectNumber}
                    code="CPEX.OPEX"
                    queryParams={{
                      applyType: '1',
                    }}
                    isInitVal
                    lovOptions={{ displayField: 'budCode', valueField: 'budCode' }}
                    onChange={(_, item) => {
                      setTimeout(() => {
                        dispatch({
                          type: 'frameSubOrderModel/commentUpdateState',
                          payload: {
                            projectNumber: item.budCode,
                            projectType: '1',

                            budgetItemNumberUpdate: item.budCode, // 预算项目编码
                            businessActivitiesUpdate: item.busActivityCode, // 业务活动编码
                            businessActivitiesNameUpdate: item.busActivityName, // 业务活动名称
                            costCenterUpdate: item.costCenterCode, // 成本中心编码
                            costCenterNameUpdate: item.costCenternName, // 成本中心名称
                            purchaseApplicationLineSource: purchaseApplicationLineSource?.map((element) => {
                              element.$form.resetFields()
                              return {
                                ...element,
                                budgetItemNumber: item.budCode,
                                businessActivities: item.busActivityCode,
                                businessActivitiesName: item.busActivityName,
                                costCenter: item.costCenterCode,
                                costCenterName: item.costCenternName,
                              }
                            })
                          },
                        });
                      }, 600);
                      // this.props.getProjectNumber(item.code, item.projectManagerCode, item.projectManagerName);
                      // handleSearchApplier()
                      // dispatch({
                      //   type: 'purchaseApplicationModel/commentUpdateState',
                      //   payload: {
                      //     budProjectCode: item.budProjectCode,
                      //   }
                      // })
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Form>
        )}

        {/* 项目名称弹框 */}
        <CusModal
          title={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
          visible={projectNameModel}
          width={1500}
          onOk={this.handleProjectName}
          onCancel={() => {
            this.setState({
              projectNameModel: false,
            });
          }}
        >
          <ProjectList {...projectProps} />
        </CusModal>
      </>
    );
  }
}
