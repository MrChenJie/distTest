import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import dayjs from 'dayjs';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: true,
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
      <div className='customize-form'>
        <Form ref={this.form}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('文件标题')}
              {...formLayout}
              name='enquiryPriceNum'
            >
              <Input placeholder='请输入文件标题' />
            </Form.Item>
          </Col>
          <div style={{ display: isShowMore ? 'block' : 'none' }}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.model.label`).d('前处理人')}
                {...formLayout}
                name='enquiryPriceTitle'
              >
                <Input placeholder='请输入前处理人' />
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
