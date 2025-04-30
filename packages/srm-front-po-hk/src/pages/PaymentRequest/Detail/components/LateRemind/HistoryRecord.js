import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { Col, Row, Tabs, Spin, Form, Button, LocaleProvider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import intl from 'utils/intl';
import request from 'utils/request';
import {
  getResponse,
  getCurrentOrganizationId,
  createPagination,
  parseParameters,
  getCurrentLanguage,
} from 'utils/utils';
import ValueList from 'components/ValueList';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { dateRender, numberRender } from 'utils/renderer';
import { SRM_SPCM } from '_utils/config';
import CusTable from '_cus_components/CusTable';

const TabPane = Tabs.TabPane;

async function fetchOverduesList(params) {
  const { costRequestId } = params;
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/payment-overdues/list/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}
async function fetchOverduesARDetail(params) {
  const { page, ...other } = params;
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/payment-overdue-details/selectInfo/all`,
    {
      method: 'POST',
      body: other,
      query: parseParameters({ page }),
    },
  );
}

async function fetchOverduesDetail(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/payment-overdue-details/selectInfo`,
    {
      method: 'GET',
      query: parseParameters(params),
    }
  );
}

const FormItem = Form.Item;
const commonPrompt = 'spcm.paymentRequest';

function HistoryRecord({ costRequestId, circuitId, isCircuitNumberAR, form = {} }) {
  const [currentKey, setCurrentKey] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [data, setData] = useState({ dataSource: [], pagination: {} });
  const [loading, setLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState([]);

  useEffect(() => {
    queryOverduesList(costRequestId);
  }, [costRequestId]);

  const queryOverduesList = (costRequestId) => {
    setLoading(true);
    fetchOverduesList({ costRequestId }).then((r) => {
      if (getResponse(r)) {
        setDataList(r);
        setLoading(false);
        if (!isEmpty(r)) {
          new Promise((resolve) => {
            setCurrentKey(r[0].paymentOverdueId);
            resolve();
          }).then(() => {
            queryOverduesDetail({}, r[0].paymentOverdueId);
          });
        }
      }
    });
  };

  const queryOverduesDetail = (page = {}, key, sorter = []) => {
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
    let customSortRuleDTOList = [];
    if (nowSorter.length === 1 && nowSorter[0].column === undefined){
      customSortRuleDTOList = [];
    }else if(nowSorter.length > 0){
      customSortRuleDTOList = nowSorter.map((item, index) =>
        ({fieldName: item.field, sortDirection: item.order === 'ascend' ? 'ASC' : 'DESC', orderSeq: index+1 })
      )
    }
    setLoading(true);
    setCurrentKey(key);
    const values = form.getFieldsValue();
    if (isCircuitNumberAR){
      fetchOverduesARDetail({ page, customSortRuleDTOList,  paymentOverdueId: key, circuitId, ...values }).then((r) => {
        setLoading(false);
        if (getResponse(r)) {
          setData({ dataSource: r.content, pagination: createPagination(r) });
        }
      });
    } else {
      fetchOverduesDetail({ page, paymentOverdueId: key, circuitId, ...values }).then((r) => {
        setLoading(false);
        if (getResponse(r)) {
          setData({ dataSource: r.content, pagination: createPagination(r) });
        }
      });
    }
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

  const currentData = dataList.find((i) => i.paymentOverdueId == currentKey) || {};
  return (
    <Spin spinning={loading}>
      <LocaleProvider locale={getCurrentLanguage() === 'en_US' ? undefined : zhCN}>
        <>
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
                <Button type="primary" onClick={() => queryOverduesDetail({}, currentKey)}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </div>
            </Row>
          </Form>
          <Tabs
            onChange={(key) => {
              queryOverduesDetail({}, key);
            }}
          >
            {dataList.map((i) => {
              return <TabPane tab={i.currentNodeName} key={i.paymentOverdueId} />;
            })}
          </Tabs>
          <Row style={{ marginBottom: '10px' }}>
            <Col>
              {intl.get(`${commonPrompt}.view.lateRemind.updateDate`).d('更新时间')}&nbsp;:&nbsp;
              {currentData?.storageDate}
            </Col>
          </Row>
          <CusTable
            rowKey="paymentOverdueDetailId"
            bordered
            hideOnSinglePage={false}
            dataSource={data.dataSource}
            pagination={data.pagination}
            columns={getColumns}
            onChange={(page, _, sorter) => {
              queryOverduesDetail(page, currentKey, sorter);
            }}
          />
        </>
      </LocaleProvider>
    </Spin>
  );
}
export default Form.create({ fieldNameProp: null })(HistoryRecord);
