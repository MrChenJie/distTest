/**
 * index.js - 供应商考评列表-查询
 * @date: 2023-9-06
 * @author:  <jinkai.lu@hand-china.com>
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Bind } from 'lodash-decorators';
import { mediumScreenWidth } from '_cus_utils/constants';


@formatterCollections({ code: ['spfmhk.supplier'] })

export default class SupplierForm extends PureComponent {

  baseForm = React.createRef();

  constructor(props) {
    super(props);
    props?.onRef(this);
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

  @Bind()
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  @Bind()
  handleReset = () => {
    this.baseForm.current?.resetFields();
  };

  render() {
    const { onSearch, tenantId } = this.props;
    const { isShowMore, colSpan } = this.state;

    const formItemList = [
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.reviewNumber`).d('评审单号')}
          name='revNo'
        >
          <CusInput />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.view.table.supplier.num`).d('供应商编号')}
          name='supplierNumber'
        >
          <CusInput />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.company.name.en`).d('公司名称（英文）')}
          name='companyNameEn'
        >
          <CusInput />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.company.name.cn`).d('公司名称（中文）')}
          name='companyNameCh'
        >
          <CusInput />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.buyer`).d('采购员')}
          name='prPeople'
        >
          <CusLov allowClear
                  code="HKPC.APPLICATION"
                  lovOptions={{ displayField: 'realName', valueField: 'loginName' }}
                  queryParams={{ tenantId }}
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.reviewYear`).d('评审年度')}
          name='revYear'
        >
          <CusDatePicker
            allowClear
            popupClassName='customize-select'
            picker="year"
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.reviewQuater`).d('评审季度')}
          name='revQuarter'
        >
          <CusSelect
            allowClear
            popupClassName='customize-select'
            style={{ width: '100%' }}
            lovCode="HKSP.ASSESSMENT_QUARTER"
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.reviewType`).d('评审类型')}
          name='revType'
        >
          <CusSelect
            allowClear
            popupClassName='customize-select'
            style={{ width: '100%' }}
            lovCode="HKSP.ASSESSMENT_TYPE"
          />
        </Form.Item>
      </Col>,
      <Col span={colSpan}>
        <Form.Item
          label={intl.get(`spfmhk.supplier.field.info.reviewStatus`).d('评审状态')}
          name='revStatus'
        >
          <CusSelect
            allowClear
            popupClassName='customize-select'
            style={{ width: '100%' }}
            lovCode="HKSP.APPLICATION_STATUS"
          />
        </Form.Item>
      </Col>
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
        <Form ref={this.baseForm}>
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
                onReset={() => this.handleReset()}
                onShowMore={() => this.handleShowMore()}
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
