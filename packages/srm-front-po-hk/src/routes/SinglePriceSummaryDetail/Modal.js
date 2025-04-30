import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Form, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
const FormItem = Form.Item;

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class comparePriceModal extends React.Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      selectedRowKeys: [],
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

  render() {
    const { queryRfqResponseLoading = false, reviewPriceData } = this.props;
    // console.log('reviewPriceData', reviewPriceData);
    const { selectedRowKeys } = this.state;
    const dataSource = reviewPriceData.roundVoList.map((i) => {
      let obj = {
        roundNum: i.roundNum,
      }
      i.supPriceVoList.map((item, index) => {
        obj[`priceTotal${index + 1}`] = item.priceTotal;
        obj.supplierId = item.supplierId;
      });
      return obj;
    })
    let columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.model.label`).d('轮次')),
        dataIndex: 'roundNum',
        width: 100,
      },
    ];
    reviewPriceData?.supResultVoList?.map((item, index) => {
      const obj = {
        title: intl.get(`${promptCode}.model.label`).d(item.supName), // 供应商1、2、3
        dataIndex: `priceTotal${index}`,
        width: 160,
      };
      columns.push(obj);
    })
    const columns2 = [


      {
        title: intl.get(`${promptCode}.model.label`).d('供应商1'),
        dataIndex: 'bbb',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('供应商2'),
        dataIndex: 'ccc',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('供应商3'),
        dataIndex: '',
        width: 160,
      },
    ];

    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (keys) => {
        console.log('123123');
        this.setState({
          selectedRowKeys: keys
        })
      },
    };

    const editTableProps = {
      bordered: true,
      rowKey: "supplierId",
      columns,
      dataSource: dataSource,
      pagination: false,
      rowSelection,
    }

    return (
      <React.Fragment>
        <EditTable {...editTableProps} />
      </React.Fragment>
    )
  }
}
