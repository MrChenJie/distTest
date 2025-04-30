import React, { useEffect, useState } from 'react';
import uuid from 'uuid/v4';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Button, Col, Row, Form } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { dateRender, numberRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import request from 'utils/request';
import { getResponse, parseParameters, createPagination } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import PageWrapper from '_cus_components/Page/PageWrapper';

import recordIcon from '@/assets/buttonIcons/记录.png';
import HistoryRecord from './HistoryRecord';
import styles from './index.less';

async function fetchLateRemind(params) {
  const { circuitId, excludeSettleFlag, sortOrder, isCircuitNumberAR, ...other } = params;
  return request(`/ebs/v1/ebs/${isCircuitNumberAR ? 'page-ar-trx-circuit' : 'page-ar-trx-overdue'}`, {
    method: 'POST',
    body: {
      queryType: 'DETAIL',
      arBalanceObjDTOList: [{ circuitId }],
      excludeSettleFlag: excludeSettleFlag,
      sortOrder,
    },
    query: parseParameters(other),
  });
}

async function fetchSumLateRemind(params) {
  const { circuitId, excludeSettleFlag, isCircuitNumberAR } = params;
  return request(`/ebs/v1/ebs/${isCircuitNumberAR ? 'ar-trx-circuit' : 'ar-trx-overdue'}`, {
    method: 'POST',
    body: {
      queryType: 'SUM',
      arBalanceObjDTOList: [{ circuitId }],
      excludeSettleFlag: excludeSettleFlag,
    },
    query: parseParameters(params),
  });
}

const FormItem = Form.Item;
const commonPrompt = 'spcm.paymentRequest';

function LateRemind({ circuitId, costRequestId, form = {}, isCircuitNumberAR = false }) {
  const [circuitRemainingHkd, setCircuitRemainingHkd] = useState(undefined);
  const [data, setData] = useState({ dataSource: [], pagination: {} });
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState([]);

  useEffect(() => {
    queryRemindData({});
  }, [circuitId]);


  const convertToDatabaseField = (camelCaseString) => {
    // 将第一个字母转为小写
    let result = camelCaseString.charAt(0).toLowerCase();

    // 遍历字符串的其余字符
    for (let i = 1; i < camelCaseString.length; i++) {
      const currentChar = camelCaseString.charAt(i);

      // 如果当前字符是大写字母，则在前面加上下划线并转为小写字母
      if (currentChar === currentChar.toUpperCase()) {
        result += '_' + currentChar.toLowerCase();
      } else {
        result += currentChar;
      }
    }

    return result;
  }

  const queryRemindData = (page = {}, sorter = []) => {
    let sortOrder = ''
    // 只有一个排序的时候，sorter是对象
    if(sorter && Object.prototype.toString.call(sorter) === '[object Object]'){
      sorter = [sorter]
    }
    let nowSorter = [];
    if (sorter && !isEmpty(sorter)) {
      // 缓存sorter数组
      setSortedInfo(sorter);
      nowSorter = sorter;
    } else {
      nowSorter = sortedInfo;
    };
    // 拼接排序参数
    if (nowSorter.length === 1 && nowSorter[0].column === undefined){
      sortOrder = '';
    }else if(nowSorter.length > 0){
      sortOrder = nowSorter.map(item => `${convertToDatabaseField(item.field)} ${item.order === 'ascend' ? 'asc' : 'desc'}`).join(',')
      sortOrder = "order by ".concat(sortOrder)
    }
    setLoading(true);
    setQueryLoading(true);
    const values = form.getFieldsValue();
    fetchLateRemind({ page, circuitId, sortOrder, isCircuitNumberAR, ...values }).then((r) => {
      setQueryLoading(false);
      if (getResponse(r)) {
        setData({
          dataSource: r.content.map((i) => ({ ...i, rowKey: uuid() })),
          pagination: createPagination(r),
        });
      }
    });
    fetchSumLateRemind({ page, circuitId, isCircuitNumberAR, ...values }).then((r) => {
      setLoading(false);
      if (getResponse(r)) {
        setCircuitRemainingHkd(r.arBalanceList[0]?.circuitRemainingHkd);
      }
    });
  };

  const getColumns = [
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.customerName`).d('客户名称'),
      width: 200,
      dataIndex: 'customerName',
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.ebsCode`).d('客户EBS编码'),
      width: 120,
      dataIndex: 'ebsCode',
      key: 'ebsCode',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
      // sortOrder: sortedInfo.find(item => item.field === 'ebsCode')?.order || null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.siteCode`).d('客户地点'),
      width: 120,
      dataIndex: 'siteCode',
      key: 'siteCode',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.trxNumber`).d('发票编号'),
      width: 120,
      dataIndex: 'trxNumber',
      key: 'trxNumber',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.transactionDate`).d('发票日期'),
      width: 120,
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: dateRender,
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.serviceStartDate`).d('服务开始日期'),
      width: 120,
      dataIndex: 'serviceStartDate',
      key: 'serviceStartDate',
      render: dateRender,
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.serviceEndDate`).d('服务结束日期'),
      width: 120,
      dataIndex: 'serviceEndDate',
      key: 'serviceEndDate',
      render: dateRender,
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.circuitId`).d('客户电路编号'),
      width: 120,
      dataIndex: 'circuitId',
      key: 'circuitId',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.currencyCode`).d('币种'),
      width: 120,
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.circuitAmt`).d('电路编号金额'),
      width: 120,
      dataIndex: 'circuitAmt',
      key: 'circuitAmt',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
      render: (val, _) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.circuitAmtHkd`).d('电路编号金额（HKD）'),
      width: 180,
      dataIndex: 'circuitAmtHkd',
      key: 'circuitAmtHkd',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
      render: (val, _) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.circuitRemaining`).d('电路编号余额'),
      width: 120,
      dataIndex: 'circuitRemaining',
      key: 'circuitRemaining',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
      render: (val, _) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
    },
    {
      title: intl
        .get(`${commonPrompt}.model.lateRemind.circuitRemainingHkd`)
        .d('电路编号余额（HKD）'),
      width: 180,
      dataIndex: 'circuitRemainingHkd',
      key: 'circuitRemainingHkd',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
      render: (val, _) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.paymentTerm`).d('付款条件'),
      width: 120,
      dataIndex: 'paymentTerm',
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.dueDate`).d('到期日'),
      width: 120,
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: dateRender,
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.dueDateDuration`).d('逾期时长'),
      width: 140,
      dataIndex: 'dueDateDuration',
      key: 'dueDateDuration',
      sorter: isCircuitNumberAR
        ?  { multiple: 1 }
        : null,
    },
    {
      title: intl.get(`${commonPrompt}.model.lateRemind.settleFlag`).d('统一结算EBS Code'),
      width: 170,
      dataIndex: 'settleFlagMeaning',
    },
  ];

  return (
    <>
      <div style={{ display: 'none' }}><PageWrapper /></div>
      <Form>
        <Row>
          <Col span={8} style={{ marginRight: '20px' }}>
            <FormItem
              style={{ marginBottom: '0px' }}
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl
                .get(`${commonPrompt}.query.lateRemind.excludeSettleFlag`)
                .d('排除统一结算EBS Code')}
            >
              {form.getFieldDecorator('excludeSettleFlag', {
                initialValue: '1',
              })(
                <ValueList
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  lovCode="HPFM.FLAG"
                />
              )}
            </FormItem>
          </Col>
          <div style={{ display: 'flex', height: '40px', alignItems: 'center' }}>
            <Button type="primary" onClick={() => {
              // setSortedInfo([])
              queryRemindData();
            }}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </Row>
      </Form>
      <Row style={{ marginBottom: '10px' }}>
        <Col span={20}>
          <div
            style={{
              height: '28px',
              lineHeight: '28px',
            }}
          >
            <span>
              {intl.get(`${commonPrompt}.view.lateRemind.updateDate`).d('更新时间')}&nbsp;:&nbsp;
              {moment().format(DEFAULT_DATETIME_FORMAT)}
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span style={{ color: 'red' }}>
              {intl
                .get(`${commonPrompt}.view.lateRemind.topInfo`, {
                  date: moment().format('LL'),
                  number: data.dataSource[0]?.dueDataCount || 0,
                  money: `${numberRender(circuitRemainingHkd || 0, 2)}`,
                })
                .d('截至{date}，未到账发票{number}张，涉及金额{money}港币')}
            </span>
          </div>
        </Col>
        <Col span={4} className="customize-buttons">
          <Button
            onClick={() => {
              Modal.open({
                key: 'historyRecord',
                title: intl.get(`${commonPrompt}.modal.title.historyRecord`).d('历史记录'),
                children: <HistoryRecord costRequestId={costRequestId} circuitId={circuitId} isCircuitNumberAR={isCircuitNumberAR} />,
                destroyOnClose: true,
                closable: true,
                footer: null,
              });
            }}
          >
            <img src={recordIcon} alt="" />
            {intl.get(`${commonPrompt}.lateRemind.button.historyRecord`).d('历史记录')}
          </Button>
        </Col>
      </Row>
      <CusTable
        rowKey="rowKey"
        bordered
        hideOnSinglePage={false}
        loading={loading || queryLoading}
        dataSource={data.dataSource}
        pagination={data.pagination}
        columns={getColumns}
        onChange={(page, _, sorter) => {
          queryRemindData(page, sorter);
        }}
        rowClassName={(record) => {
          const { dueDateDuration } = record;
          if (dueDateDuration > 0) {
            return styles['lineYELLOW'];
          } else {
            return undefined;
          }
        }}
      />
      <span style={{ color: 'red' }}>
        {isCircuitNumberAR
          ?
            intl
              .get(`${commonPrompt}.lateRemind.message.circuitNumberARInformation`)
              .d('上述为以客户电路编号为维度查询的收款数据，具体收款详情请咨询财务人员')
          :
            intl
              .get(`${commonPrompt}.lateRemind.message.info`)
              .d('上述为以参与方为维度查询的欠费金额，具体逾期详情请咨询财务人员')
        }
      </span>
    </>
  );
}

export default Form.create({ fieldNameProp: null })(LateRemind);
