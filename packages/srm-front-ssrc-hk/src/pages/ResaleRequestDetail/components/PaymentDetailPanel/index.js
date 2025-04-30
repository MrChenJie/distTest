/*
 * @Description: 转售采购成品付款申请 - 面板 - 付款明细
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-24 10:52:05
 * @Copyright: Copyright (c) 2023, Hand
 */
import { Col, Form, Row } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { Component } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import BillDetailTable from './BillDetailTable';
import BillListTable from './BillListTable';
import WriteOffData from './WriteOffData';

const FormItem = Form.Item;

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  /**
   * @name: 操作 - 账单列表删除行
   */
  blHandleDelete = () => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { blDataSource, blListSelectedRows } = resaleRequestDetail;
    CusModal.CusDeleteConfirm(() => {
      let flag = true; // 是否本地删除
      const deleteArray = [];
      blListSelectedRows.map((list) => {
        deleteArray.push(list.costInvoiceId);
        if (list._status !== 'create') {
          flag = false;
        }
        return list;
      });
      if (flag) {
        // 仅本地删除
        const data = [];
        blDataSource.map((list) => {
          if (!deleteArray.includes(list.costInvoiceId)) {
            data.push(list);
          }
          return list;
        });
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            blDataSource: data,
            blListSelectedRows: [],
            blListSelectedRowKeys: [],
          },
        });
      } else {
        // 后台删除
        // TODO 调删除接口
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            blListSelectedRows: [],
            blListSelectedRowKeys: [],
          },
        });
      }
    });
  };

  /**
   * @name: 操作 - 账单明细删除行
   */
  bdHandleDelete = () => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { bdDataSource, bdDataSelectedRows } = resaleRequestDetail;
    CusModal.CusDeleteConfirm(() => {
      let flag = true; // 是否本地删除
      const deleteArray = [];
      bdDataSelectedRows.map((list) => {
        deleteArray.push(list.costInvoiceId);
        if (list._status !== 'create') {
          flag = false;
        }
        return list;
      });
      if (flag) {
        // 仅本地删除
        const data = [];
        bdDataSource.map((list) => {
          if (!deleteArray.includes(list.costInvoiceId)) {
            data.push(list);
          }
          return list;
        });
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            bdDataSource: data,
            bdDataSelectedRows: [],
            bdDataSelectedRowKeys: [],
          },
        });
      } else {
        // 后台删除
        // TODO 调删除接口
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            bdDataSelectedRows: [],
            bdDataSelectedRowKeys: [],
          },
        });
      }
    });
  };

  /**
   * @name: 操作 - 查询发票行明细
   */
  handleBillLineDetail = () => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { bdDataPagination, bdDataForm, blListIndexId } = resaleRequestDetail;
    dispatch({
      type: 'resaleRequestDetail/fetchBillLineDetail',
      payload: {
        page: bdDataPagination.current - 1,
        size: bdDataPagination.pageSize,
        costInvoiceId: blListIndexId,
        circuitNumber: bdDataForm.current.getFieldValue('circuitNumber'),
      },
    });
  };

  /**
   * @name: 操作 - 导入发票行
   */
  handleImport = async () => {
    const { handleSave, dispatch, resaleRequestDetail } = this.props;
    const { isPub, costRequestId, pagePathname, open } = resaleRequestDetail;
    const res = await handleSave();
    if (res) {
      dispatch(
        routerRedux.push({
          pathname: `${isPub ? '/pub' : ''}/spcm/payment-request-resale/import`,
          state: {
            costRequestId,
            backPath: pagePathname,
          },
          search: `${open ? '?open=fs' : ''}`,
        })
      );
    }
  };

  render() {
    const { resaleRequestDetail, dispatch } = this.props;
    const {
      editable,
      isOperator,
      viewOnly,
      createFlag,
      hasSubmitButton,
      blDataSource,
      bdDataSource,
      bdDataForm,
      blListSelectedRowKeys,
      bdDataSelectedRowKeys,
      payWriteOffData,
      payWriteOffForm,
    } = resaleRequestDetail;
    const { standardFlag, amountFlag } = payWriteOffData;

    const disabledFlag = !editable || !isOperator || viewOnly || !hasSubmitButton;

    return (
      <>
        {standardFlag === 'Y' && amountFlag === 'Y' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              {intl.get(`spcm.costPayment.view.pay.tabWriteOffDetail`).d('支付及核销信息')}
            </div>

            <WriteOffData form={payWriteOffForm} />
          </div>
        )}

        <div style={{ display: 'flex', marginBottom: 16 }}>
          <div style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
            {intl
              .get('spcm.costPayment.view.pay.tabToViewDetail')
              .d('账单列表 （点击账单进行切换查看账单明细）')}
          </div>
          <div style={{ width: '50%', textAlign: 'right' }}>
            {!createFlag && (
              <CusButton mini disabled={blListSelectedRowKeys.length === 0}>
                {intl.get('spcm.costPayment.view.file.bathDown').d('批量下载')}
              </CusButton>
            )}

            {(!disabledFlag || createFlag) && (
              <>
                <CusButton
                  mini
                  disabled={blListSelectedRowKeys.length === 0}
                  onClick={this.blHandleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                {!createFlag && (
                  <CusButton mini onClick={this.handleImport}>
                    {intl.get('hzero.common.button.import').d('导入')}
                  </CusButton>
                )}
                <CusButton
                  mini
                  type="primary"
                  onClick={() =>
                    dispatch({
                      type: 'resaleRequestDetail/handleSetState',
                      payload: {
                        blDataSource: [
                          ...blDataSource,
                          { costInvoiceId: `create-${uuid()}`, _status: 'create' },
                        ],
                      },
                    })
                  }
                >
                  {intl.get('hzero.common.button.add').d('新增')}
                </CusButton>
              </>
            )}
          </div>
        </div>

        <BillListTable editFlag />

        <div style={{ margin: '16px 0' }}>
          {intl.get('spcm.costPayment.view.pay.detail').d('账单明细')}
        </div>

        <Form ref={bdDataForm} className="customize-form">
          <Row>
            <Col span={8}>
              <FormItem
                label={intl.get(`spcm.paymentRequest.view.query.circuitNumber`).d('客户电路编号')}
                name="circuitNumber"
              >
                <CusInput />
              </FormItem>
            </Col>
            <Col span={8} />
            <Col span={8}>
              <div style={{ textAlign: 'right' }}>
                <CusButton mini disabled={createFlag} onClick={this.handleBillLineDetail}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </CusButton>
                <CusButton
                  mini
                  disabled={bdDataSelectedRowKeys.length === 0}
                  onClick={this.bdHandleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                <CusButton
                  mini
                  type="primary"
                  onClick={() =>
                    dispatch({
                      type: 'resaleRequestDetail/handleSetState',
                      payload: {
                        bdDataSource: [
                          ...bdDataSource,
                          { resaleLineId: uuid(), _status: 'create' },
                        ],
                      },
                    })
                  }
                >
                  {intl.get('hzero.common.button.add').d('新增')}
                </CusButton>
              </div>
            </Col>
          </Row>
        </Form>

        <div style={{ margin: 16, width: 10 }} />

        <BillDetailTable />
      </>
    );
  }
}
