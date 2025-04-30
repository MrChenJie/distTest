// 询价邀请预览
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import CusTable from '_cus_components/CusTable';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Form, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
const FormItem = Form.Item;
import classnames from 'classnames';
import styles from './modal.less';
import { tooltipRender } from '_cus_utils/render';
import { operatorRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceRoundsId';
@formatterCollections({ code: [promptCode] })
export default class RfqResponse extends React.Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      fileEmailModel: false,
      emailPreview: '',
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


  /**
  * @description 邀请供应商 预览Modal
  */
  @Bind()
  openfimeEmailModal(record) {
    const { dispatch, singlePurchaseApplicationModel } = this.props;
    const { refHeadId } = singlePurchaseApplicationModel;
    this.setState({
      fileEmailModel: true,
    })
    // 这里还要调一个获取预览信息的接口
    dispatch({
      type: `singlePurchaseApplicationModel/supplierPreview`,
      payload: {
        proId: refHeadId,
        supplierId: record.id
      }
    }).then(res => {
      if (res) {
        this.setState({
          emailPreview: res.templateContent
        })
      }
      // console.log('res', res);
    })

  }

  /**
  * @description 发送
  */
  @Bind()
  sendEmail(record) {
    console.log('record', record);
    const { dispatch, stagePreview = (e) => e, singlePurchaseApplicationModel } = this.props;
    const { refHeadId } = singlePurchaseApplicationModel;
    // 发送
    dispatch({
      type: `singlePurchaseApplicationModel/supplierSend`,
      payload: {
        prThirdSupList: [record],
      }
    }).then(res => {
      if (res) {
        stagePreview(refHeadId);
      }
    })
  }


  render() {
    const { querySupplierLoading = false, singlePurchaseApplicationModel, isSendAllFlag } = this.props;
    const { fileEmailModel } = this.state;
    const { supplierList = [], stageList } = singlePurchaseApplicationModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'name',
        width: 160,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.operate`).d('操作')),
        width: 120,
        render: (text, record) => {
          // 过滤出报价文件递交里程碑
          let arrangement = stageList.filter(item => item.stageArrangement.includes('submissionOfQuotationDocuments'));
          // 过滤出确认报价里程碑
          let priceSummaryList = stageList.filter(item => item.stageArrangement.includes('priceSummary'));
          const [singlePriceSummaryList] = priceSummaryList;
          let deadline;
          if (arrangement && arrangement.length > 0) {
            deadline = arrangement[arrangement.length - 1]?.deadline;
          }
          return (
            <>
              <CusButton type="plain" onClick={() => this.openfimeEmailModal(record)} style={{marginRight: '16px'}}>
                {intl.get(`${promptCode}.view.button.Preview`).d('预览')}
              </CusButton>
              {(record.isInviteSended === 'false' && deadline && isSendAllFlag === 'N') && <CusButton type="plain" onClick={() => this.sendEmail(record)} style={{marginRight: '16px'}}>
                {intl.get(`${promptCode}.view.button.Send`).d('发送')}
              </CusButton>}
              {(record.isInviteSended === 'true' && singlePriceSummaryList?.status !== 'summarized' && isSendAllFlag === 'N') && <CusButton type="plain" onClick={() => this.sendEmail(record)}>
                {intl.get(`${promptCode}.view.button.resend`).d('重新发送')}
              </CusButton>}
            </>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.button.Sendtime`).d('发送时间'),
        dataIndex: 'sendTime',
        width: 160,
      },
    ];

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          columns={columns}
          loading={querySupplierLoading}
          dataSource={supplierList}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <CusModal
          visible={fileEmailModel}
          onOk={() => this.setState({
            fileEmailModel: false,
          })}
          destroyOnClose
          onCancel={() => this.setState({
            fileEmailModel: false,
          })}
          width="40%"
        >
          <p dangerouslySetInnerHTML={{ __html: this.state.emailPreview }}></p>
        </CusModal>
      </React.Fragment>
    )
  }
}
