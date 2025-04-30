import React, { Component } from 'react';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { Col } from 'antd';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInfoItem from '_cus_components/CusInfoItem';
import intl from 'utils/intl';

const gridSpan = getDFormGridSpan();
const prompt = 'spfm.bmpApprove';

class BasicInfo extends Component {
  render() {
    const { bpmApproveHeader } = this.props;
    return (
      <GenerateFormGrid>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.formRecordId`).d('单据数据ID')}
            value={bpmApproveHeader.formRecordId}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.dataType`).d('通知事件类型')}
            value={bpmApproveHeader.dataTypeMeaning}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.caseId`).d('流程实例ID')}
            value={bpmApproveHeader.caseId}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.templateCode`).d('流程模板')}
            value={bpmApproveHeader.templateCodeMeaning}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.currentActivityCode`).d('当前节点CODE')}
            value={bpmApproveHeader.currentActivityCode}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.currentActivityName`).d('当前节点名称')}
            value={bpmApproveHeader.currentActivityName}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.startUserName`).d('流程发起人')}
            value={bpmApproveHeader.startUserName || bpmApproveHeader.startUserCode}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.caseState`).d('流程实例状态')}
            value={bpmApproveHeader.caseStateMeaning}
          />
        </Col>
        <Col {...gridSpan}>
          <CusInfoItem
            label={intl.get(`${prompt}.view.basicInfo.currentUserName`).d('当前处理人')}
            value={bpmApproveHeader.currentUserName || bpmApproveHeader.currentUserCode}
          />
        </Col>
      </GenerateFormGrid>
    );
  }
}

export default BasicInfo;
