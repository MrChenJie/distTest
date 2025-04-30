/** -- 报单价模式
 * @date: 2022/04/24 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import CusButton from '_cus_components/CusButton';
 import CusModal from '_cus_components/CusModal';
 import { Bind } from 'lodash-decorators';
 import moment from 'moment';
 
 import intl from 'utils/intl';
 import { getCurrentOrganizationId, getAccessToken, tableScrollWidth, getCurrentLanguage } from 'utils/utils';
 import { connect } from 'dva';
 import EditTable from '_cus_components/EditTable';
 import UploadFile from './UploadFile/UploadFile';
 import { numberRender } from 'utils/renderer';
 import { tooltipRender } from '_cus_utils/render';
 import './index.less';
 import CusInputNumber from '_cus_components/CusInputNumber';
 
 const status = ['create', 'update'];
 const tenantId = getCurrentOrganizationId();
 
 @connect(({ materiel }) => ({
   materiel,
 }))
 @Form.create({ fieldNameProp: null })
 export default class PricingSingle extends Component {
   constructor(props) {
     super(props);
     this.state = {
       // selectedRows: [],
       selectedRowKeys: [],
       fastCodes: {},
       fileList: [],
     };
     // this.unsaveFlag = false;
   }
 
   componentDidMount() {
     this.props.onRef && this.props.onRef(this);
     // this.checkPermission();
   }
 
   /**
    * 监听编辑事件，更改当前未保存状态
    *
    * @memberof PricingAll
    */
   @Bind
   handleDataChange() {
     const { unsaveFlag } = this.props;
     if (!unsaveFlag) {
       const { onEdit = (e) => e } = this.props;
       onEdit(true);
     }
   }
 
   /**
    * 监听分页变化，判断是否有未保存的数据
    *
    * @param {object} page
    * @memberof PricingAll
    */
   @Bind
   handlePageChange(page) {
     const { onPageChange = (e) => e, unsaveFlag } = this.props;
     if (unsaveFlag) {
       CusModal.confirm({
         content: intl
           .get('hzero.common.message.confirm.giveUpTip')
           .d('你有修改未保存，是否确认离开？'),
         okType: 'normal',
         onOk: () => {
           onPageChange(page);
         },
       });
     } else {
       onPageChange(page);
     }
   }
 
   /**
    * 方法含义？
    * @param {*} file - <>
    */
   @Bind()
   uploadData(file) {
     return {
       tenantId: tenantId,
       bucketName: 'bidding',
       fileName: file.name,
     };
   }
 
   @Bind
   changelist(e) {
     this.state.dataSource[e.dataSourceIndex].priceViewDTOList[e.eIndex] = e.$form.getFieldValue(
       `${e.dataSourceIndex}${e.eIndex}`
     );
   }
 
   @Bind
   onSave(data) {
     const { onSave = (e) => e } = this.props;
     onSave(data);
   }
 
   @Bind
   onConfirmPrice(data) {
     const { onConfirmPrice = (e) => e } = this.props;
     onConfirmPrice(data);
   }
 
   @Bind()
   confirmPriceChange(value, record) {
     const { HkdVal, dataSource, dispatch } = this.props;
     // 改变值求总合
     dataSource[record.dataSourceIndex].answerVOList[
       dataSource[record.dataSourceIndex].answerVOList.length - 1
     ].confirmPrice = 0;
     dataSource[record.dataSourceIndex].answerVOList.map((item, index) => {
       if (item.isSum !== 'y') {
         if (record.eIndex === index) {
           dataSource[record.dataSourceIndex].answerVOList[index].referencePriceHkd = value * dataSource[record.dataSourceIndex].answerVOList[index].referenceRate
           dataSource[record.dataSourceIndex].answerVOList[index].confirmPrice = value;
           dataSource[record.dataSourceIndex].answerVOList[
             dataSource[record.dataSourceIndex].answerVOList.length - 1
           ].confirmPrice =
             value * 1 +
             dataSource[record.dataSourceIndex].answerVOList[
               dataSource[record.dataSourceIndex].answerVOList.length - 1
             ].confirmPrice *
               1
               ? value * 1 +
                 dataSource[record.dataSourceIndex].answerVOList[
                   dataSource[record.dataSourceIndex].answerVOList.length - 1
                 ].confirmPrice *
                   1
               : 0;
               // 计算HKD值
               dataSource[record.dataSourceIndex].answerVOList[
                 dataSource[record.dataSourceIndex].answerVOList.length - 1
               ].referencePriceHkd = dataSource[record.dataSourceIndex].answerVOList[
                 dataSource[record.dataSourceIndex].answerVOList.length - 1
               ].confirmPrice * dataSource[record.dataSourceIndex].answerVOList[index].referenceRate
         } else {
           if (item.confirmPrice) {
             dataSource[record.dataSourceIndex].answerVOList[
               dataSource[record.dataSourceIndex].answerVOList.length - 1
             ].confirmPrice =
               item.confirmPrice * 1 +
               dataSource[record.dataSourceIndex].answerVOList[
                 dataSource[record.dataSourceIndex].answerVOList.length - 1
               ].confirmPrice *
                 1
                 ? item.confirmPrice * 1 +
                   dataSource[record.dataSourceIndex].answerVOList[
                     dataSource[record.dataSourceIndex].answerVOList.length - 1
                   ].confirmPrice *
                     1
                 : 0;
                 // 计算HKD值
                 dataSource[record.dataSourceIndex].answerVOList[
                   dataSource[record.dataSourceIndex].answerVOList.length - 1
                 ].referencePriceHkd = dataSource[record.dataSourceIndex].answerVOList[
                   dataSource[record.dataSourceIndex].answerVOList.length - 1
                 ].confirmPrice * dataSource[record.dataSourceIndex].answerVOList[index].referenceRate
           }
         }
       }
     });
 
     dispatch({
       type: 'pricingModels/updateState',
       payload: {
         pricingSingleDataSource: dataSource,
       },
     });
   }
 
   render() {
     const {
       pagination = {},
       saveLoading = false,
       fetchLoading = false,
       deleteLoading = false,
       timeFlag,
       submitFlag,
       dataSource,
       confirmPriceFlag,
       editConfirmPriceFlag = false,
       onEditConfirmPrice = (e) => e,
     } = this.props;
     let newDataSource = [];
     if (dataSource) {
       dataSource.map((e, j) => {
         e.answerVOList.map((i, k) => {
           newDataSource = [
             ...newDataSource,
             {
               ...i,
               dataSourceIndex: j,
               supplierName: e.supplierName,
               userId: e.userId,
               eIndex: k,
               fileDTOList: e.fileDTOList,
               _status: 'update',
             },
           ];
         });
       });
     }
 
     const getRowSpans = (arr, key) => {
       let sameValueLength = 0;
 
       const rowSpans = [];
 
       for (let i = arr.length - 1; i >= 0; i--) {
         if (i === 0) {
           rowSpans[i] = sameValueLength + 1;
 
           continue;
         }
 
         if (arr[i][key] === arr[i - 1][key]) {
           rowSpans[i] = 0;
 
           sameValueLength++;
         } else {
           rowSpans[i] = sameValueLength + 1;
 
           sameValueLength = 0;
         }
       }
 
       return rowSpans;
     };
     const rowSpans = getRowSpans(newDataSource, 'userId');
     const columns = [
       {
         title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商名称'),
         dataIndex: 'supplierName',
         fixed: 'left',
         width: 180,
         render: (value, _, index) => {
           const obj = {
             children: tooltipRender(value),
 
             props: {},
           };
 
           obj.props.rowSpan = rowSpans[index];
 
           return obj;
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
         dataIndex: 'fileDTOList',
         width: 180,
         render: (value, record, index) => {
           const obj = {
             children: (
               <UploadFile
                 onUploadSuccess={(item) => onUploadSuccess(item, record)}
                 onDeleteSuccess={() => onDeleteSuccess(record)}
                 tableName="SPUC_PO_CON_ATTACH"
                 parentId={record.qaId}
                 value={value}
                 disabled
               />
             ),
 
             props: {},
           };
 
           obj.props.rowSpan = rowSpans[index];
 
           return obj;
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.purchaseitems').d('采购内容'),
         dataIndex: 'purchaseContent',
         width: 180,
         render: (val, row) => {
           if (row.isSum) {
             return {
               children: intl
                 .get('bid.bidcommon.view.title.totalpricequotedbythesupplier')
                 .d('供应商报价总价'),
                 
               props: {
                 colSpan: 6,
                 className: 'bg-color',
               },
             };
           } else {
             return tooltipRender(val);
           }
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
         dataIndex: 'serviceContent',
         width: 180,
         render: (val, row) => {
           if (row.count) {
             return tooltipRender(val);
           } else {
             return {
               children: val,
               props: {
                 colSpan: 0,
               },
             };
           }
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.quotecurrency').d('报价货币（原币）'),
         dataIndex: 'priceCurrency',
         width: getCurrentLanguage() === 'zh_CN' ? 145 : 150,
         render: (val, row) => {
           if (row.count) {
             return val;
           } else {
             return {
               children: val,
               props: {
                 colSpan: 0,
               },
             };
           }
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
         dataIndex: 'count',
         width: 100,
         render: (val, row) => {
           if (row.count) {
             return val;
           } else {
             return {
               children: val,
               props: {
                 colSpan: 0,
               },
             };
           }
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
         dataIndex: 'unit',
         width: 100,
         render: (val, row) => {
           if (row.count) {
             return val;
           } else {
             return {
               children: val,
               props: {
                 colSpan: 0,
               },
             };
           }
         },
       },
      //  {
      //    title: intl.get('HKPC.commom.view.title.otherfeename').d('其他费用名称'),
      //    dataIndex: 'otherExpenseName',
      //    width: 150,
      //    render: (val, row) => {
      //      if (row.count) {
      //        return val;
      //      } else {
      //        return {
      //          children: val,
      //          props: {
      //            colSpan: 0,
      //          },
      //        };
      //      }
      //    },
      //  },
      //  {
      //    title: intl.get('HKPC.commom.view.title.otherfeeamount').d('其他费用金额（原币）'),
      //    dataIndex: 'otherExpensePrice',
      //    width: 200,
      //    render: (_, record) => {
      //      if(record.isSum === 'y') {
      //        return {
      //          children: <>
      //            <div style={{ textAlign: 'right' }}>{numberRender(record.otherExpensePrice, 2)}</div>
      //          </>,
      //          props: {
      //            className: 'bg-color',
      //          },
      //        }
      //      } else {
      //        return <div style={{ textAlign: 'right' }}>{numberRender(record.otherExpensePrice, 2)}</div>;
      //      }
      //    },
      //  },
       {
         title: intl.get('bid.bidcommon.view.title.unitpriceexcludingtax').d('不含税单价'),
         dataIndex: 'afterTaxPerPrice',
         width: getCurrentLanguage() === 'zh_CN' ? 180 : 317,
         render: (_, record) => {
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPerPrice, 2)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return record.isQuote === 'Y' ? <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPerPrice, 2)}</div>
             :
             intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')
           }
         },
       },
       {
         title: intl.get('bid.bidcommon.view.title.subtotalexcludingtax').d('不含税小计'),
         dataIndex: 'afterTaxPrice',
         width: getCurrentLanguage() === 'zh_CN' ? 180 : 310,
         render: (_, record) => {
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice, 2)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return record.isQuote === 'Y' ? <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice, 2)}</div>
             :
             intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')
           }
         },
       },
       // {
       //   title: intl.get('bid.bidcommon.view.title.subtotaltaxincluded').d('小计税额'),
       //   dataIndex: 'tax',
       //   width: getCurrentLanguage() === 'zh_CN' ? 180 : 310,
       //   render: (_, record) => {
       //     if(record.isSum === 'y') {
       //       return {
       //         children: <>
       //           <div style={{ textAlign: 'right' }}>{numberRender(record.tax, 2)}</div>
       //         </>,
       //         props: {
       //           className: 'bg-color',
       //         },
       //       }
       //     } else {
       //       return <div style={{ textAlign: 'right' }}>{numberRender(record.tax, 2)}</div>;
       //     }
       //   },
       // },
       // {
       //   title: intl.get('bid.bidcommon.view.title.subtotalincludingtax').d('含税小计'),
       //   dataIndex: 'preTax',
       //   width: getCurrentLanguage() === 'zh_CN' ? 180 : 310,
       //   render: (_, record) => {
       //     if(record.isSum === 'y') {
       //       return {
       //         children: <>
       //           <div style={{ textAlign: 'right' }}>{numberRender(record.preTax, 2)}</div>
       //         </>,
       //         props: {
       //           className: 'bg-color',
       //         },
       //       }
       //     } else {
       //       return <div style={{ textAlign: 'right' }}>{numberRender(record.preTax, 2)}</div>;
       //     }
       //   },
       // },
       {
         title: intl
           .get('bid.bidcommon.view.title.thepurchaserconfirmsandreviewsthequotation')
           .d('采购员确认评审报价'),
         dataIndex: 'confirmPrice',
         width: getCurrentLanguage() === 'zh_CN' ? 200 : 510,
         render: (val, record) => {
           // if(timeFlag || submitFlag && !editConfirmPriceFlag || record.isSum === 'y' || !record.proPriceConfigAnswerId) {
           //   return {
           //     children: <>
           //       <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>
           //     </>,
           //     props: {
           //       className: record.isSum === 'y'? 'bg-color' : 'normal-color',
           //     },
           //   }
           // } else {
           //   return (
           //     <Form.Item>
           //       {record.$form.getFieldDecorator(`${record.dataSourceIndex}${record.eIndex}`, {
           //         initialValue: val,
           //       })(
           //         <CusInputNumber
           //           onChange={(value) => {
           //             this.confirmPriceChange(value, record);
           //           }}
           //           precision={2}
           //           formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
           //           parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
           //           className="cus-input-money"
           //         />
           //       )}
           //     </Form.Item>
           //   )}
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice, 2)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return  record.isQuote === 'Y' ? <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice, 2)}</div>
             :
             intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')
           }
         },
       },
       // {
       //   title: intl.get('bid.bidcommon.view.title.').d('参考汇率'),
       //   key: 'referencePriceHkd2',
       //   dataIndex: 'referencePriceHkd2',
       //   width:  getCurrentLanguage() === 'zh_CN' ? 180 : 144,
       //   render: (_, record) => {
       //     return <div style={{ textAlign: 'right' }}>{numberRender(record.referencePriceHkd2, 2)}</div>;
       //   },
       // },
       // {
       //   title: intl.get('bid.bidcommon.view.title.').d('汇率日期'),
       //   key: 'referencePriceHkd1',
       //   dataIndex: 'referencePriceHkd1',
       //   width:  getCurrentLanguage() === 'zh_CN' ? 180 : 144,
       //   render: dateRender,
       // },
       {
         title: intl.get('bid.bidcommon.view.title.hkdreference').d('HKD（参考）'),
         dataIndex: 'referencePriceHkd',
         width: getCurrentLanguage() === 'zh_CN' ? 120 : 144,
         render: (_, record) => {
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice * record.referenceRate, 2)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return <div style={{ textAlign: 'right' }}>{numberRender(record.afterTaxPrice * record.referenceRate, 2)}</div>;
           }
         },
       },
       {
         title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
         key: 'warranty',
         dataIndex: 'warranty',
         width: 110,
         render: (val, record) => {
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div>{tooltipRender(val)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return <div>{tooltipRender(val)}</div>;
           }
         },
       },
       {
         title: intl.get(`bid.bidcommon.view.title.remarks`).d('备注'),
         dataIndex: 'annotation',
         width: 180,
         render: (val, record) => {
           if(record.isSum === 'y') {
             return {
               children: <>
                 <div>{tooltipRender(val)}</div>
               </>,
               props: {
                 className: 'bg-color',
               },
             }
           } else {
             return <div>{tooltipRender(val)}</div>;
           }
         },
       },
     ].filter(Boolean);
 
     const loading = saveLoading || deleteLoading || fetchLoading;
 
     const accessToken = getAccessToken();
     const headers = {};
     if (accessToken) {
       headers.Authorization = `bearer ${accessToken}`;
     }
 
     console.log('newDataSource', newDataSource)
     return (
       <>
         <EditTable
           rowKey="singleQaId"
           dataSource={newDataSource}
           pagination={false}
           className='single-style'
           // onChange={this.handlePageChange}
           columns={columns}
           // loading={fetchLoading}
           //  onDataChange={this.handleDataChange}
           scroll={{x: tableScrollWidth(columns), y: 360 }}
           rowClassName={(record) => {
             return record.isSum === 'y' ? 'bg-color' : 'normal-color'
           }}
         />
       </>
     );
   }
 }
 