import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col } from 'antd';
import { isEmpty } from 'lodash';
import { getDateFormat, getCurrentUser } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import { connect } from 'dva';
import { Form } from 'hzero-ui';

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
  render() {
    const { isShowMore, projectNameVisible } = this.state;
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
      prStatusState
    } = this.props;
    const { prStatus, projectType } = purchaseApplicationModel;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
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
                  initialValue: allDetailsInfo.projectName,
                })(
                  <CusLov
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    textValue={allDetailsInfo.projectName}
                    code="CMHK.API.CPEX/OPEX"
                    queryParams={{ lang: getCurrentUser().language }}
                    lovOptions={{ displayField: 'name', valueField: 'name' }}
                    onChange={(_, item) => {
                      if (isEmpty(item)) {
                        dispatch({
                          type: 'purchaseApplicationModel/commentUpdateState',
                          payload: {
                            demander: null,
                            demanderDepartment: null,
                            demanderPhone: null,
                          },
                        });
                      } else {
                        setTimeout(() => {
                          getProjectNumber(
                            item,
                            item.code,
                            item.projectManagerCode,
                            item.projectManagerName,
                            item.name,
                            item.projectManagerPhone,
                            item.unitName
                          );
                          // handleSearchApplier();
                        }, 600);
                      }
                    }}
                  />
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
                })(
                  <CusLov
                    disabled={prStatusState == 'PENDING_REFER' || prStatusState == '' ? false : true}
                    textValue={allDetailsInfo?.projectNumber}
                    code="CMHK.API.OPEX"
                    lovOptions={{ displayField: 'budProjectCode', valueField: 'budProjectCode' }}
                    onChange={(_, item) => {
                      console.log('item', item);
                      setTimeout(() => {
                        dispatch({
                          type: 'purchaseApplicationModel/commentUpdateState',
                          payload: {
                            projectNumber: item.budProjectCode,
                            projectType: '1',
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
