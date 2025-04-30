import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { Form, Row, Col, Input } from 'antd';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusModal from '_cus_components/CusModal';
import { mediumScreenWidth } from '_cus_utils/constants';


const FormItem = Form.Item;
const commonPrompt = 'spfmhk.supplier';
const formLayout = {
  wrapperCol: { span: 24 },
};
const dateTimeFormat = getDateTimeFormat();
const screenWidth = window.screen.width;

class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      expandForm: false,
      colSpan: 8,
    };
  }
  form = React.createRef();

  componentDidMount() {
    window.addEventListener('resize', this.setPageWidth);
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    this.form?.current?.resetFields();
  }

  @Bind()
  setPageWidth() {
    const widthSize = window.innerWidth;
    this.setState({
      colSpan: widthSize > mediumScreenWidth ? 8 : 12
    })
  }


  @Bind
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  render() {
    const { handleSearch = (e) => e, idpValueMap = {}, isUpdate } = this.props;
    const { expandForm, colSpan } = this.state;


    // 总共的itemlist
    const formItemList = [
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.field.supplier.num`).d('供应商编号')}
          {...formLayout}
          name="companyNum"
        >
          <Input />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.field.company.name.en`).d('公司名称(英文)')}
          {...formLayout}
          name="companyNameEn"
        >
          <Input />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.field.company.name.cn`).d('公司名称(中文)')}
          {...formLayout}
          name="companyName"
        >
          <Input />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.view.table.EnterpriseEmail`).d('企业邮箱')}
          {...formLayout}
          name="companyEmail"
        >
          <Input />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.field.lastUpdateDateFrom`).d('更新时间从')}
          {...formLayout}
          name="lastUpdateDateFrom"
        >
          <CusDatePicker
            showTime
            format={dateTimeFormat}
            placeholder={intl
              .get(`${commonPrompt}.message.selectDateTime`)
              .d('请选择时间')}
            disabledDate={(currentDate) => {
              return (
                dayjs.isDayjs(this.form?.current?.getFieldValue('lastUpdateDateTo')) &&
                currentDate &&
                currentDate.isAfter(this.form?.current?.getFieldValue('lastUpdateDateTo'))
              );
            }}
          />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.field.lastUpdateDateTo`).d('更新时间至')}
          {...formLayout}
          name="lastUpdateDateTo"
        >
          <CusDatePicker
            showTime
            format={dateTimeFormat}
            placeholder={intl
              .get(`${commonPrompt}.message.selectDateTime`)
              .d('请选择时间')}
            disabledDate={(currentDate) => {
              return (
                dayjs.isDayjs(this.form?.current?.getFieldValue('lastUpdateDateFrom')) &&
                currentDate &&
                currentDate.isBefore(this.form?.current?.getFieldValue('lastUpdateDateFrom'))
              );
            }}
          />
        </FormItem>
      </Col>,
      <Col span={colSpan}>
        <FormItem
          label={intl.get(`${commonPrompt}.view.table.UpdateStatus`).d('更新状态')}
          {...formLayout}
          name="processStatus"
        >
          <CusSelect
            options={idpValueMap['ISP.ACCOUNT_GENERATE_STATUS']}
            lazyLoad={false}
            allowClear
          />
        </FormItem>
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
      <Form ref={this.form} className="customize-form">
        <Row>
          <Col span={24}>
            <Row>
              {showItemList.map(item => {
                return item;
              })}
              {expandFormItemList.length > 0 && (
                <div style={{ display: expandForm ? 'block' : 'none' }}>
                  {expandFormItemList.map(item => {
                    return item;
                  })}
                </div>
              )}
              <Col span={colSpan} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={() => {
                    if (isUpdate) {
                      CusModal.confirm({
                        content: intl
                          .get(`${commonPrompt}.message.saveTips`)
                          .d('当前页面有未保存数据继续操作，数据将丢失， 请确认继续？'),
                        onOk: () => {
                          handleSearch({}, true);
                        },
                      });
                    } else {
                      handleSearch({}, true);
                    }
                  }}
                  onReset={this.handleReset}
                  onShowMore={this.toggleForm}
                  isShowMore={expandForm}
                  isShowMoreButton={expandFormItemList.length > 0}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default FilterForm;
