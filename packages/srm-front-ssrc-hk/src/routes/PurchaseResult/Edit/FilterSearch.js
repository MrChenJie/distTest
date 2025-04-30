import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
// import { SearchOutlined } from '@ant-design/icons';
// import CusModal from '_cus_components/CusModal';
// import CusSelect from '_cus_components/CusSelect';
// import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
// import DataTableProject from './DataTableProject';
import { connect } from 'dva';

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
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
      projectNameVisible: false,
    };
  }

  projectForm = React.createRef();

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
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
    const fieldsValue = this.form?.current?.getFieldsValue();
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
    }).then(res => {
      if (res) {
        console.log(res);
      }
    });
  }

  // 点击放大镜查看项目名称
  @Bind()
  queryProjectName() {
    this.setState({
      projectNameVisible: true,
    });
    console.log('执行了吗');
    this.searchProjectName();
  }

  render() {
    const { isShowMore, projectNameVisible } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      purchaseResultModel,
      form
    } = this.props;
    const { cmhkPrFourthHead } = purchaseResultModel;
    const { getFieldDecorator } = form
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form ref={this.projectForm}>
          <Col span={24}>
            {cmhkPrFourthHead?.projectId && <Form.Item
              label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
              {...formLayout}
            >
              {getFieldDecorator('projectId', {
                initialValue: cmhkPrFourthHead?.projectId,
              })(
                <CusLov
                  textValue={cmhkPrFourthHead?.projectId}
                  disabled
                  code="HKICT.PCCW.PROJECTINFO"
                  lovOptions={{ valueField: 'name', displayField: 'name' }}
                />
              )}
            </Form.Item>}
            {!cmhkPrFourthHead?.projectId && <Form.Item
              label={intl.get(`${promptCode}.view.title.BudgetProjectnumber`).d('预算项目编号')}
              {...formLayout}
              name="projectNumber"
            >
              {getFieldDecorator('projectNumber', {
                initialValue: cmhkPrFourthHead?.projectNumber,
              })(<Input disabled />)}
            </Form.Item>}
          </Col>
        </Form>
      </div>
    );
  }
}
