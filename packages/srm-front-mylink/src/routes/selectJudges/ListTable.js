/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';
import TechnicalScoreList from './TechnicalScore';

const prompt = 'spfmhk.mylink';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scorcDetail: [],
      scoreVisible: false,
    }
  }

  // 评审单号进入
  handleRevNumLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    window.open(url, '_blank')
    // window.open(`/pub/mylink/cooperation-change/Detail?formRecordId=${record.partnerId}`, '_blank')
  }

  // 公司名称进入
  handlecompanyNameLink = (record) => {
    const url = `/pub/mylink/cooperation-change/Detail?isType=companyName&formRecordId=${record.partnerId}`
    window.open(url, '_blank')
  }

  // 查看得分详情
  handlerevTotalNumLink = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getRevTotalNum',
      payload: {
        partnerId: record?.partnerId
      }
    }).then((res) => {
      if(res) {
        console.log('得分详情', res);
        this.setState({
          scoreVisible: true,
          scorcDetail: res?.map((obj, index) => {
            if (index === res.length - 1) {
                return { ...obj, revItem: 'sumAll' }; // 展开最后一个对象并添加新属性
            }
            return obj; // 其他对象保持不变
        }),
        })
      }
    })
  }
  
  render() {
    const {
      rowSelection,
      onChange = (e) => e,
      handleEditEmail = (e) => e,
      handleViewEmail = (e) => e,
      handleRecall = (e) => e,
      PartnerInformationModal,
    } = this.props;
    const {
      dataSource = [],
      pagination = {},
    } = PartnerInformationModal;
    const {
      scorcDetail = [],
      scoreVisible
    } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.field.review.status`).d('评审状态'),
        width: 130,
        dataIndex: 'revStatusMeaning',
        key: 'revStatusMeaning',
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.field.review.num`).d('评审单号'),
        width: 180,
        dataIndex: 'revNum',
        key: 'revNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleRevNumLink(record)}>
              {tooltipRender(record.revNum)}
            </a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.companyName`).d('公司名称'),
        width: 180,
        dataIndex: 'companyName',
        key: 'companyName',
        render: (_, record) => {
          return (
            <a onClick={() => this.handlecompanyNameLink(record)}>
              {tooltipRender(record.companyName)}
            </a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.partner.code`).d('合作伙伴编码'),
        width: 130,
        dataIndex: 'partnerNum',
        key: 'partnerNum',
      },
      {
        title: intl.get(`${prompt}.field.cooperate.mode`).d('合作模式'),
        width: 130,
        dataIndex: 'partnerModeMeaning',
        key: 'partnerModeMeaning',
      },
      {
        title: intl.get(`${prompt}.field.company.productSer`).d('产品/服务'),
        width: 150,
        dataIndex: 'productMeaning',
        key: 'productMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.field.score`).d('得分'),
        width: 130,
        dataIndex: 'revTotalNum',
        key: 'revTotalNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handlerevTotalNumLink(record)}>
              {tooltipRender(record.revTotalNum)}
            </a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.title.user`).d('业务员'),
        width: 160,
        dataIndex: 'saleMan',
        key: 'saleMan',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.field.initiate.appdate`).d('发起评审日期'),
        width: 130,
        dataIndex: 'beginRevDate',
        key: 'beginRevDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        width: 120,
        key: 'operator',
        fixed: 'right',
        render: (_, record) => {
          return (
            <>
              {!record.messageId && record?.revStatus === 'Approved' && (<CusButton
                type="plain"
                onClick={() => handleEditEmail(record)}
              >
                {intl.get(`${prompt}.button.edit.email`).d('编辑邮件')}
              </CusButton>)}
              {record.messageId && (
                <CusButton type="plain" onClick={() => handleViewEmail(record)}>
                  {intl.get(`${prompt}.button.view.email`).d('查看邮件')}
                </CusButton>
              )
              }
              {record?.revStatus === 'Draft' && (
                <CusButton type="plain" onClick={() => handleRecall(record)}>
                  {intl.get(`${prompt}.button.retuyrn.partner`).d('退回商户')}
                </CusButton>
              )}
            </>
          )
        },
      }
    ];

    const TechnicalScoreListProps = {
      ...this.props,
      scorcDetail,
    }
    return (
      <>
        <CusTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
        <CusModal
          destroyOnClose
          title={intl.get('spfmhk.mylink.feild.reviewscore').d("评审分数明细")}
          visible={scoreVisible}
          width={1000}
          onCancel={() => {
            this.setState({
              scoreVisible: false,
            })
          }}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <TechnicalScoreList {...TechnicalScoreListProps} />
        </CusModal>
      </>
    );
  }
}
