/**
 * FilterSearch-查询表单
 * @since 2022-02-14
 * @author jxinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan, getLFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getLFormGridSpan();

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();

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

  render() {
    const { isShowMore } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
    } = this.props;
    const { getFieldValue = (e) => e } = this.form?.current || {};
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form ref={this.form}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.ictprnumber`).d('采购结果单号')}
              {...formLayout}
              name="prApplyNo"
            >
              <Input
                placeholder={intl
                  .get(`${promptCode}.view.titla.inputPRnumber`)
                  .d('请输入采购结果单号')}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.icttitle`).d('标题')}
              {...formLayout}
              name="prApplyTitle"
            >
              <Input
                placeholder={intl.get(`${promptCode}.view.titla.inputtitle`).d('请输入标题')}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.ictapplicant`).d('申请人')}
              name="prApplier"
            >
              <Input
                placeholder={intl.get(`${promptCode}.view.titla.inputapplicant`).d('请选择申请人')}
              />
            </Form.Item>
          </Col>
          <div style={{ display: isShowMore ? 'block' : 'none' }}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ictapplyingdepartment`).d('部门')}
                {...formLayout}
                name="prApplyDep"
              >
                <Input
                  placeholder={intl.get(`${promptCode}.view.titla.inputdepartment`).d('请输入部门')}
                />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ictstatus`).d('状态')}
                {...formLayout}
                name="prApplyStatus"
              >
                <CusSelect
                  placeholder={intl.get(`${promptCode}.view.titla.inputstatus`).d('请选择状态')}
                  allowClear
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PRRECORDSSTATUS']}
                />
              </Form.Item>
            </Col>
          </div>
          <Col {...gridSpan} style={{ float: 'right' }}>
            <CusQueryButtons
              onQuery={onSearch}
              onReset={this.handleReset}
              onShowMore={this.handleShowMore}
              isShowMore={isShowMore}
            ></CusQueryButtons>
          </Col>
        </Form>
      </div>
    );
  }
}
