import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import CusTable from '_cus_components/CusTable';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Form, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
const FormItem = Form.Item;

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class QuotationDocumentSubmitNextModal extends React.Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      ResDataSource: [],
      // selectedRows: [],
      // selectedRowKeys: [],
    }
  }

  // componentDidMount() {
  //   const { dispatch, nowRecord } = this.props;
  //   const { enquiryPriceId, enquiryPriceRoundsId } = nowRecord;
  //   dispatch({
  //     type: 'resaleRfq/queryRfqResponse',
  //     payload: {
  //       enquiryPriceId,
  //       enquiryPriceRoundsId,
  //     },
  //   }).then(res => {
  //     if (res) {
  //       this.setState({
  //         ResDataSource: res,
  //       });
  //     };
  //   });
  // }

  
  // @Bind()
  // onSelect(record, selected) {
  //   const { selectedRows = [] } = this.state;
  //   const newSRows = selected
  //     ? selectedRows.concat(record)
  //     : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
  //   const newSelectedRowKeys = [];
  //   newSRows.forEach((item) => {
  //     newSelectedRowKeys.push(item[ROW_KEY]);
  //   });
  //   console.log('newSRows', newSRows);
  //   this.setState({
  //     selectedRows: newSRows,
  //     selectedRowKeys: newSelectedRowKeys,
  //   });
  // }

  // @Bind()
  // onSelectAll(selected, _, changeRows) {
  //   const { selectedRows = [] } = this.state;
  //   const newSRows = selected
  //     ? selectedRows.concat(changeRows)
  //     : pullAllBy([...selectedRows], changeRows, ROW_KEY);
  //   const newSelectedRowKeys = [];
  //   newSRows.forEach((item) => {
  //     newSelectedRowKeys.push(item[ROW_KEY]);
  //   });
  //   this.setState({
  //     selectedRows: newSRows,
  //     selectedRowKeys: newSelectedRowKeys,
  //   });
  // }

  render() {
    const { queryRfqResponseLoading = false } = this.props;
    const { ResDataSource } = this.state;

    const tableProps = {
      // dataSource: supperlierSouce,
      columns,
      // checkbox待完成！！！！！！！！！！！！！！！！！！！！！！！！！！
      // rowSelection:{rowSelection},
      // pagination: supperlierPagination,
      // rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.label`).d('供应商名称'),
        dataIndex: 'supplierNum',
        width: 160,
      }
    ];

    // const rowSelection = {
    //   selectedRows,
    //   selectedRowKeys,
    //   onSelect: this.onSelect,
    //   onSelectAll: this.onSelectAll,
    // };
    return (
      <React.Fragment>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusTable dataSource={[]} pagination={[]} columns={columns}></CusTable>
                  
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.Reason`).d('再次报价理由')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusInput.TextArea 
                  style={{height:'auto'}}
                  rows={3}
                  autoSize={{ minRows: 3, maxRows: 3 }} 
                   />
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageName`).d('阶段名称')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusDatePicker
                    style={{ width: '100%' }}
                  // disabledDate={this.disabledDate}
                  />
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusInput disabled></CusInput>
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StartTime`).d('开始时间')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusDatePicker
                    style={{ width: '100%' }}
                  // disabledDate={this.disabledDate}
                  />
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusDatePicker
                    style={{ width: '100%' }}
                  // disabledDate={this.disabledDate}
                  />
                </FormItem>
                <FormItem
                  label=" "
                  style={{marginBottom:'-8px'}}
                >
                  <div style={{color:'#8996a1',fontSize:'13px'}}>说明:</div>
                </FormItem>
                <FormItem
                  label=" "
                >
                  <div style={{color:'#8996a1',fontSize:'13px'}}>{intl.get(`${promptCode}.view.title.Quotationfileeditingtimegysc`).d('供应商须在截止时间前递交报价文件')}</div>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}
