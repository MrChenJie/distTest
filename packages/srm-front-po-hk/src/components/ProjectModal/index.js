import React from 'react';
import { connect } from 'dva';
import { Col, Row, Input } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { isUndefined, isEmpty, join, map } from 'lodash';
import searchIcon from '@/assets/searchIcon.svg';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import styles from './index.less';
import ProjectList from './projectList';
import { filterNullValueObject, createPagination } from 'utils/utils';

const promptCode = 'HKPC.commom';

@Form.create({ fieldNameProp: null })
@connect(({ loading, purchaseApplicationCusModel, singlePurchaseApplicationCusModel }) => ({
  purchaseApplicationCusModel,
  singlePurchaseApplicationCusModel,
}))

export default class ProjectModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      projectDataList: [],
      projectDataListPagination: {},
      rowsData: [],
      newProject: ''
    }
  }

  componentDidMount() {}

  @Bind
  handleSearch(page = {}) {
    const { dispatch, projectEditVal } = this.props;
    const filterValues = isUndefined(this?.modalForm?.props.form)
      ? {}
      : filterNullValueObject(this?.modalForm?.props.form.getFieldsValue());
      console.log('filterValues', filterValues)
    dispatch({
      type: projectEditVal === 'single' ? 'singlePurchaseApplicationCusModel/getProjectName' : 'purchaseApplicationCusModel/getProjectName',
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
    const {
      onRowsItem = (e) => e,
      form,
    } = this.props;
    const { rowsData } = this.state;

    if(isEmpty(rowsData)) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    } else {
      form.resetFields('newProject');
      if(rowsData.length > 1) {
        this.setState({
          newProject: join(map(rowsData, 'projectName'), ','),
          projectCode: join(map(rowsData, 'projectCode'), ','),
          projectNameModel: false,
        }, () => {
          onRowsItem(rowsData);
        })
      } else {
        const item = rowsData.pop();
        this.setState({
          newProject: item.projectName,
          projectCode: item.projectCode,
          projectNameModel: false,
        }, () => {
          onRowsItem(item);
        })
      }
    }
  }

  render() {
    const {
      form,
      purchaseApplicationCusModel,
      singlePurchaseApplicationCusModel,
    } = this.props;
    const { getFieldDecorator } = form;
    console.log('purchaseApplicationCusModel', purchaseApplicationCusModel);
    console.log('singlePurchaseApplicationCusModel', singlePurchaseApplicationCusModel);
    const { priceBasicInfo } = (purchaseApplicationCusModel || singlePurchaseApplicationCusModel);
    const { projectName, projectNumber } = priceBasicInfo;

    const {
      projectNameModel,
      projectDataList,
      projectDataListPagination,
      newProject,
      projectCode,
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
      projectNumber,
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
        <Form ref={this.projectEditForm} className="customize-form">
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              >
                {getFieldDecorator('projectName', {
                  initialValue: projectName
                })(
                  <CusInput disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.selectproject`).d('选择项目')}
              >
                {getFieldDecorator('newProject', {
                  initialValue: newProject,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.selectproject`).d('选择项目'),
                      }),
                    },
                  ],
                })(
                  <Input
                    readOnly
                    suffix={suffix}
                    value={newProject}
                    className={styles['lov-input']}
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                      this.onSearchBtnClick()
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {/* 项目名称弹框 */}
        <CusModal
          title={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
          visible={projectNameModel}
          destroyOnClose={true}
          width={1500}
          onOk={ this.handleProjectName }
          onCancel={() => {
              this.setState({
                projectNameModel: false,
              })
            }
          }
        >
          <ProjectList {...projectProps} />
        </CusModal>
      </>
    )
  }
}