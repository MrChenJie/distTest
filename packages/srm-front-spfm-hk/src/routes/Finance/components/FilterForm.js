import React, { PureComponent } from 'react';
import dayjs from 'dayjs';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import { mediumScreenWidth } from '_cus_utils/constants';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

const prompt = 'spfmhk.supplier';
const dateTimeFormat = getDateTimeFormat();
const screenWidth = window.screen.width;

@Form.create()
export default class FilterForm extends PureComponent {
  static propTypes = {
    onSearch: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      isShowMore: false,
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
      colSpan: widthSize > mediumScreenWidth ? 8 : 12
    })
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
      if(!error){
        onSearch(values);
      }
    })
  }

  render() {
    const { form: { getFieldDecorator }, onSearch, tenantId } = this.props;
    const { isShowMore, colSpan } = this.state;

    const formItemList = [
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.application.num`).d('申请单号')}>
          {getFieldDecorator('applyNumber')(<CusInput allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.request.status`).d('申请状态')}>
          {getFieldDecorator('applyStatus')(<CusSelect lovCode="HKSP.APPLICATION_STATUS" allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
          {getFieldDecorator('supplierNumber')(<CusInput allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.company.name.en`).d('公司名称（英文）')}>
          {getFieldDecorator('companyNameEn')(<CusInput allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.company.name.cn`).d('公司名称（中文）')}>
          {getFieldDecorator('companyNameCh')(<CusInput allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.field.request.date`).d('申请日期')}>
          {getFieldDecorator('applyDate')(<CusDatePicker style={{ width: '100%' }} allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.ChangeDetails`).d('信息变更明细')}>
          {getFieldDecorator('editReason')(<CusInput allowClear/>)}
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item label={intl.get(`${prompt}.view.table.applicant`).d('申请人')}
        >
          {getFieldDecorator('applyUser')(<CusLov allowClear
                                                 code="HKPC.APPLICATION"
                                                 queryParams={{ tenantId }}
          />)}
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
      <>
        <div className="customize-form">
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
      </>
    );
  }
}
