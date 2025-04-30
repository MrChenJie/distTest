import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { isEmpty, isUndefined, join, map } from 'lodash';
import { getDateFormat, getCurrentUser, filterNullValueObject, createPagination } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import searchIcon from '@/assets/searchIcon.svg';
import styles from './index.less';
import ProjectList from './projectList';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
}))
export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      isShowMore: false,
      projectNameVisible: false,
      projectNumber: '',
      projectNameModel: false,
      projectDataList: [],
      projectDataListPagination: {}
    };
  }

  // filterForm = React.createRef()
  @Form.create()
  componentDidMount() {}

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.filterForm.current?.resetFields();
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

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.filterForm?.current?.getFieldsValue();
    return {
      ...fieldsValue,
    };
  }

  // 查询项目信息-项目名称-接口
  @Bind()
  searchProjectName(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/queryProjectNameList',
      payload: {
        pageNumber: 1,
        pageSize: 5,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
      }
    });
  }

  // 点击放大镜查看项目名称
  @Bind()
  queryProjectName() {
    this.setState({
      projectNameVisible: true,
    });
    this.searchProjectName();
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
      console.log('filterValues', filterValues)
    dispatch({
      type: 'purchaseApplicationModel/getProjectName',
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
      rowItem: item,
    })
  }

  @Bind
  handleProjectName() {
    const { getProjectNumber, dispatch } = this.props;
    const { rowItem } = this.state;
    if (isEmpty(rowItem)) {
      CusNotification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据')
      })
      // dispatch({
      //   type: 'purchaseApplicationModel/commentUpdateState',
      //   payload: {
      //     demander: null,
      //     demanderDepartment: null,
      //     demanderPhone: null,
      //     projectName: null,
      //   },
      // });
      // this.setState({
      //   projectNameModel: false,
      // })
    } else {
      if(rowItem.length > 1) {
        // 多capex场景
        this.setState({
          projectNameModel: false,
        })
        dispatch({
          type: 'purchaseApplicationModel/commentUpdateState',
          payload: {
            rowsData: rowItem,
            projectName: join(map(rowItem, 'projectName'), ','),
            projectNumber: join(map(rowItem, 'projectCode'), ','),
            demander: null,
            demanderId: null,
            demanderDepartment: null,
            demanderDepartmentId: null,
            demanderPhone: null,
            employeeNum: null,
          }
        })
      } else {
        const item = rowItem.pop();
        dispatch({
          type: 'purchaseApplicationModel/getUserDepat',
          payload: {
            employeeNum: item.projectManagerCode
          }
        }).then((res) => {
          if(isEmpty(res)) {
            console.log('res', res)
            return CusNotification.warning({
              message: `${item.projectManagerCode}用户不存在`
            })
          }
          setTimeout(() => {
            getProjectNumber(
              res[0],
              item.projectCode,
              res[0].employeeNum,
              res[0].realName,
              item.projectName,
              res[0].phone,
              res[0].unitName,
              item.projectBudType
            );
            this.setState({
              projectNameModel: false,
            })
          }, 600);
        })
      }
    }
  }
  render() {
    const { isShowMore, projectNameVisible, projectNameModel, projectDataList, projectDataListPagination } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      form,
      contentObj,
      allDetailsInfo,
      handleSearchApplier = (e) => e,
      handleSearchApplyDept,
      dispatch,
      related,
      purchaseApplicationModel,
      getProjectNumber,
      location: { search },
      prStatusState,
      searchProjectInfoLoading = false,
      userDepatLoading = false,
    } = this.props;
    const { prStatus, projectType, projectName, purchaseApplicationLineSource } = purchaseApplicationModel;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
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
      searchProjectInfoLoading,
      onChangeRows: this.onChangeRows,
      onSearch: this.handleSearch,
      onRef: ref => {
        this.modalForm = ref;
      }
    }
    return (
      <>
        {projectType == '0' ? (
          <Form className="customize-form" ref={this.filterForm}>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
                {...formLayout}
              >
                {getFieldDecorator('projectName', {
                  initialValue: projectName ? projectName : allDetailsInfo.projectName,
                })(
                  <Input
                    readOnly
                    suffix={suffix}
                    className={styles['lov-input']}
                    value={
                      (projectName ? projectName : allDetailsInfo.projectName)
                        ? projectName
                          ? projectName
                          : allDetailsInfo.projectName
                        : null
                    }
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                      this.onSearchBtnClick();
                    }}
                    disabled={
                      prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true
                    }
                  />
                  // <CusLov
                  //   disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                  //   textValue={allDetailsInfo.projectName}
                  //   code="CMHK.API.CPEX/OPEX"
                  //   queryParams={{ lang: getCurrentUser().language }}
                  //   lovOptions={{ displayField: 'name', valueField: 'name' }}
                  //   onChange={(_, item) => {
                  //     if (isEmpty(item)) {
                  //       dispatch({
                  //         type: 'purchaseApplicationModel/commentUpdateState',
                  //         payload: {
                  //           demander: null,
                  //           demanderDepartment: null,
                  //           demanderPhone: null,
                  //         },
                  //       });
                  //     } else {
                  //       setTimeout(() => {
                  //         getProjectNumber(
                  //           item,
                  //           item.code,
                  //           item.projectManagerCode,
                  //           item.projectManagerName,
                  //           item.name,
                  //           item.projectManagerPhone,
                  //           item.unitName,
                  //           item.projectBudType
                  //         );
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
                  initialValue: allDetailsInfo?.projectNumber,
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
                      prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true
                    }
                    textValue={allDetailsInfo?.projectNumber}
                    code="CPEX.OPEX"
                    queryParams={{
                      applyType: '1',
                    }}
                    isInitVal
                    lovOptions={{ displayField: 'budCode', valueField: 'budCode' }}
                    onChange={(_, item) => {
                      console.log('item', item);
                      setTimeout(() => {
                        dispatch({
                          type: 'purchaseApplicationModel/commentUpdateState',
                          payload: {
                            projectNumber: item.budCode,
                            projectType: '1',
                            budgetTypeUpdate: item.budType, // 预算类型
                            budgetItemNumberUpdate: item.budCode, // 预算项目编码
                            businessActivitiesCodeUpdate: item.busActivityCode, // 业务活动编码
                            businessActivitiesNameUpdate: item.busActivityName, // 业务活动名称
                            costCenterCodeUpdate: item.costCenterCode, // 成本中心编码
                            costCenterNMUpdate: item.costCenternName, // 成本中心名称
                            purchaseApplicationLineSource: purchaseApplicationLineSource?.map((element) => {
                              element.$form.resetFields()
                              return {
                                ...element,
                                budgetType: item?.budType,
                                budgetItemNumber: item.budCode,
                                businessActivitiesCode: item.busActivityCode,
                                businessActivitiesName: item.busActivityName,
                                costCenterCode: item.costCenterCode,
                                costCenterNM: item.costCenternName,
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
          confirmLoading={userDepatLoading}
          onCancel={() => {
            this.setState({
              projectNameModel: false,
            });
          }}
        >
          <ProjectList {...projectProps} />
        </CusModal>
        {/* <div style={{ display: related == 'yes' ? 'block' : 'none' }}> */}

        {/* </div> */}
        {/* <div style={{ display: related == 'no' ? 'block' : 'none' }}>
          <Form className='customize-form' ref={this.filterForm}>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('预算项目编号')}
                {...formLayout}
              >
                {
                  getFieldDecorator('projectName', {
                    initialValue: allDetailsInfo?.projectName
                  })(<CusLov
                    disabled={prStatus == 'Approved' ? true : false}
                    textValue={allDetailsInfo?.projectName}
                    code='CMHK.API.OPEX'
                    lovOptions={{ displayField: 'budProjectCode', valueField: 'budProjectCode' }}
                    onChange={(_, item) => {
                      this.props.getProjectNumber(item.code, item.projectManagerCode, item.projectManagerName);
                      handleSearchApplier()
                      dispatch({
                        type: 'purchaseApplicationModel/commentUpdateState',
                        payload: {
                          budProjectCode: item.budProjectCode,
                        }
                      })
                    }}
                  />)
                }
              </Form.Item>
            </Col>
          </Form>
        </div> */}
      </>
    );
  }
}
