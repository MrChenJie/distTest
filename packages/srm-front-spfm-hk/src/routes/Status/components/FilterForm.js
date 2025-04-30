import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import { mediumScreenWidth } from '_cus_utils/constants';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import CusSelect from 'srm-front-common/lib/components/CusSelect';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class FilterForm extends PureComponent {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      isShowMore: false, // 展示是否展开更多的查询条件
      colSpan: 8,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.setPageWidth);
  }

  @Bind()
  setPageWidth() {
    const widthSize = window.innerWidth;
    this.setState({
      colSpan: widthSize > mediumScreenWidth ? 8 : 12,
    });
  }

  // 更多查询条件
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  // 重置表单
  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  }

  // 查询
  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { form, onSearch } = this.props;
    form.validateFields((error, values) => {
      if (!error) {
        onSearch(values);
      }
    });
  }

  render() {
    const { form: { getFieldDecorator }, onSearch } = this.props;
    const { isShowMore, colSpan } = this.state;
    const formItemList = [
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.ApplicationNo`).d('申请单号')}>
          {getFieldDecorator('applyNo')(<CusInput allowClear />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.ApplicationStatus`).d('申请状态')}>
          {getFieldDecorator('applyStatus')(<CusSelect allowClear
                                                       lovCode='HKSP.APPLICATION_STATUS'
          />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.ChangeType`).d('变更类型')}>
          {getFieldDecorator('changeType')(<CusSelect allowClear
                                                      lovCode='HKSP.CHANGE_TYPE'
          />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
          {getFieldDecorator('supplierNumber')(<CusInput allowClear />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
          {getFieldDecorator('companyNameEn')(<CusInput allowClear />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
          {getFieldDecorator('companyNameCh')(<CusInput allowClear />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}>
          {getFieldDecorator('supplierVersion')(<CusInput allowClear />)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.ApplicationDate`).d('申请日期')}>
          {getFieldDecorator('applyDate')(<CusDatePicker allowClear style={{ width: '100%' }} />)}
        </Form.Item>
      </Col>,
    ];

    // 默认展示的item;
    let showItemList = [];
    // 放折叠框里的item;
    let expandFormItemList = [];
    if (colSpan === 8) {
      // width>=1000;
      if (formItemList.length > 6) {
        // 查询条件>6个时
        showItemList = formItemList.slice(0, 5);
        expandFormItemList = formItemList.slice(5);
      } else {
        showItemList = formItemList;
      }
    } else {
      // width<1000;
      if (formItemList.length > 3) {
        // 查询条件>6个时
        showItemList = formItemList.slice(0, 3);
        expandFormItemList = formItemList.slice(3);
      } else {
        showItemList = formItemList;
      }
    }

    return (
      <div className='customize-form'>
        <Form>
          <Row gutter={24}>
            {showItemList.map(item => {
              return item;
            })}
            {expandFormItemList.length > 0 && (
              <div style={{ display: isShowMore ? 'block' : 'none' }}>
                {expandFormItemList.map(item => {
                  return item;
                })}
              </div>
            )}
            <Col span={colSpan} style={{ float: 'right' }}>
              <CusQueryButtons
                onQuery={onSearch}
                onReset={this.handleResetBtnClick}
                onShowMore={this.handleShowMore}
                isShowMore={isShowMore}
                isShowMoreButton={expandFormItemList?.length > 0}
              />
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
